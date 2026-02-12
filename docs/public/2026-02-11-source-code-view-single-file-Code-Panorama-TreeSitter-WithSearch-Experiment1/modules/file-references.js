const EXTRA_REF_EXTS = [
  "png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp",
  "ttf", "otf", "woff", "woff2", "eot",
  "mp3", "mp4", "webm", "wav", "map"
];

const EXCLUDED_PREFIXES = ["http://", "https://", "data:", "blob:", "mailto:"];

const QUOTED_RE = /(['"])([^'"\\\n]{1,260})\1/g;
const URL_RE = /\burl\(\s*(['"]?)([^'")\n]{1,260})\1\s*\)/gi;
const REQUIRE_RE = /\brequire\s*\(\s*(['"])([^'"\\\n]{1,260})\1\s*\)/g;
const FROM_RE = /\bfrom\s+(['"])([^'"\\\n]{1,260})\1/g;
const IMPORT_CALL_RE = /\bimport\s*\(\s*(['"])([^'"\\\n]{1,260})\1\s*\)/g;
const PATHLIKE_RE = /(^|[^A-Za-z0-9_])([A-Za-z0-9._~@-]+[\\/][A-Za-z0-9._~@\-\\/]*\.[A-Za-z0-9]{1,10})(?=$|[^A-Za-z0-9_])/g;
const BARE_FILE_RE = /(^|[^A-Za-z0-9_])([A-Za-z0-9][A-Za-z0-9._-]{2,}\.[A-Za-z0-9]{1,10})(?=$|[^A-Za-z0-9_])/g;

function splitPath(path) {
  return (path || "").split("/").filter(Boolean);
}

function getExt(token) {
  const cleaned = token || "";
  const slashIdx = cleaned.lastIndexOf("/");
  const base = slashIdx >= 0 ? cleaned.slice(slashIdx + 1) : cleaned;
  const dotIdx = base.lastIndexOf(".");
  if (dotIdx <= 0 || dotIdx === base.length - 1) return "";
  return base.slice(dotIdx + 1).toLowerCase();
}

function hasDomainShape(token) {
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(token || "");
}

function isExcludedByScheme(value) {
  const lower = (value || "").toLowerCase();
  if (lower.includes("://")) return true;
  return EXCLUDED_PREFIXES.some(prefix => lower.startsWith(prefix));
}

function trimCandidate(raw) {
  if (!raw) return "";
  let token = raw.trim();
  token = token.replace(/^[("']+/, "");
  token = token.replace(/[)"',;:]+$/, "");
  token = token.trim();
  return token;
}

function normalizeForMatching(raw, maxLen) {
  const trimmed = trimCandidate(raw);
  if (!trimmed) return null;
  let normalized = trimmed.replace(/\\/g, "/");
  normalized = normalized.replace(/[?#].*$/, "");
  normalized = normalized.trim();
  if (!normalized || normalized.length > maxLen) return null;
  if (isExcludedByScheme(normalized)) return null;
  return normalized;
}

function shouldAcceptCandidate(token, refExts, opts = {}) {
  if (!token) return false;
  if (/\s/.test(token)) return false;
  const normalized = token.replace(/^\/+/, "");
  const ext = getExt(normalized);
  const hasSlash = normalized.includes("/");
  const extKnown = !!ext && refExts.has(ext);

  if (!hasSlash) {
    if (!opts.allowBare) return false;
    if (!extKnown) return false;
    if (hasDomainShape(normalized) && !extKnown) return false;
    return true;
  }

  if (extKnown) return true;
  return !!opts.allowSlashWithoutExt;
}

function pushCandidate(list, seen, line, start, end, raw, refExts, opts) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > line.length) return;
  const normalized = normalizeForMatching(raw, opts.maxTokenLength);
  if (!normalized) return;
  if (!shouldAcceptCandidate(normalized, refExts, opts)) return;
  const key = `${start}:${end}:${normalized}`;
  if (seen.has(key)) return;
  seen.add(key);
  list.push({
    raw: line.slice(start, end),
    normalized,
    normalizedPathLike: normalized,
    start,
    end
  });
}

function collectByRegex(regex, line, onMatch) {
  regex.lastIndex = 0;
  let match = regex.exec(line);
  while (match) {
    onMatch(match);
    match = regex.exec(line);
  }
}

function normalizeFromSegments(segments) {
  const out = [];
  for (let i = 0; i < segments.length; i += 1) {
    const part = segments[i];
    if (!part || part === ".") continue;
    if (part === "..") {
      if (out.length) out.pop();
      continue;
    }
    out.push(part);
  }
  return out.join("/");
}

export function normalizeProjectPath(rawPath) {
  if (!rawPath) return "";
  const cleaned = rawPath.replace(/\\/g, "/").replace(/^\/+/, "");
  return normalizeFromSegments(cleaned.split("/"));
}

export function dirnameProjectPath(rawPath) {
  const normalized = normalizeProjectPath(rawPath);
  const parts = splitPath(normalized);
  if (!parts.length) return "";
  parts.pop();
  return parts.join("/");
}

export function joinProjectPath(baseDir, refPath) {
  const base = splitPath(baseDir || "");
  const ref = (refPath || "").replace(/\\/g, "/");
  if (ref.startsWith("/")) return normalizeProjectPath(ref.slice(1));
  return normalizeFromSegments(base.concat(ref.split("/")));
}

export function createRefExtensionSet(allowExtensions = []) {
  const out = new Set();
  (allowExtensions || []).forEach(ext => {
    const normalized = String(ext || "").trim().toLowerCase().replace(/^\./, "");
    if (normalized) out.add(normalized);
  });
  out.add("json");
  EXTRA_REF_EXTS.forEach(ext => out.add(ext));
  return out;
}

export function recordInventoryPath(inventory, rawPath) {
  if (!inventory || !rawPath) return "";
  const canonical = normalizeProjectPath(rawPath);
  if (!canonical) return "";
  if (!inventory.allPaths.has(canonical)) {
    inventory.allPaths.add(canonical);
    const parts = splitPath(canonical);
    const basename = parts.length ? parts[parts.length - 1] : canonical;
    if (basename) {
      const existing = inventory.byBasename.get(basename) || [];
      existing.push(canonical);
      inventory.byBasename.set(basename, existing);
    }
  }
  return canonical;
}

export function extractReferenceCandidates(line, opts = {}) {
  const refExts = opts.refExts || new Set();
  const maxTokenLength = Number.isFinite(opts.maxTokenLength) ? opts.maxTokenLength : 260;
  const enableBareFilename = !!opts.enableBareFilename;
  const candidates = [];
  const seen = new Set();
  const safeLine = line || "";

  collectByRegex(REQUIRE_RE, safeLine, match => {
    const raw = match[2] || "";
    const start = match.index + match[0].indexOf(raw);
    const end = start + raw.length;
    pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
      maxTokenLength,
      allowSlashWithoutExt: true,
      allowBare: true
    });
  });

  collectByRegex(FROM_RE, safeLine, match => {
    const raw = match[2] || "";
    const start = match.index + match[0].indexOf(raw);
    const end = start + raw.length;
    pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
      maxTokenLength,
      allowSlashWithoutExt: true,
      allowBare: true
    });
  });

  collectByRegex(IMPORT_CALL_RE, safeLine, match => {
    const raw = match[2] || "";
    const start = match.index + match[0].indexOf(raw);
    const end = start + raw.length;
    pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
      maxTokenLength,
      allowSlashWithoutExt: true,
      allowBare: true
    });
  });

  collectByRegex(URL_RE, safeLine, match => {
    const raw = (match[2] || "").trim();
    const start = match.index + match[0].indexOf(match[2] || "");
    const end = start + (match[2] || "").length;
    pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
      maxTokenLength,
      allowSlashWithoutExt: true,
      allowBare: true
    });
  });

  collectByRegex(QUOTED_RE, safeLine, match => {
    const raw = match[2] || "";
    const start = match.index + 1;
    const end = start + raw.length;
    pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
      maxTokenLength,
      allowSlashWithoutExt: true,
      allowBare: true
    });
  });

  collectByRegex(PATHLIKE_RE, safeLine, match => {
    const raw = match[2] || "";
    const start = match.index + (match[1] || "").length;
    const end = start + raw.length;
    pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
      maxTokenLength,
      allowSlashWithoutExt: false,
      allowBare: false
    });
  });

  if (enableBareFilename) {
    collectByRegex(BARE_FILE_RE, safeLine, match => {
      const raw = match[2] || "";
      const start = match.index + (match[1] || "").length;
      const end = start + raw.length;
      pushCandidate(candidates, seen, safeLine, start, end, raw, refExts, {
        maxTokenLength,
        allowSlashWithoutExt: false,
        allowBare: true
      });
    });
  }

  candidates.sort((a, b) => a.start - b.start || a.end - b.end);
  return candidates;
}

export function resolveReferenceCandidate({ sourcePath, candidate, inventory }) {
  const fallback = { status: "missing", resolvedPaths: [] };
  const normalizedCandidate = normalizeForMatching(candidate, 260);
  if (!normalizedCandidate || !inventory) return fallback;

  const sourceDir = dirnameProjectPath(sourcePath || "");
  const hasSlash = normalizedCandidate.includes("/");
  const startsRelative = normalizedCandidate.startsWith("./") || normalizedCandidate.startsWith("../");
  const startsRoot = normalizedCandidate.startsWith("/");
  const candidateNoRoot = normalizedCandidate.replace(/^\/+/, "");

  const matches = new Set();
  const addIfExists = path => {
    if (!path) return;
    const canonical = normalizeProjectPath(path);
    if (canonical && inventory.allPaths.has(canonical)) matches.add(canonical);
  };

  if (startsRelative) {
    addIfExists(joinProjectPath(sourceDir, normalizedCandidate));
  } else if (startsRoot) {
    addIfExists(candidateNoRoot);
  } else if (hasSlash) {
    addIfExists(candidateNoRoot);
    addIfExists(joinProjectPath(sourceDir, normalizedCandidate));
  } else {
    addIfExists(joinProjectPath(sourceDir, normalizedCandidate));
    const basenameMatches = inventory.byBasename.get(candidateNoRoot) || [];
    basenameMatches.forEach(path => matches.add(path));
  }

  const resolvedPaths = [...matches].sort((a, b) => a.localeCompare(b));
  if (!resolvedPaths.length) return fallback;
  if (resolvedPaths.length === 1) return { status: "resolved", resolvedPaths };
  return { status: "ambiguous", resolvedPaths };
}

export function buildLineStartOffsets(text) {
  const offsets = [0];
  const raw = text || "";
  for (let i = 0; i < raw.length; i += 1) {
    if (raw.charCodeAt(i) === 10) offsets.push(i + 1);
  }
  return offsets;
}
