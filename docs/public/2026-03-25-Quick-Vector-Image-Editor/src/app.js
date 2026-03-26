import {
    canReadClipboard,
    canWriteClipboard,
    cloneObjectForPaste,
    readClipboardPayload,
    readClipboardPayloadFromDataTransfer,
    writeInternalObjectToClipboard,
    writeInternalObjectToDataTransfer,
    writeSvgToClipboard
} from "./clipboard.js";
import {
    AUTOSAVE_DEBOUNCE_MS,
    DOCUMENT_ORIGIN,
    DRAG_THRESHOLD_PX,
    INTERACTION_MODE,
    MIME_TYPES,
    NOTICE_TYPE,
    OBJECT_TYPE,
    SAVE_STATE,
    STORAGE_STATE,
    SUPPORTED_IMAGE_MIME_TYPES,
    TOOL
} from "./constants.js";
import {
    addEllipse,
    addImage,
    addLine,
    addRectangle,
    addText,
    deleteObject,
    patchObject,
    reorderObject,
    setCanvasSize,
    updateObject
} from "./commands.js";
import { cloneDocument, createEmptyDocument, documentHasContent } from "./document.js";
import { canCopyPng, copyPngBlob, preflightRasterExport, rasterizeSvg } from "./export.js";
import {
    findHandleAtPoint,
    getHandleMarkup,
    getHitCandidates,
    getSelectionHandles,
    getSelectionOutline,
    measureTextObject,
    moveObjectPreview,
    objectExceedsCanvas,
    resizeObjectFromHandle
} from "./geometry.js";
import { AppLogger } from "./logger.js";
import { PersistenceService } from "./persistence.js";
import {
    getContextualHint,
    getTextUiPatch,
    renderDocumentInspectorMarkup,
    renderObjectInspectorMarkup
} from "./presentation.js";
import { parseEditorSvg, renderSceneMarkup, serializeDocumentToSvg } from "./serialization.js";
import {
    createViewportState,
    fitViewportToCanvas,
    panViewport,
    screenToDocument,
    zoomAroundViewportCenter
} from "./viewport.js";
import {
    clamp,
    downloadBlob,
    ensureHexColor,
    escapeXml,
    formatTimestamp,
    isInputLikeElement,
    readBlobAsDataUrl,
    loadImageDimensions,
    nowIso,
    readFileAsDataUrl,
    readFileAsText,
    round
} from "./utils.js";
import { estimateSnapshotBytes, normalizeTextContent, validateDocument } from "./validation.js";

export class VectorEditorApp {
    constructor() {
        this.logger = new AppLogger();
        this.persistence = new PersistenceService(this.logger);
        this.measureCanvas = globalThis.document.createElement("canvas");
        this.measureContext = this.measureCanvas.getContext("2d");
        this.noticeCounter = 0;
        this.viewportResetRequested = true;
        this.autosaveTimer = null;
        this.resizeObserver = null;
        this.internalClipboard = null;
        this.state = {
            document: createEmptyDocument(),
            selectionId: null,
            tool: TOOL.SELECT,
            viewport: createViewportState(),
            interaction: { mode: INTERACTION_MODE.IDLE },
            textEdit: null,
            notices: [],
            documentOrigin: DOCUMENT_ORIGIN.NEW,
            saveState: SAVE_STATE.SAVED,
            storageState: STORAGE_STATE.AVAILABLE,
            nextSaveSequence: 0,
            latestCommittedSaveSequence: 0,
            pendingSave: null,
            cycleContext: null,
            isSpacePressed: false
        };
        this.elements = {};
    }

    async init() {
        this.cacheElements();
        this.bindEvents();
        this.renderLogOutput();
        this.render();
        await this.initializePersistence();
        this.logger.info("app.init.complete", this.getDocumentSummary());
    }

    cacheElements() {
        this.elements = {
            viewport: document.getElementById("viewport"),
            sceneSvg: document.getElementById("scene-svg"),
            overlaySvg: document.getElementById("overlay-svg"),
            emptyState: document.getElementById("empty-state"),
            noticeRegion: document.getElementById("notice-region"),
            textEditOverlay: document.getElementById("text-edit-overlay"),
            inspectorContent: document.getElementById("inspector-content"),
            zoomLabel: document.getElementById("zoom-label"),
            documentOriginLabel: document.getElementById("document-origin-label"),
            saveStateLabel: document.getElementById("save-state-label"),
            storageStateLabel: document.getElementById("storage-state-label"),
            hintLabel: document.getElementById("hint-label"),
            openDocumentButton: document.getElementById("open-document-button"),
            openDocumentInput: document.getElementById("open-document-input"),
            pasteDocumentButton: document.getElementById("paste-document-button"),
            newDocumentButton: document.getElementById("new-document-button"),
            insertImageButton: document.getElementById("insert-image-button"),
            insertImageInput: document.getElementById("insert-image-input"),
            pasteButton: document.getElementById("paste-button"),
            exportSvgButton: document.getElementById("export-svg-button"),
            exportPngButton: document.getElementById("export-png-button"),
            exportJpegButton: document.getElementById("export-jpeg-button"),
            copyPngButton: document.getElementById("copy-png-button"),
            copySvgButton: document.getElementById("copy-svg-button"),
            zoomOutButton: document.getElementById("zoom-out-button"),
            zoomInButton: document.getElementById("zoom-in-button"),
            resetZoomButton: document.getElementById("reset-zoom-button"),
            toolRail: document.getElementById("tool-rail"),
            copyLogsButton: document.getElementById("copy-logs-button"),
            clearLogsButton: document.getElementById("clear-logs-button"),
            logOutput: document.getElementById("log-output"),
            confirmDialog: document.getElementById("confirm-dialog"),
            confirmTitle: document.getElementById("confirm-title"),
            confirmMessage: document.getElementById("confirm-message"),
            confirmDetails: document.getElementById("confirm-details")
        };
    }

    bindEvents() {
        this.logger.subscribe(() => this.renderLogOutput());

        this.elements.toolRail.addEventListener("click", (event) => {
            const button = event.target.closest("[data-tool]");
            if (!button) {
                return;
            }
            this.setTool(button.dataset.tool);
        });

        this.elements.newDocumentButton.addEventListener("click", () => {
            void this.handleNewDocument();
        });
        this.elements.openDocumentButton.addEventListener("click", () => {
            this.elements.openDocumentInput.click();
        });
        this.elements.pasteDocumentButton.addEventListener("click", () => {
            void this.handlePasteDocument();
        });
        this.elements.insertImageButton.addEventListener("click", () => {
            this.elements.insertImageInput.click();
        });
        this.elements.pasteButton.addEventListener("click", () => {
            void this.handlePaste();
        });
        this.elements.openDocumentInput.addEventListener("change", (event) => {
            void this.handleOpenDocument(event);
        });
        this.elements.insertImageInput.addEventListener("change", (event) => {
            void this.handleInsertImages(event);
        });

        this.elements.exportSvgButton.addEventListener("click", () => {
            void this.handleExport("svg");
        });
        this.elements.exportPngButton.addEventListener("click", () => {
            void this.handleExport("png");
        });
        this.elements.exportJpegButton.addEventListener("click", () => {
            void this.handleExport("jpeg");
        });
        this.elements.copyPngButton.addEventListener("click", () => {
            void this.handleCopyPng();
        });
        this.elements.copySvgButton.addEventListener("click", () => {
            void this.handleCopySvg();
        });

        this.elements.zoomOutButton.addEventListener("click", () => this.adjustZoom(1 / 1.15));
        this.elements.zoomInButton.addEventListener("click", () => this.adjustZoom(1.15));
        this.elements.resetZoomButton.addEventListener("click", () => this.resetViewportToCanvas());

        this.elements.viewport.addEventListener("pointerdown", (event) => this.handleViewportPointerDown(event));
        this.elements.viewport.addEventListener("pointermove", (event) => this.handleViewportPointerMove(event));
        this.elements.viewport.addEventListener("pointerup", (event) => this.handleViewportPointerUp(event));
        this.elements.viewport.addEventListener("pointercancel", (event) => this.handleViewportPointerUp(event));
        this.elements.viewport.addEventListener("dblclick", (event) => this.handleViewportDoubleClick(event));
        this.elements.viewport.addEventListener("wheel", (event) => this.handleViewportWheel(event), { passive: false });

        window.addEventListener("keydown", (event) => this.handleWindowKeyDown(event));
        window.addEventListener("keyup", (event) => this.handleWindowKeyUp(event));
        window.addEventListener("paste", (event) => {
            void this.handleWindowPaste(event);
        });
        window.addEventListener("copy", (event) => {
            this.handleWindowCopy(event);
        });
        window.addEventListener("cut", (event) => {
            this.handleWindowCut(event);
        });
        window.addEventListener("error", (event) => {
            this.reportError("window.error", event.error ?? new Error(String(event.message)), "An unexpected error occurred. The editor is still open. Copy the activity log and share it for debugging.");
        });
        window.addEventListener("unhandledrejection", (event) => {
            this.reportError("window.unhandledrejection", event.reason ?? new Error("Unhandled promise rejection"), "An unexpected async error occurred. The editor is still open. Copy the activity log and share it for debugging.");
        });

        this.elements.inspectorContent.addEventListener("click", (event) => {
            void this.handleInspectorClick(event);
        });
        this.elements.inspectorContent.addEventListener("change", (event) => {
            void this.handleInspectorChange(event);
        });

        this.elements.textEditOverlay.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                this.commitTextEdit(true);
            } else if (event.key === "Escape") {
                event.preventDefault();
                this.commitTextEdit(false);
            }
        });
        this.elements.textEditOverlay.addEventListener("blur", () => {
            if (this.state.textEdit) {
                this.commitTextEdit(true);
            }
        });

        this.elements.noticeRegion.addEventListener("click", (event) => {
            const button = event.target.closest("[data-notice-dismiss]");
            if (!button) {
                return;
            }
            this.dismissNotice(Number(button.dataset.noticeDismiss));
        });

        this.elements.copyLogsButton.addEventListener("click", () => {
            void this.copyLogs();
        });
        this.elements.clearLogsButton.addEventListener("click", () => {
            this.logger.clearView();
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "Activity log cleared",
                body: "The on-screen log view was cleared."
            });
        });

        this.resizeObserver = new ResizeObserver(() => {
            this.syncViewportBounds();
        });
        this.resizeObserver.observe(this.elements.viewport);
        this.syncViewportBounds();
    }

    async initializePersistence() {
        try {
            const storageState = await this.persistence.init();
            this.updateStorageState(storageState);
            this.logger.info("storage.init.success", { storageState });
            if (storageState === STORAGE_STATE.DEGRADED) {
                this.pushNotice({
                    type: NOTICE_TYPE.WARNING,
                    title: "Local recovery storage is limited",
                    body: "This browser reports a low storage quota. Editing still works, but retained draft reliability may degrade for larger documents.",
                    sticky: true
                });
            }
            const restore = await this.persistence.restoreLatestValid(parseEditorSvg, this.logger);
            if (restore.failures.length > 0) {
                this.logger.warn("draft.restore.failures", {
                    failures: restore.failures
                });
            }
            if (restore.document) {
                this.loadDocument(restore.document, {
                    origin: DOCUMENT_ORIGIN.RECOVERED,
                    saveSequence: restore.record.saveSequence,
                    scheduleAutosave: false,
                    reason: "draft.restore"
                });
                this.pushNotice({
                    type: NOTICE_TYPE.INFO,
                    title: "Recovered local draft",
                    body: `Restored autosaved work from ${formatTimestamp(restore.record.savedAt)}.`
                });
                if (restore.failures.length > 0) {
                    this.pushNotice({
                        type: NOTICE_TYPE.WARNING,
                        title: "Some retained drafts were skipped",
                        body: `Recovery used an older valid snapshot after rejecting ${restore.failures.length} invalid retained draft${restore.failures.length === 1 ? "" : "s"}.`
                    });
                }
            } else if (restore.failures.length > 0) {
                this.pushNotice({
                    type: NOTICE_TYPE.WARNING,
                    title: "Retained drafts were found but could not be restored",
                    body: "The editor skipped invalid retained drafts and started with a new in-memory document instead. The activity log contains the rejection details.",
                    sticky: true
                });
            }
        } catch (error) {
            this.updateStorageState(STORAGE_STATE.UNAVAILABLE);
            this.logger.error("storage.init.failed", {
                message: String(error)
            });
            this.pushNotice({
                type: NOTICE_TYPE.WARNING,
                title: "Automatic draft recovery is unavailable",
                body: "IndexedDB storage could not be initialized. Editing continues in memory, but refresh or tab close can lose recent work.",
                sticky: true
            });
        }
        this.render();
    }

    syncViewportBounds() {
        const rect = this.elements.viewport.getBoundingClientRect();
        const nextViewport = {
            ...this.state.viewport,
            width: Math.max(1, rect.width),
            height: Math.max(1, rect.height)
        };
        this.state.viewport = nextViewport;
        this.applyViewportResetIfNeeded();
        this.render();
    }

    applyViewportResetIfNeeded() {
        if (!this.viewportResetRequested) {
            return;
        }
        if (!this.state.viewport.width || !this.state.viewport.height) {
            return;
        }
        this.state.viewport = fitViewportToCanvas(this.state.viewport, this.state.document.canvas);
        this.viewportResetRequested = false;
    }

    requestViewportReset() {
        this.viewportResetRequested = true;
        this.applyViewportResetIfNeeded();
    }

    resetViewportToCanvas() {
        this.requestViewportReset();
        this.render();
        this.logger.info("viewport.reset", {
            canvas: { ...this.state.document.canvas }
        });
    }

    setTool(tool) {
        if (!Object.values(TOOL).includes(tool)) {
            return;
        }
        this.state.tool = tool;
        this.state.cycleContext = null;
        this.render();
        this.logger.info("tool.changed", { tool });
    }

    getSelectedObject() {
        return this.state.document.objects.find((object) => object.id === this.state.selectionId) ?? null;
    }

    getViewportPoint(event) {
        const rect = this.elements.viewport.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    measureText = (textObject) => {
        if (!this.measureContext) {
            return { width: Math.max(12, textObject.text.length * textObject.fontSize * 0.62) };
        }
        this.measureContext.font = `${textObject.fontWeight} ${textObject.fontSize}px ${textObject.fontFamily}`;
        return this.measureContext.measureText(textObject.text || "");
    };

    render() {
        this.applyViewportResetIfNeeded();
        this.renderScene();
        this.renderOverlay();
        this.renderTextEditOverlay();
        this.renderInspector();
        this.renderStatus();
        this.renderTools();
        this.renderNotices();
        this.elements.emptyState.hidden = documentHasContent(this.state.document);
        this.elements.pasteButton.disabled = !canReadClipboard() && !this.internalClipboard;
        this.elements.pasteButton.title = this.getPasteButtonTitle();
        this.elements.pasteDocumentButton.disabled = !canReadClipboard();
        this.elements.pasteDocumentButton.title = canReadClipboard()
            ? ""
            : "Async clipboard read is not supported in this browser.";
        this.elements.copyPngButton.disabled = !canCopyPng();
        this.elements.copyPngButton.title = canCopyPng()
            ? ""
            : "Clipboard image write is not supported in this browser.";
        this.elements.copySvgButton.disabled = !canWriteClipboard();
        this.elements.copySvgButton.title = canWriteClipboard()
            ? ""
            : "Clipboard SVG write is not supported in this browser.";
        this.elements.viewport.style.cursor = this.getViewportCursor();
    }

    renderScene() {
        const viewport = this.state.viewport;
        this.elements.sceneSvg.setAttribute("viewBox", `0 0 ${Math.max(1, viewport.width)} ${Math.max(1, viewport.height)}`);
        this.elements.sceneSvg.innerHTML = `<g transform="translate(${round(viewport.panX, 3)} ${round(viewport.panY, 3)}) scale(${round(viewport.scale, 4)})">${renderSceneMarkup(this.state.document)}</g>`;
    }

    renderOverlay() {
        const selectedObject = this.getSelectedObject();
        const outline = getSelectionOutline(selectedObject, this.state.viewport, this.measureText);
        const handles = getSelectionHandles(selectedObject, this.state.viewport, this.measureText);
        const isEditingSelectedText = Boolean(
            selectedObject
            && selectedObject.type === OBJECT_TYPE.TEXT
            && this.state.textEdit?.objectId === selectedObject.id
        );
        let markup = "";
        if (outline?.type === "rect") {
            if (selectedObject?.type === OBJECT_TYPE.TEXT) {
                if (!isEditingSelectedText) {
                    markup += `<rect x="${outline.x}" y="${outline.y}" width="${outline.width}" height="${outline.height}" fill="rgba(26, 115, 232, 0.08)" stroke="#1a73e8" stroke-width="1.75" stroke-dasharray="6 4" rx="4" />`;
                }
            } else {
                markup += `<rect x="${outline.x}" y="${outline.y}" width="${outline.width}" height="${outline.height}" fill="none" stroke="#1a73e8" stroke-width="1.75" stroke-dasharray="6 4" rx="4" />`;
            }
        }
        if (outline?.type === "line") {
            markup += `<line x1="${outline.x1}" y1="${outline.y1}" x2="${outline.x2}" y2="${outline.y2}" stroke="#1a73e8" stroke-width="2.5" stroke-dasharray="6 4" />`;
        }
        if (!isEditingSelectedText) {
            markup += getHandleMarkup(handles);
        }
        this.elements.overlaySvg.setAttribute("viewBox", `0 0 ${Math.max(1, this.state.viewport.width)} ${Math.max(1, this.state.viewport.height)}`);
        this.elements.overlaySvg.innerHTML = markup;
    }

    renderTextEditOverlay() {
        const overlay = this.elements.textEditOverlay;
        const textEdit = this.state.textEdit;
        if (!textEdit) {
            overlay.hidden = true;
            overlay.dataset.objectId = "";
            return;
        }
        const object = this.state.document.objects.find((item) => item.id === textEdit.objectId && item.type === OBJECT_TYPE.TEXT);
        if (!object) {
            overlay.hidden = true;
            this.state.textEdit = null;
            return;
        }
        const bounds = measureTextObject(object, this.measureText);
        const left = this.state.viewport.panX + (bounds.x * this.state.viewport.scale);
        const top = this.state.viewport.panY + (bounds.y * this.state.viewport.scale);
        overlay.hidden = false;
        overlay.style.left = `${left - 4}px`;
        overlay.style.top = `${top - 4}px`;
        overlay.style.width = `${Math.max(96, (bounds.width * this.state.viewport.scale) + 24)}px`;
        overlay.style.height = `${Math.max(32, (bounds.height * this.state.viewport.scale) + 12)}px`;
        overlay.style.fontSize = `${Math.max(12, object.fontSize * this.state.viewport.scale)}px`;
        overlay.style.fontWeight = String(object.fontWeight);
        overlay.style.fontFamily = object.fontFamily;
        overlay.style.color = object.fill;
        overlay.style.lineHeight = String(object.lineHeight);
        if (overlay.dataset.objectId !== object.id) {
            overlay.value = object.text;
            overlay.dataset.objectId = object.id;
            queueMicrotask(() => {
                overlay.focus();
                overlay.select();
            });
        }
    }

    renderInspector() {
        const selectedObject = this.getSelectedObject();
        if (!selectedObject) {
            this.elements.inspectorContent.innerHTML = this.renderDocumentInspector();
            return;
        }
        this.elements.inspectorContent.innerHTML = this.renderObjectInspector(selectedObject);
    }

    renderDocumentInspector() {
        const summary = this.getDocumentSummary();
        return renderDocumentInspectorMarkup({
            documentState: this.state.document,
            summary: {
                ...summary,
                documentOriginText: this.getDocumentOriginText()
            }
        });
    }

    renderObjectInspector(object) {
        return renderObjectInspectorMarkup({
            object,
            measureText: this.measureText
        });
    }

    renderStatus() {
        this.elements.zoomLabel.textContent = `${Math.round(this.state.viewport.scale * 100)}%`;
        this.elements.documentOriginLabel.textContent = this.getDocumentOriginText();
        this.elements.saveStateLabel.textContent = this.getSaveStateText();
        this.elements.storageStateLabel.textContent = this.getStorageStateText();
        this.elements.hintLabel.textContent = getContextualHint({
            tool: this.state.tool,
            selectedObject: this.getSelectedObject(),
            isTextEditing: Boolean(this.state.textEdit)
        });
        this.elements.saveStateLabel.className = `status-chip ${this.getSaveStateClass()}`;
        this.elements.storageStateLabel.className = `status-chip ${this.getStorageStateClass()}`;
        this.elements.documentOriginLabel.className = `status-chip ${this.state.documentOrigin === DOCUMENT_ORIGIN.RECOVERED ? "status-warning" : ""}`.trim();
    }

    renderTools() {
        for (const button of this.elements.toolRail.querySelectorAll("[data-tool]")) {
            button.classList.toggle("is-active", button.dataset.tool === this.state.tool);
        }
    }

    renderNotices() {
        this.elements.noticeRegion.innerHTML = this.state.notices
            .map((notice) => `
                <div class="notice notice-${notice.type}">
                    <div class="notice-header">
                        <div class="notice-title">${escapeXml(notice.title)}</div>
                        <button type="button" data-notice-dismiss="${notice.id}">Dismiss</button>
                    </div>
                    <div class="notice-body">${escapeXml(notice.body)}</div>
                </div>
            `)
            .join("");
    }

    renderLogOutput() {
        if (!this.elements.logOutput) {
            return;
        }
        this.elements.logOutput.textContent = this.logger.formatEntries() || "No log entries yet.";
    }

    getViewportCursor() {
        if (this.state.interaction.mode === INTERACTION_MODE.PANNING || this.state.isSpacePressed) {
            return "grab";
        }
        if (this.state.tool === TOOL.TEXT) {
            return "text";
        }
        if (this.state.tool !== TOOL.SELECT) {
            return "crosshair";
        }
        return "default";
    }

    async handleNewDocument() {
        this.commitTextEdit(true);
        const confirmed = await this.confirmReplaceCurrentDocument("start a new document");
        if (!confirmed) {
            return;
        }
        this.loadDocument(createEmptyDocument(), {
            origin: DOCUMENT_ORIGIN.NEW,
            saveSequence: 0,
            scheduleAutosave: false,
            reason: "document.new"
        });
        this.pushNotice({
            type: NOTICE_TYPE.INFO,
            title: "Started a new document",
            body: "The previous in-memory document was replaced."
        });
    }

    async handleOpenDocument(event) {
        const input = event.currentTarget;
        const [file] = [...(input.files ?? [])];
        input.value = "";
        if (!file) {
            return;
        }
        this.commitTextEdit(true);
        try {
            const svgText = await readFileAsText(file);
            const nextDocument = parseEditorSvg(svgText);
            const confirmed = await this.confirmReplaceCurrentDocument("open another document");
            if (!confirmed) {
                return;
            }
            this.loadDocument(nextDocument, {
                origin: DOCUMENT_ORIGIN.OPENED,
                saveSequence: 0,
                scheduleAutosave: true,
                reason: "document.opened"
            });
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "Document opened",
                body: `Opened ${file.name} and replaced the current in-memory document.`
            });
        } catch (error) {
            this.reportError("document.open.failed", error, "This SVG could not be opened. Only editor-generated SVG files are supported.");
        }
    }

    async handleInsertImages(event) {
        const input = event.currentTarget;
        const files = [...(input.files ?? [])];
        input.value = "";
        if (files.length === 0) {
            return;
        }
        this.commitTextEdit(true);
        try {
            let nextDocument = this.state.document;
            let lastObjectId = null;
            for (const file of files) {
                if (!SUPPORTED_IMAGE_MIME_TYPES.has(file.type)) {
                    this.pushNotice({
                        type: NOTICE_TYPE.WARNING,
                        title: "Skipped unsupported image file",
                        body: `${file.name} uses ${file.type || "an unknown type"}, which is not supported.`
                    });
                    this.logger.warn("image.insert.skipped.unsupported", {
                        fileName: file.name,
                        mimeType: file.type
                    });
                    continue;
                }
                const href = await readFileAsDataUrl(file);
                const dimensions = await loadImageDimensions(href);
                nextDocument = addImage(nextDocument, {
                    href,
                    naturalWidth: dimensions.width,
                    naturalHeight: dimensions.height
                });
                lastObjectId = nextDocument.objects.at(-1)?.id ?? null;
                this.logger.info("image.insert.prepared", {
                    fileName: file.name,
                    width: dimensions.width,
                    height: dimensions.height
                });
            }
            if (!lastObjectId) {
                return;
            }
            await this.warnIfPersistenceBudgetLooksRisky(nextDocument, "image insertion");
            this.commitDocument(nextDocument, {
                reason: "image.inserted",
                selectionId: lastObjectId
            });
            this.state.tool = TOOL.SELECT;
            this.render();
        } catch (error) {
            this.reportError("image.insert.failed", error, "One or more images could not be inserted.");
        }
    }

    async handleExport(format) {
        this.commitTextEdit(true);
        try {
            this.assertCurrentDocumentValid("export");
            const svgString = serializeDocumentToSvg(this.state.document);
            const timestamp = nowIso().replaceAll(":", "-");
            if (format === "svg") {
                downloadBlob(new Blob([svgString], { type: MIME_TYPES.SVG }), `vector-editor-${timestamp}.svg`);
                this.logger.info("export.svg.success", this.getDocumentSummary());
                this.pushNotice({
                    type: NOTICE_TYPE.INFO,
                    title: "SVG exported",
                    body: "The current editor document was exported as an editable SVG file."
                });
                return;
            }
            const preflight = preflightRasterExport(this.state.document);
            if (!preflight.ok) {
                throw new Error(preflight.reason);
            }
            const mimeType = format === "png" ? MIME_TYPES.PNG : MIME_TYPES.JPEG;
            const blob = await rasterizeSvg(svgString, this.state.document, mimeType);
            const extension = format === "png" ? "png" : "jpg";
            downloadBlob(blob, `vector-editor-${timestamp}.${extension}`);
            this.logger.info(`export.${format}.success`, {
                ...this.getDocumentSummary(),
                bytes: blob.size
            });
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: `${format.toUpperCase()} exported`,
                body: `Exported ${preflight.width} x ${preflight.height} ${format.toUpperCase()} output successfully.`
            });
        } catch (error) {
            this.reportError(`export.${format}.failed`, error, `The ${format.toUpperCase()} export did not complete. The notice includes the most specific failure reason available.`);
        }
    }

    async handleCopyPng() {
        this.commitTextEdit(true);
        try {
            if (!canCopyPng()) {
                throw new Error("Clipboard PNG write is not supported in this browser.");
            }
            const svgString = serializeDocumentToSvg(this.state.document);
            const blob = await rasterizeSvg(svgString, this.state.document, MIME_TYPES.PNG);
            await copyPngBlob(blob);
            this.logger.info("clipboard.copy-png.success", {
                bytes: blob.size
            });
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "PNG copied",
                body: "The current canvas was copied to the clipboard as a PNG image."
            });
        } catch (error) {
            this.reportError("clipboard.copy-png.failed", error, "Copy PNG failed. The browser may block clipboard image writes or raster export may have failed.");
        }
    }

    async handleCopySvg() {
        this.commitTextEdit(true);
        try {
            const svgString = serializeDocumentToSvg(this.state.document);
            await writeSvgToClipboard(svgString);
            this.logger.info("clipboard.copy-svg.success", this.getDocumentSummary());
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "SVG copied",
                body: "The editable document SVG was copied to the clipboard."
            });
        } catch (error) {
            this.reportError("clipboard.copy-svg.failed", error, "Copy SVG failed. The browser may block clipboard writes.");
        }
    }

    async handlePaste() {
        this.commitTextEdit(true);
        try {
            const payload = await this.resolvePastePayload();
            if (!payload) {
                throw new Error("Clipboard did not contain supported paste data.");
            }
            await this.applyClipboardPayload(payload, "insert");
        } catch (error) {
            this.reportError("clipboard.paste.failed", error, "Paste failed. The clipboard did not contain a supported image, SVG, text payload, or editor object payload.");
        }
    }

    async handlePasteDocument() {
        this.commitTextEdit(true);
        try {
            const payload = await readClipboardPayload();
            if (!payload || payload.kind !== "editor-svg-document") {
                throw new Error("Clipboard does not contain an editor-generated SVG document.");
            }
            await this.applyClipboardPayload(payload, "replace-document");
        } catch (error) {
            this.reportError("clipboard.paste-document.failed", error, "Paste Document failed. Only editor-generated SVG on the clipboard can replace the current document.");
        }
    }

    handleViewportPointerDown(event) {
        if (event.button !== 0) {
            return;
        }
        this.elements.viewport.focus();
        const screenPoint = this.getViewportPoint(event);
        const documentPoint = screenToDocument(this.state.viewport, screenPoint);
        const selectedObject = this.getSelectedObject();
        const selectedHandles = getSelectionHandles(selectedObject, this.state.viewport, this.measureText);
        const hitHandle = findHandleAtPoint(selectedHandles, screenPoint);

        if (this.state.isSpacePressed) {
            this.beginPanInteraction(event, screenPoint);
            return;
        }

        if (this.state.tool !== TOOL.SELECT) {
            this.handleInsertionToolClick(documentPoint);
            return;
        }

        if (hitHandle && selectedObject) {
            this.beginResizeInteraction(event, screenPoint, documentPoint, selectedObject, hitHandle.name);
            return;
        }

        const candidates = getHitCandidates(this.state.document, documentPoint, {
            scale: this.state.viewport.scale,
            measureText: this.measureText
        });
        if (event.altKey && candidates.length > 0) {
            const cycled = this.pickCycledObject(screenPoint, candidates);
            this.state.selectionId = cycled?.id ?? null;
            this.render();
            this.logger.info("selection.cycled", {
                selectionId: this.state.selectionId,
                candidates: candidates.map((candidate) => candidate.id)
            });
            return;
        }

        this.state.cycleContext = null;
        const hitObject = candidates[0] ?? null;
        this.state.selectionId = hitObject?.id ?? null;
        this.render();
        if (!hitObject) {
            this.logger.info("selection.cleared", {});
            return;
        }
        this.beginDragInteraction(event, screenPoint, documentPoint, hitObject);
    }

    handleViewportPointerMove(event) {
        const interaction = this.state.interaction;
        if (!interaction || interaction.mode === INTERACTION_MODE.IDLE || interaction.pointerId !== event.pointerId) {
            return;
        }
        const screenPoint = this.getViewportPoint(event);
        const documentPoint = screenToDocument(this.state.viewport, screenPoint);
        if (interaction.mode === INTERACTION_MODE.PANNING) {
            this.state.viewport = panViewport(
                this.state.viewport,
                screenPoint.x - interaction.lastScreenPoint.x,
                screenPoint.y - interaction.lastScreenPoint.y
            );
            this.state.interaction = {
                ...interaction,
                lastScreenPoint: screenPoint
            };
            this.render();
            return;
        }
        if (interaction.mode === INTERACTION_MODE.DRAGGING) {
            const distance = Math.hypot(screenPoint.x - interaction.startScreenPoint.x, screenPoint.y - interaction.startScreenPoint.y);
            const started = interaction.started || distance >= DRAG_THRESHOLD_PX;
            if (!started) {
                return;
            }
            const dx = documentPoint.x - interaction.startDocumentPoint.x;
            const dy = documentPoint.y - interaction.startDocumentPoint.y;
            const nextObject = moveObjectPreview(interaction.baseObject, dx, dy);
            const nextDocument = updateObject(interaction.baseDocument, interaction.baseObject.id, () => nextObject);
            this.state.document = nextDocument;
            this.state.interaction = {
                ...interaction,
                started: true
            };
            this.render();
            return;
        }
        if (interaction.mode === INTERACTION_MODE.RESIZING) {
            const nextObject = resizeObjectFromHandle(interaction.baseObject, interaction.handleName, documentPoint);
            const nextDocument = updateObject(interaction.baseDocument, interaction.baseObject.id, () => nextObject);
            this.state.document = nextDocument;
            this.state.interaction = {
                ...interaction,
                started: true
            };
            this.render();
        }
    }

    handleViewportPointerUp(event) {
        const interaction = this.state.interaction;
        if (!interaction || interaction.mode === INTERACTION_MODE.IDLE || interaction.pointerId !== event.pointerId) {
            return;
        }
        this.elements.viewport.releasePointerCapture?.(event.pointerId);
        this.state.interaction = { mode: INTERACTION_MODE.IDLE };
        if (interaction.mode === INTERACTION_MODE.DRAGGING || interaction.mode === INTERACTION_MODE.RESIZING) {
            if (interaction.started) {
                this.finalizeInteractiveChange(interaction.mode);
            } else {
                this.state.document = interaction.baseDocument;
                this.render();
            }
            return;
        }
        if (interaction.mode === INTERACTION_MODE.PANNING) {
            this.render();
        }
    }

    handleViewportDoubleClick(event) {
        if (this.state.tool !== TOOL.SELECT) {
            return;
        }
        const screenPoint = this.getViewportPoint(event);
        const documentPoint = screenToDocument(this.state.viewport, screenPoint);
        const candidates = getHitCandidates(this.state.document, documentPoint, {
            scale: this.state.viewport.scale,
            measureText: this.measureText
        });
        const textCandidate = candidates.find((object) => object.type === OBJECT_TYPE.TEXT);
        if (!textCandidate) {
            return;
        }
        this.state.selectionId = textCandidate.id;
        this.startTextEdit(textCandidate.id);
    }

    handleViewportWheel(event) {
        if (!event.ctrlKey && !event.metaKey) {
            return;
        }
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
        this.adjustZoom(factor);
    }

    handleWindowKeyDown(event) {
        if (event.key === " " && !isInputLikeElement(event.target)) {
            this.state.isSpacePressed = true;
            this.render();
            event.preventDefault();
            return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
            if (this.state.selectionId && !isInputLikeElement(event.target) && !this.state.textEdit) {
                event.preventDefault();
                this.deleteSelection();
            }
            return;
        }
        if (event.key === "Escape") {
            if (this.state.textEdit) {
                this.commitTextEdit(false);
                return;
            }
            if (this.state.selectionId) {
                this.state.selectionId = null;
                this.render();
            }
        }
    }

    handleWindowKeyUp(event) {
        if (event.key === " ") {
            this.state.isSpacePressed = false;
            this.render();
        }
    }

    async handleWindowPaste(event) {
        if (isInputLikeElement(event.target) || this.state.textEdit) {
            return;
        }
        event.preventDefault();
        try {
            const payload = await readClipboardPayloadFromDataTransfer(event.clipboardData) ?? this.internalClipboard;
            if (!payload) {
                throw new Error("Paste event did not include supported data.");
            }
            await this.applyClipboardPayload(payload, "insert");
        } catch (error) {
            this.reportError("clipboard.paste-event.failed", error, "Paste failed. The clipboard data could not be converted into a supported editor action.");
        }
    }

    handleWindowCopy(event) {
        if (isInputLikeElement(event.target) || this.state.textEdit || !this.state.selectionId) {
            return;
        }
        event.preventDefault();
        void this.copySelectionToClipboard({
            clipboardData: event.clipboardData,
            deleteAfterCopy: false,
            source: "shortcut"
        });
    }

    handleWindowCut(event) {
        if (isInputLikeElement(event.target) || this.state.textEdit || !this.state.selectionId) {
            return;
        }
        event.preventDefault();
        void this.copySelectionToClipboard({
            clipboardData: event.clipboardData,
            deleteAfterCopy: true,
            source: "shortcut"
        });
    }

    beginPanInteraction(event, screenPoint) {
        this.elements.viewport.setPointerCapture?.(event.pointerId);
        this.state.interaction = {
            mode: INTERACTION_MODE.PANNING,
            pointerId: event.pointerId,
            lastScreenPoint: screenPoint
        };
        this.logger.info("viewport.pan.start", {
            screenPoint
        });
    }

    beginDragInteraction(event, screenPoint, documentPoint, object) {
        this.elements.viewport.setPointerCapture?.(event.pointerId);
        this.state.interaction = {
            mode: INTERACTION_MODE.DRAGGING,
            pointerId: event.pointerId,
            startScreenPoint: screenPoint,
            startDocumentPoint: documentPoint,
            baseDocument: cloneDocument(this.state.document),
            baseObject: cloneDocument(object),
            started: false
        };
    }

    beginResizeInteraction(event, screenPoint, documentPoint, object, handleName) {
        this.elements.viewport.setPointerCapture?.(event.pointerId);
        this.state.interaction = {
            mode: INTERACTION_MODE.RESIZING,
            pointerId: event.pointerId,
            startScreenPoint: screenPoint,
            startDocumentPoint: documentPoint,
            baseDocument: cloneDocument(this.state.document),
            baseObject: cloneDocument(object),
            handleName,
            started: false
        };
        this.logger.info("selection.resize.prepare", {
            objectId: object.id,
            handleName
        });
    }

    finalizeInteractiveChange(mode) {
        this.commitDocument(this.state.document, {
            reason: mode === INTERACTION_MODE.DRAGGING ? "selection.drag" : "selection.resize",
            selectionId: this.state.selectionId
        });
    }

    handleInsertionToolClick(documentPoint) {
        let nextDocument = this.state.document;
        if (this.state.tool === TOOL.TEXT) {
            nextDocument = addText(this.state.document, documentPoint);
        } else if (this.state.tool === TOOL.RECTANGLE) {
            nextDocument = addRectangle(this.state.document, documentPoint);
        } else if (this.state.tool === TOOL.ELLIPSE) {
            nextDocument = addEllipse(this.state.document, documentPoint);
        } else if (this.state.tool === TOOL.LINE) {
            nextDocument = addLine(this.state.document, documentPoint);
        }
        const insertedObject = nextDocument.objects.at(-1);
        if (!insertedObject) {
            return;
        }
        this.commitDocument(nextDocument, {
            reason: `tool.insert.${insertedObject.type}`,
            selectionId: insertedObject.id
        });
        this.state.tool = TOOL.SELECT;
        this.render();
        if (insertedObject.type === OBJECT_TYPE.TEXT) {
            this.startTextEdit(insertedObject.id);
        }
    }

    pickCycledObject(screenPoint, candidates) {
        const threshold = 3;
        const signature = candidates.map((candidate) => candidate.id).join("|");
        const context = this.state.cycleContext;
        const samePoint = context
            && Math.abs(context.screenPoint.x - screenPoint.x) <= threshold
            && Math.abs(context.screenPoint.y - screenPoint.y) <= threshold
            && context.signature === signature;
        const index = samePoint ? (context.index + 1) % candidates.length : 0;
        this.state.cycleContext = {
            screenPoint,
            signature,
            index
        };
        return candidates[index];
    }

    startTextEdit(objectId) {
        const object = this.state.document.objects.find((item) => item.id === objectId && item.type === OBJECT_TYPE.TEXT);
        if (!object) {
            return;
        }
        this.state.selectionId = objectId;
        this.state.textEdit = {
            objectId,
            initialText: object.text
        };
        this.render();
        this.logger.info("text.edit.start", {
            objectId
        });
    }

    commitTextEdit(shouldCommit) {
        const edit = this.state.textEdit;
        if (!edit) {
            return;
        }
        const overlay = this.elements.textEditOverlay;
        const nextText = normalizeTextContent(overlay.value);
        this.state.textEdit = null;
        overlay.blur();
        if (!shouldCommit) {
            overlay.hidden = true;
            this.render();
            this.logger.info("text.edit.cancel", {
                objectId: edit.objectId
            });
            return;
        }
        const object = this.state.document.objects.find((item) => item.id === edit.objectId);
        if (!object || object.type !== OBJECT_TYPE.TEXT) {
            this.render();
            return;
        }
        if (object.text === nextText) {
            this.render();
            return;
        }
        const nextDocument = patchObject(this.state.document, edit.objectId, {
            text: nextText
        });
        this.commitDocument(nextDocument, {
            reason: "text.edit.commit",
            selectionId: edit.objectId
        });
        this.logger.info("text.edit.commit", {
            objectId: edit.objectId,
            textLength: nextText.length
        });
    }

    async handleInspectorClick(event) {
        const button = event.target.closest("[data-action]");
        if (!button) {
            return;
        }
        const action = button.dataset.action;
        if (action === "delete-selection") {
            this.deleteSelection();
            return;
        }
        if (action === "copy-selection") {
            await this.copySelectionToClipboard({
                clipboardData: null,
                deleteAfterCopy: false,
                source: "button"
            });
            return;
        }
        if (action === "cut-selection") {
            await this.copySelectionToClipboard({
                clipboardData: null,
                deleteAfterCopy: true,
                source: "button"
            });
            return;
        }
        if (action === "edit-text") {
            if (this.state.selectionId) {
                this.startTextEdit(this.state.selectionId);
            }
            return;
        }
        if (action === "apply-canvas") {
            await this.applyCanvasInspectorValues();
            return;
        }
        if (action === "fit-canvas") {
            this.resetViewportToCanvas();
            return;
        }
        if (["send-to-back", "send-backward", "bring-forward", "bring-to-front"].includes(action) && this.state.selectionId) {
            const nextDocument = reorderObject(this.state.document, this.state.selectionId, action);
            this.commitDocument(nextDocument, {
                reason: `layer.${action}`,
                selectionId: this.state.selectionId
            });
        }
    }

    async handleInspectorChange(event) {
        const input = event.target.closest("[data-field]");
        if (!input) {
            return;
        }
        if (!this.state.selectionId) {
            if (input.dataset.field === "canvas-background") {
                const nextDocument = cloneDocument(this.state.document);
                nextDocument.canvas.background = ensureHexColor(input.value, "#ffffff");
                this.commitDocument(nextDocument, {
                    reason: "canvas.background",
                    selectionId: null
                });
            }
            return;
        }
        const selectedObject = this.getSelectedObject();
        if (!selectedObject) {
            return;
        }
        const field = input.dataset.field;
        let value = input.value;
        if (["x", "y", "left", "top", "width", "height", "fontSize", "fontWeight", "lineHeight", "x1", "y1", "x2", "y2", "strokeWidth"].includes(field)) {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue)) {
                this.pushNotice({
                    type: NOTICE_TYPE.WARNING,
                    title: "Ignored invalid numeric value",
                    body: `The field ${field} requires a finite number.`
                });
                this.render();
                return;
            }
            value = numericValue;
        }
        if (field === "fill") {
            value = value === "transparent" ? "transparent" : ensureHexColor(value, "#111111");
        }
        if (field === "stroke") {
            value = ensureHexColor(value, "#111111");
        }
        if (field === "text") {
            value = normalizeTextContent(value);
        }
        const patch = selectedObject.type === OBJECT_TYPE.TEXT && (field === "left" || field === "top")
            ? getTextUiPatch(selectedObject, field, value, this.measureText)
            : { [field]: value };
        const nextDocument = patchObject(this.state.document, this.state.selectionId, patch);
        this.commitDocument(nextDocument, {
            reason: `inspector.${field}`,
            selectionId: this.state.selectionId
        });
    }

    async applyCanvasInspectorValues() {
        const widthInput = this.elements.inspectorContent.querySelector("[data-field='canvas-width']");
        const heightInput = this.elements.inspectorContent.querySelector("[data-field='canvas-height']");
        const backgroundInput = this.elements.inspectorContent.querySelector("[data-field='canvas-background']");
        const nextWidth = Number(widthInput?.value);
        const nextHeight = Number(heightInput?.value);
        if (!Number.isFinite(nextWidth) || nextWidth <= 0 || !Number.isFinite(nextHeight) || nextHeight <= 0) {
            this.pushNotice({
                type: NOTICE_TYPE.WARNING,
                title: "Canvas size is invalid",
                body: "Canvas width and height must both be positive finite numbers."
            });
            return;
        }
        let nextDocument = setCanvasSize(this.state.document, nextWidth, nextHeight);
        nextDocument.canvas.background = ensureHexColor(backgroundInput?.value, "#ffffff");
        const outOfBounds = nextDocument.objects.filter((object) => objectExceedsCanvas(object, nextDocument.canvas, this.measureText));
        if (outOfBounds.length > 0) {
            const confirmed = await this.showConfirmDialog({
                title: "Objects will fall outside the new canvas",
                message: `Applying ${nextWidth} x ${nextHeight} will leave ${outOfBounds.length} object${outOfBounds.length === 1 ? "" : "s"} partially or fully outside the document bounds.`,
                details: `Affected object ids: ${outOfBounds.map((object) => object.id).join(", ")}`
            });
            if (!confirmed) {
                this.logger.info("canvas.resize.cancelled", {
                    width: nextWidth,
                    height: nextHeight
                });
                return;
            }
        }
        this.commitDocument(nextDocument, {
            reason: "canvas.resize",
            selectionId: this.state.selectionId
        });
    }

    deleteSelection() {
        if (!this.state.selectionId) {
            return;
        }
        const deletedId = this.state.selectionId;
        const nextDocument = deleteObject(this.state.document, deletedId);
        this.commitDocument(nextDocument, {
            reason: "selection.delete",
            selectionId: null
        });
        this.logger.info("selection.delete", {
            objectId: deletedId
        });
    }

    adjustZoom(multiplier) {
        this.state.viewport = zoomAroundViewportCenter(
            this.state.viewport,
            this.state.document.canvas,
            clamp(this.state.viewport.scale * multiplier, 0.1, 8)
        );
        this.render();
        this.logger.info("viewport.zoom", {
            scale: this.state.viewport.scale
        });
    }

    loadDocument(documentState, { origin, saveSequence, scheduleAutosave, reason }) {
        this.assertDocumentValid(documentState, reason);
        this.state.document = documentState;
        this.state.selectionId = null;
        this.state.tool = TOOL.SELECT;
        this.state.textEdit = null;
        this.state.documentOrigin = origin;
        this.state.nextSaveSequence = saveSequence;
        this.state.latestCommittedSaveSequence = saveSequence;
        this.state.pendingSave = null;
        this.state.saveState = SAVE_STATE.SAVED;
        this.requestViewportReset();
        this.render();
        this.logger.info(reason, this.getDocumentSummary());
        if (scheduleAutosave) {
            this.queueAutosave(reason);
        }
    }

    commitDocument(documentState, { reason, selectionId = this.state.selectionId } = {}) {
        try {
            this.assertDocumentValid(documentState, reason);
        } catch (error) {
            this.reportError("document.commit.failed", error, "The requested change was rejected because it would make the document invalid.");
            this.render();
            return false;
        }
        this.state.document = documentState;
        this.state.selectionId = selectionId && documentState.objects.some((object) => object.id === selectionId)
            ? selectionId
            : null;
        this.render();
        this.logger.info("document.commit", {
            reason,
            selectionId: this.state.selectionId,
            ...this.getDocumentSummary()
        });
        this.queueAutosave(reason);
        return true;
    }

    assertCurrentDocumentValid(context) {
        this.assertDocumentValid(this.state.document, context);
    }

    assertDocumentValid(documentState, context) {
        const errors = validateDocument(documentState);
        if (errors.length > 0) {
            throw new Error(`Document validation failed during ${context}.\n${errors.join("\n")}`);
        }
    }

    queueAutosave(trigger) {
        clearTimeout(this.autosaveTimer);
        if (this.state.storageState === STORAGE_STATE.UNAVAILABLE) {
            this.state.saveState = SAVE_STATE.FAILED;
            this.render();
            this.logger.warn("autosave.skipped.storage-unavailable", {
                trigger
            });
            return;
        }
        const snapshot = cloneDocument(this.state.document);
        const saveSequence = this.state.nextSaveSequence + 1;
        this.state.nextSaveSequence = saveSequence;
        this.state.pendingSave = {
            saveSequence,
            trigger,
            document: snapshot,
            documentOrigin: this.state.documentOrigin,
            viewport: { ...this.state.viewport }
        };
        this.state.saveState = SAVE_STATE.PENDING;
        this.render();
        this.logger.info("autosave.scheduled", {
            trigger,
            saveSequence,
            lineageId: snapshot.metadata.lineageId
        });
        this.autosaveTimer = setTimeout(() => {
            void this.performAutosave(saveSequence);
        }, AUTOSAVE_DEBOUNCE_MS);
    }

    async performAutosave(saveSequence) {
        const pendingSave = this.state.pendingSave;
        if (!pendingSave || pendingSave.saveSequence !== saveSequence) {
            return;
        }
        try {
            const svg = serializeDocumentToSvg(pendingSave.document);
            const projectedBytes = estimateSnapshotBytes(svg);
            const budget = await this.persistence.evaluatePersistenceBudget(projectedBytes);
            if (!budget.supported) {
                this.updateStorageState(STORAGE_STATE.DEGRADED);
                this.pushNotice({
                    type: NOTICE_TYPE.WARNING,
                    title: "Local draft reliability is degraded",
                    body: budget.message,
                    sticky: true
                });
            }
            this.render();
            this.logger.info("autosave.start", {
                saveSequence,
                projectedBytes,
                trigger: pendingSave.trigger
            });
            const recordId = await this.persistence.saveDraft({
                lineageId: pendingSave.document.metadata.lineageId,
                saveSequence,
                savedAt: nowIso(),
                documentOrigin: pendingSave.documentOrigin,
                viewport: pendingSave.viewport,
                svg
            });
            if (saveSequence <= this.state.latestCommittedSaveSequence) {
                await this.persistence.deleteDraftById(recordId);
                this.logger.warn("autosave.discarded.stale", {
                    saveSequence,
                    latestCommittedSaveSequence: this.state.latestCommittedSaveSequence,
                    recordId
                });
                return;
            }
            this.state.latestCommittedSaveSequence = saveSequence;
            if (this.state.pendingSave?.saveSequence === saveSequence) {
                this.state.pendingSave = null;
                this.state.saveState = SAVE_STATE.SAVED;
            } else {
                this.state.saveState = SAVE_STATE.PENDING;
            }
            this.render();
            this.logger.info("autosave.success", {
                saveSequence,
                recordId,
                projectedBytes
            });
        } catch (error) {
            if (this.state.pendingSave?.saveSequence && this.state.pendingSave.saveSequence > saveSequence) {
                this.state.saveState = SAVE_STATE.PENDING;
                this.render();
                this.logger.warn("autosave.failed.superseded", {
                    saveSequence,
                    message: String(error)
                });
                return;
            }
            this.state.saveState = SAVE_STATE.FAILED;
            this.render();
            this.reportError("autosave.failed", error, "Autosave failed. Editing continues in memory, but recent changes may not be recoverable after refresh.");
        }
    }

    async warnIfPersistenceBudgetLooksRisky(documentState, reason) {
        if (this.state.storageState === STORAGE_STATE.UNAVAILABLE) {
            return;
        }
        const svg = serializeDocumentToSvg(documentState);
        const projectedBytes = estimateSnapshotBytes(svg);
        const budget = await this.persistence.evaluatePersistenceBudget(projectedBytes);
        this.logger.info("persistence.budget.checked", {
            reason,
            projectedBytes,
            supported: budget.supported,
            state: budget.state
        });
        if (!budget.supported) {
            this.updateStorageState(STORAGE_STATE.DEGRADED);
            this.pushNotice({
                type: NOTICE_TYPE.WARNING,
                title: "Recovery reliability warning",
                body: `Before ${reason}, the next retained snapshot is already projected to be risky. ${budget.message}`,
                sticky: true
            });
            this.render();
        }
    }

    async confirmReplaceCurrentDocument(actionLabel) {
        if (!documentHasContent(this.state.document)) {
            return true;
        }
        const details = this.state.documentOrigin === DOCUMENT_ORIGIN.RECOVERED
            ? "The active view came from recovered local retained drafts. Replacing it means this view will be discarded and only retained snapshots remain available for future recovery."
            : "The current in-memory document will be replaced. Autosave snapshots remain separate from exported files.";
        return this.showConfirmDialog({
            title: "Replace the current document?",
            message: `Continuing will ${actionLabel} and replace the current in-memory document.`,
            details
        });
    }

    async showConfirmDialog({ title, message, details = "" }) {
        const dialog = this.elements.confirmDialog;
        if (typeof dialog.showModal !== "function") {
            return window.confirm(`${title}\n\n${message}\n\n${details}`.trim());
        }
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        this.elements.confirmDetails.textContent = details;
        dialog.returnValue = "cancel";
        dialog.showModal();
        const result = await new Promise((resolve) => {
            const handleClose = () => {
                dialog.removeEventListener("close", handleClose);
                resolve(dialog.returnValue === "confirm");
            };
            dialog.addEventListener("close", handleClose);
        });
        this.logger.info("dialog.confirm.resolved", {
            title,
            confirmed: result
        });
        return result;
    }

    pushNotice({ type, title, body, sticky = false }) {
        const notice = {
            id: ++this.noticeCounter,
            type,
            title,
            body
        };
        this.state.notices = [...this.state.notices, notice].slice(-6);
        this.renderNotices();
        if (!sticky) {
            setTimeout(() => {
                this.dismissNotice(notice.id);
            }, type === NOTICE_TYPE.ERROR ? 10000 : 7000);
        }
    }

    dismissNotice(noticeId) {
        this.state.notices = this.state.notices.filter((notice) => notice.id !== noticeId);
        this.renderNotices();
    }

    async copyLogs() {
        try {
            await navigator.clipboard.writeText(this.logger.formatEntries());
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "Activity log copied",
                body: "The current verbose log was copied to the clipboard."
            });
        } catch (error) {
            this.reportError("logs.copy.failed", error, "The activity log could not be copied to the clipboard.");
        }
    }

    async copySelectionToClipboard({ clipboardData, deleteAfterCopy, source }) {
        const selectedObject = this.getSelectedObject();
        if (!selectedObject) {
            return;
        }
        this.internalClipboard = {
            kind: "internal-object",
            object: structuredClone(selectedObject),
            preferLocal: false
        };
        let systemWritten = false;
        try {
            if (clipboardData) {
                writeInternalObjectToDataTransfer(clipboardData, selectedObject);
                systemWritten = true;
            } else {
                const result = await writeInternalObjectToClipboard(selectedObject);
                systemWritten = result.systemWritten;
            }
        } catch (error) {
            this.logger.warn("clipboard.selection.write.degraded", {
                source,
                objectId: selectedObject.id,
                message: String(error)
            });
        }
        this.logger.info(deleteAfterCopy ? "clipboard.cut.success" : "clipboard.copy.success", {
            source,
            objectId: selectedObject.id,
            systemWritten,
            mirrorWritten: true
        });
        this.internalClipboard.preferLocal = !systemWritten;
        this.pushNotice({
            type: systemWritten ? NOTICE_TYPE.INFO : NOTICE_TYPE.WARNING,
            title: deleteAfterCopy ? "Object cut" : "Object copied",
            body: systemWritten
                ? `The selected ${selectedObject.type} is on the clipboard and ready to paste.`
                : "The selected object is available for paste inside this editor tab. The browser did not allow a full system clipboard write."
        });
        if (deleteAfterCopy) {
            this.deleteSelection();
        }
    }

    async resolvePastePayload() {
        try {
            if (this.internalClipboard?.preferLocal) {
                return this.internalClipboard;
            }
            const payload = await readClipboardPayload();
            return payload ?? this.internalClipboard;
        } catch (error) {
            if (this.internalClipboard) {
                this.logger.warn("clipboard.read.failed.using-mirror", {
                    message: String(error)
                });
                return this.internalClipboard;
            }
            throw error;
        }
    }

    async applyClipboardPayload(payload, mode) {
        this.logger.info("clipboard.payload.received", {
            mode,
            kind: payload.kind
        });
        if (mode === "replace-document") {
            if (payload.kind !== "editor-svg-document") {
                throw new Error("Only editor SVG documents can replace the current document.");
            }
            const nextDocument = parseEditorSvg(payload.svgString);
            const confirmed = await this.confirmReplaceCurrentDocument("paste a document from the clipboard");
            if (!confirmed) {
                return;
            }
            this.loadDocument(nextDocument, {
                origin: DOCUMENT_ORIGIN.OPENED,
                saveSequence: 0,
                scheduleAutosave: true,
                reason: "document.pasted"
            });
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "Document pasted",
                body: "The clipboard SVG replaced the current in-memory document."
            });
            return;
        }
        if (payload.kind === "internal-object") {
            const { document: nextDocument, object } = cloneObjectForPaste(this.state.document, payload.object);
            this.commitDocument(nextDocument, {
                reason: "clipboard.paste.object",
                selectionId: object.id
            });
            return;
        }
        if (payload.kind === "image") {
            await this.insertClipboardImage(payload.blob);
            return;
        }
        if (payload.kind === "editor-svg-document") {
            this.pushNotice({
                type: NOTICE_TYPE.INFO,
                title: "SVG pasted as an image",
                body: "Editable editor SVG on the clipboard was inserted as an image. Use Paste Document to reopen it as a document."
            });
            await this.insertClipboardSvg(payload.svgString);
            return;
        }
        if (payload.kind === "generic-svg") {
            await this.insertClipboardSvg(payload.svgString);
            return;
        }
        if (payload.kind === "text") {
            this.insertClipboardText(payload.text);
            return;
        }
        throw new Error(`Unsupported clipboard payload kind: ${payload.kind}`);
    }

    async insertClipboardImage(blob) {
        const href = await readBlobAsDataUrl(blob);
        const dimensions = await loadImageDimensions(href);
        let nextDocument = addImage(this.state.document, {
            href,
            naturalWidth: dimensions.width,
            naturalHeight: dimensions.height
        });
        await this.warnIfPersistenceBudgetLooksRisky(nextDocument, "clipboard image paste");
        this.commitDocument(nextDocument, {
            reason: "clipboard.paste.image",
            selectionId: nextDocument.objects.at(-1)?.id ?? null
        });
    }

    async insertClipboardSvg(svgString) {
        const href = await readBlobAsDataUrl(new Blob([svgString], { type: MIME_TYPES.SVG }));
        const dimensions = await loadImageDimensions(href);
        let nextDocument = addImage(this.state.document, {
            href,
            naturalWidth: dimensions.width,
            naturalHeight: dimensions.height
        });
        await this.warnIfPersistenceBudgetLooksRisky(nextDocument, "clipboard SVG paste");
        this.commitDocument(nextDocument, {
            reason: "clipboard.paste.svg-image",
            selectionId: nextDocument.objects.at(-1)?.id ?? null
        });
    }

    insertClipboardText(text) {
        const normalizedText = normalizeTextContent(text).trim();
        if (!normalizedText) {
            this.pushNotice({
                type: NOTICE_TYPE.WARNING,
                title: "Clipboard text was empty",
                body: "The clipboard text payload did not contain visible content to insert."
            });
            return;
        }
        const point = screenToDocument(this.state.viewport, {
            x: this.state.viewport.width / 2,
            y: this.state.viewport.height / 2
        });
        let nextDocument = addText(this.state.document, point);
        const objectId = nextDocument.objects.at(-1)?.id ?? null;
        if (!objectId) {
            return;
        }
        nextDocument = patchObject(nextDocument, objectId, {
            text: normalizedText
        });
        this.commitDocument(nextDocument, {
            reason: "clipboard.paste.text",
            selectionId: objectId
        });
        this.startTextEdit(objectId);
    }

    reportError(eventName, error, userMessage) {
        const detailMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(eventName, {
            message: detailMessage,
            stack: error instanceof Error ? error.stack : null,
            ...this.getDocumentSummary()
        });
        this.pushNotice({
            type: NOTICE_TYPE.ERROR,
            title: "Operation failed",
            body: `${userMessage}\n\nDetails: ${detailMessage}`,
            sticky: true
        });
    }

    updateStorageState(storageState) {
        this.state.storageState = storageState;
        this.persistence.storageState = storageState;
    }

    getDocumentSummary() {
        return {
            objectCount: this.state.document.objects.length,
            canvas: {
                width: this.state.document.canvas.width,
                height: this.state.document.canvas.height
            },
            lineageId: this.state.document.metadata.lineageId,
            latestCommittedSaveSequence: this.state.latestCommittedSaveSequence
        };
    }

    getDocumentOriginText() {
        if (this.state.documentOrigin === DOCUMENT_ORIGIN.OPENED) {
            return "Opened document";
        }
        if (this.state.documentOrigin === DOCUMENT_ORIGIN.RECOVERED) {
            return "Recovered draft";
        }
        return "New document";
    }

    getSaveStateText() {
        if (this.state.saveState === SAVE_STATE.PENDING) {
            return "Saving draft...";
        }
        if (this.state.saveState === SAVE_STATE.FAILED) {
            return "Autosave needs attention";
        }
        return "All changes saved";
    }

    getStorageStateText() {
        if (this.state.storageState === STORAGE_STATE.DEGRADED) {
            return "Storage limited";
        }
        if (this.state.storageState === STORAGE_STATE.UNAVAILABLE) {
            return "Storage unavailable";
        }
        return "Storage ready";
    }

    getSaveStateClass() {
        if (this.state.saveState === SAVE_STATE.FAILED) {
            return "status-error";
        }
        if (this.state.saveState === SAVE_STATE.PENDING) {
            return "status-warning";
        }
        return "status-ok";
    }

    getStorageStateClass() {
        if (this.state.storageState === STORAGE_STATE.UNAVAILABLE) {
            return "status-error";
        }
        if (this.state.storageState === STORAGE_STATE.DEGRADED) {
            return "status-warning";
        }
        return "status-ok";
    }

    getPasteButtonTitle() {
        if (canReadClipboard()) {
            return "";
        }
        if (this.internalClipboard) {
            return "System clipboard read is unavailable, but the last copied editor object can still be pasted in this tab.";
        }
        return "Clipboard read is not supported in this browser.";
    }
}
