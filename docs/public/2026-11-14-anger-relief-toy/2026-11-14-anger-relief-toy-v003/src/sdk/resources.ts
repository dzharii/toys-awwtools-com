/** Each instance owns one scope. Cleanup is idempotent and continues after a failed disposer. */
export class Resources {
  private cleanups = new Set<() => void>();
  closed = false;
  constructor(private fail: () => void = () => {}) {}
  get size(): number {
    return this.cleanups.size;
  }
  own(cleanup: () => void): () => void {
    if (this.closed) {
      cleanup();
      return () => {};
    }
    this.cleanups.add(cleanup);
    return () => {
      this.cleanups.delete(cleanup);
    };
  }
  node<T extends Node>(node: T): T {
    this.own(() => node.parentNode?.removeChild(node));
    return node;
  }
  listen(
    target: EventTarget,
    name: string,
    fn: EventListener,
    settings: AddEventListenerOptions = {},
  ): void {
    target.addEventListener(name, fn, settings);
    this.own(() => target.removeEventListener(name, fn, settings));
  }
  timeout(fn: () => void, ms: number): void {
    if (this.closed) return;
    const handle = setTimeout(() => {
      release();
      if (!this.closed) {
        try {
          fn();
        } catch {
          this.fail();
        }
      }
    }, ms);
    const release = this.own(() => clearTimeout(handle));
  }
  animate(element: Element, frames: Keyframe[], timing: KeyframeAnimationOptions): Animation {
    const animation = element.animate(frames, timing);
    this.own(() => animation.cancel());
    animation.finished.catch(() => {});
    return animation;
  }
  frame(fn: (elapsed: number, delta: number) => boolean): void {
    if (this.closed) return;
    let handle = 0;
    let start: number | undefined;
    let previous = 0;
    const release = this.own(() => cancelAnimationFrame(handle));
    const tick = (now: number) => {
      if (this.closed) return;
      start ??= now;
      let again = false;
      try {
        again = fn(now - start, Math.min(32, now - (previous || now)));
      } catch {
        this.fail();
      }
      previous = now;
      if (again && !this.closed) handle = requestAnimationFrame(tick);
      else release();
    };
    handle = requestAnimationFrame(tick);
  }
  style(element: HTMLElement, property: string, value: string): void {
    const old = element.style.getPropertyValue(property);
    const priority = element.style.getPropertyPriority(property);
    const hadAttribute = element.hasAttribute("style");
    element.style.setProperty(property, value, "important");
    this.own(() => {
      if (
        element.style.getPropertyValue(property) !== value ||
        element.style.getPropertyPriority(property) !== "important"
      )
        return;
      if (old) element.style.setProperty(property, old, priority);
      else element.style.removeProperty(property);
      if (!hadAttribute && !element.getAttribute("style")) element.removeAttribute("style");
    });
  }
  dispose(): void {
    if (this.closed) return;
    this.closed = true;
    for (const cleanup of [...this.cleanups].reverse()) {
      try {
        cleanup();
      } catch {
        this.fail();
      }
    }
    this.cleanups.clear();
  }
}
