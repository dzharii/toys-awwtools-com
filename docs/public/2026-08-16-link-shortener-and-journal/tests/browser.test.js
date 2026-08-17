import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { generateRecordHtml } from "../shared/core.js";
import { ROOT } from "../scripts/repository.mjs";

test("site identity metadata and social artwork are complete", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Link Journal — Saved, Visually");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Saved links, remembered visually.");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/assets\/social-preview\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "assets/favicon.svg");
  const dimensions = await page.evaluate(() => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = "assets/social-preview.png";
  }));
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});

test("journal loads records in fixed pages and keeps cards usable", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".journal-page")).toHaveCount(testInfo.project.name === "desktop" ? 2 : 1);
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(testInfo.project.name === "desktop" ? 12 : 6);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
  await expect(page.locator(".entry-card h2").first()).toBeVisible();
  await expect(page.locator(".entry-description").first()).toContainText("short, useful memory cue");
  await expect(page.locator(".entry-host").first()).toContainText("example.com");
  await expect(page.locator(".entry-card time").first()).toContainText("Added");
  await expect(page.locator(".entry-card").first()).toHaveAttribute("target", "_blank");
  await expect(page.locator(".entry-card").first()).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.locator('.entry-card[data-id="Demo0004"] .entry-description')).toHaveCount(0);
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

test("visible side controls share page-turn logic and expose correct boundaries", async ({ page }, testInfo) => {
  await page.goto("/");
  const previous = page.getByRole("button", { name: "Previous pages" });
  const next = page.getByRole("button", { name: "Next pages" });
  await expect(previous).toBeVisible();
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await next.hover();
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-controls-hover.png`) });
  await next.focus();
  await expect(next).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-controls-focus.png`) });
  await next.dispatchEvent("pointerdown", { pointerId: 77, pointerType: "mouse", button: 0 });
  await expect(page.locator("#viewport")).not.toHaveClass(/is-pan-armed|is-panning/);
  await next.click();
  await next.click({ force: true });
  await page.waitForTimeout(540);
  await expect(page.locator(".page-number").first()).toHaveText(testInfo.project.name === "desktop" ? "Page 3" : "Page 2");
  await expect(previous).toBeEnabled();
  await expect(next).toBeEnabled();
  const lastPage = testInfo.project.name === "desktop" ? 5 : 5;
  while (Number((await page.locator(".page-number").first().textContent()).replace(/\D/g, "")) < lastPage) {
    await next.click();
    await page.waitForTimeout(520);
  }
  await expect(page.locator(".page-number").first()).toHaveText("Page 5");
  await expect(previous).toBeEnabled();
  await expect(next).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-controls-last-page.png`) });
});

test("wheel gestures remain browser-owned and no custom zoom UI or state remains", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)").first()).toBeVisible();
  const before = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  await page.mouse.wheel(0, 700);
  await expect(page.locator(".page-number").first()).toHaveText("Page 1");
  const allowed = await page.evaluate(() => document.querySelector("#viewport").dispatchEvent(new WheelEvent("wheel", { deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true })));
  const after = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  expect(allowed).toBe(true);
  expect(after).toBe(before);
  await expect(page.locator(".zoom-hint")).toHaveCount(0);
});

test("a normal card click opens exactly one new tab", async ({ page }, testInfo) => {
  await page.goto("/");
  const context = page.context();
  const pagesBefore = context.pages().length;
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.locator(".entry-card").first().click({ noWaitAfter: true })
  ]);
  expect(context.pages().length).toBe(pagesBefore + 1);
  await popup.close();
});

test("Copy short URL writes the exact short URL without activating the card", async ({ page, context }, testInfo) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:4173" });
  await page.goto("/");
  const card = page.locator('.entry-card[data-id="Demo0001"]');
  const copy = page.locator('.entry-record[data-id="Demo0001"] .copy-short-url');
  await expect(copy).toHaveText("Copy short URL");
  await expect(copy.locator("xpath=ancestor::a")).toHaveCount(0);
  await copy.focus();
  await expect(copy).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-copy-focus.png`) });
  const pagesBefore = context.pages().length;
  await copy.dispatchEvent("pointerdown", { pointerId: 88, pointerType: "mouse", button: 0 });
  await expect(page.locator("#viewport")).not.toHaveClass(/is-pan-armed|is-panning/);
  await copy.click();
  await expect(copy).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("http://127.0.0.1:4173/lnk/Demo0001/");
  expect(context.pages().length).toBe(pagesBefore);
  await expect(card).toHaveAttribute("href", "https://example.com/articles/1");
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-copy-success.png`) });
  await expect(copy).toHaveText("Copy short URL", { timeout: 2500 });
});

test("clipboard failure is visible, recoverable, and leaves the card usable", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const warnings = [];
  page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new DOMException("blocked", "NotAllowedError")) } }));
  await page.goto("/");
  const copy = page.locator('.entry-record[data-id="Demo0001"] .copy-short-url');
  const pagesBefore = context.pages().length;
  await copy.click();
  await expect(copy).toHaveText("Copy failed");
  expect(context.pages().length).toBe(pagesBefore);
  expect(warnings.some((message) => message.includes("JOURNAL_CLIPBOARD_WRITE_FAILED") && message.includes("Demo0001"))).toBeTruthy();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { globalThis.__copiedShortUrl = value; } } }));
  await copy.click();
  await expect(copy).toHaveText("Copied");
  expect(await page.evaluate(() => globalThis.__copiedShortUrl)).toBe("http://127.0.0.1:4173/lnk/Demo0001/");
  await page.screenshot({ path: testInfo.outputPath("desktop-copy-recovered.png") });
});

test("pan and link hit testing remain usable at browser page-scale values", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  const context = page.context();
  const session = await context.newCDPSession(page);
  for (const pageScaleFactor of [1.25, 1.5]) {
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor });
    expect(await page.evaluate(() => visualViewport.scale)).toBeCloseTo(pageScaleFactor, 1);
    const card = page.locator(".entry-card").first();
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * .45, box.y + box.height * .65);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .45 + 28, box.y + box.height * .65 + 12, { steps: 4 });
    await page.mouse.up();
    expect(await page.evaluate(() => getSelection().toString())).toBe("");
    const [popup] = await Promise.all([context.waitForEvent("page"), card.click({ noWaitAfter: true })]);
    await popup.close();
  }
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
});

test("panning never selects text and suppresses only its own card click", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  const card = page.locator(".entry-card").first();
  await expect(card).toBeVisible();
  const context = page.context();
  const pagesBefore = context.pages().length;
  for (const origin of [card.locator(".preview-frame"), card.locator("h2"), card.locator(".entry-description"), card.locator(".entry-host"), card.locator("time"), page.locator(".page-header").first()]) {
    const box = await origin.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(page.locator("#viewport")).toHaveClass(/is-pan-armed/);
    await page.mouse.move(box.x + box.width / 2 + 24, box.y + box.height / 2 + 11, { steps: 4 });
    await expect(page.locator("#viewport")).toHaveClass(/is-panning/);
    expect(await page.evaluate(() => getSelection().toString())).toBe("");
    await page.mouse.up();
    await expect(page.locator("#viewport")).not.toHaveClass(/is-pan-armed|is-panning/);
  }
  await page.mouse.move(20, 420);
  await page.mouse.down();
  await page.mouse.move(45, 432, { steps: 4 });
  await expect(page.locator("#viewport")).toHaveClass(/is-panning/);
  await page.mouse.up();
  await page.waitForTimeout(60);
  expect(context.pages().length).toBe(pagesBefore);
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    card.click({ noWaitAfter: true })
  ]);
  expect(context.pages().length).toBe(pagesBefore + 1);
  await popup.close();
  expect(await card.getAttribute("data-drag-suppressed")).toBeNull();
});

test("pan-armed selection suppression always cleans up on cancellation paths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await page.evaluate(() => document.querySelector(".entry-card h2").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 404, pointerType: "mouse", button: 0 })));
  await expect(page.locator("#viewport")).toHaveClass(/is-pan-armed/);
  await page.evaluate(() => document.querySelector("#viewport").dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: 404, pointerType: "mouse" })));
  await expect(page.locator("#viewport")).not.toHaveClass(/is-pan-armed|is-panning/);
  await page.evaluate(() => document.querySelector(".entry-card h2").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 405, pointerType: "mouse", button: 0 })));
  await expect(page.locator("#viewport")).toHaveClass(/is-pan-armed/);
  await page.evaluate(() => document.querySelector("#viewport").dispatchEvent(new PointerEvent("lostpointercapture", { bubbles: true, pointerId: 405, pointerType: "mouse" })));
  await expect(page.locator("#viewport")).not.toHaveClass(/is-pan-armed|is-panning/);
});

test("descriptions clamp to two lines without changing fixed card geometry", async ({ page }, testInfo) => {
  await page.goto("/");
  const longDescription = page.locator('.entry-card[data-id="Demo0002"] .entry-description');
  await expect(longDescription).toBeVisible();
  const metrics = await longDescription.evaluate((element) => ({ height: element.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(element).lineHeight), scrollHeight: element.scrollHeight, textLength: element.textContent.length }));
  expect(metrics.textLength).toBeGreaterThan(200);
  expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 2 + 1);
  const cardHeights = await page.locator(".entry-grid").first().locator(":scope > *").evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().height)));
  expect(new Set(cardHeights).size).toBe(1);
  await page.screenshot({ path: testInfo.outputPath(`${testInfo.project.name}-descriptions.png`) });
});

test("the required YouTube record renders its thumbnail and metadata in the journal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const ids = (await readFile(path.join(ROOT, "links.txt"), "utf8")).trim().split(/\s+/);
  let fixture;
  for (const id of ids) {
    const html = await readFile(path.join(ROOT, "lnk", id, "index.html"), "utf8");
    if (html.includes("https://www.youtube.com/watch?v=un_O5WrZDNc")) { fixture = { id, html }; break; }
  }
  expect(fixture).toBeTruthy();
  const localBase = `http://127.0.0.1:4173/lnk/${fixture.id}/`;
  const localHtml = fixture.html.replace(/https:\/\/toys\.awwtools\.com\/public\/2026-08-16-link-shortener-and-journal\/lnk\/[A-Za-z0-9]{8}\//g, localBase);
  await page.route("**/links.txt", (route) => route.fulfill({ status: 200, contentType: "text/plain", body: `${fixture.id}\n` }));
  await page.route(`**/lnk/${fixture.id}/index.html`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: localHtml }));
  await page.goto("/");
  const card = page.locator(`.entry-card[data-id="${fixture.id}"]`);
  await expect(card.locator("h2")).toContainText("The Prodigy");
  await expect(card.locator(".entry-description")).toContainText("British dance act");
  await expect(card).toHaveAttribute("href", "https://www.youtube.com/watch?v=un_O5WrZDNc");
  await expect(card.locator("img")).toBeVisible();
  expect(await card.locator("img").evaluate((image) => ({ width: image.naturalWidth, height: image.naturalHeight }))).toEqual({ width: 1200, height: 630 });
  await page.screenshot({ path: testInfo.outputPath("desktop-youtube-entry.png") });
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

test("constrained composition stays readable without application zoom state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(12);
  const before = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  await page.locator("#journal-scene").dispatchEvent("wheel", { deltaY: 100, ctrlKey: true });
  const after = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  expect(after).toBe(before);
  await page.setViewportSize({ width: 720, height: 560 });
  await expect(page.locator(".journal-page")).toHaveCount(1);
  await expect(page.locator(".entry-card h2").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-constrained.png") });
});

test("mobile browser gestures and intentional horizontal page intent remain distinct", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await expect(page.locator(".entry-card:not(.is-loading)")).toHaveCount(6);
  const before = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 120, clientY: 300 }, { clientX: 220, clientY: 300 }]);
    fire("touchmove", [{ clientX: 80, clientY: 300 }, { clientX: 260, clientY: 300 }]);
    fire("touchend", []);
  });
  const after = await page.locator("#journal-scene").evaluate((element) => getComputedStyle(element).getPropertyValue("--camera-scale"));
  expect(after).toBe(before);
  await page.evaluate(() => {
    const target = document.querySelector("#viewport");
    const fire = (type, touches) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "touches", { value: touches }); target.dispatchEvent(event); };
    fire("touchstart", [{ clientX: 320, clientY: 420 }]);
    fire("touchmove", [{ clientX: 220, clientY: 425 }]);
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
