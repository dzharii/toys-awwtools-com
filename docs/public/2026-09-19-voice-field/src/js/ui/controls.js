import { PALETTES, hexToRgb } from "../config/palettes.js";
import { PRESETS } from "../config/presets.js";
import { STYLE_PROFILES } from "../render/styles/index.js";

const CONTROL_NAMES = ["energy", "motion", "detail", "voiceInfluence", "excitationDrift", "idleMotion"];

export class Controls {
  constructor(state) {
    this.state = state;
    this.inputs = Object.fromEntries(CONTROL_NAMES.map((name) => [name, document.querySelector(`#${name}`)]));
    this.buildOptions();
    this.bind();
    this.sync();
  }

  buildOptions() {
    const presetSelect = document.querySelector("#preset-select");
    const presetList = document.querySelector("#preset-list");
    for (const [id, preset] of Object.entries(PRESETS)) {
      presetSelect.add(new Option(preset.label, id));
      const palette = PALETTES[preset.palette];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-card";
      button.dataset.preset = id;
      button.innerHTML = `<span class="preset-thumb" style="--thumb-a:${palette.background};--thumb-b:${palette.colors[1]};--thumb-c:${palette.colors[0]}"></span><span><strong>${preset.label}</strong><small>${preset.subtitle}</small></span>`;
      presetList.append(button);
    }

    const styleSelect = document.querySelector("#style-select");
    for (const profile of Object.values(STYLE_PROFILES)) styleSelect.add(new Option(profile.label, profile.id));

    const paletteSelect = document.querySelector("#palette-select");
    const paletteList = document.querySelector("#palette-list");
    for (const [id, palette] of Object.entries(PALETTES)) {
      paletteSelect.add(new Option(palette.label, id));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "palette-chip";
      button.dataset.palette = id;
      button.title = `Apply ${palette.label} palette`;
      button.innerHTML = `<span>${palette.colors.map((color) => `<i style="background:${color}"></i>`).join("")}</span><small>${palette.label}</small>`;
      paletteList.append(button);
    }
  }

  bind() {
    document.querySelector("#preset-select").addEventListener("change", (event) => this.state.selectPreset(event.target.value));
    document.querySelector("#preset-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-preset]");
      if (button) this.state.selectPreset(button.dataset.preset);
    });
    document.querySelector("#style-select").addEventListener("change", (event) => this.state.setStyle(event.target.value));
    document.querySelector("#palette-select").addEventListener("change", (event) => this.state.setPalette(event.target.value));
    document.querySelector("#palette-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-palette]");
      if (button) this.state.setPalette(button.dataset.palette);
    });
    document.querySelector("#reset-button").addEventListener("click", () => this.state.resetPreset());
    for (const [name, input] of Object.entries(this.inputs)) input.addEventListener("input", () => this.state.setControl(name, input.value));
    document.querySelector("#trace-enabled").addEventListener("change", (event) => this.state.setTrace("enabled", event.target.checked));
    document.querySelector("#trace-style").addEventListener("change", (event) => this.state.setTrace("style", event.target.value));
    document.querySelector("#trace-smoothing").addEventListener("input", (event) => this.state.setTrace("smoothing", event.target.value));
    document.querySelector("#trace-intensity").addEventListener("input", (event) => this.state.setTrace("intensity", event.target.value));
    document.querySelector("#quality-select").addEventListener("change", (event) => this.state.setQuality(event.target.value));
    for (const button of document.querySelectorAll(".ratio-button")) button.addEventListener("click", () => this.state.setAspectRatio(button.dataset.ratio));
    this.state.addEventListener("change", () => this.sync());
  }

  sync() {
    const state = this.state;
    document.querySelector("#preset-select").value = state.presetId;
    document.querySelector("#style-select").value = state.style;
    document.querySelector("#palette-select").value = state.paletteId;
    document.querySelector("#trace-enabled").checked = state.trace.enabled;
    document.querySelector("#trace-style").value = state.trace.style;
    document.querySelector("#trace-smoothing").value = state.trace.smoothing;
    document.querySelector("#trace-intensity").value = state.trace.intensity;
    document.querySelector("#quality-select").value = state.quality;
    for (const [name, input] of Object.entries(this.inputs)) {
      input.value = state.controls[name];
      this.syncRange(input);
    }
    this.syncRange(document.querySelector("#trace-smoothing"));
    this.syncRange(document.querySelector("#trace-intensity"));
    document.querySelectorAll("[data-preset]").forEach((button) => button.classList.toggle("is-active", button.dataset.preset === state.presetId));
    document.querySelectorAll("[data-palette]").forEach((button) => button.classList.toggle("is-active", button.dataset.palette === state.paletteId));
    document.querySelectorAll(".ratio-button").forEach((button) => {
      const active = button.dataset.ratio === state.aspectRatio;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const ratios = { "16:9": 16 / 9, "9:16": 9 / 16, "1:1": 1 };
    document.documentElement.style.setProperty("--stage-ratio", ratios[state.aspectRatio]);
    document.querySelector("#stage-wrap").dataset.ratio = state.aspectRatio;
    this.renderSwatches();
    this.applyAccent(PALETTES[state.paletteId]);
  }

  syncRange(input) {
    const percent = Number(input.value) * 100;
    input.style.setProperty("--range", `${percent}%`);
    const output = input.closest("label")?.querySelector("output");
    if (output) output.value = Number(input.value).toFixed(2);
  }

  renderSwatches() {
    const palette = PALETTES[this.state.paletteId];
    document.querySelector("#active-swatches").innerHTML = palette.colors.map((color) => `<i style="background:${color}"></i>`).join("");
  }

  applyAccent(palette) {
    const rgb = hexToRgb(palette.accent).map((value) => Math.round(value * 255));
    document.documentElement.style.setProperty("--accent", palette.accent);
    document.documentElement.style.setProperty("--accent-rgb", rgb.join(", "));
  }

  updateAudio(features, status) {
    const meter = document.querySelector("#level-meter");
    const lit = Math.round(features.envelope * meter.children.length);
    [...meter.children].forEach((bar, index) => {
      bar.classList.toggle("is-lit", index < lit);
      bar.style.height = `${5 + Math.min(index, lit) * 0.75}px`;
    });
    for (const name of ["envelope", "low", "mid", "high", "phrase"]) {
      const value = name === "phrase" ? features.phraseActivity : features[name];
      document.querySelector(`#feature-${name}`)?.style.setProperty("--feature", `${Math.round(value * 100)}%`);
    }
    document.querySelector("#mic-state").classList.toggle("is-live", status === "live");
  }
}
