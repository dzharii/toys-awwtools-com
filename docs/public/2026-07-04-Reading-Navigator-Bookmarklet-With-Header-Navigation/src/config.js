/**
 * Central configuration for Reading Navigator.
 *
 * All tunable values live here. Avoid scattering magic numbers through the
 * codebase; import from this module instead. Values are documented inline.
 */

export const CONFIG = {
  // Product identity.
  appName: "Reading Navigator",
  appVersion: "0.1.0",
  schemaVersion: 1,

  // Stable DOM identifiers so the app can detect an existing instance.
  hostId: "reading-navigator-bookmarklet-host",
  hostDataAttr: "data-reading-navigator",

  // Storage namespacing.
  storagePrefix: "rn:v1:",
  identityKeyVersion: 1,

  // Sampling cadence (milliseconds). Moderate interval keeps CPU/battery low.
  sampleIntervalMs: 500,
  // If more than this elapses between samples (sleep, frozen tab), reset the
  // sample clock instead of crediting a huge dwell duration.
  maxSampleGapMs: 5000,

  // Active reading band as a fraction of viewport height. The middle of the
  // viewport is treated as the meaningful reading zone.
  activeBandTopRatio: 0.25,
  activeBandBottomRatio: 0.75,
  // Reference point used to pick the "current" heading (fraction from top).
  currentHeadingRefRatio: 0.35,

  // Idle gating thresholds (milliseconds since last user activity).
  idleSoftMs: 20000, // reduced accumulation
  idleHardMs: 60000, // no accumulation

  // Persistence.
  saveDebounceMs: 2000,
  periodicSaveMs: 20000,
  maxStoredRecords: 200,
  maxRecordAgeDays: 90,

  // Dynamic-page handling.
  mutationDebounceMs: 1500,

  // Minimap rendering budget.
  maxMinimapNodes: 300,

  // Restore promotion thresholds.
  lastFocusMinFocusedMs: 2000,
  lastFocusMinActiveRatio: 0.25,

  // Restore highlight duration (milliseconds).
  restoreHighlightMs: 2600,

  // Scroll velocity classification (pixels per second). Defaults, not truths.
  velocity: {
    slowMaxPxPerSec: 80, // 0..80  -> full dwell credit
    normalMaxPxPerSec: 300, // 80..300 -> partial credit
    skimMaxPxPerSec: 1200, // 300..1200 -> visible only
    // > skimMaxPxPerSec -> jump / fast pass, no read credit
  },
  // Number of recent velocity samples to average, to avoid overreacting to a
  // single wheel/Page Down burst.
  velocitySmoothingSamples: 3,

  // Segmentation limits.
  // Group small adjacent text blocks under the same heading below this height.
  segmentGroupMinHeightPx: 28,
  // Virtual-split elements taller than this multiple of the viewport height.
  virtualSplitViewportMultiple: 1.5,
  // Cap total segments to keep everything responsive on huge pages.
  maxSegments: 4000,

  // Content-root scoring: minimum paragraph count to trust a candidate root.
  rootMinParagraphs: 3,

  // Keyboard shortcuts (internal defaults; not required to use the product).
  shortcuts: {
    togglePanel: { alt: true, shift: false, key: "r" },
    jumpLastReading: { alt: true, shift: true, key: "r" },
    markSpot: { alt: true, shift: false, key: "m" },
    pauseResume: { alt: true, shift: false, key: "p" },
    compactExpand: { alt: true, shift: false, key: "c" },
  },

  // Debug mode is off by default.
  debug: false,
};

/**
 * Distribution constants used by the build script to generate bookmarklets and
 * the install page. The base URL is the production location on GitHub Pages.
 */
export const DIST = {
  baseUrl:
    "https://toys.awwtools.com/public/2026-07-04-Reading-Navigator-Bookmarklet-With-Header-Navigation/",
  bundleFile: "dist/reading-navigator.bundle.js",
  globalName: "readingNavigatorBookmarklet",
  // Soft warning threshold for inline bookmarklet length. Some browsers and UIs
  // truncate very long bookmarklet URLs; warn (do not fail) past this.
  inlineWarnBytes: 250000,
};

/**
 * Read-threshold base values (milliseconds) by segment type. Short segments
 * must not require the same dwell as long ones; large code/tables/figures must
 * not be marked read after a tiny exposure.
 */
export const READ_THRESHOLD_BASE_MS = {
  heading: 1000,
  paragraph: 3500,
  "list-item": 2500,
  blockquote: 4000,
  code: 8000,
  figure: 5000,
  table: 9000,
  section: 6000,
  "unknown-block": 4000,
};

export default CONFIG;
