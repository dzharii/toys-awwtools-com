import { test, expect } from "../../framework/guided-test";
import { CreateGuidedDocument } from "../../flows/create-guided-document.flow";
import { PersistDocument } from "../../flows/persist-document.flow";
import { projectDescription } from "../../support/test-data";
import { BrowserState } from "../../support/browser-state";
import { BrowserFaults } from "../../support/browser-faults";
import { downloadedText } from "../../support/downloads";

test("AC01 · independent answers become a durable, correctly copied and exported document", async ({
  app,
  page,
  context,
}, testInfo) => {
  const state = new BrowserState(page);
  const persist = new PersistDocument(app.documents(), app.navigation(), app.settings());
  const title = "JSON formatter description";
  let identity: string | null = null;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await test.step("Untouched and reverted previews never create saved work", async () => {
    expect(await state.records()).toHaveLength(0);
    await app.documents().selectWritingStyle(projectDescription.style);
    await app.documents().selectField("processing");
    await app.fieldEditor().expectField("processing");
    await app.fieldEditor().enterAnswer("discarded");
    await app.fieldEditor().enterAnswer("");
    await app.settings().open();
    expect(await state.records()).toHaveLength(0);
    await app.reload();
    await expect(app.navigation().rows).toHaveCount(0);
  });
  await test.step("Nonsequential fields, examples, and edits produce the independently specified text", async () => {
    await new CreateGuidedDocument(app.documents(), app.templates(), app.fieldEditor()).run(
      projectDescription,
    );
    await app.documents().selectField("input");
    await app.fieldEditor().copyExample();
    await expect.poll(() => state.clipboardText()).toBe("pasted JSON");
    await app.fieldEditor().enterAnswer("unformatted data");
    await app.fieldEditor().useExample();
    await expect(app.fieldEditor().answer.locator).toHaveValue("pasted JSON");
    await app.fieldEditor().enterAnswer("pasted JSON with trailing context");
    await app.fieldEditor().enterAnswer("pasted JSON");
    await expect(app.documents().result).toHaveJSProperty("textContent", projectDescription.text);
    await expect(app.documents().wordCount).toHaveText("14 words");
    await app.documents().rename(title);
    identity = await app.navigation().row(title).getAttribute("data-document-id");
    expect(identity).toBeTruthy();
    await persist.run(title);
    expect(await state.records()).toHaveLength(1);
  });
  await test.step("Reload restores exact output and representative answers under the same identity", async () => {
    await app.reload();
    await expect(app.documents().title).toHaveText(title);
    await expect(app.documents().result).toHaveJSProperty("textContent", projectDescription.text);
    await expect(app.navigation().row(title)).toHaveAttribute("data-document-id", identity!);
    for (const [name, value] of projectDescription.answers) {
      await app.documents().selectField(name);
      await app.fieldEditor().expectField(name);
      await expect(app.fieldEditor().answer.locator).toHaveValue(value);
    }
    await app.documents().selectWritingStyle("Purpose + function");
    await app.documents().selectField("tool");
    await expect(app.fieldEditor().answer.locator).toHaveValue("");
    await app.fieldEditor().enterAnswer("separate tool");
    await persist.run("Purpose + function");
    await app.documents().selectWritingStyle(projectDescription.style);
    await expect(app.documents().result).toHaveJSProperty("textContent", projectDescription.text);
    expect(await state.records()).toHaveLength(2);
  });
  await test.step("Real clipboard flavors and all downloads contain finished words, not UI", async () => {
    await app.documents().copy();
    await expect.poll(() => state.clipboardText()).toBe(projectDescription.text);
    await app.documents().copy(true);
    await expect(app.panels().notice).toHaveText("Rich text copied.");
    const clipboard = await state.richClipboard();
    expect(clipboard.types).toEqual(expect.arrayContaining(["text/plain", "text/html"]));
    expect(clipboard.text).toBe(projectDescription.text);
    expect(clipboard.html).toContain(projectDescription.htmlFragment);
    for (const format of ["txt", "md", "html"] as const) {
      const download = await app.documents().export(format);
      expect(download.suggestedFilename()).toBe(`${title}.${format}`);
      const bytes = await downloadedText(download);
      if (format === "txt") expect(bytes).toBe(projectDescription.text);
      else if (format === "md") expect(bytes).toBe(projectDescription.markdown);
      else
        expect(bytes).toBe(
          `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body>\n${projectDescription.htmlFragment}\n</body></html>\n`,
        );
      expect(bytes).not.toContain("Field notes");
    }
    await page.screenshot({
      path: testInfo.outputPath("desktop-completed-document.png"),
      fullPage: true,
    });
  });
  await test.step("A deployed replacement affects new work but not a saved template snapshot", async () => {
    await new BrowserFaults(page).replaceBundledTemplate(
      "TEMPLATE: Project description\nTEXT:\n  A completely different deployed template.",
    );
    await app.reload();
    await app.templates().selectTemplate("Project description");
    await expect(app.documents().result).toHaveText("A completely different deployed template.");
    await app.navigation().selectDocument(title);
    await expect(app.documents().result).toHaveJSProperty("textContent", projectDescription.text);
    await expect(app.documents().style).toHaveValue("version-3");
  });
});
