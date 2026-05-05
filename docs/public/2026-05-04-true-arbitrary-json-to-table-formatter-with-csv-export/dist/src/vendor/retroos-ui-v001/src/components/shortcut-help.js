// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const SHORTCUT_HELP_STYLES = css`
  :host {
    display: block;
    min-width: 0;
  }

  .help {
    display: grid;
    gap: var(--awwbookmarklet-space-2, 8px);
  }

  .group {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .group-title {
    color: var(--awwbookmarklet-text-muted, #586272);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(88px, max-content) minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    min-width: 0;
    border-top: 1px solid var(--awwbookmarklet-divider-color, #c3cad4);
    padding-top: 5px;
  }

  kbd {
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-surface-inset-bg, #e7ebf1);
    padding: 2px 5px;
    font: inherit;
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    white-space: nowrap;
  }

  .description {
    min-width: 0;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

export class AwwShortcutHelp extends HTMLElement {
  static observedAttributes = ["empty-text"];
  #shortcuts = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, SHORTCUT_HELP_STYLES]);
    shadow.innerHTML = `<section class="help" part="help"></section>`;
    this.helpNode = shadow.querySelector(".help");
  }

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { this.#render(); }

  get shortcuts() { return this.#shortcuts; }
  set shortcuts(value) {
    this.#shortcuts = Array.isArray(value) ? value : [];
    this.#render();
  }

  #render() {
    if (!this.helpNode) return;
    this.helpNode.textContent = "";

    if (!this.#shortcuts.length) {
      const empty = document.createElement("div");
      empty.setAttribute("part", "empty");
      empty.textContent = this.getAttribute("empty-text") || "No shortcuts available.";
      this.helpNode.append(empty);
      return;
    }

    const groups = new Map();
    for (const item of this.#shortcuts) {
      const group = String(item.group || "General");
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(item);
    }

    for (const [group, items] of groups) {
      const section = document.createElement("section");
      section.className = "group";
      section.setAttribute("part", "group");
      const title = document.createElement("div");
      title.className = "group-title";
      title.setAttribute("part", "group-title");
      title.textContent = group;
      section.append(title);

      for (const item of items) {
        const row = document.createElement("div");
        row.className = "row";
        row.setAttribute("part", "row");
        const key = document.createElement("kbd");
        key.setAttribute("part", "shortcut");
        key.textContent = String(item.shortcut || "");
        const description = document.createElement("div");
        description.className = "description";
        description.setAttribute("part", "description");
        description.textContent = String(item.description || item.label || "");
        row.append(key, description);
        section.append(row);
      }

      this.helpNode.append(section);
    }
  }
}
