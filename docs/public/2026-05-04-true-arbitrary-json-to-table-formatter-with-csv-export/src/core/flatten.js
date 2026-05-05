import { getTypeTag, isPlainObject } from "./walk-json.js";

const DEFAULT_OPTIONS = {
  mode: "dotPaths",
  maxDepth: 12,
  maxColumns: 1000,
  includeObjectSummaries: false,
  arrayMode: "summary",
  primitiveArrayJoinLimit: 8,
  maxDisplayLength: 160
};

function isSimplePathKey(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

function escapeKey(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function createColumnKey(path) {
  if (!Array.isArray(path) || path.length === 0) {
    return "value";
  }

  let key = "";
  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];
    if (typeof segment === "number") {
      key += `[${segment}]`;
      continue;
    }
    if (isSimplePathKey(segment)) {
      key += key ? `.${segment}` : segment;
      continue;
    }
    key += `["${escapeKey(segment)}"]`;
  }
  return key || "value";
}

export function formatColumnLabel(path) {
  return createColumnKey(path);
}

function truncateDisplay(value, maxLength) {
  if (value.length <= maxLength) {
    return { text: value, truncated: false };
  }
  return {
    text: `${value.slice(0, maxLength)}…`,
    truncated: true
  };
}

function summarizeArray(value, options) {
  if (value.length === 0) {
    return "[]";
  }
  const types = new Map();
  for (const item of value) {
    const type = getTypeTag(item);
    types.set(type, (types.get(type) || 0) + 1);
  }
  if (types.size === 1 && types.has("object")) {
    return `[${value.length} objects]`;
  }
  if (types.size === 1 && !types.has("array") && !types.has("object")) {
    const items = value.slice(0, options.primitiveArrayJoinLimit).map((item) => String(item));
    const suffix = value.length > items.length ? `, … +${value.length - items.length}` : "";
    return `${items.join(", ")}${suffix}`;
  }
  const typeList = [...types.keys()].slice(0, 3).join(", ");
  return `[${value.length} items: ${typeList}]`;
}

function makeCell(rawValue, path, options) {
  const type = getTypeTag(rawValue);
  const base = {
    path,
    value: rawValue,
    type,
    state: "value",
    display: "",
    meta: {}
  };

  if (rawValue === null) {
    return { ...base, state: "null", display: "null" };
  }

  if (type === "string") {
    if (rawValue === "") {
      return { ...base, state: "empty", display: "\"\"" };
    }
    const truncated = truncateDisplay(rawValue, options.maxDisplayLength);
    return {
      ...base,
      display: truncated.text,
      meta: {
        truncated: truncated.truncated,
        originalLength: rawValue.length
      }
    };
  }

  if (type === "number" || type === "boolean") {
    return { ...base, display: String(rawValue) };
  }

  if (type === "array") {
    if (rawValue.length === 0) {
      return { ...base, state: "empty", display: "[]" };
    }
    const summary = summarizeArray(rawValue, options);
    return { ...base, display: summary };
  }

  if (type === "object") {
    const keys = Object.keys(rawValue);
    if (keys.length === 0) {
      return { ...base, state: "empty", display: "{}" };
    }
    return { ...base, display: `{${keys.length} keys}` };
  }

  return { ...base, display: String(rawValue) };
}

function setCell(rowValues, columnPath, rawValue, columnMap, columns, options) {
  const key = createColumnKey(columnPath);
  if (!columnMap.has(key) && columns.length >= options.maxColumns) {
    return { stopped: true, key };
  }

  if (!columnMap.has(key)) {
    const column = {
      key,
      path: [...columnPath],
      label: formatColumnLabel(columnPath),
      source: "flatten",
      order: columns.length
    };
    columns.push(column);
    columnMap.set(key, column);
  }

  rowValues[key] = makeCell(rawValue, [...columnPath], options);
  return { stopped: false, key };
}

function flattenObject(value, path, rowValues, columnMap, columns, warnings, options, depth = 0) {
  if (depth >= options.maxDepth) {
    const setResult = setCell(rowValues, path, value, columnMap, columns, options);
    warnings.push(`Flattening reached max depth at ${createColumnKey(path)}.`);
    return setResult.stopped;
  }

  if (!isPlainObject(value)) {
    const setResult = setCell(rowValues, path, value, columnMap, columns, options);
    return setResult.stopped;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) {
    const setResult = setCell(rowValues, path, value, columnMap, columns, options);
    return setResult.stopped;
  }

  let hadLeaf = false;
  for (const key of keys) {
    const child = value[key];
    const childPath = path.concat(key);
    const childType = getTypeTag(child);

    if (childType === "object") {
      const stopped = flattenObject(child, childPath, rowValues, columnMap, columns, warnings, options, depth + 1);
      if (stopped) return true;
      hadLeaf = true;
      continue;
    }

    const setResult = setCell(rowValues, childPath, child, columnMap, columns, options);
    if (setResult.stopped) return true;
    hadLeaf = true;
  }

  if (!hadLeaf || options.includeObjectSummaries) {
    const setResult = setCell(rowValues, path, value, columnMap, columns, options);
    if (setResult.stopped) return true;
  }
  return false;
}

export function flattenValue(value, options = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const columnMap = new Map();
  const columns = [];
  const warnings = [];
  const rowValues = {};

  if (isPlainObject(value)) {
    flattenObject(value, [], rowValues, columnMap, columns, warnings, mergedOptions, 0);
  } else {
    setCell(rowValues, ["value"], value, columnMap, columns, mergedOptions);
  }

  return {
    values: rowValues,
    columns,
    warnings
  };
}

export function flattenRows(sourceRows, options = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const warnings = [];
  const columns = [];
  const columnMap = new Map();
  const flatRows = [];

  let hitColumnLimit = false;
  for (const sourceRow of sourceRows || []) {
    const rowValues = {};
    const rowValue = sourceRow.original;

    if (isPlainObject(rowValue)) {
      const stopped = flattenObject(rowValue, [], rowValues, columnMap, columns, warnings, mergedOptions, 0);
      if (stopped) hitColumnLimit = true;
    } else {
      const setResult = setCell(rowValues, ["value"], rowValue, columnMap, columns, mergedOptions);
      if (setResult.stopped) hitColumnLimit = true;
    }

    flatRows.push({
      rowIndex: sourceRow.rowIndex,
      sourcePath: sourceRow.sourcePath,
      sourceLineNumber: sourceRow.sourceLineNumber ?? null,
      original: sourceRow.original,
      values: rowValues
    });
  }

  if (hitColumnLimit) {
    warnings.push("Column limit reached; some fields are hidden from flattened view.");
  }

  return {
    flatRows,
    columns,
    meta: {
      rowCount: flatRows.length,
      columnCount: columns.length,
      maxDepthReached: warnings.some((warning) => warning.includes("max depth")),
      sampled: false
    },
    warnings
  };
}

