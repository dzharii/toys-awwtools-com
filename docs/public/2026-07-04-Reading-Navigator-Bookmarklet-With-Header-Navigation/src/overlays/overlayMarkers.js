/**
 * On-page overlay markers.
 *
 * Subtle, non-layout-altering, non-interactive markers rendered in a fixed
 * overlay layer appended to the document body. All markers use
 * pointer-events:none so they never block text selection or links. Everything
 * is removed on destroy(). Honors reduced-motion for the restore highlight.
 */

import { CONFIG } from "../config.js";
import { getScrollTop, prefersReducedMotion } from "../utils/dom.js";

const LAYER_ID = CONFIG.hostId + "-overlays";

export function createOverlayMarkers() {
  let layer = null;
  let currentBar = null;
  let lastFocusBar = null;
  let manualBar = null;
  let debugBand = null;
  let highlightBox = null;
  let highlightTimer = null;
  let debugEnabled = false;

  function mount() {
    if (layer) return;
    layer = document.createElement("div");
    layer.id = LAYER_ID;
    layer.setAttribute(CONFIG.hostDataAttr, "overlay");
    Object.assign(layer.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "0",
      height: "0",
      margin: "0",
      padding: "0",
      border: "0",
      pointerEvents: "none",
      zIndex: "2147483646",
    });

    currentBar = makeBar("rgba(37, 99, 235, 0.85)");
    lastFocusBar = makeBar("rgba(217, 119, 6, 0.9)");
    manualBar = makeBar("rgba(147, 51, 234, 0.9)");

    layer.appendChild(currentBar);
    layer.appendChild(lastFocusBar);
    layer.appendChild(manualBar);
    document.body.appendChild(layer);
  }

  function makeBar(color) {
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      position: "fixed",
      left: "0",
      width: "4px",
      height: "0",
      background: color,
      borderRadius: "0 3px 3px 0",
      boxShadow: "0 0 4px " + color,
      pointerEvents: "none",
      opacity: "0",
      transition: prefersReducedMotion() ? "none" : "top 0.15s linear, height 0.15s linear, opacity 0.2s",
    });
    return bar;
  }

  function positionBar(bar, segment, scrollTop) {
    if (!bar) return;
    if (!segment) {
      bar.style.opacity = "0";
      return;
    }
    const screenTop = segment.top - scrollTop;
    const height = Math.max(6, Math.min(segment.height, window.innerHeight));
    // Hide if fully off-screen.
    if (screenTop + height < 0 || screenTop > window.innerHeight) {
      bar.style.opacity = "0";
      return;
    }
    bar.style.top = screenTop + "px";
    bar.style.height = height + "px";
    bar.style.opacity = "1";
  }

  /**
   * update({ segmentsById, currentSegmentId, lastFocusSegmentId,
   *          manualMarkSegmentId, viewport })
   */
  function update(info) {
    if (!layer || !info) return;
    const scrollTop = info.viewport ? info.viewport.top : getScrollTop();
    const byId = info.segmentsById;
    positionBar(currentBar, byId && info.currentSegmentId ? byId.get(info.currentSegmentId) : null, scrollTop);
    positionBar(lastFocusBar, byId && info.lastFocusSegmentId ? byId.get(info.lastFocusSegmentId) : null, scrollTop);
    positionBar(manualBar, byId && info.manualMarkSegmentId ? byId.get(info.manualMarkSegmentId) : null, scrollTop);

    if (debugEnabled && info.viewport) {
      showDebugBand(info.viewport, scrollTop);
    } else if (debugBand) {
      debugBand.style.opacity = "0";
    }
  }

  function showDebugBand(viewport, scrollTop) {
    if (!debugBand) {
      debugBand = document.createElement("div");
      Object.assign(debugBand.style, {
        position: "fixed",
        left: "0",
        width: "100%",
        background: "rgba(37, 99, 235, 0.08)",
        borderTop: "1px dashed rgba(37,99,235,0.5)",
        borderBottom: "1px dashed rgba(37,99,235,0.5)",
        pointerEvents: "none",
      });
      layer.appendChild(debugBand);
    }
    debugBand.style.top = viewport.bandTop - scrollTop + "px";
    debugBand.style.height = viewport.bandBottom - viewport.bandTop + "px";
    debugBand.style.opacity = "1";
  }

  function setDebug(on) {
    debugEnabled = !!on;
    if (!debugEnabled && debugBand) debugBand.style.opacity = "0";
  }

  /** Briefly highlight a restored element without altering layout. */
  function showRestoreHighlight(element) {
    if (!layer || !element) return;
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
    if (!highlightBox) {
      highlightBox = document.createElement("div");
      Object.assign(highlightBox.style, {
        position: "fixed",
        pointerEvents: "none",
        border: "2px solid rgba(217, 119, 6, 0.95)",
        borderRadius: "6px",
        background: "rgba(217, 119, 6, 0.12)",
        boxShadow: "0 0 0 4px rgba(217,119,6,0.15)",
        opacity: "0",
        transition: prefersReducedMotion() ? "none" : "opacity 0.25s ease",
        zIndex: "2147483646",
      });
      layer.appendChild(highlightBox);
    }
    const reposition = () => {
      const rect = element.getBoundingClientRect();
      highlightBox.style.top = rect.top - 4 + "px";
      highlightBox.style.left = rect.left - 4 + "px";
      highlightBox.style.width = rect.width + 8 + "px";
      highlightBox.style.height = rect.height + 8 + "px";
    };
    reposition();
    highlightBox.style.opacity = "1";

    highlightTimer = setTimeout(() => {
      if (highlightBox) highlightBox.style.opacity = "0";
      highlightTimer = null;
    }, CONFIG.restoreHighlightMs);
  }

  function destroy() {
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = currentBar = lastFocusBar = manualBar = debugBand = highlightBox = null;
  }

  return { mount, update, setDebug, showRestoreHighlight, destroy };
}
