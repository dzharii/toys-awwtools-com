import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import { VIEWPORTS } from "../../config/suite-config.js";

/**
 * Journey: Roman reviews developer notes on a phone (gap-closure spec). An
 * engineer opens several code-heavy technical notes on a narrow mobile
 * viewport. Every note must render code blocks that stay contained (no page
 * sideways scroll), number their lines, keep links safe/neutralized, and never
 * persist content — matching how Roman actually reviews notes on the go.
 */
const NOTES = [
  { fixture: "romanJsDebug", marker: "FIXTURE_ROMAN_JS_DEBUG_TITLE" },
  { fixture: "romanBinarySearch", marker: "FIXTURE_ROMAN_BINARY_SEARCH_TITLE" },
  { fixture: "romanRateLimit", marker: "FIXTURE_ROMAN_RATE_LIMIT_TITLE" },
] as const;

test.describe("journey: Roman developer notes", () => {
  for (const note of NOTES) {
    test(`JROMAN ${note.fixture} reads with contained, numbered code on mobile`, async ({ makeApp }) => {
      const app = await makeApp({ viewport: VIEWPORTS.mobileNarrow, seededPreferences: { readerMode: "scroll" } });
      await openFileByPickerFlow(app, note.fixture, note.marker);

      const blocks = await app.codeBlock().count();
      expect(blocks, `${note.fixture} has at least one code block`).toBeGreaterThan(0);

      // Every code block is line-numbered and stays within the reading column.
      for (let i = 0; i < blocks; i++) {
        const nums = await app.codeBlock().lineNumbers(i);
        expect(nums.length, `code block ${i} is line-numbered`).toBeGreaterThan(0);
        await app.codeBlock().expectSequentialLineNumbers(i);
        await app.codeBlock().expectContained(i);
      }

      // No content persisted; the oracle enforces no body-level overflow too.
      await app.storage.assertNoContent(fixtureMarkers(note.fixture));
      await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
    });
  }

  test("JROMAN links in developer notes are safe and no requests are made", async ({ makeApp }) => {
    const app = await makeApp({ viewport: VIEWPORTS.mobileNarrow });
    await openFileByPickerFlow(app, "links", "FIXTURE_LINKS_END");

    // Every anchor is either a safe http(s) link that opens in a new, isolated
    // tab, or a neutralized non-web link with its href removed.
    const anchors = await app.page.evaluate(() => {
      const root = document.querySelector("#reader .content");
      if (!root) return [];
      return Array.from(root.querySelectorAll("a")).map((a) => ({
        href: a.getAttribute("href"),
        target: a.getAttribute("target"),
        rel: a.getAttribute("rel") ?? "",
        blocked: a.getAttribute("data-blocked-href") === "1",
      }));
    });
    expect(anchors.length, "the links note renders anchors").toBeGreaterThan(0);
    for (const a of anchors) {
      const isHttp = a.href !== null && /^https?:\/\//i.test(a.href);
      if (isHttp) {
        expect(a.target, "external links open in a new tab").toBe("_blank");
        expect(a.rel, "external links carry noopener").toContain("noopener");
      } else {
        // Non-web links are neutralized: no live href remains.
        expect(a.blocked || a.href === null || a.href.startsWith("#"), "non-web link neutralized").toBe(true);
      }
    }

    // A javascript: link in the fixture must not have executed.
    const jsRan = await app.page.evaluate(
      () => (window as unknown as { __linkJsExecuted?: boolean }).__linkJsExecuted === true,
    );
    expect(jsRan, "javascript: link must not execute").toBe(false);

    app.network.assertNoUnexpectedRequests();
    await expectStandardOracle(app, { documentOpen: true });
  });
});
