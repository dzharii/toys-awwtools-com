const DUPLICATE_SCAN_CHARS = 1_000_000;
const COMPACT_LINE_MAX = 80;

self.onmessage = (event) => {
  const { requestId, inputText, options } = event.data || {};
  if (typeof requestId !== 'number') {
    return;
  }

  try {
    const result = processText(inputText || '', options || {});
    self.postMessage({ requestId, ...result });
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      errorModel: {
        category: 'generic_syntax_error',
        message: 'Formatting failed',
        rawMessage: error && error.message ? String(error.message) : 'Formatting failed',
        location: null
      }
    });
  }
};

function processText(inputText, options) {
  let parsed;
  try {
    parsed = JSON.parse(inputText);
  } catch (error) {
    return {
      ok: false,
      errorModel: normalizeError(error, inputText)
    };
  }

  let transformed = parsed;
  if (options.sortKeys) {
    transformed = sortKeysDeep(parsed);
  }

  let formattedText = '';
  try {
    if (options.mode === 'pretty') {
      formattedText = JSON.stringify(transformed, null, options.indent || 2);
    } else if (options.mode === 'minify') {
      formattedText = JSON.stringify(transformed);
    } else {
      formattedText = formatCompact(transformed, options.indent || 2, COMPACT_LINE_MAX, !!options.sortKeys);
    }
  } catch (error) {
    return {
      ok: false,
      errorModel: {
        category: 'generic_syntax_error',
        message: 'Formatting failed',
        rawMessage: error && error.message ? error.message : 'Formatting failed',
        location: null
      }
    };
  }

  const summaryModel = buildSummary(parsed, inputText.length, formattedText.length, inputText);

  return {
    ok: true,
    formattedText,
    summaryModel
  };
}

function normalizeError(error, inputText) {
  const rawMessage = error && error.message ? String(error.message) : 'Unknown error';
  const category = categorizeError(rawMessage);
  const location = extractLocation(error, rawMessage, inputText);
  const message = location
    ? `Invalid JSON: ${category} at Ln ${location.line}:Col ${location.column}`
    : `Invalid JSON: ${category}`;

  return {
    category,
    message,
    rawMessage,
    location
  };
}

function categorizeError(rawMessage) {
  const message = rawMessage.toLowerCase();
  if (message.includes('unterminated string')) return 'unterminated_string';
  if (message.includes('unexpected end')) return 'unexpected_end';
  if (message.includes('unexpected token')) return 'unexpected_token';
  if (message.includes('number') && message.includes('json')) return 'invalid_number';
  if (message.includes('escape') && message.includes('string')) return 'invalid_escape';
  if (message.includes('unicode') && message.includes('escape')) return 'invalid_unicode';
  return 'generic_syntax_error';
}

function extractLocation(error, rawMessage, inputText) {
  const lineStarts = buildLineStarts(inputText);

  const position = getNumeric(error && (error.position ?? error.pos));
  if (Number.isFinite(position)) {
    const { line, column } = getLineColFromOffset(position, lineStarts);
    return { offset: position, line, column, confidence: 'computed_from_offset' };
  }

  const offsetMatch = rawMessage.match(/position\s+(\d+)/i) || rawMessage.match(/at\s+position\s+(\d+)/i);
  if (offsetMatch) {
    const offset = Number(offsetMatch[1]);
    if (Number.isFinite(offset)) {
      const { line, column } = getLineColFromOffset(offset, lineStarts);
      return { offset, line, column, confidence: 'computed_from_offset' };
    }
  }

  const lineColMatch = rawMessage.match(/line\s+(\d+)\s*column\s+(\d+)/i);
  if (lineColMatch) {
    const line = Number(lineColMatch[1]);
    const column = Number(lineColMatch[2]);
    if (Number.isFinite(line) && Number.isFinite(column)) {
      const offset = offsetFromLineCol(line, column, lineStarts, inputText.length);
      return { offset, line, column, confidence: 'reported_by_parser' };
    }
  }

  return null;
}

function getNumeric(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function offsetFromLineCol(line, column, lineStarts, textLength) {
  const lineIndex = Math.max(0, Math.min(lineStarts.length - 1, line - 1));
  const lineStart = lineStarts[lineIndex];
  const nextStart = lineIndex + 1 < lineStarts.length ? lineStarts[lineIndex + 1] : textLength;
  const lineLength = Math.max(0, nextStart - lineStart - 1);
  const col = Math.max(1, Math.min(column, lineLength + 1));
  return lineStart + (col - 1);
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === 'object') {
    const sorted = {};
    const keys = Object.keys(value).sort();
    for (const key of keys) {
      sorted[key] = sortKeysDeep(value[key]);
    }
    return sorted;
  }
  return value;
}

function formatCompact(value, indentWidth, lineMax, sortKeys) {
  const indentUnit = ' '.repeat(indentWidth);
  const keysFor = (obj) => (sortKeys ? Object.keys(obj).sort() : Object.keys(obj));

  const formatter = (val, depth) => {
    if (val === null || typeof val !== 'object') {
      return JSON.stringify(val);
    }

    const indentCurrent = indentUnit.repeat(depth);
    const indentNext = indentUnit.repeat(depth + 1);

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      const parts = val.map((item) => formatter(item, depth + 1));
      const inline = `[${parts.join(', ')}]`;
      if (!inline.includes('\n') && inline.length <= lineMax) {
        return inline;
      }
      const lines = parts.map((part) => `${indentNext}${part}`);
      return `[` + `\n${lines.join(',\n')}\n${indentCurrent}]`;
    }

    const keys = keysFor(val);
    if (keys.length === 0) return '{}';
    const pairs = keys.map((key) => `${JSON.stringify(key)}: ${formatter(val[key], depth + 1)}`);
    const inline = `{ ${pairs.join(', ')} }`;
    if (!inline.includes('\n') && inline.length <= lineMax) {
      return inline;
    }
    const lines = pairs.map((pair) => `${indentNext}${pair}`);
    return `{` + `\n${lines.join(',\n')}\n${indentCurrent}}`;
  };

  return formatter(value, 0);
}

function buildSummary(value, inputSize, outputSize, inputText) {
  const typeLabel = getTypeLabel(value);
  const { nodeCount, maxDepth } = countNodes(value, 1);
  const duplicates = scanDuplicates(inputText);

  return {
    typeLabel,
    inputSize,
    outputSize,
    nodeCount,
    maxDepth,
    duplicates
  };
}

function getTypeLabel(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'primitive (null)';
  if (typeof value === 'object') return 'object';
  return `primitive (${typeof value})`;
}

function countNodes(value, depth) {
  if (value === null || typeof value !== 'object') {
    return { nodeCount: 1, maxDepth: depth };
  }

  let nodeCount = 1;
  let maxDepth = depth;

  if (Array.isArray(value)) {
    for (const item of value) {
      const stats = countNodes(item, depth + 1);
      nodeCount += stats.nodeCount;
      maxDepth = Math.max(maxDepth, stats.maxDepth);
    }
    return { nodeCount, maxDepth };
  }

  for (const key of Object.keys(value)) {
    const stats = countNodes(value[key], depth + 1);
    nodeCount += stats.nodeCount;
    maxDepth = Math.max(maxDepth, stats.maxDepth);
  }

  return { nodeCount, maxDepth };
}

function scanDuplicates(text) {
  if (text.length > DUPLICATE_SCAN_CHARS) {
    return { skipped: true, duplicates: [], total: 0 };
  }

  const duplicates = [];
  const lineStarts = buildLineStarts(text);
  const stack = [];

  const pushContext = (type) => {
    if (type === 'object') {
      stack.push({ type, state: 'key_or_end', keys: new Set() });
    } else {
      stack.push({ type, state: 'value_or_end' });
    }
  };

  const onValue = () => {
    const ctx = stack[stack.length - 1];
    if (!ctx) return;
    if (ctx.type === 'object' && ctx.state === 'value') {
      ctx.state = 'comma_or_end';
    } else if (ctx.type === 'array' && (ctx.state === 'value_or_end' || ctx.state === 'value')) {
      ctx.state = 'comma_or_end';
    }
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
      i += 1;
      continue;
    }
    if (ch === '{') {
      pushContext('object');
      i += 1;
      continue;
    }
    if (ch === '[') {
      pushContext('array');
      i += 1;
      continue;
    }
    if (ch === '}' || ch === ']') {
      stack.pop();
      i += 1;
      onValue();
      continue;
    }
    if (ch === ':') {
      const ctx = stack[stack.length - 1];
      if (ctx && ctx.type === 'object' && ctx.state === 'colon') {
        ctx.state = 'value';
      }
      i += 1;
      continue;
    }
    if (ch === ',') {
      const ctx = stack[stack.length - 1];
      if (ctx && ctx.type === 'object' && ctx.state === 'comma_or_end') {
        ctx.state = 'key_or_end';
      } else if (ctx && ctx.type === 'array' && ctx.state === 'comma_or_end') {
        ctx.state = 'value_or_end';
      }
      i += 1;
      continue;
    }
    if (ch === '"') {
      const ctx = stack[stack.length - 1];
      const result = readJsonString(text, i);
      if (!result) {
        return { skipped: false, duplicates: [], total: 0 };
      }
      if (ctx && ctx.type === 'object' && ctx.state === 'key_or_end') {
        const key = result.value;
        if (ctx.keys.has(key)) {
          const { line, column } = getLineColFromOffset(i, lineStarts);
          duplicates.push({ key, offset: i, line, column });
        } else {
          ctx.keys.add(key);
        }
        ctx.state = 'colon';
      } else {
        onValue();
      }
      i = result.end;
      continue;
    }
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      i = consumeNumber(text, i);
      onValue();
      continue;
    }
    if (text.startsWith('true', i)) {
      i += 4;
      onValue();
      continue;
    }
    if (text.startsWith('false', i)) {
      i += 5;
      onValue();
      continue;
    }
    if (text.startsWith('null', i)) {
      i += 4;
      onValue();
      continue;
    }
    i += 1;
  }

  return { skipped: false, duplicates, total: duplicates.length };
}

function readJsonString(text, startIndex) {
  let i = startIndex + 1;
  let result = '';
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"') {
      return { value: result, end: i + 1 };
    }
    if (ch === '\\') {
      const next = text[i + 1];
      if (next === '"' || next === '\\' || next === '/') {
        result += next;
        i += 2;
        continue;
      }
      if (next === 'b') {
        result += '\b';
        i += 2;
        continue;
      }
      if (next === 'f') {
        result += '\f';
        i += 2;
        continue;
      }
      if (next === 'n') {
        result += '\n';
        i += 2;
        continue;
      }
      if (next === 'r') {
        result += '\r';
        i += 2;
        continue;
      }
      if (next === 't') {
        result += '\t';
        i += 2;
        continue;
      }
      if (next === 'u') {
        const hex = text.slice(i + 2, i + 6);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
          return null;
        }
        result += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      }
      return null;
    }
    result += ch;
    i += 1;
  }
  return null;
}

function consumeNumber(text, startIndex) {
  let i = startIndex + 1;
  while (i < text.length) {
    const ch = text[i];
    if (
      (ch >= '0' && ch <= '9') ||
      ch === '.' ||
      ch === 'e' ||
      ch === 'E' ||
      ch === '+' ||
      ch === '-'
    ) {
      i += 1;
    } else {
      break;
    }
  }
  return i;
}

function buildLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') {
      starts.push(i + 1);
    }
  }
  return starts;
}

function getLineColFromOffset(offset, lineStarts) {
  if (!lineStarts.length) {
    return { line: 1, column: 1 };
  }
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] === offset) {
      low = mid;
      break;
    }
    if (lineStarts[mid] < offset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  const index = Math.max(0, low - 1);
  const lineStart = lineStarts[index];
  return { line: index + 1, column: offset - lineStart + 1 };
}
