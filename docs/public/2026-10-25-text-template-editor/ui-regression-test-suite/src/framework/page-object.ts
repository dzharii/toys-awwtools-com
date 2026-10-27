import { expect, type Locator } from "@playwright/test";
import { timeouts, type AppContext } from "./app-context";

export interface ExpectedControl {
  name: string;
  locator: Locator;
}

export interface ExpectedControlState extends ExpectedControl {
  focused: boolean;
}

export abstract class PageObject {
  abstract readonly root: Locator;
  abstract open(): Promise<void>;
  abstract expectedControls(): readonly ExpectedControl[];

  constructor(
    protected readonly app: AppContext,
    readonly surface: string,
  ) {}

  exists(): Promise<boolean> {
    return this.root.isVisible();
  }

  expectedDefaultControlState(): readonly ExpectedControlState[] {
    return [];
  }

  async expectReady(): Promise<void> {
    await this.app.timings.measure(
      `ready:${this.surface}`,
      async () => {
        try {
          await expect(this.root, `${this.surface}: surface readiness`).toBeVisible();
          for (const control of this.expectedControls()) {
            await expect(control.locator, `${this.surface}: ${control.name}`).toBeVisible({
              timeout: timeouts.readiness,
            });
          }
          this.app.diagnostics.assertHealthy(`${this.surface} readiness`);
        } catch (cause) {
          throw new Error(
            `${this.surface}: readiness failed (${this.app.identity}).\n${this.app.diagnostics.summary()}`,
            { cause },
          );
        }
      },
      this.app.identity,
    );
  }

  async expectDefaultState(): Promise<void> {
    for (const control of this.expectedDefaultControlState()) {
      try {
        if (control.focused)
          await expect(
            control.locator,
            `${this.surface}: ${control.name} must be focused`,
          ).toBeFocused();
        else
          await expect(
            control.locator,
            `${this.surface}: ${control.name} must not be focused`,
          ).not.toBeFocused();
      } catch (cause) {
        const actual = await control.locator.evaluate((element) => {
          const root = element.getRootNode();
          const active =
            root instanceof Document || root instanceof ShadowRoot ? root.activeElement : null;
          return {
            target: element.getAttribute("data-testid"),
            active: active?.getAttribute("data-testid") ?? active?.tagName ?? "none",
          };
        });
        throw new Error(
          `${this.surface}: ${control.name}; property=focused; expected=${control.focused}; actual=${JSON.stringify(actual)}; session=${this.app.identity}.\n${this.app.diagnostics.summary()}`,
          { cause },
        );
      }
    }
    this.app.diagnostics.assertHealthy(`${this.surface} default state`);
  }
}
