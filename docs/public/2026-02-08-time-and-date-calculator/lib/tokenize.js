import { createParseError } from "./errors.js";
import { foldCase, isWhitespace } from "./keywords.js";

const TIMESTAMP_RE =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?(?:\[[A-Za-z_][A-Za-z0-9_./+-]*\])?)/;
const DATE_RE = /^(\d{4}-\d{2}-\d{2})(?![\dT])/;
const INVALID_SLASH_DATE_RE = /^(\d{1,2}\/\d{1,2}\/\d{4})/;
const NUMBER_RE = /^(\d+)/;

const SIMPLE_TOKENS = new Map([
  ["(", "LPAREN"],
  [")", "RPAREN"],
  [",", "COMMA"],
  ["+", "PLUS"],
  ["-", "MINUS"],
  ["<", "LT"],
  [">", "GT"],
]);

function isWordStart(ch) {
  return /[A-Za-z_]/.test(ch);
}

function isWordPart(ch) {
  return /[A-Za-z0-9_./]/.test(ch);
}

function matchFrom(regex, input, index) {
  const slice = input.slice(index);
  const match = regex.exec(slice);
  return match ? match[1] : null;
}

function pushToken(tokens, type, text, start, end) {
  tokens.push({
    type,
    text,
    canonical: type === "WORD" ? foldCase(text) : undefined,
    start,
    end,
  });
}

export function tokenize(input) {
  const source = String(input ?? "");
  const tokens = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (isWhitespace(ch)) {
      i += 1;
      continue;
    }

    const twoChar = source.slice(i, i + 2);
    if (twoChar === "->") {
      pushToken(tokens, "ARROW", twoChar, i, i + 2);
      i += 2;
      continue;
    }
    if (twoChar === "<=") {
      pushToken(tokens, "LTE", twoChar, i, i + 2);
      i += 2;
      continue;
    }
    if (twoChar === ">=") {
      pushToken(tokens, "GTE", twoChar, i, i + 2);
      i += 2;
      continue;
    }
    if (twoChar === "==") {
      pushToken(tokens, "EQ", twoChar, i, i + 2);
      i += 2;
      continue;
    }
    if (twoChar === "!=") {
      pushToken(tokens, "NEQ", twoChar, i, i + 2);
      i += 2;
      continue;
    }

    if (SIMPLE_TOKENS.has(ch)) {
      pushToken(tokens, SIMPLE_TOKENS.get(ch), ch, i, i + 1);
      i += 1;
      continue;
    }

    if (/\d/.test(ch)) {
      const invalidSlash = matchFrom(INVALID_SLASH_DATE_RE, source, i);
      if (invalidSlash) {
        pushToken(tokens, "INVALID_DATE_SLASH", invalidSlash, i, i + invalidSlash.length);
        i += invalidSlash.length;
        continue;
      }

      const timestamp = matchFrom(TIMESTAMP_RE, source, i);
      if (timestamp) {
        pushToken(tokens, "TIMESTAMP", timestamp, i, i + timestamp.length);
        i += timestamp.length;
        continue;
      }

      const dateLiteral = matchFrom(DATE_RE, source, i);
      if (dateLiteral) {
        pushToken(tokens, "DATE", dateLiteral, i, i + dateLiteral.length);
        i += dateLiteral.length;
        continue;
      }

      const numberLiteral = matchFrom(NUMBER_RE, source, i);
      pushToken(tokens, "NUMBER", numberLiteral, i, i + numberLiteral.length);
      i += numberLiteral.length;
      continue;
    }

    if (isWordStart(ch)) {
      const start = i;
      i += 1;
      while (i < source.length && isWordPart(source[i])) {
        i += 1;
      }
      const text = source.slice(start, i);
      pushToken(tokens, "WORD", text, start, i);
      continue;
    }

    return {
      ok: false,
      input: source,
      tokens,
      error: createParseError(
        source,
        "E_PARSE_UNEXPECTED_CHARACTER",
        `Unexpected character '${ch}'.`,
        { startIndex: i, endIndex: i + 1 },
        ["Use operators + - ( ) and ISO literals only."],
      ),
    };
  }

  tokens.push({ type: "EOF", text: "", start: source.length, end: source.length });
  return { ok: true, input: source, tokens };
}
