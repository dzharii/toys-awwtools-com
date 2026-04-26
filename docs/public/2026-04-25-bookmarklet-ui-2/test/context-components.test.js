import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("segment component family is registered", () => {
  const registry = source("../src/components/register-all.js");
  for (const name of ["AwwSegmentStrip", "AwwContextBar", "AwwStatusStrip", "AwwTitlebar", "AwwContextPanel"]) {
    assert.match(registry, new RegExp(`\\b${name}\\b`));
  }
});

test("segment strip supports shorthand value, structured segments, copy, activation, menu, and changed state", () => {
  const strip = source("../src/components/segment-strip.js");

  assert.match(strip, /normalizeContextSegments/);
  assert.match(strip, /static observedAttributes = \["value", "copy-behavior"\]/);
  assert.match(strip, /awwbookmarklet-segment-copy/);
  assert.match(strip, /awwbookmarklet-segment-activate/);
  assert.match(strip, /awwbookmarklet-segment-menu-request/);
  assert.match(strip, /copyToClipboard/);
  assert.match(strip, /data-changed="true"|dataset\.changed = "true"/);
  assert.match(strip, /prefers-reduced-motion/);
});

test("context bar, status strip, titlebar, and context panel compose segment strip", () => {
  assert.match(source("../src/components/context-bar.js"), /TAGS\.segmentStrip/);
  assert.match(source("../src/components/context-bar.js"), /awwbookmarklet-context-bar-expand/);
  assert.match(source("../src/components/context-bar.js"), /progress-fill/);
  assert.match(source("../src/components/status-strip.js"), /TAGS\.segmentStrip/);
  assert.match(source("../src/components/titlebar.js"), /TAGS\.segmentStrip/);
  assert.match(source("../src/components/titlebar.js"), /drag-region/);
  assert.match(source("../src/components/context-panel.js"), /normalizeContextSegments/);
  assert.match(source("../src/components/context-panel.js"), /awwbookmarklet-segment-copy/);
});
