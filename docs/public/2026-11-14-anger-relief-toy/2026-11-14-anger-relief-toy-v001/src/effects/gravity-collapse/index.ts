/** Behavior reference: Mr.doob, Google Gravity.
 * https://mrdoob.com/projects/chromeexperiments/google-gravity/ . Independent bounded simulation. */
import type { EffectModule } from "../../sdk/types";
import { effect, snapshot } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "document") throw new Error("TARGET_KIND");
      const bodies = target.elements.slice(0, 12).map((el, i) => {
        const rect = el.getBoundingClientRect();
        const surface = snapshot(el, c);
        c.resources.style(el, "visibility", "hidden");
        return {
          surface,
          y: 0,
          v: 0,
          floor: Math.max(0, innerHeight - rect.bottom - 12),
          angle: (i % 2 ? 1 : -1) * (2 + i),
          rest: false,
        };
      });
      if (o.reducedMotion) {
        for (const b of bodies) b.surface.style.transform = "translateY(5px)";
        return;
      }
      c.resources.frame((_t, dt) => {
        for (const b of bodies) {
          if (b.rest) continue;
          b.v += 0.0012 * (0.4 + o.strength) * dt;
          b.y += b.v * dt;
          if (b.y >= b.floor) {
            b.y = b.floor;
            b.v *= -0.42;
            if (Math.abs(b.v) < 0.09) b.rest = true;
          }
          b.surface.style.transform = `translateY(${b.y}px) rotate(${b.angle * Math.min(1, b.y / 100)}deg)`;
        }
        return bodies.some((b) => !b.rest);
      });
    }),
} satisfies EffectModule;
