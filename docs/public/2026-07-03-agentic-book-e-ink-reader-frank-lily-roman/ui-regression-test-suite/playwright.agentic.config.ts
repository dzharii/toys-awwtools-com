import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for Agentic UI Regression Analysis Mode.
 *
 * This config is used only by the agentic runner (src/agentic/run-agentic-analysis.ts),
 * which runs one selected test at a time. It intentionally differs from the
 * normal config:
 *
 *  - workers: 1        deterministic, no cross-test interleaving of artifacts.
 *  - retries: 0        an exploratory run must observe the first, real behavior.
 *  - trace: "on"       full step-by-step trace retained for every selected test.
 *  - screenshot: "on"  Playwright end-of-test screenshot retained for every test.
 *  - video: retain-on-failure (videos are large; only kept when useful).
 *
 * The normal `playwright.config.ts` is unchanged so ordinary runs stay fast and
 * clean. All artifacts land under a gitignored .agent-runs/ folder; the JSON
 * report is redirected to the current run directory via EINK_AGENTIC_RUN_DIR.
 */
const runDir = process.env.EINK_AGENTIC_RUN_DIR;
const jsonOutput = runDir ? `${runDir}/_pw-last.json` : "test-results/agentic-results.json";

export default defineConfig({
  testDir: "src/specs",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 12_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: jsonOutput }],
  ],
  use: {
    trace: "on",
    screenshot: "on",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 } },
    },
  ],
});
