// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

const ALLOWED_TAGS = new Set([
  "A", "ABBR", "B", "BLOCKQUOTE", "BR", "CODE", "DD", "DIV", "DL", "DT", "EM",
  "H1", "H2", "H3", "H4", "H5", "H6", "HR", "I", "IMG", "LI", "OL", "P",
  "PRE", "S", "SPAN", "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TD", "TFOOT",
  "TH", "THEAD", "TR", "U", "UL"
]);

const GLOBAL_ATTRS = new Set(["title", "aria-label", "aria-hidden", "role", "data-preview-layout", "data-preview-role"]);
const TABLE_ATTRS = new Set(["colspan", "rowspan"]);
const TASK_CHECKBOX_ATTRS = new Set(["type", "class", "checked", "disabled", "aria-label"]);

export interface SanitizeHtmlOptions {
  links?: "safe" | "plain";
  images?: "constrained" | "hidden";
  allowedClasses?: string[];
  taskCheckboxes?: boolean;
}

interface NormalizedSanitizeHtmlOptions {
  links: "safe" | "plain";
  images: "constrained" | "hidden";
  allowedClasses: Set<string>;
  taskCheckboxes: boolean;
}

interface PreservedHtml {
  placeholder: string;
  sanitizedTag: string;
}

function isSafeUrl(value: unknown): boolean {
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

function sanitizeClassValue(value: unknown, allowedClasses: Set<string>): string {
  if (!(allowedClasses instanceof Set) || allowedClasses.size === 0) return "";
  return String(value ?? "")
    .split(/\s+/)
    .filter((className) => allowedClasses.has(className))
    .join(" ");
}

function escapeHtmlAttribute(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isSafeTaskCheckbox(element: Element, options: NormalizedSanitizeHtmlOptions): boolean {
  if (!options.taskCheckboxes || element.tagName !== "INPUT") return false;
  const type = String(element.getAttribute("type") ?? "").toLowerCase();
  const className = String(element.getAttribute("class") ?? "");
  const classNames = className.split(/\s+/).filter(Boolean);
  return type === "checkbox" && classNames.includes("task-list-item-checkbox");
}

function sanitizeTaskCheckbox(element: HTMLInputElement, options: NormalizedSanitizeHtmlOptions): void {
  for (const attr of [...element.attributes]) {
    const name = attr.name.toLowerCase();

    if (!TASK_CHECKBOX_ATTRS.has(name) || name.startsWith("on") || name === "style") {
      element.removeAttribute(attr.name);
      continue;
    }

    if (name === "class") {
      const sanitizedClass = sanitizeClassValue(attr.value, options.allowedClasses);
      if (sanitizedClass) {
        element.setAttribute(attr.name, sanitizedClass);
      } else {
        element.removeAttribute(attr.name);
      }
    }
  }

  element.setAttribute("type", "checkbox");
  element.disabled = true;
}

function sanitizeElement(element: Element, options: NormalizedSanitizeHtmlOptions): void {
  for (const child of [...element.children]) sanitizeElement(child, options);

  if (element.tagName === "INPUT") {
    if (isSafeTaskCheckbox(element, options)) {
      sanitizeTaskCheckbox(element as HTMLInputElement, options);
    } else {
      element.remove();
    }
    return;
  }

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

    if (name === "class") {
      const sanitizedClass = sanitizeClassValue(value, options.allowedClasses);
      if (sanitizedClass) {
        element.setAttribute(attr.name, sanitizedClass);
      } else {
        element.removeAttribute(attr.name);
      }
      continue;
    }

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

function sanitizeWithDomParser(html: unknown, options: NormalizedSanitizeHtmlOptions): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${String(html ?? "")}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";
  sanitizeElement(root, options);
  return root.innerHTML;
}

function getTagAttributeValue(tag: unknown, attrName: string): string {
  const attrPattern = new RegExp(`\\s${attrName}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "i");
  const match = String(tag ?? "").match(attrPattern);
  if (!match) return "";
  const rawValue = match[1] ?? "";
  if (
    (rawValue.startsWith("\"") && rawValue.endsWith("\"")) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }
  return rawValue;
}

function hasBooleanTagAttribute(tag: unknown, attrName: string): boolean {
  const attrPattern = new RegExp(`\\s${attrName}(?:\\s*=|\\s|>|/)`, "i");
  return attrPattern.test(String(tag ?? ""));
}

function sanitizeTaskCheckboxTag(tag: string, options: NormalizedSanitizeHtmlOptions): string | null {
  if (!options.taskCheckboxes) return null;
  const type = getTagAttributeValue(tag, "type").toLowerCase();
  const sanitizedClass = sanitizeClassValue(getTagAttributeValue(tag, "class"), options.allowedClasses);
  const classes = sanitizedClass.split(/\s+/).filter(Boolean);
  if (type !== "checkbox" || !classes.includes("task-list-item-checkbox")) return null;

  const checkedAttribute = hasBooleanTagAttribute(tag, "checked") ? " checked" : "";
  const ariaLabel = getTagAttributeValue(tag, "aria-label");
  const ariaLabelAttribute = ariaLabel
    ? ` aria-label="${escapeHtmlAttribute(ariaLabel)}"`
    : "";

  return `<input class="${escapeHtmlAttribute(sanitizedClass)}" type="checkbox"${checkedAttribute} disabled${ariaLabelAttribute}>`;
}

function preserveSafeTaskCheckboxes(html: unknown, options: NormalizedSanitizeHtmlOptions): { html: string; preserved: PreservedHtml[] } {
  if (!options.taskCheckboxes) return { html: String(html ?? ""), preserved: [] };
  const preserved: PreservedHtml[] = [];
  const nextHtml = String(html ?? "").replace(/<input\b[^>]*>/gi, (tag) => {
    const sanitizedTag = sanitizeTaskCheckboxTag(tag, options);
    if (!sanitizedTag) return tag;
    const placeholder = `@@RETROOS_SAFE_TASK_CHECKBOX_${preserved.length}@@`;
    preserved.push({ placeholder, sanitizedTag });
    return placeholder;
  });
  return { html: nextHtml, preserved };
}

function restoreSafeTaskCheckboxes(html: string, preserved: PreservedHtml[]): string {
  return preserved.reduce((nextHtml, item) => {
    return nextHtml.replaceAll(item.placeholder, item.sanitizedTag);
  }, html);
}

function sanitizeWithoutDomParser(html: unknown, options: NormalizedSanitizeHtmlOptions): string {
  const safeTaskCheckboxes = preserveSafeTaskCheckboxes(html, options);
  const sanitized = safeTaskCheckboxes.html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*("|')?\s*javascript:[^"'\s>]*/gi, "")
    .replace(/<\/?(iframe|object|embed|form|input|button|meta|link)[^>]*>/gi, "");
  return restoreSafeTaskCheckboxes(sanitized, safeTaskCheckboxes.preserved);
}

/** Removes active content while preserving the small markup subset components can render. */
export function sanitizeHtml(html: unknown, options: SanitizeHtmlOptions = {}): string {
  const normalized = {
    links: options.links || "safe",
    images: options.images || "constrained",
    allowedClasses: new Set(Array.isArray(options.allowedClasses) ? options.allowedClasses : []),
    taskCheckboxes: options.taskCheckboxes === true
  };

  if (typeof DOMParser !== "undefined") return sanitizeWithDomParser(html, normalized);

  // DEV-NOTE: Node and some constrained hosts do not expose DOMParser. This
  // fallback is conservative enough for tests and basic cleanup, but browser
  // callers should prefer the DOMParser path or a mature sanitizer before
  // accepting arbitrary untrusted HTML at scale.
  return sanitizeWithoutDomParser(html, normalized);
}
