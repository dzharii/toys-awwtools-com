import { describe, expect, it } from "bun:test";

import { isValidBookmarkletName } from "../scripts/lib/bookmarklet-name.js";

describe("isValidBookmarkletName", () => {
  it("accepts kebab-case names", () => {
    expect(isValidBookmarkletName("2026-04-16-link-cleaner")).toBe(true);
  });

  it("rejects spaces and underscores", () => {
    expect(isValidBookmarkletName("my bookmarklet")).toBe(false);
    expect(isValidBookmarkletName("my_bookmarklet")).toBe(false);
  });
});
