/** Behavioral inspiration: James P. Burke, Burn the Web, https://github.com/JamesPBurke/burnit. Original implementation. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, snapshot, random } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const r = target.element.getBoundingClientRect(),
        surface = snapshot(target.element, c),
        rng = random(9123);
      c.resources.style(target.element, "visibility", "hidden");
      c.resources.animate(
        surface,
        [
          { filter: "sepia(0)", clipPath: "inset(0 0 0 0)", opacity: 1 },
          {
            filter: "sepia(1) brightness(.3)",
            clipPath: "inset(0 0 0 0)",
            opacity: 1,
            offset: 0.28,
          },
          { filter: "sepia(1) brightness(.1)", clipPath: "inset(0 0 100% 0)", opacity: 0 },
        ],
        { duration: o.reducedMotion ? 650 : 2100, fill: "forwards", easing: "ease-in" },
      );
      const front = layer(c);
      Object.assign(front.style, {
        position: "fixed",
        left: `${r.left}px`,
        top: `${r.bottom - 14}px`,
        width: `${r.width}px`,
        height: "22px",
        background: "linear-gradient(0deg,transparent,#ff6b22 35%,#ffe790 65%,transparent)",
        filter: "drop-shadow(0 0 7px #ff8024)",
        borderRadius: "45%",
      });
      c.resources.animate(
        front,
        [
          { transform: "none", opacity: 0 },
          { transform: "none", opacity: 1, offset: 0.25 },
          { transform: `translateY(-${o.reducedMotion ? 0 : r.height}px)`, opacity: 0 },
        ],
        { duration: o.reducedMotion ? 650 : 2100, fill: "forwards" },
      );
      if (!o.reducedMotion)
        for (let i = 0; i < 24; i++) {
          const p = layer(c),
            size = 3 + rng() * 8;
          Object.assign(p.style, {
            position: "fixed",
            left: `${r.left + rng() * r.width}px`,
            top: `${r.bottom - rng() * r.height * 0.7}px`,
            width: `${size}px`,
            height: `${size * 1.8}px`,
            borderRadius: "60% 5% 60% 40%",
            background: i % 3 ? "linear-gradient(#fff3b5,#ff6b20)" : "#6d5f62",
          });
          c.resources.animate(
            p,
            [
              { transform: "scale(.2)", opacity: 0 },
              { opacity: 0.9, offset: 0.15 },
              {
                transform: `translate(${(rng() - 0.5) * 55}px,-${60 + rng() * 90}px) rotate(${rng() * 100}deg) scale(.2)`,
                opacity: 0,
              },
            ],
            { duration: 900 + rng() * 500, delay: rng() * 650, fill: "both", easing: "ease-out" },
          );
        }
      c.audio?.play("crackle", { delay: 0.22 });
    }),
} satisfies EffectModule;
