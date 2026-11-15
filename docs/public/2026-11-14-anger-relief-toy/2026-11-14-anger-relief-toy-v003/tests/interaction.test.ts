import { test, expect } from "bun:test";
import { CircleGesture } from "../src/experimental/circle-gesture";
import { clampPanel, cursorPosition } from "../src/ui/position";
import { sectorPolygon } from "../src/ui/wheel";
test("gesture requires deliberate, sustained circles; clicks, lines and interruptions do not qualify", () => {
  const gesture = new CircleGesture();
  let progress = 0;
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 4.2;
    progress = gesture.add({
      x: 100 + 45 * Math.cos(angle),
      y: 100 + 45 * Math.sin(angle),
      t: i * 25,
    });
  }
  expect(progress).toBe(1);
  gesture.reset();
  for (let i = 0; i < 100; i++) expect(gesture.add({ x: i, y: i, t: i * 25 })).toBe(0);
  gesture.reset();
  expect(gesture.add({ x: 100, y: 100, t: 0 })).toBe(0);
  expect(gesture.add({ x: 100, y: 100, t: 2500 })).toBe(0);
  gesture.reset();
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 5;
    progress = gesture.add({
      x: 100 + 5 * Math.cos(angle),
      y: 100 + 5 * Math.sin(angle),
      t: i * 25,
    });
  }
  expect(progress).toBe(0);
});
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
