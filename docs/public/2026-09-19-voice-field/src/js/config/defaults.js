export const DEFAULTS = Object.freeze({
  frame: {
    aspectRatio: "16:9",
  },
  scene: {
    preset: "aurora",
    transitionDurationMs: 2200,
  },
  controls: {
    energy: 0.62,
    motion: 0.48,
    detail: 0.58,
    voiceInfluence: 0.78,
    excitationDrift: 0.38,
    idleMotion: 0.24,
  },
  trace: {
    enabled: true,
    style: "soft-bars",
    smoothing: 0.72,
    intensity: 0.76,
  },
  quality: {
    desktop: "high",
    mobile: "adaptive",
    maxPixelRatio: 1.75,
  },
});

export const STYLE_IDS = Object.freeze([
  "silk",
  "membrane",
  "liquid",
  "chrome",
  "nebula",
  "particles",
  "ember",
]);

export const TRACE_STYLE_IDS = Object.freeze([
  "bars",
  "soft-bars",
  "poles",
  "minimal",
]);
