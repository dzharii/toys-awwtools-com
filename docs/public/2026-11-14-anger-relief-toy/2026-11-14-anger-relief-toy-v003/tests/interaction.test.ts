import { test, expect } from "bun:test";
import { clampPanel, cursorPosition } from "../src/ui/position";
import { sectorPolygon } from "../src/ui/wheel";
test("dialog and cursor positions keep controls accessible at boundaries", () => {
  expect(clampPanel({ x: -500, y: 999 }, 700, 600, { width: 920, height: 720 })).toEqual({
    x: 8,
    y: 616,
  });
  expect(clampPanel({ x: 1000, y: -3 }, 700, 600, { width: 920, height: 720 })).toEqual({
    x: 212,
    y: 8,
  });
  expect(cursorPosition(100, 100, 48, { width: 920, height: 720 })).toEqual({ x: 138, y: 138 });
  expect(cursorPosition(919, 719, 48, { width: 920, height: 720 })).toEqual({ x: 864, y: 664 });
});
test("wheel sectors form bounded annular polygons instead of detached square tiles", () => {
  const shapes = Array.from({ length: 8 }, (_, i) => sectorPolygon(i, 8));
  expect(new Set(shapes).size).toBe(8);
  for (const shape of shapes) {
    expect(shape.startsWith("polygon(")).toBe(true);
    for (const n of shape.matchAll(/([\d.]+)%/g)) {
      expect(Number(n[1])).toBeGreaterThanOrEqual(0);
      expect(Number(n[1])).toBeLessThanOrEqual(100);
    }
  }
});
