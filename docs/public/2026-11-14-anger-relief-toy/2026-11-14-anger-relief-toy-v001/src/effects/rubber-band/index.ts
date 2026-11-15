/** Original elastic deformation concept from the project brief. Native WAAPI, no dependencies. */
import type { EffectModule } from "../../sdk/types";
import { effect, snapshot } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const surface = snapshot(target.element, c);
      c.resources.style(target.element, "visibility", "hidden");
      const s = o.reducedMotion ? 0.02 : o.strength * 0.28;
      c.resources.animate(
        surface,
        [
          { transform: "scale(1)" },
          { transform: `scale(${1 + s},${1 - s})`, offset: 0.15 },
          { transform: `scale(${1 - s * 0.7},${1 + s * 0.7})`, offset: 0.32 },
          { transform: `scale(${1 + s * 0.45},${1 - s * 0.45})`, offset: 0.5 },
          { transform: `scale(${1 - s * 0.2},${1 + s * 0.2})`, offset: 0.7 },
          { transform: "scale(1)" },
        ],
        { duration: o.reducedMotion ? 300 : 1200, easing: "ease-in-out" },
      );
    }),
} satisfies EffectModule;
