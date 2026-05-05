import { describe, expect, test } from "bun:test";
import { computeRenderWindow, filterRows } from "../src/core/table-filter.js";
import { getCellHighlights, validateHighlightRule } from "../src/core/highlight-rules.js";
import { sortRows } from "../src/core/table-sort.js";

describe("table core", () => {
  const columns = [{ key: "message", label: "message" }];
  const rows = [
    { rowIndex: 0, health: { level: "ok", topReason: null }, values: { message: { state: "value", type: "string", value: "all good", display: "all good" } } },
    { rowIndex: 1, health: { level: "failure", topReason: "timeout" }, values: { message: { state: "value", type: "string", value: "timeout", display: "timeout" } } },
    { rowIndex: 2, health: { level: "warning", topReason: "retry" }, values: { message: { state: "value", type: "string", value: "retry soon", display: "retry soon" } } }
  ];

  test("quick filter and search", () => {
    const failures = filterRows(rows, columns, { quickFilter: "failures", searchQuery: "" });
    expect(failures.length).toBe(1);
    const search = filterRows(rows, columns, { quickFilter: "all", searchQuery: "retry" });
    expect(search.length).toBe(1);
  });

  test("stable sort by column", () => {
    const sorted = sortRows(rows, { columnKey: "message", direction: "asc" });
    expect(sorted[0].rowIndex).toBe(0);
    expect(sorted[2].rowIndex).toBe(1);
  });

  test("render window row and cell caps", () => {
    const byRow = computeRenderWindow({ matchingRows: 1200, visibleColumns: 10, rowLimit: 1000, cellLimit: 50000 });
    expect(byRow.renderedRowCount).toBe(1000);
    expect(byRow.renderLimited).toBe(true);
    const byCell = computeRenderWindow({ matchingRows: 1200, visibleColumns: 300, rowLimit: 1000, cellLimit: 50000 });
    expect(byCell.renderedRowCount).toBeLessThan(1000);
    expect(byCell.reason).toBe("cellLimit");
  });

  test("highlight rule validation and matching", () => {
    const valid = validateHighlightRule(
      { id: "r1", columnKey: "message", operator: "contains", value: "timeout", style: { tone: "danger" } },
      columns
    );
    expect(valid.ok).toBe(true);
    const match = getCellHighlights(rows[1].values.message, columns[0], rows[1], [valid.rule]);
    expect(match.id).toBe("r1");
  });
});

