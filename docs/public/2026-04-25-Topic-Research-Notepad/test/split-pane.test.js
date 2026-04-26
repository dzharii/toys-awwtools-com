import { describe, expect, test } from "bun:test";
import { clampSplitValue, normalizeSplitDirection, splitValueFromPointerDelta } from "../ui-framework/src/components/split-pane.js";

describe("split pane sizing helpers", () => {
  test("normalizes direction", () => {
    expect(normalizeSplitDirection("vertical")).toBe("vertical");
    expect(normalizeSplitDirection("bad")).toBe("horizontal");
  });

  test("clamps values to start and end minimums", () => {
    expect(clampSplitValue(100, { available: 800, minStart: 180, minEnd: 300 })).toBe(180);
    expect(clampSplitValue(700, { available: 800, minStart: 180, minEnd: 300 })).toBe(500);
    expect(clampSplitValue(460, { available: 800, minStart: 180, minEnd: 300, maxStart: 420 })).toBe(420);
  });

  test("degrades without negative sizes when container is too small", () => {
    expect(clampSplitValue(200, { available: 120, minStart: 180, minEnd: 100 })).toBe(20);
  });

  test("calculates horizontal and vertical pointer deltas", () => {
    expect(splitValueFromPointerDelta("horizontal", { startValue: 280, startClientX: 10, startClientY: 20, clientX: 40, clientY: 90 })).toBe(310);
    expect(splitValueFromPointerDelta("vertical", { startValue: 280, startClientX: 10, startClientY: 20, clientX: 40, clientY: 90 })).toBe(350);
  });
});
