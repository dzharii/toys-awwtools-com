import { hasNonEmptyTextSelection, isPointerDrag } from "./table-interactions.js";

function createBadge(level, reason) {
  const badge = document.createElement("span");
  badge.className = `jti-health-badge jti-health-${level || "unknown"}`;
  badge.textContent = level || "unknown";
  if (reason) badge.title = reason;
  return badge;
}

function createCellDisplay(cell) {
  const node = document.createElement("span");
  node.className = `jti-cell-value jti-cell-${cell.state || "value"} jti-type-${cell.type || "unknown"}`;
  if (cell.state === "missing") {
    node.textContent = "—";
    node.title = "Missing";
  } else if (cell.state === "null") {
    node.textContent = "null";
  } else if (cell.state === "empty" && cell.type === "string") {
    node.textContent = "\"\"";
  } else {
    node.textContent = cell.display ?? "";
  }
  return node;
}

function applyHighlight(cellElement, highlightRule) {
  if (!highlightRule) return;
  const tone = highlightRule.style?.tone || "warning";
  cellElement.classList.add("jti-highlight", `jti-highlight--${tone}`);
  if (tone === "custom" && highlightRule.style?.backgroundColor) {
    cellElement.style.setProperty("--jti-highlight-bg", highlightRule.style.backgroundColor);
  }
}

function sortAria(sortState, columnKey) {
  if (!sortState || sortState.columnKey !== columnKey || sortState.direction === "none") return "none";
  return sortState.direction === "asc" ? "ascending" : "descending";
}

function systemHeaderClass(column) {
  if (!column.system) return "jti-th";
  if (column.key === "__rowNumber") return "jti-th jti-th--system jti-th--row-number";
  if (column.key === "__health") return "jti-th jti-th--system jti-th--health";
  return "jti-th jti-th--system";
}

export function updateSelectedRowClass(tableContainer, previousRowIndex, nextRowIndex) {
  if (!tableContainer) return;
  if (Number.isFinite(previousRowIndex)) {
    tableContainer.querySelector(`[data-row-index="${previousRowIndex}"]`)?.classList.remove("jti-row--selected");
  }
  if (Number.isFinite(nextRowIndex)) {
    tableContainer.querySelector(`[data-row-index="${nextRowIndex}"]`)?.classList.add("jti-row--selected");
  }
}

export function renderTable(viewModel, refs, state, handlers = {}) {
  refs.tableContainer.replaceChildren();

  if (viewModel.status === "empty") {
    const message = document.createElement("p");
    message.className = "jti-table-placeholder";
    message.textContent = "Paste JSON or load an example to generate table rows.";
    refs.tableContainer.append(message);
    return;
  }

  if (viewModel.status === "filtered-empty") {
    const message = document.createElement("p");
    message.className = "jti-table-placeholder";
    message.textContent = "No rows match current search/filter.";
    refs.tableContainer.append(message);
    return;
  }

  const scroll = document.createElement("div");
  scroll.className = "jti-table-scroll";
  const table = document.createElement("table");
  table.className = "jti-table";
  table.setAttribute("aria-label", "JSON table inspector results");

  const colGroup = document.createElement("colgroup");
  for (const column of viewModel.columns) {
    const col = document.createElement("col");
    const width = state.table?.columnWidths?.[column.key] ?? column.width;
    if (Number.isFinite(width)) col.style.width = `${width}px`;
    colGroup.append(col);
  }
  table.append(colGroup);

  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const column of viewModel.columns) {
    const th = document.createElement("th");
    th.scope = "col";
    th.className = systemHeaderClass(column);
    th.setAttribute("aria-sort", column.system ? "none" : sortAria(state.table?.sort, column.key));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jti-sort-button";
    button.textContent = column.label;
    button.dataset.columnKey = column.key;
    if (column.system) {
      button.disabled = true;
      button.classList.add("jti-sort-button--system");
    } else {
      button.addEventListener("click", () => handlers.onSort?.(column.key));
    }
    th.append(button);
    headRow.append(th);
  }
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  const showHealthColumn = viewModel.meta?.showHealthColumn !== false;
  const selectedRowIndex = state.table?.selectedRowIndex;
  let pointerDownInfo = null;

  for (const row of viewModel.rows) {
    const tr = document.createElement("tr");
    tr.className = `jti-row jti-row-${row.health.level || "unknown"}`;
    if (selectedRowIndex === row.rowIndex) {
      tr.classList.add("jti-row--selected");
    }
    tr.dataset.rowIndex = String(row.rowIndex);
    tr.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      pointerDownInfo = {
        x: event.clientX,
        y: event.clientY,
        rowIndex: row.rowIndex
      };
    });
    tr.addEventListener("click", (event) => {
      const selection = window.getSelection?.();
      const dragged = isPointerDrag(pointerDownInfo, { x: event.clientX, y: event.clientY });
      const hasSelection = hasNonEmptyTextSelection(selection);
      pointerDownInfo = null;
      if (dragged || hasSelection) {
        handlers.onSkipRowSelection?.(row.rowIndex);
        return;
      }
      handlers.onSelectRow?.(row.rowIndex);
    });

    const rowNumberTd = document.createElement("td");
    rowNumberTd.className = "jti-cell jti-system-cell jti-cell--system jti-cell--row-number";
    rowNumberTd.textContent = String(row.rowIndex + 1);
    tr.append(rowNumberTd);

    if (showHealthColumn) {
      const healthTd = document.createElement("td");
      healthTd.className = "jti-cell jti-system-cell jti-cell--system jti-cell--health";
      healthTd.append(createBadge(row.health.level, row.health.topReason));
      tr.append(healthTd);
    }

    for (const cell of row.cells) {
      const td = document.createElement("td");
      td.className = "jti-cell jti-cell--data";
      td.dataset.columnKey = cell.columnKey;
      const valueNode = createCellDisplay(cell);
      applyHighlight(td, cell.highlight);
      td.append(valueNode);
      tr.append(td);
    }
    body.append(tr);
  }
  table.append(body);
  scroll.append(table);
  refs.tableContainer.append(scroll);
}
