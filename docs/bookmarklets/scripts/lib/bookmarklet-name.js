/**
 * Validates bookmarklet folder names so generated paths stay predictable and script-safe.
 */
export function isValidBookmarkletName(name) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}
