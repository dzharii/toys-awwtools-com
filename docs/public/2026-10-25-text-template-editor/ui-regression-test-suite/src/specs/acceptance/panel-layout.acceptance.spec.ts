import { test, expect } from "../../framework/guided-test";
import { PanelControls } from "../../page-components/panel-controls";
import { BrowserState } from "../../support/browser-state";
import { BrowserFaults } from "../../support/browser-faults";
import { expectAccessible } from "../../support/accessibility";

test("AC08 · real panel manipulation preserves native editing and recovers shared dock space", async ({
  app,
  page,
}) => {
  const state = new BrowserState(page);
  const field = app.panels().panel("field");
  const issues = app.panels().panel("issues");
  await app.settings().autosaveSeconds("3600");
  await app.documents().newDocument();
  await app.templates().selectTemplate("Project description");
  await app.documents().selectField("tool");
  await app.fieldEditor().enterAnswer("native answer");
  const answer = app.fieldEditor().answer;
  const identity = await answer.identity();
  await answer.selectRange(2, 7);
  await answer.composing(true);
  await state.observeEffects();
  const before = (await field.root.boundingBox())!;
  await field.drag(-80, -25);
  const moved = (await field.root.boundingBox())!;
  expect(moved.x).toBeCloseTo(before.x - 80, 0);
  expect(moved.y).toBeCloseTo(before.y - 25, 0);
  expect(await answer.selection()).toEqual({ start: 2, end: 7 });
  await expect(answer.locator).toBeFocused();
  expect(await answer.sameIdentity(identity)).toBe(true);
  expect(await state.effects()).toEqual({
    layoutWrites: 1,
    contentTransactions: 0,
    workerMessages: 0,
  });
  await answer.composing(false);
  await field.resize(60, -40);
  const resized = (await field.root.boundingBox())!;
  expect(resized.width).toBeCloseTo(moved.width + 60, 0);
  expect(resized.height).toBeCloseTo(moved.height - 40, 0);
  const settled = await state.layoutBytes();
  const effects = await state.effects();
  await field.drag(2, 0);
  expect(await state.layoutBytes()).toBe(settled);
  expect(await state.effects()).toEqual(effects);
  await answer.locator.press("End");
  await answer.locator.pressSequentially("!");
  await field.command("right");
  expect(await answer.sameIdentity(identity)).toBe(true);
  await expect(answer.locator).toBeFocused();
  await answer.locator.press("Control+z");
  await expect(answer.locator).toHaveValue("native answer");
  await issues.open();
  await issues.command("right");
  await expect(field.root).toBeHidden();
  await field.dockTab("right").click();
  await expect(field.dockTab("right")).toBeFocused();
  await field.dockTab("right").press("ArrowRight");
  await expect(issues.dockTab("right")).toBeFocused();
  await expect(issues.root).toBeVisible();
  await field.tab("right");
  const dock = (await field.root.boundingBox())!;
  await field.resize(-60, 0, "dock");
  const wider = (await field.root.boundingBox())!;
  expect(wider.width).toBeCloseTo(dock.width + 60, 0);
  const narrowCenter = (await app.documents().mainViewport.boundingBox())!.width;
  await field.collapse();
  expect((await issues.root.boundingBox())!.width).toBeCloseTo(wider.width, 0);
  expect((await app.documents().mainViewport.boundingBox())!.width).toBeCloseTo(narrowCenter, 0);
  await issues.collapse();
  expect((await app.documents().mainViewport.boundingBox())!.width - narrowCenter).toBeCloseTo(
    wider.width,
    0,
  );
  await field.restoreAtEdge();
  await expect(answer.locator).toHaveValue("native answer");
  expect(await answer.sameIdentity(identity)).toBe(true);
  await field.close();
  await field.open();
  await expect(answer.locator).toHaveValue("native answer");
  await field.command("floating");
  const keyboard = (await field.root.boundingBox())!;
  await field.grip().press("ArrowLeft");
  expect((await field.root.boundingBox())!.x).toBeCloseTo(keyboard.x - 10, 0);
  await field.grip().press("Alt+ArrowRight");
  expect((await field.root.boundingBox())!.width).toBeCloseTo(keyboard.width + 10, 0);
  await field.drag(-5000, -5000);
  const clamped = (await field.root.boundingBox())!;
  expect(clamped.x).toBeGreaterThanOrEqual(0);
  expect(clamped.y).toBeGreaterThanOrEqual(0);
  await field.resize(5000, 5000);
  const maximum = (await field.root.boundingBox())!;
  expect(maximum.x + maximum.width).toBeLessThanOrEqual(1440);
  expect(maximum.y + maximum.height).toBeLessThanOrEqual(1000);
  await field.command("reset");
  await expect(issues.root).toHaveAttribute("data-placement", "right");
  await expect(issues.root).toHaveAttribute("data-visibility", "collapsed");
  expect((await state.effects()).contentTransactions).toBe(0);
  expect(await state.records()).toHaveLength(0);
  await expectAccessible(page);
});

test("AC09 · desired layouts survive responsive clamping, reload, and scoped reset", async ({
  app,
  page,
  newTab,
}, testInfo) => {
  const state = new BrowserState(page);
  const field = app.panels().panel("field");
  await app.documents().selectField("tool");
  await app.fieldEditor().enterAnswer("layout content");
  await app.documents().rename("Layout content");
  await field.command("left");
  await field.command("floating");
  await field.drag(40, -30);
  const desktop = (await field.root.boundingBox())!;
  const stored = await state.layoutBytes();
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 768, height: 1024 },
    { width: 360, height: 640 },
    { width: 320, height: 480 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(field.root).toBeVisible();
    const rect = (await field.root.boundingBox())!;
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height);
    await app.documents().expectNoHorizontalOverflow();
    expect(await state.layoutBytes()).toBe(stored);
  }
  await page.screenshot({ path: testInfo.outputPath("320px-field-editor.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await field.root.boundingBox()).toEqual(desktop);
  await app.settings().open();
  await app.reload();
  await expect(field.root).toHaveAttribute("data-placement", "floating");
  expect(await field.root.boundingBox()).toEqual(desktop);
  await app.authoring().open();
  const history = app.panels().panel("history");
  await history.command("right");
  await PanelControls.resetWorkspace(page);
  await expect(history.root).toHaveAttribute("data-placement", "left");
  await app.navigation().selectDocument("Layout content");
  expect(await field.root.boundingBox()).toEqual(desktop);
  await app.documents().selectField("tool");
  await expect(app.fieldEditor().answer.locator).toHaveValue("layout content");
  const peer = await newTab();
  await peer.panels().panel("field").command("right");
  await expect(field.root).toHaveAttribute("data-placement", "floating");
  await app.reload();
  await expect(field.root).toHaveAttribute("data-placement", "right");
  await peer.context.page.close();
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await expectAccessible(page);
});

test("AC10 · denied and corrupt layout storage remain recoverable without altering content", async ({
  app,
  page,
}) => {
  const state = new BrowserState(page);
  const faults = new BrowserFaults(page);
  await app.documents().selectField("tool");
  await app.fieldEditor().enterAnswer("survives layout failures");
  await app.documents().rename("Layout recovery");
  await app.settings().open();
  await app.navigation().selectDocument("Layout recovery");
  const records = await state.records();
  await faults.denyLayoutWrites();
  const field = app.panels().panel("field");
  await field.command("right");
  await app.panels().openIssues();
  await expect(app.panels().issues).toContainText("Panel layout is usable for this session");
  await app.panels().panel("issues").close();
  await field.command("floating");
  await field.drag(-40, 20);
  await faults.restoreLayoutWrites();
  await PanelControls.retryStorage(page);
  await expect(app.panels().issues).not.toContainText("Panel layout is usable for this session");
  const rectangle = await field.root.boundingBox();
  await app.reload();
  expect(await field.root.boundingBox()).toEqual(rectangle);
  await state.replaceLayout("{broken layout");
  await app.reload();
  await app.panels().openIssues();
  await expect(app.panels().issues).toContainText("Default layout");
  await app.panels().panel("issues").close();
  expect(await state.records()).toEqual(records);
  await app.navigation().selectDocument("Layout recovery");
  await app.documents().selectField("tool");
  await expect(app.fieldEditor().answer.locator).toHaveValue("survives layout failures");
  await PanelControls.resetWorkspace(page);
  await expect(app.panels().issues).not.toContainText("Default layout");
  expect(await state.records()).toEqual(records);
});
