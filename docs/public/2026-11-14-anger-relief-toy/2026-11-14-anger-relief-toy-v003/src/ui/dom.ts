import type { Descriptor } from "../sdk/types";
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  n.className = className;
  n.textContent = text;
  return n;
}
export function button(text: string, action: () => void, className = ""): HTMLButtonElement {
  const n = el("button", className, text);
  n.type = "button";
  n.onclick = action;
  return n;
}
let iconSequence = 0;
export function icon(e: Descriptor, size = 32): string {
  if (e.iconSvg)
    return e.iconSvg
      .replace(
        "viewBox=",
        `width="${size}" height="${size}" aria-hidden="true" focusable="false" viewBox=`,
      )
      .replaceAll("ICON", `art-icon-${++iconSequence}`);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="${e.icon}"/></svg>`;
}
export function closeButton(label: string, action: () => void): HTMLButtonElement {
  const n = button("", action, "close-control");
  n.setAttribute("aria-label", label);
  n.title = label;
  n.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  return n;
}
export function focusLoop(
  container: HTMLElement,
  event: KeyboardEvent,
  active: Element | null,
): void {
  const nodes = [
    ...container.querySelectorAll<HTMLElement>(
      'button,input,select,summary,a[href],[tabindex="0"]',
    ),
  ].filter((n) => !n.hasAttribute("disabled") && n.getClientRects().length);
  if (event.key !== "Tab" || !nodes.length) return;
  const index = nodes.indexOf(active as HTMLElement);
  const step = event.shiftKey ? -1 : 1;
  const next =
    index < 0
      ? event.shiftKey
        ? nodes.length - 1
        : 0
      : (index + step + nodes.length) % nodes.length;
  event.preventDefault();
  event.stopPropagation();
  nodes[next]?.focus();
}
