import { describe, expect, test } from "bun:test";
import {
  buildExportTimestampStamp,
  buildHtmlExportDocument,
  buildHtmlExportFilename,
  escapeCsvCell,
  serializeCsv,
  serializeTsv
} from "../src/core/export-table.js";

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

  test("builds deterministic HTML export timestamp and filename", () => {
    const fixedDate = new Date(2026, 4, 5, 13, 14, 15);
    const stamp = buildExportTimestampStamp(fixedDate);
    expect(stamp).toBe("20260505-131415");
    const filename = buildHtmlExportFilename(fixedDate);
    expect(filename).toBe("json-table-inspector-export-20260505-131415.html");
  });

  test("buildHtmlExportDocument returns standalone html with escaped metadata", () => {
    const html = buildHtmlExportDocument({
      title: "JSON Table Inspector Export",
      metadataLines: [
        { label: "Filter", value: "failures" },
        { label: "Search", value: "<script>alert(1)</script>" }
      ],
      tableHtml: "<table class=\"jti-table\"><thead><tr><th>id</th></tr></thead><tbody><tr><td>a</td></tr></tbody></table>",
      wrapCells: true
    });

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<html lang=\"en\">");
    expect(html).toContain("<head>");
    expect(html).toContain("<style>");
    expect(html).toContain("<body>");
    expect(html).toContain("<table class=\"jti-table\">");
    expect(html).toContain("JSON Table Inspector Export");
    expect(html).toContain("Filter");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
    expect(html.match(/<style>/g)?.length).toBe(1);
  });
});
