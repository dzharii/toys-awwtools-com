import type { Locator } from "@playwright/test";
import { PageObjectBase, type UiTestAppContext } from "../../framework/page-object/page-object-base.js";
import type { ICtlBase } from "../../framework/controls/control-interfaces.js";
import {
  LocatorCtlButton,
  LocatorCtlElement,
  LocatorCtlStatus,
} from "../../framework/controls/locator-controls.js";
import type { ModeValue } from "../../config/suite-config.js";
import { agentAutoCapture } from "../../framework/agentic/agent-step.js";

/**
 * The reader surface: title bar (title, open, settings), stage (paper with the
 * paged viewport and the scroll host, plus tap zones and the E Ink overlay),
 * and the footer (prev, progress, next). Exposes reading intent: navigate
 * pages, read progress, inspect the active mode, and open settings.
 */
export class ReaderPageObject extends PageObjectBase {
  readonly title: LocatorCtlStatus;
  readonly openButton: LocatorCtlButton;
  readonly settingsButton: LocatorCtlButton;
  readonly stage: LocatorCtlElement;
  readonly prevButton: LocatorCtlButton;
  readonly nextButton: LocatorCtlButton;
  readonly progress: LocatorCtlStatus;
  readonly zonePrev: LocatorCtlButton;
  readonly zoneNext: LocatorCtlButton;
  readonly pageViewport: LocatorCtlElement;
  readonly scrollHost: LocatorCtlElement;
  readonly einkOverlay: LocatorCtlElement;

  constructor(app: UiTestAppContext) {
    super(app, "reader");
    this.title = new LocatorCtlStatus("reader title", this.page.getByTestId("reader-text-title"));
    this.openButton = new LocatorCtlButton("reader open button", this.page.getByTestId("reader-button-open"));
    this.settingsButton = new LocatorCtlButton(
      "reader settings button",
      this.page.getByTestId("reader-button-settings"),
    );
    this.stage = new LocatorCtlElement("reader stage", this.page.getByTestId("reader-region-stage"));
    this.prevButton = new LocatorCtlButton("reader prev button", this.page.getByTestId("reader-button-prev"));
    this.nextButton = new LocatorCtlButton("reader next button", this.page.getByTestId("reader-button-next"));
    this.progress = new LocatorCtlStatus("reader progress", this.page.getByTestId("reader-status-progress"));
    this.zonePrev = new LocatorCtlButton("reader prev zone", this.page.getByTestId("reader-button-zone-prev"));
    this.zoneNext = new LocatorCtlButton("reader next zone", this.page.getByTestId("reader-button-zone-next"));
    this.pageViewport = new LocatorCtlElement(
      "reader page viewport",
      this.page.getByTestId("reader-region-page-viewport"),
    );
    this.scrollHost = new LocatorCtlElement("reader scroll host", this.page.getByTestId("reader-region-scroll"));
    this.einkOverlay = new LocatorCtlElement(
      "reader eink overlay",
      this.page.getByTestId("reader-region-eink-overlay"),
    );
  }

  protected rootLocator(): Locator {
    return this.page.getByTestId("reader-region-root");
  }

  root(): Locator {
    return this.rootLocator();
  }

  expectedControls(): ICtlBase[] {
    return [this.title, this.openButton, this.settingsButton, this.stage];
  }

  // ---- content ----

  /** The rendered content root (page viewport in paged mode, scroll host in scroll mode). */
  content(): Locator {
    return this.page.locator("#page-viewport, #reader-scroll");
  }

  async titleText(): Promise<string> {
    return this.title.getText();
  }

  async progressText(): Promise<string> {
    return this.progress.getText();
  }

  async contentText(): Promise<string> {
    const paper = this.page.getByTestId("reader-region-paper");
    return (await paper.textContent()) ?? "";
  }

  /** Wait until the given marker text is present anywhere in the reader content. */
  async waitForMarker(marker: string): Promise<void> {
    await this.app.timeouts.waitUntil(
      async () => (await this.contentText()).includes(marker),
      {
        timeoutMs: this.app.timeouts.normal,
        description: `reader content to contain marker "${marker}". ${this.app.diagnostics.recentErrorsSummary()}`,
      },
    );
  }

  // ---- reader attributes (for oracle) ----

  private async readerAttr(name: string): Promise<string | null> {
    return this.rootLocator().getAttribute(name);
  }

  async currentMode(): Promise<ModeValue> {
    return (await this.readerAttr("data-mode")) as ModeValue;
  }

  async einkIntensity(): Promise<string | null> {
    return this.readerAttr("data-eink");
  }

  async motion(): Promise<string | null> {
    return this.readerAttr("data-motion");
  }

  async progressMode(): Promise<string | null> {
    return this.readerAttr("data-progress");
  }

  async theme(): Promise<string | null> {
    return this.page.locator("html").getAttribute("data-theme");
  }

  async contrast(): Promise<string | null> {
    return this.page.locator("html").getAttribute("data-contrast");
  }

  // ---- navigation intent ----

  async goToNextPage(): Promise<void> {
    await this.nextButton.click();
    await this.waitSettled();
    await agentAutoCapture(this.app, "next-page");
  }

  async goToPrevPage(): Promise<void> {
    await this.goToPrevPageInternal();
    await this.waitSettled();
    await agentAutoCapture(this.app, "prev-page");
  }

  private async goToPrevPageInternal(): Promise<void> {
    await this.prevButton.click();
  }

  async tapNext(): Promise<void> {
    await this.zoneNext.click();
    await this.waitSettled();
    await agentAutoCapture(this.app, "tap-next");
  }

  async tapPrev(): Promise<void> {
    await this.zonePrev.click();
    await this.waitSettled();
    await agentAutoCapture(this.app, "tap-prev");
  }

  /** Scroll navigation (scroll mode hides the page-nav buttons; keyboard drives it). */
  async scrollNext(): Promise<void> {
    await this.pressKey("PageDown");
  }

  async scrollPrev(): Promise<void> {
    await this.pressKey("PageUp");
  }

  async focusStage(): Promise<void> {
    await this.page.getByTestId("reader-region-stage").focus();
  }

  async pressKey(key: string): Promise<void> {
    await this.focusStage();
    await this.page.keyboard.press(key);
  }

  async openSettings(): Promise<void> {
    await this.settingsButton.click();
    await agentAutoCapture(this.app, "open-settings");
  }

  async clickOpenAnother(): Promise<void> {
    await this.openButton.click();
  }

  // ---- page-state via the exposed test hook (runtime contract, not source import) ----

  /** Current page index and count from the paginator (paged mode only). */
  async pageState(): Promise<{ index: number; count: number } | null> {
    return this.page.evaluate(() => {
      const app = (window as unknown as { __einkReader?: { paginator?: { index: number; pageCount: number } } }).__einkReader;
      if (!app || !app.paginator) return null;
      return { index: app.paginator.index, count: app.paginator.pageCount };
    });
  }

  /**
   * Paged geometry from the paginator: the per-page horizontal stride and the
   * viewport width the columns are clipped to. Used to assert that adjacent
   * page columns can never co-appear inside the clip region (no text bleed).
   */
  async pagedGeometry(): Promise<{ pageStride: number; viewportWidth: number; pageCount: number } | null> {
    return this.page.evaluate(() => {
      const app = (window as unknown as {
        __einkReader?: { paginator?: { pageStride: number; pageCount: number; viewport?: { clientWidth: number } } };
      }).__einkReader;
      const p = app?.paginator;
      if (!p || !p.viewport) return null;
      return { pageStride: p.pageStride, viewportWidth: p.viewport.clientWidth, pageCount: p.pageCount };
    });
  }

  /** Effective CSS opacity of a footer nav button (disabled buttons read muted). */
  async navButtonOpacity(which: "prev" | "next"): Promise<number> {
    const id = which === "prev" ? "prev-page" : "next-page";
    return this.page.evaluate((elId) => {
      const el = document.getElementById(elId);
      if (!el) return 1;
      return parseFloat(getComputedStyle(el).opacity || "1");
    }, id);
  }
  async isEinkOverlayActive(): Promise<boolean> {
    return this.page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".eink-overlay");
      if (!el) return false;
      const cs = getComputedStyle(el);
      return cs.opacity !== "0" && cs.visibility !== "hidden" && cs.display !== "none";
    });
  }

  /** Scroll progress fraction (scroll mode) via the exposed reader instance. */
  async scrollFraction(): Promise<number> {
    return this.page.evaluate(() => {
      const app = (window as unknown as { __einkReader?: { scroll?: { getAnchorFraction(): number } } }).__einkReader;
      return app?.scroll?.getAnchorFraction ? app.scroll.getAnchorFraction() : 0;
    });
  }

  /** Wait until the current E Ink page-turn transition has settled. */
  async waitSettled(): Promise<void> {
    await this.app.timeouts.waitUntil(async () => !(await this.isEinkOverlayActive()), {
      timeoutMs: this.app.timeouts.long,
      description: "page-turn transition to settle",
    });
  }
}
