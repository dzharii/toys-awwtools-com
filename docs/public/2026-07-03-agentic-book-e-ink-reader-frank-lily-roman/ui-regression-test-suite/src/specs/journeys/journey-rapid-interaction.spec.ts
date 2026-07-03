import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Journey: rapid interaction stays stable (gap-closure spec). A reader mashing
 * page-turn keys, toggling settings, and switching modes quickly must never
 * leave the app in a broken state — no stuck E Ink overlay, no uncaught error,
 * a valid final page index, and clean storage. This stresses transition
 * cleanup and state reconciliation under bursts of input.
 */
test.describe("journey: rapid interaction", () => {
  test("JRAPID fast page turns settle on a valid page with no stuck overlay", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");

    // Fire a burst of forward turns without waiting between them.
    for (let i = 0; i < 8; i++) {
      await app.page.keyboard.press("ArrowRight");
    }
    // Then a burst backward.
    for (let i = 0; i < 4; i++) {
      await app.page.keyboard.press("ArrowLeft");
    }

    // The reader must settle: overlay clears, index is valid and within range.
    await app.reader().waitSettled();
    const state = await app.reader().pageState();
    expect(state, "page state available after rapid input").not.toBeNull();
    if (state) {
      expect(state.index).toBeGreaterThanOrEqual(0);
      expect(state.index).toBeLessThan(state.count);
    }
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("JRAPID rapid settings + mode toggling leaves a consistent, readable state", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");

    // Quickly open/close settings and flip modes a few times.
    for (let i = 0; i < 3; i++) {
      await app.reader().openSettings();
      await app.settings().expectReady();
      await app.settings().setMode(i % 2 === 0 ? "scroll" : "paged");
      await app.settings().close();
    }

    await app.reader().waitSettled();
    // Final mode reflects the last toggle (i=2 => scroll) and content is intact.
    expect(await app.reader().currentMode()).toBe("scroll");
    expect(await app.reader().contentText()).toContain("FIXTURE_STANDARD_MD_HEADING");
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
  });

  test("JRAPID rapid open of a second file replaces content cleanly", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    // Immediately open a different file via the reader's picker.
    await app.openScreen().openByPicker("codeHeavyNotes");
    await app.reader().waitForMarker("FIXTURE_CODE_HEAVY_JS_SNIPPET");

    // Old content is gone; new content is shown; storage never held either.
    expect(await app.reader().contentText()).not.toContain(fixtureMarkers("simpleProse")[0]);
    await app.storage.assertNoContent([...fixtureMarkers("simpleProse"), ...fixtureMarkers("codeHeavyNotes")]);
    await expectStandardOracle(app, { documentOpen: true });
  });
});
