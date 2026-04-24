import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const INPUT_STYLES = css`
  :host { display: inline-block; min-width: 140px; }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled { opacity: 0.65; }
`;

const MIRRORED_ATTRIBUTES = ["value", "placeholder", "disabled", "type", "name"];

export class AwwInput extends HTMLElement {
  static observedAttributes = MIRRORED_ATTRIBUTES;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, INPUT_STYLES]);
    shadow.innerHTML = `<input part="control" />`;

    this.control = shadow.querySelector("input");
    this.control.addEventListener("input", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    });
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.setAttribute("value", this.control.value);
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  get value() {
    return this.control.value;
  }

  set value(nextValue) {
    this.setAttribute("value", String(nextValue ?? ""));
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  set disabled(value) {
    this.toggleAttribute("disabled", Boolean(value));
  }

  attributeChangedCallback(name, _prev, next) {
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }

    if (name === "value") {
      this.control.value = next ?? "";
      return;
    }

    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }

    this.control.setAttribute(name, next);
  }
}
