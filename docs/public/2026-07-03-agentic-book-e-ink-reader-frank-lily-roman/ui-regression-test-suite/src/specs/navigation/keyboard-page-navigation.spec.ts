import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Keyboard page-navigation suite (feature spec L00, tests KEYLEFT001-005).
 *
 * ArrowRight/ArrowLeft move forward and backward through pages in page mode and
 * clamp safely at the boundaries. While a settings control is focused, the
 * arrow keys must not turn the reader page (the control keeps native behavior).
 */
async function pageIndex(app: EinkReaderApp): Promise<number> {
  const state = await app.reader().pageState();
  return state ? state.index : -1;
}

test.describe("navigation: keyboard page navigation", () => {
  test("KEYLEFT001 ArrowRight advances the page", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged", showProgress: true } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().pressKey("ArrowRight");
    await expect.poll(() => pageIndex(app)).toBe(1);
    await expect.poll(() => app.reader().progressText()).toMatch(/page\s+2\s+of\s+\d+/i);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("KEYLEFT002 ArrowLeft returns to the previous page", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().pressKey("ArrowRight");
    await expect.poll(() => pageIndex(app)).toBe(1);
    await app.reader().pressKey("ArrowLeft");
    await expect.poll(() => pageIndex(app)).toBe(0);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("KEYLEFT003 ArrowLeft on the first page is a safe no-op", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().pressKey("ArrowLeft");
    await app.page.waitForTimeout(300);
    expect(await pageIndex(app)).toBe(0);
    expect(await app.reader().prevButton.isEnabled()).toBe(false);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("KEYLEFT004 ArrowRight on the last page is a safe no-op", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const count = (await app.reader().pageState())!.count;
    await app.reader().pressKey("End");
    await expect.poll(() => pageIndex(app)).toBe(count - 1);
    await app.reader().pressKey("ArrowRight");
    await app.page.waitForTimeout(300);
    expect(await pageIndex(app)).toBe(count - 1);
    expect(await app.reader().nextButton.isEnabled()).toBe(false);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("KEYLEFT005 arrow keys do not turn the page while a settings control is focused", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);

    await app.reader().openSettings();
    await app.settings().expectReady();
    // Focus a settings select and drive it with the arrow keys. The reader must
    // not navigate pages, and the reader stays in page mode.
    const themeSelect = app.page.getByTestId("settings-select-theme");
    await themeSelect.focus();
    await app.page.keyboard.press("ArrowRight");
    await app.page.keyboard.press("ArrowLeft");
    await app.page.waitForTimeout(300);

    expect(await pageIndex(app)).toBe(0);
    expect(await app.reader().currentMode()).toBe("paged");
  });
});
