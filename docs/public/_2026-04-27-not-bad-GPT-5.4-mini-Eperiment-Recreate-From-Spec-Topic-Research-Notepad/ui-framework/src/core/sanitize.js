const ALLOWED_TAGS = new Set([
  "A", "ABBR", "B", "BLOCKQUOTE", "BR", "CODE", "DD", "DIV", "DL", "DT", "EM",
  "H1", "H2", "H3", "H4", "H5", "H6", "HR", "I", "IMG", "LI", "OL", "P",
  "PRE", "S", "SPAN", "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TFOOT",
  "TH", "THEAD", "TR", "U", "UL"
]);

const GLOBAL_ATTRS = new Set(["title", "aria-label", "aria-hidden", "role"]);
const TABLE_ATTRS = new Set(["colspan", "rowspan"]);

function isSafeUrl(value) {
  const trimmed = String(value ?? "").trim().replace(/[\u0000-\u001f\s]+/g, "");
  if (!trimmed) return true;
  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) return true;
  try {
    const url = new URL(trimmed, "https://example.invalid/");
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeElement(element, options) {
  for (const child of [...element.children]) sanitizeElement(child, options);

  if (!ALLOWED_TAGS.has(element.tagName)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (element.tagName === "IMG" && options.images === "hidden") {
    element.remove();
    return;
  }

  for (const attr of [...element.attributes]) {
    const name = attr.name.toLowerCase();
    const value = attr.value;
    const isTableAttr = TABLE_ATTRS.has(name) && ["TD", "TH"].includes(element.tagName);
    const keep =
      GLOBAL_ATTRS.has(name) ||
      isTableAttr ||
      (element.tagName === "A" && ["href", "target", "rel"].includes(name)) ||
      (element.tagName === "IMG" && ["src", "alt", "width", "height"].includes(name));

    if (!keep || name.startsWith("on") || name === "style") {
      element.removeAttribute(attr.name);
      continue;
    }

    if ((name === "href" || name === "src") && !isSafeUrl(value)) {
      element.removeAttribute(attr.name);
    }
  }

  if (element.tagName === "A") {
    if (element.hasAttribute("href") && options.links !== "plain") {
      element.setAttribute("rel", "noopener noreferrer");
      element.setAttribute("target", "_blank");
    } else if (options.links === "plain") {
      element.removeAttribute("href");
    }
  }
}

function sanitizeWithDomParser(html, options) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${String(html ?? "")}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  sanitizeElement(root, options);
  return root.innerHTML;
}

function sanitizeWithoutDomParser(html) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]*/gi, "")
    .replace(/<\/?(iframe|object|embed|form|input|button|meta|link)[^>]*>/gi, "");
}

export function sanitizeHtml(html, options = {}) {
  const normalized = {
    links: options.links || "safe",
    images: options.images || "constrained"
  };

  if (typeof DOMParser !== "undefined") return sanitizeWithDomParser(html, normalized);

  // DEV-NOTE: Node and some constrained hosts do not expose DOMParser. This
  // fallback is conservative enough for tests and basic cleanup, but browser
  // callers should prefer the DOMParser path or a mature sanitizer before
  // accepting arbitrary untrusted HTML at scale.
  return sanitizeWithoutDomParser(html);
}
