import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Keyboard shortcut coverage (gap-closure spec). Verifies the full documented
 * shortcut set beyond the arrow/Home/End keys already covered by navigation:
 * Space / Shift+Space page turns, S opens settings, O opens the file picker,
 * Escape closes settings, and shortcuts are correctly suppressed while a dialog
 * is open. Behavior is verified against the app before asserting.
 */
async function pageIndex(app: EinkReaderApp): Promise<number> {
  const state = await app.reader().pageState();
  return state ? state.index : -1;
}

test.describe("keyboard shortcuts", () => {
  test("KS001 Space advances the page and Shift+Space goes back", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().pressKey("Space");
    await expect.poll(() => pageIndex(app)).toBe(1);
    await app.reader().pressKey("Shift+Space");
    await expect.poll(() => pageIndex(app)).toBe(0);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("KS002 S opens settings and Escape closes it", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");

    const baseline = createBaseline(app);
    await baseline.capture();
    await app.reader().pressKey("s");
    await app.settings().expectReady();
    await baseline.expectAfter("press S", PROFILES.settingsOpen);

    await baseline.capture();
    await app.settings().closeWithEscape();
    expect(await app.settings().isOpen()).toBe(false);
    await baseline.expectAfter("press Escape", PROFILES.settingsClose);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("KS003 O triggers the file picker", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    const [chooser] = await Promise.all([
      app.page.waitForEvent("filechooser"),
      app.reader().pressKey("o"),
    ]);
    expect(chooser, "O should open the file picker").toBeTruthy();
    // Dismiss without choosing; the reader stays intact.
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("KS004 navigation keys are suppressed while settings is open", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const start = await pageIndex(app);
    await app.reader().openSettings();
    await app.settings().expectReady();

    // While the dialog is open, reader page-turn keys handled by the document
    // listener must not change the page. (Space is intentionally excluded here:
    // when a dialog button holds focus, Space is a native button activation,
    // not the app's page-turn shortcut.)
    await app.page.keyboard.press("ArrowRight");
    await app.page.keyboard.press("PageDown");
    // Give any (incorrect) turn a chance to apply, then confirm the page held.
    await app.page.waitForTimeout(300);
    expect(await pageIndex(app), "page index unchanged while settings open").toBe(start);
    expect(await app.settings().isOpen(), "settings remained open").toBe(true);

    await app.settings().closeWithEscape();
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("KS005 typing focus is respected: shortcut keys inside a select do not navigate", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const start = await pageIndex(app);
    await app.reader().openSettings();
    await app.settings().expectReady();
    // Focus the theme <select> and press "s" — must not act as a global shortcut.
    await app.page.getByTestId("settings-select-theme").focus();
    await app.page.keyboard.press("s");
    await app.page.waitForTimeout(200);
    expect(await app.settings().isOpen(), "settings stays open").toBe(true);
    await app.settings().close();
    expect(await pageIndex(app), "page unchanged").toBe(start);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });
});
