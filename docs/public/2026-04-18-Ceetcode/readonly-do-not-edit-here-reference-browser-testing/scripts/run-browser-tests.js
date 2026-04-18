const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { collectEnvironmentSummary } = require("../utils/environment");
const { createLogger, ensureDir, sanitizeSegment } = require("../utils/logger");
const { listBrowserProcesses, diffProcesses, terminateProcesses } = require("../utils/process-cleanup");
const { findAvailablePort, startServer, stopServer, waitForServer } = require("../utils/server-control");

async function main() {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const runId = sanitizeSegment(new Date().toISOString());
  const logsDir = path.join(projectRoot, "browser-tests", "logs");
  const screenshotsDir = path.join(projectRoot, "browser-tests", "screenshots");
  const artifactsDir = path.join(projectRoot, "browser-tests", "artifacts", runId);
  const diagnosticsDir = path.join(artifactsDir, "diagnostics");
  const logFile = path.join(logsDir, `${runId}.log`);
  const manifestFile = path.join(artifactsDir, "run-manifest.json");

  ensureDir(logsDir);
  ensureDir(screenshotsDir);
  ensureDir(artifactsDir);
  ensureDir(diagnosticsDir);

  const logger = createLogger(logFile);
  const args = process.argv.slice(2);
  const grepIndex = args.indexOf("--grep");
  const grepValue = grepIndex >= 0 ? args[grepIndex + 1] : "";

  const environmentSummary = collectEnvironmentSummary(projectRoot);
  const environmentFile = path.join(logsDir, `${runId}-environment.json`);
  fs.writeFileSync(environmentFile, `${JSON.stringify(environmentSummary, null, 2)}\n`, "utf8");
  logger.log("Environment summary captured.", { environmentFile, environmentSummary });

  logger.log("Browser launch parameters.", {
    browserName: "chromium",
    headless: true,
    viewport: { width: 1920, height: 1080 },
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "Playwright-managed Chromium bundle",
  });

  const browserProcessesBefore = listBrowserProcesses();
  let serverProcess;

  try {
    const port = await findAvailablePort(4173);
    const baseUrl = `http://127.0.0.1:${port}`;
    logger.log("Starting local server.", { port, baseUrl });

    serverProcess = startServer(projectRoot, port, logger);
    await waitForServer(baseUrl, logger);

    await runPlaywright(projectRoot, {
      baseUrl,
      runId,
      logFile,
      screenshotsDir,
      artifactsDir,
      diagnosticsDir,
      grepValue,
      logger,
    });
    writeRunManifest({ runId, logFile, environmentFile, screenshotsDir, diagnosticsDir, artifactsDir, grepValue }, manifestFile);
  } finally {
    await stopServer(serverProcess, logger);
    const browserProcessesAfter = listBrowserProcesses();
    const leftovers = diffProcesses(browserProcessesBefore, browserProcessesAfter);
    await terminateProcesses(leftovers, logger, "browser");
    logger.log("Cleanup complete.", { logFile });
  }
}

async function runPlaywright(projectRoot, options) {
  const cliPath = require.resolve("@playwright/test/cli");
  const commandArgs = [cliPath, "test", "-c", "playwright.config.js"];
  if (options.grepValue) {
    commandArgs.push("--grep", options.grepValue);
  }

  const env = {
    ...process.env,
    PLAYWRIGHT_BASE_URL: options.baseUrl,
    BROWSER_TEST_RUN_ID: options.runId,
    BROWSER_TEST_LOG_FILE: options.logFile,
    BROWSER_TEST_SCREENSHOT_DIR: options.screenshotsDir,
    BROWSER_TEST_ARTIFACT_ROOT: options.artifactsDir,
    BROWSER_TEST_DIAGNOSTICS_DIR: options.diagnosticsDir,
  };

  options.logger.log("Launching Playwright.", { commandArgs, baseUrl: options.baseUrl });

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, commandArgs, {
      cwd: projectRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      const message = chunk.toString();
      process.stdout.write(message);
      options.logger.log("playwright stdout", { message: message.trimEnd() });
    });
    child.stderr.on("data", (chunk) => {
      const message = chunk.toString();
      process.stderr.write(message);
      options.logger.warn("playwright stderr", { message: message.trimEnd() });
    });
    child.on("error", (error) => reject(error));
    child.on("exit", (code, signal) => {
      options.logger.log("Playwright finished.", { code, signal });
      if (code === 0) resolve();
      else reject(new Error(`Playwright exited with code ${code} signal ${signal || "none"}`));
    });
  });
}

function writeRunManifest(context, manifestFile) {
  const screenshots = fs
    .readdirSync(context.screenshotsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith(context.runId))
    .map((entry) => path.join(context.screenshotsDir, entry.name))
    .sort();
  const diagnostics = fs
    .readdirSync(context.diagnosticsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(context.diagnosticsDir, entry.name))
    .sort();
  const payload = {
    runId: context.runId,
    grep: context.grepValue || "",
    logFile: context.logFile,
    environmentFile: context.environmentFile,
    screenshots,
    diagnostics,
    artifactsDir: context.artifactsDir,
  };
  fs.writeFileSync(manifestFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
