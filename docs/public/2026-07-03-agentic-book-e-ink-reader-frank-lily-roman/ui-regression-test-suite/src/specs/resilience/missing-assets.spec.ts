import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import { FONT_IDS } from "../../config/suite-config.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Resilience to missing assets (gap-closure spec). The design promises a safe
 * fallback when a font is unavailable: text stays visible and the reader stays
 * usable. These tests abort font requests via route interception (production
 * files untouched) and prove the reader still opens, reads, and repaginates
 * with no stuck overlay, no page error, and no book-content leak.
 */

async function abortRoute(app: EinkReaderApp, glob: string): Promise<void> {
  await app.page.route(glob, async (route) => {
    await route.abort();
  });
}

/** The reader must be genuinely usable: content visible with positive layout box. */
async function expectReaderUsable(app: EinkReaderApp, marker: string): Promise<void> {
  expect(await app.reader().isVisible(), "reader is visible").toBe(true);
  expect(await app.reader().contentText(), "content marker rendered").toContain(marker);
  const box = await app.page.evaluate(() => {
    const el = document.querySelector("#reader .content") as HTMLElement | null;
    if (!el) return { w: 0, h: 0 };
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  expect(box.w, "content has positive width").toBeGreaterThan(0);
  expect(box.h, "content has positive height").toBeGreaterThan(0);
}

test.describe("resilience: missing assets", () => {
  test("RES001 default reader font missing: text still renders and reads", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true, seededPreferences: { readerMode: "paged" } });
    await abortRoute(app, "**/assets/fonts/literata/**");
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await expectReaderUsable(app, "FIXTURE_LONG_BOOK_CH1");
    // The reader still turns pages with the fallback font (no hang, no stuck overlay).
    await app.reader().goToNextPage();
    await expect.poll(async () => (await app.reader().pageState())!.index).toBe(1);
    // The aborted font request logs an expected resource-load error; it is the
    // induced condition under test, not an app fault.
    await expectStandardOracle(app, {
      documentOpen: true,
      mode: "paged",
      allowConsoleError: [/Failed to load resource/i, /ERR_FAILED/i],
    });
  });

  test("RES002 all bundled fonts missing: reader stays readable in scroll mode", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true, seededPreferences: { readerMode: "scroll" } });
    await abortRoute(app, "**/assets/fonts/**");
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    await expectReaderUsable(app, "FIXTURE_STANDARD_MD_HEADING");
    await expectStandardOracle(app, {
      documentOpen: true,
      mode: "scroll",
      allowConsoleError: [/Failed to load resource/i, /ERR_FAILED/i],
    });
  });

  test("RES003 changing to another missing font does not hang the reader", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true, seededPreferences: { readerMode: "paged" } });
    await abortRoute(app, "**/assets/fonts/**");
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await openFileByPickerFlow(app, "simpleProse", fixtureMarkers("simpleProse")[0]);
    await app.reader().openSettings();
    await app.settings().expectReady();
    // Pick a non-default font id; the face is unavailable but must not hang.
    const alt = FONT_IDS[1];
    await app.settings().setFont(alt);
    await app.settings().close();

    await expectReaderUsable(app, fixtureMarkers("simpleProse")[0]);
    expect((await app.storage.preferences())?.fontFamily, "font preference persisted").toBe(alt);
    await expectStandardOracle(app, {
      documentOpen: true,
      mode: "paged",
      allowConsoleError: [/Failed to load resource/i, /ERR_FAILED/i],
    });
  });
});
