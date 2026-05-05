function isMeaningfulCell(cell) {
  if (!cell) return false;
  if (cell.state === "missing") return false;
  if (cell.state === "null") return true;
  if (cell.type === "string") return true;
  if (cell.type === "number" || cell.type === "boolean") return true;
  if (cell.type === "array") return true;
  if (cell.type === "object") return true;
  return false;
}

export function stringifyOriginalJson(value, options = {}) {
  const indent = Number.isFinite(options.indent) ? options.indent : 2;
  return JSON.stringify(value, null, indent);
}

export function listNonEmptyFields(row, columns) {
  const fields = [];
  for (const column of columns || []) {
    const cell = row.values?.[column.key];
    if (!isMeaningfulCell(cell)) continue;
    fields.push({
      key: column.key,
      label: column.label,
      state: cell.state,
      type: cell.type,
      display: cell.display,
      value: cell.value
    });
  }
  return fields;
}

export function buildRowDetails(row, columns) {
  if (!row) return null;
  return {
    rowIndex: row.rowIndex,
    sourcePath: row.sourcePath,
    sourceLineNumber: row.sourceLineNumber,
    health: row.health || null,
    nonEmptyFields: listNonEmptyFields(row, columns),
    originalJsonText: stringifyOriginalJson(row.original, { indent: 2 }),
    visibleRowJsonText: stringifyOriginalJson(
      listNonEmptyFields(row, columns).reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {}),
      { indent: 2 }
    )
  };
}

