/** Focus-safe nonmodal guidance. Rebuild only on field changes, not on each keystroke. */
import { answerFor } from "../../documents/model";
import { fieldNavigation } from "../../documents/keyboard";
import { placeholderNames } from "../model";
import type { TemplateDefinition, TemplateVersion } from "../model";
import { button, el, emit, shadow } from "../../../platform/ui/dom";
export class GuidancePanel extends HTMLElement {
  private root = shadow(
    this,
    `
    :host{display:block;container-type:inline-size} .heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .step{font-size:12px;color:var(--muted)}.tag{display:inline-block;color:var(--accent);border:1px solid var(--accent-line);background:var(--accent-soft);border-radius:5px;font:12px ui-monospace,monospace;padding:3px 7px}
    h2{font-size:18px;line-height:1.5;font-weight:500;letter-spacing:-.25px;margin:0 0 12px}
    .hint{font-size:13px;line-height:1.6;color:var(--muted);margin-bottom:12px}
    label{font-size:12px;display:block;margin-bottom:7px;color:var(--muted)}
    input,textarea,select{width:100%;font-size:13px;line-height:1.6;background:var(--input);border-radius:7px}
    textarea{resize:vertical;min-height:clamp(160px,calc(var(--field-panel-height,600px) - 350px),600px)}
    .required-error{color:var(--danger);font-size:11px;margin-top:7px}
    .examples{margin-top:16px}.example{border-left:2px solid var(--line);padding:6px 0 6px 12px;margin:8px 0;color:var(--muted);font-size:13px;line-height:1.6;white-space:pre-wrap}
    .example-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:7px}.example-tools button{font-size:13px;color:var(--accent);padding:4px 6px;min-height:32px}
    .keyboard{border-top:1px solid var(--line);margin-top:28px;padding-top:17px;font-size:10px;line-height:1.9;color:var(--muted)}
    .navigation{display:flex;gap:7px;margin-top:15px}.navigation button{flex:1}
    .empty{font-size:13px;color:var(--muted);line-height:1.8}
    .hint,.example,input,textarea,select{font-size:calc(14px * var(--field-scale,1))}
    h2{font-size:calc(18px * var(--field-scale,1))}
    .size-control{display:flex;align-items:center;gap:10px;margin:18px 0 0;padding-top:12px;border-top:1px solid var(--line)}
    .size-control select{font-size:12px;width:auto;margin-left:auto}
    .answer-heading{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .examples-jump{color:var(--accent);font-size:12px;min-height:32px;padding:4px 6px}
    .keyboard{font-size:12px;margin-top:18px}
  `,
  );
  private body = el("div");
  private currentKey = "";
  private control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;
  private error = el("p", "required-error");
  private composing = false;
  private suggestions = true;
  private size = el("select");
  private sizeRow = el("label", "size-control", "Text size", this.size);
  constructor() {
    super();
    this.size.setAttribute("aria-label", "Field editor text size");
    this.size.dataset.testid = "guided-field-editor-main-select-text-size";
    for (const value of ["normal", "large"]) {
      const option = el("option", "", value === "normal" ? "Normal" : "Large");
      option.value = value;
      this.size.append(option);
    }
    this.size.addEventListener("change", () =>
      emit(this, "setting-change", { id: "fieldTextSize", value: this.size.value }),
    );
    this.root.append(this.body, this.sizeRow);
  }
  preferences(suggestions: boolean, size: "normal" | "large"): void {
    this.suggestions = suggestions;
    this.size.value = size;
    this.style.setProperty("--field-scale", size === "large" ? "1.25" : "1");
    if (this.control && !(this.control instanceof HTMLSelectElement)) {
      if (suggestions) this.control.removeAttribute("autocomplete");
      else this.control.autocomplete = "off";
    }
  }
  connectedCallback(): void {
    this.dataset.testid = "guided-field-editor-main-panel-root";
  }
  clear(message = "Select a field in your document to see its guidance."): void {
    this.currentKey = "";
    this.control = null;
    this.sizeRow.hidden = true;
    this.composing = false;
    this.body.replaceChildren(el("p", "empty", message));
  }
  update(
    template: TemplateDefinition,
    version: TemplateVersion,
    answers: Record<string, string>,
    active: string,
    keyboardHelp: boolean,
    disabled = false,
  ): void {
    const names = placeholderNames(version);
    const field = template.placeholders[active];
    if (!field) {
      this.currentKey = "";
      this.control = null;
      this.sizeRow.hidden = true;
      this.composing = false;
      this.body.replaceChildren(
        el("p", "empty", "Select a field in your document to see its guidance."),
      );
      return;
    }
    const key = `${template.source}:${version.id}:${active}`;
    const value = answerFor(answers, active);
    if (key === this.currentKey && this.control) {
      if (this.control.value !== value) this.control.value = value;
      this.control.disabled = disabled;
      this.body
        .querySelectorAll<HTMLButtonElement>(
          '[data-testid="guided-field-editor-examples-button-use"]',
        )
        .forEach((use) => {
          use.disabled = disabled;
        });
      const keyboard = this.body.querySelector<HTMLElement>(".keyboard");
      if (keyboard) keyboard.hidden = !keyboardHelp || names.length < 2;
      this.error.hidden = !field.required || !!value.trim();
      this.control.setAttribute("aria-invalid", String(field.required && !value.trim()));
      return;
    }
    this.currentKey = key;
    this.sizeRow.hidden = false;
    const currentIndex = names.indexOf(active);
    const input = field.options.length
      ? el("select")
      : field.input === "multiline"
        ? el("textarea")
        : el("input");
    input.id = "answer";
    input.dataset.testid =
      input instanceof HTMLSelectElement
        ? "guided-field-editor-main-select-answer"
        : input instanceof HTMLTextAreaElement
          ? "guided-field-editor-main-textarea-answer"
          : "guided-field-editor-main-input-answer";
    input.dataset.placeholderName = active;
    input.disabled = disabled;
    if (input instanceof HTMLInputElement) input.type = "text";
    if (input instanceof HTMLSelectElement) {
      const empty = el("option", "", "Choose an answer");
      empty.value = "";
      input.append(empty);
      for (const option of field.options) {
        const element = el("option", "", option.label);
        element.value = option.key;
        input.append(element);
      }
    }
    input.value = value;
    if (!(input instanceof HTMLSelectElement) && !this.suggestions) input.autocomplete = "off";
    input.setAttribute("aria-label", `$${active}: ${field.question}`);
    input.setAttribute("aria-required", String(field.required));
    input.setAttribute("aria-invalid", String(field.required && !value.trim()));
    input.setAttribute("aria-describedby", "field-hint field-error");
    this.error = el("p", "required-error", `$${active} is required.`);
    this.error.id = "field-error";
    this.error.dataset.testid = "guided-field-editor-main-status-validation";
    this.error.hidden = !field.required || !!value.trim();
    const hint = el(
      "p",
      "hint",
      field.hint || "Write the words that belong in this part of your document.",
    );
    hint.id = "field-hint";
    input.addEventListener("input", () =>
      emit(this, "placeholder-change", { name: active, value: input.value }),
    );
    input.addEventListener("compositionstart", () => {
      this.composing = true;
    });
    input.addEventListener("compositionend", () => {
      this.composing = false;
    });
    if (!(input instanceof HTMLSelectElement))
      input.addEventListener("keydown", (event) => {
        if (!(event instanceof KeyboardEvent)) return;
        const navigation = fieldNavigation({
          key: event.key,
          start: input.selectionStart ?? 0,
          end: input.selectionEnd ?? 0,
          length: input.value.length,
          multiline: input instanceof HTMLTextAreaElement,
          composing: this.composing || event.isComposing,
          modified: event.ctrlKey || event.metaKey || event.altKey || event.shiftKey,
          index: currentIndex,
          count: names.length,
        });
        if (!navigation) return;
        event.preventDefault();
        emit(this, "placeholder-focus", { name: names[navigation.index], caret: navigation.caret });
      });
    const examples = el("div", "examples", el("div", "label", "Examples"));
    for (const example of field.examples) {
      const tools = el(
        "div",
        "example-tools",
        button(
          "Copy example",
          () => emit(this, "copy-example", example),
          "",
          "guided-field-editor-examples-button-copy",
        ),
      );
      if (!field.options.length)
        tools.append(
          button(
            "Use example ↗",
            () => emit(this, "placeholder-change", { name: active, value: example }),
            "",
            "guided-field-editor-examples-button-use",
          ),
        );
      examples.append(el("div", "example", el("span", "", example), tools));
    }
    const previous = button(
      "← Previous",
      () => emit(this, "placeholder-focus", { name: names[currentIndex - 1], caret: "end" }),
      "action",
    );
    previous.disabled = currentIndex <= 0;
    previous.dataset.testid = "guided-field-editor-main-button-previous";
    const next = button(
      "Next →",
      () => emit(this, "placeholder-focus", { name: names[currentIndex + 1], caret: "start" }),
      "action",
    );
    next.disabled = currentIndex >= names.length - 1;
    next.dataset.testid = "guided-field-editor-main-button-next";
    const label = el("label", "", `Your answer${field.required ? "" : " · optional"}`);
    label.htmlFor = input.id;
    this.body.replaceChildren(
      el(
        "div",
        "heading",
        el("div", "tag", `$${active}`),
        ...(names.length > 1 ? [el("span", "step", `${currentIndex + 1} / ${names.length}`)] : []),
      ),
      el("h2", "", field.question),
      hint,
      el(
        "div",
        "answer-heading",
        label,
        ...(field.examples.length
          ? [
              button(
                "Examples ↓",
                () => examples.scrollIntoView({ block: "nearest" }),
                "examples-jump",
                "guided-field-editor-examples-button-show",
              ),
            ]
          : []),
      ),
      input,
      this.error,
      ...(field.examples.length ? [examples] : []),
      ...(names.length > 1 ? [el("div", "navigation", previous, next)] : []),
      ...[
        el(
          "div",
          "keyboard",
          "← → Move between fields at text edges.",
          el("br"),
          "↑ ↓ Previous / next field. Tab moves normally.",
          el("br"),
          "Multiline fields keep native ↑ ↓ movement.",
        ),
      ],
    );
    this.body
      .querySelector(".tag")!
      .setAttribute("data-testid", "guided-field-editor-main-label-identifier");
    this.body
      .querySelector(".keyboard")
      ?.setAttribute("data-testid", "guided-field-editor-main-region-keyboard-help");
    this.body.querySelector<HTMLElement>(".keyboard")!.hidden = !keyboardHelp || names.length < 2;
    this.control = input;
    this.body
      .querySelectorAll<HTMLButtonElement>(
        '[data-testid="guided-field-editor-examples-button-use"]',
      )
      .forEach((use) => {
        use.disabled = disabled;
      });
  }
  focusEditor(caret?: "start" | "end"): void {
    this.control?.focus({ preventScroll: true });
    if (
      caret &&
      (this.control instanceof HTMLInputElement || this.control instanceof HTMLTextAreaElement)
    ) {
      const offset = caret === "end" ? this.control.value.length : 0;
      this.control.setSelectionRange(offset, offset);
    }
    if (matchMedia("(max-width: 1100px)").matches)
      this.control?.scrollIntoView({ block: "nearest" });
  }
}
customElements.define("gtl-guidance-panel", GuidancePanel);
