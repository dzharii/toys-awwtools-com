import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";
import { FORM_ARIA_ATTRIBUTES } from "../core/form-attributes.js";

const CHECKBOX_STYLES = css`
  :host { display: inline-block; }

  label {
    display: inline-flex;
    align-items: center;
    gap: var(--awwbookmarklet-space-2, 8px);
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: var(--_control-radius);
    position: relative;
  }

  input:checked::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled + span { opacity: 0.6; }
`;

const MIRRORED = ["checked", "disabled", "name", "value", ...FORM_ARIA_ATTRIBUTES];

export class AwwCheckbox extends HTMLElement {
  static observedAttributes = MIRRORED;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, CHECKBOX_STYLES]);
    shadow.innerHTML = `<label><input type="checkbox" part="control" /><span part="label"><slot></slot></span></label>`;

    this.control = shadow.querySelector("input");
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.toggleAttribute("checked", this.control.checked);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  get checked() { return this.hasAttribute("checked"); }
  set checked(value) { this.toggleAttribute("checked", Boolean(value)); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }
  get value() { return this.getAttribute("value") ?? "on"; }
  set value(nextValue) { this.setAttribute("value", String(nextValue ?? "")); }

  attributeChangedCallback(name, _prev, next) {
    if (name === "checked") {
      this.control.checked = this.hasAttribute("checked");
      return;
    }

    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }

    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }

    this.control.setAttribute(name, next);
  }
}
