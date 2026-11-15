import type { Descriptor } from "../sdk/types";
import type { EffectAudio } from "../sdk/audio-types";
import { Resources } from "../sdk/resources";
import { button, closeButton, el, icon } from "./dom";
import { DialModel } from "./dial-model";
export function sectorPolygon(index: number, count: number, offset = -90): string {
  const a = ((offset + (index * 360) / count) * Math.PI) / 180;
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
  scope = new Resources(),
  audio?: EffectAudio,
): HTMLElement {
  const model = new DialModel(entries.length);
  const initial = Math.max(
    0,
    entries.findIndex((e) => e.id === equipped),
  );
  model.set(initial - (model.slots - 2));
  const dialog = el("section", "wheel-dialog");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Action dial");
  const header = el("div", "wheel-heading");
  header.append(
    el("span", "shortcut", shortcut || "Assign a shortcut in extension settings"),
    closeButton("Close dial", close),
  );
  const shell = el("div", "wheel");
  shell.setAttribute("aria-label", "Rotate to browse tools");
  const masked = el("div", "dial-mask");
  const rotor = el("div", "dial-rotor");
  masked.append(rotor);
  const slots: { button: HTMLButtonElement; content: HTMLElement; index: number }[] = [];
  for (let j = 0; j < model.slots; j++) {
    const sector = button(
      "",
      () => {
        if (model.slot(j).covered) return;
        audio?.play("select");
        choose(entries[model.slot(j).index]!.id);
      },
      "wheel-sector",
    );
    sector.style.clipPath = sectorPolygon(j, model.slots, -135);
    const content = el("span", "sector-content");
    const a = ((-135 + j * model.step) * Math.PI) / 180;
    content.style.left = `${50 + Math.cos(a) * 34}%`;
    content.style.top = `${50 + Math.sin(a) * 34}%`;
    sector.append(content);
    rotor.append(sector);
    slots.push({ button: sector, content, index: -1 });
  }
  const cover = el("div", "dial-separator");
  // Fixed retaining hood. Its solid 48-degree footprint and rotor mask share geometry.
  cover.innerHTML = `<svg viewBox="0 0 420 420" aria-hidden="true"><defs><linearGradient id="art-arm" x2=".8" y2="1"><stop stop-color="#fff"/><stop offset=".35" stop-color="#eef2f2"/><stop offset=".7" stop-color="#b8c4ca"/><stop offset="1" stop-color="#e9edf0"/></linearGradient></defs><path d="M9 131 A224 224 0 0 1 131 9 L181 136 A79 79 0 0 0 136 181 Z" fill="#637481" opacity=".3" transform="translate(3 5)"/><path d="M9 131 A224 224 0 0 1 131 9 L181 136 A79 79 0 0 0 136 181 Z" fill="url(#art-arm)" stroke="#9cabb5"/><path d="M15 127 A218 218 0 0 1 127 15" fill="none" stroke="white" stroke-width="3"/><path d="M35 -2 Q28 -9 21 -2 L-2 21 Q-9 28 -2 35 L88 121 L121 88 Z" fill="url(#art-arm)" stroke="#a1b0b8"/><path d="M0 26 L96 117" fill="none" stroke="white" stroke-width="2"/><circle cx="24" cy="24" r="8" fill="#edf2f4" stroke="#a1b0b8"/><path d="M20 24h8" stroke="#879ba7"/><circle cx="58" cy="58" r="15" fill="#e5eaed" stroke="#95a6af"/><path d="M52 58h12" stroke="#8497a2" stroke-width="2"/><path d="M135 178 A82 82 0 0 1 178 135" fill="none" stroke="#71858f" stroke-width="3"/></svg>`;
  const hub = button("All tools", all, "wheel-center");
  shell.append(masked, cover, hub);
  dialog.append(
    header,
    shell,
    el("p", "wheel-help", "Drag the rim to browse. Arrow keys rotate. Esc closes."),
  );
  let detent = Math.round(model.position);
  let motion: Resources | undefined;
  let suppress = false;
  let drag:
    | {
        id: number;
        x: number;
        y: number;
        cx: number;
        cy: number;
        previous: number;
        started: boolean;
      }
    | undefined;
  function render(tick = true): void {
    rotor.style.transform = `rotate(${model.position * model.step}deg)`;
    for (let j = 0; j < slots.length; j++) {
      const slot = slots[j]!;
      const state = model.slot(j);
      const entry = entries[state.index]!;
      if (slot.index !== state.index) {
        slot.index = state.index;
        slot.content.innerHTML = icon(entry, 36);
        slot.content.append(el("span", "sector-name", entry.name));
        if (entry.id === equipped) slot.content.append(el("span", "equipped-check", "✓"));
        slot.button.dataset.id = entry.id;
        slot.button.setAttribute("aria-label", `Equip ${entry.name}`);
        slot.button.setAttribute("aria-pressed", String(entry.id === equipped));
      }
      slot.button.disabled = state.covered;
      slot.button.tabIndex = !state.covered && state.index === model.topIndex ? 0 : -1;
      slot.content.style.transform = `translate(-50%, -50%) rotate(${-model.position * model.step}deg)`;
    }
    const next = Math.round(model.position);
    if (tick && detent !== next) audio?.play("tick");
    detent = next;
    shell.dataset.position = String(model.position);
  }
  function settle(target = Math.round(model.position), focus = false): void {
    motion?.dispose();
    motion = new Resources();
    const from = model.position;
    const finish = () => {
      model.set(target);
      render();
      if (focus)
        slots.find((s) => !s.button.disabled && s.index === model.topIndex)?.button.focus();
    };
    if (
      focus ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Math.abs(target - from) < 0.001
    ) {
      finish();
      return;
    }
    motion.frame((elapsed) => {
      const p = Math.min(1, elapsed / 140);
      model.set(from + (target - from) * (1 - (1 - p) ** 3));
      render();
      if (p === 1) {
        finish();
        return false;
      }
      return true;
    });
  }
  const coveredAt = (x: number, y: number, cx: number, cy: number) => {
    const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    return Math.abs(((angle + 135 + 540) % 360) - 180) < 24;
  };
  scope.listen(shell, "pointerdown", (event) => {
    const e = event as PointerEvent;
    if (e.button !== 0 || (e.target as Element).closest(".wheel-center")) return;
    const rect = shell.getBoundingClientRect();
    const cx = rect.left + rect.width / 2,
      cy = rect.top + rect.height / 2;
    if (
      Math.hypot(e.clientX - cx, e.clientY - cy) < rect.width * 0.2 ||
      coveredAt(e.clientX, e.clientY, cx, cy)
    )
      return;
    motion?.dispose();
    suppress = false;
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      cx,
      cy,
      previous: Math.atan2(e.clientY - cy, e.clientX - cx),
      started: false,
    };
  });
  scope.listen(
    window,
    "pointermove",
    (event) => {
      const e = event as PointerEvent;
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.started && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      if (!drag.started) {
        drag.started = true;
        shell.setPointerCapture?.(e.pointerId);
      }
      suppress = true;
      e.preventDefault();
      const angle = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
      let delta = angle - drag.previous;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      model.set(model.position + (delta * 180) / Math.PI / model.step);
      drag.previous = angle;
      render();
    },
    { passive: false },
  );
  const release = (event?: Event) => {
    if (!drag || (event && "pointerId" in event && (event as PointerEvent).pointerId !== drag.id))
      return;
    const active = drag.started;
    const id = drag.id;
    drag = undefined;
    if (shell.hasPointerCapture?.(id)) shell.releasePointerCapture(id);
    if (active) settle();
  };
  scope.listen(window, "pointerup", release);
  scope.listen(window, "pointercancel", release);
  scope.listen(shell, "lostpointercapture", release);
  scope.listen(window, "resize", release);
  scope.listen(window, "blur", release);
  scope.listen(
    shell,
    "click",
    (event) => {
      if (suppress && (event as MouseEvent).detail > 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    { capture: true },
  );
  scope.listen(shell, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (!["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    settle(Math.round(model.position) + (["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 1), true);
  });
  scope.own(() => {
    motion?.dispose();
    if (drag && shell.hasPointerCapture?.(drag.id)) shell.releasePointerCapture(drag.id);
    drag = undefined;
    audio?.stop();
  });
  render(false);
  return dialog;
}
