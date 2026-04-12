const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function timestamp() {
  return new Date().toISOString();
}

function sanitizeSegment(value) {
  return String(value)
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function formatMeta(meta) {
  if (!meta || (typeof meta === "object" && !Object.keys(meta).length)) return "";
  if (typeof meta === "string") return ` ${meta}`;
  return ` ${JSON.stringify(meta)}`;
}

function writeLogLine(logFile, level, message, meta) {
  ensureDir(path.dirname(logFile));
  const line = `[${timestamp()}] [${level}] ${message}${formatMeta(meta)}`;
  fs.appendFileSync(logFile, `${line}\n`, "utf8");
  return line;
}

function createLogger(logFile, options = {}) {
  const mirrorToConsole = options.mirrorToConsole !== false;

  const logger = {
    log(message, meta) {
      const line = writeLogLine(logFile, "INFO", message, meta);
      if (mirrorToConsole) console.log(line);
    },
    warn(message, meta) {
      const line = writeLogLine(logFile, "WARN", message, meta);
      if (mirrorToConsole) console.warn(line);
    },
    error(message, meta) {
      const line = writeLogLine(logFile, "ERROR", message, meta);
      if (mirrorToConsole) console.error(line);
    },
    child(prefix) {
      return {
        log: (message, meta) => logger.log(`${prefix} ${message}`, meta),
        warn: (message, meta) => logger.warn(`${prefix} ${message}`, meta),
        error: (message, meta) => logger.error(`${prefix} ${message}`, meta),
      };
    },
    writeJson(label, value) {
      const line = writeLogLine(logFile, "INFO", label, value);
      if (mirrorToConsole) console.log(line);
    },
    logFile,
  };

  return logger;
}

module.exports = {
  ensureDir,
  sanitizeSegment,
  timestamp,
  writeLogLine,
  createLogger,
};
