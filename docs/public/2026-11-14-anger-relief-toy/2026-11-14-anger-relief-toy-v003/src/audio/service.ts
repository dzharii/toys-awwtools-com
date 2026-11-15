import type {
  AudioPreferences,
  AudioProfile,
  EffectAudio,
  SoundParameters,
} from "../sdk/audio-types";
type Kind = "effect" | "navigation" | "control";
interface Voice {
  source: AudioScheduledSourceNode;
  gain: GainNode;
  nodes: AudioNode[];
  owner: object;
  kind: Kind;
  stopping: boolean;
  start: number;
}
const defaults: AudioPreferences = { muted: false, volume: 0.2, effects: true, navigation: true };
const bounded = (value: number | undefined, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value!)) : fallback;
/** One document-local native audio graph. Scopes own their scheduled sources; metadata owns timbre. */
export class AudioService {
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private compressor: DynamicsCompressorNode | undefined;
  private noise: AudioBuffer | undefined;
  private preferences: AudioPreferences = { ...defaults };
  private voices = new Set<Voice>();
  private owners = new Set<object>();
  private unlocked = false;
  private disposed = false;
  private unavailable = false;
  private contexts = 0;
  private lastTick = -Infinity;
  constructor(private readonly factory: () => AudioContext = () => new AudioContext()) {}
  configure(preferences: AudioPreferences): void {
    this.preferences = {
      muted: !!preferences.muted,
      volume: bounded(preferences.volume, 0, 1, 0.2),
      effects: !!preferences.effects,
      navigation: !!preferences.navigation,
    };
    if (this.context && this.master) {
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.preferences.muted ? 0 : this.preferences.volume, now);
    }
    for (const voice of this.voices) {
      if (
        this.preferences.muted ||
        this.preferences.volume === 0 ||
        (voice.kind === "effect" && !this.preferences.effects) ||
        (voice.kind === "navigation" && !this.preferences.navigation)
      )
        this.stopVoice(voice, this.preferences.muted || this.preferences.volume === 0);
    }
  }
  unlock(): void {
    if (this.disposed || this.preferences.muted || this.preferences.volume === 0) return;
    let candidate: AudioContext | undefined;
    try {
      if (!this.context) {
        const context = (candidate = this.factory());
        this.contexts++;
        const master = context.createGain();
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -15;
        compressor.knee.value = 18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.15;
        master.connect(compressor);
        compressor.connect(context.destination);
        this.context = context;
        this.master = master;
        this.compressor = compressor;
        candidate = undefined;
        this.configure(this.preferences);
      }
      this.unlocked = true;
      this.unavailable = false;
      if (this.context.state === "suspended")
        void this.context.resume().catch(() => {
          this.unavailable = true;
          this.stopAll();
        });
    } catch {
      if (candidate) void candidate.close().catch(() => {});
      this.unavailable = true;
      this.unlocked = false;
    }
  }
  scope(profile: AudioProfile, kind: Kind = "effect"): EffectAudio {
    if (this.disposed) return { play: () => {}, stop: () => {} };
    const owner = {};
    this.owners.add(owner);
    let stopped = false;
    return {
      play: (event, parameters) => {
        if (stopped) return;
        this.play(owner, profile, event, kind, parameters);
      },
      stop: () => {
        if (stopped) return;
        stopped = true;
        this.owners.delete(owner);
        for (const voice of this.voices) if (voice.owner === owner) this.stopVoice(voice);
      },
    };
  }
  private play(
    owner: object,
    profile: AudioProfile,
    event: string,
    kind: Kind,
    p: SoundParameters = {},
  ): void {
    const context = this.context;
    if (
      this.disposed ||
      !this.unlocked ||
      !context ||
      context.state === "closed" ||
      this.unavailable ||
      this.preferences.muted ||
      this.preferences.volume === 0 ||
      (kind === "effect" && !this.preferences.effects) ||
      (kind === "navigation" && !this.preferences.navigation)
    )
      return;
    const cue = Object.hasOwn(profile, event) ? profile[event] : undefined;
    if (!cue || !Array.isArray(cue.layers)) return;
    if (kind === "navigation" && event === "tick") {
      if (context.currentTime - this.lastTick < 0.08) return;
      this.lastTick = context.currentTime;
    }
    for (const layer of cue.layers.slice(0, 8)) {
      if (this.voices.size >= 8) break;
      if (!["noise", "sine", "triangle", "square"].includes(layer.wave)) continue;
      let source: AudioScheduledSourceNode | undefined;
      const nodes: AudioNode[] = [];
      try {
        const start =
            context.currentTime + bounded(p.delay, 0, 5, 0) + bounded(layer.delay, 0, 2, 0),
          duration = bounded(layer.duration, 0.008, 1.5, 0.1),
          pitch = bounded(p.pitch, 0.75, 1.25, 1),
          strength = bounded(p.strength, 0, 1.5, 1),
          frequency = bounded(layer.frequency * pitch, 30, 12000, 440);
        if (layer.wave === "noise") {
          const noise = context.createBufferSource();
          noise.buffer = this.noise ??= this.createNoise(context);
          source = noise;
        } else {
          const oscillator = context.createOscillator();
          oscillator.type = layer.wave;
          oscillator.frequency.setValueAtTime(frequency, start);
          if (layer.endFrequency !== undefined)
            oscillator.frequency.exponentialRampToValueAtTime(
              bounded(layer.endFrequency * pitch, 30, 12000, frequency),
              start + duration,
            );
          source = oscillator;
        }
        nodes.push(source);
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(
          bounded(
            layer.cutoff,
            150,
            12000,
            layer.wave === "noise" ? Math.min(5000, frequency * 3) : 10000,
          ),
          start,
        );
        source.connect(filter);
        nodes.push(filter);
        const envelope = context.createGain();
        const attack = Math.min(duration * 0.4, bounded(layer.attack, 0.002, 0.2, 0.004)),
          gain = bounded(layer.gain * strength, 0, 0.18, 0.03);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(gain, start + attack);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        envelope.gain.setValueAtTime(0, start + duration + 0.005);
        filter.connect(envelope);
        nodes.push(envelope);
        const pan = context.createStereoPanner();
        pan.pan.setValueAtTime(bounded(p.pan, -1, 1, 0), start);
        envelope.connect(pan);
        pan.connect(this.master!);
        nodes.push(pan);
        const voice: Voice = { source, gain: envelope, nodes, owner, kind, stopping: false, start };
        this.voices.add(voice);
        source.onended = () => this.release(voice);
        source.start(start);
        source.stop(start + duration + 0.01);
      } catch {
        if (source) {
          for (const voice of this.voices) if (voice.source === source) this.voices.delete(voice);
          try {
            source.stop();
          } catch {
            /* An unstarted source cannot always be stopped. */
          }
        }
        for (const node of nodes)
          try {
            node.disconnect();
          } catch {
            /* Best-effort failed construction cleanup. */
          }
      }
    }
  }
  private createNoise(context: AudioContext): AudioBuffer {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 1.6), context.sampleRate),
      data = buffer.getChannelData(0);
    let seed = 41041;
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      data[i] = ((seed >>> 0) / 4294967296) * 2 - 1;
    }
    return buffer;
  }
  private release(voice: Voice): void {
    this.voices.delete(voice);
    voice.source.onended = null;
    for (const node of voice.nodes)
      try {
        node.disconnect();
      } catch {
        /* Already detached. */
      }
  }
  private stopVoice(voice: Voice, immediate = false): void {
    const context = this.context;
    if (!context) {
      this.release(voice);
      return;
    }
    // A suspended graph cannot deliver onended, and a future source has no audible tail.
    immediate ||= context.state !== "running" || voice.start > context.currentTime;
    if (voice.stopping && !immediate) return;
    voice.stopping = true;
    const now = context.currentTime;
    try {
      if (immediate) {
        voice.source.stop(now);
        this.release(voice);
        return;
      }
      const gain = voice.gain.gain;
      if (typeof gain.cancelAndHoldAtTime === "function") gain.cancelAndHoldAtTime(now);
      else {
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(Math.min(0.18, Math.max(0, gain.value)), now);
      }
      gain.linearRampToValueAtTime(0, now + 0.02);
      voice.source.stop(now + 0.025);
    } catch {
      this.release(voice);
    }
  }
  stopAll(): void {
    for (const voice of this.voices) this.stopVoice(voice);
  }
  suspend(): void {
    for (const voice of this.voices) this.stopVoice(voice, true);
    this.unlocked = false;
    if (this.context?.state === "running") void this.context.suspend().catch(() => {});
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const voice of this.voices) this.stopVoice(voice, true);
    this.owners.clear();
    this.unlocked = false;
    const context = this.context;
    if (context)
      void context
        .close()
        .catch(() => {})
        .finally(() => {
          for (const voice of this.voices) {
            for (const node of voice.nodes)
              try {
                node.disconnect();
              } catch {
                /* Closed graph. */
              }
          }
          this.voices.clear();
          this.master?.disconnect();
          this.compressor?.disconnect();
          this.noise = undefined;
        });
  }
  report() {
    return {
      state: this.disposed
        ? "disposed"
        : this.unavailable
          ? "unavailable"
          : (this.context?.state ?? "uninitialized"),
      muted: this.preferences.muted,
      volume: this.preferences.volume,
      voices: this.voices.size,
      scopes: this.owners.size,
      contexts: this.contexts,
      noiseBuffers: this.noise ? 1 : 0,
    };
  }
}
