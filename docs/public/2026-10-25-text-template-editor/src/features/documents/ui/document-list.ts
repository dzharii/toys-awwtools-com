/** Shadow-DOM navigation emits intentions; it never accesses persistence. */
import { button, el, emit, shadow } from "../../../platform/ui/dom";
import type { WorkingDocument } from "../model";
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
    }
  >();
  private empty = el(
    "div",
    "empty",
    "Your words will live here.",
    el("br"),
    "Start with a template. Make it yours.",
  );
  private count = el("span");
  private author = button(
    "Template Authoring",
    () => emit(this, "open-authoring"),
    "footer-button",
  );
  private settings = button("Settings", () => emit(this, "open-settings"), "footer-button");
  constructor() {
    super();
    this.list.setAttribute("aria-label", "Document history");
    const brand = el("div", "brand", el("span", "mark", "[g]"), "Guided");
    this.root.append(
      brand,
      el("div", "edition", "A little structure for your thoughts."),
      button("+   New Document", () => emit(this, "new-document"), "new"),
      el("div", "section-label label", el("span", "", "Your documents"), this.count),
      this.list,
      el(
        "footer",
        "",
        this.author,
        this.settings,
        el("div", "privacy", el("span", "dot"), "Private. Local. Yours."),
      ),
    );
  }
  update(
    documents: WorkingDocument[],
    active: WorkingDocument | null,
    page: string,
    mode: string,
  ): void {
    this.count.textContent = String(documents.length);
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
        const remove = button("×", () => emit(this, "document-delete", working), "remove");
        entry = { row: el("div", "row", open, remove), open, title, metadata, remove };
        this.rows.set(working, entry);
      }
      const selected = page === "document" && active === working;
      entry.row.classList.toggle("active", selected);
      if (selected) entry.open.setAttribute("aria-current", "page");
      else entry.open.removeAttribute("aria-current");
      entry.title.textContent = working.record.title || "Untitled document";
      entry.metadata.textContent =
        new Date(working.record.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }) +
        (working.origin !== mode ? ` · ${working.origin}` : "") +
        (["dirty", "failed", "conflict"].includes(working.status) ? " · Unsaved" : "");
      entry.remove.setAttribute(
        "aria-label",
        `Delete ${working.record.title || "Untitled document"}`,
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
