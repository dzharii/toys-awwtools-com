import { test, expect } from "../../framework/guided-test";
import { BrowserState } from "../../support/browser-state";
import { CreateGuidedDocument } from "../../flows/create-guided-document.flow";
import { projectDescription } from "../../support/test-data";

test("SM01 · writing surfaces, real editing focus, Issues, and transient export controls", async ({
  app,
  page,
}) => {
  await test.step("Fresh workspace has structural readiness without forced answer focus", async () => {
    await app.documents().expectReady();
    await app.navigation().expectReady();
    await app.templates().expectReady();
    await expect(app.templates().cards).toHaveCount(3);
    await expect(app.documents().writingStyleGroup()).toBeVisible();
    await expect(app.documents().styleRadio("Purpose + function")).toBeChecked();
    await expect(app.documents().copyButton).toBeDisabled();
    await expect(app.fieldEditor().answer.locator).toHaveCount(0);
  });
  await test.step("Placeholder activation and restored guidance have actual editing focus", async () => {
    await app.documents().selectField("tool");
    await app.fieldEditor().expectField("tool");
    await app.panels().collapseGuidance();
    await expect(app.fieldEditor().answer.locator).toBeHidden();
    await app.panels().restoreGuidance();
    await app.fieldEditor().expectField("tool");
    await app.panels().openIssues();
    await expect(app.panels().panel("issues").root).toHaveAttribute("data-visibility", "expanded");
    await app.panels().collapseIssues();
  });
  await test.step("A ready result opens an export menu that light-dismisses and returns focus", async () => {
    await new CreateGuidedDocument(app.documents(), app.templates(), app.fieldEditor()).run(
      projectDescription,
    );
    const exportText = app.documents().exportOption("txt");
    await app.documents().openExport();
    await expect(exportText).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(exportText).toBeHidden();
    await expect(app.documents().exportButton).toBeFocused();
    await app.documents().openExport();
    await app.documents().title.click();
    await expect(exportText).toBeHidden();
  });
});

test("SM02 · Settings, native source editor defaults, and independent browser contexts", async ({
  app,
  isolatedSession,
  page,
}) => {
  await test.step("Settings has real controls and applies preferences", async () => {
    await app.settings().open();
    await app.settings().select("theme", "light");
    await app.settings().select("density", "compact");
    expect(await app.settings().appearance()).toMatchObject({ theme: "light", density: "compact" });
  });
  await test.step("New Template Authoring observes source-editor focus without repairing it", async () => {
    await app.authoring().open();
    await app.authoring().expectDefaultState();
    await app.authoring().newTemplate();
    await app.authoring().expectDefaultState();
    await app
      .authoring()
      .editSource("TEMPLATE: Smoke-owned draft\nTEXT:\n  Kept within this context.");
    await app.authoring().save();
  });
  await test.step("A separately owned fresh context cannot inherit settings, drafts, or documents", async () => {
    const independent = await isolatedSession();
    expect(await independent.settings().appearance()).toMatchObject({
      theme: "dark",
      density: "comfortable",
    });
    await expect(independent.navigation().rows).toHaveCount(0);
    const state = new BrowserState(independent.context.page);
    expect(await state.records("authoringDrafts")).toHaveLength(0);
    expect(await new BrowserState(page).records("authoringDrafts")).toHaveLength(1);
  });
});
