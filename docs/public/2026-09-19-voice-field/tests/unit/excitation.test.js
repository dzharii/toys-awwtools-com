import { describe, expect, test } from "bun:test";
import { ExcitationPoint } from "../../src/js/render/excitation.js";

describe("ExcitationPoint", () => {
  test("wanders continuously inside the useful Stage interior", () => {
    const point = new ExcitationPoint();
    let previous = point.snapshot();
    let curved = false;
    for (let index = 0; index < 24000; index += 1) {
      const current = point.update(1 / 60, 0.72);
      expect(current.x).toBeGreaterThanOrEqual(0.1);
      expect(current.x).toBeLessThanOrEqual(0.9);
      expect(current.y).toBeGreaterThanOrEqual(0.12);
      expect(current.y).toBeLessThanOrEqual(0.88);
      expect(Math.hypot(current.x - previous.x, current.y - previous.y)).toBeLessThan(0.003);
      if (Math.abs(current.vx - previous.vx) > 0.000001 && Math.abs(current.vy - previous.vy) > 0.000001) curved = true;
      previous = { ...current };
    }
    expect(curved).toBe(true);
  });
});
