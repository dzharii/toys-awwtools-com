import { expect, type Page } from "@playwright/test";

export class RenameDialog {
  constructor(private page: Page) {}
  get root() {
    return this.page.getByTestId("guided-rename-main-dialog-root");
  }
  get input() {
    return this.root.getByTestId("guided-rename-main-input-title");
  }
  async enter(title: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.input).toBeFocused();
    await this.input.fill(title);
  }
  async save(): Promise<void> {
    await this.root.getByTestId("guided-rename-main-button-save").click();
  }
  async cancel(): Promise<void> {
    await this.root.getByTestId("guided-rename-main-button-cancel").click();
  }
}
