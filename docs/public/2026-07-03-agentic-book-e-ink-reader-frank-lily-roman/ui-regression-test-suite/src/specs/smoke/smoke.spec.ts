import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow, openFileByDropFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Smoke suite: the highest-value paths that must always work. Maps to the
 * manual plan's smoke checklist (S001-S012): boot, open a file by picker and by
 * drop, reader renders, settings opens/closes, no errors, no unexpected
 * network, no content persisted.
 */
test.describe("smoke", () => {
  test("S001 app boots to the open screen with no errors", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("S002 open screen exposes dropzone, open button, and RSS link", async ({ makeApp }) => {
    const app = await makeApp();
    const open = app.openScreen();
    await open.expectReady();
    expect(await open.dropzone.isVisible()).toBe(true);
    expect(await open.openButton.isVisible()).toBe(true);
    expect(await open.rssLink.isVisible()).toBe(true);
  });

  test("S003 open a TXT file by picker renders the reader", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    await expectStandardOracle(app, { documentOpen: true, contentMarkers: fixtureMarkers("simpleProse") });
  });

  test("S004 open a TXT file by drag-and-drop renders the reader", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByDropFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    await expectStandardOracle(app, { documentOpen: true, contentMarkers: fixtureMarkers("simpleProse") });
  });

  test("S005 open a Markdown file renders the reader", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("S006 settings panel opens and closes", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await app.reader().openSettings();
    await app.settings().expectReady();
    await expectStandardOracle(app, { documentOpen: true, settingsOpen: true });
    await app.settings().close();
    await expectStandardOracle(app, { documentOpen: true, settingsOpen: false });
  });

  test("S007 no book content is written to persistent storage", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    await app.storage.assertOnlyPreferences();
    await app.storage.assertNoContent(["FIXTURE_SIMPLE_TXT_TITLE", "FIXTURE_SIMPLE_TXT_END"]);
  });

  test("S008 no unexpected runtime network requests occur", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown");
    app.network.assertNoUnexpectedRequests();
  });
});
