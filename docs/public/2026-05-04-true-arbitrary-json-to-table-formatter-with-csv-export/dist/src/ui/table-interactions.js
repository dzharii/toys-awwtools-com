export function nextSortState(currentSort, columnKey) {
  if (!currentSort || currentSort.columnKey !== columnKey) {
    return { columnKey, direction: "asc" };
  }
  if (currentSort.direction === "asc") return { columnKey, direction: "desc" };
  if (currentSort.direction === "desc") return { columnKey: null, direction: "none" };
  return { columnKey, direction: "asc" };
}

export const ROW_SELECTION_DRAG_THRESHOLD_PX = 4;

export function isPointerDrag(start, end, threshold = ROW_SELECTION_DRAG_THRESHOLD_PX) {
  if (!start || !end) return false;
  const dx = Math.abs(Number(end.x) - Number(start.x));
  const dy = Math.abs(Number(end.y) - Number(start.y));
  return dx > threshold || dy > threshold;
}

export function hasNonEmptyTextSelection(selection) {
  if (!selection || selection.isCollapsed) return false;
  const text = typeof selection.toString === "function" ? selection.toString() : "";
  return text.trim().length > 0;
}
