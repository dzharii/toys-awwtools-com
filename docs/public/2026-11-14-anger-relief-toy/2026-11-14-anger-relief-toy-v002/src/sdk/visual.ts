import type { EffectContext, EffectInstance, EffectTarget, Options } from "./types";
export function effect(
  context: EffectContext,
  start: (target: EffectTarget, options: Options) => void,
): EffectInstance {
  return {
    start,
    stop: () => context.resources.dispose(),
    dispose: () => context.resources.dispose(),
  };
}
export function box(element: HTMLElement, rect: DOMRect): void {
  Object.assign(element.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    pointerEvents: "none",
  });
}
export function layer(context: EffectContext, tag = "div"): HTMLElement {
  const node = context.resources.node(context.document.createElement(tag));
  context.overlay.append(node);
  return node;
}
export function random(seed: number): () => number {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
export const sensitive =
  "input,textarea,select,[contenteditable]:not([contenteditable=false]),iframe,video,audio,canvas,script,style,noscript,[data-art-root]";
export function protectedNode(element: Element): boolean {
  let current: Element | null = element;
  for (let i = 0; current && i < 64; i++) {
    if (current.matches(sensitive)) return true;
    current =
      current.parentElement ??
      (current.getRootNode() instanceof ShadowRoot
        ? (current.getRootNode() as ShadowRoot).host
        : null);
  }
  return false;
}
/** A local, bounded illustration of a target. Never clones live markup or reads form values. */
export function snapshot(element: HTMLElement, context: EffectContext): HTMLCanvasElement {
  const rect = element.getBoundingClientRect();
  const canvas = context.resources.node(context.document.createElement("canvas"));
  canvas.width = Math.ceil(Math.min(rect.width, 1200));
  canvas.height = Math.ceil(Math.min(rect.height, 800));
  box(canvas, rect);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
  const base = getComputedStyle(element);
  ctx.fillStyle = base.backgroundColor === "rgba(0, 0, 0, 0)" ? "#f5f5fa" : base.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const walker = context.document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );
  let node: Node | null = element;
  let visited = 0;
  let words = 0;
  while (node && visited++ < 500 && words < 240) {
    if (node instanceof HTMLElement && !protectedNode(node)) {
      const r = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      if (style.visibility !== "hidden" && style.display !== "none") {
        ctx.fillStyle = style.backgroundColor;
        ctx.fillRect(r.left - rect.left, r.top - rect.top, r.width, r.height);
      }
    } else if (
      node.nodeType === Node.TEXT_NODE &&
      node.parentElement &&
      !protectedNode(node.parentElement)
    ) {
      const style = getComputedStyle(node.parentElement);
      if (style.visibility === "hidden" || style.display === "none") {
        node = walker.nextNode();
        continue;
      }
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.fillStyle = style.color;
      ctx.textBaseline = "top";
      const range = context.document.createRange();
      for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
        if (words++ >= 240) break;
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const r = range.getBoundingClientRect();
        if (r.width) ctx.fillText(match[0], r.left - rect.left, r.top - rect.top);
      }
    }
    node = walker.nextNode();
  }
  context.overlay.append(canvas);
  return canvas;
}
export function copySurface(
  context: EffectContext,
  source: HTMLCanvasElement,
  rect: DOMRect,
): HTMLCanvasElement {
  const copy = context.resources.node(context.document.createElement("canvas"));
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext("2d")?.drawImage(source, 0, 0);
  box(copy, rect);
  context.overlay.append(copy);
  return copy;
}
export function sparks(
  context: EffectContext,
  x: number,
  y: number,
  color: string,
  strength: number,
): void {
  const rng = random(71);
  for (let i = 0; i < 18; i++) {
    const bit = layer(context);
    const angle = rng() * Math.PI * 2;
    const distance = 35 + rng() * 100 * strength;
    Object.assign(bit.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: "7px",
      height: "4px",
      background: color,
      borderRadius: "2px",
    });
    context.resources.animate(
      bit,
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance + 30}px) rotate(${rng() * 400}deg) scale(.2)`,
          opacity: 0,
        },
      ],
      { duration: 650, easing: "cubic-bezier(.1,.6,.2,1)", fill: "forwards" },
    );
  }
}
