import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";

const root = resolve(process.env.PROJECT_ROOT ?? process.cwd());
const { chromium, expect }: typeof import("playwright/test") = createRequire(
  import.meta.url,
)(process.env.PLAYWRIGHT_MODULE ?? "playwright/test");
const output = join(root, "evidence", "005", "native");
await mkdir(output, { recursive: true });
const extension = process.env.EXTENSION_PATH;
const profile = process.env.TEST_PROFILE;
if (!extension || !profile)
  throw new Error("Set EXTENSION_PATH and a fresh TEST_PROFILE");
const fixture = await readFile(
  join(
    root,
    "2026-11-14-anger-relief-toy-v003",
    "tests",
    "fixtures",
    "discussion.html",
  ),
);
const server = createServer((_, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.end(fixture);
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string")
  throw new Error("Missing local server address");
interface RuntimeReport {
  equipped: string | null;
  invocationsStarted: number;
  resources: number;
  audio: {
    state: string;
    muted: boolean;
    volume: number;
    voices: number;
    contexts: number;
  };
  events: unknown[];
}
const result: {
  browser?: string;
  status: string;
  error?: string;
  checks: string[];
  measurements?: unknown[];
  audio?: RuntimeReport["audio"][];
  limitations: string[];
} = {
  status: "starting",
  checks: [],
  limitations: [
    "Chrome for Testing on Windows, headless; not a branded Chrome/Edge compatibility certification.",
    "CDP Extensions.triggerAction opens the actual browser popup and grants activeTab. The OS keyboard accelerator did not dispatch through headless page.keyboard; its assignment/display, not native key invocation, is verified.",
    "Sound graph state is checked separately. Headless output is muted by Playwright; no listening-comfort claim.",
  ],
};
let context:
  Awaited<ReturnType<typeof chromium.launchPersistentContext>> | undefined;
try {
  context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    viewport: { width: 920, height: 720 },
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
      "--enable-unsafe-extension-debugging",
    ],
    timeout: 20000,
    recordVideo: {
      dir: join(output, "video"),
      size: { width: 920, height: 720 },
    },
  });
  result.browser = context.browser()?.version();
  console.log("Launched", result.browser);
  const page = context.pages()[0] ?? (await context.newPage());
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("chrome://extensions");
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker", { timeout: 15000 }));
  await page.goto(`http://127.0.0.1:${address.port}`);
  await page.bringToFront();
  let shortcut = await worker.evaluate(
    "chrome.commands.getAll().then(commands => commands.find(c => c.name === 'open-wheel')?.shortcut)",
  );
  if (!shortcut) {
    await page.goto("chrome://extensions/shortcuts");
    await page
      .getByRole("button", {
        name: "Edit shortcut Open rotating action dial for Anger Relief Toy",
        exact: true,
      })
      .click();
    await page.keyboard.press("Alt+Shift+A");
    await page.keyboard.press("Tab");
    await page.screenshot({ path: join(output, "shortcut-settings.png") });
    shortcut = await worker.evaluate(
      "chrome.commands.getAll().then(commands => commands.find(c => c.name === 'open-wheel')?.shortcut)",
    );
    result.checks.push(
      "Fresh profile shortcut was unassigned; assigned Alt+Shift+A through Chromium's actual shortcut settings",
    );
    await page.goto(`http://127.0.0.1:${address.port}`);
  }
  console.log("Browser", result.browser, "Shortcut", shortcut);
  await page.screenshot({ path: join(output, "before.png") });
  const browserCdp = await context.browser()!.newBrowserCDPSession();
  const { targetInfos } = await browserCdp.send("Target.getTargets", {
    filter: [{ type: "tab", exclude: false }],
  });
  const targetInfo = targetInfos.find((target) => target.url === page.url());
  if (!targetInfo) throw new Error("Missing browser tab target");
  await browserCdp.send("Extensions.triggerAction", {
    id: new URL(worker.url()).hostname,
    targetId: targetInfo.targetId,
  });
  await page.waitForTimeout(400);
  const targets = await browserCdp.send("Target.getTargets", {
    filter: [{ exclude: false }],
  });
  const popup = targets.targetInfos.find((target) =>
    target.url.endsWith("/popup.html"),
  );
  if (!popup)
    throw new Error(
      "Native popup target not exposed: " + JSON.stringify(targets.targetInfos),
    );
  const { sessionId } = await browserCdp.send("Target.attachToTarget", {
    targetId: popup.targetId,
    flatten: false,
  });
  // Chromium exposes the real popup as an "other" target, not a Playwright Page.
  // Operate that target; an extension page in a normal tab has different sender semantics.
  const popupCommand = (
    id: number,
    method: string,
    params: Record<string, unknown>,
  ) =>
    new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Popup command ${method} timed out`)),
        5000,
      );
      const receive = (event: { sessionId: string; message: string }) => {
        const message = JSON.parse(event.message) as {
          id?: number;
          result?: Record<string, unknown>;
          error?: { message: string };
        };
        if (event.sessionId !== sessionId || message.id !== id) return;
        clearTimeout(timer);
        browserCdp.off("Target.receivedMessageFromTarget", receive);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result ?? {});
      };
      browserCdp.on("Target.receivedMessageFromTarget", receive);
      void browserCdp
        .send("Target.sendMessageToTarget", {
          sessionId,
          message: JSON.stringify({ id, method, params }),
        })
        .catch(reject);
    });
  const popupImage = await popupCommand(1, "Page.captureScreenshot", {
    format: "png",
  });
  await writeFile(
    join(output, "popup.png"),
    Buffer.from(String(popupImage.data), "base64"),
  );
  await popupCommand(2, "Runtime.evaluate", {
    expression:
      "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Open action wheel'))?.click()",
  });
  await expect(
    page.getByRole("dialog", { name: "Action dial", exact: true }),
  ).toBeVisible({
    timeout: 8000,
  });
  await page.screenshot({ path: join(output, "dial.png") });
  result.checks.push(
    "Unmodified extracted ZIP loaded; actual browser action triggered via CDP granted activeTab; real popup opened dial",
  );
  const tabId = await worker.evaluate(
    "chrome.tabs.query({active:true,currentWindow:true}).then(tabs=>tabs[0].id)",
  );
  const report = async (): Promise<RuntimeReport> =>
    worker.evaluate(`chrome.tabs.sendMessage(${tabId}, {type:"report"})`);
  const capture = (name: string) =>
    page.screenshot({ path: join(output, `${name}.png`) });
  const select = async (name: string) => {
    if (
      !(await page
        .getByRole("dialog", { name: "Action dial", exact: true })
        .isVisible())
    )
      await page.getByRole("button", { name: "Switch", exact: true }).click();
    await page.getByRole("button", { name: "All tools", exact: true }).click();
    await page.getByRole("searchbox", { name: "Search effects" }).fill(name);
    await page
      .getByRole("button", { name: `Equip ${name}`, exact: true })
      .click();
    await expect(page.locator(".hud-name")).toHaveText(name);
  };
  const geometry = () =>
    page.locator(".hud").evaluate((hud: HTMLElement) => {
      const box = (element: Element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      };
      return {
        outer: box(hud),
        controls: [...hud.querySelectorAll("button")].map(box),
      };
    });
  const use = async (target: string) => {
    const box = await page.locator(target).boundingBox();
    if (!box) throw new Error(`No target ${target}`);
    await page.mouse.click(box.x + 90, box.y + 12);
    try {
      await expect(page.locator(".stage")).toHaveCount(1);
    } catch (error) {
      await capture("failed-target");
      await writeFile(
        join(output, "failed-report.json"),
        JSON.stringify(await report(), null, 2),
      );
      throw error;
    }
  };
  await select("Punch");
  await capture("punch-equipped");
  const idle = await geometry();
  result.measurements = [idle];
  for (const target of ["first", "second", "third"]) {
    await use(`#${target}`);
    expect(await geometry()).toEqual(idle);
    await expect(page.locator(".end-effect")).toBeEnabled();
    if (target === "first") {
      await page.waitForTimeout(120);
      await capture("punch-during");
      result.audio = [(await report()).audio];
    }
    await expect(page.locator(".stage")).toHaveCount(0, { timeout: 6000 });
    expect(await geometry()).toEqual(idle);
    await expect(page.locator(".hud-name")).toHaveText("Punch");
    await expect(page.locator(".end-effect")).toBeDisabled();
  }
  expect((await report()).invocationsStarted).toBe(3);
  result.measurements.push(await geometry());
  result.checks.push(
    "Three separate Punch targets without reselection; identical inventory/button rectangles before, during and after",
  );
  await capture("punch-complete");
  await page.getByRole("button", { name: "Switch", exact: true }).click();
  await capture("dial-inventory");
  const seen = new Set<string>();
  for (let i = 0; i < 28; i++) {
    for (const id of await page
      .locator(".wheel-sector")
      .evaluateAll((nodes: Element[]) =>
        nodes.map((node) => (node as HTMLElement).dataset.id ?? ""),
      ))
      if (id) seen.add(id);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(160);
    if ([3, 8, 16].includes(i)) await capture(`dial-rotation-${i}`);
  }
  expect(seen.size).toBe(18);
  const activeName = await page.evaluate(() =>
    document
      .querySelector("[data-art-root]")
      ?.shadowRoot?.activeElement?.getAttribute("aria-label"),
  );
  await page.keyboard.press("Enter");
  await expect(page.locator(".hud-name")).toHaveText(activeName!.slice(6));
  result.checks.push(
    "Arrow rotation exposes all eighteen enabled tools; Enter equips the focused tool",
  );
  await select("Punch");
  await page.getByRole("button", { name: "Switch", exact: true }).click();
  const wheel = await page.locator(".wheel").boundingBox();
  if (!wheel) throw new Error("Missing dial");
  const cx = wheel.x + wheel.width / 2,
    cy = wheel.y + wheel.height / 2,
    radius = wheel.width * 0.43;
  await page.mouse.move(cx + radius, cy);
  await page.mouse.down();
  for (let i = 1; i <= 48; i++)
    await page.mouse.move(
      cx + Math.cos((i * Math.PI) / 24) * radius,
      cy + Math.sin((i * Math.PI) / 24) * radius,
    );
  await page.mouse.up();
  await expect(
    page.getByRole("dialog", { name: "Action dial", exact: true }),
  ).toBeVisible();
  await capture("dial-dragged");
  await page.getByRole("button", { name: "All tools", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Action dial", exact: true }),
  ).toBeVisible();
  result.limitations.push(
    "Reproduced build defect: after pointer rotation, All tools ignores primary clicks because drag-click suppression stays set. Focus All tools and press Enter, or close/reopen the dial. Build preserved unchanged.",
  );
  await page.getByRole("button", { name: "All tools", exact: true }).focus();
  await page.keyboard.press("Enter");
  const catalog = page.getByRole("dialog", {
    name: "Choose a tool",
    exact: true,
  });
  const catalogBox = await catalog.boundingBox();
  expect(Math.abs(catalogBox!.x + catalogBox!.width / 2 - 460)).toBeLessThan(3);
  await expect(page.locator(".tool-use")).toHaveCount(18);
  await capture("catalog");
  const handle = await page.locator(".brand").boundingBox();
  await page.mouse.move(handle!.x + 30, handle!.y + 12);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 105, handle!.y + 32, { steps: 10 });
  await page.mouse.up();
  expect((await catalog.boundingBox())!.x).not.toBe(catalogBox!.x);
  await capture("catalog-moved");
  await page
    .getByRole("searchbox", { name: "Search effects" })
    .fill("Text Bomb");
  await page
    .getByRole("button", { name: "Equip Text Bomb", exact: true })
    .click();
  await expect(page.locator(".hud-name")).toHaveText("Text Bomb");
  for (const target of ["first", "second"]) {
    await use(`#${target}`);
    await page.waitForTimeout(850);
    await capture(`bomb-${target}`);
    await expect(page.locator(".stage")).toHaveCount(0, { timeout: 6000 });
    await expect(page.locator(".hud-name")).toHaveText("Text Bomb");
  }
  result.checks.push(
    "Pointer dial rotation, centered/movable catalog, actual search selection and two successive Text Bombs",
  );
  await select("Flashlight");
  await capture("flashlight-start");
  await page.waitForTimeout(10500);
  await page.mouse.move(310, 300);
  await expect(page.locator(".stage")).toHaveCount(1);
  await capture("flashlight-10s");
  await page.getByRole("button", { name: "End effect", exact: true }).click();
  await expect(page.locator(".stage")).toHaveCount(0);
  await expect(page.locator(".hud-name")).toHaveText("Flashlight");
  await select("Flashlight");
  await expect(page.locator(".stage")).toHaveCount(1);
  await page.getByRole("button", { name: "Put away", exact: true }).click();
  await expect(page.locator("[data-art-root]")).toHaveCount(0);
  await page.mouse.move(900, 700);
  await capture("after");
  expect(
    await page
      .locator("#first")
      .evaluate((node: Element) => getComputedStyle(node).visibility),
  ).toBe("visible");
  expect(await page.evaluate("window.actions")).toEqual({
    clicked: 0,
    sent: 0,
  });
  expect((await report()).resources).toBe(0);
  result.checks.push(
    "Flashlight persists >10 seconds, End effect retains equipment, reselect restarts; Put away removes all UI/resources and restores baseline",
  );
  // Reopen through the shipped content message only after the real action grant.
  await worker.evaluate(
    `chrome.tabs.sendMessage(${tabId}, {type:"show",mode:"wheel"})`,
  );
  await select("Punch");
  await page.getByRole("button", { name: "Switch", exact: true }).click();
  await page.getByRole("button", { name: "All tools", exact: true }).click();
  await page.getByText("Sound and mouse shortcut", { exact: true }).click();
  const hold = page.getByRole("checkbox", {
    name: "Middle mouse hold opens dial",
    exact: true,
  });
  await expect(hold).not.toBeChecked();
  await hold.check();
  await capture("settings");
  await page.getByRole("button", { name: "Close tools", exact: true }).click();
  await page.mouse.move(15, 180);
  await page.mouse.down({ button: "middle" });
  await page.waitForTimeout(800);
  await capture("hold-progress");
  await page.mouse.up({ button: "middle" });
  await expect(page.locator("[data-art-gesture]")).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Action dial", exact: true }),
  ).toHaveCount(0);
  await page.mouse.down({ button: "middle" });
  await page.waitForTimeout(1950);
  await expect(
    page.getByRole("dialog", { name: "Action dial", exact: true }),
  ).toBeVisible();
  await page.mouse.up({ button: "middle" });
  await capture("hold-dial");
  await page.keyboard.press("Escape");
  const field = await page.locator("input").first().boundingBox();
  await page.mouse.move(field!.x + 25, field!.y + 15);
  await page.mouse.down({ button: "middle" });
  await page.waitForTimeout(1900);
  await expect(page.locator("[data-art-gesture]")).toHaveCount(0);
  await expect(
    page.getByRole("dialog", { name: "Action dial", exact: true }),
  ).toHaveCount(0);
  await page.mouse.up({ button: "middle" });
  result.checks.push(
    "Hold is off by default; real UI opt-in, early release cancels, stationary 1.8s opens dial, editable field excluded",
  );
  // Leave any native middle-button mode before the independent sound check.
  await page.keyboard.press("Escape");
  await worker.evaluate(
    `chrome.tabs.sendMessage(${tabId}, {type:"show",mode:"wheel"})`,
  );
  await select("Punch");
  await use("#first");
  await page
    .getByRole("button", { name: "Mute all sounds", exact: true })
    .click();
  await page.waitForTimeout(50);
  const muted = (await report()).audio;
  expect(muted.muted).toBe(true);
  expect(muted.voices).toBe(0);
  result.audio!.push(muted);
  await page
    .getByRole("button", { name: "Unmute all sounds", exact: true })
    .click();
  await page.getByRole("button", { name: "Put away", exact: true }).click();
  await page.waitForTimeout(60);
  const stopped = (await report()).audio;
  expect(stopped.voices).toBe(0);
  expect(stopped.contexts).toBeLessThanOrEqual(1);
  result.audio!.push(stopped);
  result.checks.push(
    "Native Web Audio graph initializes once on pointer interaction; mute and Put away leave zero voices (not a listening test)",
  );
  await page.reload();
  await expect(page.locator("[data-art-root]")).toHaveCount(0);
  expect(errors).toEqual([]);
  result.checks.push(
    "Refresh leaves no extension UI; zero fixture page errors or host button/form actions",
  );
  result.status = "passed";
} catch (error) {
  result.status = context ? "failed" : "blocked";
  result.error = (error instanceof Error ? error.message : String(error))
    .replaceAll(root, "<project>")
    .replaceAll(profile, "<test-profile>")
    .replaceAll(extension, "<extracted-extension>");
  process.exitCode = 1;
} finally {
  await context?.close();
  server.close();
  await writeFile(
    join(output, "result.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
}
