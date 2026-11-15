import { Resources } from "../sdk/resources";
export interface Point {
  x: number;
  y: number;
}
export function clampPanel(
  point: Point,
  width: number,
  height: number,
  viewport = { width: innerWidth, height: innerHeight },
): Point {
  return {
    x: Math.max(8, Math.min(Math.max(8, viewport.width - width - 8), point.x)),
    y: Math.max(8, Math.min(Math.max(8, viewport.height - Math.min(height, 96) - 8), point.y)),
  };
}
export function cursorPosition(
  x: number,
  y: number,
  size = 48,
  viewport = { width: innerWidth, height: innerHeight },
): Point {
  return {
    x: Math.max(8, Math.min(viewport.width - size - 8, x + 38)),
    y: Math.max(8, Math.min(viewport.height - size - 8, y + 38)),
  };
}
export function draggable(
  panel: HTMLElement,
  handle: HTMLElement,
  r: Resources,
  initial: Point | undefined,
  moved: (p: Point) => void,
): void {
  let position = initial;
  let drag: { id: number; startX: number; startY: number; origin: Point } | undefined;
  const place = (point: Point) => {
    const rect = panel.getBoundingClientRect();
    position = clampPanel(point, rect.width, rect.height);
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
    panel.style.transform = "none";
    moved(position);
  };
  if (position) place(position);
  const cancel = () => {
    const current = drag;
    drag = undefined;
    if (current && handle.hasPointerCapture?.(current.id)) handle.releasePointerCapture(current.id);
    panel.removeAttribute("data-dragging");
  };
  r.listen(handle, "pointerdown", (event) => {
    const e = event as PointerEvent;
    if (e.button !== 0 || (e.target as Element).closest("button,input,select,a,summary")) return;
    const rect = panel.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: { x: rect.left, y: rect.top },
    };
    handle.setPointerCapture?.(e.pointerId);
    panel.dataset.dragging = "";
    e.preventDefault();
    e.stopPropagation();
  });
  r.listen(handle, "pointermove", (event) => {
    const e = event as PointerEvent;
    if (!drag || drag.id !== e.pointerId) return;
    place({
      x: drag.origin.x + e.clientX - drag.startX,
      y: drag.origin.y + e.clientY - drag.startY,
    });
    e.preventDefault();
    e.stopPropagation();
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    r.listen(handle, name, cancel);
  r.listen(window, "blur", cancel);
  r.listen(window, "resize", () => {
    cancel();
    if (position) place(position);
  });
  r.own(cancel);
  handle.tabIndex = 0;
  handle.title = "Drag to move. Arrow keys move when focused.";
  handle.setAttribute("aria-label", "Move tools window");
  r.listen(handle, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (e.target !== handle || !e.key.startsWith("Arrow")) return;
    const rect = panel.getBoundingClientRect();
    place({
      x: rect.left + (e.key === "ArrowLeft" ? -24 : e.key === "ArrowRight" ? 24 : 0),
      y: rect.top + (e.key === "ArrowUp" ? -24 : e.key === "ArrowDown" ? 24 : 0),
    });
    e.preventDefault();
    e.stopPropagation();
  });
}
