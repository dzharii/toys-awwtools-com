import type { Descriptor } from "../sdk/types";
import { button, closeButton, el, icon } from "./dom";
export function sectorPolygon(index: number, count: number): string {
  const a = -Math.PI / 2 + (index * Math.PI * 2) / count;
  const half = Math.PI / count - 0.012;
  const points: string[] = [];
  for (let j = 0; j <= 12; j++) {
    const t = a - half + (2 * half * j) / 12;
    points.push(`${50 + Math.cos(t) * 49}% ${50 + Math.sin(t) * 49}%`);
  }
  for (let j = 12; j >= 0; j--) {
    const t = a - half + (2 * half * j) / 12;
    points.push(`${50 + Math.cos(t) * 19}% ${50 + Math.sin(t) * 19}%`);
  }
  return `polygon(${points.join(",")})`;
}
export function wheel(
  entries: Descriptor[],
  equipped: string | undefined,
  shortcut: string,
  choose: (id: string) => void,
  all: () => void,
  close: () => void,
): HTMLElement {
  const dialog = el("section", "wheel-dialog");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Action wheel");
  const header = el("div", "wheel-heading");
  header.append(
    el("span", "shortcut", shortcut || "Assign a shortcut in extension settings"),
    closeButton("Close wheel", close),
  );
  dialog.append(header);
  const shell = el("div", "wheel");
  entries.forEach((entry, index) => {
    const sector = button("", () => choose(entry.id), "wheel-sector");
    sector.style.clipPath = sectorPolygon(index, entries.length);
    sector.setAttribute("aria-label", `Equip ${entry.name}`);
    sector.setAttribute("aria-pressed", String(entry.id === equipped));
    const content = el("span", "sector-content");
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / entries.length;
    content.style.left = `${50 + Math.cos(angle) * 34}%`;
    content.style.top = `${50 + Math.sin(angle) * 34}%`;
    content.innerHTML = icon(entry, 38);
    content.append(el("span", "sector-name", entry.name));
    if (entry.id === equipped) content.append(el("span", "equipped-check", "✓"));
    sector.append(content);
    shell.append(sector);
  });
  const hub = button("All tools", all, "wheel-center");
  shell.append(hub);
  dialog.append(shell, el("p", "wheel-help", "Tab or arrow keys to choose. Esc closes the wheel."));
  const buttons = [...shell.querySelectorAll("button")];
  shell.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key))
      return;
    const index = buttons.indexOf(
      (dialog.getRootNode() as ShadowRoot).activeElement as HTMLButtonElement,
    );
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index +
              (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) +
              buttons.length) %
            buttons.length;
    buttons[next]?.focus();
    event.preventDefault();
    event.stopPropagation();
  });
  return dialog;
}
