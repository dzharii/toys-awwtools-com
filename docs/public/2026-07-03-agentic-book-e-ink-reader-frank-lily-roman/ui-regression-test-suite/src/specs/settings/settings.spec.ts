import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { applyPreferencesFlow } from "../../flows/apply-preferences.flow.js";
import { reloadPreservingPreferencesFlow } from "../../flows/reload-preserving.flow.js";
import { RANGES, THEMES, FONT_IDS } from "../../config/suite-config.js";

/**
 * Settings suite (manual plan). Settings apply live, persist across reload,
 * clamp to valid ranges, and reset restores defaults. Content is never
 * persisted even though preferences are.
 */
test.describe("settings", () => {
  test("ST001 changing the theme applies live and updates the document theme", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await applyPreferencesFlow(app, { theme: "dark" });
    expect(await app.reader().theme()).toBe("dark");
    await expectStandardOracle(app, { documentOpen: true, theme: "dark" });
  });

  test("ST002 changing the font family applies without error", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await applyPreferencesFlow(app, { fontFamily: "Atkinson Hyperlegible" });
    const prefs = await app.storage.preferences();
    expect(prefs?.fontFamily).toBe("Atkinson Hyperlegible");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("ST003 font size change is reflected in persisted preferences", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await applyPreferencesFlow(app, { fontSize: 28 });
    expect((await app.storage.preferences())?.fontSize).toBe(28);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("ST004 preferences persist across a reload; content does not", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await applyPreferencesFlow(app, { theme: "cool-paper", fontSize: 24, mode: "scroll" });
    await reloadPreservingPreferencesFlow(app, { theme: "cool-paper", fontSize: 24 });
    // Content marker must not survive the reload.
    await app.storage.assertNoContent(["FIXTURE_SIMPLE_TXT_TITLE"]);
  });

  test("ST005 reset restores default preferences", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await applyPreferencesFlow(app, { fontSize: 30, theme: "dark" });
    expect(await app.reader().theme()).toBe("dark");
    await app.reader().openSettings();
    await app.settings().expectReady();
    await app.settings().resetPreferences();
    // Reset applies defaults live (theme returns to the default warm-paper) and
    // clears the stored key; preferences are not re-persisted until next change.
    await expect.poll(async () => app.reader().theme()).toBe("warm-paper");
    expect(await app.storage.preferences()).toBeNull();
    await app.storage.assertOnlyPreferences();
  });

  test("ST006 font size range clamps to its maximum", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await app.reader().openSettings();
    await app.settings().expectReady();
    // Attempt to exceed the max; the input's max attribute must clamp it.
    await app.settings().setRange("fontSize", RANGES.fontSize.max + 20);
    const value = await app.settings().range("fontSize").getValue();
    expect(value).toBeLessThanOrEqual(RANGES.fontSize.max);
    await app.settings().close();
    expect((await app.storage.preferences())?.fontSize).toBeLessThanOrEqual(RANGES.fontSize.max);
  });

  test("ST007 all themes can be selected without error", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    for (const theme of THEMES) {
      await applyPreferencesFlow(app, { theme });
      expect(await app.reader().theme()).toBe(theme);
      await expectStandardOracle(app, { documentOpen: true, theme });
    }
  });

  test("ST008 all fonts can be selected without error", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    for (const font of FONT_IDS) {
      await applyPreferencesFlow(app, { fontFamily: font });
      expect((await app.storage.preferences())?.fontFamily).toBe(font);
    }
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("ST009 settings can be closed with Escape and with the scrim", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await app.reader().openSettings();
    await app.settings().expectReady();
    await app.settings().closeWithEscape();
    expect(await app.settings().isOpen()).toBe(false);

    await app.reader().openSettings();
    await app.settings().expectReady();
    await app.settings().closeWithScrim();
    expect(await app.settings().isOpen()).toBe(false);
  });

  test("ST010 corrupted stored preferences fall back to defaults calmly", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferencesRaw: "{ this is not valid json" });
    await app.openScreen().expectReady();
    // App still boots; storage still holds only the preferences key.
    await expectStandardOracle(app, { documentOpen: false });
    await app.storage.assertOnlyPreferences();
  });
});
