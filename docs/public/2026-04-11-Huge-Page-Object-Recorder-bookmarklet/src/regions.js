import { createObjectModel } from "./heuristics.js";
import { rectContains, rectIntersects, rectOverlapRatio, sortByScoreDesc } from "./utils.js";

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
  const overlapping = records.filter((record) =>
    rectIntersects(record.features.boundingRect, selectionRect),
  );

  const collectionObjects = detectRepeatedCollections(overlapping);
  const combined = [...overlapping, ...collectionObjects].map((record) => ({
    ...record,
    score: scoreSelectionRecord(record, selectionRect),
  }));

  const ranked = sortByScoreDesc(combined).slice(0, 8).map((record, index) => ({
    ...record,
    id: record.id ?? `selection-${index + 1}`,
    children: [...(record.children ?? [])],
  }));

  assignParents(ranked);
  return ranked;
}
