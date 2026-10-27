import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import { timeouts, type AppContext } from "../framework/app-context";
import type { NavigationPage } from "./navigation.page";
import { PanelControls } from "../page-components/panel-controls";
import { RenameDialog } from "../page-components/rename";

export class DocumentWorkspacePage extends PageObject {
  readonly root: Locator;
  readonly result: Locator;
  readonly title: Locator;
  readonly style: Locator;
  readonly copyButton: Locator;
  readonly richCopyButton: Locator;
  readonly saveStatus: Locator;
  readonly gate: Locator;
  readonly exportMenu: Locator;
  readonly exportButton: Locator;
  readonly mainViewport: Locator;
  readonly wordCount: Locator;
  readonly progress: Locator;

  constructor(
    app: AppContext,
    private readonly navigation: NavigationPage,
    private readonly selectDefault: () => Promise<void>,
  ) {
    super(app, "Document workspace");
    this.root = app.page.getByTestId("guided-documents-main-region-workspace");
    this.result = this.root.getByTestId("guided-documents-result-region-content");
    this.title = this.root.getByTestId("guided-documents-main-label-title");
    this.style = this.root.getByTestId("guided-templates-version-select-writing-style");
    this.copyButton = this.root.getByTestId("guided-documents-result-button-copy-text");
    this.richCopyButton = this.root.getByTestId("guided-documents-result-button-copy-rich");
    this.saveStatus = this.root.getByTestId("guided-documents-main-status-save");
    this.gate = this.root.getByTestId("guided-documents-result-status-validation");
    this.exportMenu = this.root.getByTestId("guided-documents-result-region-export");
    this.exportButton = this.root.getByTestId("guided-documents-result-button-export");
    this.mainViewport = app.page.getByRole("main", { name: "Document workspace", exact: true });
    this.wordCount = this.root.getByTestId("guided-documents-result-status-word-count");
    this.progress = this.root.getByTestId("guided-documents-main-status-progress");
  }

  expectedControls() {
    return [
      {
        name: "Guided document",
        locator: this.root.getByTestId("guided-documents-main-region-guided-text"),
      },
      { name: "Generated result", locator: this.result },
      { name: "Document title", locator: this.title },
      { name: "Save state", locator: this.saveStatus },
      { name: "Export", locator: this.exportButton },
      {
        name: "Reading size",
        locator: this.root.getByTestId("guided-documents-main-select-text-size"),
      },
      { name: "Copy text", locator: this.copyButton },
      { name: "Copy rich text", locator: this.richCopyButton },
    ];
  }

  async open(): Promise<void> {
    if (!(await this.exists())) await this.navigation.openDocumentWorkspace();
    if (!(await this.exists())) await this.selectDefault();
    await this.expectReady();
  }

  async newDocument(): Promise<void> {
    await this.navigation.newDocument();
    await this.selectDefault();
    await this.expectReady();
  }

  async selectWritingStyle(label: string): Promise<void> {
    if ((await this.style.getByRole("option", { includeHidden: true }).count()) === 1) {
      await expect(
        this.style.getByRole("option", { name: label, exact: true, includeHidden: true }),
      ).toHaveCount(1);
      return;
    }
    await this.openWritingStyles();
    const radio = this.styleRadio(label);
    if (await radio.isVisible()) {
      await PanelControls.expose(this.app.page, radio);
      await radio.check();
    } else await this.style.selectOption({ label });
    await this.root.getByTestId("guided-templates-version-button-confirm").click();
    await this.expectReady();
  }
  async openTemplateCatalog(): Promise<void> {
    const disclosure = this.root.getByTestId("guided-documents-main-details-template");
    if ((await disclosure.getAttribute("open")) === null) {
      const summary = this.root.getByTestId("guided-documents-main-button-change-template");
      await PanelControls.expose(this.app.page, summary);
      await summary.click();
    }
  }
  async openWritingStyles(): Promise<void> {
    const disclosure = this.root.getByTestId("guided-documents-main-details-style");
    if ((await disclosure.getAttribute("open")) === null) {
      const summary = this.root.getByTestId("guided-documents-main-button-change-style");
      await PanelControls.expose(this.app.page, summary);
      await summary.click();
    }
  }
  templateDisclosure(): Locator {
    return this.root.getByTestId("guided-documents-main-details-template");
  }
  styleDisclosure(): Locator {
    return this.root.getByTestId("guided-documents-main-details-style");
  }
  confirmStyle(): Locator {
    return this.root.getByTestId("guided-templates-version-button-confirm");
  }
  styleRadio(label: string): Locator {
    return this.root.getByRole("radio", { name: label, exact: true, includeHidden: true });
  }
  writingStyleGroup(): Locator {
    return this.root.getByTestId("guided-templates-version-group-writing-style");
  }
  renameButton(): Locator {
    return this.root.getByTestId("guided-documents-main-button-rename");
  }
  async readingSize(value: "normal" | "large"): Promise<void> {
    await this.root.getByTestId("guided-documents-main-select-text-size").selectOption(value);
  }
  resultFontSize(): Promise<number> {
    return this.result.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  }

  placeholder(name: string): Locator {
    return this.root.locator(
      `[data-testid="guided-documents-main-button-placeholder"][data-placeholder-name=${JSON.stringify(name)}]`,
    );
  }

  async selectField(name: string): Promise<void> {
    const token = this.placeholder(name).first();
    await PanelControls.expose(this.app.page, token);
    await token.click();
  }

  async rename(title: string): Promise<void> {
    const trigger = this.root.getByTestId("guided-documents-main-button-rename");
    await PanelControls.expose(this.app.page, trigger);
    await trigger.click();
    const dialog = new RenameDialog(this.app.page);
    await dialog.enter(title);
    await dialog.save();
    await expect(dialog.root).toBeHidden();
  }

  async expectSaved(memory = false): Promise<void> {
    await expect(this.saveStatus).toHaveText(memory ? "In memory · this tab" : "Saved", {
      timeout: timeouts.persistence,
    });
  }

  async openExport(): Promise<void> {
    await PanelControls.expose(this.app.page, this.exportButton);
    await this.exportButton.click();
  }

  exportOption(format: "txt" | "md" | "html"): Locator {
    return this.root.getByTestId(`guided-documents-result-button-export-${format}`);
  }

  async export(format: "txt" | "md" | "html") {
    await this.openExport();
    const pending = this.app.page.waitForEvent("download");
    await this.exportOption(format).click();
    return pending;
  }

  async copy(rich = false): Promise<void> {
    const button = rich ? this.richCopyButton : this.copyButton;
    await PanelControls.expose(this.app.page, button);
    await button.click();
  }

  async expectNoHorizontalOverflow(): Promise<void> {
    const size = await this.app.page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(size.scrollWidth).toBeLessThanOrEqual(size.width);
  }

  async writingStyles(): Promise<string[]> {
    return this.style.getByRole("option", { includeHidden: true }).allTextContents();
  }

  async executableResultElements(): Promise<number> {
    return this.result.locator("script,iframe,img").count();
  }
}
