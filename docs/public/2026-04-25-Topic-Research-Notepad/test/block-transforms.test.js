import { describe, expect, test } from "bun:test";
import { BLOCK_TYPES } from "../src/constants.js";
import { canTransformBlock, transformBlock } from "../src/block-transforms.js";
import { createBlock } from "../src/models.js";

describe("block transforms", () => {
  test("exposes only supported transform paths", () => {
    expect(canTransformBlock(BLOCK_TYPES.paragraph, BLOCK_TYPES.heading)).toBe(true);
    expect(canTransformBlock(BLOCK_TYPES.sourceLink, BLOCK_TYPES.paragraph)).toBe(false);
  });

  test("preserves rich paragraph text when transforming to heading and quote", () => {
    const heading = transformBlock(createBlock({ pageId: "p1", type: BLOCK_TYPES.paragraph, content: { html: "Important <strong>note</strong>" } }), BLOCK_TYPES.heading);
    expect(heading.type).toBe(BLOCK_TYPES.heading);
    expect(heading.content.text).toBe("Important note");
    expect(heading.content.html).toContain("<strong>note</strong>");

    const quote = transformBlock(heading, BLOCK_TYPES.quote);
    expect(quote.type).toBe(BLOCK_TYPES.quote);
    expect(quote.content.text).toBe("Important note");
  });

  test("rejects unsupported transforms", () => {
    const source = createBlock({ pageId: "p1", type: BLOCK_TYPES.sourceLink });
    expect(() => transformBlock(source, BLOCK_TYPES.paragraph)).toThrow("Unsupported block transform");
  });
});
