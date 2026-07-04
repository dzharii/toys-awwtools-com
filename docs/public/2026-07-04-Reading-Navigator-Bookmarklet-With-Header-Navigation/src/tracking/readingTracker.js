/**
 * Reading tracker.
 *
 * Owns per-segment reading statistics and session statistics. Applies viewport
 * exposure into dwell-time evidence, weighted by visibility, active-band
 * overlap, scroll-velocity class, and focus/idle factor.
 *
 * This module must NOT import UI. It exposes plain data and small methods; the
 * UI consumes snapshots elsewhere.
 */

import { CONFIG } from "../config.js";
import { wallNow } from "../utils/time.js";
import { computeReadState, shouldPromoteToLastFocus } from "./stateClassifier.js";

function freshStats(segmentId) {
  return {
    segmentId,
    firstSeenAt: null,
    lastSeenAt: null,
    firstActiveAt: null,
    lastActiveAt: null,
    totalVisibleMs: 0,
    totalActiveMs: 0,
    totalFocusedMs: 0,
    centerlineMs: 0,
    visitCount: 0,
    activeVisitCount: 0,
    maxVisibleRatio: 0,
    maxActiveRatio: 0,
    fastPassCount: 0,
    lastVelocityClass: "none",
    state: "unseen",
    stateUpdatedAt: null,
  };
}

// Active-band reading-evidence credit factor by velocity class.
const VELOCITY_ACTIVE_FACTOR = {
  slow: 1.0,
  normal: 0.6,
  skim: 0.12,
  jump: 0,
  none: 0.8,
};

export function createReadingTracker(callbacks) {
  const cb = callbacks || {};
  const statsBySegmentId = new Map();

  let prevVisible = new Set();
  let prevActive = new Set();
  let nextVisible = new Set();
  let nextActive = new Set();

  let currentSegmentId = null;
  let lastFocusSegmentId = null;
  let lastFocusSavedAt = null;
  let manualMarkSegmentId = null;
  let manualMark = null; // { segmentId, headingPath, savedAt, anchors }

  const session = {
    startedAt: wallNow(),
    activeTrackedMs: 0,
    pausedMs: 0,
    idleMs: 0,
    hiddenMs: 0,
    sampleCount: 0,
  };

  function ensureStats(segmentId) {
    let s = statsBySegmentId.get(segmentId);
    if (!s) {
      s = freshStats(segmentId);
      statsBySegmentId.set(segmentId, s);
    }
    return s;
  }

  function getStats(segmentId) {
    return statsBySegmentId.get(segmentId) || null;
  }

  function beginSample() {
    nextVisible = new Set();
    nextActive = new Set();
  }

  /**
   * Apply one segment's exposure for the current sample.
   * data: { deltaMs, visibleRatio, activeRatio, centerOverlap, velocityClass,
   *         focusFactor, wallClock }
   */
  function applyExposure(segment, data) {
    const stats = ensureStats(segment.id);
    const wc = data.wallClock;
    const focusFactor = typeof data.focusFactor === "number" ? data.focusFactor : 1;
    stats.lastVelocityClass = data.velocityClass;

    if (data.visibleRatio > 0) {
      nextVisible.add(segment.id);
      if (!prevVisible.has(segment.id)) {
        stats.visitCount += 1;
        if (!stats.firstSeenAt) stats.firstSeenAt = wc;
      }
      stats.lastSeenAt = wc;
      if (data.visibleRatio > stats.maxVisibleRatio) stats.maxVisibleRatio = data.visibleRatio;
      stats.totalVisibleMs += data.deltaMs * data.visibleRatio * focusFactor;
    }

    if (data.activeRatio > 0) {
      nextActive.add(segment.id);
      if (!prevActive.has(segment.id)) {
        stats.activeVisitCount += 1;
        if (!stats.firstActiveAt) stats.firstActiveAt = wc;
      }
      stats.lastActiveAt = wc;
      if (data.activeRatio > stats.maxActiveRatio) stats.maxActiveRatio = data.activeRatio;

      const rawActive = data.deltaMs * data.activeRatio * focusFactor;
      stats.totalActiveMs += rawActive;

      const velFactor = VELOCITY_ACTIVE_FACTOR[data.velocityClass] || 0.5;
      stats.totalFocusedMs += rawActive * velFactor;

      if (data.centerOverlap > 0) {
        stats.centerlineMs += data.deltaMs * data.centerOverlap * focusFactor;
      }
    }

    // Fast-pass evidence: segment exposed during a high-velocity sample.
    if ((data.velocityClass === "skim" || data.velocityClass === "jump") && data.visibleRatio > 0) {
      if (!prevVisible.has(segment.id)) stats.fastPassCount += 1;
    }

    // Update computed read state (overlay flags applied in classifier elsewhere).
    const nextState = computeReadState(segment, stats);
    if (nextState !== stats.state) {
      stats.state = nextState;
      stats.stateUpdatedAt = wc;
      if (cb.onSignificantStateChange) cb.onSignificantStateChange(segment.id, nextState);
    }
  }

  /**
   * Finish the sample. `context` provides the chosen current segment and
   * whether accumulation was allowed, so we can promote the last reading focus.
   * context: { currentSegment, currentSegmentStats, velocityClass, canAccumulate }
   */
  function endSample(context) {
    prevVisible = nextVisible;
    prevActive = nextActive;
    session.sampleCount += 1;

    const ctx = context || {};
    currentSegmentId = ctx.currentSegment ? ctx.currentSegment.id : null;

    if (ctx.currentSegment && ctx.currentSegmentStats) {
      const promote = shouldPromoteToLastFocus(ctx.currentSegmentStats, {
        canAccumulate: ctx.canAccumulate,
        velocityClass: ctx.velocityClass,
      });
      if (promote && currentSegmentId !== lastFocusSegmentId) {
        setLastFocus(currentSegmentId, ctx.currentSegment);
      }
    }
  }

  function accountSessionTime(deltaMs, statusLabel, paused) {
    if (paused) {
      session.pausedMs += deltaMs;
    } else if (statusLabel === "hidden") {
      session.hiddenMs += deltaMs;
    } else if (statusLabel === "idle") {
      session.idleMs += deltaMs;
    } else if (statusLabel === "active") {
      session.activeTrackedMs += deltaMs;
    }
  }

  function setLastFocus(segmentId, segment) {
    lastFocusSegmentId = segmentId;
    lastFocusSavedAt = wallNow();
    if (cb.onLastFocusChange) cb.onLastFocusChange(segmentId, segment);
  }

  function setManualMark(segment, headingPath, anchors) {
    manualMarkSegmentId = segment ? segment.id : null;
    manualMark = segment
      ? {
          segmentId: segment.id,
          headingPath: headingPath || [],
          savedAt: wallNow(),
          anchors: anchors || segment.anchors || null,
        }
      : null;
    if (cb.onManualMarkChange) cb.onManualMarkChange(manualMark);
  }

  function clearManualMark() {
    manualMarkSegmentId = null;
    manualMark = null;
    if (cb.onManualMarkChange) cb.onManualMarkChange(null);
  }

  /** Load persisted per-segment stats (by stable id) into the live map. */
  function hydrate(persisted) {
    if (!persisted) return;
    if (persisted.segments) {
      for (const id in persisted.segments) {
        const s = freshStats(id);
        Object.assign(s, persisted.segments[id]);
        s.segmentId = id;
        statsBySegmentId.set(id, s);
      }
    }
    if (persisted.restore) {
      if (persisted.restore.lastFocus && persisted.restore.lastFocus.segmentId) {
        lastFocusSegmentId = persisted.restore.lastFocus.segmentId;
        lastFocusSavedAt = persisted.restore.lastFocus.savedAt || null;
      }
      if (persisted.restore.manualMark && persisted.restore.manualMark.segmentId) {
        manualMarkSegmentId = persisted.restore.manualMark.segmentId;
        manualMark = persisted.restore.manualMark;
      }
    }
  }

  function resetVisibility() {
    prevVisible = new Set();
    prevActive = new Set();
  }

  return {
    statsBySegmentId,
    session,
    ensureStats,
    getStats,
    beginSample,
    applyExposure,
    endSample,
    accountSessionTime,
    setLastFocus,
    setManualMark,
    clearManualMark,
    hydrate,
    resetVisibility,
    get currentSegmentId() {
      return currentSegmentId;
    },
    get lastFocusSegmentId() {
      return lastFocusSegmentId;
    },
    get lastFocusSavedAt() {
      return lastFocusSavedAt;
    },
    get manualMarkSegmentId() {
      return manualMarkSegmentId;
    },
    get manualMark() {
      return manualMark;
    },
    set lastFocusSegmentId(v) {
      lastFocusSegmentId = v;
    },
  };
}
