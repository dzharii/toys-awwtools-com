import { beginPointerSession } from "./pointer-session";
import type { FloatingWindowGeometry } from "./drag";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface ResizeBehaviorOptions {
  rootElement: HTMLElement;
  getGeometry: () => FloatingWindowGeometry;
  setGeometry: (next: FloatingWindowGeometry) => void;
  bringToFront: () => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  minWidth: number;
  minHeight: number;
  viewportMargin?: number;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizeGeometry(
  geometry: FloatingWindowGeometry,
  direction: ResizeDirection,
  minWidth: number,
  minHeight: number,
  viewportMargin: number
): FloatingWindowGeometry {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = geometry.left;
  let top = geometry.top;
  let right = geometry.left + geometry.width;
  let bottom = geometry.top + geometry.height;

  if (right - left < minWidth) {
    if (direction.includes("w") && !direction.includes("e")) {
      left = right - minWidth;
    } else {
      right = left + minWidth;
    }
  }

  if (bottom - top < minHeight) {
    if (direction.includes("n") && !direction.includes("s")) {
      top = bottom - minHeight;
    } else {
      bottom = top + minHeight;
    }
  }

  if (left < viewportMargin) {
    if (direction.includes("w") && !direction.includes("e")) {
      left = viewportMargin;
    }
  }

  if (top < viewportMargin) {
    if (direction.includes("n") && !direction.includes("s")) {
      top = viewportMargin;
    }
  }

  const maxRight = viewportWidth - viewportMargin;
  const maxBottom = viewportHeight - viewportMargin;

  if (right > maxRight) {
    if (direction.includes("e") && !direction.includes("w")) {
      right = maxRight;
    }
  }

  if (bottom > maxBottom) {
    if (direction.includes("s") && !direction.includes("n")) {
      bottom = maxBottom;
    }
  }

  const width = clamp(right - left, minWidth, Math.max(minWidth, viewportWidth - viewportMargin * 2));
  const height = clamp(bottom - top, minHeight, Math.max(minHeight, viewportHeight - viewportMargin * 2));

  left = clamp(left, viewportMargin, Math.max(viewportMargin, viewportWidth - viewportMargin - width));
  top = clamp(top, viewportMargin, Math.max(viewportMargin, viewportHeight - viewportMargin - height));

  return {
    left,
    top,
    width,
    height
  };
}

export function attachResizeBehavior(options: ResizeBehaviorOptions): () => void {
  const viewportMargin = options.viewportMargin ?? 10;

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const handle = target.closest<HTMLElement>("[data-resize-dir]");
    if (!handle) {
      return;
    }

    const resizeDirection = handle.dataset.resizeDir as ResizeDirection | undefined;
    if (!resizeDirection) {
      return;
    }

    const startGeometry = options.getGeometry();
    options.bringToFront();
    options.onInteractionStart?.();

    beginPointerSession({
      startEvent: event,
      onMove: (deltaX, deltaY) => {
        let left = startGeometry.left;
        let top = startGeometry.top;
        let width = startGeometry.width;
        let height = startGeometry.height;

        if (resizeDirection.includes("e")) {
          width = startGeometry.width + deltaX;
        }

        if (resizeDirection.includes("s")) {
          height = startGeometry.height + deltaY;
        }

        if (resizeDirection.includes("w")) {
          left = startGeometry.left + deltaX;
          width = startGeometry.width - deltaX;
        }

        if (resizeDirection.includes("n")) {
          top = startGeometry.top + deltaY;
          height = startGeometry.height - deltaY;
        }

        const normalized = normalizeGeometry(
          { left, top, width, height },
          resizeDirection,
          options.minWidth,
          options.minHeight,
          viewportMargin
        );

        options.setGeometry(normalized);
      },
      onEnd: () => {
        options.onInteractionEnd?.();
      }
    });
  };

  options.rootElement.addEventListener("pointerdown", onPointerDown);

  return () => {
    options.rootElement.removeEventListener("pointerdown", onPointerDown);
  };
}
