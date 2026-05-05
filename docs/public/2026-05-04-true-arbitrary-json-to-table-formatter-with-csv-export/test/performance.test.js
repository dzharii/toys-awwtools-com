import { describe, expect, test } from "bun:test";
import { buildPerformanceWarnings, formatTiming } from "../src/core/performance.js";

describe("performance helpers", () => {
  test("formatTiming formats milliseconds and seconds", () => {
    expect(formatTiming(12.345)).toContain("ms");
    expect(formatTiming(1250)).toContain("s");
  });

  test("buildPerformanceWarnings emits row/column/render warnings", () => {
    const warnings = buildPerformanceWarnings({
      charCount: 1_200_000,
      rowCount: 6000,
      columnCount: 250,
      renderLimited: true,
      reason: "rowLimit"
    });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.join(" ")).toContain("Render limited");
  });
});

