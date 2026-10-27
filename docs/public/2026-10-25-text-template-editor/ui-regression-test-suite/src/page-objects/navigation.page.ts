import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import type { AppContext } from "../framework/app-context";

export class NavigationPage extends PageObject {
  readonly root: Locator;
  readonly rows: Locator;
  readonly newButton: Locator;
  readonly drawer: Locator;
  readonly menu: Locator;

  constructor(app: AppContext) {
    super(app, "Document navigation");
    this.root = app.page.getByTestId("guided-documents-navigation-region-root");
    this.rows = this.root.getByTestId("guided-documents-navigation-list-item-document");
    this.newButton = this.root.getByTestId("guided-documents-main-button-new");
    this.drawer = app.page.getByTestId("guided-panels-documents-panel-root");
    this.menu = app.page.getByTestId("guided-documents-navigation-button-menu");
  }

  expectedControls() {
    return [{ name: "New Document", locator: this.newButton }];
  }

  async open(): Promise<void> {
    if (!(await this.exists())) {
      const documents = this.app.page.getByTestId("guided-authoring-navigation-button-documents");
      if (await documents.isVisible()) await documents.click();
      else {
        await this.menu.click();
        if (await documents.isVisible()) await documents.click();
      }
      if (!(await this.exists())) await this.menu.click();
    }
    await this.expectReady();
  }

  row(title: string): Locator {
    return this.rows.filter({
      has: this.app.page.getByTestId("guided-documents-navigation-label-title").filter({
        hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      }),
    });
  }
  rowById(id: string): Locator {
    return this.rows.and(this.root.locator(`[data-document-id=${JSON.stringify(id)}]`));
  }
  async selectById(id: string): Promise<void> {
    await this.open();
    await this.rowById(id).getByTestId("guided-documents-navigation-button-open").click();
  }
  async archiveById(id: string): Promise<void> {
    await this.open();
    await this.rowById(id).getByTestId("guided-documents-navigation-button-archive").click();
  }
  async deleteById(id: string): Promise<void> {
    await this.open();
    await this.rowById(id).getByTestId("guided-documents-navigation-button-delete").click();
  }

  async newDocument(): Promise<void> {
    await this.open();
    await this.newButton.click();
    await expect(this.app.page.getByTestId("guided-documents-main-region-workspace")).toBeVisible();
  }

  async selectDocument(title: string): Promise<void> {
    await this.open();
    await this.row(title).getByTestId("guided-documents-navigation-button-open").click();
    await expect(this.app.page.getByTestId("guided-documents-main-label-title")).toHaveText(title);
  }

  async deleteDocument(title: string): Promise<void> {
    await this.open();
    await this.row(title).getByTestId("guided-documents-navigation-button-delete").click();
  }

  async openSettings(): Promise<void> {
    await this.open();
    await this.root.getByTestId("guided-settings-navigation-button-open").click();
  }

  async openAuthoring(): Promise<void> {
    await this.open();
    await this.root.getByTestId("guided-authoring-navigation-button-open").click();
  }

  documentButton(title: string): Locator {
    return this.row(title).getByTestId("guided-documents-navigation-button-open");
  }
  async filter(value: "active" | "archived" | "recent"): Promise<void> {
    await this.open();
    await this.root.getByTestId("guided-documents-navigation-select-filter").selectOption(value);
  }
  filterControl(): Locator {
    return this.root.getByTestId("guided-documents-navigation-select-filter");
  }
  async archive(title: string): Promise<void> {
    await this.open();
    await this.row(title).getByTestId("guided-documents-navigation-button-archive").click();
  }
}
