import { clamp, rectOf, makeTextSpan } from "../file-helpers.js";
import {
  clampLineNumberForFile,
  getLineMetricsInPre
} from "./line-navigation.js";

export function createPreviewController({
  state,
  els,
  getFileSection,
  updateControlBar,
  doc = document,
  config
}) {
  const {
    openDelay,
    switchDelay,
    inactiveMs,
    defaultWidth,
    defaultHeight,
    minWidth,
    minHeight,
    viewportMargin,
    gap,
    cacheLimit,
    initialWidthRatio,
    initialHeightRatio
  } = config;

  const previewState = {
    window: null,
    visibleFileId: null,
    visibleLine: null,
    pending: null,
    hoverEntry: null,
    hoverFileId: null,
    hoverLine: null,
    hoverLoaded: false,
    lastPlacement: null,
    cache: new Map()
  };

  class PreviewWindow {
    constructor(options = {}) {
      this.state = {
        x: 40,
        y: 40,
        width: options.width ?? defaultWidth,
        height: options.height ?? defaultHeight,
        minWidth: options.minWidth ?? minWidth,
        minHeight: options.minHeight ?? minHeight,
        margin: options.margin ?? viewportMargin,
        gap: options.gap ?? gap,
        destroyAfterMs: options.destroyAfterMs ?? inactiveMs
      };

      this._destroyTimer = null;
      this._activePointerId = null;
      this._drag = null;
      this._resize = null;
      this._teardownOutsideClick = null;
      this.onDestroy = null;

      this.root = doc.createElement("div");
      this.root.className = "pw-root";
      this.root.setAttribute("role", "dialog");
      this.root.setAttribute("aria-label", "Preview");

      this.header = doc.createElement("div");
      this.header.className = "pw-header";

      this.title = makeTextSpan("pw-title", "Preview", doc);
      this.header.appendChild(this.title);

      this.content = doc.createElement("div");
      this.content.className = "pw-content";

      this.root.appendChild(this.header);
      this.root.appendChild(this.content);

      doc.body.appendChild(this.root);

      this.setupDragHandlers();
      this.setupResizeHandlers();
      this.installActivityListeners();
      this.updateGeometry();
      this.scheduleDestroy(this.state.destroyAfterMs);
    }

    installActivityListeners() {
      const bump = () => this.bumpActivity();
      this.root.addEventListener("pointerenter", bump);
      this.root.addEventListener("pointermove", bump);
      this.root.addEventListener("wheel", bump, { passive: true });
    }

    bumpActivity() {
      this.scheduleDestroy(this.state.destroyAfterMs);
    }

    destroy() {
      this.stopResize();
      this.cancelDrag();
      if (this._destroyTimer) {
        clearTimeout(this._destroyTimer);
        this._destroyTimer = null;
      }
      if (this.root && this.root.isConnected) {
        this.root.remove();
      }
      if (this._teardownOutsideClick) {
        this._teardownOutsideClick();
        this._teardownOutsideClick = null;
      }
      if (typeof this.onDestroy === "function") {
        this.onDestroy();
      }
    }

    scheduleDestroy(ms) {
      if (this._destroyTimer) clearTimeout(this._destroyTimer);
      this._destroyTimer = setTimeout(() => this.destroy(), ms);
    }

    setTitle(text) {
      this.title.textContent = text || "Preview";
    }

    loadContent(node) {
      this.content.replaceChildren();
      if (!node) return;
      this.content.appendChild(node);
    }

    positionWindowNearElement(el, options = {}) {
      const r = rectOf(el);
      const winGap = this.state.gap;
      const margin = this.state.margin;
      const resizeToFit = options.resizeToFit !== false;
      const preferRight = options.preferRight !== false;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const minW = this.state.minWidth;
      const minH = this.state.minHeight;
      const maxW = Math.max(0, vw - margin * 2);
      const maxH = Math.max(0, vh - margin * 2);

      if (!resizeToFit) {
        const width = clamp(this.state.width, minW, maxW);
        const height = clamp(this.state.height, minH, maxH);
        const rightSpace = (vw - margin) - r.right;
        const leftSpace = r.left - margin;
        const belowSpace = (vh - margin) - r.bottom;
        const aboveSpace = r.top - margin;

        let x;
        let y;

        if (preferRight && rightSpace >= width + winGap) x = r.right + winGap;
        else if (leftSpace >= width + winGap) x = r.left - width - winGap;
        else x = clamp(r.left, margin, vw - width - margin);

        if (belowSpace >= height + winGap) y = r.bottom + winGap;
        else if (aboveSpace >= height + winGap) y = r.top - height - winGap;
        else y = clamp(r.top, margin, vh - height - margin);

        this.state.x = clamp(x, margin, vw - width - margin);
        this.state.y = clamp(y, margin, vh - height - margin);
        this.state.width = width;
        this.state.height = height;
        this.updateGeometry();
        return;
      }

      const rightSpace = (vw - margin) - r.right - winGap;
      const leftSpace = r.left - margin - winGap;

      let useRight;
      if (preferRight && rightSpace >= minW) {
        useRight = true;
      } else if (rightSpace >= minW && leftSpace < minW) {
        useRight = true;
      } else if (leftSpace >= minW) {
        useRight = false;
      } else {
        useRight = rightSpace >= leftSpace;
      }

      let width = useRight ? rightSpace : leftSpace;
      width = clamp(width, minW, maxW);
      const height = clamp(maxH, minH, maxH);

      let x = useRight ? r.right + winGap : r.left - width - winGap;
      x = clamp(x, margin, vw - width - margin);
      const y = clamp(margin, margin, vh - height - margin);

      this.state.x = x;
      this.state.y = y;
      this.state.width = width;
      this.state.height = height;
      this.updateGeometry();
    }

    updateGeometry() {
      const { x, y, width, height } = this.state;
      this.root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      this.root.style.width = `${Math.round(width)}px`;
      this.root.style.height = `${Math.round(height)}px`;
    }

    clampToViewport() {
      const next = this.applyResizeConstraints({
        x: this.state.x,
        y: this.state.y,
        width: this.state.width,
        height: this.state.height
      });
      this.state.x = next.x;
      this.state.y = next.y;
      this.state.width = next.width;
      this.state.height = next.height;
      this.updateGeometry();
    }

    applyResizeConstraints(next) {
      const margin = this.state.margin;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const maxW = Math.max(0, vw - margin * 2);
      const maxH = Math.max(0, vh - margin * 2);

      const w = clamp(next.width, this.state.minWidth, maxW);
      const h = clamp(next.height, this.state.minHeight, maxH);

      const x = clamp(next.x, margin, vw - w - margin);
      const y = clamp(next.y, margin, vh - h - margin);

      return { x, y, width: w, height: h };
    }

    setupDragHandlers() {
      const onPointerDown = e => {
        if (e.button !== 0) return;
        if (this._resize) return;

        this._activePointerId = e.pointerId;
        this.header.setPointerCapture(e.pointerId);

        this._drag = {
          startX: e.clientX,
          startY: e.clientY,
          startWinX: this.state.x,
          startWinY: this.state.y
        };

        this.bumpActivity();
        e.preventDefault();
      };

      const onPointerMove = e => {
        if (!this._drag) return;
        if (e.pointerId !== this._activePointerId) return;

        const dx = e.clientX - this._drag.startX;
        const dy = e.clientY - this._drag.startY;

        const next = this.applyResizeConstraints({
          x: this._drag.startWinX + dx,
          y: this._drag.startWinY + dy,
          width: this.state.width,
          height: this.state.height
        });

        this.state.x = next.x;
        this.state.y = next.y;
        this.updateGeometry();
        e.preventDefault();
      };

      const onPointerUp = e => {
        if (!this._drag) return;
        if (e.pointerId !== this._activePointerId) return;

        this.cancelDrag();
        e.preventDefault();
      };

      const onPointerCancel = e => {
        if (!this._drag) return;
        if (e.pointerId !== this._activePointerId) return;

        this.cancelDrag();
      };

      this.header.addEventListener("pointerdown", onPointerDown);
      this.header.addEventListener("pointermove", onPointerMove);
      this.header.addEventListener("pointerup", onPointerUp);
      this.header.addEventListener("pointercancel", onPointerCancel);

      this._teardownOutsideClick = this._installOutsideClickToDismiss();
    }

    cancelDrag() {
      this._drag = null;
      this._activePointerId = null;
    }

    setupResizeHandlers() {
      const handleSize = 10;

      const getHitRegion = e => {
        const r = this.root.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        const onLeft = x >= 0 && x <= handleSize;
        const onRight = x >= r.width - handleSize && x <= r.width;
        const onTop = y >= 0 && y <= handleSize;
        const onBottom = y >= r.height - handleSize && y <= r.height;

        if (onTop && onLeft) return "nw";
        if (onTop && onRight) return "ne";
        if (onBottom && onLeft) return "sw";
        if (onBottom && onRight) return "se";
        if (onTop) return "n";
        if (onBottom) return "s";
        if (onLeft) return "w";
        if (onRight) return "e";
        return null;
      };

      const applyCursorClass = region => {
        this.root.classList.remove(
          "pw-resize-cursor-n",
          "pw-resize-cursor-s",
          "pw-resize-cursor-e",
          "pw-resize-cursor-w",
          "pw-resize-cursor-ne",
          "pw-resize-cursor-nw",
          "pw-resize-cursor-se",
          "pw-resize-cursor-sw"
        );
        if (!region) return;
        this.root.classList.add(`pw-resize-cursor-${region}`);
      };

      const onPointerMoveHover = e => {
        if (this._resize) return;
        const region = getHitRegion(e);
        applyCursorClass(region);
      };

      const onPointerDown = e => {
        if (e.button !== 0) return;
        const region = getHitRegion(e);
        if (!region) return;

        this.startResize(e, region);
        e.preventDefault();
      };

      const onPointerMove = e => {
        if (!this._resize) return;
        if (e.pointerId !== this._resize.pointerId) return;
        this.performResize(e);
        e.preventDefault();
      };

      const onPointerUp = e => {
        if (!this._resize) return;
        if (e.pointerId !== this._resize.pointerId) return;
        this.stopResize();
        e.preventDefault();
      };

      const onPointerCancel = e => {
        if (!this._resize) return;
        if (e.pointerId !== this._resize.pointerId) return;
        this.cancelResize();
      };

      this.root.addEventListener("pointermove", onPointerMoveHover);
      this.root.addEventListener("pointerdown", onPointerDown);
      this.root.addEventListener("pointermove", onPointerMove);
      this.root.addEventListener("pointerup", onPointerUp);
      this.root.addEventListener("pointercancel", onPointerCancel);
    }

    startResize(e, region) {
      this._resize = {
        pointerId: e.pointerId,
        region,
        startClientX: e.clientX,
        startClientY: e.clientY,
        start: { x: this.state.x, y: this.state.y, width: this.state.width, height: this.state.height }
      };

      this.root.setPointerCapture(e.pointerId);
      this.bumpActivity();
    }

    performResize(e) {
      const rz = this._resize;
      if (!rz) return;

      const dx = e.clientX - rz.startClientX;
      const dy = e.clientY - rz.startClientY;

      let next = { ...rz.start };

      const hasN = rz.region.includes("n");
      const hasS = rz.region.includes("s");
      const hasW = rz.region.includes("w");
      const hasE = rz.region.includes("e");

      if (hasE) next.width = rz.start.width + dx;
      if (hasS) next.height = rz.start.height + dy;

      if (hasW) {
        next.width = rz.start.width - dx;
        next.x = rz.start.x + dx;
      }
      if (hasN) {
        next.height = rz.start.height - dy;
        next.y = rz.start.y + dy;
      }

      next = this.applyResizeConstraints(next);

      this.state.x = next.x;
      this.state.y = next.y;
      this.state.width = next.width;
      this.state.height = next.height;
      this.updateGeometry();
    }

    stopResize() {
      this._resize = null;
    }

    cancelResize() {
      const rz = this._resize;
      if (!rz) return;

      const snap = this.applyResizeConstraints(rz.start);
      this.state.x = snap.x;
      this.state.y = snap.y;
      this.state.width = snap.width;
      this.state.height = snap.height;
      this.updateGeometry();

      this._resize = null;
    }

    _installOutsideClickToDismiss() {
      const onPointerDown = e => {
        if (!this.root.isConnected) return;
        if (this.root.contains(e.target)) return;
        this.destroy();
      };

      doc.addEventListener("pointerdown", onPointerDown, true);
      return () => doc.removeEventListener("pointerdown", onPointerDown, true);
    }
  }

  function ensurePreviewWindow() {
    if (previewState.window && previewState.window.root.isConnected) {
      return { win: previewState.window, created: false, usedLastPlacement: false };
    }
    const win = new PreviewWindow();
    const usedLastPlacement = applyLastPlacement(win);
    if (!usedLastPlacement) {
      setInitialPreviewPlacement(win);
    }
    win.onDestroy = () => {
      storePreviewPlacement(win);
      previewState.window = null;
      previewState.visibleFileId = null;
      previewState.visibleLine = null;
      clearPendingPreview();
    };
    previewState.window = win;
    return { win, created: true, usedLastPlacement };
  }

  function destroyPreviewWindow() {
    if (!previewState.window) return;
    storePreviewPlacement(previewState.window);
    previewState.window.destroy();
    previewState.window = null;
    previewState.visibleFileId = null;
    previewState.visibleLine = null;
    previewState.hoverLine = null;
    clearPendingPreview();
  }

  function clearPreviewCache() {
    previewState.cache.clear();
  }

  function prunePreviewCache() {
    if (previewState.cache.size <= cacheLimit) return;
    const entries = [...previewState.cache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    const excess = entries.length - cacheLimit;
    for (let i = 0; i < excess; i += 1) {
      previewState.cache.delete(entries[i][0]);
    }
  }

  function getPreviewSourceElement(fileId) {
    const section = getFileSection(fileId);
    if (!section) return null;
    const pre = section.querySelector("pre");
    if (!pre) return null;
    const code = pre.querySelector("code");
    if (!code) return null;
    const text = code.textContent || "";
    if (!text) {
      const file = state.files.find(item => item.id === fileId);
      if (file && file.size > 0) return null;
    }
    return pre;
  }

  function getPreviewClone(fileId, sourceEl) {
    const cached = previewState.cache.get(fileId);
    if (cached && cached.source === sourceEl && cached.clone) {
      cached.lastUsed = Date.now();
      return cached.clone;
    }
    const clone = sourceEl.cloneNode(true);
    previewState.cache.set(fileId, { source: sourceEl, clone, lastUsed: Date.now() });
    prunePreviewCache();
    return clone;
  }

  function getPreviewLabel(entry, fileId) {
    if (entry?.dataset?.filePath) return entry.dataset.filePath;
    const label = entry?.querySelector?.(".toc-link, .toc-text, .node-label");
    if (label?.textContent) return label.textContent.trim();
    if (entry?.textContent) return entry.textContent.trim();
    const file = state.files.find(item => item.id === fileId);
    return file?.path || "Preview";
  }

  function getPreviewTitle(entry, fileId) {
    const label = getPreviewLabel(entry, fileId);
    if (!label) return "PREVIEW";
    const parts = label.split(/[\\/]/).filter(Boolean);
    const name = parts.length ? parts[parts.length - 1] : label;
    return `👀 PREVIEW: ${name}`;
  }

  function clearPendingPreview() {
    if (previewState.pending?.timer) {
      clearTimeout(previewState.pending.timer);
    }
    previewState.pending = null;
  }

  function getVisiblePaneMetrics() {
    const margin = viewportMargin;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pane = els.main;
    if (!pane) {
      return { top: margin, height: Math.max(0, vh - margin * 2), width: Math.max(0, vw - margin * 2) };
    }
    const rect = pane.getBoundingClientRect();
    const top = clamp(rect.top, margin, vh - margin);
    const bottom = clamp(rect.bottom, margin, vh - margin);
    const height = Math.max(0, bottom - top);
    const width = Math.max(0, Math.min(rect.width, vw - margin * 2));
    return { top, height, width };
  }

  function setInitialPreviewPlacement(win) {
    if (!win) return;
    const margin = win.state.margin;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.max(0, vw - margin * 2);
    const maxH = Math.max(0, vh - margin * 2);

    const pane = getVisiblePaneMetrics();
    const width = clamp(pane.width * initialWidthRatio, win.state.minWidth, maxW);
    const height = clamp(pane.height * initialHeightRatio, win.state.minHeight, maxH);

    const x = clamp(vw - margin - width, margin, vw - width - margin);
    const y = clamp(pane.top + (pane.height - height) / 2, margin, vh - height - margin);

    win.state.x = x;
    win.state.y = y;
    win.state.width = width;
    win.state.height = height;
    win.updateGeometry();
    win.clampToViewport();
    storePreviewPlacement(win);
  }

  function storePreviewPlacement(win) {
    if (!win) return;
    previewState.lastPlacement = {
      x: win.state.x,
      y: win.state.y,
      width: win.state.width,
      height: win.state.height
    };
  }

  function applyLastPlacement(win) {
    if (!previewState.lastPlacement) return false;
    const { x, y, width, height } = previewState.lastPlacement;
    win.state.x = x;
    win.state.y = y;
    win.state.width = width;
    win.state.height = height;
    win.updateGeometry();
    win.clampToViewport();
    storePreviewPlacement(win);
    return true;
  }

  function getPreviewLineFromEntry(entry, fileId) {
    const raw = entry?.dataset?.line;
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return null;
    const file = state.files.find(item => item.id === fileId);
    const clamped = clampLineNumberForFile(file, parsed);
    if (!clamped) return null;
    return clamped;
  }

  function clearPreviewLineMarker(root) {
    if (!root?.querySelectorAll) return;
    const markers = root.querySelectorAll(".ref-preview-marker");
    markers.forEach(marker => marker.remove());
  }

  function clearPreviewLineMarkersInCache() {
    previewState.cache.forEach(entry => {
      if (!entry?.clone) return;
      clearPreviewLineMarker(entry.clone);
    });
    if (previewState.window?.content) clearPreviewLineMarker(previewState.window.content);
  }

  function applyPreviewLineTarget(win, clone, fileId, lineNumber) {
    if (!win || !clone || !Number.isFinite(lineNumber)) return;
    const file = state.files.find(item => item.id === fileId);
    const safeLine = clampLineNumberForFile(file, lineNumber);
    if (!safeLine) return;
    const pre = clone.matches?.("pre") ? clone : clone.querySelector?.("pre");
    if (!pre) return;
    const code = pre.querySelector("code");
    const metrics = getLineMetricsInPre({
      doc,
      pre,
      code,
      file,
      lineNumber: safeLine
    });
    if (!metrics) return;

    const markerTop = metrics.top;
    const markerHeight = Math.max(1, Math.round(metrics.height));
    const marker = doc.createElement("div");
    marker.className = "ref-preview-marker";
    marker.style.top = `${markerTop}px`;
    marker.style.height = `${markerHeight}px`;
    pre.appendChild(marker);

    const content = win.content;
    const targetOffset = pre.offsetTop + markerTop;
    const centered = targetOffset - ((content.clientHeight - markerHeight) / 2);
    const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight);
    content.scrollTop = clamp(centered, 0, maxScroll);
  }

  function showPreviewForEntry(entry, fileId, lineNumber = null) {
    if (!state.preview.enabled) return false;
    const source = getPreviewSourceElement(fileId);
    if (!source) return false;
    const { win } = ensurePreviewWindow();
    const clone = getPreviewClone(fileId, source);
    clone.classList.toggle("nowrap", !state.settings.wrap);
    clearPreviewLineMarkersInCache();
    clearPreviewLineMarker(clone);
    win.setTitle(getPreviewTitle(entry, fileId));
    win.loadContent(clone);
    if (Number.isFinite(lineNumber)) {
      applyPreviewLineTarget(win, clone, fileId, lineNumber);
    } else {
      win.content.scrollTop = 0;
    }
    win.bumpActivity();
    previewState.visibleFileId = fileId;
    previewState.visibleLine = Number.isFinite(lineNumber) ? lineNumber : null;
    previewState.hoverLoaded = true;
    storePreviewPlacement(win);
    return true;
  }

  function schedulePreviewOpen(entry, fileId, lineNumber, delayMs) {
    clearPendingPreview();
    const timer = setTimeout(() => {
      if (!previewState.pending) return;
      if (
        previewState.pending.entry !== entry ||
        previewState.pending.fileId !== fileId ||
        previewState.pending.lineNumber !== lineNumber
      ) return;
      previewState.pending = null;
      if (!entry.isConnected) return;
      if (
        previewState.hoverEntry !== entry ||
        previewState.hoverFileId !== fileId ||
        previewState.hoverLine !== lineNumber
      ) return;
      if (!state.preview.enabled) return;
      try {
        showPreviewForEntry(entry, fileId, lineNumber);
      } catch (err) {
        console.warn("Preview open failed", err);
      }
    }, delayMs);
    previewState.pending = { entry, fileId, lineNumber, timer };
  }

  function getPreviewAnchorFromEvent(event) {
    const anchor = event.target.closest("a[data-file-id]");
    if (!anchor) return null;
    if (els.tocList?.contains(anchor) || els.treeContainer?.contains(anchor)) {
      return anchor;
    }
    const symbolPanelRoot = state.symbolRefs.ui.activePanel?.root || null;
    if (symbolPanelRoot?.contains(anchor)) {
      return anchor;
    }
    return null;
  }

  function handlePreviewPointerOver(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!state.preview.enabled) return;
    try {
      const entry = getPreviewAnchorFromEvent(event);
      if (!entry || entry.contains(event.relatedTarget)) return;
      const fileId = entry.dataset.fileId;
      if (!fileId) return;
      const lineNumber = getPreviewLineFromEntry(entry, fileId);
      clearPendingPreview();
      previewState.hoverEntry = entry;
      previewState.hoverFileId = fileId;
      previewState.hoverLine = lineNumber;
      previewState.hoverLoaded = Boolean(getPreviewSourceElement(fileId));
      if (!previewState.hoverLoaded) return;
      const sameVisibleTarget = (
        previewState.window &&
        previewState.visibleFileId === fileId &&
        previewState.visibleLine === lineNumber
      );
      if (sameVisibleTarget) {
        if (previewState.hoverLoaded) previewState.window.bumpActivity();
        return;
      }
      if (previewState.window && previewState.hoverLoaded) {
        previewState.window.bumpActivity();
      }
      const delay = previewState.window ? switchDelay : openDelay;
      schedulePreviewOpen(entry, fileId, lineNumber, delay);
    } catch (err) {
      console.warn("Preview hover failed", err);
    }
  }

  function handlePreviewPointerOut(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!state.preview.enabled) return;
    try {
      const entry = getPreviewAnchorFromEvent(event);
      if (!entry || entry.contains(event.relatedTarget)) return;
      if (previewState.hoverEntry !== entry) return;
      previewState.hoverEntry = null;
      previewState.hoverFileId = null;
      previewState.hoverLine = null;
      previewState.hoverLoaded = false;
      clearPendingPreview();
    } catch (err) {
      console.warn("Preview hover cleanup failed", err);
    }
  }

  function handlePreviewPointerMove(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!state.preview.enabled) return;
    try {
      if (!previewState.window) return;
      const entry = getPreviewAnchorFromEvent(event);
      if (!entry || entry !== previewState.hoverEntry) return;
      if (previewState.hoverLoaded) previewState.window.bumpActivity();
    } catch (err) {
      console.warn("Preview hover activity failed", err);
    }
  }

  function attachHoverPreviewHandlers(container) {
    if (!container || container.dataset.previewHoverBound === "true") return;
    container.addEventListener("pointerover", handlePreviewPointerOver);
    container.addEventListener("pointerout", handlePreviewPointerOut);
    container.addEventListener("pointermove", handlePreviewPointerMove);
    container.dataset.previewHoverBound = "true";
  }

  function setupHoverPreview() {
    if (els.tocList) attachHoverPreviewHandlers(els.tocList);
    if (els.treeContainer) attachHoverPreviewHandlers(els.treeContainer);
  }

  function createPanelWindow(options = {}) {
    return new PreviewWindow(options);
  }

  function handlePreviewViewportResize() {
    if (!previewState.window || !previewState.window.root.isConnected) return;
    previewState.window.clampToViewport();
    storePreviewPlacement(previewState.window);
  }

  function setPreviewEnabled(enabled) {
    state.preview.enabled = enabled;
    if (!enabled) {
      destroyPreviewWindow();
      previewState.hoverEntry = null;
      previewState.hoverFileId = null;
      previewState.hoverLine = null;
      previewState.hoverLoaded = false;
    }
    updateControlBar();
  }

  return {
    destroyPreviewWindow,
    clearPreviewCache,
    setupHoverPreview,
    handlePreviewViewportResize,
    setPreviewEnabled,
    attachHoverPreviewHandlers,
    createPanelWindow
  };
}
