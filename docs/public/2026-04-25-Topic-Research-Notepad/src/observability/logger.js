export const loggingLevels = Object.freeze(["error", "warn", "info", "debug"]);
export const loggingFormatterNames = Object.freeze(["plain", "segments"]);
export const loggingStorageKey = "topicResearchNotepad.loggingSettings";

const levelWeight = { error: 0, warn: 1, info: 2, debug: 3 };
const levelColor = { error: "#b42318", warn: "#b54708", info: "#175cd3", debug: "#475467" };
const defaultLoggingSettings = Object.freeze({
  level: "debug",
  formatter: "segments",
  useLabelBackgrounds: true,
});

let currentSettings = readSettings();
const listeners = new Set();

/**
 * @typedef {"error" | "warn" | "info" | "debug"} LogLevel
 * @typedef {"plain" | "segments"} LogFormatterName
 * @typedef {{ level: LogLevel, formatter: LogFormatterName, useLabelBackgrounds: boolean }} LoggingSettings
 * @typedef {{ subcategory?: string, context?: Record<string, unknown> }} LogOptions
 * @typedef {{ error: (message: string, options?: LogOptions) => void, warn: (message: string, options?: LogOptions) => void, info: (message: string, options?: LogOptions) => void, debug: (message: string, options?: LogOptions) => void, withSubcategory: (subcategory: string) => Logger }} Logger
 */

/**
 * Creates a scoped logger for one module or subsystem.
 *
 * @param {string} category
 * @param {string=} defaultSubcategory
 * @returns {Logger}
 */
export function createLogger(category, defaultSubcategory = "") {
  const emit = (level, message, options = {}) => {
    renderLog({
      level,
      category,
      subcategory: options.subcategory ?? defaultSubcategory,
      message,
      context: options.context ?? {},
      timestamp: new Date().toISOString(),
    });
  };
  return {
    error: (message, options) => emit("error", message, options),
    warn: (message, options) => emit("warn", message, options),
    info: (message, options) => emit("info", message, options),
    debug: (message, options) => emit("debug", message, options),
    withSubcategory: (subcategory) => createLogger(category, subcategory),
  };
}

export function getLoggingSettings() {
  return { ...currentSettings };
}

export function setLoggingSettings(next) {
  currentSettings = normalizeSettings(next);
  persistSettings(currentSettings);
  listeners.forEach((listener) => listener(getLoggingSettings()));
  return getLoggingSettings();
}

export function updateLoggingSettings(patch) {
  return setLoggingSettings({ ...currentSettings, ...patch });
}

export function subscribeLoggingSettings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function installDebugHook(extra = {}) {
  if (typeof window === "undefined") return;
  window.trnDebug = {
    ...(window.trnDebug || {}),
    getLoggingSettings,
    setLoggingSettings,
    updateLoggingSettings,
    ...extra,
  };
}

export function compactJson(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(value, (_key, raw) => {
      if (typeof raw === "bigint") return raw.toString();
      if (raw instanceof Error) return normalizeError(raw);
      if (typeof raw === "string") return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
      if (Array.isArray(raw)) return raw.length <= 20 ? raw : [...raw.slice(0, 20), `...(${raw.length - 20} more)`];
      if (raw && typeof raw === "object") {
        if (seen.has(raw)) return "[Circular]";
        seen.add(raw);
        const entries = Object.entries(raw);
        if (entries.length <= 20) return raw;
        return Object.fromEntries([...entries.slice(0, 20), ["__moreKeys", entries.length - 20]]);
      }
      return raw;
    });
  } catch {
    return "{\"context\":\"unserializable\"}";
  }
}

export function normalizeError(error) {
  return {
    name: error?.name || "Error",
    message: error?.message || String(error),
    code: error?.code,
    stack: error?.stack ? String(error.stack).split("\n").slice(0, 6).join(" | ") : "",
  };
}

function renderLog(event) {
  const settings = currentSettings;
  if (!shouldRender(event.level, settings.level)) return;
  const rendered = settings.formatter === "plain" ? formatPlain(event) : formatSegments(event, settings);
  // eslint-disable-next-line no-console -- Centralized logging module; callers must use createLogger.
  console[event.level === "error" ? "error" : event.level === "warn" ? "warn" : "log"](...rendered);
}

function shouldRender(level, threshold) {
  return levelWeight[level] <= levelWeight[threshold];
}

function formatPlain(event) {
  const scope = [event.category, event.subcategory].filter(Boolean).join("/");
  return [`[TRN] ${event.level.toUpperCase()} ${scope} ${event.message} ${compactJson(event.context)} ${event.timestamp}`];
}

function formatSegments(event, settings) {
  const scope = [event.category, event.subcategory].filter(Boolean).join("/");
  return [
    "%c▣ TRN %c %s %c %s %c %s %c %s %c %s",
    segmentStyle("#315f99", settings.useLabelBackgrounds),
    segmentStyle(levelColor[event.level], settings.useLabelBackgrounds),
    event.level.toUpperCase(),
    segmentStyle("#0f766e", settings.useLabelBackgrounds),
    scope,
    "color:#121820;font-weight:700",
    event.message,
    "color:#344054",
    compactJson(event.context),
    "color:#667085",
    event.timestamp,
  ];
}

function segmentStyle(color, withBackground) {
  return withBackground
    ? `background:${color};color:#fff;border-radius:2px;padding:1px 4px;font-weight:700`
    : `color:${color};font-weight:700`;
}

function readSettings() {
  const storage = getStorage();
  if (!storage) return { ...defaultLoggingSettings };
  try {
    return normalizeSettings(JSON.parse(storage.getItem(loggingStorageKey) || "{}"));
  } catch {
    return { ...defaultLoggingSettings };
  }
}

function persistSettings(settings) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(loggingStorageKey, JSON.stringify(settings));
  } catch {
    // Logging settings persistence must never break the app.
  }
}

function getStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function normalizeSettings(value = {}) {
  return {
    level: loggingLevels.includes(value.level) ? value.level : defaultLoggingSettings.level,
    formatter: loggingFormatterNames.includes(value.formatter) ? value.formatter : defaultLoggingSettings.formatter,
    useLabelBackgrounds: typeof value.useLabelBackgrounds === "boolean" ? value.useLabelBackgrounds : defaultLoggingSettings.useLabelBackgrounds,
  };
}
