import { HEALTH_ORDER } from "../app/constants.js";

function getCellForColumn(row, columnKey) {
  return row.values?.[columnKey] ?? null;
}

function comparePrimitive(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base", numeric: true });
}

function compareCells(aCell, bCell) {
  if (!aCell && !bCell) return 0;
  if (!aCell) return 1;
  if (!bCell) return -1;

  const aMissingLike = aCell.state === "missing" || aCell.value == null;
  const bMissingLike = bCell.state === "missing" || bCell.value == null;
  if (aMissingLike && bMissingLike) return 0;
  if (aMissingLike) return 1;
  if (bMissingLike) return -1;

  return comparePrimitive(aCell.value, bCell.value);
}

export function sortRows(rows, sortState) {
  if (!sortState || !sortState.columnKey || sortState.direction === "none") {
    return [...rows].sort((a, b) => a.rowIndex - b.rowIndex);
  }

  const multiplier = sortState.direction === "desc" ? -1 : 1;
  const columnKey = sortState.columnKey;

  const sorted = [...rows];
  sorted.sort((a, b) => {
    let delta = 0;
    if (columnKey === "__health") {
      delta = (HEALTH_ORDER[a.health?.level ?? "unknown"] ?? 9) - (HEALTH_ORDER[b.health?.level ?? "unknown"] ?? 9);
    } else if (columnKey === "__rowNumber") {
      delta = a.rowIndex - b.rowIndex;
    } else {
      delta = compareCells(getCellForColumn(a, columnKey), getCellForColumn(b, columnKey));
    }

    if (delta === 0) return a.rowIndex - b.rowIndex;
    return delta * multiplier;
  });

  return sorted;
}

