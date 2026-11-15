import { test, expect } from "bun:test";
import { Window } from "happy-dom";
import { readFile } from "node:fs/promises";
import type { EffectModule, RuntimeBridge } from "../src/sdk/types";
interface Report {
  state: string;
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
  const store: Record<string, unknown> = {};
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
    '<article id="target"><p>A synthetic status report.</p></article><button id="send">Send</button><input type="password" value="not-a-real-secret">';
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
    value: () => w.document.querySelector("#target"),
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
test("packaged runtime loads only requested module; replacement and stop remove resources", async () => {
  const f = await setup();
  try {
    expect((await f.report()).loaded).toEqual([]);
    await f.send({ type: "select", id: "flashlight", options: { duration: 10 } });
    expect((await f.report()).loaded).toEqual(["flashlight"]);
    expect(f.shadow()?.querySelector(".stage")?.childElementCount).toBe(1);
    await f.send({ type: "select", id: "screen-crack", options: { duration: 10 } });
    expect(f.w.document.querySelectorAll("[data-art-root]").length).toBe(1);
    expect(f.shadow()?.querySelectorAll(".stage").length).toBe(1);
    await f.send({ type: "stop" });
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
    expect((await f.report()).resources).toBe(0);
    expect((await f.report()).state).toBe("stopped");
    f.duplicate();
    expect((await f.report()).loaded).toEqual(["flashlight", "screen-crack"]);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("stop during lazy loading cancels activation even when module completes later", async () => {
  const f = await setup();
  try {
    f.delay();
    const activation = f.send({ type: "select", id: "flashlight" });
    await Bun.sleep(5);
    await f.send({ type: "stop" });
    f.release();
    await activation;
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
    expect((await f.report()).state).toBe("stopped");
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("selection shield and keyboard selection never dispatch to the host control; Escape restores", async () => {
  const f = await setup();
  try {
    let clicks = 0;
    f.w.document.querySelector("#send")!.addEventListener("click", () => clicks++);
    await f.send({ type: "select", id: "punch-element", options: { duration: 10 } });
    expect((await f.report()).state).toBe("targeting");
    const capture = f.shadow()!.querySelector(".capture")!;
    capture.dispatchEvent(
      new f.w.MouseEvent("click", {
        clientX: 150,
        clientY: 150,
        bubbles: true,
        cancelable: true,
        composed: true,
      }),
    );
    await Bun.sleep(5);
    expect((await f.report()).state).toBe("active");
    expect(clicks).toBe(0);
    expect(
      (f.w.document.getElementById("target")! as import("happy-dom").HTMLElement).style.visibility,
    ).toBe("hidden");
    f.w.dispatchEvent(
      new f.w.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    expect(
      (f.w.document.getElementById("target")! as import("happy-dom").HTMLElement).style.visibility,
    ).toBe("");
    expect((await f.report()).resources).toBe(0);
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("catalog search, favorite persistence and wheel use generated metadata", async () => {
  const f = await setup();
  try {
    await f.send({ type: "show", mode: "catalog" });
    expect(f.shadow()?.querySelectorAll(".tool").length).toBe(8);
    const input = f.shadow()!.querySelector("input")!;
    input.value = "break";
    input.dispatchEvent(new f.w.Event("input"));
    expect(f.shadow()?.querySelectorAll(".tool").length).toBe(2);
    const star = f
      .shadow()!
      .querySelector("[aria-label='Favorite Shatter']")! as import("happy-dom").HTMLButtonElement;
    star.click();
    await Bun.sleep(10);
    await f.send({ type: "show", mode: "wheel" });
    expect(f.shadow()?.querySelectorAll(".wheel button").length).toBe(9);
    await f.send({ type: "stop" });
    expect(f.w.document.querySelector("[data-art-root]")).toBeNull();
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("rendering failure is contained, cleanup completes and unrelated tools still work", async () => {
  const f = await setup();
  try {
    const module: EffectModule = {
      sdkVersion: "1.0",
      create: (c) => ({
        start: () => {
          const node = c.resources.node(c.document.createElement("div"));
          c.overlay.append(node);
          throw new Error("private synthetic data must not enter diagnostics");
        },
        stop: () => {},
        dispose: () => {},
      }),
    };
    f.bridge().register("screen-crack", module);
    await f.send({ type: "select", id: "screen-crack" });
    expect((await f.report()).resources).toBe(0);
    expect(f.shadow()?.querySelector(".stage")).toBeNull();
    await f.send({ type: "select", id: "flashlight", options: { duration: 10 } });
    expect(f.shadow()?.querySelector(".stage")?.childElementCount).toBe(1);
    expect(JSON.stringify(await f.report())).not.toContain("private synthetic");
    expect(JSON.stringify(await f.report())).not.toContain("synthetic.test");
  } finally {
    await f.w.happyDOM.abort();
  }
});
test("removing selected target, scrolling and navigation terminate the active effect", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element", options: { duration: 10 } });
    f.shadow()!
      .querySelector(".capture")!
      .dispatchEvent(
        new f.w.MouseEvent("click", {
          clientX: 150,
          clientY: 150,
          bubbles: true,
          cancelable: true,
        }),
      );
    f.w.document.querySelector("#target")!.remove();
    await Bun.sleep(10);
    expect((await f.report()).state).toBe("stopped");
    await f.send({ type: "select", id: "flashlight", options: { duration: 10 } });
    f.w.document.dispatchEvent(new f.w.Event("scroll"));
    expect((await f.report()).state).toBe("stopped");
    await f.send({ type: "select", id: "flashlight", options: { duration: 10 } });
    f.w.dispatchEvent(new f.w.Event("popstate"));
    expect((await f.report()).state).toBe("stopped");
  } finally {
    await f.w.happyDOM.abort();
  }
});

test("catalog scrolling stays open; keyboard targeting and cleared diagnostics work", async () => {
  const f = await setup();
  try {
    await f.send({ type: "show", mode: "catalog" });
    f.w.document.dispatchEvent(new f.w.Event("scroll"));
    expect(f.shadow()?.querySelectorAll(".tool").length).toBe(8);
    await f.send({ type: "select", id: "rubber-band", options: { duration: 10 } });
    f.w.dispatchEvent(
      new f.w.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }),
    );
    f.w.dispatchEvent(
      new f.w.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
    );
    await Bun.sleep(5);
    expect((await f.report()).state).toBe("active");
    await f.send({ type: "stop" });
    await f.send({ type: "clear-diagnostics" });
    expect((await f.report()).events).toEqual([]);
  } finally {
    await f.w.happyDOM.abort();
  }
});

test("host layout and selected text changes terminate stale snapshots", async () => {
  const f = await setup();
  try {
    await f.send({ type: "select", id: "punch-element", options: { duration: 10 } });
    f.shadow()!
      .querySelector(".capture")!
      .dispatchEvent(
        new f.w.MouseEvent("click", {
          clientX: 150,
          clientY: 150,
          bubbles: true,
          cancelable: true,
        }),
      );
    const target = f.w.document.getElementById("target")!;
    Object.defineProperty(target, "getBoundingClientRect", {
      configurable: true,
      value: () => new f.w.DOMRect(200, 100, 400, 100),
    });
    target.setAttribute("class", "moved");
    await Bun.sleep(10);
    expect((await f.report()).state).toBe("stopped");
    await f.send({ type: "select", id: "punch-element", options: { duration: 10 } });
    f.shadow()!
      .querySelector(".capture")!
      .dispatchEvent(
        new f.w.MouseEvent("click", {
          clientX: 150,
          clientY: 150,
          bubbles: true,
          cancelable: true,
        }),
      );
    target.textContent = "A new live message";
    await Bun.sleep(10);
    expect((await f.report()).state).toBe("stopped");
    expect((target as import("happy-dom").HTMLElement).style.visibility).toBe("");
  } finally {
    await f.w.happyDOM.abort();
  }
});
