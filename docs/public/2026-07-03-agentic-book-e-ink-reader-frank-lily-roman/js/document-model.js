// Builds a normalized, session-only document model from raw file text.
// The model separates source input from rendered HTML so pagination/rendering
// never depend on scattered raw strings. Nothing here is persisted.

import { AppError, ErrorCode } from "./errors.js";
import { log } from "./logging.js";
import { generateId, estimateWords } from "./utils.js";
import { parseTxt, guessTxtTitle, normalizeText } from "./parser-txt.js";
import { parseMarkdown } from "./parser-markdown.js";

/** Extract a title from the first heading in an HTML fragment. */
function titleFromHtml(html) {
  const match = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i.exec(html);
  if (!match) return null;
  const text = match[1].replace(/<[^>]+>/g, "").trim();
  return text || null;
}

/** Strip an extension for a filename-derived title. */
function titleFromFileName(fileName) {
  return (fileName || "Untitled").replace(/\.(txt|md|markdown)$/i, "");
}

/**
 * Build the normalized document.
 * @param {object} input { fileName, fileType: "text"|"markdown", sourceText, forceText }
 * @returns normalizedDocument
 */
export function buildDocument(input) {
  const { fileName, fileType, sourceText } = input;
  const normalized = normalizeText(sourceText);

  if (!normalized.trim()) {
    throw new AppError(ErrorCode.EMPTY_FILE, "no readable content");
  }

  let html;
  let title;
  let hadRawHtml = false;
  const effectiveType = input.forceText ? "text" : fileType;

  if (effectiveType === "markdown") {
    const result = parseMarkdown(normalized);
    html = result.html;
    hadRawHtml = result.hadRawHtml;
    title = titleFromHtml(html) || titleFromFileName(fileName);
    if (!html.trim()) {
      throw new AppError(ErrorCode.EMPTY_FILE, "markdown rendered empty");
    }
  } else {
    const blocks = parseTxt(normalized);
    if (blocks.length === 0) {
      throw new AppError(ErrorCode.EMPTY_FILE, "no readable content");
    }
    html = blocks.map((b) => b.html).join("\n");
    title = guessTxtTitle(normalized) || titleFromFileName(fileName);
  }

  const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;

  const doc = {
    id: generateId(),
    fileName: fileName || "book",
    fileType: effectiveType,
    title,
    characterCount: normalized.length,
    wordEstimate: estimateWords(normalized),
    headingCount,
    html,
    hadRawHtml,
  };

  log.info("document:normalized", {
    fileType: doc.fileType,
    characterCount: doc.characterCount,
    wordEstimate: doc.wordEstimate,
    headingCount: doc.headingCount,
    forcedText: !!input.forceText,
  });

  return doc;
}
