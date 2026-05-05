const FAILURE_STATUS = new Set([
  "failed",
  "failure",
  "error",
  "errored",
  "exception",
  "timeout",
  "timed out",
  "timed_out",
  "invalid",
  "aborted",
  "fatal",
  "unhealthy"
]);

const WARNING_STATUS = new Set([
  "warning",
  "warn",
  "partial",
  "degraded",
  "retry",
  "retried",
  "skipped",
  "unknown",
  "pending",
  "stale",
  "throttled"
]);

const OK_STATUS = new Set([
  "ok",
  "success",
  "succeeded",
  "passed",
  "complete",
  "completed",
  "done",
  "valid",
  "healthy"
]);

function normalizeToken(value) {
  return String(value ?? "")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .trim();
}

function isBooleanFailureColumn(key) {
  const lower = normalizeToken(key).replace(/\s+/g, "");
  return ["success", "ok", "passed", "valid", "issuccess"].includes(lower);
}

function isBooleanNegativeColumn(key) {
  const lower = normalizeToken(key).replace(/\s+/g, "");
  return ["failed", "failure", "haserror", "iserror", "timedout", "timeout", "errored"].includes(lower);
}

export function isFailureLikeColumn(column) {
  const key = normalizeToken(column?.key ?? "");
  return /(error|exception|message|reason|code|trace|stack|stderr|failed|failure)/.test(key);
}

export function isSuccessLikeColumn(column) {
  const key = normalizeToken(column?.key ?? "");
  return /(success|ok|passed|status|state|result|outcome)/.test(key);
}

export function classifyStatusValue(value) {
  const token = normalizeToken(value);
  if (!token) return "unknown";
  if (FAILURE_STATUS.has(token)) return "failure";
  if (WARNING_STATUS.has(token)) return "warning";
  if (OK_STATUS.has(token)) return "ok";
  return "unknown";
}

function pushReason(list, reason) {
  list.push(reason);
}

function meaningfulValue(cell) {
  if (!cell) return false;
  if (cell.state === "missing") return false;
  if (cell.value === null) return false;
  if (cell.type === "string" && String(cell.value).trim() === "") return false;
  if (cell.type === "array" && Array.isArray(cell.value) && cell.value.length === 0) return false;
  if (cell.type === "object" && cell.value && typeof cell.value === "object" && Object.keys(cell.value).length === 0) return false;
  return true;
}

export function evaluateCellSignal(cell, column) {
  const reasons = [];
  if (!cell || cell.state === "missing") return reasons;

  const key = column?.key ?? "";
  const lowerKey = normalizeToken(key);

  if (cell.type === "boolean") {
    if (isBooleanFailureColumn(key) && cell.value === false) {
      pushReason(reasons, {
        code: "BOOLEAN_FALSE_FAILURE",
        severity: "failure",
        columnKey: key,
        label: `${key}=false`,
        detail: `${key} is false.`,
        weight: 60
      });
    }
    if (isBooleanNegativeColumn(key) && cell.value === true) {
      pushReason(reasons, {
        code: "BOOLEAN_TRUE_NEGATIVE",
        severity: "failure",
        columnKey: key,
        label: `${key}=true`,
        detail: `${key} is true.`,
        weight: 70
      });
    }
    if (isBooleanFailureColumn(key) && cell.value === true) {
      pushReason(reasons, {
        code: "BOOLEAN_TRUE_OK",
        severity: "ok",
        columnKey: key,
        label: `${key}=true`,
        detail: `${key} is true.`,
        weight: -40
      });
    }
    return reasons;
  }

  if (cell.type === "string" && isSuccessLikeColumn(column)) {
    const statusClass = classifyStatusValue(cell.value);
    if (statusClass === "failure") {
      pushReason(reasons, {
        code: "STATUS_FAILURE",
        severity: "failure",
        columnKey: key,
        label: `${key}=${cell.value}`,
        detail: `Status value is ${cell.value}.`,
        weight: 60
      });
    } else if (statusClass === "warning") {
      pushReason(reasons, {
        code: "STATUS_WARNING",
        severity: "warning",
        columnKey: key,
        label: `${key}=${cell.value}`,
        detail: `Status value is ${cell.value}.`,
        weight: 25
      });
    } else if (statusClass === "ok") {
      pushReason(reasons, {
        code: "STATUS_OK",
        severity: "ok",
        columnKey: key,
        label: `${key}=${cell.value}`,
        detail: `Status value is ${cell.value}.`,
        weight: -35
      });
    }
  }

  if (isFailureLikeColumn(column) && meaningfulValue(cell)) {
    pushReason(reasons, {
      code: "FAILURE_FIELD_PRESENT",
      severity: "failure",
      columnKey: key,
      label: `${key} present`,
      detail: `${key} contains failure-related data.`,
      weight: 45
    });
  }

  if (/(exitcode|statuscode|httpstatus)/.test(lowerKey) && cell.type === "number") {
    const value = Number(cell.value);
    if (value !== 0 && lowerKey.includes("exitcode")) {
      pushReason(reasons, {
        code: "EXIT_CODE_NON_ZERO",
        severity: "failure",
        columnKey: key,
        label: `${key}=${value}`,
        detail: "Exit code is non-zero.",
        weight: 60
      });
    } else if (value >= 500) {
      pushReason(reasons, {
        code: "HTTP_5XX",
        severity: "failure",
        columnKey: key,
        label: `${key}=${value}`,
        detail: "HTTP status is 5xx.",
        weight: 60
      });
    } else if (value >= 400) {
      pushReason(reasons, {
        code: "HTTP_4XX",
        severity: "failure",
        columnKey: key,
        label: `${key}=${value}`,
        detail: "HTTP status is 4xx.",
        weight: 50
      });
    } else if (value >= 300) {
      pushReason(reasons, {
        code: "HTTP_3XX",
        severity: "warning",
        columnKey: key,
        label: `${key}=${value}`,
        detail: "HTTP status is 3xx.",
        weight: 15
      });
    } else if (value >= 200 && value < 300) {
      pushReason(reasons, {
        code: "HTTP_2XX",
        severity: "ok",
        columnKey: key,
        label: `${key}=${value}`,
        detail: "HTTP status is 2xx.",
        weight: -25
      });
    }
  }

  if (/retry/.test(lowerKey) && cell.type === "number") {
    const retryCount = Number(cell.value);
    if (retryCount > 0) {
      pushReason(reasons, {
        code: "RETRY_COUNT",
        severity: retryCount >= 3 ? "warning" : "warning",
        columnKey: key,
        label: `${key}>0`,
        detail: "Retry count is greater than zero.",
        weight: retryCount >= 3 ? 25 : 15
      });
    }
  }

  return reasons;
}

function computeLevel(score, signalCounts) {
  if (signalCounts.failure > 0 || score >= 60) return "failure";
  if (score >= 20 || signalCounts.warning > 0) return "warning";
  if (score <= -20 && signalCounts.failure === 0 && signalCounts.warning === 0 && signalCounts.ok > 0) return "ok";
  return "unknown";
}

function confidenceFromSignals(signalCounts) {
  if (signalCounts.failure > 0 || signalCounts.ok > 0) return "high";
  if (signalCounts.warning > 0) return "medium";
  return "low";
}

export function scoreRow(flatRow, columns) {
  const reasons = [];
  let score = 0;
  const signalCounts = {
    failure: 0,
    warning: 0,
    ok: 0
  };

  for (const column of columns || []) {
    const cell = flatRow.values?.[column.key];
    const signals = evaluateCellSignal(cell, column);
    for (const signal of signals) {
      reasons.push(signal);
      score += signal.weight;
      if (signal.severity === "failure") signalCounts.failure += 1;
      if (signal.severity === "warning") signalCounts.warning += 1;
      if (signal.severity === "ok") signalCounts.ok += 1;
    }
  }

  reasons.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  const level = computeLevel(score, signalCounts);

  return {
    ...flatRow,
    health: {
      level,
      score,
      confidence: confidenceFromSignals(signalCounts),
      reasons,
      topReason: reasons[0]?.label ?? null,
      signalCounts
    }
  };
}

export function scoreRows(flatRows, columns) {
  return (flatRows || []).map((row) => scoreRow(row, columns));
}

export function buildDatasetHealthSummary(scoredRows, columns) {
  const summary = {
    rowCount: scoredRows.length,
    failureCount: 0,
    warningCount: 0,
    okCount: 0,
    unknownCount: 0,
    healthRatio: {
      failure: 0,
      warning: 0,
      ok: 0,
      unknown: 0
    },
    topSignals: [],
    topFailureColumns: []
  };

  const signalCounts = new Map();
  const failureColumns = new Map();

  for (const row of scoredRows) {
    const level = row.health?.level ?? "unknown";
    if (level === "failure") summary.failureCount += 1;
    else if (level === "warning") summary.warningCount += 1;
    else if (level === "ok") summary.okCount += 1;
    else summary.unknownCount += 1;

    for (const reason of row.health?.reasons || []) {
      const key = `${reason.code}:${reason.columnKey ?? ""}`;
      signalCounts.set(key, {
        code: reason.code,
        label: reason.label,
        severity: reason.severity,
        columnKey: reason.columnKey || null,
        count: (signalCounts.get(key)?.count || 0) + 1
      });
      if (reason.severity === "failure" && reason.columnKey) {
        failureColumns.set(reason.columnKey, (failureColumns.get(reason.columnKey) || 0) + 1);
      }
    }
  }

  if (summary.rowCount > 0) {
    summary.healthRatio.failure = summary.failureCount / summary.rowCount;
    summary.healthRatio.warning = summary.warningCount / summary.rowCount;
    summary.healthRatio.ok = summary.okCount / summary.rowCount;
    summary.healthRatio.unknown = summary.unknownCount / summary.rowCount;
  }

  summary.topSignals = [...signalCounts.values()]
    .sort((a, b) => {
      const severityOrder = { failure: 0, warning: 1, ok: 2, info: 3 };
      const severityDelta = (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
      if (severityDelta !== 0) return severityDelta;
      return b.count - a.count;
    })
    .slice(0, 10);

  summary.topFailureColumns = [...failureColumns.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return summary;
}

