import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import type { AppContext } from "../framework/app-context";
import { AnswerControl } from "../page-components/answer-control";
import type { WorkspacePanelsPage } from "./workspace-panels.page";

export class FieldEditorPage extends PageObject {
  readonly root: Locator;
  readonly answer: AnswerControl;
  readonly identifier: Locator;
  readonly previous: Locator;
  readonly next: Locator;

  constructor(
    app: AppContext,
    private readonly panels: WorkspacePanelsPage,
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
    if (!(await this.exists())) await this.panels.restoreGuidance();
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
