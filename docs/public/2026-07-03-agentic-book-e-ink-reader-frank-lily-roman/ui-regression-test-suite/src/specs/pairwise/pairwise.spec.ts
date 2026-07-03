import { test } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { applyPreferencesFlow, type PreferencePatch } from "../../flows/apply-preferences.flow.js";

/**
 * Pairwise configuration suite (manual plan). A representative set of
 * mode x theme x eink x font combinations is applied to a real document and
 * validated by the Standard Post-Action Oracle. This catches interaction bugs
 * between preferences without exhaustively testing every combination.
 */
interface Combo {
  readonly patch: PreferencePatch;
  readonly label: string;
}

const COMBOS: Combo[] = [
  { label: "paged + warm-paper + balanced + Literata", patch: { mode: "paged", theme: "warm-paper", einkIntensity: "balanced", fontFamily: "Literata" } },
  { label: "scroll + dark + off + Merriweather", patch: { mode: "scroll", theme: "dark", einkIntensity: "off", fontFamily: "Merriweather" } },
  { label: "paged + high-contrast + strong + Atkinson Hyperlegible", patch: { mode: "paged", theme: "high-contrast", einkIntensity: "strong", fontFamily: "Atkinson Hyperlegible" } },
  { label: "scroll + cool-paper + reduced + Source Serif 4", patch: { mode: "scroll", theme: "cool-paper", einkIntensity: "reduced", fontFamily: "Source Serif 4" } },
  { label: "paged + dark + reduced + Charis SIL", patch: { mode: "paged", theme: "dark", einkIntensity: "reduced", fontFamily: "Charis SIL" } },
  { label: "scroll + warm-paper + strong + Literata", patch: { mode: "scroll", theme: "warm-paper", einkIntensity: "strong", fontFamily: "Literata" } },
];

test.describe("pairwise", () => {
  for (const combo of COMBOS) {
    test(`PAIR ${combo.label}`, async ({ makeApp }) => {
      const app = await makeApp();
      await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
      await applyPreferencesFlow(app, combo.patch);
      await expectStandardOracle(app, {
        documentOpen: true,
        mode: combo.patch.mode,
        theme: combo.patch.theme as never,
        eink: combo.patch.einkIntensity as never,
      });
    });
  }
});
