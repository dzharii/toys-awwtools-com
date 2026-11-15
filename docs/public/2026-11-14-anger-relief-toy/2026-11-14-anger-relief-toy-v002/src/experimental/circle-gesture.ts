/** P1 experiment only: not imported into any production entry. Native browser validation is pending. */
import { Resources } from "../sdk/resources";
interface Sample {
  x: number;
  y: number;
  t: number;
}
export class CircleGesture {
  private samples: Sample[] = [];
  reset(): void {
    this.samples = [];
  }
  add(sample: Sample): number {
    const previous = this.samples.at(-1);
    if (
      previous &&
      (sample.t - previous.t > 400 ||
        Math.hypot(sample.x - previous.x, sample.y - previous.y) > 120)
    )
      this.reset();
    this.samples.push(sample);
    if (this.samples.length > 240) this.samples.shift();
    if (this.samples.length < 16) return 0;
    const xs = this.samples.map((p) => p.x),
      ys = this.samples.map((p) => p.y);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs),
      minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const width = maxX - minX,
      height = maxY - minY;
    if (
      Math.min(width, height) < 36 ||
      Math.max(width, height) > 220 ||
      Math.min(width, height) / Math.max(width, height) < 0.6
    )
      return 0;
    const cx = (minX + maxX) / 2,
      cy = (minY + maxY) / 2;
    const radii = this.samples.map((p) => Math.hypot(p.x - cx, p.y - cy));
    const meanRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
    if (Math.min(...radii) < meanRadius * 0.45) return 0;
    let total = 0,
      absolute = 0;
    let angle: number | undefined;
    for (const point of this.samples) {
      const current = Math.atan2(point.y - cy, point.x - cx);
      if (angle !== undefined) {
        let change = current - angle;
        if (change > Math.PI) change -= 2 * Math.PI;
        if (change < -Math.PI) change += 2 * Math.PI;
        total += change;
        absolute += Math.abs(change);
      }
      angle = current;
    }
    if (!absolute || Math.abs(total) / absolute < 0.85) return 0;
    const elapsed = sample.t - this.samples[0]!.t;
    return Math.max(0, Math.min(1, elapsed / 2200, Math.abs(total) / (Math.PI * 4)));
  }
}
/** Explicitly called by the development prototype only. Shift+middle on noninteractive space opts out of native autoscroll for that gesture. */
export function mountCirclePrototype(document: Document, complete: () => void): Resources {
  const r = new Resources();
  const recognizer = new CircleGesture();
  const ring = r.node(document.createElement("div"));
  ring.hidden = true;
  ring.setAttribute("role", "progressbar");
  ring.setAttribute("aria-label", "Wheel gesture progress");
  ring.setAttribute("aria-valuemin", "0");
  ring.setAttribute("aria-valuemax", "100");
  ring.style.cssText =
    "position:fixed;width:40px;height:40px;border-radius:50%;pointer-events:none;z-index:2147483647;border:3px solid #fff;box-shadow:0 2px 8px #2343;";
  document.documentElement.append(ring);
  let active = false;
  const cancel = () => {
    active = false;
    recognizer.reset();
    ring.hidden = true;
  };
  r.listen(
    document,
    "pointerdown",
    (event) => {
      const e = event as PointerEvent;
      if (
        e.button !== 1 ||
        !e.shiftKey ||
        !(e.target instanceof Element) ||
        e.target.closest("a,button,input,select,textarea,[contenteditable]")
      )
        return;
      active = true;
      recognizer.reset();
      e.preventDefault();
    },
    { capture: true },
  );
  r.listen(
    document,
    "pointermove",
    (event) => {
      if (!active) return;
      const e = event as PointerEvent;
      if (!(e.buttons & 4)) {
        cancel();
        return;
      }
      const progress = recognizer.add({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      ring.hidden = false;
      ring.style.left = `${Math.max(8, Math.min(innerWidth - 48, e.clientX + 38))}px`;
      ring.style.top = `${Math.max(8, Math.min(innerHeight - 48, e.clientY + 38))}px`;
      ring.style.background = `conic-gradient(#398a9b ${progress * 360}deg,#e1e9ef 0deg)`;
      ring.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
      if (progress >= 1) {
        cancel();
        complete();
      }
    },
    { passive: true },
  );
  for (const name of ["pointerup", "pointercancel"]) r.listen(document, name, cancel);
  r.listen(window, "blur", cancel);
  r.listen(window, "pagehide", cancel);
  r.own(cancel);
  return r;
}
