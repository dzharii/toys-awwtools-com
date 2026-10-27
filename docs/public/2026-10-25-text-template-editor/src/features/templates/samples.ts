import { placeholderNames } from "./model";
import type { TemplateDefinition, TemplateVersion } from "./model";
import { renderTemplate } from "./renderer";

export function sampleOutput(
  template: TemplateDefinition,
  version: TemplateVersion,
  fixture: Readonly<Record<string, string>> = {},
) {
  const answers: Record<string, string> = {};
  for (const name of placeholderNames(version)) {
    const field = template.placeholders[name]!;
    const example = fixture[name] ?? field.examples.find((value) => !!value.trim());
    if (field.options.length) {
      const option =
        field.options.find((item) => item.key === example || item.label === example) ??
        field.options.find((item) => !!item.label.trim());
      if (option) answers[name] = option.key;
    } else if (example?.trim()) answers[name] = example;
  }
  return renderTemplate(template, version, answers);
}
export function structuralExcerpt(version: TemplateVersion): string {
  return version.parts
    .map((part) => (part.kind === "literal" ? part.text : `$${part.name}`))
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}
