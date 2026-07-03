// Markdown parser wrapper. Treats Markdown as untrusted input.
//
// Security model:
//  - markdown-it is configured with html: false, so raw HTML in the source is
//    escaped and shown as literal text (never rendered as markup).
//  - Remote images are never emitted; the image rule renders a non-fetching
//    placeholder instead of an <img>.
//  - The rendered HTML is then sanitized with DOMPurify (defense in depth) to a
//    restrictive reading-only tag/attribute set.
//  - If DOMPurify is unavailable we fail closed (caller falls back to plain text).

import { AppError, ErrorCode } from "./errors.js";
import { log } from "./logging.js";
import { escapeHtml } from "./utils.js";
import { normalizeText } from "./parser-txt.js";

// Reading-safe allow-list. No script, style, iframe, object, form, or img.
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "blockquote",
  "ul", "ol", "li",
  "strong", "em", "b", "i", "s", "del", "mark", "sup", "sub",
  "a", "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
  "span",
];
const ALLOWED_ATTR = ["href", "class", "title"];

let mdInstance = null;

function getMarkdownIt() {
  if (mdInstance) return mdInstance;
  const factory = window.markdownit;
  if (typeof factory !== "function") {
    throw new AppError(ErrorCode.PARSER_UNAVAILABLE, "window.markdownit missing");
  }
  const md = factory({
    html: false, // do not allow raw HTML — escaped as text instead
    linkify: true,
    typographer: true,
    breaks: false,
  });

  // Replace image rendering with a safe, non-fetching placeholder.
  md.renderer.rules.image = (tokens, idx) => {
    const alt = tokens[idx].content || "";
    const label = alt ? `image: ${alt}` : "image";
    return `<span class="md-image-placeholder">[${escapeHtml(label)}]</span>`;
  };

  mdInstance = md;
  return md;
}

/** True if the raw source contains HTML tags (which we escape, not render). */
function containsRawHtml(text) {
  return /<\/?[a-z][\s\S]*?>/i.test(text) || /<script/i.test(text);
}

/**
 * Parse Markdown into sanitized, reading-safe HTML.
 * Returns { html, hadRawHtml }.
 * Throws AppError(PARSE_FAILED) on parser error and
 * AppError(SANITIZER_UNAVAILABLE) if DOMPurify is missing.
 */
export function parseMarkdown(rawText) {
  const text = normalizeText(rawText);
  const md = getMarkdownIt();

  let rendered;
  try {
    rendered = md.render(text);
  } catch (err) {
    log.error("parser:markdown:error", { reason: (err && err.message) || "render" });
    throw new AppError(ErrorCode.PARSE_FAILED, (err && err.message) || "render");
  }

  const purify = window.DOMPurify;
  if (!purify || typeof purify.sanitize !== "function") {
    // Fail closed: never render unsanitized Markdown HTML.
    throw new AppError(ErrorCode.SANITIZER_UNAVAILABLE, "window.DOMPurify missing");
  }

  const clean = purify.sanitize(rendered, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["style", "script", "img", "iframe", "object", "embed", "form", "svg", "math"],
    FORBID_ATTR: ["style", "srcset", "src", "onerror", "onload"],
    ADD_ATTR: [], // links get rel/target added post-sanitize
  });

  const removedCount = (purify.removed && purify.removed.length) || 0;
  if (removedCount > 0) {
    log.warn("parser:markdown:sanitized", { removed: removedCount });
  }

  return {
    html: clean,
    hadRawHtml: containsRawHtml(text) || removedCount > 0,
  };
}

export function isMarkdownAvailable() {
  return typeof window.markdownit === "function";
}

export function isSanitizerAvailable() {
  return !!(window.DOMPurify && typeof window.DOMPurify.sanitize === "function");
}
