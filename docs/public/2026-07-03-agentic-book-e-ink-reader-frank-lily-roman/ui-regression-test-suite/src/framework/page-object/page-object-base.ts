import type { BrowserContext, Page } from "@playwright/test";
import type { UiTimeouts } from "../timeouts/timeouts.js";
import type { UiDiagnostics } from "../diagnostics/diagnostics.js";
import type { ICtlBase } from "../controls/control-interfaces.js";

/**
 * Shared context injected into every Page Object. Page Objects never construct
 * pages, contexts, servers, or each other — the app factory wires them.
 */
export interface UiTestAppContext {
  readonly page: Page;
  readonly browserContext: BrowserContext;
  readonly timeouts: UiTimeouts;
  readonly diagnostics: UiDiagnostics;
}

export interface IPageObject {
  exists(): Promise<boolean>;
}

export interface IExpectablePageObject extends IPageObject {
  expectReady(): Promise<void>;
}

export interface IPageObjectWithExpectedControls extends IExpectablePageObject {
  expectedControls(): ICtlBase[];
}

/**
 * Base Page Object. `expectReady` waits for the surface to exist, then each
 * expected control to be visible, throwing a diagnostic that names the surface,
 * the missing control, and recent console/page errors.
 */
export abstract class PageObjectBase implements IPageObjectWithExpectedControls {
  protected constructor(
    protected readonly app: UiTestAppContext,
    readonly surfaceName: string,
  ) {}

  protected get page(): Page {
    return this.app.page;
  }

  /** The root locator whose presence defines the surface. */
  protected abstract rootLocator(): import("@playwright/test").Locator;

  abstract expectedControls(): ICtlBase[];

  async exists(): Promise<boolean> {
    try {
      return (await this.rootLocator().count()) > 0;
    } catch {
      return false;
    }
  }

  async isVisible(): Promise<boolean> {
    try {
      return await this.rootLocator().first().isVisible();
    } catch {
      return false;
    }
  }

  async expectReady(): Promise<void> {
    const { timeouts, diagnostics } = this.app;

    await timeouts.waitUntil(() => this.isVisible(), {
      timeoutMs: timeouts.normal,
      description: `surface "${this.surfaceName}" to be visible. ${diagnostics.recentErrorsSummary()}`,
    });

    for (const control of this.expectedControls()) {
      await timeouts.waitUntil(() => control.isVisible(), {
        timeoutMs: timeouts.normal,
        description:
          `control "${control.name}" on surface "${this.surfaceName}" to be visible. ` +
          `${diagnostics.recentErrorsSummary()}`,
      });
    }
  }
}
