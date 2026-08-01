function rgba(hex, opacity) {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function fillPatternedLine(context, x, y, width, height, style, horizontal) {
  if (style === "solid") {
    context.fillRect(x, y, width, height);
    return;
  }
  const thickness = horizontal ? height : width;
  const segment = style === "dashed" ? Math.max(2, thickness * 4) : Math.max(1, thickness);
  const gap = style === "dashed" ? segment : Math.max(1, thickness * 2);
  const length = horizontal ? width : height;
  for (let offset = 0; offset < length; offset += segment + gap) {
    if (horizontal) context.fillRect(x + offset, y, Math.min(segment, length - offset), height);
    else context.fillRect(x, y + offset, width, Math.min(segment, length - offset));
  }
}

export function renderGrid(context, gridDefinition, layoutResult, includeBackground = true) {
  const { widthPixels: width, heightPixels: height } = gridDefinition.canvas;
  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = false;
  if (includeBackground && gridDefinition.background.mode === "solid") {
    context.fillStyle = rgba(gridDefinition.background.color, gridDefinition.background.opacity);
    context.fillRect(0, 0, width, height);
  }
  const border = gridDefinition.outerBorder.enabled
    ? gridDefinition.outerBorder
    : { leftPixels: 0, topPixels: 0, rightPixels: 0, bottomPixels: 0 };
  const gridLeft = gridDefinition.gridOrigin.xPixels;
  const gridTop = gridDefinition.gridOrigin.yPixels;
  const gridWidth = Math.min(width - gridLeft, layoutResult.horizontal.usedDimensionPixels - gridLeft);
  const gridHeight = Math.min(height - gridTop, layoutResult.vertical.usedDimensionPixels - gridTop);
  context.fillStyle = rgba(gridDefinition.gridAppearance.lineColor, gridDefinition.gridAppearance.lineOpacity);
  if (border.leftPixels) context.fillRect(gridLeft, gridTop, border.leftPixels, gridHeight);
  if (border.topPixels) context.fillRect(gridLeft, gridTop, gridWidth, border.topPixels);
  if (border.rightPixels) context.fillRect(gridLeft + gridWidth - border.rightPixels, gridTop, border.rightPixels, gridHeight);
  if (border.bottomPixels) context.fillRect(gridLeft, gridTop + gridHeight - border.bottomPixels, gridWidth, border.bottomPixels);
  const contentLeft = gridLeft + border.leftPixels;
  const contentTop = gridTop + border.topPixels;
  const style = gridDefinition.gridAppearance.lineStyle;
  for (let column = 1; column < layoutResult.horizontal.completeCellCount; column += 1) {
    const x = contentLeft + column * gridDefinition.cell.widthPixels
      + (column - 1) * gridDefinition.separator.widthPixels;
    fillPatternedLine(context, x, gridTop, gridDefinition.separator.widthPixels, gridHeight, style, false);
  }
  for (let row = 1; row < layoutResult.vertical.completeCellCount; row += 1) {
    const y = contentTop + row * gridDefinition.cell.heightPixels
      + (row - 1) * gridDefinition.separator.heightPixels;
    fillPatternedLine(context, gridLeft, y, gridWidth, gridDefinition.separator.heightPixels, style, true);
  }
}

export function renderAtlasOverlay(context, gridDefinition, layoutResult, selectedCell, showGrid) {
  const { widthPixels: width, heightPixels: height } = gridDefinition.canvas;
  context.clearRect(0, 0, width, height);
  if (showGrid) renderGrid(context, gridDefinition, layoutResult, false);
  if (selectedCell) {
    const rectangle = selectedCell.sourceRectangle;
    context.fillStyle = "rgba(251, 191, 36, 0.16)";
    context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    context.strokeStyle = "#fbbf24";
    context.lineWidth = Math.max(1, Math.min(rectangle.width, rectangle.height) / 16);
    context.strokeRect(rectangle.x + 0.5, rectangle.y + 0.5, rectangle.width - 1, rectangle.height - 1);
  }
}
