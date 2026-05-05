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

export function buildExportTimestampStamp(date = new Date()) {
  const safeDate = date instanceof Date ? date : new Date(date);
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");
  const hours = String(safeDate.getHours()).padStart(2, "0");
  const minutes = String(safeDate.getMinutes()).padStart(2, "0");
  const seconds = String(safeDate.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

export function buildHtmlExportFilename(date = new Date()) {
  return `json-table-inspector-export-${buildExportTimestampStamp(date)}.html`;
}

export function escapeHtml(value) {
  const text = String(value ?? "");
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const HTML_EXPORT_CSS = `:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 16px;
  font: 13px/1.45 "Segoe UI", Tahoma, system-ui, sans-serif;
  color: #111720;
  background: #d8dde5;
}
.jti-export-root {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 12px;
}
.jti-export-meta {
  border: 1px solid #9ba5b3;
  background: #f7f9fc;
  padding: 10px 12px;
}
.jti-export-meta h1 {
  margin: 0 0 8px;
  font-size: 16px;
}
.jti-export-meta ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 2px;
}
.jti-export-table {
  border: 1px solid #9ba5b3;
  background: #fff;
  overflow: auto;
}
.jti-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
}
.jti-th {
  background: #eef2f7;
  border-bottom: 1px solid #657282;
  border-right: 1px solid #9ba5b3;
  text-align: left;
  padding: 6px 8px;
  white-space: nowrap;
}
.jti-cell {
  border-right: 1px solid #b2bac6;
  border-bottom: 1px solid #c7cfdb;
  padding: 4px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
}
.jti-export-wrap .jti-cell {
  white-space: normal;
  overflow-wrap: anywhere;
}
.jti-system-cell {
  background: #f6f8fb;
}
.jti-cell-value {
  display: inline-block;
  max-width: 100%;
}
.jti-cell-missing,
.jti-cell-null,
.jti-cell-empty {
  color: #647181;
}
.jti-row-failure {
  background: #fef2f2;
}
.jti-row-warning {
  background: #fff7ed;
}
.jti-health-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border: 1px solid;
  font-size: 12px;
  text-transform: capitalize;
}
.jti-health-failure {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}
.jti-health-warning {
  background: #ffedd5;
  color: #9a3412;
  border-color: #fdba74;
}
.jti-health-ok {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}
.jti-health-unknown {
  background: #e5e7eb;
  color: #374151;
  border-color: #c4c8cf;
}
.jti-highlight--danger { background: #fee2e2; }
.jti-highlight--warning { background: #fef3c7; }
.jti-highlight--info { background: #dbeafe; }
.jti-highlight--success { background: #dcfce7; }
.jti-highlight--custom { background: var(--jti-highlight-bg, #fde68a); }`;

function normalizeMetadataLine(line) {
  if (!line || typeof line !== "object") return null;
  if (typeof line.label !== "string" || typeof line.value !== "string") return null;
  return { label: line.label, value: line.value };
}

export function buildHtmlExportDocument({ title = "JSON Table Inspector Export", metadataLines = [], tableHtml = "", wrapCells = false } = {}) {
  const safeTitle = escapeHtml(title);
  const listItems = metadataLines
    .map(normalizeMetadataLine)
    .filter(Boolean)
    .map((line) => `<li><strong>${escapeHtml(line.label)}:</strong> ${escapeHtml(line.value)}</li>`)
    .join("");
  const tableMarkup = (typeof tableHtml === "string" ? tableHtml : "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const wrapClass = wrapCells ? " jti-export-wrap" : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
${HTML_EXPORT_CSS}
  </style>
</head>
<body>
  <main class="jti-export-root${wrapClass}">
    <section class="jti-export-meta">
      <h1>${safeTitle}</h1>
      <ul>${listItems}</ul>
    </section>
    <section class="jti-export-table">
${tableMarkup}
    </section>
  </main>
</body>
</html>`;
}
