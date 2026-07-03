import type { Locator } from "@playwright/test";
import { PageObjectBase, type UiTestAppContext } from "../../framework/page-object/page-object-base.js";
import type { ICtlBase } from "../../framework/controls/control-interfaces.js";

/** The busy overlay shown during file reading / layout work. */
export class BusyPageObject extends PageObjectBase {
  constructor(app: UiTestAppContext) {
    super(app, "busy");
  }

  protected rootLocator(): Locator {
    return this.page.getByTestId("busy-region-root");
  }

  expectedControls(): ICtlBase[] {
    return [];
  }

  async isShown(): Promise<boolean> {
    // The overlay uses the `hidden` attribute; visibility reflects it.
    return this.isVisible();
  }

  async label(): Promise<string> {
    return (await this.page.getByTestId("busy-status-label").textContent()) ?? "";
  }

  async waitHidden(): Promise<void> {
    await this.app.timeouts.waitUntil(async () => !(await this.isShown()), {
      timeoutMs: this.app.timeouts.long,
      description: `busy overlay to hide. ${this.app.diagnostics.recentErrorsSummary()}`,
    });
  }
}
