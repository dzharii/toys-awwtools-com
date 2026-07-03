// Verifies that every vendored runtime dependency and font recorded in
// scripts/vendor-manifest.json exists locally and matches its recorded size
// and SHA-256 hash. This guards the offline/static runtime guarantee: the app
// must ship with readable, unmodified local copies of all dependencies.
//
// Usage (from the project root):
//   node scripts/vendor-check.mjs
//
// Exit code 0 = all files present and intact. Non-zero = a problem was found.
// This is an optional developer tool; it is never required at runtime.

import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const manifestPath = join(here, "vendor-manifest.json");

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function main() {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(`Could not read manifest at ${manifestPath}: ${err.message}`);
    process.exit(2);
  }

  const problems = [];
  let ok = 0;

  for (const item of manifest.items) {
    const abs = join(projectRoot, item.path);
    let stat;
    try {
      stat = statSync(abs);
    } catch {
      problems.push(`MISSING   ${item.path} (${item.name})`);
      continue;
    }
    if (item.bytes != null && stat.size !== item.bytes) {
      problems.push(`SIZE      ${item.path}: expected ${item.bytes} bytes, found ${stat.size}`);
      continue;
    }
    if (item.sha256) {
      const actual = sha256(abs);
      if (actual !== item.sha256) {
        problems.push(`HASH      ${item.path}: sha256 mismatch`);
        continue;
      }
    }
    // License file presence (recorded per item).
    if (item.licenseFile) {
      try {
        statSync(join(projectRoot, item.licenseFile));
      } catch {
        problems.push(`LICENSE   ${item.path}: missing license file ${item.licenseFile}`);
        continue;
      }
    }
    ok += 1;
  }

  console.log(`vendor-check: ${ok}/${manifest.items.length} vendored files verified.`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("All vendored dependencies and fonts are present and intact.");
}

main();
