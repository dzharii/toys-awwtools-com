/**
 * Counts logical lines in text for viewer stats and gutter generation.
 */
export function countLinesFromText(text) {
  const raw = typeof text === "string" ? text : "";
  if (!raw.length) return 0;
  let count = 1;
  for (let i = 0; i < raw.length; i += 1) {
    if (raw.charCodeAt(i) === 10) count += 1;
  }
  return count;
}
/**
 * Builds line-start offsets so offset and line-number lookups can run in constant or logarithmic time.
 */
export function buildLineStartOffsets(text) {
  const raw = typeof text === "string" ? text : "";
  if (!raw.length) return [];
  const offsets = [0];
  for (let i = 0; i < raw.length; i += 1) {
    if (raw.charCodeAt(i) === 10) offsets.push(i + 1);
  }
  return offsets;
}
/**
 * Resolves a 1-based line number for a character offset using precomputed line starts.
 */
export function lineNumberAtOffset(offsets, offset) {
  if (!Array.isArray(offsets) || !offsets.length) return 0;
  const target = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
  let lo = 0;
  let hi = offsets.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid] <= target) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans + 1;
}
/**
 * Resolves the start offset for a 1-based line number with bounds-safe behavior.
 */
export function offsetAtLineNumber(offsets, lineNumber) {
  if (!Array.isArray(offsets) || !offsets.length) return 0;
  const target = Number.isFinite(lineNumber) ? Math.floor(lineNumber) : 1;
  const idx = Math.min(offsets.length - 1, Math.max(0, target - 1));
  return offsets[idx] || 0;
}
/**
 * Splits source text into lines using the same newline model as runtime search and rendering flows.
 */
export function splitLinesPreserveShape(text) {
  const raw = typeof text === "string" ? text : "";
  if (!raw.length) return [];
  return raw.split("\n");
}
/**
 * Produces line-number labels used by code gutters and previews.
 */
export function buildGutterLineNumbers(lineCount) {
  const total = Number.isFinite(lineCount)
    ? Math.max(0, Math.floor(lineCount))
    : 0;
  const out = new Array(total);
  for (let i = 0; i < total; i += 1) out[i] = i + 1;
  return out;
}
