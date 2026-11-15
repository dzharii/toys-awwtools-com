import { test, expect } from "bun:test";
import { Window } from "happy-dom";
import module from "./index";
import metadata from "./effect.json";
import audio from "./audio.json";
import { Resources } from "../../sdk/resources";
import type { EffectContext, EffectTarget, Options } from "../../sdk/types";
import { validateDescriptor } from "../../../tools/metadata";
const options: Options = {
  strength: 1,
  duration: 3,
  reducedMotion: false,
  radius: 100,
  darkness: 0.7,
  softness: 50,
};
test(metadata.id + " metadata and conservative audio contract", () => {
  validateDescriptor(metadata, metadata.id, []);
  expect(module.sdkVersion).toBe("1.0");
  expect(metadata.capabilities.audio).toBe(true);
  for (const cue of Object.values(audio))
    for (const layer of cue.layers) {
      expect(layer.gain).toBeLessThanOrEqual(0.18);
      expect(layer.duration).toBeLessThanOrEqual(1.5);
      expect(layer.duration).toBeGreaterThan(0);
    }
});
function setup() {
  const w = new Window({ url: "https://synthetic.test" });
  const names = [
    "HTMLElement",
    "ShadowRoot",
    "Node",
    "NodeFilter",
    "DOMRect",
    "getComputedStyle",
  ] as const;
  const prior = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
  for (const name of names)
    Object.defineProperty(globalThis, name, {
      value: name === "getComputedStyle" ? w.getComputedStyle.bind(w) : w[name],
      writable: true,
      configurable: true,
    });
  Object.defineProperty(w.HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new w.DOMRect(100, 100, 300, 100),
  });
  Object.defineProperty(w.Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new w.DOMRect(110, 110, 60, 20),
  });
  Object.defineProperty(w.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => new Proxy({}, { get: () => () => {}, set: () => true }),
  });
  let animations = 0,
    cancelled = 0;
  Object.defineProperty(w.Element.prototype, "animate", {
    configurable: true,
    value: () => {
      animations++;
      return { cancel: () => cancelled++, finished: Promise.resolve() };
    },
  });
  const target = w.document.createElement("article");
  target.textContent = "Synthetic harmless comment";
  target.style.color = "rgb(0, 0, 0)";
  w.document.body.append(target);
  const overlay = w.document.createElement("div");
  w.document.body.append(overlay);
  const scope = new Resources();
  const cues: { name: string; delay?: number }[] = [];
  const context = {
    document: w.document,
    resources: scope,
    overlay,
    signal: new AbortController().signal,
    finish: () => {},
    audio: {
      play: (name: string, p?: { delay?: number }) => cues.push({ name, delay: p?.delay }),
      stop: () => {},
    },
  } as unknown as EffectContext;
  const selected = (metadata.scope === "document"
    ? { kind: "document", document: w.document, elements: [target] }
    : {
        kind: "element",
        document: w.document,
        element: target,
        x: 180,
        y: 140,
      }) as unknown as EffectTarget;
  return {
    w,
    target,
    overlay,
    scope,
    cues,
    context,
    selected,
    get animations() {
      return animations;
    },
    get cancelled() {
      return cancelled;
    },
    close() {
      scope.dispose();
      for (const [i, name] of names.entries()) {
        const old = prior[i];
        if (old) Object.defineProperty(globalThis, name, old);
        else Reflect.deleteProperty(globalThis, name);
      }
      w.happyDOM.abort();
    },
  };
}
test(metadata.id + " bounded visual ownership and idempotent cleanup", () => {
  const s = setup();
  try {
    const instance = module.create(s.context);
    instance.start(s.selected, options);
    expect(s.overlay.children.length).toBeGreaterThan(0);
    expect(s.overlay.children.length).toBeLessThanOrEqual(80);
    expect(s.animations).toBeGreaterThan(0);
    const animated = s.animations;
    instance.stop("user");
    instance.dispose();
    expect(s.scope.closed).toBe(true);
    expect(s.scope.size).toBe(0);
    expect(s.overlay.children.length).toBe(0);
    expect(s.cancelled).toBe(animated);
    expect(s.target.style.visibility).not.toBe("hidden");
    expect(s.target.textContent).toBe("Synthetic harmless comment");
  } finally {
    s.close();
  }
});
test(metadata.id + " reduced motion remains bounded and unsupported target is rejected", () => {
  const s = setup();
  try {
    const instance = module.create(s.context);
    expect(() =>
      instance.start(
        { kind: "viewport", document: s.context.document },
        { ...options, reducedMotion: true },
      ),
    ).toThrow("TARGET_KIND");
    instance.start(s.selected, { ...options, reducedMotion: true });
    expect(s.overlay.children.length).toBeLessThanOrEqual(20);
    instance.dispose();
    expect(s.overlay.children.length).toBe(0);
  } finally {
    s.close();
  }
});

test("page-dance selects at most eight non-nested targets and restores all of them", () => {
  const s = setup();
  try {
    const elements = Array.from({ length: 20 }, () => {
      const e = s.w.document.createElement("p");
      e.textContent = "Dancer";
      s.w.document.body.append(e);
      return e;
    });
    const instance = module.create(s.context);
    instance.start(
      {
        kind: "document",
        document: s.context.document,
        elements: elements as unknown as HTMLElement[],
      },
      options,
    );
    expect(s.overlay.children.length).toBe(8);
    expect(elements.filter((e) => e.style.visibility === "hidden").length).toBe(8);
    instance.stop("user");
    expect(elements.every((e) => !e.style.visibility)).toBe(true);
  } finally {
    s.close();
  }
});
