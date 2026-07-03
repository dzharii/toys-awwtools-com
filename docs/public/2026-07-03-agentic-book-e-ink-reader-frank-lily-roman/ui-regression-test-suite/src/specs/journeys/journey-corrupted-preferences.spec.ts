import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import { PREFERENCES_KEY } from "../../config/suite-config.js";

/**
 * Journey: corrupted preferences recover gracefully (gap-closure spec). If the
 * single preferences key holds garbage — invalid JSON, a wrong-typed blob, or a
 * version mismatch — the app must still boot to a usable open screen, fall back
 * to safe defaults, read a file normally, and rewrite clean preferences.
 * Nothing should throw an uncaught error or strand the user.
 */
const CORRUPT_CASES: { label: string; raw: string }[] = [
  { label: "invalid JSON", raw: "{not valid json" },
  { label: "JSON array instead of object", raw: "[1,2,3]" },
  { label: "primitive string", raw: '"totally-wrong"' },
  { label: "object with wrong version and bad types", raw: JSON.stringify({ version: 999, fontSize: "huge", theme: 42, readerMode: "sideways" }) },
];

test.describe("journey: corrupted preferences", () => {
  for (const c of CORRUPT_CASES) {
    test(`JCORRUPT boots and reads with corrupted prefs (${c.label})`, async ({ makeApp }) => {
      const app = await makeApp({ seededPreferencesRaw: c.raw });

      // The app must reach a usable open screen despite the bad stored value.
      await app.openScreen().expectReady();
      expect(app.diagnostics.pageErrors(), "no uncaught error from corrupted prefs").toEqual([]);

      // Reading a file works normally on the recovered (default) preferences.
      await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);

      // Reader attributes fall back to valid values (the oracle enforces the
      // full enumeration checks).
      await expectStandardOracle(app, { documentOpen: true });

      // A change now persists as clean, valid JSON under the single key.
      await app.reader().openSettings();
      await app.settings().expectReady();
      await app.settings().setTheme("dark");
      await app.settings().close();

      const prefs = await app.storage.preferences();
      expect(prefs, "preferences parse as valid JSON after recovery").not.toBeNull();
      expect(prefs?.theme, "the new choice was written").toBe("dark");
      const keys = await app.storage.keys();
      for (const k of keys) expect(k).toBe(PREFERENCES_KEY);
    });
  }
});
