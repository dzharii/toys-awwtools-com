import { normalizeDensity } from "../core/component-utils.js";
import { TAGS } from "../core/constants.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const STATUS_STRIP_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    background: var(--awwbookmarklet-statusbar-bg, #e5e8ee);
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    color: var(--awwbookmarklet-text-muted, #586272);
  }

  .status {
    min-height: 24px;
    display: flex;
    align-items: center;
    padding-inline: var(--awwbookmarklet-space-2, 8px);
  }

  :host([data-density="compact"]) .status {
    min-height: 20px;
    font-size: 12px;
  }

  awwbookmarklet-segment-strip {
    width: 100%;
  }
`;

export class AwwStatusStrip extends HTMLElement {
  static observedAttributes = ["value", "copy-behavior", "density", "live"];

  #segments = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, STATUS_STRIP_STYLES]);
    shadow.innerHTML = `<div class="status" part="status"><${TAGS.segmentStrip} part="segments"></${TAGS.segmentStrip}></div>`;
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

  #sync() {
    if (!this.strip) return;
    this.dataset.density = normalizeDensity(this.getAttribute("density"));
    this.strip.setAttribute("copy-behavior", this.getAttribute("copy-behavior") || "event");
    if (this.hasAttribute("value")) this.strip.setAttribute("value", this.getAttribute("value") || "");
    else this.strip.segments = this.#segments;
    const live = this.getAttribute("live") || "polite";
    this.setAttribute("aria-live", ["off", "polite", "assertive"].includes(live) ? live : "polite");
  }
}
