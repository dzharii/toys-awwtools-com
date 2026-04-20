import test from "node:test";
import assert from "node:assert/strict";
import { clampRect } from "../src/core/geometry.js";

test("clampRect enforces minimum size", () => {
  const viewport = { x: 0, y: 0, width: 800, height: 600 };
  const rect = clampRect({ x: 10, y: 10, width: 100, height: 80 }, viewport, {
    minWidth: 320,
    minHeight: 200,
    minVisibleTitlebar: 36
  });

  assert.equal(rect.width, 320);
  assert.equal(rect.height, 200);
});

test("clampRect keeps titlebar recoverable", () => {
  const viewport = { x: 0, y: 0, width: 500, height: 400 };
  const rect = clampRect({ x: 900, y: 30, width: 400, height: 300 }, viewport, {
    minWidth: 320,
    minHeight: 200,
    minVisibleTitlebar: 36
  });

  assert.ok(rect.x <= 500 - 36);
});
