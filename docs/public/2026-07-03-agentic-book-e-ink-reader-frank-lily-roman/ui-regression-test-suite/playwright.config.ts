import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for the E Ink Reader UI regression suite.
 *
 * The app under test is a static, local-first page. Each test uses an isolated
 * browser context, so the suite runs fully parallel (unlike the stateful
 * extension reference suite that forced a single worker). If E Ink or
 * pagination timing proves flaky under parallelism, pin those specs to a
 * serial project rather than serializing everything.
 */
export default defineConfig({
  testDir: "src/specs",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : "50%",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    // The app is served locally by the suite's static server; baseURL is set
    // per-test via the app factory (ephemeral port). No global baseURL.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Deterministic default; individual projects/tests override.
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 } },
    },
  ],
});
