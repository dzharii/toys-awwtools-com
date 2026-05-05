// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import test from "node:test";
import assert from "node:assert/strict";
import {
  getSegmentCopyValue,
  normalizeContextSegment,
  normalizeContextSegments,
  parseContextSegments,
  segmentsEqual
} from "../src/core/context-segments.js";

test("pipe shorthand splits unescaped pipes, trims, and drops empty segments", () => {
  assert.deepEqual(parseContextSegments("GitHub | PR #1824 | feature\\|context |  | CI passing"), [
    { key: "segment-0", value: "GitHub", kind: "text", tone: "neutral", priority: 0 },
    { key: "segment-1", value: "PR #1824", kind: "text", tone: "neutral", priority: 1 },
    { key: "segment-2", value: "feature|context", kind: "text", tone: "neutral", priority: 2 },
    { key: "segment-3", value: "CI passing", kind: "text", tone: "neutral", priority: 3 }
  ]);
});

test("structured segment normalization preserves developer-facing metadata", () => {
  assert.deepEqual(normalizeContextSegment({
    key: "branch",
    label: "Branch",
    value: "feature/context-bar",
    copyValue: "feature/context-bar",
    kind: "branch",
    tone: "success",
    priority: 60,
    source: "adapter",
    stale: true,
    actions: [{ id: "reveal", label: "Reveal source" }]
  }, 2), {
    key: "branch",
    label: "Branch",
    value: "feature/context-bar",
    shortValue: "",
    copyValue: "feature/context-bar",
    kind: "branch",
    tone: "success",
    priority: 60,
    title: "",
    source: "adapter",
    stale: true,
    changed: false,
    disabled: false,
    copyable: true,
    interactive: true,
    actions: [{ id: "reveal", label: "Reveal source" }]
  });
});

test("normalization accepts arrays and primitive segment values", () => {
  assert.deepEqual(normalizeContextSegments(["Ready", { key: "ci", value: "CI passing", tone: "success" }]).map((segment) => ({
    key: segment.key,
    value: segment.value,
    tone: segment.tone
  })), [
    { key: "segment-0", value: "Ready", tone: "neutral" },
    { key: "ci", value: "CI passing", tone: "success" }
  ]);
});

test("copy values and equality use normalized display fields", () => {
  const prev = normalizeContextSegment({ key: "ci", value: "CI passing", tone: "success" });
  const same = normalizeContextSegment({ key: "ci", value: "CI passing", tone: "success" });
  const next = normalizeContextSegment({ key: "ci", value: "CI failed", tone: "danger" });

  assert.equal(getSegmentCopyValue(normalizeContextSegment({ value: "#1824", copyValue: "1824" })), "1824");
  assert.equal(segmentsEqual(prev, same), true);
  assert.equal(segmentsEqual(prev, next), false);
});
