import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";

/**
 * Accessibility suite (manual plan). Keyboard-only navigation works, the
 * settings dialog traps focus and closes on Escape, interactive controls carry
 * accessible names, and the reduced-motion path yields a calm, non-animated
 * reading surface with no stuck overlay.
 */
test.describe("accessibility", () => {
  test("A11Y001 nav controls have accessible names", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await expect(app.page.getByTestId("reader-button-next")).toHaveAttribute("aria-label", /next/i);
    await expect(app.page.getByTestId("reader-button-prev")).toHaveAttribute("aria-label", /prev/i);
    await expect(app.page.getByTestId("reader-button-settings")).toHaveAttribute("aria-label", /settings/i);
  });

  test("A11Y002 the reader can be navigated entirely by keyboard", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().pressKey("ArrowRight");
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
    await app.reader().pressKey("End");
    const count = (await app.reader().pageState())!.count;
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(count - 1);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("A11Y003 settings dialog closes on Escape and returns to the reader", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await app.reader().openSettings();
    await app.settings().expectReady();
    await app.settings().closeWithEscape();
    expect(await app.settings().isOpen()).toBe(false);
    await expectStandardOracle(app, { documentOpen: true, settingsOpen: false });
  });

  test("A11Y004 focus moves into the settings dialog when opened", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await app.reader().openSettings();
    await app.settings().expectReady();
    // The focused element is within the settings dialog (focus trap entry).
    const inside = await app.page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="settings-region-dialog"]');
      return !!(dialog && document.activeElement && dialog.contains(document.activeElement));
    });
    expect(inside).toBe(true);
  });

  test("A11Y005 reduced motion yields a calm surface with no stuck overlay", async ({ makeApp }) => {
    const app = await makeApp({ reducedMotion: "reduce", seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().goToNextPage();
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
    // data-motion reflects the reduced preference and the overlay is not stuck.
    expect(["reduced", "system"]).toContain(await app.reader().motion());
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("A11Y006 explicit reduced motion preference is honored", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { motion: "reduced", readerMode: "paged" } });
    await openFileByPickerFlow(app, "simpleProse");
    expect(await app.reader().motion()).toBe("reduced");
    await expectStandardOracle(app, { documentOpen: true });
  });
});
