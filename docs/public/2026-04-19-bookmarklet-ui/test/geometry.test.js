import test from "node:test";
import assert from "node:assert/strict";
import { clampRect, resizeRectFromEdges } from "../src/core/geometry.js";

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

test("clampRect lets tiny viewports override default minimum size", () => {
  const viewport = { x: 0, y: 0, width: 280, height: 180 };
  const rect = clampRect({ x: 0, y: 0, width: 520, height: 420 }, viewport, {
    minWidth: 320,
    minHeight: 200,
    minVisibleTitlebar: 36
  });

  assert.equal(rect.width, 280);
  assert.equal(rect.height, 180);
});

test("resizeRectFromEdges preserves east edge when west resize reaches minimum width", () => {
  const viewport = { x: 0, y: 0, width: 800, height: 600 };
  const rect = resizeRectFromEdges(
    { x: 100, y: 100, width: 400, height: 300 },
    "w",
    300,
    0,
    viewport,
    { minWidth: 320, minHeight: 200, minVisibleTitlebar: 36 }
  );

  assert.equal(rect.width, 320);
  assert.equal(rect.x, 180);
  assert.equal(rect.x + rect.width, 500);
});

test("resizeRectFromEdges preserves south edge when north resize reaches minimum height", () => {
  const viewport = { x: 0, y: 0, width: 800, height: 600 };
  const rect = resizeRectFromEdges(
    { x: 100, y: 100, width: 400, height: 300 },
    "n",
    0,
    200,
    viewport,
    { minWidth: 320, minHeight: 200, minVisibleTitlebar: 36 }
  );

  assert.equal(rect.height, 200);
  assert.equal(rect.y, 200);
  assert.equal(rect.y + rect.height, 400);
});
