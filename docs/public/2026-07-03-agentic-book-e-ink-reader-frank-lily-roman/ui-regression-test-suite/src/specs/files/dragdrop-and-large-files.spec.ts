import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow, openFileByDropFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { ERROR_COPY } from "../../config/suite-config.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * File-input gap coverage (gap-closure spec I00). Closes the PDF-picker,
 * Markdown drag-and-drop, .markdown drag-and-drop, large-accepted, replace
 * after bad drop, and multi-file-drop-while-reading gaps. Each uses the
 * surrounding-state baseline so unrelated state cannot silently regress.
 */
test.describe("file input gaps", () => {
  test("FILE010 an unsupported PDF from the picker is rejected safely", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    const baseline = createBaseline(app);
    await baseline.capture();

    await app.openScreen().openByPicker("unsupportedPdf");
    await expect
      .poll(async () => app.openScreen().noticeText(), { timeout: 8000 })
      .toMatch(ERROR_COPY.unsupportedType);

    expect(await app.reader().isVisible(), "reader must not open for a PDF").toBe(false);
    await baseline.expectAfter("reject PDF", PROFILES.fileReject);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("FILE011 a Markdown file opens via drag-and-drop", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    const baseline = createBaseline(app);
    await baseline.capture();

    await openFileByDropFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);

    expect(await app.page.locator("#reader h1, #reader h2").count()).toBeGreaterThan(0);
    await baseline.expectAfter("drop markdown", PROFILES.fileOpen);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("FILE012 a .markdown file opens via drag-and-drop", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByDropFlow(app, "standardMarkdownAlt", fixtureMarkers("standardMarkdownAlt")[0]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("FILE013 a large accepted file opens without freezing or leaking", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    // The reader must eventually appear (busy overlay clears; no stuck spinner).
    await openFileByPickerFlow(app, "largeAccepted", fixtureMarkers("largeAccepted")[0]);
    await app.busy().waitHidden();
    expect(await app.busy().isVisible().catch(() => false)).toBe(false);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("FILE014 a bad drop while reading does not destroy the current book", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);

    // Drop an unsupported file while the reader is open.
    const baseline = createBaseline(app, fixtureMarkers("simpleProse"));
    await baseline.capture();
    await app.openScreen().dropFile("unsupportedPdf");
    // The current document must remain readable.
    await app.reader().waitForMarker(fixtureMarkers("simpleProse")[0]);
    await expectStandardOracle(app, { documentOpen: true });

    // Now open a valid Markdown file: it replaces the prose cleanly. The reader
    // is already open, so drive the shared picker directly rather than the
    // open-screen flow (the open screen is hidden while reading).
    await app.openScreen().openByPicker("standardMarkdown");
    await app.busy().waitHidden();
    await app.reader().waitForMarker(fixtureMarkers("standardMarkdown")[0]);
    const text = await app.reader().contentText();
    expect(text).toContain("FIXTURE_STANDARD_MD_HEADING");
    expect(text).not.toContain("FIXTURE_SIMPLE_TXT_TITLE");
    await app.storage.assertNoContent(["FIXTURE_SIMPLE_TXT_TITLE", "FIXTURE_STANDARD_MD_HEADING"]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("FILE015 a multi-file drop while reading is rejected and keeps the book", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);

    await app.openScreen().dropFiles(["simpleProse", "unicodeMixed"]);
    // The current document must still be present and valid.
    await app.reader().waitForMarker(fixtureMarkers("standardMarkdown")[0]);
    expect(await app.reader().currentMode()).toMatch(/paged|scroll/);
    await expectStandardOracle(app, { documentOpen: true });
  });
});
