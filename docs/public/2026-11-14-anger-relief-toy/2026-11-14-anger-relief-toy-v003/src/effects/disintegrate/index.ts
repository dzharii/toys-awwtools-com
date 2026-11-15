/** Independent surface-particle reconstruction inspired by Zach Saucier: https://github.com/ZachSaucier/Disintegrate. */
import type { EffectModule } from "../../sdk/types";
import { effect, box, snapshot, random } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const r = target.element.getBoundingClientRect(),
        source = snapshot(target.element, c),
        rng = random(1769);
      c.resources.style(target.element, "visibility", "hidden");
      const cols = o.reducedMotion ? 5 : 10,
        rows = o.reducedMotion ? 3 : 6;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const tile = c.resources.node(c.document.createElement("canvas"));
          const sx = Math.floor((x * source.width) / cols),
            sy = Math.floor((y * source.height) / rows),
            sw = Math.ceil(source.width / cols),
            sh = Math.ceil(source.height / rows);
          tile.width = sw;
          tile.height = sh;
          tile.getContext("2d")?.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
          box(
            tile,
            new DOMRect(
              r.left + (x * r.width) / cols,
              r.top + (y * r.height) / rows,
              r.width / cols + 0.5,
              r.height / rows + 0.5,
            ),
          );
          c.overlay.append(tile);
          const distance = o.reducedMotion ? 0 : 55 + rng() * 110;
          c.resources.animate(
            tile,
            [
              { transform: "none", opacity: 1, filter: "blur(0)" },
              {
                transform: `translate(${distance * 0.4}px,-${distance * 0.2}px) scale(.9)`,
                opacity: 0.9,
                offset: 0.3,
              },
              {
                transform: `translate(${distance}px,-${distance * 0.6}px) rotate(${o.reducedMotion ? 0 : (rng() - 0.5) * 60}deg) scale(.05)`,
                opacity: 0,
                filter: "blur(1px)",
              },
            ],
            {
              duration: o.reducedMotion ? 450 : 1300,
              delay: o.reducedMotion ? 0 : x * 45 + rng() * 110,
              easing: "cubic-bezier(.2,.4,.3,1)",
              fill: "both",
            },
          );
        }
      source.remove();
      source.width = 1;
      source.height = 1;
    }),
} satisfies EffectModule;
