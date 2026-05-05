function priorityGroup(column) {
  if (column.isLikelyIdentifier) return 1;
  if (column.isLikelyStatus) return 2;
  if (column.isLikelyError) return 3;
  if (column.isLikelyTime) return 4;
  if (column.isLikelyMetric) return 6;
  if (column.isLongText) return 10;
  if (column.dominantType === "array" || column.dominantType === "object") return 11;
  if (column.isConstant) return 12;
  if (column.isMostlyMissing) return 9;
  return 5;
}

function compareCoverageDesc(a, b) {
  if (b.coverageRatio !== a.coverageRatio) return b.coverageRatio - a.coverageRatio;
  if (a.path.length !== b.path.length) return a.path.length - b.path.length;
  if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
  return a.label.localeCompare(b.label);
}

function compareFailureFirst(a, b) {
  const groupDelta = priorityGroup(a) - priorityGroup(b);
  if (groupDelta !== 0) return groupDelta;
  return compareCoverageDesc(a, b);
}

function compareAlphabetical(a, b) {
  const labelCompare = a.label.localeCompare(b.label);
  if (labelCompare !== 0) return labelCompare;
  return (a.order ?? 0) - (b.order ?? 0);
}

export function orderColumns(columns, preset = "failureFirst") {
  const list = [...(columns || [])];
  if (preset === "originalOrder") {
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  if (preset === "coverageFirst") {
    return list.sort(compareCoverageDesc);
  }
  if (preset === "alphabetical") {
    return list.sort(compareAlphabetical);
  }
  return list.sort(compareFailureFirst);
}

export function chooseDefaultVisibleColumns(columns, options = {}) {
  const maxVisibleColumns = Number.isFinite(options.maxVisibleColumns) ? options.maxVisibleColumns : 50;
  const visible = [];
  const hiddenReasons = {};

  for (const column of columns || []) {
    let hiddenReason = null;

    if (column.isLikelyError || column.isLikelyStatus || column.isLikelyIdentifier || column.isLikelyTime) {
      hiddenReason = null;
    } else if (column.isConstant) {
      hiddenReason = "constant";
    } else if (column.isMostlyMissing) {
      hiddenReason = "mostly missing";
    } else if (column.isLongText && !column.isLikelyError) {
      hiddenReason = "long text";
    } else if (column.dominantType === "array" || column.dominantType === "object") {
      hiddenReason = "array/object summary";
    }

    if (!hiddenReason && visible.length >= maxVisibleColumns) {
      hiddenReason = "visible column cap";
    }

    if (hiddenReason) {
      hiddenReasons[column.key] = hiddenReason;
      continue;
    }

    visible.push(column.key);
  }

  return {
    visibleColumnKeys: visible,
    hiddenReasons
  };
}

