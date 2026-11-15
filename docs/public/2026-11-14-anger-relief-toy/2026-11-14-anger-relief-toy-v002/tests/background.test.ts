import { test, expect } from "bun:test";
import { Window } from "happy-dom";
import { readFile } from "node:fs/promises";
import type { Descriptor } from "../src/sdk/types";
test("packaged coordinator rejects arbitrary paths, foreign senders and subframes; injects approved isolated files only", async () => {
  const w = new Window();
  const executions: { target: { tabId: number }; world: string; files: string[] }[] = [];
  let listener:
    | ((
        message: unknown,
        sender: chrome.runtime.MessageSender,
        respond: (value: unknown) => void,
      ) => boolean)
    | undefined;
  Object.defineProperty(w, "chrome", {
    value: {
      runtime: {
        id: "own",
        onMessage: {
          addListener: (fn: typeof listener) => {
            listener = fn;
          },
        },
      },
      tabs: { query: async () => [{ id: 42 }], sendMessage: async () => ({ ok: true }) },
      scripting: {
        executeScript: async (data: {
          target: { tabId: number };
          world: string;
          files: string[];
        }) => {
          executions.push(data);
          return [];
        },
      },
      commands: {
        getAll: async () => [{ name: "open-wheel", shortcut: "Ctrl+Shift+Y" }],
        onCommand: { addListener: () => {} },
      },
    },
  });
  w.eval(await readFile("dist/background.js", "utf8"));
  const send = (
    message: Record<string, unknown>,
    sender: chrome.runtime.MessageSender = { id: "own" },
  ) =>
    new Promise<unknown>((resolve) => {
      if (!listener!(message, sender, resolve)) resolve({ ignored: true });
    });
  try {
    expect(await send({ type: "launch", id: "../../evil" })).toEqual({ ok: false });
    expect(executions.length).toBe(0);
    expect(await send({ type: "launch", id: "flashlight" }, { id: "foreign" })).toEqual({
      ok: false,
    });
    expect(executions.length).toBe(0);
    expect(
      await send(
        { type: "load", id: "flashlight" },
        { id: "own", tab: { id: 42 } as chrome.tabs.Tab, frameId: 9 },
      ),
    ).toEqual({ ok: false, error: "UNSUPPORTED_PAGE" });
    expect(executions.length).toBe(0);
    expect(await send({ type: "launch", id: "flashlight" })).toEqual({ ok: true });
    expect(executions[0]).toEqual({
      target: { tabId: 42 },
      world: "ISOLATED",
      files: ["content.js"],
    });
    expect(
      await send(
        { type: "load", id: "flashlight" },
        { id: "own", tab: { id: 42 } as chrome.tabs.Tab, frameId: 0 },
      ),
    ).toEqual({ ok: true });
    expect(executions[1]!.files).toEqual(["effects/flashlight.js"]);
    expect(await send({ type: "shortcut" })).toEqual({ ok: true, shortcut: "Ctrl+Shift+Y" });
    const manifest = JSON.parse(await readFile("dist/manifest.json", "utf8"));
    expect(manifest.permissions).toEqual(["activeTab", "scripting", "storage"]);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest.web_accessible_resources).toBeUndefined();
    expect(manifest.content_scripts).toBeUndefined();
    const { catalog } = await import("../src/generated/catalog");
    expect((catalog as Descriptor[]).every((e) => e.status === "review-pending")).toBe(true);
  } finally {
    await w.happyDOM.abort();
  }
});
