import { expect } from "@playwright/test";
import type { EinkReaderApp } from "../app/automation-app.js";
import { THEMES, MODES, EINK_INTENSITIES, CONTRASTS, MOTIONS } from "../../config/suite-config.js";

/**
 * Expectation descriptor passed to the Standard Post-Action Oracle. Each test
 * declares the states it expects; the oracle asserts those plus a large set of
 * invariants that catch silent breakage in layout, overlays, progress, storage,
 * responsiveness, and network (manual plan E00).
 */
export interface OracleExpectation {
  /** True when a document is loaded and the reader is showing. */
  documentOpen: boolean;
  /** Whether the settings panel should be open. Defaults to false. */
  settingsOpen?: boolean;
  /** Expected reader mode, if the test pins it. */
  mode?: "paged" | "scroll";
  /** Expected theme, if the test pins it. */
  theme?: (typeof THEMES)[number];
  /** Expected E Ink intensity, if the test pins it. */
  eink?: (typeof EINK_INTENSITIES)[number];
  /** Fixture markers that must NOT appear in persistent storage. */
  contentMarkers?: string[];
  /** Console error substrings to tolerate (rare; document why in the test). */
  allowConsoleError?: RegExp[];
  /** Skip the no-network assertion (only for tests that intentionally probe). */
  allowNetwork?: boolean;
}

/**
 * Run the Standard Post-Action Oracle. Call after every interaction unless the
 * test intentionally expects an error state.
 */
export async function expectStandardOracle(app: EinkReaderApp, expected: OracleExpectation): Promise<void> {
  const { page } = app;
  const reader = app.reader();
  const openScreen = app.openScreen();

  // 1. No uncaught page errors.
  expect(app.diagnostics.pageErrors(), `page errors: ${app.diagnostics.pageErrors().join(" | ")}`).toEqual([]);

  // 2. No unexpected console errors (allow-listed patterns tolerated).
  const allow = expected.allowConsoleError ?? [];
  const consoleErrors = app.diagnostics
    .consoleErrors()
    .filter((e) => !allow.some((rx) => rx.test(e)));
  expect(consoleErrors, `unexpected console errors: ${consoleErrors.join(" | ")}`).toEqual([]);

  // 3. Busy overlay hidden after the action settles.
  await app.busy().waitHidden();

  // 4. No stuck E Ink overlay.
  await app.timeouts.waitUntil(async () => !(await reader.isEinkOverlayActive()), {
    timeoutMs: app.timeouts.long,
    description: "E Ink overlay to clear (not stuck)",
  });

  // 5. Open screen and reader are not both active at the same time.
  const readerVisible = await reader.isVisible();
  const openVisible = await openScreen.isVisible();
  expect(
    readerVisible && openVisible,
    "reader and open screen must not both be visible",
  ).toBe(false);

  // 6. Settings panel open/closed matches expectation.
  const settingsOpen = await app.settings().isOpen();
  expect(settingsOpen, `settings open state`).toBe(expected.settingsOpen ?? false);

  if (expected.documentOpen) {
    expect(readerVisible, "reader should be visible when a document is open").toBe(true);

    // 7-9. Reader attributes are within valid enumerations.
    const mode = await reader.currentMode();
    expect(MODES).toContain(mode);
    const theme = await reader.theme();
    expect(THEMES as readonly string[]).toContain(theme);
    const eink = await reader.einkIntensity();
    expect(EINK_INTENSITIES as readonly string[]).toContain(eink);
    const contrast = await reader.contrast();
    expect(CONTRASTS as readonly string[]).toContain(contrast);
    const motion = await reader.motion();
    expect(MOTIONS as readonly string[]).toContain(motion);

    if (expected.mode) expect(mode).toBe(expected.mode);
    if (expected.theme) expect(theme).toBe(expected.theme);
    if (expected.eink) expect(eink).toBe(expected.eink);

    // 10. Progress visible when a document is open and progress is enabled.
    if ((await reader.progressMode()) === "on") {
      expect(await reader.progress.isVisible(), "progress region should be visible").toBe(true);
    }

    // 11. Reader title non-empty.
    expect((await reader.titleText()).trim().length, "reader title should be non-empty").toBeGreaterThan(0);

    // 12. Content area has non-zero dimensions (mode-appropriate element).
    const contentSelector = mode === "paged" ? "#page-viewport" : "#reader-scroll";
    const box = await page.locator(contentSelector).boundingBox();
    expect(box, `content area (${contentSelector}) should have a bounding box`).not.toBeNull();
    if (box) {
      expect(box.width, "content width").toBeGreaterThan(0);
      expect(box.height, "content height").toBeGreaterThan(0);
    }

    // Mode-specific surface visibility.
    if (mode === "paged") {
      expect(await reader.pageViewport.isVisible(), "#page-viewport visible in paged mode").toBe(true);
      const state = await reader.pageState();
      if (state) {
        expect(state.count, "page count should be >= 1").toBeGreaterThanOrEqual(1);
        expect(state.index, "page index >= 0").toBeGreaterThanOrEqual(0);
        expect(state.index, "page index within range").toBeLessThan(state.count);
      }

      // No adjacent-column bleed: when the book spans more than one page, the
      // per-page stride must be at least the clipped viewport width, so only a
      // single page column can ever be inside the visible clip region. A smaller
      // stride lets the next page's text peek into the margin (regression: the
      // fixed column gap was narrower than the centered measure's side slack).
      const geom = await reader.pagedGeometry();
      if (geom && geom.pageCount > 1) {
        expect(
          geom.pageStride,
          `paged stride ${geom.pageStride}px must be >= viewport ${geom.viewportWidth}px (adjacent column bleed)`,
        ).toBeGreaterThanOrEqual(geom.viewportWidth - 1);
      }
    } else {
      expect(await reader.scrollHost.isVisible(), "#reader-scroll visible in scroll mode").toBe(true);
    }
  }

  // 13. No body-level horizontal overflow.
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
  expect(overflow, `horizontal overflow of ${overflow}px`).toBeLessThanOrEqual(1);

  // 14. No book content in persistent storage.
  await app.storage.assertOnlyPreferences();
  if (expected.contentMarkers && expected.contentMarkers.length > 0) {
    await app.storage.assertNoContent(expected.contentMarkers);
  }

  // 15. No unexpected runtime network requests.
  if (!expected.allowNetwork) {
    app.network.assertNoUnexpectedRequests();
  }
}
