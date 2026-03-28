export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function invLerp(a, b, value) {
  if (a === b) return 0;
  return clamp((value - a) / (b - a), 0, 1);
}

export function smoothstep(edge0, edge1, x) {
  const t = invLerp(edge0, edge1, x);
  return t * t * (3 - 2 * t);
}

export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInQuart(t) {
  return t * t * t * t;
}

export function nowMs() {
  return Date.now();
}

export function performanceNow() {
  return performance.now();
}

export function seededRandom(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function setCanvasSize(canvas, widthCss, heightCss, dpr, maxDpr = 2) {
  const safeDpr = Math.min(Math.max(dpr || 1, 1), maxDpr);
  const width = Math.max(1, Math.round(widthCss * safeDpr));
  const height = Math.max(1, Math.round(heightCss * safeDpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  canvas.style.width = `${widthCss}px`;
  canvas.style.height = `${heightCss}px`;
  return safeDpr;
}

export function parseUrlCandidates(text) {
  if (typeof text !== "string" || !text.trim()) return [];
  const candidates = [];
  const regex = /https?:\/\/[^\s<>"'`]+/gi;
  const matches = text.match(regex);
  if (matches) {
    candidates.push(...matches);
  } else {
    const trimmed = text.trim();
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(trimmed)) {
      candidates.push(`https://${trimmed}`);
    }
  }
  return Array.from(new Set(candidates));
}

export function normalizeUrl(rawUrl) {
  try {
    const input = String(rawUrl).trim();
    if (!input) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input)
      ? input
      : `https://${input}`;
    const url = new URL(withScheme);
    if (!/^https?:$/i.test(url.protocol)) return null;
    url.hash = "";
    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = "";
    }
    const normalized = url.toString();
    return normalized;
  } catch {
    return null;
  }
}

export function truncateMiddle(text, maxChars) {
  if (text.length <= maxChars) return text;
  if (maxChars <= 5) return `${text.slice(0, maxChars)}`;
  const side = Math.floor((maxChars - 1) / 2);
  return `${text.slice(0, side)}…${text.slice(text.length - side)}`;
}

export function displayLabelFromUrl(normalizedUrl, maxChars = 28) {
  try {
    const url = new URL(normalizedUrl);
    const host = url.hostname.replace(/^www\./i, "");
    let path = url.pathname || "";
    path = path.replace(/\/+$/, "");
    let label = host;
    if (path && path !== "/") {
      label += path.length > 18 ? ` ${truncateMiddle(path, 18)}` : ` ${path}`;
    }
    return truncateMiddle(label, maxChars);
  } catch {
    return truncateMiddle(normalizedUrl, maxChars);
  }
}

export function extractPreferredUrlFromDataTransfer(dataTransfer) {
  if (!dataTransfer) return null;
  const uriList = dataTransfer.getData("text/uri-list");
  if (uriList) {
    const lines = uriList
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    for (const line of lines) {
      const normalized = normalizeUrl(line);
      if (normalized) return normalized;
    }
  }

  const plain = dataTransfer.getData("text/plain");
  if (plain) {
    const candidates = parseUrlCandidates(plain);
    for (const candidate of candidates) {
      const normalized = normalizeUrl(candidate);
      if (normalized) return normalized;
    }
  }

  return null;
}

export function formatRelativeSink(ageMs, sink) {
  if (ageMs < sink.mostlyFloatingMs) return "floating near the surface";
  if (ageMs < sink.noticeableSubmergeMs) return "beginning to submerge";
  if (ageMs < sink.mostlyLostMs) return "sinking deeper";
  return "nearly lost to the reservoir";
}

export function makeId() {
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffffff)
    .toString(36)
    .padStart(7, "0");
  return `${time}-${rand}`;
}

export function pointDistanceSq(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function cubicBezierEaseOut(t) {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

export function angleLerp(a, b, t) {
  let delta = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + delta * t;
}

export function rgbToCss(r, g, b, a = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

export function mixColor(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

export function withinRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

