import { test, expect } from "../../framework/guided-test";
import { authoringExamples } from "../../support/test-data";
import { BrowserState } from "../../support/browser-state";
import { downloadedText } from "../../support/downloads";

test("AC04 · invalid and valid GTL source is preserved independently from preview answers and documents", async ({
  app,
  page,
}, testInfo) => {
  const state = new BrowserState(page);
  let identity: unknown;
  await test.step("Source editing begins with real focus and saves/downloads exact invalid bytes", async () => {
    await app.authoring().open();
    await app.authoring().expectDefaultState();
    expect(await state.records("authoringDrafts")).toHaveLength(0);
    await app.authoring().editSource(authoringExamples.invalid);
    await app.authoring().rename("Broken draft");
    await expect(app.authoring().diagnostics).toContainText("Unclosed placeholder reference");
    await app.authoring().save();
    const records = await state.records("authoringDrafts");
    expect(records).toHaveLength(1);
    expect(records[0]?.source).toBe(authoringExamples.invalid);
    identity = records[0]?.id;
    const download = await app.authoring().downloadSource();
    expect(download.suggestedFilename()).toBe("Broken draft.gtl");
    expect(await downloadedText(download)).toBe(authoringExamples.invalid);
    await app.authoring().goToDiagnostic(/Unclosed placeholder reference/);
    await expect(app.authoring().source).toBeFocused();
    await app.panels().activateIssue(/Unclosed placeholder reference/);
    await expect(app.authoring().source).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath("authoring-diagnostics.png"),
      fullPage: true,
    });
  });
  await test.step("Reload restores invalid source; native undo and field removal/recreation remain usable", async () => {
    await app.reload();
    await app.authoring().open();
    await app.authoring().selectDraft("Broken draft");
    await expect(app.authoring().source).toHaveValue(authoringExamples.invalid);
    await app.authoring().editSource(authoringExamples.greeting);
    await app.authoring().source.press("Control+End");
    await app.authoring().source.pressSequentially(" ");
    await app.authoring().source.press("Control+z");
    await expect(app.authoring().source).toHaveValue(authoringExamples.greeting);
    await app.authoring().editSource(authoringExamples.greetingWithoutField);
    await expect(app.fieldEditor().answer.locator).toHaveCount(0);
    await app.authoring().editSource(authoringExamples.greeting);
    await app.authoring().selectField("name");
    await app.fieldEditor().expectField("name");
    await app.fieldEditor().enterAnswer("Morgan");
    await expect(app.authoring().result).toHaveJSProperty("textContent", "Hello Morgan.");
  });
  await test.step("Prototype-like field names and explicit choices render safely before a two-version draft is saved", async () => {
    await app.authoring().editSource(authoringExamples.prototypeAndChoice);
    await expect(app.authoring().placeholder("constructor")).toHaveText("$constructor");
    await app.authoring().selectField("tone");
    await expect(app.fieldEditor().answer.locator).toHaveValue("");
    await app.fieldEditor().enterAnswer("warm");
    await expect(app.authoring().placeholder("tone")).toHaveText("A warm message");
    await expect(app.authoring().result).toHaveJSProperty("textContent", "A warm message.");
    await app.authoring().editSource(authoringExamples.versionedGreeting);
    await app.authoring().selectPreviewVersion("Formal");
    await app.authoring().selectField("name");
    await app.fieldEditor().enterAnswer("Morgan");
    await expect(app.authoring().result).toHaveJSProperty("textContent", "Dear Morgan.");
    await app.authoring().rename("Greeting");
    await app.authoring().save();
    expect(
      (await state.records("authoringDrafts")).find((record) => record.id === identity)?.source,
    ).toBe(authoringExamples.versionedGreeting);
    expect(await state.records()).toHaveLength(0);
  });
  await test.step("Preview answers do not persist, and deleting a disposable copy preserves the real draft and built-ins", async () => {
    await app.reload();
    await app.authoring().open();
    await app.authoring().selectDraft("Greeting");
    await expect(app.authoring().source).toHaveValue(authoringExamples.versionedGreeting);
    await app.authoring().selectField("name");
    await expect(app.fieldEditor().answer.locator).toHaveValue("");
    await app.authoring().selectBundled("project-description");
    await expect(app.authoring().inspectedSource).toHaveValue(/TEMPLATE: Project description/);
    await app.authoring().createEditableCopy();
    await app
      .authoring()
      .editSource("TEMPLATE: Disposable draft\nTEXT:\n  A temporary local copy.");
    await app.authoring().rename("Disposable draft");
    await app.authoring().save();
    const before = await state.records("authoringDrafts");
    await app.authoring().deleteDraft();
    await app.confirmation.expectIdentity("Disposable draft");
    await app.confirmation.cancel();
    expect(await state.records("authoringDrafts")).toHaveLength(before.length);
    await app.authoring().deleteDraft();
    await app.confirmation.confirm();
    await expect.poll(() => state.records("authoringDrafts")).toHaveLength(before.length - 1);
    expect(
      (await state.records("authoringDrafts")).find((record) => record.id === identity)?.source,
    ).toBe(authoringExamples.versionedGreeting);
    await app.documents().newDocument();
    await app.templates().selectTemplate("Project description");
    expect(await app.documents().writingStyles()).toEqual([
      "Purpose + function",
      "Problem + solution",
      "Input + processing + output",
      "Features + technology",
      "Structured project profile",
    ]);
    expect(await state.records()).toHaveLength(0);
  });
});
