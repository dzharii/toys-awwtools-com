export interface PointerSessionOptions {
  startEvent: PointerEvent;
  onMove: (deltaX: number, deltaY: number, moveEvent: PointerEvent) => void;
  onEnd?: (endEvent: PointerEvent) => void;
}

export function beginPointerSession(options: PointerSessionOptions): void {
  const { startEvent, onMove, onEnd } = options;
  if (startEvent.button !== 0) {
    return;
  }

  const pointerId = startEvent.pointerId;
  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  const target = startEvent.currentTarget;

  if (target instanceof Element && "setPointerCapture" in target) {
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // Pointer capture is best-effort only.
    }
  }

  const onPointerMove = (moveEvent: PointerEvent): void => {
    if (moveEvent.pointerId !== pointerId) {
      return;
    }
    moveEvent.preventDefault();
    onMove(moveEvent.clientX - startX, moveEvent.clientY - startY, moveEvent);
  };

  const finish = (endEvent: PointerEvent): void => {
    if (endEvent.pointerId !== pointerId) {
      return;
    }

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", finish);
    window.removeEventListener("pointercancel", finish);

    if (target instanceof Element && "releasePointerCapture" in target) {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // Best-effort release only.
      }
    }

    if (onEnd) {
      onEnd(endEvent);
    }
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", finish);
  window.addEventListener("pointercancel", finish);

  startEvent.preventDefault();
}
