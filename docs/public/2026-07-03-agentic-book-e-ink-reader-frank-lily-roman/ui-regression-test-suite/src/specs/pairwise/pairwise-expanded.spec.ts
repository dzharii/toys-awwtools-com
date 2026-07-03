import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { applyPreferencesFlow, type PreferencePatch } from "../../flows/apply-preferences.flow.js";
import { generatePairwise, caseLabel } from "../../framework/support/pairwise.js";
import { THEMES, MODES, EINK_INTENSITIES, MOTIONS, CONTRASTS, ALIGNMENTS, FONT_IDS } from "../../config/suite-config.js";

/**
 * Expanded pairwise coverage (gap-closure spec). The original pairwise suite
 * hand-picks six combinations across four factors. This spec broadens the
 * factor set (mode, theme, eink, font, motion, contrast, align) and generates
 * an all-pairs covering set so every value of every factor is exercised in
 * combination with every value of every other factor at least once. The greedy
 * generator keeps the row count well below the full cartesian product while
 * preserving pairwise interaction coverage. On failure the full factor set for
 * the failing row is reported so the offending combination is unambiguous.
 */

const FACTORS = {
  mode: MODES,
  theme: THEMES,
  eink: EINK_INTENSITIES,
  font: FONT_IDS,
  motion: MOTIONS,
  contrast: CONTRASTS,
  align: ALIGNMENTS,
} as const;

const CASES = generatePairwise(FACTORS);

test.describe("pairwise expanded", () => {
  test("PW000 generated covering set is within the expected size envelope", () => {
    // All-pairs over these factors should land comfortably in the 18-32 range:
    // large enough for real coverage, far smaller than the cartesian product.
    expect(CASES.length, `generated ${CASES.length} pairwise cases`).toBeGreaterThanOrEqual(16);
    expect(CASES.length).toBeLessThanOrEqual(40);
  });

  for (const [i, c] of CASES.entries()) {
    const idx = String(i + 1).padStart(2, "0");
    test(`PW${idx} ${caseLabel(c)}`, async ({ makeApp }) => {
      const app = await makeApp();
      await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");

      const patch: PreferencePatch = {
        mode: c.mode,
        theme: c.theme,
        einkIntensity: c.eink,
        fontFamily: c.font,
        motion: c.motion,
        contrast: c.contrast,
        align: c.align,
      };

      try {
        await applyPreferencesFlow(app, patch);
        await expectStandardOracle(app, {
          documentOpen: true,
          mode: c.mode,
          theme: c.theme as never,
          eink: c.eink as never,
        });
      } catch (err) {
        // Report the entire factor set so the failing combination is explicit.
        throw new Error(`pairwise case failed: ${JSON.stringify(c)}\n${(err as Error).message}`);
      }
    });
  }
});
