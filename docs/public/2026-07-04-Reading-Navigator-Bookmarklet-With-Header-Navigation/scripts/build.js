/**
 * Build script (Bun).
 *
 * Bundles the modular source into a single readable (unminified) IIFE that
 * registers `window.readingNavigatorBookmarklet`, then generates:
 *   - dist/reading-navigator.bundle.js            (hosted script)
 *   - dist/reading-navigator.loader-bookmarklet.txt   (injects hosted bundle)
 *   - dist/reading-navigator.inline-bookmarklet.txt   (self-contained)
 *   - dist/reading-navigator.bookmarklets.js      (strings for the install page)
 *
 * Usage:
 *   bun run scripts/build.js
 *   bun run scripts/build.js --clean
 */

import { CONFIG, DIST } from "../src/config.js";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIST_DIR = join(ROOT, "dist");
const ENTRY = join(ROOT, "src", "bookmarklet-entry.js");

function join(...parts) {
  return parts.join("/").replace(/\/+/g, "/");
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function clean() {
  const fs = await import("node:fs/promises");
  try {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
    console.log("[clean] removed dist/");
  } catch (err) {
    console.error("[clean] failed:", err.message);
  }
}

/**
 * Wrap raw bundle source into a self-contained inline bookmarklet. The whole
 * bundle registers the global; we then invoke it. encodeURI keeps the URL valid
 * while remaining readable (unminified).
 */
function buildInlineBookmarklet(bundleSource) {
  const body =
    "(function(){" +
    bundleSource +
    "\ntry{window." +
    DIST.globalName +
    "&&window." +
    DIST.globalName +
    "();}catch(e){console&&console.error&&console.error(e);}" +
    "})();";
  return "javascript:" + encodeURI(body);
}

/**
 * Loader bookmarklet: inject the hosted bundle, then call the exposed function.
 * Self-contained and small; robust for browsers that limit URL length.
 */
function buildLoaderBookmarklet(bundleUrl) {
  const fn =
    "(function(){" +
    "var g='" + DIST.globalName + "';" +
    "if(window[g]){window[g]();return;}" +
    "var s=document.createElement('script');" +
    "s.src='" + bundleUrl + "';" +
    "s.onload=function(){try{window[g]&&window[g]();}catch(e){console&&console.error&&console.error(e);}};" +
    "s.onerror=function(){alert('Reading Navigator: failed to load script.');};" +
    "document.body.appendChild(s);" +
    "})();";
  return "javascript:" + encodeURI(fn);
}

function jsStringLiteral(str) {
  return JSON.stringify(str);
}

async function build() {
  const fs = await import("node:fs/promises");
  await fs.mkdir(DIST_DIR, { recursive: true });

  const result = await Bun.build({
    entrypoints: [ENTRY],
    target: "browser",
    format: "iife",
    minify: false,
    sourcemap: "none",
  });

  if (!result.success) {
    console.error("[build] Bun.build failed:");
    for (const log of result.logs) console.error(String(log));
    process.exit(1);
  }

  const artifact = result.outputs.find((o) => o.kind === "entry-point") || result.outputs[0];
  let bundleSource = await artifact.text();

  const banner =
    `/* ${CONFIG.appName} v${CONFIG.appVersion} — bundled, unminified. ` +
    `Generated ${new Date().toISOString()}. Do not edit by hand. */\n`;
  bundleSource = banner + bundleSource;

  // Contract check: the exposed global must be assigned as a function.
  if (!bundleSource.includes(DIST.globalName)) {
    console.error(`[build] bundle does not reference window.${DIST.globalName}`);
    process.exit(1);
  }

  const bundlePath = join(DIST_DIR, "reading-navigator.bundle.js");
  await fs.writeFile(bundlePath, bundleSource, "utf8");

  const bundleUrl = DIST.baseUrl + DIST.bundleFile;
  const inline = buildInlineBookmarklet(bundleSource);
  const loader = buildLoaderBookmarklet(bundleUrl);

  // Validate both bookmarklets.
  for (const [name, value] of [["inline", inline], ["loader", loader]]) {
    if (!value.startsWith("javascript:")) {
      console.error(`[build] ${name} bookmarklet missing javascript: prefix`);
      process.exit(1);
    }
  }

  await fs.writeFile(join(DIST_DIR, "reading-navigator.inline-bookmarklet.txt"), inline, "utf8");
  await fs.writeFile(join(DIST_DIR, "reading-navigator.loader-bookmarklet.txt"), loader, "utf8");

  const inlineBytes = Buffer.byteLength(inline, "utf8");
  const loaderBytes = Buffer.byteLength(loader, "utf8");
  const bundleBytes = Buffer.byteLength(bundleSource, "utf8");

  // Strings the install page consumes (no remote fetch, no toString fragility).
  const bmScript =
    `/* Generated bookmarklet strings for the install page. */\n` +
    `window.readingNavigatorBookmarklets = {\n` +
    `  version: ${jsStringLiteral(CONFIG.appVersion)},\n` +
    `  inline: ${jsStringLiteral(inline)},\n` +
    `  loader: ${jsStringLiteral(loader)},\n` +
    `  bundleUrl: ${jsStringLiteral(bundleUrl)},\n` +
    `  sizes: { inline: ${inlineBytes}, loader: ${loaderBytes}, bundle: ${bundleBytes} }\n` +
    `};\n`;
  await fs.writeFile(join(DIST_DIR, "reading-navigator.bookmarklets.js"), bmScript, "utf8");

  console.log(`[build] ${CONFIG.appName} v${CONFIG.appVersion}`);
  console.log(`[build] bundle : ${fmtBytes(bundleBytes)}  -> dist/reading-navigator.bundle.js`);
  console.log(`[build] inline : ${fmtBytes(inlineBytes)}  -> dist/reading-navigator.inline-bookmarklet.txt`);
  console.log(`[build] loader : ${fmtBytes(loaderBytes)}  -> dist/reading-navigator.loader-bookmarklet.txt`);
  console.log(`[build] strings:            -> dist/reading-navigator.bookmarklets.js`);

  if (inlineBytes > DIST.inlineWarnBytes) {
    console.warn(
      `[build] WARNING: inline bookmarklet is ${fmtBytes(inlineBytes)} ` +
        `(> ${fmtBytes(DIST.inlineWarnBytes)}). Some browsers may reject very long ` +
        `bookmarklet URLs; prefer the loader bookmarklet in that case.`
    );
  }
}

const args = process.argv.slice(2);
if (args.includes("--clean")) {
  await clean();
  if (!args.includes("--build")) {
    // --clean alone still rebuilds by default for convenience.
  }
}
await build();
