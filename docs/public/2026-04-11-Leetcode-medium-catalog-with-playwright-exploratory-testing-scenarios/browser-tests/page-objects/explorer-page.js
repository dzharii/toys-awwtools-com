const fs = require("fs");
const path = require("path");
const { expect } = require("@playwright/test");
const { sanitizeSegment } = require("../utils/logger");

class ExplorerPage {
  constructor(page, logger, options = {}) {
    this.page = page;
    this.logger = logger;
    this.baseUrl = options.baseUrl || process.env.PLAYWRIGHT_BASE_URL || "";
    this.catalogPane = page.getByTestId("catalog-pane");
    this.detailPane = page.getByTestId("detail-pane");
    this.phaseGroups = page.getByTestId("phase-groups");
    this.detailTitle = page.getByTestId("detail-title");
    this.repoGrid = page.getByTestId("repo-grid");
    this.roadmapPanel = page.getByTestId("roadmap-panel");
    this.roadmapSvg = page.getByTestId("roadmap-svg");
    this.searchInput = page.getByTestId("search-input");
    this.activeFilterBar = page.getByTestId("active-filter-bar");
    this.listCount = page.locator("#list-count");
    this.solutionDialog = page.getByTestId("solution-dialog");
    this.solutionLanguageTabs = page.getByTestId("solution-language-tabs");
    this.solutionSourceTabs = page.getByTestId("solution-source-tabs");
    this.solutionCode = page.getByTestId("solution-code");
    this.inlineSolutionTabs = page.getByTestId("inline-solution-tabs");
    this.inlineSolutionList = page.getByTestId("inline-solution-list");
  }

  async open() {
    this.logger.log("Navigating to explorer.");
    await this.page.goto(this.resolveUrl("/index.html"), { waitUntil: "domcontentloaded" });
    await this.waitUntilReady();
  }

  async waitUntilReady() {
    await expect(this.page.locator("body")).toHaveAttribute("data-app-ready", "true");
    await expect(this.catalogPane).toBeVisible();
    await expect(this.phaseGroups.locator("[data-testid='problem-row']").first()).toBeVisible();
    this.logger.log("Explorer reported ready.");
  }

  async getVisibleRowCount() {
    return this.phaseGroups.locator("[data-testid='problem-row']").count();
  }

  async getSelectedTitleText() {
    await expect(this.detailTitle).toBeVisible();
    return (await this.detailTitle.textContent())?.trim() || "";
  }

  async getActiveFilterText() {
    return ((await this.activeFilterBar.textContent()) || "").trim().replace(/\s+/g, " ");
  }

  async getVisibleProblemTitles(limit = 8) {
    const rows = this.phaseGroups.locator("[data-testid='problem-row'] h4");
    const count = await rows.count();
    const titles = [];
    for (let index = 0; index < Math.min(count, limit); index += 1) {
      const text = (await rows.nth(index).textContent())?.trim();
      if (text) titles.push(text);
    }
    return titles;
  }

  async selectProblemByTitle(title) {
    this.logger.log("Selecting problem by title.", { title });
    const row = this.page.locator("[data-testid='problem-row']").filter({ hasText: title }).first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(row).toHaveAttribute("data-selected", "true");
  }

  async selectProblemById(problemId) {
    this.logger.log("Selecting problem by id.", { problemId });
    const row = this.page.locator(`[data-problem-row='${problemId}']`).first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(row).toHaveAttribute("data-selected", "true");
  }

  async searchFor(text) {
    this.logger.log("Applying search filter.", { text });
    await this.searchInput.fill(text);
  }

  async clickQuickView(quickViewId) {
    this.logger.log("Applying quick view.", { quickViewId });
    const button = this.page.locator(`[data-quick-view='${quickViewId}']`);
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toHaveAttribute("data-active", "true");
  }

  async resetFilters() {
    this.logger.log("Resetting filters.");
    await this.page.getByTestId("reset-filters-button").click();
  }

  async openRoadmap() {
    this.logger.log("Ensuring roadmap is visible.");
    await expect(this.roadmapPanel).toBeVisible();
    await expect(this.roadmapSvg).toBeVisible();
  }

  async selectRoadmapProblem(problemId) {
    this.logger.log("Selecting problem from roadmap.", { problemId });
    await this.openRoadmap();
    const node = this.roadmapSvg.locator(`[data-problem='${problemId}']`).first();
    await expect(node).toBeVisible();
    await node.click();
  }

  async filterRoadmapPhase(phaseId) {
    this.logger.log("Filtering via roadmap phase context.", { phaseId });
    const chip = this.page.locator(`[data-roadmap-context-phase='${phaseId}']`).first();
    await expect(chip).toBeVisible();
    await chip.click();
    await expect(chip).toHaveAttribute("data-active", "true");
  }

  async markSolved() {
    this.logger.log("Marking selected problem solved.");
    await this.page.getByTestId("detail-solved").click();
  }

  async toggleDetailWidth() {
    const button = this.page.getByTestId("toggle-detail-width");
    await expect(button).toBeVisible();
    await button.click();
  }

  async getDetailPaneWidth() {
    const box = await this.detailPane.boundingBox();
    return box ? box.width : 0;
  }

  async writeNote(value) {
    this.logger.log("Writing local note.", { length: value.length });
    await this.page.getByTestId("problem-note").fill(value);
  }

  async openFirstGuideFromOverview() {
    const link = this.page.getByTestId("guide-strip-links").locator("a").first();
    await expect(link).toBeVisible();
    await link.click();
  }

  async openSolutions() {
    const button = this.page.getByTestId("open-solutions");
    await expect(button).toBeVisible();
    await button.click();
    await expect(this.solutionDialog).toHaveAttribute("data-open", "true");
    await expect(this.solutionLanguageTabs.locator("[data-testid='solution-language-tab']").first()).toBeVisible();
    await expect(this.solutionCode).toBeVisible();
  }

  async selectInlineSolutionLanguage(label) {
    const tab = this.inlineSolutionTabs.locator("[data-inline-language]").filter({ hasText: label }).first();
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute("data-active", "true");
  }

  async openInlineSolutionSpoiler(repositoryText) {
    const card = this.inlineSolutionList.locator("[data-testid='inline-solution-card']").filter({ hasText: repositoryText }).first();
    await expect(card).toBeVisible();
    const spoiler = card.locator("[data-solution-spoiler]").first();
    await spoiler.locator("summary").click();
    await expect(spoiler).toHaveAttribute("open", "");
    return spoiler;
  }

  async closeSolutions() {
    await this.page.getByTestId("solution-dialog-close").click();
    await expect(this.solutionDialog).toHaveAttribute("data-open", "false");
  }

  async selectSolutionLanguage(label) {
    const tab = this.solutionLanguageTabs.locator("[data-testid='solution-language-tab']").filter({ hasText: label }).first();
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute("data-active", "true");
  }

  async selectSolutionSource(repositoryText) {
    const tab = this.solutionSourceTabs.locator("[data-testid='solution-source-tab']").filter({ hasText: repositoryText }).first();
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute("data-active", "true");
  }

  async getSolutionLanguageLabels() {
    const tabs = this.solutionLanguageTabs.locator("[data-testid='solution-language-tab']");
    const count = await tabs.count();
    const items = [];
    for (let index = 0; index < count; index += 1) {
      const text = (await tabs.nth(index).textContent())?.trim();
      if (text) items.push(text);
    }
    return items;
  }

  async openGuideByTitle(title) {
    const link = this.page.locator("a").filter({ hasText: title }).first();
    await expect(link).toBeVisible();
    await link.click();
  }

  async goBackToExplorer() {
    await this.page.goto(this.resolveUrl("/index.html"), { waitUntil: "domcontentloaded" });
    await this.waitUntilReady();
  }

  async collectSnapshot() {
    return {
      url: this.page.url(),
      selectedTitle: await this.getSelectedTitleText().catch(() => ""),
      visibleCount: await this.getVisibleRowCount().catch(() => 0),
      activeFilters: await this.getActiveFilterText().catch(() => ""),
      sampleTitles: await this.getVisibleProblemTitles().catch(() => []),
      solutionOpen: (await this.page.locator("body").getAttribute("data-solution-open").catch(() => "false")) === "true",
      detailExpanded: (await this.page.locator("body").getAttribute("data-detail-expanded").catch(() => "false")) === "true",
      solutionLanguages: await this.getSolutionLanguageLabels().catch(() => []),
    };
  }

  resolveUrl(relativePath) {
    if (!this.baseUrl) return relativePath;
    return new URL(relativePath, `${this.baseUrl}/`).toString();
  }

  async takeScreenshot(name) {
    const runId = process.env.BROWSER_TEST_RUN_ID || "manual";
    const screenshotDir = process.env.BROWSER_TEST_SCREENSHOT_DIR || path.join(process.cwd(), "browser-tests", "screenshots");
    fs.mkdirSync(screenshotDir, { recursive: true });
    const filename = `${runId}-${sanitizeSegment(name)}.png`;
    const filePath = path.join(screenshotDir, filename);
    await this.page.screenshot({ path: filePath, fullPage: true });
    this.logger.log("Captured screenshot.", { filePath });
    return filePath;
  }
}

module.exports = {
  ExplorerPage,
};
