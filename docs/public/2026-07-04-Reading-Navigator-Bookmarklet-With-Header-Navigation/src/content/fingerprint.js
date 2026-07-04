/**
 * Weak, privacy-preserving fingerprints.
 *
 * We never store text. Fingerprints are derived from structure (segment type
 * counts, approximate lengths) and short hashes of heading text, so we can warn
 * the user if saved progress likely belongs to an older version of the page.
 */

import { combineHashes, hashTextSample } from "../utils/hash.js";

export function computeHeadingFingerprint(headings) {
  if (!headings || !headings.length) return null;
  const parts = headings.map((h) => h.level + ":" + h.textHash);
  return combineHashes(parts);
}

export function computeContentFingerprint(segments) {
  if (!segments || !segments.length) return null;
  const typeCounts = {};
  let totalHeight = 0;
  for (const seg of segments) {
    typeCounts[seg.type] = (typeCounts[seg.type] || 0) + 1;
    totalHeight += seg.height || 0;
  }
  const typePart = Object.keys(typeCounts)
    .sort()
    .map((t) => t + ":" + typeCounts[t])
    .join(",");
  const bucketPart = "n" + segments.length + "|h" + Math.round(totalHeight / 100);
  return combineHashes([typePart, bucketPart]);
}

/**
 * Compare stored fingerprints to current ones. Returns a similarity verdict
 * used by the restore card to warn about content drift.
 */
export function compareFingerprints(stored, current) {
  if (!stored || (!stored.contentFingerprint && !stored.headingFingerprint)) {
    return { match: "unknown", reason: "no stored fingerprint" };
  }
  const headingMatch = stored.headingFingerprint === current.headingFingerprint;
  const contentMatch = stored.contentFingerprint === current.contentFingerprint;

  if (headingMatch && contentMatch) return { match: "exact", reason: "structure matches" };
  if (headingMatch || contentMatch) return { match: "partial", reason: "page changed somewhat" };
  return { match: "different", reason: "page structure changed significantly" };
}

export { hashTextSample };
