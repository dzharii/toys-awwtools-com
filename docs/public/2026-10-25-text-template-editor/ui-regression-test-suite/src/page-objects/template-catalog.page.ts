import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import type { AppContext } from "../framework/app-context";
import type { DocumentWorkspacePage } from "./document-workspace.page";
import { PanelControls } from "../page-components/panel-controls";

export class TemplateCatalogPage extends PageObject {
  readonly root: Locator;
  readonly cards: Locator;
  readonly retry: Locator;

  constructor(
    app: AppContext,
    private readonly documents: DocumentWorkspacePage,
  ) {
    super(app, "Template catalog");
    this.root = app.page.getByTestId("guided-templates-main-region-catalog");
    this.cards = this.root.getByTestId("guided-templates-main-list-item-template");
    this.retry = app.page.getByTestId("guided-app-main-button-retry-initialization");
  }

  expectedControls() {
    return [
      { name: "Template search", locator: this.searchInput },
      { name: "Search status", locator: this.searchStatus },
      { name: "Bundled template cards", locator: this.cards.first() },
    ];
  }

  async open(): Promise<void> {
    if (!(await this.exists())) await this.documents.open();
    if (!(await this.exists())) await this.documents.openTemplateCatalog();
    if ((await this.searchInput.inputValue()).trim() && !(await this.cards.first().isVisible()))
      await this.clearSearch();
    await this.expectReady();
  }

  card(name: string): Locator {
    return this.cards.filter({ hasText: name });
  }

  async requestTemplate(name: string): Promise<void> {
    await this.open();
    await PanelControls.expose(this.app.page, this.card(name));
    await this.card(name).click();
  }

  async selectTemplate(name: string): Promise<void> {
    await this.requestTemplate(name);
    await expect(this.card(name)).toHaveAttribute("aria-pressed", "true");
    await this.documents.expectReady();
  }

  async expectUnavailable(): Promise<void> {
    await expect(this.root).toBeHidden();
    await expect(this.retry).toBeVisible();
  }

  async retryStartup(): Promise<void> {
    await this.retry.click();
    await this.documents.expectReady();
    await this.open();
  }
  get searchInput(): Locator {
    return this.root.getByTestId("guided-templates-main-input-search");
  }
  get searchStatus(): Locator {
    return this.root.getByTestId("guided-templates-main-status-search");
  }
  get preview(): Locator {
    return this.root.getByTestId("guided-templates-preview-panel-root");
  }
  get sample(): Locator {
    return this.preview.getByTestId("guided-templates-preview-region-output");
  }
  get sampleStyles(): Locator {
    return this.preview.getByTestId("guided-templates-preview-select-version");
  }
  previewButton(name: string): Locator {
    return this.root.getByRole("button", { name: `Preview ${name}`, exact: true });
  }
  async search(value: string): Promise<void> {
    await this.open();
    await this.searchInput.fill(value);
  }
  async clearSearch(): Promise<void> {
    await this.root.getByTestId("guided-templates-main-button-clear-search").click();
  }
  async previewTemplate(name: string): Promise<void> {
    await this.open();
    const preview = this.root.getByRole("button", { name: `Preview ${name}`, exact: true });
    await PanelControls.expose(this.app.page, preview);
    await preview.click();
    await expect(this.preview).toBeVisible();
  }
  async closePreview(): Promise<void> {
    await this.preview.getByTestId("guided-templates-preview-button-close").click();
  }
  async sampleVersion(label: string): Promise<void> {
    await this.preview
      .getByTestId("guided-templates-preview-select-version")
      .selectOption({ label });
  }
  async usePreview(): Promise<void> {
    await this.preview.getByTestId("guided-templates-preview-button-use").click();
  }
  async retryIndex(): Promise<void> {
    await this.root.getByTestId("guided-templates-main-button-retry-index").click();
  }
}
