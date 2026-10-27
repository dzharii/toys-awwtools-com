import { button, el } from "../dom";
import {
  clampRect,
  decodeLayout,
  defaultLayout,
  defaults,
  dockAllocation,
  initialRect,
  initialFieldRect,
  layoutKey,
  panelIds,
  panelTitles,
} from "./layout";
import type { LayoutDocument, PanelId, Placement, Rect, WorkspaceContext } from "./layout";

interface Panel {
  host: HTMLElement;
  grip: HTMLButtonElement;
  body: HTMLElement;
  menu: HTMLElement;
  handles: HTMLElement[];
  focus?: HTMLElement;
  returnFocus?: HTMLElement;
}
interface Manipulation {
  id: PanelId;
  pointer: number;
  target: HTMLElement;
  x: number;
  y: number;
  rect: Rect;
  width: number;
  kind: "move" | "resize" | "dock";
  axis: string;
  moved: boolean;
}
export class PanelManager {
  private layout: LayoutDocument = defaultLayout();
  private context: WorkspaceContext = "document";
  private layer = el("div", "panel-layer");
  private panels = new Map<PanelId, Panel>();
  private tabs = { left: el("div", "dock-tabs"), right: el("div", "dock-tabs") };
  private restore = el("div", "panel-restores");
  private menu = el("div", "panels-menu");
  readonly trigger: HTMLButtonElement;
  private controller = new AbortController();
  private manipulation?: Manipulation;
  private forced = new Set<PanelId>();
  private initiallyPlaced = new Set<string>();
  private stack = new Map<PanelId, number>();
  private top = 10;
  private lastPersisted = "";
  private failed = false;
  private tabKey = "";
  private restoreKey = "";
  private fieldActive = false;
  error = "";
  onError: (message: string) => void = () => {};

  constructor(
    private root: HTMLElement,
    private main: HTMLElement,
    bodies: Record<PanelId, HTMLElement>,
  ) {
    try {
      const raw = localStorage.getItem(layoutKey);
      if (raw) this.layout = decodeLayout(JSON.parse(raw));
      this.lastPersisted = JSON.stringify(this.layout);
    } catch {
      this.failed = true;
      this.error =
        "Panel layout could not be read. Default layout is in use for this session; retry layout storage or reset the layout to save a recovered arrangement. Browser data was not cleared.";
    }
    const signal = this.controller.signal;
    this.trigger = button("Panels", () => {}, "secondary", "guided-panels-main-button-open");
    this.menu.popover = "auto";
    this.menu.dataset.testid = "guided-panels-main-menu-root";
    this.trigger.popoverTargetElement = this.menu;
    this.trigger.addEventListener("click", () => this.renderMenu(), { signal });
    for (const id of panelIds) this.createPanel(id, bodies[id]);
    for (const edge of ["left", "right"] as const) {
      this.tabs[edge].dataset.edge = edge;
      this.tabs[edge].setAttribute("role", "tablist");
      this.tabs[edge].setAttribute("aria-label", `${edge} dock panels`);
      this.layer.append(this.tabs[edge]);
    }
    this.layer.append(this.restore, this.menu);
    root.append(this.layer);
    window.addEventListener("resize", () => this.render(), { signal });
    visualViewport?.addEventListener("resize", () => this.render(), { signal });
    visualViewport?.addEventListener("scroll", () => this.render(), { signal });
    window.addEventListener("blur", () => this.finish(), { signal });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) this.finish();
      },
      { signal },
    );
    window.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          document.querySelector("dialog[open], :popover-open")
        )
          return;
        const open = [...this.panels]
          .sort(([left], [right]) => (this.stack.get(right) ?? 0) - (this.stack.get(left) ?? 0))
          .find(
            ([id, panel]) =>
              !panel.host.hidden &&
              panel.host.dataset.effective === "overlay" &&
              this.layout.workspaces[this.context].panels[id].visibility === "expanded",
          );
        if (open) {
          event.preventDefault();
          if (open[0] === "documents" || open[0] === "history") this.dismissNavigation();
          else this.change(open[0], "collapse");
          (open[1].returnFocus?.isConnected ? open[1].returnFocus : this.trigger).focus({
            preventScroll: true,
          });
        }
      },
      { signal },
    );
    this.render();
  }
  dismissNavigation(): void {
    this.forced.delete("documents");
    this.forced.delete("history");
    this.render();
  }
  dispose(): void {
    this.finish();
    this.controller.abort();
    this.layer.remove();
  }
  setContext(context: WorkspaceContext): void {
    if (context === this.context) return;
    this.finish();
    this.context = context;
    this.fieldActive = false;
    this.updateAutomaticFieldGeometry();
    this.forced.clear();
    this.tabKey = "";
    this.restoreKey = "";
    this.render();
  }
  private applicable(): PanelId[] {
    return [this.context === "document" ? "documents" : "history", "field", "issues", "settings"];
  }
  private bounds(): Rect {
    const viewport = visualViewport;
    const x = (viewport?.offsetLeft ?? 0) + 8;
    const toolbarBottom = this.main.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 64;
    const y =
      (viewport?.offsetTop ?? 0) +
      Math.min(toolbarBottom + 8, (viewport?.height ?? innerHeight) / 3);
    return {
      x,
      y,
      width: Math.max(1, (viewport?.width ?? innerWidth) - 16),
      height: Math.max(
        44,
        (viewport?.height ?? innerHeight) - (y - (viewport?.offsetTop ?? 0)) - 8,
      ),
    };
  }
  open(id: PanelId, anchor?: DOMRect, focus = false): void {
    const state = this.layout.workspaces[this.context].panels[id];
    const key = `${this.context}:${id}`;
    if (!state.userGeometry && !this.initiallyPlaced.has(key)) {
      state.rect =
        id === "field"
          ? initialFieldRect(this.fieldActive, anchor, this.bounds())
          : initialRect(anchor, state.rect, this.bounds());
      this.initiallyPlaced.add(key);
    }
    if (id === "documents" || id === "history") this.forced.add(id);
    const active = document.activeElement;
    if (active instanceof HTMLElement && !this.layer.contains(active))
      this.panels.get(id)!.returnFocus = active;
    this.change(id, "restore");
    if (focus) {
      const panel = this.panels.get(id)!;
      const target = panel.focus?.isConnected
        ? panel.focus
        : panel.grip.disabled
          ? (panel.body.querySelector<HTMLElement>(
              "button:not(:disabled),input:not(:disabled),select:not(:disabled)",
            ) ?? panel.body)
          : panel.grip;
      target.focus({ preventScroll: true });
    }
  }
  setFieldContext(active: boolean): void {
    if (this.fieldActive === active) return;
    this.fieldActive = active;
    this.updateAutomaticFieldGeometry();
    this.render();
  }
  private updateAutomaticFieldGeometry(): void {
    const state = this.layout.workspaces[this.context].panels.field;
    if (!state.userGeometry && state.placement === "floating") {
      state.rect = initialFieldRect(this.fieldActive, undefined, this.bounds());
      this.initiallyPlaced.delete(`${this.context}:field`);
    }
  }
  isExpanded(id: PanelId): boolean {
    return (
      !this.panels.get(id)!.host.hidden &&
      this.layout.workspaces[this.context].panels[id].visibility === "expanded"
    );
  }
  reset(): void {
    const returnFocus = this.layer.contains(document.activeElement);
    this.finish();
    this.layout.workspaces[this.context] = defaults(this.context);
    this.updateAutomaticFieldGeometry();
    this.forced.clear();
    this.initiallyPlaced.clear();
    const retry = this.failed;
    this.failed = false;
    this.render();
    this.persist(retry);
    if (returnFocus) this.trigger.focus({ preventScroll: true });
  }
  retry(): void {
    this.failed = false;
    this.persist(true);
  }
  private createPanel(id: PanelId, content: HTMLElement): void {
    const host = el("section", "panel-host");
    host.dataset.testid = `guided-panels-${id}-panel-root`;
    host.dataset.panelId = id;
    host.id = `workspace-panel-${id}`;
    host.setAttribute("aria-label", panelTitles[id]);
    const grip = button(panelTitles[id], () => {}, "panel-grip");
    grip.dataset.testid = `guided-panels-${id}-button-move`;
    grip.setAttribute("aria-label", `Move ${panelTitles[id]}`);
    grip.title = "Arrow keys move; Alt+arrow keys resize. Hold Shift for larger steps.";
    const body = el("div", "panel-body", content);
    body.tabIndex = 0;
    body.setAttribute("role", "region");
    body.setAttribute("aria-label", `${panelTitles[id]} content`);
    const menu = el("div", "panel-commands");
    menu.popover = "auto";
    menu.dataset.testid = `guided-panels-${id}-menu-commands`;
    const commands = button(
      "Actions",
      () => {
        this.renderCommands(id);
        const rect = commands.getBoundingClientRect();
        menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - 230))}px`;
        menu.style.top = `${Math.min(rect.bottom + 5, innerHeight - 240)}px`;
      },
      "panel-action",
      `guided-panels-${id}-button-actions`,
    );
    commands.popoverTargetElement = menu;
    commands.setAttribute("aria-label", `${panelTitles[id]} actions`);
    const collapse = button(
      "−",
      () => {
        const state = this.layout.workspaces[this.context].panels[id];
        if (state.visibility === "collapsed") this.open(id, undefined, true);
        else this.change(id, "collapse");
      },
      "panel-action",
      `guided-panels-${id}-button-collapse`,
    );
    const close = button(
      "×",
      () => this.change(id, "close"),
      "panel-action",
      `guided-panels-${id}-button-close`,
    );
    close.setAttribute("aria-label", `Close ${panelTitles[id]}`);
    close.title = `Close ${panelTitles[id]}`;
    const header = el("div", "panel-titlebar", grip, collapse, commands, close);
    const handles = ["e", "s", "se", "dock"].map((axis) => {
      const handle = el("div", `panel-resize panel-resize-${axis}`);
      handle.dataset.testid = `guided-panels-${id}-handle-${axis}`;
      handle.setAttribute("aria-hidden", "true");
      handle.addEventListener(
        "pointerdown",
        (event) => this.start(id, event, axis === "dock" ? "dock" : "resize", axis),
        { signal: this.controller.signal },
      );
      return handle;
    });
    host.append(header, body, menu, ...handles);
    this.panels.set(id, { host, grip, body, menu, handles });
    this.layer.append(host);
    const signal = this.controller.signal;
    host.addEventListener("pointerdown", () => this.raise(id), { signal });
    body.addEventListener(
      "focusin",
      () => {
        let focused = document.activeElement;
        while (focused?.shadowRoot?.activeElement) focused = focused.shadowRoot.activeElement;
        if (focused instanceof HTMLElement) this.panels.get(id)!.focus = focused;
        this.raise(id);
      },
      { signal },
    );
    grip.addEventListener("pointerdown", (event) => this.start(id, event, "move", ""), { signal });
    grip.addEventListener(
      "keydown",
      (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const amount = event.shiftKey ? 30 : 10;
        this.step(id, event.key.slice(5).toLowerCase(), amount, event.altKey);
      },
      { signal },
    );
  }
  private raise(id: PanelId): void {
    this.stack.set(id, ++this.top);
    this.panels.get(id)!.host.style.zIndex = String(this.top);
  }
  private start(id: PanelId, event: PointerEvent, kind: Manipulation["kind"], axis: string): void {
    if (!event.isPrimary || event.button !== 0 || this.manipulation) return;
    const state = this.layout.workspaces[this.context].panels[id];
    if (kind === "move" && state.placement !== "floating") return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    const current = this.panels.get(id)!.host.getBoundingClientRect();
    const rect = { x: current.x, y: current.y, width: current.width, height: current.height };
    this.manipulation = {
      id,
      kind,
      axis,
      pointer: event.pointerId,
      target,
      x: event.clientX,
      y: event.clientY,
      rect,
      width: rect.width,
      moved: false,
    };
    target.setPointerCapture(event.pointerId);
    target.addEventListener("pointermove", this.move);
    target.addEventListener("pointerup", this.end);
    target.addEventListener("pointercancel", this.end);
    target.addEventListener("lostpointercapture", this.end);
  }
  private move = (event: PointerEvent): void => {
    const drag = this.manipulation;
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    const state = this.layout.workspaces[this.context].panels[drag.id];
    if (drag.kind === "dock") {
      this.setDockWidth(drag.id, drag.width + (state.placement === "right" ? -dx : dx));
    } else {
      const rect = { ...drag.rect };
      if (drag.kind === "move") {
        rect.x += dx;
        rect.y += dy;
      } else {
        if (drag.axis.includes("e")) rect.width += dx;
        if (drag.axis.includes("s")) rect.height += dy;
      }
      const clamped = clampRect(rect, this.bounds(), state.visibility === "collapsed");
      const next =
        state.visibility === "collapsed" ? { ...state.rect, x: clamped.x, y: clamped.y } : clamped;
      if (JSON.stringify(next) !== JSON.stringify(state.rect)) {
        state.rect = next;
        state.userGeometry = true;
      }
    }
    this.render(false);
  };
  private end = (): void => this.finish();
  private setDockWidth(id: PanelId, width: number): void {
    const workspace = this.layout.workspaces[this.context];
    const placement = workspace.panels[id].placement;
    for (const member of this.applicable()) {
      const state = workspace.panels[member];
      const fitted = Math.max(220, Math.min(700, width));
      if (
        state.placement === placement &&
        state.visibility === "expanded" &&
        state.dockWidth !== fitted
      ) {
        state.dockWidth = fitted;
        state.userGeometry = true;
      }
    }
  }
  private finish(): void {
    const drag = this.manipulation;
    if (!drag) return;
    this.manipulation = undefined;
    drag.target.removeEventListener("pointermove", this.move);
    drag.target.removeEventListener("pointerup", this.end);
    drag.target.removeEventListener("pointercancel", this.end);
    drag.target.removeEventListener("lostpointercapture", this.end);
    if (drag.target.hasPointerCapture(drag.pointer))
      drag.target.releasePointerCapture(drag.pointer);
    if (drag.moved) this.settled();
  }
  private step(id: PanelId, direction: string, amount: number, resize = false): void {
    const state = this.layout.workspaces[this.context].panels[id];
    if (state.placement !== "floating") return;
    const current = this.panels.get(id)!.host.getBoundingClientRect();
    const rect: Rect = { x: current.x, y: current.y, width: current.width, height: current.height };
    if (resize) {
      if (direction === "left") rect.width -= amount;
      if (direction === "right") rect.width += amount;
      if (direction === "up") rect.height -= amount;
      if (direction === "down") rect.height += amount;
    } else {
      if (direction === "left") rect.x -= amount;
      if (direction === "right") rect.x += amount;
      if (direction === "up") rect.y -= amount;
      if (direction === "down") rect.y += amount;
    }
    const fitted = clampRect(rect, this.bounds(), state.visibility === "collapsed");
    const next =
      state.visibility === "collapsed" ? { ...state.rect, x: fitted.x, y: fitted.y } : fitted;
    if (JSON.stringify(next) !== JSON.stringify(state.rect)) {
      state.rect = next;
      state.userGeometry = true;
    }
    this.settled();
  }
  private change(id: PanelId, action: string, fromPanelMenu = false): void {
    const panel = this.panels.get(id)!;
    const hadFocus = fromPanelMenu || panel.host.contains(document.activeElement);
    const workspace = this.layout.workspaces[this.context];
    const state = workspace.panels[id];
    if (action === "collapse" || action === "close") {
      state.visibility = action === "close" ? "closed" : "collapsed";
      this.forced.delete(id);
    } else if (action === "restore") {
      state.visibility = "expanded";
      if (state.placement !== "floating") workspace.active[state.placement] = id;
    } else if (["floating", "left", "right"].includes(action)) {
      state.placement = action as Placement;
      state.visibility = "expanded";
      if (state.placement !== "floating") workspace.active[state.placement] = id;
    } else if (action === "reset") {
      const visibility = state.visibility;
      workspace.panels[id] = { ...defaults(this.context).panels[id], visibility };
      this.initiallyPlaced.delete(`${this.context}:${id}`);
    } else if (action === "center") {
      const bounds = this.bounds();
      const next = clampRect(
        {
          ...state.rect,
          x: bounds.x + (bounds.width - state.rect.width) / 2,
          y: bounds.y + (bounds.height - state.rect.height) / 2,
        },
        bounds,
      );
      if (JSON.stringify(next) !== JSON.stringify(state.rect)) {
        state.rect = next;
        state.userGeometry = true;
      }
    }
    this.raise(id);
    this.settled();
    if (hadFocus && (action === "collapse" || action === "close")) {
      if (!panel.host.hidden) panel.grip.focus({ preventScroll: true });
      else
        (panel.returnFocus?.isConnected ? panel.returnFocus : this.trigger).focus({
          preventScroll: true,
        });
    } else if (hadFocus && ["floating", "left", "right", "restore"].includes(action)) {
      panel.focus?.focus({ preventScroll: true });
    }
  }
  private settled(): void {
    this.render();
    this.persist();
  }
  private persist(force = false): void {
    const value = JSON.stringify(this.layout);
    if (!force && (this.failed || value === this.lastPersisted)) return;
    try {
      localStorage.setItem(layoutKey, value);
      this.lastPersisted = value;
      this.failed = false;
      this.error = "";
      this.onError("");
    } catch {
      const message =
        "Panel layout is usable for this session but could not be saved. Retry layout storage or reset the layout.";
      this.failed = true;
      if (this.error !== message) {
        this.error = message;
        this.onError(message);
      }
    }
  }
  private renderMenu(): void {
    this.menu.replaceChildren(
      ...this.applicable().map((id) => {
        const state = this.layout.workspaces[this.context].panels[id];
        const panel = this.panels.get(id)!;
        const visibility = state.visibility === "closed" ? "closed" : panel.host.dataset.visibility;
        return button(
          `${panelTitles[id]} — ${visibility}, ${state.placement}`,
          () => {
            this.menu.hidePopover();
            this.open(id, undefined, true);
          },
          "",
          `guided-panels-${id}-button-open`,
        );
      }),
      button(
        "Reset workspace layout",
        () => {
          this.menu.hidePopover();
          this.reset();
        },
        "",
        "guided-panels-main-button-reset",
      ),
      button("Retry layout storage", () => this.retry(), "", "guided-panels-main-button-retry"),
    );
  }
  private renderCommands(id: PanelId): void {
    const panel = this.panels.get(id)!;
    const state = this.layout.workspaces[this.context].panels[id];
    const desktop = (visualViewport?.width ?? innerWidth) >= 900;
    const commands: [string, string][] = [];
    for (const [placement, label] of [
      ["floating", "Float"],
      ["left", "Dock left"],
      ["right", "Dock right"],
    ] as const)
      if (state.placement !== placement) commands.push([placement, label]);
    commands.push([
      state.visibility === "collapsed" ? "restore" : "collapse",
      state.visibility === "collapsed" ? "Restore" : "Collapse",
    ]);
    if (state.placement === "floating" && desktop) commands.push(["center", "Center"]);
    commands.push(["reset", "Reset panel position"], ["close", "Close"]);
    panel.menu.replaceChildren(
      ...commands.map(([action, label]) =>
        button(
          label,
          () => {
            panel.menu.hidePopover();
            this.change(id, action, true);
          },
          "",
          `guided-panels-${id}-button-command-${action}`,
        ),
      ),
    );
    if (state.placement === "floating" && desktop)
      for (const [label, direction, resize] of [
        ["Move left", "left", false],
        ["Move right", "right", false],
        ["Move up", "up", false],
        ["Move down", "down", false],
        ["Narrower", "left", true],
        ["Wider", "right", true],
        ["Shorter", "up", true],
        ["Taller", "down", true],
      ] as const) {
        if (resize && state.visibility === "collapsed") continue;
        panel.menu.append(
          button(
            label,
            () => this.step(id, direction, 20, resize),
            "",
            `guided-panels-${id}-button-step-${resize ? "resize" : "move"}-${direction}`,
          ),
        );
      }
    else if (state.placement !== "floating" && desktop)
      for (const [label, delta] of [
        ["Narrower dock", -20],
        ["Wider dock", 20],
      ] as const)
        panel.menu.append(
          button(
            label,
            () => {
              this.setDockWidth(
                id,
                this.panels.get(id)!.host.getBoundingClientRect().width + delta,
              );
              this.settled();
            },
            "",
            `guided-panels-${id}-button-step-dock-${delta < 0 ? "narrower" : "wider"}`,
          ),
        );
  }
  private render(structure = true): void {
    const workspace = this.layout.workspaces[this.context];
    const applicable = this.applicable();
    const width = visualViewport?.width ?? innerWidth;
    const allocation = dockAllocation(workspace, applicable, width);
    this.main.style.marginLeft = `${allocation.left}px`;
    this.main.style.marginRight = `${allocation.right}px`;
    const bounds = this.bounds();
    const active: Partial<Record<"left" | "right", PanelId>> = {};
    for (const edge of ["left", "right"] as const) {
      const members = applicable.filter(
        (id) =>
          workspace.panels[id].placement === edge && workspace.panels[id].visibility === "expanded",
      );
      active[edge] = members.includes(workspace.active[edge]) ? workspace.active[edge] : members[0];
      this.tabs[edge].hidden = !allocation[edge] || members.length < 2;
      this.tabs[edge].style.width = `${allocation[edge]}px`;
      this.tabs[edge].style.top = `${bounds.y}px`;
    }
    for (const [id, panel] of this.panels) {
      const state = workspace.panels[id];
      const navigation = id === "documents" || id === "history";
      const autoCollapsed = width < 900 && navigation && !this.forced.has(id);
      const docked = state.placement !== "floating" && allocation[state.placement] > 0;
      panel.host.dataset.sharedDock = String(
        docked && !this.tabs[state.placement as "left" | "right"].hidden,
      );
      const collapsed = state.visibility === "collapsed" || autoCollapsed;
      const visible =
        applicable.includes(id) &&
        state.visibility !== "closed" &&
        !(
          docked &&
          state.visibility === "expanded" &&
          active[state.placement as "left" | "right"] !== id
        ) &&
        !(collapsed && (state.placement !== "floating" || autoCollapsed));
      panel.host.hidden = !visible;
      panel.body.hidden = collapsed;
      panel.host.dataset.visibility = collapsed ? "collapsed" : state.visibility;
      panel.host.dataset.placement = state.placement;
      panel.host.dataset.effective = docked ? "docked" : width < 900 ? "overlay" : "floating";
      panel.grip.disabled = docked || width < 900;
      panel.grip.setAttribute(
        "aria-label",
        panel.grip.disabled ? panelTitles[id] : `Move ${panelTitles[id]}`,
      );
      panel.grip.title = panel.grip.disabled
        ? "Use Actions to change panel placement."
        : "Arrow keys move; Alt+arrow keys resize. Hold Shift for larger steps.";
      const collapse = panel.host.querySelector<HTMLButtonElement>(
        `[data-testid="guided-panels-${id}-button-collapse"]`,
      )!;
      collapse.textContent = collapsed ? "+" : "−";
      collapse.setAttribute(
        "aria-label",
        `${collapsed ? "Restore" : "Collapse"} ${panelTitles[id]}`,
      );
      collapse.title = `${collapsed ? "Restore" : "Collapse"} ${panelTitles[id]}`;
      let rect: Rect;
      if (docked && !collapsed) {
        const edge = state.placement as "left" | "right";
        const tabs = !this.tabs[edge].hidden ? 38 : 0;
        rect = {
          x: edge === "left" ? 0 : innerWidth - allocation.right,
          y: bounds.y + tabs,
          width: allocation[edge],
          height: bounds.height - tabs,
        };
      } else if (width < 900 && !collapsed) {
        rect = {
          x: bounds.x,
          y: bounds.y + Math.max(0, bounds.height - Math.min(state.rect.height, bounds.height)),
          width: bounds.width,
          height: Math.min(state.rect.height, bounds.height),
        };
      } else rect = clampRect(state.rect, bounds, collapsed);
      Object.assign(panel.host.style, {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      if (id === "field") panel.host.style.setProperty("--field-panel-height", `${rect.height}px`);
      for (const handle of panel.handles)
        handle.hidden =
          collapsed ||
          (handle.classList.contains("panel-resize-dock") ? !docked : docked || width < 900);
    }
    if (!structure) return;
    const tabKey = JSON.stringify([
      this.context,
      applicable.map((id) => [id, workspace.panels[id].placement, workspace.panels[id].visibility]),
    ]);
    if (tabKey !== this.tabKey) {
      this.tabKey = tabKey;
      for (const edge of ["left", "right"] as const) {
        const members = applicable.filter(
          (id) =>
            workspace.panels[id].placement === edge &&
            workspace.panels[id].visibility === "expanded",
        );
        this.tabs[edge].replaceChildren(
          ...members.map((id, index) => {
            const tab = button(
              panelTitles[id],
              () => {
                workspace.active[edge] = id;
                this.settled();
              },
              "",
              `guided-panels-${id}-tab-${edge}`,
            );
            tab.setAttribute("role", "tab");
            tab.id = `workspace-tab-${id}-${edge}`;
            tab.setAttribute("aria-selected", String(active[edge] === id));
            tab.setAttribute("aria-controls", `workspace-panel-${id}`);
            tab.addEventListener("keydown", (event) => {
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? members.length - 1
                    : event.key === "ArrowRight"
                      ? (index + 1) % members.length
                      : event.key === "ArrowLeft"
                        ? (index + members.length - 1) % members.length
                        : -1;
              const selected = members[next];
              if (next < 0 || !selected) return;
              event.preventDefault();
              workspace.active[edge] = selected;
              this.settled();
              document
                .getElementById(`workspace-tab-${selected}-${edge}`)
                ?.focus({ preventScroll: true });
            });
            return tab;
          }),
        );
      }
    }
    for (const edge of ["left", "right"] as const) {
      for (const id of applicable) {
        const tab = this.tabs[edge].querySelector<HTMLButtonElement>(
          `#workspace-tab-${id}-${edge}`,
        );
        if (!tab) continue;
        tab.setAttribute("aria-selected", String(active[edge] === id));
        tab.tabIndex = active[edge] === id ? 0 : -1;
      }
    }
    for (const [id, panel] of this.panels) {
      const placement = workspace.panels[id].placement;
      const tabbed = placement !== "floating" && !this.tabs[placement].hidden;
      panel.host.setAttribute("role", tabbed ? "tabpanel" : "region");
      if (tabbed) panel.host.setAttribute("aria-labelledby", `workspace-tab-${id}-${placement}`);
      else panel.host.removeAttribute("aria-labelledby");
    }
    const restores = applicable.filter((id) => {
      const state = workspace.panels[id];
      return (
        state.visibility !== "closed" &&
        ((state.visibility === "collapsed" && state.placement !== "floating") ||
          (width < 900 && (id === "documents" || id === "history") && !this.forced.has(id)))
      );
    });
    const restoreKey = JSON.stringify([
      this.context,
      restores.map((id) => [id, workspace.panels[id].placement]),
    ]);
    if (restoreKey !== this.restoreKey) {
      this.restoreKey = restoreKey;
      const offsets = { left: 0, right: 0 };
      this.restore.replaceChildren(
        ...restores.map((id) => {
          const edge = workspace.panels[id].placement === "right" ? "right" : "left";
          const restore = button(
            `Restore ${panelTitles[id]}`,
            () => this.open(id, undefined, true),
            "panel-edge-restore",
            `guided-panels-${id}-button-restore`,
          );
          restore.setAttribute("aria-label", `Restore ${panelTitles[id]}`);
          restore.title = `Restore ${panelTitles[id]}`;
          restore.dataset.edge = edge;
          restore.style.left = edge === "left" ? "3px" : "auto";
          restore.style.right = edge === "right" ? "3px" : "auto";
          restore.dataset.offset = String(offsets[edge]++ * 44);
          restore.style.top = `${bounds.y + 43 + Number(restore.dataset.offset)}px`;
          return restore;
        }),
      );
    }
    for (const restore of this.restore.querySelectorAll<HTMLElement>(".panel-edge-restore"))
      restore.style.top = `${bounds.y + 43 + Number(restore.dataset.offset)}px`;
  }
}
