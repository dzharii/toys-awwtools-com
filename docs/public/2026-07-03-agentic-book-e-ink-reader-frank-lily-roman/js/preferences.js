// Preference persistence. localStorage stores ONLY reading preferences.
// Book content is never written here (see design note AA00). Values are
// validated on load and reset safely if corrupt or from an older version.

import { log } from "./logging.js";
import { clamp, toNumber } from "./utils.js";

const STORAGE_KEY = "eink-reader:preferences";
const VERSION = 1;

export const FONT_OPTIONS = [
  { id: "Literata", label: "Literata", stack: '"Literata", Georgia, serif' },
  { id: "Charis SIL", label: "Charis SIL", stack: '"Charis SIL", Georgia, serif' },
  { id: "Source Serif 4", label: "Source Serif 4", stack: '"Source Serif 4", Georgia, serif' },
  { id: "Merriweather", label: "Merriweather", stack: '"Merriweather", Georgia, serif' },
  { id: "Atkinson Hyperlegible", label: "Atkinson Hyperlegible", stack: '"Atkinson Hyperlegible", system-ui, sans-serif' },
];

const FONT_IDS = FONT_OPTIONS.map((f) => f.id);
const THEMES = ["warm-paper", "cool-paper", "high-contrast", "dark"];
const CONTRASTS = ["soft", "normal"];
const EINK = ["off", "reduced", "balanced", "strong"];
const MOTION = ["system", "reduced", "full"];
const MODES = ["paged", "scroll"];
const REFRESH_STYLES = ["adaptive", "flash", "wash"];

export const DEFAULT_PREFERENCES = Object.freeze({
  version: VERSION,
  fontFamily: "Literata",
  fontSize: 20, // px
  lineHeight: 1.55,
  measure: 68, // ch
  paraSpacing: 0.9, // em
  align: "left", // left | justify
  readerMode: "paged",
  theme: "warm-paper",
  contrast: "soft",
  textureStrength: 0.5, // 0..1
  margin: 28, // px, informational for layout
  einkIntensity: "balanced",
  refreshStyle: "adaptive",
  fullRefreshInterval: 6, // partial turns before a cleanup full refresh
  ghosting: 0.5, // 0..1 scales ghost opacity
  motion: "system",
  showProgress: true,
  debugEnabled: false,
});

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/** Validate an arbitrary object into a safe, complete preferences object. */
export function validatePreferences(raw) {
  const d = DEFAULT_PREFERENCES;
  if (!raw || typeof raw !== "object") return { ...d };
  return {
    version: VERSION,
    fontFamily: oneOf(raw.fontFamily, FONT_IDS, d.fontFamily),
    fontSize: clamp(Math.round(toNumber(raw.fontSize, d.fontSize)), 14, 34),
    lineHeight: clamp(toNumber(raw.lineHeight, d.lineHeight), 1.2, 2.1),
    measure: clamp(Math.round(toNumber(raw.measure, d.measure)), 40, 100),
    paraSpacing: clamp(toNumber(raw.paraSpacing, d.paraSpacing), 0.2, 2),
    align: oneOf(raw.align, ["left", "justify"], d.align),
    readerMode: oneOf(raw.readerMode, MODES, d.readerMode),
    theme: oneOf(raw.theme, THEMES, d.theme),
    contrast: oneOf(raw.contrast, CONTRASTS, d.contrast),
    textureStrength: clamp(toNumber(raw.textureStrength, d.textureStrength), 0, 1),
    margin: clamp(Math.round(toNumber(raw.margin, d.margin)), 8, 80),
    einkIntensity: oneOf(raw.einkIntensity, EINK, d.einkIntensity),
    refreshStyle: oneOf(raw.refreshStyle, REFRESH_STYLES, d.refreshStyle),
    fullRefreshInterval: clamp(Math.round(toNumber(raw.fullRefreshInterval, d.fullRefreshInterval)), 0, 20),
    ghosting: clamp(toNumber(raw.ghosting, d.ghosting), 0, 1),
    motion: oneOf(raw.motion, MOTION, d.motion),
    showProgress: typeof raw.showProgress === "boolean" ? raw.showProgress : d.showProgress,
    debugEnabled: typeof raw.debugEnabled === "boolean" ? raw.debugEnabled : d.debugEnabled,
  };
}

/** Load preferences from localStorage, migrating/resetting safely. */
export function loadPreferences() {
  try {
    const rawStr = localStorage.getItem(STORAGE_KEY);
    if (!rawStr) {
      log.info("preferences:loaded", { source: "defaults" });
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(rawStr);
    if (!parsed || parsed.version !== VERSION) {
      log.warn("preferences:invalid", { reason: "version-mismatch-or-empty" });
    }
    const valid = validatePreferences(parsed);
    log.info("preferences:loaded", { source: "storage" });
    return valid;
  } catch (err) {
    log.warn("preferences:invalid", { reason: (err && err.message) || "parse-error" });
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Persist preferences. Returns true on success.
 * Guards against localStorage being unavailable or throwing (private mode).
 */
export function savePreferences(prefs) {
  try {
    const valid = validatePreferences(prefs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return true;
  } catch (err) {
    log.warn("preferences:save-failed", { reason: (err && err.message) || "unknown" });
    return false;
  }
}

/** Remove stored preferences (diagnostics: reset). */
export function clearPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    log.info("preferences:cleared");
    return true;
  } catch (_) {
    return false;
  }
}

/** True if preferences were previously stored (used for the reopen hint). */
export function hasStoredPreferences() {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    return false;
  }
}

export function fontStackFor(fontId) {
  const found = FONT_OPTIONS.find((f) => f.id === fontId);
  return found ? found.stack : DEFAULT_PREFERENCES.fontFamily;
}
