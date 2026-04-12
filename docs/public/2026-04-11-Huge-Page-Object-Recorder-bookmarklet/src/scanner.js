import { extractElementFeatures, getMeaningfulAncestor } from "./features.js";
import { TOOL_IGNORE_ATTRIBUTE } from "./utils.js";

function hasIgnoreAttribute(element) {
  if (!element) {
    return false;
  }

  if (typeof element.getAttribute === "function") {
    return element.getAttribute(TOOL_IGNORE_ATTRIBUTE) === "true";
  }

  return element.attributes?.[TOOL_IGNORE_ATTRIBUTE] === "true";
}

function isDecorative(features) {
  return (
    features.ariaAttributes?.["aria-hidden"] === "true" &&
    !features.textSnippet &&
    !features.accessibleName &&
    !features.isNativeInteractable &&
    !features.hasInteractiveRole
  );
}

export function isEligibleElement(element) {
  const features = extractElementFeatures(element);
  if (!features.visible || features.disabled) {
    return false;
  }

  if (hasIgnoreAttribute(element) || hasIgnoreAttribute(element.parentElement ?? element.parent)) {
    return false;
  }

  return !isDecorative(features);
}

export function scanDocument(documentLike) {
  const body = documentLike?.body ?? null;
  const descendants = Array.from(documentLike?.querySelectorAll?.("*") ?? []);
  const rawElements = [body, ...descendants].filter(Boolean);
  const seen = new Set();

  return rawElements
    .map((element) => getMeaningfulAncestor(element))
    .filter(Boolean)
    .filter((element) => {
      if (seen.has(element)) {
        return false;
      }
      seen.add(element);
      return true;
    })
    .filter(isEligibleElement)
    .map((element) => ({
      element,
      features: extractElementFeatures(element),
    }));
}
