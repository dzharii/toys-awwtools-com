/**
 * Settings panel. Accessibility and appearance: font scale, opacity, contrast,
 * theme, session-only persistence, and debug toggle.
 */

import { el } from "../utils/dom.js";

export function createSettingsPanel(actions, initial) {
  const settings = Object.assign(
    { fontScale: 1, opacity: 1, contrast: "soft", theme: "light", sessionOnly: false, debug: false },
    initial || {}
  );

  const element = el("div", { class: "rn-section rn-collapsible" });
  element.appendChild(el("p", { class: "rn-section-title", text: "Settings" }));

  // Font scale.
  const fontRange = el("input", { type: "range", min: "0.85", max: "1.6", step: "0.05", value: String(settings.fontScale) });
  fontRange.addEventListener("input", () => {
    settings.fontScale = parseFloat(fontRange.value);
    actions.setFontScale(settings.fontScale);
  });
  element.appendChild(settingRow("Font size", fontRange));

  // Opacity.
  const opacityRange = el("input", { type: "range", min: "0.4", max: "1", step: "0.05", value: String(settings.opacity) });
  opacityRange.addEventListener("input", () => {
    settings.opacity = parseFloat(opacityRange.value);
    actions.setOpacity(settings.opacity);
  });
  element.appendChild(settingRow("Opacity", opacityRange));

  // Theme toggle.
  const themeToggle = segToggle(["light", "dark"], settings.theme, (v) => {
    settings.theme = v;
    actions.setTheme(v);
  });
  element.appendChild(settingRow("Theme", themeToggle));

  // Contrast toggle.
  const contrastToggle = segToggle(["soft", "high"], settings.contrast, (v) => {
    settings.contrast = v;
    actions.setContrast(v);
  });
  element.appendChild(settingRow("Contrast", contrastToggle));

  // Session-only persistence.
  const sessionCheck = el("input", { type: "checkbox", checked: settings.sessionOnly });
  sessionCheck.addEventListener("change", () => {
    settings.sessionOnly = sessionCheck.checked;
    actions.setSessionOnly(settings.sessionOnly);
  });
  element.appendChild(settingRow("Session-only (no saving)", sessionCheck));

  // Debug toggle.
  const debugCheck = el("input", { type: "checkbox", checked: settings.debug });
  debugCheck.addEventListener("change", () => {
    settings.debug = debugCheck.checked;
    actions.setDebug(settings.debug);
  });
  element.appendChild(settingRow("Debug mode", debugCheck));

  function settingRow(label, control) {
    const id = "rn-set-" + label.replace(/\s+/g, "-").toLowerCase();
    if (control.tagName === "INPUT") control.id = id;
    const row = el("div", { class: "rn-setting-row" });
    row.appendChild(el("label", { for: id, text: label }));
    row.appendChild(control);
    return row;
  }

  function segToggle(options, current, onChange) {
    const wrap = el("div", { class: "rn-seg-toggle", role: "group" });
    const buttons = [];
    for (const opt of options) {
      const btn = el("button", {
        type: "button",
        class: opt === current ? "rn-on" : "",
        text: opt.charAt(0).toUpperCase() + opt.slice(1),
        onClick: () => {
          for (const b of buttons) b.classList.remove("rn-on");
          btn.classList.add("rn-on");
          onChange(opt);
        },
      });
      buttons.push(btn);
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function update() {
    /* settings are self-contained; nothing to sync from vm for now */
  }

  return { element, update, settings };
}
