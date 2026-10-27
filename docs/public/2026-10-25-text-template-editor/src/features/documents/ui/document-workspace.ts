/** Read-only prose with small interactive tokens, not a contenteditable surface. */
import { button, el, emit } from "../../../platform/ui/dom";
import { displayedAnswer, renderTemplate } from "../../templates/renderer";
import { placeholderNames } from "../../templates/model";
import type { WorkingDocument } from "../model";
import { VersionPicker } from "../../templates/ui/version-picker";
export class DocumentWorkspace extends HTMLElement {
  private titleInput = el("h1", "document-title");
  private styles = new VersionPicker();
  private templateDisclosure = el("details", "template-disclosure");
  private templateSummary = el("summary");
  private styleDisclosure = el("details", "style-disclosure");
  private styleSummary = el("summary");
  private explicitStyle = false;
  private recordId = "";
  private size = el("select");
  private archived = button(
    "Archived · Restore",
    () => emit(this, "document-archive", { working: this.current, archived: false }),
    "secondary",
  );
  private rename = button(
    "Rename",
    () => emit(this, "document-request-rename", this.current),
    "text-button",
    "guided-documents-main-button-rename",
  );
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
    for (const [element, id] of [
      [this.titleInput, "guided-documents-main-label-title"],
      [this.guided, "guided-documents-main-region-guided-text"],
      [this.result, "guided-documents-result-region-content"],
      [this.progress, "guided-documents-main-status-progress"],
      [this.count, "guided-documents-result-status-word-count"],
      [this.save, "guided-documents-main-status-save"],
      [this.gate, "guided-documents-result-status-validation"],
      [this.copy, "guided-documents-result-button-copy-text"],
      [this.rich, "guided-documents-result-button-copy-rich"],
    ] as const)
      element.dataset.testid = id;
    this.size.setAttribute("aria-label", "Document text size");
    this.size.dataset.testid = "guided-documents-main-select-text-size";
    this.archived.dataset.testid = "guided-documents-main-button-restore";
    for (const value of ["normal", "large"]) {
      const option = el("option", "", value === "normal" ? "Normal" : "Large");
      option.value = value;
      this.size.append(option);
    }
    this.size.addEventListener("change", () =>
      emit(this, "setting-change", { id: "documentTextSize", value: this.size.value }),
    );
    this.guided.setAttribute("aria-label", "Guided document");
    this.result.setAttribute("aria-label", "Generated result");
    this.save.setAttribute("role", "status");
    this.templateDisclosure.dataset.testid = "guided-documents-main-details-template";
    this.templateSummary.dataset.testid = "guided-documents-main-button-change-template";
    this.templateDisclosure.append(this.templateSummary);
    this.styleDisclosure.dataset.testid = "guided-documents-main-details-style";
    this.styleSummary.dataset.testid = "guided-documents-main-button-change-style";
    this.styleSummary.addEventListener("click", () => {
      this.explicitStyle = !this.styleDisclosure.open;
      this.styles.resetSelection();
    });
    this.styleDisclosure.append(this.styleSummary, this.styles);
    const exportMenu = el("div", "export-menu");
    exportMenu.dataset.testid = "guided-documents-result-region-export";
    const exportOptions = el("div", "export-options");
    exportOptions.id = "result-export-options";
    exportOptions.popover = "auto";
    exportOptions.setAttribute("role", "group");
    exportOptions.setAttribute("aria-label", "Export formats");
    const exportTrigger = el("button", "secondary export-trigger", "Export ↓");
    exportTrigger.type = "button";
    exportTrigger.dataset.testid = "guided-documents-result-button-export";
    exportTrigger.popoverTargetElement = exportOptions;
    exportTrigger.popoverTargetAction = "toggle";
    exportMenu.append(exportTrigger, exportOptions);
    for (const format of ["txt", "md", "html"] as const) {
      const action = button(
        format === "txt" ? "Text (.txt)" : format === "md" ? "Markdown (.md)" : "HTML (.html)",
        () => {
          exportOptions.hidePopover();
          emit(this, "result-export", format);
        },
      );
      action.dataset.testid = `guided-documents-result-button-export-${format}`;
      this.exports.push(action);
      exportOptions.append(action);
    }
    this.append(
      el(
        "div",
        "document-heading",
        el("div", "document-title-row", this.titleInput, this.rename, this.archived),
        el("div", "document-metadata", this.save, this.count),
      ),
      this.templateDisclosure,
      this.styleDisclosure,
      el("label", "reading-control", "Document text size", this.size),
      el(
        "section",
        "writing-section",
        el("div", "section-heading", el("span", "eyebrow", "Template fields"), this.progress),
        el("p", "section-description", "Select a field to edit its answer."),
        this.guided,
      ),
      el(
        "section",
        "result-section",
        el("div", "section-heading", el("span", "eyebrow", "Generated result")),
        this.result,
        this.gate,
        el("div", "result-actions", this.copy, this.rich, exportMenu),
      ),
    );
  }
  connectedCallback(): void {
    this.dataset.testid = "guided-documents-main-region-workspace";
  }
  preferences(size: "normal" | "large"): void {
    this.size.value = size;
  }
  attachCatalog(catalog: HTMLElement): void {
    if (!this.templateDisclosure.contains(catalog)) this.templateDisclosure.append(catalog);
  }
  chooseStyle(): void {
    this.explicitStyle = false;
    this.styles.resetSelection();
    this.templateDisclosure.open = false;
    this.styleDisclosure.open = !this.styleDisclosure.hidden;
  }
  finishStyleSelection(): void {
    const focused = this.styleDisclosure.contains(document.activeElement);
    this.styleDisclosure.open = false;
    this.explicitStyle = false;
    if (focused) this.styleSummary.focus({ preventScroll: true });
  }
  finishTemplateSelection(): void {
    this.templateDisclosure.open = false;
  }
  update(working: WorkingDocument, mode: string): void {
    const record = working.record;
    const template = record.templateSnapshot;
    const version = template.versions.find((item) => item.id === record.templateVersionId)!;
    const names = placeholderNames(version);
    const generated = renderTemplate(template, version, record.answers);
    this.current = working;
    if (this.recordId !== record.id) {
      this.recordId = record.id;
      this.templateDisclosure.open = false;
      this.styleDisclosure.open = false;
      this.explicitStyle = false;
      this.styles.resetSelection();
    }
    this.titleInput.textContent = record.title;
    this.templateSummary.textContent = `Template: ${template.name} · Change template`;
    this.styleSummary.textContent = `Writing style: ${version.name} · Change style`;
    this.styleDisclosure.hidden = template.versions.length < 2;
    if (Object.values(record.answers).some((value) => value.trim()) && !this.explicitStyle)
      this.styleDisclosure.open = false;
    this.styles.update(template, record.templateVersionId, working.origin !== mode);
    this.archived.hidden = !record.archivedAt;
    this.archived.disabled = working.origin !== mode;
    this.rename.disabled = working.origin !== mode;
    const completion = names.filter(
      (name) => displayedAnswer(template.placeholders[name]!, record.answers[name]) !== undefined,
    ).length;
    this.progress.textContent = `${completion} of ${names.length} ${names.length === 1 ? "field" : "fields"} filled`;
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
          value ?? `$${part.name}`,
          () => emit(this, "placeholder-focus", { name: part.name }),
          "placeholder",
        );
        token.dataset.name = part.name;
        token.dataset.testid = "guided-documents-main-button-placeholder";
        token.dataset.placeholderName = part.name;
        token.classList.toggle("active", working.activePlaceholder === part.name);
        token.classList.toggle("filled", value !== undefined);
        token.classList.toggle("missing", field.required && value === undefined);
        token.setAttribute(
          "aria-label",
          `Edit $${part.name}: ${value ?? (field.required ? "required" : "optional")}`,
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
    this.gate.replaceChildren(
      generated.canCopy
        ? "Ready to copy or export."
        : `Complete ${generated.unresolved.length} required ${generated.unresolved.length === 1 ? "field" : "fields"} to copy or export. `,
    );
    if (!generated.canCopy)
      this.gate.append(
        button(
          "Go to first unresolved field",
          () => emit(this, "placeholder-focus", { name: generated.unresolved[0] }),
          "text-button",
          "guided-documents-result-button-first-unresolved",
        ),
      );
    this.count.textContent = `${generated.wordCount} ${generated.wordCount === 1 ? "word" : "words"}`;
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
