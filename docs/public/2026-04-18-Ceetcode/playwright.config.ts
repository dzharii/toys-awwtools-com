import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  expect: {
    timeout: 20_000
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    viewport: { width: 1600, height: 980 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
