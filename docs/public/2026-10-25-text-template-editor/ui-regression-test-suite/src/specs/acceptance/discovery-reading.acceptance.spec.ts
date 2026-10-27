import { test, expect } from "../../framework/guided-test";
import { BrowserState } from "../../support/browser-state";
import { downloadedText } from "../../support/downloads";

test("AC11 · ranked discovery and rendered previews never mutate the working document", async ({
  app,
  page,
}) => {
  const state = new BrowserState(page);
  const catalog = app.templates();
  const original = await app.documents().result.textContent();
  await catalog.search("JSON");
  await expect(catalog.cards).toHaveCount(1);
  await expect(catalog.card("Project description")).toBeVisible();
  await expect(catalog.root).toContainText("formats and validates json");
  await catalog.searchInput.press("End");
  await catalog.searchInput.pressSequentially(" ");
  await expect(catalog.searchInput).toHaveValue("JSON ");
  await expect(catalog.searchInput).toBeFocused();
  await catalog.previewTemplate("Project description");
  await expect(catalog.sampleStyles).toBeFocused();
  await expect(catalog.sample).not.toBeEmpty();
  const sample = await catalog.sample.textContent();
  await catalog.sampleVersion("Problem + solution");
  await expect(catalog.sample).not.toHaveText(sample!);
  await expect(app.documents().result).toHaveText(original!);
  expect(await state.records()).toHaveLength(0);
  await catalog.closePreview();
  await expect(catalog.previewButton("Project description")).toBeFocused();
  await catalog.search("emall");
  await expect(catalog.cards.first()).toContainText("Thoughtful email");
  await expect(catalog.card("Thoughtful email")).toBeVisible();
  await catalog.previewTemplate("Thoughtful email");
  await expect(catalog.sample).toHaveText(
    "Hello Alex,\n\nThank you for reviewing the project. Your feedback made a real difference.\n\nThank you,\nMorgan\nP.S. The next draft will be ready on Friday.",
  );
  await catalog.closePreview();
  await catalog.clearSearch();
  await expect(catalog.cards).toHaveCount(3);
  await expect(catalog.cards.first()).toContainText("Project description");
  await catalog.card("Project description").focus();
  await expect(catalog.sample).toBeVisible();
  await catalog.card("Project description").press("Tab");
  await expect(catalog.sampleStyles).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(catalog.preview).toBeHidden();
  await expect(catalog.card("Project description")).toBeFocused();
  await catalog.previewTemplate("Project description");
  await catalog.sampleVersion("Problem + solution");
  await catalog.usePreview();
  await expect(app.documents().styleRadio("Problem + solution")).toBeChecked();
  expect(await state.records()).toHaveLength(0);
  await app.documents().selectField("audience");
  await app.fieldEditor().enterAnswer("privateanswer9387");
  await catalog.search("privateanswer9387");
  await expect(catalog.cards).toHaveCount(0);
  await expect(catalog.searchStatus).toContainText("No matching templates");
  await catalog.clearSearch();
  await expect(app.fieldEditor().answer.locator).toHaveValue("privateanswer9387");
});

test("AC12 · compact, full, and local reading preferences share state without rewriting content", async ({
  app,
  page,
}) => {
  await app.templates().selectTemplate("Blank note");
  await app.documents().selectField("body");
  await app.fieldEditor().enterAnswer("A readable first line.\nA second line stays intact.");
  await app.documents().rename("Reading preferences");
  await app.panels().restoreGuidance();
  const answer = app.fieldEditor().answer;
  const identity = await answer.identity();
  await answer.selectRange(2, 9);
  const normalAnswer = await answer.fontSize();
  const normalResult = await app.documents().resultFontSize();
  const before = await downloadedText(await app.documents().export("txt"));
  await app.documents().readingSize("large");
  expect((await app.documents().resultFontSize()) / normalResult).toBeCloseTo(1.25, 2);
  const settings = app.panels().panel("settings");
  await settings.open();
  await app.settings().compactControl("fieldTextSize").selectOption("large");
  await app.settings().compactControl("browserSuggestions").uncheck();
  expect((await answer.fontSize()) / normalAnswer).toBeCloseTo(1.25, 2);
  await expect(answer.locator).toHaveAttribute("autocomplete", "off");
  expect(await answer.sameIdentity(identity)).toBe(true);
  expect(await answer.selection()).toEqual({ start: 2, end: 9 });
  await settings.close();
  const after = await downloadedText(await app.documents().export("txt"));
  expect(after).toBe(before);
  await app.settings().open();
  await expect(app.settings().control("documentTextSize")).toHaveValue("large");
  await expect(app.settings().control("fieldTextSize")).toHaveValue("large");
  await expect(app.settings().control("browserSuggestions")).not.toBeChecked();
  await app.reload();
  await app.settings().open();
  await expect(app.settings().control("documentTextSize")).toHaveValue("large");
  await app.navigation().selectDocument("Reading preferences");
  await app.documents().selectField("body");
  await expect(app.fieldEditor().answer.locator).toHaveValue(before);
  expect(await new BrowserState(page).records()).toHaveLength(1);
});
