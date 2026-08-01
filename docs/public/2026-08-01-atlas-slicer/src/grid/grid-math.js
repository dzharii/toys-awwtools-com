/**
 * Grid geometry uses integer, zero-based image coordinates and half-open
 * rectangles. Cell dimensions never include separators or outer borders.
 */

function integer(value, fallback = 0) {
  const number = Number(value);
  return Number.isInteger(number) ? number : fallback;
}

export function calculateRequiredCanvasDimension({
  originPixels,
  leadingBorderPixels,
  trailingBorderPixels,
  cellDimensionPixels,
  separatorDimensionPixels,
  cellCount,
}) {
  const separatorCount = Math.max(0, cellCount - 1);
  return originPixels + leadingBorderPixels + cellCount * cellDimensionPixels
    + separatorCount * separatorDimensionPixels + trailingBorderPixels;
}

export function calculateAxisLayout(input) {
  const canvasDimensionPixels = Math.max(1, integer(input.canvasDimensionPixels, 1));
  const originPixels = Math.max(0, integer(input.originPixels));
  const leadingBorderPixels = Math.max(0, integer(input.leadingBorderPixels));
  const trailingBorderPixels = Math.max(0, integer(input.trailingBorderPixels));
  const cellDimensionPixels = Math.max(1, integer(input.cellDimensionPixels, 1));
  const separatorDimensionPixels = Math.max(0, integer(input.separatorDimensionPixels));
  const requestedCellCount = Math.max(1, integer(input.requestedCellCount, 1));
  const availableCellRegionPixels = Math.max(
    0,
    canvasDimensionPixels - originPixels - leadingBorderPixels - trailingBorderPixels,
  );
  const maximumCompleteCellCount = availableCellRegionPixels < cellDimensionPixels
    ? 0
    : Math.floor(
      (availableCellRegionPixels + separatorDimensionPixels)
      / (cellDimensionPixels + separatorDimensionPixels),
    );
  const fixed = input.countMode === "fixed";
  const targetCellCount = fixed ? requestedCellCount : maximumCompleteCellCount;
  const completeCellCount = Math.min(targetCellCount, maximumCompleteCellCount);
  const requiredDimensionPixels = calculateRequiredCanvasDimension({
    originPixels,
    leadingBorderPixels,
    trailingBorderPixels,
    cellDimensionPixels,
    separatorDimensionPixels,
    cellCount: targetCellCount,
  });
  const usedDimensionPixels = completeCellCount === 0
    ? originPixels + leadingBorderPixels + trailingBorderPixels
    : calculateRequiredCanvasDimension({
      originPixels,
      leadingBorderPixels,
      trailingBorderPixels,
      cellDimensionPixels,
      separatorDimensionPixels,
      cellCount: completeCellCount,
    });
  // A separator precedes a potential next cell, so the next start advances by
  // one full stride from the final complete cell's origin.
  const nextCellStartPixels = originPixels + leadingBorderPixels
    + completeCellCount * (cellDimensionPixels + separatorDimensionPixels);
  const canHaveAnotherCell = !fixed || completeCellCount < targetCellCount;
  const partialCellPixels = canHaveAnotherCell
    ? Math.min(
      cellDimensionPixels - 1,
      Math.max(0, canvasDimensionPixels - trailingBorderPixels - nextCellStartPixels),
    )
    : 0;
  const overflowPixels = fixed ? Math.max(0, requiredDimensionPixels - canvasDimensionPixels) : 0;
  const remainderPixels = Math.max(0, canvasDimensionPixels - usedDimensionPixels);

  return {
    canvasDimensionPixels,
    availableCellRegionPixels,
    maximumCompleteCellCount,
    completeCellCount,
    targetCellCount,
    requestedCellCount: fixed ? requestedCellCount : null,
    requiredDimensionPixels,
    usedDimensionPixels,
    remainderPixels,
    overflowPixels,
    nextCellStartPixels,
    partialCellPixels,
    missingPartialCellPixels: partialCellPixels > 0
      ? cellDimensionPixels - partialCellPixels
      : 0,
    exactFit: overflowPixels === 0 && remainderPixels === 0,
  };
}

export function calculateGridLayout(gridDefinition) {
  const border = gridDefinition.outerBorder.enabled
    ? gridDefinition.outerBorder
    : { leftPixels: 0, topPixels: 0, rightPixels: 0, bottomPixels: 0 };
  const horizontal = calculateAxisLayout({
    canvasDimensionPixels: gridDefinition.canvas.widthPixels,
    originPixels: gridDefinition.gridOrigin.xPixels,
    leadingBorderPixels: border.leftPixels,
    trailingBorderPixels: border.rightPixels,
    cellDimensionPixels: gridDefinition.cell.widthPixels,
    separatorDimensionPixels: gridDefinition.separator.widthPixels,
    countMode: gridDefinition.count.columnMode,
    requestedCellCount: gridDefinition.count.requestedColumns,
  });
  const vertical = calculateAxisLayout({
    canvasDimensionPixels: gridDefinition.canvas.heightPixels,
    originPixels: gridDefinition.gridOrigin.yPixels,
    leadingBorderPixels: border.topPixels,
    trailingBorderPixels: border.bottomPixels,
    cellDimensionPixels: gridDefinition.cell.heightPixels,
    separatorDimensionPixels: gridDefinition.separator.heightPixels,
    countMode: gridDefinition.count.rowMode,
    requestedCellCount: gridDefinition.count.requestedRows,
  });
  return {
    horizontal,
    vertical,
    totalCompleteCells: horizontal.completeCellCount * vertical.completeCellCount,
    hasOverflow: horizontal.overflowPixels > 0 || vertical.overflowPixels > 0,
    hasTruncation: horizontal.partialCellPixels > 0 || vertical.partialCellPixels > 0,
    hasUnusedSpace: horizontal.remainderPixels > 0 || vertical.remainderPixels > 0,
    isExactFit: horizontal.exactFit && vertical.exactFit,
  };
}

export function calculateCellRectangle(gridDefinition, columnIndex, rowIndex) {
  const border = gridDefinition.outerBorder.enabled
    ? gridDefinition.outerBorder
    : { leftPixels: 0, topPixels: 0 };
  return {
    x: gridDefinition.gridOrigin.xPixels + border.leftPixels
      + columnIndex * (gridDefinition.cell.widthPixels + gridDefinition.separator.widthPixels),
    y: gridDefinition.gridOrigin.yPixels + border.topPixels
      + rowIndex * (gridDefinition.cell.heightPixels + gridDefinition.separator.heightPixels),
    width: gridDefinition.cell.widthPixels,
    height: gridDefinition.cell.heightPixels,
  };
}

export function enumerateCompleteCells(gridDefinition, layoutResult = calculateGridLayout(gridDefinition)) {
  const cells = [];
  for (let row = 0; row < layoutResult.vertical.completeCellCount; row += 1) {
    for (let column = 0; column < layoutResult.horizontal.completeCellCount; column += 1) {
      cells.push({ row, column, complete: true, sourceRectangle: calculateCellRectangle(gridDefinition, column, row) });
    }
  }
  return cells;
}

function policyIncludesPartial(policy) {
  return policy === "crop" || policy === "pad-transparent" || policy === "pad-color";
}

export function enumerateAtlasCells(gridDefinition, layoutResult = calculateGridLayout(gridDefinition)) {
  const completeColumns = layoutResult.horizontal.completeCellCount;
  const completeRows = layoutResult.vertical.completeCellCount;
  const includePartialColumn = layoutResult.horizontal.partialCellPixels > 0
    && policyIncludesPartial(gridDefinition.atlas.rightEdgePolicy);
  const includePartialRow = layoutResult.vertical.partialCellPixels > 0
    && policyIncludesPartial(gridDefinition.atlas.bottomEdgePolicy);
  const columnCount = completeColumns + (includePartialColumn ? 1 : 0);
  const rowCount = completeRows + (includePartialRow ? 1 : 0);
  const cells = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      const requested = calculateCellRectangle(gridDefinition, column, row);
      const sourceWidth = Math.max(0, Math.min(requested.width, gridDefinition.canvas.widthPixels - requested.x));
      const sourceHeight = Math.max(0, Math.min(requested.height, gridDefinition.canvas.heightPixels - requested.y));
      if (sourceWidth === 0 || sourceHeight === 0) continue;
      const complete = sourceWidth === requested.width && sourceHeight === requested.height;
      const cropWidth = column >= completeColumns && gridDefinition.atlas.rightEdgePolicy === "crop";
      const cropHeight = row >= completeRows && gridDefinition.atlas.bottomEdgePolicy === "crop";
      cells.push({
        row,
        column,
        complete,
        sourceRectangle: { x: requested.x, y: requested.y, width: sourceWidth, height: sourceHeight },
        outputRectangle: {
          width: cropWidth ? sourceWidth : requested.width,
          height: cropHeight ? sourceHeight : requested.height,
        },
      });
    }
  }
  return orderCells(cells, gridDefinition.atlas.traversalOrder);
}

export function orderCells(cells, traversalOrder) {
  return [...cells].sort((a, b) => traversalOrder === "column-major"
    ? a.column - b.column || a.row - b.row
    : a.row - b.row || a.column - b.column);
}

export function findCellAtPoint(gridDefinition, layoutResult, x, y, includePartial = true) {
  const cells = includePartial
    ? enumerateAtlasCells(gridDefinition, layoutResult)
    : enumerateCompleteCells(gridDefinition, layoutResult);
  return cells.find((cell) => {
    const rectangle = cell.sourceRectangle;
    return x >= rectangle.x && x < rectangle.x + rectangle.width
      && y >= rectangle.y && y < rectangle.y + rectangle.height;
  }) || null;
}
