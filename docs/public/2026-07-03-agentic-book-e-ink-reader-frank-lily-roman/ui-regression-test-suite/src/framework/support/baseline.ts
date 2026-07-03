import { expect } from "@playwright/test";
import type { EinkReaderApp } from "../app/automation-app.js";

/**
 * Surrounding-state baseline (gap-closure spec D00/E00).
 *
 * A test captures a stable snapshot of the whole application before an action,
 * then asserts after the action that only the fields the action is *allowed* to
 * change actually changed, while a set of hard invariants (privacy, network,
 * layout, overlay, errors) always hold. This catches the large class of
 * regressions where a feature works but silently breaks unrelated state.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UiBaseline {
  url: string;
  viewport: { width: number; height: number } | null;
  openScreenVisible: boolean;
  readerVisible: boolean;
  settingsVisible: boolean;
  busyVisible: boolean;
  toastText: string | null;
  readerMode: string | null;
  theme: string | null;
  contrast: string | null;
  eink: string | null;
  motion: string | null;
  titleText: string | null;
  progressText: string | null;
  contentMarkerVisible: boolean;
  readerBox: Rect | null;
  contentBox: Rect | null;
  bodyHasHorizontalOverflow: boolean;
  activeElementSummary: string | null;
  storageKeys: string[];
  storageContainsFixtureMarkers: boolean;
  externalNetworkCount: number;
  consoleErrorCount: number;
  pageErrorCount: number;
}

/**
 * Identity/state fields that must remain stable across an action unless the
 * action's profile explicitly lists them in allowedChanges. Layout boxes and
 * progress text are intentionally not identity fields (they change often and
 * legitimately); they are validated through the always-on invariants instead.
 */
export type MonitoredField =
  | "openScreenVisible"
  | "readerVisible"
  | "settingsVisible"
  | "readerMode"
  | "theme"
  | "contrast"
  | "eink"
  | "motion"
  | "titleText"
  | "progressText"
  | "contentBox"
  | "readerBox";

export type Invariant = "network" | "storage" | "overflow" | "overlay" | "errors";

const ALL_INVARIANTS: Invariant[] = ["network", "storage", "overflow", "overlay", "errors"];

export interface BaselineProfile {
  /** Human label for diagnostics. */
  readonly name: string;
  /** Monitored fields the action is permitted to change. */
  readonly allowedChanges: readonly MonitoredField[];
  /** Hard invariants to relax for this action (rare; document why). */
  readonly relax?: readonly Invariant[];
  /** Extra fixture markers that must never leak into storage. */
  readonly contentMarkers?: readonly string[];
}

async function boundingBox(app: EinkReaderApp, selector: string): Promise<Rect | null> {
  const box = await app.page.locator(selector).first().boundingBox();
  return box ? { x: box.x, y: box.y, width: box.width, height: box.height } : null;
}

/** Capture a full snapshot of user-visible application state. */
export async function captureBaseline(
  app: EinkReaderApp,
  contentMarkers: readonly string[] = [],
): Promise<UiBaseline> {
  const reader = app.reader();
  const readerVisible = await reader.isVisible();
  const openScreenVisible = await app.openScreen().isVisible();
  const settingsVisible = await app.settings().isOpen();
  const busyVisible = await app.busy().isVisible().catch(() => false);
  const toastShown = await app.toast().isShown().catch(() => false);

  let readerMode: string | null = null;
  let titleText: string | null = null;
  let progressText: string | null = null;
  let contentBox: Rect | null = null;
  let readerBox: Rect | null = null;
  if (readerVisible) {
    readerMode = await reader.currentMode();
    titleText = (await reader.titleText()).trim();
    progressText = (await reader.progressText()).trim();
    const contentSelector = readerMode === "paged" ? "#page-viewport" : "#reader-scroll";
    contentBox = await boundingBox(app, contentSelector);
    readerBox = await boundingBox(app, '[data-testid="reader-region-stage"]');
  }

  const theme = await reader.theme();
  const contrast = await reader.contrast();
  const eink = readerVisible ? await reader.einkIntensity() : null;
  const motion = readerVisible ? await reader.motion() : null;

  const storageKeys = await app.storage.keys();
  const storageBlob = Object.values(await app.storage.read()).join("\n");
  const storageContainsFixtureMarkers = contentMarkers.some(
    (m) => m.length > 0 && storageBlob.includes(m),
  );

  const bodyHasHorizontalOverflow = await app.page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth - el.clientWidth > 1;
  });

  const activeElementSummary = await app.page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const tid = el.getAttribute("data-testid");
    return `${el.tagName.toLowerCase()}${tid ? `[${tid}]` : ""}`;
  });

  return {
    url: app.page.url(),
    viewport: app.page.viewportSize(),
    openScreenVisible,
    readerVisible,
    settingsVisible,
    busyVisible,
    toastText: toastShown ? (await app.toast().text()).trim() : null,
    readerMode,
    theme,
    contrast,
    eink,
    motion,
    titleText,
    progressText,
    contentMarkerVisible: false,
    readerBox,
    contentBox,
    bodyHasHorizontalOverflow,
    activeElementSummary,
    storageKeys,
    storageContainsFixtureMarkers,
    externalNetworkCount: app.network.unexpectedRequests().length,
    consoleErrorCount: app.diagnostics.consoleErrors().length,
    pageErrorCount: app.diagnostics.pageErrors().length,
  };
}

const IDENTITY_FIELDS: MonitoredField[] = [
  "openScreenVisible",
  "readerVisible",
  "settingsVisible",
  "readerMode",
  "theme",
  "contrast",
  "eink",
  "motion",
  "titleText",
];

function boxChangedSignificantly(a: Rect | null, b: Rect | null): boolean {
  if (a === null && b === null) return false;
  if (a === null || b === null) return true;
  const eps = 1.5;
  return Math.abs(a.width - b.width) > eps || Math.abs(a.height - b.height) > eps;
}

/**
 * Tracks a before snapshot and compares it to an after snapshot under a
 * profile. Mirrors the gap-closure spec's `baseline.expectAfter(...)` shape.
 */
export class BaselineTracker {
  private before: UiBaseline | null = null;

  constructor(
    private readonly app: EinkReaderApp,
    private readonly contentMarkers: readonly string[] = [],
  ) {}

  async capture(): Promise<UiBaseline> {
    this.before = await captureBaseline(this.app, this.contentMarkers);
    return this.before;
  }

  async expectAfter(actionName: string, profile: BaselineProfile): Promise<UiBaseline> {
    if (!this.before) throw new Error(`BaselineTracker.expectAfter("${actionName}") called before capture()`);
    const relax = new Set(profile.relax ?? []);
    const markers = [...this.contentMarkers, ...(profile.contentMarkers ?? [])];

    // Let any page-turn / E Ink transition settle before comparing.
    if (!relax.has("overlay")) {
      await this.app.timeouts.waitUntil(async () => !(await this.app.reader().isEinkOverlayActive()), {
        timeoutMs: this.app.timeouts.long,
        description: `E Ink overlay to clear after "${actionName}" (not stuck)`,
      });
    }

    const after = await captureBaseline(this.app, markers);
    const allowed = new Set<MonitoredField>(profile.allowedChanges);
    const ctx = `[${profile.name}] after "${actionName}"`;

    // Identity-field stability (unless explicitly allowed to change).
    for (const field of IDENTITY_FIELDS) {
      if (allowed.has(field)) continue;
      expect(
        after[field],
        `${ctx}: field "${field}" must remain stable (was ${JSON.stringify(this.before[field])})`,
      ).toEqual(this.before[field]);
    }

    // progressText: stable unless allowed (it changes on navigation).
    if (!allowed.has("progressText")) {
      expect(after.progressText, `${ctx}: progressText must remain stable`).toEqual(this.before.progressText);
    }

    // Layout boxes: only flagged if a significant change happens and it is not allowed.
    if (!allowed.has("contentBox")) {
      expect(
        boxChangedSignificantly(this.before.contentBox, after.contentBox),
        `${ctx}: content box changed unexpectedly`,
      ).toBe(false);
    }
    if (!allowed.has("readerBox")) {
      expect(
        boxChangedSignificantly(this.before.readerBox, after.readerBox),
        `${ctx}: reader box changed unexpectedly`,
      ).toBe(false);
    }

    // Always-on invariants (unless relaxed).
    for (const inv of ALL_INVARIANTS) {
      if (relax.has(inv)) continue;
      switch (inv) {
        case "network":
          this.app.network.assertNoUnexpectedRequests();
          break;
        case "storage":
          await this.app.storage.assertOnlyPreferences();
          if (markers.length > 0) await this.app.storage.assertNoContent(markers);
          expect(after.storageContainsFixtureMarkers, `${ctx}: book content leaked into storage`).toBe(false);
          break;
        case "overflow":
          expect(after.bodyHasHorizontalOverflow, `${ctx}: body has horizontal overflow`).toBe(false);
          break;
        case "overlay":
          expect(await this.app.reader().isEinkOverlayActive(), `${ctx}: E Ink overlay is stuck`).toBe(false);
          break;
        case "errors":
          expect(
            this.app.diagnostics.pageErrors(),
            `${ctx}: uncaught page errors: ${this.app.diagnostics.pageErrors().join(" | ")}`,
          ).toEqual([]);
          expect(
            after.consoleErrorCount,
            `${ctx}: new console errors: ${this.app.diagnostics.consoleErrors().join(" | ")}`,
          ).toBe(this.before.consoleErrorCount);
          break;
      }
    }

    this.before = after;
    return after;
  }
}

export function createBaseline(app: EinkReaderApp, contentMarkers: readonly string[] = []): BaselineTracker {
  return new BaselineTracker(app, contentMarkers);
}
