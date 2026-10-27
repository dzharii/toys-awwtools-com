import { test, expect } from "../../framework/guided-test";
import { expectAccessible } from "../../support/accessibility";
import { downloadedText } from "../../support/downloads";

test("AC06 · native keyboard editing, literal multiline output, light dismissal, and responsive accessibility", async ({
  app,
  page,
}, testInfo) => {
  await app.start("/editor/");
  await test.step("Keyboard version changes and boundary navigation preserve focus, selections, modifiers, and composition guards", async () => {
    await expectAccessible(page);
    await app.documents().styleRadio("Purpose + function").press("ArrowDown");
    await expect(app.documents().styleRadio("Problem + solution")).toBeFocused();
    await expect(app.documents().style).toHaveValue("version-2");
    await app.documents().selectWritingStyle("Input + processing + output");
    await app.documents().selectField("input");
    await app.fieldEditor().expectField("input");
    await app.fieldEditor().enterAnswer("data");
    await app.fieldEditor().answer.locator.press("End");
    await app.fieldEditor().answer.locator.press("ArrowRight");
    await app.fieldEditor().expectField("processing");
    await app.fieldEditor().enterAnswer("process");
    await app.fieldEditor().answer.selectRange(0, 7);
    await app.fieldEditor().answer.locator.press("ArrowLeft");
    await app.fieldEditor().expectField("processing");
    await app.fieldEditor().answer.locator.press("Control+ArrowLeft");
    await app.fieldEditor().expectField("processing");
    await app.fieldEditor().answer.composing(true);
    await app.fieldEditor().answer.locator.press("Home");
    await app.fieldEditor().answer.locator.press("ArrowLeft");
    await app.fieldEditor().expectField("processing");
    await app.fieldEditor().answer.composing(false);
    await app.fieldEditor().answer.locator.press("ArrowLeft");
    await app.fieldEditor().expectField("input");
    await expect(app.fieldEditor().answer.locator).toHaveValue("data");
    await app.fieldEditor().answer.locator.press("End");
    await app.fieldEditor().answer.locator.pressSequentially("!");
    await app.fieldEditor().answer.locator.press("Control+z");
    await expect(app.fieldEditor().answer.locator).toHaveValue("data");
    await app.fieldEditor().answer.locator.press("Tab");
    await expect(app.fieldEditor().answer.locator).not.toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await app.fieldEditor().expectDefaultState();
    await app.documents().selectField("input");
    await expect(app.fieldEditor().answer.locator).toHaveValue("data");
    await expect(app.fieldEditor().previous).toBeDisabled();
    await app.documents().rename("Keyboard draft");
    await app.settings().autosaveSeconds("1");
    await app.navigation().selectDocument("Keyboard draft");
    await app.documents().selectField("input");
    await app.fieldEditor().enterAnswer("keyboard-friendly input");
    await app.navigation().newButton.press("Tab");
    await app.navigation().filterControl().press("Tab");
    await expect(app.navigation().documentButton("Keyboard draft")).toBeFocused();
    await app.documents().expectSaved();
    await expect(app.navigation().documentButton("Keyboard draft")).toBeFocused();
  });
  await test.step("Blank notes and email preserve real newlines and choice labels without rendering authored HTML", async () => {
    await app.templates().selectTemplate("Blank note");
    await app.documents().selectField("body");
    await app.fieldEditor().enterAnswer("First line\n\nLast line");
    await expect(app.fieldEditor().answer.locator).toHaveJSProperty("tagName", "TEXTAREA");
    await app.fieldEditor().answer.locator.press("Home");
    await app.fieldEditor().answer.locator.press("ArrowUp");
    await app.fieldEditor().expectDefaultState();
    await expect(app.documents().result).toHaveJSProperty("textContent", "First line\n\nLast line");
    await app.templates().selectTemplate("Thoughtful email");
    for (const [name, value] of [
      ["name", "Alex"],
      ["message", "One clear idea.\nA second line."],
      ["sender", "Morgan"],
    ] as const) {
      await app.documents().selectField(name);
      await app.fieldEditor().enterAnswer(value);
    }
    await app.documents().selectField("message");
    await app.fieldEditor().answer.locator.press("Home");
    await app.fieldEditor().answer.locator.press("ArrowUp");
    await app.fieldEditor().expectField("message");
    await app.documents().selectField("closing");
    await expect(app.fieldEditor().answer.locator).toHaveValue("");
    await app.fieldEditor().enterAnswer("regards");
    await expect(app.documents().result).toHaveJSProperty(
      "textContent",
      "Hello Alex,\n\nOne clear idea.\nA second line.\n\nKind regards,\nMorgan\n",
    );
    await expect(app.documents().copyButton).toBeEnabled();
    await app.documents().selectField("notes");
    await app.fieldEditor().enterAnswer("P.S. <script>not executable</script> & text.");
    expect(await app.documents().executableResultElements()).toBe(0);
    const html = await downloadedText(await app.documents().export("html"));
    expect(html).toContain("&lt;script&gt;not executable&lt;/script&gt; &amp; text.");
    expect(html).not.toContain("<script>");
  });
  await test.step("Escape restores trigger focus; an outside click still performs the intended rename", async () => {
    await app.documents().openExport();
    await page.keyboard.press("Escape");
    await expect(app.documents().exportOption("txt")).toBeHidden();
    await expect(app.documents().exportButton).toBeFocused();
    await app.documents().openExport();
    await app.documents().rename("Mobile email");
    await expect(app.documents().title).toHaveText("Mobile email");
    await expect(app.documents().exportOption("txt")).toBeHidden();
  });
  await test.step("Mobile and short viewports retain an accessible editor and close navigation after a real selection", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await app.documents().selectField("message");
    await app.fieldEditor().expectField("message");
    const bounds = await app.fieldEditor().answer.locator.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(391);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
    const main = await app.documents().mainViewport.boundingBox();
    const guidance = await app.panels().root.boundingBox();
    expect(main!.height).toBeGreaterThan(400);
    expect(guidance!.y).toBeGreaterThanOrEqual(0);
    expect(guidance!.y + guidance!.height).toBeLessThanOrEqual(844);
    await expect(app.panels().root).toHaveAttribute("data-effective", "overlay");
    await app.documents().expectNoHorizontalOverflow();
    await expectAccessible(page);
    await page.screenshot({ path: testInfo.outputPath("mobile-editor.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 520 });
    await app.documents().selectField("message");
    const short = await app.fieldEditor().answer.locator.boundingBox();
    expect(short!.y + short!.height).toBeLessThanOrEqual(520);
    await app.navigation().open();
    await expect(app.navigation().drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(app.navigation().drawer).toBeHidden();
    await expect(app.navigation().menu).toBeFocused();
    await app.settings().open();
    await expect(app.navigation().drawer).toBeHidden();
    await app.settings().expectDefaultState();
    await expectAccessible(page);
    await app.authoring().open();
    await app.authoring().expectDefaultState();
    await expectAccessible(page);
  });
});
