import assert from "node:assert/strict";
import {
  calculateAxisLayout,
  calculateCellRectangle,
  calculateGridLayout,
  enumerateAtlasCells,
  orderCells,
} from "../src/grid/grid-math.js";
import { createDefaultGridDefinition } from "../src/state/defaults.js";
import { createNamedCells, sanitizeFileComponent, validateNamingTemplate } from "../src/atlas/sprite-naming.js";

const tests = [];
function test(name, callback) { tests.push({ name, callback }); }

test("U01 borderless cells without separators", () => {
  const result = calculateAxisLayout({
    canvasDimensionPixels: 100, originPixels: 0, leadingBorderPixels: 0,
    trailingBorderPixels: 0, cellDimensionPixels: 10, separatorDimensionPixels: 0,
    countMode: "automatic", requestedCellCount: 10,
  });
  assert.equal(result.completeCellCount, 10);
  assert.equal(result.remainderPixels, 0);
  assert.equal(result.usedDimensionPixels, 100);
});

test("U02 one-pixel separators reserve exact pixels", () => {
  const definition = createDefaultGridDefinition();
  definition.canvas.widthPixels = 100;
  definition.canvas.heightPixels = 100;
  definition.cell.widthPixels = 10;
  definition.cell.heightPixels = 10;
  definition.separator.widthPixels = 1;
  definition.separator.heightPixels = 1;
  const result = calculateGridLayout(definition);
  assert.equal(result.horizontal.completeCellCount, 9);
  assert.equal(result.horizontal.usedDimensionPixels, 98);
  assert.equal(result.horizontal.remainderPixels, 2);
  assert.deepEqual(calculateCellRectangle(definition, 1, 0), { x: 11, y: 0, width: 10, height: 10 });
  assert.deepEqual(calculateCellRectangle(definition, 8, 0), { x: 88, y: 0, width: 10, height: 10 });
});

test("U03 one-pixel outer borders fit exactly", () => {
  const definition = createDefaultGridDefinition();
  Object.assign(definition.canvas, { widthPixels: 100, heightPixels: 100 });
  Object.assign(definition.cell, { widthPixels: 10, heightPixels: 10 });
  definition.outerBorder.enabled = true;
  Object.assign(definition.outerBorder, { leftPixels: 1, topPixels: 1, rightPixels: 1, bottomPixels: 1 });
  const result = calculateGridLayout(definition);
  assert.equal(result.horizontal.completeCellCount, 9);
  assert.equal(result.horizontal.remainderPixels, 0);
  assert.deepEqual(calculateCellRectangle(definition, 0, 0), { x: 1, y: 1, width: 10, height: 10 });
});

test("U04 partial final cell has 9 present and 3 missing pixels", () => {
  const result = calculateAxisLayout({
    canvasDimensionPixels: 100, originPixels: 0, leadingBorderPixels: 0,
    trailingBorderPixels: 0, cellDimensionPixels: 12, separatorDimensionPixels: 1,
    countMode: "automatic", requestedCellCount: 8,
  });
  assert.equal(result.completeCellCount, 7);
  assert.equal(result.nextCellStartPixels, 91);
  assert.equal(result.partialCellPixels, 9);
  assert.equal(result.missingPartialCellPixels, 3);
});

test("U05 fixed-count overflow is exact", () => {
  const result = calculateAxisLayout({
    canvasDimensionPixels: 100, originPixels: 0, leadingBorderPixels: 0,
    trailingBorderPixels: 0, cellDimensionPixels: 12, separatorDimensionPixels: 1,
    countMode: "fixed", requestedCellCount: 8,
  });
  assert.equal(result.requiredDimensionPixels, 103);
  assert.equal(result.overflowPixels, 3);
});

test("U06 asymmetric borders and origin produce exact coordinates", () => {
  const definition = createDefaultGridDefinition();
  Object.assign(definition.canvas, { widthPixels: 512, heightPixels: 256 });
  Object.assign(definition.gridOrigin, { xPixels: 8, yPixels: 4 });
  Object.assign(definition.cell, { widthPixels: 32, heightPixels: 32 });
  definition.outerBorder.enabled = true;
  Object.assign(definition.outerBorder, { leftPixels: 2, topPixels: 2, rightPixels: 6, bottomPixels: 3 });
  assert.deepEqual(calculateCellRectangle(definition, 3, 2), { x: 109, y: 72, width: 32, height: 32 });
});

test("traversal order preserves physical coordinates", () => {
  const cells = [
    { row: 0, column: 0 }, { row: 0, column: 1 }, { row: 1, column: 0 }, { row: 1, column: 1 },
  ];
  assert.deepEqual(orderCells(cells, "row-major").map(({ row, column }) => [row, column]), [[0,0],[0,1],[1,0],[1,1]]);
  assert.deepEqual(orderCells(cells, "column-major").map(({ row, column }) => [row, column]), [[0,0],[1,0],[0,1],[1,1]]);
});

test("crop and transparent-pad policies derive correct output rectangles", () => {
  const definition = createDefaultGridDefinition();
  Object.assign(definition.canvas, { widthPixels: 100, heightPixels: 24 });
  Object.assign(definition.cell, { widthPixels: 12, heightPixels: 12 });
  Object.assign(definition.separator, { widthPixels: 1, heightPixels: 1 });
  definition.atlas.rightEdgePolicy = "crop";
  definition.atlas.bottomEdgePolicy = "pad-transparent";
  const cells = enumerateAtlasCells(definition);
  const bottomRight = cells.at(-1);
  assert.equal(bottomRight.complete, false);
  assert.deepEqual(bottomRight.sourceRectangle, { x: 91, y: 13, width: 9, height: 11 });
  assert.deepEqual(bottomRight.outputRectangle, { width: 9, height: 12 });
});

test("naming tokens pad, sanitize, and detect duplicates", () => {
  const cell = { row: 2, column: 5, sourceRectangle: { x: 160, y: 64, width: 32, height: 32 }, outputRectangle: { width: 32, height: 32 } };
  const naming = { prefix: "hero", template: "{prefix}_{index:000}_{row}_{column}", startIndex: 1, rowStartIndex: 0, columnStartIndex: 0 };
  assert.equal(createNamedCells([cell], naming, "atlas.png").cells[0].fileName, "hero_001_2_5.png");
  assert.equal(sanitizeFileComponent("bad:name?.png "), "bad_name_.png");
  assert.equal(validateNamingTemplate("{wat}").valid, false);
  const duplicateNaming = { ...naming, template: "same" };
  assert.deepEqual(createNamedCells([cell, { ...cell, column: 6 }], duplicateNaming, "atlas.png").duplicates, ["same.png"]);
});

let failures = 0;
for (const { name, callback } of tests) {
  try {
    await callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}\n${error.stack}`);
  }
}
console.log(`\n${tests.length - failures} passed, ${failures} failed`);
if (failures) process.exitCode = 1;
