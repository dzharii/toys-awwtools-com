/** Shadow-DOM navigation emits intentions; it never accesses persistence. */
import { button, el, emit, shadow } from "../../../platform/ui/dom";
import type { WorkingDocument } from "../model";
import type { DocumentFilter } from "../filter";
export class DocumentList extends HTMLElement {
  private root = shadow(
    this,
    `
    :host{display:flex;flex-direction:column;height:100%;padding:28px 15px 16px;background:var(--sidebar)}
    .brand{display:flex;align-items:center;gap:10px;padding:0 10px;font-size:20px;font-weight:600;letter-spacing:-.8px}
    .mark{display:grid;place-items:center;width:31px;height:34px;border:1px solid var(--accent-line);border-radius:9px;color:var(--accent);font:19px ui-monospace,monospace}
    .edition{margin:3px 0 27px 51px;font-size:10px;color:var(--muted);letter-spacing:.03em}
    .new{border:1px solid var(--line);padding:11px 13px;text-align:left;font-size:13px;margin:0 5px 29px;display:flex;gap:10px;align-items:center}
    .new:hover{background:var(--surface)}.plus{font-size:20px;font-weight:300}
    .section-label{padding:0 15px;display:flex;justify-content:space-between}
    nav{flex:1;overflow:auto;min-height:0;margin-top:14px}
    .row{display:flex;border-radius:8px;margin:3px 0;align-items:center}
    .row.active,.row:hover{background:var(--selected)}
    .link{flex:1;min-width:0;text-align:left;padding:11px 13px}
    .title{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .meta{display:block;color:var(--muted);font-size:11px;margin-top:3px}
    .remove{font-size:17px;color:var(--muted);width:32px;min-height:40px;opacity:0}
    .row:hover .remove,.row:focus-within .remove,.row.active .remove{opacity:1}
    .empty{padding:17px 15px;color:var(--muted);font-size:12px;line-height:1.8}
    footer{border-top:1px solid var(--line);padding-top:15px;display:grid;gap:4px}
    .footer-button{text-align:left;padding:11px 14px;font-size:13px;color:var(--muted);display:flex;gap:10px}
    .footer-button:hover,.footer-button.active{background:var(--selected);color:var(--text)}
    .privacy{font-size:10px;color:var(--muted);padding:17px 14px 0;display:flex;gap:7px;align-items:center}.dot{width:5px;height:5px;border-radius:50%;background:var(--accent)}
    @media(hover:none){.remove{opacity:1}}
    .row{flex-wrap:wrap}.row>.link{flex-basis:100%}.row-actions{display:flex;gap:2px;padding:0 7px 7px;width:100%}
    .row-actions button{font-size:11px;min-height:32px;padding:5px 7px;opacity:1;width:auto}
    .filter{width:100%;margin:8px 0 10px;font-size:12px}
  `,
  );
  private list = el("nav");
  private rows = new Map<
    WorkingDocument,
    {
      row: HTMLDivElement;
      open: HTMLButtonElement;
      title: HTMLSpanElement;
      metadata: HTMLSpanElement;
      remove: HTMLButtonElement;
      archive: HTMLButtonElement;
      rename: HTMLButtonElement;
    }
  >();
  private empty = el("div", "empty", "No documents in this filter.");
  private count = el("span");
  private filterSelect = el("select", "filter");
  private author = button("Template drafts", () => emit(this, "open-authoring"), "footer-button");
  private settings = button("Settings", () => emit(this, "open-settings"), "footer-button");
  constructor() {
    super();
    this.list.dataset.testid = "guided-documents-navigation-list-documents";
    this.author.dataset.testid = "guided-authoring-navigation-button-open";
    this.settings.dataset.testid = "guided-settings-navigation-button-open";
    this.list.setAttribute("aria-label", "Document history");
    this.filterSelect.setAttribute("aria-label", "Document filter");
    this.filterSelect.dataset.testid = "guided-documents-navigation-select-filter";
    for (const value of ["active", "archived", "recent"]) {
      const option = el("option", "", value[0]!.toUpperCase() + value.slice(1));
      option.value = value;
      this.filterSelect.append(option);
    }
    this.filterSelect.addEventListener("change", () =>
      emit(this, "document-filter-change", this.filterSelect.value),
    );
    const brand = el("div", "brand", el("span", "mark", "[g]"), "Guided");
    this.root.append(
      brand,
      button(
        "Documents",
        () => emit(this, "open-documents"),
        "footer-button",
        "guided-documents-navigation-button-workspace",
      ),
      button(
        "+   New Document",
        () => emit(this, "new-document"),
        "new",
        "guided-documents-main-button-new",
      ),
      el("div", "section-label label", el("span", "", "Your documents"), this.count),
      this.filterSelect,
      this.list,
      el("footer", "", this.author, this.settings),
    );
  }
  connectedCallback(): void {
    this.dataset.testid = "guided-documents-navigation-region-root";
  }
  update(
    documents: WorkingDocument[],
    active: WorkingDocument | null,
    page: string,
    mode: string,
    filter: DocumentFilter = "active",
  ): void {
    this.filterSelect.value = filter;
    this.count.textContent = String(documents.length);
    const titleCounts = new Map<string, number>();
    for (const { record } of documents)
      titleCounts.set(record.title, (titleCounts.get(record.title) ?? 0) + 1);
    const focused = this.root.activeElement;
    for (const [working, entry] of this.rows) {
      if (!documents.includes(working)) {
        entry.row.remove();
        this.rows.delete(working);
      }
    }
    if (documents.length) this.empty.remove();
    for (const [index, working] of documents.entries()) {
      let entry = this.rows.get(working);
      if (!entry) {
        const open = button("", () => emit(this, "document-select", working), "link");
        const title = el("span", "title");
        const metadata = el("span", "meta");
        open.append(title, metadata);
        const archive = button("Archive", () =>
          emit(this, "document-archive", { working, archived: !working.record.archivedAt }),
        );
        const rename = button("Rename", () => emit(this, "document-request-rename", working));
        const remove = button(
          "Delete",
          () => emit(this, "document-delete", working),
          "remove danger",
        );
        archive.dataset.testid = "guided-documents-navigation-button-archive";
        rename.dataset.testid = "guided-documents-navigation-button-rename";
        open.dataset.testid = "guided-documents-navigation-button-open";
        title.dataset.testid = "guided-documents-navigation-label-title";
        remove.dataset.testid = "guided-documents-navigation-button-delete";
        entry = {
          row: el("div", "row", open, el("div", "row-actions", archive, rename, remove)),
          open,
          title,
          metadata,
          remove,
          archive,
          rename,
        };
        entry.row.dataset.testid = "guided-documents-navigation-list-item-document";
        this.rows.set(working, entry);
      }
      const selected = page === "document" && active === working;
      entry.row.dataset.documentId = working.record.id;
      entry.row.dataset.storageMode = working.origin;
      entry.row.classList.toggle("active", selected);
      if (selected) entry.open.setAttribute("aria-current", "page");
      else entry.open.removeAttribute("aria-current");
      entry.title.textContent = working.record.title || "Untitled document";
      entry.metadata.textContent =
        new Date(working.record.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }) +
        ((titleCounts.get(working.record.title) ?? 0) > 1
          ? ` · ${new Date(working.record.createdAt).toLocaleTimeString()} · ${working.record.id.slice(0, 8)}`
          : "") +
        (working.origin !== mode ? ` · ${working.origin}` : "") +
        (working.record.archivedAt ? " · Archived" : "") +
        (["dirty", "failed", "conflict"].includes(working.status) ? " · Unsaved" : "");
      entry.remove.setAttribute(
        "aria-label",
        `Delete ${working.record.title || "Untitled document"}`,
      );
      entry.archive.textContent = working.record.archivedAt ? "Restore" : "Archive";
      entry.remove.disabled =
        entry.archive.disabled =
        entry.rename.disabled =
          working.origin !== mode;
      entry.archive.setAttribute(
        "aria-label",
        `${working.record.archivedAt ? "Restore" : "Archive"} ${working.record.title}`,
      );
      if (this.list.children[index] !== entry.row) {
        this.list.insertBefore(entry.row, this.list.children[index] ?? null);
      }
    }
    if (!documents.length && !this.empty.isConnected) this.list.append(this.empty);
    if (
      focused instanceof HTMLElement &&
      focused.isConnected &&
      this.root.activeElement !== focused
    ) {
      focused.focus({ preventScroll: true });
    }
    this.author.classList.toggle("active", page === "authoring");
    this.settings.classList.toggle("active", page === "settings");
  }
}
customElements.define("gtl-document-list", DocumentList);
