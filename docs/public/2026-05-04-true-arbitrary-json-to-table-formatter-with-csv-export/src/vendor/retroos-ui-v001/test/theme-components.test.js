// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function source(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("base styles expose focus and geometry aliases from public tokens", () => {
  const styles = source("../src/core/styles.js");

  assert.match(styles, /--awwbookmarklet-focus-ring-width/);
  assert.match(styles, /--awwbookmarklet-radius-control/);
  assert.match(styles, /--awwbookmarklet-radius-surface/);
  assert.match(styles, /--awwbookmarklet-border-width-control/);
  assert.match(styles, /--awwbookmarklet-border-width-surface/);
});

test("core controls consume geometry and anatomy tokens", () => {
  for (const path of [
    "../src/components/button.js",
    "../src/components/icon-button.js",
    "../src/components/input.js",
    "../src/components/select.js",
    "../src/components/textarea.js"
  ]) {
    const component = source(path);
    assert.match(component, /--_control-border-width|--awwbookmarklet-border-width-control/);
    assert.match(component, /--_control-radius|--awwbookmarklet-radius-control/);
  }

  assert.match(source("../src/components/button.js"), /--awwbookmarklet-button-padding-x/);
  assert.match(source("../src/components/button.js"), /--awwbookmarklet-button-shadow/);
  assert.match(source("../src/components/icon-button.js"), /--awwbookmarklet-control-icon-size/);
  assert.match(source("../src/components/input.js"), /--awwbookmarklet-input-padding-x/);
});

test("window, menus, and surfaces consume theme anatomy tokens", () => {
  const windowSource = source("../src/components/window.js");
  assert.match(windowSource, /--awwbookmarklet-radius-window/);
  assert.match(windowSource, /--awwbookmarklet-window-body-padding/);
  assert.match(windowSource, /--awwbookmarklet-titlebar-padding-x/);
  assert.match(windowSource, /--awwbookmarklet-titlebar-gap/);

  const menuSource = source("../src/components/menu.js");
  assert.match(menuSource, /--awwbookmarklet-menu-padding/);
  assert.match(menuSource, /--awwbookmarklet-menu-item-height/);
  assert.match(menuSource, /--awwbookmarklet-menu-item-padding-x/);
  assert.match(menuSource, /--awwbookmarklet-menu-item-gap/);

  for (const path of [
    "../src/components/panel.js",
    "../src/components/card.js",
    "../src/components/group.js",
    "../src/components/dialog.js",
    "../src/components/toast.js",
    "../src/components/browser-panel.js"
  ]) {
    const component = source(path);
    assert.match(component, /--_surface-radius|--awwbookmarklet-radius-surface/);
    assert.match(component, /--_surface-border-width|--awwbookmarklet-border-width-surface/);
  }
});

test("portaled UI copies public theme context before leaving themed subtree", () => {
  assert.match(source("../src/core/overlay.js"), /copyPublicThemeContext\(element, element\)/);
  assert.match(source("../src/components/menubar.js"), /copyPublicThemeContext\(trigger, menu\)/);
});
