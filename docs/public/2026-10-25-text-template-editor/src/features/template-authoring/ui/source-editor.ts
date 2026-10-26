/**
 * Native textarea over a noninteractive highlight layer, following the skill
 * editor reference. Microlight tokenizes text nodes; the adapter supplies GTL
 * colors. Selection, undo, composition and screen-reader editing remain native.
 */
import microlight from "../../../vendor/microlight/microlight.js";
import { el, emit } from "../../../platform/ui/dom";
export class SourceEditor extends HTMLElement {
  private highlight = el("pre", "gtl-source-highlight");
  readonly textarea = el("textarea", "source-input");
  private scheduled = 0;
  constructor() {
    super();
    this.highlight.setAttribute("aria-hidden", "true");
    this.textarea.setAttribute("aria-label", "Template source");
    this.textarea.spellcheck = false;
    this.textarea.autocapitalize = "off";
    this.textarea.wrap = "off";
    this.textarea.addEventListener("input", () => {
      this.highlightSource();
      emit(this, "source-change", this.textarea.value);
    });
    this.textarea.addEventListener("scroll", () => this.syncScroll());
  }
  connectedCallback(): void {
    if (!this.contains(this.textarea)) this.append(this.highlight, this.textarea);
    this.highlightSource();
  }
  set value(value: string) {
    if (this.textarea.value !== value) this.textarea.value = value;
    this.highlightSource();
  }
  get value(): string {
    return this.textarea.value;
  }
  set disabled(value: boolean) {
    this.textarea.disabled = value;
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
    const lines = this.value.split("\n");
    const offset =
      lines.slice(0, line - 1).reduce((sum, value) => sum + value.length + 1, 0) + column - 1;
    this.textarea.focus();
    this.textarea.setSelectionRange(offset, Math.min(offset + 1, this.value.length));
    const lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight);
    this.textarea.scrollTop = Math.max(0, (line - 3) * lineHeight);
    this.syncScroll();
  }
  disconnectedCallback(): void {
    cancelAnimationFrame(this.scheduled);
  }
}
customElements.define("gtl-source-editor", SourceEditor);
