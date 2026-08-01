const TOKEN_PATTERN = /\{(prefix|name|index|row|column|x|y|width|height)(?::(0+))?\}/g;
const ANY_TOKEN_PATTERN = /\{[^}]+\}/g;

export function sanitizeFileComponent(value) {
  return String(value)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/[. ]+$/g, "")
    .slice(0, 180) || "sprite";
}

export function validateNamingTemplate(template) {
  const unsupported = [...String(template).matchAll(ANY_TOKEN_PATTERN)]
    .map((match) => match[0])
    .filter((token) => !new RegExp(`^${TOKEN_PATTERN.source}$`).test(token));
  if (unsupported.length > 0) {
    return { valid: false, message: `Unsupported token: ${unsupported[0]}` };
  }
  if (!String(template).trim()) return { valid: false, message: "Enter a filename template." };
  return { valid: true, message: "" };
}

export function createSpriteFileName(cell, position, naming, sourceName = "atlas") {
  const values = {
    prefix: naming.prefix,
    name: sourceName.replace(/\.[^.]+$/, ""),
    index: naming.startIndex + position,
    row: naming.rowStartIndex + cell.row,
    column: naming.columnStartIndex + cell.column,
    x: cell.sourceRectangle.x,
    y: cell.sourceRectangle.y,
    width: cell.outputRectangle?.width ?? cell.sourceRectangle.width,
    height: cell.outputRectangle?.height ?? cell.sourceRectangle.height,
  };
  const expanded = naming.template.replace(TOKEN_PATTERN, (_match, token, padding) => {
    const value = values[token];
    return padding ? String(value).padStart(padding.length, "0") : String(value);
  });
  return `${sanitizeFileComponent(expanded)}.png`;
}

export function createNamedCells(cells, naming, sourceName) {
  const named = cells.map((cell, position) => ({
    ...cell,
    index: naming.startIndex + position,
    fileName: createSpriteFileName(cell, position, naming, sourceName),
  }));
  const seen = new Set();
  const duplicates = new Set();
  for (const cell of named) {
    if (seen.has(cell.fileName)) duplicates.add(cell.fileName);
    seen.add(cell.fileName);
  }
  return { cells: named, duplicates: [...duplicates] };
}
