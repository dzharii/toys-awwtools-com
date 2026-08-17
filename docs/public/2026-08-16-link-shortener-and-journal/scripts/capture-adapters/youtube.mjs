import { PREVIEW_HEIGHT, PREVIEW_QUALITY, PREVIEW_WIDTH } from "../../shared/constants.js";

const VIDEO_ID = /^[A-Za-z0-9_-]{6,20}$/;
const THUMBNAIL_HOSTS = new Set(["i.ytimg.com", "img.youtube.com"]);

export function youtubeVideoId(targetUrl) {
  const url = new URL(targetUrl);
  const hostname = url.hostname.toLowerCase();
  const candidate = hostname === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0] : url.pathname === "/watch" ? url.searchParams.get("v") : null;
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export function youtubeThumbnailCandidates(targetUrl, structuredThumbnail = "") {
  const id = youtubeVideoId(targetUrl);
  if (!id) return [];
  const candidates = [];
  if (structuredThumbnail) {
    try {
      const parsed = new URL(structuredThumbnail);
      if (parsed.protocol === "https:" && THUMBNAIL_HOSTS.has(parsed.hostname.toLowerCase())) candidates.push(parsed.href);
    } catch {}
  }
  for (const file of ["maxresdefault.jpg", "hq720.jpg", "sddefault.jpg", "hqdefault.jpg"]) candidates.push(`https://i.ytimg.com/vi/${id}/${file}`);
  return [...new Set(candidates)];
}

export const youtubeCaptureAdapter = Object.freeze({
  name: "youtube",
  strategy: "video thumbnail",
  async capture({ page, targetUrl, outputPath, logger }) {
    const structuredThumbnail = await page.evaluate(() => document.querySelector('meta[property="og:image"],link[rel="image_src"]')?.content || document.querySelector('link[rel="image_src"]')?.href || "");
    const candidates = youtubeThumbnailCandidates(targetUrl, structuredThumbnail);
    if (!candidates.length) return null;
    const renderPage = await page.context().newPage();
    try {
      await renderPage.setViewportSize({ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT });
      await renderPage.setContent(`<!doctype html><style>html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#090909}img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}</style><img id="thumbnail" alt="">`);
      for (const sourceUrl of candidates) {
        const dimensions = await renderPage.evaluate(async (url) => {
          const image = document.querySelector("#thumbnail");
          image.removeAttribute("src");
          const settled = new Promise((resolve) => {
            image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
            image.onerror = () => resolve(null);
          });
          image.src = url;
          return Promise.race([settled, new Promise((resolve) => setTimeout(() => resolve(null), 6000))]);
        }, sourceUrl);
        if (!dimensions || dimensions.width < 480 || dimensions.height < 270) {
          logger.debug("capture", `YouTube thumbnail candidate rejected: ${sourceUrl}; dimensions=${dimensions ? `${dimensions.width}x${dimensions.height}` : "unavailable"}`);
          continue;
        }
        await renderPage.screenshot({ path: outputPath, type: "jpeg", quality: PREVIEW_QUALITY, animations: "disabled", timeout: 10_000 });
        return { strategy: this.strategy, sourceUrl, sourceWidth: dimensions.width, sourceHeight: dimensions.height };
      }
      return null;
    } finally {
      await renderPage.close().catch(() => {});
    }
  }
});
