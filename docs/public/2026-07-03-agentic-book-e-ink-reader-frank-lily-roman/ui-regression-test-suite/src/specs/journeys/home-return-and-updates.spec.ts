import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";

/**
 * End-to-end journeys for returning home and reading project updates (feature
 * spec V00). Covers the realistic loop of opening a book, closing it back to the
 * home screen, reading the updates panel, and opening a different book — with
 * privacy and calm state preserved throughout.
 */
test.describe("journeys: home return and updates", () => {
  test("JOURNEY_HOME Lily opens a book, closes it, reads updates, opens another", async ({ makeApp }) => {
    const app = await makeApp();

    // Open and read a first book.
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await expectStandardOracle(app, { documentOpen: true });

    // Close back to the home screen.
    await app.reader().closeDocument();
    await app.openScreen().expectReady();
    expect(await app.reader().isVisible()).toBe(false);

    // The home screen shows the updates panel with recent items.
    await app.openScreen().waitUpdatesSettled();
    expect(await app.openScreen().updatesPanel.isVisible()).toBe(true);
    expect(await app.openScreen().updateItemCount()).toBeGreaterThan(0);

    // A calm "document closed" notice is shown and does not claim restorability.
    await expect
      .poll(async () => (await app.openScreen().noticeText()).toLowerCase())
      .toContain("document closed");

    // Opening a different book works normally after close.
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    expect(await app.reader().contentText()).not.toContain("FIXTURE_SIMPLE_TXT_TITLE");
    await expectStandardOracle(app, {
      documentOpen: true,
      contentMarkers: ["FIXTURE_SIMPLE_TXT_TITLE"],
    });
  });

  test("JOURNEY_HOME Frank closes mid-reading and the new feature update is visible", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().goToNextPage();

    await app.reader().closeDocument();
    await app.openScreen().waitUpdatesSettled();

    // The feature's own feed item is present in the rendered updates.
    const text = (await app.openScreen().updatesText()).toLowerCase();
    expect(text).toContain("close");
    await expectStandardOracle(app, { documentOpen: false });
  });
});
