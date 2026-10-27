import type { ManifestEntry } from "./loader";
import type { TemplateDefinition } from "./model";

export interface IndexedTemplate {
  entry: ManifestEntry;
  template: TemplateDefinition;
  order: number;
}
export interface TemplateMatch extends IndexedTemplate {
  score: number;
  reason: string;
}
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}
function near(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length <= b.length) j++;
    if (a.length >= b.length) i++;
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}
function excerpt(text: string, term: string): string {
  const position = text.indexOf(term);
  const start = Math.max(0, position - 40);
  const end = Math.min(text.length, position + 80);
  return `${start ? "... " : ""}${text.slice(start, end)}${end < text.length ? " ..." : ""}`;
}
export function searchTemplates(index: IndexedTemplate[], query: string): TemplateMatch[] {
  const normalized = normalizeSearch(query);
  if (!normalized)
    return index
      .map((item) => ({ ...item, score: 0, reason: "" }))
      .sort((a, b) => a.order - b.order || a.entry.id.localeCompare(b.entry.id));
  const terms = normalized
    .split(" ")
    .slice(0, 12)
    .map((term) => term.slice(0, 64));
  const result: TemplateMatch[] = [];
  for (const item of index) {
    const title = normalizeSearch(item.entry.name);
    const versions = item.template.versions.map((version) => ({
      name: version.name,
      text: normalizeSearch(version.name),
    }));
    const fields = [
      { text: title, weight: 900, reason: "" },
      {
        text: versions.map((version) => version.text).join(" "),
        weight: 700,
        reason: "Matches a writing style",
      },
      {
        text: normalizeSearch(`${item.entry.description} ${item.entry.category}`),
        weight: 500,
        reason: "Matches description or category",
      },
      {
        text: normalizeSearch(
          item.template.versions
            .flatMap((version) =>
              version.parts.flatMap((part) => (part.kind === "literal" ? [part.text] : [])),
            )
            .join(" "),
        ),
        weight: 300,
        reason: "Matches template text",
      },
      {
        text: normalizeSearch(
          Object.values(item.template.placeholders)
            .flatMap((field) => [
              field.question,
              field.hint,
              ...field.examples,
              ...field.options.flatMap((option) => [option.key, option.label]),
            ])
            .join(" "),
        ),
        weight: 150,
        reason: "Matches examples or guidance",
      },
    ];
    let score = 0,
      matched = 0,
      reason = "";
    for (const term of terms) {
      const match = fields.find((field) =>
        field.text.split(" ").some((word) => word === term || word.startsWith(term)),
      );
      if (match) {
        matched++;
        score += match.weight;
        if (match.reason && !reason) reason = `${match.reason}: ${excerpt(match.text, term)}`;
      } else if (terms.length <= 6) {
        const fuzzy = fields.find((field) =>
          field.text.split(" ").some((word) => near(term, word)),
        );
        if (fuzzy) {
          matched++;
          score += fuzzy.weight / 10;
          reason ||= fuzzy.weight === 900 ? "Similar template title" : "Similar wording";
        }
      }
    }
    if (!matched) continue;
    if (matched === terms.length) score += 2000;
    if (title === normalized) score += 10000;
    else if (title.startsWith(normalized)) score += 9500;
    else if (terms.every((term) => title.split(" ").includes(term))) score += 9000;
    else {
      const version = versions.find((version) =>
        terms.every((term) => version.text.split(" ").includes(term)),
      );
      if (version) {
        score += 8000;
        reason = `Style: ${version.name}`;
      }
    }
    result.push({ ...item, score, reason });
  }
  return result.sort(
    (a, b) => b.score - a.score || a.order - b.order || a.entry.id.localeCompare(b.entry.id),
  );
}
