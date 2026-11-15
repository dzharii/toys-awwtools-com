import { expect, test } from "bun:test";
import module, { makeFlakes } from "./index";
import metadata from "./effect.json";
import audio from "./audio.json";
import { Resources } from "../../sdk/resources";
import type { EffectContext, EffectTarget } from "../../sdk/types";
import { defaults } from "../../sdk/validation";
test(metadata.id + ": bounded deterministic geometry", () => {
  expect(makeFlakes(1000)).toHaveLength(64);
  expect(makeFlakes(-1)).toHaveLength(0);
  expect(makeFlakes()).toEqual(makeFlakes());
  for (const flake of makeFlakes()) {
    expect(flake.x).toBeGreaterThanOrEqual(0);
    expect(flake.y).toBeLessThan(1);
    expect(flake.r).toBeLessThan(4);
    expect(flake.speed).toBeLessThan(30);
  }
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
test(metadata.id + ": reduced motion renders once and cleans without touching host", async () => {
  const browser = new Window();
  const doc = browser.document as unknown as Document;
  const overlay = doc.createElement("div");
  doc.body.append(overlay);
  const targetElement = doc.createElement("article");
  targetElement.textContent = "Ordinary content";
  doc.body.append(targetElement);
  const calls: string[] = [];
  Object.defineProperty(browser.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () =>
      new Proxy({}, { get: (_target, key) => () => calls.push(String(key)), set: () => true }),
  });
  const resources = new Resources();
  const context: EffectContext = {
    document: doc,
    overlay,
    resources,
    signal: new AbortController().signal,
    finish: () => {
      throw new Error("Unexpected finish");
    },
  };
  const instance = module.create(context);
  const target: EffectTarget =
    metadata.scope === "element"
      ? { kind: "element", element: targetElement, document: doc, x: 200, y: 180 }
      : { kind: "viewport", document: doc };
  await instance.start(target, { ...defaults, reducedMotion: true });
  expect(overlay.children.length).toBeGreaterThan(0);
  expect(targetElement.textContent).toBe("Ordinary content");
  expect(targetElement.hasAttribute("style")).toBe(false);
  if (metadata.scope === "viewport") {
    expect(overlay.querySelectorAll("canvas")).toHaveLength(1);
    expect(calls).toContain("clearRect");
  } else expect(overlay.children.length).toBe(19);
  instance.stop("user");
  instance.dispose();
  expect(overlay.children.length).toBe(0);
  expect(resources.size).toBe(0);
  await browser.happyDOM.abort();
});
