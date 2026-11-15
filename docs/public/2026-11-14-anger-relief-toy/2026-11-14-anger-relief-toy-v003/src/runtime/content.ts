import { catalog } from "../generated/catalog";
import { Resources } from "../sdk/resources";
import type {
  Descriptor,
  EffectModule,
  EffectTarget,
  Options,
  RuntimeBridge,
  StopReason,
} from "../sdk/types";
import { options, record } from "../sdk/validation";
import { box } from "../sdk/visual";
import { mountCatalog, preferences } from "../ui/catalog";
import { button, el, focusLoop, icon } from "../ui/dom";
import { cursorPosition, draggable, type Point } from "../ui/position";
import { wheel } from "../ui/wheel";
import css from "../ui/style.css" with { type: "text" };
import { atPoint, eligible, visibleTargets } from "./targeting";
import { Diagnostics } from "./diagnostics";
import { Invocations } from "./invocations";
type ToolState =
  "unequipped" | "switching" | "loading" | "equipped" | "targeting" | "suspended" | "failed";
interface Equipped {
  descriptor: Descriptor;
  options: Options;
  resources: Resources;
}
class Runtime implements RuntimeBridge {
  private modules = new Map<string, EffectModule>();
  private epoch = 0;
  private menuEpoch = 0;
  private host: HTMLElement | undefined;
  private shadow: ShadowRoot | undefined;
  private shell: Resources | undefined;
  private equipped: Equipped | undefined;
  private state: ToolState = "unequipped";
  private menu: "wheel" | "catalog" | undefined;
  private menuScope: Resources | undefined;
  private restoreFocus: HTMLElement | null = null;
  private catalogPosition: Point | undefined;
  private hud: HTMLElement | undefined;
  private cue: HTMLElement | undefined;
  private capture: HTMLElement | undefined;
  private outline: HTMLElement | undefined;
  private candidate: HTMLElement | null = null;
  private pointer: Point | undefined;
  private diagnostics = new Diagnostics(
    (id) => catalog.find((e) => e.id === id)?.version ?? "unknown",
  );
  private execution = new Invocations(
    () => this.node("stage"),
    () => !this.menu && this.state !== "suspended",
    () => this.updateHUD(),
    this.diagnostics,
  );
  register(id: string, module: EffectModule): void {
    if (
      !catalog.some((e) => e.id === id) ||
      module.sdkVersion !== "1.0" ||
      typeof module.create !== "function"
    )
      throw new Error("INVALID_MODULE");
    if (!this.modules.has(id)) this.modules.set(id, module);
  }
  private surface(): ShadowRoot {
    if (this.shadow && this.host?.isConnected) return this.shadow;
    this.host = document.createElement("div");
    this.host.dataset.artRoot = "";
    this.host.style.cssText =
      "all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;display:block!important;transform:none!important;";
    this.shadow = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = css;
    this.shadow.append(style);
    document.documentElement.append(this.host);
    const r = new Resources(() => this.putAway("error"));
    this.shell = r;
    r.listen(window, "keydown", (event) => this.key(event as KeyboardEvent), { capture: true });
    for (const name of ["pagehide", "popstate", "hashchange"])
      r.listen(window, name, () => this.shutdown());
    if ("navigation" in window)
      r.listen(window.navigation as EventTarget, "navigate", () => this.shutdown());
    r.listen(window, "resize", () => this.geometry());
    r.listen(
      document,
      "scroll",
      () => {
        if (!this.menu) this.geometry();
      },
      { capture: true, passive: true },
    );
    r.listen(document, "visibilitychange", () => {
      if (!this.equipped) return;
      if (document.hidden) {
        this.state = "suspended";
        this.execution.end("shutdown");
        this.syncInput();
      } else {
        this.state = this.equipped.descriptor.scope === "element" ? "targeting" : "equipped";
        this.syncInput();
        if (this.equipped.descriptor.lifetime.class === "continuous") this.executeAutomatic();
      }
      this.updateHUD();
    });
    return this.shadow;
  }
  private node(className: string, parent: ParentNode = this.surface()): HTMLDivElement {
    const n = el("div", className);
    parent.appendChild(n);
    return n;
  }
  private releaseShell(): void {
    if (this.equipped || this.menu) return;
    this.shell?.dispose();
    this.shell = undefined;
    this.host?.remove();
    this.host = undefined;
    this.shadow = undefined;
  }
  private shutdown(): void {
    this.closeMenu(false);
    this.putAway("navigation");
    this.catalogPosition = undefined;
    this.releaseShell();
  }
  putAway(reason: StopReason = "user"): void {
    ++this.epoch;
    this.execution.end(reason);
    this.equipped?.resources.dispose();
    this.equipped = undefined;
    this.hud = undefined;
    this.cue = undefined;
    this.capture = undefined;
    this.outline = undefined;
    this.candidate = null;
    this.pointer = undefined;
    this.state = reason === "replacement" ? "switching" : "unequipped";
    if (this.host) this.host.removeAttribute("data-equipped");
    this.refreshCatalogSelection();
    this.releaseShell();
  }
  private closeMenu(restore = true): void {
    ++this.menuEpoch;
    this.menuScope?.dispose();
    this.menuScope = undefined;
    this.menu = undefined;
    this.host?.removeAttribute("data-menu");
    this.syncInput();
    if (restore) {
      if (this.restoreFocus?.isConnected) this.restoreFocus.focus({ preventScroll: true });
      else this.hud?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    }
    this.restoreFocus = null;
    this.releaseShell();
  }
  private openMenu(kind: "wheel" | "catalog"): {
    resources: Resources;
    epoch: number;
    container: HTMLElement;
  } {
    this.closeMenu(false);
    this.surface();
    this.menu = kind;
    this.host!.dataset.menu = kind;
    this.restoreFocus = (this.shadow?.activeElement ??
      document.activeElement) as HTMLElement | null;
    const r = new Resources(() => this.closeMenu());
    this.menuScope = r;
    const epoch = ++this.menuEpoch;
    const scrim = r.node(this.node("menu-scrim"));
    r.listen(scrim, "pointerdown", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    });
    r.listen(scrim, "click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.closeMenu();
    });
    this.syncInput();
    return { resources: r, epoch, container: this.node("menu-layer") };
  }
  private async assignedShortcut(): Promise<string> {
    try {
      const result: unknown = await chrome.runtime.sendMessage({ type: "shortcut" });
      return record(result) && typeof result.shortcut === "string" ? result.shortcut : "";
    } catch {
      return "";
    }
  }
  async showWheel(): Promise<void> {
    if (this.menu === "wheel") {
      this.closeMenu();
      return;
    }
    const { resources: r, epoch, container } = this.openMenu("wheel");
    r.node(container);
    const [prefs, shortcut] = await Promise.all([preferences(), this.assignedShortcut()]);
    if (epoch !== this.menuEpoch) return;
    const ids = [
      ...new Set([...prefs.favorites, ...prefs.recent, ...catalog.map((e) => e.id)]),
    ].slice(0, 8);
    const entries = ids.map((id) => catalog.find((e) => e.id === id)!);
    const dialog = wheel(
      entries,
      this.equipped?.descriptor.id,
      shortcut,
      (id) => {
        void this.choose(id, prefs.options);
      },
      () => {
        void this.showCatalog();
      },
      () => this.closeMenu(),
    );
    container.append(dialog);
    dialog.querySelector<HTMLElement>("[aria-pressed=true],button")?.focus();
    this.updateHUD();
  }
  async showCatalog(): Promise<void> {
    const { resources: r, epoch, container } = this.openMenu("catalog");
    r.node(container);
    const dialog = this.node("art-dialog", container);
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Choose a tool");
    const app = el("div");
    dialog.append(app);
    await mountCatalog(app, (id, o) => this.choose(id, o), {
      wheel: () => {
        void this.showWheel();
      },
      close: () => this.closeMenu(),
      stop: () => this.putAway(),
      diagnostics: async () => this.report(),
      clearDiagnostics: () => this.diagnostics.clear(),
      equipped: () => this.equipped?.descriptor.id,
    });
    if (epoch !== this.menuEpoch) return;
    const handle = app.querySelector<HTMLElement>(".brand")!;
    draggable(dialog, handle, r, this.catalogPosition, (p) => {
      this.catalogPosition = p;
    });
    app.querySelector<HTMLInputElement>("input")?.focus();
  }
  private refreshCatalogSelection(): void {
    if (!this.shadow) return;
    const put = this.shadow.querySelector<HTMLButtonElement>(".footer .put-away");
    if (put) put.disabled = !this.equipped;
    for (const tile of this.shadow.querySelectorAll<HTMLElement>(".tool[data-id]")) {
      const active = tile.dataset.id === this.equipped?.descriptor.id;
      tile.setAttribute("data-equipped", String(active));
      tile.querySelector(".tool-use")?.setAttribute("aria-pressed", String(active));
    }
  }
  async choose(id: string, rawOptions: unknown): Promise<void> {
    const descriptor = catalog.find((e) => e.id === id);
    if (!descriptor) throw new Error("UNKNOWN_EFFECT");
    this.closeMenu(false);
    this.putAway("replacement");
    this.surface();
    const epoch = ++this.epoch;
    const o = options(rawOptions);
    o.reducedMotion ||= matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new Resources(() => this.putAway("error"));
    this.equipped = { descriptor, options: o, resources: r };
    this.state = "loading";
    this.host!.dataset.equipped = id;
    this.createHUD(r);
    this.diagnostics.write("effect.load.started", id);
    try {
      if (!this.modules.has(id)) {
        const result = await chrome.runtime.sendMessage({ type: "load", id });
        if (epoch !== this.epoch) return;
        if (!result?.ok || !this.modules.has(id)) throw new Error("LOAD_FAILED");
      }
      if (epoch !== this.epoch) return;
      this.diagnostics.write("effect.load.completed", id);
      this.state = document.hidden
        ? "suspended"
        : descriptor.scope === "element"
          ? "targeting"
          : "equipped";
      if (descriptor.scope === "element") this.targeting(r);
      else this.executeAutomatic();
      const prefs = await preferences();
      if (epoch !== this.epoch) return;
      prefs.recent = [id, ...prefs.recent.filter((value) => value !== id)].slice(0, 16);
      try {
        await chrome.storage.local.set({ preferences: prefs });
      } catch {
        /* A recent-tools write must never terminate an equipped tool. */
      }
      this.updateHUD();
    } catch {
      if (epoch !== this.epoch) return;
      this.diagnostics.write("effect.load.failed", id);
      this.execution.end("error");
      this.state = "failed";
      this.updateHUD();
    }
  }
  private createHUD(r: Resources): void {
    const hud = r.node(this.node("hud"));
    hud.setAttribute("role", "toolbar");
    hud.setAttribute("aria-label", "Equipped tool");
    this.hud = hud;
    const art = el("span", "hud-icon");
    art.innerHTML = icon(this.equipped!.descriptor, 38);
    const copy = el("div", "hud-copy");
    copy.append(el("strong", "hud-name", this.equipped!.descriptor.name), el("span", "hud-status"));
    copy.setAttribute("role", "status");
    const switchButton = button(
      "Switch",
      () => {
        void this.showWheel();
      },
      "hud-switch",
    );
    const end = button("End effect", () => this.execution.end(), "end-effect");
    const put = button("Put away", () => this.putAway(), "put-away");
    const activate = button("Use tool", () => this.executeAutomatic(), "activate-effect");
    hud.append(art, copy, switchButton, activate, end, put);
    this.updateHUD();
    void this.assignedShortcut().then((value) => {
      if (!r.closed) {
        switchButton.title = value
          ? `Open action wheel (${value})`
          : "Open action wheel; assign a shortcut in extension settings";
      }
    });
  }
  private updateHUD(): void {
    if (!this.hud || !this.equipped) return;
    const d = this.equipped.descriptor;
    const message =
      this.state === "loading"
        ? "Loading tool..."
        : this.state === "failed"
          ? "Could not load. Switch tools to retry."
          : this.state === "suspended"
            ? "Suspended while this tab is hidden"
            : this.execution.state === "failed"
              ? "Effect ended safely. Choose another target."
              : d.scope === "element"
                ? "Click an element. Tab targets; Enter uses."
                : this.execution.state === "idle"
                  ? "Effect ended. Switch or put away."
                  : d.interaction === "pointer"
                    ? "Move the pointer or use arrow keys."
                    : "Active until you end it or put it away.";
    this.hud.querySelector(".hud-status")!.textContent = message;
    const end = this.hud.querySelector<HTMLButtonElement>(".end-effect")!;
    end.hidden = this.execution.state === "idle" || this.execution.state === "failed";
    this.hud.querySelector<HTMLButtonElement>(".activate-effect")!.hidden =
      d.scope === "element" ||
      !["idle", "failed"].includes(this.execution.state) ||
      this.state === "loading" ||
      this.state === "suspended";
  }
  private syncInput(): void {
    const hidden = !!this.menu || this.state === "suspended" || this.state === "loading";
    if (this.capture) this.capture.hidden = hidden;
    if (this.cue) this.cue.hidden = hidden || !this.pointer;
    if (this.outline) this.outline.hidden = hidden || !this.candidate;
  }
  private mark(candidate: HTMLElement | null): void {
    this.candidate = candidate;
    if (candidate && this.outline) box(this.outline, candidate.getBoundingClientRect());
    this.syncInput();
  }
  private resolve(x: number, y: number): HTMLElement | null {
    if (this.capture) this.capture.style.pointerEvents = "none";
    const hit = atPoint(x, y);
    if (this.capture) this.capture.style.pointerEvents = "auto";
    return hit;
  }
  private targeting(r: Resources): void {
    const capture = r.node(this.node("capture"));
    const outline = r.node(this.node("highlight"));
    const cue = r.node(this.node("cursor-cue"));
    cue.innerHTML = icon(this.equipped!.descriptor, 32);
    capture.tabIndex = -1;
    this.capture = capture;
    this.outline = outline;
    this.cue = cue;
    this.syncInput();
    if (this.state !== "suspended") capture.focus({ preventScroll: true });
    r.listen(
      capture,
      "pointermove",
      (event) => {
        const e = event as PointerEvent;
        this.pointer = { x: e.clientX, y: e.clientY };
        const point = cursorPosition(e.clientX, e.clientY);
        cue.style.left = `${point.x}px`;
        cue.style.top = `${point.y}px`;
        this.mark(this.resolve(e.clientX, e.clientY));
      },
      { passive: true },
    );
    for (const name of [
      "pointerdown",
      "pointerup",
      "mousedown",
      "mouseup",
      "dblclick",
      "contextmenu",
    ])
      r.listen(
        capture,
        name,
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
        },
        { capture: true },
      );
    r.listen(
      capture,
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const e = event as MouseEvent;
        if (e.button !== 0) return;
        this.execution.end("replacement");
        this.use(this.resolve(e.clientX, e.clientY), e.clientX, e.clientY);
      },
      { capture: true },
    );
    r.listen(capture, "pointerleave", () => {
      this.pointer = undefined;
      this.mark(null);
    });
  }
  private use(element: HTMLElement | null, x: number, y: number): void {
    const tool = this.equipped;
    if (!tool || this.menu || this.state !== "targeting") return;
    // Restore the previous representation before accepting a new target, bounding overlap at one invocation.
    this.execution.end("replacement");
    if (!eligible(element) || element.ownerDocument !== document) {
      this.diagnostics.write("effect.target.invalid", tool.descriptor.id);
      this.mark(null);
      return;
    }
    this.mark(null);
    this.execution.run(
      tool.descriptor,
      this.modules.get(tool.descriptor.id)!,
      { kind: "element", document, element, x, y },
      tool.options,
    );
  }
  private executeAutomatic(): void {
    const tool = this.equipped;
    if (!tool || this.state === "suspended") return;
    const target: EffectTarget =
      tool.descriptor.scope === "document"
        ? { kind: "document", document, elements: visibleTargets(12) }
        : { kind: "viewport", document };
    if (target.kind === "document" && !target.elements.length) {
      this.execution.end();
      const status = this.hud?.querySelector(".hud-status");
      if (status) status.textContent = "No visible targets. Scroll to content, then use the tool.";
      return;
    }
    this.execution.run(
      tool.descriptor,
      this.modules.get(tool.descriptor.id)!,
      target,
      tool.options,
    );
  }
  private geometry(): void {
    if (!this.equipped) return;
    this.mark(null);
    const d = this.equipped.descriptor;
    if (d.scope !== "viewport") this.execution.end("navigation");
    // Viewport overlays size with CSS; pointer lighting has no geometry-dependent snapshot.
    this.syncInput();
  }
  private key(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (this.menu) this.closeMenu();
      else this.putAway();
      return;
    }
    if (this.menu) {
      const dialog = this.shadow?.querySelector<HTMLElement>('[role="dialog"]');
      if (dialog) focusLoop(dialog, e, this.shadow?.activeElement ?? null);
      return;
    }
    if (!this.equipped || this.state !== "targeting") return;
    if (e.key === "Tab") {
      const targets = visibleTargets();
      const controls = [...this.hud!.querySelectorAll<HTMLButtonElement>("button")].filter(
        (n) => !n.hidden,
      );
      const active = this.shadow?.activeElement;
      const current = this.candidate ?? (active instanceof HTMLElement ? active : null);
      const list: HTMLElement[] = [...targets, ...controls];
      if (!list.length) return;
      const index = list.indexOf(current as HTMLElement);
      const step = e.shiftKey ? -1 : 1;
      const next =
        list[
          index < 0
            ? e.shiftKey
              ? list.length - 1
              : 0
            : (index + step + list.length) % list.length
        ]!;
      if (controls.includes(next as HTMLButtonElement)) {
        this.mark(null);
        next.focus();
      } else {
        (this.shadow?.activeElement as HTMLElement | null)?.blur();
        this.mark(next);
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.key === "Enter" || e.key === " ") {
      if (this.hud?.contains(this.shadow?.activeElement ?? null)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === "Enter" && this.candidate) {
        const rect = this.candidate.getBoundingClientRect();
        this.use(this.candidate, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }
  }
  report(): unknown {
    return {
      state: this.state,
      equipped: this.equipped?.descriptor.id ?? null,
      menu: this.menu ?? null,
      invocation: this.execution.state,
      invocationsStarted: this.execution.started,
      resources: this.execution.resources,
      sessionResources: this.equipped?.resources.size ?? 0,
      loaded: [...this.modules.keys()],
      events: this.diagnostics.report(),
    };
  }
  clearDiagnostics(): void {
    this.diagnostics.clear();
  }
}
if (!globalThis.__angerReliefToyV1) {
  const runtime = new Runtime();
  globalThis.__angerReliefToyV1 = runtime;
  chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
    if (sender.id !== chrome.runtime.id || !record(message)) return false;
    if (
      ["select", "show"].includes(String(message.type)) &&
      (document.contentType !== "text/html" || !(document.body instanceof HTMLElement))
    ) {
      respond({ ok: false, error: "UNSUPPORTED_DOCUMENT" });
      return false;
    }
    if (message.type === "select" && typeof message.id === "string") {
      void runtime
        .choose(message.id, message.options)
        .then(() => respond({ ok: true }))
        .catch(() => respond({ ok: false }));
      return true;
    }
    if (message.type === "show") {
      void (message.mode === "wheel" ? runtime.showWheel() : runtime.showCatalog())
        .then(() => respond({ ok: true }))
        .catch(() => respond({ ok: false }));
      return true;
    }
    if (message.type === "stop") {
      runtime.putAway();
      respond({ ok: true });
    }
    if (message.type === "report") respond(runtime.report());
    if (message.type === "clear-diagnostics") {
      runtime.clearDiagnostics();
      respond({ ok: true });
    }
    if (message.type === "ping") respond({ ok: true });
    return false;
  });
}
