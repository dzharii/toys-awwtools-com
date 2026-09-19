import { DEFAULTS } from "./config/defaults.js";
import { PRESETS } from "./config/presets.js";

const CONTROL_NAMES = ["energy", "motion", "detail", "voiceInfluence", "excitationDrift", "idleMotion"];
const clamp01 = (value) => Math.min(1, Math.max(0, Number(value)));

export class AppState extends EventTarget {
  constructor() {
    super();
    this.presetId = DEFAULTS.scene.preset;
    this.aspectRatio = DEFAULTS.frame.aspectRatio;
    this.quality = "auto";
    this.mobileMode = "compose";
    this.applyPresetValues(PRESETS[this.presetId]);
  }

  applyPresetValues(preset) {
    this.style = preset.style;
    this.paletteId = preset.palette;
    this.controls = Object.fromEntries(CONTROL_NAMES.map((name) => [name, clamp01(preset[name] ?? DEFAULTS.controls[name])]));
    this.trace = {
      enabled: preset.trace?.enabled ?? DEFAULTS.trace.enabled,
      style: preset.trace?.style ?? DEFAULTS.trace.style,
      smoothing: clamp01(preset.trace?.smoothing ?? DEFAULTS.trace.smoothing),
      intensity: clamp01(preset.trace?.intensity ?? DEFAULTS.trace.intensity),
    };
  }

  selectPreset(id) {
    const preset = PRESETS[id];
    if (!preset) return;
    this.presetId = id;
    this.applyPresetValues(preset);
    this.emit("preset", { sceneChanged: true });
  }

  resetPreset() {
    this.applyPresetValues(PRESETS[this.presetId]);
    this.emit("reset", { sceneChanged: true });
  }

  setStyle(style) {
    if (style === this.style) return;
    this.style = style;
    this.emit("style", { sceneChanged: true });
  }

  setPalette(paletteId) {
    if (paletteId === this.paletteId) return;
    this.paletteId = paletteId;
    this.emit("palette", { sceneChanged: true });
  }

  setControl(name, value) {
    if (!CONTROL_NAMES.includes(name)) return;
    this.controls[name] = clamp01(value);
    this.emit("control", { name });
  }

  setTrace(name, value) {
    if (!(name in this.trace)) return;
    this.trace[name] = name === "enabled" || name === "style" ? value : clamp01(value);
    this.emit("trace", { name });
  }

  setAspectRatio(aspectRatio) {
    if (!["16:9", "9:16", "1:1"].includes(aspectRatio) || aspectRatio === this.aspectRatio) return;
    this.aspectRatio = aspectRatio;
    this.emit("ratio");
  }

  setQuality(quality) {
    this.quality = quality;
    this.emit("quality");
  }

  setMobileMode(mode) {
    if (!["compose", "performance"].includes(mode) || mode === this.mobileMode) return;
    this.mobileMode = mode;
    this.emit("mobile-mode");
  }

  emit(type, details = {}) {
    this.dispatchEvent(new CustomEvent("change", { detail: { type, ...details, state: this } }));
  }
}
