import { Resources } from "../sdk/resources";

const protectedSelector =
  "a,button,input,textarea,select,option,summary,label,iframe,object,embed,[contenteditable]:not([contenteditable=false]),[role=button],[role=link],[role=checkbox],[role=radio],[role=switch],[role=slider],[role=textbox],[role=combobox],[role=listbox],[role=option],[role=menuitem],[role=tab],[role=treeitem],[role=spinbutton],audio,video";
const HOLD_MS = 1800;

/** Opt-in, authorized-document gesture. Native middle actions are changed only on eligible presses. */
export class MiddleHold {
  private readonly resources = new Resources();
  private enabled = false;
  private disposed = false;
  private ownsPress = false;
  private hold:
    { x: number; y: number; started: number; frame: number; ring: HTMLDivElement } | undefined;

  constructor(
    private readonly onOpen: () => void,
    private readonly unlock: () => void,
  ) {
    const capture = { capture: true };
    this.resources.listen(window, "pointerdown", (e) => this.down(e as PointerEvent), capture);
    this.resources.listen(window, "mousedown", (e) => this.down(e as MouseEvent), capture);
    this.resources.listen(window, "pointermove", (e) => this.move(e as PointerEvent), capture);
    this.resources.listen(window, "mousemove", (e) => this.move(e as MouseEvent), capture);
    for (const name of ["pointerup", "mouseup"])
      this.resources.listen(
        window,
        name,
        (e) => {
          const mouse = e as MouseEvent;
          if (mouse.button !== 1) return;
          if (this.ownsPress) this.suppress(e);
          this.cancel();
        },
        capture,
      );
    this.resources.listen(
      window,
      "auxclick",
      (e) => {
        if ((e as MouseEvent).button !== 1 || !this.ownsPress) return;
        this.suppress(e);
        this.ownsPress = false;
        this.cancel();
      },
      capture,
    );
    for (const name of ["blur", "pagehide", "pointercancel"])
      this.resources.listen(window, name, () => this.cancel(), capture);
    this.resources.listen(document, "visibilitychange", () => {
      if (document.hidden) this.cancel();
    });
  }

  configure(enabled: boolean): void {
    this.enabled = enabled && !this.disposed;
    if (!this.enabled) this.cancel();
  }

  private suppress(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private eligible(event: MouseEvent): boolean {
    const path = event.composedPath().filter((node): node is Element => node instanceof Element);
    if (path.some((node) => node.matches(protectedSelector))) return false;
    return !path.some(
      (node) => node.hasAttribute("data-art-root") || node.hasAttribute("data-art-gesture"),
    );
  }

  private down(event: MouseEvent): void {
    if (event.button !== 1) return;
    // pointerdown is followed by mousedown; it belongs to the same qualified press.
    if (event.type === "mousedown" && this.ownsPress) {
      this.suppress(event);
      return;
    }
    this.cancel();
    this.ownsPress = false;
    if (
      !this.enabled ||
      event.shiftKey ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      !this.eligible(event)
    )
      return;
    this.ownsPress = true;
    this.suppress(event);
    this.unlock();
    const ring = document.createElement("div");
    ring.dataset.artGesture = "";
    ring.setAttribute("aria-hidden", "true");
    const left = Math.max(4, Math.min(Math.max(4, innerWidth - 48), event.clientX + 38));
    const top = Math.max(4, Math.min(Math.max(4, innerHeight - 48), event.clientY + 38));
    ring.style.cssText = `all:initial;position:fixed;pointer-events:none;z-index:2147483647;width:40px;height:40px;left:${left}px;top:${top}px;border-radius:50%;border:1px solid #ffffffb8;box-shadow:0 3px 14px #29405625;`;
    document.documentElement.append(ring);
    const hold = { x: event.clientX, y: event.clientY, started: performance.now(), frame: 0, ring };
    this.hold = hold;
    const tick = (now: number) => {
      if (this.hold !== hold) return;
      const progress = Math.max(0, Math.min(1, (now - hold.started) / HOLD_MS));
      ring.style.background = `radial-gradient(circle,#eef5f8f5 57%,transparent 59%),conic-gradient(#79afb7 ${progress * 360}deg,#dae3e980 0deg)`;
      if (progress >= 1) {
        this.cancel();
        this.onOpen();
      } else hold.frame = requestAnimationFrame(tick);
    };
    tick(hold.started);
  }

  private move(event: MouseEvent): void {
    if (!this.hold) return;
    if (
      !(event.buttons & 4) ||
      Math.hypot(event.clientX - this.hold.x, event.clientY - this.hold.y) > 12
    )
      this.cancel();
  }

  cancel(): void {
    if (!this.hold) return;
    cancelAnimationFrame(this.hold.frame);
    this.hold.ring.remove();
    this.hold = undefined;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.enabled = false;
    this.cancel();
    this.ownsPress = false;
    this.resources.dispose();
  }
}
