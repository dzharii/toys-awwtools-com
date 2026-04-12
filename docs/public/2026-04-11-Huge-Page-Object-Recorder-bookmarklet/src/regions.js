import { createObjectModel } from "./heuristics.js";
import {
  rectArea,
  rectContains,
  rectFrom,
  rectIntersectionArea,
  rectIntersects,
  rectOverlapRatio,
  sortByScoreDesc,
} from "./utils.js";

function shapeSignature(record) {
  const features = record.features;
  return [
    features.tagName,
    features.role,
    features.parentSummary?.identity ?? "root",
    features.classList.filter((name) => name.length > 2).slice(0, 2).join("."),
    features.childCount > 0 ? "children" : "leaf",
  ].join("|");
}

export function detectRepeatedCollections(records) {
  const groups = new Map();
  for (const record of records) {
    const parentIdentity = record.features.parentSummary?.identity ?? "root";
    const key = `${parentIdentity}::${shapeSignature(record)}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(record);
  }

  return [...groups.values()]
    .filter((group) => group.length >= 3)
    .map((group) => {
      const sample = group[0];
      const regionType = sample.regionType ?? sample.parentRegionType ?? null;
      const collection = createObjectModel({
        features: {
          ...sample.features,
          scrollable: Boolean(sample.features.scrollable || group.some((record) => record.features.scrollable)),
          repeatedChildTagNames: [
            sample.features.tagName || "div",
            ...sample.features.repeatedChildTagNames,
          ],
        },
        context: {
          repeatedSampleCount: group.length,
          regionType,
        },
      });

      collection.kind = "collection";
      collection.collection = {
        sampleCount: group.length,
        virtualizationSuspected: group.length >= 20,
        sampleEntries: group,
        itemChildren: [],
      };

      return collection;
    });
}

function scoreSelectionRecord(record, selectionRect) {
  const overlapRatio = rectOverlapRatio(record.features.boundingRect, selectionRect);
  const regionBias =
    record.kind === "region" ? 3 : record.kind === "collection" ? 2 : record.kind === "control" ? 1.5 : 1;
  return overlapRatio * 10 * regionBias + Number(record.confidence ?? 0);
}

function readLiveRect(record) {
  if (typeof record?.element?.getBoundingClientRect === "function") {
    return rectFrom(record.element.getBoundingClientRect());
  }
  return rectFrom(record?.features?.boundingRect ?? {});
}

function withRect(record, rect) {
  return {
    ...record,
    features: {
      ...(record.features ?? {}),
      boundingRect: rect,
    },
  };
}

function selectionContainsPoint(selectionRect, pointX, pointY) {
  return (
    pointX >= selectionRect.left &&
    pointX <= selectionRect.right &&
    pointY >= selectionRect.top &&
    pointY <= selectionRect.bottom
  );
}

function candidateTypeBias(record) {
  if (record.kind === "control") {
    return 2;
  }
  if (record.kind === "content") {
    return 1;
  }
  if (record.kind === "collection") {
    return 0.6;
  }
  if (record.kind === "region") {
    return -0.8;
  }
  return 0;
}

function isPageLevelContainer(record) {
  const tag = String(record?.features?.tagName ?? "").toLowerCase();
  const role = String(record?.features?.role ?? "").toLowerCase();
  const id = String(record?.features?.id ?? "").toLowerCase();
  return (
    tag === "html" ||
    tag === "body" ||
    role === "main" ||
    id === "root" ||
    id === "app" ||
    id === "layout" ||
    id === "page"
  );
}

function unionRects(rects) {
  if (!rects.length) {
    return null;
  }
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return rectFrom({
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  });
}

function effectiveRect(record, selectionRect) {
  const baseRect = readLiveRect(record);
  const elementArea = Math.max(1, rectArea(baseRect));
  const selectionArea = Math.max(1, rectArea(selectionRect));
  const widthLooksOversized = baseRect.width > selectionRect.width * 1.9;
  const isTextLike =
    String(record?.kind ?? "") === "content" ||
    Boolean(record?.features?.textSnippet) ||
    ["div", "p", "section", "article", "label"].includes(String(record?.features?.tagName ?? "").toLowerCase());
  if (!widthLooksOversized || !isTextLike || !record?.element) {
    return { rect: baseRect, contentFootprint: false };
  }

  const children = Array.from(record.element.children ?? []);
  const childRects = children
    .map((child) => (typeof child?.getBoundingClientRect === "function" ? rectFrom(child.getBoundingClientRect()) : null))
    .filter((rect) => rect && rectArea(rect) > 0);
  const childUnion = unionRects(childRects);
  if (childUnion && rectArea(childUnion) > 0 && rectArea(childUnion) < elementArea * 0.72) {
    return { rect: childUnion, contentFootprint: true };
  }

  if (record.features?.textSnippet && elementArea > selectionArea * 2.5) {
    const left = Math.max(baseRect.left, selectionRect.left - 12);
    const right = Math.min(baseRect.right, selectionRect.right + 12);
    if (right > left + 10) {
      return {
        rect: rectFrom({
          left,
          top: baseRect.top,
          right,
          bottom: baseRect.bottom,
          width: right - left,
          height: baseRect.height,
        }),
        contentFootprint: true,
      };
    }
  }

  return { rect: baseRect, contentFootprint: false };
}

function shouldHardExclude(record, metrics, selectionRect) {
  if (metrics.overlapArea <= 0) {
    return true;
  }

  if (
    !metrics.fullyContained &&
    !metrics.centerInside &&
    metrics.overlapToElement < 0.12 &&
    metrics.overlapToSelection < 0.09
  ) {
    return true;
  }

  if (isPageLevelContainer(record) && metrics.selectionShareOnCandidate < 0.9) {
    return true;
  }

  if (
    metrics.areaRatioToSelection > 12 &&
    !metrics.fullyContained &&
    metrics.overlapToElement < 0.75
  ) {
    return true;
  }

  if (
    record.kind !== "control" &&
    metrics.areaRatioToSelection > 5 &&
    metrics.selectionShareOnCandidate < 0.55 &&
    metrics.overlapToElement < 0.65
  ) {
    return true;
  }

  if (
    record.kind === "region" &&
    metrics.areaRatioToSelection > 2.2 &&
    metrics.selectionShareOnCandidate < 0.65 &&
    metrics.overlapToSelection < 0.88
  ) {
    return true;
  }

  if (
    record.kind !== "control" &&
    metrics.areaRatioToSelection > 6 &&
    metrics.overlapToElement < 0.2 &&
    !metrics.fullyContained
  ) {
    return true;
  }

  const selectionArea = Math.max(1, rectArea(selectionRect));
  const candidateArea = Math.max(1, rectArea(metrics.rect));
  if (
    candidateArea > selectionArea * 14 &&
    metrics.overlapToSelection < 0.96
  ) {
    return true;
  }

  return false;
}

function intentScore(record, metrics) {
  let score = 0;
  if (metrics.fullyContained) score += 8.2;
  if (metrics.centerInside) score += 4.1;
  score += metrics.overlapToElement * 6.2;
  score += metrics.overlapToSelection * 4.3;
  score += candidateTypeBias(record);
  score += Number(record.confidence ?? 0);
  if (metrics.contentFootprint) {
    score += 1.1;
  }
  if (metrics.areaRatioToSelection > 1.4) {
    score -= Math.min(8, (metrics.areaRatioToSelection - 1.4) * 1.15);
  }
  if (metrics.areaRatioToSelection > 4 && !metrics.fullyContained) {
    score -= 2.5;
  }
  if (isPageLevelContainer(record)) {
    score -= 6.5;
  }
  if (
    record.kind === "region" &&
    metrics.overlapToSelection > 0.34 &&
    metrics.areaRatioToSelection < 1.65
  ) {
    score += 2.25;
  }
  if (
    record.kind === "region" &&
    metrics.overlapToElement > 0.6 &&
    metrics.overlapToSelection > 0.25 &&
    metrics.areaRatioToSelection < 1.8
  ) {
    score += 10.5;
  }
  return Number(score.toFixed(4));
}

function computeCandidate(record, selectionRect) {
  const { rect, contentFootprint } = effectiveRect(record, selectionRect);
  const overlapArea = rectIntersectionArea(rect, selectionRect);
  const rectAreaValue = Math.max(1, rectArea(rect));
  const selectionArea = Math.max(1, rectArea(selectionRect));
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const centerInside = selectionContainsPoint(selectionRect, centerX, centerY);
  const fullyContained = rectContains(selectionRect, rect);
  const overlapToElement = overlapArea / rectAreaValue;
  const overlapToSelection = overlapArea / selectionArea;
  const areaRatioToSelection = rectAreaValue / selectionArea;
  const selectionShareOnCandidate = selectionArea / rectAreaValue;
  const metrics = {
    rect,
    overlapArea,
    overlapToElement,
    overlapToSelection,
    areaRatioToSelection,
    selectionShareOnCandidate,
    fullyContained,
    centerInside,
    contentFootprint,
  };
  return {
    record: withRect(record, rect),
    metrics,
  };
}

function suppressBroadAncestors(candidates) {
  return candidates.filter((candidate) => {
    const element = candidate.record.element;
    if (!element || typeof element.contains !== "function") {
      return true;
    }
    if (candidate.metrics.contentFootprint) {
      const tightlyContainedDescendant = candidates.find((other) => {
        if (other === candidate || !other.record.element) {
          return false;
        }
        if (!element.contains(other.record.element)) {
          return false;
        }
        return (
          other.metrics.fullyContained &&
          other.metrics.overlapToElement >= 0.9 &&
          other.score >= candidate.score - 1.6
        );
      });
      if (tightlyContainedDescendant) {
        return false;
      }
    }
    const betterDescendant = candidates.find((other) => {
      if (other === candidate) {
        return false;
      }
      if (!other.record.element || !element.contains(other.record.element)) {
        return false;
      }
      if (other.metrics.fullyContained && candidate.metrics.areaRatioToSelection > 1.65) {
        return other.score >= candidate.score + 1.8;
      }
      return false;
    });
    if (!betterDescendant) {
      return true;
    }
    if (candidate.record.kind === "control") {
      return true;
    }
    return false;
  });
}

function rankIntentCandidates(records, selectionRect) {
  const candidates = records
    .filter((record) => rectIntersects(readLiveRect(record), selectionRect))
    .map((record) => computeCandidate(record, selectionRect))
    .filter(({ record, metrics }) => !shouldHardExclude(record, metrics, selectionRect))
    .map((entry) => ({
      ...entry,
      score: intentScore(entry.record, entry.metrics),
    }));

  return suppressBroadAncestors(candidates).sort((left, right) => right.score - left.score);
}

export function previewAreaCandidates(records, selectionRect, limit = 24) {
  return rankIntentCandidates(records, selectionRect)
    .slice(0, Math.max(1, Number(limit)))
    .map(({ record, score }) => ({
      ...record,
      score,
    }));
}

function assignParents(objects) {
  const regions = objects.filter((item) => item.kind === "region");
  for (const object of objects) {
    if (object.kind === "region") {
      continue;
    }

    const parent = regions
      .filter((region) => region.id !== object.id && rectContains(region.features.boundingRect, object.features.boundingRect))
      .sort((left, right) => {
        const leftArea = left.features.boundingRect.width * left.features.boundingRect.height;
        const rightArea = right.features.boundingRect.width * right.features.boundingRect.height;
        return leftArea - rightArea;
      })[0];

    if (parent) {
      object.parentId = parent.id;
      parent.children.push(object.id);
    }
  }
}

export function analyzeAreaSelection(records, selectionRect) {
  const localCandidates = rankIntentCandidates(records, selectionRect);
  const overlapping = localCandidates.map((entry) => ({
    ...entry.record,
    score: entry.score,
  }));

  const collectionObjects = detectRepeatedCollections(overlapping).map((collection) => {
    const sampleRect = rectFrom(collection.features?.boundingRect ?? {});
    const overlapRatio = rectOverlapRatio(sampleRect, selectionRect);
    const localBonus = collection.collection?.sampleCount
      ? Math.min(3, Math.log2(1 + collection.collection.sampleCount))
      : 0;
    const sampleEntries = Array.isArray(collection.collection?.sampleEntries)
      ? collection.collection.sampleEntries
      : [];
    const averageSampleScore = sampleEntries.length
      ? sampleEntries.reduce((sum, entry) => sum + Number(entry.score ?? 0), 0) / sampleEntries.length
      : 0;
    return {
      ...collection,
      score:
        Math.max(averageSampleScore + 1.2, overlapRatio * 8) +
        localBonus +
        Number(collection.confidence ?? 0) +
        Math.min(5, Number(collection.collection?.sampleCount ?? 0) * 0.85),
    };
  });

  const combined = [...overlapping, ...collectionObjects].map((record) => ({
    ...record,
    score:
      typeof record.score === "number"
        ? record.score
        : scoreSelectionRecord(record, selectionRect),
  }));

  const ranked = sortByScoreDesc(combined).slice(0, 8).map((record, index) => ({
    ...record,
    id: record.id ?? `selection-${index + 1}`,
    children: [...(record.children ?? [])],
  }));

  assignParents(ranked);
  return ranked;
}
