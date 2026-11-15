/** Original liquid-paint geometry; no third-party code or assets. See attribution.md. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, random } from "../../sdk/visual";
export function splatPoints(seed: number): string {
  const rng = random(seed);
  return Array.from({ length: 32 }, (_, i) => {
    const a = (i * Math.PI) / 16;
    const r = i % 2 ? 34 + rng() * 8 : 44 + rng() * 6;
    return `${50 + Math.cos(a) * r}% ${50 + Math.sin(a) * r}%`;
  }).join(",");
}
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const rng = random(Math.floor(target.x + target.y));
      const hue = Math.floor(rng() * 360);
      const color = `hsl(${hue} 79% 62%)`;
      const splat = layer(c);
      Object.assign(splat.style, {
        position: "fixed",
        left: `${target.x - 77}px`,
        top: `${target.y - 65}px`,
        width: "154px",
        height: "130px",
        background: `radial-gradient(ellipse at 36% 29%,hsl(${hue} 90% 83%),${color} 45%,hsl(${hue} 65% 46%))`,
        clipPath: `polygon(${splatPoints(93)})`,
        opacity: ".92",
        pointerEvents: "none",
      });
      if (!o.reducedMotion)
        c.resources.animate(
          splat,
          [
            { transform: "scale(.08)" },
            { transform: "scale(1.08)", offset: 0.6 },
            { transform: "scale(1)" },
          ],
          { duration: 340, easing: "cubic-bezier(.15,.8,.25,1)", fill: "forwards" },
        );
      for (let i = 0; i < 18; i++) {
        const a = rng() * Math.PI * 2;
        const distance = 55 + rng() * 75;
        const dx = Math.cos(a) * distance,
          dy = Math.sin(a) * distance;
        const drop = layer(c);
        Object.assign(drop.style, {
          position: "fixed",
          left: `${target.x}px`,
          top: `${target.y}px`,
          width: `${4 + rng() * 10}px`,
          height: `${7 + rng() * 13}px`,
          borderRadius: "70% 45% 60% 50%",
          background: color,
          boxShadow: "inset 1px 2px 1px #ffffff65",
          pointerEvents: "none",
          transform: `translate(${dx}px,${dy}px) rotate(${(a * 180) / Math.PI}deg)`,
        });
        if (!o.reducedMotion)
          c.resources.animate(
            drop,
            [
              { transform: "translate(0,0) scale(.2)", opacity: 1 },
              {
                transform: `translate(${dx}px,${dy}px) rotate(${(a * 180) / Math.PI}deg)`,
                opacity: 0.9,
              },
            ],
            { duration: 440 + rng() * 200, easing: "cubic-bezier(.1,.65,.3,1)", fill: "forwards" },
          );
      }
    }),
} satisfies EffectModule;
