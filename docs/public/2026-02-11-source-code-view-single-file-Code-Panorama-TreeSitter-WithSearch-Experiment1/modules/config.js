export const defaults = {
  ignores: [".git", "node_modules", "dist", "build", "out", "target", "bin", "obj", ".idea", ".vscode"],
  allow: [
    "js", "ts", "jsx", "tsx", "mjs", "cjs",
    "c", "h", "cc", "cpp", "hpp", "cs", "java", "scala", "kt", "go", "rs",
    "py", "rb", "php", "swift", "m", "mm",
    "html", "css", "scss", "md", "txt", "sh", "ps1",
    "yaml", "yml", "toml", "ini", "xml"
  ],
  includeJson: false,
  maxFileSize: 1024 * 1024,
  memoryWarnBytes: 50 * 1024 * 1024,
  wrap: true,
  showStats: true
};

export const TREE_SITTER_ASSET_BASE = "lib/web-tree-sitter-v0.26.3";
export const TREE_SITTER_STORAGE_KEY = "code-panorama-tree-sitter";
export const SEARCH_CAP = 200;
export const SEARCH_SLICE_BUDGET = 10;
export const SEARCH_LIVE_DEBOUNCE = 250;
export const SEARCH_EXPLICIT_MIN = 2;
export const SEARCH_LIVE_MIN = 3;
export const PREVIEW_OPEN_DELAY = 150;
export const PREVIEW_SWITCH_DELAY = 75;
export const PREVIEW_INACTIVE_MS = 9000;
export const PREVIEW_DEFAULT_WIDTH = 420;
export const PREVIEW_DEFAULT_HEIGHT = 280;
export const PREVIEW_MIN_WIDTH = 260;
export const PREVIEW_MIN_HEIGHT = 160;
export const PREVIEW_VIEWPORT_MARGIN = 8;
export const PREVIEW_GAP = 10;
export const PREVIEW_CACHE_LIMIT = 12;
export const PREVIEW_INITIAL_WIDTH_RATIO = 0.6;
export const PREVIEW_INITIAL_HEIGHT_RATIO = 0.5;
export const HIGHLIGHT_RETRY_DELAY_MS = 1800;
export const HIGHLIGHT_MAX_RETRIES = 3;
export const MICROLIGHT_PENDING_CLASS = "microlight-pending";

export const TREE_SITTER_LANGUAGES = {
  c: { file: "tree-sitter-c-v0.24.1.wasm" },
  cpp: { file: "tree-sitter-cpp-v0.23.4.wasm" },
  bash: { file: "tree-sitter-bash-v0.25.1.wasm" },
  csharp: { file: "tree-sitter-c_sharp-v0.23.1.wasm" },
  javascript: { file: "tree-sitter-javascript-v0.25.0.wasm" },
  json: { file: "tree-sitter-json-v0.24.8.wasm" },
  scala: { file: "tree-sitter-scala-v0.24.0.wasm" }
};
