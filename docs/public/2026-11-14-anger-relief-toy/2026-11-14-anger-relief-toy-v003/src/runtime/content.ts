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
import { dialAudio } from "../ui/dial-audio";
import { wheel } from "../ui/wheel";
import css from "../ui/style.css" with { type: "text" };
import { atPoint, eligible, visibleTargets } from "./targeting";
import { Diagnostics } from "./diagnostics";
import { AudioService } from "../audio/service";
import { MiddleHold } from "./middle-hold";
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
  private outline: HTMLElement | undefined;
  private candidate: HTMLElement | null = null;
  private pointer: Point | undefined;
  private resumeContinuous = false;
  private diagnostics = new Diagnostics(
    (id) => catalog.find((e) => e.id === id)?.version ?? "unknown",
  );
  private ready: Promise<void> = Promise.resolve();
  private audio = new AudioService();
  private hold = new MiddleHold(
    () => {
      void this.showWheel();
    },
    () => this.audio.unlock(),
  );
  private execution = new Invocations(
    () => this.node("stage"),
    () => !this.menu && this.state !== "suspended",
    () => this.updateHUD(),
    this.diagnostics,
    this.audio,
  );
  constructor() {
    this.ready = this.refreshPreferences();
    for (const name of ["popstate", "hashchange"])
      window.addEventListener(name, () => this.shutdown());
    if ("navigation" in window)
      (window.navigation as EventTarget).addEventListener("navigate", () => this.shutdown());
    window.addEventListener("pagehide", (event) => {
      this.shutdown();
      if (!(event as PageTransitionEvent).persisted) {
        this.hold.dispose();
        this.audio.dispose();
      }
    });
  }
  async refreshPreferences(): Promise<void> {
    const prefs = await preferences();
    this.audio.configure(prefs.audio);
    this.hold.configure(prefs.middleHold);
    this.updateMute();
  }
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
    this.shadow.addEventListener(
      "pointerdown",
      (e) => {
        if (e.isTrusted) this.audio.unlock();
      },
      true,
    );
    this.shadow.addEventListener(
      "keydown",
      (e) => {
        if (e.isTrusted && ["Enter", " "].includes((e as KeyboardEvent).key)) this.audio.unlock();
      },
      true,
    );
    document.documentElement.append(this.host);
    const r = new Resources(() => this.putAway("error"));
    this.shell = r;
    r.listen(window, "keydown", (event) => this.key(event as KeyboardEvent), { capture: true });
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
        this.hold.cancel();
        this.audio.suspend();
        this.resumeContinuous = this.execution.state === "continuous";
        this.state = "suspended";
        this.execution.end("shutdown");
        this.syncInput();
      } else {
        this.state = this.equipped.descriptor.scope === "element" ? "targeting" : "equipped";
        this.syncInput();
        if (this.resumeContinuous && this.equipped.descriptor.lifetime.class === "continuous")
          this.executeAutomatic();
        this.resumeContinuous = false;
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
    this.hold.cancel();
    this.audio.suspend();
    this.catalogPosition = undefined;
    this.releaseShell();
  }
  putAway(reason: StopReason = "user"): void {
    ++this.epoch;
    this.hold.cancel();
    this.resumeContinuous = false;
    this.execution.end(reason);
    this.audio.stopAll();
    this.equipped?.resources.dispose();
    this.equipped = undefined;
    this.hud = undefined;
    this.cue = undefined;
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
    this.hold.cancel();
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
    await this.ready;
    if (this.menu === "wheel") {
      this.closeMenu();
      return;
    }
    const { resources: r, epoch, container } = this.openMenu("wheel");
    r.node(container);
    const [prefs, shortcut] = await Promise.all([preferences(), this.assignedShortcut()]);
    if (epoch !== this.menuEpoch) return;
    const ids = [...new Set([...prefs.favorites, ...prefs.recent, ...catalog.map((e) => e.id)])];
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
      r,
      this.audio.scope(dialAudio, "navigation"),
    );
    container.append(dialog);
    dialog.querySelector<HTMLElement>(".wheel-sector[tabindex='0']")?.focus();
    this.updateHUD();
  }
  async showCatalog(): Promise<void> {
    await this.ready;
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
      changed: () => {
        void this.refreshPreferences();
      },
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
    const request = ++this.epoch;
    await this.ready;
    if (request !== this.epoch) return;
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
    const name = el("strong", "hud-name", this.equipped!.descriptor.name);
    name.title = this.equipped!.descriptor.name;
    copy.append(name);
    const switchButton = button(
      "Switch",
      () => {
        void this.showWheel();
      },
      "hud-switch",
    );
    const end = button("End effect", () => this.execution.end(), "end-effect");
    const put = button("Put away", () => this.putAway(), "put-away");
    hud.append(art, copy, switchButton, end, put);
    const mute = r.node(this.node("audio-control"));
    mute.append(
      button(
        "Mute",
        () => {
          this.audio.unlock();
          void preferences()
            .then(async (prefs) => {
              prefs.audio.muted = !prefs.audio.muted;
              this.audio.configure(prefs.audio);
              this.audio.unlock();
              this.updateMute();
              await chrome.storage.local.set({ preferences: prefs });
            })
            .catch(() => {});
        },
        "mute-audio",
      ),
    );
    this.updateMute();
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
    const end = this.hud.querySelector<HTMLButtonElement>(".end-effect")!;
    end.disabled = ["idle", "failed"].includes(this.execution.state);
    if (this.state === "failed" || this.execution.state === "failed")
      this.notify("Tool could not run. Switch tools to retry.");
  }
  private updateMute(): void {
    const mute = this.shadow?.querySelector<HTMLButtonElement>(".mute-audio");
    if (!mute) return;
    const muted = this.audio.report().muted;
    mute.textContent = muted ? "Unmute" : "Mute";
    mute.setAttribute("aria-label", muted ? "Unmute all sounds" : "Mute all sounds");
    mute.setAttribute("aria-pressed", String(muted));
  }
  private notify(message: string): void {
    if (!this.equipped || this.shadow?.querySelector(".toast")) return;
    const toast = this.equipped.resources.node(this.node("toast"));
    toast.setAttribute("role", "status");
    toast.textContent = message;
    this.equipped.resources.timeout(() => toast.remove(), 4000);
  }

  private syncInput(): void {
    const hidden = !!this.menu || this.state === "suspended" || this.state === "loading";
    if (this.cue) this.cue.hidden = hidden || !this.pointer;
    if (this.outline) this.outline.hidden = hidden || !this.candidate;
  }
  private mark(candidate: HTMLElement | null): void {
    this.candidate = candidate;
    if (candidate && this.outline) box(this.outline, candidate.getBoundingClientRect());
    this.syncInput();
  }
  private resolve(x: number, y: number): HTMLElement | null {
    return atPoint(x, y);
  }
  private targeting(r: Resources): void {
    const outline = r.node(this.node("highlight"));
    const cue = r.node(this.node("cursor-cue"));
    cue.innerHTML = icon(this.equipped!.descriptor, 32);
    this.outline = outline;
    this.cue = cue;
    this.syncInput();
    // Observe real page pointer events. A hit-test shield would swallow native middle-click links.
    // Only deliberate primary-pointer actions are intercepted; keyboard activation remains native.
    const available = (event: Event): boolean => {
      if (this.menu || this.state !== "targeting") return false;
      const path = event.composedPath();
      const own = path.some(
        (node) => node instanceof Element && node.hasAttribute("data-art-root"),
      );
      return !own;
    };
    r.listen(
      window,
      "pointermove",
      (event) => {
        if (!available(event)) {
          this.pointer = undefined;
          this.mark(null);
          return;
        }
        const e = event as PointerEvent;
        this.pointer = { x: e.clientX, y: e.clientY };
        const point = cursorPosition(e.clientX, e.clientY);
        cue.style.left = `${point.x}px`;
        cue.style.top = `${point.y}px`;
        this.mark(this.resolve(e.clientX, e.clientY));
      },
      { capture: true, passive: true },
    );
    for (const name of ["pointerdown", "pointerup", "mousedown", "mouseup", "dblclick"]) {
      r.listen(
        window,
        name,
        (event) => {
          if (!available(event) || (event as MouseEvent).button !== 0) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (name === "pointerdown" && event.isTrusted) this.audio.unlock();
        },
        { capture: true },
      );
    }
    r.listen(
      window,
      "click",
      (event) => {
        const e = event as MouseEvent;
        if (!available(event) || e.button !== 0 || e.detail === 0) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.isTrusted) this.audio.unlock();
        this.execution.end("replacement");
        this.use(this.resolve(e.clientX, e.clientY), e.clientX, e.clientY);
      },
      { capture: true },
    );
    r.listen(window, "pointerout", (event) => {
      if ((event as PointerEvent).relatedTarget) return;
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
      this.notify("No visible targets. Scroll to content, then reselect the tool.");
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
      audio: this.audio.report(),
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
    if (message.type === "preferences-changed") {
      void runtime.refreshPreferences().then(() => respond({ ok: true }));
      return true;
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
