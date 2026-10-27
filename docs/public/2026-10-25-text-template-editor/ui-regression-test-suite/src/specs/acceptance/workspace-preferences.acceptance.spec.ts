import { test, expect } from "../../framework/guided-test";
import { PersistDocument } from "../../flows/persist-document.flow";
import { expectAccessible } from "../../support/accessibility";
import { BrowserState } from "../../support/browser-state";

test.beforeEach(async ({ page }) => {
  const start = new Date("2026-10-26T12:00:00Z");
  await page.clock.install({ time: start });
});

test("AC02 · guidance continuity and workspace preferences survive reload and synchronize", async ({
  app,
  page,
  newTab,
}) => {
  await test.step("Collapse and restore preserve the answer, selection, and deliberate editing focus", async () => {
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("workspace answer");
    await app.documents().rename("Workspace preferences");
    await app.fieldEditor().answer.selectRange(2, 7);
    await app.panels().collapseGuidance();
    await expect(app.fieldEditor().answer.locator).toBeHidden();
    await app.panels().restoreGuidance();
    await app.fieldEditor().expectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("workspace answer");
    expect(await app.fieldEditor().answer.selection()).toEqual({ start: 2, end: 7 });
    await app.panels().openIssues();
    await expect(app.panels().issues).toContainText("needs a valid answer");
    await app.panels().collapseIssues();
    await new PersistDocument(app.documents(), app.navigation(), app.settings()).run(
      "Workspace preferences",
    );
  });
  await test.step("Settings validates bounds and applies every existing preference without rewriting content", async () => {
    await app.settings().open();
    await app.settings().expectDefaultState();
    await expectAccessible(page);
    await app.settings().select("theme", "light");
    await app.settings().select("background", "sage");
    await app.settings().select("density", "compact");
    await app.settings().select("logLevel", "debug");
    await app.settings().select("logFormatter", "plain");
    await app.settings().check("keyboardHelp", false);
    for (const value of ["0", "1.5", "3601"]) {
      await app.settings().autosaveSeconds(value);
      await expect(app.settings().validation).toHaveText("Enter a whole number from 1 to 3600.");
    }
    await app.settings().autosaveSeconds("2");
    await expect(app.settings().validation).toBeHidden();
    await expectAccessible(page);
  });
  await test.step("Another tab receives preferences and saves without navigation after the selected interval", async () => {
    const peer = await newTab();
    expect(await peer.settings().appearance()).toMatchObject({
      theme: "light",
      background: "sage",
      density: "compact",
    });
    await peer.documents().selectField("tool");
    await expect(peer.fieldEditor().keyboardHelp()).toBeHidden();
    // axe needs live timers; pause only around the measured autosave boundary.
    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(new Date(now + 1000));
    await app.settings().autosaveSeconds("1");
    await peer.settings().open();
    await expect(peer.settings().control("autosaveSeconds")).toHaveValue("1");
    await peer.navigation().selectDocument("Workspace preferences");
    await peer.documents().selectField("tool");
    await peer.fieldEditor().enterAnswer("autosaved workspace answer");
    await expect(peer.documents().saveStatus).toHaveText("Unsaved changes");
    await page.clock.runFor(999);
    await expect(peer.documents().saveStatus).toHaveText("Unsaved changes");
    expect((await new BrowserState(peer.context.page).records())[0]?.answers).toMatchObject({
      tool: "workspace answer",
    });
    await page.clock.runFor(1);
    await peer.documents().expectSaved();
    await peer.reload();
    await peer.documents().selectField("tool");
    await expect(peer.fieldEditor().answer.locator).toHaveValue("autosaved workspace answer");
    await app.settings().select("background", "dusk");
    await expect.poll(() => peer.settings().appearance()).toMatchObject({ background: "dusk" });
    await app.settings().select("theme", "dark");
    await expect.poll(() => peer.settings().appearance()).toMatchObject({ theme: "dark" });
    await app.settings().check("browserSuggestions", false);
    await expect(peer.fieldEditor().answer.locator).toHaveAttribute("autocomplete", "off");
    await app.settings().check("browserSuggestions", true);
    await expect(peer.fieldEditor().answer.locator).not.toHaveAttribute("autocomplete", "off");
    await peer.context.page.close();
  });
  await test.step("Reload restores preferences and content; returning to the document leaves hints controllable", async () => {
    await app.reload();
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("autosaved workspace answer");
    expect(await app.settings().appearance()).toMatchObject({
      theme: "dark",
      background: "dusk",
      density: "compact",
    });
    await app.settings().open();
    await expect(app.settings().control("autosaveSeconds")).toHaveValue("1");
    await expect(app.settings().control("logLevel")).toHaveValue("debug");
    await expect(app.settings().control("logFormatter")).toHaveValue("plain");
    await app.settings().check("keyboardHelp", true);
    await app.navigation().selectDocument("Workspace preferences");
    await expect(app.fieldEditor().keyboardHelp()).toBeVisible();
    expect(await new BrowserState(page).records()).toHaveLength(1);
  });
});
