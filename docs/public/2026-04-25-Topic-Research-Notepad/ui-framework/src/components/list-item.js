import { dispatchComponentEvent, normalizeTone } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const LIST_ITEM_STYLES = css`
  :host {
    display: block;
  }

  .item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    align-items: start;
    border: var(--_surface-border-width) solid var(--_border, var(--awwbookmarklet-border-subtle, #9ba5b3));
    border-radius: var(--_surface-radius);
    background: var(--_bg, var(--awwbookmarklet-card-bg, #fbfcfe));
    padding: var(--awwbookmarklet-card-padding, var(--awwbookmarklet-surface-padding, 8px));
    color: var(--_fg, var(--awwbookmarklet-input-fg, #111720));
  }

  :host([compact]) .item { padding: var(--awwbookmarklet-space-2, 6px); }
  :host([interactive]) .item,
  :host([selectable]) .item { cursor: pointer; }
  :host([selected]) .item { --_bg: var(--awwbookmarklet-card-selected-bg, #e8f1ff); --_border: var(--awwbookmarklet-selection-bg, #1f5eae); }
  :host([disabled]) .item { opacity: 0.58; cursor: not-allowed; }

  .main {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta,
  .description,
  .status {
    color: var(--awwbookmarklet-text-muted, #586272);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    justify-content: end;
    min-width: 0;
  }

  :host([data-tone="info"]) { --_border: var(--awwbookmarklet-info-border, #7aa6e8); }
  :host([data-tone="success"]) { --_border: var(--awwbookmarklet-success-border, #72b98b); }
  :host([data-tone="warning"]) { --_border: var(--awwbookmarklet-warning-border, #d9ad3b); }
  :host([data-tone="danger"]) { --_border: var(--awwbookmarklet-danger-border, #d46a60); }

  @media (max-width: 520px) {
    .item {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .actions,
    .trailing {
      grid-column: 1 / -1;
      justify-content: start;
    }
  }
`;

function isActionClick(event) {
  const path = event.composedPath?.() || [];
  return path.some((node) => {
    if (!node?.slot) return false;
    return node.slot === "actions" || node.slot === "trailing";
  });
}

export class AwwListItem extends HTMLElement {
  static observedAttributes = ["tone", "selected", "disabled", "interactive", "selectable"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, LIST_ITEM_STYLES]);
    shadow.innerHTML = `
      <article class="item" part="item" role="listitem" tabindex="-1">
        <div part="leading"><slot name="leading"></slot></div>
        <div class="main" part="main">
          <div class="title" part="title"><slot name="title"></slot></div>
          <div class="meta" part="meta"><slot name="meta"></slot></div>
          <div part="thumbnail"><slot name="thumbnail"></slot></div>
          <div class="description" part="description"><slot name="description"></slot><slot></slot></div>
          <div class="status" part="status"><slot name="status"></slot></div>
          <div part="footer"><slot name="footer"></slot></div>
        </div>
        <div class="trailing" part="trailing"><slot name="trailing"></slot></div>
        <div class="actions" part="actions"><slot name="actions"></slot></div>
      </article>
    `;
    this.surface = shadow.querySelector(".item");
    this.surface.addEventListener("click", (event) => this.#onClick(event));
    this.surface.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  #sync() {
    this.dataset.tone = normalizeTone(this.getAttribute("tone"));
    this.surface.tabIndex = this.hasAttribute("interactive") || this.hasAttribute("selectable") ? 0 : -1;
    this.surface.setAttribute("aria-selected", this.hasAttribute("selected") ? "true" : "false");
    this.surface.setAttribute("aria-disabled", this.hasAttribute("disabled") ? "true" : "false");
  }

  #onClick(event) {
    if (this.hasAttribute("disabled") || isActionClick(event)) return;
    if (!this.hasAttribute("interactive") && !this.hasAttribute("selectable")) return;
    if (this.hasAttribute("selectable")) this.toggleAttribute("selected", !this.hasAttribute("selected"));
    dispatchComponentEvent(this, "awwbookmarklet-list-item-activate", {
      selected: this.hasAttribute("selected"),
      source: this
    });
  }

  #onKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.surface.click();
  }
}
