import { beginPointerSession } from "./pointer-session";

export interface FloatingWindowGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ViewportBounds {
  width: number;
  height: number;
}

export interface DragBehaviorOptions {
  dragHandle: HTMLElement;
  getGeometry: () => FloatingWindowGeometry;
  onPreviewOffset: (deltaX: number, deltaY: number) => void;
  onCommitGeometry: (next: FloatingWindowGeometry) => void;
  bringToFront: () => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  viewportMargin?: number;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getViewportBounds(): ViewportBounds {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function clampPosition(geometry: FloatingWindowGeometry, viewportMargin: number): FloatingWindowGeometry {
  const viewport = getViewportBounds();

  const minLeft = viewportMargin;
  const maxLeft = viewport.width - geometry.width - viewportMargin;
  const minTop = viewportMargin;
  const maxTop = viewport.height - geometry.height - viewportMargin;

  const left =
    maxLeft < minLeft ? Math.round((viewport.width - geometry.width) / 2) : clamp(geometry.left, minLeft, maxLeft);

  const top =
    maxTop < minTop ? Math.round((viewport.height - geometry.height) / 2) : clamp(geometry.top, minTop, maxTop);

  return {
    ...geometry,
    left,
    top
  };
}

export function attachDragBehavior(options: DragBehaviorOptions): () => void {
  const viewportMargin = options.viewportMargin ?? 10;

  const onPointerDown = (event: PointerEvent): void => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("button")) {
      return;
    }

    options.bringToFront();
    const startGeometry = options.getGeometry();
    let latestGeometry = startGeometry;
    options.onInteractionStart?.();

    beginPointerSession({
      startEvent: event,
      onMove: (deltaX, deltaY) => {
        const unclamped: FloatingWindowGeometry = {
          ...startGeometry,
          left: startGeometry.left + deltaX,
          top: startGeometry.top + deltaY
        };
        latestGeometry = clampPosition(unclamped, viewportMargin);
        options.onPreviewOffset(latestGeometry.left - startGeometry.left, latestGeometry.top - startGeometry.top);
      },
      onEnd: () => {
        options.onPreviewOffset(0, 0);
        options.onCommitGeometry(latestGeometry);
        options.onInteractionEnd?.();
      }
    });
  };

  options.dragHandle.addEventListener("pointerdown", onPointerDown);

  return () => {
    options.dragHandle.removeEventListener("pointerdown", onPointerDown);
  };
}
