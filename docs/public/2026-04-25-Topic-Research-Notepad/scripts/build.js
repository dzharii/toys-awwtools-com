import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "assets"), { recursive: true });
await mkdir(join(dist, "observability"), { recursive: true });
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
await cp("src/observability/worker-logger.js", join(dist, "observability", "worker-logger.js"));
await cp("vendor-libs/dexie-4.2.0.js", join(dist, "vendor-libs", "dexie-4.2.0.js"));
await cp("ui-framework/dist/bookmarklet/index.js", join(dist, "ui-framework", "dist", "bookmarklet", "index.js"));
await cp("readme.md", join(dist, "readme.md"));
await cp("OBSERVABILITY.md", join(dist, "OBSERVABILITY.md"));
await cp("social-card.png", join(dist, "social-card.png"));
await cp("favicon.ico", join(dist, "favicon.ico"));
await cp("favicon-16x16.png", join(dist, "favicon-16x16.png"));
await cp("favicon-32x32.png", join(dist, "favicon-32x32.png"));
await cp("apple-touch-icon.png", join(dist, "apple-touch-icon.png"));

await writeFile(
  join(dist, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Topic Research Notepad</title>
    <meta name="description" content="A local-first retro research writing desk for collecting notes, sources, quotes, tables, and code while researching a topic." />
    <link rel="canonical" href="https://toys.awwtools.com/public/2026-04-25-Topic-Research-Notepad/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://toys.awwtools.com/public/2026-04-25-Topic-Research-Notepad/" />
    <meta property="og:title" content="Topic Research Notepad" />
    <meta property="og:description" content="Capture, organize, and write research notes in a local-first retro notebook." />
    <meta property="og:site_name" content="AWW Tools Toys" />
    <meta property="og:image" content="https://toys.awwtools.com/public/2026-04-25-Topic-Research-Notepad/social-card.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Topic Research Notepad shown on a retro desktop monitor." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Topic Research Notepad" />
    <meta name="twitter:description" content="Capture, organize, and write research notes in a local-first retro notebook." />
    <meta name="twitter:image" content="https://toys.awwtools.com/public/2026-04-25-Topic-Research-Notepad/social-card.png" />
    <meta name="twitter:image:alt" content="Topic Research Notepad shown on a retro desktop monitor." />
    <meta name="theme-color" content="#e9edf2" />
    <link rel="icon" href="./favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./assets/main.js"></script>
  </body>
</html>
`
);
