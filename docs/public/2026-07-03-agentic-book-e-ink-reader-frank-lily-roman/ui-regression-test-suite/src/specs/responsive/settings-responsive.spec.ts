import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { VIEWPORTS, RANGES } from "../../config/suite-config.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Responsive settings coverage (gap-closure spec). The settings sheet must be
 * usable across desktop, tablet, and mobile: it opens, fits within the
 * viewport (no dialog-level horizontal overflow), accepts a change that
 * persists, and closes cleanly — all without leaking horizontal overflow at the
 * page level or disturbing unrelated state.
 */

const CASES = [
  { name: "desktop", vp: VIEWPORTS.desktop },
  { name: "tabletPortrait", vp: VIEWPORTS.tabletPortrait },
  { name: "mobileNarrow", vp: VIEWPORTS.mobileNarrow },
  { name: "mobileSmall", vp: VIEWPORTS.mobileSmall },
] as const;

/** The dialog must fit horizontally within the viewport (small sub-pixel tolerance). */
async function expectDialogFitsViewport(app: EinkReaderApp): Promise<void> {
  const fit = await app.page.evaluate(() => {
    const dialog = document.querySelector('[data-testid="settings-region-dialog"]') as HTMLElement | null;
    if (!dialog) return { ok: false, reason: "no dialog" };
    const box = dialog.getBoundingClientRect();
    return {
      ok: box.left >= -1 && box.right <= window.innerWidth + 1 && box.width > 0 && box.height > 0,
      left: box.left,
      right: box.right,
      width: box.width,
      innerWidth: window.innerWidth,
    };
  });
  expect(fit.ok, `settings dialog fits within viewport: ${JSON.stringify(fit)}`).toBe(true);
}

test.describe("responsive settings", () => {
  for (const c of CASES) {
    test(`SR ${c.name} (${c.vp.width}x${c.vp.height}) settings opens, fits, changes persist, closes`, async ({
      makeApp,
    }) => {
      const app = await makeApp({ viewport: c.vp });
      await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
      const baseline = createBaseline(app, fixtureMarkers("simpleProse"));

      await baseline.capture();
      await app.reader().openSettings();
      await app.settings().expectReady();
      await expectDialogFitsViewport(app);

      // A representative range change must take effect and persist on this viewport.
      const target = RANGES.fontSize.max;
      await app.settings().setFontSize(target);
      expect(await app.settings().range("fontSize").getValue(), "font size applied on this viewport").toBe(target);

      await app.settings().close();
      await baseline.expectAfter(`settings change on ${c.name}`, PROFILES.settingChange);
      expect((await app.storage.preferences())?.fontSize, "font size persisted").toBe(target);
      await expectStandardOracle(app, { documentOpen: true, settingsOpen: false });
    });

    test(`SR ${c.name} settings closes via the close button without leaving a stuck overlay`, async ({ makeApp }) => {
      const app = await makeApp({ viewport: c.vp });
      await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
      await app.reader().openSettings();
      await app.settings().expectReady();
      await app.settings().close();
      expect(await app.settings().isOpen(), "settings closed via close button").toBe(false);
      await expectStandardOracle(app, { documentOpen: true, settingsOpen: false });
    });

    // The drawer is width:min(380px,100%); on viewports comfortably wider than
    // the drawer a scrim strip is exposed and must dismiss the panel. On phones
    // the sheet effectively fills the viewport, so scrim-close is intentionally
    // unavailable there and the close button / Escape are the affordances.
    if (c.vp.width >= 500) {
      test(`SR ${c.name} settings closes via scrim without leaving a stuck overlay`, async ({ makeApp }) => {
        const app = await makeApp({ viewport: c.vp });
        await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
        await app.reader().openSettings();
        await app.settings().expectReady();
        await app.settings().closeWithScrim();
        expect(await app.settings().isOpen(), "settings closed via scrim").toBe(false);
        await expectStandardOracle(app, { documentOpen: true, settingsOpen: false });
      });
    }
  }

  test("SR mobile segmented mode toggle works inside the sheet", async ({ makeApp }) => {
    const app = await makeApp({ viewport: VIEWPORTS.mobileNarrow, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().openSettings();
    await app.settings().expectReady();
    await app.settings().setMode("scroll");
    await app.settings().close();
    expect(await app.reader().currentMode(), "mode switched to scroll on mobile").toBe("scroll");
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
  });
});
