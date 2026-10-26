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
    min-height: 0;
    min-width: 0;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .wrap {
    box-sizing: border-box;
    height: 100%;
    min-height: 96px;
    max-width: 100%;
    /* Keep both axes scrollable when a consumer gives the preview a bounded
       flex/grid area. Wide tables and preformatted content must remain usable. */
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

  /* --- Definition lists and label/value preview layouts --- */
  /* Generic structural styling for extracted key/value content. Because rich
     preview content renders inside this shadow root, host-page CSS cannot reach
     it; these rules give definition lists and data-preview-layout groups a
     readable two-column layout without any feature-specific knowledge. */
  .content dl {
    margin: 0 0 0.85em;
  }

  .content dt {
    font-weight: 600;
    color: var(--awwbookmarklet-text-muted, #586272);
  }

  .content dd {
    margin: 0 0 0.4em;
  }

  .content dl[data-preview-layout="key-value"],
  .content dl[data-preview-layout="field-list"] {
    display: grid;
    grid-template-columns: minmax(8rem, 38%) minmax(0, 1fr);
    column-gap: var(--awwbookmarklet-space-3, 12px);
    row-gap: 2px;
    align-items: start;
  }

  .content dl[data-preview-layout="key-value"] dt,
  .content dl[data-preview-layout="field-list"] dt,
  .content dl[data-preview-layout="key-value"] dd,
  .content dl[data-preview-layout="field-list"] dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .content [data-preview-role="group-title"] {
    margin: 0.6em 0 0.25em;
  }
`;

/**
 * awwbookmarklet-rich-preview
 *
 * Attributes:
 *   empty-text — fallback message shown when `html` is empty
 *   links      — `safe` (default) | `plain`
 *   images     — `constrained` (default) | `hidden`
 *
 * Properties:
 *   html — sanitized HTML content
 *
 * Methods:
 *   setUnsafeHTML(value) — renders trusted HTML without sanitization
 *
 * Events:
 *   (none)
 *
 * Slots:
 *   (none)
 *
 * CSS parts:
 *   wrap, empty, content
 */

export class AwwRichPreview extends HTMLElement {
  static observedAttributes = ["empty-text", "links", "images"];
  declare private readonly emptyNode: HTMLElement;
  declare private readonly contentNode: HTMLElement;

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
    this.emptyNode = (shadow.querySelector(".empty") as HTMLElement);
    this.contentNode = (shadow.querySelector(".content") as HTMLElement);
  }

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { this.#render(); }

  get html() {
    return this.#html;
  }

  set html(value) {
    const links = this.getAttribute("links") === "plain" ? "plain" : "safe";
    const images = this.getAttribute("images") === "hidden" ? "hidden" : "constrained";
    this.#html = sanitizeHtml(value, {
      links,
      images
    });
    this.#render();
  }

  setUnsafeHTML(value: unknown) {
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
