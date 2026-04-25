import { dispatchComponentEvent } from "../core/component-utils.js";
import { deriveHostname, resolveNavigationInput } from "../core/url.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const URL_PICKER_STYLES = css`
  :host {
    display: block;
    min-width: min(100%, 260px);
  }

  .picker {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  input {
    width: 100%;
    min-height: var(--awwbookmarklet-size-control-h, 30px);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-input-bg, #fff);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding: 0 8px;
    font: inherit;
  }

  input:focus-visible {
    outline: none;
    box-shadow: var(--_ring);
  }

  .list {
    display: none;
    max-height: 240px;
    overflow: auto;
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-menu-bg, #f8fbff);
  }

  :host([open]) .list {
    display: grid;
  }

  .option {
    display: grid;
    gap: 2px;
    min-width: 0;
    border: 0;
    border-bottom: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    padding: 7px 8px;
    text-align: left;
    font: inherit;
  }

  .option[aria-selected="true"] {
    background: var(--awwbookmarklet-card-selected-bg, #e8f1ff);
  }

  .title {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

export class AwwUrlPicker extends HTMLElement {
  static observedAttributes = ["value", "placeholder", "search-template", "open"];
  #suggestions = [];
  #activeIndex = 0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, URL_PICKER_STYLES]);
    shadow.innerHTML = `
      <section class="picker" part="picker">
        <input part="input" type="text" autocomplete="off" spellcheck="false" aria-label="URL or search query" />
        <div class="list" part="list" role="listbox"></div>
      </section>
    `;
    this.input = shadow.querySelector("input");
    this.list = shadow.querySelector(".list");
    this.input.addEventListener("input", () => this.#onInput());
    this.input.addEventListener("focus", () => this.#openIfUseful());
    this.input.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get value() { return this.input?.value || ""; }
  set value(nextValue) { this.setAttribute("value", String(nextValue ?? "")); }
  get suggestions() { return this.#suggestions; }
  set suggestions(value) {
    this.#suggestions = Array.isArray(value) ? value : [];
    this.#renderList();
  }

  close() {
    this.removeAttribute("open");
  }

  #sync() {
    if (!this.input) return;
    const value = this.getAttribute("value") || "";
    if (this.input.value !== value) this.input.value = value;
    this.input.placeholder = this.getAttribute("placeholder") || "Type URL or search query";
    this.#renderList();
  }

  #onInput() {
    this.setAttribute("value", this.input.value);
    this.#activeIndex = 0;
    this.#openIfUseful();
    dispatchComponentEvent(this, "awwbookmarklet-url-picker-query", {
      query: this.input.value,
      decision: this.#decision()
    });
  }

  #openIfUseful() {
    if (this.#suggestions.length || this.input.value.trim()) this.setAttribute("open", "");
  }

  #decision() {
    return resolveNavigationInput(this.input.value, this.getAttribute("search-template") || undefined);
  }

  #onKeyDown(event) {
    if (event.key === "Escape") {
      this.close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const count = this.#visibleItems().length;
      if (!count) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      this.#activeIndex = (this.#activeIndex + step + count) % count;
      this.setAttribute("open", "");
      this.#renderList();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = this.#visibleItems()[this.#activeIndex];
      if (item) this.#apply(item);
      else this.#apply({ type: "direct", decision: this.#decision() });
    }
  }

  #visibleItems() {
    const decision = this.#decision();
    const direct = decision.kind === "ignore" || decision.kind === "blocked_protocol" ? [] : [{ type: "direct", decision }];
    return [...direct, ...this.#suggestions];
  }

  #renderList() {
    if (!this.list) return;
    this.list.textContent = "";
    const items = this.#visibleItems();
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.setAttribute("part", "option");
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", index === this.#activeIndex ? "true" : "false");
      const title = document.createElement("span");
      title.className = "title";
      title.setAttribute("part", "title");
      const meta = document.createElement("span");
      meta.className = "meta";
      meta.setAttribute("part", "meta");

      if (item.type === "direct") {
        title.textContent = item.decision.kind === "navigate_url" ? `Open ${item.decision.targetUrl}` : `Search for "${item.decision.query}"`;
        meta.textContent = item.decision.kind === "navigate_url" ? deriveHostname(item.decision.targetUrl) : item.decision.targetUrl;
      } else {
        title.textContent = String(item.title || item.label || item.url || "Untitled");
        meta.textContent = String(item.description || item.url || "");
      }

      button.append(title, meta);
      button.addEventListener("click", () => this.#apply(item));
      this.list.append(button);
    });
  }

  #apply(item) {
    const decision = item.type === "direct"
      ? item.decision
      : { kind: "navigate_url", input: item.url || "", targetUrl: item.url || "" };
    if (decision.kind === "blocked_protocol" || decision.kind === "ignore") return;
    this.value = decision.targetUrl || "";
    this.close();
    dispatchComponentEvent(this, "awwbookmarklet-url-picker-apply", { item, decision, source: this });
  }
}
