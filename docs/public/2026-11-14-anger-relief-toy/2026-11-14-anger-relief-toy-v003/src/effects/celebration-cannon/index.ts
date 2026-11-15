/** Original confetti choreography; collection inspiration: https://github.com/steveja42/webpranks. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, random } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const r = target.element.getBoundingClientRect(),
        rng = random(2042),
        colors = ["#fb7185", "#38bdf8", "#fbbf24", "#a78bfa", "#34d399"];
      const count = o.reducedMotion ? 14 : 56;
      for (let i = 0; i < count; i++) {
        const p = layer(c),
          side = i % 2 ? 1 : -1,
          x = side === 1 ? r.right : r.left,
          y = Math.min(r.bottom, target.y + 36),
          ribbon = i >= 48;
        Object.assign(p.style, {
          position: "fixed",
          left: `${x}px`,
          top: `${y}px`,
          width: `${ribbon ? 5 : 5 + rng() * 5}px`,
          height: `${ribbon ? 32 : 5 + rng() * 9}px`,
          background: colors[i % colors.length],
          borderRadius: ribbon ? "50% 0 50% 0" : "1px",
          boxShadow: ribbon ? "inset 1px 0 #ffffff99" : "none",
        });
        const dx = -side * (35 + rng() * 160),
          up = 50 + rng() * 110,
          spin = (rng() - 0.5) * 900;
        c.resources.animate(
          p,
          o.reducedMotion
            ? [
                {
                  transform: `translate(${(rng() - 0.5) * 80}px,${(rng() - 0.5) * 50}px)`,
                  opacity: 0.8,
                },
                { opacity: 0 },
              ]
            : [
                { transform: "translate(0,0) rotate(0)", opacity: 0 },
                {
                  transform: `translate(${dx * 0.6}px,-${up}px) rotate(${spin * 0.5}deg)`,
                  opacity: 1,
                  offset: 0.32,
                },
                {
                  transform: `translate(${dx}px,${90 + rng() * 80}px) rotate(${spin}deg)`,
                  opacity: 0,
                },
              ],
          {
            duration: o.reducedMotion ? 600 : 1700 + rng() * 300,
            delay: o.reducedMotion ? 0 : rng() * 140,
            fill: "both",
            easing: "cubic-bezier(.2,.45,.5,1)",
          },
        );
      }
      if (!o.reducedMotion)
        for (const side of [-1, 1]) {
          const cone = layer(c);
          Object.assign(cone.style, {
            position: "fixed",
            left: `${(side === 1 ? r.right : r.left) - 10}px`,
            top: `${Math.min(r.bottom, target.y + 36)}px`,
            width: "20px",
            height: "30px",
            background: "linear-gradient(90deg,#a78bfa,#f9a8d4)",
            clipPath: "polygon(0 0,100% 0,50% 100%)",
            transform: `rotate(${side * 25}deg)`,
          });
          c.resources.animate(cone, [{ opacity: 1 }, { opacity: 0 }], {
            duration: 1100,
            fill: "forwards",
          });
        }
    }),
} satisfies EffectModule;
