const EXT_TO_LANGUAGE = {
  js: "JavaScript", ts: "TypeScript", jsx: "JSX", tsx: "TSX", mjs: "JavaScript", cjs: "JavaScript",
  c: "C", h: "C/C Header", cc: "C++", cpp: "C++", hpp: "C++ Header",
  cs: "C#", java: "Java", scala: "Scala", kt: "Kotlin", go: "Go", rs: "Rust",
  py: "Python", rb: "Ruby", php: "PHP", swift: "Swift", m: "Objective-C", mm: "Objective-C++",
  html: "HTML", css: "CSS", scss: "SCSS", md: "Markdown", txt: "Text", sh: "Shell", ps1: "PowerShell",
  yaml: "YAML", yml: "YAML", toml: "TOML", ini: "INI", xml: "XML", json: "JSON"
};

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

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

export function buildMarkdownSnippet(file) {
  if (!file) return "";
  const parts = file.path.split(".");
  const ext = parts.length > 1 ? parts.pop() || "" : "";
  const lang = ext && /^[a-zA-Z0-9#+-]+$/.test(ext) ? ext.toLowerCase() : "";
  return `File \`${file.path}\`:\n\`\`\`${lang}\n${file.text}\n\`\`\`\n`;
}

export function copyTextToClipboard(text, nav = navigator) {
  if (!text) return;
  nav.clipboard?.writeText(text);
}

export function copyFileSource(file) {
  if (!file) return;
  copyTextToClipboard(buildMarkdownSnippet(file));
}

function hashPath(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export function makeFileId(path) {
  const safe = path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "") || "file";
  const hash = hashPath(path);
  return `file-${safe}-${hash}`;
}

export function countLines(text) {
  if (!text) return 0;
  let count = 1;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") count += 1;
  }
  return count;
}

export function languageFromExt(ext) {
  const normalized = (ext || "").toLowerCase();
  return EXT_TO_LANGUAGE[normalized] || normalized.toUpperCase() || "Text";
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
}

export function makeTextSpan(className, text, doc = document) {
  const span = doc.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}
