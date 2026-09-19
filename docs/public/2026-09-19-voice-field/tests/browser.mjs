import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const globalModules = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
const { chromium } = require(resolve(globalModules, "playwright"));
const root = resolve(import.meta.dirname, "..");
const screenshots = resolve(root, "tests/screenshots");
await mkdir(screenshots, { recursive: true });

const port = 4174;
const server = spawn("python3", ["-m", "http.server", String(port), "-d", "dist"], { cwd: root, stdio: "ignore" });
const baseUrl = `http://127.0.0.1:${port}`;

for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    const response = await fetch(baseUrl);
    if (response.ok) break;
  } catch {}
  await new Promise((resolveWait) => setTimeout(resolveWait, 100));
}

const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.voiceFieldDebug));

  const publishedUrl = "https://toys.awwtools.com/public/2026-09-19-voice-field/dist/";
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), publishedUrl);
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute("content"), publishedUrl);
  assert.equal(await page.locator('meta[property="og:image"]').getAttribute("content"), `${publishedUrl}assets/social-open-graph-1200x630.jpg`);
  assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute("content"), `${publishedUrl}assets/social-x-1200x675.jpg`);
  assert.equal((await page.request.get(`${baseUrl}/assets/favicon-32x32.jpg`)).ok(), true, "Favicon should be included in dist");
  assert.equal((await page.request.get(`${baseUrl}/assets/social-open-graph-1200x630.jpg`)).ok(), true, "Social preview should be included in dist");

  assert.equal(await page.locator("#stage").evaluate((element) => element.textContent.trim()), "", "The Stage must contain no text");
  assert.equal(await page.locator(".preset-card").count(), 11, "All curated presets should be exposed");
  assert.equal(await page.locator(".palette-chip").count(), 11, "Every source palette should be selectable");

  const assertRatio = async (ratio, expected) => {
    await page.locator(`[data-ratio="${ratio}"]`).click();
    await page.waitForFunction((target) => {
      const bounds = document.querySelector("#stage").getBoundingClientRect();
      return Math.abs(bounds.width / bounds.height - target) < 0.025;
    }, expected, { timeout: 3500 });
    const box = await page.locator("#stage").boundingBox();
    assert.ok(Math.abs(box.width / box.height - expected) < 0.025, `${ratio} Stage ratio should be exact`);
    assert.equal(await page.locator("#stage").evaluate((element) => element.textContent.trim()), "");
  };
  await assertRatio("1:1", 1);
  await assertRatio("9:16", 9 / 16);
  await assertRatio("16:9", 16 / 9);

  await page.selectOption("#preset-select", "chrome");
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).preset, "chrome");
  await page.waitForTimeout(80);
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).transition.active, true, "Preset changes should begin a Scene Transition");

  await page.locator('[data-palette="ember"]').click();
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).palette, "ember");
  await page.locator("#energy").fill("0.21");
  assert.equal(await page.locator("[data-control=energy] output").textContent(), "0.21");
  await page.locator("#trace-style").selectOption("poles");
  await page.locator(".toggle-field").click();
  assert.equal(await page.locator("#trace-enabled").isChecked(), false);
  await page.locator("#reset-button").click();
  assert.equal(await page.locator("#trace-enabled").isChecked(), true, "Reset should restore Preset values");

  await page.evaluate(() => window.voiceFieldDebug.injectAudio({ envelope: 0.8, energy: 0.8, low: 0.67, mid: 0.74, high: 0.42, impulse: 0.86, phraseActivity: 0.71, silenceMs: 0 }));
  await page.waitForTimeout(220);
  assert.ok((await page.evaluate(() => window.voiceFieldDebug.snapshot())).impulseCount > 0, "Synthetic speech should create a persistent impulse");
  await page.screenshot({ path: resolve(screenshots, "standard-1920x1080.png"), fullPage: true });

  await page.setViewportSize({ width: 1120, height: 800 });
  await page.waitForTimeout(180);
  assert.equal(await page.locator(".wide-panel").first().isVisible(), false);
  assert.ok(await page.locator("#stage").isVisible());
  await page.screenshot({ path: resolve(screenshots, "compact-1120x800.png"), fullPage: true });

  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.waitForTimeout(180);
  assert.equal(await page.locator(".preset-panel").isVisible(), true, "Wide Desktop should reveal the Preset browser");
  assert.equal(await page.locator(".advanced-panel").isVisible(), true, "Wide Desktop should reveal advanced scene information");
  const wideStage = await page.locator("#stage").boundingBox();
  assert.ok(wideStage.width < 1200, "Wide Desktop should not stretch the Stage without limit");
  await page.screenshot({ path: resolve(screenshots, "wide-2560x1080.png"), fullPage: true });

  for (const preset of ["aurora", "membrane", "ocean", "nebula", "particles", "ember", "forest", "void"]) {
    await page.evaluate((id) => window.voiceFieldDebug.selectPreset(id), preset);
    await page.waitForTimeout(45);
    const snapshot = await page.evaluate(() => window.voiceFieldDebug.snapshot());
    assert.equal(snapshot.preset, preset);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(220);
  await page.locator('[data-ratio="9:16"]').click();
  await page.waitForFunction(() => {
    const bounds = document.querySelector("#stage").getBoundingClientRect();
    return Math.abs(bounds.width / bounds.height - 9 / 16) < 0.025;
  });
  assert.equal(await page.locator(".primary-panel").isVisible(), true, "Compose Mode should expose controls");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390, "Mobile Compose should not overflow horizontally");
  const mobileSlider = await page.locator("#voiceInfluence").boundingBox();
  await page.mouse.move(mobileSlider.x + mobileSlider.width * 0.75, mobileSlider.y + mobileSlider.height / 2);
  await page.mouse.down();
  await page.mouse.move(mobileSlider.x + mobileSlider.width * 0.25, mobileSlider.y + mobileSlider.height / 2, { steps: 5 });
  await page.mouse.up();
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).mobileMode, "compose", "Slider drags must not become mode swipes");
  await page.screenshot({ path: resolve(screenshots, "mobile-compose-390x844.png"), fullPage: true });
  const mobileStage = await page.locator("#stage").boundingBox();
  await page.locator("#field-canvas").evaluate((canvas, bounds) => {
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 7, clientX: bounds.x + bounds.width * 0.8, clientY: bounds.y + bounds.height * 0.5 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 7, clientX: bounds.x + bounds.width * 0.18, clientY: bounds.y + bounds.height * 0.5 }));
  }, mobileStage);
  await page.waitForTimeout(120);
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).mobileMode, "performance", "Horizontal swipe should enter Performance Mode");
  assert.equal(await page.locator(".primary-panel").isVisible(), false);
  assert.equal(await page.locator("#stage").evaluate((element) => element.textContent.trim()), "");
  await page.waitForTimeout(620);
  const performanceStage = await page.locator("#stage").boundingBox();
  assert.ok(performanceStage.x >= -1 && performanceStage.x + performanceStage.width <= 391, "Performance Stage should remain inside the viewport");
  await page.screenshot({ path: resolve(screenshots, "mobile-performance-390x844.png") });
  await page.locator("#field-canvas").evaluate((canvas, bounds) => {
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 8, clientX: bounds.x + bounds.width * 0.2, clientY: bounds.y + bounds.height * 0.5 }));
    canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 8, clientX: bounds.x + bounds.width * 0.82, clientY: bounds.y + bounds.height * 0.5 }));
  }, performanceStage);
  await page.waitForTimeout(120);
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).mobileMode, "compose", "A second horizontal swipe should return to Compose Mode");
  await page.locator("#performance-button").click();
  await page.waitForTimeout(120);
  const exitStage = await page.locator("#stage").boundingBox();
  await page.mouse.click(exitStage.x + exitStage.width / 2, exitStage.y + exitStage.height / 2);
  await page.locator("#performance-exit").click();
  assert.equal((await page.evaluate(() => window.voiceFieldDebug.snapshot())).mobileMode, "compose");

  const deniedContext = await browser.newContext({ viewport: { width: 900, height: 700 } });
  await deniedContext.addInitScript(() => {
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("Permission denied", "NotAllowedError"); };
  });
  const deniedPage = await deniedContext.newPage();
  await deniedPage.goto(baseUrl);
  await deniedPage.locator("#mic-button").click();
  await deniedPage.waitForTimeout(100);
  assert.match(await deniedPage.locator("#mic-state strong").textContent(), /unavailable/i);
  assert.equal(await deniedPage.locator("#stage").isVisible(), true, "Permission denial should leave Idle Motion available");
  await deniedContext.close();

  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  console.log("Browser validation passed for dist: metadata, startup, controls, ratios, responsive layouts, swipe, audio injection, permission denial, and text-free Stage.");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
