import { getTypeTag, isPlainObject, walkJson } from "./walk-json.js";

const RECORD_LIKE_SEGMENTS = new Set([
  "item",
  "items",
  "result",
  "results",
  "record",
  "records",
  "row",
  "rows",
  "entry",
  "entries",
  "event",
  "events",
  "log",
  "logs",
  "data",
  "case",
  "cases",
  "test",
  "tests"
]);

const METADATA_SEGMENTS = new Set(["metadata", "meta", "config", "options", "tags", "categories"]);
const FAILURE_LIKE_KEYS = new Set(["success", "ok", "failed", "status", "state", "error", "errors", "message", "code"]);
const IDENTITY_LIKE_KEYS = new Set(["id", "uuid", "name", "key", "jobid", "requestid", "taskid"]);

function normalizeSegment(value) {
  return String(value ?? "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .trim();
}

function maybeQuotedKey(key) {
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key;
  return `["${String(key).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;
}

export function formatPathLabel(path, candidateKind = "array") {
  if (candidateKind === "jsonl") return "JSONL records";
  if (candidateKind === "objectAsRow") return "root object";
  if (!Array.isArray(path) || path.length === 0) return candidateKind === "array" ? "root[]" : "root";
  let text = "";
  for (const segment of path) {
    if (typeof segment === "number") {
      text += `[${segment}]`;
    } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(segment)) {
      text += text ? `.${segment}` : segment;
    } else {
      text += maybeQuotedKey(segment);
    }
  }
  return candidateKind === "array" ? `${text}[]` : text;
}

export function getValueAtPath(root, path) {
  let current = root;
  for (const segment of path || []) {
    if (current == null) return undefined;
    current = current[segment];
  }
  return current;
}

function confidenceFromScore(score) {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  if (score >= 20) return "low";
  return "veryLow";
}

function buildTypeMix(items) {
  const mix = {
    object: 0,
    array: 0,
    string: 0,
    number: 0,
    boolean: 0,
    null: 0
  };
  for (const value of items) {
    const tag = getTypeTag(value);
    if (mix[tag] == null) mix[tag] = 0;
    mix[tag] += 1;
  }
  return mix;
}

function getCommonKeys(objectItems) {
  const counts = new Map();
  for (const item of objectItems) {
    for (const key of Object.keys(item)) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const threshold = Math.max(2, Math.ceil(objectItems.length * 0.3));
  return [...counts.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([key]) => key)
    .sort();
}

function countKeysMatching(commonKeys, allowedSet) {
  let count = 0;
  for (const key of commonKeys) {
    const normalized = normalizeSegment(key).replace(/\s+/g, "");
    if (allowedSet.has(normalized)) count += 1;
  }
  return count;
}

export function scoreRowSourceCandidate(candidate) {
  let score = 0;
  const reasons = [];
  const warnings = [];

  if (candidate.kind === "jsonl") {
    score += 100;
    reasons.push("Input parsed as JSONL.");
  }

  if (candidate.kind === "array" && candidate.path.length === 0) {
    score += 30;
    reasons.push("Root is an array.");
  }

  if (candidate.rowCount === 0) {
    score -= 30;
    warnings.push("Array is empty.");
  } else if (candidate.rowCount >= 10) {
    score += 15;
    reasons.push(`Array has ${candidate.rowCount} items.`);
  } else if (candidate.rowCount >= 2) {
    score += 10;
    reasons.push(`Array has ${candidate.rowCount} items.`);
  } else if (candidate.rowCount === 1) {
    score -= 10;
  }

  const objectRatio = candidate.rowCount > 0 ? candidate.itemTypeMix.object / candidate.rowCount : 0;
  if (objectRatio >= 0.8) {
    score += 25;
    reasons.push("Most sampled items are objects.");
  } else if (objectRatio >= 0.4) {
    score += 10;
  } else if (candidate.rowCount > 0) {
    score -= 20;
    warnings.push("Items are mostly not objects.");
  }

  if (candidate.repeatedKeyCount >= 3) {
    score += 20;
    reasons.push("Rows share repeated keys.");
  }

  if (candidate.depth <= 3) {
    score += 5;
  } else if (candidate.depth > 6) {
    score -= 15;
    warnings.push("Candidate is deeply nested.");
  }

  const pathLeaf = candidate.path.length > 0 ? normalizeSegment(candidate.path[candidate.path.length - 1]) : "";
  if (RECORD_LIKE_SEGMENTS.has(pathLeaf)) {
    score += 10;
    reasons.push("Path name suggests record rows.");
  }
  if (METADATA_SEGMENTS.has(pathLeaf)) {
    score -= 10;
    warnings.push("Path name suggests metadata.");
  }

  const failureLikeMatchCount = countKeysMatching(candidate.commonKeys, FAILURE_LIKE_KEYS);
  if (failureLikeMatchCount > 0) {
    score += 10;
    reasons.push("Rows include failure/status fields.");
  }

  const identityLikeMatchCount = countKeysMatching(candidate.commonKeys, IDENTITY_LIKE_KEYS);
  if (identityLikeMatchCount > 0) {
    score += 8;
    reasons.push("Rows include identity-like fields.");
  }

  return {
    score,
    confidence: confidenceFromScore(score),
    reasons,
    warnings
  };
}

function createCandidateId(kind, path) {
  return `${kind}:${JSON.stringify(path || [])}`;
}

function analyzeArray(path, arrayValue, depth, options) {
  const maxArrayItemsToSample = Number.isFinite(options.maxArrayItemsToSample) ? options.maxArrayItemsToSample : 100;
  const sampleItems = arrayValue.slice(0, maxArrayItemsToSample);
  const itemTypeMix = buildTypeMix(sampleItems);
  const objectItems = sampleItems.filter((item) => isPlainObject(item));
  const commonKeys = getCommonKeys(objectItems);
  const repeatedKeyCount = commonKeys.length;
  const scoreResult = scoreRowSourceCandidate({
    kind: "array",
    path,
    rowCount: arrayValue.length,
    itemTypeMix,
    repeatedKeyCount,
    commonKeys,
    depth
  });

  return {
    id: createCandidateId("path", path),
    kind: "array",
    path,
    pathLabel: formatPathLabel(path, "array"),
    parentPath: path.slice(0, -1),
    depth,
    rowCount: arrayValue.length,
    itemType: objectItems.length > 0 ? "object" : getTypeTag(sampleItems[0]),
    itemTypeMix,
    repeatedKeyCount,
    commonKeys,
    sampled: arrayValue.length > sampleItems.length,
    sampleSize: sampleItems.length,
    score: scoreResult.score,
    confidence: scoreResult.confidence,
    reasons: scoreResult.reasons,
    warnings: scoreResult.warnings
  };
}

export function findRowSourceCandidates(parseResult, options = {}) {
  if (!parseResult || !parseResult.ok || parseResult.kind === "empty") return [];

  if (parseResult.kind === "jsonl") {
    return [
      {
        id: "jsonl:root",
        kind: "jsonl",
        path: [],
        pathLabel: "JSONL records",
        parentPath: [],
        rowCount: Array.isArray(parseResult.root) ? parseResult.root.length : 0,
        itemType: "object",
        itemTypeMix: { object: Array.isArray(parseResult.root) ? parseResult.root.length : 0 },
        repeatedKeyCount: 0,
        commonKeys: [],
        score: 100,
        confidence: "high",
        reasons: ["Input parsed as JSONL.", "Each non-empty line becomes one row."],
        warnings: []
      }
    ];
  }

  const root = parseResult.root;
  const rootType = getTypeTag(root);
  if (rootType === "array") {
    const candidate = analyzeArray([], root, 0, options);
    return [candidate];
  }

  if (rootType !== "object") {
    return [];
  }

  const candidates = [];
  const { exceededLimit } = walkJson(
    root,
    ({ value, path, depth, type }) => {
      if (type !== "array") return;
      candidates.push(analyzeArray(path, value, depth, options));
    },
    options
  );

  if (candidates.length === 0 && isPlainObject(root)) {
    candidates.push({
      id: createCandidateId("object", []),
      kind: "objectAsRow",
      path: [],
      pathLabel: "root object",
      parentPath: [],
      rowCount: 1,
      itemType: "object",
      itemTypeMix: { object: 1 },
      repeatedKeyCount: 0,
      commonKeys: Object.keys(root).slice(0, 30),
      score: 25,
      confidence: "low",
      reasons: ["No array of records found. Using root object as one row."],
      warnings: []
    });
  }

  const sorted = candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.rowCount !== a.rowCount) return b.rowCount - a.rowCount;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.pathLabel.localeCompare(b.pathLabel);
  });

  if (exceededLimit && sorted[0]) {
    sorted[0].warnings = [...(sorted[0].warnings || []), "Detection sampled large input for performance."];
  }

  return sorted;
}

export function chooseBestRowSource(candidates, options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const preferredId = options.preferredCandidateId;
  if (preferredId) {
    const preferred = candidates.find((candidate) => candidate.id === preferredId);
    if (preferred) return preferred;
  }
  return candidates[0];
}

