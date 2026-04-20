import { DEFAULT_GEOMETRY } from "./constants.js";

export function getViewportRect() {
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

export function clampRect(rect, viewport = getViewportRect(), options = DEFAULT_GEOMETRY) {
  const minWidth = options.minWidth ?? DEFAULT_GEOMETRY.minWidth;
  const minHeight = options.minHeight ?? DEFAULT_GEOMETRY.minHeight;
  const minVisibleTitlebar = options.minVisibleTitlebar ?? DEFAULT_GEOMETRY.minVisibleTitlebar;

  const width = Math.max(minWidth, Math.min(rect.width, viewport.width));
  const height = Math.max(minHeight, Math.min(rect.height, viewport.height));

  const maxX = viewport.x + viewport.width - minVisibleTitlebar;
  const minX = viewport.x - width + minVisibleTitlebar;
  const maxY = viewport.y + viewport.height - minVisibleTitlebar;

  const x = Math.min(Math.max(rect.x, minX), maxX);
  const y = Math.min(Math.max(rect.y, viewport.y), maxY);

  return { x, y, width, height };
}

export function getSpawnRect(index = 0, viewport = getViewportRect(), options = DEFAULT_GEOMETRY) {
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

export function rectToStyle(rect) {
  return {
    left: `${Math.round(rect.x)}px`,
    top: `${Math.round(rect.y)}px`,
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`
  };
}
