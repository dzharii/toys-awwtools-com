/**
 * Readable content-root detection.
 *
 * Scores candidate containers so we segment the main article rather than the
 * entire document (nav, header, footer, comments, sidebars, banners).
 * Runs only on startup, explicit rescan, and confirmed content/route change --
 * never during normal sampling.
 */

import { CONFIG } from "../config.js";
import { isElementVisible, isInsideAppHost, normalizeText } from "../utils/dom.js";

const NEGATIVE_TAGS = new Set(["NAV", "HEADER", "FOOTER", "ASIDE", "FORM", "BUTTON"]);
const NEGATIVE_PATTERN = /(^|[\s_-])(nav|menu|header|footer|sidebar|aside|comment|comments|promo|advert|ad|ads|banner|cookie|consent|share|social|related|recommend|widget|breadcrumb|pagination|masthead|subscribe|newsletter)([\s_-]|$)/i;
const POSITIVE_PATTERN = /(^|[\s_-])(article|content|post|entry|main|story|body|markdown|prose|doc|documentation|readme)([\s_-]|$)/i;

function looksNegative(element) {
  if (NEGATIVE_TAGS.has(element.tagName)) return true;
  const role = element.getAttribute && element.getAttribute("role");
  if (role && /(navigation|banner|complementary|contentinfo|search)/i.test(role)) return true;
  const id = element.id || "";
  const cls = typeof element.className === "string" ? element.className : "";
  return NEGATIVE_PATTERN.test(id) || NEGATIVE_PATTERN.test(cls);
}

function looksPositive(element) {
  const role = element.getAttribute && element.getAttribute("role");
  if (role && /(main|article)/i.test(role)) return true;
  const id = element.id || "";
  const cls = typeof element.className === "string" ? element.className : "";
  return POSITIVE_PATTERN.test(id) || POSITIVE_PATTERN.test(cls);
}

function isInsideNegativeRegion(element) {
  let node = element.parentElement;
  let depth = 0;
  while (node && depth < 6) {
    if (looksNegative(node)) return true;
    node = node.parentElement;
    depth++;
  }
  return false;
}

function scoreCandidate(element) {
  if (!isElementVisible(element)) return null;
  if (isInsideAppHost(element)) return null;

  const paragraphs = element.querySelectorAll("p");
  const headings = element.querySelectorAll("h1,h2,h3,h4,h5,h6");
  const links = element.querySelectorAll("a");

  const paragraphCount = paragraphs.length;
  const headingCount = headings.length;
  const text = normalizeText(element.textContent || "");
  const textLength = text.length;

  if (paragraphCount === 0 && headingCount === 0) return null;

  const rect = element.getBoundingClientRect();
  const visibleHeight = rect.height;

  // Link density: high link-to-text ratio suggests navigation / lists.
  let linkTextLength = 0;
  for (const link of links) linkTextLength += (link.textContent || "").length;
  const linkDensity = textLength > 0 ? linkTextLength / textLength : 1;

  let score = 0;
  score += paragraphCount * 12;
  score += headingCount * 8;
  score += Math.min(2000, textLength) * 0.05;
  score += Math.min(4000, visibleHeight) * 0.02;
  score -= linkDensity * 120;

  if (element.tagName === "ARTICLE") score += 60;
  if (element.tagName === "MAIN") score += 50;
  if (looksPositive(element)) score += 40;
  if (looksNegative(element)) score -= 120;
  if (isInsideNegativeRegion(element)) score -= 60;

  return {
    element,
    score,
    paragraphCount,
    headingCount,
    textLength,
    linkDensity,
  };
}

export function detectContentRoot() {
  const selectors = [
    "article",
    "main",
    '[role="main"]',
    ".post",
    ".entry-content",
    ".article-content",
    ".markdown-body",
    ".prose",
    "#content",
    "#main",
    ".content",
  ];

  const seen = new Set();
  const candidates = [];

  for (const sel of selectors) {
    let nodes;
    try {
      nodes = document.querySelectorAll(sel);
    } catch (_e) {
      continue;
    }
    for (const node of nodes) {
      if (seen.has(node)) continue;
      seen.add(node);
      const scored = scoreCandidate(node);
      if (scored) candidates.push(scored);
    }
  }

  // Always consider a few generic containers as a safety net.
  for (const node of document.querySelectorAll("section, div")) {
    if (candidates.length > 60) break;
    if (seen.has(node)) continue;
    // Only consider reasonably content-heavy generic containers.
    if (node.querySelectorAll("p").length < CONFIG.rootMinParagraphs) continue;
    seen.add(node);
    const scored = scoreCandidate(node);
    if (scored) candidates.push(scored);
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (best && best.score > 0 && best.paragraphCount >= 1) {
    let confidence = "medium";
    if (best.score > 200 && best.paragraphCount >= CONFIG.rootMinParagraphs) confidence = "high";
    else if (best.score < 60) confidence = "low";
    return {
      root: best.element,
      confidence,
      reason:
        best.element.tagName.toLowerCase() +
        " with " +
        best.paragraphCount +
        " paragraphs, " +
        best.headingCount +
        " headings",
      fallbackUsed: false,
      score: Math.round(best.score),
    };
  }

  // Fallback: use body. Lower confidence.
  return {
    root: document.body,
    confidence: "low",
    reason: "no strong content root found; using document body",
    fallbackUsed: true,
    score: 0,
  };
}
