import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { VIEWPORTS } from "../../config/suite-config.js";

/**
 * Accessibility suite for the close-document action and the home updates panel
 * (feature spec T00). The close control is keyboard reachable with a clear
 * accessible name, closing moves focus to a sensible home control, reduced
 * motion is respected, and the updates panel exposes a heading, semantic list,
 * and valid <time> markup.
 */
test.describe("accessibility: close and updates", () => {
  test("A11Y_CLOSE001 close button has a clear accessible name", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await expect(app.page.getByTestId("reader-button-close-document")).toHaveAttribute(
      "aria-label",
      "Close current document and return to home screen",
    );
  });

  test("A11Y_CLOSE002 close is keyboard-activatable and moves focus to the open button", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().closeDocumentWithKey("Enter");
    await app.openScreen().expectReady();
    await expect
      .poll(() => app.page.evaluate(() => document.activeElement?.getAttribute("data-testid")))
      .toBe("open-screen-button-open");
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("A11Y_CLOSE003 reduced motion close is calm and leaves no stuck overlay", async ({ makeApp }) => {
    const app = await makeApp({ reducedMotion: "reduce" });
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    await app.reader().closeDocument();
    await app.openScreen().expectReady();
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("A11Y_UPDATES001 panel has a heading and a semantic list", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().waitUpdatesSettled();

    // Section is labelled by its heading.
    await expect(app.page.getByTestId("open-screen-region-updates")).toHaveAttribute(
      "aria-labelledby",
      "updates-title",
    );
    // Items live in a <ul>/<li> structure.
    const listTag = await app.page.getByTestId("open-screen-list-updates").locator("ul").count();
    expect(listTag, "updates rendered as a <ul>").toBeGreaterThan(0);
    const firstItemTag = await app.openScreen().updateItems().first().evaluate((el) => el.tagName.toLowerCase());
    expect(firstItemTag).toBe("li");
  });

  test("A11Y_UPDATES002 valid dates use <time datetime>", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().waitUpdatesSettled();

    const time = app.openScreen().updateItems().first().locator("time.update-item__date");
    if ((await time.count()) > 0) {
      const dt = await time.getAttribute("datetime");
      expect(dt, "datetime attribute present").toBeTruthy();
      expect(Number.isNaN(Date.parse(dt ?? "")), "datetime is parseable").toBe(false);
    }
  });

  test("A11Y_UPDATES003 the RSS link is keyboard reachable with understandable text", async ({ makeApp }) => {
    const app = await makeApp({ viewport: VIEWPORTS.mobileNarrow });
    await app.openScreen().expectReady();
    const link = app.page.getByTestId("open-screen-link-updates-rss");
    await link.focus();
    expect(await app.page.evaluate(() => document.activeElement?.getAttribute("data-testid"))).toBe(
      "open-screen-link-updates-rss",
    );
    expect(((await link.textContent()) ?? "").trim().length).toBeGreaterThan(0);
  });
});
