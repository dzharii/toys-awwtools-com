/** Focus-safe nonmodal guidance. Rebuild only on field changes, not on each keystroke. */
import { answerFor } from "../../documents/model";
import { fieldNavigation } from "../../documents/keyboard";
import { placeholderNames, fieldLabel } from "../model";
import type { TemplateDefinition, TemplateVersion } from "../model";
import { button, el, emit, shadow } from "../../../platform/ui/dom";
export class GuidancePanel extends HTMLElement {
  private root = shadow(
    this,
    `
    :host{display:block} .heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}
    .step{font-size:11px;color:var(--muted)}.tag{display:inline-block;color:var(--accent);border:1px solid var(--accent-line);background:var(--accent-soft);border-radius:5px;font:11px ui-monospace,monospace;padding:3px 7px;margin-bottom:16px}
    h2{font-size:18px;line-height:1.5;font-weight:500;letter-spacing:-.25px;margin:0 0 12px}
    .hint{font-size:13px;line-height:1.85;color:var(--muted);margin-bottom:25px}
    label{font-size:12px;display:block;margin-bottom:7px;color:var(--muted)}
    input,textarea,select{width:100%;font-size:13px;line-height:1.6;background:var(--input);border-radius:7px}
    textarea{resize:vertical;min-height:145px;max-height:40dvh}
    .required-error{color:var(--danger);font-size:11px;margin-top:7px}
    .examples{margin-top:26px}.example{border-left:2px solid var(--line);padding:8px 0 8px 12px;margin:12px 0;color:var(--muted);font-size:13px;line-height:1.7;white-space:pre-wrap}
    .example-tools{display:flex;gap:8px;margin-top:7px}.example-tools button{font-size:11px;color:var(--accent);padding:4px 6px}
    .keyboard{border-top:1px solid var(--line);margin-top:28px;padding-top:17px;font-size:10px;line-height:1.9;color:var(--muted)}
    .navigation{display:flex;gap:7px;margin-top:15px}.navigation button{flex:1}
    .empty{font-size:13px;color:var(--muted);line-height:1.8}
    @media(max-width:1100px){.heading{display:none}.tag{margin-bottom:8px}h2{font-size:16px;line-height:1.4;margin-bottom:8px}.hint{margin-bottom:13px;font-size:12px;line-height:1.7}.examples{margin-top:18px}.keyboard{margin-top:18px}.navigation{margin-top:10px}}
  `,
  );
  private body = el("div");
  private currentKey = "";
  private control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null;
  private error = el("p", "required-error");
  private composing = false;
  constructor() {
    super();
    this.root.append(this.body);
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
      this.composing = false;
      this.body.replaceChildren(
        el("p", "empty", "Select a field in your document to see its guidance."),
      );
      return;
    }
    const key = `${template.source}:${version.id}:${active}:${keyboardHelp}:${disabled}`;
    const value = answerFor(answers, active);
    if (key === this.currentKey && this.control) {
      if (this.control.value !== value) this.control.value = value;
      this.error.hidden = !field.required || !!value.trim();
      this.control.setAttribute("aria-invalid", String(field.required && !value.trim()));
      return;
    }
    this.currentKey = key;
    const currentIndex = names.indexOf(active);
    const input = field.options.length
      ? el("select")
      : field.input === "multiline"
        ? el("textarea")
        : el("input");
    input.id = "answer";
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
    input.setAttribute("aria-label", field.question);
    input.setAttribute("aria-required", String(field.required));
    input.setAttribute("aria-invalid", String(field.required && !value.trim()));
    input.setAttribute("aria-describedby", "field-hint field-error");
    this.error = el("p", "required-error", `${fieldLabel(active)} is required.`);
    this.error.id = "field-error";
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
    const examples = el("div", "examples", el("div", "label", "A little inspiration"));
    for (const example of field.examples) {
      const tools = el(
        "div",
        "example-tools",
        button("Copy example", () => emit(this, "copy-example", example)),
      );
      if (!field.options.length)
        tools.append(
          button("Use example ↗", () =>
            emit(this, "placeholder-change", { name: active, value: example }),
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
    const next = button(
      "Next →",
      () => emit(this, "placeholder-focus", { name: names[currentIndex + 1], caret: "start" }),
      "action",
    );
    next.disabled = currentIndex >= names.length - 1;
    const label = el("label", "", `Your answer${field.required ? "" : " · optional"}`);
    label.htmlFor = input.id;
    this.body.replaceChildren(
      el(
        "div",
        "heading",
        el("span", "label", "Field notes"),
        el("span", "step", `${currentIndex + 1} / ${names.length}`),
      ),
      el("div", "tag", `$${active}`),
      el("h2", "", field.question),
      hint,
      label,
      input,
      this.error,
      el("div", "navigation", previous, next),
      ...(field.examples.length ? [examples] : []),
      ...(keyboardHelp
        ? [
            el(
              "div",
              "keyboard",
              "← → Move between fields at text edges.",
              el("br"),
              "↑ ↓ Previous / next field. Tab moves normally.",
              el("br"),
              "Multiline fields keep native ↑ ↓ movement.",
            ),
          ]
        : []),
    );
    this.control = input;
  }
  focusEditor(caret: "start" | "end" = "end"): void {
    this.control?.focus({ preventScroll: true });
    if (this.control instanceof HTMLInputElement || this.control instanceof HTMLTextAreaElement) {
      const offset = caret === "end" ? this.control.value.length : 0;
      this.control.setSelectionRange(offset, offset);
    }
    if (matchMedia("(max-width: 1100px)").matches)
      this.control?.scrollIntoView({ block: "nearest" });
  }
}
customElements.define("gtl-guidance-panel", GuidancePanel);
