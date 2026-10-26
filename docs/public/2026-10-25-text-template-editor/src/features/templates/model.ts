/** GTL is data: definitions never contain executable code or DOM objects. */
export interface Diagnostic {
  severity: "error" | "warning";
  code: string;
  message: string;
  line: number;
  column: number;
}

export interface Placeholder {
  name: string;
  question: string;
  required: boolean;
  input: "text" | "multiline";
  hint: string;
  examples: string[];
  options: { key: string; label: string }[];
  line: number;
}

export type TextPart = { kind: "literal"; text: string } | { kind: "placeholder"; name: string };
export interface TemplateVersion {
  id: string;
  name: string;
  parts: TextPart[];
}
export interface TemplateDefinition {
  name: string;
  source: string;
  versions: TemplateVersion[];
  placeholders: Record<string, Placeholder>;
}
export interface ParseResult {
  template: TemplateDefinition | null;
  diagnostics: Diagnostic[];
}
export const identifierPattern = /^[A-Za-z][A-Za-z0-9_-]*$/;
export function fieldLabel(name: string): string {
  const label = name.replace(/[-_]/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}
export function placeholderNames(version: TemplateVersion): string[] {
  return [
    ...new Set(version.parts.flatMap((part) => (part.kind === "placeholder" ? [part.name] : []))),
  ];
}
