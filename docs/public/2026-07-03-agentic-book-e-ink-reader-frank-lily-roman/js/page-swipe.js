// Mobile page-turn swipe gestures for page mode only.
//
// Uses Pointer Events (a unified model for touch/pen/mouse) so a single code
// path recognizes a deliberate horizontal swipe. Thresholds are intentionally
// conservative to avoid accidental page turns while reading or selecting text.
// The controller never manipulates page indices itself: it calls the same
// next/previous actions used by the Prev/Next controls. Swipe is unavailable in
// scroll mode, while settings is open, during a transition, on interactive or
// horizontally-scrollable targets, and for multi-touch/vertical/short/slow
// gestures.

import { log } from "./logging.js";

// Conservative thresholds. See design note E00.
const SWIPE_MIN_DISTANCE_PX = 96;
const SWIPE_MIN_DISTANCE_VIEWPORT_RATIO = 0.22;
const SWIPE_MAX_VERTICAL_DISTANCE_PX = 55;
const SWIPE_MAX_VERTICAL_TO_HORIZONTAL_RATIO = 0.45;
const SWIPE_MAX_DURATION_MS = 900;
const SWIPE_MIN_DURATION_MS = 80;

// Swipe is offered on touch/pen pointers, or on any pointer when the viewport
// is mobile-sized. Mouse on a desktop-sized viewport is excluded so ordinary
// text selection with a drag is never mistaken for a page turn.
const MOBILE_MAX_WIDTH_PX = 720;

// Selector for elements a swipe must not start from: interactive controls, the
// reader chrome, and anything that can scroll horizontally (code blocks).
const EXCLUDED_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[role="link"]',
  '[contenteditable="true"]',
  "pre",
  "code",
  ".code-block",
  ".reader__bar",
  ".reader__footer",
  ".settings",
  ".toast",
  ".notice",
].join(",");

function isExcludedTarget(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(EXCLUDED_SELECTOR));
}

function effectiveMinDistance() {
  return Math.max(
    SWIPE_MIN_DISTANCE_PX,
    window.innerWidth * SWIPE_MIN_DISTANCE_VIEWPORT_RATIO
  );
}

function isMobileContext(pointerType) {
  return (
    pointerType === "touch" ||
    pointerType === "pen" ||
    window.innerWidth <= MOBILE_MAX_WIDTH_PX
  );
}

/**
 * Attach page-swipe recognition to a stage element.
 *
 * @param {HTMLElement} stage the reader stage (contains the paper surface)
 * @param {object} opts
 * @param {() => boolean} opts.isPagedActive true only when a document is loaded,
 *   the reader is in page mode, settings is closed, and no transition is busy.
 * @param {() => void} opts.onNext advance one page (same action as Next)
 * @param {() => void} opts.onPrev go back one page (same action as Prev)
 * @returns {{ detach: () => void }}
 */
export function createPageSwipe(stage, { isPagedActive, onNext, onPrev }) {
  const state = {
    active: false,
    pointerId: null,
    pointerType: "",
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    canceled: false,
    horizontalIntent: false,
  };

  // When a deliberate swipe is recognized, a browser may still synthesize a
  // click at the release point. If that point lands on an edge navigation zone,
  // the click would fire a second, conflicting page turn. Suppress the next
  // click for a short window after a recognized swipe.
  let suppressClickUntil = 0;

  function reset() {
    state.active = false;
    state.pointerId = null;
    state.pointerType = "";
    state.canceled = false;
    state.horizontalIntent = false;
  }

  function releaseCapture() {
    if (state.pointerId != null && stage.hasPointerCapture?.(state.pointerId)) {
      try {
        stage.releasePointerCapture(state.pointerId);
      } catch (_) {
        // capture may already be gone; ignore.
      }
    }
  }

  function onPointerDown(e) {
    // Only a single primary pointer starts a gesture.
    if (state.active) {
      // A second pointer means a multi-touch gesture: cancel any candidate.
      state.canceled = true;
      return;
    }
    if (!e.isPrimary) return;
    if (!isPagedActive()) return;
    if (!isMobileContext(e.pointerType)) return;
    if (isExcludedTarget(e.target)) return;

    state.active = true;
    state.canceled = false;
    state.horizontalIntent = false;
    state.pointerId = e.pointerId;
    state.pointerType = e.pointerType;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.startTime = performance.now();

    try {
      stage.setPointerCapture(e.pointerId);
    } catch (_) {
      // Not fatal: without capture we still track events on the stage.
    }
    // Do not navigate and do not preventDefault here.
  }

  function onPointerMove(e) {
    if (!state.active || e.pointerId !== state.pointerId || state.canceled) return;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    const dx = state.lastX - state.startX;
    const dy = state.lastY - state.startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Movement that is clearly vertical is a scroll intent, not a page turn.
    if (absY > SWIPE_MAX_VERTICAL_DISTANCE_PX && absY > absX) {
      state.canceled = true;
      return;
    }

    // Once a clearly horizontal intent is established on a touch/pen pointer,
    // suppress default so the browser does not begin text selection. Kept
    // narrow: mouse selection on desktop is never touched.
    if (
      !state.horizontalIntent &&
      absX > 12 &&
      absX > absY &&
      (state.pointerType === "touch" || state.pointerType === "pen")
    ) {
      state.horizontalIntent = true;
    }
    if (state.horizontalIntent && e.cancelable) {
      e.preventDefault();
    }
  }

  function onPointerUp(e) {
    if (!state.active || e.pointerId !== state.pointerId) return;

    const canceled = state.canceled;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    const duration = performance.now() - state.startTime;

    releaseCapture();
    reset();

    if (canceled) return;
    // The world may have changed during the gesture (mode switch, settings).
    if (!isPagedActive()) return;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const minDistance = effectiveMinDistance();

    // Threshold checks (design note E00).
    if (absX < minDistance) return; // too short
    if (absY > SWIPE_MAX_VERTICAL_DISTANCE_PX) return; // too vertical
    if (absY / absX > SWIPE_MAX_VERTICAL_TO_HORIZONTAL_RATIO) return; // too diagonal
    if (duration > SWIPE_MAX_DURATION_MS) return; // too slow / drag / selection
    if (duration < SWIPE_MIN_DURATION_MS) return; // implausibly fast

    if (dx < 0) {
      log.debug("swipe:next", { dx: Math.round(dx), dur: Math.round(duration) });
      suppressClickUntil = performance.now() + 400;
      onNext();
    } else {
      log.debug("swipe:prev", { dx: Math.round(dx), dur: Math.round(duration) });
      suppressClickUntil = performance.now() + 400;
      onPrev();
    }
  }

  function onPointerCancel(e) {
    if (e.pointerId !== state.pointerId) return;
    releaseCapture();
    reset();
  }

  // Swallow the click a browser may synthesize at the end of a recognized
  // swipe so it cannot trigger a second page turn on an edge navigation zone.
  function onClickCapture(e) {
    if (performance.now() <= suppressClickUntil) {
      suppressClickUntil = 0;
      e.preventDefault();
      e.stopPropagation();
    }
  }

  stage.addEventListener("pointerdown", onPointerDown);
  // Non-passive so preventDefault can take effect once a horizontal swipe is
  // recognized; we only prevent default in that narrow case.
  stage.addEventListener("pointermove", onPointerMove, { passive: false });
  stage.addEventListener("pointerup", onPointerUp);
  stage.addEventListener("pointercancel", onPointerCancel);
  stage.addEventListener("lostpointercapture", onPointerCancel);
  stage.addEventListener("click", onClickCapture, true);

  return {
    detach() {
      releaseCapture();
      reset();
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      stage.removeEventListener("lostpointercapture", onPointerCancel);
      stage.removeEventListener("click", onClickCapture, true);
    },
  };
}
