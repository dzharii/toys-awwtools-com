/** Original bounded snow field. Historical description lead: attribution.md. */
import type { EffectModule } from "../../sdk/types";
import { effect, random } from "../../sdk/visual";
export function makeFlakes(count = 64) {
  const rng = random(417);
  return Array.from({ length: Math.min(64, Math.max(0, Math.floor(count))) }, () => ({
    x: rng(),
    y: rng(),
    r: 1.2 + rng() * 2.5,
    speed: 10 + rng() * 19,
    phase: rng() * Math.PI * 2,
  }));
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
      const flakes = makeFlakes();
      let width = 1,
        height = 1,
        last = -100;
      const draw = (elapsed: number) => {
        const seconds = elapsed / 1000;
        ctx.clearRect(0, 0, width, height);
        for (const flake of flakes) {
          const x =
            (flake.x * width + Math.sin(seconds * 0.3 + flake.phase) * 24 + seconds * 5) %
            (width + 20);
          const y = (flake.y * height + seconds * flake.speed) % (height + 12);
          ctx.beginPath();
          ctx.arc(x, y, flake.r, 0, Math.PI * 2);
          ctx.fillStyle = "#eef7ffdc";
          ctx.shadowColor = "#7fa5c190";
          ctx.shadowBlur = 2;
          ctx.fill();
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
        draw(0);
      };
      resize();
      if (c.document.defaultView)
        c.resources.listen(c.document.defaultView, "resize", resize, { passive: true });
      if (!o.reducedMotion)
        c.resources.frame((elapsed) => {
          if (elapsed - last >= 1000 / 30) {
            draw(elapsed);
            last = elapsed;
          }
          return true;
        });
    }),
} satisfies EffectModule;
