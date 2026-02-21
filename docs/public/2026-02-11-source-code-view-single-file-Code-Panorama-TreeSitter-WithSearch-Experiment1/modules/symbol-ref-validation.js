/**
 * Returns whether a character is part of an identifier token.
 *
 * @param {string} ch Single-character string.
 * @returns {boolean} True when the character is identifier-like.
 */
export function isIdentifierChar(ch) {
  return typeof ch === "string" && /^[A-Za-z0-9_$]$/.test(ch);
}

/**
 * Checks whether a symbol appears at an exact index with identifier boundaries.
 *
 * @param {string} lineText Source line text.
 * @param {string} symbol Symbol to match.
 * @param {number} startIndex Zero-based start index.
 * @returns {boolean} True when the symbol matches with safe token boundaries.
 */
export function hasBoundedSymbolAt(lineText, symbol, startIndex) {
  const line = typeof lineText === "string" ? lineText : "";
  const token = typeof symbol === "string" ? symbol : "";
  if (!line || !token || !Number.isFinite(startIndex)) return false;
  const start = Math.max(0, Math.floor(startIndex));
  const end = start + token.length;
  if (start < 0 || end > line.length) return false;
  if (line.slice(start, end) !== token) return false;
  const before = start > 0 ? line[start - 1] : "";
  const after = end < line.length ? line[end] : "";
  return !isIdentifierChar(before) && !isIdentifierChar(after);
}

/**
 * Finds the first bounded symbol occurrence in a line.
 *
 * @param {string} lineText Source line text.
 * @param {string} symbol Symbol to find.
 * @param {number} [fromIndex=0] Optional search start offset.
 * @returns {number} Zero-based index, or -1 when not found.
 */
export function findBoundedSymbolInLine(lineText, symbol, fromIndex = 0) {
  const line = typeof lineText === "string" ? lineText : "";
  const token = typeof symbol === "string" ? symbol : "";
  if (!line || !token) return -1;
  let cursor = Number.isFinite(fromIndex) ? Math.max(0, Math.floor(fromIndex)) : 0;
  while (cursor <= line.length - token.length) {
    const idx = line.indexOf(token, cursor);
    if (idx < 0) return -1;
    if (hasBoundedSymbolAt(line, token, idx)) return idx;
    cursor = idx + 1;
  }
  return -1;
}

/**
 * Returns the 1-based line text from a pre-split line array.
 *
 * @param {string[]} lines Split line array.
 * @param {number} lineNumber 1-based line number.
 * @returns {string} Line text or empty string when unavailable.
 */
export function getLineText(lines, lineNumber) {
  if (!Array.isArray(lines)) return "";
  const idx = Number.isFinite(lineNumber) ? Math.floor(lineNumber) - 1 : -1;
  if (idx < 0 || idx >= lines.length) return "";
  return typeof lines[idx] === "string" ? lines[idx] : "";
}

/**
 * Validates that an occurrence appears in a line either by explicit span or bounded fallback search.
 *
 * @param {string} lineText Source line text.
 * @param {string} symbol Symbol name.
 * @param {{startCol?: number, endCol?: number}|null} occurrence Occurrence metadata.
 * @returns {boolean} True when the occurrence can be validated against line content.
 */
export function isOccurrenceValidInLine(lineText, symbol, occurrence) {
  const line = typeof lineText === "string" ? lineText : "";
  const token = typeof symbol === "string" ? symbol : "";
  if (!line || !token) return false;

  const startCol = Number.isFinite(occurrence?.startCol) ? Math.floor(occurrence.startCol) : 0;
  const endCol = Number.isFinite(occurrence?.endCol) ? Math.floor(occurrence.endCol) : 0;
  if (startCol > 0 && endCol > startCol) {
    const start = startCol - 1;
    return hasBoundedSymbolAt(line, token, start);
  }
  return findBoundedSymbolInLine(line, token, 0) >= 0;
}
