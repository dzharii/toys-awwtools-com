/** Inspired by fontBomb, Philippe-Antoine Lehoux: https://github.com/plehoux/fontBomb.
 * Independent bounded text illustration. No fontBomb source, assets or dependencies reused. */
import type { EffectModule } from "../../sdk/types";
import { effect, layer, protectedNode, random, sparks } from "../../sdk/visual";
export default {
  sdkVersion: "1.0",
  create: (c) =>
    effect(c, (target, o) => {
      if (target.kind !== "element") throw new Error("TARGET_KIND");
      const bomb = layer(c);
      bomb.textContent = "●";
      Object.assign(bomb.style, {
        position: "fixed",
        left: `${target.x - 18}px`,
        top: `${target.y - 32}px`,
        font: "900 50px system-ui",
        color: "#302c40",
        textShadow: "3px -5px #f3bc68",
      });
      c.resources.timeout(
        () => {
          bomb.remove();
          const rng = random(17);
          const walker = c.document.createTreeWalker(target.element, NodeFilter.SHOW_TEXT);
          let node: Node | null;
          let count = 0;
          while ((node = walker.nextNode()) && count < 65) {
            if (!node.parentElement || protectedNode(node.parentElement)) continue;
            const style = getComputedStyle(node.parentElement);
            const range = c.document.createRange();
            for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
              if (count++ >= 65) break;
              range.setStart(node, match.index);
              range.setEnd(node, match.index + match[0].length);
              const rect = range.getBoundingClientRect();
              if (!rect.width) continue;
              const word = layer(c);
              word.textContent = match[0];
              Object.assign(word.style, {
                position: "fixed",
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                font: style.font,
                color: style.color,
                background: "#fff8ed",
                padding: "1px 3px",
                borderRadius: "3px",
              });
              const dx = (rect.left - target.x) * 1.4 + (rng() - 0.5) * 180;
              c.resources.animate(
                word,
                [
                  { transform: "none", opacity: 1 },
                  {
                    transform: `translate(${o.reducedMotion ? 0 : dx}px,${o.reducedMotion ? 0 : (rng() - 0.4) * 350}px) rotate(${o.reducedMotion ? 0 : (rng() - 0.5) * 100}deg)`,
                    opacity: 0,
                  },
                ],
                {
                  duration: o.reducedMotion ? 600 : 1800,
                  easing: "cubic-bezier(.1,.6,.3,1)",
                  fill: "forwards",
                },
              );
            }
          }
          if (count) c.resources.style(target.element, "visibility", "hidden");
          if (!o.reducedMotion) sparks(c, target.x, target.y, "#f3bc68", o.strength);
        },
        o.reducedMotion ? 100 : 650,
      );
    }),
} satisfies EffectModule;
