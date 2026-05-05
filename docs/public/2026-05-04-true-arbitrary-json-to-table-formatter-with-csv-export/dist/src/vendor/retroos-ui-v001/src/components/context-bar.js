// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { dispatchComponentEvent, normalizeDensity } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";
import { TAGS } from "../core/constants.js";

const CONTEXT_BAR_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .bar {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-surface-padding, 8px);
    overflow: hidden;
  }

  :host([data-density="compact"]) .bar {
    min-height: 24px;
    padding-inline: var(--awwbookmarklet-space-2, 6px);
  }

  :host([data-density="spacious"]) .bar {
    min-height: calc(var(--awwbookmarklet-size-control-h, 30px) + var(--awwbookmarklet-space-2, 8px));
  }

  :host([busy]) .bar {
    cursor: progress;
  }

  .leading,
  .actions {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
  }

  .leading:empty,
  .actions:empty {
    display: none;
  }

  awwbookmarklet-segment-strip {
    min-width: 0;
  }

  .progress {
    position: absolute;
    inset: auto 0 0;
    height: 2px;
    background: transparent;
    overflow: hidden;
  }

  .progress-fill {
    display: block;
    width: var(--_progress, 0%);
    height: 100%;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  :host([busy]:not([progress])) .progress-fill {
    width: 38%;
  }

  @media (prefers-reduced-motion: no-preference) {
    :host([busy]:not([progress])) .progress-fill {
      animation: aww-context-busy 1.1s steps(14, end) infinite;
    }
  }

  @keyframes aww-context-busy {
    from { translate: -100% 0; }
    to { translate: 260% 0; }
  }
`;

export class AwwContextBar extends HTMLElement {
  static observedAttributes = ["value", "copy-behavior", "density", "busy", "progress", "max"];

  #segments = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CONTEXT_BAR_STYLES]);
    shadow.innerHTML = `
      <section class="bar" part="bar">
        <div class="leading" part="leading"><slot name="leading"></slot></div>
        <${TAGS.segmentStrip} part="segments"></${TAGS.segmentStrip}>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
        <div class="progress" part="progress"><span class="progress-fill" part="progress-fill"></span></div>
      </section>
    `;
    this.strip = shadow.querySelector(TAGS.segmentStrip);
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get segments() { return this.#segments; }
  set segments(value) {
    this.#segments = Array.isArray(value) ? value : [];
    this.removeAttribute("value");
    this.#sync();
  }

  get progress() { return Number(this.getAttribute("progress") || "0"); }
  set progress(value) { this.setAttribute("progress", String(value ?? "")); }

  expand() {
    dispatchComponentEvent(this, "awwbookmarklet-context-bar-expand", { source: this });
  }

  collapse() {
    dispatchComponentEvent(this, "awwbookmarklet-context-bar-collapse", { source: this });
  }

  #sync() {
    if (!this.strip) return;
    this.dataset.density = normalizeDensity(this.getAttribute("density"));
    this.strip.setAttribute("copy-behavior", this.getAttribute("copy-behavior") || "event");
    if (this.hasAttribute("value")) this.strip.setAttribute("value", this.getAttribute("value") || "");
    else this.strip.segments = this.#segments;

    const max = Number(this.getAttribute("max") || "100");
    const value = Number(this.getAttribute("progress") || "0");
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    this.style.setProperty("--_progress", `${pct}%`);
    this.setAttribute("aria-busy", this.hasAttribute("busy") ? "true" : "false");
  }
}
