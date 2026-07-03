import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { applyPreferencesFlow } from "../../flows/apply-preferences.flow.js";
import { EINK_INTENSITIES, REFRESH_STYLES } from "../../config/suite-config.js";

/**
 * E Ink simulation suite (manual plan). Every intensity applies to the reader,
 * refresh styles apply, the transition overlay never gets stuck, and reduced
 * motion produces a calm turn. The overlay is timing-sensitive, so these tests
 * assert applied state + absence of a stuck overlay (covered by the oracle),
 * not exact animation frames.
 */
test.describe("eink", () => {
  for (const intensity of EINK_INTENSITIES) {
    test(`EINK intensity "${intensity}" applies and leaves no stuck overlay`, async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      await applyPreferencesFlow(app, { einkIntensity: intensity });
      expect(await app.reader().einkIntensity()).toBe(intensity);
      await app.reader().goToNextPage();
      await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
      await app.reader().waitSettled();
      expect(await app.reader().isEinkOverlayActive()).toBe(false);
      await expectStandardOracle(app, { documentOpen: true, mode: "paged", eink: intensity });
    });
  }

  for (const style of REFRESH_STYLES) {
    test(`EINK refresh style "${style}" applies without error`, async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      await applyPreferencesFlow(app, { refreshStyle: style });
      await app.reader().goToNextPage();
      await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
      await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
    });
  }

  test("EINK reduced motion still advances pages with no stuck overlay", async ({ makeApp }) => {
    const app = await makeApp({ reducedMotion: "reduce", seededPreferences: { readerMode: "paged", einkIntensity: "strong" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().goToNextPage();
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
    await app.reader().waitSettled();
    expect(await app.reader().isEinkOverlayActive()).toBe(false);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("EINK off intensity produces immediate page turns", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged", einkIntensity: "off" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().goToNextPage();
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
    expect(await app.reader().einkIntensity()).toBe("off");
    await expectStandardOracle(app, { documentOpen: true, mode: "paged", eink: "off" });
  });
});
