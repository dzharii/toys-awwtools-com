import assert from "node:assert/strict";
import {
  getFileLineCount,
  clampLineNumberForFile,
  getLineStartOffsetForFile
} from "../modules/runtime/line-navigation.js";

const sample = {
  textFull: "alpha\nbeta\ngamma\n",
  lineCount: 4,
  lineIndex: {
    offsets: [0, 6, 11, 17],
    lineCount: 4
  }
};

assert.equal(getFileLineCount(sample), 4);
assert.equal(clampLineNumberForFile(sample, 1), 1);
assert.equal(clampLineNumberForFile(sample, 4), 4);
assert.equal(clampLineNumberForFile(sample, 99), 4);
assert.equal(clampLineNumberForFile(sample, -4), 1);

assert.equal(getLineStartOffsetForFile(sample, 1), 0);
assert.equal(getLineStartOffsetForFile(sample, 2), 6);
assert.equal(getLineStartOffsetForFile(sample, 4), 17);
assert.equal(getLineStartOffsetForFile(sample, 99), 17);

assert.equal(getFileLineCount(null), 0);
assert.equal(clampLineNumberForFile(null, 3), 0);
assert.equal(getLineStartOffsetForFile(null, 3), 0);

console.log("line-navigation tests passed");
