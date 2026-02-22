import assert from "node:assert/strict";
import {
  isIdentifierChar,
  hasBoundedSymbolAt,
  findBoundedSymbolInLine,
  getLineText,
  isOccurrenceValidInLine,
} from "../modules/symbol-ref-validation.js";

assert.equal(isIdentifierChar("a"), true);
assert.equal(isIdentifierChar("_"), true);
assert.equal(isIdentifierChar("$"), true);
assert.equal(isIdentifierChar("-"), false);

const line = "  copyFileSource(file); // call";
assert.equal(hasBoundedSymbolAt(line, "copyFileSource", 2), true);
assert.equal(hasBoundedSymbolAt(line, "copy", 2), false);
assert.equal(findBoundedSymbolInLine(line, "copyFileSource"), 2);
assert.equal(
  findBoundedSymbolInLine("copyFileSourceHelper()", "copyFileSource"),
  -1,
);

const lines = ["alpha()", "copyFileSource(file);", "omega()"];
assert.equal(getLineText(lines, 2), "copyFileSource(file);");
assert.equal(getLineText(lines, 4), "");

assert.equal(
  isOccurrenceValidInLine("copyFileSource(file);", "copyFileSource", {
    startCol: 1,
    endCol: 15,
  }),
  true,
);
assert.equal(
  isOccurrenceValidInLine("copyFileSourceHelper(file);", "copyFileSource", {
    startCol: 1,
    endCol: 15,
  }),
  false,
);
assert.equal(
  isOccurrenceValidInLine("const x = copyFileSource(file);", "copyFileSource", {
    startCol: 0,
    endCol: 0,
  }),
  true,
);
assert.equal(
  isOccurrenceValidInLine(
    "const x = copyFileSourceHelper(file);",
    "copyFileSource",
    { startCol: 0, endCol: 0 },
  ),
  false,
);

console.log("symbol-ref-validation tests passed");
