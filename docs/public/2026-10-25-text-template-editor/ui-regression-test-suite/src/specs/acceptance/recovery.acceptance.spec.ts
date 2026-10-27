import { test, expect } from "../../framework/guided-test";
import { BrowserFaults } from "../../support/browser-faults";
import { BrowserState } from "../../support/browser-state";
import { downloadedText } from "../../support/downloads";
import { CreateGuidedDocument } from "../../flows/create-guided-document.flow";
import { projectDescription } from "../../support/test-data";

test("AC07 · recoverable failures preserve latest work and never report false success", async ({
  app,
  page,
  isolatedSession,
}) => {
  const faults = new BrowserFaults(page);
  const state = new BrowserState(page);
  const expected = "A newer partial answer that protects drafts to keep writing.";

  await test.step("A real browser quota failure preserves ongoing edits and an exact recovery payload", async () => {
    await faults.quotaFailure();
    await app.reload();
    await app.settings().select("storageMode", "local");
    await app.documents().newDocument();
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("important partial answer");
    await app.documents().rename("Recovery work");
    await app.settings().open();
    await app.navigation().selectDocument("Recovery work");
    await expect(app.documents().saveStatus).toHaveText("Save failed");
    await expect(app.panels().error).toContainText(/quota/i);
    await app.panels().collapseIssues();
    await expect(app.panels().error).toBeVisible();
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("newer partial answer");
    await expect(app.documents().saveStatus).toHaveText("Save failed");
    await expect(app.documents().copyButton).toBeDisabled();
    await app.documents().openExport();
    await expect(app.documents().exportOption("txt")).toBeDisabled();
    await page.keyboard.press("Escape");
    const recovery = await app.panels().downloadRecovery();
    expect(recovery.suggestedFilename()).toBe("Recovery work.recovery.json");
    const exported: unknown = JSON.parse(await downloadedText(recovery));
    expect(exported).toMatchObject({
      schemaVersion: 1,
      document: { title: "Recovery work", answers: { tool: "newer partial answer" } },
    });
  });
  await test.step("Retry saves the newest coherent answer; resolving required fields enables truthful export", async () => {
    await faults.restoreWrites();
    await app.panels().retryStorage();
    await app.documents().expectSaved();
    await expect(app.panels().error).toBeHidden();
    const saved = await state.localRecords();
    expect(saved).toHaveLength(1);
    expect(saved[0]?.answers).toMatchObject({ tool: "newer partial answer" });
    for (const [name, value] of [
      ["action", "protects drafts"],
      ["benefit", "keep writing"],
    ] as const) {
      await app.documents().selectField(name);
      await app.fieldEditor().enterAnswer(value);
    }
    await expect(app.documents().result).toHaveJSProperty("textContent", expected);
    await expect(app.documents().copyButton).toBeEnabled();
    expect(await downloadedText(await app.documents().export("txt"))).toBe(expected);
  });
  await test.step("An unrelated stalled search asset never blocks reopening independently saved work", async () => {
    await app.settings().open();
    await app.navigation().selectDocument("Recovery work");
    const resume = await faults.stallTemplateResource();
    try {
      await app.reload();
      await expect(app.documents().result).toHaveJSProperty("textContent", expected);
      await expect(app.templates().searchStatus).toContainText("Indexing templates");
      await app.documents().selectField("tool");
      await expect(app.fieldEditor().answer.locator).toBeEnabled();
      await faults.deniedClipboard();
      await app.documents().copy();
      await expect(app.panels().error).toContainText("Clipboard access was denied");
    } finally {
      await resume();
    }
    await expect(app.templates().searchStatus).not.toContainText("Indexing templates");
    await expect(app.panels().error).toBeVisible();
    await expect(app.panels().error).toContainText("Clipboard access was denied");
  });
  await test.step("Clipboard denial and a failed template request report actionable errors without losing unrelated work", async () => {
    await faults.deniedClipboard();
    await app.documents().copy();
    await expect(app.panels().error).toContainText("Clipboard access was denied");
    await expect(app.panels().notice).not.toHaveText(/copied/i);
    await app.documents().copy(true);
    await expect(app.panels().error).toContainText("Try Copy text");
    const restoreTemplate = await faults.blockTemplateResource(
      "blank-note.gtl",
      app.context.diagnostics,
    );
    await app.settings().open();
    await app.navigation().selectDocument("Recovery work");
    await app.reload();
    await expect(app.templates().searchStatus).toContainText("Search unavailable");
    await app.templates().previewTemplate("Blank note");
    await expect(app.templates().preview).toContainText("Sample unavailable");
    await expect(app.documents().result).toHaveJSProperty("textContent", expected);
    await app.templates().closePreview();
    await restoreTemplate();
    await app.templates().retryIndex();
    await app.templates().selectTemplate("Blank note");
    await app.navigation().selectDocument("Recovery work");
    await expect(app.documents().result).toHaveJSProperty("textContent", expected);
  });
  await test.step("Malformed current storage remains byte-for-byte intact after failed editing saves", async () => {
    const corrupt = await isolatedSession();
    const observed = new BrowserState(corrupt.context.page);
    await corrupt.settings().select("storageMode", "local");
    await observed.corruptLocalCollection("{broken");
    await corrupt.reload();
    await expect(corrupt.panels().error).toContainText("invalid JSON");
    expect(await observed.rawLocal()).toBe("{broken");
    await corrupt.documents().selectField("tool");
    await corrupt.fieldEditor().enterAnswer("recoverable despite corrupt storage");
    await corrupt.settings().open();
    await expect(corrupt.panels().error).toContainText("invalid JSON");
    expect(await observed.rawLocal()).toBe("{broken");
  });
  await test.step("An unavailable cold-start catalog has a visible retry that genuinely recovers", async () => {
    const cold = await isolatedSession();
    const restoreManifest = await new BrowserFaults(cold.context.page).blockTemplateResource(
      "manifest.json",
      cold.context.diagnostics,
    );
    await cold.reloadExpectingUnavailableCatalog();
    await restoreManifest();
    await cold.templates().retryStartup();
    await cold.documents().selectField("tool");
    await cold.fieldEditor().enterAnswer("working after catalog retry");
    await expect(cold.documents().result).toContainText("working after catalog retry");
  });
  await test.step("Unavailable worker storage and blocked preferences still permit genuine writing and export", async () => {
    const offlineStorage = await isolatedSession();
    await new BrowserFaults(offlineStorage.context.page).unavailableWorker();
    await offlineStorage.reload();
    await expect(offlineStorage.panels().error).toContainText("Could not start browser storage");
    await new CreateGuidedDocument(
      offlineStorage.documents(),
      offlineStorage.templates(),
      offlineStorage.fieldEditor(),
    ).run(projectDescription);
    expect(await downloadedText(await offlineStorage.documents().export("txt"))).toBe(
      projectDescription.text,
    );
    const blocked = await isolatedSession();
    await new BrowserFaults(blocked.context.page).blockedPreferences();
    await blocked.reload();
    await expect(blocked.panels().error).toContainText("Preferences could not be read");
    await blocked.documents().selectField("tool");
    await blocked.fieldEditor().enterAnswer("still editable");
    await expect(blocked.documents().result).toContainText("still editable");
  });
});
