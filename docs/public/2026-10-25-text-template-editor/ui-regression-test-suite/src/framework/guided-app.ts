import { expect } from "@playwright/test";
import type { AppContext } from "./app-context";
import { NavigationPage } from "../page-objects/navigation.page";
import { DocumentWorkspacePage } from "../page-objects/document-workspace.page";
import { TemplateCatalogPage } from "../page-objects/template-catalog.page";
import { WorkspacePanelsPage } from "../page-objects/workspace-panels.page";
import { FieldEditorPage } from "../page-objects/field-editor.page";
import { TemplateAuthoringPage } from "../page-objects/template-authoring.page";
import { SettingsPage } from "../page-objects/settings.page";
import { Confirmation } from "../page-components/confirmation";

export class GuidedApp {
  private readonly navigationPage: NavigationPage;
  private readonly documentPage: DocumentWorkspacePage;
  private readonly templatePage: TemplateCatalogPage;
  private readonly panelPage: WorkspacePanelsPage;
  private readonly editorPage: FieldEditorPage;
  private readonly authoringPage: TemplateAuthoringPage;
  private readonly settingsPage: SettingsPage;
  readonly confirmation: Confirmation;

  constructor(readonly context: AppContext) {
    this.navigationPage = new NavigationPage(context);
    this.documentPage = new DocumentWorkspacePage(context, this.navigationPage);
    this.templatePage = new TemplateCatalogPage(context, this.documentPage);
    this.panelPage = new WorkspacePanelsPage(context);
    this.editorPage = new FieldEditorPage(context, this.panelPage);
    this.authoringPage = new TemplateAuthoringPage(context, this.navigationPage);
    this.settingsPage = new SettingsPage(context, this.navigationPage);
    this.confirmation = new Confirmation(context.page);
  }

  documents() {
    return this.documentPage;
  }
  templates() {
    return this.templatePage;
  }
  panels() {
    return this.panelPage;
  }
  fieldEditor() {
    return this.editorPage;
  }
  navigation() {
    return this.navigationPage;
  }
  authoring() {
    return this.authoringPage;
  }
  settings() {
    return this.settingsPage;
  }

  async start(path = ""): Promise<void> {
    await this.context.timings.measure(
      "app:navigate",
      async () => {
        await this.context.page.goto(new URL(path, this.context.baseURL).href);
        await this.expectReady();
      },
      this.context.identity,
    );
  }

  async expectReady(): Promise<void> {
    await expect(this.context.page.getByTestId("guided-app-main-region-root")).toBeVisible();
    await this.documentPage.expectReady();
    this.context.diagnostics.assertHealthy("Application startup");
  }

  async reload(): Promise<void> {
    await this.context.timings.measure(
      "app:reload",
      async () => {
        await this.context.page.reload();
        await this.expectReady();
      },
      this.context.identity,
    );
  }

  async reloadExpectingUnavailableCatalog(): Promise<void> {
    await this.context.timings.measure(
      "app:expected-catalog-failure",
      async () => {
        await this.context.page.reload();
        await this.templatePage.expectUnavailable();
        this.context.diagnostics.assertHealthy("Expected catalog failure");
      },
      this.context.identity,
    );
  }
}
