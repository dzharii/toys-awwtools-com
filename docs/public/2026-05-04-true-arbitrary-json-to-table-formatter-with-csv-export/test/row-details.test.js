import { describe, expect, test } from "bun:test";
import { buildRowDetails } from "../src/core/row-details.js";

describe("row details", () => {
  test("builds row details with non-empty fields and JSON strings", () => {
    const row = {
      rowIndex: 1,
      sourcePath: ["results", 1],
      sourceLineNumber: null,
      original: { id: "b", success: false, error: { code: "E1" } },
      values: {
        id: { state: "value", type: "string", value: "b", display: "b" },
        success: { state: "value", type: "boolean", value: false, display: "false" },
        "error.code": { state: "value", type: "string", value: "E1", display: "E1" }
      },
      health: { level: "failure", reasons: [{ label: "success=false" }] }
    };
    const columns = [
      { key: "id", label: "id" },
      { key: "success", label: "success" },
      { key: "error.code", label: "error.code" }
    ];
    const details = buildRowDetails(row, columns);
    expect(details.nonEmptyFields.length).toBe(3);
    expect(details.originalJsonText).toContain('"id": "b"');
    expect(details.visibleRowJsonText).toContain('"error.code": "E1"');
  });
});

