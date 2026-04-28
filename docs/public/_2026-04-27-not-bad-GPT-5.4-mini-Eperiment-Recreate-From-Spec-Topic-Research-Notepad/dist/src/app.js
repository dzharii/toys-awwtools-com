import { createLogger, getLoggingSettings } from "./observability/logger.js";
import { StorageClient } from "./storage/storage-client.js";
import { BLOCK_SORT_STEP, BLOCK_TYPES, DEFAULT_PAGE_TITLE, PAGE_SORT_STEP } from "./shared/constants.js";
import { pageToMarkdown, workspaceToBackupJson } from "./shared/export.js";
import { htmlToText, sanitizeInlineHtml } from "./shared/html.js";
import { clipboardPayloadToInsertions } from "./shared/paste.js";
import {
  asString,
  cloneBlockRecord,
  clonePageRecord,
  createBlockRecord,
  createPageRecord,
  createSortOrder,
  getBlockPlainText,
  normalizeBlockRecord,
  normalizePageRecord,
  nextSortOrder,
  sortBlocks,
  sortPages
} from "./shared/models.js";
import { searchWorkspace } from "./shared/search.js";
import { iconSvg } from "../ui-framework/src/icons/retro-icons.js";

const log = createLogger("App", "Bootstrap");

const COMMANDS = [
  { id: "paragraph", label: "Paragraph", type: "paragraph" },
  { id: "heading-1", label: "Heading 1", type: "heading", level: 1 },
  { id: "heading-2", label: "Heading 2", type: "heading", level: 2 },
  { id: "heading-3", label: "Heading 3", type: "heading", level: 3 },
  { id: "quote", label: "Quote", type: "quote" },
  { id: "list", label: "List", type: "list" },
  { id: "table", label: "Table", type: "table" },
  { id: "code", label: "Code", type: "code" },
  { id: "sourceLink", label: "Source Link", type: "sourceLink" }
];

function deepClone(value) {
  return structuredClone(value);
}

function buildButton({ className = "trn-button", icon = "", label, title, dataset = {}, type = "button" }) {
  const button = document.createElement("button");
  button.type = type;
  button.className = className;
  button.title = title || label;
  button.setAttribute("aria-label", title || label);
  for (const [key, value] of Object.entries(dataset)) button.dataset[key] = value;
  if (icon) button.insertAdjacentHTML("beforeend", iconSvg(icon, { label }));
  if (label) {
    const text = document.createElement("span");
    text.textContent = label;
    button.appendChild(text);
  }
  return button;
}

function buildIconButton({ icon, label, tone = "", dataset = {}, title = label }) {
  const button = buildButton({ className: `trn-icon-button${tone ? ` ${tone}` : ""}`, icon, label: "", title, dataset });
  button.classList.add("trn-icon-button");
  if (tone) button.classList.add(tone);
  return button;
}

function safeFocus(element) {
  if (!element) return;
  requestAnimationFrame(() => {
    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus?.();
    }
  });
}

function getDomainFromUrl(url) {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed, window.location.href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function selectorEscape(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function richHtmlFromElement(element) {
  return element.innerHTML;
}

function commandFromShortcut(text) {
  const normalized = String(text ?? "").trim().toLowerCase();
  if (!normalized.startsWith("/")) return null;
  switch (normalized) {
    case "/":
    case "/p":
    case "/para":
    case "/paragraph":
      return "paragraph";
    case "/h":
    case "/heading":
      return "heading";
    case "/h1":
      return "heading-1";
    case "/h2":
      return "heading-2";
    case "/h3":
      return "heading-3";
    case "/quote":
      return "quote";
    case "/list":
      return "list";
    case "/table":
      return "table";
    case "/code":
      return "code";
    case "/source":
    case "/link":
    case "/source-link":
      return "sourceLink";
    default:
      return null;
  }
}

function blockPlaceholder(block) {
  switch (block.type) {
    case "paragraph": return "Write a paragraph...";
    case "heading": return "Write a heading...";
    case "quote": return "Write a quote...";
    case "code": return "Write code...";
    default: return "";
  }
}

function summaryForSave(state) {
  return {
    pageId: state.selectedPageId,
    pageTitle: state.selectedPage?.title || "",
    blockCount: state.selectedBlocks.length,
    searchQuery: state.searchQuery,
    searchResultCount: state.searchResults.length
  };
}

export class ResearchNotepadApp {
  constructor(root) {
    this.root = root;
    this.logger = log;
    this.storage = new StorageClient();
    this.pages = [];
    this.blocks = [];
    this.settings = {};
    this.selectedPageId = null;
    this.selectedBlockId = null;
    this.searchQuery = "";
    this.searchResults = [];
    this.saveState = { state: "loading", scope: "workspace", message: "Loading workspace" };
    this.history = [];
    this.renamePageId = null;
    this.renameValue = "";
    this.slashMenuState = null;
    this.editorShell = null;
    this.sidebarShell = null;
    this.pageTitleInput = null;
    this.pageList = null;
    this.editorBlocks = null;
    this.searchInput = null;
    this.searchResultsContainer = null;
    this.statusStrip = null;
    this.splitPane = null;
    this.editorScrollHost = null;
    this.sidebarScrollHost = null;
    this.lastRenderScrollTop = 0;
    this.pendingBlockFocusId = null;
    this.pendingEditorScrollId = null;
    this.hideSlashMenuTimer = null;
    this.storageUnsubscribe = this.storage.subscribe((status) => this.#onStorageStatus(status));
  }

  async bootstrap() {
    this.renderShell();
    this.bindGlobalEvents();
    try {
      await this.storage.connect();
      const snapshot = await this.storage.getWorkspaceSnapshot();
      this.pages = sortPages(snapshot.pages.map((page) => normalizePageRecord(page)));
      this.blocks = sortBlocks(snapshot.blocks.map((block) => normalizeBlockRecord(block)));
      this.settings = Object.fromEntries((snapshot.settings || []).map((item) => [item.key, item.value]));
      if (!this.pages.length) {
        await this.createInitialWorkspace();
      }
      const lastPageId = this.settings.lastPageId && this.pages.some((page) => page.id === this.settings.lastPageId)
        ? this.settings.lastPageId
        : this.pages[0]?.id || null;
      this.selectedPageId = lastPageId;
      this.searchQuery = asString(this.settings.lastSearchQuery, "");
      this.renderAll();
      this.applySearch();
      await this.storage.updateSetting("sidebarWidth", this.settings.sidebarWidth || 320).catch(() => {});
      if (this.searchInput) this.searchInput.value = this.searchQuery;
      this.logger.info("Workspace loaded", { context: summaryForSave(this) });
      this.#updateStatus();
    } catch (error) {
      this.logger.error("Bootstrap failed", { context: { error } });
      this.saveState = { state: "failed", scope: "workspace", message: error?.message || "Workspace load failed", error };
      this.renderAll();
      this.#updateStatus();
      this.renderError(error);
    }
  }

  get selectedPage() {
    return this.pages.find((page) => page.id === this.selectedPageId) || null;
  }

  get selectedBlocks() {
    return sortBlocks(this.blocks.filter((block) => block.pageId === this.selectedPageId && !block.deletedAt));
  }

  get visiblePages() {
    return sortPages(this.pages.filter((page) => !page.deletedAt && !page.archivedAt));
  }

  renderShell() {
    const appShell = document.createElement("awwbookmarklet-app-shell");
    appShell.className = "trn-shell";
    appShell.innerHTML = `
      <span slot="title">Topic Research Notepad</span>
      <span slot="subtitle">Local topic notes, sources, and exports</span>
      <div slot="status" class="trn-commandbar" aria-label="Command bar"></div>
      <div slot="body" class="trn-main"></div>
      <div slot="footer"></div>
    `;
    this.root.replaceChildren(appShell);
    this.shell = appShell;
    this.commandBar = appShell.querySelector('[slot="status"]');
    this.mainBody = appShell.querySelector('[slot="body"]');
    this.footer = appShell.querySelector('[slot="footer"]');
    this.renderCommandBar();
    this.renderMainLayout();
  }

  renderCommandBar() {
    const bar = this.commandBar;
    bar.innerHTML = "";

    const primary = document.createElement("div");
    primary.className = "trn-commandbar-primary";
    primary.appendChild(buildButton({ label: "New Page", icon: "document", title: "Create a new page" }));
    primary.appendChild(buildButton({ label: "Undo", icon: "undo", title: "Undo the last structural change" }));

    const search = document.createElement("div");
    search.className = "trn-commandbar-search";
    search.setAttribute("role", "search");
    search.setAttribute("aria-label", "Search local notes");
    const searchInput = document.createElement("input");
    searchInput.className = "trn-input";
    searchInput.type = "search";
    searchInput.placeholder = "Search local notes";
    searchInput.autocomplete = "off";
    searchInput.spellcheck = false;
    const clearButton = buildButton({ label: "Clear", icon: "close", title: "Clear search" });
    search.append(searchInput, clearButton);

    const secondary = document.createElement("div");
    secondary.className = "trn-commandbar-secondary";
    secondary.appendChild(buildButton({ label: "Export MD", icon: "markdown", title: "Export the current page as Markdown" }));
    secondary.appendChild(buildButton({ label: "Backup JSON", icon: "upload", title: "Export a JSON backup of the workspace" }));

    bar.append(primary, search, secondary);

    const [newPageButton, undoButton] = primary.querySelectorAll("button");
    const [clearSearchButton, exportMdButton, backupButton] = [clearButton, ...secondary.querySelectorAll("button")];
    newPageButton.addEventListener("click", () => this.createPage());
    undoButton.addEventListener("click", () => this.undoStructuralChange());
    searchInput.addEventListener("input", () => {
      this.searchQuery = searchInput.value;
      this.settings.lastSearchQuery = this.searchQuery;
      this.storage.scheduleSettingPatch("lastSearchQuery", this.searchQuery);
      this.applySearch();
    });
    clearSearchButton.addEventListener("click", () => {
      searchInput.value = "";
      this.searchQuery = "";
      this.storage.scheduleSettingPatch("lastSearchQuery", "");
      this.applySearch();
      safeFocus(searchInput);
    });
    exportMdButton.addEventListener("click", () => this.exportMarkdown());
    backupButton.addEventListener("click", () => this.exportBackup());
    this.searchInput = searchInput;
  }

  renderMainLayout() {
    this.mainBody.innerHTML = `
      <awwbookmarklet-split-pane class="trn-layout-split" direction="horizontal" value="${this.settings.sidebarWidth || 320}" min-start="220" min-end="420">
        <section slot="start" class="trn-sidebar"></section>
        <main slot="end" class="trn-editor-panel"></main>
      </awwbookmarklet-split-pane>
    `;
    this.splitPane = this.mainBody.querySelector("awwbookmarklet-split-pane");
    this.sidebarShell = this.mainBody.querySelector(".trn-sidebar");
    this.editorShell = this.mainBody.querySelector(".trn-editor-panel");
    this.splitPane.addEventListener("awwbookmarklet-split-pane-resize-commit", () => {
      const value = Number(this.splitPane.getAttribute("value") || 320);
      this.settings.sidebarWidth = value;
      this.storage.scheduleSettingPatch("sidebarWidth", value);
    });
    this.sidebarShell.innerHTML = `
      <div class="trn-page-head">
        <div class="trn-page-head-row">
          <strong>Pages</strong>
        </div>
        <div class="trn-empty" data-empty-pages hidden>No pages yet.</div>
      </div>
      <div class="trn-page-list-wrap">
        <div class="trn-page-list"></div>
      </div>
    `;
    this.pageList = this.sidebarShell.querySelector(".trn-page-list");
    this.editorShell.innerHTML = `
      <div class="trn-editor-inner">
        <div class="trn-search-results" hidden></div>
        <div class="trn-page-head">
          <input class="trn-page-title-input" type="text" aria-label="Page title" />
          <div class="trn-block-add"></div>
        </div>
        <div class="trn-blocks"></div>
        <button class="trn-document-end-insert" type="button">+ Add paragraph</button>
      </div>
    `;
    this.pageTitleInput = this.editorShell.querySelector(".trn-page-title-input");
    this.searchResultsContainer = this.editorShell.querySelector(".trn-search-results");
    this.editorBlocks = this.editorShell.querySelector(".trn-blocks");
    this.bottomAddButton = this.editorShell.querySelector(".trn-document-end-insert");
    this.pageTitleInput.addEventListener("input", () => this.onPageTitleInput());
    this.pageTitleInput.addEventListener("blur", () => this.flushPageTitle());
    this.bottomAddButton.addEventListener("click", () => this.addBlock("paragraph"));
    this.editorShell.addEventListener("click", (event) => {
      const block = event.target.closest?.("[data-block-id]");
      if (!block) return;
      this.selectedBlockId = block.dataset.blockId;
      this.renderActiveBlockChrome();
    });
    this.editorShell.addEventListener("input", (event) => this.onEditorInput(event));
    this.editorShell.addEventListener("change", (event) => this.onEditorChange(event));
    this.editorShell.addEventListener("keydown", (event) => this.onEditorKeydown(event));
    this.editorShell.addEventListener("paste", (event) => this.onEditorPaste(event));
    this.editorShell.addEventListener("focusin", (event) => {
      const block = event.target.closest?.("[data-block-id]");
      if (block) {
        this.selectedBlockId = block.dataset.blockId;
        this.renderActiveBlockChrome();
      }
    });

    this.statusStrip = document.createElement("awwbookmarklet-status-strip");
    this.statusStrip.className = "trn-statusbar";
    this.footer.replaceChildren(this.statusStrip);
  }

  renderAll() {
    this.renderPages();
    this.renderEditor();
    this.applySearch();
    this.renderActiveBlockChrome();
    this.#updateStatus();
  }

  renderPages() {
    if (!this.pageList) return;
    const pages = this.visiblePages;
    const empty = this.sidebarShell.querySelector("[data-empty-pages]");
    empty.hidden = pages.length > 0;
    this.pageList.innerHTML = "";

    for (const page of pages) {
      const row = document.createElement("div");
      row.className = "trn-page-row";
      row.dataset.pageId = page.id;
      if (page.id === this.selectedPageId) row.classList.add("selected");

      const titleButton = buildButton({
        className: "trn-page-button",
        label: page.title,
        title: `Open page: ${page.title}`
      });
      titleButton.dataset.pageId = page.id;
      titleButton.addEventListener("click", () => this.selectPage(page.id));
      titleButton.addEventListener("dblclick", () => this.beginPageRename(page.id));

      const actions = document.createElement("div");
      actions.className = "trn-page-actions";
      const up = buildIconButton({ icon: "back", label: "Move page up", title: "Move page up" });
      const down = buildIconButton({ icon: "forward", label: "Move page down", title: "Move page down" });
      const rename = buildIconButton({ icon: "edit", label: "Rename page", title: "Rename page" });
      up.addEventListener("click", () => this.movePage(page.id, -1));
      down.addEventListener("click", () => this.movePage(page.id, 1));
      rename.addEventListener("click", () => this.beginPageRename(page.id));
      actions.append(up, down, rename);

      row.append(titleButton, actions);
      if (this.renamePageId === page.id) {
        const renameInput = document.createElement("input");
        renameInput.className = "trn-input";
        renameInput.value = this.renameValue;
        renameInput.style.gridColumn = "1 / -1";
        renameInput.addEventListener("input", () => {
          this.renameValue = renameInput.value;
        });
        renameInput.addEventListener("blur", () => this.commitPageRename());
        renameInput.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.commitPageRename();
          } else if (event.key === "Escape") {
            event.preventDefault();
            this.cancelPageRename();
          }
        });
        row.replaceChildren(renameInput, actions);
        safeFocus(renameInput);
      }
      this.pageList.append(row);
    }
  }

  renderEditor() {
    const page = this.selectedPage;
    this.pageTitleInput.value = page?.title || "";
    this.pageTitleInput.disabled = !page;
    this.editorBlocks.innerHTML = "";
    const blocks = this.selectedBlocks;
    for (const block of blocks) {
      this.editorBlocks.append(this.renderBlock(block));
    }
    this.bottomAddButton.hidden = !page;
    if (this.pendingBlockFocusId) {
      const target = this.editorBlocks.querySelector(`[data-block-id="${selectorEscape(this.pendingBlockFocusId)}"]`);
      if (target) {
        this.pendingBlockFocusId = null;
        requestAnimationFrame(() => target.scrollIntoView({ block: "center", behavior: "smooth" }));
      }
    }
  }

  renderBlock(block) {
    const blockEl = document.createElement("section");
    blockEl.className = "trn-block";
    blockEl.dataset.blockId = block.id;
    blockEl.dataset.blockType = block.type;
    if (block.id === this.selectedBlockId) blockEl.classList.add("is-focused");

    const toolbar = document.createElement("div");
    toolbar.className = "trn-block-toolbar";
    const label = document.createElement("span");
    label.textContent = block.type;
    const up = buildIconButton({ icon: "back", label: "Move block up", title: "Move block up" });
    const down = buildIconButton({ icon: "forward", label: "Move block down", title: "Move block down" });
    const transform = this.buildTransformMenu(block);
    const del = buildIconButton({ icon: "trash", label: "Delete block", title: "Delete block", tone: "danger" });
    up.addEventListener("click", () => this.moveBlock(block.id, -1));
    down.addEventListener("click", () => this.moveBlock(block.id, 1));
    del.addEventListener("click", () => this.deleteBlock(block.id));
    toolbar.append(label, up, down, transform, del);

    blockEl.append(toolbar);
    blockEl.append(this.renderBlockBody(block));
    return blockEl;
  }

  buildTransformMenu(block) {
    const container = document.createElement("details");
    container.className = "trn-transform-menu";
    const summary = document.createElement("summary");
    summary.textContent = "Turn into";
    container.append(summary);
    const options = document.createElement("div");
    options.className = "trn-transform-options";
    for (const command of COMMANDS) {
      if (!this.canTransform(block, command.type)) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = command.label;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        container.removeAttribute("open");
        this.transformBlock(block.id, command);
      });
      options.append(button);
    }
    container.append(options);
    return container;
  }

  canTransform(block, targetType) {
    if (block.type === targetType) return false;
    if (block.type === "unsupported") return false;
    if (block.type === "sourceLink") return targetType === "paragraph" || targetType === "unsupported";
    if (block.type === "table") return ["paragraph", "heading", "quote", "code", "list"].includes(targetType);
    if (block.type === "code") return ["paragraph", "quote", "list", "heading"].includes(targetType);
    if (block.type === "list") return ["paragraph", "quote", "heading", "code"].includes(targetType);
    return true;
  }

  renderBlockBody(block) {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "quote":
        return this.renderRichBlock(block);
      case "list":
        return this.renderListBlock(block);
      case "table":
        return this.renderTableBlock(block);
      case "code":
        return this.renderCodeBlock(block);
      case "sourceLink":
        return this.renderSourceLinkBlock(block);
      default:
        return this.renderUnsupportedBlock(block);
    }
  }

  renderRichBlock(block) {
    const wrapper = document.createElement("div");
    wrapper.className = "trn-rich-text";
    wrapper.contentEditable = "true";
    wrapper.spellcheck = true;
    wrapper.dataset.field = "content";
    wrapper.dataset.blockId = block.id;
    wrapper.dataset.blockType = block.type;
    wrapper.dataset.placeholder = blockPlaceholder(block);
    wrapper.innerHTML = block.content?.html || "";
    if (block.type === "heading") wrapper.classList.add("trn-rich-text--heading");
    if (block.type === "paragraph") wrapper.classList.add("trn-rich-text--paragraph");
    if (block.type === "quote") wrapper.classList.add("trn-rich-text--quote");
    wrapper.addEventListener("focus", () => {
      this.selectedBlockId = block.id;
      this.renderActiveBlockChrome();
    });
    return wrapper;
  }

  renderListBlock(block) {
    const wrap = document.createElement("div");
    wrap.className = "trn-list-items";
    const readItems = () => {
      const current = this.blocks.find((item) => item.id === block.id);
      return Array.isArray(current?.content?.items) ? current.content.items : [];
    };
    readItems().forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "trn-list-item";
      row.dataset.blockId = block.id;
      const input = document.createElement("input");
      input.className = "trn-list-input";
      input.value = item;
      input.placeholder = "List item";
      input.dataset.listIndex = String(index);
      input.addEventListener("input", () => {
        const next = readItems().slice();
        next[index] = input.value;
        this.updateBlockContent(block.id, { items: next });
      });
      const remove = buildIconButton({ icon: "close", label: "Delete item", title: "Delete item" });
      remove.addEventListener("click", () => {
        const next = readItems().slice();
        next.splice(index, 1);
        this.pushBlockSnapshot(block.pageId);
        this.updateBlockImmediate(block.id, { content: { items: next } });
        this.renderEditor();
      });
      row.append(input, remove);
      wrap.append(row);
    });
    const add = buildButton({ label: "Add item", icon: "add", title: "Add list item" });
    add.classList.add("trn-add-list-item");
    add.addEventListener("click", () => {
      const next = [...readItems(), ""];
      this.pushBlockSnapshot(block.pageId);
      this.updateBlockImmediate(block.id, { content: { items: next } });
      this.renderEditor();
      requestAnimationFrame(() => {
        const last = this.editorBlocks.querySelector(`[data-block-id="${selectorEscape(block.id)}"] .trn-list-item:last-child input`);
        safeFocus(last);
      });
    });
    wrap.append(add);
    return wrap;
  }

  renderTableBlock(block) {
    const wrap = document.createElement("div");
    wrap.className = "trn-table-wrap";
    const table = document.createElement("table");
    table.className = "trn-table";
    const readTable = () => {
      const current = this.blocks.find((item) => item.id === block.id);
      return {
        columns: Array.isArray(current?.content?.columns) ? current.content.columns : [],
        rows: Array.isArray(current?.content?.rows) ? current.content.rows : []
      };
    };
    const { columns, rows } = readTable();

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    columns.forEach((column, colIndex) => {
      const th = document.createElement("th");
      const input = document.createElement("input");
      input.value = column;
      input.placeholder = `Column ${colIndex + 1}`;
      input.addEventListener("input", () => {
        const nextColumns = readTable().columns.slice();
        nextColumns[colIndex] = input.value;
        this.updateBlockContent(block.id, { columns: nextColumns });
      });
      th.append(input);
      headerRow.append(th);
    });
    thead.append(headerRow);

    const tbody = document.createElement("tbody");
    rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      row.forEach((cell, colIndex) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.value = cell;
        input.addEventListener("input", () => {
          const nextRows = readTable().rows.map((current) => current.slice());
          if (!nextRows[rowIndex]) nextRows[rowIndex] = [];
          nextRows[rowIndex][colIndex] = input.value;
          this.updateBlockContent(block.id, { rows: nextRows });
        });
        td.append(input);
        tr.append(td);
      });
      const actionCell = document.createElement("td");
      const removeRow = buildIconButton({ icon: "trash", label: "Delete row", title: "Delete row", tone: "danger" });
      removeRow.addEventListener("click", () => {
        const nextRows = rows.map((current) => current.slice());
        nextRows.splice(rowIndex, 1);
        this.pushBlockSnapshot(block.pageId);
        this.updateBlockImmediate(block.id, { content: { columns, rows: nextRows } });
        this.renderEditor();
      });
      actionCell.append(removeRow);
      tr.append(actionCell);
      tbody.append(tr);
    });

    const actions = document.createElement("div");
    actions.className = "trn-table-actions";
    const addRow = buildButton({ label: "Add row", icon: "add", title: "Add row" });
    const addColumn = buildButton({ label: "Add column", icon: "columns", title: "Add column" });
    const removeColumn = buildButton({ label: "Remove column", icon: "trash", title: "Remove last column" });
    addRow.addEventListener("click", () => {
      const current = readTable();
      const nextRows = current.rows.map((currentRow) => currentRow.slice());
      nextRows.push(Array.from({ length: Math.max(1, current.columns.length) }, () => ""));
      this.pushBlockSnapshot(block.pageId);
      this.updateBlockImmediate(block.id, { content: { columns: current.columns, rows: nextRows } });
      this.renderEditor();
    });
    addColumn.addEventListener("click", () => {
      const current = readTable();
      const nextColumns = [...current.columns, `Column ${current.columns.length + 1}`];
      const nextRows = current.rows.map((row) => [...row, ""]);
      this.pushBlockSnapshot(block.pageId);
      this.updateBlockImmediate(block.id, { content: { columns: nextColumns, rows: nextRows } });
      this.renderEditor();
    });
    removeColumn.addEventListener("click", () => {
      const current = readTable();
      if (!current.columns.length) return;
      const nextColumns = current.columns.slice(0, -1);
      const nextRows = current.rows.map((row) => row.slice(0, -1));
      this.pushBlockSnapshot(block.pageId);
      this.updateBlockImmediate(block.id, { content: { columns: nextColumns, rows: nextRows } });
      this.renderEditor();
    });
    actions.append(addRow, addColumn, removeColumn);

    table.append(thead, tbody);
    wrap.append(table, actions);
    return wrap;
  }

  renderCodeBlock(block) {
    const textarea = document.createElement("textarea");
    textarea.className = "trn-textarea code";
    textarea.value = block.content?.text || "";
    textarea.dataset.blockId = block.id;
    textarea.dataset.field = "content";
    textarea.spellcheck = false;
    textarea.addEventListener("input", () => this.updateBlockContent(block.id, { text: textarea.value }));
    return textarea;
  }

  renderSourceLinkBlock(block) {
    const details = document.createElement("details");
    details.className = "trn-source-details";
    details.open = true;
    details.dataset.blockId = block.id;
    const summary = document.createElement("summary");
    const title = document.createElement("div");
    title.className = "trn-source-title";
    title.textContent = block.content?.title || block.content?.url || "Source link";
    const domain = document.createElement("div");
    domain.className = "trn-source-domain";
    domain.textContent = block.content?.domain || getDomainFromUrl(block.content?.url || "");
    summary.append(title, domain);
    details.append(summary);

    const open = document.createElement("a");
    open.className = "trn-source-link";
    open.href = block.content?.url || "#";
    open.textContent = "Open source";
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    details.append(open);

    const grid = document.createElement("div");
    grid.className = "trn-source-grid";

    grid.append(
      this.labeledInput("Title", block.content?.title || "", (value) => this.updateBlockContent(block.id, { title: value })),
      this.labeledInput("URL", block.content?.url || "", (value) => this.updateBlockContent(block.id, { url: value, domain: getDomainFromUrl(value) })),
      this.labeledInput("Domain", block.content?.domain || "", (value) => this.updateBlockContent(block.id, { domain: value })),
      this.labeledTextarea("Note", block.content?.note || "", (value) => this.updateBlockContent(block.id, { note: value })),
      this.labeledTextarea("Captured text", block.content?.capturedText || "", (value) => this.updateBlockContent(block.id, { capturedText: value }))
    );

    details.append(grid);
    return details;
  }

  renderUnsupportedBlock(block) {
    const wrap = document.createElement("div");
    wrap.className = "trn-unsupported";
    wrap.innerHTML = `<strong>Unsupported block type:</strong> ${block.type}<pre>${JSON.stringify(block.content?.raw ?? block.content ?? {}, null, 2)}</pre>`;
    return wrap;
  }

  labeledInput(label, value, onInput) {
    const wrap = document.createElement("label");
    wrap.className = "trn-source-row";
    const title = document.createElement("span");
    title.textContent = label;
    const input = document.createElement("input");
    input.className = "trn-input";
    input.value = value;
    input.addEventListener("input", () => onInput(input.value));
    wrap.append(title, input);
    return wrap;
  }

  labeledTextarea(label, value, onInput) {
    const wrap = document.createElement("label");
    wrap.className = "trn-source-row";
    const title = document.createElement("span");
    title.textContent = label;
    const textarea = document.createElement("textarea");
    textarea.className = "trn-textarea";
    textarea.value = value;
    textarea.addEventListener("input", () => onInput(textarea.value));
    wrap.append(title, textarea);
    return wrap;
  }

  renderActiveBlockChrome() {
    for (const blockEl of this.editorBlocks.querySelectorAll(".trn-block")) {
      blockEl.classList.toggle("is-focused", blockEl.dataset.blockId === this.selectedBlockId);
    }
  }

  async createInitialWorkspace() {
    const page = createPageRecord({ title: DEFAULT_PAGE_TITLE, sortOrder: createSortOrder(0, PAGE_SORT_STEP) });
    const paragraph = createBlockRecord({
      pageId: page.id,
      type: "paragraph",
      sortOrder: BLOCK_SORT_STEP,
      content: { html: "", text: "" }
    });
    await this.storage.createPage(page, [paragraph]);
    this.pages = [normalizePageRecord(page)];
    this.blocks = [normalizeBlockRecord(paragraph)];
    this.selectedPageId = page.id;
    this.selectedBlockId = paragraph.id;
    this.storage.scheduleSettingPatch("lastPageId", page.id);
  }

  async createPage(title = "Untitled research") {
    await this.flushAll();
    const page = createPageRecord({
      title,
      sortOrder: nextSortOrder(this.pages, PAGE_SORT_STEP)
    });
    const paragraph = createBlockRecord({
      pageId: page.id,
      type: "paragraph",
      sortOrder: BLOCK_SORT_STEP,
      content: { html: "", text: "" }
    });
    this.pages = sortPages([...this.pages, page]);
    this.blocks = [...this.blocks, paragraph];
    await this.storage.createPage(page, [paragraph]);
    this.selectedPageId = page.id;
    this.selectedBlockId = paragraph.id;
    this.storage.scheduleSettingPatch("lastPageId", page.id);
    this.pendingBlockFocusId = paragraph.id;
    this.renderAll();
    this.logger.info("Page created", { context: { pageId: page.id, title: page.title } });
  }

  beginPageRename(pageId) {
    const page = this.pages.find((item) => item.id === pageId);
    if (!page) return;
    this.renamePageId = pageId;
    this.renameValue = page.title;
    this.renderPages();
  }

  cancelPageRename() {
    this.renamePageId = null;
    this.renameValue = "";
    this.renderPages();
  }

  async commitPageRename() {
    const page = this.pages.find((item) => item.id === this.renamePageId);
    if (!page) return this.cancelPageRename();
    const title = this.renameValue.trim() || DEFAULT_PAGE_TITLE;
    this.renamePageId = null;
    this.renameValue = "";
    if (title === page.title) {
      this.renderPages();
      return;
    }
    page.title = title;
    page.updatedAt = new Date().toISOString();
    this.renderPages();
    this.storage.schedulePagePatch(page.id, { title, updatedAt: page.updatedAt });
    this.logger.info("Page renamed", { context: { pageId: page.id, title } });
  }

  onPageTitleInput() {
    const page = this.selectedPage;
    if (!page) return;
    page.title = this.pageTitleInput.value;
    page.updatedAt = new Date().toISOString();
    this.renderPages();
    this.storage.schedulePagePatch(page.id, { title: page.title, updatedAt: page.updatedAt });
    this.storage.scheduleSettingPatch("lastPageId", page.id);
  }

  async flushPageTitle() {
    const page = this.selectedPage;
    if (!page) return;
    page.title = this.pageTitleInput.value.trim() || DEFAULT_PAGE_TITLE;
    page.updatedAt = new Date().toISOString();
    await this.storage.flushPagePatch(page.id).catch(() => {});
    this.renderPages();
  }

  async selectPage(pageId, { focusBlockId = null } = {}) {
    if (pageId === this.selectedPageId && !focusBlockId) return;
    await this.flushAll();
    this.selectedPageId = pageId;
    this.selectedBlockId = focusBlockId || null;
    this.pendingBlockFocusId = focusBlockId;
    this.storage.scheduleSettingPatch("lastPageId", pageId);
    this.renderAll();
    this.logger.info("Page selected", { context: { pageId, focusBlockId } });
  }

  pushBlockSnapshot(pageId) {
    const blocks = sortBlocks(this.blocks.filter((block) => block.pageId === pageId).map((block) => deepClone(block)));
    this.history.push({ kind: "pageBlocks", pageId, blocks });
  }

  pushPageSnapshot() {
    this.history.push({ kind: "pages", pages: deepClone(sortPages(this.pages)) });
  }

  async undoStructuralChange() {
    const snapshot = this.history.pop();
    if (!snapshot) return;
    await this.flushAll();
    if (snapshot.kind === "pages") {
      this.pages = sortPages(snapshot.pages.map((page) => normalizePageRecord(page)));
      await this.storage.replacePages(this.pages);
      this.renderPages();
      this.logger.info("Undo restored pages", { context: { pageCount: this.pages.length } });
      return;
    }
    if (snapshot.kind === "pageBlocks") {
      const untouched = this.blocks.filter((block) => block.pageId !== snapshot.pageId);
      const restored = sortBlocks(snapshot.blocks.map((block) => normalizeBlockRecord(block)));
      this.blocks = [...untouched, ...restored];
      await this.storage.replacePageBlocks(snapshot.pageId, restored);
      this.renderEditor();
      this.logger.info("Undo restored blocks", { context: { pageId: snapshot.pageId, blockCount: restored.length } });
    }
  }

  async movePage(pageId, direction) {
    const index = this.visiblePages.findIndex((page) => page.id === pageId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= this.visiblePages.length) return;
    this.pushPageSnapshot();
    const pages = sortPages([...this.pages]);
    const current = pages.findIndex((page) => page.id === pageId);
    const target = current + direction;
    const nextOrder = pages.slice();
    [nextOrder[current], nextOrder[target]] = [nextOrder[target], nextOrder[current]];
    nextOrder.forEach((page, index) => {
      page.sortOrder = createSortOrder(index, PAGE_SORT_STEP);
      page.updatedAt = new Date().toISOString();
    });
    this.pages = sortPages(nextOrder);
    await this.storage.reorderPages(this.pages.map((page) => ({ id: page.id, sortOrder: page.sortOrder })));
    this.renderPages();
    this.logger.info("Page reordered", { context: { pageId, direction } });
  }

  async moveBlock(blockId, direction) {
    const block = this.blocks.find((item) => item.id === blockId && item.pageId === this.selectedPageId);
    if (!block) return;
    const blocks = this.selectedBlocks;
    const index = blocks.findIndex((item) => item.id === blockId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= blocks.length) return;
    this.pushBlockSnapshot(block.pageId);
    const nextBlocks = blocks.slice();
    [nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]];
    nextBlocks.forEach((item, index) => {
      item.sortOrder = createSortOrder(index, BLOCK_SORT_STEP);
      item.updatedAt = new Date().toISOString();
    });
    this.blocks = [...this.blocks.filter((item) => item.pageId !== block.pageId || item.deletedAt), ...nextBlocks];
    await this.storage.reorderBlocks(nextBlocks.map((item) => ({ id: item.id, sortOrder: item.sortOrder })));
    this.renderEditor();
    this.logger.info("Block reordered", { context: { blockId, direction } });
  }

  async deleteBlock(blockId) {
    const block = this.blocks.find((item) => item.id === blockId);
    if (!block) return;
    this.pushBlockSnapshot(block.pageId);
    this.blocks = this.blocks.map((item) => item.id === blockId ? { ...item, deletedAt: new Date().toISOString() } : item);
    await this.storage.deleteBlock(blockId);
    this.renderEditor();
    this.logger.info("Block deleted", { context: { blockId, pageId: block.pageId } });
  }

  async transformBlock(blockId, command) {
    const block = this.blocks.find((item) => item.id === blockId);
    if (!block) return;
    this.pushBlockSnapshot(block.pageId);
    const next = this.transformBlockRecord(block, command);
    this.blocks = this.blocks.map((item) => item.id === blockId ? next : item);
    await this.storage.updateBlock(blockId, next);
    this.renderEditor();
    this.logger.info("Block transformed", { context: { blockId, from: block.type, to: next.type } });
  }

  transformBlockRecord(block, command) {
    const text = getBlockPlainText(block);
    const common = {
      pageId: block.pageId,
      sortOrder: block.sortOrder,
      source: block.source,
      createdAt: block.createdAt,
      metadata: block.metadata,
      deletedAt: null
    };
    switch (command.type) {
      case "paragraph":
        return createBlockRecord({ ...common, id: block.id, type: "paragraph", content: { html: block.content?.html || "", text } });
      case "heading":
        return createBlockRecord({ ...common, id: block.id, type: "heading", content: { level: command.level || 1, html: block.content?.html || "", text } });
      case "quote":
        return createBlockRecord({ ...common, id: block.id, type: "quote", content: { html: block.content?.html || "", text } });
      case "list":
        return createBlockRecord({ ...common, id: block.id, type: "list", content: { items: text.split("\n").map((line) => line.trim()).filter(Boolean) } });
      case "table":
        return createBlockRecord({ ...common, id: block.id, type: "table", content: { columns: ["Column 1", "Column 2"], rows: [[text, ""]] } });
      case "code":
        return createBlockRecord({ ...common, id: block.id, type: "code", content: { text, language: "" } });
      case "sourceLink":
        return createBlockRecord({ ...common, id: block.id, type: "sourceLink", content: { title: text.slice(0, 80), url: "", domain: "", note: "", capturedText: text } });
      default:
        return cloneBlockRecord(block);
    }
  }

  updateBlockContent(blockId, patch) {
    const index = this.blocks.findIndex((item) => item.id === blockId);
    if (index < 0) return;
    const block = this.blocks[index];
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
      const next = cloneBlockRecord(block, { content: { ...block.content, ...patch } });
      this.blocks[index] = next;
      this.storage.scheduleBlockPatch(blockId, { content: next.content });
      this.#updateStatus();
      return;
    }
    if (block.type === "list") {
      const next = cloneBlockRecord(block, { content: { ...block.content, ...patch } });
      this.blocks[index] = next;
      this.storage.scheduleBlockPatch(blockId, { content: next.content });
      this.#updateStatus();
      return;
    }
    if (block.type === "table") {
      const next = cloneBlockRecord(block, { content: { ...block.content, ...patch } });
      this.blocks[index] = next;
      this.storage.scheduleBlockPatch(blockId, { content: next.content });
      this.#updateStatus();
      return;
    }
    if (block.type === "code") {
      const next = cloneBlockRecord(block, { content: { ...block.content, ...patch } });
      this.blocks[index] = next;
      this.storage.scheduleBlockPatch(blockId, { content: next.content });
      this.#updateStatus();
      return;
    }
    if (block.type === "sourceLink") {
      const next = cloneBlockRecord(block, { content: { ...block.content, ...patch } });
      this.blocks[index] = next;
      this.storage.scheduleBlockPatch(blockId, { content: next.content });
      this.renderEditor();
      this.#updateStatus();
    }
  }

  updateBlockImmediate(blockId, patch) {
    const index = this.blocks.findIndex((item) => item.id === blockId);
    if (index < 0) return;
    const next = cloneBlockRecord(this.blocks[index], patch);
    this.blocks[index] = next;
    this.storage.scheduleBlockPatch(blockId, { content: next.content });
  }

  onEditorInput(event) {
    const blockEl = event.target.closest?.("[data-block-id]");
    if (!blockEl) return;
    const blockId = blockEl.dataset.blockId;
    const block = this.blocks.find((item) => item.id === blockId);
    if (!block) return;

    if (blockEl.classList.contains("trn-rich-text")) {
      const html = richHtmlFromElement(blockEl);
      const text = blockEl.textContent || "";
      this.updateBlockContent(blockId, { html, text });
      const shortcut = commandFromShortcut(text);
      if (shortcut && text.trim().startsWith("/")) this.showSlashMenu(blockEl, block, shortcut);
      else this.hideSlashMenu();
      return;
    }

    if (event.target.matches("textarea.trn-textarea.code")) {
      this.updateBlockContent(blockId, { text: event.target.value });
      this.hideSlashMenu();
      return;
    }

    if (event.target.matches("input.trn-list-input")) {
      const itemIndex = Number(event.target.dataset.listIndex);
      const current = this.blocks.find((item) => item.id === blockId);
      const items = [...(current?.content?.items || [])];
      items[itemIndex] = event.target.value;
      this.updateBlockContent(blockId, { items });
      return;
    }

    if (event.target.matches(".trn-source-grid input, .trn-source-grid textarea")) {
      // Source block inputs bind directly through their listeners.
      return;
    }
  }

  onEditorChange(event) {
    const blockEl = event.target.closest?.("[data-block-id]");
    if (!blockEl) return;
    this.selectedBlockId = blockEl.dataset.blockId;
    this.renderActiveBlockChrome();
  }

  onEditorKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
      const target = event.target;
      if (target && (target.matches("input, textarea") || target.isContentEditable)) return;
      event.preventDefault();
      this.undoStructuralChange();
      return;
    }
    if (event.key === "Escape" && this.slashMenuState) {
      event.preventDefault();
      this.hideSlashMenu();
    }
    if ((event.key === "Enter" || event.key === "Tab") && this.slashMenuState) {
      event.preventDefault();
      this.applySlashMenuSelection();
    }
    if (this.slashMenuState) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.moveSlashSelection(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.moveSlashSelection(-1);
      }
    }
  }

  async onEditorPaste(event) {
    const blockEl = event.target.closest?.("[data-block-id]");
    if (!blockEl) return;
    const blockId = blockEl.dataset.blockId;
    const block = this.blocks.find((item) => item.id === blockId);
    if (!block) return;
    const html = event.clipboardData?.getData("text/html") || "";
    const text = event.clipboardData?.getData("text/plain") || "";
    if (!html && !text) return;
    event.preventDefault();
    const payload = clipboardPayloadToInsertions({ html, text });
    this.logger.debug("Paste captured", { context: { blockId, mode: payload.mode } });
    if (payload.mode === "inline" && (block.type === "paragraph" || block.type === "heading" || block.type === "quote")) {
      const currentHtml = blockEl.innerHTML;
      const selection = window.getSelection();
      const next = payload.html || "";
      if (selection && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const fragment = document.createElement("div");
        fragment.innerHTML = next;
        const nodes = [...fragment.childNodes];
        for (const node of nodes) range.insertNode(node);
      } else {
        blockEl.innerHTML = currentHtml + next;
      }
      this.updateBlockContent(blockId, { html: blockEl.innerHTML, text: blockEl.textContent || "" });
      return;
    }
    if (payload.mode === "blocks") {
      const pageId = block.pageId;
      const blocks = this.selectedBlocks;
      const index = blocks.findIndex((item) => item.id === blockId);
      if (index < 0) return;
      this.pushBlockSnapshot(pageId);
      const insertions = payload.blocks.map((item, offset) => {
        const created = createBlockRecord({ ...item, pageId, sortOrder: (index + offset + 2) * BLOCK_SORT_STEP });
        return created;
      });
      const nextBlocks = [...blocks.slice(0, index + 1), ...insertions, ...blocks.slice(index + 1)]
        .map((item, idx) => ({ ...item, sortOrder: (idx + 1) * BLOCK_SORT_STEP }));
      this.blocks = [...this.blocks.filter((item) => item.pageId !== pageId || item.deletedAt), ...nextBlocks];
      await this.storage.replacePageBlocks(pageId, nextBlocks);
      this.pendingBlockFocusId = insertions[0]?.id || null;
      this.renderEditor();
      return;
    }
  }

  showSlashMenu(anchor, block, shortcutId) {
    const rect = anchor.getBoundingClientRect();
    this.hideSlashMenu();
    let candidates = COMMANDS.filter((command) => this.canTransform(block, command.type));
    if (shortcutId) {
      const exact = candidates.filter((command) => command.id === shortcutId);
      candidates = exact.length ? exact : candidates.filter((command) => command.type === shortcutId);
    }
    if (!candidates.length) return;
    const menu = document.createElement("div");
    menu.className = "trn-slash-menu";
    menu.style.left = `${Math.min(window.innerWidth - 24, rect.left)}px`;
    menu.style.top = `${Math.min(window.innerHeight - 24, rect.bottom + 4)}px`;
    candidates.forEach((command, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "trn-slash-item";
      button.innerHTML = `<strong>${command.label}</strong><span>/${command.id}</span>`;
      if (index === 0) button.classList.add("selected");
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.slashMenuState.selectedIndex = index;
        this.applySlashMenuSelection();
      });
      menu.append(button);
    });
    document.body.append(menu);
    this.slashMenuState = { blockId: block.id, anchor, menu, candidates, selectedIndex: 0 };
  }

  hideSlashMenu() {
    if (this.hideSlashMenuTimer) clearTimeout(this.hideSlashMenuTimer);
    this.slashMenuState?.menu?.remove();
    this.slashMenuState = null;
  }

  moveSlashSelection(delta) {
    if (!this.slashMenuState) return;
    const next = this.slashMenuState.selectedIndex + delta;
    this.slashMenuState.selectedIndex = Math.max(0, Math.min(this.slashMenuState.candidates.length - 1, next));
    [...this.slashMenuState.menu.querySelectorAll(".trn-slash-item")].forEach((item, index) => item.classList.toggle("selected", index === this.slashMenuState.selectedIndex));
  }

  applySlashMenuSelection() {
    if (!this.slashMenuState) return;
    const command = this.slashMenuState.candidates[this.slashMenuState.selectedIndex];
    if (!command) return this.hideSlashMenu();
    const block = this.blocks.find((item) => item.id === this.slashMenuState.blockId);
    if (!block) return this.hideSlashMenu();
    this.transformBlock(block.id, command);
    this.hideSlashMenu();
  }

  updateBlockContent(blockId, patch) {
    const index = this.blocks.findIndex((item) => item.id === blockId);
    if (index < 0) return;
    const block = this.blocks[index];
    let nextContent = { ...block.content };
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
      const html = sanitizeInlineHtml(patch.html ?? block.content.html ?? "");
      nextContent = { html, text: patch.text ?? htmlToText(html) ?? "" };
    } else if (block.type === "list") {
      nextContent = { items: patch.items ?? block.content.items ?? [] };
    } else if (block.type === "table") {
      nextContent = { columns: patch.columns ?? block.content.columns ?? [], rows: patch.rows ?? block.content.rows ?? [] };
    } else if (block.type === "code") {
      nextContent = { text: patch.text ?? block.content.text ?? "", language: block.content.language || "" };
    } else if (block.type === "sourceLink") {
      nextContent = { ...block.content, ...patch, domain: patch.url ? getDomainFromUrl(patch.url) || patch.domain || "" : patch.domain ?? block.content.domain ?? "" };
    }
    const next = cloneBlockRecord(block, { content: nextContent });
    this.blocks[index] = next;
    this.storage.scheduleBlockPatch(blockId, { content: next.content });
    this.#updateStatus();
  }

  async addBlock(type = "paragraph") {
    const page = this.selectedPage;
    if (!page) return;
    this.pushBlockSnapshot(page.id);
    const blocks = this.selectedBlocks;
    const sortOrder = nextSortOrder(blocks, BLOCK_SORT_STEP);
    const block = createBlockRecord({
      pageId: page.id,
      type,
      sortOrder,
      content: type === "sourceLink"
        ? { title: "", url: "", domain: "", note: "", capturedText: "" }
        : type === "list"
          ? { items: [""] }
          : type === "table"
            ? { columns: ["Column 1", "Column 2"], rows: [["", ""]] }
            : type === "code"
              ? { text: "", language: "" }
              : type === "heading"
                ? { level: 1, html: "", text: "" }
                : { html: "", text: "" }
    });
    this.blocks = [...this.blocks.filter((item) => item.pageId !== page.id || item.deletedAt), ...blocks, block];
    await this.storage.createBlock(block);
    this.renderEditor();
    this.pendingBlockFocusId = block.id;
    safeFocus(this.editorBlocks.querySelector(`[data-block-id="${selectorEscape(block.id)}"] [contenteditable], textarea, input`));
  }

  applySearch() {
    if (!this.searchResultsContainer) return;
    const query = this.searchQuery.trim();
    if (!query) {
      this.searchResults = [];
      this.searchResultsContainer.hidden = true;
      this.searchResultsContainer.innerHTML = "";
      this.#updateStatus();
      return;
    }
    this.searchResults = searchWorkspace({ pages: this.pages, blocks: this.blocks }, query, { maxResults: 20 });
    this.renderSearchResults();
    this.#updateStatus();
  }

  renderSearchResults() {
    const container = this.searchResultsContainer;
    const results = this.searchResults;
    container.hidden = results.length === 0;
    container.innerHTML = "";
    if (!results.length) return;
    for (const result of results) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "trn-search-result";
      button.innerHTML = `<strong>${result.title || result.kind}</strong><span>${result.snippet || ""}</span>`;
      button.addEventListener("click", () => this.openSearchResult(result));
      container.append(button);
    }
  }

  async openSearchResult(result) {
    await this.selectPage(result.pageId, { focusBlockId: result.blockId });
    if (result.blockId) {
      this.pendingBlockFocusId = result.blockId;
      requestAnimationFrame(() => {
        const block = this.editorBlocks.querySelector(`[data-block-id="${selectorEscape(result.blockId)}"]`);
        block?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }
  }

  async exportMarkdown() {
    await this.flushAll();
    const page = this.selectedPage;
    if (!page) return;
    const markdown = pageToMarkdown(page, this.selectedBlocks);
    this.downloadText(`${this.slugify(page.title)}.md`, markdown, "text/markdown");
    this.logger.info("Markdown exported", { context: { pageId: page.id, title: page.title } });
  }

  async exportBackup() {
    await this.flushAll();
    const payload = workspaceToBackupJson({ pages: this.pages, blocks: this.blocks, settings: this.settings });
    this.downloadText(`topic-research-notepad-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), "application/json");
    this.logger.info("Backup exported", { context: { pages: this.pages.length, blocks: this.blocks.length } });
  }

  downloadText(filename, text, mimeType) {
    const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  slugify(value) {
    return String(value || "topic-research-notepad").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "topic-research-notepad";
  }

  async flushAll() {
    await this.storage.flushAll().catch((error) => {
      this.logger.warn("Flush failed", { context: { error } });
    });
  }

  bindGlobalEvents() {
    window.addEventListener("beforeunload", () => this.flushAll());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flushAll();
    });
    window.addEventListener("pagehide", () => this.flushAll());
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        this.flushAll();
      }
    });
  }

  renderError(error) {
    const errorBox = document.createElement("div");
    errorBox.className = "trn-error";
    errorBox.innerHTML = `<strong>Storage unavailable.</strong><div>${error?.message || "Unknown error"}</div>`;
    this.mainBody.prepend(errorBox);
  }

  onRenameInputInput(value) {
    this.renameValue = value;
  }

  #onStorageStatus(status) {
    this.saveState = status;
    this.#updateStatus();
  }

  #updateStatus() {
    if (!this.statusStrip) return;
    const page = this.selectedPage;
    const state = this.saveState?.state || "idle";
    const saveLabel =
      state === "failed" ? `Save failed${this.saveState?.message ? `: ${this.saveState.message}` : ""}` :
      state === "saving" ? "Saving..." :
      state === "dirty" ? "Unsaved changes" :
      "Saved locally";
    this.statusStrip.segments = [
      { key: "save", value: saveLabel, tone: state === "failed" ? "danger" : state === "saving" || state === "dirty" ? "warning" : "success", kind: "status" },
      { key: "page", value: page ? page.title : "No page selected", kind: "app" },
      { key: "counts", value: `${this.pages.length} pages | ${this.selectedBlocks.length} blocks | ${this.searchResults.length} matches`, kind: "status" }
    ];
  }
}
