import { TAGS } from "../core/constants.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const TITLEBAR_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    min-height: var(--awwbookmarklet-size-title-h, 32px);
    background: linear-gradient(180deg, color-mix(in srgb, #f7f9fb calc(var(--awwbookmarklet-frost-opacity, 1) * 100%), var(--awwbookmarklet-titlebar-active-bg, #dce2e9)), var(--awwbookmarklet-titlebar-active-bg, #dce2e9));
    color: var(--awwbookmarklet-titlebar-fg, #121820);
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    user-select: none;
  }

  :host([inactive]) {
    background: linear-gradient(180deg, color-mix(in srgb, #eef2f6 calc(var(--awwbookmarklet-frost-opacity, 1) * 100%), var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd)), var(--awwbookmarklet-titlebar-inactive-bg, #cfd5dd));
  }

  .bar {
    min-height: inherit;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--awwbookmarklet-titlebar-gap, 6px);
    padding-inline: var(--awwbookmarklet-titlebar-padding-x, 6px);
  }

  .drag-region {
    min-width: 0;
    cursor: grab;
  }

  .system,
  .commands {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-1, 4px);
  }

  button {
    min-width: 22px;
    height: 22px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-button-bg, #edf1f5);
    color: inherit;
    font: inherit;
  }

  button:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }
`;

export class AwwTitlebar extends HTMLElement {
  static observedAttributes = ["value", "title", "inactive"];
  #segments = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TITLEBAR_STYLES]);
    shadow.innerHTML = `
      <div class="bar" part="bar">
        <div class="system" part="system"><slot name="system"><button type="button" part="system-button" aria-label="System menu">◫</button></slot></div>
        <div class="drag-region" part="drag-region">
          <${TAGS.segmentStrip} part="segments"></${TAGS.segmentStrip}>
        </div>
        <div class="commands" part="commands"><slot name="commands"></slot></div>
      </div>
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

  #sync() {
    if (!this.strip) return;
    const value = this.getAttribute("value") || this.getAttribute("title") || "";
    if (value) this.strip.setAttribute("value", value);
    else this.strip.segments = this.#segments;
  }
}
