import { getTypeTag } from "./walk-json.js";

function normalizeKeyTokens(value) {
  return String(value ?? "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]/g, " ")
    .toLowerCase()
    .trim();
}

function containsAny(tokens, needleList) {
  return needleList.some((needle) => tokens.includes(needle));
}

function isLikelyIdentifier(key) {
  const tokens = normalizeKeyTokens(key);
  return /\bid\b/.test(tokens)
    || containsAny(tokens, ["uuid", "guid", "job id", "request id", "trace id", "name", "key", "index", "idx"]);
}

function isLikelyStatus(key) {
  const tokens = normalizeKeyTokens(key);
  return containsAny(tokens, ["status", "state", "result", "outcome", "success", "ok", "passed", "failed"]);
}

function isLikelyError(key) {
  const tokens = normalizeKeyTokens(key);
  return containsAny(tokens, ["error", "exception", "message", "reason", "code", "trace", "stack", "stderr"]);
}

function isLikelyTime(key) {
  const tokens = normalizeKeyTokens(key);
  return containsAny(tokens, ["timestamp", "time", "date", "duration", "latency", "elapsed", "started", "finished"]);
}

function isLikelyMetric(key) {
  const tokens = normalizeKeyTokens(key);
  return containsAny(tokens, ["count", "total", "size", "bytes", "ms", "score", "percent", "rate", "latency", "duration"]);
}

function createTypeCounter() {
  return {
    string: 0,
    number: 0,
    boolean: 0,
    object: 0,
    array: 0,
    null: 0,
    missing: 0
  };
}

export function profileColumns(flatRows, columns, options = {}) {
  const uniqueLimit = Number.isFinite(options.uniqueLimit) ? options.uniqueLimit : 100;
  const rowCount = Array.isArray(flatRows) ? flatRows.length : 0;
  const profiles = [];

  for (const column of columns || []) {
    const types = createTypeCounter();
    let presentCount = 0;
    let nullCount = 0;
    let emptyCount = 0;
    let maxStringLength = 0;
    let totalStringLength = 0;
    let numberMin = null;
    let numberMax = null;
    const uniqueValues = new Set();
    let uniqueLimited = false;

    for (const row of flatRows || []) {
      const cell = row.values?.[column.key];
      if (!cell) {
        types.missing += 1;
        continue;
      }

      presentCount += 1;
      const type = cell.type || getTypeTag(cell.value);
      if (types[type] == null) types[type] = 0;
      types[type] += 1;

      if (cell.state === "null" || cell.value === null) {
        nullCount += 1;
      }
      if (cell.state === "empty") {
        emptyCount += 1;
      }

      if (type === "string") {
        const length = String(cell.value ?? "").length;
        maxStringLength = Math.max(maxStringLength, length);
        totalStringLength += length;
      }

      if (type === "number" && Number.isFinite(cell.value)) {
        numberMin = numberMin === null ? cell.value : Math.min(numberMin, cell.value);
        numberMax = numberMax === null ? cell.value : Math.max(numberMax, cell.value);
      }

      if (uniqueValues.size < uniqueLimit) {
        if (["string", "number", "boolean"].includes(type)) {
          uniqueValues.add(String(cell.value));
        } else if (type === "null") {
          uniqueValues.add("null");
        }
      } else {
        uniqueLimited = true;
      }
    }

    const missingCount = types.missing;
    const coverageRatio = rowCount > 0 ? presentCount / rowCount : 0;
    const dominantType = Object.entries(types)
      .filter(([key]) => key !== "missing")
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "missing";
    const mixedTypes = Object.entries(types).filter(([key, count]) => key !== "missing" && count > 0).length > 1;
    const averageStringLength = types.string > 0 ? totalStringLength / types.string : 0;
    const isLongText = maxStringLength > 240 || averageStringLength > 120;
    const isConstant = presentCount > 0 && uniqueValues.size === 1 && missingCount === 0;
    const isMostlyMissing = coverageRatio < 0.05;

    profiles.push({
      ...column,
      rowCount,
      presentCount,
      missingCount,
      nullCount,
      emptyCount,
      coverageRatio,
      types,
      dominantType,
      mixedTypes,
      uniqueCount: uniqueValues.size,
      uniqueLimited,
      sampleValues: [...uniqueValues].slice(0, 8),
      min: numberMin,
      max: numberMax,
      maxStringLength,
      averageStringLength,
      isConstant,
      isMostlyMissing,
      isLongText,
      isLikelyIdentifier: isLikelyIdentifier(column.key),
      isLikelyStatus: isLikelyStatus(column.key),
      isLikelyError: isLikelyError(column.key),
      isLikelyTime: isLikelyTime(column.key),
      isLikelyMetric: isLikelyMetric(column.key)
    });
  }

  return profiles;
}
