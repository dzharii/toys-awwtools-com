/** Native packaged-extension suite. Generated concepts are never used as screenshot evidence. */
import { chromium, expect, type BrowserContext, type Page } from "playwright/test";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { catalog } from "../src/generated/catalog";
import { defaults } from "../src/sdk/validation";
const root = new URL("../", import.meta.url).pathname;
process.chdir(root);
await mkdir(".temp", { recursive: true });
await mkdir("evidence/003/browser", { recursive: true });
const result: { status: string; checks: string[]; limitation?: string; browser?: string } = {
  status: "starting",
  checks: [],
};
let context: BrowserContext | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;
try {
  const executable =
    process.env.CHROMIUM_EXECUTABLE ??
    (existsSync(chromium.executablePath()) ? chromium.executablePath() : "/usr/bin/chromium");
  context = await chromium.launchPersistentContext(`${root}.temp/review003-profile`, {
    executablePath: executable,
    headless: process.env.HEADED !== "1",
    viewport: { width: 920, height: 720 },
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [`--disable-extensions-except=${root}dist`, `--load-extension=${root}dist`],
    env: { ...process.env, TMPDIR: `${root}.temp` },
    recordVideo: { dir: "evidence/003/browser/video", size: { width: 920, height: 720 } },
  });
  result.browser = context.browser()?.version();
  server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: () =>
      new Response(Bun.file("tests/fixtures/discussion.html"), {
        headers: { "content-type": "text/html" },
      }),
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
  const page = context.pages()[0] ?? (await context.newPage());
  const errors: string[] = [];
  page.on("pageerror", () => errors.push("pageerror"));
  const assigned = await worker.evaluate(async () => {
    const commands = await chrome.commands.getAll();
    return commands.find((c) => c.name === "open-wheel")?.shortcut ?? "";
  });
  if (!assigned)
    throw new Error("Assign open-wheel in the headed test profile before running this suite");
  const key = assigned
    .replace("Ctrl", "Control")
    .replace("MacCtrl", "Control")
    .replace("Command", "Meta");
  const capture = async (name: string, p: Page = page) => {
    await p.screenshot({ path: `evidence/003/browser/${name}.png` });
  };
  const open = async () => {
    await page.keyboard.press(key);
    await expect(page.getByRole("dialog", { name: "Action wheel", exact: true })).toBeVisible();
  };
  const clickTarget = async (selector: string) => {
    const rect = await page.locator(selector).boundingBox();
    if (!rect) throw new Error("Missing target");
    await page.mouse.move(rect.x + 24, rect.y + 10);
    await page.mouse.click(rect.x + 24, rect.y + 10);
  };
  for (const viewport of [
    { width: 920, height: 720 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`http://127.0.0.1:${server.port}`);
    await page.bringToFront();
    await capture(`${viewport.width}-baseline`);
    const baseline = await page.screenshot();
    await open();
    await capture(`${viewport.width}-wheel`);
    const wheel = await page.locator(".wheel").boundingBox();
    expect(wheel!.x).toBeGreaterThanOrEqual(0);
    expect(wheel!.x + wheel!.width).toBeLessThanOrEqual(viewport.width);
    await page.getByRole("button", { name: "Equip Punch", exact: true }).focus();
    await capture(`${viewport.width}-focused`);
    await page.keyboard.press("Enter");
    await expect(page.locator(".hud-name")).toHaveText("Punch");
    await capture(`${viewport.width}-equipped`);
    for (const target of ["#first", "#second", "#third"]) {
      await clickTarget(target);
      await expect(page.locator(".stage")).toHaveCount(1);
      await capture(`${viewport.width}-punch-${target.slice(1)}`);
      await expect(page.locator(".stage")).toHaveCount(0, { timeout: 5000 });
      await expect(page.locator(".hud-name")).toHaveText("Punch");
    }
    await capture(`${viewport.width}-complete-still-equipped`);
    await open();
    await page.getByRole("button", { name: "All tools", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Choose a tool", exact: true });
    await expect(dialog).toBeVisible();
    const rect = await dialog.boundingBox();
    expect(Math.abs(rect!.x + rect!.width / 2 - viewport.width / 2)).toBeLessThan(3);
    await capture(`${viewport.width}-catalog-centered`);
    const handle = await page.locator(".brand").boundingBox();
    await page.mouse.move(handle!.x + 40, handle!.y + 18);
    await page.mouse.down();
    await page.mouse.move(handle!.x + 110, handle!.y + 85, { steps: 10 });
    await page.mouse.up();
    const dragged = await dialog.boundingBox();
    expect(dragged!.x).not.toBe(rect!.x);
    await capture(`${viewport.width}-catalog-dragged`);
    await page.getByRole("searchbox", { name: "Search effects" }).fill("bomb");
    await page.getByRole("button", { name: "Equip Text Bomb", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    for (const target of ["#first", "#second"]) {
      await clickTarget(target);
      await page.waitForTimeout(750);
      await capture(`${viewport.width}-bomb-${target.slice(1)}`);
      await expect(page.locator(".stage")).toHaveCount(0, { timeout: 5000 });
      await expect(page.locator(".hud-name")).toHaveText("Text Bomb");
    }
    await open();
    await page.keyboard.press("Escape");
    await expect(page.locator(".hud-name")).toHaveText("Text Bomb");
    await open();
    await page.getByRole("button", { name: "Equip Flashlight", exact: true }).click();
    await capture(`${viewport.width}-flashlight-start`);
    await page.waitForTimeout(10500);
    await page.mouse.move(150, 200);
    await expect(page.locator(".stage")).toHaveCount(1);
    await capture(`${viewport.width}-flashlight-10s`);
    await open();
    await page.getByRole("button", { name: "All tools", exact: true }).click();
    await page.getByRole("button", { name: "Close tools", exact: true }).click();
    await expect(page.locator(".stage")).toHaveCount(1);
    await page.getByRole("button", { name: "Put away", exact: true }).click();
    await expect(page.locator("[data-art-root]")).toHaveCount(0);
    await capture(`${viewport.width}-after-put-away`);
    expect((await page.screenshot()).equals(baseline)).toBe(true);
    const [tab] = await worker.evaluate(() =>
      chrome.tabs.query({ active: true, currentWindow: true }),
    );
    if (tab?.id === undefined) throw new Error("No fixture tab");
    const send = async (message: Record<string, unknown>) =>
      worker.evaluate(async ({ tabId, message }) => chrome.tabs.sendMessage(tabId, message), {
        tabId: tab.id!,
        message,
      });
    for (const effect of catalog) {
      await send({ type: "select", id: effect.id, options: { ...defaults, reducedMotion: true } });
      if (effect.scope === "element") await clickTarget("#first");
      await capture(`${viewport.width}-${effect.id}-reduced`);
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-art-root]")).toHaveCount(0);
    }
    await send({ type: "select", id: "punch-element", options: defaults });
    await clickTarget("#send");
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => (window as unknown as { actions: { sent: number; clicked: number } }).actions,
      ),
    ).toEqual({ sent: 0, clicked: 0 });
    await send({ type: "select", id: "flashlight", options: defaults });
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.setViewportSize({ width: viewport.width - 30, height: viewport.height });
    await expect(page.locator(".hud-name")).toHaveText("Flashlight");
    await expect(page.locator(".stage")).toHaveCount(1);
    await page.reload();
    await expect(page.locator("[data-art-root]")).toHaveCount(0);
    result.checks.push(
      `${viewport.width}: native shortcut, three punches, two bombs, ten-second light, centered/dragged catalog, menu preservation, reduced motion, submit protection, scroll/resize, refresh`,
    );
  }
  await page.goto(`http://127.0.0.1:${server.port}/?dark`);
  await open();
  await capture("dark-wheel");
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
  result.status = "passed";
} catch (error) {
  result.status = context ? "failed" : "blocked";
  result.limitation = context
    ? "Native assertion failed. Review the recorded video and run HEADED=1."
    : "Chromium startup blocked: process_singleton_posix.cc socket() failed: Operation not permitted. No native screenshots or motion evidence captured.";
  console.error(error instanceof Error ? error.message.split("\n")[0] : "Browser check failed");
  process.exitCode = 2;
} finally {
  await context?.close();
  await server?.stop();
  await writeFile("evidence/003/browser-result.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
}
