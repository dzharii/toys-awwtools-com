function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeSpan(span, inputLength) {
  const length = Math.max(inputLength ?? 0, 0);
  if (!span) {
    return { startIndex: 0, endIndex: 0 };
  }
  const startIndex = clamp(Number(span.startIndex ?? 0), 0, length);
  const endIndex = clamp(Number(span.endIndex ?? startIndex), startIndex, length);
  return { startIndex, endIndex };
}

function indexToLineColumn(input, targetIndex) {
  let line = 1;
  let column = 1;
  const clampedIndex = clamp(targetIndex, 0, input.length);

  for (let i = 0; i < clampedIndex; i += 1) {
    if (input[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

export function spanToLineColumn(input, span) {
  const normalized = normalizeSpan(span, input.length);
  const start = indexToLineColumn(input, normalized.startIndex);
  const end = indexToLineColumn(input, normalized.endIndex);
  return {
    startLine: start.line,
    startColumn: start.column,
    endLine: end.line,
    endColumn: end.column,
  };
}

function buildError(kind, input, code, message, span, hints, extras) {
  const normalizedSpan = normalizeSpan(span, input.length);
  return {
    kind,
    code,
    message,
    span: normalizedSpan,
    lineColumn: spanToLineColumn(input, normalizedSpan),
    hints: Array.isArray(hints) && hints.length > 0 ? hints : undefined,
    ...extras,
  };
}

export function createParseError(input, code, message, span, hints, extras) {
  return buildError("parse", input, code, message, span, hints, extras);
}

export function createEvaluationError(input, code, message, span, hints, extras) {
  return buildError("eval", input, code, message, span, hints, extras);
}
