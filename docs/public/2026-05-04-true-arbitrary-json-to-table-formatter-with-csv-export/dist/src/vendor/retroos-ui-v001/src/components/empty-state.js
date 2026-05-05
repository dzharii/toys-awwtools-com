// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const EMPTY_STYLES = css`
  :host {
    display: block;
    min-height: 96px;
    border: var(--_surface-border-width) dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-3, 12px));
  }

  .empty {
    display: grid;
    place-items: center;
    gap: var(--awwbookmarklet-surface-gap, 6px);
    min-height: inherit;
    text-align: center;
  }

  .title {
    color: var(--awwbookmarklet-input-fg, #111720);
    font-weight: 700;
  }

  .description {
    line-height: 1.4;
  }

  .actions {
    margin-top: 4px;
  }
`;

export class AwwEmptyState extends HTMLElement {
  static observedAttributes = ["title", "description"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, EMPTY_STYLES]);
    shadow.innerHTML = `
      <section class="empty" part="empty">
        <div class="title" part="title"></div>
        <div class="description" part="description"></div>
        <div class="content" part="content"><slot></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </section>
    `;
    this.titleNode = shadow.querySelector(".title");
    this.descriptionNode = shadow.querySelector(".description");
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  #sync() {
    this.titleNode.textContent = this.getAttribute("title") || "Nothing to show";
    this.descriptionNode.textContent = this.getAttribute("description") || "";
  }
}
