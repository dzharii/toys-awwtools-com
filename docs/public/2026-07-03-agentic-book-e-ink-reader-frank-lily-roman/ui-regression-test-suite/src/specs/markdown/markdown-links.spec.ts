import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { anchors } from "../../framework/support/markdown-assertions.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Markdown link safety (gap-closure spec L00). http(s) links keep their URL but
 * open in a new tab with rel="noopener noreferrer" and are never auto-followed;
 * non-http schemes (including javascript:) are neutralized — the href is
 * removed and the anchor is marked data-blocked-href. Rendering must not
 * navigate or execute anything.
 */
test.describe("markdown links", () => {
  test("LINK001 external http links open safely in a new tab", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "links", fixtureMarkers("links")[0]);
    const list = await anchors(app);
    const external = list.filter((a) => (a.href ?? "").startsWith("http"));
    expect(external.length, "at least one external link").toBeGreaterThan(0);
    for (const a of external) {
      expect(a.target, "external link opens in a new tab").toBe("_blank");
      expect(a.rel ?? "", "external link is noopener noreferrer").toContain("noopener");
      expect(a.rel ?? "").toContain("noreferrer");
    }
    // Rendering did not navigate away from the app.
    expect(app.page.url()).toContain("index.html");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("LINK002 javascript: links are neutralized (no href, marked blocked)", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "links", fixtureMarkers("links")[0]);
    const list = await anchors(app);
    // No anchor may carry a javascript: scheme.
    expect(list.every((a) => !/^\s*javascript:/i.test(a.href ?? "")), "no javascript: href").toBe(true);
    // At least one anchor was neutralized and flagged.
    expect(list.some((a) => a.blocked === "1" && a.href === null), "a blocked link exists").toBe(true);
    // The XSS sentinel from the fixture link must never have run.
    const executed = await app.page.evaluate(
      () => (window as unknown as { __linkJsExecuted?: boolean }).__linkJsExecuted === true,
    );
    expect(executed, "javascript: link must not execute").toBe(false);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("LINK003 relative links are neutralized (not fetchable, not auto-followed)", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "links", fixtureMarkers("links")[0]);
    const list = await anchors(app);
    // The relative ./somewhere.md link is not http/mailto/#, so it is blocked.
    const relativeBlocked = list.some((a) => a.blocked === "1");
    expect(relativeBlocked, "relative link should be neutralized").toBe(true);
    // No network request was triggered for any link target.
    const remote = app.network.unexpectedRequests();
    expect(remote, "no link caused a network request").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });
});
