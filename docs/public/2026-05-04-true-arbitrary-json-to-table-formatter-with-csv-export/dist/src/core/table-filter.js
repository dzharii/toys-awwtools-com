function normalizeString(value) {
  return String(value ?? "").toLowerCase();
}

function matchesQuickFilter(row, quickFilter) {
  const level = row.health?.level ?? "unknown";
  if (quickFilter === "all") return true;
  if (quickFilter === "issues") return level === "failure" || level === "warning";
  if (quickFilter === "failures") return level === "failure";
  if (quickFilter === "warnings") return level === "warning";
  if (quickFilter === "ok") return level === "ok";
  if (quickFilter === "unknown") return level === "unknown";
  return true;
}

function buildRowSearchText(row, visibleColumns) {
  const parts = [`${row.rowIndex + 1}`, row.health?.level ?? "unknown", row.health?.topReason ?? ""];
  for (const column of visibleColumns) {
    const cell = row.values?.[column.key];
    if (!cell || cell.state === "missing") continue;
    parts.push(String(cell.display ?? cell.value ?? ""));
  }
  return parts.join(" ").toLowerCase();
}

function matchesSearch(row, visibleColumns, query) {
  const normalizedQuery = normalizeString(query).trim();
  if (!normalizedQuery) return true;
  const rowText = buildRowSearchText(row, visibleColumns);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (!rowText.includes(token)) return false;
  }
  return true;
}

export function filterRows(rows, visibleColumns, tableState) {
  const quickFilter = tableState?.quickFilter || "all";
  const searchQuery = tableState?.searchQuery || "";
  return (rows || []).filter((row) => {
    if (!matchesQuickFilter(row, quickFilter)) return false;
    if (!matchesSearch(row, visibleColumns, searchQuery)) return false;
    return true;
  });
}

export function computeRenderWindow({ matchingRows, visibleColumns, rowLimit = 1000, cellLimit = 50000 }) {
  const totalRows = Math.max(0, matchingRows || 0);
  const columns = Math.max(1, visibleColumns || 0);
  const byCellLimit = Math.max(1, Math.floor(cellLimit / columns));
  const effectiveLimit = Math.max(1, Math.min(rowLimit, byCellLimit));
  const renderedRowCount = Math.min(totalRows, effectiveLimit);
  return {
    start: 0,
    end: renderedRowCount,
    renderedRowCount,
    totalMatchingRows: totalRows,
    renderLimited: totalRows > renderedRowCount,
    reason: totalRows > renderedRowCount ? (effectiveLimit === rowLimit ? "rowLimit" : "cellLimit") : null
  };
}

