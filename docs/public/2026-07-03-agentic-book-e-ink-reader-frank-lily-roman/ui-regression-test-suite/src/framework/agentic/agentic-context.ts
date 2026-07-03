import { mkdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Agentic Analysis Mode context.
 *
 * Everything here is inert unless EINK_AGENTIC_ANALYSIS=1. Normal test runs
 * never touch the filesystem through this module, never take extra screenshots,
 * and pay no measurable overhead (every public entry point short-circuits on
 * `isAgenticAnalysis`).
 *
 * The runner (src/agentic/run-agentic-analysis.ts) sets these environment
 * variables per individual test invocation:
 *
 *   EINK_AGENTIC_ANALYSIS=1
 *   EINK_AGENTIC_RUN_DIR=<abs path to .agent-runs/<run-id>>
 *   EINK_AGENTIC_TEST_ID=<CATEGORY-NNN>
 *   EINK_AGENTIC_TEST_FOLDER=<per-test folder name under tests/>
 *   EINK_AGENTIC_SCREENSHOTS=1
 *   EINK_AGENTIC_DOM_SNAPSHOTS=1
 *   EINK_AGENTIC_A11Y_SNAPSHOTS=1
 *   EINK_AGENTIC_VISIBLE_ELEMENTS=1
 *   EINK_AGENTIC_LAYOUT=1
 *   EINK_AGENTIC_ORACLE_DETAILS=1
 *   EINK_AGENTIC_FULL_DOM=1        (optional; large, gated)
 */
export const isAgenticAnalysis = process.env.EINK_AGENTIC_ANALYSIS === "1";

function flag(name: string, defaultOn: boolean): boolean {
  const v = process.env[name];
  if (v === undefined) return defaultOn;
  return v === "1";
}

export interface AgenticEnv {
  readonly runDir: string;
  readonly testId: string;
  readonly testFolder: string;
  readonly capture: {
    readonly screenshots: boolean;
    readonly domSnapshots: boolean;
    readonly a11ySnapshots: boolean;
    readonly visibleElements: boolean;
    readonly layout: boolean;
    readonly oracleDetails: boolean;
    readonly fullDom: boolean;
  };
}

let cachedEnv: AgenticEnv | null | undefined;

/** Resolve the agentic environment, or null when not in agentic mode. */
export function getAgenticEnv(): AgenticEnv | null {
  if (cachedEnv !== undefined) return cachedEnv;
  if (!isAgenticAnalysis) {
    cachedEnv = null;
    return null;
  }
  const runDir = process.env.EINK_AGENTIC_RUN_DIR;
  const testId = process.env.EINK_AGENTIC_TEST_ID;
  const testFolder = process.env.EINK_AGENTIC_TEST_FOLDER ?? testId;
  if (!runDir || !testId || !testFolder) {
    // Flag set but incomplete wiring: stay inert rather than crash a test.
    cachedEnv = null;
    return null;
  }
  cachedEnv = {
    runDir,
    testId,
    testFolder,
    capture: {
      screenshots: flag("EINK_AGENTIC_SCREENSHOTS", true),
      domSnapshots: flag("EINK_AGENTIC_DOM_SNAPSHOTS", true),
      a11ySnapshots: flag("EINK_AGENTIC_A11Y_SNAPSHOTS", true),
      visibleElements: flag("EINK_AGENTIC_VISIBLE_ELEMENTS", true),
      layout: flag("EINK_AGENTIC_LAYOUT", true),
      oracleDetails: flag("EINK_AGENTIC_ORACLE_DETAILS", true),
      fullDom: flag("EINK_AGENTIC_FULL_DOM", false),
    },
  };
  return cachedEnv;
}

/** Absolute path to this test's artifact folder: <runDir>/tests/<testFolder>. */
export function testArtifactDir(env: AgenticEnv): string {
  return join(env.runDir, "tests", env.testFolder);
}

let stepCounter = 0;

/** Monotonic, zero-padded step id like "003-change-font-size". */
export function nextStepId(label: string): string {
  stepCounter += 1;
  const n = String(stepCounter).padStart(3, "0");
  const slug = slugify(label);
  return `${n}-${slug}`;
}

/** Current step number without advancing (for the final-state capture). */
export function peekStepNumber(): number {
  return stepCounter;
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "step"
  );
}

const ensured = new Set<string>();

/** Create (once) the standard per-test artifact subdirectories. */
export function ensureArtifactDirs(env: AgenticEnv): {
  base: string;
  screenshots: string;
  dom: string;
  snapshots: string;
  diagnostics: string;
} {
  const base = testArtifactDir(env);
  const dirs = {
    base,
    screenshots: join(base, "screenshots"),
    dom: join(base, "dom"),
    snapshots: join(base, "snapshots"),
    diagnostics: join(base, "diagnostics"),
  };
  for (const dir of Object.values(dirs)) {
    if (!ensured.has(dir)) {
      mkdirSync(dir, { recursive: true });
      ensured.add(dir);
    }
  }
  return dirs;
}
