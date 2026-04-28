import { dispatchComponentEvent, getFocusableElements } from "../core/component-utils.js";
import { portalElement, restoreElement } from "../core/overlay.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const DIALOG_STYLES = css`
  :host {
    position: fixed;
    inset: 0;
    display: none;
    pointer-events: none;
    z-index: 1;
  }

  :host([open]) {
    display: grid;
    place-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--awwbookmarklet-overlay-backdrop, rgba(12, 18, 28, 0.38));
    pointer-events: auto;
  }

  .panel {
    position: relative;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(680px, calc(100vw - 32px));
    max-height: min(620px, calc(100vh - 32px));
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-panel-bg, #f8fafc);
    box-shadow: var(--awwbookmarklet-overlay-shadow, 0 18px 44px rgba(0,0,0,0.24));
    pointer-events: auto;
  }

  .header,
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--awwbookmarklet-surface-gap, var(--awwbookmarklet-space-2, 8px));
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
    background: var(--awwbookmarklet-surface-raised-bg, #fff);
  }

  .header {
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .footer {
    border-top: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
  }

  .title {
    font-weight: 700;
  }

  .body {
    min-height: 0;
    overflow: auto;
    padding: var(--awwbookmarklet-window-body-padding, var(--awwbookmarklet-space-3, 12px));
  }

  button {
    min-width: 28px;
    min-height: 26px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
    color: var(--awwbookmarklet-button-fg, #111720);
    font: inherit;
  }
`;

export class AwwDialog extends HTMLElement {
  static observedAttributes = ["open", "label", "modal"];

  #restore = null;
  #previousFocus = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, DIALOG_STYLES]);
    shadow.innerHTML = `
      <div class="backdrop" part="backdrop"></div>
      <section class="panel" part="panel" role="dialog" aria-modal="true" tabindex="-1">
        <header class="header" part="header">
          <div class="title" part="title"><slot name="title"></slot></div>
          <button type="button" part="close-button" aria-label="Close">x</button>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer class="footer" part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
    this.panel = shadow.querySelector(".panel");
    this.backdrop = shadow.querySelector(".backdrop");
    this.closeButton = shadow.querySelector("button");
    this.closeButton.addEventListener("click", () => this.close("button"));
    this.backdrop.addEventListener("click", () => {
      if (this.hasAttribute("close-on-backdrop")) this.close("backdrop");
    });
    this.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }

  connectedCallback() { this.#sync(); }
  disconnectedCallback() { restoreElement(this, this.#restore); }
  attributeChangedCallback() { this.#sync(); }

  show() {
    this.setAttribute("open", "");
  }

  close(reason = "api") {
    const accepted = dispatchComponentEvent(this, "awwbookmarklet-dialog-cancel", { reason }, { cancelable: true });
    if (!accepted) return false;
    this.removeAttribute("open");
    dispatchComponentEvent(this, "awwbookmarklet-dialog-close", { reason });
    return true;
  }

  #sync() {
    this.panel.setAttribute("aria-label", this.getAttribute("label") || "Dialog");
    if (this.hasAttribute("open")) {
      if (!this.#restore) this.#restore = portalElement(this);
      this.#previousFocus ||= document.activeElement;
      queueMicrotask(() => this.#focusInitial());
      dispatchComponentEvent(this, "awwbookmarklet-dialog-open", { source: this });
      return;
    }
    if (this.#restore) {
      const previous = this.#previousFocus;
      restoreElement(this, this.#restore);
      this.#restore = null;
      this.#previousFocus = null;
      if (previous?.focus) previous.focus();
    }
  }

  #focusInitial() {
    const focusable = getFocusableElements(this);
    (focusable[0] || this.closeButton || this.panel).focus();
  }

  #onKeyDown(event) {
    if (!this.hasAttribute("open")) return;
    if (event.key === "Escape" && this.getAttribute("close-on-escape") !== "false") {
      event.preventDefault();
      this.close("escape");
      return;
    }
    if (event.key !== "Tab" || !this.hasAttribute("modal")) return;
    const focusable = getFocusableElements(this);
    if (!focusable.length) {
      event.preventDefault();
      this.panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
