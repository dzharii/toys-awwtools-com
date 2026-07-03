import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { PageObjectBase, type UiTestAppContext } from "../../framework/page-object/page-object-base.js";
import type { ICtlBase } from "../../framework/controls/control-interfaces.js";

/**
 * Code-block surface inside the reader content. Fenced code blocks render as
 * <pre class="code-block has-line-numbers" data-lang="..."> containing a
 * non-selectable .code-gutter (one .code-line-number per source line) and the
 * <code> element. This object inspects that structure without importing app
 * source — it relies only on the rendered DOM contract.
 */
export class CodeBlockPageObject extends PageObjectBase {
  constructor(app: UiTestAppContext) {
    super(app, "code-block");
  }

  protected rootLocator(): Locator {
    return this.page.getByTestId("reader-region-paper");
  }

  expectedControls(): ICtlBase[] {
    return [];
  }

  /** All fenced code blocks currently in the reader content. */
  blocks(): Locator {
    return this.page.locator(".content pre.code-block");
  }

  block(index: number): Locator {
    return this.blocks().nth(index);
  }

  async count(): Promise<number> {
    return this.blocks().count();
  }

  /** The visible code text of a block (excludes the non-selectable gutter). */
  async codeText(index: number): Promise<string> {
    return (await this.block(index).locator("code").first().textContent()) ?? "";
  }

  /** The declared language of a block (data-lang), if any. */
  async language(index: number): Promise<string | null> {
    return this.block(index).getAttribute("data-lang");
  }

  /** The gutter line-number strings for a block, in order. */
  async lineNumbers(index: number): Promise<string[]> {
    return this.block(index).locator(".code-gutter .code-line-number").allTextContents();
  }

  /** Number of rendered code lines (split of the code text). */
  async codeLineCount(index: number): Promise<number> {
    const text = await this.codeText(index);
    if (text.length === 0) return 0;
    return text.split("\n").length;
  }

  /** Assert numbers are 1..N, sequential, and match the rendered line count. */
  async expectSequentialLineNumbers(index: number): Promise<number> {
    const numbers = await this.lineNumbers(index);
    expect(numbers.length, `code block ${index} should have line numbers`).toBeGreaterThan(0);
    expect(numbers[0], `code block ${index} first line number`).toBe("1");
    const asInts = numbers.map((n) => Number(n));
    for (let i = 0; i < asInts.length; i++) {
      expect(asInts[i], `code block ${index} line number at position ${i}`).toBe(i + 1);
    }
    const codeLines = await this.codeLineCount(index);
    expect(
      numbers.length,
      `code block ${index}: gutter number count (${numbers.length}) should equal rendered code line count (${codeLines})`,
    ).toBe(codeLines);
    return numbers.length;
  }

  /** Assert the code block is contained (does not cause body horizontal overflow). */
  async expectContained(index: number): Promise<void> {
    const overflow = await this.page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow, `code block ${index}: body horizontal overflow ${overflow}px`).toBeLessThanOrEqual(1);
    const box = await this.block(index).boundingBox();
    if (box) expect(box.width, `code block ${index} width`).toBeGreaterThan(0);
  }

  /** The gutter must not be selectable (so copying code stays clean). */
  async gutterIsNonSelectable(index: number): Promise<boolean> {
    return this.block(index)
      .locator(".code-gutter")
      .first()
      .evaluate((el) => {
        const cs = getComputedStyle(el as HTMLElement);
        const webkit = (cs as unknown as { webkitUserSelect?: string }).webkitUserSelect;
        return cs.userSelect === "none" || webkit === "none";
      });
  }
}
