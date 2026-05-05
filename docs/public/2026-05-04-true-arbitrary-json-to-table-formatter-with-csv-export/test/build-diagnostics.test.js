import { describe, expect, test } from "bun:test";
import { buildDiagnostics } from "../src/core/build-diagnostics.js";

describe("build diagnostics", () => {
  test("produces grouped diagnostics with severity", () => {
    const diagnostics = buildDiagnostics({
      parseResult: { ok: true, kind: "json", meta: { rootType: "object" }, warnings: [] },
      selectedRowSource: { pathLabel: "results[]", rowCount: 2, confidence: "high", warnings: [] },
      flattenResult: { meta: { rowCount: 2, columnCount: 5 }, warnings: [] },
      columns: [{ key: "id", isMostlyMissing: false, mixedTypes: false, isConstant: false, isLongText: false }],
      healthSummary: { rowCount: 2, failureCount: 1, warningCount: 0, okCount: 1, unknownCount: 0, topSignals: [] }
    });
    expect(diagnostics.items.length).toBeGreaterThan(0);
    expect(["ok", "info", "warning", "error"]).toContain(diagnostics.severity);
  });
});

