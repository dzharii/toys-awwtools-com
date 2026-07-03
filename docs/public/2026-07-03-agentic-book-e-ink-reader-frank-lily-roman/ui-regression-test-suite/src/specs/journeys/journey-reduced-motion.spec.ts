import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Journey: reduced motion yields a calm reading surface (gap-closure spec). A
 * reader who prefers reduced motion — either via the OS setting or the explicit
 * app preference — must get page turns without heavy animation and never a
 * stuck E Ink overlay, while still being able to read and navigate normally.
 */
test.describe("journey: reduced motion", () => {
  test("JMOTION OS reduced-motion turns pages calmly with no stuck overlay", async ({ makeApp }) => {
    const app = await makeApp({ reducedMotion: "reduce", seededPreferences: { readerMode: "paged" } });
    const baseline = createBaseline(app, fixtureMarkers("longBook"));

    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(["reduced", "system"]).toContain(await app.reader().motion());

    // Turn several pages; each turn must settle (baseline waits for the overlay
    // to clear) and progress must advance.
    for (let i = 1; i <= 3; i++) {
      await baseline.capture();
      await app.reader().goToNextPage();
      await expect.poll(async () => (await app.reader().pageState())!.index).toBe(i);
      await baseline.expectAfter(`reduced-motion page turn ${i}`, PROFILES.pageTurn);
    }
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("JMOTION explicit reduced-motion preference is honored and readable", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { motion: "reduced", readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await app.reader().motion(), "explicit reduced motion honored").toBe("reduced");

    // Switching a setting under reduced motion still repaginates cleanly.
    const baseline = createBaseline(app, fixtureMarkers("longBook"));
    await baseline.capture();
    await app.reader().openSettings();
    await app.settings().expectReady();
    await app.settings().setFontSize(26);
    await app.settings().close();
    await baseline.expectAfter("font size under reduced motion", PROFILES.settingChange);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });
});
