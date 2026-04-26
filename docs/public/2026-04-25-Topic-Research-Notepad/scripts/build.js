import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "assets"), { recursive: true });
await mkdir(join(dist, "vendor-libs"), { recursive: true });
await mkdir(join(dist, "ui-framework", "dist", "bookmarklet"), { recursive: true });

await Bun.build({
  entrypoints: ["./src/main.js"],
  outdir: "./dist/assets",
  target: "browser",
  format: "esm",
  splitting: false,
  sourcemap: "linked",
});

await Bun.build({
  entrypoints: ["./src/storage-worker.js"],
  outdir: "./dist",
  target: "browser",
  format: "iife",
  minify: false,
  sourcemap: "linked",
});

await cp("styles.css", join(dist, "styles.css"));
await cp("vendor-libs/dexie-4.2.0.js", join(dist, "vendor-libs", "dexie-4.2.0.js"));
await cp("ui-framework/dist/bookmarklet/index.js", join(dist, "ui-framework", "dist", "bookmarklet", "index.js"));
await cp("readme.md", join(dist, "readme.md"));

await writeFile(
  join(dist, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Topic Research Notepad</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./assets/main.js"></script>
  </body>
</html>
`
);
