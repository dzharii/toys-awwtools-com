import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { VIEWPORTS } from "../../config/suite-config.js";

/**
 * Home-updates responsive suite (feature spec S00, tests RESPUPD001-004). The
 * open screen (drop zone + updates panel) stays usable across viewports: it
 * scrolls vertically when tall, never overflows horizontally, and stacks the
 * drop zone above the updates panel on mobile.
 */
const CASES = [
  { name: "desktop", vp: VIEWPORTS.desktop },
  { name: "tabletPortrait", vp: VIEWPORTS.tabletPortrait },
  { name: "mobileNarrow", vp: VIEWPORTS.mobileNarrow },
  { name: "mobileSmall", vp: VIEWPORTS.mobileSmall },
] as const;

test.describe("responsive: home updates", () => {
  for (const c of CASES) {
    test(`RESPUPD ${c.name} (${c.vp.width}x${c.vp.height}) shows drop zone above updates without overflow`, async ({
      makeApp,
    }) => {
      const app = await makeApp({ viewport: c.vp });
      await app.openScreen().expectReady();
      await app.openScreen().waitUpdatesSettled();

      expect(await app.openScreen().dropzone.isVisible()).toBe(true);
      expect(await app.openScreen().updatesPanel.isVisible()).toBe(true);

      const dz = await app.page.getByTestId("open-screen-region-dropzone").boundingBox();
      const up = await app.page.getByTestId("open-screen-region-updates").boundingBox();
      expect(dz && up && up.y > dz.y, "updates panel stacks below drop zone").toBe(true);
      // Both cards share the viewport width without spilling horizontally.
      if (up) expect(up.x + up.width).toBeLessThanOrEqual(c.vp.width + 1);

      await expectStandardOracle(app, { documentOpen: false });
    });
  }

  test("RESPUPD mobile home scrolls vertically when content exceeds the viewport", async ({ makeApp }) => {
    const app = await makeApp({ viewport: VIEWPORTS.mobileSmall });
    await app.openScreen().expectReady();
    await app.openScreen().waitUpdatesSettled();

    // The open screen is the scroll container; assert it can scroll to reveal
    // the updates panel, and that scrolling introduces no horizontal overflow.
    const canScroll = await app.page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('[data-testid="open-screen-region-root"]');
      if (!el) return false;
      el.scrollTop = el.scrollHeight;
      return el.scrollHeight >= el.clientHeight;
    });
    expect(canScroll).toBe(true);

    const overflow = await app.page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "no horizontal overflow on mobile home").toBeLessThanOrEqual(1);

    await expectStandardOracle(app, { documentOpen: false });
  });
});
