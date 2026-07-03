// Settings panel UI. Builds a device-like settings sheet and reports changes
// through onChange(patch). The panel never needs the network; the font list
// reflects locally bundled fonts only.

import { FONT_OPTIONS } from "./preferences.js";
import { KEYBOARD_REFERENCE } from "./accessibility.js";
import { escapeHtml } from "./utils.js";

function seg(name, current, options) {
  const buttons = options
    .map(
      (o) =>
        `<button type="button" data-seg="${name}" data-value="${o.value}" aria-pressed="${
          o.value === current ? "true" : "false"
        }">${escapeHtml(o.label)}</button>`
    )
    .join("");
  return `<div class="segmented" role="group">${buttons}</div>`;
}

function range(name, current, min, max, step, unit) {
  return `
    <input type="range" data-range="${name}" min="${min}" max="${max}" step="${step}" value="${current}">
    <span class="field__value" data-value-for="${name}">${current}${unit || ""}</span>`;
}

/**
 * @param {object} opts { getPrefs, onChange, diagnostics }
 *   diagnostics: { getLogs(), copyLogs(), clearLogs(), clearPreferences() }
 */
export function createSettingsPanel(opts) {
  const { getPrefs, onChange, diagnostics } = opts;

  function template() {
    const p = getPrefs();
    const fontOpts = FONT_OPTIONS.map(
      (f) =>
        `<option value="${escapeHtml(f.id)}" ${f.id === p.fontFamily ? "selected" : ""} style="font-family:${f.stack}">${escapeHtml(f.label)}</option>`
    ).join("");

    const themeOpts = [
      ["warm-paper", "Warm paper"],
      ["cool-paper", "Cool paper"],
      ["high-contrast", "High contrast"],
      ["dark", "Dark"],
    ]
      .map(([v, l]) => `<option value="${v}" ${p.theme === v ? "selected" : ""}>${l}</option>`)
      .join("");

    const refreshOpts = [
      ["adaptive", "Adaptive"],
      ["flash", "Flash"],
      ["wash", "Wash"],
    ]
      .map(([v, l]) => `<option value="${v}" ${p.refreshStyle === v ? "selected" : ""}>${l}</option>`)
      .join("");

    const kbd = KEYBOARD_REFERENCE.map(
      ([k, d]) => `<div><kbd>${escapeHtml(k)}</kbd> — ${escapeHtml(d)}</div>`
    ).join("");

    return `
      <div class="settings-scrim" data-close="scrim"></div>
      <aside class="settings" role="dialog" aria-modal="true" aria-label="Reader settings">
        <div class="settings__header">
          <span class="settings__title">Settings</span>
          <button type="button" class="icon-button" data-close="button" aria-label="Close settings">Close</button>
        </div>
        <div class="settings__body">

          <section class="settings__section">
            <h3>Reading mode</h3>
            <div class="field">
              <label>Mode</label>
              <div class="field__control">${seg("readerMode", p.readerMode, [
                { value: "paged", label: "Page" },
                { value: "scroll", label: "Scroll" },
              ])}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>Typography</h3>
            <div class="field">
              <label for="set-font">Font</label>
              <div class="field__control"><select id="set-font" class="font-select" data-select="fontFamily">${fontOpts}</select></div>
            </div>
            <div class="field">
              <label>Text size</label>
              <div class="field__control">${range("fontSize", p.fontSize, 14, 34, 1, "px")}</div>
            </div>
            <div class="field">
              <label>Line height</label>
              <div class="field__control">${range("lineHeight", p.lineHeight, 1.2, 2.1, 0.05, "")}</div>
            </div>
            <div class="field">
              <label>Line width</label>
              <div class="field__control">${range("measure", p.measure, 40, 100, 1, "ch")}</div>
            </div>
            <div class="field">
              <label>Paragraph spacing</label>
              <div class="field__control">${range("paraSpacing", p.paraSpacing, 0.2, 2, 0.1, "em")}</div>
            </div>
            <div class="field">
              <label>Alignment</label>
              <div class="field__control">${seg("align", p.align, [
                { value: "left", label: "Left" },
                { value: "justify", label: "Justify" },
              ])}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>Display</h3>
            <div class="field">
              <label for="set-theme">Paper</label>
              <div class="field__control"><select id="set-theme" data-select="theme">${themeOpts}</select></div>
            </div>
            <div class="field">
              <label>Contrast</label>
              <div class="field__control">${seg("contrast", p.contrast, [
                { value: "soft", label: "Soft" },
                { value: "normal", label: "Normal" },
              ])}</div>
            </div>
            <div class="field">
              <label>Texture</label>
              <div class="field__control">${range("textureStrength", p.textureStrength, 0, 1, 0.1, "")}</div>
            </div>
            <div class="field">
              <label>Margins</label>
              <div class="field__control">${range("margin", p.margin, 8, 80, 2, "px")}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>E Ink behavior</h3>
            <div class="field">
              <label>Intensity</label>
              <div class="field__control">${seg("einkIntensity", p.einkIntensity, [
                { value: "off", label: "Off" },
                { value: "reduced", label: "Reduced" },
                { value: "balanced", label: "Balanced" },
                { value: "strong", label: "Strong" },
              ])}</div>
            </div>
            <div class="field">
              <label for="set-refresh">Refresh style</label>
              <div class="field__control"><select id="set-refresh" data-select="refreshStyle">${refreshOpts}</select></div>
            </div>
            <div class="field">
              <label>Full refresh every</label>
              <div class="field__control">${range("fullRefreshInterval", p.fullRefreshInterval, 0, 20, 1, " turns")}</div>
            </div>
            <div class="field">
              <label>Ghosting</label>
              <div class="field__control">${range("ghosting", p.ghosting, 0, 1, 0.1, "")}</div>
            </div>
          </section>

          <section class="settings__section">
            <h3>Accessibility</h3>
            <div class="field">
              <label>Motion</label>
              <div class="field__control">${seg("motion", p.motion, [
                { value: "system", label: "System" },
                { value: "reduced", label: "Reduced" },
                { value: "full", label: "Full" },
              ])}</div>
            </div>
            <div class="field">
              <label for="set-progress">Show progress</label>
              <div class="field__control">${seg("showProgress", p.showProgress ? "on" : "off", [
                { value: "on", label: "On" },
                { value: "off", label: "Off" },
              ])}</div>
            </div>
            <div class="kbd-ref">${kbd}</div>
          </section>

          <section class="settings__section">
            <details>
              <summary>Advanced diagnostics</summary>
              <div class="field">
                <label>Debug mode</label>
                <div class="field__control">${seg("debugEnabled", p.debugEnabled ? "on" : "off", [
                  { value: "on", label: "On" },
                  { value: "off", label: "Off" },
                ])}</div>
              </div>
              <div class="log-view" data-log-view>Enable debug mode to view logs.</div>
              <div class="settings__footer" style="padding-left:0;padding-right:0;border-top:none;">
                <button type="button" class="button" data-action="copy-logs">Copy logs</button>
                <button type="button" class="button" data-action="clear-logs">Clear logs</button>
                <button type="button" class="button" data-action="reset-prefs">Reset preferences</button>
              </div>
            </details>
          </section>

        </div>
      </aside>`;
  }

  function wire(container, closeFn) {
    // Segmented controls.
    container.querySelectorAll("[data-seg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-seg");
        let value = btn.getAttribute("data-value");
        // Reflect pressed state within the group.
        container
          .querySelectorAll(`[data-seg="${name}"]`)
          .forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        const patch = {};
        if (name === "showProgress") patch.showProgress = value === "on";
        else if (name === "debugEnabled") patch.debugEnabled = value === "on";
        else patch[name] = value;
        onChange(patch);
        if (name === "debugEnabled") refreshLogs();
      });
    });

    // Selects.
    container.querySelectorAll("[data-select]").forEach((sel) => {
      sel.addEventListener("change", () => {
        onChange({ [sel.getAttribute("data-select")]: sel.value });
      });
    });

    // Ranges (live update label; commit on input).
    container.querySelectorAll("[data-range]").forEach((rng) => {
      const name = rng.getAttribute("data-range");
      const label = container.querySelector(`[data-value-for="${name}"]`);
      const unit = (label && label.textContent.replace(/^[\d.]+/, "")) || "";
      rng.addEventListener("input", () => {
        const num = Number(rng.value);
        if (label) label.textContent = `${num}${unit}`;
        onChange({ [name]: num });
      });
    });

    // Close actions.
    container.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeFn);
    });

    // Diagnostics.
    const copyBtn = container.querySelector('[data-action="copy-logs"]');
    const clearBtn = container.querySelector('[data-action="clear-logs"]');
    const resetBtn = container.querySelector('[data-action="reset-prefs"]');
    if (copyBtn) copyBtn.addEventListener("click", () => diagnostics.copyLogs());
    if (clearBtn)
      clearBtn.addEventListener("click", () => {
        diagnostics.clearLogs();
        refreshLogs();
      });
    if (resetBtn) resetBtn.addEventListener("click", () => diagnostics.clearPreferences());
  }

  let logViewEl = null;
  function refreshLogs() {
    if (!logViewEl) return;
    const p = getPrefs();
    if (!p.debugEnabled) {
      logViewEl.textContent = "Enable debug mode to view logs.";
      return;
    }
    const entries = diagnostics.getLogs();
    logViewEl.textContent = entries
      .slice(-60)
      .map((e) => `${e.t.slice(11, 19)} ${e.level} ${e.event}`)
      .join("\n");
  }

  /**
   * Render the panel into container. Returns { close } via closeFn passed by app.
   */
  function render(container, closeFn) {
    container.innerHTML = template();
    logViewEl = container.querySelector("[data-log-view]");
    wire(container, closeFn);
    refreshLogs();
    return container.querySelector(".settings");
  }

  return { render, refreshLogs };
}
