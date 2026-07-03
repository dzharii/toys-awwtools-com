import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Close-document suite (feature spec Q00, tests CLOSE001-008). A reader-bar
 * "Close" control returns to the home screen, clearing in-memory document state
 * and reading position while leaving preferences untouched and persisting no
 * book content. The transition must never leave a stuck overlay or busy state,
 * and a late load result must not reopen the reader after close.
 */
async function pageIndex(app: EinkReaderApp): Promise<number> {
  const state = await app.reader().pageState();
  return state ? state.index : -1;
}

test.describe("navigation: close document", () => {
  test("CLOSE001 close button is present, enabled, and labelled when a document is open", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");

    const close = app.reader().closeButton;
    expect(await close.isVisible(), "close button visible").toBe(true);
    expect(await close.isEnabled(), "close button enabled").toBe(true);
    const label = await app.page.getByTestId("reader-button-close-document").getAttribute("aria-label");
    expect(label).toBe("Close current document and return to home screen");

    // The other reader-bar controls remain present alongside close.
    expect(await app.reader().title.isVisible(), "title visible").toBe(true);
    expect(await app.reader().openButton.isVisible(), "open visible").toBe(true);
    expect(await app.reader().settingsButton.isVisible(), "settings visible").toBe(true);

    await expectStandardOracle(app, { documentOpen: true });
  });

  test("CLOSE002 close returns to the home screen with no stuck overlay", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");

    await app.reader().closeDocument();

    expect(await app.reader().isVisible(), "reader hidden").toBe(false);
    await app.openScreen().expectReady();
    expect(await app.openScreen().dropzone.isVisible(), "dropzone visible").toBe(true);
    expect(await app.openScreen().openButton.isVisible(), "open button visible").toBe(true);
    expect(await app.openScreen().updatesPanel.isVisible(), "updates panel visible").toBe(true);

    // Old document content must not remain anywhere in the reader surface.
    expect(await app.reader().contentText()).not.toContain("FIXTURE_SIMPLE_TXT_TITLE");

    await expectStandardOracle(app, { documentOpen: false, contentMarkers: ["FIXTURE_SIMPLE_TXT_TITLE"] });
  });

  test("CLOSE003 close clears the document but keeps preferences", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");

    await app.reader().openSettings();
    await app.settings().setTheme("dark");
    await app.settings().close();
    await app.reader().closeDocument();

    const prefs = await app.storage.preferences();
    expect(prefs?.theme, "theme preference retained").toBe("dark");
    expect(await app.page.locator("html").getAttribute("data-theme")).toBe("dark");

    await expectStandardOracle(app, {
      documentOpen: false,
      contentMarkers: ["FIXTURE_STANDARD_MD_HEADING"],
    });
  });

  test("CLOSE004 reopening after close starts a fresh document (no stale page)", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");

    await app.reader().goToNextPage();
    await app.reader().goToNextPage();
    await expect.poll(() => pageIndex(app)).toBe(2);

    await app.reader().closeDocument();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");

    expect(await pageIndex(app), "reopened file starts at page 0").toBe(0);
    expect(await app.reader().contentText()).not.toContain("FIXTURE_LONG_BOOK_CH1");
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("CLOSE005 close from scroll mode resets the reading position", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "scroll" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");

    await app.reader().scrollNext();
    await expect.poll(() => app.reader().scrollFraction()).toBeGreaterThan(0);

    await app.reader().closeDocument();
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");

    expect(await app.reader().scrollFraction(), "reopened scroll position reset").toBeCloseTo(0, 1);
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
  });

  test("CLOSE006 Escape closes settings, then close returns home", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");

    await app.reader().openSettings();
    expect(await app.settings().isOpen()).toBe(true);
    // The settings scrim covers the reader bar, so close is reached after Escape.
    await app.settings().closeWithEscape();
    await app.reader().closeDocument();

    expect(await app.settings().isOpen(), "settings closed").toBe(false);
    await app.openScreen().expectReady();
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("CLOSE007 keyboard activation (Enter and Space) closes the document", async ({ makeApp }) => {
    const app = await makeApp();

    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().closeDocumentWithKey("Enter");
    await app.openScreen().expectReady();
    expect(await app.reader().isVisible()).toBe(false);
    // Focus lands on a sensible home control (the Open file button) once the
    // close transition settles.
    await expect
      .poll(() => app.page.evaluate(() => document.activeElement?.getAttribute("data-testid")))
      .toBe("open-screen-button-open");

    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().closeDocumentWithKey("Space");
    await app.openScreen().expectReady();
    expect(await app.reader().isVisible()).toBe(false);

    await expectStandardOracle(app, { documentOpen: false });
  });

  test("CLOSE008 close creates no network or storage side effects and no in-memory leak", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");

    await app.reader().closeDocument();

    // No retained document content on the exposed inspection handle.
    const leak = await app.page.evaluate(() => {
      const w = window as unknown as {
        __einkReader?: { currentContent?: unknown; pendingResult?: unknown };
      };
      return {
        currentContent: w.__einkReader?.currentContent ?? null,
        pendingResult: w.__einkReader?.pendingResult ?? null,
      };
    });
    expect(leak.currentContent, "currentContent cleared").toBeNull();
    expect(leak.pendingResult, "pendingResult cleared").toBeNull();

    await expectStandardOracle(app, {
      documentOpen: false,
      contentMarkers: ["FIXTURE_CODE_HEAVY_JS_SNIPPET"],
    });
  });
});
