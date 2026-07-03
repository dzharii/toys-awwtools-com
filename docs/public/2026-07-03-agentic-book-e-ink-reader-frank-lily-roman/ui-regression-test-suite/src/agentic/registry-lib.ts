/**
 * Shared types + helpers for Agentic Analysis Mode runner scripts.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
/** ui-regression-test-suite root (two levels up from src/agentic). */
export const SUITE_ROOT = resolve(HERE, "../..");

export interface RegistryEntry {
  id: string;
  title: string;
  file: string;
  category: string;
  categoryCode: string;
  line: number;
  tags: string[];
  persona: string[];
  risk: string[];
  lastKnownStatus: string;
}

/** Top-level spec folder -> short category code used in test ids. */
export const CATEGORY_CODES: Record<string, string> = {
  accessibility: "A11Y",
  eink: "EINK",
  files: "FILE",
  journeys: "JOURNEY",
  markdown: "MD",
  metadata: "META",
  navigation: "NAV",
  offline: "OFF",
  pairwise: "PAIR",
  privacy: "PRIV",
  resilience: "RES",
  responsive: "RESP",
  rss: "RSS",
  settings: "SET",
  smoke: "SMOKE",
  txt: "TXT",
};

export function categoryCodeFor(category: string): string {
  return CATEGORY_CODES[category] ?? category.toUpperCase().slice(0, 6);
}

interface RawSpec {
  title: string;
  file: string;
  line: number;
}

interface RawSuite {
  title?: string;
  file?: string;
  line?: number;
  specs?: Array<{ title: string; file: string; line: number }>;
  suites?: RawSuite[];
}

/** Run `playwright test --list --reporter=json` and return every discovered spec. */
export function listPlaywrightTests(): RawSpec[] {
  const result = spawnSync("bun", ["x", "playwright", "test", "--list", "--reporter=json"], {
    cwd: SUITE_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  if (result.status !== 0 && !result.stdout) {
    throw new Error(`playwright --list failed: ${result.stderr || result.error?.message || "unknown error"}`);
  }
  // The JSON may be preceded/followed by stray lines; extract the JSON object.
  const text = result.stdout;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Could not locate JSON in playwright --list output.");
  const json = JSON.parse(text.slice(start, end + 1)) as { suites?: RawSuite[] };

  const specs: RawSpec[] = [];
  const walk = (suite: RawSuite): void => {
    for (const spec of suite.specs ?? []) {
      specs.push({ title: spec.title, file: spec.file, line: spec.line });
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of json.suites ?? []) walk(suite);
  return specs;
}

/** Category (top-level folder) from a spec file path like "settings/settings-boundary.spec.ts". */
export function categoryOf(file: string): string {
  const norm = file.replace(/\\/g, "/");
  return norm.split("/")[0] ?? "unknown";
}

function inferPersona(title: string, category: string): string[] {
  const t = title.toLowerCase();
  const out = new Set<string>();
  if (t.includes("roman") || category === "markdown") out.add("Roman");
  if (t.includes("lily")) out.add("Lily");
  if (t.includes("frank")) out.add("Frank");
  if (category === "accessibility") out.add("Accessibility");
  if (out.size === 0) out.add("Frank");
  return [...out];
}

/** Build the full registry from the live Playwright test list, assigning stable ids. */
export function buildRegistry(): RegistryEntry[] {
  const specs = listPlaywrightTests();
  // Deterministic order: by file, then line, then title.
  specs.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.title.localeCompare(b.title));

  const perCategory = new Map<string, number>();
  return specs.map((spec) => {
    const category = categoryOf(spec.file);
    const code = categoryCodeFor(category);
    const n = (perCategory.get(code) ?? 0) + 1;
    perCategory.set(code, n);
    const id = `${code}-${String(n).padStart(3, "0")}`;
    return {
      id,
      title: spec.title,
      file: `src/specs/${spec.file.replace(/\\/g, "/")}`,
      category,
      categoryCode: code,
      line: spec.line,
      tags: [category],
      persona: inferPersona(spec.title, category),
      risk: [],
      lastKnownStatus: "unknown",
    };
  });
}
