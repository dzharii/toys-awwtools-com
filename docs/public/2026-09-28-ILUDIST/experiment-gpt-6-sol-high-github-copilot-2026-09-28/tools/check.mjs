import { chromium } from "playwright-core";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "..");
const apps = [
  "01-linework", "02-editorial", "03-dial", "04-folio", "05-atlas",
  "06-workshop", "07-doorways", "08-constellation", "09-comparison", "10-wayfinder"
];
const chrome = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].find(existsSync);
assert(chrome, "Chrome or Edge is needed for browser QA");
const original = readFileSync(join(root, "shared", "catalog.js"), "utf8");
const entries = Function("window", `${original};return window.ILUD_DATA`)({});
assert(entries.length >= 25, "The catalogue must cover everyday life beyond a small demo");
assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length, "Duplicate route IDs");
for (const entry of entries) {
  for (const field of ["id", "category", "kind", "title", "summary", "service", "url", "source", "checked", "caveat", "method", "action"]) {
    assert(entry[field], `${entry.id} is missing ${field}`);
  }
  assert.equal(new URL(entry.url).protocol, "https:");
  assert.equal(new URL(entry.source).protocol, "https:");
  assert.equal(entry.checked, "2026-09-28");
  assert(entry.steps.length >= 2, `${entry.id} lacks usable steps`);
}
assert.equal(new Set(entries.map((entry) => entry.category)).size, 6);
for (const slug of apps) {
  const dir = join(root, slug);
  for (const file of ["index.html", "catalog.js", "core.js", "base.css", "reference.png", "icon.svg", "social.jpg"]) {
    assert(existsSync(join(dir, file)), `${slug} missing ${file}`);
  }
  assert.equal(readFileSync(join(dir, "catalog.js"), "utf8"), original, `${slug} has stale data`);
  assert.equal(readFileSync(join(dir, "core.js"), "utf8"), readFileSync(join(root, "shared", "core.js"), "utf8"), `${slug} has stale UI helpers`);
  assert(readFileSync(join(dir, "index.html"), "utf8").includes("twitter:card"));
}
const index = readFileSync(join(root, "index.html"), "utf8");
for (const slug of apps) {
  assert(index.includes(`href="${slug}/"`), `Collection does not link ${slug}`);
  assert(index.includes(`${slug}/screenshot.jpg`), `Collection does not show final screenshot of ${slug}`);
}

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const failures = [];
for (const slug of apps) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    deviceScaleFactor: 1, reducedMotion: "reduce"
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  try {
    await page.goto(`file://${join(root, slug, "index.html").replaceAll("\\", "/")}`);
    await page.locator("main").first().waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${slug} overflows a phone viewport`);
    assert(await page.locator("button, a").count() >= 8, `${slug} has too few actions`);

    if (slug === "03-dial") {
      await page.locator("#next").click();
      assert.match(await page.locator("#pick-title").textContent(), /communities/);
      const wheel = await page.locator("#wheel").boundingBox();
      await page.mouse.move(wheel.x + wheel.width * 0.76, wheel.y + wheel.height * 0.4);
      await page.mouse.down();
      await page.mouse.move(wheel.x + wheel.width * 0.34, wheel.y + wheel.height * 0.4, { steps: 5 });
      await page.mouse.up();
      assert.notEqual(await page.locator("#number").textContent(), "02 / SOCIAL", "Dragging the dial should turn it");
      await page.locator("#sound").click();
      assert.equal(await page.locator("#sound").getAttribute("aria-pressed"), "true");
    } else if (slug === "04-folio") {
      await page.locator("#forward").click();
      await page.waitForTimeout(220);
      assert.match(await page.locator("#count").textContent(), /2 \//);
      await page.locator('[data-section="Images"]').click();
      assert.match(await page.locator("#count").textContent(), /1 \//);
      const paper = await page.locator("#paper").boundingBox();
      await page.mouse.move(paper.x + paper.width * 0.8, paper.y + paper.height * 0.47);
      await page.mouse.down();
      await page.mouse.move(paper.x + paper.width * 0.2, paper.y + paper.height * 0.47, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(220);
      assert.match(await page.locator("#count").textContent(), /2 \//, "Swiping paper should turn the page");
    } else if (slug === "05-atlas") {
      await page.locator('[data-category="Social"]').click();
      assert.match(await page.locator("#place").textContent(), /Social/);
    } else if (slug === "06-workshop") {
      await page.locator('[data-tool="Social"]').click();
      assert.match(await page.locator("#work-card").textContent(), /Reddit/);
    } else if (slug === "07-doorways") {
      await page.locator(".door-handle").nth(1).click();
      assert.equal(await page.locator(".door").nth(1).locator(".door-handle").getAttribute("aria-expanded"), "true");
    } else if (slug === "08-constellation") {
      await page.locator('[data-problem="Deciding"]').click();
      assert(await page.locator('[data-path="Social"]').count());
    } else if (slug === "09-comparison") {
      await page.locator('[data-case="Images"]').click();
      assert.match(await page.locator("#after-title").textContent(), /clearer source/);
      await page.locator("#split").evaluate((el) => { el.value = "70"; el.dispatchEvent(new Event("input", { bubbles: true })); });
      assert.equal(await page.locator("#stage").evaluate((el) => el.style.getPropertyValue("--split")), "70%");
    } else if (slug === "10-wayfinder") {
      await page.locator('[data-choice="Search"]').click();
      await page.locator('[data-preference="alternative"]').click();
      assert(await page.locator(".recommend .go").isVisible());
      await page.locator("#back").click();
      assert(await page.locator('[data-preference="setting"]').isVisible());
    }

    const capture = await context.newPage();
    await capture.goto(`file://${join(root, slug, "index.html").replaceAll("\\", "/")}`);
    await capture.screenshot({ path: join(root, slug, "screenshot.jpg"), type: "jpeg", quality: 84, fullPage: false });
    await capture.close();
    const browse = page.locator("button[data-browse]:visible").first();
    await browse.click();
    assert(await page.locator("#browser").isVisible(), `${slug} browser did not open`);
    await page.locator('#filters [data-filter="All"]').click();
    await page.locator("#catalog-search").fill("DuckDuckGo");
    assert(await page.locator("#results .result").count() >= 1, `${slug} search did not find a route`);
    await page.locator("#results .result").first().click();
    assert(await page.locator("#detail").isVisible(), `${slug} route did not open`);
    const external = page.locator("#route-link");
    assert.equal(new URL(await external.getAttribute("href")).protocol, "https:");
    if (await page.locator("#route-query").count()) {
      await page.locator("#route-query").fill("best coffee beans");
      assert(new URL(await external.getAttribute("href")).searchParams.get("q") === "best coffee beans");
    }
    await page.locator("#detail [data-save]").click();
    assert.equal(await page.locator("#detail [data-save]").getAttribute("aria-pressed"), "true");
    assert.equal(await external.getAttribute("target"), "_blank");
    assert.match(await external.getAttribute("rel"), /noopener/);
    await page.locator("#detail [data-close]").click();
    const saved = page.locator("button[data-saved]:visible").first();
    await saved.click();
    assert.match(await page.locator("#result-count").textContent(), /1 saved/);
    await page.locator("#browser [data-close]").click();
    await page.reload();
    await page.locator("button[data-saved]:visible").first().click();
    assert.match(await page.locator("#result-count").textContent(), /1 saved/, "Saved routes must survive a reload");
    await page.locator("#browser [data-close]").click();
    assert.equal(errors.length, 0, `${slug}: ${errors.join(" | ")}`);

    const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    const desktopPage = await desktop.newPage();
    await desktopPage.goto(`file://${join(root, slug, "index.html").replaceAll("\\", "/")}`);
    assert(await desktopPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), `${slug} overflows desktop`);
    await desktop.close();
    console.log(`PASS ${slug}: mobile, desktop, interaction, catalogue, detail, save`);
  } catch (error) {
    failures.push(`${slug}: ${error.stack}`);
    console.error(`FAIL ${slug}: ${error.message}`);
  } finally {
    await context.close();
  }
}
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto(`file://${join(root, "index.html").replaceAll("\\", "/")}`);
assert.equal(await page.locator(".card").count(), 10);
assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), "Collection overflows mobile");
await page.screenshot({ path: join(root, "collection.jpg"), type: "jpeg", quality: 84 });
await context.close();
await browser.close();
if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS collection and ${entries.length} sourced routes`);
}
