const clamp01 = (value) => Math.min(1, Math.max(0, value));
const expStep = (current, target, rate, deltaSeconds) => current + (target - current) * (1 - Math.exp(-rate * deltaSeconds));
const smoothstep = (edge0, edge1, value) => {
  const x = clamp01((value - edge0) / Math.max(0.00001, edge1 - edge0));
  return x * x * (3 - 2 * x);
};

export const EMPTY_FEATURES = Object.freeze({
  energy: 0,
  envelope: 0,
  low: 0,
  mid: 0,
  high: 0,
  impulse: 0,
  phraseActivity: 0,
  silenceMs: 10000,
  noiseFloor: 0.008,
});

export class VoiceFeatureExtractor {
  constructor({ sampleRate = 48000, fftSize = 2048 } = {}) {
    this.sampleRate = sampleRate;
    this.fftSize = fftSize;
    this.features = { ...EMPTY_FEATURES };
    this.lastTimeMs = 0;
    this.lastActiveMs = -10000;
    this.previousEnvelope = 0;
    this.previousSpectrum = new Float32Array(fftSize / 2);
    this.hasSpectrum = false;
  }

  update(timeDomain, spectrum, nowMs = performance.now()) {
    const deltaSeconds = this.lastTimeMs ? Math.min(0.1, (nowMs - this.lastTimeMs) / 1000) : 1 / 60;
    this.lastTimeMs = nowMs;

    let sumSquares = 0;
    let peak = 0;
    for (let index = 0; index < timeDomain.length; index += 1) {
      const sample = (timeDomain[index] - 128) / 128;
      sumSquares += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    const rms = Math.sqrt(sumSquares / Math.max(1, timeDomain.length));

    const quietCandidate = rms < this.features.noiseFloor * 2.2 + 0.012;
    const noiseRate = quietCandidate ? 0.32 : 0.018;
    this.features.noiseFloor = expStep(this.features.noiseFloor, Math.min(rms, 0.045), noiseRate, deltaSeconds);

    const gateStart = this.features.noiseFloor + 0.006;
    const gateEnd = this.features.noiseFloor + 0.082;
    const gated = smoothstep(gateStart, gateEnd, rms);
    const shapedEnergy = clamp01(Math.pow(gated, 0.72) * 0.82 + Math.pow(peak, 0.65) * 0.18);
    const envelopeRate = shapedEnergy > this.features.envelope ? 18 : 2.15;
    this.features.envelope = expStep(this.features.envelope, shapedEnergy, envelopeRate, deltaSeconds);
    this.features.energy = expStep(this.features.energy, shapedEnergy, shapedEnergy > this.features.energy ? 12 : 3.3, deltaSeconds);

    const nyquist = this.sampleRate / 2;
    const band = (lowHz, highHz) => {
      const first = Math.max(0, Math.floor((lowHz / nyquist) * spectrum.length));
      const last = Math.min(spectrum.length - 1, Math.ceil((highHz / nyquist) * spectrum.length));
      let total = 0;
      let weightTotal = 0;
      for (let index = first; index <= last; index += 1) {
        const position = (index - first) / Math.max(1, last - first);
        const weight = 0.65 + Math.sin(position * Math.PI) * 0.35;
        const normalized = spectrum[index] / 255;
        total += normalized * normalized * weight;
        weightTotal += weight;
      }
      const raw = Math.sqrt(total / Math.max(1, weightTotal));
      return clamp01((raw - 0.035) * 2.15) * (0.2 + this.features.envelope * 0.8);
    };

    const targets = {
      low: band(70, 320),
      mid: band(320, 2400),
      high: band(2400, 7600),
    };
    for (const name of ["low", "mid", "high"]) {
      this.features[name] = expStep(this.features[name], targets[name], targets[name] > this.features[name] ? 10 : 3.2, deltaSeconds);
    }

    let spectralFlux = 0;
    if (this.hasSpectrum) {
      const limit = Math.min(spectrum.length, this.previousSpectrum.length, Math.ceil(7600 / nyquist * spectrum.length));
      for (let index = 2; index < limit; index += 2) {
        const current = spectrum[index] / 255;
        spectralFlux += Math.max(0, current - this.previousSpectrum[index]);
      }
      spectralFlux /= Math.max(1, limit / 2);
    }
    for (let index = 0; index < spectrum.length; index += 1) this.previousSpectrum[index] = spectrum[index] / 255;
    this.hasSpectrum = true;

    const slope = Math.max(0, this.features.envelope - this.previousEnvelope);
    const impulseTarget = clamp01(slope * 6.5 + spectralFlux * 6.8) * smoothstep(0.045, 0.2, this.features.envelope);
    this.features.impulse = Math.max(impulseTarget, this.features.impulse * Math.exp(-deltaSeconds * 6.2));
    this.previousEnvelope = this.features.envelope;

    const active = this.features.envelope > 0.065 || shapedEnergy > 0.085;
    if (active) this.lastActiveMs = nowMs;
    this.features.silenceMs = Math.max(0, nowMs - this.lastActiveMs);
    const phraseTarget = active ? clamp01(0.34 + this.features.envelope * 0.82) : 0;
    const phraseRate = active ? 1.7 : (this.features.silenceMs < 850 ? 0.18 : 0.58);
    this.features.phraseActivity = expStep(this.features.phraseActivity, phraseTarget, phraseRate, deltaSeconds);

    return this.snapshot();
  }

  decay(nowMs = performance.now()) {
    const silenceTime = new Uint8Array(this.fftSize);
    silenceTime.fill(128);
    return this.update(silenceTime, new Uint8Array(this.fftSize / 2), nowMs);
  }

  snapshot() {
    return { ...this.features };
  }
}
