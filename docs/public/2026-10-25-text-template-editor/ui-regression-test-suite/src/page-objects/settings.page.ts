import { expect, type Locator } from "@playwright/test";
import { PageObject } from "../framework/page-object";
import type { AppContext } from "../framework/app-context";
import type { NavigationPage } from "./navigation.page";

const controls = {
  theme: "guided-settings-main-select-theme",
  background: "guided-settings-main-select-background",
  density: "guided-settings-main-select-density",
  browserSuggestions: "guided-settings-main-input-browser-suggestions",
  documentTextSize: "guided-settings-main-select-document-text-size",
  fieldTextSize: "guided-settings-main-select-field-text-size",
  recentLimit: "guided-settings-main-input-recent-limit",
  keyboardHelp: "guided-settings-main-input-keyboard-help",
  storageMode: "guided-settings-main-select-storage-mode",
  autosaveSeconds: "guided-settings-main-input-autosave-seconds",
  logLevel: "guided-settings-main-select-log-level",
  logFormatter: "guided-settings-main-select-log-formatter",
} as const;

export class SettingsPage extends PageObject {
  readonly root: Locator;
  readonly validation: Locator;

  constructor(
    app: AppContext,
    private readonly navigation: NavigationPage,
  ) {
    super(app, "Settings");
    this.root = app.page.getByTestId("guided-settings-main-panel-root");
    this.validation = this.root
      .getByTestId("guided-settings-main-status-validation")
      .filter({ hasText: /\S/ });
  }

  control(name: keyof typeof controls): Locator {
    return this.root.getByTestId(controls[name]);
  }

  expectedControls() {
    return [
      { name: "Theme", locator: this.control("theme") },
      { name: "Storage mode", locator: this.control("storageMode") },
      { name: "Autosave interval", locator: this.control("autosaveSeconds") },
      { name: "Document reading size", locator: this.control("documentTextSize") },
      { name: "Field reading size", locator: this.control("fieldTextSize") },
      { name: "Browser suggestions", locator: this.control("browserSuggestions") },
      { name: "Recent document limit", locator: this.control("recentLimit") },
      { name: "Diagnostic level", locator: this.control("logLevel") },
    ];
  }

  expectedDefaultControlState() {
    return [
      {
        name: "Accessible Settings workspace",
        locator: this.app.page.getByTestId("guided-app-main-region-workspace"),
        focused: true,
      },
    ];
  }

  async open(): Promise<void> {
    if (!(await this.exists())) await this.navigation.openSettings();
    await this.expectReady();
  }

  async select(
    name:
      | "theme"
      | "background"
      | "density"
      | "storageMode"
      | "logLevel"
      | "logFormatter"
      | "documentTextSize"
      | "fieldTextSize",
    value: string,
  ): Promise<void> {
    await this.open();
    await this.control(name).selectOption(value);
    await expect(this.control(name)).toHaveValue(value);
  }

  async check(name: "browserSuggestions" | "keyboardHelp", checked: boolean): Promise<void> {
    await this.open();
    await this.control(name).setChecked(checked);
    await expect(this.control(name)).toBeChecked({ checked });
  }
  async recentLimit(value: string): Promise<void> {
    await this.open();
    await this.control("recentLimit").fill(value);
    await this.control("recentLimit").press("Tab");
  }
  compactControl(name: keyof typeof controls): Locator {
    return this.app.page.getByTestId(controls[name].replace("-main-", "-compact-"));
  }

  async autosaveSeconds(value: string): Promise<void> {
    await this.open();
    await this.control("autosaveSeconds").fill(value);
    await this.control("autosaveSeconds").press("Tab");
  }

  async appearance(): Promise<{
    theme: string | undefined;
    background: string | undefined;
    density: string | undefined;
  }> {
    return this.app.page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      background: document.documentElement.dataset.background,
      density: document.documentElement.dataset.density,
    }));
  }
  async rowLayout(name: keyof typeof controls, compact = false) {
    return (compact ? this.compactControl(name) : this.control(name)).evaluate((control) => {
      const row = control.closest(".setting");
      if (!row) throw new Error("Settings control needs its associated row.");
      const label = row.querySelector("label")!,
        description = row.querySelector(".description")!;
      const rect = (element: Element) => {
        const { x, y, width, bottom } = element.getBoundingClientRect();
        return { x, y, width, bottom };
      };
      return { label: rect(label), control: rect(control), description: rect(description) };
    });
  }
}
