import { TAGS } from "../core/constants.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const TABS_STYLES = css`
  :host { display: block; border: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3); border-radius: var(--_surface-radius); background: var(--awwbookmarklet-panel-bg, #f8fafc); }

  #tablist {
    display: flex;
    gap: var(--awwbookmarklet-space-1, 4px);
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: var(--awwbookmarklet-space-1, 4px) var(--awwbookmarklet-space-1, 4px) 0;
    border-bottom: var(--_surface-border-width) solid var(--awwbookmarklet-border-subtle, #9ba5b3);
    scrollbar-gutter: stable;
  }

  #tablist button {
    min-height: 28px;
    border: var(--_control-border-width) solid var(--awwbookmarklet-border-strong, #232a33);
    border-bottom: 0;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 88%, #ced5df 12%);
    color: var(--awwbookmarklet-input-fg, #111720);
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-control-padding-x, 10px);
    font: inherit;
    font-weight: 400;
    border-radius: var(--_control-radius) var(--_control-radius) 0 0;
    white-space: nowrap;
  }

  #tablist button[aria-selected="true"] {
    background: var(--awwbookmarklet-window-bg, #ffffff);
    color: var(--awwbookmarklet-input-fg, #111720);
    font-weight: 700;
    border-color: var(--awwbookmarklet-border-strong, #4f5966);
    border-bottom-color: var(--awwbookmarklet-window-bg, #ffffff);
    box-shadow: inset 0 3px 0 var(--awwbookmarklet-selection-bg, #1f5eae);
    position: relative;
    top: 1px;
  }

  #tablist button:focus-visible { outline: none; box-shadow: var(--_ring); }
  #tablist button[aria-selected="true"]:focus-visible {
    box-shadow: inset 0 3px 0 var(--awwbookmarklet-selection-bg, #1f5eae), var(--_ring);
  }
  #panels { padding: var(--awwbookmarklet-surface-padding, var(--awwbookmarklet-space-2, 8px)); }
`;

const TAB_PANEL_STYLES = css`
  :host { display: block; }
`;

let nextTabsId = 0;

export class AwwTabPanel extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TAB_PANEL_STYLES]);
    shadow.innerHTML = `<slot></slot>`;
  }
}

export class AwwTabs extends HTMLElement {
  #tabs = [];
  #panels = [];
  #selected = 0;
  #observer = null;
  #internalUpdate = false;
  #idPrefix;

  constructor() {
    super();
    nextTabsId += 1;
    this.#idPrefix = `awwbookmarklet-tabs-${nextTabsId}`;
    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, TABS_STYLES]);
    shadow.innerHTML = `<div id="tablist" role="tablist" part="tablist"></div><div id="panels" part="panels"><slot></slot></div>`;

    shadow.querySelector("#tablist").addEventListener("keydown", this.#onKeyDown);
    shadow.querySelector("#tablist").addEventListener("click", this.#onClick);
  }

  connectedCallback() {
    this.#refresh();
    this.#observer = new MutationObserver(() => {
      if (!this.#internalUpdate) this.#refresh();
    });
    this.#observer.observe(this, { childList: true, attributes: true, subtree: true, attributeFilter: ["label", "selected"] });
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #refresh() {
    this.#panels = [...this.children].filter((child) => child.tagName.toLowerCase() === TAGS.tabPanel);
    if (!this.#panels.length) {
      this.#tabs = [];
      this.shadowRoot.querySelector("#tablist").textContent = "";
      return;
    }

    const selectedIndex = this.#panels.findIndex((panel) => panel.hasAttribute("selected"));
    this.#selected = selectedIndex >= 0 ? selectedIndex : 0;

    const tablist = this.shadowRoot.querySelector("#tablist");
    tablist.textContent = "";

    this.#tabs = this.#panels.map((panel, index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${this.id || this.#idPrefix}-tab-${index}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `${this.id || this.#idPrefix}-panel-${index}`);
      tab.textContent = panel.getAttribute("label") || `Tab ${index + 1}`;
      tab.dataset.index = String(index);
      tab.tabIndex = index === this.#selected ? 0 : -1;
      tab.setAttribute("aria-selected", index === this.#selected ? "true" : "false");
      tablist.append(tab);
      return tab;
    });

    this.#applySelection(this.#selected, false);
  }

  #applySelection(index, focusTab = true) {
    if (!this.#tabs.length) return;

    this.#selected = (index + this.#tabs.length) % this.#tabs.length;

    this.#tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === this.#selected;
      tab.tabIndex = selected ? 0 : -1;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      if (focusTab && selected) tab.focus();
    });

    this.#internalUpdate = true;
    try {
      this.#panels.forEach((panel, panelIndex) => {
        panel.toggleAttribute("selected", panelIndex === this.#selected);
        panel.hidden = panelIndex !== this.#selected;
        panel.id = `${this.id || this.#idPrefix}-panel-${panelIndex}`;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", `${this.id || this.#idPrefix}-tab-${panelIndex}`);
      });
    } finally {
      queueMicrotask(() => {
        this.#internalUpdate = false;
      });
    }
  }

  #onClick = (event) => {
    const tab = event.target.closest("button[role='tab']");
    if (!tab) return;
    this.#applySelection(Number(tab.dataset.index), true);
  };

  #onKeyDown = (event) => {
    if (!this.#tabs.length) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.#applySelection(this.#selected + 1, true);
      return;
    }

    if (event.key === "ArrowLeft") {
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
      this.#applySelection(this.#tabs.length - 1, true);
    }
  };
}
