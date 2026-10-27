import { test, expect } from "../../framework/guided-test";
import { BrowserState } from "../../support/browser-state";
import { BrowserFaults } from "../../support/browser-faults";
import { authoringExamples } from "../../support/test-data";
import { surfaceRegistry } from "../../framework/surface-registry";
import { runSurfaceSmoke, SurfaceSmokeFailure } from "../../framework/surface-smoke";

test("FW01 · Page Object opening preserves work across workspaces and extension failures", async ({
  app,
  page,
  isolatedSession,
}, testInfo) => {
  const state = new BrowserState(page);
  await test.step("Application startup waits for initialization even when the shared host is visible", async () => {
    const stalled = await new BrowserFaults(page).stallTemplateResource("manifest.json");
    let completed = false;
    const starting = app.start().then(() => {
      completed = true;
    });
    try {
      await stalled.waitUntilRequested();
      await expect(app.startupStatus).toBeVisible();
      await app.navigation().expectReady();
      expect(completed).toBe(false);
    } finally {
      await stalled.resume();
      try {
        await starting;
      } finally {
        await stalled.dispose();
      }
    }
    expect(await state.records()).toEqual([]);
  });
  await app.documents().open();
  await app.templates().selectTemplate("Project description");
  await app.documents().selectWritingStyle("Purpose + function");
  await app.documents().selectField("benefit");
  await app.fieldEditor().enterAnswer("Preserved smoke document");
  await app.documents().rename("Opening contract document");
  await app.authoring().open();
  const original = (await state.records())[0];
  expect(original).toBeDefined();
  await app.authoring().editSource(authoringExamples.greeting);
  await app.authoring().save();
  const draft = (await state.records("authoringDrafts"))[0];

  await test.step("Settings and closed navigation return to the same current document", async () => {
    await app.navigation().filter("archived");
    await app.settings().open();
    await app.panels().panel("documents").close();
    await app.documents().open();
    await expect(app.documents().title).toHaveText("Opening contract document");
    await expect(app.navigation().filterControl()).toHaveValue("archived");
    await app.fieldEditor().open();
    await app.fieldEditor().expectField("benefit");
    await expect(app.fieldEditor().answer.locator).toHaveValue("Preserved smoke document");
    await app.panels().panel("field").close();
    await app.fieldEditor().open();
    await app.fieldEditor().expectField("benefit");
    await expect(app.fieldEditor().answer.locator).toHaveValue("Preserved smoke document");
  });
  await test.step("All surfaces open twice from Settings and historical Authoring without changing records", async () => {
    for (const surface of surfaceRegistry) {
      const object = surface.create(app);
      await app.settings().open();
      await object.open();
      await object.expectReady();
      await object.open();
      await object.expectReady();
      await app.authoring().open();
      await app.authoring().inspectOldest();
      await object.open();
      await object.expectReady();
      await object.open();
      await object.expectReady();
    }
    await app.authoring().open();
    await expect(app.authoring().source).toHaveValue(authoringExamples.greeting);
    expect(await state.records()).toEqual([original]);
    expect(await state.records("authoringDrafts")).toEqual([draft]);
  });
  await test.step("A failed injected action cannot run later actions or poison a fresh context", async () => {
    let laterActionRan = false;
    const surface = surfaceRegistry.find((entry) => entry.id === "document-workspace")!;
    let failure: unknown;
    try {
      await runSurfaceSmoke(app, surface, testInfo, [
        {
          id: "deliberately-failing-action",
          run: async () => {
            throw new Error("Synthetic extension failure");
          },
        },
        {
          id: "must-not-run",
          run: async () => {
            laterActionRan = true;
          },
        },
      ]);
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(SurfaceSmokeFailure);
    expect(failure).toMatchObject({ stage: "extension", surfaceId: surface.id });
    expect(laterActionRan).toBe(false);
    const independent = await isolatedSession();
    await runSurfaceSmoke(independent, surface, testInfo);
    expect(await new BrowserState(independent.context.page).records()).toEqual([]);
    expect(await new BrowserState(independent.context.page).records("authoringDrafts")).toEqual([]);
  });
});
