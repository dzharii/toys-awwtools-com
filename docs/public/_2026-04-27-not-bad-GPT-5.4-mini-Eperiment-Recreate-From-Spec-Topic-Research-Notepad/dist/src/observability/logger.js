const STORAGE_KEY = "topicResearchNotepad.loggingSettings";
const DEFAULT_SETTINGS = Object.freeze({
  level: "debug",
  formatter: "segments"
});

/** @typedef {"error" | "warn" | "info" | "debug"} LogLevel */
/** @typedef {"plain" | "segments"} LogFormatterName */
/** @typedef {{ subcategory?: string, context?: Record<string, unknown> }} LogOptions */
/** @typedef {{ error: (message: string, options?: LogOptions) => void, warn: (message: string, options?: LogOptions) => void, info: (message: string, options?: LogOptions) => void, debug: (message: string, options?: LogOptions) => void, withSubcategory: (subcategory: string) => Logger }} Logger */
/** @typedef {{ level?: LogLevel, formatter?: LogFormatterName }} LoggingSettings */

const LEVEL_WEIGHT = { error: 0, warn: 1, info: 2, debug: 3 };
const listeners = new Set();
let settings = readSettings();

function readSettings() {
  if (typeof localStorage === "undefined") return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      level: normalizeLevel(parsed.level),
      formatter: normalizeFormatter(parsed.formatter)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function persistSettings(next) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep logging non-fatal when storage is unavailable.
  }
}

function normalizeLevel(value) {
  return ["error", "warn", "info", "debug"].includes(value) ? value : DEFAULT_SETTINGS.level;
}

function normalizeFormatter(value) {
  return value === "plain" ? "plain" : DEFAULT_SETTINGS.formatter;
}

export function getLoggingSettings() {
  return { ...settings };
}

export function setLoggingSettings(next = {}) {
  settings = {
    level: normalizeLevel(next.level),
    formatter: normalizeFormatter(next.formatter)
  };
  persistSettings(settings);
  notify();
  return getLoggingSettings();
}

export function updateLoggingSettings(patch = {}) {
  return setLoggingSettings({ ...settings, ...patch });
}

export function subscribeLoggingSettings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) {
    try {
      listener(getLoggingSettings());
    } catch {
      // Listener failures should not break the logger.
    }
  }
}

function shouldLog(level) {
  return LEVEL_WEIGHT[level] <= LEVEL_WEIGHT[settings.level];
}

function nowStamp() {
  return new Date().toISOString();
}

function compactJson(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(value, (_key, raw) => {
      if (typeof raw === "bigint") return raw.toString();
      if (raw instanceof Error) {
        return {
          name: raw.name,
          message: raw.message,
          stack: raw.stack ? raw.stack.split("\n").slice(0, 6).join(" | ") : ""
        };
      }
      if (typeof raw === "string") {
        return raw.length > 240 ? `${raw.slice(0, 237)}...` : raw;
      }
      if (Array.isArray(raw)) {
        return raw.length <= 20 ? raw : [...raw.slice(0, 20), `...(${raw.length - 20} more)`];
      }
      if (raw && typeof raw === "object") {
        if (seen.has(raw)) return "[Circular]";
        seen.add(raw);
        const entries = Object.entries(raw);
        if (entries.length <= 20) return raw;
        const compact = {};
        for (const [key, entryValue] of entries.slice(0, 20)) compact[key] = entryValue;
        compact.__moreKeys = entries.length - 20;
        return compact;
      }
      return raw;
    });
  } catch {
    return '{"context":"unserializable"}';
  }
}

function formatScope(category, subcategory) {
  return subcategory ? `${category}/${subcategory}` : category;
}

function print(level, category, defaultSubcategory, message, options = {}) {
  if (!shouldLog(level)) return;

  const subcategory = options.subcategory || defaultSubcategory || "";
  const scope = formatScope(category, subcategory);
  const context = options.context ? compactJson(options.context) : "";
  const stamp = nowStamp();
  const project = "TRN";

  if (settings.formatter === "plain" || typeof console?.log !== "function") {
    const suffix = context ? ` ${context}` : "";
    console.log(`[${stamp}] ${project} ${level.toUpperCase()} ${scope} ${message}${suffix}`);
    return;
  }

  const levelColor =
    level === "error" ? "#b42318" :
    level === "warn" ? "#b54708" :
    level === "info" ? "#175cd3" :
    "#475467";

  const scopeColor = "#344054";
  const labelColor = "#0f172a";
  const mutedColor = "#667085";
  const contextColor = "#475467";

  if (context) {
    console.log(
      `%c▣ TRN%c ${level.toUpperCase()} %c ${scope} %c ${message} %c ${context} %c ${stamp}`,
      "color:#111827;font-weight:700",
      `color:${levelColor};font-weight:700`,
      `color:${scopeColor};font-weight:700`,
      `color:${labelColor}`,
      `color:${contextColor}`,
      `color:${mutedColor}`
    );
    return;
  }

  console.log(
    `%c▣ TRN%c ${level.toUpperCase()} %c ${scope} %c ${message} %c ${stamp}`,
    "color:#111827;font-weight:700",
    `color:${levelColor};font-weight:700`,
    `color:${scopeColor};font-weight:700`,
    `color:${labelColor}`,
    `color:${mutedColor}`
  );
}

export function createLogger(category, defaultSubcategory = "") {
  return {
    error(message, options) { print("error", category, defaultSubcategory, message, options); },
    warn(message, options) { print("warn", category, defaultSubcategory, message, options); },
    info(message, options) { print("info", category, defaultSubcategory, message, options); },
    debug(message, options) { print("debug", category, defaultSubcategory, message, options); },
    withSubcategory(subcategory) {
      return createLogger(category, subcategory);
    }
  };
}

if (typeof globalThis !== "undefined") {
  globalThis.trnDebug = {
    getLoggingSettings,
    setLoggingSettings,
    updateLoggingSettings
  };
}

export { compactJson };

