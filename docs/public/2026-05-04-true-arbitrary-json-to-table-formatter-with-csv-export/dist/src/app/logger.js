import { LOGGER_DEFAULT_LEVEL } from "./constants.js";

const LOG_LEVELS = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

const LEVEL_STYLES = {
  debug: "color:#6b7280",
  info: "color:#2563eb",
  warn: "color:#92400e",
  error: "color:#991b1b"
};

function safeNow() {
  if (globalThis.performance && typeof globalThis.performance.now === "function") {
    return globalThis.performance.now();
  }
  return Date.now();
}

function sanitizeMeta(meta, seen = new WeakSet()) {
  if (!meta || typeof meta !== "object") return meta;
  if (seen.has(meta)) return "[circular]";
  seen.add(meta);
  const output = {};
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string" && value.length > 240) {
      output[key] = `${value.slice(0, 240)}…`;
      continue;
    }
    if (Array.isArray(value) && value.length > 80) {
      output[key] = `[array:${value.length}]`;
      continue;
    }
    if (value && typeof value === "object") {
      output[key] = sanitizeMeta(value, seen);
      continue;
    }
    output[key] = value;
  }
  return output;
}

export function createLogger({ namespace = "JTI", level = LOGGER_DEFAULT_LEVEL } = {}) {
  let currentLevel = LOG_LEVELS[level] ?? LOG_LEVELS.info;

  function shouldLog(nextLevel) {
    const threshold = LOG_LEVELS[nextLevel] ?? LOG_LEVELS.info;
    return currentLevel >= threshold && typeof console !== "undefined";
  }

  function emit(nextLevel, component, message, meta) {
    if (!shouldLog(nextLevel)) return;
    const channel = nextLevel === "debug" ? "debug" : nextLevel;
    const sanitizedMeta = sanitizeMeta(meta);
    const label = `[${namespace}:${component}]`;
    try {
      console[channel](`%c${label}`, LEVEL_STYLES[nextLevel] || "", message, sanitizedMeta ?? "");
    } catch {
      try {
        console[channel](`${label} ${message}`, sanitizedMeta ?? "");
      } catch {
        // no-op
      }
    }
  }

  return {
    setLevel(nextLevel) {
      currentLevel = LOG_LEVELS[nextLevel] ?? currentLevel;
    },
    getLevel() {
      return Object.entries(LOG_LEVELS).find(([, score]) => score === currentLevel)?.[0] ?? "info";
    },
    time() {
      return safeNow();
    },
    durationMs(startMs) {
      if (!Number.isFinite(startMs)) return null;
      return Math.round((safeNow() - startMs) * 10) / 10;
    },
    debug(component, message, meta) {
      emit("debug", component, message, meta);
    },
    info(component, message, meta) {
      emit("info", component, message, meta);
    },
    warn(component, message, meta) {
      emit("warn", component, message, meta);
    },
    error(component, message, meta) {
      emit("error", component, message, meta);
    }
  };
}

export const logger = createLogger();
