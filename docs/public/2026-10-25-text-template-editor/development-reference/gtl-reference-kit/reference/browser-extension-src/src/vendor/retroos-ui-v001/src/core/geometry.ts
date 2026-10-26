// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { DEFAULT_GEOMETRY } from "./constants.js";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GeometryOptions {
  minWidth?: number;
  minHeight?: number;
  minVisibleTitlebar?: number;
  spawnWidth: number;
  spawnHeight: number;
  spawnX: number;
  spawnY: number;
  cascadeStep: number;
}

/** Reads the visual viewport when available so overlays align with pinch-zoomed pages. */
export function getViewportRect(): Rect {
  if (window.visualViewport) {
    return {
      x: window.visualViewport.offsetLeft,
      y: window.visualViewport.offsetTop,
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }

  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/** Constrains a window rectangle while leaving enough titlebar visible to recover it. */
export function clampRect(rect: Rect, viewport = getViewportRect(), options: GeometryOptions = DEFAULT_GEOMETRY): Rect {
  const minWidth = options.minWidth ?? DEFAULT_GEOMETRY.minWidth;
  const minHeight = options.minHeight ?? DEFAULT_GEOMETRY.minHeight;
  const minVisibleTitlebar = options.minVisibleTitlebar ?? DEFAULT_GEOMETRY.minVisibleTitlebar;
  const effectiveMinWidth = Math.min(minWidth, viewport.width);
  const effectiveMinHeight = Math.min(minHeight, viewport.height);

  const width = Math.max(effectiveMinWidth, Math.min(rect.width, viewport.width));
  const height = Math.max(effectiveMinHeight, Math.min(rect.height, viewport.height));

  const maxX = viewport.x + viewport.width - minVisibleTitlebar;
  const minX = viewport.x - width + minVisibleTitlebar;
  const maxY = viewport.y + viewport.height - minVisibleTitlebar;

  const x = Math.min(Math.max(rect.x, minX), maxX);
  const y = Math.min(Math.max(rect.y, viewport.y), maxY);

  return { x, y, width, height };
}

function clampSize(value: number, min: number, max: number): number {
  return Math.max(Math.min(min, max), Math.min(value, max));
}

/** Applies drag deltas to the requested edges, then reuses viewport clamping. */
export function resizeRectFromEdges(startRect: Rect, edge: string, dx: number, dy: number, viewport = getViewportRect(), options: GeometryOptions = DEFAULT_GEOMETRY): Rect {
  const minWidth = options.minWidth ?? DEFAULT_GEOMETRY.minWidth;
  const minHeight = options.minHeight ?? DEFAULT_GEOMETRY.minHeight;
  const effectiveMinWidth = Math.min(minWidth, viewport.width);
  const effectiveMinHeight = Math.min(minHeight, viewport.height);

  const right = startRect.x + startRect.width;
  const bottom = startRect.y + startRect.height;
  let x = startRect.x;
  let y = startRect.y;
  let width = startRect.width;
  let height = startRect.height;

  if (edge.includes("e")) width = clampSize(startRect.width + dx, effectiveMinWidth, viewport.width);
  if (edge.includes("s")) height = clampSize(startRect.height + dy, effectiveMinHeight, viewport.height);
  if (edge.includes("w")) {
    width = clampSize(startRect.width - dx, effectiveMinWidth, viewport.width);
    x = right - width;
  }
  if (edge.includes("n")) {
    height = clampSize(startRect.height - dy, effectiveMinHeight, viewport.height);
    y = bottom - height;
  }

  return clampRect({ x, y, width, height }, viewport, options);
}

/** Cascades new windows from the configured spawn point without leaving the viewport. */
export function getSpawnRect(index = 0, viewport = getViewportRect(), options: GeometryOptions = DEFAULT_GEOMETRY): Rect {
  const width = Math.min(options.spawnWidth, viewport.width - 12);
  const height = Math.min(options.spawnHeight, viewport.height - 12);

  const proposed = {
    x: viewport.x + options.spawnX + index * options.cascadeStep,
    y: viewport.y + options.spawnY + index * options.cascadeStep,
    width,
    height
  };

  return clampRect(proposed, viewport, options);
}

export function rectToStyle(rect: Rect): Partial<CSSStyleDeclaration> {
  return {
    left: `${Math.round(rect.x)}px`,
    top: `${Math.round(rect.y)}px`,
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`
  };
}
