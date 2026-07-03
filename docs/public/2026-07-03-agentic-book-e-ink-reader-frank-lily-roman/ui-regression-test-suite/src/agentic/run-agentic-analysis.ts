/**
 * agent:run / agent:analyze — Agentic UI Regression Analysis Mode runner.
 *
 *   bun run src/agentic/run-agentic-analysis.ts --count=25
 *   bun run src/agentic/run-agentic-analysis.ts --count=25 --seed=184927
 *   bun run src/agentic/run-agentic-analysis.ts --count=5 --category=settings
 *   bun run src/agentic/run-agentic-analysis.ts --list-only --count=25
 *
 * Sequence (spec C00): discover -> sample (seeded, category-balanced) -> run each
 * selected test individually with the agentic Playwright config and per-test
 * instrumentation env vars -> collect artifacts -> write manifest.json,
 * selected-tests.json, summary.md, findings.md, run.log, playwright-results.json.
 *
 * All output goes under a gitignored .agent-runs/<run-id> folder.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

import { parseArgs } from "./cli-args.js";
import { SUITE_ROOT, buildRegistry, type RegistryEntry } from "./registry-lib.js";
import { loadRegistry, sampleTests, randomSeed } from "./sample-lib.js";
import { slugify } from "../framework/agentic/agentic-context.js";
import { renderFindingsTemplate, renderSummary } from "./report-lib.js";

interface TestRunResult {
  entry: RegistryEntry;
  folder: string;
  status: "passed" | "failed" | "timedout" | "skipped" | "unknown";
  durationMs: number;
  errors: string[];
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function timestampId(seed: number, count: number): string {
  const iso = new Date().toISOString().replace(/[:.]/g, "-");
  return `${iso}_seed-${seed}_count-${count}`;
}

function readRegistry(): RegistryEntry[] {
  const path = join(SUITE_ROOT, "src/agentic/test-registry.json");
  if (!existsSync(path)) {
    console.log("[agent:run] registry missing; generating it now.");
    const entries = buildRegistry();
    writeFileSync(path, JSON.stringify(entries, null, 2));
    return entries;
  }
  return loadRegistry();
}

function gitInfo(): { branch: string; commit: string; dirty: boolean } {
  const run = (args: string[]): string =>
    spawnSync("git", args, { cwd: SUITE_ROOT, encoding: "utf8", shell: false }).stdout?.trim() ?? "";
  return {
    branch: run(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown",
    commit: run(["rev-parse", "--short", "HEAD"]) || "unknown",
    dirty: run(["status", "--porcelain"]).length > 0,
  };
}

/** Extract this test's result from Playwright's per-invocation JSON report. */
function parsePlaywrightResult(jsonPath: string): { status: TestRunResult["status"]; durationMs: number; errors: string[] } {
  if (!existsSync(jsonPath)) return { status: "unknown", durationMs: 0, errors: ["no playwright json produced"] };
  try {
    const report = JSON.parse(readFileSync(jsonPath, "utf8"));
    let status: TestRunResult["status"] = "unknown";
    let durationMs = 0;
    const errors: string[] = [];
    const walk = (suite: any): void => {
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          for (const res of test.results ?? []) {
            durationMs += res.duration ?? 0;
            if (res.status) status = res.status;
            for (const e of res.errors ?? []) {
              if (e.message) errors.push(String(e.message).split("\n").slice(0, 4).join(" "));
            }
          }
        }
      }
      for (const child of suite.suites ?? []) walk(child);
    };
    for (const suite of report.suites ?? []) walk(suite);
    return { status, durationMs, errors };
  } catch (e) {
    return { status: "unknown", durationMs: 0, errors: [e instanceof Error ? e.message : String(e)] };
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const count = args.num("count", 25);
  const seed = args.get("seed") !== undefined ? args.num("seed", randomSeed()) : randomSeed();
  const listOnly = args.bool("list-only");
  const doNotFail = args.bool("do-not-fail-on-test-failure");

  const registry = readRegistry();
  const sample = sampleTests(registry, {
    count,
    seed,
    category: args.get("category"),
    tag: args.get("tag"),
    excludeTag: args.get("exclude-tag"),
    noBalance: args.bool("no-balance"),
  });

  const runId = timestampId(seed, sample.countSelected);
  const runDir = join(SUITE_ROOT, ".agent-runs", runId);

  if (!runDir.includes(`${join(SUITE_ROOT, ".agent-runs")}`)) {
    console.error("[agent:run] WARNING: run folder is outside .agent-runs/. Aborting to protect git hygiene.");
    process.exit(1);
  }

  mkdirSync(runDir, { recursive: true });
  mkdirSync(join(runDir, "tests"), { recursive: true });
  const logPath = join(runDir, "run.log");
  const log = (msg: string): void => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    appendFileSync(logPath, line + "\n");
  };

  log(`run ${runId}`);
  log(`seed=${seed} count=${sample.countSelected}/${count} mode=${sample.selectionMode}`);

  const selectedForFile = sample.selected.map((e) => ({
    id: e.id,
    title: e.title,
    file: e.file,
    category: e.category,
    folder: `${e.id}__${slugify(e.title)}`,
  }));
  writeFileSync(join(runDir, "selected-tests.json"), JSON.stringify({ seed, runId, selected: selectedForFile }, null, 2));

  if (listOnly) {
    log("--list-only: selection written, not running tests.");
    for (const e of sample.selected) log(`  ${e.id}  ${e.title}`);
    return;
  }

  const results: TestRunResult[] = [];
  const baseEnv = {
    ...process.env,
    EINK_AGENTIC_ANALYSIS: "1",
    EINK_AGENTIC_RUN_DIR: runDir,
    EINK_AGENTIC_SCREENSHOTS: "1",
    EINK_AGENTIC_DOM_SNAPSHOTS: "1",
    EINK_AGENTIC_A11Y_SNAPSHOTS: "1",
    EINK_AGENTIC_VISIBLE_ELEMENTS: "1",
    EINK_AGENTIC_LAYOUT: "1",
    EINK_AGENTIC_ORACLE_DETAILS: "1",
  };

  const combinedReports: unknown[] = [];
  const pwLastPath = join(runDir, "_pw-last.json");

  let index = 0;
  for (const entry of sample.selected) {
    index++;
    const folder = `${entry.id}__${slugify(entry.title)}`;
    mkdirSync(join(runDir, "tests", folder), { recursive: true });
    log(`(${index}/${sample.selected.length}) ${entry.id} :: ${entry.title}`);

    // Write per-test metadata up front so the folder is self-describing even on crash.
    writeFileSync(
      join(runDir, "tests", folder, "test.json"),
      JSON.stringify({ id: entry.id, title: entry.title, file: entry.file, category: entry.category, line: entry.line, persona: entry.persona }, null, 2),
    );

    const grep = escapeRegex(entry.title);
    const spawnRes = spawnSync(
      "bun",
      ["x", "playwright", "test", "--grep", grep, "--config", "playwright.agentic.config.ts"],
      {
        cwd: SUITE_ROOT,
        encoding: "utf8",
        shell: false,
        maxBuffer: 64 * 1024 * 1024,
        env: {
          ...baseEnv,
          EINK_AGENTIC_TEST_ID: entry.id,
          EINK_AGENTIC_TEST_FOLDER: folder,
        },
      },
    );

    // Persist raw playwright stdout/stderr for the test.
    const testOut = (spawnRes.stdout ?? "") + "\n----- stderr -----\n" + (spawnRes.stderr ?? "");
    writeFileSync(join(runDir, "tests", folder, "test-output.txt"), testOut);

    const parsed = parsePlaywrightResult(pwLastPath);
    if (existsSync(pwLastPath)) {
      try {
        combinedReports.push(JSON.parse(readFileSync(pwLastPath, "utf8")));
      } catch {
        /* ignore */
      }
    }
    // Spawn failure with no JSON => treat exit code as authority.
    const status = parsed.status !== "unknown" ? parsed.status : spawnRes.status === 0 ? "passed" : "failed";
    results.push({ entry, folder, status, durationMs: parsed.durationMs, errors: parsed.errors });
    log(`    -> ${status} (${parsed.durationMs}ms)${parsed.errors.length ? " :: " + parsed.errors[0] : ""}`);
  }

  // Combined playwright report for the run.
  writeFileSync(join(runDir, "playwright-results.json"), JSON.stringify(combinedReports, null, 2));

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed" || r.status === "timedout").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  const manifest = {
    schemaVersion: 1,
    runId,
    createdAt: new Date().toISOString(),
    seed,
    countRequested: count,
    countSelected: sample.countSelected,
    selectionMode: sample.selectionMode,
    git: gitInfo(),
    environment: {
      os: process.platform,
      node: process.version,
      bun: process.versions.bun ?? "n/a",
    },
    summary: { passed, failed, skipped, total: results.length },
    tests: results.map((r) => ({
      id: r.entry.id,
      title: r.entry.title,
      file: r.entry.file,
      category: r.entry.category,
      persona: r.entry.persona,
      status: r.status,
      durationMs: r.durationMs,
      errors: r.errors,
      folder: `tests/${r.folder}`,
    })),
  };
  writeFileSync(join(runDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  writeFileSync(join(runDir, "summary.md"), renderSummary(manifest));
  writeFileSync(join(runDir, "findings.md"), renderFindingsTemplate(runId, seed));

  log(`done: ${passed} passed, ${failed} failed, ${skipped} skipped of ${results.length}`);
  log(`artifacts: ${runDir}`);
  log(`reproduce: bun run agent:run -- --count=${count} --seed=${seed}`);

  if (failed > 0 && !doNotFail) {
    process.exit(1);
  }
}

main();
