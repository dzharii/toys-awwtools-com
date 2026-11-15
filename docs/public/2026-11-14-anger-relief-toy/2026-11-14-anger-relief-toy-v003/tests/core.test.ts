import { test, expect } from "bun:test";
import { Resources } from "../src/sdk/resources";
import { options, defaults, validId } from "../src/sdk/validation";
import { random } from "../src/sdk/visual";
import { validateDescriptor } from "../tools/metadata";
import metadata from "../src/effects/punch-element/effect.json";
test("options are finite, bounded and reject inherited or malformed types", () => {
  expect(
    options({
      strength: 999,
      duration: -5,
      radius: Infinity,
      darkness: NaN,
      softness: "99",
      reducedMotion: "true",
    }),
  ).toEqual({ ...defaults, strength: 1, duration: 1 });
  expect(options(null)).toEqual(defaults);
  expect(options({ strength: 0.4 })).toEqual({ ...defaults, strength: 0.4 });
});
test("IDs cannot select file paths or code", () => {
  for (const id of ["../x", "x.js", "x/y", "<script>", "", 3]) expect(validId(id)).toBe(false);
  expect(validId("punch-element")).toBe(true);
});
test("metadata fails duplicate ID, incompatible SDK, missing provenance, injected SVG and malformed capability", () => {
  expect(() => validateDescriptor(metadata, metadata.id, [metadata.id])).toThrow();
  for (const change of [
    { sdkVersion: "9" },
    { source: {} },
    { icon: '" onload="alert(1)' },
    { scope: "whatever" },
    { capabilities: { reducedMotion: false } },
  ])
    expect(() => validateDescriptor({ ...metadata, ...change }, metadata.id, [])).toThrow();
});
test("disposal is reverse ordered, idempotent and contains errors", () => {
  const seen: number[] = [];
  let errors = 0;
  const r = new Resources(() => errors++);
  r.own(() => seen.push(1));
  r.own(() => {
    throw new Error("synthetic");
  });
  r.own(() => seen.push(3));
  r.dispose();
  r.dispose();
  expect(seen).toEqual([3, 1]);
  expect(errors).toBe(1);
  expect(r.size).toBe(0);
  r.own(() => seen.push(4));
  expect(seen).toEqual([3, 1, 4]);
  expect(r.size).toBe(0);
});
test("stop cancels timers and listeners; completed timeout relinquishes ownership", async () => {
  const target = new EventTarget();
  const r = new Resources();
  let calls = 0;
  r.listen(target, "test", () => calls++);
  r.timeout(() => calls++, 15);
  target.dispatchEvent(new Event("test"));
  r.dispose();
  target.dispatchEvent(new Event("test"));
  await Bun.sleep(25);
  expect(calls).toBe(1);
  expect(r.size).toBe(0);
  const r2 = new Resources();
  r2.timeout(() => calls++, 1);
  await Bun.sleep(10);
  expect(r2.size).toBe(0);
  expect(calls).toBe(2);
});
test("rendering seeds reproduce a bounded sequence", () => {
  const a = random(7),
    b = random(7);
  for (let i = 0; i < 100; i++) {
    const value = a();
    expect(value).toBe(b());
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  }
});

test("feature guardrails reject network, dynamic execution, storage, event synthesis and unrelated imports", async () => {
  const { validateFeatureSource } = await import("../tools/security");
  for (const code of [
    'fetch("x")',
    'new Function("return 1")',
    "document.cookie",
    'localStorage.setItem("a","b")',
    'chrome.storage.local.get("x")',
    "node.dispatchEvent(e)",
    'import x from "../other/index"',
    'import x from "../../runtime/content"',
  ])
    expect(() => validateFeatureSource(code, "test")).toThrow();
  expect(() =>
    validateFeatureSource('import {layer} from "../../sdk/visual";', "test"),
  ).not.toThrow();
});

test("diagnostics group activation events, bound retention and clear without page metadata", async () => {
  const { Diagnostics } = await import("../src/runtime/diagnostics");
  const d = new Diagnostics();
  d.write("effect.load.started", "flashlight");
  d.write("effect.start.completed", "flashlight");
  d.write("effect.stop.completed", "flashlight");
  const first = d.report();
  expect(first[0]!.correlationId).toBe(first[2]!.correlationId);
  d.write("effect.load.started", "screen-crack");
  expect(d.report()[3]!.correlationId).not.toBe(first[0]!.correlationId);
  for (let i = 0; i < 120; i++) d.write("effect.stop.completed", "screen-crack");
  expect(d.report().length).toBe(100);
  d.clear();
  expect(d.report()).toEqual([]);
});

test("illustrated icons reject executable or remotely referenced SVG", async () => {
  const { validateIcon } = await import("../tools/icons");
  for (const source of [
    '<svg onload="x()"></svg>',
    '<svg ><style>@import "https://x"</style></svg>',
    '<svg ><image href="https://x"/></svg>',
    "<svg ><foreignObject/></svg>",
    '<svg ><animate repeatCount="indefinite"/></svg>',
  ])
    expect(() => validateIcon(source, "test")).toThrow();
  expect(() =>
    validateIcon('<svg viewBox="0 0 32 32"><path fill="url(#ICON-g)" d="M1 1"/></svg>', "test"),
  ).not.toThrow();
});
