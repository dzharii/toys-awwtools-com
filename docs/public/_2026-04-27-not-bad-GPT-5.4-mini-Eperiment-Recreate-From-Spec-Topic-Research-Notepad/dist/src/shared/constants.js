export const DB_NAME = "TopicResearchNotepadDB";
export const DB_VERSION = 1;
export const APP_DATA_FORMAT_VERSION = 1;
export const EXPORT_FORMAT_VERSION = 1;
export const WORKER_PROTOCOL_VERSION = 1;

export const PAGE_SORT_STEP = 1000;
export const BLOCK_SORT_STEP = 1000;

export const DEFAULT_PAGE_TITLE = "Untitled research";
export const DEFAULT_PAGE_SUMMARY = "";

export const PAGE_STORE = "pages";
export const BLOCK_STORE = "blocks";
export const SEARCH_INDEX_STORE = "searchIndex";
export const SETTINGS_STORE = "settings";
export const OPERATIONS_STORE = "operations";

export const BLOCK_TYPES = Object.freeze([
  "paragraph",
  "heading",
  "quote",
  "list",
  "table",
  "code",
  "sourceLink",
  "unsupported"
]);

export const RICH_INLINE_TAGS = new Set([
  "A",
  "BR",
  "CODE",
  "EM",
  "MARK",
  "STRONG",
  "U",
  "SUB",
  "SUP"
]);

export const RICH_INLINE_ATTRS = new Set(["href", "title", "target", "rel"]);

export const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

