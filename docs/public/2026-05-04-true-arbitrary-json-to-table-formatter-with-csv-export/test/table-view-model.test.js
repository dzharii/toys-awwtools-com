import { describe, expect, test } from "bun:test";
import { buildTableViewModel } from "../src/ui/table-view-model.js";

function createBaseState() {
  return {
    parseResult: { ok: true, kind: "json" },
    columns: [{ key: "name", label: "name", path: "name" }],
    visibleColumnKeys: ["name"],
    scoredRows: [],
    flatRows: [],
    table: {
      sort: { columnKey: null, direction: "none" },
      searchQuery: "",
      quickFilter: "all",
      renderLimit: 1000,
      renderCellLimit: 50000,
      columnWidths: {}
    },
    highlightRules: [],
    highlightRulesEnabled: true,
    healthSummary: null
  };
}

function createRow(rowIndex, level) {
  return {
    rowIndex,
    original: { name: `row-${rowIndex}` },
    values: {
      name: { state: "value", type: "string", value: `row-${rowIndex}`, display: `row-${rowIndex}` }
    },
    health: { level, topReason: null, reasons: [] }
  };
}

describe("table view model", () => {
  test("hides Health column when every row is unknown", () => {
    const state = createBaseState();
    state.scoredRows = [createRow(0, "unknown"), createRow(1, "unknown")];
    state.healthSummary = {
      rowCount: 2,
      failureCount: 0,
      warningCount: 0,
      okCount: 0,
      unknownCount: 2
    };

    const model = buildTableViewModel(state);
    expect(model.meta.showHealthColumn).toBe(false);
    expect(model.columns.some((column) => column.key === "__health")).toBe(false);
  });

  test("keeps Health column when there are explicit signals", () => {
    const state = createBaseState();
    state.scoredRows = [createRow(0, "failure"), createRow(1, "unknown")];
    state.healthSummary = {
      rowCount: 2,
      failureCount: 1,
      warningCount: 0,
      okCount: 0,
      unknownCount: 1
    };

    const model = buildTableViewModel(state);
    expect(model.meta.showHealthColumn).toBe(true);
    expect(model.columns.some((column) => column.key === "__health")).toBe(true);
  });
});
