/** Actual packaged-extension tests. No generated/mock screenshots count as native evidence. */
import { chromium, expect, type BrowserContext, type Page } from "playwright/test";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/generated/catalog";
import { defaults } from "../src/sdk/validation";
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
await mkdir(".temp", { recursive: true });
if (!existsSync(process.env.TMPDIR ?? "/tmp")) process.env.TMPDIR = `${root}.temp`;
await mkdir("evidence/004/browser", { recursive: true });
const result: {
  status: string;
  checks: string[];
  limitation?: string;
  error?: string;
  browser?: string;
} = { status: "starting", checks: [] };
let context: BrowserContext | undefined;
let server: ReturnType<typeof Bun.serve> | undefined;
try {
  const executable =
    process.env.CHROMIUM_EXECUTABLE ??
    (existsSync(chromium.executablePath()) ? chromium.executablePath() : "/usr/bin/chromium");
  context = await chromium.launchPersistentContext(`${root}.temp/review004-profile`, {
    executablePath: executable,
    headless: process.env.HEADED !== "1",
    viewport: { width: 920, height: 720 },
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [`--disable-extensions-except=${root}dist`, `--load-extension=${root}dist`],
    env: { ...process.env, TMPDIR: `${root}.temp` },
    recordVideo: { dir: "evidence/004/browser/video", size: { width: 920, height: 720 } },
  });
  result.browser = context.browser()?.version();
  server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: (request) => {
      const path = new URL(request.url).pathname;
      if (path === "/audition/index.html" || path === "/audition/audition.js")
        return new Response(Bun.file(`evidence/004/audio-audition/${path.split("/").at(-1)}`));
      return new Response(Bun.file("tests/fixtures/discussion.html"), {
        headers: { "content-type": "text/html" },
      });
    },
  });
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
  const page = context.pages()[0] ?? (await context.newPage());
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const assigned = await worker.evaluate(
    async () =>
      (await chrome.commands.getAll()).find((c) => c.name === "open-wheel")?.shortcut ?? "",
  );
  if (!assigned)
    throw new Error("Assign open-wheel in the headed test profile before running this suite");
  const key = assigned
    .replace("Ctrl", "Control")
    .replace("MacCtrl", "Control")
    .replace("Command", "Meta");
  const capture = async (name: string, p: Page = page) => {
    await p.screenshot({ path: `evidence/004/browser/${name}.png` });
  };
  const open = async () => {
    await page.keyboard.press(key);
    await expect(page.getByRole("dialog", { name: "Action dial", exact: true })).toBeVisible();
  };
  const select = async (name: string) => {
    await open();
    await page.getByRole("button", { name: "All tools", exact: true }).click();
    await page.getByRole("searchbox", { name: "Search effects" }).fill(name);
    await page.getByRole("button", { name: `Equip ${name}`, exact: true }).click();
    await expect(page.locator(".hud-name")).toHaveText(name);
  };
  const clickTarget = async (selector: string) => {
    const rect = await page.locator(selector).boundingBox();
    if (!rect) throw new Error("Missing target");
    await page.mouse.move(rect.x + 24, rect.y + 10);
    await page.mouse.click(rect.x + 24, rect.y + 10);
  };
  const geometry = () =>
    page.locator(".hud").evaluate((hud) => ({
      outer: (() => {
        const r = hud.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })(),
      controls: [...hud.querySelectorAll("button")].map((button) => {
        const r = button.getBoundingClientRect();
        return { name: button.textContent, x: r.x, y: r.y, width: r.width, height: r.height };
      }),
    }));
  const [tab] = await worker.evaluate(() =>
    chrome.tabs.query({ active: true, currentWindow: true }),
  );
  if (tab?.id === undefined) throw new Error("No fixture tab");
  const send = (message: Record<string, unknown>) =>
    worker.evaluate(async ({ tabId, message }) => chrome.tabs.sendMessage(tabId, message), {
      tabId: tab.id!,
      message,
    });
  const geometryRecords: unknown[] = [];
  for (const viewport of [
    { width: 920, height: 720 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`http://127.0.0.1:${server.port}`);
    await page.bringToFront();
    await capture(`${viewport.width}-baseline`);
    await open();
    await capture(`${viewport.width}-dial-open`);
    const wheel = await page.locator(".wheel").boundingBox();
    expect(wheel!.x).toBeGreaterThanOrEqual(0);
    expect(wheel!.x + wheel!.width).toBeLessThanOrEqual(viewport.width);
    await expect(page.locator(".wheel-sector")).toHaveCount(Math.min(9, catalog.length + 1));
    const firstIds = await page
      .locator(".wheel-sector")
      .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.id));
    const seen = new Set(firstIds);
    const cx = wheel!.x + wheel!.width / 2,
      cy = wheel!.y + wheel!.height / 2,
      radius = wheel!.width * 0.35;
    const point = (angle: number) => ({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
    let pointNow = point(0);
    await page.mouse.move(pointNow.x, pointNow.y);
    await page.mouse.down();
    for (let i = 1; i <= 180; i++) {
      pointNow = point((i * Math.PI) / 30);
      await page.mouse.move(pointNow.x, pointNow.y);
      if (i % 15 === 0) {
        for (const id of await page
          .locator(".wheel-sector")
          .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.id)))
          seen.add(id);
        await capture(`${viewport.width}-dial-turn-${i}`);
      }
    }
    await page.mouse.up();
    await page.waitForTimeout(180);
    expect(seen.size).toBe(catalog.length);
    await page.getByRole("button", { name: "All tools", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(180);
    const focusedName = await page.evaluate(() =>
      document
        .querySelector("[data-art-root]")
        ?.shadowRoot?.activeElement?.getAttribute("aria-label"),
    );
    expect(focusedName?.startsWith("Equip ")).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator(".hud-name")).toHaveText(focusedName!.slice(6));
    await select("Punch");
    await expect(page.locator(".hud button")).toHaveText(["Switch", "End effect", "Put away"]);
    await expect(page.locator(".end-effect")).toBeDisabled();
    const idle = await geometry();
    await capture(`${viewport.width}-punch-idle`);
    for (const target of ["#first", "#second", "#third"]) {
      await clickTarget(target);
      await expect(page.locator(".stage")).toHaveCount(1);
      await expect(page.locator(".end-effect")).toBeEnabled();
      await capture(`${viewport.width}-punch-${target.slice(1)}`);
      const playing = await geometry();
      expect(playing).toEqual(idle);
      await expect(page.locator(".stage")).toHaveCount(0, { timeout: 5000 });
      await expect(page.locator(".hud-name")).toHaveText("Punch");
      await expect(page.locator(".end-effect")).toBeDisabled();
      expect(await geometry()).toEqual(idle);
    }
    await capture(`${viewport.width}-punch-complete-equipped`);
    geometryRecords.push({ viewport, idle, completed: await geometry() });
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
    expect((await dialog.boundingBox())!.x).not.toBe(rect!.x);
    await capture(`${viewport.width}-catalog-dragged`);
    await page.getByRole("searchbox", { name: "Search effects" }).fill("bomb");
    await page.getByRole("button", { name: "Equip Text Bomb", exact: true }).click();
    const bombIdle = await geometry();
    for (const target of ["#first", "#second"]) {
      await clickTarget(target);
      expect(await geometry()).toEqual(bombIdle);
      await page.waitForTimeout(750);
      await capture(`${viewport.width}-bomb-${target.slice(1)}`);
      await expect(page.locator(".stage")).toHaveCount(0, { timeout: 5000 });
      await expect(page.locator(".hud-name")).toHaveText("Text Bomb");
      expect(await geometry()).toEqual(bombIdle);
    }
    await open();
    await page.keyboard.press("Escape");
    await expect(page.locator(".hud-name")).toHaveText("Text Bomb");
    await select("Flashlight");
    await capture(`${viewport.width}-flashlight-start`);
    await page.waitForTimeout(10500);
    await page.mouse.move(150, 200);
    await expect(page.locator(".stage")).toHaveCount(1);
    await capture(`${viewport.width}-flashlight-10s`);
    await page.getByRole("button", { name: "End effect", exact: true }).click();
    await expect(page.locator(".stage")).toHaveCount(0);
    await expect(page.locator(".hud-name")).toHaveText("Flashlight");
    await expect(page.locator(".end-effect")).toBeDisabled();
    await select("Flashlight");
    await expect(page.locator(".stage")).toHaveCount(1);
    await page.getByRole("button", { name: "Put away", exact: true }).click();
    await expect(page.locator("[data-art-root]")).toHaveCount(0);
    await capture(`${viewport.width}-cleanup`);
    // Normal host keys are neither targeting commands nor globally prevented.
    await send({ type: "select", id: "punch-element", options: defaults });
    const keyResult = await page.evaluate(() => {
      const states = [];
      for (const key of ["Tab", "Enter", " "]) {
        const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        states.push(event.defaultPrevented);
      }
      return states;
    });
    expect(keyResult).toEqual([false, false, false]);
    await clickTarget("#send");
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => (window as unknown as { actions: { sent: number; clicked: number } }).actions,
      ),
    ).toEqual({ sent: 0, clicked: 0 });
    for (const effect of catalog) {
      await send({ type: "select", id: effect.id, options: { ...defaults, reducedMotion: true } });
      if (effect.scope === "element") await clickTarget("#first");
      await capture(`${viewport.width}-${effect.id}-reduced`);
      await page.keyboard.press("Escape");
      await expect(page.locator("[data-art-root]")).toHaveCount(0);
    }
    await send({ type: "select", id: "flashlight", options: defaults });
    await page.evaluate(() => window.scrollBy(0, 120));
    await page.setViewportSize({ width: viewport.width - 30, height: viewport.height });
    await expect(page.locator(".stage")).toHaveCount(1);
    await page.reload();
    await expect(page.locator("[data-art-root]")).toHaveCount(0);
    result.checks.push(
      `${viewport.width}: packaged shortcut, full-registry rotation/recycling, keyboard after drag, stable measured toolbar, three punches, two bombs, persistent/restarted light, centered/draggable catalog, host-key/click safety, reduced motion, scroll/resize, navigation`,
    );
  }
  // Configure the real content service through its shipped settings interface.
  await page.goto(`http://127.0.0.1:${server.port}`);
  await open();
  await page.getByRole("button", { name: "All tools", exact: true }).click();
  await page.getByText("Sound and mouse shortcut", { exact: true }).click();
  const holdSetting = page.getByRole("checkbox", { name: /middle.*hold|hold middle/i });
  await holdSetting.check();
  await page.getByRole("button", { name: "Close tools", exact: true }).click();
  for (const delay of [80, 900, 1700]) {
    await page.mouse.move(20, 180);
    await page.mouse.down({ button: "middle" });
    await page.waitForTimeout(delay);
    await page.mouse.up({ button: "middle" });
    await expect(page.locator("[data-art-gesture]")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Action dial", exact: true })).toHaveCount(0);
  }
  await page.mouse.down({ button: "middle" });
  await page.waitForTimeout(800);
  await capture("hold-progress");
  await page.waitForTimeout(1100);
  await expect(page.getByRole("dialog", { name: "Action dial", exact: true })).toBeVisible();
  await page.mouse.up({ button: "middle" });
  await expect(page.locator("[data-art-gesture]")).toHaveCount(0);
  await capture("hold-opened-dial");
  await page.keyboard.press("Escape");
  result.checks.push(
    "production opt-in stationary hold, progress, cancellation at 80/900/1700ms, 1800ms completion without Shift or motion",
  );
  const audition = await context.newPage();
  await audition.goto(`http://127.0.0.1:${server.port}/audition/index.html`);
  for (const name of ["Punch", "Shatter", "Text Bomb", "Dial"]) {
    const section = audition
      .locator("section")
      .filter({ has: audition.getByRole("heading", { name, exact: true }) });
    await section
      .getByRole("button", { name: "Render shared profile offline", exact: true })
      .click();
    await expect(audition.locator("pre")).toContainText('"finite": true');
    const text = await audition.locator("pre").innerText();
    const metrics = JSON.parse(text.slice(0, text.indexOf("\nObjective"))) as {
      finite: boolean;
      peak: number;
      rms: number;
    }[];
    for (const cue of metrics) {
      expect(cue.finite).toBe(true);
      expect(cue.peak).toBeGreaterThan(0);
      expect(cue.peak).toBeLessThan(0.5);
    }
    await writeFile(
      `evidence/004/browser/audio-${name.replaceAll(" ", "-")}.json`,
      JSON.stringify(metrics, null, 2),
    );
  }
  await audition.close();
  result.checks.push(
    "Actual shared audio service/profile OfflineAudioContext renders are finite and bounded; subjective listening remains separate",
  );
  await page.goto(`http://127.0.0.1:${server.port}/?dark`);
  await open();
  await capture("dark-dial");
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
  await writeFile(
    "evidence/004/browser/inventory-measurements.json",
    JSON.stringify(geometryRecords, null, 2) + "\n",
  );
  result.status = "passed";
} catch (error) {
  result.status = context ? "failed" : "blocked";
  result.error = error instanceof Error ? error.message : String(error);
  result.limitation = context
    ? "Native assertion failed. Inspect recordings before acceptance."
    : "Chromium startup blocked in the current environment. No native screenshot, gesture/platform, layout or listening acceptance is claimed. See error for the concrete launch failure.";
  console.error(result.error.split("\n")[0]);
  process.exitCode = 2;
} finally {
  await context?.close();
  await server?.stop();
  await writeFile("evidence/004/browser-result.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ ...result, error: result.error?.split("\n")[0] }));
}
