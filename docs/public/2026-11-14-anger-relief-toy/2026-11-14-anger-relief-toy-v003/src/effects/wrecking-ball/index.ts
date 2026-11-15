/** Independently reconstructed pendulum concept; Web Pranks: https://github.com/steveja42/webpranks. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, snapshot, random } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const r = target.element.getBoundingClientRect();
      const surface = snapshot(target.element, c);
      c.resources.style(target.element, "visibility", "hidden");
      const x = Math.min(r.right - 12, Math.max(r.left + 12, target.x)),
        y = Math.min(r.bottom, Math.max(r.top, target.y));
      const length = Math.min(180, Math.max(65, y - 16));
      const arm = layer(c);
      Object.assign(arm.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y - length}px`,
        width: "1px",
        height: `${length}px`,
        transformOrigin: "50% 0",
      });
      const chain = c.resources.node(c.document.createElement("div"));
      Object.assign(chain.style, {
        position: "absolute",
        left: "-2px",
        width: "5px",
        height: `${length}px`,
        background: "repeating-linear-gradient(0deg,#64748b 0 5px,#dce5ef 5px 8px)",
        borderRadius: "3px",
      });
      const ball = c.resources.node(c.document.createElement("div"));
      Object.assign(ball.style, {
        position: "absolute",
        left: "-23px",
        bottom: "-23px",
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 25%,#cad6e3,#64748b 40%,#263348 80%)",
        boxShadow: "inset -4px -4px 5px #15213477,0 4px 8px #11182730",
      });
      arm.append(chain, ball);
      const contact = o.reducedMotion ? 0 : 480;
      if (!o.reducedMotion)
        c.resources.animate(
          arm,
          [
            { transform: "rotate(72deg)", easing: "cubic-bezier(.55,.05,.8,.5)" },
            { transform: "rotate(0deg)", offset: 0.48 },
            { transform: "rotate(-18deg)", offset: 0.72 },
            { transform: "rotate(-8deg)", opacity: 0 },
          ],
          { duration: 1000, easing: "linear", fill: "both" },
        );
      else
        c.resources.animate(arm, [{ opacity: 0.7 }, { opacity: 0 }], {
          duration: 450,
          fill: "forwards",
        });
      c.audio?.play("impact", { delay: contact / 1000 });
      c.resources.timeout(() => {
        c.resources.animate(
          surface,
          [
            { transform: "none" },
            {
              transform: `translate(${o.reducedMotion ? 3 : 26 * o.strength}px,5px) rotate(3deg)`,
              offset: 0.2,
            },
            { transform: "translate(-3px,0) rotate(-1deg)", offset: 0.55 },
            { transform: "none" },
          ],
          { duration: 650, easing: "ease-out" },
        );
        const ring = layer(c);
        Object.assign(ring.style, {
          position: "fixed",
          left: `${x - 20}px`,
          top: `${y - 20}px`,
          width: "40px",
          height: "40px",
          border: "3px solid #fbbf24",
          borderRadius: "50%",
        });
        c.resources.animate(
          ring,
          [
            { transform: "scale(.3)", opacity: 1 },
            { transform: `scale(${o.reducedMotion ? 1 : 3})`, opacity: 0 },
          ],
          { duration: 400, fill: "forwards" },
        );
        if (!o.reducedMotion) {
          const rng = random(8301);
          for (let i = 0; i < 12; i++) {
            const p = layer(c);
            Object.assign(p.style, {
              position: "fixed",
              left: `${x}px`,
              top: `${y}px`,
              width: "6px",
              height: "5px",
              borderRadius: "2px",
              background: i % 2 ? "#b5bbc6" : "#f3cf87",
            });
            c.resources.animate(
              p,
              [
                { transform: "none", opacity: 1 },
                {
                  transform: `translate(${(rng() - 0.25) * 120}px,${rng() * 80 - 30}px) rotate(${rng() * 280}deg)`,
                  opacity: 0,
                },
              ],
              { duration: 650, fill: "forwards" },
            );
          }
        }
      }, contact);
    }),
} satisfies EffectModule;
