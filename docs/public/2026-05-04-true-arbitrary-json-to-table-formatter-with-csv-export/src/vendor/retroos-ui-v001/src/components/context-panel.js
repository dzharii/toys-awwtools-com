// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { getSegmentCopyValue, normalizeContextSegments } from "../core/context-segments.js";
import { dispatchComponentEvent } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const CONTEXT_PANEL_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    padding: var(--awwbookmarklet-panel-padding, var(--awwbookmarklet-surface-padding, 8px));
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--awwbookmarklet-surface-gap, 8px);
  }

  .item {
    min-width: 0;
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
    padding: var(--awwbookmarklet-card-padding, 8px);
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  .label {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.3;
  }

  .value {
    overflow-wrap: anywhere;
    font-weight: 650;
  }

  .item[data-copyable="true"] {
    cursor: pointer;
  }

  .item[data-tone="info"] { --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  .item[data-tone="success"] { --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  .item[data-tone="warning"] { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  .item[data-tone="danger"] { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

export class AwwContextPanel extends HTMLElement {
  static observedAttributes = ["value"];
  #segments = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CONTEXT_PANEL_STYLES]);
    shadow.innerHTML = `<section class="grid" part="grid"></section>`;
    this.grid = shadow.querySelector(".grid");
    this.grid.addEventListener("dblclick", (event) => this.#copyFromEvent(event));
    this.grid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      this.#copyFromEvent(event);
    });
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get segments() { return this.#segments; }
  set segments(value) {
    this.#segments = normalizeContextSegments(value);
    this.removeAttribute("value");
    this.#render();
  }

  #sync() {
    if (this.hasAttribute("value")) this.#segments = normalizeContextSegments(this.getAttribute("value"));
    this.#render();
  }

  #render() {
    if (!this.grid) return;
    this.grid.textContent = "";
    for (const segment of this.#segments) {
      const item = document.createElement("article");
      item.className = "item";
      item.setAttribute("part", `item item-${segment.tone}`);
      item.dataset.key = segment.key;
      item.dataset.tone = segment.tone;
      item.dataset.copyable = String(segment.copyable);
      if (segment.copyable) {
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Copy ${segment.label || segment.key}: ${getSegmentCopyValue(segment)}`);
      }
      item.innerHTML = `
        <div class="label" part="label"></div>
        <div class="value" part="value"></div>
      `;
      item.querySelector(".label").textContent = segment.label || segment.kind || segment.key;
      item.querySelector(".value").textContent = segment.value;
      this.grid.append(item);
    }
  }

  #copyFromEvent(event) {
    const item = event.target.closest?.(".item");
    const segment = this.#segments.find((entry) => entry.key === item?.dataset?.key);
    if (!segment?.copyable) return;
    event.preventDefault();
    dispatchComponentEvent(this, "awwbookmarklet-segment-copy", {
      segment,
      key: segment.key,
      value: segment.value,
      copyValue: getSegmentCopyValue(segment),
      source: this,
      anchor: item,
      originalEvent: event
    });
  }
}
