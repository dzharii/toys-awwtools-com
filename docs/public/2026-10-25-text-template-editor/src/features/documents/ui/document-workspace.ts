/** Read-only prose with small interactive tokens, not a contenteditable surface. */
import { button, el, emit } from "../../../platform/ui/dom";
import { displayedAnswer, renderTemplate } from "../../templates/renderer";
import { placeholderNames } from "../../templates/model";
import type { WorkingDocument } from "../model";
export class DocumentWorkspace extends HTMLElement {
  private titleInput = el("input", "document-title");
  private styleSelect = el("select", "style-select");
  private guided = el("div", "guided-prose");
  private result = el("div", "result-text");
  private progress = el("span", "progress");
  private count = el("span", "word-count");
  private gate = el("p", "copy-explanation");
  private save = el("span", "save-status");
  private copy = button("Copy text", () => emit(this, "result-copy", "plain"), "primary");
  private rich = button("Copy rich text", () => emit(this, "result-copy", "rich"), "secondary");
  private exports: HTMLButtonElement[] = [];
  private current: WorkingDocument | null = null;
  constructor() {
    super();
    this.titleInput.setAttribute("aria-label", "Document title");
    this.titleInput.addEventListener("input", () =>
      emit(this, "document-rename", this.titleInput.value),
    );
    this.styleSelect.setAttribute("aria-label", "Writing style");
    this.styleSelect.addEventListener("change", () =>
      emit(this, "template-version-select", this.styleSelect.value),
    );
    this.guided.setAttribute("aria-label", "Guided document");
    this.result.setAttribute("aria-label", "Generated result");
    this.save.setAttribute("role", "status");
    const exportMenu = el("details", "export-menu", el("summary", "secondary", "Export ↓"));
    for (const format of ["txt", "md", "html"] as const) {
      const action = button(
        format === "txt" ? "Text (.txt)" : format === "md" ? "Markdown (.md)" : "HTML (.html)",
        () => {
          exportMenu.open = false;
          emit(this, "result-export", format);
        },
      );
      this.exports.push(action);
      exportMenu.append(action);
    }
    this.append(
      el(
        "div",
        "document-heading",
        this.titleInput,
        el("div", "document-metadata", this.save, el("span", "metadata-divider", "·"), this.count),
      ),
      el("div", "style-row", el("label", "eyebrow", "Writing style"), this.styleSelect),
      el(
        "section",
        "writing-section",
        el("div", "section-heading", el("span", "eyebrow", "01 / Shape your words"), this.progress),
        el(
          "p",
          "section-description",
          "Select a highlighted field. A few thoughtful answers make it yours.",
        ),
        this.guided,
      ),
      el(
        "section",
        "result-section",
        el(
          "div",
          "section-heading",
          el("span", "eyebrow", "02 / Your finished words"),
          el("span", "result-label", "LIVE PREVIEW"),
        ),
        this.result,
        this.gate,
        el("div", "result-actions", this.copy, this.rich, exportMenu),
      ),
      el("div", "document-footnote", "No blank-page pressure. Just one field at a time."),
    );
  }
  update(working: WorkingDocument, mode: string): void {
    const record = working.record;
    const template = record.templateSnapshot;
    const version = template.versions.find((item) => item.id === record.templateVersionId)!;
    const names = placeholderNames(version);
    const generated = renderTemplate(template, version, record.answers);
    const changed = this.current !== working;
    this.current = working;
    if (this.titleInput.value !== record.title) this.titleInput.value = record.title;
    this.titleInput.disabled = working.origin !== mode;
    if (changed) {
      this.styleSelect.replaceChildren(
        ...template.versions.map((item) => {
          const option = el("option", "", item.name);
          option.value = item.id;
          return option;
        }),
      );
    }
    this.styleSelect.value = record.templateVersionId;
    this.styleSelect.disabled = working.origin !== mode;
    const completion = names.filter(
      (name) => displayedAnswer(template.placeholders[name]!, record.answers[name]) !== undefined,
    ).length;
    this.progress.textContent = `${completion} of ${names.length} fields filled`;
    this.progress.style.setProperty(
      "--progress",
      `${names.length ? (completion / names.length) * 100 : 100}%`,
    );
    this.guided.replaceChildren(
      ...version.parts.map((part) => {
        if (part.kind === "literal") return document.createTextNode(part.text);
        const field = template.placeholders[part.name]!;
        const value = displayedAnswer(field, record.answers[part.name]);
        const token = button(
          value ?? part.name.replaceAll("-", " "),
          () => emit(this, "placeholder-focus", { name: part.name }),
          "placeholder",
        );
        token.dataset.name = part.name;
        token.classList.toggle("active", working.activePlaceholder === part.name);
        token.classList.toggle("filled", value !== undefined);
        token.classList.toggle("missing", field.required && value === undefined);
        token.setAttribute(
          "aria-label",
          `Edit ${part.name}: ${value ?? (field.required ? "required" : "optional")}`,
        );
        token.setAttribute("aria-pressed", String(working.activePlaceholder === part.name));
        token.title = `${field.question}${field.required && !value ? " Required." : ""}`;
        return token;
      }),
    );
    this.result.textContent = generated.text;
    this.result.classList.toggle("incomplete", !generated.canCopy);
    this.copy.disabled = this.rich.disabled = !generated.canCopy;
    this.copy.setAttribute("aria-describedby", "result-gate");
    this.rich.setAttribute("aria-describedby", "result-gate");
    for (const action of this.exports) action.disabled = !generated.canCopy;
    this.gate.id = "result-gate";
    this.gate.textContent = generated.canCopy
      ? "Ready when you are. Copy it, or take a file with you."
      : `Fill ${generated.unresolved.length === 1 ? "the remaining required field" : `the ${generated.unresolved.length} remaining required fields`} to copy or export.`;
    this.count.textContent = `${generated.text.trim().split(/\s+/).filter(Boolean).length} words`;
    const statuses = {
      temporary: "No draft yet",
      dirty: "Unsaved changes",
      saving: "Saving…",
      saved: working.origin === "memory" ? "In memory · this tab" : "Saved",
      failed: "Save failed",
      conflict: "Save conflict",
    };
    if (this.save.textContent !== statuses[working.status]) {
      this.save.textContent = statuses[working.status];
    }
    this.save.dataset.state = working.status;
  }
  highlight(name: string): void {
    for (const token of this.guided.querySelectorAll<HTMLButtonElement>(".placeholder")) {
      token.classList.toggle("active", token.dataset.name === name);
      token.setAttribute("aria-pressed", String(token.dataset.name === name));
    }
  }
  scrollToActive(name: string): void {
    const token = [...this.guided.querySelectorAll<HTMLButtonElement>(".placeholder")].find(
      (item) => item.dataset.name === name,
    );
    token?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}
customElements.define("gtl-document-workspace", DocumentWorkspace);
