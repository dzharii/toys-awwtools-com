import { test, expect } from "../../framework/guided-test";
import { PersistDocument } from "../../flows/persist-document.flow";
import { ResolveDocumentConflict } from "../../flows/resolve-document-conflict.flow";
import { BrowserState } from "../../support/browser-state";
import { authoringExamples } from "../../support/test-data";

test("AC05 · real stores, competing tabs, source refresh, and ephemeral work remain coherent", async ({
  app,
  page,
  newTab,
  isolatedSession,
}) => {
  const state = new BrowserState(page);
  const persist = new PersistDocument(app.documents(), app.navigation(), app.settings());
  let indexedIds: unknown[] = [];
  let localIds: unknown[] = [];

  await test.step("IndexedDB work survives reload; a stale tab preserves its own conflict copy", async () => {
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("indexed seed");
    await app.documents().rename("Shared indexed work");
    await persist.run("Shared indexed work");
    await app.reload();
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("indexed seed");
    const peer = await newTab();
    await peer.documents().selectField("tool");
    await expect(peer.fieldEditor().answer.locator).toHaveValue("indexed seed");
    await new ResolveDocumentConflict(app, peer).run(
      "Shared indexed work",
      "indexed winner",
      "indexed local work",
      "copy",
    );
    expect(await state.records()).toHaveLength(2);
    await peer.context.page.close();
    indexedIds = (await state.records()).map((record) => record.id).sort();
  });
  await test.step("Clean authoring refreshes the visible source with its revision; conflicting source stays recoverable", async () => {
    await app.authoring().open();
    await app.authoring().editSource(authoringExamples.shared);
    await app.authoring().rename("Shared source");
    await app.authoring().save();
    const peer = await newTab();
    await peer.authoring().open();
    await peer.authoring().selectDraft("Shared source");
    await expect(peer.authoring().source).toHaveValue(authoringExamples.shared);
    await app.authoring().editSource(authoringExamples.sharedLatest);
    await app.authoring().save();
    await app.settings().select("storageMode", "memory");
    await expect(peer.authoring().source).toBeDisabled();
    await app.settings().select("storageMode", "indexeddb");
    await expect(peer.authoring().source).toBeEnabled();
    await expect(peer.authoring().source).toHaveValue(authoringExamples.sharedLatest);
    const newest = "TEMPLATE: Shared source\nTEXT:\n  Updated and retained by the second tab.";
    await app.authoring().open();
    const local = "TEMPLATE: Shared source\nTEXT:\n  A conflicting local source.";
    await app.authoring().editSource(local);
    await peer.authoring().editSource(newest);
    await peer.authoring().save();
    await app.authoring().requestSave();
    await expect(app.authoring().saveStatus).toHaveText("Save conflict");
    await expect(app.authoring().source).toHaveValue(local);
    await app.panels().preserveLocalCopy(true);
    await expect(app.authoring().saveStatus).toHaveText("Saved");
    await expect(app.authoring().source).toHaveValue(local);
    expect(await state.records("authoringDrafts")).toHaveLength(2);
    await expect(peer.authoring().source).toHaveValue(newest);
    await peer.context.page.close();
  });
  await test.step("A different store makes old work read-only and gives new local work real durability", async () => {
    await app.settings().select("storageMode", "local");
    await app.navigation().selectDocument("Shared indexed work");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toBeDisabled();
    await expect(app.documents().renameButton()).toBeDisabled();
    await app.documents().newDocument();
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("local seed");
    await app.documents().rename("Shared local work");
    await persist.run("Shared local work");
    expect(await state.localRecords()).toHaveLength(1);
    await app.reload();
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("local seed");
    const peer = await newTab();
    await new ResolveDocumentConflict(app, peer).run(
      "Shared local work",
      "local winner",
      "local conflicting answer",
      "latest",
    );
    expect(await state.localRecords()).toHaveLength(1);
    await peer.context.page.close();
    localIds = (await state.localRecords()).map((record) => record.id);
  });
  await test.step("Memory-only document and source remain usable in this tab, then disappear on reload", async () => {
    await app.settings().select("storageMode", "memory");
    await app.documents().newDocument();
    await app.documents().selectField("tool");
    await app.fieldEditor().enterAnswer("ephemeral tool");
    await app.documents().rename("Memory document");
    await persist.run("Memory document", true);
    await app.authoring().newTemplate();
    await app.authoring().editSource("TEMPLATE: Memory source\nTEXT:\n  Ephemeral source.");
    await app.authoring().save(true);
    await expect(app.authoring().checkpoints).toHaveCount(1);
    await expect(app.authoring().historyNavigation).toContainText(
      "History is session-only in this tab.",
    );
    expect(await state.rawLocal("authoring")).toBeNull();
    expect((await state.records()).map((record) => record.id).sort()).toEqual(indexedIds);
    expect((await state.localRecords()).map((record) => record.id)).toEqual(localIds);
    await app.reload();
    await expect(app.navigation().rows).toHaveCount(0);
    await expect(app.fieldEditor().answer.locator).toHaveCount(0);
    await app.authoring().open();
    await expect(app.authoring().source).not.toHaveValue(/Ephemeral source/);
    await expect(app.authoring().checkpoints).toHaveCount(0);
    expect(await state.records("authoringDrafts")).toHaveLength(2);
  });
  await test.step("Returning to each persistent store restores the right work; a fresh context inherits none of it", async () => {
    await app.settings().select("storageMode", "indexeddb");
    await app.navigation().selectDocument("Shared indexed work");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("indexed winner");
    await app.settings().select("storageMode", "local");
    await app.navigation().selectDocument("Shared local work");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("local winner");
    const independent = await isolatedSession();
    await expect(independent.navigation().rows).toHaveCount(0);
    expect(await new BrowserState(independent.context.page).records()).toHaveLength(0);
    expect(await independent.settings().appearance()).toMatchObject({
      theme: "dark",
      density: "comfortable",
    });
    await expect(independent.panels().root).toHaveAttribute("data-visibility", "closed");
  });
});
