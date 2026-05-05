function countLines(text) {
  if (!text) return 0;
  return text.split(/\r\n|\n|\r/).length;
}

function countNonEmptyLines(text) {
  if (!text) return 0;
  return text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function countBlankLines(text) {
  if (!text) return 0;
  return text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length === 0).length;
}

function guessRootType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function buildMeta(text) {
  return {
    charCount: text.length,
    lineCount: countLines(text),
    nonEmptyLineCount: countNonEmptyLines(text),
    byteEstimate: new TextEncoder().encode(text).length
  };
}

function parseOffsetFromMessage(message) {
  if (!message) return null;
  const positionMatch = message.match(/\bposition\s+(\d+)\b/i);
  if (positionMatch) return Number(positionMatch[1]);

  const atMatch = message.match(/\bat\s+(\d+)\b/i);
  if (atMatch) return Number(atMatch[1]);

  return null;
}

function parseLineColumnFromMessage(message) {
  if (!message) return { line: null, column: null };
  const lineCol = message.match(/\bline\s*[:=]?\s*(\d+)\s*(?:,|\s)\s*column\s*[:=]?\s*(\d+)\b/i)
    || message.match(/\bat\s+line\s+(\d+)\s+column\s+(\d+)\b/i);
  if (lineCol) {
    return {
      line: Number(lineCol[1]),
      column: Number(lineCol[2])
    };
  }
  return { line: null, column: null };
}

export function getLineColumnFromOffset(text, offset) {
  if (!Number.isFinite(offset) || offset < 0) return { line: null, column: null };
  let line = 1;
  let column = 1;
  const limitedOffset = Math.min(offset, text.length);
  for (let i = 0; i < limitedOffset; i += 1) {
    const char = text[i];
    if (char === "\n") {
      line += 1;
      column = 1;
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") {
        i += 1;
      }
      line += 1;
      column = 1;
      continue;
    }
    column += 1;
  }
  return { line, column };
}

function buildInlineSnippet(lineText, column, maxWindow = 120) {
  if (lineText.length <= maxWindow) {
    return { lineText, pointerColumn: Math.max(1, column), clipped: false };
  }
  const half = Math.floor(maxWindow / 2);
  let start = Math.max(0, column - 1 - half);
  let end = Math.min(lineText.length, start + maxWindow);
  if (end - start < maxWindow) {
    start = Math.max(0, end - maxWindow);
  }
  let pointerColumn = column - start;
  let view = lineText.slice(start, end);
  if (start > 0) {
    view = `…${view}`;
    pointerColumn += 1;
  }
  if (end < lineText.length) {
    view = `${view}…`;
  }
  return { lineText: view, pointerColumn: Math.max(1, pointerColumn), clipped: true };
}

export function buildSnippet(text, line, column, options = {}) {
  const radius = Number.isFinite(options.radius) ? options.radius : 2;
  const lines = text.split(/\r\n|\n|\r/);
  if (!Number.isFinite(line) || line < 1 || line > lines.length) {
    const first = lines.slice(0, 3).map((value, idx) => `${String(idx + 1).padStart(3, " ")} | ${value}`);
    return {
      before: [],
      line: first[0] || "  1 | ",
      pointer: "    ^",
      after: first.slice(1),
      clipped: false
    };
  }

  const lineIndex = line - 1;
  const before = [];
  for (let index = Math.max(0, lineIndex - radius); index < lineIndex; index += 1) {
    before.push(`${String(index + 1).padStart(3, " ")} | ${lines[index]}`);
  }

  const activeLineRaw = lines[lineIndex] ?? "";
  const inline = buildInlineSnippet(activeLineRaw, column || 1, options.maxWindow || 140);
  const activeLine = `${String(line).padStart(3, " ")} | ${inline.lineText}`;
  const pointerOffset = `${" ".repeat(String(line).padStart(3, " ").length)} | ${" ".repeat(Math.max(0, inline.pointerColumn - 1))}^`;

  const after = [];
  for (let index = lineIndex + 1; index <= Math.min(lines.length - 1, lineIndex + radius); index += 1) {
    after.push(`${String(index + 1).padStart(3, " ")} | ${lines[index]}`);
  }

  return {
    before,
    line: activeLine,
    pointer: pointerOffset,
    after,
    clipped: inline.clipped
  };
}

function guessHint(message = "") {
  const lower = message.toLowerCase();
  if (lower.includes("unexpected token ]") || lower.includes("unexpected token }")) {
    return "Try this: check for a trailing comma or a missing value before this bracket.";
  }
  if (lower.includes("unexpected end of json")) {
    return "Try this: input ended early. Check for a missing closing } or ].";
  }
  if (lower.includes("single quote") || lower.includes("unexpected token '")) {
    return "Try this: JSON keys and strings must use double quotes.";
  }
  if (lower.includes("property name")) {
    return "Try this: object keys must be wrapped in double quotes.";
  }
  if (lower.includes("unexpected token u")) {
    return "Try this: JSON does not allow undefined. Use null or a quoted string.";
  }
  if (lower.includes("unexpected token n")) {
    return "Try this: JSON does not allow NaN. Use a number or null.";
  }
  return "Try this: check commas, quotes, brackets, and braces near the highlighted location.";
}

export function classifyInputText(text) {
  const trimmed = text.trim();
  if (!trimmed) return "empty";
  const nonEmpty = text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (nonEmpty.length >= 2) {
    const startsLikeJson = nonEmpty.filter((line) => line.startsWith("{") || line.startsWith("[")).length;
    if (startsLikeJson / nonEmpty.length >= 0.6) {
      return "jsonl";
    }
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  return "unknown";
}

export function parseJsonDocument(text) {
  const startedAt = performance.now();
  try {
    const root = JSON.parse(text);
    return {
      ok: true,
      kind: "json",
      root,
      warnings: [],
      meta: {
        ...buildMeta(text),
        rootType: guessRootType(root),
        durationMs: Math.round((performance.now() - startedAt) * 10) / 10
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const offset = parseOffsetFromMessage(message);
    let { line, column } = parseLineColumnFromMessage(message);
    if (!line || !column) {
      const lineColumn = getLineColumnFromOffset(text, offset);
      line = lineColumn.line;
      column = lineColumn.column;
    }
    if (!line) line = 1;
    if (!column) column = 1;

    return {
      ok: false,
      kind: "json",
      root: null,
      error: {
        code: "E_PARSE_JSON",
        title: "Invalid JSON",
        message,
        userMessage: "We could not parse this as JSON.",
        line: line ?? null,
        column: column ?? null,
        offset: Number.isFinite(offset) ? offset : null,
        snippet: buildSnippet(text, line ?? 1, column ?? 1),
        hint: guessHint(message),
        attempted: ["json"]
      },
      warnings: [],
      meta: {
        ...buildMeta(text),
        durationMs: Math.round((performance.now() - startedAt) * 10) / 10
      }
    };
  }
}

function mapLineOffsetToGlobalOffset(text, lineNumber, localOffset) {
  if (!Number.isFinite(localOffset)) return null;
  let offset = 0;
  let currentLine = 1;
  for (let i = 0; i < text.length && currentLine < lineNumber; i += 1) {
    const char = text[i];
    offset += 1;
    if (char === "\n") {
      currentLine += 1;
      continue;
    }
    if (char === "\r") {
      if (text[i + 1] === "\n") {
        i += 1;
        offset += 1;
      }
      currentLine += 1;
      continue;
    }
  }

  if (currentLine < lineNumber) {
    return null;
  }

  return offset + localOffset;
}

function tryParseLine(lineText) {
  try {
    return {
      ok: true,
      value: JSON.parse(lineText)
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const offset = parseOffsetFromMessage(message);
    const lineColumn = getLineColumnFromOffset(lineText, offset);
    return {
      ok: false,
      error: {
        message,
        offset: Number.isFinite(offset) ? offset : null,
        column: lineColumn.column
      }
    };
  }
}

export function parseJsonLines(text) {
  const startedAt = performance.now();
  const warnings = [];
  const lineItems = [];
  const rows = [];
  const lines = text.split(/\r\n|\n|\r/);
  let blankLineCount = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const rawLine = lines[index];
    const trimmed = rawLine.trim();
    if (!trimmed) {
      blankLineCount += 1;
      continue;
    }

    const parsed = tryParseLine(rawLine);
    if (!parsed.ok) {
      const globalOffset = mapLineOffsetToGlobalOffset(text, lineNumber, parsed.error.offset);
      return {
        ok: false,
        kind: "jsonl",
        root: null,
        error: {
          code: "E_PARSE_JSONL",
          title: "Invalid JSONL",
          message: parsed.error.message,
          userMessage: `Line ${lineNumber} is not valid JSON.`,
          line: lineNumber,
          column: parsed.error.column ?? null,
          offset: globalOffset,
          snippet: buildSnippet(text, lineNumber, parsed.error.column ?? 1),
          hint: guessHint(parsed.error.message),
          attempted: ["jsonl"]
        },
        partial: {
          parsedLineCount: rows.length,
          failedLineNumber: lineNumber
        },
        warnings,
        meta: {
          ...buildMeta(text),
          durationMs: Math.round((performance.now() - startedAt) * 10) / 10
        }
      };
    }

    rows.push(parsed.value);
    lineItems.push({ lineNumber, value: parsed.value });
  }

  if (blankLineCount > 0) {
    warnings.push(`Skipped ${blankLineCount} blank line${blankLineCount === 1 ? "" : "s"} in JSONL input.`);
  }

  return {
    ok: true,
    kind: "jsonl",
    root: rows,
    lineItems,
    warnings,
    meta: {
      ...buildMeta(text),
      rootType: "array",
      recordCount: rows.length,
      blankLineCount,
      durationMs: Math.round((performance.now() - startedAt) * 10) / 10
    }
  };
}

function isJsonlPlausible(text) {
  const nonEmptyLines = text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (nonEmptyLines.length < 2) return false;
  let startsLikeJsonCount = 0;
  for (const line of nonEmptyLines) {
    if (line.startsWith("{") || line.startsWith("[")) {
      startsLikeJsonCount += 1;
    }
  }
  return startsLikeJsonCount / nonEmptyLines.length >= 0.6;
}

export function parseInput(text, options = {}) {
  const source = String(text ?? "");
  const trimmed = source.trim();
  const classification = classifyInputText(source);

  if (!trimmed) {
    return {
      ok: true,
      kind: "empty",
      root: null,
      warnings: [],
      meta: {
        charCount: source.length,
        lineCount: 0,
        nonEmptyLineCount: 0
      }
    };
  }

  const jsonResult = parseJsonDocument(source);
  if (jsonResult.ok) {
    return jsonResult;
  }

  const shouldTryJsonl = options.forceJsonl || isJsonlPlausible(source) || classification === "jsonl";
  if (shouldTryJsonl) {
    const jsonlResult = parseJsonLines(source);
    if (jsonlResult.ok) {
      return jsonlResult;
    }
    jsonlResult.error.attempted = ["json", "jsonl"];
    return jsonlResult;
  }

  jsonResult.error.attempted = ["json"];
  return jsonResult;
}
