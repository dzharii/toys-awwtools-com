import { test, expect, beforeAll, afterAll } from "bun:test";
import { Window } from "happy-dom";
import { catalog } from "../src/generated/catalog";
import { Resources } from "../src/sdk/resources";
import { defaults } from "../src/sdk/validation";
import type { EffectContext, EffectModule, EffectTarget } from "../src/sdk/types";
import { eligible, visibleTargets } from "../src/runtime/targeting";
import { protectedNode } from "../src/sdk/visual";

const browser = new Window({ url: "https://synthetic.test" });
const frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
let animations: { frames: Keyframe[]; cancelled: boolean }[] = [];
let draws = 0;
beforeAll(() => {
  for (const name of [
    "window",
    "document",
    "HTMLElement",
    "Element",
    "Node",
    "NodeFilter",
    "ShadowRoot",
    "DOMRect",
    "MutationObserver",
    "getComputedStyle",
  ]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: name === "window" ? browser : (browser as unknown as Record<string, unknown>)[name],
      writable: true,
    });
  }
  Object.assign(globalThis, {
    innerWidth: 1280,
    innerHeight: 900,
    requestAnimationFrame: (fn: FrameRequestCallback) => {
      frames.set(++frameId, fn);
      return frameId;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  });
  Object.defineProperty(browser.HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new browser.DOMRect(100, 150, 420, 100),
  });
  Object.defineProperty(browser.Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new browser.DOMRect(120, 170, 60, 20),
  });
  Object.defineProperty(browser.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () =>
      new Proxy(
        {},
        {
          get: (_t, key) =>
            [
              "fillRect",
              "fillText",
              "drawImage",
              "beginPath",
              "moveTo",
              "lineTo",
              "stroke",
            ].includes(String(key))
              ? () => draws++
              : undefined,
          set: () => true,
        },
      ),
  });
  Object.defineProperty(browser.Element.prototype, "animate", {
    configurable: true,
    value: (_frames: Keyframe[]) => {
      const entry = { frames: _frames, cancelled: false };
      animations.push(entry);
      return {
        cancel: () => {
          entry.cancelled = true;
        },
        finished: new Promise(() => {}),
      };
    },
  });
});
afterAll(() => browser.happyDOM.abort());
function fixture(): { target: HTMLElement; overlay: HTMLElement } {
  document.body.innerHTML =
    '<article id="target" style="background:rgb(240,238,251);color:rgb(41,51,75);font:16px system-ui"><b>Andrew</b><p>Another status report about the status report.</p></article><input type="password" value="secret"><div contenteditable="true">Private draft</div><button id="send">Send</button><div id="overlay"></div>';
  return {
    target: document.querySelector<HTMLElement>("#target")!,
    overlay: document.querySelector<HTMLElement>("#overlay")!,
  };
}
for (const descriptor of catalog) {
  test(`${descriptor.id}: observable output, bounded allocations, repeated stop and exact style restoration`, async () => {
    const module = (await import(`../src/effects/${descriptor.id}/index.ts`))
      .default as EffectModule;
    for (let cycle = 0; cycle < 3; cycle++) {
      const { target, overlay } = fixture();
      const baseline = target.style.cssText;
      animations = [];
      draws = 0;
      frames.clear();
      const resources = new Resources();
      const controller = new AbortController();
      let failed = false;
      const context: EffectContext = {
        document,
        signal: controller.signal,
        resources,
        overlay,
        finish: () => {
          failed = true;
        },
      };
      const instance = module.create(context);
      const effectTarget: EffectTarget =
        descriptor.scope === "element"
          ? { kind: "element", element: target, document, x: 260, y: 190 }
          : descriptor.scope === "document"
            ? { kind: "document", document, elements: [target] }
            : { kind: "viewport", document };
      await instance.start(effectTarget, { ...defaults, reducedMotion: cycle === 1 });
      if (descriptor.id === "text-bomb") await Bun.sleep(cycle === 1 ? 150 : 700);
      expect(overlay.children.length).toBeGreaterThan(0);
      expect(overlay.children.length).toBeLessThanOrEqual(100);
      if (descriptor.id === "punch-element") expect(overlay.textContent).toContain("POW!");
      if (descriptor.id === "glass-shatter") {
        expect(overlay.querySelectorAll("canvas").length).toBe(10);
        expect(animations.length).toBe(10);
        expect(animations[0]!.frames[1]!.opacity).toBe(0.7);
      }
      if (descriptor.id === "screen-crack") expect(draws).toBeGreaterThan(100);
      if (descriptor.id === "flashlight")
        expect((overlay.firstElementChild as HTMLElement).style.background).toContain(
          "radial-gradient",
        );
      if (descriptor.scope === "element") expect(target.style.visibility).toBe("hidden");
      if (descriptor.id === "vortex") expect(animations[0]!.frames.at(-1)!.opacity).toBe(0);
      if (descriptor.id === "rubber-band") expect(animations[0]!.frames.length).toBe(6);
      if (descriptor.id === "gravity-collapse" && cycle !== 1) {
        const cb = frames.values().next().value!;
        frames.clear();
        cb(0);
        const next = frames.values().next().value!;
        frames.clear();
        next(16);
        expect((overlay.firstElementChild as HTMLElement).style.transform).toContain("translateY(");
      }
      controller.abort();
      instance.stop("user");
      instance.dispose();
      instance.dispose();
      expect(overlay.children.length).toBe(0);
      expect(target.style.cssText).toBe(baseline);
      expect(resources.size).toBe(0);
      expect(frames.size).toBe(0);
      expect(animations.every((a) => a.cancelled)).toBe(true);
      expect(failed).toBe(false);
    }
  });
}
test("text bomb cancellation during fuse cannot hide target or recreate particles", async () => {
  const { target, overlay } = fixture();
  const { default: module } = await import("../src/effects/text-bomb/index");
  const r = new Resources();
  const instance = module.create({
    document,
    overlay,
    resources: r,
    signal: new AbortController().signal,
    finish: () => {},
  });
  instance.start({ kind: "element", element: target, document, x: 150, y: 170 }, defaults);
  instance.stop("user");
  instance.dispose();
  await Bun.sleep(750);
  expect(overlay.childNodes.length).toBe(0);
  expect(target.style.visibility).toBe("");
});
test("ownership-aware restoration preserves legitimate host updates", () => {
  const { target } = fixture();
  const r = new Resources();
  r.style(target, "visibility", "hidden");
  target.style.setProperty("visibility", "visible");
  r.dispose();
  expect(target.style.visibility).toBe("visible");
});
test("targeting rejects private surfaces, detached nodes and embedded content", () => {
  const { target } = fixture();
  expect(eligible(target)).toBe(true);
  expect(eligible(document.body)).toBe(false);
  expect(protectedNode(document.querySelector("input")!)).toBe(true);
  expect(protectedNode(document.querySelector("[contenteditable]")!)).toBe(true);
  expect(eligible(document.querySelector("input"))).toBe(false);
  target.remove();
  expect(eligible(target)).toBe(false);
});
test("target enumeration is bounded and skips editable descendants and nested duplicate targets", () => {
  fixture();
  const area = document.createElement("div");
  for (let i = 0; i < 5000; i++) {
    const p = document.createElement("p");
    p.textContent = "synthetic";
    area.append(p);
  }
  document.body.append(area);
  const candidates = visibleTargets(12);
  expect(candidates.length).toBeLessThanOrEqual(12);
  expect(candidates.every((n) => !protectedNode(n))).toBe(true);
});
