import { test, expect } from "../../framework/guided-test";
import { BrowserState } from "../../support/browser-state";
import { downloadedText } from "../../support/downloads";

for (const mode of ["indexeddb", "local", "memory"] as const) {
  test(`AC13 · archive, Undo, duplicate identities, Recent, and deletion in ${mode}`, async ({
    app,
    page,
  }) => {
    const state = new BrowserState(page);
    await app.settings().select("storageMode", mode);
    await app.settings().autosaveSeconds("3600");
    await app.settings().recentLimit("1");
    await app.documents().newDocument();
    await app.templates().selectTemplate("Blank note");
    await app.documents().selectField("body");
    await app.fieldEditor().enterAnswer("First independent note.");
    await app.documents().rename("  Same title  ");
    await app.settings().open();
    await app.navigation().open();
    const first = await app.navigation().row("Same title").getAttribute("data-document-id");
    if (!first) throw new Error("Saved navigation did not expose a stable record identity.");
    await app.documents().newDocument();
    await app.templates().selectTemplate("Blank note");
    await app.documents().selectField("body");
    await app.fieldEditor().enterAnswer("Second independent note.");
    await app.documents().rename("Same title");
    await app.settings().open();
    await app.navigation().filter("recent");
    await expect(app.navigation().rows).toHaveCount(1);
    const second = await app.navigation().rows.first().getAttribute("data-document-id");
    expect(second).not.toBe(first);
    if (!second) throw new Error("Second document identity is missing.");
    await app.navigation().filter("active");
    await expect(app.navigation().row("Same title")).toHaveCount(2);
    await app.navigation().selectById(first);
    await app.documents().selectField("body");
    await expect(app.fieldEditor().answer.locator).toHaveValue("First independent note.");
    await app.fieldEditor().enterAnswer("Latest unsaved content before archive.");
    await app.navigation().archiveById(first);
    await expect(app.navigation().rowById(first)).toHaveCount(0);
    await expect(app.documents().result).toHaveText("Second independent note.");
    await app.panels().undo();
    await expect(app.navigation().rowById(first)).toBeVisible();
    await expect(app.documents().result).toHaveText("Latest unsaved content before archive.");
    await app.navigation().archiveById(first);
    await app.navigation().filter("archived");
    await expect(app.navigation().rows).toHaveCount(1);
    await app.navigation().selectById(first);
    await app.documents().selectField("body");
    await app.fieldEditor().enterAnswer("An archived note remains editable.");
    expect(await downloadedText(await app.documents().export("txt"))).toBe(
      "An archived note remains editable.",
    );
    await app.navigation().archiveById(first);
    await expect(app.navigation().rows).toHaveCount(0);
    await app.navigation().filter("active");
    await expect(app.navigation().rows).toHaveCount(2);
    await app.navigation().deleteById(first);
    await app.confirmation.expectIdentity("Same title");
    await expect(app.confirmation.root).toContainText(first);
    await app.confirmation.cancel();
    await expect(app.navigation().rowById(first)).toBeVisible();
    await app.navigation().deleteById(first);
    await app.confirmation.confirm();
    await expect(app.navigation().rowById(first)).toHaveCount(0);
    await expect(app.navigation().rowById(second)).toBeVisible();
    await app.navigation().selectById(second);
    await expect(app.documents().result).toHaveText("Second independent note.");
    if (mode === "memory") {
      expect(await state.records()).toHaveLength(0);
      expect(await state.localRecords()).toHaveLength(0);
      await app.reload();
      await expect(app.navigation().rows).toHaveCount(0);
    } else {
      await app.reload();
      const records = mode === "indexeddb" ? await state.records() : await state.localRecords();
      expect(records).toHaveLength(1);
      expect(records[0]?.id).toBe(second);
      expect(records[0]?.archivedAt).toBeUndefined();
      await expect(app.documents().result).toHaveText("Second independent note.");
    }
  });
}
