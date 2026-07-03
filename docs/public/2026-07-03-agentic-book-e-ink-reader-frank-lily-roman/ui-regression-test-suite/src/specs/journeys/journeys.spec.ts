import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { applyPreferencesFlow } from "../../flows/apply-preferences.flow.js";
import { reloadPreservingPreferencesFlow } from "../../flows/reload-preserving.flow.js";

/**
 * End-to-end persona journeys (manual plan Y00). These strings together the
 * primitive flows into realistic sessions for Frank (serious reader), Lily
 * (occasional reader), and Roman (engineer reading code notes).
 */
test.describe("journeys", () => {
  test("JOURNEY Frank reads a long book, tunes typography, turns pages, reloads", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await applyPreferencesFlow(app, {
      mode: "paged",
      fontFamily: "Literata",
      fontSize: 22,
      lineHeight: 1.6,
      theme: "warm-paper",
      einkIntensity: "balanced",
    });
    // Read forward several pages.
    for (let i = 1; i <= 3; i++) {
      await app.reader().goToNextPage();
      await expect.poll(async () => (await app.reader().pageState())!.index).toBe(i);
    }
    // Go back one page.
    await app.reader().goToPrevPage();
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(2);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged", theme: "warm-paper" });
    // Frank's typography preferences survive a reload; the book does not.
    await reloadPreservingPreferencesFlow(app, { theme: "warm-paper", readerMode: "paged", fontSize: 22 });
  });

  test("JOURNEY Lily opens a file, switches to scroll, adjusts size, recovers from a bad file", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await applyPreferencesFlow(app, { mode: "scroll", fontSize: 24 });
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
    // Lily tries an unsupported file via the reader's "open another" input and
    // gets a calm, non-technical error while her current reading is preserved.
    await app.openScreen().openByPicker("unsupportedPdf");
    await app.toast().waitShown();
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("JOURNEY Roman reviews code-heavy notes, checks safety, reloads privately", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "scroll" } });
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
    // Unsafe markdown is neutralized: no injected script executes.
    await app.openScreen().openByPicker("unsafeMarkdown");
    await app.reader().waitForMarker("FIXTURE_UNSAFE_SCRIPT_MARKER");
    const executed = await app.page.evaluate(() => (window as unknown as { __unsafeMarkdownExecuted?: boolean }).__unsafeMarkdownExecuted === true);
    expect(executed, "injected markdown script must not execute").toBe(false);
    // No content persisted after reload; preferences remain.
    await reloadPreservingPreferencesFlow(app, { readerMode: "scroll" });
  });
});
