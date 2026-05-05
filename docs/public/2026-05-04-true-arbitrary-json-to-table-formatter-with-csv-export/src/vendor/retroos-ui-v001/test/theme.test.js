// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import test from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_TOKENS } from "../src/core/constants.js";
import { applyThemePatch, copyPublicThemeContext, createTheme, ThemeService } from "../src/core/theme.js";
import { DEFAULT_THEME } from "../src/themes/default-theme.js";

test("theme service applies merged token set", () => {
  const service = new ThemeService({ "--awwbookmarklet-x": "1" });
  service.setTheme({ "--awwbookmarklet-y": "2" });

  const writes = [];
  const target = {
    style: {
      setProperty(name, value) {
        writes.push([name, value]);
      }
    }
  };

  service.applyTheme(target);

  assert.deepEqual(writes, [
    ["--awwbookmarklet-x", "1"],
    ["--awwbookmarklet-y", "2"]
  ]);
});

test("default theme defines every public token", () => {
  const missing = Object.values(PUBLIC_TOKENS).filter((token) => !(token in DEFAULT_THEME));

  assert.deepEqual(missing, []);
});

test("public theme tokens keep expected geometry and anatomy names", () => {
  assert.equal(PUBLIC_TOKENS.radiusControl, "--awwbookmarklet-radius-control");
  assert.equal(PUBLIC_TOKENS.radiusSurface, "--awwbookmarklet-radius-surface");
  assert.equal(PUBLIC_TOKENS.radiusWindow, "--awwbookmarklet-radius-window");
  assert.equal(PUBLIC_TOKENS.focusRingWidth, "--awwbookmarklet-focus-ring-width");
  assert.equal(PUBLIC_TOKENS.controlPaddingX, "--awwbookmarklet-control-padding-x");
  assert.equal(PUBLIC_TOKENS.buttonPaddingX, "--awwbookmarklet-button-padding-x");
  assert.equal(PUBLIC_TOKENS.inputPaddingX, "--awwbookmarklet-input-padding-x");
  assert.equal(PUBLIC_TOKENS.windowBodyPadding, "--awwbookmarklet-window-body-padding");
  assert.equal(PUBLIC_TOKENS.menuItemHeight, "--awwbookmarklet-menu-item-height");
});

test("theme patch helper applies target-scoped variables without mutating the patch", () => {
  const patch = {
    [PUBLIC_TOKENS.selectionBg]: "#123456",
    [PUBLIC_TOKENS.focusRing]: null,
    "--custom-local-token": 42
  };
  const writes = [];
  const target = {
    style: {
      setProperty(name, value) {
        writes.push([name, value]);
      }
    }
  };

  applyThemePatch(target, patch);

  assert.deepEqual(writes, [
    [PUBLIC_TOKENS.selectionBg, "#123456"],
    ["--custom-local-token", "42"]
  ]);
  assert.equal(patch[PUBLIC_TOKENS.selectionBg], "#123456");
});

test("copyPublicThemeContext copies only public computed token values", () => {
  const previousGetComputedStyle = globalThis.getComputedStyle;
  const writes = [];

  globalThis.getComputedStyle = () => ({
    getPropertyValue(name) {
      if (name === PUBLIC_TOKENS.selectionBg) return " #abcdef ";
      if (name === PUBLIC_TOKENS.radiusControl) return "4px";
      if (name === "--private-token") return "nope";
      return "";
    }
  });

  try {
    copyPublicThemeContext({}, {
      style: {
        setProperty(name, value) {
          writes.push([name, value]);
        }
      }
    });
  } finally {
    if (previousGetComputedStyle === undefined) delete globalThis.getComputedStyle;
    else globalThis.getComputedStyle = previousGetComputedStyle;
  }

  assert.deepEqual(writes, [
    [PUBLIC_TOKENS.selectionBg, "#abcdef"],
    [PUBLIC_TOKENS.radiusControl, "4px"]
  ]);
});

test("createTheme returns a merged theme object without mutating inputs", () => {
  const base = { [PUBLIC_TOKENS.selectionBg]: "#111111" };
  const patch = { [PUBLIC_TOKENS.focusRing]: "#222222" };
  const theme = createTheme(base, patch);

  assert.deepEqual(theme, {
    [PUBLIC_TOKENS.selectionBg]: "#111111",
    [PUBLIC_TOKENS.focusRing]: "#222222"
  });
  assert.deepEqual(base, { [PUBLIC_TOKENS.selectionBg]: "#111111" });
  assert.deepEqual(patch, { [PUBLIC_TOKENS.focusRing]: "#222222" });
});
