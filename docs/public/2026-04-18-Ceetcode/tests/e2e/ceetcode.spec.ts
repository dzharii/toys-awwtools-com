import { expect, test } from "@playwright/test";
import type { FrameLocator, Page, TestInfo } from "@playwright/test";

interface BrowserIssues {
  consoleErrors: string[];
  pageErrors: string[];
  requestFailures: Array<{ url: string; method: string; errorText: string }>;
}

const EDITOR_CONTENT = "[data-testid='editor'] .cm-content";

async function openWorkspace(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("workspace")).toBeVisible();
}

async function openReferenceWindow(page: Page): Promise<void> {
  await page.getByTestId("reference-button").click();
  await expect(page.getByTestId("reference-window-window")).toBeVisible();
  const frame = page.frameLocator("[data-testid='reference-iframe']");
  await expect(frame.locator("#searchInput")).toBeVisible({ timeout: 45_000 });
  await expect(frame.locator("#toc")).toBeVisible({ timeout: 45_000 });
}

async function searchReference(frame: FrameLocator, query: string): Promise<void> {
  const searchInput = frame.locator("#searchInput");
  await expect(searchInput).toBeVisible({ timeout: 45_000 });
  await searchInput.evaluate((node, value) => {
    const input = node as HTMLInputElement;
    input.value = String(value ?? "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, query);
  await searchInput.press("Enter");
}

async function beginLongTaskCapture(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    if (typeof PerformanceObserver === "undefined") {
      return false;
    }

    const supported = PerformanceObserver.supportedEntryTypes?.includes("longtask") ?? false;
    if (!supported) {
      return false;
    }

    const globalObject = window as unknown as {
      __ceetcodeLongTaskEntries?: number[];
      __ceetcodeLongTaskObserver?: PerformanceObserver;
    };

    globalObject.__ceetcodeLongTaskEntries = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "longtask") {
          globalObject.__ceetcodeLongTaskEntries?.push(entry.duration);
        }
      }
    });
    observer.observe({ entryTypes: ["longtask"] });
    globalObject.__ceetcodeLongTaskObserver = observer;
    return true;
  });
}

async function endLongTaskCapture(page: Page): Promise<{ count: number; maxDurationMs: number; durations: number[] }> {
  return page.evaluate(() => {
    const globalObject = window as unknown as {
      __ceetcodeLongTaskEntries?: number[];
      __ceetcodeLongTaskObserver?: PerformanceObserver;
    };

    globalObject.__ceetcodeLongTaskObserver?.disconnect();
    const durations = [...(globalObject.__ceetcodeLongTaskEntries ?? [])];
    return {
      count: durations.length,
      maxDurationMs: durations.length > 0 ? Math.max(...durations) : 0,
      durations
    };
  });
}

async function beginLongTaskCaptureInFrame(frame: FrameLocator): Promise<boolean> {
  const frameRoot = frame.locator("body");
  await expect(frameRoot).toBeVisible();
  return frameRoot.evaluate(() => {
    if (typeof PerformanceObserver === "undefined") {
      return false;
    }

    const supported = PerformanceObserver.supportedEntryTypes?.includes("longtask") ?? false;
    if (!supported) {
      return false;
    }

    const globalObject = window as unknown as {
      __ceetcodeLongTaskEntries?: number[];
      __ceetcodeLongTaskObserver?: PerformanceObserver;
    };

    globalObject.__ceetcodeLongTaskEntries = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "longtask") {
          globalObject.__ceetcodeLongTaskEntries?.push(entry.duration);
        }
      }
    });
    observer.observe({ entryTypes: ["longtask"] });
    globalObject.__ceetcodeLongTaskObserver = observer;
    return true;
  });
}

async function endLongTaskCaptureInFrame(frame: FrameLocator): Promise<{ count: number; maxDurationMs: number; durations: number[] }> {
  const frameRoot = frame.locator("body");
  await expect(frameRoot).toBeVisible();
  return frameRoot.evaluate(() => {
    const globalObject = window as unknown as {
      __ceetcodeLongTaskEntries?: number[];
      __ceetcodeLongTaskObserver?: PerformanceObserver;
    };

    globalObject.__ceetcodeLongTaskObserver?.disconnect();
    const durations = [...(globalObject.__ceetcodeLongTaskEntries ?? [])];
    return {
      count: durations.length,
      maxDurationMs: durations.length > 0 ? Math.max(...durations) : 0,
      durations
    };
  });
}

async function replaceEditorSource(page: Page, source: string): Promise<void> {
  const editorContent = page.locator(EDITOR_CONTENT);
  await expect(editorContent).toBeVisible();
  await editorContent.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(source);
}

async function waitForRunToFinish(page: Page): Promise<void> {
  await expect
    .poll(
      async () => {
        const text = await page.getByTestId("run-status").textContent();
        return (text ?? "").trim();
      },
      { timeout: 140_000 }
    )
    .not.toMatch(/Compiling|Running/);
}

async function runAndCollectStatuses(page: Page): Promise<string[]> {
  const seen = new Set<string>();
  await page.getByTestId("run-button").click();

  const startedAt = Date.now();
  while (Date.now() - startedAt < 140_000) {
    const statusText = ((await page.getByTestId("run-status").textContent()) ?? "").trim();
    if (statusText) {
      seen.add(statusText);
    }

    if (statusText && !/Compiling|Running/.test(statusText) && statusText !== "Idle") {
      break;
    }

    await page.waitForTimeout(100);
  }

  return [...seen];
}

async function captureVisualState(page: Page, testInfo: TestInfo, label: string): Promise<void> {
  const stateSnapshot = await page.evaluate(() => {
    const byTestId = (id: string) => document.querySelector<HTMLElement>(`[data-testid=\"${id}\"]`);
    const captureRect = (id: string) => {
      const el = byTestId(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom)
      };
    };

    const keyControlIds = [
      "problem-select",
      "run-button",
      "reset-button",
      "format-button",
      "share-button",
      "settings-button",
      "help-button",
      "reference-button",
      "run-status",
      "problem-panel",
      "editor-panel",
      "error-panel"
    ];

    const controlGeometry = Object.fromEntries(
      keyControlIds.map((id) => [id, captureRect(id)])
    );

    const referenceWindowRect = captureRect("reference-window-window");

    return {
      title: document.querySelector("#problem-title")?.textContent?.trim() ?? "",
      runStatus: byTestId("run-status")?.textContent?.trim() ?? "",
      summary: byTestId("summary-text")?.textContent?.trim() ?? "",
      diagnostics: byTestId("diagnostics")?.textContent?.trim() ?? "",
      unhandledErrorCount: byTestId("error-panel-count")?.textContent?.trim() ?? "",
      unhandledErrorPanelOpen:
        document.querySelector<HTMLDetailsElement>("[data-testid='error-panel']")?.open ?? false,
      testsPreview: byTestId("tests-list")?.textContent?.trim() ?? "",
      stdoutPreview: byTestId("stdout-output")?.textContent?.trim() ?? "",
      stderrPreview: byTestId("stderr-output")?.textContent?.trim() ?? "",
      controlGeometry,
      referenceWindowRect,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  });

  await testInfo.attach(`${label}-state.json`, {
    body: JSON.stringify(stateSnapshot, null, 2),
    contentType: "application/json"
  });

  await testInfo.attach(`${label}-ui.png`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png"
  });
}

test.describe.serial("Ceetcode acceptance @acceptance", () => {
  let browserIssues: BrowserIssues;

  test.beforeEach(async ({ page }) => {
    browserIssues = {
      consoleErrors: [],
      pageErrors: [],
      requestFailures: []
    };

    page.on("console", (message) => {
      if (message.type() === "error") {
        browserIssues.consoleErrors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      browserIssues.pageErrors.push(error.message);
    });

    page.on("requestfailed", (request) => {
      browserIssues.requestFailures.push({
        url: request.url(),
        method: request.method(),
        errorText: request.failure()?.errorText ?? "unknown"
      });
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    await testInfo.attach("browser-issues.json", {
      body: JSON.stringify(browserIssues, null, 2),
      contentType: "application/json"
    });

    if (
      testInfo.status !== testInfo.expectedStatus ||
      browserIssues.consoleErrors.length > 0 ||
      browserIssues.pageErrors.length > 0
    ) {
      await testInfo.attach("failure-ui.png", {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png"
      });
    }

    expect(
      browserIssues.consoleErrors,
      `Unexpected browser console errors: ${browserIssues.consoleErrors.join(" | ")}`
    ).toEqual([]);
    expect(browserIssues.pageErrors, `Unexpected uncaught page errors: ${browserIssues.pageErrors.join(" | ")}`).toEqual([]);
  });

  test("renders shell, problem content, and editor workspace @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await expect(page.getByTestId("problem-panel")).toBeVisible();
    await expect(page.getByTestId("editor-panel")).toBeVisible();
    await expect(page.getByTestId("problem-select")).toBeVisible();
    await expect(page.getByTestId("share-button")).toBeVisible();
    await expect(page.getByTestId("reference-button")).toBeVisible();
    await expect(page.getByTestId("help-button")).toBeVisible();
    await expect(page.getByTestId("format-button")).toBeVisible();
    await expect(page.getByTestId("run-button")).toBeVisible();
    await expect(page.getByTestId("reset-button")).toBeVisible();
    await expect(page.getByTestId("run-status")).toHaveText(/Idle/);
    await expect(page.getByTestId("error-panel")).toBeVisible();
    await expect(page.getByTestId("error-panel-count")).toHaveText("0");

    await expect(page.locator("#problem-content")).toContainText("Statement");
    await expect(page.locator("#problem-content")).toContainText("Examples");
    await expect(page.locator("#problem-content")).toContainText("Constraints");
    await expect(page.locator("#problem-content")).toContainText("Visible Tests");
    await expect(page.locator("#problem-content")).toContainText("C99 Runtime Support Matrix");
    await expect(page.locator("[data-testid='problem-select'] option").first()).toHaveText("New");

    await captureVisualState(page, testInfo, "shell-render");
  });

  test("logging settings apply immediately and persist after reload @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await expect(page.getByTestId("settings-button")).toBeVisible();
    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-dialog")).toHaveAttribute("open", "");

    await page.getByTestId("logging-level-select").selectOption("info");
    await page.getByTestId("logging-formatter-select").selectOption("plain");
    await page.getByTestId("logging-emoji-toggle").uncheck();
    await page.getByTestId("logging-background-toggle").uncheck();
    await page.getByTestId("settings-close-button").click();

    const runtimeSettings = await page.evaluate(() => {
      const debug = (
        window as {
          ceetcodeDebug?: {
            getLoggingSettings?: () => {
              level: string;
              formatter: string;
              useDecorativeEmoji: boolean;
              useLabelBackgrounds: boolean;
            };
          };
        }
      ).ceetcodeDebug;
      return debug?.getLoggingSettings?.() ?? null;
    });

    expect(runtimeSettings).toEqual({
      level: "info",
      formatter: "plain",
      useDecorativeEmoji: false,
      useLabelBackgrounds: false
    });

    await page.reload();
    await openWorkspace(page);
    await page.getByTestId("settings-button").click();

    await expect(page.getByTestId("logging-level-select")).toHaveValue("info");
    await expect(page.getByTestId("logging-formatter-select")).toHaveValue("plain");
    await expect(page.getByTestId("logging-emoji-toggle")).not.toBeChecked();
    await expect(page.getByTestId("logging-background-toggle")).not.toBeChecked();

    await captureVisualState(page, testInfo, "logging-settings");
  });

  test("embedded reference window opens, searches printf, and updates title @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const frame = page.frameLocator("[data-testid='reference-iframe']");
    await searchReference(frame, "printf");

    await expect(frame.locator(".search-hint")).toContainText(/Found|No matches/);
    await expect(frame.locator(".search-results .toc-link").first()).toContainText(/printf/i);
    await expect(page.getByTestId("reference-window-title")).toContainText(/printf/i, { timeout: 20_000 });

    await captureVisualState(page, testInfo, "reference-embedded-printf");
  });

  test("reference window supports drag and resize interactions @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const windowLocator = page.getByTestId("reference-window-window");
    const titleBar = windowLocator.locator(".tool-window-titlebar");
    const resizeHandle = windowLocator.locator(".tool-window-resize-handle.handle-nw");

    const beforeDrag = await windowLocator.boundingBox();
    expect(beforeDrag).not.toBeNull();
    if (!beforeDrag) {
      throw new Error("Reference window bounding box unavailable before drag.");
    }

    const titleBarBox = await titleBar.boundingBox();
    expect(titleBarBox).not.toBeNull();
    if (!titleBarBox) {
      throw new Error("Reference window title bar bounding box unavailable.");
    }

    await page.mouse.move(titleBarBox.x + titleBarBox.width / 2, titleBarBox.y + titleBarBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(titleBarBox.x + titleBarBox.width / 2 + 150, titleBarBox.y + titleBarBox.height / 2 + 120);
    await page.mouse.up();

    const afterDrag = await windowLocator.boundingBox();
    expect(afterDrag).not.toBeNull();
    if (!afterDrag) {
      throw new Error("Reference window bounding box unavailable after drag.");
    }
    expect(Math.abs(afterDrag.x - beforeDrag.x)).toBeGreaterThan(20);
    expect(Math.abs(afterDrag.y - beforeDrag.y)).toBeGreaterThan(20);

    const beforeResize = afterDrag;
    const handleBox = await resizeHandle.boundingBox();
    expect(handleBox).not.toBeNull();
    if (!handleBox) {
      throw new Error("Resize handle bounding box unavailable.");
    }

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x - 140, handleBox.y - 110);
    await page.mouse.up();

    const afterResize = await windowLocator.boundingBox();
    expect(afterResize).not.toBeNull();
    if (!afterResize) {
      throw new Error("Reference window bounding box unavailable after resize.");
    }
    expect(afterResize.width).toBeGreaterThan(beforeResize.width);
    expect(afterResize.height).toBeGreaterThan(beforeResize.height);

    await captureVisualState(page, testInfo, "reference-window-drag-resize");
  });

  test("reference drag stays under long-task performance budget @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const windowLocator = page.getByTestId("reference-window-window");
    const titleBar = windowLocator.locator(".tool-window-titlebar");
    const titleBarBox = await titleBar.boundingBox();
    expect(titleBarBox).not.toBeNull();
    if (!titleBarBox) {
      throw new Error("Reference window title bar bounding box unavailable.");
    }

    const longTaskSupported = await beginLongTaskCapture(page);
    if (longTaskSupported) {
      const startX = titleBarBox.x + titleBarBox.width * 0.5;
      const startY = titleBarBox.y + titleBarBox.height * 0.5;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      for (let step = 1; step <= 6; step += 1) {
        await page.mouse.move(startX + step * 26, startY + step * 16);
      }
      await page.mouse.up();
      await page.waitForTimeout(100);
    }

    const longTaskSummary = longTaskSupported
      ? await endLongTaskCapture(page)
      : { count: 0, maxDurationMs: 0, durations: [] as number[] };

    await testInfo.attach("reference-drag-longtasks.json", {
      body: JSON.stringify({ supported: longTaskSupported, ...longTaskSummary }, null, 2),
      contentType: "application/json"
    });

    if (longTaskSupported) {
      expect(
        longTaskSummary.maxDurationMs,
        `reference drag max long task exceeded budget: ${longTaskSummary.maxDurationMs}ms`
      ).toBeLessThan(50);
    }

    await captureVisualState(page, testInfo, "reference-drag-performance");
  });

  test("reference snippet Use action inserts memset snippet into editor @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await page.locator(EDITOR_CONTENT).click();
    await page.keyboard.press("ControlOrMeta+End");

    await openReferenceWindow(page);
    const frame = page.frameLocator("[data-testid='reference-iframe']");
    await searchReference(frame, "memset");
    await expect(frame.locator(".search-results .toc-link").first()).toContainText(/memset/i);
    await expect(page.getByTestId("reference-window-title")).toContainText(/memset/i, { timeout: 20_000 });

    const memsetCard = frame.locator(".function-card").filter({ has: frame.getByRole("heading", { name: /memset/i }) }).first();
    await expect(memsetCard).toBeVisible();
    await memsetCard.locator(".snippet-button").first().click();
    await expect(page.locator(EDITOR_CONTENT)).toContainText("memset");

    await captureVisualState(page, testInfo, "reference-snippet-insert");
  });

  test("reference pop out opens standalone window with full reference experience @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const popupPromise = page.waitForEvent("popup");
    await page.getByTestId("reference-window-popout").click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded");
    await expect(popup).toHaveURL(/external-app-c99-reference/);
    await expect(popup.locator("#searchInput")).toBeVisible({ timeout: 45_000 });
    await expect(popup.locator("body")).not.toHaveClass(/embedded-mode/);
    await popup.close();

    await captureVisualState(page, testInfo, "reference-popout");
  });

  test("reference closes and reopens without losing loaded state @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const frame = page.frameLocator("[data-testid='reference-iframe']");
    await searchReference(frame, "printf");
    await expect(page.getByTestId("reference-window-title")).toContainText(/printf/i, { timeout: 20_000 });

    await page.getByTestId("reference-window-close").click();
    await expect(page.getByTestId("reference-window-window")).toBeHidden();

    await page.getByTestId("reference-button").click();
    await expect(page.getByTestId("reference-window-window")).toBeVisible();
    await expect(page.getByTestId("reference-window-title")).toContainText(/printf/i);
    await expect(frame.locator("#searchInput")).toHaveValue(/printf/i);

    await captureVisualState(page, testInfo, "reference-reopen-state");
  });

  test("embedded reference keeps search controls visible at narrow window widths @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const windowLocator = page.getByTestId("reference-window-window");
    const resizeHandle = windowLocator.locator(".tool-window-resize-handle.handle-w");
    const handleBox = await resizeHandle.boundingBox();
    expect(handleBox).not.toBeNull();
    if (!handleBox) {
      throw new Error("West resize handle bounding box unavailable.");
    }

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 240, handleBox.y + 10);
    await page.mouse.up();

    const frame = page.frameLocator("[data-testid='reference-iframe']");
    await expect(frame.locator("#searchInput")).toBeVisible();
    await expect(frame.locator("#toc")).toBeVisible();
    await searchReference(frame, "memset");
    await expect(frame.locator(".search-results .toc-link").first()).toContainText(/memset/i);

    await captureVisualState(page, testInfo, "reference-narrow-search");
  });

  test("embedded reference search typing stays within long-task budget @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await openReferenceWindow(page);

    const frame = page.frameLocator("[data-testid='reference-iframe']");
    const searchInput = frame.locator("#searchInput");
    await expect(searchInput).toBeVisible();

    const longTaskSupported = await beginLongTaskCaptureInFrame(frame);
    if (longTaskSupported) {
      await searchInput.click();
      await searchInput.fill("");
      await searchInput.type("memset", { delay: 18 });
      await page.waitForTimeout(180);
    }

    const longTaskSummary = longTaskSupported
      ? await endLongTaskCaptureInFrame(frame)
      : { count: 0, maxDurationMs: 0, durations: [] as number[] };

    await testInfo.attach("reference-search-longtasks.json", {
      body: JSON.stringify({ supported: longTaskSupported, ...longTaskSummary }, null, 2),
      contentType: "application/json"
    });

    if (longTaskSupported) {
      const over120 = longTaskSummary.durations.filter((duration) => duration > 120);
      const over250 = longTaskSummary.durations.filter((duration) => duration > 250);
      expect(
        longTaskSummary.maxDurationMs,
        `reference search typing produced an extreme long task: ${longTaskSummary.maxDurationMs}ms`
      ).toBeLessThan(450);
      expect(
        over250.length,
        `reference search typing produced repeated heavy long tasks (>250ms): ${JSON.stringify(over250)}`
      ).toBeLessThanOrEqual(1);
      expect(
        over120.length,
        `reference search typing produced too many long tasks (>120ms): ${JSON.stringify(over120)}`
      ).toBeLessThanOrEqual(2);
    }

    await expect(frame.locator(".search-results .toc-link").first()).toContainText(/memset/i);
    await captureVisualState(page, testInfo, "reference-search-performance");
  });

  test("reset requires explicit confirmation and help dialog is discoverable @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await page.getByTestId("problem-select").selectOption("new");
    await replaceEditorSource(
      page,
      `int problem(void) {
    // danger-reset-marker
    return 7;
}`
    );

    await page.getByTestId("reset-button").click();
    await expect(page.getByTestId("reset-confirm-dialog")).toHaveAttribute("open", "");
    await page.getByTestId("reset-cancel-button").click();
    await expect(page.getByTestId("reset-confirm-dialog")).not.toHaveAttribute("open", "");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("danger-reset-marker");

    await page.getByTestId("reset-button").click();
    await page.getByTestId("reset-confirm-button").click();
    await expect(page.locator(EDITOR_CONTENT)).not.toContainText("danger-reset-marker");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("Hello, world!");

    await page.getByTestId("help-button").click();
    await expect(page.getByTestId("help-dialog")).toHaveAttribute("open", "");
    await expect(page.getByTestId("help-dialog")).toContainText(/select a symbol/i);
    await expect(page.getByTestId("help-dialog")).toContainText("Reset To Starter");
    await page.getByTestId("help-close-button").click();
    await expect(page.getByTestId("help-dialog")).not.toHaveAttribute("open", "");

    await captureVisualState(page, testInfo, "reset-confirm-and-help");
  });

  test("run workflow shows progress and passing summary @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await page.getByTestId("problem-select").selectOption("two-sum-pair-index");

    const statuses = await runAndCollectStatuses(page);

    expect(statuses.some((status) => /Compiling|Running/.test(status))).toBeTruthy();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("run-status")).toHaveText(/All Tests Passed/);
    await expect(page.getByTestId("summary-text")).toContainText("Passed");
    await expect(page.getByTestId("tests-list")).toContainText("PASS");
    await expect(page.getByTestId("tests-list")).toContainText("sample-basic");

    await captureVisualState(page, testInfo, "run-pass");
  });

  test("scratchpad New is runnable and keeps playground flow frictionless @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await page.getByTestId("problem-select").selectOption("new");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("int problem(void)");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("Hello, world!");

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("run-status")).toHaveText(/All Tests Passed/);
    await expect(page.getByTestId("tests-list")).toContainText("scratchpad-run");
    await expect(page.getByTestId("stdout-output")).toContainText("Hello, world!");

    await captureVisualState(page, testInfo, "scratchpad-new");
  });

  test("format action normalizes indentation for C blocks @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await page.getByTestId("problem-select").selectOption("new");

    await replaceEditorSource(
      page,
      `int problem(void) {
if (1) {
return 0;
}
return 0;
}`
    );

    await page.getByTestId("format-button").click();

    const formattedSource = await page.evaluate(() => {
      const debug = (
        window as {
          ceetcodeDebug?: {
            getSource?: () => string;
          };
        }
      ).ceetcodeDebug;
      return debug?.getSource?.() ?? "";
    });

    expect(formattedSource).toContain("\n    if (1) {\n        return 0;\n    }\n");
    await captureVisualState(page, testInfo, "format-action");
  });

  test("signal-state problem runs with boundary-focused official tests @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await page.getByTestId("problem-select").selectOption("signal-state-from-remaining-time");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("char* trafficSignal(int timer)");
    await expect(page.locator("#problem-content")).toContainText("timer == 0");
    await expect(page.locator("#problem-content")).toContainText("timer == 30");
    await expect(page.locator("#problem-content")).toContainText("30 < timer <= 90");

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("run-status")).toHaveText(/All Tests Passed/);
    await expect(page.getByTestId("summary-text")).toContainText("Failed 0");
    await expect(page.getByTestId("tests-list")).toContainText("thirty-orange");
    await expect(page.getByTestId("tests-list")).toContainText("ninety-one-invalid");

    await captureVisualState(page, testInfo, "signal-state-problem");
  });

  test("share hash restores selected problem, source, and custom tests @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);
    await page.getByTestId("problem-select").selectOption("best-time-buy-sell-stock");
    await replaceEditorSource(
      page,
      `int maxProfit(int* prices, int pricesSize) {
    // share-state-marker
    (void)prices;
    (void)pricesSize;
    return 42;
}`
    );
    await page.getByTestId("custom-tests-input").fill(
      JSON.stringify(
        [
          {
            name: "share-custom-case",
            input: { prices: [9, 1, 10], pricesSize: 3 },
            expected: 9
          }
        ],
        null,
        2
      )
    );

    const shareUrl = await page.evaluate(() => {
      const debug = (
        window as {
          ceetcodeDebug?: {
            buildShareUrl?: () => string;
          };
        }
      ).ceetcodeDebug;
      return debug?.buildShareUrl?.() ?? "";
    });
    expect(shareUrl).toContain("#share=");

    await page.goto(shareUrl);
    await expect(page.getByTestId("workspace")).toBeVisible();
    await expect(page.getByTestId("problem-select")).toHaveValue("best-time-buy-sell-stock");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("share-state-marker");
    await expect(page.getByTestId("custom-tests-input")).toHaveValue(/share-custom-case/);

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);
    await expect(page.getByTestId("tests-list")).toContainText("share-custom-case");

    await captureVisualState(page, testInfo, "share-restore");
  });

  test("failed tests show expected versus actual details @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await replaceEditorSource(
      page,
      `int twoSumPairIndex(int* nums, int numsSize, int target) {
    (void)nums;
    (void)numsSize;
    (void)target;
    return 0;
}`
    );

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("run-status")).toHaveText(/Tests Failed/);
    await expect(page.getByTestId("summary-text")).toContainText("Failed");
    await expect(page.getByTestId("tests-list")).toContainText("FAIL");
    await expect(page.getByTestId("tests-list")).toContainText("Expected:");
    await expect(page.getByTestId("tests-list")).toContainText("Actual:");
    await expect(page.getByTestId("tests-list")).toContainText("Show Input");
    await page.locator(".result-details summary").first().click();
    await expect(page.getByTestId("tests-list")).toContainText("\"nums\": [");

    await captureVisualState(page, testInfo, "run-fail");
  });

  test("compile diagnostics include severity and position metadata @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await replaceEditorSource(
      page,
      `int twoSumPairIndex(int* nums, int numsSize, int target) {
    return numsSize +
}`
    );

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("run-status")).toContainText("Compile");
    await expect(page.getByTestId("diagnostics")).toContainText("ERROR");
    await expect(page.getByTestId("diagnostics")).toContainText(/:\d+:\d+ -/);

    await captureVisualState(page, testInfo, "compile-error");
  });

  test("runtime failures are reported separately from compile failures @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await replaceEditorSource(
      page,
      `#include <stdlib.h>

int twoSumPairIndex(int* nums, int numsSize, int target) {
    (void)nums;
    (void)numsSize;
    (void)target;
    abort();
}`
    );

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("run-status")).toContainText("Runtime");
    await expect(page.getByTestId("diagnostics")).toContainText("No compile diagnostics");
    await expect(page.getByTestId("summary-text")).toContainText(/abort|trap|runtime|timed out|unreachable/i);

    await captureVisualState(page, testInfo, "runtime-error");
  });

  test("custom test validation and official test isolation behave correctly @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await page.getByTestId("custom-tests-input").fill("[");
    await page.getByTestId("run-button").click();

    await expect(page.getByTestId("run-status")).toContainText("Custom Tests Invalid");
    await expect(page.getByTestId("summary-text")).toContainText("Custom tests JSON parse error");

    await page.getByTestId("custom-tests-input").fill(
      JSON.stringify(
        [
          {
            name: "custom-deliberate-fail",
            input: { nums: [2, 7], numsSize: 2, target: 9 },
            expected: 0
          }
        ],
        null,
        2
      )
    );

    await page.getByTestId("run-button").click();
    await waitForRunToFinish(page);

    await expect(page.getByTestId("tests-list")).toContainText("sample-basic");
    await expect(page.getByTestId("tests-list")).toContainText("custom-deliberate-fail");
    await expect(page.getByTestId("summary-text")).toContainText("Passed 3/4, Failed 1");

    await captureVisualState(page, testInfo, "custom-tests");
  });

  test("problem-specific drafts and last-opened problem persist across reload @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await page.getByTestId("problem-select").selectOption("two-sum-pair-index");
    await replaceEditorSource(
      page,
      `int twoSumPairIndex(int* nums, int numsSize, int target) {
    // per-problem-marker-two-sum
    return -1;
}`
    );

    await page.getByTestId("problem-select").selectOption("valid-palindrome-ascii");
    await replaceEditorSource(
      page,
      `#include <string.h>

int isPalindromeAscii(const char* s) {
    // per-problem-marker-palindrome
    (void)s;
    return 1;
}`
    );

    await page.getByTestId("problem-select").selectOption("two-sum-pair-index");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("per-problem-marker-two-sum");

    await page.getByTestId("problem-select").selectOption("valid-palindrome-ascii");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("per-problem-marker-palindrome");

    await page.reload();
    await expect(page.getByTestId("problem-select")).toHaveValue("valid-palindrome-ascii");
    await expect(page.locator(EDITOR_CONTENT)).toContainText("per-problem-marker-palindrome");

    await captureVisualState(page, testInfo, "draft-persistence");
  });

  test("mobile view tabs switch cleanly without losing editor content @acceptance", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 900, height: 1000 });
    await openWorkspace(page);

    await expect(page.locator(".tabs")).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute("data-mobile-view", "problem");

    await page.getByRole("button", { name: "Editor" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-mobile-view", "editor");
    await expect(page.getByTestId("editor-panel")).toBeVisible();

    await replaceEditorSource(
      page,
      `int twoSumPairIndex(int* nums, int numsSize, int target) {
    // mobile-view-marker
    (void)nums;
    (void)numsSize;
    (void)target;
    return 1;
}`
    );

    await page.getByRole("button", { name: "Statement" }).click();
    await expect(page.locator("body")).toHaveAttribute("data-mobile-view", "problem");
    await expect(page.getByTestId("problem-panel")).toBeVisible();

    await page.getByRole("button", { name: "Editor" }).click();
    await expect(page.locator(EDITOR_CONTENT)).toContainText("mobile-view-marker");

    await captureVisualState(page, testInfo, "mobile-toggle");
  });

  test("unhandled error panel captures, expands, and clears without blocking workflow @acceptance", async ({ page }, testInfo) => {
    await openWorkspace(page);

    await expect(page.getByTestId("error-panel-count")).toHaveText("0");
    await expect(page.getByTestId("error-panel")).not.toHaveAttribute("open", "");

    await page.evaluate(() => {
      const debug = (
        window as {
          ceetcodeDebug?: {
            reportUnhandledError?: (source: string, message: string) => void;
          };
        }
      ).ceetcodeDebug;
      debug?.reportUnhandledError?.("window", "synthetic-panel-error");
    });

    await expect(page.getByTestId("error-panel-count")).toHaveText("1");
    await page.getByTestId("error-panel-summary").click();
    await expect(page.getByTestId("error-panel")).toHaveAttribute("open", "");
    await expect(page.getByTestId("error-panel-list")).toContainText("synthetic-panel-error");

    await page.getByTestId("error-panel-clear").click();
    await expect(page.getByTestId("error-panel-count")).toHaveText("0");
    await expect(page.getByTestId("error-panel-list")).toContainText("No unhandled errors captured");

    await expect(page.getByTestId("run-button")).toBeEnabled();
    await captureVisualState(page, testInfo, "unhandled-errors-panel");
  });
});
