import { expect, type Page } from "@playwright/test";

export class Confirmation {
  readonly root;
  readonly cancelButton;
  readonly confirmButton;

  constructor(page: Page) {
    this.root = page.getByTestId("guided-confirmation-main-dialog-root");
    this.cancelButton = this.root.getByTestId("guided-confirmation-main-button-cancel");
    this.confirmButton = this.root.getByTestId("guided-confirmation-main-button-confirm");
  }

  async expectIdentity(title: string): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.root).toContainText(title);
    await expect(this.cancelButton).toBeFocused();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.root).toBeHidden();
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
    await expect(this.root).toBeHidden();
  }
}
