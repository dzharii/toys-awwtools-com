export function createRecommendations(gridDefinition, layoutResult) {
  if (layoutResult.hasOverflow) {
    const width = layoutResult.horizontal.requiredDimensionPixels;
    const height = layoutResult.vertical.requiredDimensionPixels;
    return [{
      id: "increase-canvas",
      severity: "warning",
      title: `Increase the canvas to ${width} x ${height} px`,
      explanation: "The fixed cell count does not fit the current canvas.",
      changes: { width, height },
    }];
  }
  if (layoutResult.hasTruncation) {
    const width = layoutResult.horizontal.partialCellPixels > 0
      ? layoutResult.horizontal.nextCellStartPixels + gridDefinition.cell.widthPixels
        + (gridDefinition.outerBorder.enabled ? gridDefinition.outerBorder.rightPixels : 0)
      : gridDefinition.canvas.widthPixels;
    const height = layoutResult.vertical.partialCellPixels > 0
      ? layoutResult.vertical.nextCellStartPixels + gridDefinition.cell.heightPixels
        + (gridDefinition.outerBorder.enabled ? gridDefinition.outerBorder.bottomPixels : 0)
      : gridDefinition.canvas.heightPixels;
    return [{
      id: "complete-partial-cell",
      severity: "warning",
      title: `Complete the partial edge at ${width} x ${height} px`,
      explanation: "A potential next cell has started but does not contain all requested pixels.",
      changes: { width, height },
    }];
  }
  if (layoutResult.totalCompleteCells === 0) {
    return [{
      id: "zero-cells",
      severity: "warning",
      title: "No complete cells fit",
      explanation: "Reduce the cell size or increase the canvas dimensions.",
      changes: null,
    }];
  }
  if (layoutResult.hasUnusedSpace) {
    return [{
      id: "trim-canvas",
      severity: "suggestion",
      title: `Trim the canvas to ${layoutResult.horizontal.usedDimensionPixels} x ${layoutResult.vertical.usedDimensionPixels} px`,
      explanation: "This produces an exact fit without changing cell geometry.",
      changes: {
        width: layoutResult.horizontal.usedDimensionPixels,
        height: layoutResult.vertical.usedDimensionPixels,
      },
    }];
  }
  return [{
    id: "exact-fit",
    severity: "information",
    title: "Your grid is an exact fit",
    explanation: "Every requested cell fits with no unused edge pixels.",
    changes: null,
  }];
}
