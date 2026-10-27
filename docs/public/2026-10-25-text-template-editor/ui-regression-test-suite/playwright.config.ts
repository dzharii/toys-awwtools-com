import { defineConfig } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyBuild } from "./scripts/verify-build";

const productRoot = resolve(
  process.env.GUIDED_PRODUCT_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), ".."),
);
const port = process.env.GUIDED_PORT ?? "4187";
const baseURL = process.env.GUIDED_BASE_URL ?? `http://127.0.0.1:${port}/`;

await verifyBuild(productRoot);

export default defineConfig({
  testDir: "./src/specs",
  testIgnore: "**/unit/**",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 8_000 },
  forbidOnly: !!process.env.CI,
  globalSetup: "./scripts/verify-build.ts",
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    browserName: "chromium",
    baseURL,
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 8_000,
    navigationTimeout: 20_000,
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
        : {}),
    },
  },
  projects: [
    { name: "smoke", testMatch: "**/smoke/*.spec.ts" },
    { name: "acceptance", testMatch: "**/acceptance/*.spec.ts", dependencies: ["smoke"] },
  ],
  webServer: process.env.GUIDED_BASE_URL
    ? undefined
    : {
        command: "bun run preview",
        cwd: productRoot,
        env: { PORT: port },
        url: baseURL,
        reuseExistingServer: false,
        timeout: 20_000,
      },
});
