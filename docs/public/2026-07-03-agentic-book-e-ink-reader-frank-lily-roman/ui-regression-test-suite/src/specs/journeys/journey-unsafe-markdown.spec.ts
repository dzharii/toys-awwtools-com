import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Journey: unsafe Markdown is neutralized end to end (gap-closure spec). A
 * reader opens a file full of injection attempts — script tags, javascript:
 * links, event-handler attributes, iframes — and must see safe, readable text
 * with nothing executed, no outbound requests, and clean surrounding state.
 */
test.describe("journey: unsafe markdown", () => {
  test("JUNSAFE injected markup never executes and surrounding state stays clean", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "scroll" } });
    const markers = fixtureMarkers("unsafeMarkdown");
    const baseline = createBaseline(app, markers);

    await baseline.capture();
    await openFileByPickerFlow(app, "unsafeMarkdown", markers[0]);
    await baseline.expectAfter("open unsafe markdown", PROFILES.fileOpen);

    // The marker renders as visible text, proving the document was displayed.
    expect(await app.reader().contentText()).toContain(markers[0]);

    // No injected script from the fixture executed.
    const executed = await app.page.evaluate(
      () => (window as unknown as { __unsafeMarkdownExecuted?: boolean }).__unsafeMarkdownExecuted === true,
    );
    expect(executed, "injected markdown script must not execute").toBe(false);

    // No <script> or <iframe> survived sanitization inside the rendered content.
    const dangerous = await app.page.evaluate(() => {
      const root = document.querySelector("#reader .content");
      if (!root) return { scripts: -1, iframes: -1, handlers: -1 };
      const scripts = root.querySelectorAll("script").length;
      const iframes = root.querySelectorAll("iframe").length;
      const handlers = Array.from(root.querySelectorAll("*")).filter((el) =>
        Array.from(el.attributes).some((a) => a.name.toLowerCase().startsWith("on")),
      ).length;
      return { scripts, iframes, handlers };
    });
    expect(dangerous.scripts, "no <script> in rendered content").toBe(0);
    expect(dangerous.iframes, "no <iframe> in rendered content").toBe(0);
    expect(dangerous.handlers, "no inline event-handler attributes").toBe(0);

    app.network.assertNoUnexpectedRequests();
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
  });
});
