function shouldProtectFormula(value) {
  return /^[\s]*[=+\-@\t\r\n]/.test(value);
}

function isCellMissing(cell) {
  return !cell || cell.state === "missing" || cell.state === "null" || cell.value == null;
}

export function normalizeExportCell(cell, options = {}) {
  const protectFormula = options.protectFormula !== false;
  if (isCellMissing(cell)) return "";

  let rawText = "";
  if (typeof cell.value === "number") rawText = String(cell.value);
  else if (typeof cell.value === "boolean") rawText = cell.value ? "true" : "false";
  else if (typeof cell.value === "string") rawText = cell.value;
  else if (Array.isArray(cell.value) || (cell.value && typeof cell.value === "object")) rawText = JSON.stringify(cell.value);
  else rawText = String(cell.value ?? "");

  if (protectFormula && typeof cell.value === "string" && shouldProtectFormula(rawText)) {
    return `'${rawText}`;
  }
  return rawText;
}

export function escapeCsvCell(value, options = {}) {
  const delimiter = options.delimiter ?? ",";
  const newline = options.newline ?? "\r\n";
  const stringValue = String(value ?? "");
  const containsQuote = stringValue.includes('"');
  const containsDelimiter = stringValue.includes(delimiter);
  const containsNewline = stringValue.includes("\n") || stringValue.includes("\r");
  const leadingOrTrailingSpace = /^\s|\s$/.test(stringValue);

  if (!containsQuote && !containsDelimiter && !containsNewline && !leadingOrTrailingSpace) {
    return stringValue;
  }

  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

function serializeDelimited(rows, columns, options = {}) {
  const delimiter = options.delimiter ?? ",";
  const newline = options.newline ?? "\r\n";
  const includeHeader = options.includeHeader !== false;
  const includeHealth = options.includeHealth !== false;
  const includeRowNumber = options.includeRowNumber === true;
  const warnings = [];

  const exportColumns = [...(columns || [])];
  if (exportColumns.length === 0 && !includeHealth && !includeRowNumber) {
    return {
      ok: false,
      error: {
        code: "E_EXPORT_NO_COLUMNS",
        message: "No columns selected for export."
      },
      warnings
    };
  }

  const lines = [];
  let formulaEscapedCellCount = 0;
  let quotedCellCount = 0;
  const headerLabels = [];
  if (includeRowNumber) headerLabels.push("#");
  if (includeHealth) headerLabels.push("Health");
  headerLabels.push(...exportColumns.map((column) => column.label || column.key));

  if (includeHeader) {
    const headerLine = headerLabels
      .map((label) => {
        const escaped = escapeCsvCell(label, { delimiter, newline });
        if (escaped.startsWith('"')) quotedCellCount += 1;
        return escaped;
      })
      .join(delimiter);
    lines.push(headerLine);
  }

  for (let rowIndex = 0; rowIndex < (rows || []).length; rowIndex += 1) {
    const row = rows[rowIndex];
    const cells = [];
    if (includeRowNumber) {
      cells.push(String(row.rowIndex + 1));
    }
    if (includeHealth) {
      cells.push(String(row.health?.level ?? "unknown"));
    }
    for (const column of exportColumns) {
      const cell = row.values?.[column.key];
      const normalized = normalizeExportCell(cell, options);
      if (typeof cell?.value === "string" && normalized.startsWith("'") && !cell.value.startsWith("'")) {
        formulaEscapedCellCount += 1;
      }
      cells.push(normalized);
    }

    const line = cells
      .map((cellText) => {
        const escaped = escapeCsvCell(cellText, { delimiter, newline });
        if (escaped.startsWith('"')) quotedCellCount += 1;
        return escaped;
      })
      .join(delimiter);
    lines.push(line);
  }

  const text = lines.join(newline);
  return {
    ok: true,
    text,
    meta: {
      format: delimiter === "\t" ? "tsv" : "csv",
      rowCount: (rows || []).length,
      columnCount: headerLabels.length,
      delimiter,
      newline,
      formulaEscapedCellCount,
      quotedCellCount
    },
    warnings
  };
}

export function serializeCsv(rows, columns, options = {}) {
  return serializeDelimited(rows, columns, {
    ...options,
    delimiter: ",",
    newline: "\r\n"
  });
}

export function serializeTsv(rows, columns, options = {}) {
  return serializeDelimited(rows, columns, {
    ...options,
    delimiter: "\t",
    newline: "\r\n"
  });
}

export function createDownloadBlob(text, mimeType = "text/csv;charset=utf-8") {
  return new Blob([text], { type: mimeType });
}

