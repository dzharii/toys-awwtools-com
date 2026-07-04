/**
 * Central app state. Runtime state may hold DOM references and Maps; the
 * persistence layer converts a subset to a compact plain object before saving.
 */

import { CONFIG } from "../config.js";
import { wallNow } from "../utils/time.js";

export function createInitialState() {
  return {
    app: {
      version: CONFIG.appVersion,
      instanceId: "rn_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      mode: "expanded",
      lifecycle: "booting",
      startedAt: wallNow(),
      visible: true,
    },
    page: {
      identity: null,
      contentRoot: null,
      rootConfidence: "unknown",
      rootReason: "",
    },
    headings: [],
    segments: [],
    segmentsById: new Map(),
    restore: {
      lastFocus: null,
      manualMark: null,
      lastRawScroll: null,
      lastRestoreResult: null,
      fingerprint: null, // { match, reason }
    },
    tracking: {
      pausedByUser: false,
      currentSegmentId: null,
      velocity: 0,
      velocityClass: "slow",
      statusLabel: "tracking",
      sampleCount: 0,
    },
    viewport: null,
    performance: {
      geometryDirty: false,
      contentDirty: false,
      lastScanMs: 0,
      lastGeometryMs: 0,
      lastSampleMs: 0,
      lastRenderMs: 0,
      lastSaveMs: 0,
    },
    storage: {
      available: true,
      mode: "persistent",
      dirty: false,
      lastSavedAt: null,
      status: "idle", // idle | saving | saved | session-only | unavailable
    },
    settings: {
      fontScale: 1,
      opacity: 1,
      contrast: "soft",
      theme: "light",
      sessionOnly: false,
      debug: CONFIG.debug,
    },
    diagnostics: {
      errorCount: 0,
      lastError: null,
    },
  };
}
