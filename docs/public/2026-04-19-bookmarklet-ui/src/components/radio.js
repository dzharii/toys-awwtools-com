import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const RADIO_STYLES = css`
  :host { display: inline-block; }

  label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input {
    appearance: none;
    width: 14px;
    height: 14px;
    margin: 0;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    border-radius: 999px;
    position: relative;
  }

  input:checked::after {
    content: "";
    position: absolute;
    inset: 3px;
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    border-radius: 999px;
  }

  input:focus-visible { outline: none; box-shadow: var(--_ring); }
  input:disabled + span { opacity: 0.6; }
`;

const MIRRORED = ["checked", "disabled", "name", "value"];

export class AwwRadio extends HTMLElement {
  static observedAttributes = MIRRORED;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, RADIO_STYLES]);
    shadow.innerHTML = `<label><input type="radio" part="control" /><span part="label"><slot></slot></span></label>`;

    this.control = shadow.querySelector("input");
    this.control.addEventListener("change", (event) => {
      event.stopPropagation();
      this.toggleAttribute("checked", this.control.checked);
      if (this.control.checked) this.#uncheckRadioGroupPeers();
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
      if (this.control.checked) this.#uncheckRadioGroupPeers();
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

  #uncheckRadioGroupPeers() {
    const name = this.getAttribute("name");
    if (!name) return;

    const root = this.getRootNode();
    const peers = root.querySelectorAll?.("awwbookmarklet-radio") ?? [];
    for (const peer of peers) {
      if (peer !== this && peer.getAttribute("name") === name) peer.removeAttribute("checked");
    }
  }
}
