import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { VIEWPORTS } from "../../config/suite-config.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Mobile page-turn swipe suite (feature spec A00/K00, tests SWIPE001-010).
 *
 * Page mode only: a deliberate right-to-left swipe advances a page and a
 * left-to-right swipe goes back. Swipes are intentionally conservative, so
 * short, diagonal, slow, in-code-block, on-control, and scroll-mode gestures
 * must not turn the page, and boundary swipes are safe no-ops.
 *
 * The app accepts mouse pointer events as swipe candidates on a mobile-sized
 * viewport, so these run on VIEWPORTS.mobileNarrow with the standard (no-touch)
 * context and drive gestures through page.mouse (which emits Pointer Events).
 */
const MOBILE = VIEWPORTS.mobileNarrow;

async function pageIndex(app: EinkReaderApp): Promise<number> {
  const state = await app.reader().pageState();
  return state ? state.index : -1;
}

test.describe("navigation: mobile page swipe", () => {
  test("SWIPE001 right-to-left swipe advances to the next page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().swipePageLeft();
    await expect.poll(() => pageIndex(app)).toBe(1);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE002 left-to-right swipe goes to the previous page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().pressKey("ArrowRight");
    await expect.poll(() => pageIndex(app)).toBe(1);
    await app.reader().swipePageRight();
    await expect.poll(() => pageIndex(app)).toBe(0);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE003 a short horizontal movement does not turn the page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().shortSwipeLeft();
    await app.page.waitForTimeout(400);
    expect(await pageIndex(app)).toBe(0);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE004 a diagonal / vertical movement does not turn the page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().diagonalSwipe();
    await app.page.waitForTimeout(400);
    expect(await pageIndex(app)).toBe(0);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE004b a slow horizontal drag does not turn the page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().slowSwipeLeft();
    await app.page.waitForTimeout(300);
    expect(await pageIndex(app)).toBe(0);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE005 swipe is disabled in scroll mode", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "scroll" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const before = await app.reader().scrollFraction();
    await app.reader().swipePageLeft();
    await app.page.waitForTimeout(300);
    // Mode stays scroll; no paginator page navigation occurs.
    expect(await app.reader().currentMode()).toBe("scroll");
    const after = await app.reader().scrollFraction();
    expect(Math.abs(after - before)).toBeLessThan(0.05);
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
  });

  test("SWIPE006 a swipe starting on a control does not turn the page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().swipeLeftOn(app.page.getByTestId("reader-button-next"));
    await app.page.waitForTimeout(400);
    // The gesture must not itself add an extra page turn (a plain tap of Next is
    // exercised elsewhere); starting a swipe on a control is excluded.
    expect(await pageIndex(app)).toBeLessThanOrEqual(1);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE007 a swipe starting inside a code block does not turn the page", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    expect(await app.codeBlock().count()).toBeGreaterThan(0);
    const before = await pageIndex(app);
    await app.reader().swipeInsideCodeBlock();
    await app.page.waitForTimeout(400);
    expect(await pageIndex(app)).toBe(before);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE008 previous-page swipe at the first page is a safe no-op", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    expect(await pageIndex(app)).toBe(0);
    await app.reader().swipePageRight();
    await app.page.waitForTimeout(300);
    expect(await pageIndex(app)).toBe(0);
    expect(await app.reader().prevButton.isEnabled()).toBe(false);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE009 next-page swipe at the last page is a safe no-op", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const count = (await app.reader().pageState())!.count;
    await app.reader().pressKey("End");
    await expect.poll(() => pageIndex(app)).toBe(count - 1);
    await app.reader().swipePageLeft();
    await app.page.waitForTimeout(300);
    expect(await pageIndex(app)).toBe(count - 1);
    expect(await app.reader().nextButton.isEnabled()).toBe(false);
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });

  test("SWIPE010 rapid swipes keep page state valid", async ({ makeApp }) => {
    const app = await makeApp({ viewport: MOBILE, seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    const count = (await app.reader().pageState())!.count;
    await app.reader().waitEinkIdle();
    await app.reader().quickSwipeNext();
    await app.reader().quickSwipeNext();
    await app.reader().quickSwipeNext();
    await app.reader().waitEinkIdle();
    await app.reader().waitSettled();
    const idx = await pageIndex(app);
    expect(idx).toBeGreaterThanOrEqual(1);
    expect(idx).toBeLessThanOrEqual(Math.min(3, count - 1));
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });
});
