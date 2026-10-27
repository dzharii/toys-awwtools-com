import { test, expect } from "../../framework/guided-test";
import { captureSurface } from "../../support/capture-surface";
import { renderedContrast } from "../../support/rendered-contrast";
import { BrowserState } from "../../support/browser-state";
import { writeFile } from "node:fs/promises";

// Each appearance needs an isolated precondition; this is one substantial
// discovery-to-writing-to-authoring journey, not a control-by-control matrix.
for (const theme of ["dark", "light"])
  for (const background of ["plain", "sage", "dusk"])
    for (const density of ["comfortable", "compact"]) {
      const appearance = `${theme}-${background}-${density}`;
      test(`AC17 · ${appearance}: writing-first presentation and rendered source contrast`, async ({
        app,
        page,
      }, testInfo) => {
        await app.settings().select("theme", theme);
        await app.settings().select("background", background);
        await app.settings().select("density", density);
        await captureSurface(page, `${appearance}-settings`, testInfo);
        await test.step("Global creation exposes neutral discovery without manufacturing a draft", async () => {
          await app.navigation().newDocument();
          await app.panels().restoreGuidance();
          expect((await app.panels().root.boundingBox())!.height).toBeLessThanOrEqual(200);
          await expect(app.documents().root).toBeHidden();
          await app.templates().expectReady();
          expect(await new BrowserState(page).records()).toHaveLength(0);
          await captureSurface(page, `${appearance}-discovery-neutral`, testInfo);
        });
        await test.step("Explicit style inspection remains open; composition is compact and immediately useful", async () => {
          await app.templates().selectTemplate("Project description");
          await expect(app.documents().styleDisclosure()).toHaveAttribute("open", "");
          await expect(app.documents().styleRadio("Structured project profile")).toBeVisible();
          await captureSurface(page, `${appearance}-style-selection`, testInfo);
          await app.documents().selectWritingStyle("Purpose + function");
          await expect(app.documents().styleDisclosure()).not.toHaveAttribute("open", "");
          await expect(app.documents().templateDisclosure()).not.toHaveAttribute("open", "");
          await expect(app.documents().result).toBeInViewport();
          await expect(app.documents().copyButton).toBeInViewport();
          await app.documents().selectField("tool");
          await app.fieldEditor().expectField("tool");
          await captureSurface(page, `${appearance}-composition-field`, testInfo);
        });
        await test.step("Every actually rendered source class has readable local-background contrast", async () => {
          await app.authoring().open();
          await app
            .authoring()
            .editSource(
              "TEMPLATE: Editorial\nTEXT:\n  Hello {{$name}}.\n$name: Who is reading?\n  HINT: Use a short name.\n  EXAMPLE: Alex\n  INPUT: multiline",
            );
          await expect(app.authoring().highlight).toContainText("Editorial");
          await expect(app.authoring().highlight.locator(".syntax-directive")).not.toHaveCount(0);
          const measurements = await renderedContrast(app.authoring().highlight);
          expect(measurements.map((sample) => sample.kind)).toEqual(
            expect.arrayContaining([
              "syntax-directive",
              "syntax-placeholder",
              "syntax-punctuation",
              "syntax-value",
            ]),
          );
          for (const sample of measurements) {
            expect(sample.ratio, `${appearance}: ${sample.kind}`).toBeGreaterThanOrEqual(4.5);
            expect(sample.fontSize).toBeGreaterThanOrEqual(14);
          }
          const contrastPath = testInfo.outputPath(`${appearance}-contrast.json`);
          await writeFile(contrastPath, JSON.stringify(measurements, null, 2));
          await testInfo.attach(`${appearance}-contrast.json`, {
            path: contrastPath,
            contentType: "application/json",
          });
          await captureSurface(page, `${appearance}-source`, testInfo);
        });
        await test.step("Returning from authoring restores compact neutral geometry", async () => {
          await app.navigation().newDocument();
          await app.panels().restoreGuidance();
          expect((await app.panels().root.boundingBox())!.height).toBeLessThanOrEqual(200);
          await expect(app.documents().root).toBeHidden();
        });
      });
    }
