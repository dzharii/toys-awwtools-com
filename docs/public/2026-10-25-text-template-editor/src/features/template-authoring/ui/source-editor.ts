/**
 * Native textarea over a noninteractive highlight layer, following the skill
 * editor reference. Microlight tokenizes text nodes; the adapter supplies GTL
 * colors. Selection, undo, composition and screen-reader editing remain native.
 */
import microlight from "../../../vendor/microlight/microlight.js";
import { el, emit } from "../../../platform/ui/dom";
import { applyNativeSourceEdit } from "../source-edit";
export class SourceEditor extends HTMLElement {
  private highlight = el("pre", "gtl-source-highlight");
  readonly textarea = el("textarea", "source-input");
  private scheduled = 0;
  private raw = "";
  constructor(private testPrefix = "guided-authoring-source") {
    super();
    this.highlight.setAttribute("aria-hidden", "true");
    this.textarea.setAttribute("aria-label", "Template source");
    this.textarea.dataset.testid = `${testPrefix}-textarea-content`;
    this.highlight.dataset.testid = `${testPrefix}-region-highlight`;
    this.textarea.spellcheck = false;
    this.textarea.autocapitalize = "off";
    this.textarea.wrap = "off";
    this.textarea.addEventListener("input", () => {
      this.raw = applyNativeSourceEdit(this.raw, this.textarea.value);
      this.highlightSource();
      emit(this, "source-change", this.raw);
    });
    this.textarea.addEventListener("scroll", () => this.syncScroll());
  }
  connectedCallback(): void {
    this.dataset.testid = `${this.testPrefix}-region-editor`;
    if (!this.contains(this.textarea)) this.append(this.highlight, this.textarea);
    this.highlightSource();
  }
  set value(value: string) {
    this.raw = value;
    const normalized = value.replace(/\r\n?/g, "\n");
    if (this.textarea.value !== normalized) this.textarea.value = value;
    this.highlightSource();
  }
  get value(): string {
    return this.raw;
  }
  set disabled(value: boolean) {
    this.textarea.disabled = value;
  }
  editValue(value: string): void {
    const next = value.replace(/\r\n?/g, "\n");
    const previous = this.textarea.value;
    let start = 0,
      end = previous.length,
      nextEnd = next.length;
    while (start < end && start < nextEnd && previous[start] === next[start]) start++;
    while (end > start && nextEnd > start && previous[end - 1] === next[nextEnd - 1]) {
      end--;
      nextEnd--;
    }
    if (start === end && start === nextEnd) return;
    const selection = [this.textarea.selectionStart, this.textarea.selectionEnd] as const;
    const scroll = this.textarea.scrollTop;
    this.textarea.focus({ preventScroll: true });
    this.textarea.setSelectionRange(start, end);
    const replacement = next.slice(start, nextEnd);
    if (!document.execCommand("insertText", false, replacement)) {
      this.textarea.setRangeText(replacement, start, end, "end");
      this.textarea.dispatchEvent(
        new InputEvent("input", { bubbles: true, inputType: "insertReplacementText" }),
      );
    }
    const offset = (position: number) =>
      position <= start ? position : position >= end ? position + nextEnd - end : nextEnd;
    this.textarea.setSelectionRange(offset(selection[0]), offset(selection[1]));
    this.textarea.scrollTop = scroll;
  }
  private syncScroll(): void {
    this.highlight.scrollTop = this.textarea.scrollTop;
    this.highlight.scrollLeft = this.textarea.scrollLeft;
  }
  private highlightSource(): void {
    cancelAnimationFrame(this.scheduled);
    this.scheduled = requestAnimationFrame(() => {
      this.highlight.textContent = this.textarea.value + "\n";
      microlight.reset("gtl-source-highlight");
      for (const span of this.highlight.querySelectorAll("span")) {
        const text = span.textContent ?? "";
        span.removeAttribute("style");
        if (/^(TEMPLATE|VERSION|TEXT|HINT|EXAMPLE|INPUT|OPTION|OPTIONAL)$/.test(text))
          span.className = "syntax-directive";
        else if (text.startsWith("$") || text === "{" || text === "}")
          span.className = "syntax-placeholder";
      }
      this.syncScroll();
    });
  }
  focusLocation(line: number, column: number): void {
    const text = this.textarea.value;
    const lines = text.split("\n");
    const offset =
      lines.slice(0, line - 1).reduce((sum, value) => sum + value.length + 1, 0) + column - 1;
    this.textarea.focus();
    this.textarea.setSelectionRange(offset, Math.min(offset + 1, text.length));
    const lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
    this.textarea.scrollTop = Math.max(0, (line - 3) * lineHeight);
    this.syncScroll();
  }
  disconnectedCallback(): void {
    cancelAnimationFrame(this.scheduled);
  }
}
customElements.define("gtl-source-editor", SourceEditor);
