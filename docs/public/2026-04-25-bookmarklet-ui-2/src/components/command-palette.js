import { dispatchComponentEvent } from "../core/component-utils.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const COMMAND_PALETTE_STYLES = css`
  :host {
    display: block;
    min-width: min(100%, 320px);
  }

  .palette {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_control-radius);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding-block: var(--awwbookmarklet-input-padding-y, var(--awwbookmarklet-control-padding-y, 0));
    padding-inline: var(--awwbookmarklet-input-padding-x, 8px);
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
    max-height: 280px;
    overflow: auto;
  }

  .command {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--awwbookmarklet-surface-gap, 8px);
    align-items: start;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    background: var(--awwbookmarklet-card-bg, #fbfcfe);
    padding: var(--awwbookmarklet-card-padding, 8px);
    text-align: left;
    color: var(--awwbookmarklet-input-fg, #111720);
    font: inherit;
  }

  .command[aria-selected="true"] {
    border-color: var(--awwbookmarklet-selection-bg, #1f5eae);
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
  }

  .command:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .label {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta,
  .shortcut {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.35;
  }

  .shortcut {
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    white-space: nowrap;
  }

  .empty {
    border: var(--_surface-border-width) dashed var(--awwbookmarklet-border-subtle, #9ba5b3);
    border-radius: var(--_surface-radius);
    color: var(--awwbookmarklet-text-muted, #586272);
    padding: var(--awwbookmarklet-space-3, 12px);
    text-align: center;
  }
`;

export class AwwCommandPalette extends HTMLElement {
  static observedAttributes = ["placeholder", "empty-text"];
  #commands = [];
  #filtered = [];
  #activeIndex = 0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, COMMAND_PALETTE_STYLES]);
    shadow.innerHTML = `
      <section class="palette" part="palette">
        <input part="input" type="search" autocomplete="off" spellcheck="false" aria-label="Filter commands" />
        <div class="list" part="list" role="listbox" aria-label="Commands"></div>
      </section>
    `;
    this.input = shadow.querySelector("input");
    this.list = shadow.querySelector(".list");
    this.input.addEventListener("input", () => this.#filter());
    this.input.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { this.#render(); }

  get commands() { return this.#commands; }
  set commands(value) {
    this.#commands = Array.isArray(value) ? value : [];
    this.#filter();
  }

  focusInput() {
    this.input?.focus();
  }

  #filter() {
    const query = this.input?.value.trim().toLowerCase() || "";
    this.#filtered = this.#commands.filter((command) => {
      if (!query) return true;
      return [command.label, command.group, command.shortcut, ...(command.keywords || [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    this.#activeIndex = Math.min(this.#activeIndex, Math.max(0, this.#filtered.length - 1));
    this.#renderList();
    dispatchComponentEvent(this, "awwbookmarklet-command-palette-filter", { query, count: this.#filtered.length });
  }

  #render() {
    if (!this.input) return;
    this.input.placeholder = this.getAttribute("placeholder") || "Type a command";
    this.#filter();
  }

  #renderList() {
    this.list.textContent = "";
    if (!this.#filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.setAttribute("part", "empty");
      empty.textContent = this.getAttribute("empty-text") || "No matching commands.";
      this.list.append(empty);
      return;
    }

    this.#filtered.forEach((command, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "command";
      button.setAttribute("part", "command");
      button.disabled = Boolean(command.disabled);
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", index === this.#activeIndex ? "true" : "false");
      button.innerHTML = `
        <span>
          <span class="label" part="label"></span>
          <span class="meta" part="meta"></span>
        </span>
        <span class="shortcut" part="shortcut"></span>
      `;
      button.querySelector(".label").textContent = String(command.label || command.id || "Untitled command");
      button.querySelector(".meta").textContent = [command.group, command.description].filter(Boolean).join(" - ");
      button.querySelector(".shortcut").textContent = String(command.shortcut || "");
      button.addEventListener("click", () => this.#execute(command));
      this.list.append(button);
    });
  }

  #onKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const count = this.#filtered.length;
      if (!count) return;
      this.#activeIndex = (this.#activeIndex + step + count) % count;
      this.#renderList();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = this.#filtered[this.#activeIndex];
      if (command) this.#execute(command);
    }
  }

  #execute(command) {
    if (command.disabled) return;
    dispatchComponentEvent(this, "awwbookmarklet-command-palette-execute", {
      commandId: command.id || "",
      command,
      source: this
    });
    if (typeof command.run === "function") command.run(command);
  }
}
