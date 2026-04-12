import {
  excerpt,
  normalizeWhitespace,
  rectArea,
  rectFrom,
  safeLower,
} from "./utils.js";

const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "textbox",
  "searchbox",
  "combobox",
  "checkbox",
  "radio",
  "tab",
  "menuitem",
  "option",
  "switch",
  "slider",
  "spinbutton",
  "listbox",
]);

const LANDMARK_ROLES = new Set([
  "navigation",
  "dialog",
  "toolbar",
  "main",
  "feed",
  "log",
  "banner",
  "contentinfo",
  "complementary",
  "form",
]);

const ACTION_WORD_RE =
  /\b(send|submit|save|attach|upload|new|add|create|reply|search|open|close|edit|delete|menu|more)\b/i;
const TIMESTAMP_RE =
  /\b(?:\d{1,2}:\d{2}(?:\s?[ap]m)?|yesterday|today|just now|\d+\s?(?:m|h|d)\s+ago)\b/i;

export function isNativeInteractableTag(tagName) {
  return new Set([
    "button",
    "input",
    "textarea",
    "select",
    "option",
    "a",
    "summary",
    "label",
  ]).has(String(tagName ?? "").toLowerCase());
}

export function isInteractiveRole(role) {
  return INTERACTIVE_ROLES.has(String(role ?? "").toLowerCase());
}

export function isLandmarkRole(role) {
  return LANDMARK_ROLES.has(String(role ?? "").toLowerCase());
}

export function readRect(element) {
  if (typeof element?.getBoundingClientRect === "function") {
    return rectFrom(element.getBoundingClientRect());
  }

  return rectFrom(element?.rect ?? element?.boundingRect ?? {});
}

export function readAttribute(element, name) {
  if (!element) {
    return null;
  }

  if (typeof element.getAttribute === "function") {
    return element.getAttribute(name);
  }

  if (element.attributes && name in element.attributes) {
    return element.attributes[name];
  }

  return element[name] ?? null;
}

function readLabelledByText(element, ownerDocument) {
  const labelledBy = normalizeWhitespace(readAttribute(element, "aria-labelledby"));
  if (!labelledBy || !ownerDocument || typeof ownerDocument.getElementById !== "function") {
    return "";
  }

  return normalizeWhitespace(
    labelledBy
      .split(/\s+/)
      .map((id) => ownerDocument.getElementById(id))
      .filter(Boolean)
      .map((node) => node.textContent ?? node.innerText ?? "")
      .join(" "),
  );
}

function readAssociatedLabelText(element, ownerDocument) {
  if (Array.isArray(element?.labels) && element.labels.length) {
    return normalizeWhitespace(
      element.labels.map((label) => label.textContent ?? label.innerText ?? "").join(" "),
    );
  }

  const id = normalizeWhitespace(readAttribute(element, "id"));
  if (!id || !ownerDocument || typeof ownerDocument.querySelectorAll !== "function") {
    return "";
  }

  const labels = Array.from(ownerDocument.querySelectorAll(`label[for="${id}"]`) ?? []);
  return normalizeWhitespace(labels.map((label) => label.textContent ?? "").join(" "));
}

export function computeAccessibleName(element, ownerDocument = element?.ownerDocument) {
  const candidates = [
    readAttribute(element, "aria-label"),
    readLabelledByText(element, ownerDocument),
    readAssociatedLabelText(element, ownerDocument),
    readAttribute(element, "placeholder"),
    readAttribute(element, "title"),
    readAttribute(element, "alt"),
    element?.innerText,
    element?.textContent,
  ];

  return candidates.map(normalizeWhitespace).find(Boolean) ?? "";
}

export function getElementTextSnippet(element, maxLength = 120) {
  return excerpt(element?.innerText ?? element?.textContent ?? "", maxLength);
}

export function isElementDisabled(element) {
  const hasDisabledAttribute =
    typeof element?.hasAttribute === "function" && element.hasAttribute("disabled");
  const disabled = readAttribute(element, "disabled");
  const ariaDisabled = safeLower(readAttribute(element, "aria-disabled"));
  return hasDisabledAttribute || Boolean(disabled) || ariaDisabled === "true" || Boolean(element?.inert);
}

export function isElementVisible(element) {
  if (element?.visible === false || element?.hidden === true) {
    return false;
  }

  const rect = readRect(element);
  if (!rectArea(rect)) {
    return false;
  }

  const style =
    element?.computedStyle ??
    element?.ownerDocument?.defaultView?.getComputedStyle?.(element) ??
    null;
  if (style) {
    const opacity = typeof style.opacity === "string" ? style.opacity.trim() : style.opacity;
    const isTransparent =
      opacity !== "" &&
      opacity !== null &&
      typeof opacity !== "undefined" &&
      Number(opacity) === 0;
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      isTransparent
    ) {
      return false;
    }
  }

  return true;
}

export function isScrollableElement(element, rect = readRect(element)) {
  if (element?.scrollable === true) {
    return true;
  }

  return (
    Number(element?.scrollHeight ?? 0) > Number(element?.clientHeight ?? rect.height) + 12 ||
    Number(element?.scrollWidth ?? 0) > Number(element?.clientWidth ?? rect.width) + 12
  );
}

function collectNamedAttributes(element, prefix) {
  const result = {};
  const entries = collectAttributeEntries(element);
  for (const [name, rawValue] of entries) {
    if (!name.startsWith(prefix)) {
      continue;
    }
    const value = normalizeWhitespace(rawValue);
    if (value) {
      result[name] = value;
    }
  }

  return result;
}

function collectAttributeEntries(element) {
  const attributes = element?.attributes;
  if (!attributes) {
    return [];
  }

  if (typeof attributes[Symbol.iterator] === "function") {
    return Array.from(attributes)
      .map((attribute) => [attribute?.name, attribute?.value])
      .filter(([name]) => typeof name === "string");
  }

  return Object.entries(attributes).map(([name, rawValue]) => {
    if (rawValue && typeof rawValue === "object" && "name" in rawValue && "value" in rawValue) {
      return [rawValue.name, rawValue.value];
    }

    return [name, rawValue];
  });
}

function collectDescendantSummaries(element) {
  const descendants = getDescendants(element);
  if (!descendants.length) {
    return {
      descendantTagNames: [],
      descendantRoles: [],
      containsEditable: false,
      containsButtons: false,
      containsLinks: false,
      containsInputs: false,
      repeatedChildTagNames: [],
    };
  }

  const tagCounts = new Map();
  const descendantTagNames = [];
  const descendantRoles = [];

  let containsEditable = false;
  let containsButtons = false;
  let containsLinks = false;
  let containsInputs = false;

  for (const descendant of descendants) {
    const tagName = String(descendant.tagName ?? "").toLowerCase();
    const role = String(readAttribute(descendant, "role") ?? descendant.role ?? "").toLowerCase();
    if (tagName) {
      descendantTagNames.push(tagName);
      tagCounts.set(tagName, (tagCounts.get(tagName) ?? 0) + 1);
    }
    if (role) {
      descendantRoles.push(role);
    }
    if (
      tagName === "textarea" ||
      tagName === "input" ||
      safeLower(readAttribute(descendant, "contenteditable")) === "true" ||
      descendant?.isContentEditable === true ||
      role === "textbox"
    ) {
      containsEditable = true;
      containsInputs = true;
    }
    if (tagName === "button" || role === "button") {
      containsButtons = true;
    }
    if (tagName === "a" || role === "link") {
      containsLinks = true;
    }
  }

  return {
    descendantTagNames,
    descendantRoles,
    containsEditable,
    containsButtons,
    containsLinks,
    containsInputs,
    repeatedChildTagNames: [...tagCounts.entries()]
      .filter(([, count]) => count >= 3)
      .map(([tagName]) => tagName),
  };
}

function getDescendants(element) {
  if (Array.isArray(element?.descendants)) {
    return element.descendants;
  }

  if (typeof element?.querySelectorAll === "function") {
    return Array.from(element.querySelectorAll("*"));
  }

  return [];
}

function readParentSummary(element) {
  const parent = element?.parentElement ?? element?.parent ?? null;
  if (!parent) {
    return null;
  }

  return {
    identity:
      parent.identity ??
      normalizeWhitespace(readAttribute(parent, "id")) ??
      `${String(parent.tagName ?? "node").toLowerCase()}-${Number(parent.index ?? 0)}`,
    tagName: String(parent.tagName ?? "").toLowerCase(),
    role: String(readAttribute(parent, "role") ?? "").toLowerCase(),
    childCount: Number(parent.childElementCount ?? parent.children?.length ?? 0),
  };
}

export function extractElementFeatures(element, context = {}) {
  const rect = readRect(element);
  const tagName = String(element?.tagName ?? "").toLowerCase();
  const role = String(readAttribute(element, "role") ?? "").toLowerCase();
  const accessibleName = computeAccessibleName(element, context.ownerDocument ?? element?.ownerDocument);
  const textSnippet = getElementTextSnippet(element);
  const dataAttributes = collectNamedAttributes(element, "data-");
  const ariaAttributes = collectNamedAttributes(element, "aria-");
  const descendantSummary = collectDescendantSummaries(element);
  const text = `${accessibleName} ${textSnippet}`;

  return {
    tagName,
    role,
    type: normalizeWhitespace(readAttribute(element, "type")),
    id: normalizeWhitespace(readAttribute(element, "id")),
    classList: Array.from(element?.classList ?? [])
      .map((name) => normalizeWhitespace(name))
      .filter(Boolean),
    dataAttributes,
    ariaAttributes,
    name: normalizeWhitespace(readAttribute(element, "name")),
    title: normalizeWhitespace(readAttribute(element, "title")),
    placeholder: normalizeWhitespace(readAttribute(element, "placeholder")),
    alt: normalizeWhitespace(readAttribute(element, "alt")),
    href: normalizeWhitespace(readAttribute(element, "href")),
    textSnippet,
    accessibleName,
    boundingRect: rect,
    visible: isElementVisible(element),
    disabled: isElementDisabled(element),
    contentEditable: safeLower(readAttribute(element, "contenteditable")) === "true",
    tabIndex: Number(element?.tabIndex ?? readAttribute(element, "tabindex") ?? -1),
    childCount: Number(element?.childElementCount ?? element?.children?.length ?? 0),
    parentSummary: readParentSummary(element),
    scrollable: isScrollableElement(element, rect),
    localTextDensity: normalizeWhitespace(text).length / Math.max(1, rectArea(rect)),
    descendantTagNames: descendantSummary.descendantTagNames,
    descendantRoles: descendantSummary.descendantRoles,
    containsEditable: descendantSummary.containsEditable,
    containsButtons: descendantSummary.containsButtons,
    containsLinks: descendantSummary.containsLinks,
    containsInputs: descendantSummary.containsInputs,
    repeatedChildTagNames: descendantSummary.repeatedChildTagNames,
    hasActionWord: ACTION_WORD_RE.test(text),
    looksTimestamp: TIMESTAMP_RE.test(text),
    isNativeInteractable: isNativeInteractableTag(tagName),
    hasInteractiveRole: isInteractiveRole(role),
    hasLandmarkRole: isLandmarkRole(role),
  };
}

export function getMeaningfulAncestor(element, maxDepth = 4) {
  let current = element;
  let depth = 0;

  while (current && depth < maxDepth) {
    const parent = current.parentElement ?? current.parent ?? null;
    if (!parent) {
      break;
    }

    const currentFeatures = extractElementFeatures(current);
    const parentFeatures = extractElementFeatures(parent);

    const currentStrength =
      (currentFeatures.isNativeInteractable ? 4 : 0) +
      (currentFeatures.hasInteractiveRole ? 3 : 0) +
      (currentFeatures.contentEditable ? 3 : 0) +
      (currentFeatures.hasLandmarkRole ? 1 : 0);
    const parentStrength =
      (parentFeatures.isNativeInteractable ? 4 : 0) +
      (parentFeatures.hasInteractiveRole ? 3 : 0) +
      (parentFeatures.contentEditable ? 3 : 0) +
      (parentFeatures.hasLandmarkRole ? 1 : 0);

    if (parentStrength > currentStrength) {
      current = parent;
      depth += 1;
      continue;
    }

    break;
  }

  return current;
}
