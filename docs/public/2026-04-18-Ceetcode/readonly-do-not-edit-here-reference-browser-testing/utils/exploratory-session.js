const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");
const { collectEnvironmentSummary } = require("./environment");
const { createLogger, ensureDir, sanitizeSegment } = require("./logger");
const { listBrowserProcesses, diffProcesses, terminateProcesses } = require("./process-cleanup");
const { findAvailablePort, startServer, stopServer, waitForServer } = require("./server-control");
const { ExplorerPage } = require("../page-objects/explorer-page");

class ExploratorySession {
  constructor(options) {
    this.projectRoot = options.projectRoot;
    this.runId = options.runId;
    this.sessionSlug = sanitizeSegment(options.sessionSlug || "exploratory-session");
    this.sessionRoot = path.join(this.projectRoot, "browser-tests", "exploratory", "sessions", `${this.runId}-${this.sessionSlug}`);
    this.screenshotDir = path.join(this.sessionRoot, "screenshots");
    this.reportPath = path.join(this.sessionRoot, "report.md");
    this.manifestPath = path.join(this.sessionRoot, "manifest.json");
    this.logFile = path.join(this.sessionRoot, "session.log");
    this.logger = createLogger(this.logFile);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.explorer = null;
    this.serverProcess = null;
    this.baseUrl = null;
    this.stepCounter = 0;
    this.observations = [];
    this.screenshots = [];
    this.browserProcessesBefore = [];
    this.previousScreenshotDir = null;
    this.previousRunId = null;
  }

  async start(sessionMeta = {}) {
    ensureDir(this.sessionRoot);
    ensureDir(this.screenshotDir);

    const environmentSummary = collectEnvironmentSummary(this.projectRoot);
    const environmentFile = path.join(this.sessionRoot, "environment.json");
    fs.writeFileSync(environmentFile, `${JSON.stringify(environmentSummary, null, 2)}\n`, "utf8");

    this.previousScreenshotDir = process.env.BROWSER_TEST_SCREENSHOT_DIR;
    this.previousRunId = process.env.BROWSER_TEST_RUN_ID;
    process.env.BROWSER_TEST_SCREENSHOT_DIR = this.screenshotDir;
    process.env.BROWSER_TEST_RUN_ID = this.runId;

    this.browserProcessesBefore = listBrowserProcesses();

    const port = await findAvailablePort(4273);
    this.baseUrl = `http://127.0.0.1:${port}`;
    this.logger.log("Starting exploratory session.", {
      runId: this.runId,
      sessionSlug: this.sessionSlug,
      baseUrl: this.baseUrl,
      sessionMeta,
    });

    this.serverProcess = startServer(this.projectRoot, port, this.logger);
    await waitForServer(this.baseUrl, this.logger);

    this.browser = await chromium.launch({
      headless: sessionMeta.headless !== false,
      args: ["--disable-dev-shm-usage"],
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await this.context.newPage();
    this.explorer = new ExplorerPage(this.page, this.logger, { baseUrl: this.baseUrl });

    this.page.on("console", (message) => {
      if (message.type() === "error") {
        this.logger.error("page console error", { text: message.text() });
      }
    });
    this.page.on("pageerror", (error) => {
      this.logger.error("uncaught page error", { message: error.message });
    });
    this.page.on("requestfailed", (request) => {
      this.logger.warn("request failed", {
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText || "unknown",
      });
    });

    this.writeManifest({
      runId: this.runId,
      sessionSlug: this.sessionSlug,
      startedAt: new Date().toISOString(),
      baseUrl: this.baseUrl,
      environmentFile,
      sessionMeta,
      observations: [],
      screenshots: [],
    });

    return this;
  }

  async stop() {
    try {
      if (this.page) await this.page.close();
    } catch (error) {
      this.logger.warn("Page close failed.", { error: error.message });
    }
    try {
      if (this.context) await this.context.close();
    } catch (error) {
      this.logger.warn("Context close failed.", { error: error.message });
    }
    try {
      if (this.browser) await this.browser.close();
    } catch (error) {
      this.logger.warn("Browser close failed.", { error: error.message });
    }

    await stopServer(this.serverProcess, this.logger);

    const browserProcessesAfter = listBrowserProcesses();
    const leftovers = diffProcesses(this.browserProcessesBefore, browserProcessesAfter);
    await terminateProcesses(leftovers, this.logger, "browser");

    this.logger.log("Exploratory session complete.", {
      reportPath: this.reportPath,
      manifestPath: this.manifestPath,
    });

    if (typeof this.previousScreenshotDir === "string") process.env.BROWSER_TEST_SCREENSHOT_DIR = this.previousScreenshotDir;
    else delete process.env.BROWSER_TEST_SCREENSHOT_DIR;
    if (typeof this.previousRunId === "string") process.env.BROWSER_TEST_RUN_ID = this.previousRunId;
    else delete process.env.BROWSER_TEST_RUN_ID;
  }

  async captureStep(options) {
    this.stepCounter += 1;
    const stepId = String(this.stepCounter).padStart(2, "0");
    const stepSlug = sanitizeSegment(options.id || options.title || `step-${stepId}`);
    const screenshotName = `${this.runId}-${this.sessionSlug}-${stepId}-${stepSlug}`;
    const screenshotPath = path.join(this.screenshotDir, `${screenshotName}.png`);

    this.logger.log("Exploratory step.", {
      stepId,
      title: options.title,
      intent: options.intent || "",
      focus: options.focus,
      actions: options.actions || [],
      lookAround: options.lookAround || [],
      reviewQuestions: options.reviewQuestions || [],
    });

    const snapshot = await this.explorer.collectSnapshot();
    if (options.screenshotTarget) {
      await this.explorer.takeFocusedScreenshot(
        `${this.sessionSlug}-${stepId}-${stepSlug}`,
        options.screenshotTarget,
        {
          ...(options.screenshotFullPage === false ? {} : {}),
        },
      );
      const focusedPath = path.join(this.screenshotDir, `${this.runId}-${sanitizeSegment(`${this.sessionSlug}-${stepId}-${stepSlug}`)}.png`);
      recordScreenshotPath(focusedPath, screenshotPath);
    } else {
      await this.page.screenshot({ path: screenshotPath, fullPage: options.screenshotFullPage !== false });
    }

    const record = {
      stepId,
      id: options.id || stepSlug,
      title: options.title || stepSlug,
      intent: options.intent || "",
      focus: options.focus || "",
      actions: options.actions || [],
      lookAround: options.lookAround || [],
      reviewQuestions: options.reviewQuestions || [],
      snapshot,
      screenshotPath,
      screenshotTarget: options.screenshotTarget || "full-page",
    };

    this.screenshots.push(record);
    this.writeManifest({
      screenshots: this.screenshots,
      observations: this.observations,
    });
    this.appendReportSection(record);
    return record;
  }

  addObservation(text, metadata = {}) {
    const observation = {
      at: new Date().toISOString(),
      text,
      metadata,
    };
    this.observations.push(observation);
    this.logger.log("Observation recorded.", observation);
    this.writeManifest({
      screenshots: this.screenshots,
      observations: this.observations,
    });
    this.appendObservation(observation);
    return observation;
  }

  initializeReport(sessionInfo) {
    const lines = [
      `# Exploratory Session: ${sessionInfo.title}`,
      "",
      `- Run ID: \`${this.runId}\``,
      `- Session slug: \`${this.sessionSlug}\``,
      `- Started at: ${sessionInfo.startedAt}`,
      `- Base URL: \`${this.baseUrl}\``,
      "",
      "## Session Intent",
      "",
      sessionInfo.intent || "No explicit session intent recorded.",
      "",
      "## Charter",
      "",
      sessionInfo.goal,
      "",
      "## Quality Questions",
      "",
      ...(sessionInfo.reviewQuestions || []).map((item) => `- ${item}`),
      "",
      "## Anti-Tunnel-Vision Reminders",
      "",
      ...sessionInfo.reminders.map((item) => `- ${item}`),
      "",
      "## Baseline",
      "",
      ...sessionInfo.baseline.map((item) => `- ${item}`),
      "",
      "## Step Log",
      "",
    ];
    fs.writeFileSync(this.reportPath, `${lines.join("\n")}\n`, "utf8");
  }

  appendReportSection(record) {
    const lines = [
      `### ${record.stepId}. ${record.title}`,
      "",
      `- Intent: ${record.intent || "n/a"}`,
      `- Focus: ${record.focus || "n/a"}`,
      ...(record.actions || []).length
        ? [`- Actions: ${(record.actions || []).map(describeAction).join(" -> ")}`]
        : ["- Actions: none recorded"],
      ...record.lookAround.map((item) => `- Look around: ${item}`),
      ...record.reviewQuestions.map((item) => `- Review question: ${item}`),
      `- URL: \`${record.snapshot.url}\``,
      `- Selected title: ${record.snapshot.selectedTitle || "n/a"}`,
      `- Visible count: ${record.snapshot.visibleCount}`,
      `- Active filters: ${record.snapshot.activeFilters || "none"}`,
      `- Detail expanded: ${record.snapshot.detailExpanded ? "yes" : "no"}`,
      `- Solution workspace open: ${record.snapshot.solutionOpen ? "yes" : "no"}`,
      `- Solution languages: ${record.snapshot.solutionLanguages.length ? record.snapshot.solutionLanguages.join(" | ") : "n/a"}`,
      `- Sample visible titles: ${record.snapshot.sampleTitles.length ? record.snapshot.sampleTitles.join(" | ") : "n/a"}`,
      `- Screenshot: [${path.basename(record.screenshotPath)}](./screenshots/${path.basename(record.screenshotPath)})`,
      `- Screenshot target: ${record.screenshotTarget}`,
      "",
    ];
    fs.appendFileSync(this.reportPath, `${lines.join("\n")}\n`, "utf8");
  }

  appendObservation(observation) {
    const lines = [
      "## Observation",
      "",
      `- Time: ${observation.at}`,
      `- Note: ${observation.text}`,
      observation.metadata && Object.keys(observation.metadata).length
        ? `- Metadata: \`${JSON.stringify(observation.metadata)}\``
        : "- Metadata: none",
      "",
    ];
    fs.appendFileSync(this.reportPath, `${lines.join("\n")}\n`, "utf8");
  }

  writeManifest(patch) {
    const current = fs.existsSync(this.manifestPath)
      ? JSON.parse(fs.readFileSync(this.manifestPath, "utf8"))
      : {};
    const next = { ...current, ...patch };
    fs.writeFileSync(this.manifestPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  }
}

function describeAction(action) {
  if (!action || typeof action !== "object") return "unknown";
  const type = action.type || "unknown";
  const value = action.value ?? action.text ?? action.label ?? "";
  return value ? `${type}(${value})` : type;
}

function recordScreenshotPath(actualPath, expectedPath) {
  if (actualPath === expectedPath) return;
  if (fs.existsSync(actualPath) && !fs.existsSync(expectedPath)) {
    fs.renameSync(actualPath, expectedPath);
  }
}

module.exports = {
  ExploratorySession,
};
