import { afterAll, beforeAll, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { MiddleHold } from "../src/runtime/middle-hold";

const browser = new Window();
const doc = browser.document as unknown as Document;
const originals = new Map<string, PropertyDescriptor | undefined>();
const frames = new Map<number, FrameRequestCallback>();
let clock = 0;
let sequence = 0;
beforeAll(() => {
  const values: Record<string, unknown> = {
    window: browser,
    document: doc,
    Element: browser.Element,
    ShadowRoot: browser.ShadowRoot,
    innerWidth: 920,
    innerHeight: 720,
    performance: { now: () => clock },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      frames.set(++sequence, callback);
      return sequence;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  for (const [key, value] of Object.entries(values)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
});
afterAll(async () => {
  for (const [key, value] of originals) {
    if (value) Object.defineProperty(globalThis, key, value);
    else Reflect.deleteProperty(globalThis, key);
  }
  await browser.happyDOM.abort();
});
function setup() {
  clock = 0;
  frames.clear();
  doc.body.replaceChildren();
  const area = doc.createElement("article");
  doc.body.append(area);
  let opened = 0,
    unlocked = 0;
  const hold = new MiddleHold(
    () => opened++,
    () => unlocked++,
  );
  return {
    hold,
    area,
    get opened() {
      return opened;
    },
    get unlocked() {
      return unlocked;
    },
  };
}
function mouse(
  target: EventTarget,
  type: string,
  options: Pick<MouseEventInit, "clientX" | "clientY" | "buttons" | "shiftKey"> = {},
) {
  const event = new browser.MouseEvent(type, {
    bubbles: true,
    composed: true,
    cancelable: true,
    button: 1,
    buttons: 4,
    clientX: 100,
    clientY: 100,
    ...options,
  });
  target.dispatchEvent(event as unknown as Event);
  return event;
}
function step(ms: number) {
  clock = ms;
  const current = [...frames.values()];
  frames.clear();
  current.forEach((callback) => callback(ms));
}
function ring() {
  return doc.querySelector<HTMLElement>("[data-art-gesture]");
}

test("disabled defaults preserve native presses and allocate nothing", () => {
  const state = setup();
  try {
    expect(mouse(state.area, "pointerdown").defaultPrevented).toBe(false);
    step(2500);
    expect(state.opened).toBe(0);
    expect(ring()).toBeNull();
    expect(frames.size).toBe(0);
  } finally {
    state.hold.dispose();
  }
});
test("stationary middle hold opens at 1800ms once, no modifier or movement required", () => {
  const state = setup();
  try {
    state.hold.configure(true);
    expect(mouse(state.area, "pointerdown").defaultPrevented).toBe(true);
    expect(mouse(state.area, "mousedown").defaultPrevented).toBe(true);
    expect(state.unlocked).toBe(1);
    expect(ring()?.style.left).toBe("138px");
    step(900);
    expect(ring()?.style.background).toContain("180deg");
    expect(state.opened).toBe(0);
    step(1799);
    expect(state.opened).toBe(0);
    step(1800);
    expect(state.opened).toBe(1);
    expect(ring()).toBeNull();
    expect(frames.size).toBe(0);
    step(5000);
    expect(state.opened).toBe(1);
    expect(mouse(state.area, "auxclick").defaultPrevented).toBe(true);
  } finally {
    state.hold.dispose();
  }
});
test("early release cancels at beginning, middle and end without leftover frames", () => {
  const state = setup();
  try {
    state.hold.configure(true);
    for (const elapsed of [10, 900, 1799]) {
      clock = 0;
      mouse(state.area, "pointerdown");
      step(elapsed);
      expect(mouse(state.area, "pointerup", { buttons: 0 }).defaultPrevented).toBe(true);
      expect(ring()).toBeNull();
      expect(frames.size).toBe(0);
      mouse(state.area, "auxclick", { buttons: 0 });
      step(2000);
      expect(state.opened).toBe(0);
    }
  } finally {
    state.hold.dispose();
  }
});
test("links, nested controls, editable fields and extension UI keep native actions", () => {
  const state = setup();
  try {
    state.hold.configure(true);
    for (const tag of ["a", "button", "input", "textarea", "iframe"]) {
      const protectedElement = doc.createElement(tag);
      state.area.append(protectedElement);
      const child = doc.createElement("span");
      protectedElement.append(child);
      expect(mouse(child, "pointerdown").defaultPrevented).toBe(false);
      expect(mouse(child, "auxclick").defaultPrevented).toBe(false);
    }
    const edit = doc.createElement("div");
    edit.setAttribute("contenteditable", "true");
    state.area.append(edit);
    expect(mouse(edit, "pointerdown").defaultPrevented).toBe(false);
    const own = doc.createElement("div");
    own.dataset.artRoot = "";
    state.area.append(own);
    expect(mouse(own, "pointerdown").defaultPrevented).toBe(false);
    expect(ring()).toBeNull();
    expect(state.unlocked).toBe(0);
  } finally {
    state.hold.dispose();
  }
});
test("movement, focus loss, pointer cancellation and disabling cancel progress", () => {
  const state = setup();
  try {
    state.hold.configure(true);
    for (const reason of ["move", "blur", "pointercancel", "disable", "cancel"]) {
      clock = 0;
      state.hold.configure(true);
      mouse(state.area, "pointerdown");
      if (reason === "move") mouse(state.area, "pointermove", { clientX: 113 });
      else if (reason === "disable") state.hold.configure(false);
      else if (reason === "cancel") state.hold.cancel();
      else browser.dispatchEvent(new browser.Event(reason));
      expect(ring()).toBeNull();
      expect(frames.size).toBe(0);
      step(2000);
      expect(state.opened).toBe(0);
      mouse(state.area, "auxclick");
    }
    state.hold.configure(true);
    mouse(state.area, "pointerdown", { shiftKey: true });
    expect(ring()).toBeNull();
  } finally {
    state.hold.dispose();
  }
});
test("links inside open shadow roots and extension panels retain native middle events", () => {
  const state = setup();
  try {
    state.hold.configure(true);
    const host = doc.createElement("div");
    doc.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const link = doc.createElement("a");
    link.href = "https://example.test";
    const span = doc.createElement("span");
    link.append(span);
    shadow.append(link);
    expect(mouse(span, "pointerdown").defaultPrevented).toBe(false);
    expect(ring()).toBeNull();
    host.dataset.artRoot = "";
    link.remove();
    const panel = doc.createElement("div");
    shadow.append(panel);
    expect(mouse(panel, "pointerdown").defaultPrevented).toBe(false);
    expect(ring()).toBeNull();
  } finally {
    state.hold.dispose();
  }
});
test("progress clamps to viewport and disposal removes listeners idempotently", () => {
  const state = setup();
  state.hold.configure(true);
  mouse(state.area, "pointerdown", { clientX: 919, clientY: 719 });
  expect(ring()?.style.left).toBe("872px");
  expect(ring()?.style.top).toBe("672px");
  state.hold.dispose();
  state.hold.dispose();
  expect(ring()).toBeNull();
  expect(frames.size).toBe(0);
  expect(mouse(state.area, "pointerdown").defaultPrevented).toBe(false);
  state.hold.configure(true);
  step(2000);
  expect(state.opened).toBe(0);
});

test("hidden document, missing held button and role controls cancel or preserve native behavior", () => {
  const state = setup();
  const hidden = Object.getOwnPropertyDescriptor(doc, "hidden");
  try {
    state.hold.configure(true);
    mouse(state.area, "pointerdown");
    Object.defineProperty(doc, "hidden", { configurable: true, value: true });
    doc.dispatchEvent(new browser.Event("visibilitychange") as unknown as Event);
    expect(ring()).toBeNull();
    expect(frames.size).toBe(0);
    mouse(state.area, "auxclick");
    Object.defineProperty(doc, "hidden", { configurable: true, value: false });
    mouse(state.area, "pointerdown");
    mouse(state.area, "pointermove", { buttons: 0 });
    expect(ring()).toBeNull();
    mouse(state.area, "auxclick");
    const control = doc.createElement("div");
    control.setAttribute("role", "button");
    state.area.append(control);
    expect(mouse(control, "pointerdown").defaultPrevented).toBe(false);
    expect(state.opened).toBe(0);
  } finally {
    state.hold.dispose();
    if (hidden) Object.defineProperty(doc, "hidden", hidden);
    else Reflect.deleteProperty(doc, "hidden");
  }
});
