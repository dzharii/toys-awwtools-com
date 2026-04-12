const path = require("path");
const { defineConfig } = require("@playwright/test");

const artifactRoot = process.env.BROWSER_TEST_ARTIFACT_ROOT || path.join(__dirname, "browser-tests", "artifacts");

module.exports = defineConfig({
  testDir: path.join(__dirname, "browser-tests", "tests"),
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: path.join(artifactRoot, "html-report"), open: "never" }],
  ],
  outputDir: path.join(artifactRoot, "test-results"),
  use: {
    browserName: "chromium",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      args: ["--disable-dev-shm-usage"],
    },
  },
});
