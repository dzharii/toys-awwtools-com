/**
 * Idle / focus / visibility gating.
 *
 * Tracks the last user-activity time and the tab's focus/visibility state so
 * dwell time never accumulates while the user is plausibly not reading.
 *
 * Attaches its own listeners and returns a destroy() that removes them. It does
 * not import UI. When activity resumes after idle, callers should reset the
 * sample clock so the idle gap is not credited.
 */

import { CONFIG } from "../config.js";
import { wallNow, now } from "../utils/time.js";

export function createIdleTracker(options) {
  const opts = options || {};
  const onActivityResume = typeof opts.onActivityResume === "function" ? opts.onActivityResume : null;

  let lastActivityAt = wallNow();
  let wasIdle = false;
  let destroyed = false;

  function markActivity() {
    if (destroyed) return;
    const wasIdleBefore = isHardIdle();
    lastActivityAt = wallNow();
    if (wasIdleBefore && onActivityResume) {
      onActivityResume();
    }
    wasIdle = false;
  }

  function msSinceActivity() {
    return wallNow() - lastActivityAt;
  }

  function isHardIdle() {
    return msSinceActivity() >= CONFIG.idleHardMs;
  }

  function isSoftIdle() {
    const delta = msSinceActivity();
    return delta >= CONFIG.idleSoftMs && delta < CONFIG.idleHardMs;
  }

  function isHidden() {
    return typeof document !== "undefined" && document.hidden === true;
  }

  function isFocused() {
    try {
      return document.hasFocus();
    } catch (_e) {
      return true;
    }
  }

  /**
   * Accumulation credit multiplier for the current gate state:
   *   1   -> full credit
   *   0.5 -> reduced credit (soft idle)
   *   0   -> no credit (hidden / unfocused / hard idle)
   */
  function accumulationFactor() {
    if (isHidden()) return 0;
    if (!isFocused()) return 0;
    if (isHardIdle()) return 0;
    if (isSoftIdle()) return 0.5;
    return 1;
  }

  function statusLabel() {
    if (isHidden()) return "hidden";
    if (!isFocused()) return "unfocused";
    if (isHardIdle()) return "idle";
    return "active";
  }

  // ---- Listeners -----------------------------------------------------------

  const activityEvents = ["scroll", "pointermove", "pointerdown", "keydown", "wheel", "touchstart"];
  const listeners = [];

  function addListener(target, type, handler, opts2) {
    target.addEventListener(type, handler, opts2 || { passive: true });
    listeners.push({ target, type, handler, opts: opts2 || { passive: true } });
  }

  const onActivity = () => markActivity();
  for (const type of activityEvents) {
    addListener(window, type, onActivity);
  }
  const onVisibility = () => {
    if (!isHidden()) markActivity();
  };
  addListener(document, "visibilitychange", onVisibility);
  const onFocus = () => markActivity();
  addListener(window, "focus", onFocus);

  function destroy() {
    destroyed = true;
    for (const l of listeners) {
      try {
        l.target.removeEventListener(l.type, l.handler, l.opts);
      } catch (_e) {
        /* ignore */
      }
    }
    listeners.length = 0;
  }

  return {
    markActivity,
    msSinceActivity,
    isHidden,
    isFocused,
    isHardIdle,
    isSoftIdle,
    accumulationFactor,
    statusLabel,
    destroy,
    get lastActivityAt() {
      return lastActivityAt;
    },
  };
}
