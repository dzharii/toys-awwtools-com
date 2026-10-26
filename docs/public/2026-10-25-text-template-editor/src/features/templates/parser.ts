/**
 * Parses GTL without DOM or storage dependencies.
 *
 * Structural directives are uppercase, declarations are top-level, metadata is
 * indented, and TEXT content must be deeper than its directive. Common text
 * indentation and layout-only edge blank lines are removed; internal whitespace
 * is preserved. Source locations refer to the original (LF-normalized) source.
 *
 * Example: TEMPLATE: Greeting\nTEXT:\n  Hello {{$name}}.\n$name: Who is it for?
 * Recoverable diagnostics accumulate, but any error makes the template unusable.
 */
import { fieldLabel, identifierPattern, placeholderNames } from "./model";
import type { Diagnostic, ParseResult, Placeholder, TemplateVersion, TextPart } from "./model";

export function parseTemplate(raw: string): ParseResult {
  const source = raw.replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
  const lines = source.split("\n");
  const diagnostics: Diagnostic[] = [];
  const placeholders: Record<string, Placeholder> = Object.create(null);
  const versions: TemplateVersion[] = [];
  let name = "";
  let templateSeen = false;
  let currentVersion: TemplateVersion | null = null;
  let field: Placeholder | null = null;
  let hasTopText = false;
  let hasVersions = false;
  const blocks = new Set<TemplateVersion>();
  const used = new Map<string, { line: number; column: number }>();
  const metadataSeen = new Map<Placeholder, Set<string>>();
  const report = (
    code: string,
    message: string,
    line: number,
    column = 1,
    severity: Diagnostic["severity"] = "error",
  ) => diagnostics.push({ code, message, line, column, severity });

  function parseParts(text: string, locations: { line: number; column: number }[]): TextPart[] {
    const parts: TextPart[] = [];
    let cursor = 0;
    const matcher = /\{\{([\s\S]*?)\}\}|\{\{[^]*$/g;
    for (const match of text.matchAll(matcher)) {
      const offset = match.index;
      if (offset > cursor) parts.push({ kind: "literal", text: text.slice(cursor, offset) });
      const before = text.slice(0, offset).split("\n");
      const location = locations[before.length - 1] ?? { line: 1, column: 1 };
      const column = location.column + (before.at(-1)?.length ?? 0);
      const body = match[1];
      if (body === undefined) {
        report(
          "UNCLOSED_REFERENCE",
          "Unclosed placeholder reference. Use {{$name}}.",
          location.line,
          column,
        );
      } else if (!body.startsWith("$") || !identifierPattern.test(body.slice(1))) {
        report(
          "INVALID_REFERENCE",
          "Expected {{$name}} with an ASCII identifier.",
          location.line,
          column,
        );
      } else {
        const reference = body.slice(1);
        parts.push({ kind: "placeholder", name: reference });
        if (!used.has(reference)) used.set(reference, { line: location.line, column });
      }
      cursor = offset + match[0].length;
    }
    if (cursor < text.length) parts.push({ kind: "literal", text: text.slice(cursor) });
    return parts;
  }

  for (let index = 0; index < lines.length; index++) {
    const original = lines[index] ?? "";
    const trimmed = original.trim();
    if (!trimmed) continue;
    const indent = original.length - original.trimStart().length;
    const line = index + 1;
    if (original.slice(0, indent).includes("\t")) {
      report("TAB_INDENTATION", "Use spaces for structural indentation.", line);
    }
    const templateMatch = /^TEMPLATE:\s*(.*)$/.exec(trimmed);
    if (templateMatch && indent === 0) {
      if (templateSeen) report("DUPLICATE_TEMPLATE", "Declare TEMPLATE only once.", line);
      templateSeen = true;
      name = templateMatch[1]?.trim() ?? "";
      if (!name) report("MISSING_NAME", "Template name required.", line);
      field = null;
      continue;
    }
    const versionMatch = /^VERSION:\s*(.*)$/.exec(trimmed);
    if (versionMatch && indent === 0) {
      const versionName = versionMatch[1]?.trim() ?? "";
      if (!versionName) report("MISSING_VERSION_NAME", "Version name required.", line);
      if (versions.some((version) => version.name === versionName))
        report("DUPLICATE_VERSION", "Version name must be unique.", line);
      if (hasTopText) report("MIXED_TEXT", "Use top-level TEXT or VERSION blocks, not both.", line);
      hasVersions = true;
      currentVersion = { id: `version-${versions.length + 1}`, name: versionName, parts: [] };
      versions.push(currentVersion);
      field = null;
      continue;
    }
    if (trimmed === "TEXT:") {
      field = null;
      if (indent === 0) {
        if (hasVersions)
          report("MIXED_TEXT", "A version's TEXT must be indented under VERSION.", line);
        hasTopText = true;
        if (!currentVersion || hasVersions) {
          currentVersion = { id: "default", name: name || "Default", parts: [] };
          versions.push(currentVersion);
        }
      } else if (!hasVersions || !currentVersion) {
        report("TEXT_SCOPE", "Indented TEXT must belong to a VERSION.", line);
      }
      const content: { text: string; line: number }[] = [];
      let next = index + 1;
      while (next < lines.length) {
        const candidate = lines[next] ?? "";
        const candidateIndent = candidate.length - candidate.trimStart().length;
        if (candidate.trim() && candidateIndent <= indent) break;
        content.push({ text: candidate, line: next + 1 });
        next++;
      }
      index = next - 1;
      while (content.length && !content[0]?.text.trim()) content.shift();
      while (content.length && !content.at(-1)?.text.trim()) content.pop();
      const common = Math.min(
        ...content
          .filter((item) => item.text.trim())
          .map((item) => item.text.length - item.text.trimStart().length),
      );
      const text = content
        .map((item) => (item.text.trim() ? item.text.slice(common) : ""))
        .join("\n");
      if (!text.trim()) report("EMPTY_TEXT", "Text block is empty.", line);
      if (currentVersion) {
        if (blocks.has(currentVersion))
          report("DUPLICATE_TEXT", "A version has exactly one TEXT block.", line);
        blocks.add(currentVersion);
        currentVersion.parts = parseParts(
          text,
          content.map((item) => ({ line: item.line, column: common + 1 })),
        );
      }
      continue;
    }
    const declaration = /^\$([A-Za-z][A-Za-z0-9_-]*)( OPTIONAL)?:\s*(.*)$/.exec(trimmed);
    if (declaration && indent === 0) {
      const fieldName = declaration[1]!;
      if (Object.hasOwn(placeholders, fieldName))
        report("DUPLICATE_PLACEHOLDER", "Placeholder declared more than once.", line);
      field = {
        name: fieldName,
        question: declaration[3]?.trim() || `Enter ${fieldLabel(fieldName).toLowerCase()}.`,
        required: !declaration[2],
        input: "text",
        hint: "",
        examples: [],
        options: [],
        line,
      };
      placeholders[fieldName] = field;
      metadataSeen.set(field, new Set());
      continue;
    }
    const metadata = /^(HINT|EXAMPLE|INPUT):\s*(.*)$/.exec(trimmed);
    const option = /^OPTION\s+([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/.exec(trimmed);
    if ((metadata || option) && field && indent > 0) {
      const seen = metadataSeen.get(field)!;
      if (option) {
        const key = option[1]!;
        if (field.options.some((item) => item.key === key))
          report("DUPLICATE_OPTION", "Option key must be unique.", line, indent + 1);
        field.options.push({ key, label: option[2]!.trim() });
      } else if (metadata) {
        const directive = metadata[1]!;
        const value = metadata[2]?.trim() ?? "";
        if (directive !== "EXAMPLE" && seen.has(directive))
          report("DUPLICATE_METADATA", `${directive} may be declared only once.`, line, indent + 1);
        seen.add(directive);
        if (directive === "HINT") field.hint = value;
        if (directive === "EXAMPLE") field.examples.push(value);
        if (directive === "INPUT") {
          if (value !== "multiline")
            report("INVALID_INPUT", "Supported INPUT type is multiline.", line, indent + 1);
          else field.input = "multiline";
        }
      }
      continue;
    }
    report(
      trimmed.startsWith("OPTION") ? "INVALID_OPTION" : "UNKNOWN_DIRECTIVE",
      trimmed.startsWith("OPTION")
        ? "Expected OPTION key: Display label under a placeholder."
        : "Unknown directive or invalid indentation.",
      line,
      indent + 1,
    );
    field = null;
  }

  if (!templateSeen)
    report("MISSING_TEMPLATE", "Template name required. Start with TEMPLATE: Name.", 1);
  if (!versions.length) report("MISSING_TEXT", "Declare TEXT or one or more VERSION blocks.", 1);
  for (const version of versions) {
    if (!blocks.has(version))
      report("MISSING_VERSION_TEXT", `Version "${version.name}" needs a TEXT block.`, 1);
  }
  for (const [reference, location] of used) {
    if (!Object.hasOwn(placeholders, reference)) {
      placeholders[reference] = {
        name: reference,
        question: `Enter ${fieldLabel(reference).toLowerCase()}.`,
        required: true,
        input: "text",
        hint: "",
        examples: [],
        options: [],
        line: location.line,
      };
      report(
        "UNDECLARED_PLACEHOLDER",
        `Add guidance with $${reference}: Question`,
        location.line,
        location.column,
        "warning",
      );
    }
  }
  const referenced = new Set(versions.flatMap(placeholderNames));
  for (const placeholder of Object.values(placeholders)) {
    if (!referenced.has(placeholder.name))
      report(
        "UNUSED_PLACEHOLDER",
        `$${placeholder.name} is declared but unused.`,
        placeholder.line,
        1,
        "warning",
      );
    if (placeholder.input === "multiline" && placeholder.options.length)
      report(
        "INCOMPATIBLE_INPUT",
        "A multiline field cannot have OPTION choices.",
        placeholder.line,
      );
  }
  return {
    template: diagnostics.some((item) => item.severity === "error")
      ? null
      : { name, source, versions, placeholders },
    diagnostics,
  };
}
