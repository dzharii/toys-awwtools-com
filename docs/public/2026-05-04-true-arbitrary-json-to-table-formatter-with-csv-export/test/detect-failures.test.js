import { describe, expect, test } from "bun:test";
import { buildDatasetHealthSummary, scoreRows } from "../src/core/detect-failures.js";

describe("failure detection", () => {
  test("scores rows with failure/warning/ok/unknown levels", () => {
    const columns = [
      { key: "success" },
      { key: "status" },
      { key: "error.code" },
      { key: "retryCount" }
    ];
    const rows = [
      {
        rowIndex: 0,
        values: {
          success: { state: "value", type: "boolean", value: true, display: "true" },
          status: { state: "value", type: "string", value: "success", display: "success" }
        }
      },
      {
        rowIndex: 1,
        values: {
          success: { state: "value", type: "boolean", value: false, display: "false" },
          "error.code": { state: "value", type: "string", value: "E_TIMEOUT", display: "E_TIMEOUT" }
        }
      },
      {
        rowIndex: 2,
        values: {
          status: { state: "value", type: "string", value: "warning", display: "warning" },
          retryCount: { state: "value", type: "number", value: 2, display: "2" }
        }
      },
      {
        rowIndex: 3,
        values: {}
      }
    ];

    const scored = scoreRows(rows, columns);
    expect(scored[0].health.level).toBe("ok");
    expect(scored[1].health.level).toBe("failure");
    expect(scored[2].health.level).toBe("warning");
    expect(scored[3].health.level).toBe("unknown");
  });

  test("builds dataset health summary", () => {
    const scoredRows = [
      { health: { level: "failure", reasons: [{ code: "X", label: "x", severity: "failure", columnKey: "success" }] } },
      { health: { level: "warning", reasons: [{ code: "Y", label: "y", severity: "warning", columnKey: "status" }] } },
      { health: { level: "ok", reasons: [] } },
      { health: { level: "unknown", reasons: [] } }
    ];
    const summary = buildDatasetHealthSummary(scoredRows, []);
    expect(summary.failureCount).toBe(1);
    expect(summary.warningCount).toBe(1);
    expect(summary.okCount).toBe(1);
    expect(summary.unknownCount).toBe(1);
    expect(summary.topSignals.length).toBeGreaterThan(0);
  });
});

