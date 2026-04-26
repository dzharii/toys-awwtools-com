import { GLOBAL_SYMBOLS, ROOT_Z_INDEX } from "./constants.js";
import { copyPublicThemeContext } from "./theme.js";

const OVERLAY_CLASS = "awwbookmarklet-overlay-layer";

export function getOverlayLayer() {
  if (typeof document === "undefined") return null;
  const root = globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] || document.body || document.documentElement;
  let layer = root.querySelector?.(`:scope > .${OVERLAY_CLASS}`);
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

export function portalElement(element) {
  const layer = getOverlayLayer();
  if (!layer || element.parentNode === layer) return null;
  const restore = { parent: element.parentNode, nextSibling: element.nextSibling };
  copyPublicThemeContext(element, element);
  layer.append(element);
  return restore;
}

export function restoreElement(element, restore) {
  if (!restore?.parent?.isConnected) return;
  const next = restore.nextSibling?.parentNode === restore.parent ? restore.nextSibling : null;
  restore.parent.insertBefore(element, next);
}
