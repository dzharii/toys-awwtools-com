import { test, expect } from "bun:test";
import { AudioService } from "../src/audio/service";
import type { AudioPreferences, AudioProfile } from "../src/sdk/audio-types";
class Param {
  value = 0;
  events: { kind: string; value: number; time: number }[] = [];
  setValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ kind: "set", value, time });
    return this;
  }
  linearRampToValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ kind: "linear", value, time });
    return this;
  }
  exponentialRampToValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ kind: "exp", value, time });
    return this;
  }
  cancelScheduledValues(time: number) {
    this.events = this.events.filter((e) => e.time < time);
    return this;
  }
}
class FakeNode {
  gain = new Param();
  frequency = new Param();
  pan = new Param();
  threshold = new Param();
  knee = new Param();
  ratio = new Param();
  attack = new Param();
  release = new Param();
  type = "";
  buffer: unknown;
  connections: unknown[] = [];
  disconnected = false;
  starts: number[] = [];
  stops: number[] = [];
  onended: (() => void) | null = null;
  connect(node: unknown) {
    this.connections.push(node);
    return node;
  }
  disconnect() {
    this.disconnected = true;
    this.connections = [];
  }
  start(time: number) {
    this.starts.push(time);
  }
  stop(time = 0) {
    this.stops.push(time);
  }
  finish() {
    this.onended?.();
  }
}
class FakeContext {
  currentTime = 10;
  sampleRate = 8000;
  state = "suspended";
  destination = new FakeNode();
  nodes: FakeNode[] = [];
  sources: FakeNode[] = [];
  resumes = 0;
  suspends = 0;
  closes = 0;
  buffers = 0;
  make() {
    const n = new FakeNode();
    this.nodes.push(n);
    return n;
  }
  createGain() {
    return this.make();
  }
  createDynamicsCompressor() {
    return this.make();
  }
  createBiquadFilter() {
    return this.make();
  }
  createStereoPanner() {
    return this.make();
  }
  createOscillator() {
    const s = this.make();
    this.sources.push(s);
    return s;
  }
  createBufferSource() {
    const s = this.make();
    this.sources.push(s);
    return s;
  }
  createBuffer(_channels: number, length: number, _rate: number) {
    this.buffers++;
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
  async resume() {
    this.resumes++;
    this.state = "running";
  }
  async suspend() {
    this.suspends++;
    this.state = "suspended";
  }
  async close() {
    this.closes++;
    this.state = "closed";
  }
}
const prefs: AudioPreferences = { muted: false, volume: 0.25, effects: true, navigation: true };
const profile: AudioProfile = {
  activate: {
    layers: [{ wave: "sine", frequency: 100, endFrequency: 40, duration: 0.2, gain: 0.1 }],
  },
  tick: { layers: [{ wave: "noise", frequency: 500, duration: 0.02, gain: 0.03 }] },
};
function setup() {
  const context = new FakeContext();
  let created = 0;
  const service = new AudioService(() => {
    created++;
    return context as unknown as AudioContext;
  });
  return {
    context,
    service,
    get created() {
      return created;
    },
  };
}
test("audio is lazy, shares one context, schedules meaningful offsets and reuses noise buffers", () => {
  const s = setup(),
    a = s.service.scope(profile);
  a.play("activate");
  expect(s.created).toBe(0);
  s.service.unlock();
  s.service.unlock();
  expect(s.created).toBe(1);
  expect(s.context.resumes).toBe(1);
  a.play("activate", { delay: 0.48, pitch: 1.1, pan: 0.5 });
  expect(s.context.sources[0]!.starts).toEqual([10.48]);
  expect(s.context.sources[0]!.frequency.events[0]!.value).toBeCloseTo(110);
  a.play("tick");
  a.play("tick");
  expect(s.context.buffers).toBe(1);
  expect(s.context.sources[1]).not.toBe(s.context.sources[2]);
  expect(s.context.sources[1]!.buffer).toBe(s.context.sources[2]!.buffer);
  s.service.dispose();
});
test("audio caps eight overlapping layers and throttles only navigation tick boundaries", () => {
  const s = setup();
  s.service.unlock();
  const nav = s.service.scope(profile, "navigation");
  nav.play("tick");
  nav.play("tick");
  expect(s.context.sources.length).toBe(1);
  s.context.currentTime += 0.081;
  nav.play("tick");
  expect(s.context.sources.length).toBe(2);
  for (let i = 0; i < 20; i++) nav.play("activate");
  expect(s.context.sources.length).toBe(8);
  expect(s.service.report().voices).toBe(8);
  s.context.sources[0]!.finish();
  expect(s.service.report().voices).toBe(7);
  nav.play("activate");
  expect(s.context.sources.length).toBe(9);
  s.service.dispose();
});
test("scope cancellation includes future sources, fades and disconnects all owned nodes on ended", () => {
  const s = setup();
  s.service.unlock();
  const first = s.service.scope(profile),
    other = s.service.scope(profile);
  first.play("activate", { delay: 5 });
  other.play("activate");
  first.stop();
  first.stop();
  first.play("activate");
  expect(s.context.sources.length).toBe(2);
  expect(s.context.sources[0]!.stops.at(-1)).toBe(10);
  expect(s.context.sources[1]!.stops.at(-1)).toBeCloseTo(10.21);
  expect(s.context.sources[0]!.disconnected).toBe(true);
  expect(s.service.report().voices).toBe(1);
  s.service.dispose();
});
test("mute and volume change the existing master graph and category toggles suppress playback", () => {
  const s = setup();
  s.service.unlock();
  const a = s.service.scope(profile);
  a.play("activate");
  const master = s.context.nodes[0]!;
  s.service.configure({ ...prefs, muted: true });
  expect(master.gain.events.at(-1)!.value).toBe(0);
  a.play("activate");
  expect(s.context.sources.length).toBe(1);
  s.service.configure({ ...prefs, volume: 0.6, effects: false });
  expect(master.gain.events.at(-1)!.value).toBe(0.6);
  expect(s.context.sources[0]!.stops.at(-1)).toBe(10);
  a.play("activate");
  expect(s.context.sources.length).toBe(1);
  s.service.scope(profile, "control").play("activate");
  expect(s.context.sources.length).toBe(2);
  s.service.dispose();
});
test("unavailable audio leaves callers functional; suspension requires a new unlock and disposal closes once", async () => {
  const unavailable = new AudioService(() => {
    throw new Error("blocked");
  });
  expect(() => unavailable.unlock()).not.toThrow();
  expect(unavailable.report().state).toBe("unavailable");
  expect(() => unavailable.scope(profile).play("activate")).not.toThrow();
  unavailable.dispose();
  const s = setup();
  s.service.unlock();
  const scope = s.service.scope(profile);
  scope.play("activate");
  s.service.suspend();
  scope.play("activate");
  expect(s.context.sources.length).toBe(1);
  expect(s.context.suspends).toBe(1);
  s.service.unlock();
  scope.play("activate");
  expect(s.context.sources.length).toBe(2);
  s.service.dispose();
  s.service.dispose();
  await Promise.resolve();
  await Promise.resolve();
  expect(s.context.closes).toBe(1);
  expect(s.service.report().voices).toBe(0);
});
test("invalid or exaggerated parameters remain bounded and unknown cues are silent", () => {
  const s = setup();
  s.service.unlock();
  const scope = s.service.scope({
    loud: {
      layers: [
        {
          wave: "square",
          frequency: Infinity,
          endFrequency: -50,
          duration: 90,
          gain: 12,
          attack: -2,
          cutoff: NaN,
        },
      ],
    },
  });
  scope.play("constructor");
  scope.play("loud", { delay: -99, strength: 20, pitch: 20, pan: 90 });
  expect(s.context.sources.length).toBe(1);
  expect(s.context.sources[0]!.starts).toEqual([10]);
  expect(s.context.sources[0]!.stops[0]).toBeCloseTo(11.51);
  for (const node of s.context.nodes)
    for (const event of node.gain.events) expect(event.value).toBeLessThanOrEqual(0.25);
  s.service.dispose();
});

test("silent preferences never create a graph and unmuting cannot replay canceled future cues", () => {
  const s = setup();
  s.service.configure({ ...prefs, muted: true });
  s.service.unlock();
  expect(s.created).toBe(0);
  expect(s.service.report().muted).toBe(true);
  s.service.configure({ ...prefs, volume: 0 });
  s.service.unlock();
  expect(s.created).toBe(0);
  s.service.configure(prefs);
  s.service.unlock();
  const owner = s.service.scope(profile);
  owner.play("activate", { delay: 4 });
  s.service.configure({ ...prefs, muted: true });
  expect(s.service.report().voices).toBe(0);
  expect(s.context.sources[0]!.disconnected).toBe(true);
  s.service.configure(prefs);
  expect(s.context.sources.length).toBe(1);
  expect(s.service.report().voices).toBe(0);
  s.service.dispose();
});
test("suspended scopes and teardown release resources without waiting for onended", () => {
  const s = setup();
  s.service.unlock();
  const owner = s.service.scope(profile);
  owner.play("activate");
  s.context.state = "suspended";
  owner.stop();
  expect(s.service.report().voices).toBe(0);
  expect(s.service.report().scopes).toBe(0);
  expect(s.context.sources[0]!.onended).toBeNull();
  s.service.unlock();
  s.service.scope(profile).play("activate");
  s.service.suspend();
  expect(s.service.report().voices).toBe(0);
  s.service.dispose();
  expect(s.service.report().scopes).toBe(0);
  s.service.scope(profile).play("activate");
  expect(s.service.report().scopes).toBe(0);
});
test("playing sources have a short fade while scheduled sources disconnect immediately", () => {
  const s = setup();
  s.service.unlock();
  const owner = s.service.scope(profile);
  owner.play("activate");
  owner.stop();
  expect(s.context.sources[0]!.stops.at(-1)).toBe(10.025);
  expect(s.service.report().voices).toBe(1);
  s.context.sources[0]!.finish();
  expect(s.service.report().voices).toBe(0);
  expect(s.context.sources[0]!.disconnected).toBe(true);
  s.service.dispose();
});

test("failed graph construction closes its partial context and a later unlock may recover", async () => {
  const bad = new FakeContext(),
    good = new FakeContext();
  bad.createGain = () => {
    throw new Error("graph unavailable");
  };
  let calls = 0;
  const service = new AudioService(() => (++calls === 1 ? bad : good) as unknown as AudioContext);
  service.unlock();
  await Promise.resolve();
  expect(bad.closes).toBe(1);
  expect(service.report().state).toBe("unavailable");
  service.unlock();
  service.scope(profile).play("activate");
  expect(good.sources.length).toBe(1);
  service.dispose();
});
