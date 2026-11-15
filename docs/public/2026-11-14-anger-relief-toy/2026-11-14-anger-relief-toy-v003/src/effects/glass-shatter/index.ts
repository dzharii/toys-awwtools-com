/** Behavior inspiration: Aaron Beall, Fracture, https://github.com/aaronbeall/fracture.
 * Independent fan-triangle implementation; no original code or assets incorporated. */
import type { EffectModule } from "../../sdk/types";
import { copySurface, effect, random, snapshot } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const rect = target.element.getBoundingClientRect();
      const source = snapshot(target.element, c);
      c.audio?.play("scatter", { delay: 0.07 });
      const rng = random(93);
      const cx = Math.max(10, Math.min(90, ((target.x - rect.left) / rect.width) * 100));
      const cy = Math.max(10, Math.min(90, ((target.y - rect.top) / rect.height) * 100));
      const rim = [
        [0, 0],
        [25, 0],
        [60, 0],
        [100, 0],
        [100, 40],
        [100, 100],
        [65, 100],
        [30, 100],
        [0, 100],
        [0, 45],
      ];
      for (let i = 0; i < rim.length; i++) {
        const a = rim[i]!;
        const b = rim[(i + 1) % rim.length]!;
        const shard = copySurface(c, source, rect);
        shard.style.clipPath = `polygon(${cx}% ${cy}%,${a[0]}% ${a[1]}%,${b[0]}% ${b[1]}%)`;
        shard.style.filter = "drop-shadow(1px 2px 1px #7990aa)";
        const dx = ((a[0]! + b[0]!) / 2 - cx) * (1 + o.strength * 2);
        const dy = 120 + rng() * 160 * o.strength;
        c.resources.animate(
          shard,
          [
            { transform: "none", opacity: 1 },
            {
              transform: `translate(${dx}px,${o.reducedMotion ? 4 : dy}px) rotate(${o.reducedMotion ? 0 : (rng() - 0.5) * 100}deg)`,
              opacity: 0.7,
              offset: 0.7,
            },
            {
              transform: `translate(${dx * 1.2}px,${o.reducedMotion ? 4 : dy * 1.6}px)`,
              opacity: 0,
            },
          ],
          {
            duration: o.reducedMotion ? 700 : 1900,
            easing: "cubic-bezier(.32,.05,.75,.5)",
            fill: "forwards",
          },
        );
      }
      source.remove();
      c.resources.style(target.element, "visibility", "hidden");
    }),
} satisfies EffectModule;
