import { describe, expect, it } from "bun:test";

import { toBookmarkletPayload } from "../scripts/lib/bookmarklet-payload.js";

describe("toBookmarkletPayload", () => {
  it("adds javascript prefix and removes line breaks", () => {
    const out = toBookmarkletPayload("\nconsole.log('x');\n\n");
    expect(out).toBe("javascript:console.log('x');");
  });

  it("removes unicode separators that can break bookmarklets", () => {
    const out = toBookmarkletPayload("a\u2028b\u2029c");
    expect(out).toBe("javascript:abc");
  });
});
