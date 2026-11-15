/** Original comic impact concept from the project brief. No third-party code/assets. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, snapshot, sparks } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const surface = snapshot(target.element, c);
      c.resources.style(target.element, "visibility", "hidden");
      const mark = layer(c);
      mark.textContent = "POW!";
      Object.assign(mark.style, {
        position: "fixed",
        left: `${target.x - 58}px`,
        top: `${target.y - 36}px`,
        font: "italic 900 35px system-ui",
        color: "#442638",
        padding: "14px 19px",
        background: "#ffce69",
        clipPath:
          "polygon(0 32%,22% 26%,19% 0,43% 17%,65% 0,70% 24%,100% 19%,85% 49%,100% 76%,75% 78%,77% 100%,49% 84%,22% 100%,21% 74%,0 75%,13% 51%)",
        filter: "drop-shadow(0 3px 0 #442638)",
      });
      if (!o.reducedMotion) {
        c.resources.animate(
          surface,
          [
            { transform: "scale(1)" },
            {
              transform: `translate(5px,4px) scale(${1 - o.strength * 0.06}) rotate(-1deg)`,
              offset: 0.18,
            },
            { transform: "translate(-3px,-2px) rotate(1deg)", offset: 0.4 },
            { transform: "none" },
          ],
          { duration: 450, easing: "ease-out" },
        );
        c.resources.animate(
          mark,
          [
            { transform: "scale(.15) rotate(-20deg)", opacity: 0 },
            { transform: "scale(1.15) rotate(-12deg)", opacity: 1, offset: 0.25 },
            { transform: "scale(1) rotate(-10deg)", opacity: 1 },
          ],
          { duration: 300 },
        );
        sparks(c, target.x, target.y, "#ffce69", o.strength);
      }
    }),
} satisfies EffectModule;
