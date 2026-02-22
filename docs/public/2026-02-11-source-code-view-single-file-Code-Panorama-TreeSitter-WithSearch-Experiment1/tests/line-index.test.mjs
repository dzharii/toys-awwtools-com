import assert from "node:assert/strict";
import {
  countLinesFromText,
  buildLineStartOffsets,
  lineNumberAtOffset,
  offsetAtLineNumber,
  splitLinesPreserveShape,
} from "../modules/line-index.js";

function buildLargeText(lineCount) {
  const lines = [];
  for (let i = 1; i <= lineCount; i += 1) {
    lines.push(`line-${i}`);
  }
  return lines.join("\n");
}

const cases = [
  { text: "", expectedCount: 0, expectedOffsets: [] },
  { text: "a", expectedCount: 1, expectedOffsets: [0] },
  { text: "a\n", expectedCount: 2, expectedOffsets: [0, 2] },
  { text: "a\nb", expectedCount: 2, expectedOffsets: [0, 2] },
  { text: "a\r\nb\r\n", expectedCount: 3, expectedOffsets: [0, 3, 6] },
];

for (const item of cases) {
  assert.equal(
    countLinesFromText(item.text),
    item.expectedCount,
    `line count mismatch for ${JSON.stringify(item.text)}`,
  );
  assert.deepEqual(
    buildLineStartOffsets(item.text),
    item.expectedOffsets,
    `offset mismatch for ${JSON.stringify(item.text)}`,
  );
}

const large = buildLargeText(700);
const largeOffsets = buildLineStartOffsets(large);
assert.equal(countLinesFromText(large), 700);
assert.equal(largeOffsets.length, 700);
assert.equal(offsetAtLineNumber(largeOffsets, 1), 0);
assert.equal(offsetAtLineNumber(largeOffsets, 700), largeOffsets[699]);
assert.equal(lineNumberAtOffset(largeOffsets, 0), 1);
assert.equal(lineNumberAtOffset(largeOffsets, largeOffsets[399]), 400);
assert.equal(lineNumberAtOffset(largeOffsets, large.length + 100), 700);

for (const lineNumber of [1, 2, 10, 77, 400, 700]) {
  const offset = offsetAtLineNumber(largeOffsets, lineNumber);
  assert.equal(
    lineNumberAtOffset(largeOffsets, offset),
    lineNumber,
    `round-trip mismatch for line ${lineNumber}`,
  );
}

assert.deepEqual(splitLinesPreserveShape(""), []);
assert.deepEqual(splitLinesPreserveShape("a\n"), ["a", ""]);
assert.deepEqual(splitLinesPreserveShape("a\nb"), ["a", "b"]);

console.log("line-index tests passed");
