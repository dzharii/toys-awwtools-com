import type { Page } from "@playwright/test";

/**
 * Content-safe capture primitives for Agentic Analysis Mode.
 *
 * Privacy discipline mirrors the product: no full book content is written to
 * artifacts. All text is truncated (fixture markers are short and remain
 * visible for correlation; long prose/code is cut). These functions never
 * throw — capture is best-effort telemetry and must not fail a test.
 */

const MAX_TEXT = 160;
const MAX_ELEMENTS = 300;

export interface LayoutSnapshot {
  viewport: { width: number; height: number };
  document: { bodyScrollWidth: number; bodyClientWidth: number; hasHorizontalOverflow: boolean };
  openScreen: { visible: boolean; box: Rect | null };
  reader: {
    visible: boolean;
    mode: string | null;
    theme: string | null;
    contrast: string | null;
    eink: string | null;
    motion: string | null;
    box: Rect | null;
  };
  content: {
    box: Rect | null;
    fontFamily: string | null;
    fontSize: string | null;
    lineHeight: string | null;
    maxWidth: string | null;
  };
  page: { progressText: string | null; nextEnabled: boolean | null; prevEnabled: boolean | null };
  settings: { visible: boolean; box: Rect | null };
  overlays: { busyVisible: boolean; einkOverlayVisible: boolean; toastVisible: boolean; toastText: string | null };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisibleElements {
  buttons: Array<{ testId: string | null; text: string; visible: boolean; enabled: boolean }>;
  inputs: Array<{ testId: string | null; type: string; visible: boolean; value: string }>;
  selects: Array<{ testId: string | null; visible: boolean; value: string }>;
  regions: Array<{ testId: string | null; role: string | null; visible: boolean }>;
  links: Array<{ text: string; href: string | null; visible: boolean }>;
  notices: Array<{ testId: string | null; text: string }>;
}

export interface DomSummary {
  title: string;
  htmlAttrs: Record<string, string>;
  bodyAttrs: Record<string, string>;
  readerOuterHtmlTruncated: string | null;
  settingsOuterHtmlTruncated: string | null;
  noticeText: string | null;
  progressText: string | null;
  contentSnippets: string[];
}

/** Take a viewport (or full-page) screenshot. Returns true on success. */
export async function captureScreenshot(
  page: Page,
  absPath: string,
  opts: { fullPage?: boolean; animations?: "disabled" | "allow" } = {},
): Promise<boolean> {
  try {
    await page.screenshot({
      path: absPath,
      fullPage: opts.fullPage ?? false,
      animations: opts.animations ?? "disabled",
    });
    return true;
  } catch {
    return false;
  }
}

export async function captureLayout(page: Page): Promise<LayoutSnapshot | null> {
  try {
    return await page.evaluate(() => {
      const rect = (el: Element | null): Rect | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      };
      const vis = (el: Element | null): boolean => {
        if (!el) return false;
        const cs = getComputedStyle(el as HTMLElement);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
        const r = (el as HTMLElement).getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      };
      const byTestId = (id: string) => document.querySelector(`[data-testid="${id}"]`);
      const html = document.documentElement;
      const openScreen = byTestId("open-screen-region-root");
      const reader = byTestId("reader-region-root");
      const settings = byTestId("settings-region-dialog");
      const mode = reader?.getAttribute("data-mode") ?? null;
      const contentEl = document.querySelector("#page-viewport, #reader-scroll");
      const paper = document.querySelector("#reader-content, [data-testid='reader-region-paper']") ?? contentEl;
      const cs = paper ? getComputedStyle(paper as HTMLElement) : null;
      const prevBtn = byTestId("reader-button-prev") as HTMLButtonElement | null;
      const nextBtn = byTestId("reader-button-next") as HTMLButtonElement | null;
      const busy = byTestId("busy-region-root") ?? document.querySelector(".busy-overlay");
      const einkOverlay = document.querySelector(".eink-overlay");
      const toast = byTestId("toast-status-message") ?? document.querySelector(".toast");
      const progress = byTestId("reader-status-progress");
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        document: {
          bodyScrollWidth: html.scrollWidth,
          bodyClientWidth: html.clientWidth,
          hasHorizontalOverflow: html.scrollWidth - html.clientWidth > 1,
        },
        openScreen: { visible: vis(openScreen), box: rect(openScreen) },
        reader: {
          visible: vis(reader),
          mode,
          theme: html.getAttribute("data-theme"),
          contrast: html.getAttribute("data-contrast"),
          eink: reader?.getAttribute("data-eink") ?? null,
          motion: reader?.getAttribute("data-motion") ?? null,
          box: rect(reader),
        },
        content: {
          box: rect(contentEl),
          fontFamily: cs ? cs.fontFamily : null,
          fontSize: cs ? cs.fontSize : null,
          lineHeight: cs ? cs.lineHeight : null,
          maxWidth: cs ? cs.maxWidth : null,
        },
        page: {
          progressText: progress ? (progress.textContent ?? "").trim() : null,
          nextEnabled: nextBtn ? !nextBtn.disabled : null,
          prevEnabled: prevBtn ? !prevBtn.disabled : null,
        },
        settings: { visible: vis(settings), box: rect(settings) },
        overlays: {
          busyVisible: vis(busy),
          einkOverlayVisible: (() => {
            if (!einkOverlay) return false;
            const o = getComputedStyle(einkOverlay as HTMLElement);
            return o.opacity !== "0" && o.visibility !== "hidden" && o.display !== "none";
          })(),
          toastVisible: vis(toast),
          toastText: toast ? (toast.textContent ?? "").trim().slice(0, 160) : null,
        },
      } as LayoutSnapshot;
    });
  } catch {
    return null;
  }
}

export async function captureVisibleElements(page: Page): Promise<VisibleElements | null> {
  try {
    return await page.evaluate(
      ({ maxText, maxElements }) => {
        const isVisible = (el: Element): boolean => {
          const cs = getComputedStyle(el as HTMLElement);
          if (cs.display === "none" || cs.visibility === "hidden") return false;
          const r = (el as HTMLElement).getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        const text = (el: Element): string => (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, maxText);
        const tid = (el: Element): string | null => el.getAttribute("data-testid");
        const out: any = { buttons: [], inputs: [], selects: [], regions: [], links: [], notices: [] };
        let count = 0;
        for (const el of Array.from(document.querySelectorAll("button"))) {
          if (count++ > maxElements) break;
          out.buttons.push({ testId: tid(el), text: text(el), visible: isVisible(el), enabled: !(el as HTMLButtonElement).disabled });
        }
        for (const el of Array.from(document.querySelectorAll("input, textarea"))) {
          out.inputs.push({ testId: tid(el), type: (el as HTMLInputElement).type ?? el.tagName.toLowerCase(), visible: isVisible(el), value: String((el as HTMLInputElement).value ?? "").slice(0, maxText) });
        }
        for (const el of Array.from(document.querySelectorAll("select"))) {
          out.selects.push({ testId: tid(el), visible: isVisible(el), value: String((el as HTMLSelectElement).value ?? "") });
        }
        for (const el of Array.from(document.querySelectorAll("[role], main, article, dialog, [data-testid*='region']"))) {
          out.regions.push({ testId: tid(el), role: el.getAttribute("role"), visible: isVisible(el) });
        }
        for (const el of Array.from(document.querySelectorAll("a[href]"))) {
          out.links.push({ text: text(el), href: el.getAttribute("href"), visible: isVisible(el) });
        }
        for (const el of Array.from(document.querySelectorAll("[data-testid*='notice'], [data-testid*='status'], .notice, [role='alert'], [role='status']"))) {
          const t = text(el);
          if (t) out.notices.push({ testId: tid(el), text: t });
        }
        return out;
      },
      { maxText: MAX_TEXT, maxElements: MAX_ELEMENTS },
    );
  } catch {
    return null;
  }
}

export async function captureDomSummary(page: Page, fullDom: boolean): Promise<DomSummary | null> {
  try {
    return await page.evaluate(
      ({ maxText, full }) => {
        const attrs = (el: Element | null): Record<string, string> => {
          const o: Record<string, string> = {};
          if (!el) return o;
          for (const a of Array.from(el.attributes)) o[a.name] = a.value.slice(0, 120);
          return o;
        };
        const truncateHtml = (el: Element | null, limit: number): string | null => {
          if (!el) return null;
          let html = (el as HTMLElement).outerHTML;
          if (!full) {
            // Collapse long text nodes so book/code content is not persisted verbatim.
            html = html.replace(/>([^<]{80,})</g, (_m, t) => `>${String(t).slice(0, 80)}\u2026<`);
          }
          return html.slice(0, limit);
        };
        const byTestId = (id: string) => document.querySelector(`[data-testid="${id}"]`);
        const reader = byTestId("reader-region-root");
        const settings = byTestId("settings-region-dialog");
        const notice = document.querySelector("[data-testid*='notice'], [role='alert'], [role='status']");
        const progress = byTestId("reader-status-progress");
        const paragraphs = Array.from(document.querySelectorAll("#page-viewport p, #reader-scroll p, #reader-content p")).slice(0, 6);
        return {
          title: document.title,
          htmlAttrs: attrs(document.documentElement),
          bodyAttrs: attrs(document.body),
          readerOuterHtmlTruncated: truncateHtml(reader, full ? 500_000 : 40_000),
          settingsOuterHtmlTruncated: settings ? truncateHtml(settings, full ? 500_000 : 40_000) : null,
          noticeText: notice ? (notice.textContent ?? "").trim().slice(0, maxText) : null,
          progressText: progress ? (progress.textContent ?? "").trim() : null,
          contentSnippets: paragraphs.map((p) => (p.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, maxText)),
        } as DomSummary;
      },
      { maxText: MAX_TEXT, full: fullDom },
    );
  } catch {
    return null;
  }
}

export async function captureA11y(page: Page): Promise<unknown | null> {
  try {
    // Preferred: locator.ariaSnapshot() returns the accessibility (role/name)
    // tree as a YAML string. This is the current, non-deprecated API and is
    // reliable across pages, unlike page.accessibility.snapshot() which is
    // deprecated and frequently returns null.
    const body = page.locator("body");
    const anyBody = body as unknown as { ariaSnapshot?: () => Promise<string> };
    if (typeof anyBody.ariaSnapshot === "function") {
      const yaml = await anyBody.ariaSnapshot();
      if (yaml && yaml.trim().length > 0) {
        return { format: "aria-snapshot-yaml", tree: yaml };
      }
    }
    // Fallback: deprecated accessibility snapshot, if this Playwright still has it.
    const anyPage = page as unknown as { accessibility?: { snapshot?: (o?: unknown) => Promise<unknown> } };
    if (anyPage.accessibility?.snapshot) {
      const snap = await anyPage.accessibility.snapshot({ interestingOnly: true });
      if (snap) return { format: "accessibility-snapshot", tree: snap };
    }
    return null;
  } catch {
    return null;
  }
}
