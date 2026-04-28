import { RICH_INLINE_ATTRS, RICH_INLINE_TAGS, SAFE_URL_PROTOCOLS } from "./constants.js";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

export function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n").replace(/[ \t\f\v]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function isSafeHref(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) return true;
  try {
    const url = new URL(trimmed, "https://example.invalid/");
    return SAFE_URL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeNode(node, doc) {
  if (node.nodeType === TEXT_NODE) {
    return doc.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== ELEMENT_NODE) {
    return doc.createDocumentFragment();
  }

  const tag = node.tagName.toUpperCase();
  if (tag === "B") return sanitizeNode(Object.assign(doc.createElement("strong"), { innerHTML: node.innerHTML }), doc);
  if (tag === "I") return sanitizeNode(Object.assign(doc.createElement("em"), { innerHTML: node.innerHTML }), doc);
  if (!RICH_INLINE_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();
    for (const child of [...node.childNodes]) fragment.appendChild(sanitizeNode(child, doc));
    if (tag === "P" || tag === "DIV" || tag === "LI") fragment.appendChild(doc.createElement("br"));
    return fragment;
  }

  const clean = doc.createElement(tag.toLowerCase());
  if (tag === "A") {
    const href = node.getAttribute("href") || "";
    if (isSafeHref(href)) {
      clean.setAttribute("href", href.trim());
      clean.setAttribute("rel", "noopener noreferrer");
      clean.setAttribute("target", "_blank");
    }
  }
  for (const attr of [...node.attributes]) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on") || name === "style" || name === "class" || name.startsWith("data-")) continue;
    if (!RICH_INLINE_ATTRS.has(name)) continue;
    if (tag === "A" && name === "href") continue;
    clean.setAttribute(attr.name, attr.value);
  }
  for (const child of [...node.childNodes]) clean.appendChild(sanitizeNode(child, doc));
  return clean;
}

export function sanitizeInlineHtml(input) {
  const html = String(input ?? "");
  if (typeof DOMParser !== "undefined" && typeof document !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild || doc.body;
    const out = document.createElement("div");
    for (const child of [...root.childNodes]) out.appendChild(sanitizeNode(child, document));
    return out.innerHTML;
  }

  return escapeHtml(html)
    .replace(/\r\n?/g, "\n")
    .replace(/\n/g, "<br>");
}

export function htmlToText(input) {
  const html = String(input ?? "");
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    return normalizeWhitespace(doc.body.textContent || "");
  }
  return normalizeWhitespace(html.replace(/<[^>]+>/g, " "));
}

export function plainTextToHtml(input) {
  return escapeHtml(String(input ?? "")).replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
}

export function inlineHtmlToMarkdown(input) {
  const html = String(input ?? "");
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    return nodeToMarkdown(doc.body.firstElementChild || doc.body).trim();
  }
  return normalizeWhitespace(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""));
}

function nodeToMarkdown(node) {
  if (node.nodeType === TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== ELEMENT_NODE) return "";

  const tag = node.tagName.toUpperCase();
  const text = [...node.childNodes].map(nodeToMarkdown).join("");
  if (tag === "STRONG" || tag === "B") return `**${text}**`;
  if (tag === "EM" || tag === "I") return `*${text}*`;
  if (tag === "U") return `<u>${text}</u>`;
  if (tag === "CODE") return `\`${text}\``;
  if (tag === "MARK") return `==${text}==`;
  if (tag === "A") {
    const href = node.getAttribute("href") || "";
    return href ? `[${text || href}](${href})` : text;
  }
  if (tag === "BR") return "\n";
  if (tag === "DIV" || tag === "P") return `${text}\n\n`;
  if (tag === "LI") return `- ${text}\n`;
  if (tag === "BLOCKQUOTE") return `> ${text}\n\n`;
  return text;
}

export function stripHtmlTags(input) {
  return htmlToText(input);
}
