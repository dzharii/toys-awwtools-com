import { describe, expect, test } from "bun:test";
import {
  WINDOW_CHANNEL_PROTOCOL,
  bindWindowChannel,
  createChannelEnvelope,
  isValidChannelEnvelope,
  postChannelMessage,
} from "../src/transport/window-channel.js";

describe("window channel", () => {
  test("creates and validates protocol envelopes", () => {
    const message = createChannelEnvelope("session-1", "popup-ready", { ping: true });
    expect(message.protocol).toBe(WINDOW_CHANNEL_PROTOCOL);
    expect(isValidChannelEnvelope(message, { sessionId: "session-1" })).toBe(true);
    expect(isValidChannelEnvelope({ ...message, protocol: "wrong" }, { sessionId: "session-1" })).toBe(false);
    expect(isValidChannelEnvelope({ ...message, sessionId: "other" }, { sessionId: "session-1" })).toBe(false);
  });

  test("postChannelMessage requires explicit target origin", () => {
    let posted = null;
    const target = {
      postMessage(message, origin) {
        posted = { message, origin };
      },
    };

    const envelope = createChannelEnvelope("s1", "session-snapshot", { selected: 1 });
    expect(postChannelMessage(target, "*", envelope)).toBe(false);
    expect(postChannelMessage(target, "https://example.test", envelope)).toBe(true);
    expect(posted).toEqual({ message: envelope, origin: "https://example.test" });
  });

  test("bindWindowChannel validates origin and session id before dispatch", () => {
    const fakeWindow = new EventTarget();
    fakeWindow.location = { origin: "https://example.test" };
    const seen = [];

    const binding = bindWindowChannel(fakeWindow, {
      origin: "https://example.test",
      sessionId: "session-42",
      onMessage(message) {
        seen.push(message.type);
      },
    });

    fakeWindow.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://evil.test",
        data: createChannelEnvelope("session-42", "popup-ready", {}),
      }),
    );

    fakeWindow.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.test",
        data: createChannelEnvelope("wrong-session", "popup-ready", {}),
      }),
    );

    fakeWindow.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.test",
        data: createChannelEnvelope("session-42", "popup-ready", {}),
      }),
    );

    expect(seen).toEqual(["popup-ready"]);

    binding.unbind();
    fakeWindow.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.test",
        data: createChannelEnvelope("session-42", "session-patch", {}),
      }),
    );

    expect(seen).toEqual(["popup-ready"]);
  });
});
