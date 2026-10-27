import type { Locator } from "@playwright/test";

/** Measures rendered text, including unwrapped text nodes and alpha colors. */
export async function renderedContrast(root: Locator) {
  return root.evaluate((element) => {
    type Color = [number, number, number, number];
    const color = (value: string): Color => {
      const parts = value.match(/[\d.]+/g)?.map(Number);
      if (!parts || parts.length < 3 || !value.startsWith("rgb"))
        throw new Error(`Unsupported computed color: ${value}`);
      return [parts[0]!, parts[1]!, parts[2]!, parts[3] ?? 1];
    };
    const over = (front: Color, back: Color): Color => [
      front[0] * front[3] + back[0] * (1 - front[3]),
      front[1] * front[3] + back[1] * (1 - front[3]),
      front[2] * front[3] + back[2] * (1 - front[3]),
      1,
    ];
    const luminance = (value: Color) =>
      value.slice(0, 3).reduce((sum, channel, index) => {
        const c = channel / 255;
        return (
          sum +
          (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) *
            [0.2126, 0.7152, 0.0722][index]!
        );
      }, 0);
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const classes = new Map<
      string,
      {
        kind: string;
        ratio: number;
        foreground: string;
        background: Color;
        fontSize: number;
        samples: number;
      }
    >();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent?.trim() || !node.parentElement) continue;
      const parent = node.parentElement;
      const chain: Element[] = [];
      for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement)
        chain.unshift(ancestor);
      let background: Color = [255, 255, 255, 1];
      for (const ancestor of chain) {
        const style = getComputedStyle(ancestor);
        if (style.opacity !== "1")
          throw new Error("Group opacity needs a separate compositing measurement.");
        background = over(color(style.backgroundColor), background);
      }
      const style = getComputedStyle(parent);
      const a = luminance(over(color(style.color), background)),
        b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const kind = [...parent.classList].find((name) => name.startsWith("syntax-")) ?? "base";
      const previous = classes.get(kind);
      if (!previous || ratio < previous.ratio)
        classes.set(kind, {
          kind,
          ratio,
          foreground: style.color,
          background,
          fontSize: parseFloat(style.fontSize),
          samples: (previous?.samples ?? 0) + 1,
        });
      else previous.samples++;
    }
    return [...classes.values()];
  });
}
