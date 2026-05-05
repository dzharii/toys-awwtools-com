import { getValueAtPath } from "./detect-row-source.js";
import { getTypeTag, isPlainObject } from "./walk-json.js";

function createRow(rowIndex, value, sourcePath, sourceLineNumber = null) {
  return {
    rowIndex,
    sourcePath,
    sourceLineNumber,
    original: value
  };
}

export function extractRowsFromSource(parseResult, rowSource) {
  if (!parseResult || !parseResult.ok) {
    return {
      ok: false,
      rows: [],
      warnings: [],
      error: {
        code: "E_PARSE_REQUIRED",
        message: "Cannot extract rows before parse succeeds."
      }
    };
  }

  if (!rowSource) {
    return {
      ok: false,
      rows: [],
      warnings: [],
      error: {
        code: "E_ROW_SOURCE_REQUIRED",
        message: "No row source selected."
      }
    };
  }

  const warnings = [];

  if (rowSource.kind === "jsonl") {
    const lineItems = Array.isArray(parseResult.lineItems) ? parseResult.lineItems : [];
    const rows = lineItems.map((lineItem, index) => createRow(index, lineItem.value, [index], lineItem.lineNumber));
    return {
      ok: true,
      source: rowSource,
      rows,
      warnings,
      meta: {
        rowCount: rows.length,
        sourceKind: "jsonl",
        sourcePathLabel: rowSource.pathLabel
      }
    };
  }

  if (rowSource.kind === "objectAsRow") {
    return {
      ok: true,
      source: rowSource,
      rows: [createRow(0, parseResult.root, [])],
      warnings,
      meta: {
        rowCount: 1,
        sourceKind: "objectAsRow",
        sourcePathLabel: rowSource.pathLabel
      }
    };
  }

  const sourceValue = getValueAtPath(parseResult.root, rowSource.path || []);
  if (sourceValue === undefined) {
    return {
      ok: false,
      rows: [],
      warnings,
      error: {
        code: "E_ROW_SOURCE_MISSING",
        message: "Selected row source no longer exists.",
        pathLabel: rowSource.pathLabel
      }
    };
  }

  if (Array.isArray(sourceValue)) {
    const rows = sourceValue.map((item, index) => createRow(index, item, (rowSource.path || []).concat(index)));
    return {
      ok: true,
      source: rowSource,
      rows,
      warnings,
      meta: {
        rowCount: rows.length,
        sourceKind: "array",
        sourcePathLabel: rowSource.pathLabel
      }
    };
  }

  if (isPlainObject(sourceValue)) {
    return {
      ok: true,
      source: rowSource,
      rows: [createRow(0, sourceValue, rowSource.path || [])],
      warnings,
      meta: {
        rowCount: 1,
        sourceKind: "object",
        sourcePathLabel: rowSource.pathLabel
      }
    };
  }

  const sourceTag = getTypeTag(sourceValue);
  return {
    ok: true,
    source: rowSource,
    rows: [createRow(0, sourceValue, rowSource.path || [])],
    warnings,
    meta: {
      rowCount: 1,
      sourceKind: sourceTag,
      sourcePathLabel: rowSource.pathLabel
    }
  };
}

