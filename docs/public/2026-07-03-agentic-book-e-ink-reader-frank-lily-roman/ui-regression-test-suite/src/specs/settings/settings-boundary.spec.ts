import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { RANGES } from "../../config/suite-config.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import type { ReaderPreferences } from "../../config/preferences-type.js";

/**
 * Settings boundary coverage (gap-closure spec). Each numeric range must accept
 * its minimum and maximum, clamp out-of-range input, persist the value, and
 * apply without disturbing unrelated state (setting-change baseline profile).
 */

interface NumericRange {
  name: keyof ReaderPreferences;
  min: number;
  max: number;
  def: number;
}

const NUMERIC_RANGES: NumericRange[] = [
  { name: "fontSize", ...RANGES.fontSize },
  { name: "lineHeight", ...RANGES.lineHeight },
  { name: "measure", ...RANGES.measure },
  { name: "paraSpacing", ...RANGES.paraSpacing },
  { name: "textureStrength", ...RANGES.textureStrength },
  { name: "margin", ...RANGES.margin },
];

test.describe("settings boundary", () => {
  for (const r of NUMERIC_RANGES) {
    test(`SB-${r.name} accepts min and max and clamps out-of-range input`, async ({ makeApp }) => {
      const app = await makeApp();
      await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
      const baseline = createBaseline(app, fixtureMarkers("simpleProse"));

      // Minimum boundary.
      await baseline.capture();
      await app.reader().openSettings();
      await app.settings().expectReady();
      await app.settings().setRange(r.name, r.min);
      let value = await app.settings().range(r.name).getValue();
      expect(value, `${r.name} at min`).toBe(r.min);
      await app.settings().close();
      await baseline.expectAfter(`${r.name} -> min`, PROFILES.settingChange);
      expect((await app.storage.preferences())?.[r.name], `${r.name} persisted at min`).toBe(r.min);

      // Maximum boundary.
      await baseline.capture();
      await app.reader().openSettings();
      await app.settings().expectReady();
      await app.settings().setRange(r.name, r.max);
      value = await app.settings().range(r.name).getValue();
      expect(value, `${r.name} at max`).toBe(r.max);
      await app.settings().close();
      await baseline.expectAfter(`${r.name} -> max`, PROFILES.settingChange);
      expect((await app.storage.preferences())?.[r.name], `${r.name} persisted at max`).toBe(r.max);

      // Below-min input clamps to min.
      await app.reader().openSettings();
      await app.settings().expectReady();
      await app.settings().setRange(r.name, r.min - Math.max(1, (r.max - r.min) * 0.5));
      expect(await app.settings().range(r.name).getValue(), `${r.name} clamped to min`).toBe(r.min);

      // Above-max input clamps to max.
      await app.settings().setRange(r.name, r.max + Math.max(1, (r.max - r.min) * 0.5));
      expect(await app.settings().range(r.name).getValue(), `${r.name} clamped to max`).toBe(r.max);
      await app.settings().close();

      const persisted = (await app.storage.preferences())?.[r.name] as number;
      expect(persisted, `${r.name} persisted value stays within range`).toBeGreaterThanOrEqual(r.min);
      expect(persisted).toBeLessThanOrEqual(r.max);
      await expectStandardOracle(app, { documentOpen: true });
    });
  }
});
