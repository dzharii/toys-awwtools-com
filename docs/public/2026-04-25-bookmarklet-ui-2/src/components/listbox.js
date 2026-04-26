import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const LISTBOX_STYLES = css`
  :host { display: block; }

  #list {
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    min-height: 120px;
    max-height: 260px;
    overflow: auto;
    padding: var(--awwbookmarklet-space-1, 4px);
  }

  ::slotted([role="option"]) {
    display: block;
    padding-block: var(--awwbookmarklet-space-2, 6px);
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    border: var(--_control-border-width) solid transparent;
    border-radius: var(--_control-radius);
    user-select: none;
  }

  ::slotted([role="option"][data-selected="true"]) {
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
    border-color: var(--awwbookmarklet-border-strong, #232a33);
  }

  ::slotted([role="option"][aria-disabled="true"]) {
    opacity: 0.55;
  }
`;

let nextListboxId = 0;

function isEnabledOption(item) {
  return item.getAttribute("role") === "option" && item.getAttribute("aria-disabled") !== "true";
}

export class AwwListbox extends HTMLElement {
  #options = [];
  #selected = -1;
  #typeahead = "";
  #typeaheadTimer = 0;
  #idPrefix;

  constructor() {
    super();
    nextListboxId += 1;
    this.#idPrefix = `awwbookmarklet-listbox-${nextListboxId}`;
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, LISTBOX_STYLES]);
    shadow.innerHTML = `<div id="list" role="listbox" part="list" tabindex="0"><slot></slot></div>`;

    shadow.querySelector("#list").addEventListener("keydown", this.#onKeyDown);
    shadow.querySelector("#list").addEventListener("click", this.#onClick);
    shadow.querySelector("slot").addEventListener("slotchange", () => this.#refresh());
  }

  connectedCallback() { this.#refresh(); }

  #refresh() {
    this.#options = [...this.children].filter(isEnabledOption);
    if (!this.#options.length) {
      this.#selected = -1;
      this.shadowRoot.querySelector("#list").removeAttribute("aria-activedescendant");
      return;
    }

    this.#options.forEach((option, index) => {
      if (!option.id) option.id = `${this.#idPrefix}-option-${index}`;
    });

    this.#selected = this.#options.findIndex((item) => item.getAttribute("aria-selected") === "true");
    if (this.#selected < 0) this.#selected = 0;

    this.#applySelection(this.#selected, false);
  }

  #applySelection(index, emit = true) {
    if (!this.#options.length) return;

    this.#selected = (index + this.#options.length) % this.#options.length;

    this.#options.forEach((option, optionIndex) => {
      const selected = optionIndex === this.#selected;
      option.setAttribute("aria-selected", selected ? "true" : "false");
      option.dataset.selected = selected ? "true" : "false";
    });

    this.shadowRoot.querySelector("#list").setAttribute("aria-activedescendant", this.#options[this.#selected].id);

    if (emit) {
      const selectedOption = this.#options[this.#selected];
      this.dispatchEvent(new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: {
          index: this.#selected,
          value: selectedOption.getAttribute("data-value") ?? selectedOption.textContent?.trim() ?? ""
        }
      }));
    }
  }

  #onClick = (event) => {
    const target = event.target.closest("[role='option']");
    if (!target || target.getAttribute("aria-disabled") === "true") return;
    const index = this.#options.indexOf(target);
    if (index !== -1) this.#applySelection(index, true);
  };

  #onKeyDown = (event) => {
    if (!this.#options.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.#applySelection(this.#selected + 1, true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.#applySelection(this.#selected - 1, true);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.#applySelection(0, true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      this.#applySelection(this.#options.length - 1, true);
      return;
    }

    if (event.key.length === 1 && /\S/.test(event.key)) {
      this.#typeahead += event.key.toLowerCase();
      clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = setTimeout(() => {
        this.#typeahead = "";
      }, 450);

      const index = this.#options.findIndex((option) => option.textContent?.trim().toLowerCase().startsWith(this.#typeahead));
      if (index !== -1) this.#applySelection(index, true);
    }
  };
}
