import { expect } from "@playwright/test";
import type { EinkReaderApp } from "../app/automation-app.js";

/**
 * Markdown rendering-contract assertions (gap-closure spec K00/L00). These check
 * that standard constructs render to the expected safe elements and that links
 * follow the app's safety policy (http(s) open in a new tab with noopener;
 * other schemes are neutralized).
 */

const CONTENT = "#reader .content";

export async function countElements(app: EinkReaderApp, selector: string): Promise<number> {
  return app.page.locator(`${CONTENT} ${selector}`).count();
}

export async function hasElement(app: EinkReaderApp, selector: string): Promise<boolean> {
  return (await countElements(app, selector)) > 0;
}

/**
 * A specific element is not wider than the visible reading column. Geometry is
 * only reliable in scroll mode (paged mode uses a multicolumn layout that
 * places later columns far off-screen), so callers should measure in scroll
 * mode. Elements with their own horizontal scroll (e.g. code blocks) are
 * expected to exceed the column internally and are out of scope here.
 */
export async function expectElementContained(app: EinkReaderApp, selector: string): Promise<void> {
  const worst = await app.page.evaluate(
    ({ sel, colSel }) => {
      const col = document.querySelector(colSel);
      if (!col) return 0;
      const colWidth = col.getBoundingClientRect().width;
      let worst = 0;
      document.querySelectorAll(`${colSel} ${sel}`).forEach((el) => {
        const w = (el as HTMLElement).getBoundingClientRect().width;
        if (w - colWidth > worst) worst = w - colWidth;
      });
      return worst;
    },
    { sel: selector, colSel: "#reader-scroll" },
  );
  expect(worst, `element "${selector}" exceeds the reading column by ${worst}px`).toBeLessThanOrEqual(2);
}

export interface AnchorInfo {
  href: string | null;
  target: string | null;
  rel: string | null;
  blocked: string | null;
}

export async function anchors(app: EinkReaderApp): Promise<AnchorInfo[]> {
  return app.page.locator(`${CONTENT} a`).evaluateAll((els) =>
    els.map((e) => {
      const a = e as HTMLAnchorElement;
      return {
        href: a.getAttribute("href"),
        target: a.getAttribute("target"),
        rel: a.getAttribute("rel"),
        blocked: a.getAttribute("data-blocked-href"),
      };
    }),
  );
}
