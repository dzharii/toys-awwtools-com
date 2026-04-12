export function createBookmarkletUrl(scriptText) {
  return `javascript:${encodeURIComponent(String(scriptText ?? ""))}`;
}
