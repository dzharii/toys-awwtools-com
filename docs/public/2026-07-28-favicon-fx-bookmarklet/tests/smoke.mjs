import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = await readFile(path.join(root, "src", "bookmarklet.js"), "utf8");
const installerData = await readFile(path.join(root, "installer-data.js"), "utf8");
const bookmarkletText = (await readFile(path.join(root, "bookmarklet.txt"), "utf8")).trim();

new Function(source);
assert.match(source, /window\[PUBLIC_KEY\] = engine/);
assert.match(source, /attachShadow\(\{ mode: "open" \}\)/);
assert.match(source, /registerEffect\("spin"/);
assert.match(source, /registerPreset\("disco"/);
assert.ok(bookmarkletText.startsWith("javascript:"));
assert.equal(decodeURIComponent(bookmarkletText.slice("javascript:".length)), source);
assert.ok(installerData.includes(JSON.stringify(bookmarkletText)));

console.log("Smoke tests passed.");
