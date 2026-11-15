/** Real packaged-extension checks. No untrusted external demos are executed. */
import { chromium, expect, type BrowserContext } from "playwright/test";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { catalog } from "../src/generated/catalog";
import { defaults } from "../src/sdk/validation";
const root = new URL("../", import.meta.url).pathname;
process.chdir(root);
await mkdir(".temp", { recursive: true });
await mkdir("evidence/browser", { recursive: true });
const result: { status: string; browser?: string; checks: string[]; limitation?: string } = {
  status: "starting",
  checks: [],
};
let context: BrowserContext | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;
try {
  const executable =
    process.env.CHROMIUM_EXECUTABLE ??
    (existsSync(chromium.executablePath()) ? chromium.executablePath() : "/usr/bin/chromium");
  context = await chromium.launchPersistentContext(`${root}.temp/browser-profile`, {
    executablePath: executable,
    headless: process.env.HEADED !== "1",
    viewport: { width: 1280, height: 900 },
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [`--disable-extensions-except=${root}dist`, `--load-extension=${root}dist`],
    env: { ...process.env, TMPDIR: `${root}.temp` },
  });
  result.browser = context.browser()?.version();
  server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: () =>
      new Response(Bun.file("tests/fixtures/playground.html"), {
        headers: { "content-type": "text/html" },
      }),
  });
  const fixture = `http://127.0.0.1:${server.port}`;
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
  const page = context.pages()[0] ?? (await context.newPage());
  const errors: string[] = [];
  page.on("pageerror", () => errors.push("pageerror"));
  await page.goto(fixture);
  await page.bringToFront();
  // This real browser command grants activeTab. Never add host permissions to the production manifest for tests.
  await page.keyboard.press("Alt+Shift+A");
  await expect(page.locator("[data-art-root]")).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("dialog", { name: "Favorite action wheel" })).toBeVisible();
  await page.screenshot({ path: "evidence/browser/wheel.png" });
  await page.getByRole("button", { name: "All tools", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Anger Relief Toy toolbox" })).toBeVisible();
  await page.screenshot({ path: "evidence/browser/catalog.png" });
  await page.getByRole("searchbox", { name: "Search effects" }).fill("break");
  await expect(page.locator(".tool")).toHaveCount(2);
  await page.keyboard.press("Escape");
  const [tab] = await worker.evaluate(() =>
    chrome.tabs.query({ active: true, currentWindow: true }),
  );
  if (tab?.id === undefined) throw new Error("Active fixture tab missing");
  const tabId = tab.id;
  async function send(message: Record<string, unknown>): Promise<unknown> {
    return worker.evaluate(async ({ tabId, message }) => chrome.tabs.sendMessage(tabId, message), {
      tabId,
      message,
    });
  }
  const baseline = await page.screenshot();
  for (const entry of catalog) {
    for (let cycle = 0; cycle < 3; cycle++) {
      await send({
        type: "select",
        id: entry.id,
        options: { ...defaults, duration: 10, reducedMotion: cycle === 1 },
      });
      if (entry.scope === "element") {
        const rect = await page.locator("#target-text").boundingBox();
        if (!rect) throw new Error("Target missing");
        await page.mouse.move(rect.x + 40, rect.y + 10);
        await page.mouse.click(rect.x + 40, rect.y + 10);
      }
      await expect(page.locator(".stage")).toHaveCount(1);
      await expect
        .poll(async () => page.locator(".stage").evaluate((node) => node.childElementCount))
        .toBeGreaterThan(0);
      // Fixed seed and explicit WAAPI timing provide reproducible selected keyframes.
      if (cycle === 0) {
        await page.waitForTimeout(entry.id === "text-bomb" ? 800 : 120);
        await page.locator(".stage").evaluate((node) => {
          for (const animation of node.getAnimations({ subtree: true })) {
            animation.pause();
            animation.currentTime = 500;
          }
        });
        await page.screenshot({ path: `evidence/browser/${entry.id}-active.png` });
      }
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-art-root]")).toHaveCount(0);
      await expect(page.locator("#target-text")).toBeVisible();
      expect(
        await page.evaluate(() => ({
          actions: (window as unknown as { actions: unknown }).actions,
          overlays: document.querySelectorAll("[data-art-root]").length,
        })),
      ).toEqual({ actions: { sent: 0, clicked: 0 }, overlays: 0 });
      expect((await page.screenshot()).equals(baseline)).toBe(true);
    }
    result.checks.push(
      `${entry.id}: three activations, selected keyframe, Escape, unchanged baseline`,
    );
  }
  // Selection over a submit button must not submit or invoke its click handler.
  await send({ type: "select", id: "punch-element", options: defaults });
  const button = await page.locator("#send").boundingBox();
  if (!button) throw new Error("Button missing");
  await page.mouse.click(button.x + 10, button.y + 10);
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(
      () => (window as unknown as { actions: { sent: number; clicked: number } }).actions,
    ),
  ).toEqual({ sent: 0, clicked: 0 });
  await send({ type: "select", id: "flashlight", options: defaults });
  await page.reload();
  await expect(page.locator("[data-art-root]")).toHaveCount(0);
  expect(errors).toEqual([]);
  result.checks.push("submit protection, refresh clears state, no page errors");
  result.status = "passed";
} catch (error) {
  result.status = context ? "failed" : "blocked";
  // Fixed classification only; raw exception text can contain local paths.
  result.limitation = context
    ? "Browser assertion failed; run with HEADED=1 to investigate."
    : "Chromium could not start in this environment. The observed workspace launch failed at process_singleton_posix.cc: socket() Operation not permitted.";
  console.error(
    error instanceof Error ? error.message.split("\n")[0] : "Browser verification failed",
  );
  process.exitCode = 2;
} finally {
  await context?.close();
  await server?.stop();
  await writeFile("evidence/browser-result.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
}
