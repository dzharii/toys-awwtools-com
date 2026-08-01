import { APPLICATION_ID } from "../state/defaults.js";

const MAX_RECORDS = 300;
const records = [];
let transactionSequence = 0;

function snapshot(value) {
  try {
    return value === undefined ? {} : JSON.parse(JSON.stringify(value));
  } catch {
    return { snapshotError: "Fields could not be serialized." };
  }
}

export function normalizeError(error) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack || null };
  }
  return { name: "NonErrorThrownValue", message: String(error) };
}

export function log(level, area, event, message, fields = {}) {
  const record = Object.freeze({
    application: APPLICATION_ID,
    timestamp: new Date().toISOString(),
    level,
    area,
    event,
    message,
    fields: snapshot(fields),
  });
  records.push(record);
  if (records.length > MAX_RECORDS) records.splice(0, records.length - MAX_RECORDS);
  try {
    const method = level === "error" ? "error" : level === "warning" ? "warn" : "info";
    console[method](`[${APPLICATION_ID}] ${area}.${event}: ${message}`, record.fields);
  } catch {
    // Diagnostics must never interrupt the application.
  }
  return record;
}

export function startTransaction(area, event, message, fields = {}) {
  transactionSequence += 1;
  const transactionId = `${area}-${Date.now().toString(36)}-${transactionSequence}`;
  const startedAt = performance.now();
  log("info", area, `${event}.started`, message, { ...fields, transactionId });
  let finished = false;
  return {
    transactionId,
    finish(result, terminalMessage, terminalFields = {}, level = "info") {
      if (finished) return;
      finished = true;
      log(level, area, `${event}.${result}`, terminalMessage, {
        ...terminalFields,
        transactionId,
        result,
        durationMs: Math.round((performance.now() - startedAt) * 10) / 10,
      });
    },
  };
}

export function getDiagnosticRecords() {
  return records.map((record) => snapshot(record));
}

export function exportDiagnostics(reproductionState) {
  return {
    documentType: "grid-atlas-helper-diagnostics",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    },
    reproductionState: snapshot(reproductionState),
    records: getDiagnosticRecords(),
  };
}
