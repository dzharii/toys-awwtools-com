import { describe, expect, test } from "bun:test";
import { PALETTES } from "../../src/js/config/palettes.js";
import { PRESETS } from "../../src/js/config/presets.js";
import { STYLE_IDS, TRACE_STYLE_IDS } from "../../src/js/config/defaults.js";

describe("source configuration", () => {
  test("ships every required material family as an editable Preset", () => {
    const styles = new Set(Object.values(PRESETS).map((preset) => preset.style));
    for (const style of STYLE_IDS) expect(styles.has(style)).toBe(true);
    for (const preset of Object.values(PRESETS)) {
      expect(PALETTES[preset.palette]).toBeDefined();
      expect(TRACE_STYLE_IDS).toContain(preset.trace.style);
      for (const name of ["energy", "motion", "detail", "voiceInfluence", "excitationDrift", "idleMotion"]) {
        expect(preset[name]).toBeGreaterThanOrEqual(0);
        expect(preset[name]).toBeLessThanOrEqual(1);
      }
    }
  });
});
