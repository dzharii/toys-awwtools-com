// Plain-text parser. Converts .txt into safe, readable prose HTML.
// Everything is escaped — text never becomes trusted markup.

import { escapeHtml } from "./utils.js";

/** Normalize line endings to \n and strip a leading UTF-8 BOM. */
export function normalizeText(text) {
  let out = text || "";
  if (out.charCodeAt(0) === 0xfeff) out = out.slice(1);
  return out.replace(/\r\n?/g, "\n");
}

/**
 * Heuristic: does this text look like preformatted/fixed-width content
 * (code, tables, ASCII art) rather than prose?
 */
function looksPreformatted(lines) {
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return false;
  let indented = 0;
  for (const line of nonEmpty) {
    if (/^(\t| {2,})/.test(line)) indented += 1;
  }
  return indented / nonEmpty.length > 0.35;
}

/**
 * Parse plain text into an array of block descriptors:
 *   { type: "p" | "pre", html }
 * Prose paragraphs reflow (soft newlines joined); preformatted files keep
 * their layout inside a single <pre>.
 */
export function parseTxt(rawText) {
  const text = normalizeText(rawText);
  const lines = text.split("\n");

  if (looksPreformatted(lines)) {
    // Trim trailing blank lines but keep internal structure verbatim.
    const body = text.replace(/\n{3,}$/g, "\n").replace(/\s+$/g, "");
    return [{ type: "pre", html: `<pre><code>${escapeHtml(body)}</code></pre>` }];
  }

  const blocks = [];
  let paragraph = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    const joined = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (joined) blocks.push({ type: "p", html: `<p>${escapeHtml(joined)}</p>` });
    paragraph = [];
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flush();
    } else {
      paragraph.push(line.trim());
    }
  }
  flush();

  return blocks;
}

/** Guess a title from the first non-empty line. */
export function guessTxtTitle(rawText) {
  const text = normalizeText(rawText);
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t) return t.length > 120 ? t.slice(0, 117) + "…" : t;
  }
  return null;
}
