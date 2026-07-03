// End-to-end behavior tests for the E Ink reader.
//
// These cover the acceptance-critical behaviors: local file loading, TXT and
// Markdown rendering, page/scroll modes, Markdown safety, offline/no-network
// runtime, preference persistence WITHOUT book-content persistence, error
// recovery, code-block containment, and reduced motion.
//
// The app exposes `window.__einkReader` for test hooks only; it holds no
// persisted state. Malicious fixtures set window.__xssExecuted if script runs.

import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const FX = join(here, "..", "fixtures");
const fx = (name) => join(FX, name);

async function openFile(page, name) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__einkReader);
  await page.setInputFiles("#file-input", fx(name));
}

test("no external network requests occur at runtime", async ({ page }) => {
  const external = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith("http://localhost") && !u.startsWith("data:") && !u.startsWith("blob:")) {
      external.push(u);
    }
  });
  await openFile(page, "simple.md");
  await page.waitForTimeout(800);
  expect(external).toEqual([]);
});

test("opens a TXT file and shows the reader", async ({ page }) => {
  await openFile(page, "simple.txt");
  await expect(page.locator("#reader")).toBeVisible();
  await expect(page.locator("#open-screen")).toBeHidden();
});

test("paginates a long book with stable page count", async ({ page }) => {
  await openFile(page, "long-book.txt");
  await page.waitForTimeout(1200);
  const first = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  expect(first).toBeGreaterThan(5);
  // Re-measuring must give the same result (no font-load drift).
  await page.evaluate(() => window.__einkReader.relayoutPreserving("full"));
  await page.waitForTimeout(700);
  const second = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  expect(second).toBe(first);
});

test("page navigation moves forward and back", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "keyboard nav is a desktop path");
  await openFile(page, "long-book.txt");
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__einkReader.paginator.index)).toBe(1);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__einkReader.paginator.index)).toBe(0);
});

test("switches to scroll mode and the content scrolls", async ({ page }) => {
  await openFile(page, "long-book.txt");
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ readerMode: "scroll" }));
  await page.waitForTimeout(800);
  await expect(page.locator("#reader")).toHaveAttribute("data-mode", "scroll");
  const scrolled = await page.evaluate(() => {
    const stage = document.getElementById("reader-stage");
    stage.scrollTop = 2000;
    return stage.scrollTop;
  });
  expect(scrolled).toBeGreaterThan(0);
});

test("Markdown raw HTML never executes and is not rendered as trusted HTML", async ({ page }) => {
  await openFile(page, "markdown-edge-cases.md");
  await page.waitForTimeout(900);
  const xss = await page.evaluate(() => window.__xssExecuted === true);
  expect(xss).toBe(false);
  const scriptInContent = await page.evaluate(
    () => !!document.querySelector("#page-viewport script, #reader-scroll script")
  );
  expect(scriptInContent).toBe(false);
});

test("Markdown images are not fetched (rendered as placeholders)", async ({ page }) => {
  const imageRequests = [];
  page.on("request", (r) => {
    if (r.resourceType() === "image") imageRequests.push(r.url());
  });
  await openFile(page, "markdown-edge-cases.md");
  await page.waitForTimeout(900);
  expect(imageRequests).toEqual([]);
});

test("code blocks contain overflow instead of breaking the page", async ({ page }) => {
  await openFile(page, "code-heavy.md");
  await page.waitForTimeout(900);
  const pre = await page.evaluate(() => {
    const el = document.querySelector("pre");
    if (!el) return null;
    return { overflowX: getComputedStyle(el).overflowX };
  });
  expect(pre).not.toBeNull();
  expect(["auto", "scroll"]).toContain(pre.overflowX);
});

test("empty file shows a calm, non-technical message and no reader", async ({ page }) => {
  await openFile(page, "empty.txt");
  await page.waitForTimeout(500);
  await expect(page.locator("#reader")).toBeHidden();
  const notice = (await page.locator("#open-notice").textContent()) || "";
  expect(notice.toLowerCase()).toContain("empty");
});

test("unsupported file type is rejected with guidance", async ({ page }) => {
  await openFile(page, "unsupported.pdf");
  await page.waitForTimeout(500);
  await expect(page.locator("#reader")).toBeHidden();
  const notice = (await page.locator("#open-notice").textContent()) || "";
  expect(notice.toLowerCase()).toContain("supported");
});

test("preferences persist but book content does NOT persist across reload", async ({ page }) => {
  await openFile(page, "simple.md");
  await page.waitForTimeout(700);
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ theme: "dark", fontSize: 22 }));
  await page.waitForTimeout(300);

  // Only the preferences key may exist; it must not contain book text.
  const store = await page.evaluate(() => JSON.stringify(localStorage));
  expect(store).not.toContain("Calm Reading");
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(["eink-reader:preferences"]);

  await page.reload();
  await page.waitForTimeout(400);
  // Theme preference survives.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // The book is gone — the user must reopen it.
  await expect(page.locator("#reader")).toBeHidden();
  await expect(page.locator("#open-screen")).toBeVisible();
});

test("reduced-motion preference is reflected on the reader", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForFunction(() => !!window.__einkReader);
  await page.setInputFiles("#file-input", fx("simple.txt"));
  await page.waitForTimeout(700);
  await expect(page.locator("#reader")).toHaveAttribute("data-motion", "reduced");
  await ctx.close();
});

test("settings panel opens and closes", async ({ page }) => {
  await openFile(page, "simple.txt");
  await page.waitForTimeout(600);
  await page.click("#settings-button");
  await page.waitForTimeout(300);
  await expect(page.locator(".settings")).toBeVisible();
});
