const OUTLINE_CONFIGS = {
  c: {
    types: [
      "function_definition",
      "struct_specifier",
      "class_specifier",
      "union_specifier",
      "enum_specifier",
      "type_definition",
      "preproc_def",
      "preproc_function_def"
    ],
    map: type => {
      if (type === "function_definition") return "function";
      if (type === "enum_specifier") return "enum";
      if (type === "type_definition") return "typedef";
      if (type === "preproc_def" || type === "preproc_function_def") return "macro";
      if (type === "struct_specifier" || type === "class_specifier" || type === "union_specifier") return "struct";
      return null;
    }
  },
  cpp: {
    types: [
      "function_definition",
      "struct_specifier",
      "class_specifier",
      "union_specifier",
      "enum_specifier",
      "type_definition",
      "preproc_def",
      "preproc_function_def"
    ],
    map: type => {
      if (type === "function_definition") return "function";
      if (type === "enum_specifier") return "enum";
      if (type === "type_definition") return "typedef";
      if (type === "preproc_def" || type === "preproc_function_def") return "macro";
      if (type === "struct_specifier" || type === "class_specifier" || type === "union_specifier") return "struct";
      return null;
    }
  },
  javascript: {
    types: [
      "function_declaration",
      "method_definition",
      "class_declaration",
      "generator_function",
      "lexical_declaration",
      "export_statement",
      "export_clause",
      "arrow_function"
    ],
    map: type => {
      if (type === "function_declaration" || type === "generator_function" || type === "arrow_function") return "function";
      if (type === "method_definition") return "method";
      if (type === "class_declaration") return "class";
      if (type === "lexical_declaration") return "const";
      if (type === "export_statement" || type === "export_clause") return "export";
      return null;
    }
  },
  bash: {
    types: ["function_definition"],
    map: () => "function"
  },
  csharp: {
    types: [
      "method_declaration",
      "class_declaration",
      "struct_declaration",
      "interface_declaration",
      "enum_declaration",
      "constructor_declaration",
      "property_declaration"
    ],
    map: type => {
      if (type === "method_declaration" || type === "constructor_declaration") return "method";
      if (type === "class_declaration") return "class";
      if (type === "struct_declaration") return "struct";
      if (type === "interface_declaration") return "interface";
      if (type === "enum_declaration") return "enum";
      if (type === "property_declaration") return "property";
      return null;
    }
  },
  json: {
    types: ["pair"],
    map: () => "key"
  },
  scala: {
    types: [
      "class_definition",
      "object_definition",
      "trait_definition",
      "method_definition",
      "function_definition",
      "val_definition",
      "var_definition"
    ],
    map: type => {
      if (type === "class_definition") return "class";
      if (type === "object_definition") return "object";
      if (type === "trait_definition") return "trait";
      if (type === "method_definition" || type === "function_definition") return "function";
      if (type === "val_definition") return "val";
      if (type === "var_definition") return "var";
      return null;
    }
  }
};

export function extractNodeName(node) {
  const byField = ["name", "declarator", "declaration", "type"];
  for (const field of byField) {
    const candidate = node.childForFieldName?.(field);
    if (candidate && candidate.text) {
      const identifiers = candidate.descendantsOfType(["identifier", "type_identifier", "field_identifier"]);
      if (identifiers.length) return identifiers[0].text;
      if (candidate.text.trim()) return candidate.text.trim();
    }
  }
  const fallback = node.descendantsOfType(["identifier", "type_identifier", "field_identifier"]);
  return fallback[0]?.text || "<anonymous>";
}

export function buildOutlineModel(tree, file, lang) {
  const outline = [];
  const config = OUTLINE_CONFIGS[lang] || OUTLINE_CONFIGS.c;
  const nodes = tree.rootNode.descendantsOfType(config.types);
  nodes.forEach((node, idx) => {
    const kind = config.map(node.type);
    if (!kind) return;
    const name = lang === "json" ? (node.child(0)?.text || extractNodeName(node)) : extractNodeName(node);
    outline.push({
      kind,
      name,
      line: node.startPosition.row + 1,
      fileId: file.id,
      anchorId: `${file.id}-ts-${kind}-${idx}`
    });
  });
  return outline;
}

export function buildIncludeList(tree, lang, files = []) {
  if (lang !== "c" && lang !== "cpp") return [];
  const includes = [];
  const nodes = tree.rootNode.descendantsOfType("preproc_include");
  nodes.forEach(node => {
    const raw = node.text.trim();
    const match = raw.match(/#\s*include\s*[<"]([^>"]+)[>"]/i);
    const targetPath = match ? match[1] : null;
    let targetFileId = null;
    if (targetPath && raw.includes("\"")) {
      const target = files.find(f => f.path.endsWith(targetPath));
      if (target) targetFileId = target.id;
    }
    includes.push({ raw, targetPath, targetFileId });
  });
  return includes;
}
