export const DEFAULT_SEARCH_TEMPLATE = "https://www.google.com/search?q={query}";

const BLOCKED_PROTOCOLS = new Set(["javascript:", "data:", "file:", "chrome:", "about:"]);

export function isHttpUrl(value) {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeSearchTemplate(value, fallback = DEFAULT_SEARCH_TEMPLATE) {
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

export function buildSearchUrl(query, template = DEFAULT_SEARCH_TEMPLATE) {
  const normalized = normalizeSearchTemplate(template);
  return normalized.replace("{query}", encodeURIComponent(String(query ?? "").trim()));
}

export function resolveNavigationInput(value, template = DEFAULT_SEARCH_TEMPLATE) {
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

export function deriveHostname(value) {
  try {
    return new URL(String(value ?? "").trim()).hostname;
  } catch {
    return "";
  }
}
