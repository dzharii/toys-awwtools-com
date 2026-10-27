import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import type { AppContext } from "../framework/app-context";
import { AnswerControl } from "../page-components/answer-control";
import type { WorkspacePanelsPage } from "./workspace-panels.page";
import type { DocumentWorkspacePage } from "./document-workspace.page";
import { PanelControls } from "../page-components/panel-controls";

export class FieldEditorPage extends PageObject {
  readonly root: Locator;
  readonly answer: AnswerControl;
  readonly identifier: Locator;
  readonly previous: Locator;
  readonly next: Locator;

  constructor(
    app: AppContext,
    private readonly panels: WorkspacePanelsPage,
    private readonly documents: DocumentWorkspacePage,
  ) {
    super(app, "Field editor");
    this.root = app.page.getByTestId("guided-field-editor-main-panel-root");
    this.answer = new AnswerControl(this.root);
    this.identifier = this.root.getByTestId("guided-field-editor-main-label-identifier");
    this.previous = this.root.getByTestId("guided-field-editor-main-button-previous");
    this.next = this.root.getByTestId("guided-field-editor-main-button-next");
  }

  expectedControls() {
    return [
      { name: "Active answer", locator: this.answer.locator },
      { name: "Field identity", locator: this.identifier },
    ];
  }

  expectedDefaultControlState() {
    return [{ name: "Active answer", locator: this.answer.locator, focused: true }];
  }

  async open(): Promise<void> {
    if (!(await this.answer.locator.isVisible())) await this.panels.restoreGuidance();
    if (!(await this.answer.locator.isVisible()) || (await this.answer.locator.isDisabled())) {
      await this.documents.open();
      if (!(await this.answer.locator.isVisible())) await this.panels.restoreGuidance();
      if (!(await this.answer.locator.isVisible()) || (await this.answer.locator.isDisabled())) {
        let token = this.documents.root
          .getByTestId("guided-documents-main-button-placeholder")
          .first();
        if (!(await token.isVisible()) || (await this.documents.renameButton().isDisabled())) {
          await this.documents.newDocument();
          token = this.documents.root
            .getByTestId("guided-documents-main-button-placeholder")
            .first();
        }
        await expect(token, "An editable document must provide a field").toBeVisible();
        await PanelControls.expose(this.app.page, token);
        await token.click();
      }
    }
    await this.panels.restoreGuidance();
    await this.expectReady();
  }

  async enterAnswer(value: string): Promise<void> {
    await this.expectReady();
    await this.answer.enter(value);
  }

  async expectField(name: string, focused = true): Promise<void> {
    await this.expectReady();
    await expect(this.identifier).toHaveText(`$${name}`);
    if (focused) await this.expectDefaultState();
  }

  async useExample(index = 0): Promise<void> {
    await this.root.getByTestId("guided-field-editor-examples-button-use").nth(index).click();
  }

  async copyExample(index = 0): Promise<void> {
    await this.root.getByTestId("guided-field-editor-examples-button-copy").nth(index).click();
  }

  keyboardHelp(): Locator {
    return this.root.getByTestId("guided-field-editor-main-region-keyboard-help");
  }
}
