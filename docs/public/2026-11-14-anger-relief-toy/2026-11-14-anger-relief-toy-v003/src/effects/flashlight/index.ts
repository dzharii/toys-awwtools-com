/** Behavior reference: Krazete/bookmarklets flashlight, https://github.com/Krazete/bookmarklets.
 * Original radial-gradient implementation; no source reuse. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (_target, o) => {
      const shade = layer(c);
      Object.assign(shade.style, { position: "fixed", inset: "0" });
      const draw = (x: number, y: number) => {
        shade.style.background = `radial-gradient(circle ${o.radius}px at ${x}px ${y}px,transparent ${Math.max(0, o.radius - o.softness)}px,rgba(12,16,29,${o.darkness}) ${o.radius}px)`;
      };
      draw(innerWidth / 2, innerHeight / 2);
      c.resources.listen(
        c.document,
        "pointermove",
        (event) => {
          if (c.inputAllowed && !c.inputAllowed()) return;
          const e = event as PointerEvent;
          x = e.clientX;
          y = e.clientY;
          draw(x, y);
        },
        { passive: true },
      );
      let x = innerWidth / 2,
        y = innerHeight / 2;
      c.resources.listen(
        c.document,
        "keydown",
        (event) => {
          if (c.inputAllowed && !c.inputAllowed()) return;
          const e = event as KeyboardEvent;
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          x = Math.max(
            0,
            Math.min(
              innerWidth,
              x + (e.key === "ArrowRight" ? 30 : e.key === "ArrowLeft" ? -30 : 0),
            ),
          );
          y = Math.max(
            0,
            Math.min(innerHeight, y + (e.key === "ArrowDown" ? 30 : e.key === "ArrowUp" ? -30 : 0)),
          );
          draw(x, y);
        },
        { capture: true },
      );
    }),
} satisfies EffectModule;
