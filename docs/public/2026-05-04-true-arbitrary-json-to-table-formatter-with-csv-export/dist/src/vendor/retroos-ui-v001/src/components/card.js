// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { normalizeTone } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const CARD_STYLES = css`
  :host {
    display: block;
  }

  .card {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-card-padding, var(--awwbookmarklet-surface-padding, 8px));
  }

  .header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    min-width: 0;
  }

  .heading {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title { font-weight: 700; overflow-wrap: anywhere; }
  .meta { color: var(--awwbookmarklet-text-muted, #586272); overflow-wrap: anywhere; }
  .body { min-width: 0; line-height: 1.4; }
  .footer { border-top: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4); padding-top: var(--awwbookmarklet-space-2, 8px); }

  :host([selected]) .card { --_bg: var(--awwbookmarklet-card-selected-bg, #e8f1ff); --_border: var(--awwbookmarklet-selection-bg, #1f5eae); }
  :host([data-tone="info"]) { --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_border: var(--awwbookmarklet-danger-border, #d46a60); }
`;

export class AwwCard extends HTMLElement {
  static observedAttributes = ["tone"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CARD_STYLES]);
    shadow.innerHTML = `
      <article class="card" part="card">
        <div class="header" part="header">
          <div class="heading" part="heading">
            <div class="title" part="title"><slot name="title"></slot></div>
            <div class="meta" part="meta"><slot name="meta"></slot></div>
          </div>
          <div part="actions"><slot name="actions"></slot></div>
        </div>
        <div part="media"><slot name="media"></slot></div>
        <div class="body" part="body"><slot></slot></div>
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </article>
    `;
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }
  #sync() { this.dataset.tone = normalizeTone(this.getAttribute("tone")); }
}
