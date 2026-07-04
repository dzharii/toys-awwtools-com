/**
 * Small, fast, non-cryptographic string hash for privacy-preserving
 * fingerprints and anchor signatures. We only ever store short hashes, never
 * raw text.
 *
 * Uses FNV-1a 32-bit and renders as a short base36 string.
 */

export function hashString(input) {
  const str = typeof input === "string" ? input : String(input == null ? "" : input);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts to stay in integer range.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(36);
}

/**
 * Hash a normalized text sample. We deliberately truncate the input so we
 * never retain long fragments of page text, and normalize whitespace/case so
 * the signature is stable across minor rendering differences.
 */
export function hashTextSample(text, maxChars) {
  const limit = typeof maxChars === "number" ? maxChars : 120;
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, limit);
  return hashString(normalized);
}

/** Combine several short hashes/values into one short hash. */
export function combineHashes(parts) {
  return hashString((parts || []).join("|"));
}
