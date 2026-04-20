import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const SELECT_STYLES = css`
  :host { display: inline-block; min-width: 160px; }

  .wrap { position: relative; }

  select {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: 0;
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 28px 0 8px;
    font: inherit;
    appearance: none;
  }

  .arrow {
    pointer-events: none;
    position: absolute;
    right: 8px;
    top: 50%;
    translate: 0 -50%;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid currentColor;
    opacity: 0.8;
  }

  select:focus-visible { outline: none; box-shadow: var(--_ring); }
  select:disabled { opacity: 0.65; }
`;

const MIRRORED = ["disabled", "name"];

export class AwwSelect extends HTMLElement {
  static observedAttributes = MIRRORED;
  #observer = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, SELECT_STYLES]);
    shadow.innerHTML = `<div class="wrap"><select part="control"></select><span class="arrow" aria-hidden="true"></span></div>`;

    this.control = shadow.querySelector("select");
    this.control.addEventListener("change", () => {
      this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    });
  }

  connectedCallback() {
    this.#syncOptions();
    this.#observer = new MutationObserver(() => this.#syncOptions());
    this.#observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["selected", "disabled", "value"] });
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name, _prev, next) {
    if (next === null) {
      this.control.removeAttribute(name);
      return;
    }

    if (name === "disabled") {
      this.control.disabled = this.hasAttribute("disabled");
      return;
    }

    this.control.setAttribute(name, next);
  }

  #syncOptions() {
    const source = [...this.querySelectorAll("option")];
    this.control.textContent = "";

    for (const option of source) {
      const clone = document.createElement("option");
      clone.value = option.value;
      clone.textContent = option.textContent;
      clone.disabled = option.disabled;
      clone.selected = option.selected;
      this.control.append(clone);
    }
  }
}
