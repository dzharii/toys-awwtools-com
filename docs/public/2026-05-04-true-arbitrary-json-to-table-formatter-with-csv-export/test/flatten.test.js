import { describe, expect, test } from "bun:test";
import { extractRowsFromSource } from "../src/core/extract-rows.js";
import { flattenRows } from "../src/core/flatten.js";
import { chooseDefaultVisibleColumns, orderColumns } from "../src/core/order-columns.js";
import { profileColumns } from "../src/core/profile-columns.js";

describe("flatten/profile/order", () => {
  test("extracts rows from selected path and flattens nested objects", () => {
    const parseResult = {
      ok: true,
      kind: "json",
      root: {
        results: [
          { id: "a", success: true, metrics: { durationMs: 10 } },
          { id: "b", success: false, error: { code: "E_TIMEOUT" } }
        ]
      }
    };
    const rowSource = { kind: "array", path: ["results"], pathLabel: "results[]" };
    const extracted = extractRowsFromSource(parseResult, rowSource);
    expect(extracted.ok).toBe(true);
    expect(extracted.rows.length).toBe(2);

    const flattened = flattenRows(extracted.rows);
    expect(flattened.meta.rowCount).toBe(2);
    expect(flattened.columns.map((column) => column.key)).toContain("metrics.durationMs");
    expect(flattened.flatRows[1].values["error.code"].value).toBe("E_TIMEOUT");
  });

  test("distinguishes missing, null, and empty", () => {
    const rows = [
      { rowIndex: 0, sourcePath: [0], original: { id: 1, error: null, note: "" } },
      { rowIndex: 1, sourcePath: [1], original: { id: 2, list: [] } }
    ];
    const flattened = flattenRows(rows);
    const profiles = profileColumns(flattened.flatRows, flattened.columns);
    const errorProfile = profiles.find((column) => column.key === "error");
    const noteProfile = profiles.find((column) => column.key === "note");
    const listProfile = profiles.find((column) => column.key === "list");
    expect(errorProfile.nullCount).toBe(1);
    expect(noteProfile.emptyCount).toBe(1);
    expect(listProfile.emptyCount).toBe(1);
    expect(errorProfile.missingCount).toBe(1);
  });

  test("orders columns and chooses default visibility", () => {
    const rows = [
      {
        rowIndex: 0,
        sourcePath: [0],
        original: { id: "a", success: true, message: "ok", constant: "x" },
        values: {
          id: { state: "value", type: "string", value: "a", display: "a" },
          success: { state: "value", type: "boolean", value: true, display: "true" },
          message: { state: "value", type: "string", value: "ok", display: "ok" },
          constant: { state: "value", type: "string", value: "x", display: "x" }
        }
      },
      {
        rowIndex: 1,
        sourcePath: [1],
        original: { id: "b", success: false, message: "timeout", constant: "x" },
        values: {
          id: { state: "value", type: "string", value: "b", display: "b" },
          success: { state: "value", type: "boolean", value: false, display: "false" },
          message: { state: "value", type: "string", value: "timeout", display: "timeout" },
          constant: { state: "value", type: "string", value: "x", display: "x" }
        }
      }
    ];
    const columns = [
      { key: "id", path: ["id"], label: "id", order: 0 },
      { key: "success", path: ["success"], label: "success", order: 1 },
      { key: "message", path: ["message"], label: "message", order: 2 },
      { key: "constant", path: ["constant"], label: "constant", order: 3 }
    ];
    const profiles = profileColumns(rows, columns);
    const ordered = orderColumns(profiles, "failureFirst");
    expect(ordered[0].key).toBe("id");
    const defaults = chooseDefaultVisibleColumns(ordered, { maxVisibleColumns: 3 });
    expect(defaults.visibleColumnKeys.includes("constant")).toBe(false);
  });
});

