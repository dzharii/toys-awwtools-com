import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import { timeouts, type AppContext } from "../framework/app-context";
import type { NavigationPage } from "./navigation.page";
import { RenameDialog } from "../page-components/rename";
import { PanelControls } from "../page-components/panel-controls";

export class TemplateAuthoringPage extends PageObject {
  readonly root: Locator;
  readonly source: Locator;
  readonly result: Locator;
  readonly diagnostics: Locator;
  readonly drafts: Locator;
  readonly saveStatus: Locator;

  constructor(
    app: AppContext,
    private readonly navigation: NavigationPage,
  ) {
    super(app, "Template Authoring");
    this.root = app.page.getByTestId("guided-authoring-main-region-workspace");
    this.source = this.root.getByTestId("guided-authoring-source-textarea-content");
    this.result = this.root.getByTestId("guided-authoring-preview-region-result");
    this.diagnostics = this.root.getByTestId("guided-authoring-source-region-diagnostics");
    this.drafts = app.page.getByTestId("guided-authoring-navigation-list-item-draft");
    this.saveStatus = this.root.getByTestId("guided-authoring-main-status-save");
  }

  expectedControls() {
    return [
      { name: "GTL source editor", locator: this.source },
      { name: "Save now", locator: this.root.getByTestId("guided-authoring-main-button-save") },
      {
        name: "Download source",
        locator: this.root.getByTestId("guided-authoring-main-button-download"),
      },
      { name: "New template", locator: this.root.getByTestId("guided-authoring-main-button-new") },
      {
        name: "Bundled inspection",
        locator: this.root.getByTestId("guided-authoring-main-select-bundled"),
      },
      { name: "Save state", locator: this.saveStatus },
    ];
  }

  expectedDefaultControlState() {
    return [{ name: "GTL source editor", locator: this.source, focused: true }];
  }

  async open(): Promise<void> {
    if (!(await this.exists())) await this.navigation.openAuthoring();
    if (await this.inspectedSource.isVisible()) await this.backToCurrent();
    await this.expectReady();
  }

  async newTemplate(): Promise<void> {
    await this.open();
    await this.activate("guided-authoring-main-button-new");
    await this.expectReady();
  }
  async openFullSettings(): Promise<void> {
    await this.historyNavigation.getByTestId("guided-authoring-navigation-button-settings").click();
  }
  async newFromNavigation(): Promise<void> {
    await this.historyNavigation.getByTestId("guided-authoring-navigation-button-new").click();
    await this.expectReady();
  }

  async editSource(value: string): Promise<void> {
    await PanelControls.expose(this.app.page, this.source);
    await this.source.click();
    await this.source.fill(value);
  }

  async save(memory = false): Promise<void> {
    await this.activate("guided-authoring-main-button-save");
    await expect(this.saveStatus).toHaveText(memory ? "In memory · this tab" : "Saved", {
      timeout: timeouts.persistence,
    });
  }

  async requestSave(): Promise<void> {
    await this.activate("guided-authoring-main-button-save");
  }

  async selectDraft(title: string): Promise<void> {
    await this.open();
    const open = this.app.page
      .getByTestId("guided-authoring-navigation-button-select")
      .filter({ hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) });
    if (!(await open.isVisible())) await new PanelControls(this.app.page, "history").open();
    await open.click();
  }

  async selectBundled(id: string): Promise<void> {
    await this.root.getByTestId("guided-authoring-main-select-bundled").selectOption(id);
  }

  async selectPreviewVersion(label: string): Promise<void> {
    await this.root.getByTestId("guided-authoring-preview-select-version").selectOption({ label });
  }

  placeholder(name: string): Locator {
    return this.root.locator(
      `[data-testid="guided-authoring-preview-button-placeholder"][data-placeholder-name=${JSON.stringify(name)}]`,
    );
  }

  async selectField(name: string): Promise<void> {
    const token = this.placeholder(name).first();
    await PanelControls.expose(this.app.page, token);
    await token.click();
  }

  async downloadSource() {
    const pending = this.app.page.waitForEvent("download");
    await this.activate("guided-authoring-main-button-download");
    return pending;
  }

  async goToDiagnostic(text: RegExp): Promise<void> {
    await this.diagnostics
      .getByTestId("guided-authoring-source-button-diagnostic")
      .filter({ hasText: text })
      .click();
  }

  async deleteDraft(): Promise<void> {
    await this.activate("guided-authoring-main-button-delete");
  }
  async rename(title: string): Promise<void> {
    const trigger = this.root.getByTestId("guided-authoring-main-button-rename");
    await PanelControls.expose(this.app.page, trigger);
    await trigger.click();
    const dialog = new RenameDialog(this.app.page);
    await dialog.enter(title);
    await dialog.save();
  }
  async createEditableCopy(): Promise<void> {
    await this.activate("guided-authoring-main-button-editable-copy");
  }
  get inspectedSource(): Locator {
    return this.root.getByTestId("guided-authoring-history-source-textarea-content");
  }
  get checkpoints(): Locator {
    return this.app.page.getByTestId("guided-authoring-history-button-inspect");
  }
  async inspect(index: number): Promise<void> {
    if (!(await this.checkpoints.nth(index).isVisible()))
      await new PanelControls(this.app.page, "history").open();
    await this.checkpoints.nth(index).click();
  }
  async backToCurrent(): Promise<void> {
    await this.activate("guided-authoring-main-button-current");
  }
  async restoreInspected(): Promise<void> {
    await this.activate("guided-authoring-history-button-restore");
  }
  async inspectOldest(): Promise<void> {
    if (!(await this.checkpoints.last().isVisible()))
      await new PanelControls(this.app.page, "history").open();
    await this.checkpoints.last().click();
  }
  async renameTemplateName(name: string): Promise<void> {
    await this.activate("guided-authoring-main-button-template-name");
    const dialog = new RenameDialog(this.app.page);
    await dialog.enter(name);
    await dialog.save();
  }
  draftButton(title: string): Locator {
    return this.app.page
      .getByTestId("guided-authoring-navigation-button-select")
      .filter({ hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) });
  }
  get historyNavigation(): Locator {
    return this.app.page.getByTestId("guided-authoring-navigation-region-root");
  }
  get title(): Locator {
    return this.root.getByTestId("guided-authoring-main-label-title");
  }
  get breadcrumb(): Locator {
    return this.app.page.getByTestId("guided-workspace-main-label-breadcrumb");
  }
  get highlight(): Locator {
    return this.root.getByTestId("guided-authoring-source-region-highlight");
  }
  async viewLivePreview(): Promise<void> {
    const control = this.root.getByTestId("guided-authoring-source-button-view-preview");
    await PanelControls.expose(this.app.page, control);
    await control.click();
  }
  async returnToSource(): Promise<void> {
    const control = this.root.getByTestId("guided-authoring-preview-button-back-to-source");
    await PanelControls.expose(this.app.page, control);
    await control.click();
  }
  async resizeSource(direction: "shorter" | "taller"): Promise<void> {
    const control = this.root.getByTestId(`guided-authoring-source-button-${direction}`);
    await PanelControls.expose(this.app.page, control);
    await control.click();
  }
  async sourcePosition() {
    return this.source.evaluate((element) => {
      if (!(element instanceof HTMLTextAreaElement))
        throw new Error("Source must remain a native textarea.");
      return {
        start: element.selectionStart,
        end: element.selectionEnd,
        top: element.scrollTop,
        left: element.scrollLeft,
      };
    });
  }
  private async activate(id: string): Promise<void> {
    const control = this.root.getByTestId(id);
    await PanelControls.expose(this.app.page, control);
    await control.click();
  }
}
