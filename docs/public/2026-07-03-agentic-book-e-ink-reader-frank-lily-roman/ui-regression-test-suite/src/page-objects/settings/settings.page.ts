import type { Locator } from "@playwright/test";
import { PageObjectBase, type UiTestAppContext } from "../../framework/page-object/page-object-base.js";
import type { ICtlBase } from "../../framework/controls/control-interfaces.js";
import {
  LocatorCtlButton,
  LocatorCtlElement,
  LocatorCtlRange,
  LocatorCtlSegmented,
  LocatorCtlSelect,
} from "../../framework/controls/locator-controls.js";
import { agentAutoCapture } from "../../framework/agentic/agent-step.js";

/** camelCase preference key -> kebab-case data-testid token (mirrors js/settings.js kebab()). */
function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * The reader settings panel (device-like sheet). It is rendered lazily into
 * #settings-mount when opened. Exposes user intent: open, close, and change
 * each setting. Segmented controls, selects, and ranges are addressed by their
 * preference name; the page object maps names to the data-testid contract.
 */
export class SettingsPageObject extends PageObjectBase {
  readonly closeButton: LocatorCtlButton;
  readonly scrim: LocatorCtlButton;
  readonly resetButton: LocatorCtlButton;
  readonly copyLogsButton: LocatorCtlButton;
  readonly clearLogsButton: LocatorCtlButton;
  readonly logView: LocatorCtlElement;

  constructor(app: UiTestAppContext) {
    super(app, "settings");
    this.closeButton = new LocatorCtlButton("settings close", this.page.getByTestId("settings-button-close"));
    this.scrim = new LocatorCtlButton("settings scrim", this.page.getByTestId("settings-region-scrim"));
    this.resetButton = new LocatorCtlButton("settings reset", this.page.getByTestId("settings-button-reset-prefs"));
    this.copyLogsButton = new LocatorCtlButton("settings copy logs", this.page.getByTestId("settings-button-copy-logs"));
    this.clearLogsButton = new LocatorCtlButton("settings clear logs", this.page.getByTestId("settings-button-clear-logs"));
    this.logView = new LocatorCtlElement("settings log view", this.page.getByTestId("settings-region-log-view"));
  }

  protected rootLocator(): Locator {
    return this.page.getByTestId("settings-region-dialog");
  }

  expectedControls(): ICtlBase[] {
    return [this.closeButton];
  }

  async isOpen(): Promise<boolean> {
    return this.isVisible();
  }

  // ---- control accessors keyed by preference name ----

  segmented(name: string): LocatorCtlSegmented {
    const token = kebab(name);
    return new LocatorCtlSegmented(
      `settings segmented ${name}`,
      this.page.locator(`[data-seg="${name}"]`),
      (value: string) => this.page.getByTestId(`settings-seg-${token}-${value}`),
    );
  }

  select(name: string): LocatorCtlSelect {
    return new LocatorCtlSelect(
      `settings select ${name}`,
      this.page.getByTestId(`settings-select-${kebab(name)}`),
    );
  }

  range(name: string): LocatorCtlRange {
    return new LocatorCtlRange(
      `settings range ${name}`,
      this.page.getByTestId(`settings-range-${kebab(name)}`),
    );
  }

  // ---- user intent ----

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.waitClosed();
    await agentAutoCapture(this.app, "settings-closed");
  }

  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.waitClosed();
  }

  async closeWithScrim(): Promise<void> {
    await this.scrim.click();
    await this.waitClosed();
  }

  private async waitClosed(): Promise<void> {
    await this.app.timeouts.waitUntil(async () => !(await this.isOpen()), {
      timeoutMs: this.app.timeouts.normal,
      description: "settings panel to close",
    });
  }

  async setSegmented(name: string, value: string): Promise<void> {
    await this.segmented(name).choose(value);
  }

  async setSelect(name: string, value: string): Promise<void> {
    await this.select(name).selectValue(value);
  }

  async setRange(name: string, value: number): Promise<void> {
    await this.range(name).setValue(value);
  }

  // Named convenience methods for the most common settings.
  async setMode(value: "paged" | "scroll"): Promise<void> {
    await this.setSegmented("readerMode", value);
  }
  async setEinkIntensity(value: "off" | "reduced" | "balanced" | "strong"): Promise<void> {
    await this.setSegmented("einkIntensity", value);
  }
  async setMotion(value: "system" | "reduced" | "full"): Promise<void> {
    await this.setSegmented("motion", value);
  }
  async setAlign(value: "left" | "justify"): Promise<void> {
    await this.setSegmented("align", value);
  }
  async setContrast(value: "soft" | "normal"): Promise<void> {
    await this.setSegmented("contrast", value);
  }
  async setShowProgress(on: boolean): Promise<void> {
    await this.setSegmented("showProgress", on ? "on" : "off");
  }
  async setDebug(on: boolean): Promise<void> {
    await this.openAdvancedDiagnostics();
    await this.setSegmented("debugEnabled", on ? "on" : "off");
  }
  async setTheme(value: string): Promise<void> {
    await this.setSelect("theme", value);
  }
  async setFont(value: string): Promise<void> {
    await this.setSelect("fontFamily", value);
  }
  async setRefreshStyle(value: string): Promise<void> {
    await this.setSelect("refreshStyle", value);
  }
  async setFontSize(px: number): Promise<void> {
    await this.setRange("fontSize", px);
  }
  async setLineHeight(v: number): Promise<void> {
    await this.setRange("lineHeight", v);
  }
  async setMeasure(ch: number): Promise<void> {
    await this.setRange("measure", ch);
  }
  async setParaSpacing(em: number): Promise<void> {
    await this.setRange("paraSpacing", em);
  }
  async setTextureStrength(v: number): Promise<void> {
    await this.setRange("textureStrength", v);
  }
  async setMargin(px: number): Promise<void> {
    await this.setRange("margin", px);
  }

  async resetPreferences(): Promise<void> {
    await this.openAdvancedDiagnostics();
    await this.resetButton.click();
  }

  /** Expand the collapsed "Advanced diagnostics" <details> so its controls are interactable. */
  async openAdvancedDiagnostics(): Promise<void> {
    const details = this.page.getByTestId("settings-region-advanced");
    const isOpen = await details.evaluate((el) => (el as HTMLDetailsElement).open);
    if (!isOpen) {
      await this.page.getByTestId("settings-button-advanced-toggle").click();
      await this.app.timeouts.waitUntil(
        () => details.evaluate((el) => (el as HTMLDetailsElement).open),
        { timeoutMs: this.app.timeouts.short, description: "advanced diagnostics to expand" },
      );
    }
  }

  async copyLogs(): Promise<void> {
    await this.openAdvancedDiagnostics();
    await this.copyLogsButton.click();
  }

  async clearLogs(): Promise<void> {
    await this.openAdvancedDiagnostics();
    await this.clearLogsButton.click();
  }
}
