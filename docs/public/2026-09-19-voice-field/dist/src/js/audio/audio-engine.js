import { EMPTY_FEATURES, VoiceFeatureExtractor } from "./voice-features.js";

export class AudioEngine extends EventTarget {
  constructor() {
    super();
    this.context = null;
    this.stream = null;
    this.source = null;
    this.analyser = null;
    this.extractor = new VoiceFeatureExtractor();
    this.timeData = new Uint8Array(2048);
    this.frequencyData = new Uint8Array(1024);
    this.status = "idle";
    this.features = { ...EMPTY_FEATURES };
    this.synthetic = null;
  }

  async start() {
    if (this.status === "live") return;
    this.setStatus("requesting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone capture is unavailable in this browser.");
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          channelCount: 1,
        },
        video: false,
      });
      this.context = new AudioContext({ latencyHint: "interactive" });
      await this.context.resume();
      this.source = this.context.createMediaStreamSource(this.stream);
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.16;
      this.analyser.minDecibels = -92;
      this.analyser.maxDecibels = -24;
      this.source.connect(this.analyser);
      // Intentionally do not connect the analyser to context.destination: voice-field never monitors audio.
      this.timeData = new Uint8Array(this.analyser.fftSize);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.extractor = new VoiceFeatureExtractor({ sampleRate: this.context.sampleRate, fftSize: this.analyser.fftSize });
      for (const track of this.stream.getAudioTracks()) track.addEventListener("ended", () => this.handleTrackEnded(), { once: true });
      this.setStatus("live");
    } catch (error) {
      this.error = error;
      this.setStatus("denied");
      throw error;
    }
  }

  update(nowMs = performance.now()) {
    if (this.synthetic) {
      this.features = { ...this.features, ...this.synthetic };
      this.features.impulse *= 0.92;
      return this.features;
    }
    if (this.analyser && this.status === "live") {
      this.analyser.getByteTimeDomainData(this.timeData);
      this.analyser.getByteFrequencyData(this.frequencyData);
      this.features = this.extractor.update(this.timeData, this.frequencyData, nowMs);
    } else {
      this.features = this.extractor.decay(nowMs);
    }
    return this.features;
  }

  inject(features) {
    this.synthetic = features ? { ...EMPTY_FEATURES, ...features } : null;
  }

  setStatus(status) {
    this.status = status;
    this.dispatchEvent(new CustomEvent("statuschange", { detail: { status, error: this.error } }));
  }

  handleTrackEnded() {
    this.analyser = null;
    this.setStatus("ended");
  }

  async destroy() {
    this.stream?.getTracks().forEach((track) => track.stop());
    await this.context?.close();
    this.stream = null;
    this.context = null;
    this.analyser = null;
    this.setStatus("idle");
  }
}
