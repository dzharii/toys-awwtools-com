import { describe, expect, test } from "bun:test";
import {
  createBookmarkletUrl,
} from "../src/build-artifacts.js";
import {
  clamp,
  dedupeBy,
  escapeCssString,
  excerpt,
  isStableToken,
  looksGeneratedToken,
  normalizeWhitespace,
  rectContains,
  rectIntersects,
  rectIntersectionArea,
  rectOverlapRatio,
  safeLower,
  serializeError,
  sortByScoreDesc,
  stableJson,
  toCamelCase,
  uniqueName,
} from "../src/utils.js";

describe("utils", () => {
  test("normalizes whitespace and camelCases labels", () => {
    expect(normalizeWhitespace("  send   message   now ")).toBe("send message now");
    expect(toCamelCase("Send Message Button")).toBe("sendMessageButton");
  });

  test("detects generated-looking tokens", () => {
    expect(looksGeneratedToken("css-1ab29d")).toBe(true);
    expect(looksGeneratedToken("message-composer")).toBe(false);
    expect(looksGeneratedToken("px-4")).toBe(true);
  });

  test("creates unique camelCase names", () => {
    expect(uniqueName("Send Button", ["sendButton"])).toBe("sendButton2");
    expect(uniqueName("Chat Transcript", ["composer"])).toBe("chatTranscript");
    expect(toCamelCase("")).toBe("pageObject");
  });

  test("dedupes and computes rectangle overlap", () => {
    expect(dedupeBy([{ id: 1 }, { id: 1 }, { id: 2 }], (item) => item.id)).toHaveLength(2);
    const left = { left: 0, top: 0, width: 100, height: 100 };
    const right = { left: 50, top: 50, width: 100, height: 100 };
    expect(rectIntersects(left, right)).toBe(true);
    expect(rectContains({ left: 0, top: 0, width: 200, height: 200 }, left)).toBe(true);
    expect(rectIntersectionArea(left, right)).toBe(2500);
    expect(rectOverlapRatio(left, right)).toBe(0.25);
  });

  test("stabilizes JSON key ordering", () => {
    const sorted = stableJson({ z: 1, a: { y: 2, b: 3 } });
    expect(Object.keys(sorted)).toEqual(["a", "z"]);
    expect(Object.keys(sorted.a)).toEqual(["b", "y"]);
  });

  test("builds a bookmarklet url", () => {
    expect(createBookmarkletUrl("alert(1);")).toBe("javascript:alert(1)%3B");
  });

  test("exposes string and score helpers", () => {
    expect(isStableToken("composer-panel")).toBe(true);
    expect(clamp(44, 0, 10)).toBe(10);
    expect(safeLower("  SEND NOW ")).toBe("send now");
    expect(excerpt("abcdefghijk", 6)).toBe("abcde…");
    expect(escapeCssString('a"b\\c')).toBe('a\\"b\\\\c');
    expect(serializeError(new Error("broken"))).toBe("broken");
    expect(serializeError("raw")).toBe("raw");
    const ranked = sortByScoreDesc([
      { selector: "b", score: 10 },
      { selector: "a", score: 10 },
      { selector: "c", score: 2 },
    ]);
    expect(ranked.map((item) => item.selector)).toEqual(["a", "b", "c"]);
  });
});
