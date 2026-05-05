export function nextSortState(currentSort, columnKey) {
  if (!currentSort || currentSort.columnKey !== columnKey) {
    return { columnKey, direction: "asc" };
  }
  if (currentSort.direction === "asc") return { columnKey, direction: "desc" };
  if (currentSort.direction === "desc") return { columnKey: null, direction: "none" };
  return { columnKey, direction: "asc" };
}

