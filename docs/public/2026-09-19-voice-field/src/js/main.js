import { AppState } from "./app-state.js";
import { AudioEngine } from "./audio/audio-engine.js";
import { DEFAULTS } from "./config/defaults.js";
import { PALETTES } from "./config/palettes.js";
import { PRESETS } from "./config/presets.js";
import { ExcitationPoint } from "./render/excitation.js";
import { FieldRenderer } from "./render/renderer.js";
import { VoiceTrace } from "./render/voice-trace.js";
import { Controls } from "./ui/controls.js";
import { installMobileGestures } from "./ui/gestures.js";

const state = new AppState();
const controls = new Controls(state);
const audio = new AudioEngine();
const excitation = new ExcitationPoint();
const fieldCanvas = document.querySelector("#field-canvas");
const traceCanvas = document.querySelector("#trace-canvas");
const stage = document.querySelector("#stage");
const appShell = document.querySelector("#app-shell");
const compatibilityNotice = document.querySelector("#compatibility-notice");
const voiceTrace = new VoiceTrace(traceCanvas);
const sceneFromState = () => ({ style: state.style, palette: PALETTES[state.paletteId] });
const renderer = new FieldRenderer(fieldCanvas, sceneFromState(), {
  transitionDurationMs: DEFAULTS.scene.transitionDurationMs,
  maxPixelRatio: DEFAULTS.quality.maxPixelRatio,
});

installMobileGestures({ root: appShell, state });

let rendererError = null;
try {
  await renderer.initialize();
  stage.classList.remove("is-fallback");
} catch (error) {
  rendererError = error;
  stage.classList.add("is-fallback");
  compatibilityNotice.hidden = false;
  console.info("voice-field is using its reduced compatibility preview:", error.message);
}

renderer.addEventListener("devicelost", () => {
  stage.classList.add("is-fallback");
  compatibilityNotice.hidden = false;
  compatibilityNotice.querySelector("strong").textContent = "The WebGPU device was lost";
});

state.addEventListener("change", (event) => {
  if (event.detail.sceneChanged) renderer.setScene(sceneFromState());
  if (event.detail.type === "quality") {
    renderer.setQuality(state.quality);
    document.querySelector("#render-scale-readout").textContent = state.quality === "auto" ? "Adaptive" : state.quality[0].toUpperCase() + state.quality.slice(1);
  }
  if (event.detail.type === "mobile-mode") appShell.dataset.mobileMode = state.mobileMode;
});

const micButton = document.querySelector("#mic-button");
const micState = document.querySelector("#mic-state");
micButton.addEventListener("click", async () => {
  micButton.disabled = true;
  try {
    await audio.start();
  } catch (error) {
    console.info("Microphone access was not enabled:", error.message);
  } finally {
    micButton.disabled = false;
  }
});

audio.addEventListener("statuschange", (event) => {
  const status = event.detail.status;
  const title = micState.querySelector("strong");
  const detail = micState.querySelector("small");
  if (status === "requesting") {
    title.textContent = "Waiting for permission";
    detail.textContent = "Your browser will ask once";
    micButton.textContent = "Waiting…";
  } else if (status === "live") {
    title.textContent = "Microphone active";
    detail.textContent = "Local analysis only";
    micButton.textContent = "Listening";
  } else if (status === "denied") {
    title.textContent = "Microphone unavailable";
    detail.textContent = "Idle Motion remains active";
    micButton.textContent = "Retry mic";
  } else if (status === "ended") {
    title.textContent = "Microphone disconnected";
    detail.textContent = "Reconnect or continue in idle";
    micButton.textContent = "Reconnect";
  } else {
    title.textContent = "Microphone off";
    detail.textContent = "Idle Motion is active";
    micButton.textContent = "Enable mic";
  }
});

let lastFrameAt = performance.now();
let frameCount = 0;
function frame(nowMs) {
  const deltaSeconds = Math.min(0.05, Math.max(0.001, (nowMs - lastFrameAt) / 1000));
  lastFrameAt = nowMs;
  const features = audio.update(nowMs);
  const excitationState = excitation.update(deltaSeconds, state.controls.excitationDrift);
  renderer.render({ nowMs, deltaSeconds, controls: state.controls, audio: features, excitation: excitationState });

  const bounds = traceCanvas.getBoundingClientRect();
  voiceTrace.resize(bounds.width, bounds.height, Math.min(devicePixelRatio || 1, 2));
  voiceTrace.draw({
    audio: features,
    palette: PALETTES[state.paletteId],
    enabled: state.trace.enabled,
    style: state.trace.style,
    smoothing: state.trace.smoothing,
    intensity: state.trace.intensity,
    nowMs,
  });
  if (frameCount % 3 === 0) controls.updateAudio(features, audio.status);
  frameCount += 1;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.voiceFieldDebug = {
  injectAudio: (features) => audio.inject(features),
  clearInjectedAudio: () => audio.inject(null),
  selectPreset: (id) => state.selectPreset(id),
  snapshot: () => ({
    preset: state.presetId,
    style: state.style,
    palette: state.paletteId,
    aspectRatio: state.aspectRatio,
    mobileMode: state.mobileMode,
    audio: { ...audio.features },
    excitation: excitation.snapshot(),
    rendererReady: renderer.ready,
    rendererError: rendererError?.message ?? null,
    transition: renderer.transition.snapshot(),
    impulseCount: renderer.impulses.length,
  }),
  presets: Object.keys(PRESETS),
};

window.addEventListener("pagehide", () => {
  renderer.destroy();
  audio.destroy();
}, { once: true });
