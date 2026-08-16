import { ID_ALPHABET, ID_PATTERN } from "./constants.js";

export function parseTargetUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new TypeError("The target must be an absolute http:// or https:// URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new TypeError("The target must be an absolute http:// or https:// URL.");
  }
  return parsed.href;
}

export function normalizeSiteBase(input) {
  const value = parseTargetUrl(input);
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.href;
}

export function isValidId(value) {
  return typeof value === "string" && ID_PATTERN.test(value);
}

export function randomId(randomBytes) {
  let result = "";
  let cursor = 0;
  while (result.length < 8) {
    if (cursor >= randomBytes.length) throw new RangeError("Insufficient random data for an ID.");
    const byte = randomBytes[cursor++];
    if (byte >= 248) continue;
    result += ID_ALPHABET[byte % ID_ALPHABET.length];
  }
  return result;
}

const ALLOWED_LETTER = /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const ALLOWED_CHAR = /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana} .,:;!?'"()-]/u;

export function sanitizeText(input, kind = "title") {
  const fallback = kind === "description" ? "(no description)" : "(no title)";
  const source = typeof input === "string" ? input : "";
  let value = Array.from(source, (character) => ALLOWED_CHAR.test(character) ? character : " ")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  while (value && !ALLOWED_LETTER.test(value[0])) value = value.slice(1).trimStart();
  while (value && !ALLOWED_LETTER.test(value.at(-1))) value = value.slice(0, -1).trimEnd();
  const limit = kind === "description" ? 320 : 160;
  if (Array.from(value).length > limit) {
    value = Array.from(value).slice(0, limit).join("").trimEnd();
    while (value && !ALLOWED_LETTER.test(value.at(-1))) value = value.slice(0, -1).trimEnd();
  }
  return value || fallback;
}

export function parseManifest(text) {
  const ids = [];
  const firstLine = new Map();
  for (const [offset, raw] of String(text).split(/\r?\n/).entries()) {
    const value = raw.replace(/^[\t ]+|[\t ]+$/g, "");
    if (!value) continue;
    const line = offset + 1;
    if (!isValidId(value)) {
      const error = new Error(`Line ${line} contains an invalid link ID: ${value}`);
      error.code = "MANIFEST_INVALID_ID";
      error.context = { line, value };
      throw error;
    }
    if (firstLine.has(value)) {
      const error = new Error(`Link ID ${value} occurs more than once.`);
      error.code = "MANIFEST_DUPLICATE_ID";
      error.context = { id: value, firstLine: firstLine.get(value), repeatedLine: line };
      throw error;
    }
    firstLine.set(value, line);
    ids.push(value);
  }
  return ids;
}

export function pageRange(pageIndex, totalEntries) {
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return { start: 0, end: 0 };
  const start = pageIndex * 6;
  return { start, end: Math.min(start + 6, Math.max(0, totalEntries)) };
}

export function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function isoUtcSeconds(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function buildPublicUrls(siteBase, id) {
  const base = normalizeSiteBase(siteBase);
  const shortUrl = new URL(`lnk/${id}/`, base).href;
  return { shortUrl, previewUrl: new URL("preview.jpg", shortUrl).href };
}

export function generateRecordHtml({ id, targetUrl, createdAt, title, description, shortUrl, previewUrl }) {
  const e = htmlEscape;
  const jsTarget = JSON.stringify(targetUrl).replaceAll("<", "\\u003c");
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="lnk:id" content="${e(id)}">\n<meta name="lnk:target" content="${e(targetUrl)}">\n<meta name="lnk:created" content="${e(createdAt)}">\n<title>${e(title)}</title>\n<meta name="description" content="${e(description)}">\n<meta property="og:title" content="${e(title)}">\n<meta property="og:description" content="${e(description)}">\n<meta property="og:image" content="${e(previewUrl)}">\n<meta property="og:url" content="${e(shortUrl)}">\n<meta property="og:type" content="website">\n<meta http-equiv="refresh" content="0; url=${e(targetUrl)}">\n<script>location.replace(${jsTarget})<\/script>\n</head>\n<body>\n<p>Redirecting to the original page.</p>\n<p><a href="${e(targetUrl)}">Continue to the original page</a></p>\n</body>\n</html>\n`;
}
