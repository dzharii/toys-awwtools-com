import { escapeCssString, looksGeneratedToken, safeLower, sortByScoreDesc } from "./utils.js";

export const SELECTOR_HEURISTICS = [
  {
    id: "stableAttributesFirst",
    label: "Stable Attributes First",
    description: "Prefer data-test style attributes, labels, names, and meaningful ids.",
    applicableKinds: ["control", "region", "collection", "content"],
    priority: 100,
  },
  {
    id: "regionScopedSemantic",
    label: "Region-Scoped Semantic",
    description: "Prefer a short child selector relative to a meaningful parent region.",
    applicableKinds: ["control", "content"],
    priority: 95,
  },
  {
    id: "accessibleRoleAndName",
    label: "Accessible Role & Name",
    description: "Use role and accessible naming signals before brittle structural selectors.",
    applicableKinds: ["control", "content"],
    priority: 90,
  },
  {
    id: "shortUniqueCss",
    label: "Short Unique CSS",
    description: "Build the shortest unique CSS selector that avoids unstable tokens.",
    applicableKinds: ["control", "region", "collection", "content"],
    priority: 85,
  },
  {
    id: "resilientCssPath",
    label: "Resilient CSS Path",
    description: "Use a short ancestor-descendant chain when one attribute is not enough.",
    applicableKinds: ["control", "region", "collection", "content"],
    priority: 80,
  },
  {
    id: "textAnchored",
    label: "Text Anchored",
    description: "Use nearby visible text or accessible labels as a fallback anchor.",
    applicableKinds: ["control", "content"],
    priority: 70,
  },
  {
    id: "collectionItem",
    label: "Collection Item",
    description: "Prefer repeated item selectors over one fixed instance.",
    applicableKinds: ["collection"],
    priority: 92,
  },
  {
    id: "parentChildRelative",
    label: "Parent + Child Relative",
    description: "Preserve hierarchy with a stable parent region and concise child selector.",
    applicableKinds: ["control", "content"],
    priority: 88,
  },
  {
    id: "xpathRelationalFallback",
    label: "XPath Relational Fallback",
    description: "Use XPath only when CSS cannot express the relation clearly.",
    applicableKinds: ["control", "content", "region"],
    priority: 50,
  },
  {
    id: "manualSelector",
    label: "Manual Selector",
    description: "Validate the selector exactly as typed by the user.",
    applicableKinds: ["control", "region", "collection", "content"],
    priority: 5,
  },
];

export function getHeuristicMetadata(id) {
  return SELECTOR_HEURISTICS.find((heuristic) => heuristic.id === id) ?? null;
}

export function applicableHeuristics(kind) {
  return SELECTOR_HEURISTICS.filter((heuristic) => heuristic.applicableKinds.includes(kind));
}

export function chooseAutomaticHeuristic(objectModel) {
  if (objectModel.kind === "collection") {
    return "collectionItem";
  }
  if ((objectModel.kind === "control" || objectModel.kind === "content") && objectModel.parentId) {
    return "regionScopedSemantic";
  }
  if (
    objectModel.kind === "control" &&
    !Object.keys(objectModel.features.dataAttributes ?? {}).length &&
    !objectModel.features.id
  ) {
    return "shortUniqueCss";
  }
  return "stableAttributesFirst";
}

function countMatches(selector, selectorType, context = {}) {
  if (context.matchCounts && `${selectorType}:${selector}` in context.matchCounts) {
    return context.matchCounts[`${selectorType}:${selector}`];
  }

  if (selectorType === "css" && typeof context.scope?.querySelectorAll === "function") {
    try {
      return context.scope.querySelectorAll(selector).length;
    } catch {
      return 0;
    }
  }

  if (
    selectorType === "xpath" &&
    context.document &&
    typeof context.document.evaluate === "function" &&
    typeof context.document.XPathResult !== "undefined"
  ) {
    try {
      const result = context.document.evaluate(
        selector,
        context.scope ?? context.document,
        null,
        context.document.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );
      return result.snapshotLength;
    } catch {
      return 0;
    }
  }

  return 1;
}

function makeCandidate(selector, selectorType, heuristicId, explanation, context) {
  const matchCount = countMatches(selector, selectorType, context);
  return {
    selector,
    selectorType,
    heuristicId,
    explanation,
    matchCount,
  };
}

function dataAttributeCandidates(features, heuristicId, context) {
  const candidates = [];
  const importantAttributes = [
    "data-testid",
    "data-test",
    "data-qa",
    "data-cy",
  ];

  for (const key of importantAttributes) {
    const value = features.dataAttributes?.[key];
    if (value) {
      candidates.push(
        makeCandidate(
          `[${key}="${escapeCssString(value)}"]`,
          "css",
          heuristicId,
          `${key} is usually authored for test stability`,
          context,
        ),
      );
    }
  }

  if (features.id && !looksGeneratedToken(features.id)) {
    candidates.push(
      makeCandidate(
        `#${escapeCssString(features.id)}`,
        "css",
        heuristicId,
        "meaningful id anchor",
        context,
      ),
    );
  }

  if (features.name) {
    candidates.push(
      makeCandidate(
        `${features.tagName || "*"}[name="${escapeCssString(features.name)}"]`,
        "css",
        heuristicId,
        "stable form control name",
        context,
      ),
    );
  }

  if (features.ariaAttributes?.["aria-label"]) {
    candidates.push(
      makeCandidate(
        `${features.tagName || "*"}[aria-label="${escapeCssString(features.ariaAttributes["aria-label"])}"]`,
        "css",
        heuristicId,
        "authored aria-label",
        context,
      ),
    );
  }

  if (features.placeholder) {
    candidates.push(
      makeCandidate(
        `${features.tagName || "*"}[placeholder="${escapeCssString(features.placeholder)}"]`,
        "css",
        heuristicId,
        "placeholder anchor",
        context,
      ),
    );
  }

  if (features.href) {
    candidates.push(
      makeCandidate(
        `${features.tagName || "a"}[href="${escapeCssString(features.href)}"]`,
        "css",
        heuristicId,
        "href anchor",
        context,
      ),
    );
  }

  return candidates;
}

function stableClassSelector(features, heuristicId, context) {
  const stableClasses = (features.classList ?? []).filter((name) => !looksGeneratedToken(name));
  if (!stableClasses.length) {
    return [];
  }

  return [
    makeCandidate(
      `${features.tagName || ""}.${stableClasses.slice(0, 2).map(escapeCssString).join(".")}`,
      "css",
      heuristicId,
      "short semantic class selector",
      context,
    ),
  ];
}

function shortCssCandidates(features, heuristicId, context) {
  const base = [];
  base.push(...dataAttributeCandidates(features, heuristicId, context));
  base.push(...stableClassSelector(features, heuristicId, context));
  if (features.tagName && features.role) {
    base.push(
      makeCandidate(
        `${features.tagName}[role="${escapeCssString(features.role)}"]`,
        "css",
        heuristicId,
        "tag and role pairing",
        context,
      ),
    );
  }
  if (features.tagName) {
    base.push(
      makeCandidate(
        features.tagName,
        "css",
        heuristicId,
        "bare tag fallback",
        context,
      ),
    );
  }
  return base;
}

function buildResilientPath(features, heuristicId, context) {
  const parentTag = features.parentSummary?.tagName;
  if (!parentTag || !features.tagName) {
    return [];
  }

  const selector = `${parentTag} ${features.tagName}${
    features.classList?.length ? `.${escapeCssString(features.classList[0])}` : ""
  }`;

  return [
    makeCandidate(
      selector,
      "css",
      heuristicId,
      "ancestor-descendant path with stable segments",
      context,
    ),
  ];
}

function buildRoleNameCandidates(features, heuristicId, context) {
  const role = features.role || inferImplicitRole(features);
  const label = features.accessibleName || features.placeholder || features.title;
  if (!role) {
    return [];
  }

  const candidates = [];
  if (features.ariaAttributes?.["aria-label"]) {
    candidates.push(
      makeCandidate(
        `[role="${escapeCssString(role)}"][aria-label="${escapeCssString(features.ariaAttributes["aria-label"])}"]`,
        "css",
        heuristicId,
        "role plus aria-label",
        context,
      ),
    );
  }

  if (label) {
    candidates.push(
      makeCandidate(
        `//*[@role="${role}" and contains(normalize-space(.), "${escapeXPathText(label)}")]`,
        "xpath",
        heuristicId,
        "role plus accessible text",
        context,
      ),
    );
  }

  return candidates;
}

function inferImplicitRole(features) {
  if (features.tagName === "button") return "button";
  if (features.tagName === "a") return "link";
  if (features.tagName === "textarea") return "textbox";
  if (features.tagName === "input") return "textbox";
  return "";
}

function buildTextCandidates(features, heuristicId, context) {
  const label = features.accessibleName || features.textSnippet || features.placeholder || features.title;
  if (!label) {
    return [];
  }

  return [
    makeCandidate(
      `//*[contains(normalize-space(.), "${escapeXPathText(label)}")]`,
      "xpath",
      heuristicId,
      "visible text anchor",
      context,
    ),
  ];
}

function buildRegionRelativeCandidates(objectModel, heuristicId, context) {
  const parent = context.parentObject;
  if (!parent) {
    return [];
  }

  const features = objectModel.features;
  const baseChildSelector =
    dataAttributeCandidates(features, heuristicId, context)[0]?.selector ??
    stableClassSelector(features, heuristicId, context)[0]?.selector ??
    `${features.tagName || "*"}${features.role ? `[role="${escapeCssString(features.role)}"]` : ""}`;

  return [
    {
      ...makeCandidate(
        baseChildSelector,
        "css",
        heuristicId,
        `scoped to parent region ${parent.name}`,
        context,
      ),
      scopeMode: "parent",
      scopeId: parent.id,
    },
  ];
}

function buildCollectionCandidates(objectModel, heuristicId, context) {
  const sample = objectModel.collection?.sampleEntries?.[0];
  const features = sample?.features ?? objectModel.features;
  const stableAttr =
    dataAttributeCandidates(features, heuristicId, context)[0]?.selector ??
    stableClassSelector(features, heuristicId, context)[0]?.selector ??
    features.tagName;

  return [
    makeCandidate(
      stableAttr,
      "css",
      heuristicId,
      "repeated item selector for collection entries",
      context,
    ),
  ];
}

function escapeXPathText(value) {
  return String(value ?? "").replace(/"/g, '\\"');
}

export function scoreSelectorCandidate(candidate, objectModel) {
  let score = 0;
  score += candidate.matchCount === 1 ? 24 : candidate.matchCount > 1 && objectModel.kind === "collection" ? 20 : 4;
  if (candidate.selectorType === "css") score += 6;
  if (candidate.selector.includes("data-testid") || candidate.selector.includes("data-test")) score += 18;
  if (candidate.selector.includes("aria-label")) score += 10;
  if (candidate.selector.startsWith("#")) score += 8;
  if (candidate.scopeMode === "parent") score += 9;
  if (candidate.selectorType === "xpath") score -= 3;
  if (candidate.selector.includes("nth-child")) score -= 12;
  if (candidate.selector.split(" ").length > 3) score -= 7;
  if (looksGeneratedToken(candidate.selector)) score -= 10;
  if (/\/html\/body/i.test(candidate.selector)) score -= 16;
  if (/contains\(normalize-space/.test(candidate.selector)) score -= 2;
  if (/role=/.test(candidate.selector)) score += 3;
  if (safeLower(candidate.explanation).includes("stable")) score += 2;
  return score;
}

export function validateSelectorCandidate(candidate, context = {}) {
  return {
    ...candidate,
    matchCount: countMatches(candidate.selector, candidate.selectorType, context),
  };
}

export function buildSelectorState(objectModel, context = {}) {
  const selectedHeuristicId =
    context.manualSelector && context.manualSelector.trim()
      ? "manualSelector"
      : context.heuristicId || chooseAutomaticHeuristic(objectModel);
  const candidates = [];
  const features = objectModel.features;
  const candidateContext = {
    ...context,
    scope:
      context.parentObject && selectedHeuristicId === "regionScopedSemantic"
        ? context.parentScope ?? context.scope
        : context.scope,
  };

  for (const heuristic of applicableHeuristics(objectModel.kind)) {
    switch (heuristic.id) {
      case "stableAttributesFirst":
        candidates.push(...dataAttributeCandidates(features, heuristic.id, candidateContext));
        break;
      case "regionScopedSemantic":
      case "parentChildRelative":
        candidates.push(...buildRegionRelativeCandidates(objectModel, heuristic.id, candidateContext));
        break;
      case "accessibleRoleAndName":
        candidates.push(...buildRoleNameCandidates(features, heuristic.id, candidateContext));
        break;
      case "shortUniqueCss":
        candidates.push(...shortCssCandidates(features, heuristic.id, candidateContext));
        break;
      case "resilientCssPath":
        candidates.push(...buildResilientPath(features, heuristic.id, candidateContext));
        break;
      case "textAnchored":
      case "xpathRelationalFallback":
        candidates.push(...buildTextCandidates(features, heuristic.id, candidateContext));
        break;
      case "collectionItem":
        candidates.push(...buildCollectionCandidates(objectModel, heuristic.id, candidateContext));
        break;
      case "manualSelector":
        if (context.manualSelector && context.manualSelector.trim()) {
          candidates.push(
            makeCandidate(
              context.manualSelector.trim(),
              context.manualSelectorType ?? "css",
              heuristic.id,
              "manual selector",
              candidateContext,
            ),
          );
        }
        break;
      default:
        break;
    }
  }

  const deduped = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.heuristicId}:${candidate.selectorType}:${candidate.selector}:${candidate.scopeId ?? "doc"}`;
    if (!deduped.has(key)) {
      deduped.set(key, candidate);
    }
  }

  const scored = [...deduped.values()].map((candidate) => {
    const validated = validateSelectorCandidate(candidate, candidateContext);
    return {
      ...validated,
      score: scoreSelectorCandidate(validated, objectModel),
    };
  });

  const ranked = sortByScoreDesc(scored);
  const preferred =
    ranked.find((candidate) => candidate.heuristicId === selectedHeuristicId) ??
    ranked[0] ??
    {
      selector: "",
      selectorType: "css",
      heuristicId: selectedHeuristicId,
      score: 0,
      explanation: "No selector candidates generated",
      matchCount: 0,
    };

  return {
    heuristicId: selectedHeuristicId,
    preferred,
    alternatives: ranked.filter((candidate) => candidate.selector !== preferred.selector).slice(0, 8),
    testResult: {
      matchCount: preferred.matchCount,
      score: preferred.score,
      scope: preferred.scopeMode === "parent" ? "parent" : "document",
    },
  };
}
