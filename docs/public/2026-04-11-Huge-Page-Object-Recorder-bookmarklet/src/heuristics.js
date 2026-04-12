import { extractElementFeatures } from "./features.js";
import { clamp, excerpt, safeLower, uniqueName } from "./utils.js";

export const DISCOVERY_HEURISTICS = [
  "nativeInteractables",
  "ariaInteractables",
  "editableTargets",
  "eventLikeControls",
  "landmarkRegions",
  "visualRegions",
  "chatComposer",
  "chatTranscript",
  "repeatedCollections",
  "navigationClusters",
  "modalSurface",
  "assertableContent",
];

function scoreControl(features) {
  let score = 0;
  if (features.isNativeInteractable) score += 6;
  if (features.hasInteractiveRole) score += 5;
  if (features.contentEditable) score += 4;
  if (features.tabIndex >= 0) score += 2;
  if (features.accessibleName) score += 2;
  if (features.placeholder) score += 2;
  if (features.hasActionWord) score += 2;
  if (features.disabled) score -= 6;
  if (!features.visible) score -= 8;
  if (features.boundingRect.width < 18 || features.boundingRect.height < 18) score -= 1;
  return score;
}

function scoreRegion(features, context = {}) {
  let score = 0;
  if (features.hasLandmarkRole) score += 5;
  if (["nav", "header", "footer", "aside", "main", "section", "form", "dialog"].includes(features.tagName)) {
    score += 4;
  }
  if (features.scrollable) score += 3;
  if (features.containsEditable && features.containsButtons) score += 5;
  if (features.containsLinks && features.repeatedChildTagNames.includes("a")) score += 4;
  if (features.repeatedChildTagNames.length) score += 3;
  if (context.fromAreaSelection) score += 2;
  if (!features.visible) score -= 8;
  return score;
}

function scoreCollection(features, context = {}) {
  let score = 0;
  if (features.repeatedChildTagNames.length) score += 5;
  if (features.scrollable) score += 2;
  if (context.repeatedSampleCount >= 3) score += 4;
  if (features.containsLinks || features.containsButtons) score += 2;
  if (features.localTextDensity > 0.004) score += 1;
  if (!features.visible) score -= 8;
  return score;
}

function scoreContent(features) {
  let score = 0;
  if (features.textSnippet) score += 3;
  if (features.looksTimestamp) score += 2;
  if (features.accessibleName && !features.isNativeInteractable && !features.hasInteractiveRole) {
    score += 2;
  }
  if (!features.visible) score -= 8;
  return score;
}

function inferControlType(features) {
  const text = safeLower(`${features.accessibleName} ${features.placeholder} ${features.textSnippet}`);
  if (features.tagName === "textarea") return "textarea";
  if (features.contentEditable || features.role === "textbox") return "editable";
  if (features.tagName === "input" && /file/.test(features.type)) return "fileInput";
  if (features.tagName === "input") return "input";
  if (features.role === "combobox" || features.tagName === "select") return "combobox";
  if (features.role === "tab") return "tab";
  if (features.role === "switch" || /toggle/.test(text)) return "toggle";
  if (/menu|more|overflow/.test(text)) return "menuTrigger";
  if (features.tagName === "a" || features.role === "link") return "link";
  return "button";
}

function inferRegionType(features) {
  const text = safeLower(`${features.accessibleName} ${features.textSnippet} ${features.placeholder}`);
  if (features.containsEditable && features.containsButtons) return "composer";
  if (features.scrollable && features.repeatedChildTagNames.length && /message|chat|transcript|feed/.test(text)) {
    return "transcript";
  }
  if ((features.tagName === "nav" || features.role === "navigation") && features.repeatedChildTagNames.length) {
    return "navigation";
  }
  if ((features.tagName === "aside" || /sidebar/.test(text)) && (features.containsLinks || features.containsButtons)) {
    return "sidebar";
  }
  if (features.role === "toolbar") return "toolbar";
  if (features.tagName === "form" || features.role === "form") return "form";
  if (features.tagName === "dialog" || features.role === "dialog") return "modal";
  if (features.tagName === "header") return "header";
  if (features.tagName === "footer") return "footer";
  if (features.tagName === "main" || features.role === "main") return "main";
  return "panel";
}

function inferCollectionType(features, context = {}) {
  const text = safeLower(`${features.accessibleName} ${features.textSnippet}`);
  if (/message|chat/.test(text)) return "messageItems";
  if (/conversation|inbox|thread/.test(text)) return "conversationRows";
  if (/menu|nav/.test(text)) return "navigationLinks";
  if (context.regionType === "transcript") return "messageItems";
  if (context.regionType === "sidebar") return "conversationRows";
  return "genericRepeatedList";
}

function inferContentType(features) {
  const text = safeLower(`${features.accessibleName} ${features.textSnippet}`);
  if (features.looksTimestamp) return "timestamp";
  if (/status|online|offline|sent|failed|error/.test(text)) return "statusText";
  if (/badge|unread|\d+\s+new/.test(text)) return "badge";
  if (/title|subject|thread/.test(text)) return "title";
  if (/sender|from/.test(text)) return "sender";
  return "content";
}

function chooseKind(scores) {
  return Object.entries(scores).sort((left, right) => right[1] - left[1])[0][0];
}

export function triggeredDiscoveryHeuristics(features, context = {}) {
  const heuristics = [];
  if (features.isNativeInteractable) heuristics.push("nativeInteractables");
  if (features.hasInteractiveRole) heuristics.push("ariaInteractables");
  if (features.contentEditable || /input|textarea/.test(features.tagName)) heuristics.push("editableTargets");
  if (features.tabIndex >= 0 && !features.isNativeInteractable) heuristics.push("eventLikeControls");
  if (features.hasLandmarkRole || ["nav", "header", "footer", "aside", "main", "form", "dialog"].includes(features.tagName)) {
    heuristics.push("landmarkRegions");
  }
  if (features.scrollable || features.repeatedChildTagNames.length) heuristics.push("visualRegions");
  if (features.containsEditable && features.containsButtons) heuristics.push("chatComposer");
  if (features.scrollable && features.repeatedChildTagNames.length) heuristics.push("chatTranscript");
  if (context.repeatedSampleCount >= 3 || features.repeatedChildTagNames.length) heuristics.push("repeatedCollections");
  if (features.containsLinks && features.repeatedChildTagNames.includes("a")) heuristics.push("navigationClusters");
  if (features.role === "dialog" || features.tagName === "dialog") heuristics.push("modalSurface");
  if (features.textSnippet && !features.isNativeInteractable && !features.hasInteractiveRole) heuristics.push("assertableContent");
  return heuristics;
}

export function inferObjectFromFeatures(features, context = {}) {
  const scores = {
    control: scoreControl(features),
    region: scoreRegion(features, context),
    collection: scoreCollection(features, context),
    content: scoreContent(features),
  };

  const kind = chooseKind(scores);
  const bestScore = scores[kind];
  const confidence = clamp((bestScore + 2) / 14, 0.15, 0.99);
  const inferredType =
    kind === "control"
      ? inferControlType(features)
      : kind === "region"
        ? inferRegionType(features)
        : kind === "collection"
          ? inferCollectionType(features, context)
          : inferContentType(features);
  const explanation = buildExplanation(kind, inferredType, features, context);

  return {
    kind,
    inferredType,
    confidence: Number(confidence.toFixed(2)),
    explanation,
    discoveryHeuristics: triggeredDiscoveryHeuristics(features, context),
    scores,
  };
}

export function buildObjectName(inference, features, existingNames = []) {
  const label = features.accessibleName || features.placeholder || features.title || features.textSnippet;
  const labelLower = safeLower(label);
  const inferredLower = safeLower(inference.inferredType);
  const isFieldLike = ["input", "textarea", "editable", "textbox"].includes(inferredLower);
  const base =
    inference.inferredType === "button" && label
      ? `${label} button`
      : inference.inferredType === "link" && label
        ? `${label} link`
        : label &&
            (labelLower.includes(inferredLower) ||
              (isFieldLike && /input|message|compose|editor|field|search/.test(labelLower)))
          ? label
        : label
          ? `${label} ${inference.inferredType}`
          : inference.inferredType;

  return uniqueName(base, existingNames);
}

export function createObjectModel({ element = null, features, context = {}, existingNames = [] }) {
  const safeFeatures = features ?? extractElementFeatures(element, context);
  const inference = inferObjectFromFeatures(safeFeatures, context);
  return {
    id: null,
    name: buildObjectName(inference, safeFeatures, existingNames),
    kind: inference.kind,
    inferredType: inference.inferredType,
    confidence: inference.confidence,
    explanation: inference.explanation,
    discoveryHeuristics: inference.discoveryHeuristics,
    features: safeFeatures,
    element,
    parentId: null,
    children: [],
    collection: null,
    selector: "",
    selectorType: "css",
    selectorScore: 0,
    heuristicId: null,
    alternativeSelectors: [],
    selectorTest: null,
  };
}

export function buildExplanation(kind, inferredType, features, context = {}) {
  const parts = [];

  if (kind === "control") {
    if (features.isNativeInteractable) {
      parts.push("native interactable");
    }
    if (features.hasInteractiveRole) {
      parts.push(`role=${features.role}`);
    }
    if (features.accessibleName) {
      parts.push(`label "${excerpt(features.accessibleName, 32)}"`);
    }
  }

  if (kind === "region") {
    if (features.containsEditable && features.containsButtons) {
      parts.push("editable target grouped with nearby actions");
    }
    if (features.scrollable) {
      parts.push("scrollable container");
    }
    if (features.repeatedChildTagNames.length) {
      parts.push(`repeated ${features.repeatedChildTagNames.join(", ")} children`);
    }
  }

  if (kind === "collection") {
    if (context.repeatedSampleCount >= 3) {
      parts.push(`${context.repeatedSampleCount} repeated item samples`);
    }
    if (context.regionType) {
      parts.push(`inside ${context.regionType}`);
    }
  }

  if (kind === "content") {
    if (features.looksTimestamp) {
      parts.push("timestamp-like text");
    }
    if (features.textSnippet) {
      parts.push(`assertable text "${excerpt(features.textSnippet, 32)}"`);
    }
  }

  return `${inferredType}: ${parts.filter(Boolean).join(", ") || "best-fit automation target"}`;
}
