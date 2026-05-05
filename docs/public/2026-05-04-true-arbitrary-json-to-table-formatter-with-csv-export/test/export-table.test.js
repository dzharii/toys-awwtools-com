import { describe, expect, test } from "bun:test";
import { escapeCsvCell, serializeCsv, serializeTsv } from "../src/core/export-table.js";

describe("export-table", () => {
  test("escapeCsvCell handles RFC quoting", () => {
    const cases = [
      { input: "a,b", expected: '"a,b"' },
      { input: 'a"b', expected: '"a""b"' },
      { input: "a\nb", expected: '"a\nb"' },
      { input: " a", expected: '" a"' },
      { input: "a ", expected: '"a "' },
      { input: "plain", expected: "plain" }
    ];
    for (const item of cases) {
      expect(escapeCsvCell(item.input)).toBe(item.expected);
    }
  });

  test("serializes CSV with formula protection", () => {
    const rows = [
      {
        rowIndex: 0,
        health: { level: "failure" },
        values: {
          note: { state: "value", type: "string", value: "=1+1", display: "=1+1" },
          count: { state: "value", type: "number", value: -5, display: "-5" }
        }
      }
    ];
    const columns = [{ key: "note", label: "note" }, { key: "count", label: "count" }];
    const result = serializeCsv(rows, columns, { includeHealth: true, includeRowNumber: false });
    expect(result.ok).toBe(true);
    expect(result.text).toContain("Health,note,count");
    expect(result.text).toContain("failure,'=1+1,-5");
  });

  test("serializes TSV", () => {
    const rows = [{ rowIndex: 0, health: { level: "ok" }, values: { message: { state: "value", type: "string", value: "hello", display: "hello" } } }];
    const columns = [{ key: "message", label: "message" }];
    const result = serializeTsv(rows, columns, {});
    expect(result.ok).toBe(true);
    expect(result.text).toContain("Health\tmessage");
  });
});

