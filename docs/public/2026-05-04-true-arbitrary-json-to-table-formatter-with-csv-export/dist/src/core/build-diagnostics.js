export function buildDiagnostics(context) {
  const items = [];
  const groups = {
    parse: [],
    rowSource: [],
    flatten: [],
    columns: [],
    health: []
  };

  const parseResult = context?.parseResult;
  if (!parseResult || !parseResult.ok) {
    groups.parse.push({
      code: "PARSE_NOT_READY",
      severity: "error",
      title: "Input not ready",
      message: "Fix parse errors before continuing."
    });
  } else {
    groups.parse.push({
      code: "PARSE_OK",
      severity: "ok",
      title: "Input parsed",
      message: parseResult.kind === "jsonl" ? "Valid JSONL input." : "Valid JSON input.",
      details: {
        kind: parseResult.kind,
        rootType: parseResult.meta?.rootType
      }
    });
    for (const warning of parseResult.warnings || []) {
      groups.parse.push({
        code: "PARSE_WARNING",
        severity: "warning",
        title: "Parse warning",
        message: warning
      });
    }
  }

  const selectedRowSource = context?.selectedRowSource;
  if (selectedRowSource) {
    groups.rowSource.push({
      code: "ROW_SOURCE_SELECTED",
      severity: selectedRowSource.confidence === "low" ? "warning" : "ok",
      title: "Row source selected",
      message: `${selectedRowSource.pathLabel} (${selectedRowSource.rowCount} rows, ${selectedRowSource.confidence} confidence).`
    });
    for (const warning of selectedRowSource.warnings || []) {
      groups.rowSource.push({
        code: "ROW_SOURCE_WARNING",
        severity: "warning",
        title: "Row source warning",
        message: warning
      });
    }
  } else if (parseResult?.ok && parseResult.kind !== "empty") {
    groups.rowSource.push({
      code: "ROW_SOURCE_NONE",
      severity: "warning",
      title: "No row source",
      message: "No table-like row source was detected."
    });
  }

  const flattenResult = context?.flattenResult;
  if (flattenResult) {
    groups.flatten.push({
      code: "FLATTEN_SUMMARY",
      severity: "info",
      title: "Flattened rows",
      message: `${flattenResult.meta?.rowCount ?? 0} rows and ${flattenResult.meta?.columnCount ?? 0} columns are ready.`
    });
    for (const warning of flattenResult.warnings || []) {
      groups.flatten.push({
        code: "FLATTEN_WARNING",
        severity: "warning",
        title: "Flatten warning",
        message: warning
      });
    }
  }

  const columns = context?.columns || [];
  if (columns.length > 0) {
    const mostlyMissing = columns.filter((column) => column.isMostlyMissing).length;
    const mixed = columns.filter((column) => column.mixedTypes).length;
    const constant = columns.filter((column) => column.isConstant).length;
    const longText = columns.filter((column) => column.isLongText).length;
    groups.columns.push({
      code: "COLUMN_SUMMARY",
      severity: "info",
      title: "Column profile",
      message: `${columns.length} columns profiled; ${mostlyMissing} mostly missing, ${mixed} mixed-type, ${constant} constant, ${longText} long-text.`
    });
  }

  const healthSummary = context?.healthSummary;
  if (healthSummary) {
    groups.health.push({
      code: "HEALTH_SUMMARY",
      severity: healthSummary.failureCount > 0 ? "warning" : "info",
      title: "Health summary",
      message: `${healthSummary.failureCount} failures, ${healthSummary.warningCount} warnings, ${healthSummary.okCount} ok, ${healthSummary.unknownCount} unknown.`
    });
    if (healthSummary.unknownCount === healthSummary.rowCount && healthSummary.rowCount > 0) {
      groups.health.push({
        code: "HEALTH_ALL_UNKNOWN",
        severity: "warning",
        title: "No clear health signals",
        message: "Rows are unknown because no obvious success/failure fields were found."
      });
    }
    for (const signal of healthSummary.topSignals?.slice(0, 5) || []) {
      groups.health.push({
        code: `SIGNAL_${signal.code}`,
        severity: signal.severity || "info",
        title: "Top signal",
        message: `${signal.label} (${signal.count} rows).`
      });
    }
  }

  for (const groupItems of Object.values(groups)) {
    items.push(...groupItems);
  }

  const severityOrder = { error: 3, warning: 2, info: 1, ok: 0 };
  const overallSeverityScore = items.reduce((max, item) => Math.max(max, severityOrder[item.severity] ?? 0), 0);
  const severity = Object.entries(severityOrder).find(([, score]) => score === overallSeverityScore)?.[0] || "ok";

  return {
    severity,
    items,
    groups
  };
}

