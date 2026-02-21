import assert from "node:assert/strict";
import { buildGutterLineNumbers } from "../modules/line-index.js";

const lineNumbers = buildGutterLineNumbers(1200);
assert.equal(lineNumbers.length, 1200);
assert.equal(lineNumbers[0], 1);
assert.equal(lineNumbers[303], 304);
assert.equal(lineNumbers[1199], 1200);

assert.deepEqual(buildGutterLineNumbers(0), []);
assert.deepEqual(buildGutterLineNumbers(-5), []);

console.log("gutter model tests passed");
