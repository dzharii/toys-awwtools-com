import { defineConfig } from "@playwright/test";
const browserName = process.env.PLAYWRIGHT_BROWSER ?? "chromium";
if (browserName !== "chromium" && browserName !== "firefox" && browserName !== "webkit") {
  throw new Error("PLAYWRIGHT_BROWSER must be chromium, firefox, or webkit.");
}
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: "list",
  use: {
    browserName,
    baseURL: "http://localhost:4173",
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath:
        browserName === "chromium" ? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE : undefined,
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: { command: "bun scripts/serve.ts", port: 4173, reuseExistingServer: !process.env.CI },
});
