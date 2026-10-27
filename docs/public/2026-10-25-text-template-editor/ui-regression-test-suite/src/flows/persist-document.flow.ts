import { expect } from "@playwright/test";
import type { DocumentWorkspacePage } from "../page-objects/document-workspace.page";
import type { NavigationPage } from "../page-objects/navigation.page";
import type { SettingsPage } from "../page-objects/settings.page";

export class PersistDocument {
  constructor(
    private readonly documents: DocumentWorkspacePage,
    private readonly navigation: NavigationPage,
    private readonly settings: SettingsPage,
  ) {}

  async run(title: string, memory = false): Promise<void> {
    await this.settings.open();
    await expect(this.navigation.row(title)).toBeVisible();
    await this.navigation.selectDocument(title);
    await this.documents.expectSaved(memory);
  }
}
