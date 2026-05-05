// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { DEFAULT_GEOMETRY } from "./constants.js";
import { clampRect, getSpawnRect, getViewportRect } from "./geometry.js";

export class WindowManager {
  #windows = new Set();
  #activeWindow = null;
  #nextZ = 1;
  #onViewportChange;
  #destroyed = false;

  constructor() {
    this.#onViewportChange = () => this.clampAll();

    window.addEventListener("resize", this.#onViewportChange, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", this.#onViewportChange, { passive: true });
      window.visualViewport.addEventListener("scroll", this.#onViewportChange, { passive: true });
    }
  }

  register(win) {
    if (this.#destroyed || this.#windows.has(win)) return;

    this.#windows.add(win);
    const rect = win.getRect();
    if (!rect) {
      win.setRect(this.getSpawnRect());
    } else {
      win.setRect(clampRect(rect));
    }

    this.focus(win);
  }

  unregister(win) {
    if (!this.#windows.delete(win)) return;

    if (this.#activeWindow === win) {
      this.#activeWindow = null;
      const fallback = [...this.#windows].at(-1) ?? null;
      if (fallback) this.focus(fallback);
    }
  }

  getSpawnRect() {
    return getSpawnRect(this.#windows.size, getViewportRect(), DEFAULT_GEOMETRY);
  }

  focus(win) {
    if (!this.#windows.has(win)) return;

    if (this.#activeWindow && this.#activeWindow !== win) {
      this.#activeWindow.setActive(false);
    }

    this.#activeWindow = win;
    win.setActive(true);
    win.setZIndex(this.#nextZ++);
  }

  clampAll() {
    for (const win of this.#windows) {
      const rect = win.getRect();
      if (!rect) continue;
      win.setRect(clampRect(rect));
    }
  }

  destroy() {
    if (this.#destroyed) return;
    this.#destroyed = true;

    window.removeEventListener("resize", this.#onViewportChange);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener("resize", this.#onViewportChange);
      window.visualViewport.removeEventListener("scroll", this.#onViewportChange);
    }

    this.#windows.clear();
    this.#activeWindow = null;
  }
}
