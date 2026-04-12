import { stableJson } from "./utils.js";

export function serializeSelectedObjects(selectedObjects, pageContext = {}) {
  const payload = {
    toolVersion: pageContext.toolVersion ?? "0.1.0",
    pageUrl: pageContext.url ?? "",
    title: pageContext.title ?? "",
    timestamp: pageContext.timestamp ?? new Date().toISOString(),
    viewport: pageContext.viewport ?? { width: 0, height: 0 },
    objects: selectedObjects.map((object) => ({
      id: object.id,
      name: object.name,
      kind: object.kind,
      inferredType: object.inferredType,
      confidence: object.confidence,
      selector: object.selector,
      selectorType: object.selectorType,
      selectorScore: object.selectorScore,
      heuristicId: object.heuristicId,
      alternativeSelectors: object.alternativeSelectors.map((candidate) => ({
        selector: candidate.selector,
        selectorType: candidate.selectorType,
        score: candidate.score,
        heuristicId: candidate.heuristicId,
        explanation: candidate.explanation,
        matchCount: candidate.matchCount,
      })),
      boundingRect: object.features.boundingRect,
      features: {
        tagName: object.features.tagName,
        role: object.features.role,
        accessibleName: object.features.accessibleName,
        textSnippet: object.features.textSnippet,
        dataAttributes: object.features.dataAttributes,
        ariaAttributes: object.features.ariaAttributes,
      },
      explanation: object.explanation,
      parentId: object.parentId,
      children: object.children,
      collection: object.collection
        ? {
            itemSelector: object.collection.itemSelector ?? "",
            itemSelectorScore: object.collection.itemSelectorScore ?? 0,
            itemChildren: object.collection.itemChildren ?? [],
            sampleCount: object.collection.sampleCount ?? 0,
            virtualizationSuspected: Boolean(object.collection.virtualizationSuspected),
          }
        : null,
    })),
  };

  return stableJson(payload);
}

export function exportJsonText(selectedObjects, pageContext = {}) {
  return JSON.stringify(serializeSelectedObjects(selectedObjects, pageContext), null, 2);
}
