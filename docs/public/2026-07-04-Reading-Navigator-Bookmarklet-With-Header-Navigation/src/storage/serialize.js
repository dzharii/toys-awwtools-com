/**
 * Serialization: convert live runtime state into a compact, plain, JSON-safe
 * progress record. No DOM nodes, maps, functions, or full text -- only
 * structural metadata, timestamps, durations, and short hashes.
 */

import { CONFIG } from "../config.js";
import { wallNow } from "../utils/time.js";
import { roundTo } from "../utils/math.js";

function compactSegmentStats(stats) {
  return {
    totalVisibleMs: Math.round(stats.totalVisibleMs),
    totalActiveMs: Math.round(stats.totalActiveMs),
    totalFocusedMs: Math.round(stats.totalFocusedMs),
    visitCount: stats.visitCount,
    activeVisitCount: stats.activeVisitCount,
    maxVisibleRatio: roundTo(stats.maxVisibleRatio, 3),
    maxActiveRatio: roundTo(stats.maxActiveRatio, 3),
    fastPassCount: stats.fastPassCount,
    firstSeenAt: stats.firstSeenAt,
    lastSeenAt: stats.lastSeenAt,
    state: stats.state,
  };
}

function buildRestoreTarget(segmentId, segment, savedAt) {
  if (!segmentId) return null;
  const anchors = segment ? segment.anchors : null;
  return {
    segmentId,
    savedAt: savedAt || wallNow(),
    headingPathHash: anchors ? anchors.headingPathHash : null,
    segmentType: segment ? segment.type : null,
    scrollRatio: segment ? segment.scrollStartRatio : anchors ? anchors.scrollRatio : null,
    anchors: anchors
      ? {
          elementId: anchors.elementId,
          closestHeadingId: anchors.closestHeadingId,
          headingPathHash: anchors.headingPathHash,
          domPath: anchors.domPath,
          textHash: anchors.textHash,
          scrollRatio: anchors.scrollRatio,
        }
      : null,
  };
}

export function serializeProgress(deps) {
  const { identity, tracker, getSegmentById, timestamps } = deps;

  const segments = {};
  tracker.statsBySegmentId.forEach((stats, id) => {
    // Persist only segments with meaningful evidence to keep records compact.
    if (stats.state === "unseen" && stats.totalVisibleMs <= 0) return;
    segments[id] = compactSegmentStats(stats);
  });

  const lastFocusSegment = tracker.lastFocusSegmentId
    ? getSegmentById(tracker.lastFocusSegmentId)
    : null;

  const manualMark = tracker.manualMark;

  return {
    schemaVersion: CONFIG.schemaVersion,
    appVersion: CONFIG.appVersion,
    page: {
      key: identity.key,
      originalUrl: identity.originalUrl,
      normalizedUrl: identity.normalizedUrl,
      title: identity.title,
      contentFingerprint: identity.contentFingerprint,
      headingFingerprint: identity.headingFingerprint,
    },
    timestamps: {
      createdAt: (timestamps && timestamps.createdAt) || identity.createdAt,
      lastOpenedAt: (timestamps && timestamps.lastOpenedAt) || wallNow(),
      lastSavedAt: wallNow(),
    },
    restore: {
      lastFocus: buildRestoreTarget(
        tracker.lastFocusSegmentId,
        lastFocusSegment,
        tracker.lastFocusSavedAt
      ),
      manualMark: manualMark
        ? {
            segmentId: manualMark.segmentId,
            savedAt: manualMark.savedAt,
            headingPathHash:
              manualMark.anchors && manualMark.anchors.headingPathHash
                ? manualMark.anchors.headingPathHash
                : null,
            segmentType: getSegmentById(manualMark.segmentId)
              ? getSegmentById(manualMark.segmentId).type
              : null,
            scrollRatio:
              manualMark.anchors && typeof manualMark.anchors.scrollRatio === "number"
                ? manualMark.anchors.scrollRatio
                : null,
            anchors: manualMark.anchors || null,
          }
        : null,
      lastRawScroll: deps.lastRawScroll || null,
    },
    session: {
      startedAt: tracker.session.startedAt,
      activeTrackedMs: Math.round(tracker.session.activeTrackedMs),
      idleMs: Math.round(tracker.session.idleMs),
      hiddenMs: Math.round(tracker.session.hiddenMs),
      pausedMs: Math.round(tracker.session.pausedMs),
      sampleCount: tracker.session.sampleCount,
    },
    segments,
  };
}
