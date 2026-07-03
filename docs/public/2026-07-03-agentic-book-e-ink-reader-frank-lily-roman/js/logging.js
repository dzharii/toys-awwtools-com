// Structured local logging. Never sends anything anywhere.
// Keeps a bounded ring buffer for the optional diagnostics panel.
// Privacy rule: log metadata only (names, sizes, counts) — never book text.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const MAX_ENTRIES = 200;

const state = {
  buffer: [],
  consoleLevel: "info", // verbose logs are gated unless debug is enabled
  listeners: new Set(),
};

function record(level, event, meta) {
  const entry = {
    t: new Date().toISOString(),
    level,
    event,
    meta: meta || null,
  };
  state.buffer.push(entry);
  if (state.buffer.length > MAX_ENTRIES) state.buffer.shift();

  if (LEVELS[level] >= LEVELS[state.consoleLevel]) {
    const line = `[eink ${level}] ${event}`;
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (meta) fn(line, meta);
    else fn(line);
  }
  state.listeners.forEach((fn) => {
    try {
      fn(entry);
    } catch (_) {
      /* listener errors must not break logging */
    }
  });
}

export const log = {
  debug: (event, meta) => record("debug", event, meta),
  info: (event, meta) => record("info", event, meta),
  warn: (event, meta) => record("warn", event, meta),
  error: (event, meta) => record("error", event, meta),
};

/** Enable verbose console output (debug mode). */
export function setDebugEnabled(enabled) {
  state.consoleLevel = enabled ? "debug" : "info";
  record("info", "logging:level", { debug: !!enabled });
}

/** Return a copy of recent log entries for the diagnostics panel. */
export function getLogEntries() {
  return state.buffer.slice();
}

/** Format logs as plain text for copying. Contains no book content. */
export function formatLogsForCopy() {
  return state.buffer
    .map((e) => `${e.t} ${e.level.toUpperCase()} ${e.event}${e.meta ? " " + JSON.stringify(e.meta) : ""}`)
    .join("\n");
}

export function onLog(listener) {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

export function clearLogs() {
  state.buffer = [];
  record("info", "logging:cleared");
}
