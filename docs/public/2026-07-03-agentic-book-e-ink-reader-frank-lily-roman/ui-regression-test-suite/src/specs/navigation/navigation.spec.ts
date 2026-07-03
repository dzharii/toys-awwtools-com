import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { switchModeFlow } from "../../flows/switch-mode.flow.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Navigation suite (manual plan). Paged mode: next/prev buttons, tap zones, and
 * keyboard move between pages and clamp at the ends; progress reflects the
 * current page. Scroll mode: next/prev scroll the content. Mode switching keeps
 * the reader intact.
 *
 * Page turns are serialized behind an E Ink transition, so tests poll for the
 * target page index (turns queue and apply) rather than reading state mid-turn.
 */
async function pageIndex(app: EinkReaderApp): Promise<number> {
  const state = await app.reader().pageState();
  return state ? state.index : -1;
}

test.describe("navigation", () => {
  test.describe("paged mode", () => {
    test("R001 next button advances the page", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      await app.reader().goToNextPage();
      await expect.poll(() => pageIndex(app)).toBe(1);
      await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
    });

    test("R002 prev button goes back a page", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      await app.reader().goToNextPage();
      await expect.poll(() => pageIndex(app)).toBe(1);
      await app.reader().goToNextPage();
      await expect.poll(() => pageIndex(app)).toBe(2);
      await app.reader().goToPrevPage();
      await expect.poll(() => pageIndex(app)).toBe(1);
      await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
    });

    test("R003 tap zones advance and go back", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      await app.reader().tapNext();
      await expect.poll(() => pageIndex(app)).toBe(1);
      await app.reader().tapPrev();
      await expect.poll(() => pageIndex(app)).toBe(0);
    });

    test("R004 arrow keys navigate pages", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      await app.reader().pressKey("ArrowRight");
      await expect.poll(() => pageIndex(app)).toBe(1);
      await app.reader().pressKey("ArrowLeft");
      await expect.poll(() => pageIndex(app)).toBe(0);
    });

    test("R005 prev is disabled at the first page (clamp, no underflow)", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      expect(await pageIndex(app)).toBe(0);
      expect(await app.reader().prevButton.isEnabled()).toBe(false);
      expect(await app.reader().nextButton.isEnabled()).toBe(true);
      // Disabled prev must also look disabled (muted), so readers don't tap a
      // dead-looking-active control. Active next stays fully opaque.
      expect(await app.reader().navButtonOpacity("prev")).toBeLessThan(1);
      expect(await app.reader().navButtonOpacity("next")).toBe(1);
      await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
    });

    test("R006 End jumps to the last page and Home returns to the first", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      const state = await app.reader().pageState();
      const count = state!.count;
      await app.reader().pressKey("End");
      await expect.poll(() => pageIndex(app)).toBe(count - 1);
      expect(await app.reader().nextButton.isEnabled()).toBe(false);
      expect(await app.reader().navButtonOpacity("next")).toBeLessThan(1);
      await app.reader().pressKey("Home");
      await expect.poll(() => pageIndex(app)).toBe(0);
      await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
    });

    test("R007 progress text reflects the current page", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "paged", showProgress: true } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      expect(await app.reader().progressText()).toMatch(/page\s+1\s+of\s+\d+/i);
      await app.reader().goToNextPage();
      await expect.poll(() => app.reader().progressText()).toMatch(/page\s+2\s+of\s+\d+/i);
    });
  });

  test.describe("scroll mode", () => {
    test("R008 scroll mode shows the scroll host and next scrolls down", async ({ makeApp }) => {
      const app = await makeApp({ seededPreferences: { readerMode: "scroll" } });
      await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
      expect(await app.reader().scrollHost.isVisible()).toBe(true);
      expect(await app.reader().scrollFraction()).toBeCloseTo(0, 1);
      // In scroll mode the page-nav buttons are hidden; keyboard drives scrolling.
      await app.reader().scrollNext();
      await expect.poll(() => app.reader().scrollFraction()).toBeGreaterThan(0);
      await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
    });
  });

  test("R009 switching from paged to scroll and back keeps the reader intact", async ({ makeApp }) => {
    const app = await makeApp({ seededPreferences: { readerMode: "paged" } });
    await openFileByPickerFlow(app, "longBook", "FIXTURE_LONG_BOOK_CH1");
    await app.reader().goToNextPage();
    await expect.poll(() => pageIndex(app)).toBe(1);
    await switchModeFlow(app, "scroll");
    await expectStandardOracle(app, { documentOpen: true, mode: "scroll" });
    await switchModeFlow(app, "paged");
    await expectStandardOracle(app, { documentOpen: true, mode: "paged" });
  });
});
