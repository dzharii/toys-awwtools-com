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
  const text = version.parts
    .map((part) => {
      if (part.kind === "literal") return part.text;
      const field = template.placeholders[part.name]!;
      return displayedAnswer(field, answers[part.name]) ?? (field.required ? `[${part.name}]` : "");
    })
    .join("");
  return { text, unresolved, canCopy: unresolved.length === 0 };
}
