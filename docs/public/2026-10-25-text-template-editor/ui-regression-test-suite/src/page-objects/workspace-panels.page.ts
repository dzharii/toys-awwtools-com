import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import type { AppContext } from "../framework/app-context";
import { PanelControls, type PanelName } from "../page-components/panel-controls";

export class WorkspacePanelsPage extends PageObject {
  readonly root: Locator;
  readonly toggle: Locator;
  readonly issues: Locator;
  readonly error: Locator;
  readonly notice: Locator;

  constructor(app: AppContext) {
    super(app, "Workspace support panels");
    this.root = app.page.getByTestId("guided-panels-field-panel-root");
    this.toggle = app.page.getByTestId("guided-panels-field-button-collapse");
    this.issues = app.page.getByTestId("guided-issues-main-panel-root");
    this.error = app.page.getByTestId("guided-app-main-alert-error");
    this.notice = app.page.getByTestId("guided-app-main-status-notice");
  }

  expectedControls() {
    return [
      { name: "Guidance toggle", locator: this.toggle },
      {
        name: "Guidance actions",
        locator: this.root.getByTestId("guided-panels-field-button-actions"),
      },
      {
        name: "Close guidance",
        locator: this.root.getByTestId("guided-panels-field-button-close"),
      },
      {
        name: "Panel access",
        locator: this.app.page.getByTestId("guided-panels-main-button-open"),
      },
    ];
  }

  async open(): Promise<void> {
    await this.restoreGuidance();
    await this.expectReady();
  }

  async collapseGuidance(): Promise<void> {
    if ((await this.root.getAttribute("data-visibility")) === "expanded") await this.toggle.click();
    await expect(this.root).toHaveAttribute("data-visibility", "collapsed");
  }

  async restoreGuidance(): Promise<void> {
    await this.app.page.getByTestId("guided-workspace-main-button-open-guidance").click();
    await expect(this.root).toHaveAttribute("data-visibility", "expanded");
  }

  async openIssues(): Promise<void> {
    await this.app.page.getByTestId("guided-issues-main-button-toggle").click();
    await expect(this.issues).toBeVisible();
  }

  async collapseIssues(): Promise<void> {
    const panel = this.panel("issues");
    if (await panel.root.isVisible()) await panel.collapse();
  }
  panel(name: PanelName): PanelControls {
    return new PanelControls(this.app.page, name);
  }
  async undo(): Promise<void> {
    await this.notice.getByTestId("guided-app-main-button-undo").click();
  }

  async activateIssue(text: RegExp): Promise<void> {
    await this.openIssues();
    await this.issues
      .getByTestId("guided-issues-main-button-action")
      .filter({ hasText: text })
      .first()
      .click();
  }

  async retryStorage(): Promise<void> {
    await this.openIssues();
    await this.issues.getByTestId("guided-issues-main-button-retry-storage").click();
  }

  async preserveLocalCopy(authoring = false): Promise<void> {
    await this.openIssues();
    await this.issues
      .getByTestId(
        authoring
          ? "guided-authoring-main-button-preserve-copy"
          : "guided-issues-main-button-preserve-copy",
      )
      .click();
  }

  async reopenLatest(authoring = false): Promise<void> {
    await this.openIssues();
    await this.issues
      .getByTestId(
        authoring
          ? "guided-authoring-main-button-reopen-latest"
          : "guided-issues-main-button-reopen-latest",
      )
      .click();
  }

  async downloadRecovery() {
    await this.openIssues();
    const pending = this.app.page.waitForEvent("download");
    await this.issues.getByTestId("guided-issues-main-button-download-recovery").click();
    return pending;
  }
}
