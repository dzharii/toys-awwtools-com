import { clamp } from "./utils.js";

export class ReservoirAudio {
  constructor(config) {
    this.config = config;
    this.context = null;
    this.master = null;
    this.ambientBus = null;
    this.impactBus = null;
    this.noiseBuffer = null;
    this.lowOsc = null;
    this.beatOsc = null;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.ambientLfo = null;
    this.ambientDepth = null;
    this.activity = 0;
    this.unlocked = false;
    this.muted = this.#loadMuteState();
  }

  async unlock() {
    if (!this.context) {
      this.#build();
    }
    if (!this.context) return;
    if (this.context.state === "suspended") {
      await this.context.resume().catch(() => {});
    }
    this.unlocked = this.context.state === "running";
    this.#applyMuteState();
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    try {
      localStorage.setItem(this.config.muteKey, String(this.muted));
    } catch {
      return;
    }
    this.#applyMuteState();
  }

  getMuted() {
    return this.muted;
  }

  tick(energy) {
    if (!this.unlocked || !this.context || !this.master || !this.noiseFilter || !this.ambientBus) return;
    this.activity = clamp(this.activity * 0.96 + energy * 0.16, 0, 1);
    const now = this.context.currentTime;
    const targetAmbient = this.muted ? 0 : this.config.audio.ambientGain * (1 + this.activity * 0.18);
    const targetFilter = 240 + this.activity * 380;
    this.ambientBus.gain.cancelScheduledValues(now);
    this.ambientBus.gain.linearRampToValueAtTime(targetAmbient, now + 0.12);
    this.noiseFilter.frequency.cancelScheduledValues(now);
    this.noiseFilter.frequency.linearRampToValueAtTime(targetFilter, now + 0.14);
  }

  playImpact(intensity = 1, pan = 0) {
    if (!this.unlocked || !this.context || this.muted) return;
    const ctx = this.context;
    const now = ctx.currentTime;
    const gain = this.config.audio.impactGain * clamp(intensity, 0.3, 1.5);

    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = "sine";
    bodyOsc.frequency.setValueAtTime(122, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(58, now + 0.22);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    const shimmerFilter = ctx.createBiquadFilter();
    shimmerFilter.type = "bandpass";
    shimmerFilter.frequency.setValueAtTime(900, now);
    shimmerFilter.Q.value = 1.2;

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.exponentialRampToValueAtTime(gain * 0.28, now + 0.01);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const panner = ctx.createStereoPanner();
    panner.pan.value = clamp(pan, -0.85, 0.85);

    bodyOsc.connect(bodyGain);
    noise.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);

    bodyGain.connect(panner);
    shimmerGain.connect(panner);
    panner.connect(this.impactBus);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.5);
    noise.start(now);
    noise.stop(now + 0.18);
  }

  #build() {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    this.context = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    const ambientBus = ctx.createGain();
    ambientBus.gain.value = 0;
    ambientBus.connect(master);
    this.ambientBus = ambientBus;

    const impactBus = ctx.createGain();
    impactBus.gain.value = 1;
    impactBus.connect(master);
    this.impactBus = impactBus;

    this.noiseBuffer = this.#createNoiseBuffer(ctx, 1.5);

    const lowOsc = ctx.createOscillator();
    lowOsc.type = "sine";
    lowOsc.frequency.value = 54;

    const beatOsc = ctx.createOscillator();
    beatOsc.type = "triangle";
    beatOsc.frequency.value = 81;

    const lowGain = ctx.createGain();
    lowGain.gain.value = 0.13;

    const beatGain = ctx.createGain();
    beatGain.gain.value = 0.065;

    const ambientFilter = ctx.createBiquadFilter();
    ambientFilter.type = "lowpass";
    ambientFilter.frequency.value = 360;
    ambientFilter.Q.value = 0.4;

    const ambientSwell = ctx.createBiquadFilter();
    ambientSwell.type = "peaking";
    ambientSwell.frequency.value = 125;
    ambientSwell.gain.value = 4.2;
    ambientSwell.Q.value = 0.7;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 270;
    noiseFilter.Q.value = 0.6;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = this.config.audio.noiseGain;

    const ambientLfo = ctx.createOscillator();
    ambientLfo.type = "sine";
    ambientLfo.frequency.value = 0.07;

    const ambientDepth = ctx.createGain();
    ambientDepth.gain.value = 24;

    ambientLfo.connect(ambientDepth);
    ambientDepth.connect(ambientFilter.frequency);

    lowOsc.connect(lowGain);
    beatOsc.connect(beatGain);
    lowGain.connect(ambientSwell);
    beatGain.connect(ambientSwell);
    ambientSwell.connect(ambientFilter);
    ambientFilter.connect(ambientBus);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientBus);

    lowOsc.start();
    beatOsc.start();
    ambientLfo.start();
    noiseSource.start();

    this.lowOsc = lowOsc;
    this.beatOsc = beatOsc;
    this.noiseSource = noiseSource;
    this.noiseFilter = noiseFilter;
    this.ambientLfo = ambientLfo;
    this.ambientDepth = ambientDepth;

    this.#applyMuteState();
  }

  #applyMuteState() {
    if (!this.master) return;
    const target = this.muted ? 0 : this.config.audio.masterGain;
    const now = this.context?.currentTime ?? 0;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(target, now + 0.15);
  }

  #loadMuteState() {
    try {
      return localStorage.getItem(this.config.muteKey) === "true";
    } catch {
      return false;
    }
  }

  #createNoiseBuffer(ctx, durationSeconds) {
    const length = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let white = 0;
    for (let i = 0; i < length; i += 1) {
      const input = Math.random() * 2 - 1;
      white = white * 0.985 + input * 0.15;
      data[i] = white;
    }
    return buffer;
  }
}

