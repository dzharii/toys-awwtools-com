/**
 * agent:discover — regenerate and validate the test registry.
 *
 *   bun run src/agentic/discover-tests.ts            (write + validate)
 *   bun run src/agentic/discover-tests.ts --check     (validate only, non-zero on drift)
 *
 * The registry (src/agentic/test-registry.json) maps a stable CATEGORY-NNN id to
 * every Playwright test's title/file/category/line. It is generated from the
 * live `playwright test --list` output so it never silently goes stale.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildRegistry, SUITE_ROOT, type RegistryEntry } from "./registry-lib.js";

const REGISTRY_PATH = join(SUITE_ROOT, "src/agentic/test-registry.json");

interface Validation {
  duplicateIds: string[];
  duplicateTitles: string[];
  invalidIdFormat: string[];
  missingFiles: string[];
}

function validate(entries: RegistryEntry[]): Validation {
  const idCount = new Map<string, number>();
  const titleCount = new Map<string, number>();
  const invalidIdFormat: string[] = [];
  const missingFiles: string[] = [];
  const idFormat = /^[A-Z0-9]+-\d{3}$/;

  for (const e of entries) {
    idCount.set(e.id, (idCount.get(e.id) ?? 0) + 1);
    titleCount.set(e.title, (titleCount.get(e.title) ?? 0) + 1);
    if (!idFormat.test(e.id)) invalidIdFormat.push(`${e.id} (${e.title})`);
    if (!existsSync(join(SUITE_ROOT, e.file))) missingFiles.push(`${e.id} -> ${e.file}`);
  }
  return {
    duplicateIds: [...idCount].filter(([, c]) => c > 1).map(([id]) => id),
    duplicateTitles: [...titleCount].filter(([, c]) => c > 1).map(([t]) => t),
    invalidIdFormat,
    missingFiles,
  };
}

function main(): void {
  const checkOnly = process.argv.includes("--check");
  const entries = buildRegistry();
  const v = validate(entries);

  const problems: string[] = [];
  if (v.duplicateIds.length) problems.push(`Duplicate ids: ${v.duplicateIds.join(", ")}`);
  if (v.duplicateTitles.length) problems.push(`Duplicate titles: ${v.duplicateTitles.join(", ")}`);
  if (v.invalidIdFormat.length) problems.push(`Invalid id format: ${v.invalidIdFormat.join(", ")}`);
  if (v.missingFiles.length) problems.push(`Missing files: ${v.missingFiles.join(", ")}`);

  console.log(`[agent:discover] discovered ${entries.length} tests across ${new Set(entries.map((e) => e.category)).size} categories.`);

  if (problems.length) {
    console.error("[agent:discover] VALIDATION FAILED:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  if (checkOnly) {
    if (!existsSync(REGISTRY_PATH)) {
      console.error("[agent:discover] --check: registry file does not exist. Run without --check to generate it.");
      process.exit(1);
    }
    const existing = readFileSync(REGISTRY_PATH, "utf8").trim();
    const next = JSON.stringify(entries, null, 2);
    if (existing !== next) {
      console.error("[agent:discover] --check: registry is out of date. Run `bun run agent:discover` to refresh.");
      process.exit(1);
    }
    console.log("[agent:discover] --check: registry is up to date.");
    return;
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(entries, null, 2));
  console.log(`[agent:discover] wrote ${REGISTRY_PATH}`);
  const byCat = new Map<string, number>();
  for (const e of entries) byCat.set(e.category, (byCat.get(e.category) ?? 0) + 1);
  for (const [cat, count] of [...byCat].sort()) console.log(`  ${cat.padEnd(16)} ${count}`);
}

main();
