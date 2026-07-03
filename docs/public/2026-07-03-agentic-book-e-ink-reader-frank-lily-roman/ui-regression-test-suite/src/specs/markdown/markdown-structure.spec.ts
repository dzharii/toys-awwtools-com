import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { countElements, hasElement, expectElementContained } from "../../framework/support/markdown-assertions.js";
import { switchModeFlow } from "../../flows/switch-mode.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";

/**
 * Markdown structure coverage (gap-closure spec K00). Standard constructs must
 * render to the expected safe elements: horizontal rule, blockquote, nested
 * lists, inline code, emphasis, and tables. Nothing may overflow the content
 * box, and no construct may crash rendering.
 */
test.describe("markdown structure", () => {
  test("MD016 horizontal rule renders as an <hr>", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);
    expect(await hasElement(app, "hr"), "a --- rule should render as <hr>").toBe(true);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("MD017 blockquote renders as <blockquote>", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);
    expect(await hasElement(app, "blockquote")).toBe(true);
    const text = await app.page.locator("#reader .content blockquote").first().textContent();
    expect(text ?? "").toContain("FIXTURE_STANDARD_MD_QUOTE");
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("MD018 nested lists render as nested <ul>/<li>", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);
    expect(await countElements(app, "ul li"), "list items").toBeGreaterThan(2);
    expect(await countElements(app, "li ul li"), "a nested list item").toBeGreaterThan(0);
    expect(await countElements(app, "ol li"), "ordered list items").toBeGreaterThan(1);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("MD019 inline code and emphasis render as <code>/<strong>/<em>", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", fixtureMarkers("standardMarkdown")[0]);
    expect(await hasElement(app, "code")).toBe(true);
    expect(await hasElement(app, "strong")).toBe(true);
    expect(await hasElement(app, "em")).toBe(true);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("MD020 tables render as <table> and stay contained on mobile", async ({ makeApp }) => {
    const app = await makeApp({ viewport: { width: 360, height: 780 } });
    await openFileByPickerFlow(app, "romanBinarySearch", fixtureMarkers("romanBinarySearch")[0]);
    expect(await hasElement(app, "table"), "a Markdown table should render as <table>").toBe(true);
    expect(await countElements(app, "table td, table th"), "table cells").toBeGreaterThan(1);
    // Measure containment in scroll mode, where element geometry is reliable.
    await switchModeFlow(app, "scroll");
    await expectElementContained(app, "table");
    await expectStandardOracle(app, { documentOpen: true });
  });
});
