// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { GLOBAL_SYMBOLS, ROOT_Z_INDEX } from "./constants.js";
import { copyPublicThemeContext } from "./theme.js";

const OVERLAY_CLASS = "awwbookmarklet-overlay-layer";

export interface PortalRestore {
  parent: ParentNode;
  nextSibling: ChildNode | null;
}

type RuntimeGlobal = typeof globalThis & Record<symbol, unknown>;

/** Lazily creates the shared fixed layer used for menus and popovers. */
export function getOverlayLayer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const global = globalThis as RuntimeGlobal;
  const root = (global[GLOBAL_SYMBOLS.lastAcquiredRoot] as ParentNode | undefined) || document.body || document.documentElement;
  let layer = root.querySelector?.(`:scope > .${OVERLAY_CLASS}`) as HTMLElement | null | undefined;
  if (!layer) {
    layer = document.createElement("div");
    layer.className = OVERLAY_CLASS;
    Object.assign(layer.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: String(ROOT_Z_INDEX + 5000)
    });
    root.append(layer);
  }
  return layer;
}

/** Moves an element into the overlay layer and records enough state to put it back. */
export function portalElement(element: HTMLElement): PortalRestore | null {
  const layer = getOverlayLayer();
  if (!layer || element.parentNode === layer || !element.parentNode) return null;
  const restore = { parent: element.parentNode, nextSibling: element.nextSibling };
  copyPublicThemeContext(element, element);
  layer.append(element);
  return restore;
}

/** Restores a portaled element only when its original parent still exists. */
export function restoreElement(element: HTMLElement, restore: PortalRestore | null): void {
  if (!restore?.parent?.isConnected) return;
  const next = restore.nextSibling?.parentNode === restore.parent ? restore.nextSibling : null;
  restore.parent.insertBefore(element, next);
}
