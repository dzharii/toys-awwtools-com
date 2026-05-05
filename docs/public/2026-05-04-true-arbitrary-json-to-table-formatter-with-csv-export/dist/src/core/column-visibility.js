export function applyColumnVisibility(columns, visibleColumnKeys) {
  const visibleSet = new Set(visibleColumnKeys || []);
  return (columns || []).filter((column) => visibleSet.has(column.key));
}

export function toggleColumnVisibility(visibleColumnKeys, columnKey, visible) {
  const set = new Set(visibleColumnKeys || []);
  if (visible) {
    set.add(columnKey);
  } else {
    set.delete(columnKey);
  }
  return [...set];
}

export function resetVisibleColumns(columns, options = {}) {
  if (Array.isArray(options.defaultVisibleColumnKeys) && options.defaultVisibleColumnKeys.length > 0) {
    return [...options.defaultVisibleColumnKeys];
  }
  return (columns || []).map((column) => column.key);
}

export function orderVisibleColumns(columns, visibleKeys, preset = "originalOrder") {
  const visibleSet = new Set(visibleKeys || []);
  const ordered = (columns || []).filter((column) => visibleSet.has(column.key));
  if (preset === "alphabetical") {
    ordered.sort((a, b) => a.label.localeCompare(b.label));
  } else if (preset === "coverageFirst") {
    ordered.sort((a, b) => (b.coverageRatio ?? 0) - (a.coverageRatio ?? 0));
  } else {
    ordered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return ordered.map((column) => column.key);
}

