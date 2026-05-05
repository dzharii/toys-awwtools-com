import { applyColumnVisibility } from "../core/column-visibility.js";
import { computeRenderWindow, filterRows } from "../core/table-filter.js";
import { getCellHighlights } from "../core/highlight-rules.js";
import { sortRows } from "../core/table-sort.js";

function getVisibleColumns(state) {
  const visibleKeys = state.visibleColumnKeys || [];
  const columns = state.columns || [];
  if (visibleKeys.length === 0) return columns;
  return applyColumnVisibility(columns, visibleKeys);
}

function shouldShowHealthColumn(healthSummary) {
  if (!healthSummary || !Number.isFinite(healthSummary.rowCount) || healthSummary.rowCount <= 0) return true;
  const allUnknown = healthSummary.failureCount === 0
    && healthSummary.warningCount === 0
    && healthSummary.okCount === 0
    && healthSummary.unknownCount === healthSummary.rowCount;
  return !allUnknown;
}

function buildSystemColumns(showHealthColumn) {
  const columns = [{ key: "__rowNumber", label: "#", width: 56, system: true }];
  if (showHealthColumn) {
    columns.push({ key: "__health", label: "Health", width: 140, system: true });
  }
  return columns;
}

export function buildTableViewModel(state) {
  if (!state.parseResult?.ok || state.parseResult.kind === "empty") {
    return {
      status: "empty",
      columns: [],
      rows: [],
      visibleColumns: [],
      meta: {
        totalRows: 0,
        visibleRows: 0,
        totalColumns: 0,
        visibleColumns: 0,
        hiddenColumns: 0,
        renderLimited: false
      }
    };
  }

  const allColumns = state.columns || [];
  const visibleColumns = getVisibleColumns(state);
  const scoredRows = (state.scoredRows && state.scoredRows.length > 0 ? state.scoredRows : state.flatRows) || [];
  const showHealthColumn = shouldShowHealthColumn(state.healthSummary);

  const filteredRows = filterRows(scoredRows, visibleColumns, state.table);
  const sortedRows = sortRows(filteredRows, state.table?.sort);
  const renderWindow = computeRenderWindow({
    matchingRows: sortedRows.length,
    visibleColumns: Math.max(1, visibleColumns.length),
    rowLimit: state.table?.renderLimit || 1000,
    cellLimit: state.table?.renderCellLimit || 50000
  });

  const renderedRows = sortedRows.slice(renderWindow.start, renderWindow.end).map((row) => {
    const cells = visibleColumns.map((column) => {
      const cell = row.values?.[column.key] || { state: "missing", type: "missing", value: undefined, display: "" };
      const highlight = state.highlightRulesEnabled
        ? getCellHighlights(cell, column, row, state.highlightRules || [])
        : null;
      return {
        columnKey: column.key,
        state: cell.state,
        type: cell.type,
        value: cell.value,
        display: cell.display ?? "",
        highlight
      };
    });
    return {
      rowIndex: row.rowIndex,
      sourceLineNumber: row.sourceLineNumber ?? null,
      health: row.health || { level: "unknown", topReason: null, reasons: [] },
      original: row.original,
      values: row.values,
      cells
    };
  });

  const tableColumns = [
    ...buildSystemColumns(showHealthColumn),
    ...visibleColumns.map((column) => ({
      key: column.key,
      label: column.label,
      path: column.path,
      width: state.table?.columnWidths?.[column.key] || null,
      sortable: true,
      profile: column
    }))
  ];

  return {
    status: renderedRows.length > 0 ? "ready" : "filtered-empty",
    columns: tableColumns,
    visibleColumns,
    rows: renderedRows,
    allMatchingRows: sortedRows,
    meta: {
      totalRows: scoredRows.length,
      visibleRows: renderedRows.length,
      totalColumns: allColumns.length,
      visibleColumns: visibleColumns.length,
      hiddenColumns: Math.max(0, allColumns.length - visibleColumns.length),
      renderLimited: renderWindow.renderLimited,
      renderReason: renderWindow.reason,
      renderedRowCount: renderWindow.renderedRowCount,
      totalMatchingRows: renderWindow.totalMatchingRows,
      showHealthColumn,
      healthAllUnknown: !showHealthColumn && (state.healthSummary?.rowCount ?? 0) > 0
    }
  };
}
