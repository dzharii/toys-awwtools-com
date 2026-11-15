/** Coordinated-page dance inspired by Moovweb's Harlem Shake bookmarklet, documented by Mozilla Hacks (2014). No music or source reused. */
import type { EffectModule } from "../../sdk/types";
import { effect, snapshot, protectedNode } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "document") throw new Error("TARGET_KIND");
      const chosen: HTMLElement[] = [];
      for (const element of target.elements) {
        if (chosen.length >= 8) break;
        if (
          protectedNode(element) ||
          chosen.some((other) => other.contains(element) || element.contains(other))
        )
          continue;
        const r = element.getBoundingClientRect();
        if (
          r.width < 20 ||
          r.height < 12 ||
          r.bottom < 0 ||
          r.top > (c.document.defaultView?.innerHeight ?? 0)
        )
          continue;
        chosen.push(element);
      }
      if (!chosen.length) throw new Error("NO_TARGETS");
      for (const [i, element] of chosen.entries()) {
        const surface = snapshot(element, c);
        c.resources.style(element, "visibility", "hidden");
        surface.style.transformOrigin = "50% 90%";
        const sign = i % 2 ? 1 : -1,
          amplitude = o.reducedMotion ? 1 : Math.min(10, 4 + o.strength * 3);
        c.resources.animate(
          surface,
          [
            { transform: `rotate(${-sign * amplitude}deg) translateY(0)` },
            {
              transform: `rotate(${sign * amplitude}deg) translateY(-${o.reducedMotion ? 0 : 12}px) scale(1.02,.96)`,
              offset: 0.25,
            },
            { transform: `rotate(${-sign * amplitude}deg) translateY(0)`, offset: 0.5 },
            {
              transform: `rotate(${sign * amplitude}deg) translateY(-${o.reducedMotion ? 0 : 6}px) scale(.98,1.02)`,
              offset: 0.75,
            },
            { transform: `rotate(${-sign * amplitude}deg) translateY(0)` },
          ],
          {
            duration: o.reducedMotion ? 600 : 1200,
            delay: o.reducedMotion ? 0 : i * 75,
            iterations: o.reducedMotion ? 1 : Infinity,
            easing: "ease-in-out",
            fill: "both",
          },
        );
      }
    }),
} satisfies EffectModule;
