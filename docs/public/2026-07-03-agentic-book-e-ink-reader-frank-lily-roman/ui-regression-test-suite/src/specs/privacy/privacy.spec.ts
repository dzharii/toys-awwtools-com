import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { applyPreferencesFlow } from "../../flows/apply-preferences.flow.js";
import { reloadPreservingPreferencesFlow } from "../../flows/reload-preserving.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import { PREFERENCES_KEY } from "../../config/suite-config.js";

/**
 * Privacy + local-first suite (manual plan). Book content is never persisted,
 * only the single preferences key may exist in storage, the reader makes no
 * unexpected runtime network requests, and reloading returns to the open screen
 * without restoring content while preferences survive.
 */
test.describe("privacy", () => {
  test("PRIV001 only the preferences key may exist in storage after reading", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    await app.storage.assertOnlyPreferences();
    const keys = await app.storage.keys();
    for (const k of keys) expect(k).toBe(PREFERENCES_KEY);
  });

  test("PRIV002 book content is not written to storage", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.storage.assertNoContent(fixtureMarkers("longBook"));
  });

  test("PRIV003 markdown content is not persisted either", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    await app.storage.assertNoContent(fixtureMarkers("codeHeavyNotes"));
    await app.storage.assertOnlyPreferences();
  });

  test("PRIV004 reload returns to open screen without restoring content", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reload();
    // Content is never persisted: the app returns to the open screen and the
    // reader is not showing a restored book.
    await app.openScreen().expectReady();
    expect(await app.reader().isVisible(), "reader must not restore content after reload").toBe(false);
    await app.storage.assertNoContent(fixtureMarkers("simpleProse"));
  });

  test("PRIV005 preferences survive a reload while content does not", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse");
    await applyPreferencesFlow(app, { theme: "dark", mode: "scroll" });
    await reloadPreservingPreferencesFlow(app, { theme: "dark", readerMode: "scroll" });
  });

  test("PRIV006 no unexpected runtime network requests occur while reading", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "remoteImage", "FIXTURE_REMOTE_IMAGE_ALT");
    // Remote images in markdown must not be fetched automatically.
    app.network.assertNoUnexpectedRequests();
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("PRIV007 opening a links-heavy note issues no outbound requests", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "links", "FIXTURE_LINKS_TITLE");
    app.network.assertNoUnexpectedRequests();
  });
});
