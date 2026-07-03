import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import { PREFERENCES_KEY } from "../../config/suite-config.js";

/**
 * Privacy suite for close-document and the home updates panel (feature spec
 * U00). Closing a document clears in-memory content without persisting it or
 * leaking it through the inspection handle. Feed content is rendered in memory
 * only and never written to storage.
 */
test.describe("privacy: close and updates", () => {
  test("PRIV_CLOSE001 closing leaves only the preferences key in storage", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    await app.reader().closeDocument();

    await app.storage.assertOnlyPreferences();
    const keys = await app.storage.keys();
    for (const k of keys) expect(k).toBe(PREFERENCES_KEY);
    await app.storage.assertNoContent(fixtureMarkers("codeHeavyNotes"));
  });

  test("PRIV_CLOSE002 no book content leaks through the inspection handle after close", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    await app.reader().closeDocument();

    const marker = fixtureMarkers("codeHeavyNotes")[0];
    const leaked = await app.page.evaluate((m) => {
      const w = window as unknown as { __einkReader?: Record<string, unknown> };
      const app = w.__einkReader;
      if (!app) return false;
      // Shallow scan of the exposed handle's own serializable fields.
      let blob = "";
      for (const key of Object.keys(app)) {
        try {
          const v = (app as Record<string, unknown>)[key];
          if (typeof v === "string") blob += v;
          else if (v && typeof v === "object") blob += JSON.stringify(v);
        } catch {
          /* skip non-serializable (DOM/circular) fields */
        }
      }
      return blob.includes(m);
    }, marker);
    expect(leaked, "no fixture marker reachable on __einkReader after close").toBe(false);

    await expectStandardOracle(app, { documentOpen: false, contentMarkers: fixtureMarkers("codeHeavyNotes") });
  });

  test("PRIV_CLOSE003 close issues no outbound network request", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    await app.reader().closeDocument();
    app.network.assertNoUnexpectedRequests();
  });

  test("PRIV_UPDATES001 feed content is not written to storage", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().waitUpdatesSettled();
    // The feed fetch is same-origin only; nothing from it is persisted.
    await app.storage.assertOnlyPreferences();
    app.network.assertNoUnexpectedRequests();
  });
});
