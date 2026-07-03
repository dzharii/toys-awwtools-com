import type { Locator } from "@playwright/test";
import { PageObjectBase, type UiTestAppContext } from "../../framework/page-object/page-object-base.js";
import type { ICtlBase } from "../../framework/controls/control-interfaces.js";

/** The transient toast used for non-blocking in-reader messages. */
export class ToastPageObject extends PageObjectBase {
  constructor(app: UiTestAppContext) {
    super(app, "toast");
  }

  protected rootLocator(): Locator {
    return this.page.getByTestId("toast-status-message");
  }

  expectedControls(): ICtlBase[] {
    return [];
  }

  async isShown(): Promise<boolean> {
    return this.isVisible();
  }

  async text(): Promise<string> {
    return (await this.rootLocator().textContent()) ?? "";
  }

  /** Wait until a toast is visible and return its text. */
  async waitShown(): Promise<string> {
    await this.app.timeouts.waitUntil(() => this.isShown(), {
      timeoutMs: this.app.timeouts.normal,
      description: `toast to appear. ${this.app.diagnostics.recentErrorsSummary()}`,
    });
    return this.text();
  }

  async waitHidden(): Promise<void> {
    await this.app.timeouts.waitUntil(async () => !(await this.isShown()), {
      timeoutMs: this.app.timeouts.long,
      description: "toast to hide",
    });
  }

  /** Click an action button rendered inside an action toast (e.g. "Open as plain text"). */
  async clickAction(label: string | RegExp): Promise<void> {
    await this.rootLocator().getByRole("button", { name: label }).click();
  }
}
