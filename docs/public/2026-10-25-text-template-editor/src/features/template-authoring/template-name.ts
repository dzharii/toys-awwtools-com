import { AppError } from "../../platform/errors";
import { validatedTitle } from "../../platform/ui/titles";

export function templateNameLocation(
  source: string,
): { name: string; start: number; end: number } | null {
  const directives = [...source.matchAll(/^TEMPLATE\b[^\r\n]*/gm)];
  if (directives.length !== 1) return null;
  const directive = directives[0]!;
  const match = /^(TEMPLATE:[ \t]*)(.*?)([ \t]*)$/.exec(directive[0]);
  if (!match || !match[2]?.trim()) return null;
  const start = directive.index! + match[1]!.length;
  return { name: match[2], start, end: start + match[2].length };
}
export function replaceTemplateName(source: string, name: string): string {
  const location = templateNameLocation(source);
  if (!location)
    throw new AppError(
      "AMBIGUOUS_TEMPLATE_NAME",
      "The source needs exactly one unambiguous TEMPLATE: directive. Edit the source instead.",
    );
  return source.slice(0, location.start) + validatedTitle(name) + source.slice(location.end);
}
