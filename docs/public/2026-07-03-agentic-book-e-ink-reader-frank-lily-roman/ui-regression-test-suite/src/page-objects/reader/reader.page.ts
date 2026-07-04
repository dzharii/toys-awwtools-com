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
  readonly closeButton: LocatorCtlButton;
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
    this.closeButton = new LocatorCtlButton(
      "reader close-document button",
      this.page.getByTestId("reader-button-close-document"),
    );
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

  /**
   * Close the current document via the reader-bar close button and wait for the
   * home (open) screen to reappear. The E Ink close transition is serialized, so
   * this waits for the reader to hide before returning.
   */
  async closeDocument(): Promise<void> {
    await this.closeButton.click();
    await this.app.timeouts.waitUntil(async () => !(await this.isVisible()), {
      timeoutMs: this.app.timeouts.long,
      description: `reader to hide after closing the document. ${this.app.diagnostics.recentErrorsSummary()}`,
    });
    await agentAutoCapture(this.app, "close-document");
  }

  /** Activate the close button with the keyboard (Enter or Space) and wait for home. */
  async closeDocumentWithKey(key: "Enter" | "Space"): Promise<void> {
    await this.page.getByTestId("reader-button-close-document").focus();
    await this.page.keyboard.press(key);
    await this.app.timeouts.waitUntil(async () => !(await this.isVisible()), {
      timeoutMs: this.app.timeouts.long,
      description: `reader to hide after keyboard close (${key})`,
    });
  }

  // ---- swipe intent (mobile page-turn gestures) ----

  /**
   * Perform a pointer drag across a target element (the reader stage by
   * default) using mouse pointer events. Playwright's mouse dispatches Pointer
   * Events with pointerType "mouse"; on a mobile-sized viewport the app accepts
   * these as swipe candidates, so no touch-enabled context is required. All
   * coordinates are ratios [0..1] of the target's bounding box. Duration is
   * paced to stay inside the app's accepted window (80-900ms).
   */
  /**
   * Wait until the E Ink transition controller is idle. The reader
   * intentionally ignores swipe gestures while a page-turn transition is
   * running, so a deliberate gesture in a test must start from an idle state
   * (mirrors a reader who swipes after the page has settled).
   */
  async waitEinkIdle(): Promise<void> {
    await this.page.waitForFunction(() => {
      const app = (window as unknown as { __einkReader?: { eink?: { busy?: boolean } } }).__einkReader;
      return !app || !app.eink || app.eink.busy !== true;
    });
  }

  private async rawSwipe(opts: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    durationMs?: number;
    target?: Locator;
    skipIdleWait?: boolean;
  }): Promise<void> {
    if (!opts.skipIdleWait) await this.waitEinkIdle();
    const target = opts.target ?? this.page.getByTestId("reader-region-stage");
    const box = await target.boundingBox();
    if (!box) throw new Error("swipe target has no bounding box");
    const sx = box.x + box.width * opts.x0;
    const sy = box.y + box.height * opts.y0;
    const ex = box.x + box.width * opts.x1;
    const ey = box.y + box.height * opts.y1;
    // Interpolate the drag with driver-side steps (fast, not paced by
    // waitForTimeout) so the recognized gesture duration is set by a single
    // deliberate pause. Per-step waits balloon under CPU contention and could
    // push the wall-clock duration past the product's max, causing a valid
    // swipe to be rejected as "too slow" — an artifact of the simulation, not
    // the product. A single pause keeps the duration inside [80, 900] ms even
    // under heavy parallel load.
    const duration = opts.durationMs ?? 200;
    await this.page.mouse.move(sx, sy);
    await this.page.mouse.down();
    await this.page.mouse.move(ex, ey, { steps: 12 });
    await this.page.waitForTimeout(duration);
    await this.page.mouse.up();
  }

  /** Deliberate right-to-left swipe over the reading surface (expects next page). */
  async swipePageLeft(): Promise<void> {
    await this.rawSwipe({ x0: 0.74, y0: 0.5, x1: 0.26, y1: 0.5 });
    await this.waitSettled();
    await agentAutoCapture(this.app, "swipe-next");
  }

  /** Deliberate left-to-right swipe over the reading surface (expects prev page). */
  async swipePageRight(): Promise<void> {
    await this.rawSwipe({ x0: 0.26, y0: 0.5, x1: 0.74, y1: 0.5 });
    await this.waitSettled();
    await agentAutoCapture(this.app, "swipe-prev");
  }

  /** Horizontal movement below the distance threshold (must not turn the page). */
  async shortSwipeLeft(): Promise<void> {
    await this.rawSwipe({ x0: 0.55, y0: 0.5, x1: 0.45, y1: 0.5, durationMs: 160 });
  }

  /** Mostly-vertical / diagonal movement (must not turn the page). */
  async diagonalSwipe(): Promise<void> {
    await this.rawSwipe({ x0: 0.65, y0: 0.28, x1: 0.28, y1: 0.82 });
  }

  /** A very slow horizontal drag beyond the max duration (must not turn the page). */
  async slowSwipeLeft(): Promise<void> {
    await this.rawSwipe({ x0: 0.74, y0: 0.5, x1: 0.26, y1: 0.5, durationMs: 1400 });
  }

  /** Start a next-swipe on a given element (e.g. a control or code block). */
  async swipeLeftOn(target: Locator): Promise<void> {
    await this.rawSwipe({ x0: 0.72, y0: 0.5, x1: 0.14, y1: 0.5, target });
  }

  /** Start a next-swipe inside the first code block (must scroll code, not turn page). */
  async swipeInsideCodeBlock(): Promise<void> {
    const block = this.page.locator(".content pre.code-block").first();
    await this.rawSwipe({ x0: 0.7, y0: 0.5, x1: 0.14, y1: 0.5, target: block });
  }

  /** A fast next-swipe that does not wait for the transition to settle (rapid input). */
  async quickSwipeNext(): Promise<void> {
    await this.rawSwipe({ x0: 0.74, y0: 0.5, x1: 0.26, y1: 0.5, durationMs: 140, skipIdleWait: true });
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
