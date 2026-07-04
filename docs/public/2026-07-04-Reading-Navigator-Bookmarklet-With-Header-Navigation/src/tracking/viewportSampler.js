/**
 * Viewport sampler.
 *
 * The only high-frequency reading loop. It reads scroll position, viewport
 * size, focus/visibility/idle state, and cached segment geometry -- it never
 * segments, scans headings, calls getBoundingClientRect for all segments, or
 * rebuilds the UI. Real DOM layout comes from the geometry cache.
 */

import { CONFIG } from "../config.js";
import { getScrollTop, getViewportHeight, getDocumentHeight } from "../utils/dom.js";
import { intersectionRatio } from "../utils/math.js";
import { now, wallNow } from "../utils/time.js";

function classifyVelocity(pxPerSec) {
  const v = CONFIG.velocity;
  if (pxPerSec <= v.slowMaxPxPerSec) return "slow";
  if (pxPerSec <= v.normalMaxPxPerSec) return "normal";
  if (pxPerSec <= v.skimMaxPxPerSec) return "skim";
  return "jump";
}

export function createViewportSampler(deps) {
  const { geometry, tracker, idle, state, onSampled } = deps;

  let lastSampleAt = 0;
  let lastScrollTop = getScrollTop();
  const velocityWindow = [];
  let lastSampleMs = 0;

  function resetSampleClock() {
    lastSampleAt = 0;
    lastScrollTop = getScrollTop();
    velocityWindow.length = 0;
  }

  function smoothedVelocity(instant) {
    velocityWindow.push(instant);
    if (velocityWindow.length > CONFIG.velocitySmoothingSamples) velocityWindow.shift();
    let sum = 0;
    for (const v of velocityWindow) sum += v;
    return sum / velocityWindow.length;
  }

  function getViewportSnapshot() {
    const scrollTop = getScrollTop();
    const viewportHeight = getViewportHeight();
    const docHeight = getDocumentHeight() || 1;
    const top = scrollTop;
    const bottom = scrollTop + viewportHeight;
    return {
      top,
      bottom,
      height: viewportHeight,
      center: top + viewportHeight / 2,
      bandTop: top + viewportHeight * CONFIG.activeBandTopRatio,
      bandBottom: top + viewportHeight * CONFIG.activeBandBottomRatio,
      docHeight,
      scrollRatio: bottom / docHeight,
    };
  }

  function sample() {
    const t = now();

    // First sample establishes a baseline without crediting time.
    if (lastSampleAt === 0) {
      lastSampleAt = t;
      lastScrollTop = getScrollTop();
      publishSnapshot(getViewportSnapshot(), null, null, "slow");
      return;
    }

    const deltaMs = t - lastSampleAt;
    // Skip implausible gaps (sleep / frozen tab): reset instead of crediting.
    if (deltaMs <= 0 || deltaMs > CONFIG.maxSampleGapMs) {
      resetSampleClock();
      lastSampleAt = t;
      tracker.resetVisibility();
      return;
    }

    const start = now();
    const viewport = getViewportSnapshot();

    const scrollDelta = Math.abs(viewport.top - lastScrollTop);
    const instantVelocity = scrollDelta / (deltaMs / 1000);
    const velocity = smoothedVelocity(instantVelocity);
    const velocityClass = classifyVelocity(velocity);

    const paused = state.tracking.pausedByUser === true;
    const statusLabel = paused ? "paused" : idle.statusLabel();
    const focusFactor = paused ? 0 : idle.accumulationFactor();
    const canAccumulate = focusFactor > 0;

    tracker.accountSessionTime(deltaMs, statusLabel, paused);

    // Determine the current segment (nearest to the active band center) for UI.
    const bandCenter = (viewport.bandTop + viewport.bandBottom) / 2;
    const currentSegment = geometry.findSegmentAtY(bandCenter);

    if (canAccumulate) {
      const candidates = geometry.findSegmentsNearRange(viewport.top, viewport.bottom);
      const wc = wallNow();
      tracker.beginSample();
      for (const seg of candidates) {
        const visibleRatio = intersectionRatio(seg.top, seg.bottom, viewport.top, viewport.bottom);
        if (visibleRatio <= 0) continue;
        const activeRatio = intersectionRatio(seg.top, seg.bottom, viewport.bandTop, viewport.bandBottom);
        const centerOverlap = intersectionRatio(seg.top, seg.bottom, bandCenter - 8, bandCenter + 8);
        tracker.applyExposure(seg, {
          deltaMs,
          visibleRatio,
          activeRatio,
          centerOverlap,
          velocityClass,
          focusFactor,
          wallClock: wc,
        });
      }
      const currentStats = currentSegment ? tracker.getStats(currentSegment.id) : null;
      tracker.endSample({
        currentSegment,
        currentSegmentStats: currentStats,
        velocityClass,
        canAccumulate: true,
      });
    } else {
      // Not accumulating: keep UI current but reset visit tracking so a return
      // after idle/hidden counts as a fresh visit.
      tracker.resetVisibility();
      tracker.endSample({
        currentSegment,
        currentSegmentStats: null,
        velocityClass,
        canAccumulate: false,
      });
    }

    // Update raw-scroll fallback (used only as last-resort restore).
    state.restore.lastRawScroll = {
      scrollTop: viewport.top,
      scrollRatio: viewport.scrollRatio,
      savedAt: wallNow(),
    };

    lastSampleAt = t;
    lastScrollTop = viewport.top;
    lastSampleMs = now() - start;
    state.performance.lastSampleMs = lastSampleMs;
    state.tracking.sampleCount = tracker.session.sampleCount;

    publishSnapshot(viewport, currentSegment, velocity, velocityClass, statusLabel);
  }

  function publishSnapshot(viewport, currentSegment, velocity, velocityClass, statusLabel) {
    state.viewport = viewport;
    state.tracking.currentSegmentId = currentSegment ? currentSegment.id : null;
    state.tracking.velocity = velocity || 0;
    state.tracking.velocityClass = velocityClass || "slow";
    state.tracking.statusLabel = statusLabel || (state.tracking.pausedByUser ? "paused" : idle.statusLabel());
    if (typeof onSampled === "function") onSampled();
  }

  return {
    sample,
    resetSampleClock,
    getViewportSnapshot,
    get lastSampleMs() {
      return lastSampleMs;
    },
  };
}
