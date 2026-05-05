// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";
import { FORM_ARIA_ATTRIBUTES } from "../core/form-attributes.js";

const TEXTAREA_STYLES = css`
  :host { display: inline-block; min-width: 220px; }
  :host([wide]) { display: block; width: 100%; }

  textarea {
    width: 100%;
    min-height: 96px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    box-shadow: var(--awwbookmarklet-control-inset-shadow, none);
    padding-block: var(--awwbookmarklet-input-padding-y, 8px);
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    font: inherit;
    resize: vertical;
  }

  textarea:focus-visible { outline: none; box-shadow: var(--_ring); }
  textarea:disabled { opacity: 0.65; }
`;

const MIRRORED_ATTRIBUTES = ["value", "placeholder", "disabled", "rows", "name", "required", "autocomplete", "spellcheck", ...FORM_ARIA_ATTRIBUTES];

export class AwwTextarea extends HTMLElement {
  static observedAttributes = MIRRORED_ATTRIBUTES;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TEXTAREA_STYLES]);
    shadow.innerHTML = `<textarea part="control"></textarea>`;

    this.control = shadow.querySelector("textarea");
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

  get value() { return this.control.value; }
  set value(nextValue) { this.setAttribute("value", String(nextValue ?? "")); }
  get disabled() { return this.hasAttribute("disabled"); }
  set disabled(value) { this.toggleAttribute("disabled", Boolean(value)); }

  attributeChangedCallback(name, _prev, next) {
    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }

    if (name === "required") {
      this.control.required = this.hasAttribute("required");
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
