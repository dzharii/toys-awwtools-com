// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

export const DEFAULT_SEARCH_TEMPLATE = "https://www.google.com/search?q={query}";

const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "file:", "chrome:", "about:"]);

export type NavigationDecision =
  | { kind: "ignore"; input: string }
  | { kind: "navigate_url"; input: string; targetUrl: string }
  | { kind: "blocked_protocol"; input: string; protocol: string }
  | { kind: "search"; input: string; query: string; targetUrl: string };

export function isHttpUrl(value: unknown): boolean {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Accepts only HTTP(S) search templates with a query placeholder. */
export function normalizeSearchTemplate(value: unknown, fallback = DEFAULT_SEARCH_TEMPLATE): string {
  const template = String(value || "").trim();
  if (!template || !template.includes("{query}")) return fallback;
  try {
    const probe = template.replace("{query}", "test");
    const url = new URL(probe);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return template;
  } catch {
    return fallback;
  }
}

export function buildSearchUrl(query: unknown, template = DEFAULT_SEARCH_TEMPLATE): string {
  const normalized = normalizeSearchTemplate(template);
  return normalized.replace("{query}", encodeURIComponent(String(query ?? "").trim()));
}

/** Classifies free-form navigation text as a URL, blocked protocol, search, or no-op. */
export function resolveNavigationInput(value: unknown, template = DEFAULT_SEARCH_TEMPLATE): NavigationDecision {
  const input = String(value ?? "").trim();
  if (!input) return { kind: "ignore", input };

  try {
    const parsed = new URL(input);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { kind: "navigate_url", input, targetUrl: parsed.href };
    }
    if (BLOCKED_PROTOCOLS.has(parsed.protocol)) {
      return { kind: "blocked_protocol", input, protocol: parsed.protocol };
    }
  } catch {
    // Continue through hostname and search handling.
  }

  if (/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(input)) {
    try {
      return { kind: "navigate_url", input, targetUrl: new URL(`https://${input}`).href };
    } catch {
      return { kind: "search", input, query: input, targetUrl: buildSearchUrl(input, template) };
    }
  }

  return { kind: "search", input, query: input, targetUrl: buildSearchUrl(input, template) };
}

export function deriveHostname(value: unknown): string {
  try {
    return new URL(String(value ?? "").trim()).hostname;
  } catch {
    return "";
  }
}
