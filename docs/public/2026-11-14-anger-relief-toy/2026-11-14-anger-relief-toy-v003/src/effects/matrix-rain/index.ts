/** Original fictional character rain. Concept credit: criminalpear collection; attribution.md. */
import type { EffectModule } from "../../sdk/types";
import { effect, random } from "../../sdk/visual";
const symbols = "01:+<>/{}=[]";
export function makeColumns(width: number) {
  const rng = random(883);
  return Array.from({ length: Math.min(48, Math.max(1, Math.floor(width / 27))) }, (_, index) => ({
    index,
    phase: rng(),
    speed: 14 + rng() * 24,
    seed: Math.floor(rng() * symbols.length),
  }));
}
export function glyphAt(seed: number, index: number): string {
  return (
    symbols[((Math.floor(seed + index) % symbols.length) + symbols.length) % symbols.length] ?? "0"
  );
}
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "viewport") throw new Error("TARGET_KIND");
      const canvas = c.resources.node(c.document.createElement("canvas"));
      Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      });
      c.overlay.append(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
      let width = 1,
        height = 1,
        last = -100;
      let columns = makeColumns(920);
      const draw = (elapsed: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.font = "14px ui-monospace,monospace";
        ctx.textBaseline = "top";
        for (const col of columns) {
          const x = ((col.index + 0.5) * width) / columns.length;
          const head = (col.phase * (height + 260) + (elapsed / 1000) * col.speed) % (height + 260);
          for (let row = 0; row < 14; row++) {
            const y = head - row * 18;
            if (y < 0 || y > height) continue;
            ctx.fillStyle = `rgba(52,145,105,${0.52 - row * 0.029})`;
            ctx.fillText(glyphAt(col.seed, row), x, y);
          }
        }
      };
      const resize = () => {
        width = canvas.width = Math.max(
          1,
          Math.min(1600, c.document.defaultView?.innerWidth || 920),
        );
        height = canvas.height = Math.max(
          1,
          Math.min(1000, c.document.defaultView?.innerHeight || 720),
        );
        columns = makeColumns(width);
        draw(0);
      };
      resize();
      if (c.document.defaultView)
        c.resources.listen(c.document.defaultView, "resize", resize, { passive: true });
      if (!o.reducedMotion)
        c.resources.frame((elapsed) => {
          if (elapsed - last >= 1000 / 24) {
            draw(elapsed);
            last = elapsed;
          }
          return true;
        });
    }),
} satisfies EffectModule;
