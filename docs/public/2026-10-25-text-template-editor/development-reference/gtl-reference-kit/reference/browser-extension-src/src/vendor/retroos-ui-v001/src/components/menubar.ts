// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { CommandRegistry } from "../core/commands.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";
import { copyPublicThemeContext } from "../core/theme.js";
import type { AwwMenuElement, AwwWindowElement } from "../types/public-elements.js";

const MENUBAR_STYLES = css`
  :host {
    display: block;
    pointer-events: auto;
    background: color-mix(in srgb, var(--awwbookmarklet-panel-bg, #f8fafc) 85%, #d8dee7 15%);
    padding: var(--awwbookmarklet-space-1, 4px);
  }

  #bar {
    display: flex;
    gap: var(--awwbookmarklet-space-1, 4px);
    align-items: center;
    min-height: 28px;
  }

  ::slotted([data-menu]) {
    height: 24px;
    border: var(--_control-border-width) solid transparent;
    background: transparent;
    font: inherit;
    padding-block: var(--awwbookmarklet-control-padding-y, 0);
    padding-inline: var(--awwbookmarklet-menu-item-padding-x, 8px);
    border-radius: var(--_control-radius);
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
  declare public commandRegistry: CommandRegistry;

  #triggers: HTMLElement[] = [];
  #menus = new Map<string, AwwMenuElement>();
  #wiredMenus = new WeakSet<AwwMenuElement>();
  #activeTrigger = -1;
  #openMenuName = "";
  #window: AwwWindowElement | null = null;

  constructor() {
    super();
    this.commandRegistry = new CommandRegistry();

    const shadow = this.attachShadow({ mode: "open" });
    adoptStyles(shadow, [BASE_COMPONENT_STYLES, MENUBAR_STYLES]);
    shadow.innerHTML = `<div id="bar" role="menubar" part="bar"><slot></slot></div>`;

    shadow.querySelector<HTMLSlotElement>("slot")!.addEventListener("slotchange", () => this.#refresh());
    this.addEventListener("keydown", this.#onKeyDown);
    this.addEventListener("click", this.#onClick);
  }

  connectedCallback() {
    this.#refresh();
    document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);

    this.#window = this.closest("awwbookmarklet-window");
    this.#window?.addEventListener("awwbookmarklet-window-system-menu", this.#onWindowSystemMenu);
  }

  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.#onDocumentPointerDown, true);
    this.#window?.removeEventListener("awwbookmarklet-window-system-menu", this.#onWindowSystemMenu);
    this.#window = null;
    this.closeAllMenus();
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
    const openMenus = [...this.#menus.entries()].filter(([, menu]) => menu.isConnected && menu.parentNode !== this);

    this.#triggers = children.filter((node): node is HTMLElement => node instanceof HTMLElement && node.hasAttribute("data-menu"));
    this.#menus = new Map(openMenus);

    for (const menu of children.filter((node): node is AwwMenuElement => node.tagName.toLowerCase() === "awwbookmarklet-menu")) {
      const name = menu.getAttribute("name") || "";
      if (name) {
        this.#menus.set(name, menu);
        this.#wireMenu(menu);
      }
    }

    this.#triggers.forEach((trigger, index) => {
      trigger.setAttribute("role", "menuitem");
      trigger.tabIndex = index === this.#activeTrigger ? 0 : -1;
    });

    if (this.#triggers.length && this.#activeTrigger === -1) this.#focusTrigger(0);
  }

  #openFromTrigger(trigger: HTMLElement | undefined, focusMenu = false) {
    if (!trigger) return;
    const menuName = trigger.getAttribute("data-menu");
    const menu = this.#menus.get(menuName || "");
    if (!menu) return;

    this.closeAllMenus();

    trigger.dataset.open = "true";
    const overlayRoot = this.closest("awwbookmarklet-window")?.closest("awwbookmarklet-desktop-root") ?? null;
    copyPublicThemeContext(trigger, menu);
    menu.portalTo(overlayRoot);
    menu.openAtViewportRect(trigger.getBoundingClientRect());
    this.#openMenuName = menuName || "";

    if (focusMenu) menu.focusFirst();
  }

  #focusTrigger(index: number) {
    if (!this.#triggers.length) return;

    this.#activeTrigger = (index + this.#triggers.length) % this.#triggers.length;
    this.#triggers.forEach((trigger, triggerIndex) => {
      trigger.tabIndex = triggerIndex === this.#activeTrigger ? 0 : -1;
    });

    this.#triggers[this.#activeTrigger]?.focus();
  }

  #moveTrigger(step: number) {
    this.#focusTrigger(this.#activeTrigger + step);
    if (this.#openMenuName) {
      const trigger = this.#triggers[this.#activeTrigger];
      this.#openFromTrigger(trigger, true);
    }
  }

  #onClick = (event: MouseEvent) => {
    const trigger = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-menu]") : null;
    if (!trigger || !this.contains(trigger)) return;

    const alreadyOpen = trigger.dataset.open === "true";
    if (alreadyOpen) {
      this.closeAllMenus();
      return;
    }

    this.#focusTrigger(this.#triggers.indexOf(trigger));
    this.#openFromTrigger(trigger, true);
  };

  #onKeyDown = (event: KeyboardEvent) => {
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

  #onDocumentPointerDown = (event: PointerEvent) => {
    const target = event.target;
    const insideMenu = target instanceof Node && [...this.#menus.values()].some((menu) => menu.contains(target));
    if (target instanceof Node && !this.contains(target) && !insideMenu) this.closeAllMenus();
  };

  #onRunCommand = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const commandId = event.detail?.commandId;
    if (!commandId) return;

    this.commandRegistry.run(commandId, {
      menubar: this,
      trigger: event.detail.source
    });
  };

  #onWindowSystemMenu = () => {
    this.openFirstMenu();
  };

  #wireMenu(menu: AwwMenuElement) {
    if (this.#wiredMenus.has(menu)) return;
    this.#wiredMenus.add(menu);
    menu.addEventListener("awwbookmarklet-menu-dismiss", this.#onDismissMenu);
    menu.addEventListener("awwbookmarklet-menu-select", this.#onDismissMenu);
    menu.addEventListener("awwbookmarklet-command", this.#onRunCommand);
  }
}
