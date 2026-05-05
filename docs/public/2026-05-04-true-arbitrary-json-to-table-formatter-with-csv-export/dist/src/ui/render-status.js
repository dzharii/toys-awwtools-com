function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCharCount(charCount) {
  return charCount <= 0 ? "Input empty" : `Input ${formatNumber(charCount)} chars`;
}

function formatParseStatus(state) {
  if (state.parseStatus === "parsing") return "Parsing…";
  if (state.parseStatus === "invalid") {
    const line = state.parseError?.line ? ` line ${state.parseError.line}` : "";
    const column = state.parseError?.column ? ` col ${state.parseError.column}` : "";
    return `Invalid ${state.parseError?.title?.includes("JSONL") ? "JSONL" : "JSON"}${line}${column ? `,${column}` : ""}`;
  }
  if (state.parseResult?.ok && state.parseResult.kind === "jsonl") {
    return `Valid JSONL (${formatNumber(state.parseResult.meta?.recordCount ?? 0)} records)`;
  }
  if (state.parseResult?.ok && state.parseResult.kind === "json") return "Valid JSON";
  if (state.parseResult?.ok && state.parseResult.kind === "empty") return "Empty";
  return "Ready";
}

export function renderStatus(state, refs) {
  const charCount = state.inputMeta?.charCount ?? state.inputText?.length ?? 0;
  const rowCount = Array.isArray(state.scoredRows) && state.scoredRows.length > 0
    ? state.scoredRows.length
    : Array.isArray(state.flatRows)
      ? state.flatRows.length
      : 0;
  const columnCount = Array.isArray(state.columns) ? state.columns.length : 0;
  const failureCount = Number.isFinite(state.healthSummary?.failureCount) ? state.healthSummary.failureCount : 0;

  refs.toolbarBadgeInput.textContent = `Input: ${charCount > 0 ? "loaded" : "empty"}`;
  refs.toolbarBadgeRows.textContent = `Rows: ${formatNumber(rowCount)}`;
  refs.toolbarBadgeColumns.textContent = `Columns: ${formatNumber(columnCount)}`;
  refs.toolbarBadgeFailures.textContent = `Failures: ${formatNumber(failureCount)}`;

  const parseStatusText = formatParseStatus(state);
  refs.parseMeta.textContent = `Status: ${parseStatusText} · ${formatCharCount(charCount)}`;

  let statusLine = `Ready | ${formatCharCount(charCount)} | Rows ${formatNumber(rowCount)} | Columns ${formatNumber(columnCount)} | Failures ${formatNumber(failureCount)}`;
  if (state.parseStatus === "invalid") {
    statusLine = `Invalid JSON | line ${state.parseError?.line ?? "?"}, column ${state.parseError?.column ?? "?"} | fix input to continue`;
  } else if (state.selectedRowSource?.pathLabel) {
    statusLine = `${parseStatusText} | source ${state.selectedRowSource.pathLabel} | Rows ${formatNumber(rowCount)} | Columns ${formatNumber(columnCount)} | Failures ${formatNumber(failureCount)}`;
  } else if (state.parseResult?.ok && state.parseResult.kind !== "empty") {
    statusLine = `${parseStatusText} | row source pending`;
  }

  refs.statusStrip.setAttribute("value", statusLine);
}

