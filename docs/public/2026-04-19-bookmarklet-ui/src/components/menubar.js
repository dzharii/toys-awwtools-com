import { CommandRegistry } from "../core/commands.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";

const MENUBAR_STYLES = css`
  :host {
    display: block;
    pointer-events: auto;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 85%, #d8dee7 15%);
    padding: 2px;
  }

  #bar {
    display: flex;
    gap: 2px;
    align-items: center;
    min-height: 28px;
  }

  ::slotted([data-menu]) {
    height: 24px;
    border: 1px solid transparent;
    background: transparent;
    font: inherit;
    padding: 0 8px;
    border-radius: 0;
    color: inherit;
  }

  ::slotted([data-menu]:focus-visible),
  ::slotted([data-menu][data-open="true"]),
  ::slotted([data-menu]:hover) {
    outline: none;
    border-color: var(--awwbookmarklet-border-strong, #232a33);
    background: var(--awwbookmarklet-button-bg, #f1f4f8);
  }
`;

export class AwwMenubar extends HTMLElement {
  #triggers = [];
  #menus = new Map();
  #activeTrigger = -1;
  #openMenuName = "";

  constructor() {
    super();
    this.commandRegistry = new CommandRegistry();

    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MENUBAR_STYLES]);
    shadow.innerHTML = `<div id="bar" role="menubar" part="bar"><slot></slot></div>`;

    shadow.querySelector("slot").addEventListener("slotchange", () => this.#refresh());
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("click", this.#onClick);
    this.addEventListener("awwbookmarklet-menu-dismiss", this.#onDismissMenu);
    this.addEventListener("awwbookmarklet-menu-select", this.#onDismissMenu);
    this.addEventListener("awwbookmarklet-command", this.#onRunCommand);
  }

  connectedCallback() {
    this.#refresh();
    document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);

    this.closest("awwbookmarklet-window")?.addEventListener("awwbookmarklet-window-system-menu", () => this.openFirstMenu(), {
      passive: true
    });
  }

  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.#onDocumentPointerDown, true);
  }

  openFirstMenu() {
    if (!this.#triggers.length) return;
    this.#focusTrigger(0);
    this.#openFromTrigger(this.#triggers[0], true);
  }

  closeAllMenus() {
    for (const menu of this.#menus.values()) menu.close();
    for (const trigger of this.#triggers) delete trigger.dataset.open;
    this.#openMenuName = "";
  }

  #refresh() {
    const children = [...this.children];

    this.#triggers = children.filter((node) => node.hasAttribute("data-menu"));
    this.#menus.clear();

    for (const menu of children.filter((node) => node.tagName.toLowerCase() === "awwbookmarklet-menu")) {
      const name = menu.getAttribute("name") || "";
      if (name) this.#menus.set(name, menu);
    }

    this.#triggers.forEach((trigger, index) => {
      trigger.setAttribute("role", "menuitem");
      trigger.tabIndex = index === this.#activeTrigger ? 0 : -1;
    });

    if (this.#triggers.length && this.#activeTrigger === -1) this.#focusTrigger(0);
  }

  #openFromTrigger(trigger, focusMenu = false) {
    const menuName = trigger.getAttribute("data-menu");
    const menu = this.#menus.get(menuName);
    if (!menu) return;

    this.closeAllMenus();

    trigger.dataset.open = "true";
    menu.openAt(trigger.getBoundingClientRect());
    this.#openMenuName = menuName;

    if (focusMenu) menu.focusFirst();
  }

  #focusTrigger(index) {
    if (!this.#triggers.length) return;

    this.#activeTrigger = (index + this.#triggers.length) % this.#triggers.length;
    this.#triggers.forEach((trigger, triggerIndex) => {
      trigger.tabIndex = triggerIndex === this.#activeTrigger ? 0 : -1;
    });

    this.#triggers[this.#activeTrigger].focus();
  }

  #moveTrigger(step) {
    this.#focusTrigger(this.#activeTrigger + step);
    if (this.#openMenuName) {
      const trigger = this.#triggers[this.#activeTrigger];
      this.#openFromTrigger(trigger, true);
    }
  }

  #onClick = (event) => {
    const trigger = event.target.closest("[data-menu]");
    if (!trigger || !this.contains(trigger)) return;

    const alreadyOpen = trigger.dataset.open === "true";
    if (alreadyOpen) {
      this.closeAllMenus();
      return;
    }

    this.#focusTrigger(this.#triggers.indexOf(trigger));
    this.#openFromTrigger(trigger, true);
  };

  #onKeyDown = (event) => {
    if (!this.#triggers.length) return;

    if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
      event.preventDefault();
      this.#moveTrigger(event.key === "ArrowRight" ? 1 : -1);
      return;
    }

    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      this.#openFromTrigger(this.#triggers[this.#activeTrigger], true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.closeAllMenus();
    }
  };

  #onDismissMenu = () => {
    this.closeAllMenus();
    if (this.#activeTrigger >= 0) this.#triggers[this.#activeTrigger]?.focus();
  };

  #onDocumentPointerDown = (event) => {
    if (!this.contains(event.target)) this.closeAllMenus();
  };

  #onRunCommand = (event) => {
    const commandId = event.detail?.commandId;
    if (!commandId) return;

    this.commandRegistry.run(commandId, {
      menubar: this,
      trigger: event.detail.source
    });
  };
}
