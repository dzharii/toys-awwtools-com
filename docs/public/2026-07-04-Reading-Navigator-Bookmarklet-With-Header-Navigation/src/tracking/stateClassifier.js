/**
 * Segment state classification.
 *
 * Pure, deterministic functions. Given a segment and its stats plus lightweight
 * context flags, derive a read state. This module has no DOM or timing side
 * effects so it can be tested with synthetic stats.
 *
 * `manual-mark` and `last-focus` are treated as overlay flags in the context so
 * the underlying computed read state is never lost.
 */

import { CONFIG, READ_THRESHOLD_BASE_MS } from "../config.js";

export function getReadThresholdMs(segment) {
  const base = READ_THRESHOLD_BASE_MS[segment.type] || 4000;
  const heightFactor = Math.min(2.5, Math.max(0.75, (segment.height || 260) / 260));
  return Math.round(base * heightFactor);
}

/**
 * Compute the underlying read state ignoring current/last-focus/manual overlays.
 */
export function computeReadState(segment, stats) {
  const thresholdMs = getReadThresholdMs(segment);

  if (stats.totalFocusedMs >= thresholdMs && stats.activeVisitCount > 1) {
    return "reread";
  }
  if (stats.totalFocusedMs >= thresholdMs) {
    return "probably-read";
  }
  if (stats.fastPassCount > 0 && stats.totalActiveMs < thresholdMs * 0.35) {
    return "skimmed";
  }
  if (stats.totalVisibleMs > 0) {
    return "seen";
  }
  return "unseen";
}

/**
 * Full classification including overlays. Returns the display state string.
 */
export function classifySegment(segment, stats, context) {
  const ctx = context || {};
  if (ctx.manualMarkSegmentId === segment.id) return "manual-mark";
  if (ctx.currentSegmentId === segment.id) return "active";
  if (ctx.lastFocusSegmentId === segment.id) return "last-focus";
  return computeReadState(segment, stats);
}

/** Rich view state that keeps read state separate from overlay flags. */
export function segmentViewState(segment, stats, context) {
  const ctx = context || {};
  return {
    readState: computeReadState(segment, stats),
    isCurrent: ctx.currentSegmentId === segment.id,
    isLastFocus: ctx.lastFocusSegmentId === segment.id,
    isManualMark: ctx.manualMarkSegmentId === segment.id,
  };
}

/** Whether this sample's segment can be promoted to the last reading focus. */
export function shouldPromoteToLastFocus(stats, sampleContext) {
  if (!sampleContext.canAccumulate) return false;
  if (sampleContext.velocityClass === "skim") return false;
  if (sampleContext.velocityClass === "jump") return false;
  if (stats.totalFocusedMs < CONFIG.lastFocusMinFocusedMs) return false;
  if (stats.maxActiveRatio < CONFIG.lastFocusMinActiveRatio) return false;
  return true;
}
