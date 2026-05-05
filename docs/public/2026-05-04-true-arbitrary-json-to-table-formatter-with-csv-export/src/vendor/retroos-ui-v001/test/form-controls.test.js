// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FORM_ARIA_ATTRIBUTES } from "../src/core/form-attributes.js";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("form controls mirror field ARIA attributes into their native controls", () => {
  assert.deepEqual(FORM_ARIA_ATTRIBUTES, ["aria-label", "aria-labelledby", "aria-describedby", "aria-invalid"]);

  for (const path of [
    "../src/components/input.js",
    "../src/components/textarea.js",
    "../src/components/checkbox.js",
    "../src/components/radio.js",
    "../src/components/select.js"
  ]) {
    assert.match(source(path), /FORM_ARIA_ATTRIBUTES/);
  }
});

test("text input mirrors datalist linkage into the native input", () => {
  assert.match(source("../src/components/input.js"), /"list",\s*\.\.\.FORM_ARIA_ATTRIBUTES/);
});

test("tabs support overflowing labels and preserve selected-tab focus styling", () => {
  const tabsSource = source("../src/components/tabs.js");
  assert.match(tabsSource, /overflow-x:\s*auto/);
  assert.match(tabsSource, /white-space:\s*nowrap/);
  assert.match(tabsSource, /font-weight:\s*700/);
  assert.match(tabsSource, /box-shadow:\s*inset 0 3px 0 var\(--awwbookmarklet-selection-bg/);
  assert.match(tabsSource, /var\(--_ring\)/);
});
