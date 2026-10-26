// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { dispatchComponentEvent } from "../core/component-utils.js";
import { deriveHostname, resolveNavigationInput, type NavigationDecision } from "../core/url.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const URL_PICKER_STYLES = css`
  :host {
    display: block;
    min-width: min(100%, 260px);
  }

  .picker {
    display: grid;
    gap: var(--awwbookmarklet-space-1, 4px);
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
    display: none;
    max-height: 240px;
    overflow: auto;
    border: var(--_surface-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-radius: var(--_surface-radius);
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
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-divider-color, #c3cad4);
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    padding: var(--awwbookmarklet-card-padding, 8px);
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

interface UrlSuggestion {
  type?: string;
  title?: string;
  label?: string;
  url?: string;
  description?: string;
}

type UrlPickerItem =
  | { type: "direct"; decision: NavigationDecision }
  | UrlSuggestion;

function isDirectItem(item: UrlPickerItem): item is { type: "direct"; decision: NavigationDecision } {
  return item.type === "direct" && "decision" in item;
}

export class AwwUrlPicker extends HTMLElement {
  static observedAttributes = ["value", "placeholder", "search-template", "open"];
  declare private readonly list: HTMLElement;
  declare private readonly input: HTMLInputElement;
  #suggestions: UrlSuggestion[] = [];
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
    this.input = (shadow.querySelector("input") as HTMLInputElement);
    this.list = (shadow.querySelector(".list") as HTMLElement);
    this.input.addEventListener("input", () => this.#onInput());
    this.input.addEventListener("focus", () => this.#openIfUseful());
    this.input.addEventListener("keydown", (event) => this.#onKeyDown(event));
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get value() { return this.input?.value || ""; }
  set value(nextValue) { this.setAttribute("value", String(nextValue ?? "")); }
  get suggestions() { return this.#suggestions; }
  set suggestions(value: unknown) {
    this.#suggestions = Array.isArray(value) ? value as UrlSuggestion[] : [];
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

  #decision(): NavigationDecision {
    return resolveNavigationInput(this.input.value, this.getAttribute("search-template") || undefined);
  }

  #onKeyDown(event: KeyboardEvent) {
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

  #visibleItems(): UrlPickerItem[] {
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

      if (isDirectItem(item)) {
        if (item.decision.kind === "navigate_url") {
          title.textContent = `Open ${item.decision.targetUrl}`;
          meta.textContent = deriveHostname(item.decision.targetUrl);
        } else if (item.decision.kind === "search") {
          title.textContent = `Search for "${item.decision.query}"`;
          meta.textContent = item.decision.targetUrl;
        }
      } else {
        title.textContent = String(item.title || item.label || item.url || "Untitled");
        meta.textContent = String(item.description || item.url || "");
      }

      button.append(title, meta);
      button.addEventListener("click", () => this.#apply(item));
      this.list.append(button);
    });
  }

  #apply(item: UrlPickerItem) {
    const decision: NavigationDecision = isDirectItem(item)
      ? item.decision
      : { kind: "navigate_url", input: item.url || "", targetUrl: item.url || "" };
    if (decision.kind === "blocked_protocol" || decision.kind === "ignore") return;
    this.value = decision.targetUrl || "";
    this.close();
    dispatchComponentEvent(this, "awwbookmarklet-url-picker-apply", { item, decision, source: this });
  }
}
