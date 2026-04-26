import { normalizeTone } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const METRIC_CARD_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .metric {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
    min-width: 0;
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-metric-bg, var(--awwbookmarklet-surface-raised-bg, #fff));
    padding: var(--awwbookmarklet-card-padding, var(--awwbookmarklet-surface-padding, 8px));
  }

  .label,
  .description {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .value {
    font-size: 22px;
    font-weight: 750;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .delta {
    color: var(--_fg, var(--awwbookmarklet-text-muted, #586272));
    font-size: 12px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  :host([compact]) .value {
    font-size: 18px;
  }

  :host([data-tone="info"]) { --_fg: var(--awwbookmarklet-info-fg, #123d7a); --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_fg: var(--awwbookmarklet-success-fg, #195b34); --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_fg: var(--awwbookmarklet-warning-fg, #6d4b00); --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_fg: var(--awwbookmarklet-danger-fg, #8a1f17); --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

export class AwwMetricCard extends HTMLElement {
  static observedAttributes = ["label", "value", "description", "delta", "tone"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, METRIC_CARD_STYLES]);
    shadow.innerHTML = `
      <section class="metric" part="metric">
        <div class="label" part="label"><slot name="label"></slot><span data-label></span></div>
        <div class="value" part="value"><slot name="value"></slot><span data-value></span></div>
        <div class="delta" part="delta"><slot name="delta"></slot><span data-delta></span></div>
        <div class="description" part="description"><slot name="description"></slot><span data-description></span><slot></slot></div>
      </section>
    `;
    this.labelNode = shadow.querySelector("[data-label]");
    this.valueNode = shadow.querySelector("[data-value]");
    this.deltaNode = shadow.querySelector("[data-delta]");
    this.descriptionNode = shadow.querySelector("[data-description]");
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
    this.labelNode.textContent = this.getAttribute("label") || "";
    this.valueNode.textContent = this.getAttribute("value") || "";
    this.deltaNode.textContent = this.getAttribute("delta") || "";
    this.descriptionNode.textContent = this.getAttribute("description") || "";
  }
}
