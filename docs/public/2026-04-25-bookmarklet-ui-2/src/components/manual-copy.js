import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const MANUAL_COPY_STYLES = css`
  :host {
    display: block;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-warning-border, #d9ad3b);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-warning-bg, #fff4d6);
    color: var(--awwbookmarklet-warning-fg, #6d4b00);
    padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px));
  }

  .wrap {
    display: grid;
    gap: var(--awwbookmarklet-surface-gap, 6px);
  }

  .label {
    font-weight: 700;
  }

  textarea {
    min-height: 92px;
    width: 100%;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
    padding: var(--awwbookmarklet-input-padding-x, 8px);
  }
`;

export class AwwManualCopy extends HTMLElement {
  static observedAttributes = ["label", "value"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MANUAL_COPY_STYLES]);
    shadow.innerHTML = `
      <section class="wrap" part="wrap">
        <div class="label" part="label"></div>
        <div part="description"><slot>Automatic copy is unavailable. Select the text below and copy it manually.</slot></div>
        <textarea part="control" readonly></textarea>
      </section>
    `;
    this.labelNode = shadow.querySelector(".label");
    this.control = shadow.querySelector("textarea");
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get value() { return this.control.value; }
  set value(next) { this.setAttribute("value", String(next ?? "")); }

  selectText() {
    this.control.focus();
    this.control.select();
  }

  #sync() {
    this.labelNode.textContent = this.getAttribute("label") || "Manual copy required";
    this.control.value = this.getAttribute("value") || "";
  }
}
