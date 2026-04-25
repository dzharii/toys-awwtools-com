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
    "themeService"
  ]) {
    assert.match(entrySource, new RegExp(`\\b${key}\\b`));
  }
});

test("production build writes copyable dist documentation", () => {
  assert.match(buildSource, /distReadme/);
  assert.match(buildSource, /AWW Bookmarklet UI Framework - distributable/);
  assert.match(buildSource, /writeFile\(join\(outdir, "README\.md"\)/);
});
