import { catalog } from "../generated/catalog";
import { Resources } from "../sdk/resources";
import type {
  Descriptor,
  EffectInstance,
  EffectModule,
  EffectTarget,
  Options,
  RuntimeBridge,
  StopReason,
} from "../sdk/types";
import { options, record } from "../sdk/validation";
import { box } from "../sdk/visual";
import { mountCatalog, icon, preferences } from "../ui/catalog";
import css from "../ui/style.css" with { type: "text" };
import { atPoint, eligible, visibleTargets } from "./targeting";
import { Diagnostics } from "./diagnostics";

class Runtime implements RuntimeBridge {
  private modules = new Map<string, EffectModule>();
  private epoch = 0;
  private host: HTMLElement | undefined;
  private shadow: ShadowRoot | undefined;
  private ui: Resources | undefined;
  private active: Resources | undefined;
  private instance: EffectInstance | undefined;
  private abort: AbortController | undefined;
  private activeId = "";
  private state = "stopped";
  private diagnostics = new Diagnostics();
  private returnFocus: HTMLElement | null = null;
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
    // Inline !important prevents ordinary host styles moving the overlay container.
    this.host.style.cssText =
      "all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;display:block!important;transform:none!important;";
    this.shadow = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = css;
    this.shadow.append(style);
    document.documentElement.append(this.host);
    return this.shadow;
  }
  private node(className: string, parent: ParentNode = this.surface()): HTMLDivElement {
    const el = document.createElement("div");
    el.className = className;
    parent.appendChild(el);
    return el;
  }
  stop(reason: StopReason = "user"): void {
    this.state = "stopping";
    ++this.epoch;
    this.abort?.abort();
    this.abort = undefined;
    try {
      this.instance?.stop(reason);
    } catch {
      this.diagnostics.write("effect.cleanup.failed", this.activeId);
    }
    try {
      this.instance?.dispose();
    } catch {
      this.diagnostics.write("effect.cleanup.failed", this.activeId);
    }
    this.active?.dispose();
    this.ui?.dispose();
    if (this.activeId) this.diagnostics.write("effect.stop.completed", this.activeId);
    this.instance = undefined;
    this.active = undefined;
    this.ui = undefined;
    this.activeId = "";
    this.state = "stopped";
    this.host?.remove();
    this.host = undefined;
    this.shadow = undefined;
    this.returnFocus?.focus({ preventScroll: true });
    this.returnFocus = null;
  }
  private session(): Resources {
    this.stop("replacement");
    this.returnFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.surface();
    const resources = new Resources(() => this.stop("error"));
    this.ui = resources;
    resources.listen(
      window,
      "keydown",
      (event) => {
        const e = event as KeyboardEvent;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.stop();
        }
      },
      { capture: true },
    );
    for (const name of ["pagehide", "popstate", "hashchange", "resize"])
      resources.listen(window, name, () => this.stop("navigation"));
    resources.listen(document, "visibilitychange", () => {
      if (document.hidden) this.stop("shutdown");
    });
    resources.listen(
      document,
      "scroll",
      () => {
        if (["active", "starting", "targeting"].includes(this.state)) this.stop("navigation");
      },
      { capture: true, passive: true },
    );
    // Modern navigation events cover pushState routes without monkey-patching page APIs.
    if ("navigation" in window)
      resources.listen(window.navigation as EventTarget, "navigate", () => this.stop("navigation"));
    return resources;
  }
  private control(label: string, resources: Resources): HTMLDivElement {
    const control = resources.node(this.node("control"));
    const copy = document.createElement("div");
    copy.className = "control-label";
    copy.textContent = label;
    copy.setAttribute("role", "status");
    const hint = document.createElement("small");
    hint.textContent = "Esc restores the page";
    const stop = document.createElement("button");
    stop.type = "button";
    stop.textContent = "Stop all";
    stop.onclick = () => this.stop();
    control.append(copy, hint, stop);
    return control;
  }
  async showCatalog(): Promise<void> {
    const r = this.session();
    const epoch = this.epoch;
    const dialog = r.node(this.node("art-dialog"));
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-label", "Anger Relief Toy toolbox");
    const app = document.createElement("div");
    dialog.append(app);
    await mountCatalog(app, (id, o) => this.choose(id, o), {
      wheel: () => {
        void this.showWheel();
      },
      close: () => this.stop(),
      stop: () => this.stop(),
      diagnostics: async () => ({
        events: this.diagnostics.report(),
        state: this.state,
        resources: this.active?.size ?? 0,
      }),
      clearDiagnostics: () => this.diagnostics.clear(),
    });
    if (epoch === this.epoch) app.querySelector<HTMLInputElement>("input")?.focus();
    this.containFocus(dialog, r);
  }
  private containFocus(container: HTMLElement, r: Resources): void {
    r.listen(container, "keydown", (event) => {
      const e = event as KeyboardEvent;
      if (e.key !== "Tab") return;
      const nodes = [
        ...container.querySelectorAll<HTMLElement>("button,input,select,summary,a[href]"),
      ].filter((el) => el.getClientRects().length);
      const current = nodes.indexOf(this.shadow?.activeElement as HTMLElement);
      if (!nodes.length) return;
      const next = (current + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length;
      e.preventDefault();
      nodes[next]?.focus();
    });
  }
  async showWheel(): Promise<void> {
    const r = this.session();
    const epoch = this.epoch;
    const prefs = await preferences();
    if (epoch !== this.epoch) return;
    const ids = [
      ...new Set([...prefs.favorites, ...prefs.recent, ...catalog.map((e) => e.id)]),
    ].slice(0, 8);
    const wheel = r.node(this.node("wheel"));
    wheel.setAttribute("role", "dialog");
    wheel.setAttribute("aria-label", "Favorite action wheel");
    ids.forEach((id, i) => {
      const entry = catalog.find((e) => e.id === id)!;
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / ids.length;
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = icon(entry, 23);
      b.append(document.createTextNode(entry.name));
      b.style.left = `${137 + Math.cos(angle) * 126}px`;
      b.style.top = `${141 + Math.sin(angle) * 126}px`;
      b.style.borderColor = entry.color;
      b.onclick = () => {
        void this.choose(id, prefs.options);
      };
      wheel.append(b);
    });
    const all = document.createElement("button");
    all.type = "button";
    all.className = "wheel-center";
    all.textContent = "All tools";
    all.onclick = () => {
      void this.showCatalog();
    };
    wheel.append(all);
    const hint = document.createElement("p");
    hint.className = "wheel-help";
    hint.textContent = "Tab to choose. Enter to use. Escape to close.";
    wheel.append(hint);
    this.containFocus(wheel, r);
    wheel.querySelector("button")?.focus();
  }
  async choose(id: string, rawOptions: unknown): Promise<void> {
    const descriptor = catalog.find((e) => e.id === id);
    if (!descriptor) throw new Error("UNKNOWN_EFFECT");
    const r = this.session();
    const epoch = this.epoch;
    const o = options(rawOptions);
    o.reducedMotion ||= matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.activeId = id;
    this.state = "loading";
    const controls = this.control(`Loading ${descriptor.name}...`, r);
    this.diagnostics.write("effect.load.started", id);
    try {
      if (!this.modules.has(id)) {
        const result = await chrome.runtime.sendMessage({ type: "load", id });
        if (epoch !== this.epoch) return;
        if (!result?.ok || !this.modules.has(id)) throw new Error("LOAD_FAILED");
      }
      if (epoch !== this.epoch) return;
      this.diagnostics.write("effect.load.completed", id);
      this.state = "ready";
      if (descriptor.scope === "element") this.target(descriptor, o, controls, r);
      else {
        const target: EffectTarget =
          descriptor.scope === "document"
            ? { kind: "document", document, elements: visibleTargets(12) }
            : { kind: "viewport", document };
        this.run(descriptor, target, o, controls, r);
      }
    } catch {
      if (epoch === this.epoch) {
        this.diagnostics.write("effect.load.failed", id);
        this.failure("Could not load this tool. Open the extension to try again.");
      }
    }
  }
  private target(d: Descriptor, o: Options, controls: HTMLElement, r: Resources): void {
    this.state = "targeting";
    controls.querySelector("[role=status]")!.textContent =
      `${d.name}: aim + click, or Tab then Enter`;
    const capture = r.node(this.node("capture"));
    const highlight = r.node(this.node("highlight"));
    highlight.hidden = true;
    let candidate: HTMLElement | null = null;
    const mark = (el: HTMLElement | null) => {
      candidate = el;
      highlight.hidden = !el;
      if (el) box(highlight, el.getBoundingClientRect());
    };
    const resolve = (x: number, y: number) => {
      capture.style.pointerEvents = "none";
      const hit = atPoint(x, y);
      capture.style.pointerEvents = "auto";
      return hit;
    };
    r.listen(
      capture,
      "pointermove",
      (event) => {
        const e = event as PointerEvent;
        mark(resolve(e.clientX, e.clientY));
      },
      { passive: true },
    );
    const consume = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    // A shield receives real pointer events instead of forwarding them to live controls.
    for (const name of [
      "pointerdown",
      "pointerup",
      "mousedown",
      "mouseup",
      "dblclick",
      "contextmenu",
    ])
      r.listen(capture, name, consume, { capture: true });
    const select = (x: number, y: number, selected?: HTMLElement) => {
      const element = selected ?? resolve(x, y);
      if (!eligible(element)) {
        this.diagnostics.write("effect.target.invalid", d.id);
        return;
      }
      capture.remove();
      highlight.remove();
      this.run(d, { kind: "element", element, document, x, y }, o, controls, r);
    };
    r.listen(
      capture,
      "click",
      (event) => {
        consume(event);
        const e = event as MouseEvent;
        select(e.clientX, e.clientY);
      },
      { capture: true },
    );
    let index = -1;
    const targets = visibleTargets();
    r.listen(
      window,
      "keydown",
      (event) => {
        if (this.state !== "targeting") return;
        const e = event as KeyboardEvent;
        if (e.key === "Tab") {
          consume(e);
          index = (index + (e.shiftKey ? -1 : 1) + targets.length) % targets.length;
          mark(targets[index] ?? null);
        } else if (e.key === "Enter") {
          consume(e);
          if (candidate) {
            const rect = candidate.getBoundingClientRect();
            select(rect.left + rect.width / 2, rect.top + rect.height / 2, candidate);
          }
        } else if (e.key === " ") {
          consume(e);
        }
      },
      { capture: true },
    );
    capture.style.zIndex = "1";
    highlight.style.zIndex = "2";
    controls.style.zIndex = "3";
  }
  private run(
    d: Descriptor,
    target: EffectTarget,
    o: Options,
    controls: HTMLElement,
    r: Resources,
  ): void {
    if (
      target.kind === "element" &&
      (!eligible(target.element) || target.element.ownerDocument !== document)
    )
      return;
    const epoch = this.epoch;
    this.state = "starting";
    this.abort = new AbortController();
    const active = new Resources(() => {
      if (epoch === this.epoch) this.failure("Tool stopped safely after a rendering error.");
    });
    this.active = active;
    const stage = active.node(this.node("stage"));
    const start = performance.now();
    this.diagnostics.write("effect.start.started", d.id);
    try {
      this.instance = this.modules.get(d.id)!.create({
        document,
        signal: this.abort.signal,
        resources: active,
        overlay: stage,
        finish: () => {
          if (epoch === this.epoch) this.stop("timeout");
        },
      });
      const result = this.instance.start(target, o);
      Promise.resolve(result)
        .then(() => {
          if (epoch !== this.epoch) return;
          this.state = "active";
          this.diagnostics.write("effect.start.completed", d.id, performance.now() - start);
          if (performance.now() - start > 150)
            this.diagnostics.write("effect.performance.degraded", d.id, performance.now() - start);
        })
        .catch(() => {
          if (epoch === this.epoch)
            this.failure("Tool stopped safely. Choose another tool to continue.");
        });
      controls.querySelector("[role=status]")!.textContent = `${d.name} active`;
      const again = document.createElement("button");
      again.type = "button";
      again.textContent = "Again";
      again.onclick = () => {
        void this.choose(d.id, o);
      };
      controls.insertBefore(again, controls.lastChild);
      r.timeout(() => this.stop("timeout"), o.duration * 1000);
      const tracked =
        target.kind === "element"
          ? [target.element]
          : target.kind === "document"
            ? target.elements
            : [];
      if (tracked.length) {
        const bounds = tracked.map((element) => ({
          element,
          rect: element.getBoundingClientRect(),
        }));
        const changed = () =>
          bounds.some(({ element, rect }) => {
            if (!element.isConnected) return true;
            const current = element.getBoundingClientRect();
            return (["left", "top", "width", "height"] as const).some(
              (key) => Math.abs(current[key] - rect[key]) > 1,
            );
          });
        // Observe only while active. Structural/layout changes end snapshots rather than leaving stale representations.
        const observer = new MutationObserver((records) => {
          if (
            changed() ||
            records.some(
              (record) =>
                record.type !== "attributes" &&
                tracked.some((element) => element.contains(record.target)),
            )
          )
            this.stop("navigation");
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["style", "class", "hidden"],
        });
        active.own(() => observer.disconnect());
        if (typeof ResizeObserver !== "undefined") {
          const resize = new ResizeObserver(() => {
            if (changed()) this.stop("navigation");
          });
          for (const element of tracked) resize.observe(element);
          active.own(() => resize.disconnect());
        }
      }
    } catch {
      this.diagnostics.write("effect.start.failed", d.id);
      this.failure("Tool stopped safely. Choose another tool to continue.");
    }
  }
  private failure(message: string): void {
    this.stop("error");
    const r = this.session();
    this.state = "failed";
    this.control(message, r);
    r.timeout(() => this.stop(), 5000);
  }
  clearDiagnostics(): void {
    this.diagnostics.clear();
  }
  report(): unknown {
    return {
      state: this.state,
      resources: this.active?.size ?? 0,
      loaded: [...this.modules.keys()],
      events: this.diagnostics.report(),
    };
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
      void (message.mode === "wheel" ? runtime.showWheel() : runtime.showCatalog()).then(() =>
        respond({ ok: true }),
      );
      return true;
    }
    if (message.type === "stop") {
      runtime.stop();
      respond({ ok: true });
    }
    if (message.type === "report") {
      respond(runtime.report());
    }
    if (message.type === "clear-diagnostics") {
      runtime.clearDiagnostics();
      respond({ ok: true });
    }
    if (message.type === "ping") {
      respond({ ok: true });
    }
    return false;
  });
}
