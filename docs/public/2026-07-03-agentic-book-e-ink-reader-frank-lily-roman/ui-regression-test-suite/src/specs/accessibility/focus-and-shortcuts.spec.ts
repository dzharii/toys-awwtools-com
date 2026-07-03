import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Focus + shortcut resilience (gap-closure spec E00: "Focus remains reachable
 * and does not disappear after dialogs or keyboard actions."). Complements the
 * accessibility suite by checking focus is never lost to <body>/null after a
 * dialog cycle, that the settings focus trap keeps Tab inside the dialog, and
 * that keyboard navigation keeps focus on a reachable reader control.
 */
async function activeSummary(app: EinkReaderApp): Promise<{ tag: string; inBody: boolean; testid: string | null }> {
  return app.page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el ? el.tagName.toLowerCase() : "none",
      inBody: !el || el === document.body,
      testid: el ? el.getAttribute("data-testid") : null,
    };
  });
}

test.describe("focus and shortcuts", () => {
  test("FS001 focus stays reachable after opening and closing settings", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().pressKey("s");
    await app.settings().expectReady();
    await app.settings().closeWithEscape();
    // Focus must not vanish to <body>; a reachable control should hold focus.
    const active = await activeSummary(app);
    expect(active.inBody, "focus should not fall back to <body> after closing settings").toBe(false);
    await expectStandardOracle(app, { documentOpen: true, settingsOpen: false });
  });

  test("FS002 the settings dialog traps Tab focus inside the dialog", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().openSettings();
    await app.settings().expectReady();
    // Tab many times; focus must remain inside the dialog on each step.
    for (let i = 0; i < 12; i++) {
      await app.page.keyboard.press("Tab");
      const inside = await app.page.evaluate(() => {
        const dialog = document.querySelector('[data-testid="settings-region-dialog"]');
        return !!(dialog && document.activeElement && dialog.contains(document.activeElement));
      });
      expect(inside, `focus stayed inside the dialog after Tab #${i + 1}`).toBe(true);
    }
    await app.settings().close();
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("FS003 keyboard page turns keep focus on a reachable reader element", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().pressKey("ArrowRight");
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
    const active = await activeSummary(app);
    expect(active.inBody, "focus should remain on a reachable element after a page turn").toBe(false);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("FS004 Shift+Tab also keeps focus inside the settings dialog", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().openSettings();
    await app.settings().expectReady();
    for (let i = 0; i < 8; i++) {
      await app.page.keyboard.press("Shift+Tab");
      const inside = await app.page.evaluate(() => {
        const dialog = document.querySelector('[data-testid="settings-region-dialog"]');
        return !!(dialog && document.activeElement && dialog.contains(document.activeElement));
      });
      expect(inside, `focus stayed inside the dialog after Shift+Tab #${i + 1}`).toBe(true);
    }
    await app.settings().close();
    await expectStandardOracle(app, { documentOpen: true });
  });
});
