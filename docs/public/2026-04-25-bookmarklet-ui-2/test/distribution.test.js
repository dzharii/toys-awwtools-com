import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const entrySource = readFileSync(new URL("../src/bookmarklet/index.js", import.meta.url), "utf8");
const buildSource = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");

test("bookmarklet entry exposes reusable SDK surface", () => {
  for (const name of [
    "defineBookmarkletComponent",
    "createWindow",
    "mountWindow",
    "setTheme",
    "TAGS",
    "PUBLIC_TOKENS",
    "applyThemePatch",
    "copyPublicThemeContext",
    "createTheme",
    "BASE_COMPONENT_STYLES",
    "CommandRegistry",
    "sanitizeHtml"
  ]) {
    assert.match(entrySource, new RegExp(`\\b${name}\\b`));
  }
});

test("global API mirrors module extension points", () => {
  for (const key of [
    "defineComponent",
    "createWindow",
    "mountWindow",
    "setTheme",
    "styles",
    "url",
    "themeService",
    "applyThemePatch",
    "copyPublicThemeContext",
    "createTheme"
  ]) {
    assert.match(entrySource, new RegExp(`\\b${key}\\b`));
  }
});

test("window mounting APIs support target-scoped theme options", () => {
  assert.match(entrySource, /openBookmarkletWindow\(builder,\s*\{\s*ownerPrefix\s*=\s*"bookmarklet-tool",\s*rect\s*=\s*null,\s*theme\s*=\s*null\s*\}/);
  assert.match(entrySource, /mountWindow\(win,\s*\{\s*ownerPrefix\s*=\s*"bookmarklet-tool",\s*rect\s*=\s*null,\s*theme\s*=\s*null\s*\}/);
  assert.match(entrySource, /if \(theme\) applyThemePatch\(win, theme\);/);
});

test("explicit target setTheme path does not mutate the shared root theme", () => {
  assert.match(entrySource, /if \(target\) \{\s*applyThemePatch\(target, themePatch \|\| \{\}\);/s);
  assert.match(entrySource, /return \{ \.\.\.defaultThemeService\.tokens, \.\.\.\(themePatch \|\| \{\}\) \};/);
});

test("production build writes copyable dist documentation", () => {
  assert.match(buildSource, /distReadme/);
  assert.match(buildSource, /AWW Bookmarklet UI Framework - distributable/);
  assert.match(buildSource, /single-file distribution artifact/);
  assert.match(buildSource, /writeFile\(join\(outdir, "README\.md"\)/);
  assert.match(buildSource, /window-scoped themes/);
  assert.match(buildSource, /compactTheme/);
  assert.match(buildSource, /roundedTheme/);
  assert.match(buildSource, /highContrastTheme/);
  assert.match(buildSource, /::part/);
});

test("distribution build stays readable in every mode", () => {
  assert.match(buildSource, /splitting:\s*false/);
  assert.match(buildSource, /minify:\s*false/);
  assert.match(buildSource, /sourcemap:\s*"none"/);
  assert.doesNotMatch(buildSource, /minify:\s*production/);
});
