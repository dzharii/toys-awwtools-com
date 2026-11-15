/** Original spiderweb geometry from the project brief. No external code/assets. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, random } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (_target, o) => {
      const canvas = layer(c, "canvas") as HTMLCanvasElement;
      canvas.width = Math.min(innerWidth, 2400);
      canvas.height = Math.min(innerHeight, 1600);
      Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%" });
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
      const rng = random(113);
      const x = canvas.width * 0.52,
        y = canvas.height * 0.44;
      for (let i = 0; i < 13; i++) {
        const a = (i * Math.PI * 2) / 13;
        let px = x,
          py = y;
        for (let j = 1; j <= 5; j++) {
          const length = j * (45 + o.strength * 50);
          const nx = x + Math.cos(a + (rng() - 0.5) * 0.22) * length,
            ny = y + Math.sin(a + (rng() - 0.5) * 0.22) * length;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx, ny);
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#fff9";
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px + 1, py + 1);
          ctx.lineTo(nx + 1, ny + 1);
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = "#22324bbb";
          ctx.stroke();
          if (j % 2 === 0) {
            ctx.lineTo(nx + Math.cos(a + 0.5) * 32, ny + Math.sin(a + 0.5) * 32);
            ctx.stroke();
          }
          px = nx;
          py = ny;
        }
      }
      if (!o.reducedMotion)
        c.resources.animate(canvas, [{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
    }),
} satisfies EffectModule;
