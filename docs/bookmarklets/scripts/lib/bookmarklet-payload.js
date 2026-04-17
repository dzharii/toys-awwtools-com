/**
 * Converts bundled JavaScript into a compact bookmarklet URL payload suitable for direct installation.
 */
export function toBookmarkletPayload(code) {
  const flattened = code
    .replace(/\n+/g, "")
    .replace(/\u2028|\u2029/g, "")
    .trim();

  return `javascript:${flattened}`;
}
