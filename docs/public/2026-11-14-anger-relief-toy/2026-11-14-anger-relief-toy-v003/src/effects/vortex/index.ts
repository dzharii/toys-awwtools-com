/** Original implosion concept from the project brief. No external implementation or assets. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, snapshot } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const surface = snapshot(target.element, c);
      c.resources.style(target.element, "visibility", "hidden");
      const rect = target.element.getBoundingClientRect();
      surface.style.transformOrigin = `${target.x - rect.left}px ${target.y - rect.top}px`;
      const hole = layer(c);
      Object.assign(hole.style, {
        position: "fixed",
        left: `${target.x - 28}px`,
        top: `${target.y - 28}px`,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#25233d",
        boxShadow: "0 0 0 5px #9da7ef88,0 0 38px 12px #9da7ef66",
      });
      c.resources.animate(
        surface,
        [
          { transform: "none", opacity: 1 },
          {
            transform: `scale(.01) rotate(${o.reducedMotion ? 0 : 360 * o.strength}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: o.reducedMotion ? 600 : 1600,
          easing: "cubic-bezier(.6,0,.7,.1)",
          fill: "forwards",
        },
      );
      if (!o.reducedMotion)
        c.resources.animate(
          hole,
          [
            { transform: "scale(.2)" },
            { transform: "scale(1.2)", offset: 0.5 },
            { transform: "scale(.6)" },
          ],
          { duration: 1700, easing: "ease-in-out" },
        );
    }),
} satisfies EffectModule;
