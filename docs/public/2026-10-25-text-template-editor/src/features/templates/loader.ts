/** Fetches only local manifest assets; definitions are cached, snapshots are independent. */
import { AppError, isRecord } from "../../platform/errors";
import { parseTemplate } from "./parser";
import type { TemplateDefinition } from "./model";

export interface ManifestEntry {
  id: string;
  name: string;
  description: string;
  file: string;
  category: string;
}
export function validateManifest(value: unknown): ManifestEntry[] {
  if (!isRecord(value) || !Array.isArray(value.templates))
    throw new AppError("INVALID_MANIFEST", "The template manifest is invalid.");
  const entries: ManifestEntry[] = [];
  for (const item of value.templates) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      !/^[a-z][a-z0-9-]*$/.test(item.id) ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      typeof item.description !== "string" ||
      typeof item.category !== "string" ||
      typeof item.file !== "string" ||
      !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.gtl$/.test(item.file) ||
      entries.some((entry) => entry.id === item.id)
    )
      throw new AppError("INVALID_MANIFEST", "A template manifest entry is invalid or duplicated.");
    entries.push({
      id: item.id,
      name: item.name,
      description: item.description,
      file: item.file,
      category: item.category,
    });
  }
  if (!entries.length) throw new AppError("EMPTY_MANIFEST", "No templates are registered.");
  return entries;
}
export class TemplateLoader {
  entries: ManifestEntry[] = [];
  private cache = new Map<string, TemplateDefinition>();
  async initialize(): Promise<void> {
    const response = await fetch(new URL("templates/manifest.json", document.baseURI));
    if (!response.ok)
      throw new AppError(
        "TEMPLATE_LOAD_FAILED",
        "Could not load templates. Check the static site files and retry.",
      );
    this.entries = validateManifest(await response.json());
  }
  async load(id: string): Promise<TemplateDefinition> {
    const cached = this.cache.get(id);
    if (cached) return structuredClone(cached);
    const entry = this.entries.find((item) => item.id === id);
    if (!entry) throw new AppError("TEMPLATE_NOT_FOUND", "This template is not registered.");
    const response = await fetch(new URL(`templates/${entry.file}`, document.baseURI));
    if (!response.ok)
      throw new AppError(
        "TEMPLATE_LOAD_FAILED",
        `Could not load ${entry.name}. Retry when the site is available.`,
      );
    const parsed = parseTemplate(await response.text());
    if (!parsed.template)
      throw new AppError(
        "INVALID_TEMPLATE",
        `${entry.name} contains invalid GTL. Open its source in Template Authoring.`,
      );
    this.cache.set(id, parsed.template);
    return structuredClone(parsed.template);
  }
}
