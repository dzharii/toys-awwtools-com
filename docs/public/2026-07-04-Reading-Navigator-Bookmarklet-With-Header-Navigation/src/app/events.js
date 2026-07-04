/**
 * Global event wiring.
 *
 * Attaches page-level listeners and observers through the lifecycle manager so
 * they are all cleaned up on close. Scroll/resize/visibility only flip dirty
 * flags or schedule cheap updates; the sampler loop does the real work.
 * MutationObserver is an invalidation signal only (debounced rescan). History
 * is wrapped defensively for SPA route detection and restored on cleanup.
 */

import { CONFIG } from "../config.js";
import { isInsideAppHost } from "../utils/dom.js";
import { normalizeUrl } from "../identity/urlNormalize.js";

export function attachGlobalEvents(deps) {
  const { lifecycle, scheduler, state, actions, callbacks, host } = deps;
  const cb = callbacks || {};

  // ---- Scroll: cheap UI update only (geometry is document-space) -----------
  lifecycle.addListener(
    window,
    "scroll",
    () => {
      scheduler.scheduleUiUpdate("scroll");
    },
    { passive: true }
  );

  // ---- Resize: geometry may have changed -----------------------------------
  lifecycle.addListener(
    window,
    "resize",
    () => {
      scheduler.scheduleGeometryRefresh("resize");
      scheduler.scheduleUiUpdate("resize");
    },
    { passive: true }
  );

  // ---- Visibility / focus: update status, reset clock on resume ------------
  lifecycle.addListener(document, "visibilitychange", () => {
    if (!document.hidden && cb.onResume) cb.onResume();
    scheduler.scheduleUiUpdate("visibility");
  });
  lifecycle.addListener(window, "focus", () => {
    if (cb.onResume) cb.onResume();
    scheduler.scheduleUiUpdate("focus");
  });
  lifecycle.addListener(window, "blur", () => {
    scheduler.scheduleUiUpdate("blur");
  });

  // ---- Pagehide: attempt a final compact save ------------------------------
  lifecycle.addListener(window, "pagehide", () => {
    if (cb.onFlushSave) cb.onFlushSave("pagehide");
  });

  // ---- Images loading inside content can shift layout ----------------------
  lifecycle.addListener(
    window,
    "load",
    () => {
      scheduler.scheduleGeometryRefresh("window-load");
    },
    { once: true }
  );

  // ---- MutationObserver: invalidation signal only --------------------------
  const contentRoot = cb.getContentRoot ? cb.getContentRoot() : document.body;
  let mutationTimer = null;
  const observer = new MutationObserver((mutations) => {
    let relevant = false;
    for (const m of mutations) {
      if (m.target && isInsideAppHost(m.target)) continue;
      if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) {
        relevant = true;
        break;
      }
    }
    if (!relevant) return;
    state.performance.contentDirty = true;
    if (mutationTimer) return; // debounce
    mutationTimer = setTimeout(() => {
      mutationTimer = null;
      if (state.performance.contentDirty && cb.onContentMutation) cb.onContentMutation();
    }, CONFIG.mutationDebounceMs);
  });
  try {
    observer.observe(contentRoot || document.body, { childList: true, subtree: true });
    lifecycle.trackObserver(observer);
    lifecycle.register(() => {
      if (mutationTimer) clearTimeout(mutationTimer);
    });
  } catch (_e) {
    /* observing may fail on exotic pages; fail open */
  }

  // ---- Route detection (SPA) -----------------------------------------------
  let lastUrl = normalizeUrl(window.location.href);
  const checkRoute = () => {
    const current = normalizeUrl(window.location.href);
    if (current !== lastUrl) {
      lastUrl = current;
      if (cb.onRouteChange) cb.onRouteChange();
    }
  };

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  let historyWrapped = false;
  try {
    history.pushState = function () {
      const ret = originalPushState.apply(this, arguments);
      try {
        checkRoute();
      } catch (_e) {
        /* ignore */
      }
      return ret;
    };
    history.replaceState = function () {
      const ret = originalReplaceState.apply(this, arguments);
      try {
        checkRoute();
      } catch (_e) {
        /* ignore */
      }
      return ret;
    };
    historyWrapped = true;
    lifecycle.register(() => {
      if (historyWrapped) {
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
      }
    });
  } catch (_e) {
    /* history may be non-configurable; rely on polling */
  }
  lifecycle.addListener(window, "popstate", checkRoute);
  const routePoll = setInterval(checkRoute, 2000);
  lifecycle.register(() => clearInterval(routePoll));

  // ---- Keyboard shortcuts --------------------------------------------------
  function isTypingContext(target) {
    if (!target) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (target.isContentEditable) return true;
    return false;
  }

  function matches(e, def) {
    return (
      !!def &&
      e.altKey === !!def.alt &&
      e.shiftKey === !!def.shift &&
      !e.ctrlKey &&
      !e.metaKey &&
      e.key.toLowerCase() === def.key
    );
  }

  lifecycle.addListener(document, "keydown", (e) => {
    // Escape closes when focus is inside the panel.
    if (e.key === "Escape" && host && document.activeElement === host) {
      actions.close();
      return;
    }
    if (isTypingContext(e.target)) return;
    const s = CONFIG.shortcuts;
    if (matches(e, s.togglePanel)) {
      e.preventDefault();
      actions.toggleVisibility();
    } else if (matches(e, s.jumpLastReading)) {
      e.preventDefault();
      actions.jumpToLastReading();
    } else if (matches(e, s.markSpot)) {
      e.preventDefault();
      actions.markSpot();
    } else if (matches(e, s.pauseResume)) {
      e.preventDefault();
      actions.togglePause();
    } else if (matches(e, s.compactExpand)) {
      e.preventDefault();
      actions.toggleMode();
    }
  });
}
