import { afterAll, beforeAll, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { DialModel, mod } from "../src/ui/dial-model";
import { wheel } from "../src/ui/wheel";
import { Resources } from "../src/sdk/resources";
import type { Descriptor } from "../src/sdk/types";
import prototype from "../src/effects/punch-element/effect.json";

for (const count of [18, 50, 100]) {
  test(`dial ${count}: bounded slots, complete coverage and reversible multi-turn wrap`, () => {
    const model = new DialModel(count);
    expect(model.slots).toBe(9);
    const discovered = new Set<number>();
    for (let position = -count * 12; position <= count * 12; position++) {
      model.set(position);
      for (let j = 0; j < model.slots; j++) {
        const state = model.slot(j);
        expect(state.index).toBeGreaterThanOrEqual(0);
        expect(state.index).toBeLessThan(count);
        expect(state.angle).toBeGreaterThanOrEqual(-135);
        expect(state.angle).toBeLessThan(225);
        if (!state.covered) discovered.add(state.index);
      }
      expect(model.topIndex).toBe(mod(position + 7, count));
    }
    expect(discovered.size).toBe(count);
    const positions = [0, 0.13, 1.999, -2.001, count * 7 + 0.8];
    for (const position of positions) {
      model.set(position);
      const before = Array.from({ length: model.slots }, (_, j) => model.slot(j));
      model.set(position + count * model.slots * 71);
      for (let j = 0; j < model.slots; j++) {
        const current = model.slot(j),
          original = before[j]!;
        expect(current.index).toBe(original.index);
        expect(current.angle).toBeCloseTo(original.angle, 6);
      }
      model.set(position - count * model.slots * 71);
      for (let j = 0; j < model.slots; j++) expect(model.slot(j).index).toBe(before[j]!.index);
    }
  });
  test(`dial ${count}: every identity replacement occurs beneath the separator in both directions`, () => {
    const model = new DialModel(count);
    for (const direction of [-1, 1]) {
      model.set(direction * -0.01);
      let previous = Array.from({ length: model.slots }, (_, j) => model.slot(j));
      let replacements = 0;
      for (let i = 0; i <= count * 20; i++) {
        model.set((direction * i) / 10);
        for (let j = 0; j < model.slots; j++) {
          const state = model.slot(j),
            old = previous[j]!;
          if (state.index !== old.index) {
            replacements++;
            expect(state.covered).toBe(true);
            expect(old.covered).toBe(true);
          }
          previous[j] = state;
        }
      }
      expect(replacements).toBeGreaterThan(count);
    }
  });
}
test("dial rejects empty registries, ignores nonfinite positions and supports tiny registries", () => {
  for (const count of [0, -1, 1.5]) expect(() => new DialModel(count)).toThrow("EMPTY_DIAL");
  for (const count of [1, 2, 8]) {
    const model = new DialModel(count);
    expect(model.slots).toBeLessThanOrEqual(9);
    model.set(2);
    const before = model.position;
    for (const value of [NaN, Infinity, -Infinity]) {
      model.set(value);
      expect(model.position).toBe(before);
    }
  }
});

const browser = new Window();
const doc = browser.document as unknown as Document;
const originalGlobals = new Map<string, PropertyDescriptor | undefined>();
const frames = new Map<number, FrameRequestCallback>();
let frameSequence = 0;
let reduced = true;
beforeAll(() => {
  const values: Record<string, unknown> = {
    window: browser,
    document: doc,
    HTMLElement: browser.HTMLElement,
    Element: browser.Element,
    Node: browser.Node,
    ShadowRoot: browser.ShadowRoot,
    innerWidth: 920,
    innerHeight: 720,
    matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      frames.set(++frameSequence, callback);
      return frameSequence;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  for (const [key, value] of Object.entries(values)) {
    originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});
afterAll(async () => {
  for (const [key, value] of originalGlobals) {
    if (value) Object.defineProperty(globalThis, key, value);
    else Reflect.deleteProperty(globalThis, key);
  }
  await browser.happyDOM.abort();
});
function fixture(count = 18) {
  frames.clear();
  reduced = true;
  doc.body.replaceChildren();
  const entries = Array.from({ length: count }, (_, i) => ({
    ...prototype,
    id: `tool-${i}`,
    name: `Tool ${i}`,
  })) as Descriptor[];
  const chosen: string[] = [];
  const sounds: string[] = [];
  let stops = 0;
  const resources = new Resources();
  const dialog = wheel(
    entries,
    "tool-0",
    "Alt+Shift+A",
    (id) => chosen.push(id),
    () => {},
    () => {},
    resources,
    { play: (event) => sounds.push(event), stop: () => stops++ },
  );
  doc.body.append(dialog);
  const shell = dialog.querySelector<HTMLElement>(".wheel")!;
  Object.defineProperty(shell, "getBoundingClientRect", {
    value: () => new browser.DOMRect(100, 100, 420, 420),
  });
  return {
    entries,
    chosen,
    sounds,
    resources,
    dialog,
    shell,
    get stops() {
      return stops;
    },
  };
}
function pointer(target: EventTarget, type: string, x: number, y: number, id = 1) {
  const event = new browser.PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: x,
    clientY: y,
    pointerId: id,
  });
  target.dispatchEvent(event as unknown as Event);
  return event;
}
function sector(shell: HTMLElement) {
  return shell.querySelector<HTMLButtonElement>(".wheel-sector:not(:disabled)")!;
}
function key(target: EventTarget, name: string) {
  target.dispatchEvent(
    new browser.KeyboardEvent("keydown", {
      key: name,
      bubbles: true,
      cancelable: true,
    }) as unknown as Event,
  );
}

test("wheel renders nine registry-backed slots, upright labels and exact selected identities", () => {
  const state = fixture(100);
  try {
    expect(state.dialog.querySelectorAll(".wheel-sector")).toHaveLength(9);
    expect(state.dialog.querySelector("[aria-pressed=true]")?.getAttribute("data-id")).toBe(
      "tool-0",
    );
    for (let i = 0; i < 112; i++) key(state.shell, "ArrowRight");
    expect(state.dialog.querySelectorAll(".wheel-sector")).toHaveLength(9);
    const position = Number(state.shell.dataset.position);
    const rotor = state.dialog.querySelector<HTMLElement>(".dial-rotor")!;
    expect(rotor.style.transform).toBe(`rotate(${position * 40}deg)`);
    for (const label of state.dialog.querySelectorAll<HTMLElement>(".sector-content"))
      expect(label.style.transform).toBe(`translate(-50%, -50%) rotate(${-position * 40}deg)`);
    const button = sector(state.shell),
      id = button.dataset.id!;
    button.click();
    expect(state.chosen).toEqual([id]);
    expect(button.getAttribute("aria-label")).toBe(
      `Equip ${state.entries.find((entry) => entry.id === id)!.name}`,
    );
  } finally {
    state.resources.dispose();
  }
});
test("angular drag tracks rotation, suppresses release selection and leaves normal clicks below threshold", () => {
  const state = fixture();
  try {
    const before = Number(state.shell.dataset.position);
    const button = sector(state.shell);
    pointer(button, "pointerdown", 500, 310);
    pointer(window, "pointermove", 500, 313);
    pointer(window, "pointerup", 500, 313);
    button.click();
    expect(state.chosen).toHaveLength(1);
    expect(Number(state.shell.dataset.position)).toBe(before);
    pointer(button, "pointerdown", 500, 310);
    pointer(window, "pointermove", 310, 500);
    expect(Number(state.shell.dataset.position)).toBeCloseTo(before + 2.25, 8);
    pointer(window, "pointerup", 310, 500);
    button.dispatchEvent(
      new browser.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        detail: 1,
      }) as unknown as Event,
    );
    expect(state.chosen).toHaveLength(1);
    expect(Number.isInteger(Number(state.shell.dataset.position))).toBe(true);
  } finally {
    state.resources.dispose();
  }
});
test("counterclockwise and repeated drags preserve catalog identity and keyboard activation after drag", () => {
  const state = fixture(50);
  try {
    const before = Number(state.shell.dataset.position);
    pointer(state.shell, "pointerdown", 500, 310);
    pointer(window, "pointermove", 310, 120);
    pointer(window, "pointerup", 310, 120);
    expect(Number(state.shell.dataset.position)).toBe(before - 2);
    key(state.shell, "ArrowRight");
    const button = state.shell.querySelector<HTMLButtonElement>(".wheel-sector[tabindex='0']")!;
    expect(button).not.toBeNull();
    expect(doc.activeElement).toBe(button);
    // Native keyboard activation dispatches a detail-zero click.
    button.dispatchEvent(
      new browser.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        detail: 0,
      }) as unknown as Event,
    );
    expect(state.chosen).toEqual([button.dataset.id!]);
  } finally {
    state.resources.dispose();
  }
});
test("pointer cancellation settles and disposal stops animation, global handlers and dial audio", () => {
  const state = fixture();
  try {
    reduced = false;
    pointer(state.shell, "pointerdown", 500, 310);
    pointer(window, "pointermove", 310, 500);
    pointer(window, "pointercancel", 310, 500);
    expect(frames.size).toBeGreaterThan(0);
    const before = state.shell.dataset.position;
    state.resources.dispose();
    expect(frames.size).toBe(0);
    expect(state.stops).toBe(1);
    expect(state.resources.size).toBe(0);
    pointer(window, "pointermove", 120, 310);
    key(state.shell, "ArrowRight");
    expect(state.shell.dataset.position).toBe(before);
    state.resources.dispose();
    expect(state.stops).toBe(1);
  } finally {
    state.resources.dispose();
  }
});

test("keyboard navigation commits focus immediately without waiting for pointer settlement animation", () => {
  const state = fixture(50);
  try {
    reduced = false;
    const before = state.shell.querySelector<HTMLButtonElement>(".wheel-sector[tabindex='0']")!
      .dataset.id;
    key(state.shell, "ArrowRight");
    const selected = doc.activeElement as HTMLButtonElement;
    expect(selected.classList.contains("wheel-sector")).toBe(true);
    expect(selected.dataset.id).not.toBe(before);
    expect(frames.size).toBe(0);
    selected.click();
    expect(state.chosen).toEqual([selected.dataset.id!]);
  } finally {
    state.resources.dispose();
  }
});
