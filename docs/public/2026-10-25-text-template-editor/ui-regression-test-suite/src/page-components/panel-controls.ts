import { expect, type Locator, type Page } from "@playwright/test";

export type PanelName = "documents" | "history" | "field" | "issues" | "settings";
export class PanelControls {
  readonly root: Locator;
  constructor(
    private page: Page,
    readonly name: PanelName,
  ) {
    this.root = page.getByTestId(`guided-panels-${name}-panel-root`);
  }
  async open(): Promise<void> {
    await this.page.getByTestId("guided-panels-main-button-open").click();
    await this.page.getByTestId(`guided-panels-${this.name}-button-open`).click();
    await expect(this.root).toHaveAttribute("data-visibility", "expanded");
    await expect(this.root).toBeVisible();
  }
  async command(action: "floating" | "left" | "right" | "reset" | "center"): Promise<void> {
    await this.root.getByTestId(`guided-panels-${this.name}-button-actions`).click();
    await this.root.getByTestId(`guided-panels-${this.name}-button-command-${action}`).click();
  }
  async collapse(): Promise<void> {
    await this.root.getByTestId(`guided-panels-${this.name}-button-collapse`).click();
    await expect(this.root).toHaveAttribute("data-visibility", "collapsed");
  }
  async close(): Promise<void> {
    await this.root.getByTestId(`guided-panels-${this.name}-button-close`).click();
    await expect(this.root).toBeHidden();
  }
  async drag(dx: number, dy: number): Promise<void> {
    const grip = await this.root
      .getByTestId(`guided-panels-${this.name}-button-move`)
      .boundingBox();
    if (!grip) throw new Error(`${this.name} has no visible drag handle.`);
    const x = grip.x + Math.min(15, grip.width / 2),
      y = grip.y + grip.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx, y + dy, { steps: 8 });
    await this.page.mouse.up();
  }
  async resize(dx: number, dy: number, axis: "e" | "s" | "se" | "dock" = "se"): Promise<void> {
    const handle = await this.root
      .getByTestId(`guided-panels-${this.name}-handle-${axis}`)
      .boundingBox();
    if (!handle) throw new Error(`${this.name} has no visible ${axis} resize handle.`);
    const x = handle.x + handle.width / 2,
      y = handle.y + handle.height / 2;
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
    await this.page.mouse.move(x + dx, y + dy, { steps: 8 });
    await this.page.mouse.up();
  }
  grip(): Locator {
    return this.root.getByTestId(`guided-panels-${this.name}-button-move`);
  }
  async tab(edge: "left" | "right"): Promise<void> {
    await this.page.getByTestId(`guided-panels-${this.name}-tab-${edge}`).click();
  }
  dockTab(edge: "left" | "right"): Locator {
    return this.page.getByTestId(`guided-panels-${this.name}-tab-${edge}`);
  }
  async restoreAtEdge(): Promise<void> {
    await this.page.getByTestId(`guided-panels-${this.name}-button-restore`).click();
  }
  static async resetWorkspace(page: Page): Promise<void> {
    await page.getByTestId("guided-panels-main-button-open").click();
    await page.getByTestId("guided-panels-main-button-reset").click();
  }
  static async retryStorage(page: Page): Promise<void> {
    await page.getByTestId("guided-panels-main-button-open").click();
    await page.getByTestId("guided-panels-main-button-retry").click();
    await page.keyboard.press("Escape");
  }
  static async expose(page: Page, target: Locator): Promise<void> {
    const blocker = await target.evaluate((element) => {
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      if (!hit || element.contains(hit)) return null;
      const panel = hit.closest<HTMLElement>("[data-panel-id]");
      return panel && panel.dataset.effective !== "docked" ? panel.dataset.panelId : null;
    });
    if (blocker && ["documents", "history", "field", "issues", "settings"].includes(blocker)) {
      const panel = new PanelControls(page, blocker as PanelName);
      if ((await panel.root.getAttribute("data-visibility")) === "expanded") await panel.collapse();
    }
  }
}
