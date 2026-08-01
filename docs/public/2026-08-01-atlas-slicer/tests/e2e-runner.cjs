const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(path.join(process.env.APPDATA, "npm", "node_modules", "playwright"));

const projectRoot = path.resolve(__dirname, "..");
const fixturePath = path.join(__dirname, "fixtures", "atlas-100x100.png");
const exportDirectory = path.join(projectRoot, "evidence", "exports");
const screenshotDirectory = path.join(projectRoot, "evidence", "screenshots");

function pngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function run() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  try {
    await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle" });
    assert.match(await page.title(), /Grid and Atlas Helper/);
    assert.equal(await page.locator("#grid-tab").getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("#column-count").inputValue(), "15");
    assert.match(await page.locator("#workspace-summary").textContent(), /225 complete cells/);
    const accessibilityGaps = await page.evaluate(() => {
      const hasName = (element) => element.getAttribute("aria-label") || element.getAttribute("aria-labelledby")
        || element.closest("label") || (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`));
      return {
        controls: [...document.querySelectorAll("input:not([hidden]), select, textarea")].filter((element) => !hasName(element)).map((element) => element.id),
        buttons: [...document.querySelectorAll("button")].filter((element) => !element.textContent.trim() && !hasName(element)).map((element) => element.id),
      };
    });
    assert.deepEqual(accessibilityGaps, { controls: [], buttons: [] });
    await page.screenshot({ path: path.join(screenshotDirectory, "grid-default-1600x900.png"), fullPage: true });
    console.log("PASS application shell and default Grid Creator state");
    console.log("PASS visible form controls and buttons have accessible names");

    await page.locator("#cell-width").fill("0");
    await page.locator("#cell-width").press("Enter");
    assert.equal(await page.locator("#cell-width").inputValue(), "32");
    assert.match(await page.locator("#status-message").textContent(), /integer greater than zero/);
    console.log("PASS invalid geometry is rejected without losing the prior value");

    page.once("dialog", (dialog) => dialog.accept("Fixture preset"));
    await page.locator("#save-preset-button").click();
    assert.equal(await page.locator("#preset-select option").count(), 2);
    await page.locator("#duplicate-preset-button").click();
    assert.equal(await page.locator("#preset-select option").count(), 3);
    page.once("dialog", (dialog) => dialog.accept("Renamed fixture"));
    await page.locator("#rename-preset-button").click();
    assert.equal(await page.locator("#preset-select option:checked").textContent(), "Renamed fixture");
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#delete-preset-button").click();
    assert.equal(await page.locator("#preset-select option").count(), 2);
    console.log("PASS preset create, duplicate, rename, and delete workflow");

    await page.locator("#json-input").setInputFiles(path.join(__dirname, "fixtures", "malformed.json"));
    await page.waitForFunction(() => document.querySelector("#status-message").textContent.includes("Cannot import preset"));
    assert.match(await page.locator("#status-message").textContent(), /Cannot import preset/);
    console.log("PASS malformed preset JSON is rejected without replacing state");

    await page.locator("#copy-url-button").click();
    await page.waitForFunction(() => document.querySelector("#status-message").textContent.includes("URL copied"));
    assert.match(page.url(), /#v=1&mode=grid-creator&state=/);
    assert.match(await page.locator("#status-message").textContent(), /URL copied/);
    const sharedPage = await context.newPage();
    await sharedPage.goto(page.url(), { waitUntil: "networkidle" });
    assert.equal(await sharedPage.locator("#cell-width").inputValue(), "32");
    assert.equal(await sharedPage.locator("#grid-tab").getAttribute("aria-selected"), "true");
    await sharedPage.close();
    console.log("PASS shareable URL serialization updates the hash and copies successfully");

    const gridDownloadPromise = page.waitForEvent("download");
    await page.locator("#primary-export-button").click();
    const gridDownload = await gridDownloadPromise;
    const gridPath = path.join(exportDirectory, "grid-default.png");
    await gridDownload.saveAs(gridPath);
    assert.deepEqual(pngDimensions(gridPath), { width: 512, height: 512 });
    console.log("PASS Grid Creator PNG is exactly 512 x 512");

    await page.locator("#atlas-tab").click();
    assert.equal(await page.locator("#atlas-tab").getAttribute("aria-selected"), "true");
    await page.locator("#image-input").setInputFiles(fixturePath);
    await page.locator("#source-metadata").waitFor({ state: "visible" });
    assert.match(await page.locator("#source-metadata").textContent(), /100 × 100 px/);
    console.log("PASS local atlas image loads and supplies natural dimensions");
    await page.locator("#image-input").setInputFiles(path.join(__dirname, "fixtures", "corrupted.png"));
    await page.waitForFunction(() => document.querySelector("#status-message").textContent.includes("could not be decoded"));
    assert.match(await page.locator("#source-metadata").textContent(), /100 × 100 px/);
    console.log("PASS failed image replacement preserves the previous valid atlas");

    await page.locator("#cell-width").fill("10");
    await page.locator("#cell-width").press("Enter");
    await page.locator("#cell-height").fill("10");
    await page.locator("#cell-height").press("Enter");
    assert.match(await page.locator("#workspace-summary").textContent(), /81 complete cells/);
    const transform = await page.locator("#transform-layer").boundingBox();
    assert.ok(transform);
    await page.mouse.click(transform.x + 5 * (transform.width / 100), transform.y + 5 * (transform.height / 100));
    assert.match(await page.locator("#selected-metadata").textContent(), /0, 0/);
    await page.locator("#viewport").focus();
    await page.keyboard.press("ArrowRight");
    assert.match(await page.locator("#selected-metadata").textContent(), /1, 0/);
    console.log("PASS pointer and keyboard cell selection remain synchronized");

    const cellDownloadPromise = page.waitForEvent("download");
    await page.locator("#download-cell-button").click();
    const cellDownload = await cellDownloadPromise;
    const cellPath = path.join(exportDirectory, "selected-cell.png");
    await cellDownload.saveAs(cellPath);
    assert.deepEqual(pngDimensions(cellPath), { width: 10, height: 10 });
    console.log("PASS selected cell exports at exact usable dimensions");

    const zipDownloadPromise = page.waitForEvent("download");
    await page.locator("#primary-export-button").click();
    const zipDownload = await zipDownloadPromise;
    const zipPath = path.join(exportDirectory, "atlas-slices.zip");
    await zipDownload.saveAs(zipPath);
    assert.ok(fs.statSync(zipPath).size > 1000);
    console.log("PASS ZIP export produces a non-empty archive");

    await page.screenshot({ path: path.join(screenshotDirectory, "atlas-loaded-1600x900.png"), fullPage: true });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: path.join(screenshotDirectory, "atlas-wide-1920x1080.png"), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(screenshotDirectory, "atlas-responsive-1440x900.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 800 });
    assert.ok(await page.locator("#primary-export-button").isVisible());
    const contextBox = await page.locator(".context-panel").boundingBox();
    assert.ok(contextBox && contextBox.x >= 0 && contextBox.x + contextBox.width <= 1280);
    await page.screenshot({ path: path.join(screenshotDirectory, "atlas-responsive-1280x800.png"), fullPage: true });
    console.log("PASS 1920, 1600, 1440, and 1280 responsive visual captures completed");
    const expectedControlledErrors = ["preset.json-import.failed", "image.load.failed"];
    const unexpectedConsoleErrors = consoleErrors.filter((message) => !expectedControlledErrors.some((expected) => message.includes(expected)));
    assert.deepEqual(unexpectedConsoleErrors, []);
    assert.equal(consoleErrors.filter((message) => message.includes("preset.json-import.failed")).length, 1);
    assert.equal(consoleErrors.filter((message) => message.includes("image.load.failed")).length, 1);
    console.log("PASS no unexplained console or page errors; controlled malformed-import and image-decode failures were logged once each");
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
