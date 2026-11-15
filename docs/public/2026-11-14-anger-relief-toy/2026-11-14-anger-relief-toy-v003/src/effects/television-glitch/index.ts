/** Original restrained television-interference illustration. Historical lead: attribution.md. */
import type { EffectModule } from "../../sdk/types";
import { effect, snapshot, box, layer } from "../../sdk/visual";
export function bandEdges(index: number): [number, number] {
  const i = Math.min(5, Math.max(0, Math.floor(index)));
  return [(i * 100) / 6, ((i + 1) * 100) / 6];
}
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const rect = target.element.getBoundingClientRect();
      const surface = snapshot(target.element, c);
      c.resources.style(target.element, "visibility", "hidden");
      for (let i = 0; i < 6; i++) {
        const [top, bottom] = bandEdges(i);
        const strip = c.resources.node(c.document.createElement("canvas"));
        const sy = Math.floor((surface.height * top) / 100),
          end = Math.ceil((surface.height * bottom) / 100);
        strip.width = surface.width;
        strip.height = Math.max(1, end - sy);
        strip
          .getContext("2d")
          ?.drawImage(surface, 0, sy, surface.width, strip.height, 0, 0, strip.width, strip.height);
        box(
          strip,
          new DOMRect(
            rect.left,
            rect.top + (rect.height * top) / 100,
            rect.width,
            (rect.height * (bottom - top)) / 100,
          ),
        );
        c.overlay.append(strip);
        Object.assign(strip.style, {
          filter: `drop-shadow(${i % 2 ? 2 : -2}px 0 ${i % 2 ? "#6bcdd5" : "#db8cba"})`,
          transform: `translateX(${i % 2 ? 4 : -4}px)`,
        });
        if (!o.reducedMotion)
          c.resources.animate(
            strip,
            [
              { transform: `translateX(${i % 2 ? 5 : -5}px)` },
              { transform: `translateX(${i % 2 ? -3 : 3}px)` },
              { transform: `translateX(${i % 2 ? 2 : -2}px)` },
            ],
            { duration: 480 + i * 35, easing: "ease-out", fill: "forwards" },
          );
      }
      const scan = layer(c);
      Object.assign(scan.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        pointerEvents: "none",
        background:
          "repeating-linear-gradient(0deg,#24395214 0px,#24395214 1px,transparent 1px,transparent 4px)",
        border: "1px solid #b4a3cb70",
      });
    }),
} satisfies EffectModule;
