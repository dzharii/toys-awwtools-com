import {
  buildLineStartOffsets,
  offsetAtLineNumber
} from "../line-index.js";

/**
 * Returns the known line count for a file record.
 *
 * @param {Object|null} file File record.
 * @returns {number} Non-negative line count.
 */
export function getFileLineCount(file) {
  if (!file) return 0;
  const indexedCount = file.lineIndex?.lineCount;
  if (Number.isFinite(indexedCount) && indexedCount >= 0) return indexedCount;
  if (Number.isFinite(file.lineCount) && file.lineCount >= 0) return file.lineCount;
  return 0;
}

/**
 * Clamps a 1-based line number to a file's valid line range.
 *
 * @param {Object|null} file File record.
 * @param {number} lineNumber Proposed line number.
 * @returns {number} Safe line number, or 0 when file has no lines.
 */
export function clampLineNumberForFile(file, lineNumber) {
  const total = getFileLineCount(file);
  if (!total) return 0;
  const parsed = Number.isFinite(lineNumber) ? Math.floor(lineNumber) : 1;
  return Math.min(total, Math.max(1, parsed));
}

/**
 * Resolves a line-start text offset for a file record.
 *
 * @param {Object|null} file File record.
 * @param {number} lineNumber 1-based line number.
 * @returns {number} Character offset in file text.
 */
export function getLineStartOffsetForFile(file, lineNumber) {
  if (!file) return 0;
  const safeLine = clampLineNumberForFile(file, lineNumber);
  if (!safeLine) return 0;
  const offsets = file.lineIndex?.offsets || buildLineStartOffsets(file.textFull || file.text || "");
  return offsetAtLineNumber(offsets, safeLine);
}

/**
 * Resolves a DOM text position for a character offset in a code root.
 *
 * @param {HTMLElement|null} root Code root element.
 * @param {number} offset Character offset.
 * @param {Document} [doc=document] Document owning the nodes.
 * @returns {{node: Text, offset: number}|null} Text node and offset pair.
 */
export function resolveTextPositionAtOffset(root, offset, doc = document) {
  if (!root) return null;
  const target = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
  const textNodeFilter = doc.defaultView?.NodeFilter?.SHOW_TEXT || 4;
  const walker = doc.createTreeWalker(root, textNodeFilter);
  let remaining = target;
  let lastNode = null;
  let node = walker.nextNode();
  while (node) {
    const value = node.nodeValue || "";
    const length = value.length;
    lastNode = node;
    if (remaining < length) {
      return { node, offset: remaining };
    }
    if (remaining === length) {
      const next = walker.nextNode();
      if (next) return { node: next, offset: 0 };
      return { node, offset: length };
    }
    remaining -= length;
    node = walker.nextNode();
  }
  if (!lastNode) return null;
  return { node: lastNode, offset: (lastNode.nodeValue || "").length };
}

/**
 * Measures a line position in a rendered `pre` using gutter rows first, with text-offset fallback.
 *
 * @param {{doc?: Document, pre: HTMLElement, code?: HTMLElement|null, file: Object|null, lineNumber: number}} input Measurement input.
 * @returns {{lineNumber:number, top:number, height:number}|null} Line metrics relative to pre scroll content.
 */
export function getLineMetricsInPre(input) {
  const {
    doc = document,
    pre,
    code = null,
    file,
    lineNumber
  } = input || {};
  if (!pre || !file) return null;

  const safeLine = clampLineNumberForFile(file, lineNumber);
  if (!safeLine) return null;

  const row = pre.querySelector(`.line-gutter-row[data-line="${safeLine}"]`);
  if (row) {
    const rowRect = row.getBoundingClientRect();
    const preRect = pre.getBoundingClientRect();
    const height = rowRect.height || parseFloat(getComputedStyle(row).lineHeight) || parseFloat(getComputedStyle(pre).lineHeight) || 18;
    return {
      lineNumber: safeLine,
      top: Math.max(0, rowRect.top - preRect.top + pre.scrollTop),
      height
    };
  }

  const rootCode = code || pre.querySelector("code");
  if (rootCode) {
    const offset = getLineStartOffsetForFile(file, safeLine);
    const pos = resolveTextPositionAtOffset(rootCode, offset, doc);
    if (pos) {
      const range = doc.createRange();
      range.setStart(pos.node, pos.offset);
      range.setEnd(pos.node, pos.offset);
      const rect = range.getClientRects()[0] || range.getBoundingClientRect();
      if (rect && Number.isFinite(rect.top)) {
        const preRect = pre.getBoundingClientRect();
        const lineHeight = rect.height || parseFloat(getComputedStyle(pre).lineHeight) || 18;
        return {
          lineNumber: safeLine,
          top: Math.max(0, rect.top - preRect.top + pre.scrollTop),
          height: lineHeight
        };
      }
    }
  }

  const fallbackLineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 18;
  return {
    lineNumber: safeLine,
    top: Math.max(0, (safeLine - 1) * fallbackLineHeight),
    height: fallbackLineHeight
  };
}
