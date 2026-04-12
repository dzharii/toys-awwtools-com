export const TOOL_NAMESPACE = "huge-page-object-recorder";
export const TOOL_GLOBAL_KEY = "__hugePageObjectRecorder";
export const TOOL_IGNORE_ATTRIBUTE = `data-${TOOL_NAMESPACE}-ignore`;

const UTILITY_CLASS_RE =
  /^(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|grid|flex|justify|items|text|bg|border|rounded|shadow|w|h|min|max|top|left|right|bottom|z|col|row|translate|scale|rotate|opacity|font|leading|tracking)-/i;
const HASHISH_RE = /^(?:[a-f0-9]{6,}|[a-z0-9_-]{12,})$/i;

export function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordsFromValue(value) {
  return normalizeWhitespace(String(value ?? ""))
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function toCamelCase(value) {
  const words = wordsFromValue(value);
  if (!words.length) {
    return "pageObject";
  }

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export function uniqueName(baseName, existingNames = []) {
  const base = toCamelCase(baseName);
  const taken = new Set(existingNames);
  if (!taken.has(base)) {
    return base;
  }

  let counter = 2;
  while (taken.has(`${base}${counter}`)) {
    counter += 1;
  }

  return `${base}${counter}`;
}

export function looksGeneratedToken(token) {
  const value = String(token ?? "").trim();
  if (!value) {
    return false;
  }

  if (UTILITY_CLASS_RE.test(value)) {
    return true;
  }

  if (HASHISH_RE.test(value) && /\d/.test(value)) {
    return true;
  }

  if (/^(?:css|jsx|sc|ember|react)-[a-z0-9]{5,}$/i.test(value)) {
    return true;
  }

  if (/[a-z]{2,}-[a-z0-9]{6,}$/i.test(value) && /\d/.test(value)) {
    return true;
  }

  return /(?:^|[-_])[a-z0-9]{1,3}(?:[-_][a-z0-9]{1,3}){3,}$/i.test(value);
}

export function isStableToken(token) {
  const value = normalizeWhitespace(token);
  return Boolean(value) && !looksGeneratedToken(value);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function rectFrom(input = {}) {
  const left = Number(input.left ?? input.x ?? 0);
  const top = Number(input.top ?? input.y ?? 0);
  const width = Math.max(0, Number(input.width ?? 0));
  const height = Math.max(0, Number(input.height ?? 0));
  return {
    left,
    top,
    width,
    height,
    right: Number(input.right ?? left + width),
    bottom: Number(input.bottom ?? top + height),
  };
}

export function rectArea(rect) {
  const safeRect = rectFrom(rect);
  return safeRect.width * safeRect.height;
}

export function rectIntersects(a, b) {
  const rectA = rectFrom(a);
  const rectB = rectFrom(b);
  return !(
    rectA.right <= rectB.left ||
    rectA.left >= rectB.right ||
    rectA.bottom <= rectB.top ||
    rectA.top >= rectB.bottom
  );
}

export function rectContains(container, child) {
  const outer = rectFrom(container);
  const inner = rectFrom(child);
  return (
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom
  );
}

export function rectIntersectionArea(a, b) {
  const rectA = rectFrom(a);
  const rectB = rectFrom(b);
  const width = Math.max(
    0,
    Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left),
  );
  const height = Math.max(
    0,
    Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top),
  );
  return width * height;
}

export function rectOverlapRatio(a, b) {
  const intersection = rectIntersectionArea(a, b);
  const baseArea = Math.max(1, Math.min(rectArea(a), rectArea(b)));
  return intersection / baseArea;
}

export function dedupeBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function sortByScoreDesc(items, scoreKey = "score") {
  return [...items].sort((left, right) => {
    const scoreDelta = Number(right?.[scoreKey] ?? 0) - Number(left?.[scoreKey] ?? 0);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return String(left?.label ?? left?.selector ?? "").localeCompare(
      String(right?.label ?? right?.selector ?? ""),
    );
  });
}

export function stableJson(value) {
  if (Array.isArray(value)) {
    return value.map(stableJson);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = stableJson(value[key]);
        return result;
      }, {});
  }

  return value;
}

export function safeLower(value) {
  return normalizeWhitespace(value).toLowerCase();
}

export function excerpt(value, maxLength = 80) {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function escapeCssString(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function serializeError(error) {
  if (!error) {
    return "Unknown error";
  }

  return error instanceof Error ? error.message : String(error);
}
