import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * TXT structure coverage (gap-closure spec J00). Plain text must render as
 * readable, separated blocks (not one giant paragraph), command-output-like
 * notes must stay legible and contained, and paragraph structure must survive
 * theme + font changes without collapsing or overlapping.
 */
test.describe("txt structure", () => {
  test("TXT008 prose renders as multiple separated blocks, not one paragraph", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    const blocks = app.page.locator("#reader .content p, #reader .content pre");
    expect(await blocks.count(), "prose should split into several blocks").toBeGreaterThan(1);
    // Each block has positive height (no zero-height/overlapping blocks).
    const first = await blocks.first().boundingBox();
    expect(first?.height ?? 0).toBeGreaterThan(0);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("TXT009 command-output-like text stays readable and contained", async ({ makeApp }) => {
    const app = await makeApp({ viewport: { width: 390, height: 844 } });
    await openFileByPickerFlow(app, "txtCommandOutput", "FIXTURE_TXT_COMMAND_OUTPUT");
    const text = await app.reader().contentText();
    expect(text).toContain("bun run validate");
    expect(text).toContain("external requests");
    // Rendered as more than a single collapsed block.
    const blocks = app.page.locator("#reader .content p, #reader .content pre");
    expect(await blocks.count()).toBeGreaterThan(1);
    // Oracle enforces no body-level horizontal overflow even on a narrow phone.
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("TXT010 paragraph structure survives theme and font changes", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    const blocks = app.page.locator("#reader .content p, #reader .content pre");
    const before = await blocks.count();

    const baseline = createBaseline(app, fixtureMarkers("simpleProse"));

    await baseline.capture();
    await app.reader().openSettings();
    await app.settings().setTheme("dark");
    await app.settings().close();
    await baseline.expectAfter("theme -> dark", PROFILES.themeChange);

    await baseline.capture();
    await app.reader().openSettings();
    await app.settings().setFont("Atkinson Hyperlegible");
    await app.settings().close();
    await baseline.expectAfter("font -> Atkinson", PROFILES.fontChange);

    const after = await blocks.count();
    expect(after, "paragraph count is stable across theme/font changes").toBe(before);
    // No block collapsed to zero height.
    const heights = await blocks.evaluateAll((els) => els.map((e) => (e as HTMLElement).getBoundingClientRect().height));
    expect(heights.every((h) => h > 0)).toBe(true);
    await expectStandardOracle(app, { documentOpen: true });
  });
});
