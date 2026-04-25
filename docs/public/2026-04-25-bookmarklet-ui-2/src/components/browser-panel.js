import { dispatchComponentEvent } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const BROWSER_PANEL_STYLES = css`
  :host {
    display: grid;
    min-height: 220px;
    min-width: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
  }

  .panel {
    position: relative;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-height: inherit;
    min-width: 0;
  }

  .chrome {
    display: flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-2, 8px);
    padding: 6px;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .address {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--awwbookmarklet-text-muted, #586272);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  iframe {
    width: 100%;
    height: 100%;
    min-height: 180px;
    border: 0;
    background: #fff;
  }

  .overlay {
    position: absolute;
    inset: 31px 0 0;
    display: none;
  }

  :host([loading]) .overlay,
  :host([error]) .overlay {
    display: block;
  }

  button {
    min-height: 26px;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    font: inherit;
  }
`;

export class AwwBrowserPanel extends HTMLElement {
  static observedAttributes = ["src", "sandbox", "referrerpolicy", "loading", "error", "title", "loading-label", "error-label"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, BROWSER_PANEL_STYLES]);
    shadow.innerHTML = `
      <section class="panel" part="panel">
        <div class="chrome" part="chrome">
          <div class="address" part="address"><slot name="address"></slot><span data-address></span></div>
          <div part="actions"><slot name="actions"></slot></div>
        </div>
        <iframe part="frame"></iframe>
        <div class="overlay" part="overlay">
          <awwbookmarklet-state-overlay></awwbookmarklet-state-overlay>
          <slot name="overlay"></slot>
        </div>
      </section>
    `;
    this.frame = shadow.querySelector("iframe");
    this.addressFallback = shadow.querySelector("[data-address]");
    this.overlay = shadow.querySelector("awwbookmarklet-state-overlay");
    this.frame.addEventListener("load", () => {
      this.removeAttribute("loading");
      dispatchComponentEvent(this, "awwbookmarklet-frame-load", { src: this.src });
    });
    this.frame.addEventListener("error", () => {
      this.setAttribute("error", "");
      dispatchComponentEvent(this, "awwbookmarklet-frame-error", { src: this.src });
    });
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get src() { return this.getAttribute("src") || ""; }
  set src(value) { this.setAttribute("src", String(value ?? "")); }

  retry() {
    dispatchComponentEvent(this, "awwbookmarklet-frame-retry", { src: this.src });
    if (this.src) {
      this.setAttribute("loading", "");
      this.removeAttribute("error");
      this.frame.src = this.src;
    }
  }

  openExternally() {
    dispatchComponentEvent(this, "awwbookmarklet-frame-fallback-open", { src: this.src });
  }

  #sync() {
    if (!this.frame) return;
    const src = this.getAttribute("src") || "about:blank";
    if (this.frame.getAttribute("src") !== src) this.frame.setAttribute("src", src);
    this.frame.setAttribute("title", this.getAttribute("title") || "Browser panel");
    this.frame.setAttribute("sandbox", this.getAttribute("sandbox") || "allow-scripts allow-forms allow-same-origin");
    this.frame.setAttribute("referrerpolicy", this.getAttribute("referrerpolicy") || "no-referrer");
    this.addressFallback.textContent = this.getAttribute("src") || "No page loaded";
    const error = this.hasAttribute("error");
    this.overlay.setAttribute("state", error ? "blocked" : "loading");
    this.overlay.setAttribute("label", error
      ? (this.getAttribute("error-label") || "This page could not be loaded here.")
      : (this.getAttribute("loading-label") || "Loading page"));
  }
}
