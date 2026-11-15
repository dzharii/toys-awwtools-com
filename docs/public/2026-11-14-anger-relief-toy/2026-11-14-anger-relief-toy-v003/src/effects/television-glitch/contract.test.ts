import { expect, test } from "bun:test";
import module, { bandEdges } from "./index";
import metadata from "./effect.json";
import audio from "./audio.json";
import { Resources } from "../../sdk/resources";
import type { EffectContext, EffectTarget } from "../../sdk/types";
import { defaults } from "../../sdk/validation";
test(metadata.id + ": bounded deterministic geometry", () => {
  expect(bandEdges(-1)).toEqual([0, 100 / 6]);
  expect(bandEdges(99)).toEqual([500 / 6, 100]);
  for (let i = 0; i < 5; i++) expect(bandEdges(i)[1]).toBe(bandEdges(i + 1)[0]);
});
test(metadata.id + ": typed lifecycle and invalid scope leaves no resources", () => {
  expect(module.sdkVersion).toBe("1.0");
  expect(metadata.capabilities.audio).toBe(true);
  const resources = new Resources();
  const c = { resources } as EffectContext;
  const instance = module.create(c);
  expect(() => instance.start({ kind: "invalid" } as unknown as EffectTarget, defaults)).toThrow(
    "TARGET_KIND",
  );
  instance.stop("user");
  instance.dispose();
  expect(resources.size).toBe(0);
});
test(metadata.id + ": original conservative bounded audio", () => {
  for (const cue of Object.values(audio))
    for (const layer of cue.layers) {
      expect(layer.gain).toBeGreaterThan(0);
      expect(layer.gain).toBeLessThanOrEqual(0.18);
      expect(layer.duration).toBeLessThanOrEqual(1.5);
    }
});

import { Window } from "happy-dom";
test(metadata.id + ": bounded rendered surfaces and exact restoration", async () => {
  const browser = new Window();
  const doc = browser.document as unknown as Document;
  const old = new Map<string, PropertyDescriptor | undefined>();
  for (const name of ["HTMLElement", "Node", "NodeFilter", "ShadowRoot", "getComputedStyle"]) {
    old.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: (browser as unknown as Record<string, unknown>)[name],
    });
  }
  try {
    Object.defineProperty(browser.HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: () => new Proxy({}, { get: () => () => {}, set: () => true }),
    });
    Object.defineProperty(browser.HTMLElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: () => new browser.DOMRect(30, 50, 240, 100),
    });
    const overlay = doc.createElement("div");
    doc.body.append(overlay);
    const elements = Array.from({ length: 14 }, () => {
      const element = doc.createElement("article");
      element.style.color = "blue";
      doc.body.append(element);
      return element;
    });
    const original = elements.map((element) => element.style.cssText);
    const resources = new Resources();
    const instance = module.create({
      document: doc,
      overlay,
      resources,
      signal: new AbortController().signal,
      finish: () => {
        throw new Error("Unexpected finish");
      },
    });
    const target: EffectTarget =
      metadata.scope === "element"
        ? { kind: "element", element: elements[0]!, document: doc, x: 100, y: 100 }
        : { kind: "document", document: doc, elements };
    await instance.start(target, { ...defaults, reducedMotion: true });
    if (metadata.scope === "document") {
      expect(overlay.querySelectorAll("canvas")).toHaveLength(10);
      expect(elements[9]!.style.visibility).toBe("hidden");
      expect(elements[10]!.style.visibility).toBe("");
    } else {
      expect(overlay.querySelectorAll("canvas")).toHaveLength(7);
      expect(overlay.children).toHaveLength(8);
      expect(elements[0]!.style.visibility).toBe("hidden");
    }
    instance.stop("user");
    instance.dispose();
    expect(overlay.children).toHaveLength(0);
    expect(resources.size).toBe(0);
    elements.forEach((element, index) => expect(element.style.cssText).toBe(original[index]!));
  } finally {
    for (const [name, value] of old) {
      if (value) Object.defineProperty(globalThis, name, value);
      else Reflect.deleteProperty(globalThis, name);
    }
    await browser.happyDOM.abort();
  }
});
