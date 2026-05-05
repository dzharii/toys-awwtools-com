import { describe, expect, test } from "bun:test";
import { hasNonEmptyTextSelection, isPointerDrag } from "../src/ui/table-interactions.js";

describe("table interactions", () => {
  test("isPointerDrag uses movement threshold", () => {
    expect(isPointerDrag({ x: 10, y: 10 }, { x: 12, y: 12 })).toBe(false);
    expect(isPointerDrag({ x: 10, y: 10 }, { x: 20, y: 10 })).toBe(true);
  });

  test("hasNonEmptyTextSelection ignores collapsed and empty selections", () => {
    expect(hasNonEmptyTextSelection(null)).toBe(false);
    expect(hasNonEmptyTextSelection({ isCollapsed: true, toString: () => "text" })).toBe(false);
    expect(hasNonEmptyTextSelection({ isCollapsed: false, toString: () => "   " })).toBe(false);
    expect(hasNonEmptyTextSelection({ isCollapsed: false, toString: () => "value" })).toBe(true);
  });
});
