const EXT_TO_LANGUAGE = {
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  mjs: "JavaScript",
  cjs: "JavaScript",
  c: "C",
  h: "C/C Header",
  cc: "C++",
  cpp: "C++",
  hpp: "C++ Header",
  cs: "C#",
  java: "Java",
  scala: "Scala",
  kt: "Kotlin",
  go: "Go",
  rs: "Rust",
  py: "Python",
  rb: "Ruby",
  php: "PHP",
  swift: "Swift",
  m: "Objective-C",
  mm: "Objective-C++",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  md: "Markdown",
  txt: "Text",
  sh: "Shell",
  ps1: "PowerShell",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  ini: "INI",
  xml: "XML",
  json: "JSON",
};
/**
 * Formats byte counts for status and summary UI display.
 * Returns a stable human-readable unit string for finite and non-finite input.
 */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
/**
 * Replaces a button label with a consistent icon plus text structure used across toolbar controls.
 */
export function setButtonLabel(button, icon, text, doc = document) {
  if (!button) return;
  button.innerHTML = "";
  const emoji = doc.createElement("span");
  emoji.className = "btn-emoji";
  emoji.textContent = icon;
  const label = doc.createElement("span");
  label.className = "btn-label";
  label.textContent = text;
  button.append(emoji, label);
}
/**
 * Builds a markdown code snippet for a file so content can be copied or shared with source context.
 */
export function buildMarkdownSnippet(file) {
  if (!file) return "";
  const parts = file.path.split(".");
  const ext = parts.length > 1 ? parts.pop() || "" : "";
  const lang = ext && /^[a-zA-Z0-9#+-]+$/.test(ext) ? ext.toLowerCase() : "";
  return `File \`${file.path}\`:\n\`\`\`${lang}\n${file.text}\n\`\`\`\n`;
}
/**
 * Writes text to the clipboard when browser clipboard support is available.
 * Missing clipboard support is treated as a safe no-op.
 */
export function copyTextToClipboard(text, nav = navigator) {
  if (!text) return;
  nav.clipboard?.writeText(text);
}
/**
 * Copies a file as a markdown snippet through the shared clipboard helper.
 */
export function copyFileSource(file) {
  if (!file) return;
  copyTextToClipboard(buildMarkdownSnippet(file));
}
/**
 * Produces a short stable hash used to derive deterministic IDs from text keys.
 */
export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function hashPath(str) {
  return hashString(str);
}
/**
 * Generates a deterministic DOM-safe file identifier from a project path.
 */
export function makeFileId(path) {
  const safe =
    path
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "") || "file";
  const hash = hashPath(path);
  return `file-${safe}-${hash}`;
}
/**
 * Maps a file extension to a display language label used in stats and badges.
 */
export function languageFromExt(ext) {
  const normalized = (ext || "").toLowerCase();
  return EXT_TO_LANGUAGE[normalized] || normalized.toUpperCase() || "Text";
}
/**
 * Constrains a numeric value to an inclusive minimum and maximum bound.
 */
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
/**
 * Returns a plain rectangle snapshot for positioning logic and viewport math.
 */
export function rectOf(el) {
  const r = el.getBoundingClientRect();
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}
/**
 * Creates a text span with class and content in one call to standardize lightweight UI labels.
 */
export function makeTextSpan(className, text, doc = document) {
  const span = doc.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}
