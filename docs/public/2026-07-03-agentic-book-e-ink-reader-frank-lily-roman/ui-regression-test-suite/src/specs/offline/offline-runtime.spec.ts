import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Offline runtime integrity (gap-closure spec). The reader is a static,
 * local-first app: at runtime it must fetch nothing outside its own origin.
 * These tests enforce that as a hard guarantee using route interception — any
 * cross-origin request is aborted and recorded, so an attempted external fetch
 * would both fail loudly here and be caught. Production files are never
 * modified; interception lives entirely in the test browser context.
 */

const LOCAL_PREFIXES = ["data:", "blob:", "about:"];

/** Install a route that aborts (and records) any request outside the app origin. */
async function blockCrossOrigin(app: EinkReaderApp, external: string[]): Promise<void> {
  const base = app.server.baseUrl;
  await app.page.route("**/*", async (route) => {
    const url = route.request().url();
    const isLocal = url.startsWith(base) || LOCAL_PREFIXES.some((p) => url.startsWith(p));
    if (isLocal) {
      await route.continue();
    } else {
      external.push(`${route.request().method()} ${route.request().resourceType()} ${url}`);
      await route.abort();
    }
  });
}

test.describe("offline runtime", () => {
  test("OFF001 the app boots and reads a book with all cross-origin traffic blocked", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    const external: string[] = [];
    await blockCrossOrigin(app, external);
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    expect(external, "no cross-origin requests were attempted at runtime").toEqual([]);
    app.network.assertNoUnexpectedRequests();
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("OFF002 remote images and external links trigger no outbound fetches", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    const external: string[] = [];
    await blockCrossOrigin(app, external);
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await openFileByPickerFlow(app, "remoteImage", "FIXTURE_REMOTE_IMAGE_ALT");
    expect(external, "remote images in Markdown must never be fetched").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("OFF003 every runtime asset request is same-origin", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    const base = app.server.baseUrl;
    const offOrigin = app.diagnostics
      .requests()
      .map((r) => r.url)
      .filter((u) => !u.startsWith(base) && !LOCAL_PREFIXES.some((p) => u.startsWith(p)));
    expect(offOrigin, "all runtime assets load from the app's own origin").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("OFF004 reading survives after a reload with cross-origin traffic blocked", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    const external: string[] = [];
    await blockCrossOrigin(app, external);
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });
    await app.reload();
    await app.openScreen().expectReady();

    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    expect(external, "no cross-origin traffic across a reload").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });
});
