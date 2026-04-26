import { createLogger } from "./observability/logger.js";

const logger = createLogger("RichText");
const ALLOWED_INLINE_TAGS = new Set(["A", "BR", "CODE", "EM", "MARK", "STRONG", "U"]);
const BLOCK_BREAK_TAGS = new Set(["DIV", "P", "LI", "TR", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE"]);

/**
 * @typedef {Object} RichTextContent
 * @property {string} html Sanitized inline HTML.
 * @property {string} text Plain text derived from html.
 */

/**
 * Escapes legacy text content into the controlled inline HTML representation.
 *
 * @param {string} text
 * @returns {string}
 */
export function textToSafeHtml(text = "") {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

/**
 * Normalizes legacy text-only records and new rich records to `{ html, text }`.
 *
 * @param {{ html?: string, text?: string }|null|undefined} content
 * @returns {RichTextContent}
 */
export function normalizeRichTextContent(content = {}) {
  const sourceHtml = typeof content.html === "string" && content.html ? content.html : textToSafeHtml(content.text || "");
  const html = sanitizeInlineHtml(sourceHtml);
  return { html, text: plainTextFromHtml(html) };
}

/**
 * Sanitizes contenteditable or clipboard HTML to a small inline allowlist.
 * Unknown elements are unwrapped so readable text survives without foreign UI.
 *
 * @param {string} html
 * @returns {string}
 */
export function sanitizeInlineHtml(html = "") {
  if (typeof document === "undefined") {
    return sanitizeInlineHtmlFallback(html);
  }
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const stats = { removedElements: 0, removedAttributes: 0 };
  const fragment = sanitizeChildren(template.content, stats);
  const wrapper = document.createElement("div");
  wrapper.append(fragment);
  const output = normalizeInlineHtml(wrapper.innerHTML);
  if (stats.removedElements || stats.removedAttributes) logger.debug("Sanitized inline HTML", { context: stats });
  return output;
}

/**
 * Extracts deterministic plain text from sanitized inline HTML.
 *
 * @param {string} html
 * @returns {string}
 */
export function plainTextFromHtml(html = "") {
  if (typeof document === "undefined") return stripTags(sanitizeInlineHtmlFallback(html)).replace(/\s+/g, " ").trim();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeInlineHtml(html);
  return wrapper.innerText?.replace(/\u00a0/g, " ").trim() || wrapper.textContent?.replace(/\s+/g, " ").trim() || "";
}

/**
 * Converts sanitized inline HTML to conservative Markdown.
 *
 * @param {string} html
 * @returns {string}
 */
export function inlineHtmlToMarkdown(html = "") {
  if (typeof document === "undefined") return inlineHtmlToMarkdownFallback(html);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeInlineHtml(html);
  return [...wrapper.childNodes].map(nodeToMarkdown).join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function safeLinkHref(value = "") {
  try {
    const url = new URL(value, globalThis.location?.href || "https://example.invalid/");
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function sanitizeChildren(parent, stats) {
  const fragment = document.createDocumentFragment();
  for (const child of [...parent.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      fragment.append(document.createTextNode(child.textContent || ""));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const tag = child.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "IFRAME" || tag === "OBJECT" || tag === "EMBED" || tag === "FORM" || tag === "INPUT" || tag === "BUTTON") {
      stats.removedElements += 1;
      continue;
    }
    if (tag === "B") {
      fragment.append(wrapAllowed("strong", child, stats));
      continue;
    }
    if (tag === "I") {
      fragment.append(wrapAllowed("em", child, stats));
      continue;
    }
    if (ALLOWED_INLINE_TAGS.has(tag)) {
      fragment.append(wrapAllowed(tag.toLowerCase(), child, stats));
      continue;
    }
    if (BLOCK_BREAK_TAGS.has(tag) && fragment.childNodes.length) fragment.append(document.createElement("br"));
    fragment.append(sanitizeChildren(child, stats));
    if (BLOCK_BREAK_TAGS.has(tag)) fragment.append(document.createElement("br"));
    stats.removedElements += 1;
  }
  return fragment;
}

function wrapAllowed(tagName, source, stats) {
  const element = document.createElement(tagName);
  if (tagName === "a") {
    const href = safeLinkHref(source.getAttribute("href") || "");
    if (href) {
      element.setAttribute("href", href);
      element.setAttribute("rel", "noopener noreferrer");
      element.setAttribute("target", "_blank");
    }
  }
  stats.removedAttributes += Math.max(0, source.attributes.length - (tagName === "a" && element.hasAttribute("href") ? 1 : 0));
  element.append(sanitizeChildren(source, stats));
  if (tagName === "a" && !element.hasAttribute("href")) return document.createTextNode(element.textContent || "");
  return element;
}

function nodeToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const inner = [...node.childNodes].map(nodeToMarkdown).join("");
  const tag = node.tagName;
  if (tag === "BR") return "\n";
  if (tag === "STRONG") return `**${inner}**`;
  if (tag === "EM") return `_${inner}_`;
  if (tag === "CODE") return `\`${inner.replace(/`/g, "\\`")}\``;
  if (tag === "MARK") return `==${inner}==`;
  if (tag === "U") return inner;
  if (tag === "A") return node.getAttribute("href") ? `[${inner}](${node.getAttribute("href")})` : inner;
  return inner;
}

function normalizeInlineHtml(html) {
  return String(html || "")
    .replace(/(<br>\s*){3,}/g, "<br><br>")
    .replace(/^(<br>\s*)+|(\s*<br>)+$/g, "")
    .trim();
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}

function sanitizeInlineHtmlFallback(html) {
  let output = String(html || "")
    .replace(/<\s*(script|style|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*br\s*\/?>/gi, "<br>")
    .replace(/<\s*b(\s[^>]*)?>/gi, "<strong>")
    .replace(/<\s*\/\s*b\s*>/gi, "</strong>")
    .replace(/<\s*i(\s[^>]*)?>/gi, "<em>")
    .replace(/<\s*\/\s*i\s*>/gi, "</em>");
  output = output.replace(/<\s*\/?\s*([a-z0-9]+)([^>]*)>/gi, (match, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    if (match.startsWith("</")) return ["strong", "em", "u", "code", "mark", "a"].includes(tag) ? `</${tag}>` : "";
    if (tag === "br") return "<br>";
    if (!["strong", "em", "u", "code", "mark", "a"].includes(tag)) return "";
    if (tag !== "a") return `<${tag}>`;
    const hrefMatch = String(rawAttrs || "").match(/\shref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
    const href = hrefMatch ? hrefMatch[1].replace(/^['"]|['"]$/g, "") : "";
    const safeHref = safeLinkHref(href);
    return safeHref ? `<a href="${escapeHtml(safeHref)}" rel="noopener noreferrer" target="_blank">` : "";
  });
  return normalizeInlineHtml(output);
}

function inlineHtmlToMarkdownFallback(html) {
  return sanitizeInlineHtmlFallback(html)
    .replace(/<br>/gi, "\n")
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/gi, "_$1_")
    .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<mark>([\s\S]*?)<\/mark>/gi, "==$1==")
    .replace(/<u>([\s\S]*?)<\/u>/gi, "$1")
    .replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
