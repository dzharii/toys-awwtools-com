import { CAPTURE_SEARCH_HEIGHT, CAPTURE_VIEWPORT, MAX_CAPTURE_CANDIDATES, NAVIGATION_TIMEOUT_MS, PREVIEW_HEIGHT, PREVIEW_QUALITY, PREVIEW_WIDTH, STABILIZATION_BUDGET_MS } from "../shared/constants.js";
import { validateJpeg } from "./jpeg.mjs";
import { findCaptureAdapter } from "./capture-adapters/registry.mjs";

const now = () => performance.now();

export async function capturePage({ browser, targetUrl, outputPath, logger, userAgent, captureMode = "headless" }) {
  const timings = {};
  const started = now();
  const context = await browser.newContext({
    viewport: CAPTURE_VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    permissions: [],
    colorScheme: "light",
    ...(userAgent ? { userAgent } : {})
  });
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.dismiss().catch(() => {}));
  page.on("popup", (popup) => popup.close().catch(() => {}));
  try {
    logger.info("capture", `Opening target in Chromium: ${targetUrl}`);
    const navigationStart = now();
    const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS });
    timings.navigation = now() - navigationStart;
    const responseHeaders = response?.headers() || {};
    const navigationContext = {
      "HTTP status": response?.status(),
      "Final URL": page.url(),
      Server: responseHeaders.server,
      "Challenge marker": responseHeaders["cf-mitigated"],
      "Cloudflare Ray ID": responseHeaders["cf-ray"],
      "Capture mode": captureMode
    };
    logger.debug("capture", `Main document response. Mode: ${captureMode}; status: ${response?.status() ?? "unavailable"}; challenge marker: ${responseHeaders["cf-mitigated"] || "none"}.`);
    if (response && response.status() >= 400) {
      const headerChallenge = responseHeaders["cf-mitigated"]?.toLowerCase() === "challenge";
      const renderedBarrier = headerChallenge ? "an access challenge" : await detectBarrier(page);
      const challenged = renderedBarrier === "an access challenge";
      if (challenged && !headerChallenge) navigationContext["Challenge evidence"] = "rendered access-challenge text";
      const error = new Error(challenged ? `The target returned an access challenge (HTTP ${response.status()}).` : `Target returned HTTP ${response.status()}.`);
      error.code = challenged ? "CAPTURE_ACCESS_CHALLENGE" : "CAPTURE_HTTP_ERROR";
      error.stage = challenged ? "page readiness" : "page navigation";
      error.context = navigationContext;
      throw error;
    }

    const stabilizeStart = now();
    await Promise.race([
      page.evaluate(async () => {
        await document.fonts?.ready.catch(() => {});
        const images = [...document.images].filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.top < innerHeight * 2 && rect.bottom > 0;
        }).slice(0, 24);
        await Promise.all(images.map((image) => image.complete ? null : new Promise((resolve) => {
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          setTimeout(done, 1800);
        })));
      }),
      new Promise((resolve) => setTimeout(resolve, STABILIZATION_BUDGET_MS))
    ]);
    await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}html{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}" });
    await page.evaluate(() => {
      document.querySelectorAll("video,audio").forEach((media) => media.pause());
    });
    timings.stabilization = now() - stabilizeStart;

    await handleOverlays(page, logger);
    const barrier = await detectBarrier(page);
    if (barrier) {
      const error = new Error(`The target rendered ${barrier} instead of accessible content.`);
      error.code = barrier === "an access challenge" ? "CAPTURE_ACCESS_CHALLENGE" : barrier === "a CAPTCHA challenge" ? "CAPTURE_CAPTCHA_REQUIRED" : "CAPTURE_AUTHENTICATION_WALL";
      error.stage = "page readiness";
      error.context = navigationContext;
      throw error;
    }

    const metadata = await extractMetadata(page);
    logger.debug("capture", `Metadata title source: ${metadata.titleSource}; description source: ${metadata.descriptionSource}`);

    const { hostname, adapter } = findCaptureAdapter(targetUrl);
    logger.debug("capture", `Target hostname: ${hostname}; matched adapter: ${adapter?.name || "none"}`);
    let adapterFailure = null;
    if (adapter) {
      logger.debug("capture", `Site-specific capture adapter selected. Hostname: ${hostname}; adapter: ${adapter.name}; strategy: ${adapter.strategy}`);
      try {
        const adapterResult = await adapter.capture({ page, targetUrl, outputPath, logger });
        if (adapterResult) {
          const image = await validateJpeg(outputPath, PREVIEW_WIDTH, PREVIEW_HEIGHT);
          timings.screenshot = now() - stabilizeStart;
          timings.total = now() - started;
          logger.debug("capture", `Site-specific capture succeeded. Adapter: ${adapter.name}; strategy: ${adapterResult.strategy}; source=${adapterResult.sourceUrl}; sourceDimensions=${adapterResult.sourceWidth}x${adapterResult.sourceHeight}; genericFallback=false`);
          return { metadata, finalUrl: page.url(), clip: null, image, timings, adapter: { name: adapter.name, ...adapterResult } };
        }
        adapterFailure = "No usable thumbnail was found.";
      } catch (error) {
        adapterFailure = error.message;
      }
      logger.warn("capture", `Site-specific preview extraction failed. Hostname: ${hostname}; adapter: ${adapter.name}; result: ${adapterFailure}; generic fallback: attempting once.`);
    }

    const analysisStart = now();
    const analysis = await analyzeCandidates(page);
    timings.analysis = now() - analysisStart;
    logger.debug("capture", `Candidate analysis: inspected=${analysis.inspected} valid=${analysis.candidates.length} fallback=${analysis.fallback}`);
    for (const [index, candidate] of analysis.candidates.slice(0, 5).entries()) {
      logger.debug("capture", `Candidate ${index + 1}: source=${candidate.source} x=${candidate.x} y=${candidate.y} score=${candidate.score.toFixed(1)} text=${candidate.textLength} images=${candidate.imageCount}`);
    }
    if (!analysis.selected) {
      const error = new Error(`No page region satisfied the minimum content requirements. ${analysis.inspected} candidate regions were inspected.`);
      error.code = "CAPTURE_NO_VALID_REGION";
      error.stage = "preview selection";
      error.context = { candidatesInspected: analysis.inspected, fallbackAttempted: true, ...(adapter ? { hostname, adapter: adapter.name, adapterResult: adapterFailure, genericFallback: "No page region satisfied the minimum content requirements." } : {}) };
      throw error;
    }

    const clip = analysis.selected.clip;
    logger.debug("capture", `Selected preview crop: x=${clip.x} y=${clip.y} width=${clip.width} height=${clip.height} score=${analysis.selected.score.toFixed(1)}`);
    const shotStart = now();
    await page.screenshot({ path: outputPath, type: "jpeg", quality: PREVIEW_QUALITY, clip, animations: "disabled", timeout: 10_000 });
    timings.screenshot = now() - shotStart;
    const image = await validateJpeg(outputPath, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    timings.total = now() - started;
    logger.debug("capture", `Capture timing: navigation=${Math.round(timings.navigation)}ms stabilization=${Math.round(timings.stabilization)}ms analysis=${Math.round(timings.analysis)}ms screenshot=${Math.round(timings.screenshot)}ms total=${Math.round(timings.total)}ms`);
    return { metadata, finalUrl: page.url(), clip, image, timings };
  } finally {
    await context.close().catch((error) => logger.warn("capture", `Browser cleanup warning: ${error.message}`));
  }
}

async function handleOverlays(page, logger) {
  const dismissed = await page.evaluate(() => {
    const label = /^(close|dismiss|reject( all)?|continue without|not now|decline)$/i;
    const controls = [...document.querySelectorAll("button,[role=button]")].slice(0, 200);
    const target = controls.find((element) => label.test((element.getAttribute("aria-label") || element.textContent || "").trim()));
    if (target) { target.click(); return true; }
    return false;
  });
  if (dismissed) {
    logger.debug("capture", "Dismissed a conservative non-content overlay control.");
    await page.waitForTimeout(150);
  }
  const hidden = await page.evaluate(() => {
    let count = 0;
    for (const element of [...document.querySelectorAll("[role=dialog],dialog,[aria-modal=true]")].slice(0, 12)) {
      const rect = element.getBoundingClientRect();
      const text = (element.textContent || "").toLowerCase();
      if (rect.width * rect.height > innerWidth * innerHeight * 0.18 && !/(sign in|log in|password|captcha|verify|paywall)/.test(text)) {
        element.style.setProperty("display", "none", "important"); count += 1;
      }
    }
    return count;
  });
  if (hidden) logger.warn("capture", `Hid ${hidden} nonessential obstructive overlay${hidden === 1 ? "" : "s"}.`);
}

async function detectBarrier(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || "").slice(0, 8000).toLowerCase();
    const forms = [...document.forms];
    if (/captcha/.test(text)) return "a CAPTCHA challenge";
    if (/(checking your browser|verify you are human|access denied|security challenge)/.test(text)) return "an access challenge";
    const hasPassword = forms.some((form) => form.querySelector('input[type="password"]'));
    if (hasPassword && /(sign in|log in|password|authentication)/.test(text)) return "an authentication wall";
    return null;
  });
}

async function extractMetadata(page) {
  return page.evaluate(() => {
    const clean = (value) => typeof value === "string" ? value.trim() : "";
    const meta = (selector) => clean(document.querySelector(selector)?.content);
    const visible = (element) => {
      if (!element) return "";
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 && rect.height > 1 ? clean(element.innerText) : "";
    };
    const titleOptions = [
      ["og:title", meta('meta[property="og:title"]')],
      ["document title", clean(document.title)],
      ["first useful h1", visible(document.querySelector("h1"))],
      ["first useful heading", visible(document.querySelector('h2,h3,[role="heading"]'))]
    ];
    const primaryHeading = document.querySelector('h1,[role="heading"],h2');
    const associated = primaryHeading?.parentElement ? [...primaryHeading.parentElement.querySelectorAll("p")].map(visible).find((text) => text.length >= 40) : "";
    const paragraph = [...document.querySelectorAll("main p,article p,p")].map(visible).find((text) => text.length >= 40) || "";
    const descriptionOptions = [
      ["og:description", meta('meta[property="og:description"]')],
      ["meta description", meta('meta[name="description"]')],
      ["heading-associated text", associated],
      ["first visible paragraph", paragraph]
    ];
    const [titleSource, title = ""] = titleOptions.find(([, value]) => value) || ["none", ""];
    const [descriptionSource, description = ""] = descriptionOptions.find(([, value]) => value) || ["none", ""];
    return { title, description, titleSource, descriptionSource };
  });
}

async function analyzeCandidates(page) {
  return page.evaluate(({ searchHeight, maxCandidates, previewWidth, previewHeight }) => {
    const unique = new Set();
    const nodes = [];
    const add = (element, source) => {
      if (!element || unique.has(element) || nodes.length >= maxCandidates * 4) return;
      unique.add(element); nodes.push([element, source]);
    };
    document.querySelectorAll('article,main,[role="main"],section').forEach((e) => add(e, e.tagName.toLowerCase()));
    document.querySelectorAll('h1,h2,h3,[role="heading"]').forEach((e) => add(e.parentElement, "heading-group"));
    document.querySelectorAll('img,svg,canvas,pre,table').forEach((e) => add(e.parentElement, `${e.tagName.toLowerCase()}-group`));
    document.querySelectorAll('div').forEach((e) => {
      if (nodes.length >= maxCandidates * 4) return;
      const rect = e.getBoundingClientRect();
      if (rect.width >= 420 && rect.height >= 180 && rect.top + scrollY < searchHeight) add(e, "container");
    });
    const viewportWidth = Math.max(document.documentElement.scrollWidth, innerWidth);
    const documentHeight = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
    const results = [];
    for (const [element, source] of nodes) {
      if (results.length >= maxCandidates) break;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const y = rect.top + scrollY;
      if (style.display === "none" || style.visibility === "hidden" || rect.width < 180 || rect.height < 90 || y > searchHeight || rect.bottom < 0) continue;
      const headings = [...element.querySelectorAll('h1,h2,h3,[role="heading"]')].filter((h) => {
        const r = h.getBoundingClientRect(); return r.width > 20 && r.height > 12 && parseFloat(getComputedStyle(h).fontSize) >= 14;
      });
      const textElements = [...element.querySelectorAll('p,li,pre,code,td,th')].slice(0, 80);
      const textLength = textElements.reduce((sum, node) => {
        const s = getComputedStyle(node); const r = node.getBoundingClientRect();
        return sum + (r.width > 10 && r.height > 8 && parseFloat(s.fontSize) >= 14 ? (node.innerText || "").trim().length : 0);
      }, Math.min((element.innerText || "").trim().length, 240));
      const imageCount = [...element.querySelectorAll('img,svg,canvas,iframe')].filter((image) => {
        const r = image.getBoundingClientRect(); return r.width >= 200 && r.height >= 120;
      }).length;
      const tag = element.tagName.toLowerCase();
      const identity = `${tag} ${element.id} ${element.className}`.toLowerCase();
      const semantic = tag === "main" || tag === "article" || element.getAttribute("role") === "main" ? 24 : 0;
      const navPenalty = element.closest('nav,footer,[role="navigation"],[role="contentinfo"]') ? 70 : 0;
      const noisyPenalty = /(advert|cookie|consent|modal|footer|sidebar|social|share|related|comment)/.test(identity) ? 32 : 0;
      const buttons = element.querySelectorAll('button,[role="button"],input').length;
      const area = Math.min(rect.width * rect.height, previewWidth * previewHeight);
      const contentCoverage = Math.min(1, (textLength * 110 + imageCount * 90_000) / Math.max(1, area));
      const score = semantic + headings.length * 25 + Math.min(28, textLength / 45) + imageCount * 18 + (textLength > 80 && imageCount ? 12 : 0) + contentCoverage * 18 + Math.max(0, 8 - y / 500) - navPenalty - noisyPenalty - Math.min(20, buttons * 1.3);
      const valid = score >= 18 && (headings.length && textLength >= 35 || textLength >= 180 || imageCount && (textLength >= 20 || rect.width * rect.height > 220_000));
      if (!valid) continue;
      const centerX = rect.left + scrollX + rect.width / 2;
      let x = Math.round(centerX - previewWidth / 2);
      x = Math.max(0, Math.min(x, viewportWidth - previewWidth));
      if (headings.length) {
        const headingRect = headings[0].getBoundingClientRect();
        const headingLeft = headingRect.left + scrollX;
        const headingRight = headingRect.right + scrollX;
        if (headingLeft < x + 40) x = Math.max(0, Math.round(headingLeft - 40));
        if (headingRight <= headingLeft + previewWidth - 80 && headingRight > x + previewWidth - 40) x = Math.min(viewportWidth - previewWidth, Math.round(headingRight - previewWidth + 40));
      }
      let cropY = Math.round(y - (headings.length ? 72 : Math.max(0, (previewHeight - Math.min(rect.height, previewHeight)) / 2)));
      cropY = Math.max(0, Math.min(cropY, Math.max(0, documentHeight - previewHeight)));
      results.push({ source, score, x: Math.round(rect.left + scrollX), y: Math.round(y), textLength, imageCount, clip: { x, y: cropY, width: previewWidth, height: previewHeight } });
    }
    results.sort((a, b) => b.score - a.score || a.y - b.y || Math.abs((a.x + 600) - viewportWidth / 2) - Math.abs((b.x + 600) - viewportWidth / 2) || b.textLength - a.textLength);
    let fallback = false;
    let selected = results[0] || null;
    if (!selected) {
      fallback = true;
      const boxes = [...document.querySelectorAll('h1,h2,h3,p,img,svg,canvas,pre,main,section')].slice(0, 300).map((e) => {
        const r = e.getBoundingClientRect(); const y = r.top + scrollY;
        return { x: r.left + scrollX, y, w: r.width, h: r.height, text: (e.innerText || "").trim().length, image: /^(IMG|SVG|CANVAS)$/.test(e.tagName) };
      }).filter((b) => b.y < 1600 && b.w > 30 && b.h > 15);
      let best = null;
      for (let y = 0; y <= Math.max(0, Math.min(1600, documentHeight - previewHeight)); y += 105) {
        const inside = boxes.filter((b) => b.y + b.h > y && b.y < y + previewHeight);
        const text = inside.reduce((sum, b) => sum + b.text, 0);
        const images = inside.filter((b) => b.image && b.w >= 200 && b.h >= 120).length;
        const score = Math.min(50, text / 35) + images * 25;
        if ((!best || score > best.score) && (text >= 180 || images > 0 && text >= 20)) best = { score, y, text, images };
      }
      if (best) selected = { source: "densest-content-fallback", score: best.score, x: 0, y: best.y, textLength: best.text, imageCount: best.images, clip: { x: Math.max(0, Math.floor((viewportWidth - previewWidth) / 2)), y: best.y, width: previewWidth, height: previewHeight } };
    }
    return { inspected: Math.min(nodes.length, maxCandidates), candidates: results, fallback, selected };
  }, { searchHeight: CAPTURE_SEARCH_HEIGHT, maxCandidates: MAX_CAPTURE_CANDIDATES, previewWidth: PREVIEW_WIDTH, previewHeight: PREVIEW_HEIGHT });
}
