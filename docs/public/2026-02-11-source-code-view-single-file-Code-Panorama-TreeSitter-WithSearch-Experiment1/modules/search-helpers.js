/**
 * Escapes regex metacharacters so text-mode queries can be converted into safe regular expressions.
 */
export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatRegexErrorDetail(err) {
  if (!err) return "";
  const raw = typeof err === "string" ? err : err.message || "";
  const line = raw.split("\n")[0];
  if (line.length > 120) return `${line.slice(0, 117)}...`;
  return line;
}
/**
 * Validates search input and reports user-facing errors through provided callbacks.
 * Invalid input returns a non-ok result without throwing.
 */
export function validateSearchQuery(rawQuery, opts) {
  const trimmed = rawQuery.trim();
  const minLength = opts.minLength || 2;
  if (trimmed.length < minLength) {
    if (opts.showMinLengthError) {
      opts.onError?.(`Enter at least ${minLength} characters.`);
    } else {
      opts.onClearError?.();
    }
    return { ok: false, trimmed };
  }
  if (opts.mode === "regex") {
    try {
      new RegExp(trimmed, opts.caseSensitive ? "" : "i");
    } catch (err) {
      opts.onError?.(
        "Invalid regular expression.",
        formatRegexErrorDetail(err),
      );
      return { ok: false, trimmed };
    }
  }
  opts.onClearError?.();
  return { ok: true, trimmed };
}
/**
 * Builds a reusable matcher from query, mode, and case-sensitivity options.
 */
export function buildSearchMatcher(query, mode, caseSensitive) {
  if (mode === "regex") {
    return {
      type: "regex",
      regex: new RegExp(query, caseSensitive ? "" : "i"),
    };
  }
  const hasWildcard = query.includes("*");
  if (hasWildcard) {
    const regexSource = query.split("*").map(escapeRegExp).join(".*");
    return {
      type: "regex",
      regex: new RegExp(regexSource, caseSensitive ? "" : "i"),
    };
  }
  return { type: "text", query, caseSensitive };
}
/**
 * Returns the first match range in a line for the prepared matcher, or null when no match exists.
 */
export function matchLine(line, matcher) {
  if (matcher.type === "text") {
    const haystack = matcher.caseSensitive ? line : line.toLowerCase();
    const needle = matcher.caseSensitive
      ? matcher.query
      : matcher.query.toLowerCase();
    const start = haystack.indexOf(needle);
    if (start === -1) return null;
    return { start, end: start + needle.length };
  }
  const match = matcher.regex.exec(line);
  if (!match) return null;
  return { start: match.index, end: match.index + match[0].length };
}
/**
 * Produces contextual snippet lines around a match for search result previews.
 */
export function buildSnippetLines(lines, lineIndex) {
  const start = Math.max(0, lineIndex - 3);
  const end = Math.min(lines.length - 1, lineIndex + 3);
  const snippet = [];
  for (let i = start; i <= end; i += 1) {
    snippet.push({ number: i + 1, text: lines[i], isMatch: i === lineIndex });
  }
  return snippet;
}
