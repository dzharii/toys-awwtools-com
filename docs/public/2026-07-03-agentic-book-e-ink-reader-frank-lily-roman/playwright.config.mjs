// Playwright configuration for the E Ink reader.
//
// Playwright is an OPTIONAL developer/test dependency — it is never required to
// run the app. If Playwright is not installed, skip these tests and validate in
// a browser manually (see README).
//
// The config starts the dependency-free static server (scripts/serve-static.mjs)
// and runs the specs against it in Chromium. Run with:
//   npx playwright test            (if @playwright/test is available)

import { defineConfig, devices } from "@playwright/test";

const PORT = 8123;

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
  },
  webServer: {
    command: `node scripts/serve-static.mjs ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1200, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
