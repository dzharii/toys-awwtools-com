import { test, expect } from "bun:test";
import { Window } from "happy-dom";
import { readFile } from "node:fs/promises";
import type { EffectModule, RuntimeBridge } from "../src/sdk/types";
interface Report {
  state: string;
  equipped: string | null;
  menu: string | null;
  invocation: string;
  invocationsStarted: number;
  sessionResources: number;
  resources: number;
  loaded: string[];
  events: { event: string }[];
}
type Listener = (
  message: unknown,
  sender: { id: string },
  respond: (value: unknown) => void,
) => boolean;
async function setup() {
  const w = new Window({ url: "https://synthetic.test" });
  let listener: Listener | undefined;
  let selectedTarget = "target";
  const store: Record<string, unknown> = {};
  let clock = 0,
    timerId = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  Object.defineProperty(w, "setTimeout", {
    configurable: true,
    value: (fn: () => void, ms = 0) => {
      const id = ++timerId;
      timers.set(id, { at: clock + ms, fn });
      return id;
    },
  });
  Object.defineProperty(w, "clearTimeout", {
    configurable: true,
    value: (id: number) => timers.delete(id),
  });
  const advance = (ms: number) => {
    clock += ms;
    for (const [id, t] of [...timers])
      if (t.at <= clock) {
        timers.delete(id);
        t.fn();
      }
  };
  let pending = false;
  let release: (() => void) | undefined;
  const code = await readFile("dist/content.js", "utf8");
  const extension = {
    runtime: {
      id: "test-extension",
      onMessage: {
        addListener: (fn: Listener) => {
          listener = fn;
        },
      },
      sendMessage: async (message: { type: string; id: string }) => {
        if (message.type === "shortcut") return { ok: true, shortcut: "Ctrl+Shift+Y" };
        if (pending)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        w.eval(await readFile(`dist/effects/${message.id}.js`, "utf8"));
        return { ok: true };
      },
    },
    storage: {
      local: {
        get: async () => store,
        set: async (value: Record<string, unknown>) => Object.assign(store, value),
      },
    },
  };
  Object.defineProperty(w, "chrome", { configurable: true, value: extension });
  w.document.body.innerHTML =
    '<article id="target"><p>A synthetic status report.</p></article><article id="second"><p>Second target</p></article><article id="third"><p>Third target</p></article><button id="send">Send</button><input type="password" value="not-a-real-secret">';
  Object.defineProperty(w.HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new w.DOMRect(100, 100, 400, 100),
  });
  Object.defineProperty(w.Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new w.DOMRect(110, 120, 80, 20),
  });
  Object.defineProperty(w.HTMLElement.prototype, "getClientRects", {
    configurable: true,
    value: () => [new w.DOMRect(100, 100, 400, 100)],
  });
  Object.defineProperty(w.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => new Proxy({}, { get: () => () => {}, set: () => true }),
  });
  Object.defineProperty(w.Element.prototype, "animate", {
    configurable: true,
    value: () => ({ cancel: () => {}, finished: new Promise(() => {}) }),
  });
  Object.defineProperty(w.document, "elementFromPoint", {
    configurable: true,
    value: () => w.document.querySelector("#" + selectedTarget),
  });
  w.eval(code);
  const send = (message: Record<string, unknown>) =>
    new Promise<unknown>((resolve) => listener!(message, { id: "test-extension" }, resolve));
  const shadow = () => w.document.querySelector("[data-art-root]")?.shadowRoot;
  const report = async () => (await send({ type: "report" })) as Report;
  return {
    w,
    send,
    shadow,
    report,
    extension,
    advance,
    timers,
    store,
    aim: (id: string) => {
      selectedTarget = id;
    },
    click: () =>
      shadow()!
        .querySelector(".capture")!
        .dispatchEvent(
          new w.MouseEvent("click", {
            clientX: 150,
            clientY: 150,
            bubbles: true,
            cancelable: true,
            composed: true,
          }),
        ),
    escape: () =>
      w.dispatchEvent(
        new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      ),
    duplicate: () => w.eval(code),
    delay: () => {
      pending = true;
    },
    release: () => {
      pending = false;
      release?.();
    },
    bridge: () => (w as unknown as { __angerReliefToyV1: RuntimeBridge }).__angerReliefToyV1,
  };
}
test("one equipped Punch handles three distinct completed invocations without reselection", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element" });
    const listeners = (await f.report()).sessionResources;
    for (let i = 0; i < 3; i++) {
      f.aim(["target", "second", "third"][i]!);
      f.click();
      await Bun.sleep(2);
      expect((await f.report()).invocation).toBe("playing");
      expect(f.shadow()?.textContent).toContain("POW!");
      f.advance(4000);
      expect((await f.report()).equipped).toBe("punch-element");
      expect((await f.report()).invocation).toBe("idle");
      expect(f.shadow()?.querySelector(".hud-name")?.textContent).toBe("Punch");
      expect(
        (f.w.document.getElementById("target") as import("happy-dom").HTMLElement).style.visibility,
      ).toBe("");
      expect((await f.report()).resources).toBe(0);
      expect((await f.report()).sessionResources).toBe(listeners);
    }
    expect((await f.report()).invocationsStarted).toBe(3);
    f.escape();
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
    expect(f.timers.size).toBe(0);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("Text Bomb fuse, explosion and cleanup keep the next placement ready", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "text-bomb" });
    for (let i = 0; i < 2; i++) {
      f.click();
      f.advance(700);
      expect(f.shadow()?.querySelector(".stage")?.childElementCount).toBeGreaterThan(0);
      f.advance(3000);
      expect((await f.report()).equipped).toBe("text-bomb");
      expect((await f.report()).resources).toBe(0);
    }
    expect((await f.report()).invocationsStarted).toBe(2);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("Flashlight has no lifetime timer, survives 12s, scroll, resize and menu dismissal", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "flashlight" });
    expect(f.timers.size).toBe(0);
    f.advance(12000);
    const initial = f.shadow()!.querySelector(".stage")!;
    for (const name of ["scroll", "resize"]) f.w.dispatchEvent(new f.w.Event(name));
    expect(f.shadow()!.querySelector(".stage")).toBe(initial);
    await f.send({ type: "show", mode: "wheel" });
    expect((await f.report()).equipped).toBe("flashlight");
    expect(f.shadow()!.querySelector(".stage")).toBe(initial);
    f.escape();
    expect((await f.report()).menu).toBeNull();
    expect((await f.report()).equipped).toBe("flashlight");
    await f.send({ type: "show", mode: "catalog" });
    f.escape();
    expect(f.shadow()!.querySelector(".stage")).toBe(initial);
    f.escape();
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
    expect((await f.report()).resources).toBe(0);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("complete wheel journey: three punches, two bombs, persistent light, put away", async () => {
  const f = await setup();
  try {
    await f.send({ type: "show", mode: "wheel" });
    f.shadow()!
      .querySelector<import("happy-dom").HTMLButtonElement>("[aria-label='Equip Punch']")!
      .click();
    await Bun.sleep(10);
    for (let i = 0; i < 3; i++) {
      f.aim(["target", "second", "third"][i]!);
      f.click();
      f.advance(4000);
    }
    await f.send({ type: "show", mode: "wheel" });
    f.shadow()!
      .querySelector<import("happy-dom").HTMLButtonElement>("[aria-label='Equip Text Bomb']")!
      .click();
    await Bun.sleep(10);
    for (let i = 0; i < 2; i++) {
      f.click();
      f.advance(700);
      f.advance(3000);
    }
    await f.send({ type: "show", mode: "wheel" });
    f.shadow()!
      .querySelector<import("happy-dom").HTMLButtonElement>("[aria-label='Equip Flashlight']")!
      .click();
    await Bun.sleep(10);
    f.advance(12000);
    expect((await f.report()).invocationsStarted).toBe(6);
    expect((await f.report()).equipped).toBe("flashlight");
    f.shadow()!.querySelector<import("happy-dom").HTMLButtonElement>(".put-away")!.click();
    expect((await f.report()).equipped).toBeNull();
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
    expect(f.timers.size).toBe(0);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("wheel toggles, centers and shows actual shortcut; menus preserve selection", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "rubber-band" });
    await f.send({ type: "show", mode: "wheel" });
    expect(f.shadow()?.querySelectorAll(".wheel-sector").length).toBe(8);
    expect(f.shadow()?.querySelector(".shortcut")?.textContent).toBe("Ctrl+Shift+Y");
    expect(
      f.shadow()?.querySelector("[aria-label='Equip Rubber']")?.getAttribute("aria-pressed"),
    ).toBe("true");
    expect(f.shadow()?.querySelector<import("happy-dom").HTMLElement>(".capture")?.hidden).toBe(
      true,
    );
    await f.send({ type: "show", mode: "wheel" });
    expect((await f.report()).menu).toBeNull();
    expect((await f.report()).equipped).toBe("rubber-band");
    expect(f.shadow()?.querySelector<import("happy-dom").HTMLElement>(".capture")?.hidden).toBe(
      false,
    );
    await f.send({ type: "show", mode: "catalog" });
    f.w.document.dispatchEvent(new f.w.Event("scroll"));
    expect((await f.report()).menu).toBe("catalog");
    f.escape();
    expect((await f.report()).equipped).toBe("rubber-band");
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("rapid use remains bounded and switching removes old resources", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element" });
    for (let i = 0; i < 10; i++) f.click();
    expect((await f.report()).invocationsStarted).toBe(10);
    expect(f.shadow()?.querySelectorAll(".stage").length).toBe(1);
    expect((await f.report()).resources).toBeLessThan(100);
    expect(f.timers.size).toBe(1);
    await f.send({ type: "select", id: "flashlight" });
    expect(f.shadow()?.querySelectorAll(".stage").length).toBe(1);
    expect(f.timers.size).toBe(0);
    expect(
      (f.w.document.getElementById("target") as import("happy-dom").HTMLElement).style.visibility,
    ).toBe("");
    f.duplicate();
    expect(f.w.document.querySelectorAll("[data-art-root]").length).toBe(1);
    expect((await f.report()).loaded).toEqual(["punch-element", "flashlight"]);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("late loading after put-away never recreates a tool, HUD or invocation", async () => {
  const f = await setup();
  try {
    f.delay();
    const activation = f.send({ type: "select", id: "flashlight" });
    await Bun.sleep(2);
    await f.send({ type: "stop" });
    f.release();
    await activation;
    expect((await f.report()).equipped).toBeNull();
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("catalog retains search/filter/favorites, centers, drags, and dismisses only navigation", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "text-bomb" });
    await f.send({ type: "show", mode: "catalog" });
    expect(f.shadow()?.querySelectorAll(".tool").length).toBe(8);
    const input = f.shadow()!.querySelector("input")!;
    input.value = "break";
    input.dispatchEvent(new f.w.Event("input"));
    expect(f.shadow()?.querySelectorAll(".tool").length).toBe(2);
    const panel = f.shadow()!.querySelector(".art-dialog")! as import("happy-dom").HTMLElement;
    const handle = f.shadow()!.querySelector(".brand")!;
    handle.dispatchEvent(
      new f.w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
    );
    expect(panel.style.left).toBe("124px");
    expect(panel.style.transform).toBe("none");
    (
      f
        .shadow()!
        .querySelector("[aria-label='Close tools']")! as import("happy-dom").HTMLButtonElement
    ).click();
    expect((await f.report()).menu).toBeNull();
    expect((await f.report()).equipped).toBe("text-bomb");
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("cursor is offset, clipped safely, noninteractive and suppressed behind menus", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element" });
    f.shadow()!
      .querySelector(".capture")!
      .dispatchEvent(
        new f.w.PointerEvent("pointermove", { clientX: 100, clientY: 100, bubbles: true }),
      );
    const cue = f.shadow()!.querySelector(".cursor-cue")! as import("happy-dom").HTMLElement;
    expect(cue.style.left).toBe("138px");
    expect(cue.style.top).toBe("138px");
    expect(cue.hidden).toBe(false);
    await f.send({ type: "show", mode: "wheel" });
    expect(cue.hidden).toBe(true);
    f.escape();
    expect(cue.hidden).toBe(false);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("keyboard targets and HUD are usable; Escape handles the topmost layer", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element" });
    f.w.dispatchEvent(
      new f.w.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }),
    );
    f.w.dispatchEvent(
      new f.w.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
    );
    expect((await f.report()).invocationsStarted).toBe(1);
    await f.send({ type: "show", mode: "catalog" });
    f.escape();
    expect((await f.report()).equipped).toBe("punch-element");
    expect((await f.report()).menu).toBeNull();
    f.escape();
    expect((await f.report()).state).toBe("unequipped");
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("target loss and geometry changes end only an invocation; navigation ends the session", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element" });
    f.click();
    const target = f.w.document.getElementById("target")!;
    target.remove();
    await Bun.sleep(10);
    expect((await f.report()).resources).toBe(0);
    expect((await f.report()).equipped).toBe("punch-element");
    f.w.dispatchEvent(new f.w.Event("resize"));
    expect((await f.report()).equipped).toBe("punch-element");
    f.w.dispatchEvent(new f.w.Event("popstate"));
    expect((await f.report()).equipped).toBeNull();
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("rendering failures keep the tool usable and diagnostics exclude page data", async () => {
  const f = await setup();
  try {
    const module: EffectModule = {
      sdkVersion: "1.0",
      create: (c) => ({
        start: () => {
          c.overlay.append(c.resources.node(c.document.createElement("div")));
          throw new Error("private synthetic payload");
        },
        stop: () => {},
        dispose: () => {},
      }),
    };
    f.bridge().register("punch-element", module);
    await f.send({ type: "select", id: "punch-element" });
    f.click();
    expect((await f.report()).invocation).toBe("failed");
    expect((await f.report()).resources).toBe(0);
    expect((await f.report()).equipped).toBe("punch-element");
    await f.send({ type: "select", id: "flashlight" });
    expect(f.shadow()?.querySelector(".stage")?.childElementCount).toBe(1);
    expect(JSON.stringify(await f.report())).not.toContain("private synthetic");
    await f.send({ type: "clear-diagnostics" });
    expect((await f.report()).events).toEqual([]);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("ending an animation does not put away the tool and shield never forwards host clicks", async () => {
  const f = await setup();
  try {
    let clicks = 0;
    f.w.document.getElementById("send")!.addEventListener("click", () => clicks++);
    await f.send({ type: "select", id: "punch-element" });
    f.click();
    (f.shadow()!.querySelector(".end-effect")! as import("happy-dom").HTMLButtonElement).click();
    expect((await f.report()).equipped).toBe("punch-element");
    expect((await f.report()).resources).toBe(0);
    expect(clicks).toBe(0);
    f.escape();
    expect((await f.report()).sessionResources).toBe(0);
  } finally {
    await f.w.happyDOM.abort();
  }
});

test("optional preference storage failure does not stop a successfully equipped tool", async () => {
  const f = await setup();
  try {
    f.extension.storage.local.set = async () => {
      throw new Error("synthetic storage failure");
    };
    await f.send({ type: "select", id: "flashlight" });
    expect((await f.report()).equipped).toBe("flashlight");
    expect((await f.report()).invocation).toBe("continuous");
    f.escape();
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("pointer dragging excludes controls and cancels cleanly without unequipping", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element" });
    await f.send({ type: "show", mode: "catalog" });
    const handle = f.shadow()!.querySelector(".brand")!;
    const panel = f.shadow()!.querySelector(".art-dialog")! as import("happy-dom").HTMLElement;
    handle.dispatchEvent(
      new f.w.PointerEvent("pointerdown", {
        button: 0,
        pointerId: 9,
        clientX: 120,
        clientY: 110,
        bubbles: true,
        cancelable: true,
      }),
    );
    handle.dispatchEvent(
      new f.w.PointerEvent("pointermove", {
        pointerId: 9,
        clientX: 160,
        clientY: 150,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(panel.style.left).toBe("140px");
    handle.dispatchEvent(new f.w.PointerEvent("pointercancel", { pointerId: 9, bubbles: true }));
    expect(panel.hasAttribute("data-dragging")).toBe(false);
    const close = f.shadow()!.querySelector("[aria-label='Close tools']")!;
    close.dispatchEvent(
      new f.w.PointerEvent("pointerdown", {
        button: 0,
        pointerId: 10,
        clientX: 120,
        clientY: 110,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(panel.hasAttribute("data-dragging")).toBe(false);
    f.escape();
    expect((await f.report()).equipped).toBe("punch-element");
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("hidden tabs suspend continuous work without discarding equipment", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "flashlight" });
    Object.defineProperty(f.w.document, "hidden", { configurable: true, value: true });
    f.w.document.dispatchEvent(new f.w.Event("visibilitychange"));
    expect((await f.report()).state).toBe("suspended");
    expect((await f.report()).equipped).toBe("flashlight");
    expect((await f.report()).resources).toBe(0);
    Object.defineProperty(f.w.document, "hidden", { configurable: true, value: false });
    f.w.document.dispatchEvent(new f.w.Event("visibilitychange"));
    await Bun.sleep(2);
    expect((await f.report()).equipped).toBe("flashlight");
    expect((await f.report()).invocation).toBe("continuous");
  } finally {
    await f.w.happyDOM.abort();
  }
});

test("target-mode Enter and Space cannot activate a previously focused host control", async () => {
  const f = await setup();
  try {
    (f.w.document.getElementById("send") as import("happy-dom").HTMLButtonElement).focus();
    await f.send({ type: "select", id: "punch-element" });
    expect(f.shadow()?.activeElement?.className).toBe("capture");
    for (const key of ["Enter", " "]) {
      const event = new f.w.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      f.w.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
    expect((await f.report()).invocationsStarted).toBe(0);
  } finally {
    await f.w.happyDOM.abort();
  }
});
