/** Development-only audition surface. Uses the SAME service and feature profiles as the extension. */
import { dialAudio } from "../../src/ui/dial-audio";
import { catalog } from "../../src/generated/catalog";
import { AudioService } from "../../src/audio/service";
import type { AudioProfile } from "../../src/sdk/audio-types";
const service = new AudioService();
const root = document.querySelector("main")!;
const settings = { muted: false, volume: 0.2, effects: true, navigation: true };
service.configure(settings);
const volume = document.querySelector<HTMLInputElement>("#volume")!;
volume.oninput = () => {
  settings.volume = Number(volume.value) / 100;
  service.configure(settings);
};
const mute = document.querySelector<HTMLButtonElement>("#mute")!;
mute.onclick = () => {
  settings.muted = !settings.muted;
  service.configure(settings);
  mute.textContent = settings.muted ? "Unmute" : "Mute";
};
let scope: ReturnType<AudioService["scope"]> | undefined;
for (const [name, profile] of [
  ...catalog.map((e) => [e.name, e.audioProfile!] as const),
  ["Dial", dialAudio] as const,
]) {
  const section = document.createElement("section"),
    heading = document.createElement("h2");
  heading.textContent = name;
  section.append(heading);
  for (const event of Object.keys(profile)) {
    const play = document.createElement("button");
    play.textContent = event;
    play.onclick = () => {
      scope?.stop();
      service.unlock();
      scope = service.scope(profile);
      scope.play(event);
    };
    section.append(play);
    const repeat = document.createElement("button");
    repeat.textContent = `${event} × 4`;
    repeat.onclick = () => {
      scope?.stop();
      service.unlock();
      scope = service.scope(profile);
      for (let i = 0; i < 4; i++)
        scope.play(event, { delay: i * 0.4, pitch: 1 + ((i % 3) - 1) * 0.035 });
    };
    section.append(repeat);
  }
  const offline = document.createElement("button");
  offline.textContent = "Render shared profile offline";
  offline.onclick = () => {
    void render(profile)
      .then((text) => {
        document.querySelector("pre")!.textContent = text;
      })
      .catch((e) => {
        document.querySelector("pre")!.textContent = String(e);
      });
  };
  section.append(offline);
  root.append(section);
}
async function render(profile: AudioProfile): Promise<string> {
  const records = [];
  for (const event of Object.keys(profile)) {
    const ctx = new OfflineAudioContext(2, 44100 * 4, 44100);
    // OfflineContext shares graph/scheduling APIs but cannot be resumed like a live context.
    const facade = new Proxy(ctx, {
      get(target, key) {
        if (key === "state") return "running";
        if (["resume", "suspend", "close"].includes(String(key))) return () => Promise.resolve();
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    }) as unknown as AudioContext;
    const audio = new AudioService(() => facade);
    audio.configure(settings);
    audio.unlock();
    const owner = audio.scope(profile);
    owner.play(event);
    const buffer = await ctx.startRendering();
    const samples = buffer.getChannelData(0);
    let peak = 0,
      square = 0,
      finite = true;
    for (const x of samples) {
      finite &&= Number.isFinite(x);
      peak = Math.max(peak, Math.abs(x));
      square += x * x;
    }
    records.push({
      event,
      finite,
      peak,
      rms: Math.sqrt(square / samples.length),
      frames: buffer.length,
    });
    audio.dispose();
  }
  return (
    JSON.stringify(records, null, 2) + "\nObjective metrics do not establish listening comfort."
  );
}
window.addEventListener("pagehide", () => service.dispose());
