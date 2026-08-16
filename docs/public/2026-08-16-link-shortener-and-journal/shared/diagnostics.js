function stringifyValue(value) {
  if (value instanceof Error) return value.message;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function createDiagnostic({ code, module, stage, summary, reason, context = {}, action, cause, severity = "error", userVisible = true }) {
  return { code, module, stage, summary, reason, context, action, cause, severity, userVisible };
}

export function formatDiagnostic(diagnostic, correlationLabel = "Operation", correlationId) {
  const lines = [`[${diagnostic.severity.toUpperCase()}] [${diagnostic.module}] ${diagnostic.summary}`];
  const fields = [];
  if (correlationId) fields.push([correlationLabel, correlationId]);
  if (diagnostic.stage) fields.push(["Stage", diagnostic.stage]);
  for (const [label, value] of Object.entries(diagnostic.context || {})) {
    if (value !== undefined && value !== null && value !== "") fields.push([label, stringifyValue(value)]);
  }
  if (diagnostic.reason) fields.push(["Reason", diagnostic.reason]);
  if (diagnostic.action) fields.push(["Action", diagnostic.action]);
  if (diagnostic.code) fields.push(["Error code", diagnostic.code]);
  for (const [label, value] of fields) lines.push("", `${label}:`, `  ${value}`);
  return lines.join("\n");
}

export function formatUserError(opening, diagnostic, fields = []) {
  const lines = [opening, "", diagnostic.reason || diagnostic.summary];
  for (const [label, value] of fields) lines.push("", `${label}:`, `  ${stringifyValue(value)}`);
  if (diagnostic.action) lines.push("", "Action:", `  ${diagnostic.action}`);
  return lines.join("\n");
}

export function createLogger({ debug = false, correlationLabel = "Operation", correlationId = "" } = {}) {
  const emit = (method, level, module, message) => console[method](`[${level}] [${module}] ${message}`);
  return {
    info: (module, message) => emit("info", "INFO", module, message),
    warn: (module, message) => emit("warn", "WARN", module, message),
    debug: (module, message) => { if (debug) emit("debug", "DEBUG", module, message); },
    error: (diagnostic) => console.error(formatDiagnostic(diagnostic, correlationLabel, correlationId))
  };
}
