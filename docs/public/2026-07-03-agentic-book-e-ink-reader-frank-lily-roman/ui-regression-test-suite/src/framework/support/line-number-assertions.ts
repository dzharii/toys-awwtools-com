import { expect } from "@playwright/test";
import type { CodeBlockPageObject } from "../../page-objects/code-block/code-block.page.js";

/**
 * Assertions for the fenced-code line-number gutter (gap-closure spec M00).
 * These verify the *contract* of the rendered gutter: numbers start at 1,
 * increase by one, and there is exactly one number per rendered source line.
 * Vertical pixel alignment of each number to its row is a VISUAL_MANUAL_ONLY
 * concern (the CSS shares font-size/line-height); we assert only mechanics.
 */

/** Every code block on the page has a well-formed 1..N gutter. */
export async function expectAllBlocksNumbered(codeBlock: CodeBlockPageObject): Promise<number> {
  const count = await codeBlock.count();
  expect(count, "expected at least one fenced code block").toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await codeBlock.expectSequentialLineNumbers(i);
    await codeBlock.expectContained(i);
    expect(await codeBlock.gutterIsNonSelectable(i), `code block ${i} gutter must be non-selectable`).toBe(true);
  }
  return count;
}

/** Line numbers restart at 1 for each independent block. */
export async function expectPerBlockRestart(codeBlock: CodeBlockPageObject): Promise<void> {
  const count = await codeBlock.count();
  for (let i = 0; i < count; i++) {
    const numbers = await codeBlock.lineNumbers(i);
    expect(numbers[0], `code block ${i} should restart numbering at 1`).toBe("1");
  }
}
