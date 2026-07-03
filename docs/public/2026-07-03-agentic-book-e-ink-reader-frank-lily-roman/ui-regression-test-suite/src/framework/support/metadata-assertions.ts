import type { EinkReaderApp } from "../app/automation-app.js";

/**
 * Static social/SEO metadata contract (gap-closure spec G00). These strings are
 * the canonical product promise and must stay in sync across the HTML head,
 * feed.xml, and README. The suite protects them from silent regression.
 */
export const CANONICAL = {
  title: "E Ink Reader - Local TXT and Markdown Reading",
  description:
    "Read local TXT and Markdown files in a calm E Ink-style browser reader with page mode, scroll mode, local fonts, and no uploads.",
  baseUrl: "https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/",
  socialImage:
    "https://toys.awwtools.com/public/2026-07-03-agentic-book-e-ink-reader-frank-lily-roman/assets/social/social_logo_1200x630.jpg",
  imageType: "image/jpeg",
  imageWidth: "1200",
  imageHeight: "630",
} as const;

/** Read the content of a meta tag by name or property attribute. */
export async function metaContent(app: EinkReaderApp, attr: "name" | "property", key: string): Promise<string | null> {
  return app.page.locator(`meta[${attr}="${key}"]`).first().getAttribute("content");
}

/** Read an attribute of a <link> selected by CSS. */
export async function linkAttr(app: EinkReaderApp, selector: string, attr: string): Promise<string | null> {
  return app.page.locator(selector).first().getAttribute(attr);
}

/** All description-like strings should describe the same honest promise. */
export function describesProductPromise(text: string | null): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes("txt") &&
    t.includes("markdown") &&
    t.includes("e ink") &&
    (t.includes("page") || t.includes("scroll")) &&
    (t.includes("no upload") || t.includes("not uploaded") || t.includes("local"))
  );
}

/** Read image intrinsic dimensions by loading it in the page. */
export async function imageDimensions(
  app: EinkReaderApp,
  url: string,
): Promise<{ width: number; height: number; ok: boolean }> {
  return app.page.evaluate(async (src) => {
    return await new Promise<{ width: number; height: number; ok: boolean }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, ok: true });
      img.onerror = () => resolve({ width: 0, height: 0, ok: false });
      img.src = src;
    });
  }, url);
}
