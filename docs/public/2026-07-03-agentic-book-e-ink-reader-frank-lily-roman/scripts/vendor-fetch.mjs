// Optional developer helper: downloads any vendored dependency or font listed
// in scripts/vendor-manifest.json that is missing locally, pulling from the
// documented upstreamUrl. Existing files are skipped by default and reported;
// nothing is overwritten silently. This tool is NEVER used at runtime — the app
// always loads the local vendored copies only.
//
// Usage (from the project root):
//   node scripts/vendor-fetch.mjs          # download only missing files
//   node scripts/vendor-fetch.mjs --force  # re-download everything (overwrite)

import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { readFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const force = process.argv.includes("--force");

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const manifest = JSON.parse(readFileSync(join(here, "vendor-manifest.json"), "utf8"));
  let fetched = 0;
  let skipped = 0;
  for (const item of manifest.items) {
    const abs = join(projectRoot, item.path);
    if (existsSync(abs) && !force) {
      console.log(`skip     ${item.path} (already present)`);
      skipped += 1;
      continue;
    }
    try {
      const buf = await download(item.upstreamUrl);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, buf);
      console.log(`fetched  ${item.path}  <- ${item.upstreamUrl}`);
      fetched += 1;
    } catch (err) {
      console.error(`FAILED   ${item.path}: ${err.message}`);
    }
  }
  console.log(`\nDone. fetched=${fetched} skipped=${skipped}`);
  console.log("Run 'node scripts/vendor-check.mjs' to verify integrity, then update");
  console.log("the manifest hashes if you intentionally changed a vendored file.");
}

main();
