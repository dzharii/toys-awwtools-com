import { mkdir, writeFile } from "node:fs/promises";
await mkdir(".temp/gesture-prototype", { recursive: true });
const result = await Bun.build({
  entrypoints: ["tests/gesture-preview.ts"],
  outdir: ".temp/gesture-prototype",
  naming: "prototype.js",
  format: "iife",
  target: "browser",
});
if (!result.success) throw new AggregateError(result.logs, "Prototype build failed");
await writeFile(
  ".temp/gesture-prototype/index.html",
  '<!doctype html><html lang="en"><meta charset="utf-8"><title>Development gesture experiment</title><style>body{font:16px/1.6 system-ui;padding:40px;background:#f8fafb;color:#26323c}main{height:500px;border:1px dashed #7b929e;padding:30px}input{font:inherit}</style><h1>Development gesture experiment</h1><p>Not enabled in the extension. Enabling this prototype captures Shift + middle-button circles on noninteractive space and disables native autoscroll for that gesture. Browser compatibility is unverified.</p><label><input id="enable" type="checkbox"> Enable this experiment</label><main><p id="result">Draw two deliberate circles over at least 2.2 seconds after enabling.</p><a href="#link">Ordinary middle-click link (excluded)</a><p><input placeholder="Editable input (excluded)"></p></main><script src="prototype.js"></script></html>',
);
console.log("Development-only prototype: .temp/gesture-prototype/index.html");
