import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { toBookmarkletPayload } from "./lib/bookmarklet-payload.js";

const args = process.argv.slice(2);
const selectedName = readArgValue(args, "--name");

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, "src", "bookmarklets");
const DIST_DIR = path.join(ROOT_DIR, "dist");

await mkdir(DIST_DIR, { recursive: true });

const bookmarklets = await discoverBookmarklets(SRC_DIR, selectedName);

if (bookmarklets.length === 0) {
  if (selectedName) {
    console.error(`No bookmarklet found for --name ${selectedName}`);
    process.exit(1);
  }

  console.log("No bookmarklets found under src/bookmarklets/ (template folders are ignored)");
  process.exit(0);
}

let failed = false;

for (const name of bookmarklets) {
  const entry = path.join(SRC_DIR, name, "index.js");
  const bundlePath = path.join(DIST_DIR, `${name}.bundle.js`);
  const bookmarkletPath = path.join(DIST_DIR, `${name}.bookmarklet.txt`);

  const result = await Bun.build({
    entrypoints: [entry],
    target: "browser",
    format: "iife",
    minify: true,
    sourcemap: "none",
  });

  if (!result.success || result.outputs.length === 0) {
    failed = true;
    console.error(`Build failed for ${name}`);
    for (const log of result.logs) {
      console.error(log);
    }
    continue;
  }

  const code = await result.outputs[0].text();
  await writeFile(bundlePath, code, "utf8");

  const payload = toBookmarkletPayload(code);
  await writeFile(bookmarkletPath, payload + "\n", "utf8");

  console.log(`Built ${name}`);
  console.log(`  - ${path.relative(ROOT_DIR, bundlePath)}`);
  console.log(`  - ${path.relative(ROOT_DIR, bookmarkletPath)}`);
}

if (failed) {
  process.exit(1);
}

/**
 * Reads a CLI option value so script behavior can be targeted without fragile manual parsing.
 */
function readArgValue(argv, name) {
  const i = argv.indexOf(name);
  if (i === -1) {
    return "";
  }

  const value = argv[i + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }

  return value;
}

/**
 * Discovers buildable bookmarklets from source so output always reflects the current repository state.
 */
async function discoverBookmarklets(srcDir, onlyName) {
  if (!existsSync(srcDir)) {
    return [];
  }

  if (onlyName) {
    const entry = path.join(srcDir, onlyName, "index.js");
    return existsSync(entry) ? [onlyName] : [];
  }

  const dirents = await readdir(srcDir, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !name.startsWith("_"))
    .filter((name) => existsSync(path.join(srcDir, name, "index.js")));
}
