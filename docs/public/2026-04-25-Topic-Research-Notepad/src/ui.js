import { BLOCK_TYPES } from "./constants.js";
import { createBlock, createId, createPage, deriveDomain, normalizeBlock, normalizePage, nowIso, sortByOrder } from "./models.js";
import { blocksFromClipboard } from "./paste.js";
import { downloadText, filenameForPage, pageToMarkdown, workspaceToBackup } from "./exporters.js";
import { createLogger, normalizeError } from "./observability/logger.js";
import { BLOCK_TRANSFORMS, transformBlock } from "./block-transforms.js";
import { normalizeRichTextContent, sanitizeInlineHtml } from "./rich-text.js";

const logger = createLogger("UI");
const searchLogger = createLogger("Search", "UI");
const exportLogger = createLogger("Export", "UI");

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
      focusedBlockId: "",
      keyboardCreatedEmptyBlockId: "",
      sidebarWidth: 280,
      slash: null,
    };
    this.searchRun = 0;
    this.undoStack = [];
    this.storage.addEventListener("save-status", (event) => {
      this.state.status = event.detail;
      this.renderStatus();
    });
  }

  async start() {
    logger.info("App start requested");
    this.renderShell();
    try {
      await this.storage.hello();
      const workspace = await this.storage.request("loadWorkspace");
      logger.info("Workspace loaded", { context: { pageCount: workspace.pages.length, blockCount: workspace.blocks.length, selectedPageId: workspace.settings.selectedPageId } });
      this.state.pages = workspace.pages.map(normalizePage);
      this.state.blocks = workspace.blocks.map(normalizeBlock);
      this.state.selectedPageId = workspace.settings.selectedPageId || this.state.pages[0]?.id || null;
      this.state.sidebarWidth = normalizeSidebarWidth(workspace.settings.sidebarWidth);
      if (!this.state.pages.length) await this.createPage("Auth library comparison");
      this.state.status = { state: "saved", detail: "Local storage ready" };
      this.render();
      this.bindLifecycleFlush();
      logger.info("App start completed", { context: this.getRuntimeSnapshot() });
    } catch (error) {
      logger.error("App start failed", { context: { error: normalizeError(error) } });
      this.state.error = error.message;
      this.state.status = { state: "failed", detail: "Storage unavailable" };
      this.render();
    }
  }

  renderShell() {
    this.root.innerHTML = `
      <awwbookmarklet-app-shell class="trn-shell">
        <awwbookmarklet-titlebar slot="title" value="Topic Research Notepad"></awwbookmarklet-titlebar>
        <awwbookmarklet-toolbar slot="status" class="trn-commandbar" wrap density="compact">
          <div class="trn-commandbar-primary">
            <awwbookmarklet-button class="trn-button primary" variant="primary" data-action="new-page">New Page</awwbookmarklet-button>
            <awwbookmarklet-button class="trn-button" data-action="undo-structural" title="Undo last block move or delete">Undo</awwbookmarklet-button>
          </div>
          <div class="trn-commandbar-search" role="search" aria-label="Search local notes">
            <input class="trn-input" type="search" data-role="search" placeholder="Search local notes" />
            <awwbookmarklet-button class="trn-button" data-action="clear-search">Clear search</awwbookmarklet-button>
          </div>
          <div class="trn-commandbar-secondary">
            <awwbookmarklet-button class="trn-button" data-action="export-md">Export MD</awwbookmarklet-button>
            <awwbookmarklet-button class="trn-button" data-action="export-json">Backup JSON</awwbookmarklet-button>
          </div>
        </awwbookmarklet-toolbar>
        <main slot="body" class="trn-main">
          <awwbookmarklet-split-pane class="trn-layout-split" direction="horizontal" value="${this.state.sidebarWidth}" min-start="180" min-end="420" aria-label="Resize page sidebar">
          <awwbookmarklet-panel slot="start" class="trn-sidebar">
            <div slot="title">Pages</div>
            <div data-role="page-list"></div>
          </awwbookmarklet-panel>
          <awwbookmarklet-panel slot="end" class="trn-editor-panel">
            <div data-role="error"></div>
            <div data-role="search-results"></div>
            <div data-role="editor"></div>
          </awwbookmarklet-panel>
          </awwbookmarklet-split-pane>
        </main>
        <awwbookmarklet-statusbar slot="footer" class="trn-statusbar">
          <span data-role="status" aria-live="polite"></span>
        </awwbookmarklet-statusbar>
      </awwbookmarklet-app-shell>
    `;
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.root.addEventListener("keydown", (event) => this.handleKeydown(event));
    this.root.addEventListener("compositionstart", (event) => this.handleComposition(event, true));
    this.root.addEventListener("compositionend", (event) => this.handleComposition(event, false));
    this.root.addEventListener("blur", (event) => this.handleBlur(event), true);
    this.root.addEventListener("paste", (event) => this.handlePaste(event));
    this.root.addEventListener("awwbookmarklet-split-pane-resize-commit", (event) => this.handleSidebarResizeCommit(event));
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
        <awwbookmarklet-button class="trn-page-button" data-action="select-page" title="${escapeAttr(page.title)}" aria-label="Open page: ${escapeAttr(page.title)}">${escapeHtml(page.title)}</awwbookmarklet-button>
        <div class="trn-page-actions" aria-label="Page actions">
        <awwbookmarklet-button class="trn-icon-button" data-action="page-up" title="Move page up" aria-label="Move page up">&#8593;</awwbookmarklet-button>
        <awwbookmarklet-button class="trn-icon-button" data-action="page-down" title="Move page down" aria-label="Move page down">&#8595;</awwbookmarklet-button>
        </div>
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
        <awwbookmarklet-toolbar class="trn-block-add" wrap density="compact" aria-label="Add content block">
          ${Object.values(BLOCK_TYPES).map((type) => `<awwbookmarklet-button class="trn-button" data-action="add-block" data-type="${type}">${labelForType(type)}</awwbookmarklet-button>`).join("")}
        </awwbookmarklet-toolbar>
      </div>
      <div class="trn-blocks" data-role="blocks">
        ${blocks.map((block) => this.renderBlock(block)).join("")}
      </div>
      <button class="trn-document-end-insert" data-action="add-paragraph-end" type="button">+ Add paragraph</button>
      <div class="trn-pastebin" data-role="pastebin" contenteditable="true" aria-hidden="true"></div>
      <div class="trn-slash-menu" data-role="slash-menu" hidden></div>
    `;
  }

  renderBlock(block) {
    return `
      <article class="trn-block ${block.id === this.state.focusedBlockId ? "is-focused" : ""}" data-block-id="${escapeAttr(block.id)}" data-type="${escapeAttr(block.type)}">
        <div class="trn-block-toolbar">
          <span class="trn-block-type-label">${labelForType(block.type)}</span>
          <awwbookmarklet-button class="trn-icon-button" data-action="block-up" title="Move block up" aria-label="Move block up">&#8593;</awwbookmarklet-button>
          <awwbookmarklet-button class="trn-icon-button" data-action="block-down" title="Move block down" aria-label="Move block down">&#8595;</awwbookmarklet-button>
          ${this.renderTransformMenu(block)}
          <awwbookmarklet-button class="trn-del-button" data-action="delete-block" title="Delete block" aria-label="Delete block">DEL</awwbookmarklet-button>
        </div>
        ${this.renderBlockBody(block)}
      </article>
    `;
  }

  renderTransformMenu(block) {
    const targets = validTransformsFor(block.type);
    if (!targets.length) return "";
    return `<details class="trn-transform-menu">
      <summary title="Turn block into another type" aria-label="Turn block into another type">Turn into</summary>
      <div class="trn-transform-options">
        ${targets.map((type) => `<button type="button" data-action="transform-block" data-type="${escapeAttr(type)}"> ${escapeHtml(labelForType(type))}</button>`).join("")}
      </div>
    </details>`;
  }

  renderBlockBody(block) {
    const c = block.content || {};
    switch (block.type) {
      case BLOCK_TYPES.heading:
        return richTextEditable(block, "heading", "Heading");
      case BLOCK_TYPES.quote:
        return `<textarea class="trn-textarea quote" data-field="text" placeholder="Quote">${escapeHtml(c.text)}</textarea>
          <input class="trn-input" data-field="attribution" value="${escapeAttr(c.attribution)}" placeholder="Attribution" />
          <input class="trn-input" data-field="sourceUrl" value="${escapeAttr(c.sourceUrl)}" placeholder="Source URL" />`;
      case BLOCK_TYPES.list:
        return `<div class="trn-list-items">
          ${(c.items || []).map((item) => `<div class="trn-list-item" data-item-id="${escapeAttr(item.id)}"><input class="trn-list-input" data-list-item="${escapeAttr(item.id)}" value="${escapeAttr(item.text)}" aria-label="List item" /></div>`).join("")}
          <awwbookmarklet-button class="trn-button trn-add-list-item" data-action="add-list-item">+ item</awwbookmarklet-button>
        </div>`;
      case BLOCK_TYPES.table:
        return `<div class="trn-table-wrap"><table class="trn-table">
          <thead><tr>${(c.columns || []).map((col) => `<th><input data-table-col="${escapeAttr(col.id)}" value="${escapeAttr(col.label)}" /></th>`).join("")}<th></th></tr></thead>
          <tbody>${(c.rows || []).map((row) => `<tr data-row-id="${escapeAttr(row.id)}">${(c.columns || []).map((col) => `<td><input data-table-cell="${escapeAttr(row.id)}:${escapeAttr(col.id)}" value="${escapeAttr(row.cells?.[col.id] || "")}" /></td>`).join("")}<td><awwbookmarklet-button class="trn-icon-button danger" tone="danger" data-action="delete-row" aria-label="Delete row">&times;</awwbookmarklet-button></td></tr>`).join("")}</tbody>
        </table></div><awwbookmarklet-toolbar class="trn-table-actions" wrap density="compact"><awwbookmarklet-button class="trn-button" data-action="add-row">Add row</awwbookmarklet-button><awwbookmarklet-button class="trn-button" data-action="add-column">Add column</awwbookmarklet-button></awwbookmarklet-toolbar>`;
      case BLOCK_TYPES.code:
        return `<input class="trn-input" data-field="language" value="${escapeAttr(c.language)}" placeholder="Language" />
          <textarea class="trn-textarea code" data-field="text" spellcheck="false">${escapeHtml(c.text)}</textarea>`;
      case BLOCK_TYPES.sourceLink:
        return `<details class="trn-source-details">
          <summary>
            <span class="trn-source-title">${escapeHtml(c.title || c.domain || c.url || "Untitled source")}</span>
            <span class="trn-source-domain">${escapeHtml(c.domain || deriveDomain(c.url) || "")}</span>
            ${c.url ? `<a class="trn-source-link" href="${escapeAttr(safeUrl(c.url))}" target="_blank" rel="noreferrer">Open</a>` : ""}
          </summary>
          ${c.note ? `<p class="trn-source-note">${escapeHtml(c.note)}</p>` : ""}
          <div class="trn-source-grid">
            <input class="trn-input" data-field="url" value="${escapeAttr(c.url)}" placeholder="URL" />
            <input class="trn-input" data-field="title" value="${escapeAttr(c.title)}" placeholder="Title" />
            <input class="trn-input" data-field="note" value="${escapeAttr(c.note)}" placeholder="Note" />
            <textarea class="trn-textarea" data-field="capturedText" placeholder="Captured text">${escapeHtml(c.capturedText)}</textarea>
          </div>
        </details>`;
      case BLOCK_TYPES.paragraph:
        return richTextEditable(block, "paragraph", "Write a note");
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
    if (status) {
      status.textContent = statusText(this.state.status);
      status.dataset.state = this.state.status.state;
    }
  }

  renderError() {
    const error = this.root.querySelector('[data-role="error"]');
    error.innerHTML = this.state.error ? `<div class="trn-error">${escapeHtml(this.state.error)}</div>` : "";
  }

  async handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    logger.debug("UI action received", { context: { action } });
    try {
      if (action === "new-page") await this.createPage(this.uniqueNewPageTitle(), { focusTitle: true });
      if (action === "select-page") await this.selectPage(button.closest("[data-page-id]").dataset.pageId);
      if (action === "add-block") await this.addBlock(button.dataset.type);
      if (action === "add-paragraph-end") await this.addParagraphAtEnd();
      if (action === "delete-block") await this.deleteBlock(button.closest("[data-block-id]").dataset.blockId);
      if (action === "block-up" || action === "block-down") await this.moveBlock(button.closest("[data-block-id]").dataset.blockId, action === "block-up" ? -1 : 1);
      if (action === "transform-block") await this.transformActiveBlock(button.closest("[data-block-id]").dataset.blockId, button.dataset.type);
      if (action === "page-up" || action === "page-down") await this.movePage(button.closest("[data-page-id]").dataset.pageId, action === "page-up" ? -1 : 1);
      if (action === "add-list-item") this.addListItem(button.closest("[data-block-id]").dataset.blockId);
      if (action === "add-row") this.addTableRow(button.closest("[data-block-id]").dataset.blockId);
      if (action === "add-column") this.addTableColumn(button.closest("[data-block-id]").dataset.blockId);
      if (action === "delete-row") this.deleteTableRow(button.closest("[data-block-id]").dataset.blockId, button.closest("[data-row-id]").dataset.rowId);
      if (action === "slash-command") await this.applySlashCommand(button.dataset.command);
      if (action === "export-md") await this.exportMarkdown();
      if (action === "export-json") await this.exportJson();
      if (action === "clear-search") this.clearSearch();
      if (action === "open-search-result") await this.openSearchResult(button.dataset.pageId, button.dataset.blockId);
      if (action === "undo-structural") await this.undoStructural();
    } catch (error) {
      logger.error("UI action failed", { context: { action, error: normalizeError(error) } });
      this.showError(error);
    }
  }

  handleInput(event) {
    const target = event.target;
    if (target.matches('[data-role="search"]')) {
      searchLogger.debug("Search input changed", { context: { length: target.value.length } });
      this.search(target.value);
      return;
    }
    if (target.matches('[data-role="page-title"]')) {
      const page = this.selectedPage();
      page.title = target.value;
      page.updatedAt = nowIso();
      logger.debug("Page title edited", { context: { pageId: page.id, titleLength: target.value.length } });
      this.queuePageSave(page);
      this.renderPages();
      return;
    }
    const blockEl = target.closest("[data-block-id]");
    if (!blockEl) return;
    const block = this.findBlock(blockEl.dataset.blockId);
    if (!block) return;
    this.applyBlockInput(block, target);
    block.updatedAt = nowIso();
    if (target.matches("[data-rich-text]") && block.id === this.state.keyboardCreatedEmptyBlockId && block.content.text.trim()) {
      this.state.keyboardCreatedEmptyBlockId = "";
    }
    logger.debug("Block edit detected", { context: { blockId: block.id, pageId: block.pageId, type: block.type, field: target.dataset.field || target.dataset.listItem || target.dataset.tableCell || target.dataset.tableCol || target.dataset.richText } });
    this.queueBlockSave(block);
    if (target.matches("[data-rich-text]")) this.updateSlashMenu(target, block);
  }

  handleChange(event) {
    if (event.target.matches("[data-field], [data-list-item], [data-table-cell], [data-table-col]")) this.handleInput(event);
  }

  async handleBlur(event) {
    if (event.target.matches("input, textarea, [contenteditable='true']")) {
      await this.storage.flush().catch((error) => {
        this.showError(error);
      });
    }
  }

  async handleSidebarResizeCommit(event) {
    if (!event.target.matches("awwbookmarklet-split-pane")) return;
    const value = normalizeSidebarWidth(event.detail.value);
    this.state.sidebarWidth = value;
    logger.info("Sidebar width resize committed", { context: { value } });
    await this.storage.request("setSetting", { key: "sidebarWidth", value }).catch((error) => this.showError(error));
  }

  handleComposition(event, composing) {
    const editable = event.target.closest("[data-rich-text]");
    if (editable) editable.dataset.composing = composing ? "true" : "false";
  }

  async handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !isTextEditingTarget(event.target)) {
      event.preventDefault();
      await this.undoStructural();
      return;
    }
    const editable = event.target.closest("[data-rich-text]");
    if (!editable) return;
    if (this.state.slash?.open) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.closeSlashMenu("escape");
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        this.moveSlashSelection(event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        await this.applySlashCommand(this.state.slash.commands[this.state.slash.index]?.command);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey && editable.dataset.richText === "paragraph") {
      event.preventDefault();
      await this.splitParagraphBlock(editable);
      return;
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      await this.handleRichTextArrowNavigation(event, editable);
    }
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
    logger.info("Paste event received", { context: { hasHtml: Boolean(html), hasText: Boolean(text), textLength: text.length, htmlLength: html.length } });
    const editable = event.target.closest("[data-rich-text]");
    if (editable && !looksLikeMultiBlockPaste(html, text)) {
      this.captureBodyguardPaste(html || text);
      const inlineHtml = sanitizeInlineHtml(html || textToHtml(text));
      document.execCommand("insertHTML", false, inlineHtml);
      const block = this.findBlock(blockEl.dataset.blockId);
      if (block) {
        this.applyBlockInput(block, editable);
        block.updatedAt = nowIso();
        this.queueBlockSave(block);
        logger.info("Sanitized inline paste inserted", { context: { blockId: block.id, htmlLength: inlineHtml.length } });
      }
      this.clearBodyguardPaste();
      return;
    }
    this.captureBodyguardPaste(html || text);
    const newBlocks = blocksFromClipboard({ pageId: page.id, html, text });
    logger.info("Paste converted to blocks", { context: { pageId: page.id, blockCount: newBlocks.length, byType: countByType(newBlocks) } });
    const current = this.blocksForPage(page.id);
    const insertAt = blockEl ? current.findIndex((block) => block.id === blockEl.dataset.blockId) + 1 : current.length;
    current.splice(insertAt, 0, ...newBlocks);
    current.forEach((block, index) => block.sortOrder = (index + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== page.id).concat(current);
    await this.storage.request("replaceBlocks", { pageId: page.id, blocks: current });
    logger.info("Pasted blocks persisted", { context: { pageId: page.id, totalBlockCount: current.length } });
    this.clearBodyguardPaste();
    this.renderEditor();
  }

  applyBlockInput(block, target) {
    const c = block.content;
    if (target.dataset.richText) {
      const normalized = normalizeRichTextContent({ html: sanitizeInlineHtml(target.innerHTML) });
      block.content = { ...c, ...normalized };
      return;
    }
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

  async createPage(title, options = {}) {
    const page = createPage({ title, sortOrder: (this.state.pages.length + 1) * 1000 });
    const block = createBlock({ pageId: page.id, type: BLOCK_TYPES.paragraph, content: { text: "" } });
    logger.info("Creating page", { context: { title, pageId: page.id, initialBlockId: block.id } });
    await this.storage.request("createPage", { page, blocks: [block] });
    this.state.pages.push(page);
    this.state.blocks.push(block);
    this.state.selectedPageId = page.id;
    this.render();
    if (options.focusTitle) requestAnimationFrame(() => this.focusPageTitle({ select: true }));
    logger.info("Page created", { context: { pageId: page.id, blockCount: 1 } });
  }

  uniqueNewPageTitle() {
    const base = "New research page";
    const titles = new Set(this.state.pages.map((page) => page.title.trim()));
    if (!titles.has(base)) return base;
    let counter = 2;
    while (titles.has(`${base} ${counter}`)) counter += 1;
    return `${base} ${counter}`;
  }

  async selectPage(pageId) {
    await this.storage.flush();
    this.state.selectedPageId = pageId;
    await this.storage.request("setSetting", { key: "selectedPageId", value: pageId });
    this.render();
    logger.info("Page selected", { context: { pageId } });
  }

  async addBlock(type) {
    const page = this.selectedPage();
    const block = createBlock({ pageId: page.id, type, sortOrder: (this.blocksForPage(page.id).length + 1) * 1000 });
    logger.info("Adding block", { context: { pageId: page.id, blockId: block.id, type } });
    this.state.blocks.push(block);
    await this.storage.request("updateBlock", { block });
    this.renderEditor();
    return block;
  }

  async addParagraphAtEnd(options = {}) {
    const block = await this.addBlock(BLOCK_TYPES.paragraph);
    if (options.fromKeyboard) this.state.keyboardCreatedEmptyBlockId = block.id;
    requestAnimationFrame(() => this.focusBlock(block?.id, "start"));
    return block;
  }

  async splitParagraphBlock(editable) {
    const blockEl = editable.closest("[data-block-id]");
    const block = this.findBlock(blockEl?.dataset.blockId);
    const page = this.selectedPage();
    if (!block || !page) return;
    this.applyBlockInput(block, editable);
    block.updatedAt = nowIso();
    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((entry) => entry.id === block.id);
    const next = createBlock({ pageId: page.id, type: BLOCK_TYPES.paragraph, sortOrder: (index + 2) * 1000 });
    blocks.splice(index + 1, 0, next);
    blocks.forEach((entry, order) => entry.sortOrder = (order + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((entry) => entry.pageId !== page.id).concat(blocks);
    logger.info("Paragraph split into new block", { context: { blockId: block.id, nextBlockId: next.id, pageId: page.id } });
    await this.storage.request("replaceBlocks", { pageId: page.id, blocks });
    this.renderEditor();
    requestAnimationFrame(() => this.focusBlock(next.id));
  }

  async deleteBlock(blockId) {
    const block = this.findBlock(blockId);
    if (!block) return;
    this.pushBlockUndo(block.pageId, "deleteBlock");
    this.state.blocks = this.state.blocks.filter((entry) => entry.id !== blockId);
    logger.info("Deleting block", { context: { blockId } });
    await this.storage.request("deleteBlock", { blockId });
    this.renderEditor();
  }

  async moveBlock(blockId, direction) {
    const page = this.selectedPage();
    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((block) => block.id === blockId);
    const swap = index + direction;
    if (swap < 0 || swap >= blocks.length) return;
    this.pushBlockUndo(page.id, "moveBlock");
    [blocks[index], blocks[swap]] = [blocks[swap], blocks[index]];
    blocks.forEach((block, order) => block.sortOrder = (order + 1) * 1000);
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== page.id).concat(blocks);
    logger.info("Moving block", { context: { blockId, pageId: page.id, direction } });
    await this.storage.request("reorderBlocks", { blocks });
    this.renderEditor();
  }

  async transformActiveBlock(blockId, type) {
    const block = this.findBlock(blockId);
    if (!block || block.type === type) return;
    this.pushBlockUndo(block.pageId, "transformBlock");
    transformBlock(block, type);
    block.updatedAt = nowIso();
    logger.info("Transforming block from local menu", { context: { blockId, type } });
    await this.storage.request("updateBlock", { block });
    this.renderEditor();
    requestAnimationFrame(() => this.focusBlock(block.id));
  }

  async handleRichTextArrowNavigation(event, editable) {
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const atBoundary = direction > 0 ? isCaretOnLastVisualLine(editable) : isCaretOnFirstVisualLine(editable);
    if (!atBoundary) return;

    const blockEl = editable.closest("[data-block-id]");
    const blockId = blockEl?.dataset.blockId;
    const page = this.selectedPage();
    if (!blockId || !page) return;

    const blocks = this.blocksForPage(page.id);
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index < 0) return;

    if (direction < 0) {
      const previous = blocks[index - 1];
      if (!previous) return;
      event.preventDefault();
      this.focusBlock(previous.id, "end");
      return;
    }

    const next = blocks[index + 1];
    if (next) {
      event.preventDefault();
      this.focusBlock(next.id, "start");
      return;
    }

    const current = blocks[index];
    if (!blockHasText(current) || current.id === this.state.keyboardCreatedEmptyBlockId) return;
    event.preventDefault();
    await this.addParagraphAtEnd({ fromKeyboard: true });
  }

  async movePage(pageId, direction) {
    const pages = sortByOrder(this.state.pages);
    const index = pages.findIndex((page) => page.id === pageId);
    const swap = index + direction;
    if (swap < 0 || swap >= pages.length) return;
    [pages[index], pages[swap]] = [pages[swap], pages[index]];
    pages.forEach((page, order) => page.sortOrder = (order + 1) * 1000);
    this.state.pages = pages;
    logger.info("Moving page", { context: { pageId, direction } });
    await this.storage.request("reorderPages", { pages });
    this.renderPages();
  }

  addListItem(blockId) {
    const block = this.findBlock(blockId);
    if (!block) return;
    block.content.items.push({ id: createId("item"), text: "" });
    this.queueBlockSave(block);
    this.renderEditor();
  }

  addTableRow(blockId) {
    const block = this.findBlock(blockId);
    if (!block) return;
    block.content.rows.push({ id: createId("row"), cells: Object.fromEntries(block.content.columns.map((col) => [col.id, ""])) });
    this.queueBlockSave(block);
    this.renderEditor();
  }

  addTableColumn(blockId) {
    const block = this.findBlock(blockId);
    if (!block) return;
    const col = { id: createId("col"), label: `Column ${block.content.columns.length + 1}` };
    block.content.columns.push(col);
    block.content.rows.forEach((row) => row.cells[col.id] = "");
    this.queueBlockSave(block);
    this.renderEditor();
  }

  deleteTableRow(blockId, rowId) {
    const block = this.findBlock(blockId);
    if (!block) return;
    block.content.rows = block.content.rows.filter((row) => row.id !== rowId);
    if (!block.content.rows.length) {
      block.content.rows.push({ id: createId("row"), cells: Object.fromEntries(block.content.columns.map((col) => [col.id, ""])) });
    }
    this.queueBlockSave(block);
    this.renderEditor();
  }

  pushBlockUndo(pageId, reason) {
    const blocks = this.blocksForPage(pageId).map(cloneRecord);
    this.undoStack.push({ type: "restoreBlocks", pageId, reason, blocks });
    if (this.undoStack.length > 100) this.undoStack.shift();
    logger.debug("Structural undo checkpoint created", { context: { pageId, reason, blockCount: blocks.length, depth: this.undoStack.length } });
  }

  async undoStructural() {
    const entry = this.undoStack.pop();
    if (!entry) {
      logger.debug("Structural undo requested with empty stack");
      return;
    }
    if (entry.type !== "restoreBlocks") return;
    const restored = entry.blocks.map((block, index) => ({ ...cloneRecord(block), deletedAt: null, sortOrder: (index + 1) * 1000, updatedAt: nowIso() }));
    this.state.blocks = this.state.blocks.filter((block) => block.pageId !== entry.pageId).concat(restored);
    await this.storage.request("replaceBlocks", { pageId: entry.pageId, blocks: restored });
    logger.info("Structural undo restored page blocks", { context: { pageId: entry.pageId, reason: entry.reason, blockCount: restored.length } });
    this.renderEditor();
  }

  async search(query) {
    const run = ++this.searchRun;
    if (!query.trim()) {
      this.state.searchResults = [];
      this.renderSearchResults();
      return;
    }
    const results = await this.storage.request("search", { query }).catch((error) => {
      searchLogger.error("Search failed", { context: { query, error: normalizeError(error) } });
      this.showError(error);
      return [];
    });
    if (run !== this.searchRun) return;
    this.state.searchResults = results;
    searchLogger.info("Search completed", { context: { query, resultCount: results.length } });
    this.renderSearchResults();
  }

  clearSearch() {
    this.searchRun++;
    this.root.querySelector('[data-role="search"]').value = "";
    this.state.searchResults = [];
    this.renderSearchResults();
    searchLogger.info("Search cleared");
  }

  async openSearchResult(pageId, blockId) {
    await this.selectPage(pageId);
    this.state.focusedBlockId = blockId || "";
    this.renderEditor();
    searchLogger.info("Search result opened", { context: { pageId, blockId } });
    if (blockId) requestAnimationFrame(() => this.root.querySelector(`[data-block-id="${CSS.escape(blockId)}"]`)?.scrollIntoView({ block: "center" }));
  }

  async exportMarkdown() {
    exportLogger.info("Markdown export requested", { context: { selectedPageId: this.state.selectedPageId } });
    await this.storage.flush();
    const page = this.selectedPage();
    if (!page) return;
    exportLogger.info("Markdown export prepared", { context: { pageId: page.id, blockCount: this.blocksForPage(page.id).length } });
    downloadText(filenameForPage(page, "md"), pageToMarkdown(page, this.blocksForPage(page.id)), "text/markdown");
  }

  async exportJson() {
    exportLogger.info("JSON backup requested");
    await this.storage.flush();
    const workspace = await this.storage.request("exportWorkspace");
    exportLogger.info("JSON backup prepared", { context: { pageCount: workspace.pages.length, blockCount: workspace.blocks.length } });
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

  queuePageSave(page) {
    this.storage.savePageDebounced(page).catch((error) => this.showError(error));
  }

  queueBlockSave(block) {
    this.storage.saveBlockDebounced(block).catch((error) => this.showError(error));
  }

  showError(error) {
    logger.error("User-visible error", { context: { error: normalizeError(error), selectedPageId: this.state.selectedPageId } });
    this.state.error = error?.message || String(error);
    this.renderError();
  }

  updateSlashMenu(editable, block) {
    if (editable.dataset.composing === "true" || block.type !== BLOCK_TYPES.paragraph) return;
    const text = editable.textContent.trim();
    const match = parseSlashCommandText(text);
    if (!match) {
      if (this.state.slash?.open) this.closeSlashMenu("non-command-text");
      return;
    }
    const commands = slashCommands().filter((entry) => entry.command.startsWith(match) || entry.aliases.some((alias) => alias.startsWith(match)));
    if (!commands.length) {
      this.closeSlashMenu("no-match");
      return;
    }
    this.state.slash = { open: true, blockId: block.id, commands, index: 0 };
    logger.debug("Slash command menu opened", { context: { blockId: block.id, fragment: match, commandCount: commands.length } });
    this.renderSlashMenu();
  }

  renderSlashMenu() {
    const menu = this.root.querySelector('[data-role="slash-menu"]');
    if (!menu || !this.state.slash?.open) return;
    const blockEl = this.root.querySelector(`[data-block-id="${CSS.escape(this.state.slash.blockId)}"]`);
    const rect = blockEl?.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    menu.hidden = false;
    menu.style.left = `${Math.max(12, (rect?.left || rootRect.left) - rootRect.left + 18)}px`;
    menu.style.top = `${Math.max(12, (rect?.bottom || rootRect.top) - rootRect.top + 2)}px`;
    menu.innerHTML = this.state.slash.commands.map((entry, index) => `
      <button class="trn-slash-item ${index === this.state.slash.index ? "selected" : ""}" data-action="slash-command" data-command="${entry.command}">
        <strong>${entry.label}</strong><span>${entry.hint}</span>
      </button>
    `).join("");
  }

  moveSlashSelection(delta) {
    const slash = this.state.slash;
    if (!slash?.open) return;
    slash.index = (slash.index + delta + slash.commands.length) % slash.commands.length;
    this.renderSlashMenu();
  }

  closeSlashMenu(reason) {
    if (this.state.slash?.open) logger.debug("Slash command menu closed", { context: { reason } });
    this.state.slash = null;
    const menu = this.root.querySelector('[data-role="slash-menu"]');
    if (menu) {
      menu.hidden = true;
      menu.innerHTML = "";
    }
  }

  async applySlashCommand(command) {
    const slash = this.state.slash;
    const targetType = slashCommands().find((entry) => entry.command === command)?.type;
    if (!slash?.blockId || !targetType) return;
    const block = this.findBlock(slash.blockId);
    if (!block) return;
    try {
      block.content = normalizeRichTextContent({ text: "" });
      transformBlock(block, targetType);
      block.updatedAt = nowIso();
      logger.info("Slash command selected", { context: { blockId: block.id, command, targetType } });
      await this.storage.request("updateBlock", { block });
      this.closeSlashMenu("selected");
      this.renderEditor();
      requestAnimationFrame(() => this.focusBlock(block.id));
    } catch (error) {
      this.showError(error);
    }
  }

  focusPageTitle({ select = false } = {}) {
    const input = this.root.querySelector('[data-role="page-title"]');
    if (!input) return;
    input.focus();
    if (select) input.select();
  }

  focusBlock(blockId, position = "start") {
    const target = this.root.querySelector(`[data-block-id="${CSS.escape(blockId)}"] [data-rich-text], [data-block-id="${CSS.escape(blockId)}"] textarea, [data-block-id="${CSS.escape(blockId)}"] input`);
    if (!target) return;
    target.focus();
    setCaretPosition(target, position);
  }

  captureBodyguardPaste(html) {
    const pastebin = this.root.querySelector('[data-role="pastebin"]');
    if (!pastebin) return;
    pastebin.innerHTML = sanitizeInlineHtml(html);
    logger.debug("Bodyguard pastebin captured payload", { context: { htmlLength: String(html || "").length, storedLength: pastebin.innerHTML.length } });
  }

  clearBodyguardPaste() {
    const pastebin = this.root.querySelector('[data-role="pastebin"]');
    if (pastebin) pastebin.innerHTML = "";
  }

  getRuntimeSnapshot() {
    return {
      storageMode: "worker",
      selectedPageId: this.state.selectedPageId,
      pageCount: this.state.pages.length,
      blockCount: this.state.blocks.length,
      status: this.state.status,
      lastError: this.state.error,
      undoDepth: this.undoStack.length,
    };
  }

  bindLifecycleFlush() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.storage.flush().catch((error) => this.showError(error));
    });
    window.addEventListener("pagehide", () => this.storage.flush().catch((error) => this.showError(error)));
  }
}

function countByType(blocks) {
  return blocks.reduce((counts, block) => {
    counts[block.type] = (counts[block.type] || 0) + 1;
    return counts;
  }, {});
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

function validTransformsFor(type) {
  return BLOCK_TRANSFORMS[type] || [];
}

function richTextEditable(block, variant, placeholder) {
  const content = normalizeRichTextContent(block.content || {});
  return `<div
    class="trn-rich-text trn-rich-text--${variant}"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    aria-label="${escapeAttr(placeholder)}"
    data-rich-text="${escapeAttr(variant)}"
    data-placeholder="${escapeAttr(placeholder)}"
  >${content.html}</div>`;
}

function parseSlashCommandText(text) {
  const trimmed = String(text || "").trim();
  return /^\/[a-z]*$/.test(trimmed) ? trimmed.slice(1) : null;
}

function slashCommands() {
  return [
    { command: "paragraph", aliases: ["p"], type: BLOCK_TYPES.paragraph, label: "Paragraph", hint: "Plain research text" },
    { command: "heading", aliases: ["h"], type: BLOCK_TYPES.heading, label: "Heading", hint: "Section heading" },
    { command: "quote", aliases: ["q"], type: BLOCK_TYPES.quote, label: "Quote", hint: "Quoted passage" },
    { command: "list", aliases: ["li"], type: BLOCK_TYPES.list, label: "List", hint: "Bullet list" },
    { command: "table", aliases: ["tbl"], type: BLOCK_TYPES.table, label: "Table", hint: "Simple research table" },
    { command: "code", aliases: ["pre"], type: BLOCK_TYPES.code, label: "Code", hint: "Code or command block" },
    { command: "source", aliases: ["src"], type: BLOCK_TYPES.sourceLink, label: "Source", hint: "Research reference" },
  ];
}

function looksLikeMultiBlockPaste(html, text) {
  if (html && /<(h[1-6]|p|div|blockquote|ul|ol|li|table|pre)\b/i.test(html)) return true;
  return /\n\s*\n/.test(text || "");
}

function textToHtml(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function normalizeSidebarWidth(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(520, Math.max(180, Math.round(numeric))) : 280;
}

function statusText(status) {
  if (status?.state === "saved") return "saved locally";
  if (status?.state === "saving") return "saving locally";
  if (status?.state === "dirty") return "unsaved changes";
  if (status?.state === "failed") return "save failed";
  if (status?.state === "loading") return "opening local storage";
  return String(status?.detail || status?.state || "");
}

function cloneRecord(value) {
  return JSON.parse(JSON.stringify(value));
}

function isTextEditingTarget(target) {
  return Boolean(target?.closest?.("input, textarea, [contenteditable='true']"));
}

function blockHasText(block) {
  if (!block) return false;
  if (typeof block.content?.text === "string") return Boolean(block.content.text.trim());
  if (Array.isArray(block.content?.items)) return block.content.items.some((item) => String(item.text || "").trim());
  return Boolean(Object.values(block.content || {}).some((value) => typeof value === "string" && value.trim()));
}

function setCaretPosition(target, position) {
  const atEnd = position === "end";
  if (target.matches("input, textarea")) {
    const valueLength = target.value.length;
    const offset = atEnd ? valueLength : 0;
    target.setSelectionRange?.(offset, offset);
    return;
  }
  if (!target.matches("[contenteditable='true']")) return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(!atEnd);
  selection.removeAllRanges();
  selection.addRange(range);
}

function isCaretOnFirstVisualLine(editable) {
  return isCaretOnVisualBoundary(editable, "first");
}

function isCaretOnLastVisualLine(editable) {
  return isCaretOnVisualBoundary(editable, "last");
}

function isCaretOnVisualBoundary(editable, boundary) {
  const selection = window.getSelection();
  if (!selection?.rangeCount || !selection.isCollapsed) return false;
  const activeRange = selection.getRangeAt(0);
  if (!editable.contains(activeRange.startContainer)) return false;
  if (!editable.textContent.trim()) return true;

  const caretRect = caretRectForRange(activeRange);
  if (!caretRect) return fallbackBoundaryByOffset(editable, activeRange, boundary);

  const contentRange = document.createRange();
  contentRange.selectNodeContents(editable);
  const rects = [...contentRange.getClientRects()].filter((rect) => rect.height > 0);
  contentRange.detach?.();
  if (!rects.length) return fallbackBoundaryByOffset(editable, activeRange, boundary);

  const firstTop = Math.min(...rects.map((rect) => rect.top));
  const lastBottom = Math.max(...rects.map((rect) => rect.bottom));
  const lineHeight = parseFloat(getComputedStyle(editable).lineHeight) || caretRect.height || 18;
  const tolerance = Math.max(3, Math.min(10, lineHeight * 0.45));
  return boundary === "first"
    ? caretRect.top <= firstTop + tolerance
    : caretRect.bottom >= lastBottom - tolerance;
}

function caretRectForRange(range) {
  const direct = range.getClientRects?.()[0] || null;
  if (direct && direct.height > 0) return direct;

  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  const selection = window.getSelection();
  const restored = range.cloneRange();
  range.insertNode(marker);
  const rect = marker.getBoundingClientRect();
  marker.remove();
  selection?.removeAllRanges();
  selection?.addRange(restored);
  return rect.height || rect.width ? rect : null;
}

function fallbackBoundaryByOffset(editable, range, boundary) {
  const probe = range.cloneRange();
  probe.selectNodeContents(editable);
  if (boundary === "first") {
    probe.setEnd(range.startContainer, range.startOffset);
    return !probe.toString();
  }
  probe.setStart(range.startContainer, range.startOffset);
  return !probe.toString();
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
