/**
 * Static configuration for the E Ink Reader UI regression suite.
 *
 * Values here are product-contract constants verified against the app source
 * (preference key, validated ranges, enums, error copy). They are intentionally
 * duplicated in the suite rather than imported from the app's js/ modules,
 * preserving the source-decoupling boundary required by the testing plan.
 *
 * Verified against:
 *   js/preferences.js  (STORAGE_KEY, DEFAULTS, validate ranges, FONT_OPTIONS)
 *   js/errors.js       (user-facing copy)
 *   js/file-open.js    (WARN_BYTES 2MB, HARD_LIMIT_BYTES 15MB)
 *   index.html         (data-* attribute contract, data-testid additions)
 */

/** The only localStorage key the app may write. Book content must never persist. */
export const PREFERENCES_KEY = "eink-reader:preferences";

/** Enumerated preference values (js/preferences.js). */
export const THEMES = ["warm-paper", "cool-paper", "high-contrast", "dark"] as const;
export const CONTRASTS = ["soft", "normal"] as const;
export const MODES = ["paged", "scroll"] as const;
export const EINK_INTENSITIES = ["off", "reduced", "balanced", "strong"] as const;
export const MOTIONS = ["system", "reduced", "full"] as const;
export const REFRESH_STYLES = ["adaptive", "flash", "wash"] as const;
export const ALIGNMENTS = ["left", "justify"] as const;
/** Font option ids = select values (js/preferences.js FONT_OPTIONS[].id). */
export const FONT_IDS = [
  "Literata",
  "Charis SIL",
  "Source Serif 4",
  "Merriweather",
  "Atkinson Hyperlegible",
] as const;

/** Validated numeric ranges (js/preferences.js clamp() calls). */
export const RANGES = {
  fontSize: { min: 14, max: 34, def: 20 },
  lineHeight: { min: 1.2, max: 2.1, def: 1.55 },
  measure: { min: 40, max: 100, def: 68 },
  paraSpacing: { min: 0.2, max: 2, def: 0.9 },
  textureStrength: { min: 0, max: 1, def: 0.5 },
  margin: { min: 8, max: 80, def: 28 },
  fullRefreshInterval: { min: 0, max: 20, def: 6 },
  ghosting: { min: 0, max: 1, def: 0.5 },
} as const;

/** File size thresholds (js/file-open.js). */
export const FILE_LIMITS = {
  warnBytes: 2 * 1024 * 1024,
  hardLimitBytes: 15 * 1024 * 1024,
} as const;

/**
 * Stable user-facing error copy classes (js/errors.js). Tests assert intent via
 * these substrings rather than brittle full-string equality. Where the app copy
 * diverges from the manual plan's aspirational wording, the divergence is a
 * documented product/UX note, not a test failure.
 */
export const ERROR_COPY = {
  multipleFiles: /one book file at a time/i,
  unsupportedType: /file type is not supported/i,
  emptyFile: /nothing to read|file is empty/i,
  tooLarge: /too large/i,
  parseFallback: /plain text/i,
  paginationFallback: /scroll mode is being used/i,
  fontFallback: /fallback font/i,
  prefLoadFailed: /saved settings could not be read|defaults are being used/i,
  prefSaveFailed: /could not be saved|apply for this session/i,
} as const;

/** Baseline viewports (manual plan Q00). */
export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  smallDesktop: { width: 1024, height: 768 },
  tabletPortrait: { width: 768, height: 1024 },
  tabletLandscape: { width: 1024, height: 768 },
  mobileNarrow: { width: 390, height: 844 },
  mobileSmall: { width: 360, height: 640 },
  mobileLandscape: { width: 844, height: 390 },
} as const;

export type ThemeValue = (typeof THEMES)[number];
export type ModeValue = (typeof MODES)[number];
export type EinkValue = (typeof EINK_INTENSITIES)[number];
export type MotionValue = (typeof MOTIONS)[number];
