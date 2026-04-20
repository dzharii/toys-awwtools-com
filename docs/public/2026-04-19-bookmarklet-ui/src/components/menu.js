import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const MENU_STYLES = css`
  :host {
    position: fixed;
    display: none;
    min-width: 200px;
    pointer-events: auto;
    background: var(--awwbookmarklet-menu-bg, #f8fbff);
    border: 1px solid var(--awwbookmarklet-border-strong, #232a33);
    box-shadow: var(--awwbookmarklet-shadow-depth, 0 10px 20px rgba(0, 0, 0, 0.18));
    padding: 4px;
    z-index: 999999;
  }

  :host([open]) { display: block; }

  #panel {
    display: grid;
    gap: 2px;
    max-height: min(60vh, 420px);
    overflow: auto;
  }

  ::slotted([data-separator]),
  ::slotted([role="separator"]) {
    display: block;
    border-top: 1px solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    margin: 4px 2px;
    padding: 0;
    min-height: 0;
    height: 0;
  }

  ::slotted(button),
  ::slotted([role="menuitem"]) {
    height: 29px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--awwbookmarklet-menu-fg, #0e1621);
    text-align: left;
    padding: 0 8px;
    font: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-radius: 0;
  }

  ::slotted(button:hover),
  ::slotted([role="menuitem"]:hover),
  ::slotted(button[data-highlighted="true"]),
  ::slotted([role="menuitem"][data-highlighted="true"]) {
    border-color: var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-selection-bg, #1f5eae);
    color: var(--awwbookmarklet-selection-fg, #f2f8ff);
  }

  ::slotted([disabled]),
  ::slotted([aria-disabled="true"]) {
    opacity: 0.5;
    pointer-events: none;
  }
`;

function isSeparator(node) {
  return node.hasAttribute("data-separator") || node.getAttribute("role") === "separator";
}

function isMenuItem(node) {
  return !isSeparator(node) && !node.hasAttribute("disabled") && node.getAttribute("aria-disabled") !== "true";
}

export class AwwMenu extends HTMLElement {
  #activeIndex = -1;
  #typeahead = "";
  #typeaheadTimer = 0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MENU_STYLES]);
    shadow.innerHTML = `<div id="panel" part="panel" role="menu"><slot></slot></div>`;

    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("click", this.#onClick);
  }

  connectedCallback() {
    this.hidden = false;
    this.setAttribute("aria-hidden", this.hasAttribute("open") ? "false" : "true");
    this.shadowRoot.querySelector("slot").addEventListener("slotchange", () => this.#resetItems());
    this.#resetItems();
  }

  getItems() {
    return [...this.children].filter(isMenuItem);
  }

  openAt(anchorRect) {
    const width = Math.max(200, this.offsetWidth || 220);
    const viewportW = window.visualViewport?.width ?? window.innerWidth;
    const viewportH = window.visualViewport?.height ?? window.innerHeight;
    const menuHeight = this.offsetHeight || Math.min(viewportH * 0.5, 240);

    let left = anchorRect.left;
    let top = anchorRect.bottom + 2;

    if (left + width > viewportW - 6) left = viewportW - width - 6;
    if (top + menuHeight > viewportH - 6) top = Math.max(6, anchorRect.top - menuHeight - 2);

    this.style.left = `${Math.max(6, left)}px`;
    this.style.top = `${Math.max(6, top)}px`;

    this.setAttribute("open", "");
    this.setAttribute("aria-hidden", "false");
    this.#activeIndex = -1;
  }

  close() {
    this.removeAttribute("open");
    this.setAttribute("aria-hidden", "true");
    this.#highlight(-1);
  }

  focusFirst() {
    const items = this.getItems();
    if (items.length === 0) return;
    this.#highlight(0);
    items[0].focus();
  }

  #resetItems() {
    for (const node of this.children) {
      if (isSeparator(node)) continue;
      if (!node.hasAttribute("role")) node.setAttribute("role", "menuitem");
      node.tabIndex = -1;
    }
  }

  #onClick = (event) => {
    const target = event.target.closest("[role='menuitem']");
    if (!target || target.hasAttribute("disabled")) return;

    const command = target.getAttribute("data-command") || "";
    if (command) {
      this.dispatchEvent(new CustomEvent("awwbookmarklet-command", {
        bubbles: true,
        composed: true,
        detail: { commandId: command, source: target }
      }));
    }

    this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-select", { bubbles: true, composed: true }));
  };

  #onKeyDown = (event) => {
    const items = this.getItems();
    if (!items.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (this.#activeIndex + 1 + items.length) % items.length;
      this.#highlight(next);
      items[next].focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = (this.#activeIndex - 1 + items.length) % items.length;
      this.#highlight(next);
      items[next].focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.#highlight(0);
      items[0].focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const last = items.length - 1;
      this.#highlight(last);
      items[last].focus();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent("awwbookmarklet-menu-dismiss", { bubbles: true, composed: true }));
      return;
    }

    if (event.key.length === 1 && /\S/.test(event.key)) {
      this.#typeahead += event.key.toLowerCase();
      clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = setTimeout(() => {
        this.#typeahead = "";
      }, 450);

      const index = items.findIndex((item) => item.textContent.trim().toLowerCase().startsWith(this.#typeahead));
      if (index !== -1) {
        this.#highlight(index);
        items[index].focus();
      }
    }

    if (event.key === "Enter" || event.key === " ") {
      const target = items[this.#activeIndex];
      if (!target) return;
      event.preventDefault();
      target.click();
    }
  };

  #highlight(index) {
    const items = this.getItems();
    this.#activeIndex = index;
    items.forEach((item, itemIndex) => {
      if (itemIndex === index) item.dataset.highlighted = "true";
      else delete item.dataset.highlighted;
    });
  }
}
