import { test } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { VIEWPORTS } from "../../config/suite-config.js";

/**
 * Responsive suite (manual plan Q00). The reader is usable and free of
 * horizontal overflow across desktop, tablet, and mobile viewports, in both
 * paged and scroll modes, including code-heavy content on a narrow phone.
 */
const CASES = [
  { name: "desktop", vp: VIEWPORTS.desktop },
  { name: "smallDesktop", vp: VIEWPORTS.smallDesktop },
  { name: "tabletPortrait", vp: VIEWPORTS.tabletPortrait },
  { name: "tabletLandscape", vp: VIEWPORTS.tabletLandscape },
  { name: "mobileNarrow", vp: VIEWPORTS.mobileNarrow },
  { name: "mobileSmall", vp: VIEWPORTS.mobileSmall },
] as const;

test.describe("responsive", () => {
  for (const c of CASES) {
    test(`RESP ${c.name} (${c.vp.width}x${c.vp.height}) reads a book without horizontal overflow`, async ({
      makeApp,
    }) => {
      const app = await makeApp({ viewport: c.vp });
      await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
      await expectStandardOracle(app, { documentOpen: true });
    });
  }

  test("RESP mobile code-heavy notes keep code contained (no page-level overflow)", async ({ makeApp }) => {
    const app = await makeApp({ viewport: VIEWPORTS.mobileNarrow });
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("RESP mobile scroll mode has no horizontal overflow", async ({ makeApp }) => {
    const app = await makeApp({ viewport: VIEWPORTS.mobileSmall, seededPreferences: { readerMode: "scroll" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
  });
});
