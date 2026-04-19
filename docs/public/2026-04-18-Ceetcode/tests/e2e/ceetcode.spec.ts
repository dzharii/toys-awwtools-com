import { expect, test } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";

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
      stderrPreview: byTestId("stderr-output")?.textContent?.trim() ?? ""
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
