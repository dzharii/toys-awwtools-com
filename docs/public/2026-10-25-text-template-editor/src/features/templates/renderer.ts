/** Pure substitution; choices store keys but render labels. No HTML is evaluated. */
import { placeholderNames } from "./model";
import type { Placeholder, TemplateDefinition, TemplateVersion } from "./model";

export function displayedAnswer(
  placeholder: Placeholder,
  answer: string | undefined,
): string | undefined {
  if (typeof answer !== "string" || !answer.trim()) return undefined;
  if (placeholder.options.length)
    return placeholder.options.find((option) => option.key === answer)?.label;
  return answer;
}
export function renderTemplate(
  template: TemplateDefinition,
  version: TemplateVersion,
  answers: Readonly<Record<string, string>>,
) {
  const unresolved = placeholderNames(version).filter((name) => {
    const field = template.placeholders[name]!;
    const answer = answers[name];
    const invalidChoice =
      typeof answer === "string" &&
      !!answer.trim() &&
      field.options.length > 0 &&
      displayedAnswer(field, answer) === undefined;
    return invalidChoice || (field.required && displayedAnswer(field, answer) === undefined);
  });
  const resolvedParts = version.parts.map((part) =>
    part.kind === "literal"
      ? part.text
      : displayedAnswer(template.placeholders[part.name]!, answers[part.name]),
  );
  const text = resolvedParts
    .map((value, index) => {
      if (value !== undefined) return value;
      const part = version.parts[index]!;
      return part.kind === "placeholder" && template.placeholders[part.name]!.required
        ? `[${part.name}]`
        : "";
    })
    .join("");
  // Count generated content, not the unresolved markers used only for display.
  // Authored marker-like text remains ordinary content.
  const wordCount = resolvedParts
    .join("")
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  return { text, unresolved, canCopy: unresolved.length === 0, wordCount };
}
