import { protectedNode } from "../sdk/visual";
export function eligible(element: Element | null): element is HTMLElement {
  if (
    !(element instanceof HTMLElement) ||
    !element.isConnected ||
    ["HTML", "BODY"].includes(element.tagName) ||
    protectedNode(element)
  )
    return false;
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return (
    style.visibility !== "hidden" &&
    style.display !== "none" &&
    rect.width >= 12 &&
    rect.height >= 12 &&
    rect.width <= 1200 &&
    rect.height <= 800 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < innerWidth &&
    rect.top < innerHeight
  );
}
export function atPoint(x: number, y: number): HTMLElement | null {
  let candidate: Element | null = document.elementFromPoint(x, y);
  for (let i = 0; i < 12 && candidate?.shadowRoot; i++) {
    const child = candidate.shadowRoot.elementFromPoint(x, y);
    if (!child || child === candidate) break;
    candidate = child;
  }
  if (eligible(candidate)) return candidate;
  return null;
}
/** Bounded traversal: skips embedded, hidden and editable subtrees before reading content. */
export function visibleTargets(limit = 100): HTMLElement[] {
  const result: HTMLElement[] = [];
  let visited = 0;
  const visit = (parent: ParentNode): void => {
    for (const node of parent.children) {
      if (++visited > 3000 || result.length >= limit) return;
      if (protectedNode(node)) continue;
      if (
        eligible(node) &&
        node.matches("p,h1,h2,h3,article,button,a,li,[role=article],[role=listitem],img")
      ) {
        result.push(node);
        continue;
      }
      if (node.shadowRoot) visit(node.shadowRoot);
      else visit(node);
    }
  };
  visit(document.body);
  return result;
}
