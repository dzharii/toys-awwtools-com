import { test, expect } from "../../framework/guided-test";
import { BrowserState } from "../../support/browser-state";
import { BrowserFaults } from "../../support/browser-faults";
import { downloadedText } from "../../support/downloads";

test("AC14 · immutable source history preserves native undo and protects current source before restore", async ({
  app,
  page,
}) => {
  const state = new BrowserState(page);
  const faults = new BrowserFaults(page);
  await app.settings().select("storageMode", "local");
  await app.settings().autosaveSeconds("3600");
  await app.authoring().newTemplate();
  await app.authoring().editSource("TEMPLATE: Logical source\nTEXT:\n  First exact source.");
  await app.authoring().rename("Research draft");
  await app.authoring().renameTemplateName("Renamed logical source");
  const first = "TEMPLATE: Renamed logical source\nTEXT:\n  First exact source.";
  await expect(app.authoring().source).toHaveValue(first);
  await app.authoring().save();
  const original = (await state.localRecords("authoring"))[0];
  expect(original?.title).toBe("Research draft");
  await expect(app.authoring().title).toHaveText("Research draft");
  await expect(app.authoring().breadcrumb).toContainText("Research draft");
  const second = "TEMPLATE: Renamed logical source\nTEXT:\n  {{$unfinished}\n";
  await app.authoring().editSource(second);
  await app.authoring().save();
  await app.authoring().save();
  await expect(app.authoring().checkpoints).toHaveCount(2);
  await app.authoring().source.press("Control+End");
  await app.authoring().source.pressSequentially("!");
  await app.authoring().inspectOldest();
  await expect(app.authoring().source).toBeHidden();
  await expect(app.authoring().inspectedSource).toHaveAttribute("readonly", "");
  await expect(app.authoring().inspectedSource).toHaveValue(first);
  expect(await downloadedText(await app.authoring().downloadSource())).toBe(first);
  await app.authoring().backToCurrent();
  await expect(app.authoring().inspectedSource).toBeHidden();
  await expect(app.authoring().source).toHaveValue(second + "!");
  await app.authoring().source.press("Control+z");
  await expect(app.authoring().source).toHaveValue(second);
  await app.authoring().source.press("Control+End");
  await app.authoring().source.pressSequentially("?");
  const protectedSource = second + "?";
  await faults.denyCheckpointsAfter(2);
  await app.authoring().inspectOldest();
  await app.authoring().restoreInspected();
  await expect(app.panels().error).toBeVisible();
  await app.authoring().backToCurrent();
  await expect(app.authoring().source).toHaveValue(protectedSource);
  await expect(app.authoring().checkpoints).toHaveCount(2);
  expect((await state.localRecords("authoring"))[0]?.source).toBe(second);
  await faults.restoreCheckpointWrites();
  await app.authoring().inspectOldest();
  await app.authoring().restoreInspected();
  await expect(app.authoring().source).toHaveValue(first);
  await expect(app.authoring().checkpoints).toHaveCount(3);
  const restored = (await state.localRecords("authoring"))[0];
  expect(restored?.id).toBe(original?.id);
  expect(restored?.source).toBe(first);
  expect(restored?.checkpoints).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ kind: "pre-restore", source: protectedSource }),
      expect.objectContaining({ kind: "explicit", source: second }),
    ]),
  );
  await app.reload();
  await app.authoring().open();
  await app.authoring().selectDraft("Research draft");
  await expect(app.authoring().source).toHaveValue(first);
  await expect(app.authoring().checkpoints).toHaveCount(3);
});

test("AC15 · a checkpoint failure never claims history success or loses successfully saved source", async ({
  app,
  page,
}) => {
  const state = new BrowserState(page);
  const faults = new BrowserFaults(page);
  await app.settings().select("storageMode", "local");
  await app.authoring().newTemplate();
  const first = "TEMPLATE: Checkpoint failure\nTEXT:\n  Original source.";
  await app.authoring().editSource(first);
  await app.authoring().rename("Checkpoint failure");
  await app.authoring().save();
  await faults.denyCheckpointsAfter(1);
  const second = first + "\n  A newer exact line.";
  await app.authoring().editSource(second);
  await app.authoring().requestSave();
  await expect(app.panels().error).toContainText("checkpoint could not be saved");
  await expect(app.authoring().saveStatus).toHaveText("Saved");
  await expect(app.panels().notice).not.toContainText("checkpoint created");
  const saved = (await state.localRecords("authoring"))[0];
  expect(saved?.source).toBe(second);
  expect(saved?.checkpoints).toEqual([expect.objectContaining({ source: first })]);
  await faults.restoreCheckpointWrites();
  await app.authoring().save();
  await expect(app.authoring().checkpoints).toHaveCount(2);
  await expect(app.panels().error).toBeHidden();
});

test("AC16 · authoring autosave preserves navigation focus without generating extra checkpoints", async ({
  app,
  page,
}) => {
  await page.clock.install();
  await app.settings().autosaveSeconds("1");
  await app.authoring().newTemplate();
  await app.authoring().rename("Autosave focus");
  await app.authoring().editSource("TEMPLATE: Autosave\nTEXT:\n  First source.");
  await app.authoring().save();
  await app.authoring().editSource("TEMPLATE: Autosave\nTEXT:\n  Newer automatic source.");
  await app.authoring().draftButton("Autosave focus").focus();
  await page.clock.runFor(1000);
  await expect(app.authoring().saveStatus).toHaveText("Saved");
  await expect(app.authoring().draftButton("Autosave focus")).toBeFocused();
  await expect(app.authoring().checkpoints).toHaveCount(1);
  expect((await new BrowserState(page).records("authoringDrafts"))[0]?.source).toContain(
    "Newer automatic source.",
  );
  await app.authoring().openFullSettings();
  await expect(app.settings().root).toBeVisible();
  await app.authoring().newFromNavigation();
  await expect(app.authoring().source).toBeFocused();
  await expect(app.authoring().title).toHaveText("Untitled template");
});
