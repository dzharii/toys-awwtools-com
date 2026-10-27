import type { ElementHandle, Locator } from "@playwright/test";

export class AnswerControl {
  readonly locator: Locator;

  constructor(panel: Locator) {
    this.locator = panel
      .getByTestId("guided-field-editor-main-input-answer")
      .or(panel.getByTestId("guided-field-editor-main-textarea-answer"))
      .or(panel.getByTestId("guided-field-editor-main-select-answer"));
  }

  async enter(value: string): Promise<void> {
    // Hit-test first: fill() alone would overlook an input hidden by an overlay.
    await this.locator.click();
    if (await this.locator.evaluate((element) => element instanceof HTMLSelectElement)) {
      await this.locator.selectOption(value);
    } else await this.locator.fill(value);
  }

  async selectRange(start: number, end: number): Promise<void> {
    await this.locator.evaluate(
      (element, selection) => {
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
          throw new Error("Text selection requires a text answer.");
        }
        element.setSelectionRange(selection.start, selection.end);
      },
      { start, end },
    );
  }

  async selection(): Promise<{ start: number | null; end: number | null }> {
    return this.locator.evaluate((element) => {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        throw new Error("Text selection requires a text answer.");
      }
      return { start: element.selectionStart, end: element.selectionEnd };
    });
  }

  async composing(active: boolean): Promise<void> {
    await this.locator.dispatchEvent(active ? "compositionstart" : "compositionend", { data: "" });
  }
  identity() {
    return this.locator.elementHandle();
  }
  async sameIdentity(observed: ElementHandle<SVGElement | HTMLElement> | null): Promise<boolean> {
    if (!observed) throw new Error("An editing control must exist before observing its identity.");
    return this.locator.evaluate((current, previous) => current === previous, observed);
  }
  fontSize(): Promise<number> {
    return this.locator.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  }
}
