// Dependency-tolerant smoke runner for the E Ink reader.
//
// Why this exists alongside tests/playwright/reader.spec.js:
//   The Playwright specs use the standard `@playwright/test` runner, which is
//   the portable, canonical way to run the suite (npm i -D @playwright/test &&
//   npx playwright test). Some environments only have the `playwright` LIBRARY
//   available (not the test-runner package). This script drives the same core
//   assertions using whichever `playwright` build can be resolved, so the
//   acceptance-critical behaviors can always be verified without installing
//   extra packages or adding node_modules to this static project.
//
// Usage (from the project root):
//   node scripts/serve-static.mjs 8123        # in one terminal
//   node tests/smoke.mjs                       # in another
// Or point at an existing server:
//   BASE_URL=http://localhost:8123 node tests/smoke.mjs

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const FX = join(here, "fixtures");
const fx = (n) => join(FX, n);
const BASE = process.env.BASE_URL || "http://localhost:8123";

async function loadPlaywright() {
  // Try normal resolution first, then the global npm root.
  try {
    return await import("playwright");
  } catch (_) {
    try {
      const root = execSync("npm root -g").toString().trim();
      const req = createRequire(join(root, "noop.js"));
      return req("playwright");
    } catch (err) {
      console.error("Playwright library not found. Install it or run the");
      console.error("standard suite with @playwright/test. Skipping smoke run.");
      process.exit(3);
    }
  }
}

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  -> " + JSON.stringify(detail)}`);
}

async function open(page, name) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => !!window.__einkReader);
  await page.setInputFiles("#file-input", fx(name));
}

async function main() {
  const { chromium } = await loadPlaywright();
  const external = [];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(BASE) && !u.startsWith("data:") && !u.startsWith("blob:")) external.push(u);
  });

  // TXT + reader visible
  await open(page, "simple.txt");
  check("TXT opens and shows reader", await page.isVisible("#reader"));

  // Stable pagination
  await open(page, "long-book.txt");
  await page.waitForTimeout(1200);
  const c1 = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  await page.evaluate(() => window.__einkReader.relayoutPreserving("full"));
  await page.waitForTimeout(700);
  const c2 = await page.evaluate(() => window.__einkReader.paginator.pageCount);
  check("Pagination is stable across re-measure", c1 > 5 && c1 === c2, { c1, c2 });

  // Page navigation
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  const fwd = await page.evaluate(() => window.__einkReader.paginator.index);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => window.__einkReader.paginator.index);
  check("Page navigation forward/back", fwd === 1 && back === 0, { fwd, back });

  // Scroll mode
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ readerMode: "scroll" }));
  await page.waitForTimeout(800);
  const scrolled = await page.evaluate(() => {
    const s = document.getElementById("reader-stage");
    s.scrollTop = 2000;
    return s.scrollTop;
  });
  check("Scroll mode scrolls", scrolled > 0, { scrolled });

  // Markdown safety
  await open(page, "markdown-edge-cases.md");
  await page.waitForTimeout(900);
  const xss = await page.evaluate(() => window.__xssExecuted === true);
  const scriptEl = await page.evaluate(() => !!document.querySelector("#page-viewport script, #reader-scroll script"));
  check("Markdown XSS blocked, no script element", !xss && !scriptEl, { xss, scriptEl });

  // Code block containment
  await open(page, "code-heavy.md");
  await page.waitForTimeout(900);
  const overflowX = await page.evaluate(() => { const p = document.querySelector("pre"); return p ? getComputedStyle(p).overflowX : null; });
  check("Code blocks contain overflow", overflowX === "auto" || overflowX === "scroll", { overflowX });

  // Empty file message
  await open(page, "empty.txt");
  await page.waitForTimeout(500);
  const emptyNotice = (await page.textContent("#open-notice")) || "";
  check("Empty file shows calm message", /empty/i.test(emptyNotice) && (await page.evaluate(() => document.getElementById("reader").hidden)), { emptyNotice });

  // Unsupported file message
  await open(page, "unsupported.pdf");
  await page.waitForTimeout(500);
  const unsupNotice = (await page.textContent("#open-notice")) || "";
  check("Unsupported file rejected with guidance", /supported/i.test(unsupNotice), { unsupNotice });

  // Persistence: prefs persist, book does not
  await open(page, "simple.md");
  await page.waitForTimeout(700);
  await page.evaluate(() => window.__einkReader.onPreferenceChange({ theme: "dark" }));
  await page.waitForTimeout(300);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  const store = await page.evaluate(() => JSON.stringify(localStorage));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const themeAfter = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  const readerHidden = await page.evaluate(() => document.getElementById("reader").hidden);
  check(
    "Prefs persist, book content does not",
    keys.length === 1 && keys[0] === "eink-reader:preferences" && !store.includes("Calm Reading") && themeAfter === "dark" && readerHidden,
    { keys, themeAfter, readerHidden }
  );

  // No external network requests across the whole run
  check("No external network requests", external.length === 0, { external });

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error("Smoke run error:", e);
  process.exit(1);
});
