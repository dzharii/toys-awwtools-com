import { BLOCK_TYPES } from "./constants.js";
import { createBlock, createPage, deriveDomain, normalizeBlock, normalizePage, nowIso, sortByOrder } from "./models.js";
import { blocksFromClipboard } from "./paste.js";
import { downloadText, filenameForPage, pageToMarkdown, workspaceToBackup } from "./exporters.js";

export class TopicResearchApp {
  constructor({ root, storage }) {
    this.root = root;
    this.storage = storage;
    this.state = {
      pages: [],
      blocks: [],
      selectedPageId: null,
      searchResults: [],
      status: { state: "loading", detail: "Opening local storage" },
      error: "",
    };
    this.storage.addEventListener("save-status", (event) => {
      this.state.status = event.detail;
      this.renderStatus();
    });
  }

  async start() {
    this.renderShell();
    try {
      await this.storage.hello();
      const workspace = await this.storage.request("loadWorkspace");
      this.state.pages = workspace.pages.map(normalizePage);
      this.state.blocks = workspace.blocks.map(normalizeBlock);
      this.state.selectedPageId = workspace.settings.selectedPageId || this.state.pages[0]?.id || null;
      if (!this.state.pages.length) await this.createPage("Auth library comparison");
      this.state.status = { state: "saved", detail: "Local storage ready" };
      this.render();
      this.bindLifecycleFlush();
    } catch (error) {
      this.state.error = error.message;
      this.state.status = { state: "failed", detail: "Storage unavailable" };
      this.render();
    }
  }

  renderShell() {
    this.root.innerHTML = `
      <awwbookmarklet-app-shell class="trn-shell">
        <header class="trn-titlebar">
          <div class="trn-title">Topic Research Notepad</div>
          <div class="trn-actions">
            <button class="trn-button" data-action="export-md">Export MD</button>
            <button class="trn-button" data-action="export-json">Backup JSON</button>
          </div>
        </header>
        <div class="trn-commandbar">
          <button class="trn-button primary" data-action="new-page">New Page</button>
          <input class="trn-input" data-role="search" placeholder="Search local notes" />
          <button class="trn-button" data-action="clear-search">Clear</button>
        </div>
        <main class="trn-main">
          <aside class="trn-sidebar">
            <div class="trn-panel-title">Pages</div>
            <div data-role="page-list"></div>
          </aside>
          <section class="trn-editor-panel">
            <div data-role="error"></div>
            <div data-role="search-results"></div>
            <div data-role="editor"></div>
          </section>
        </main>
        <footer class="trn-statusbar" data-role="status"></footer>
      </awwbookmarklet-app-shell>
    `;
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.root.addEventListener("blur", (event) => this.handleBlur(event), true);
    this.root.addEventListener("paste", (event) => this.handlePaste(event));
  }

  render() {
    this.renderPages();
    this.renderEditor();
    this.renderSearchResults();
    this.renderStatus();
    this.renderError();
  }

  renderPages() {
    const list = this.root.querySelector('[data-role="page-list"]');
    list.innerHTML = sortByOrder(this.state.pages).map((page) => `
      <div class="trn-page-row ${page.id === this.state.selectedPageId ? "selected" : ""}" data-page-id="${escapeAttr(page.id)}">
        <button class="trn-page-button" data-action="select-page" title="Open page">${escapeHtml(page.title)}</button>
        <button class="trn-icon-button" data-action="page-up" title="Move page up">^</button>
        <button class="trn-icon-button" data-action="page-down" title="Move page down">v</button>
      </div>
    `).join("");
  }

  renderEditor() {
    const editor = this.root.querySelector('[data-role="editor"]');
    const page = this.selectedPage();
    if (!page) {
      editor.innerHTML = `<div class="trn-empty">Create a page to start collecting research.</div>`;
      return;
    }
    const blocks = this.blocksForPage(page.id);
    editor.innerHTML = `
      <div class="trn-page-head">
        <input class="trn-page-title-input" data-role="page-title" value="${escapeAttr(page.title)}" />
        <div class="trn-block-add">
          ${Object.values(BLOCK_TYPES).map((type) => `<button class="trn-button" data-action="add-block" data-type="${type}">${labelForType(type)}</button>`).join("")}
        </div>
      </div>
      <div class="trn-blocks" data-role="blocks">
        ${blocks.map((block) => this.renderBlock(block)).join("")}
      </div>
    `;
  }

  renderBlock(block) {
    return `
      <article class="trn-block" data-block-id="${escapeAttr(block.id)}" data-type="${escapeAttr(block.type)}">
        <div class="trn-block-toolbar">
          <span>${labelForType(block.type)}</span>
          <button class="trn-icon-button" data-action="block-up" title="Move block up">^</button>
          <button class="trn-icon-button" data-action="block-down" title="Move block down">v</button>
          <button class="trn-icon-button danger" data-action="delete-block" title="Delete block">x</button>
        </div>
        ${this.renderBlockBody(block)}
      </article>
    `;
  }

  renderBlockBody(block) {
    const c = block.content || {};
    switch (block.type) {
      case BLOCK_TYPES.heading:
        return `<input class="trn-heading-input" data-field="text" value="${escapeAttr(c.text)}" placeholder="Heading" />`;
      case BLOCK_TYPES.quote:
        return `<textarea class="trn-textarea quote" data-field="text" placeholder="Quote">${escapeHtml(c.text)}</textarea>
          <input class="trn-input" data-field="attribution" value="${escapeAttr(c.attribution)}" placeholder="Attribution" />
          <input class="trn-input" data-field="sourceUrl" value="${escapeAttr(c.sourceUrl)}" placeholder="Source URL" />`;
      case BLOCK_TYPES.list:
        return `<div class="trn-list-items">
          ${(c.items || []).map((item) => `<div class="trn-list-item" data-item-id="${escapeAttr(item.id)}"><input class="trn-input" data-list-item="${escapeAttr(item.id)}" value="${escapeAttr(item.text)}" /></div>`).join("")}
          <button class="trn-button" data-action="add-list-item">Add item</button>
        </div>`;
      case BLOCK_TYPES.table:
        return `<div class="trn-table-wrap"><table class="trn-table">
          <thead><tr>${(c.columns || []).map((col) => `<th><input data-table-col="${escapeAttr(col.id)}" value="${escapeAttr(col.label)}" /></th>`).join("")}<th></th></tr></thead>
          <tbody>${(c.rows || []).map((row) => `<tr data-row-id="${escapeAttr(row.id)}">${(c.columns || []).map((col) => `<td><input data-table-cell="${escapeAttr(row.id)}:${escapeAttr(col.id)}" value="${escapeAttr(row.cells?.[col.id] || "")}" /></td>`).join("")}<td><button class="trn-icon-button" data-action="delete-row">x</button></td></tr>`).join("")}</tbody>
        </table></div><button class="trn-button" data-action="add-row">Add row</button><button class="trn-button" data-action="add-column">Add column</button>`;
      case BLOCK_TYPES.code:
        return `<input class="trn-input" data-field="language" value="${escapeAttr(c.language)}" placeholder="Language" />
          <textarea class="trn-textarea code" data-field="text" spellcheck="false">${escapeHtml(c.text)}</textarea>`;
      case BLOCK_TYPES.sourceLink:
        return `<div class="trn-source-grid">
          <input class="trn-input" data-field="url" value="${escapeAttr(c.url)}" placeholder="URL" />
          <input class="trn-input" data-field="title" value="${escapeAttr(c.title)}" placeholder="Title" />
          <input class="trn-input" data-field="note" value="${escapeAttr(c.note)}" placeholder="Note" />
          <textarea class="trn-textarea" data-field="capturedText" placeholder="Captured text">${escapeHtml(c.capturedText)}</textarea>
          ${c.url ? `<a class="trn-source-link" href="${escapeAttr(safeUrl(c.url))}" target="_blank" rel="noreferrer">Open ${escapeHtml(c.domain || deriveDomain(c.url) || "source")}</a>` : ""}
        </div>`;
      case BLOCK_TYPES.paragraph:
        return `<textarea class="trn-textarea" data-field="text" placeholder="Write a note">${escapeHtml(c.text)}</textarea>`;
      default:
        return `<div class="trn-unsupported">Unsupported block type: ${escapeHtml(block.type)}<pre>${escapeHtml(JSON.stringify(block.content, null, 2))}</pre></div>`;
    }
  }

  renderSearchResults() {
    const box = this.root.querySelector('[data-role="search-results"]');
    if (!this.state.searchResults.length) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = `<div class="trn-search-results">${this.state.searchResults.map((result) => `
      <button class="trn-search-result" data-action="open-search-result" data-page-id="${escapeAttr(result.pageId)}" data-block-id="${escapeAttr(result.blockId || "")}">
        <strong>${escapeHtml(result.pageTitle)}</strong>
        <span>${escapeHtml(result.rawPreview || result.kind)}</span>
      </button>
    `).join("")}</div>`;
  }

  renderStatus() {
    const status = this.root.querySelector('[data-role="status"]');
    if (status) status.textContent = `${this.state.status.state}: ${this.state.status.detail}`;
  }

  renderError() {
    const error = this.root.querySelector('[data-role="error"]');
    error.innerHTML = this.state.error ? `<div class="trn-error">${escapeHtml(this.state.error)}</div>` : "";
  }

  async handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "new-page") await this.createPage(prompt("Page title", "New research page") || "New research page");
    if (action === "select-page") await this.selectPage(button.closest("[data-page-id]").dataset.pageId);
    if (action === "add-block") await this.addBlock(button.dataset.type);
    if (action === "delete-block") await this.deleteBlock(button.closest("[data-block-id]").dataset.blockId);
    if (action === "block-up" || action === "block-down") await this.moveBlock(button.closest("[data-block-id]").dataset.blockId, action === "block-up" ? -1 : 1);
    if (action === "page-up" || action === "page-down") await this.movePage(button.closest("[data-page-id]").dataset.pageId, action === "page-up" ? -1 : 1);
    if (action === "add-list-item") this.addListItem(button.closest("[data-block-id]").dataset.blockId);
    if (action === "add-row") this.addTableRow(button.closest("[data-block-id]").dataset.blockId);
    if (action === "add-column") this.addTableColumn(button.closest("[data-block-id]").dataset.blockId);
    if (action === "delete-row") this.deleteTableRow(button.closest("[data-block-id]").dataset.blockId, button.closest("[data-row-id]").dataset.rowId);
    if (action === "export-md") await this.exportMarkdown();
    if (action === "export-json") await this.exportJson();
    if (action === "clear-search") this.clearSearch();
    if (action === "open-search-result") await this.openSearchResult(button.dataset.pageId, button.dataset.blockId);
  }

  handleInput(event) {
    const target = event.target;
    if (target.matches('[data-role="search"]')) {
      this.search(target.value);
      return;
    }
    if (target.matches('[data-role="page-title"]')) {
      const page = this.selectedPage();
      page.title = target.value;
      page.updatedAt = nowIso();
      this.storage.savePageDebounced(page);
      this.renderPages();
      return;
    }
    const blockEl = target.closest("[data-block-id]");
    if (!blockEl) return;
    const block = this.findBlock(blockEl.dataset.blockId);
    if (!block) return;
    this.applyBlockInput(block, target);
    block.updatedAt = nowIso();
    this.storage.saveBlockDebounced(block);
  }

  handleChange(event) {
    if (event.target.matches("[data-field], [data-list-item], [data-table-cell], [data-table-col]")) this.handleInput(event);
  }

  async handleBlur(event) {
    if (event.target.matches("input, textarea")) await this.storage.flush().catch((error) => this.state.error = error.message);
  }

  async handlePaste(event) {
    const blocksContainer = event.target.closest('[data-role="blocks"]');
    const blockEl = event.target.closest("[data-block-id]");
    if (!blocksContainer && !blockEl) return;
    const page = this.selectedPage();
    if (!page) return;
    const html = event.clipboardData?.getData("text/html") || "";
    const text = event.clipboardData?.getData("text/plain") || "";
    if (!html && !text) return;
    event.preventDefault();
    const newBlocks = blocksFromClipboard({ pageId: page.id, html, text });
    const current = this.blocksForPage(page.id);
    const insertAt = blockEl ? current.findIndex((block) => block.id === blockEl.dataset.blockId) + 1 : current.length;
    current.splice(insertAt, 0, ...newBlocks);
    current.forEach((block, index) => block.sortOrder = (index + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== page.id).concat(current);
    await this.storage.request("replaceBlocks", { pageId: page.id, blocks: current });
    this.renderEditor();
  }

  applyBlockInput(block, target) {
    const c = block.content;
    if (target.dataset.field) {
      c[target.dataset.field] = target.value;
      if (block.type === BLOCK_TYPES.sourceLink && target.dataset.field === "url") c.domain = deriveDomain(target.value);
    }
    if (target.dataset.listItem) {
      const item = c.items.find((entry) => entry.id === target.dataset.listItem);
      if (item) item.text = target.value;
    }
    if (target.dataset.tableCol) {
      const col = c.columns.find((entry) => entry.id === target.dataset.tableCol);
      if (col) col.label = target.value;
    }
    if (target.dataset.tableCell) {
      const [rowId, colId] = target.dataset.tableCell.split(":");
      const row = c.rows.find((entry) => entry.id === rowId);
      if (row) row.cells[colId] = target.value;
    }
  }

  async createPage(title) {
    const page = createPage({ title, sortOrder: (this.state.pages.length + 1) * 1000 });
    const block = createBlock({ pageId: page.id, type: BLOCK_TYPES.paragraph, content: { text: "" } });
    await this.storage.request("createPage", { page, blocks: [block] });
    this.state.pages.push(page);
    this.state.blocks.push(block);
    this.state.selectedPageId = page.id;
    this.render();
  }

  async selectPage(pageId) {
    await this.storage.flush();
    this.state.selectedPageId = pageId;
    await this.storage.request("setSetting", { key: "selectedPageId", value: pageId });
    this.render();
  }

  async addBlock(type) {
    const page = this.selectedPage();
    const block = createBlock({ pageId: page.id, type, sortOrder: (this.blocksForPage(page.id).length + 1) * 1000 });
    this.state.blocks.push(block);
    await this.storage.request("updateBlock", { block });
    this.renderEditor();
  }

  async deleteBlock(blockId) {
    this.state.blocks = this.state.blocks.filter((block) => block.id !== blockId);
    await this.storage.request("deleteBlock", { blockId });
    this.renderEditor();
  }

  async moveBlock(blockId, direction) {
    const page = this.selectedPage();
    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((block) => block.id === blockId);
    const swap = index + direction;
    if (swap < 0 || swap >= blocks.length) return;
    [blocks[index], blocks[swap]] = [blocks[swap], blocks[index]];
    blocks.forEach((block, order) => block.sortOrder = (order + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== page.id).concat(blocks);
    await this.storage.request("reorderBlocks", { blocks });
    this.renderEditor();
  }

  async movePage(pageId, direction) {
    const pages = sortByOrder(this.state.pages);
    const index = pages.findIndex((page) => page.id === pageId);
    const swap = index + direction;
    if (swap < 0 || swap >= pages.length) return;
    [pages[index], pages[swap]] = [pages[swap], pages[index]];
    pages.forEach((page, order) => page.sortOrder = (order + 1) * 1000);
    this.state.pages = pages;
    await this.storage.request("reorderPages", { pages });
    this.renderPages();
  }

  addListItem(blockId) {
    const block = this.findBlock(blockId);
    block.content.items.push({ id: crypto.randomUUID(), text: "" });
    this.storage.saveBlockDebounced(block);
    this.renderEditor();
  }

  addTableRow(blockId) {
    const block = this.findBlock(blockId);
    block.content.rows.push({ id: crypto.randomUUID(), cells: Object.fromEntries(block.content.columns.map((col) => [col.id, ""])) });
    this.storage.saveBlockDebounced(block);
    this.renderEditor();
  }

  addTableColumn(blockId) {
    const block = this.findBlock(blockId);
    const col = { id: crypto.randomUUID(), label: `Column ${block.content.columns.length + 1}` };
    block.content.columns.push(col);
    block.content.rows.forEach((row) => row.cells[col.id] = "");
    this.storage.saveBlockDebounced(block);
    this.renderEditor();
  }

  deleteTableRow(blockId, rowId) {
    const block = this.findBlock(blockId);
    block.content.rows = block.content.rows.filter((row) => row.id !== rowId);
    if (!block.content.rows.length) this.addTableRow(blockId);
    this.storage.saveBlockDebounced(block);
    this.renderEditor();
  }

  async search(query) {
    if (!query.trim()) {
      this.state.searchResults = [];
      this.renderSearchResults();
      return;
    }
    this.state.searchResults = await this.storage.request("search", { query });
    this.renderSearchResults();
  }

  clearSearch() {
    this.root.querySelector('[data-role="search"]').value = "";
    this.state.searchResults = [];
    this.renderSearchResults();
  }

  async openSearchResult(pageId, blockId) {
    await this.selectPage(pageId);
    if (blockId) requestAnimationFrame(() => this.root.querySelector(`[data-block-id="${CSS.escape(blockId)}"]`)?.scrollIntoView({ block: "center" }));
  }

  async exportMarkdown() {
    await this.storage.flush();
    const page = this.selectedPage();
    downloadText(filenameForPage(page, "md"), pageToMarkdown(page, this.blocksForPage(page.id)), "text/markdown");
  }

  async exportJson() {
    await this.storage.flush();
    const workspace = await this.storage.request("exportWorkspace");
    downloadText("topic-research-notepad-backup.json", JSON.stringify(workspaceToBackup(workspace), null, 2), "application/json");
  }

  selectedPage() {
    return this.state.pages.find((page) => page.id === this.state.selectedPageId) || this.state.pages[0] || null;
  }

  blocksForPage(pageId) {
    return sortByOrder(this.state.blocks.filter((block) => block.pageId === pageId && !block.deletedAt));
  }

  findBlock(blockId) {
    return this.state.blocks.find((block) => block.id === blockId);
  }

  bindLifecycleFlush() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.storage.flush();
    });
    window.addEventListener("pagehide", () => this.storage.flush());
  }
}

function labelForType(type) {
  return {
    paragraph: "Paragraph",
    heading: "Heading",
    quote: "Quote",
    list: "List",
    table: "Table",
    code: "Code",
    sourceLink: "Source",
  }[type] || type;
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}
