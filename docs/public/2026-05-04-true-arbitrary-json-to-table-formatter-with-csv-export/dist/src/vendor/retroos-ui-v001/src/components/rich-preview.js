// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { sanitizeHtml } from "../core/sanitize.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const RICH_PREVIEW_STYLES = css`
  :host {
    display: block;
    min-width: 0;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .wrap {
    min-height: 96px;
    max-width: 100%;
    overflow: auto;
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-3, 12px));
  }

  .empty {
    color: var(--awwbookmarklet-text-muted, #586272);
    display: none;
  }

  :host([data-empty="true"]) .empty {
    display: block;
  }

  :host([data-empty="true"]) .content {
    display: none;
  }

  .content {
    color: var(--awwbookmarklet-input-fg, #111720);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .content h1,
  .content h2,
  .content h3,
  .content h4 {
    margin: 0.7em 0 0.35em;
    line-height: 1.2;
  }

  .content p,
  .content ul,
  .content ol,
  .content blockquote,
  .content pre,
  .content table {
    margin: 0 0 0.85em;
  }

  .content img {
    max-width: 100%;
    height: auto;
  }

  .content table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  .content th,
  .content td {
    border: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding: var(--awwbookmarklet-space-1, 4px) var(--awwbookmarklet-space-2, 6px);
    vertical-align: top;
  }

  .content blockquote {
    border-left: 3px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    padding-left: 10px;
    color: var(--awwbookmarklet-text-muted, #586272);
  }

  .content pre {
    overflow: auto;
    max-width: 100%;
    padding: var(--awwbookmarklet-surface-padding, 8px);
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
  }

  .content code {
    background: var(--awwbookmarklet-code-bg, #e8edf4);
    color: var(--awwbookmarklet-code-fg, #172131);
    padding: 0 var(--awwbookmarklet-space-1, 3px);
  }

  .content pre code {
    padding: 0;
    background: transparent;
  }
`;

export class AwwRichPreview extends HTMLElement {
  static observedAttributes = ["empty-text", "links", "images"];

  #html = "";

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, RICH_PREVIEW_STYLES]);
    shadow.innerHTML = `
      <section class="wrap" part="wrap">
        <div class="empty" part="empty"></div>
        <div class="content" part="content"></div>
      </section>
    `;
    this.emptyNode = shadow.querySelector(".empty");
    this.contentNode = shadow.querySelector(".content");
  }

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { this.#render(); }

  get html() {
    return this.#html;
  }

  set html(value) {
    this.#html = sanitizeHtml(value, {
      links: this.getAttribute("links") || "safe",
      images: this.getAttribute("images") || "constrained"
    });
    this.#render();
  }

  setUnsafeHTML(value) {
    this.#html = String(value ?? "");
    this.#render();
  }

  #render() {
    if (!this.contentNode) return;
    this.emptyNode.textContent = this.getAttribute("empty-text") || "Nothing to preview.";
    this.contentNode.innerHTML = this.#html;
    this.dataset.empty = this.#html.trim() ? "false" : "true";
  }
}
