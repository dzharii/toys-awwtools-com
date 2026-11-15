/** Independent layered-page concept; DevBubba historical lead is unavailable. See attribution.md. */
import type { EffectModule } from "../../sdk/types";
import { effect, protectedNode, snapshot } from "../../sdk/visual";
export function depthFor(index: number): number {
  return 12 + Math.min(9, Math.max(0, index)) * 9;
}
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "document") throw new Error("TARGET_KIND");
      const candidates = target.elements.filter((e) => e.isConnected && !protectedNode(e));
      const surfaces = candidates
        .filter((e) => !candidates.some((other) => other !== e && other.contains(e)))
        .slice(0, 10)
        .map((element, index) => {
          const surface = snapshot(element, c);
          c.resources.style(element, "visibility", "hidden");
          Object.assign(surface.style, {
            borderRadius: "9px",
            outline: "1px solid #b7c9e099",
            boxShadow: `${5 + index}px ${8 + index}px 20px #18345024`,
            transformOrigin: "center",
            transition: o.reducedMotion ? "none" : "transform 90ms linear",
          });
          return { surface, depth: depthFor(index) };
        });
      const move = (x: number, y: number) =>
        surfaces.forEach(({ surface, depth }) => {
          surface.style.transform = `perspective(1100px) translate3d(${x * depth * 0.32}px,${y * depth * 0.25}px,${depth}px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
        });
      move(o.reducedMotion ? 0 : 0.25, o.reducedMotion ? 0 : -0.2);
      if (!o.reducedMotion)
        c.resources.listen(
          c.document,
          "pointermove",
          (e) => {
            if (c.inputAllowed && !c.inputAllowed()) return;
            const p = e as PointerEvent;
            const view = c.document.defaultView;
            move(
              Math.max(-1, Math.min(1, (p.clientX / (view?.innerWidth || 1)) * 2 - 1)),
              Math.max(-1, Math.min(1, (p.clientY / (view?.innerHeight || 1)) * 2 - 1)),
            );
          },
          { passive: true },
        );
    }),
} satisfies EffectModule;
