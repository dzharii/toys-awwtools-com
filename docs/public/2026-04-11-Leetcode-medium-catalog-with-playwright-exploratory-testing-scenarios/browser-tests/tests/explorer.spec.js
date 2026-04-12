const { test, expect } = require("@playwright/test");
const { ExplorerPage } = require("../page-objects/explorer-page");
const { createLogger, sanitizeSegment } = require("../utils/logger");
const { writeTestDiagnostic } = require("../utils/test-diagnostics");

test.describe.serial("Explorer acceptance @acceptance", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false });
    const prefix = `[${sanitizeSegment(testInfo.title)}]`;
    const browserIssues = {
      consoleErrors: [],
      pageErrors: [],
    };

    page.on("console", (message) => {
      if (message.type() === "error") {
        browserIssues.consoleErrors.push(message.text());
        logger.error(`${prefix} page console error`, { text: message.text() });
      }
    });
    page.on("pageerror", (error) => {
      browserIssues.pageErrors.push(error.message);
      logger.error(`${prefix} uncaught page error`, { message: error.message });
    });
    page.on("requestfailed", (request) => {
      logger.warn(`${prefix} request failed`, {
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText || "unknown",
      });
    });
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        logger.log(`${prefix} navigated`, { url: frame.url() });
      }
    });

    page.__browserIssues = browserIssues;
  });

  test.afterEach(async ({ page }) => {
    const explorer = page.__explorer;
    if (explorer) {
      await explorer.takeScreenshot(`final-${page.__testSlug || "state"}`).catch(() => {});
      await writeTestDiagnostic(page.__testInfo, explorer, {
        browserIssues: page.__browserIssues || { consoleErrors: [], pageErrors: [] },
      }).catch(() => {});
    }
    const browserIssues = page.__browserIssues || { consoleErrors: [], pageErrors: [] };
    expect(browserIssues.consoleErrors, `Unexpected console errors: ${browserIssues.consoleErrors.join(" | ")}`).toEqual([]);
    expect(browserIssues.pageErrors, `Unexpected page errors: ${browserIssues.pageErrors.join(" | ")}`).toEqual([]);
  });

  test("loads the site and renders the main workspace @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    await expect(explorer.catalogPane).toBeVisible();
    await expect(explorer.detailPane).toBeVisible();
    await expect(explorer.roadmapPanel).toBeVisible();
    await expect(explorer.roadmapSvg).toBeVisible();
    expect(await explorer.getVisibleRowCount()).toBeGreaterThan(20);
    await explorer.takeScreenshot("initial-page-load");
    logger.log("Assertion complete: workspace is visible.");
  });

  test("selecting a problem updates detail content and active state @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    await explorer.selectProblemByTitle("Decode Ways");
    await expect(explorer.detailTitle).toContainText("Decode Ways");
    await expect(page.locator("[data-problem-row='decode-ways']")).toHaveAttribute("data-selected", "true");
    await expect(explorer.repoGrid.locator("[data-testid='repo-card']").first()).toBeVisible();
    await explorer.takeScreenshot("after-selecting-decode-ways");
    logger.log("Assertion complete: detail updated for selected problem.");
  });

  test("filters narrow the catalog and expose active filter state @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    const baselineCount = await explorer.getVisibleRowCount();
    await explorer.clickQuickView("bfs-grid");
    const filteredCount = await explorer.getVisibleRowCount();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(baselineCount);
    await expect(explorer.activeFilterBar).toContainText("BFS and grid work");

    await explorer.resetFilters();
    await explorer.searchFor("decode ways");
    await expect(page.locator("[data-testid='problem-row']")).toHaveCount(1);
    await expect(explorer.activeFilterBar).toContainText("Search: decode ways");
    await explorer.takeScreenshot("after-filtering");
    logger.log("Assertion complete: filters changed visible content.");
  });

  test("roadmap renders and can drive problem selection @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    await explorer.openRoadmap();
    expect(await explorer.roadmapSvg.locator("[data-problem]").count()).toBeGreaterThan(20);
    const baselineCount = await explorer.getVisibleRowCount();
    await explorer.filterRoadmapPhase("graphs");
    const filteredCount = await explorer.getVisibleRowCount();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(baselineCount);
    await expect(explorer.activeFilterBar).toContainText("Grids And Reachability");
    await explorer.selectRoadmapProblem("course-schedule");
    await expect(explorer.detailTitle).toContainText("Course Schedule");
    await explorer.takeScreenshot("after-roadmap-selection");
    logger.log("Assertion complete: roadmap remained operational.");
  });

  test("solved state and notes persist across reload within the same session @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);
    const note = "Persistence check note.";

    logger.log("Test start.");
    await explorer.open();
    await explorer.selectProblemByTitle("Decode Ways");
    await explorer.markSolved();
    await explorer.writeNote(note);
    await explorer.takeScreenshot("before-reload-persistence");

    await page.reload({ waitUntil: "domcontentloaded" });
    await explorer.waitUntilReady();
    await expect(page.locator("[data-problem-row='decode-ways']")).toHaveAttribute("data-solved", "true");
    await expect(page.getByTestId("detail-solved")).toHaveText("Solved");
    await expect(page.getByTestId("problem-note")).toHaveValue(note);
    logger.log("Assertion complete: localStorage-backed state survived reload.");
  });

  test("inspection panel can widen for deeper reading @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    const beforeWidth = await explorer.getDetailPaneWidth();
    await explorer.toggleDetailWidth();
    const afterWidth = await explorer.getDetailPaneWidth();
    expect(afterWidth).toBeGreaterThan(beforeWidth + 80);
    await expect(page.locator("body")).toHaveAttribute("data-detail-expanded", "true");
    await explorer.takeScreenshot("detail-pane-expanded");
    logger.log("Assertion complete: detail pane widened materially.");
  });

  test("topic guide navigation works from the main explorer @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    const firstGuide = page.getByTestId("guide-strip-links").locator("a").first();
    await expect(firstGuide).toBeVisible();
    await firstGuide.click();
    await expect(page).toHaveURL(/\/topics\/.+\.html$/);
    await expect(page.locator("#topic-app")).toBeVisible();
    await expect(page.locator(".topic-card")).toBeVisible();
    await explorer.takeScreenshot("topic-guide-page");
    logger.log("Assertion complete: topic guide page loaded.");
  });

  test("inline solution spoilers expose embedded attributed source @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    await explorer.selectProblemByTitle("Decode Ways");
    await expect(explorer.inlineSolutionTabs).toBeVisible();
    await explorer.selectInlineSolutionLanguage("Python");
    const spoiler = await explorer.openInlineSolutionSpoiler("kamyu104_LeetCode-Solutions");
    await expect(spoiler).toContainText("Reveal spoiler solution");
    await expect(spoiler).toContainText("Original file");
    await expect(spoiler).toContainText("Repository");
    await expect(spoiler).toContainText("[Reader note]");
    await explorer.takeScreenshot("inline-solution-spoiler");
    logger.log("Assertion complete: inline spoiler exposed embedded reviewed source.");
  });

  test("solution workspace opens with attributed languages and annotated code @acceptance", async ({ page }, testInfo) => {
    const logger = createLogger(process.env.BROWSER_TEST_LOG_FILE, { mirrorToConsole: false }).child(
      `[${sanitizeSegment(testInfo.title)}]`,
    );
    const explorer = new ExplorerPage(page, logger);
    page.__explorer = explorer;
    page.__testInfo = testInfo;
    page.__testSlug = sanitizeSegment(testInfo.title);

    logger.log("Test start.");
    await explorer.open();
    await explorer.selectProblemByTitle("Decode Ways");
    await explorer.openSolutions();
    const languageLabels = await explorer.getSolutionLanguageLabels();
    expect(languageLabels.slice(0, 3)).toEqual(["Python", "C++", "Java"]);
    await explorer.selectSolutionLanguage("C++");
    await explorer.selectSolutionSource("doocs_leetcode");
    await expect(page.getByTestId("solution-attribution")).toContainText("doocs_leetcode");
    await expect(page.getByTestId("solution-review")).toContainText("Implementation review");
    await expect(page.getByTestId("solution-code")).toContainText("return");
    await expect(page.getByTestId("solution-code").locator("[data-testid='solution-annotation']").first()).toBeVisible();
    await explorer.takeScreenshot("solution-workspace");
    logger.log("Assertion complete: solution workspace loaded with attribution and annotations.");
  });
});
