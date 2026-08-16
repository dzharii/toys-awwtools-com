import { test, expect } from "@playwright/test";
import { generateRecordHtml } from "../shared/core.js";

test("journal loads records in fixed pages and keeps cards usable", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".journal-page")).toHaveCount(testInfo.project.name === "desktop" ? 2 : 1);
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
  await expect(page.locator(".entry-card h2").first()).toBeVisible();
  await expect(page.locator(".entry-host").first()).toContainText("example.com");
  await expect(page.locator(".entry-card time").first()).toContainText("Added");
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-opening.png`), fullPage: false });
});

test("page navigation advances by spread or page and rejects rapid corruption", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(560);
  await expect(page.locator(".page-number").first()).toHaveText(testInfo.project.name === "desktop" ? "Page 3" : "Page 2");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(560);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
});

test("Ctrl-wheel zoom is bounded and ordinary wheel does not change pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)").first()).toBeVisible();
  const before = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  await page.mouse.wheel(0, 700);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
  await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: -100, ctrlKey: true });
  const after = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  expect(Number.parseFloat(after)).toBeGreaterThan(Number.parseFloat(before));
});

test("responsive mode preserves logical location", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.keyboard.press("ArrowRight"); await page.waitForTimeout(520);
  await expect(page.locator(".page-number").first()).toHaveText("Page 3");
  await page.setViewportSize({ width: 760, height: 900 });
  await expect(page.locator(".journal-page")).toHaveCount(1);
  await expect(page.locator(".page-number")).toHaveText("Page 3");
});

test("keyboard focus is visible and reduced motion remains functional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)").first()).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.keyboard.press("PageDown");
  await expect(page.locator(".page-number").first()).not.toHaveText("Page 1");
});

test("startup work is bounded and a fresh cache avoids repeat record fetches", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  let records = 0;
  page.on("request", (request) => { if (/\/lnk\/[^/]+\/index\.html$/.test(request.url())) records += 1; });
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.waitForTimeout(300);
  expect(records).toBeLessThanOrEqual(18);
  records = 0;
  await page.reload();
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.waitForTimeout(200);
  expect(records).toBe(0);
});

test("one missing record stays local and retains its grid position", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/lnk/Demo0002/index.html", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await expect(page.locator('.entry-card[data-id="Demo0002"]')).toHaveClass(/is-error/);
  await expect(page.locator('.entry-card[data-id="Demo0003"] h2')).toBeVisible();
  expect(await page.locator(".entry-grid").first().locator(":scope > *").count()).toBe(6);
  await page.screenshot({ path: testInfo.outputPath("desktop-record-error.png") });
});

test("manifest failure is journal-scoped and is not represented as empty", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/links.txt", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  await expect(page.locator(".journal-message")).toContainText("published link manifest is missing");
  await expect(page.locator(".empty-message")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("desktop-manifest-error.png") });
});

test("preview failure remains inside its card and metadata remains usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/lnk/Demo0001/preview.jpg", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.goto("/");
  const card = page.locator('.entry-card[data-id="Demo0001"]');
  await expect(card.locator(".preview-failed")).toHaveText("Preview unavailable");
  await expect(card.locator("h2")).toBeVisible();
  await expect(card.locator(".entry-host")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-preview-error.png") });
});

test("loading placeholders preserve final grid geometry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route(/\/lnk\/Demo\d{4}\/index\.html$/, async (route) => { await new Promise((resolve) => setTimeout(resolve, 650)); await route.continue(); });
  await page.goto("/");
  await expect(page.locator(".is-loading")).toHaveCount(12);
  expect(await page.locator(".entry-grid").first().locator(":scope > *").count()).toBe(6);
  await page.screenshot({ path: testInfo.outputPath("desktop-loading.png") });
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
});

test("a page turn has one attached planar sheet at its intermediate state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(210);
  await expect(page.locator(".turning-sheet")).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath("desktop-turn-mid.png") });
  await page.waitForTimeout(350);
  await expect(page.locator(".turning-sheet")).toHaveCount(0);
});

test("desktop camera remains bounded and constrained composition stays readable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  for (let index = 0; index < 8; index += 1) await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: 100, ctrlKey: true });
  const minimum = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  await page.screenshot({ path: testInfo.outputPath("desktop-zoom-out.png") });
  for (let index = 0; index < 20; index += 1) await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: -100, ctrlKey: true });
  const maximum = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  expect(maximum).toBeGreaterThan(minimum);
  await page.setViewportSize({ width: 720, height: 560 });
  await expect(page.locator(".journal-page")).toHaveCount(1);
  await expect(page.locator(".entry-card h2").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-constrained.png") });
});

test("mobile pinch zoom and horizontal page intent remain distinct", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(6);
  const before = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 120, clientY: 300 }, { clientX: 220, clientY: 300 }]);
    fire("touchmove", [{ clientX: 80, clientY: 300 }, { clientX: 260, clientY: 300 }]);
    fire("touchend", []);
  });
  const after = Number.parseFloat(await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale")));
  expect(after).toBeGreaterThan(before);
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 320, clientY: 420 }]);
    fire("touchmove", [{ clientX: 220, clientY: 425 }]);
    fire("touchend", []);
  });
  await expect(page.locator(".page-number")).toHaveText("Page 1");
  for (let index = 0; index < 8; index += 1) await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: 100, ctrlKey: true });
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 320, clientY: 420 }]);
    fire("touchmove", [{ clientX: 210, clientY: 423 }]);
    fire("touchend", []);
  });
  await page.waitForTimeout(520);
  await expect(page.locator(".page-number")).toHaveText("Page 2");
});

test("record request concurrency stays at or below six", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  let active = 0, maximum = 0;
  await page.route(/\/lnk\/Demo\d{4}\/index\.html$/, async (route) => {
    active += 1; maximum = Math.max(maximum, active);
    await new Promise((resolve) => setTimeout(resolve, 120));
    active -= 1;
    await route.continue();
  });
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  expect(maximum).toBeLessThanOrEqual(6);
});

test("stale cache is explicit after network failure and deleted IDs never resurrect", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  await page.evaluate(() => {
    const key = "lnk-journal:entry:Demo0001";
    const value = JSON.parse(localStorage.getItem(key)); value.cachedAt = Date.now() - 3_600_001; localStorage.setItem(key, JSON.stringify(value));
  });
  await page.route("**/lnk/Demo0001/index.html", (route) => route.abort("failed"));
  await page.reload();
  await expect(page.locator('.entry-card[data-id="Demo0001"] .cached-badge')).toHaveText("Cached");
  await page.unroute("**/lnk/Demo0001/index.html");
  const idsWithoutFirst = Array.from({ length: 24 }, (_, index) => `Demo${String(index + 2).padStart(4, "0")}`).join("\n") + "\n";
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: idsWithoutFirst }));
  await page.reload();
  await expect(page.locator('.entry-card[data-id="Demo0001"]')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("lnk-journal:entry:Demo0001"))).toBeNull();
});

test("persistent cache denial degrades to memory without blocking the journal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const warnings = [];
  page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } }));
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  expect(warnings.some((message) => message.includes("Persistent journal cache is unavailable"))).toBeTruthy();
});

test("malformed manifest is reported at journal scope", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "Demo0001\nbad/id\n" }));
  await page.goto("/");
  await expect(page.locator(".journal-message")).toContainText("journal data is invalid");
  await expect(page.locator(".entry-card")).toHaveCount(0);
});

test("generated redirect HTML navigates while metadata remains in source", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const target = "http://127.0.0.1:4173/capture/article";
  const html = generateRecordHtml({ id: "Test0001", targetUrl: target, createdAt: "2026-08-16T12:00:00Z", title: "Redirect Test", description: "Static redirect document", shortUrl: "http://127.0.0.1:4173/lnk/Test0001/", previewUrl: "http://127.0.0.1:4173/lnk/Test0001/preview.jpg" });
  expect(html).toContain('name="lnk:target"');
  await page.setContent(html, { waitUntil: "domcontentloaded" }).catch(() => {});
  await expect(page).toHaveURL(target);
});

test("empty and partial archives retain physical page geometry without phantom logical pages", async ({ page }, testInfo) => {
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: "" }));
  await page.goto("/");
  await expect(page.locator(".empty-message")).toHaveText("The journal is empty.");
  await expect(page.locator(".journal-page")).toHaveCount(testInfo.project.name === "desktop" ? 2 : 1);
  await page.unroute("**/links.txt");
  await page.reload();
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  if (testInfo.project.name === "desktop") {
    await page.keyboard.press("PageDown"); await page.waitForTimeout(520);
    await page.keyboard.press("PageDown"); await page.waitForTimeout(520);
    await expect(page.locator(".page-number")).toHaveCount(1);
    await expect(page.locator(".page-number")).toHaveText("Page 5");
    await expect(page.locator('.entry-card[data-id="Demo0025"]')).toBeVisible();
    expect(await page.locator(".journal-page").first().locator(".empty-slot").count()).toBe(5);
    await expect(page.locator(".journal-page").last()).toHaveClass(/blank-page/);
  }
});
