import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Markdown suite (manual plan G00/H00). Standard constructs render, code blocks
 * stay contained, tables render or degrade gracefully, malformed Markdown never
 * crashes the app, and — most importantly — untrusted Markdown cannot execute
 * script, auto-load remote resources, or use dangerous URschemes.
 */
test.describe("markdown", () => {
  test("M001 standard Markdown renders headings, emphasis, lists, and quotes", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    const text = await app.reader().contentText();
    expect(text).toContain("FIXTURE_STANDARD_MD_INLINE");
    expect(text).toContain("FIXTURE_STANDARD_MD_QUOTE");
    // Structural elements exist.
    expect(await app.page.locator("#reader h1, #reader h2").count()).toBeGreaterThan(0);
    expect(await app.page.locator("#reader ul li, #reader ol li").count()).toBeGreaterThan(0);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M002 code-heavy notes render fenced code blocks", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    expect(await app.page.locator("#reader pre code, #reader pre").count()).toBeGreaterThan(0);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M003 long code lines do not cause horizontal page overflow", async ({ makeApp }) => {
    const app = await makeApp({ viewport: { width: 390, height: 844 } });
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    // Oracle checks documentElement has no horizontal overflow even on mobile.
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M004 Markdown tables render or degrade without breaking layout", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "markdownTable", "FIXTURE_MD_TABLE_CELL");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M005 malformed Markdown does not crash the app", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "malformedMarkdown", "FIXTURE_MALFORMED_MD");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M006 many headings render and paginate", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "manyHeadings", "FIXTURE_MANY_HEADINGS");
    expect(await app.page.locator("#reader h2").count()).toBeGreaterThan(1);
    await expectStandardOracle(app, { documentOpen: true });
  });

  // ---- SAFETY (the most important Markdown tests) ----

  test("M007 unsafe Markdown does not execute script or load remote resources", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "unsafeMarkdown", "FIXTURE_UNSAFE_SCRIPT_MARKER");

    // The XSS sentinel must never be set.
    const executed = await app.page.evaluate(
      () => (window as unknown as { __unsafeMarkdownExecuted?: boolean }).__unsafeMarkdownExecuted === true,
    );
    expect(executed, "unsafe Markdown must not execute").toBe(false);

    // No <script> or <iframe> made it into the DOM.
    expect(await app.page.locator("#reader script").count()).toBe(0);
    expect(await app.page.locator("#reader iframe").count()).toBe(0);

    // Any surviving anchors must not carry a javascript: scheme.
    const jsHrefs = await app.page.locator("#reader a").evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? "").filter((h) => /^\s*javascript:/i.test(h)),
    );
    expect(jsHrefs, "no javascript: scheme links").toEqual([]);

    // No remote request was made for the unsafe content.
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M008 remote images are not auto-fetched", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "remoteImage", "FIXTURE_REMOTE_IMAGE_ALT");
    // No request to example.com should have occurred.
    const remote = app.network.unexpectedRequests().filter((r) => r.includes("example.com"));
    expect(remote, "remote image must not be fetched").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M009 external links are present but not auto-followed", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "links", "FIXTURE_LINKS_END");
    const anchors = app.page.locator("#reader a");
    expect(await anchors.count()).toBeGreaterThan(0);
    // The external link retains its target URL.
    const hrefs = await anchors.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? ""));
    expect(hrefs.some((h) => h.includes("example.com"))).toBe(true);
    // Still on the app origin (no navigation happened just by rendering).
    expect(app.page.url()).toContain("index.html");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("M010 markers from Markdown never persist to storage", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    await app.storage.assertNoContent(fixtureMarkers("standardMarkdown"));
    await app.storage.assertOnlyPreferences();
  });
});
