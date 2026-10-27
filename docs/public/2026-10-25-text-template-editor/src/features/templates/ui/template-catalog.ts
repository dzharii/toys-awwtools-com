import { button, el, emit } from "../../../platform/ui/dom";
import { errorMessage } from "../../../platform/errors";
import type { TemplateLoader, ManifestEntry } from "../loader";
import type { TemplateDefinition } from "../model";
import { searchTemplates } from "../search";
import type { IndexedTemplate } from "../search";
import { sampleOutput } from "../samples";

export class TemplateCatalog extends HTMLElement {
  private search = el("input", "template-search");
  private cards = el("div", "template-cards");
  private status = el("p", "small muted");
  private popup = el("section", "template-sample");
  private index: IndexedTemplate[] = [];
  private failures = new Map<string, string>();
  private loader?: TemplateLoader;
  private selected = "";
  private composing = false;
  private request = 0;
  private stable = false;
  private dismissing = false;
  private pending = 0;
  private indexingRequest = 0;
  private hoverTimer?: ReturnType<typeof setTimeout>;
  private leaveTimer?: ReturnType<typeof setTimeout>;
  private clearSearch = button(
    "Clear",
    () => {
      this.search.value = "";
      this.renderResults();
      this.search.focus();
    },
    "text-button",
    "guided-templates-main-button-clear-search",
  );
  get firstAvailable(): string | undefined {
    return this.index[0]?.entry.id;
  }
  get isIndexing(): boolean {
    return this.pending > 0;
  }
  constructor() {
    super();
    this.className = "template-picker";
    this.dataset.testid = "guided-templates-main-region-catalog";
    this.search.type = "search";
    this.search.placeholder = "Search templates";
    this.search.setAttribute("aria-label", "Search templates");
    this.search.dataset.testid = "guided-templates-main-input-search";
    this.status.setAttribute("role", "status");
    this.status.dataset.testid = "guided-templates-main-status-search";
    this.search.addEventListener("input", () => {
      if (!this.composing) this.renderResults();
    });
    this.search.addEventListener("compositionstart", () => {
      this.composing = true;
    });
    this.search.addEventListener("compositionend", () => {
      this.composing = false;
      this.renderResults();
    });
    this.popup.popover = "auto";
    this.popup.id = "template-sample";
    this.popup.dataset.testid = "guided-templates-preview-panel-root";
    this.popup.setAttribute("aria-label", "Template sample preview");
    this.popup.addEventListener("pointerenter", () => clearTimeout(this.leaveTimer));
    const keepPreview = () => {
      this.stable = true;
      clearTimeout(this.leaveTimer);
    };
    this.popup.addEventListener("pointerdown", keepPreview);
    this.popup.addEventListener("focusin", keepPreview);
    this.popup.addEventListener("pointerleave", () => this.scheduleClose());
    this.popup.addEventListener("beforetoggle", (event) => {
      if (event.newState !== "closed") return;
      this.dismissing = true;
      this.cancelPreview();
    });
    this.popup.addEventListener("toggle", () => {
      if (!this.popup.matches(":popover-open")) this.cancelPreview();
      this.dismissing = false;
    });
    this.append(
      el("div", "template-picker-heading", el("h2", "eyebrow", "Templates")),
      el("div", "template-search-row", this.search, this.clearSearch),
      this.status,
      this.cards,
      this.popup,
    );
  }
  disconnectedCallback(): void {
    this.closePreview();
  }
  async initialize(loader: TemplateLoader): Promise<void> {
    this.loader = loader;
    const request = ++this.indexingRequest;
    this.index = [];
    this.failures.clear();
    this.pending = loader.entries.length;
    this.renderResults();
    await Promise.all(
      loader.entries.map(async (entry, order) => {
        try {
          const template = await loader.load(entry.id);
          if (request !== this.indexingRequest) return;
          this.index.push({ entry, template, order });
        } catch (error) {
          if (request !== this.indexingRequest) return;
          this.failures.set(entry.id, errorMessage(error));
        } finally {
          if (request === this.indexingRequest) {
            this.pending--;
            this.renderResults();
          }
        }
      }),
    );
    if (request === this.indexingRequest) this.index.sort((a, b) => a.order - b.order);
  }
  select(id: string): void {
    this.selected = id;
    for (const card of this.cards.querySelectorAll<HTMLButtonElement>("[data-template-id]")) {
      const selected = card.dataset.templateId === id;
      card.setAttribute("aria-pressed", String(selected));
      card.classList.toggle("selected", selected);
    }
  }
  private renderResults(): void {
    if (!this.loader) return;
    this.clearSearch.hidden = !this.search.value;
    const matches = searchTemplates(this.index, this.search.value);
    this.status.textContent = this.pending
      ? `Indexing templates… ${this.pending} remaining. ${matches.length} available matches.`
      : matches.length
        ? `${matches.length} ${matches.length === 1 ? "template" : "templates"}`
        : "No matching templates.";
    if (this.failures.size)
      this.status.append(
        ` Search unavailable for ${this.failures.size} ${this.failures.size === 1 ? "template" : "templates"}. `,
        button(
          "Retry unavailable templates",
          () => void this.initialize(this.loader!),
          "text-button",
          "guided-templates-main-button-retry-index",
        ),
      );
    this.cards.replaceChildren();
    for (const match of matches) this.cards.append(this.card(match.entry, match.reason));
    if (!this.search.value.trim())
      for (const entry of this.loader.entries)
        if (this.failures.has(entry.id))
          this.cards.append(this.card(entry, this.failures.get(entry.id)!));
    this.select(this.selected);
  }
  private card(entry: ManifestEntry, reason: string): HTMLElement {
    const unavailable = this.failures.has(entry.id);
    const select = button(
      "",
      () => {
        this.closePreview();
        emit(this, "template-select", { templateId: entry.id });
      },
      "template-card",
    );
    select.dataset.testid = "guided-templates-main-list-item-template";
    select.dataset.templateId = entry.id;
    select.disabled = unavailable;
    select.append(
      el("span", "template-card-title", entry.name),
      el("span", "template-card-description", entry.description),
    );
    select
      .querySelector(".template-card-title")!
      .setAttribute("data-testid", "guided-templates-main-label-title");
    const preview = button(
      "Preview",
      () => void this.showPreview(entry, preview, true),
      "text-button",
      "guided-templates-main-button-preview",
    );
    preview.setAttribute("aria-label", `Preview ${entry.name}`);
    preview.setAttribute("aria-controls", this.popup.id);
    const row = el(
      "div",
      "template-entry",
      select,
      ...(reason ? [el("p", "template-match-reason", reason)] : []),
      preview,
    );
    row.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      clearTimeout(this.hoverTimer);
      clearTimeout(this.leaveTimer);
      this.hoverTimer = setTimeout(() => void this.showPreview(entry, select, false), 250);
    });
    row.addEventListener("pointerleave", () => {
      clearTimeout(this.hoverTimer);
      this.scheduleClose();
    });
    select.addEventListener("focus", () => void this.showPreview(entry, select, false));
    return row;
  }
  private scheduleClose(): void {
    if (this.stable) return;
    clearTimeout(this.leaveTimer);
    this.leaveTimer = setTimeout(() => this.closePreview(), 220);
  }
  private cancelPreview(): void {
    this.request++;
    this.stable = false;
    clearTimeout(this.hoverTimer);
    clearTimeout(this.leaveTimer);
  }
  private closePreview(): void {
    this.cancelPreview();
    if (this.popup.matches(":popover-open")) this.popup.hidePopover();
  }
  private async showPreview(
    entry: ManifestEntry,
    anchor: HTMLElement,
    stable: boolean,
  ): Promise<void> {
    if (!this.loader || !this.isConnected || !anchor.isConnected || this.dismissing) return;
    if (this.stable && !stable) return;
    clearTimeout(this.leaveTimer);
    const request = ++this.request;
    this.stable = stable;
    this.popup.replaceChildren(
      el("h2", "", entry.name),
      button(
        "Close preview",
        () => this.closePreview(),
        "text-button",
        "guided-templates-preview-button-close",
      ),
      el("p", "muted", "Loading sample output…"),
    );
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(440, innerWidth - 16);
    const x =
      rect.right + width + 12 < innerWidth
        ? rect.right + 12
        : rect.left > width + 12
          ? rect.left - width - 12
          : Math.max(8, Math.min(rect.left, innerWidth - width - 8));
    this.popup.style.width = `${width}px`;
    this.popup.style.left = `${x}px`;
    this.popup.style.top = `${Math.max(72, Math.min(rect.bottom + 8, innerHeight - 400))}px`;
    if (!this.popup.matches(":popover-open")) this.popup.showPopover({ source: anchor });
    try {
      const template = await this.loader.load(entry.id);
      if (request !== this.request || !this.isConnected) return;
      this.renderSample(entry, template);
      if (
        stable &&
        this.popup.matches(":popover-open") &&
        (document.activeElement === anchor || this.popup.contains(document.activeElement))
      )
        this.popup.querySelector<HTMLSelectElement>("select")?.focus({ preventScroll: true });
    } catch (error) {
      if (request !== this.request) return;
      this.popup.replaceChildren(
        el("h2", "", entry.name),
        el("p", "danger", `Sample unavailable: ${errorMessage(error)}`),
        button(
          "Retry preview",
          () => void this.showPreview(entry, anchor, true),
          "secondary",
          "guided-templates-preview-button-retry",
        ),
        button(
          "Close preview",
          () => this.closePreview(),
          "text-button",
          "guided-templates-preview-button-close",
        ),
      );
    }
  }
  private renderSample(entry: ManifestEntry, template: TemplateDefinition): void {
    const version = el("select");
    version.setAttribute("aria-label", "Sample writing style");
    version.dataset.testid = "guided-templates-preview-select-version";
    for (const item of template.versions) {
      const option = el("option", "", item.name);
      option.value = item.id;
      version.append(option);
    }
    const output = el("pre", "sample-output");
    output.dataset.testid = "guided-templates-preview-region-output";
    const state = el("p", "small muted");
    const update = () => {
      const selected = template.versions.find((item) => item.id === version.value)!;
      const sample = sampleOutput(template, selected);
      output.textContent = sample.text;
      state.textContent = sample.unresolved.length
        ? `Illustrative sample. Missing sample values: ${sample.unresolved.map((name) => `$${name}`).join(", ")}.`
        : "Illustrative sample. No document has been created or changed.";
    };
    version.addEventListener("change", update);
    this.popup.replaceChildren(
      el("h2", "", entry.name),
      el("p", "eyebrow", "Sample output"),
      version,
      output,
      state,
      button(
        "Use template",
        () => {
          this.closePreview();
          emit(this, "template-select", { templateId: entry.id, versionId: version.value });
        },
        "primary",
        "guided-templates-preview-button-use",
      ),
      button(
        "Close preview",
        () => this.closePreview(),
        "text-button",
        "guided-templates-preview-button-close",
      ),
    );
    update();
  }
}
customElements.define("gtl-template-catalog", TemplateCatalog);
