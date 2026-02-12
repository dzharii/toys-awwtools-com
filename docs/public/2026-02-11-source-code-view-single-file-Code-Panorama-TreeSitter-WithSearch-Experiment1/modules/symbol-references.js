const IDENT_CHAR_RE = /[A-Za-z0-9_]/;
const IDENTIFIER_FULL_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const CONFIG_EXTS = new Set(["yaml", "yml", "ini", "toml", "env", "properties", "conf", "cfg"]);

const DEFAULT_STOP_WORDS = new Set([
  "if",
  "for",
  "while",
  "switch",
  "case",
  "break",
  "continue",
  "return",
  "true",
  "false",
  "null",
  "undefined",
  "function",
  "const",
  "let",
  "var",
  "class",
  "new",
  "import",
  "from",
  "export",
  "default",
  "name",
  "version"
]);

const HEURISTIC_DEFINITION_PATTERNS = [
  { regex: /^\s*#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\b/, kind: "macro" },
  { regex: /\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\b/, kind: "function" },
  { regex: /\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b/, kind: "class" },
  { regex: /\b(?:def|func)\s+([A-Za-z_][A-Za-z0-9_]*)\b/, kind: "function" },
  { regex: /\b(?:const|let|var)\s+([A-Za-z_][A-Za-z0-9_]*)\b/, kind: "variable" },
  { regex: /\b(?:type|interface|enum|struct)\s+([A-Za-z_][A-Za-z0-9_]*)\b/, kind: "type" }
];

const HEURISTIC_REFERENCE_PATTERNS = [
  { regex: /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g, kind: "call" },
  { regex: /\b([A-Za-z_][A-Za-z0-9_]*)\s*\./g, kind: "member" },
  { regex: /&\s*([A-Za-z_][A-Za-z0-9_]*)\b/g, kind: "reference" }
];

const TREE_SITTER_DEFINITION_TYPES = {
  c: {
    function_definition: "function",
    struct_specifier: "struct",
    class_specifier: "class",
    union_specifier: "union",
    enum_specifier: "enum",
    type_definition: "typedef",
    preproc_def: "macro",
    preproc_function_def: "macro"
  },
  cpp: {
    function_definition: "function",
    struct_specifier: "struct",
    class_specifier: "class",
    union_specifier: "union",
    enum_specifier: "enum",
    type_definition: "typedef",
    preproc_def: "macro",
    preproc_function_def: "macro"
  },
  javascript: {
    function_declaration: "function",
    method_definition: "method",
    class_declaration: "class",
    generator_function: "function",
    lexical_declaration: "variable",
    variable_declarator: "variable"
  },
  bash: {
    function_definition: "function"
  },
  csharp: {
    method_declaration: "method",
    class_declaration: "class",
    struct_declaration: "struct",
    interface_declaration: "interface",
    enum_declaration: "enum",
    constructor_declaration: "constructor",
    property_declaration: "property"
  },
  json: {
    pair: "key"
  },
  scala: {
    class_definition: "class",
    object_definition: "object",
    trait_definition: "trait",
    method_definition: "method",
    function_definition: "function",
    val_definition: "value",
    var_definition: "variable"
  }
};

const TREE_SITTER_IDENTIFIER_TYPES = [
  "identifier",
  "type_identifier",
  "field_identifier",
  "property_identifier"
];

function toLower(value) {
  return String(value || "").toLowerCase();
}

function getPathExtension(path) {
  const normalized = String(path || "");
  const slashIdx = normalized.lastIndexOf("/");
  const base = slashIdx >= 0 ? normalized.slice(slashIdx + 1) : normalized;
  const dotIdx = base.lastIndexOf(".");
  if (dotIdx <= 0 || dotIdx === base.length - 1) return "";
  return base.slice(dotIdx + 1).toLowerCase();
}

function pushLineMatch(list, seen, payload) {
  const key = `${payload.role}:${payload.name}:${payload.startCol}:${payload.endCol}:${payload.kind}`;
  if (seen.has(key)) return;
  seen.add(key);
  list.push(payload);
}

function isIdentifierCharacter(ch) {
  return IDENT_CHAR_RE.test(ch || "");
}

function clampOffset(text, rawOffset) {
  if (!text) return 0;
  if (!Number.isFinite(rawOffset)) return 0;
  if (rawOffset <= 0) return 0;
  if (rawOffset >= text.length) return Math.max(0, text.length - 1);
  return rawOffset;
}

function createOccurrence(name, lineNumber, startCol, endCol, kind, role, source, bridgeClass = "none") {
  return {
    symbol: name,
    lineNumber,
    startCol,
    endCol,
    kind,
    role,
    source,
    bridgeClass
  };
}

function pickNameNode(node) {
  if (!node) return null;
  const byField = ["name", "declarator", "declaration", "type", "key"];
  for (let i = 0; i < byField.length; i += 1) {
    const fieldName = byField[i];
    const fieldNode = node.childForFieldName?.(fieldName);
    if (!fieldNode) continue;
    if (TREE_SITTER_IDENTIFIER_TYPES.includes(fieldNode.type)) return fieldNode;
    const descendants = fieldNode.descendantsOfType?.(TREE_SITTER_IDENTIFIER_TYPES) || [];
    if (descendants.length) return descendants[0];
    if (fieldNode.text && IDENTIFIER_FULL_RE.test(fieldNode.text.trim())) return fieldNode;
  }
  const descendants = node.descendantsOfType?.(TREE_SITTER_IDENTIFIER_TYPES) || [];
  if (descendants.length) return descendants[0];
  return null;
}

function detectTreeReferenceKind(node) {
  const parentType = node?.parent?.type || "";
  if (!parentType) return "reference";
  if (parentType.includes("call")) return "call";
  if (parentType.includes("member") || parentType.includes("field") || parentType.includes("property")) return "member";
  if (parentType.includes("import")) return "import";
  return "reference";
}

export function isSymbolStopWord(name, stopWords = DEFAULT_STOP_WORDS) {
  if (!name) return true;
  return stopWords.has(toLower(name));
}

export function normalizeSymbolName(raw) {
  const trimmed = String(raw || "").trim();
  return IDENTIFIER_FULL_RE.test(trimmed) ? trimmed : "";
}

export function isBridgeConstant(name, minBridgeLength = 3) {
  const safe = String(name || "").trim();
  if (safe.length < minBridgeLength) return false;
  if (!/^[A-Z][A-Z0-9_]*$/.test(safe)) return false;
  return safe.includes("_");
}

export function isValidSymbolName(name, opts = {}) {
  const normalized = normalizeSymbolName(name);
  if (!normalized) return false;
  const minLength = Number.isFinite(opts.minLength) ? opts.minLength : 2;
  if (normalized.length < minLength) return false;
  if (isSymbolStopWord(normalized, opts.stopWords || DEFAULT_STOP_WORDS)) return false;
  return true;
}

export function isSingleIdentifierText(text, opts = {}) {
  const normalized = normalizeSymbolName(text);
  if (!normalized) return null;
  return isValidSymbolName(normalized, opts) ? normalized : null;
}

export function extractIdentifierAtOffset(text, rawOffset, opts = {}) {
  const safeText = String(text || "");
  if (!safeText.length) return null;
  let offset = clampOffset(safeText, rawOffset);

  if (!isIdentifierCharacter(safeText[offset]) && offset > 0 && isIdentifierCharacter(safeText[offset - 1])) {
    offset -= 1;
  }
  if (!isIdentifierCharacter(safeText[offset])) return null;

  let start = offset;
  while (start > 0 && isIdentifierCharacter(safeText[start - 1])) start -= 1;

  let end = offset + 1;
  while (end < safeText.length && isIdentifierCharacter(safeText[end])) end += 1;

  const symbol = safeText.slice(start, end);
  if (!isValidSymbolName(symbol, opts)) return null;
  return { symbol, start, end };
}

export function isConfigLikeFile(path) {
  return CONFIG_EXTS.has(getPathExtension(path));
}

export function createEmptySymbolContribution(file, source = "heuristic") {
  return {
    fileId: file?.id || "",
    sourcePath: file?.path || "",
    source,
    definitions: [],
    references: []
  };
}

export function extractHeuristicSymbolsFromLine(line, context = {}) {
  const safeLine = String(line || "");
  const lineNumber = context.lineNumber || 1;
  const minLength = Number.isFinite(context.minLength) ? context.minLength : 2;
  const minBridgeLength = Number.isFinite(context.minBridgeLength) ? context.minBridgeLength : 3;
  const stopWords = context.stopWords || DEFAULT_STOP_WORDS;
  const isConfigFile = !!context.isConfigFile;

  const items = [];
  const seen = new Set();

  if (isConfigFile) {
    const keyMatch = safeLine.match(/^\s*([A-Za-z_][A-Za-z0-9_]{1,120})\s*(?::|=)/);
    if (keyMatch) {
      const key = keyMatch[1];
      if (isValidSymbolName(key, { minLength, stopWords })) {
        const startCol = keyMatch[0].indexOf(key) + 1;
        const endCol = startCol + key.length;
        const bridgeClass = isBridgeConstant(key, minBridgeLength) ? "strong" : "weak";
        pushLineMatch(items, seen, createOccurrence(key, lineNumber, startCol, endCol, "key", "definition", "heuristic", bridgeClass));
        pushLineMatch(items, seen, createOccurrence(key, lineNumber, startCol, endCol, "key", "reference", "heuristic", bridgeClass));
      }
    }
  }

  for (let i = 0; i < HEURISTIC_DEFINITION_PATTERNS.length; i += 1) {
    const defPattern = HEURISTIC_DEFINITION_PATTERNS[i];
    const match = safeLine.match(defPattern.regex);
    if (!match || !match[1]) continue;
    const name = match[1];
    if (!isValidSymbolName(name, { minLength, stopWords })) continue;
    const start = safeLine.indexOf(name, match.index || 0);
    if (start < 0) continue;
    const startCol = start + 1;
    const endCol = startCol + name.length;
    const bridgeClass = isBridgeConstant(name, minBridgeLength) ? "strong" : "none";
    pushLineMatch(items, seen, createOccurrence(name, lineNumber, startCol, endCol, defPattern.kind, "definition", "heuristic", bridgeClass));
  }

  for (let i = 0; i < HEURISTIC_REFERENCE_PATTERNS.length; i += 1) {
    const refPattern = HEURISTIC_REFERENCE_PATTERNS[i];
    refPattern.regex.lastIndex = 0;
    let match = refPattern.regex.exec(safeLine);
    while (match) {
      const name = match[1] || "";
      if (isValidSymbolName(name, { minLength, stopWords })) {
        const prefix = match[0];
        const offsetInMatch = prefix.indexOf(name);
        const start = match.index + (offsetInMatch >= 0 ? offsetInMatch : 0);
        const startCol = start + 1;
        const endCol = startCol + name.length;
        const bridgeClass = isBridgeConstant(name, minBridgeLength) ? "strong" : "none";
        pushLineMatch(items, seen, createOccurrence(name, lineNumber, startCol, endCol, refPattern.kind, "reference", "heuristic", bridgeClass));
      }
      match = refPattern.regex.exec(safeLine);
    }
  }

  const constantRegex = /\b([A-Z][A-Z0-9_]{2,})\b/g;
  let constantMatch = constantRegex.exec(safeLine);
  while (constantMatch) {
    const name = constantMatch[1] || "";
    if (isValidSymbolName(name, { minLength: minBridgeLength, stopWords })) {
      const start = constantMatch.index;
      const startCol = start + 1;
      const endCol = startCol + name.length;
      pushLineMatch(items, seen, createOccurrence(name, lineNumber, startCol, endCol, "constant", "reference", "heuristic", "strong"));
    }
    constantMatch = constantRegex.exec(safeLine);
  }

  return items;
}

export function extractTreeSitterSymbolContribution(tree, file, lang, options = {}) {
  const contribution = createEmptySymbolContribution(file, "tree");
  if (!tree?.rootNode || !file?.id) return contribution;

  const minLength = Number.isFinite(options.minLength) ? options.minLength : 2;
  const minBridgeLength = Number.isFinite(options.minBridgeLength) ? options.minBridgeLength : 3;
  const stopWords = options.stopWords || DEFAULT_STOP_WORDS;

  const defMap = TREE_SITTER_DEFINITION_TYPES[lang] || {};
  const defTypes = Object.keys(defMap);
  const definitionPositionSet = new Set();

  if (defTypes.length) {
    const definitionNodes = tree.rootNode.descendantsOfType(defTypes);
    for (let i = 0; i < definitionNodes.length; i += 1) {
      const node = definitionNodes[i];
      const nameNode = pickNameNode(node);
      const name = normalizeSymbolName(nameNode?.text || "");
      if (!isValidSymbolName(name, { minLength, stopWords })) continue;
      const startCol = (nameNode?.startPosition?.column ?? node.startPosition.column) + 1;
      const endCol = (nameNode?.endPosition?.column ?? node.endPosition.column) + 1;
      const lineNumber = (nameNode?.startPosition?.row ?? node.startPosition.row) + 1;
      const definition = createOccurrence(
        name,
        lineNumber,
        startCol,
        endCol,
        defMap[node.type] || "definition",
        "definition",
        "tree",
        isBridgeConstant(name, minBridgeLength) ? "strong" : "none"
      );
      contribution.definitions.push(definition);
      definitionPositionSet.add(`${lineNumber}:${startCol}:${name}`);
    }
  }

  const identifierNodes = tree.rootNode.descendantsOfType(TREE_SITTER_IDENTIFIER_TYPES);
  for (let i = 0; i < identifierNodes.length; i += 1) {
    const node = identifierNodes[i];
    const name = normalizeSymbolName(node.text || "");
    if (!isValidSymbolName(name, { minLength, stopWords })) continue;
    const lineNumber = node.startPosition.row + 1;
    const startCol = node.startPosition.column + 1;
    const dedupeKey = `${lineNumber}:${startCol}:${name}`;
    if (definitionPositionSet.has(dedupeKey)) continue;
    const reference = createOccurrence(
      name,
      lineNumber,
      startCol,
      node.endPosition.column + 1,
      detectTreeReferenceKind(node),
      "reference",
      "tree",
      isBridgeConstant(name, minBridgeLength) ? "strong" : "none"
    );
    contribution.references.push(reference);
  }

  return contribution;
}
