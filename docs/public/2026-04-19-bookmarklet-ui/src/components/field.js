import { createId, normalizeOrientation, normalizeTone } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const FIELD_STYLES = css`
  :host {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  :host([wide]) {
    width: 100%;
  }

  .field {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  :host([orientation="horizontal"]) .field {
    grid-template-columns: minmax(120px, 0.38fr) minmax(0, 1fr);
    gap: 8px 12px;
    align-items: start;
  }

  :host([orientation="inline"]) .field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-weight: 650;
    line-height: 1.25;
  }

  .required {
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  .control-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
    min-width: 0;
  }

  .control-row ::slotted(*) {
    min-width: 0;
  }

  .main {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .message {
    min-height: 16px;
    color: var(--awwbookmarklet-text-help, #657184);
    font-size: 12px;
    line-height: 1.3;
  }

  :host([data-tone="danger"]) .message,
  :host([data-invalid="true"]) .message {
    color: var(--awwbookmarklet-danger-fg, #8a1f17);
  }

  :host([disabled]) {
    opacity: 0.7;
  }
`;

export class AwwField extends HTMLElement {
  static observedAttributes = ["label", "help", "error", "required", "tone", "orientation", "disabled"];

  #ids = {
    label: createId("aww-field-label"),
    help: createId("aww-field-help"),
    error: createId("aww-field-error")
  };

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, FIELD_STYLES]);
    shadow.innerHTML = `
      <label class="field" part="field">
        <span class="label" part="label" id="${this.#ids.label}"><slot name="label"></slot><span data-label-text></span><span class="required" aria-hidden="true"></span></span>
        <span class="main" part="main">
          <span class="control-row" part="control-row">
            <slot name="prefix"></slot>
            <slot></slot>
            <slot name="suffix"></slot>
            <slot name="actions"></slot>
          </span>
          <span class="message" part="message">
            <span id="${this.#ids.error}" data-error-text></span>
            <span id="${this.#ids.help}" data-help-text></span>
            <slot name="error"></slot>
            <slot name="help"></slot>
          </span>
        </span>
      </label>
    `;
    this.controlSlot = shadow.querySelector("slot:not([name])");
    this.labelText = shadow.querySelector("[data-label-text]");
    this.helpText = shadow.querySelector("[data-help-text]");
    this.errorText = shadow.querySelector("[data-error-text]");
    this.requiredMark = shadow.querySelector(".required");
    this.controlSlot.addEventListener("slotchange", () => this.#syncControl());
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const orientation = normalizeOrientation(this.getAttribute("orientation"), "vertical");
    if (this.getAttribute("orientation") !== orientation) this.setAttribute("orientation", orientation);

    const error = this.getAttribute("error") || "";
    this.dataset.invalid = error ? "true" : "false";
    this.dataset.tone = error ? "danger" : normalizeTone(this.getAttribute("tone"));
    this.labelText.textContent = this.getAttribute("label") || "";
    this.helpText.textContent = error ? "" : (this.getAttribute("help") || "");
    this.errorText.textContent = error;
    this.requiredMark.textContent = this.hasAttribute("required") ? " *" : "";
    this.#syncControl();
  }

  #syncControl() {
    const control = this.controlSlot.assignedElements({ flatten: true })[0];
    if (!control) return;

    if (!control.hasAttribute("aria-labelledby")) control.setAttribute("aria-labelledby", this.#ids.label);

    const descriptions = [];
    if (this.getAttribute("help")) descriptions.push(this.#ids.help);
    if (this.getAttribute("error")) descriptions.push(this.#ids.error);
    if (descriptions.length) control.setAttribute("aria-describedby", descriptions.join(" "));
    else control.removeAttribute("aria-describedby");

    control.toggleAttribute("required", this.hasAttribute("required"));
    control.toggleAttribute("disabled", this.hasAttribute("disabled"));
    control.setAttribute("aria-invalid", this.getAttribute("error") ? "true" : "false");
  }
}
