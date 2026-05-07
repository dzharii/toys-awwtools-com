javascript:(function quickSketchBookmarklet() {
  "use strict";

  const ROOT_ID = "qs-bookmarklet-root";
  const MAX_Z_INDEX = 2147483647;

  const existingRoot = document.getElementById(ROOT_ID);

  if (existingRoot) {
    if (typeof existingRoot.__qsRaise === "function") {
      existingRoot.__qsRaise();
    } else {
      existingRoot.style.setProperty("z-index", String(MAX_Z_INDEX), "important");
    }

    return;
  }

  runWhenDomIsUsable(bootstrap);

  function runWhenDomIsUsable(callback) {
    if (document.readyState === "loading" && !document.documentElement) {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function bootstrap() {
    const mountParent = document.body || document.documentElement;

    if (!mountParent) {
      console.error("[Quick Sketch] No document root was available.");
      return;
    }

    const host = document.createElement("div");

    host.id = ROOT_ID;
    host.setAttribute("data-quick-sketch", "true");
    setImportant(host.style, "position", "fixed");
    setImportant(host.style, "inset", "0");
    setImportant(host.style, "z-index", String(MAX_Z_INDEX));
    setImportant(host.style, "pointer-events", "none");

    mountParent.appendChild(host);

    let shadow;

    try {
      shadow = host.attachShadow({ mode: "open" });
    } catch (error) {
      console.error("[Quick Sketch] Shadow DOM creation failed.", error);
      renderFallbackError(host);
      return;
    }

    try {
      createQuickSketchApp(host, shadow);
    } catch (error) {
      console.error("[Quick Sketch] Initialization failed.", error);
      host.remove();
    }
  }

  function renderFallbackError(host) {
    host.textContent = "Quick Sketch could not start.";
    setImportant(host.style, "top", "16px");
    setImportant(host.style, "right", "16px");
    setImportant(host.style, "left", "auto");
    setImportant(host.style, "bottom", "auto");
    setImportant(host.style, "width", "260px");
    setImportant(host.style, "height", "auto");
    setImportant(host.style, "padding", "12px 14px");
    setImportant(host.style, "background", "#ffffff");
    setImportant(host.style, "border", "1px solid rgba(0,0,0,0.16)");
    setImportant(host.style, "border-radius", "12px");
    setImportant(host.style, "box-shadow", "0 12px 32px rgba(0,0,0,0.16)");
    setImportant(host.style, "font", "14px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif");
    setImportant(host.style, "color", "#111827");
    setImportant(host.style, "pointer-events", "auto");

    window.setTimeout(function removeFallbackError() {
      host.remove();
    }, 4200);
  }

  function createQuickSketchApp(host, shadow) {
    const CONFIG = {
      initialDocumentWidth: 900,
      initialDocumentHeight: 650,
      defaultPanelWidth: 650,
      defaultPanelHeight: 390,
      minPanelWidth: 390,
      minPanelHeight: 240,
      viewportMargin: 8,
      maxImageSide: 2400,
      maxOutputArea: 16000000,
      maxHistory: 100,
      maxDevicePixelRatio: 2,
      statusDurationMs: 2200,
      toolbarHeight: 44,
      minimumShapeSize: 2,
      selectionMinSize: 4,
      textFontSize: 24,
      textLineHeight: 1.25,
      textFontFamily: "Arial, Helvetica, sans-serif",
      textDefaultWidth: 260,
      textDefaultHeight: 96
    };

    const state = {
      documentWidth: CONFIG.initialDocumentWidth,
      documentHeight: CONFIG.initialDocumentHeight,
      backgroundImage: null,
      operations: [],
      undoStack: [],
      redoStack: [],
      activeTool: "pen",
      activeShapeType: "rectangle",
      strokeColor: "#000000",
      strokeWidth: 2,
      activeStroke: null,
      activeShape: null,
      activeSelectionDrag: null,
      activeSelectionMove: null,
      selection: null,
      textEditor: null,
      windowRect: computeInitialPanelRect(),
      viewportScroll: {
        left: 0,
        top: 0
      },
      objectUrls: new Set()
    };

    const cleanupCallbacks = [];
    let renderFrame = 0;
    let statusTimer = 0;

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          inset: 0;
          z-index: ${MAX_Z_INDEX};
          pointer-events: none;
          color: #111827;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        button, select, input, textarea {
          font: inherit;
        }

        [hidden] {
          display: none !important;
        }

        .qs-panel {
          position: fixed;
          left: var(--qs-left, 16px);
          top: var(--qs-top, 16px);
          width: var(--qs-width, 650px);
          height: var(--qs-height, 390px);
          min-width: ${CONFIG.minPanelWidth}px;
          min-height: ${CONFIG.minPanelHeight}px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          pointer-events: auto;
          background: #f8fafc;
          border: 1px solid rgba(15, 23, 42, 0.16);
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18), 0 3px 8px rgba(15, 23, 42, 0.08);
          user-select: none;
          touch-action: none;
          outline: none;
        }

        .qs-toolbar {
          flex: 0 0 ${CONFIG.toolbarHeight}px;
          min-height: ${CONFIG.toolbarHeight}px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid rgba(15, 23, 42, 0.12);
          white-space: nowrap;
        }

        .qs-drag-zone {
          min-width: 100px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 7px;
          border-radius: 9px;
          color: #111827;
          cursor: grab;
          touch-action: none;
        }

        .qs-drag-zone:active {
          cursor: grabbing;
        }

        .qs-grip {
          width: 14px;
          height: 20px;
          display: grid;
          grid-template-columns: repeat(2, 3px);
          grid-template-rows: repeat(3, 3px);
          gap: 4px;
          align-content: center;
          justify-content: center;
          opacity: 0.85;
        }

        .qs-grip span {
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: #111827;
        }

        .qs-title {
          font-size: 14px;
          line-height: 1;
          font-weight: 650;
          letter-spacing: -0.01em;
        }

        .qs-tool-group {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          min-width: 0;
        }

        .qs-spacer {
          flex: 1 1 auto;
          min-width: 4px;
        }

        .qs-separator {
          width: 1px;
          height: 24px;
          background: rgba(15, 23, 42, 0.12);
          margin: 0 1px;
        }

        .qs-button,
        .qs-select {
          height: 32px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #111827;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
        }

        .qs-button {
          min-width: 32px;
          padding: 0 8px;
          cursor: pointer;
        }

        .qs-icon-button {
          width: 32px;
          padding: 0;
        }

        .qs-copy-button {
          min-width: 52px;
          padding: 0 11px;
          font-size: 13px;
          font-weight: 650;
          background: #111827;
          color: #ffffff;
        }

        .qs-cut-button {
          min-width: 34px;
          padding: 0 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .qs-button:hover,
        .qs-select:hover {
          background: rgba(15, 23, 42, 0.08);
        }

        .qs-copy-button:hover {
          background: #000000;
        }

        .qs-button:active {
          transform: translateY(1px);
        }

        .qs-button:focus-visible,
        .qs-select:focus-visible,
        .qs-color-input:focus-visible,
        .qs-text-input:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        .qs-button[disabled],
        .qs-select[disabled] {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .qs-button[disabled]:hover,
        .qs-select[disabled]:hover {
          background: transparent;
        }

        .qs-tool-button.is-active,
        .qs-shape-button.is-active {
          color: #2563eb;
          background: rgba(37, 99, 235, 0.12);
        }

        .qs-button svg {
          width: 18px;
          height: 18px;
          display: block;
          stroke: currentColor;
          fill: none;
        }

        .qs-color-wrap,
        .qs-shape-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .qs-color-button,
        .qs-shape-button {
          width: 32px;
          padding: 0;
        }

        .qs-swatch {
          width: 20px;
          height: 20px;
          border-radius: 999px;
          display: inline-block;
          background: var(--qs-swatch-color, #000000);
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.28);
        }

        .qs-color-menu,
        .qs-shape-menu {
          position: absolute;
          top: 38px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 6;
          padding: 7px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: #ffffff;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
        }

        .qs-color-menu {
          width: 150px;
        }

        .qs-shape-menu {
          width: 216px;
        }

        .qs-color-option,
        .qs-shape-option {
          width: 100%;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 9px;
          padding: 0 7px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #111827;
          cursor: pointer;
          font-size: 13px;
        }

        .qs-color-option:hover,
        .qs-shape-option:hover {
          background: rgba(15, 23, 42, 0.07);
        }

        .qs-shape-option.is-selected {
          color: #2563eb;
          background: rgba(37, 99, 235, 0.1);
          font-weight: 650;
        }

        .qs-shape-option svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
          flex: 0 0 auto;
        }

        .qs-custom-color-row {
          margin-top: 5px;
          padding-top: 6px;
          border-top: 1px solid rgba(15, 23, 42, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 13px;
          color: #334155;
        }

        .qs-color-input {
          width: 36px;
          height: 28px;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
        }

        .qs-select {
          width: 54px;
          padding: 0 5px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          appearance: auto;
          background: transparent;
        }

        .qs-viewport {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          background: #eef2f7;
          overscroll-behavior: contain;
          scrollbar-gutter: stable both-edges;
        }

        .qs-surface {
          position: relative;
          width: ${CONFIG.initialDocumentWidth}px;
          height: ${CONFIG.initialDocumentHeight}px;
        }

        .qs-canvas {
          display: block;
          width: ${CONFIG.initialDocumentWidth}px;
          height: ${CONFIG.initialDocumentHeight}px;
          background: #ffffff;
          cursor: crosshair;
          touch-action: none;
          user-select: none;
          -webkit-user-select: none;
        }

        .qs-canvas.is-eraser {
          cursor: cell;
        }

        .qs-canvas.is-selection {
          cursor: crosshair;
        }

        .qs-canvas.is-text {
          cursor: text;
        }

        .qs-selection {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 4;
          border: 1px dashed #2563eb;
          background: rgba(37, 99, 235, 0.08);
          pointer-events: none;
          display: none;
        }

        .qs-selection.is-moving {
          background: rgba(37, 99, 235, 0.02);
          border-color: #111827;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.9);
        }

        .qs-selection-canvas {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: none;
        }

        .qs-text-editor {
          position: absolute;
          z-index: 5;
          min-width: 180px;
          min-height: 82px;
          border: 1px solid #2563eb;
          border-radius: 10px;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
          overflow: hidden;
          pointer-events: auto;
        }

        .qs-text-input {
          width: 100%;
          min-width: 180px;
          height: 100%;
          min-height: 54px;
          resize: both;
          border: 0;
          outline: 0;
          padding: 8px 10px;
          color: var(--qs-text-color, #000000);
          background: transparent;
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${CONFIG.textFontSize}px;
          line-height: ${CONFIG.textLineHeight};
        }

        .qs-text-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          padding: 6px;
          border-top: 1px solid rgba(15, 23, 42, 0.1);
          background: #ffffff;
        }

        .qs-text-action {
          height: 26px;
          min-width: 44px;
          border: 0;
          border-radius: 8px;
          padding: 0 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .qs-text-done {
          background: #111827;
          color: #ffffff;
        }

        .qs-text-cancel {
          background: rgba(15, 23, 42, 0.08);
          color: #111827;
        }

        .qs-resize-handle {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 22px;
          height: 22px;
          z-index: 7;
          cursor: nwse-resize;
          pointer-events: auto;
          touch-action: none;
          border-bottom-right-radius: 14px;
          background:
            linear-gradient(135deg, transparent 0 48%, rgba(15, 23, 42, 0.42) 49% 52%, transparent 53%),
            linear-gradient(135deg, transparent 0 62%, rgba(15, 23, 42, 0.28) 63% 66%, transparent 67%);
          background-size: 16px 16px, 10px 10px;
          background-position: 4px 4px, 8px 8px;
          background-repeat: no-repeat;
        }

        .qs-status {
          position: absolute;
          left: 50%;
          bottom: 12px;
          z-index: 8;
          transform: translateX(-50%);
          max-width: calc(100% - 32px);
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(17, 24, 39, 0.94);
          color: #ffffff;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.2;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.2);
          pointer-events: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 650px) {
          .qs-drag-zone {
            min-width: 58px;
            gap: 6px;
          }

          .qs-title {
            display: none;
          }

          .qs-toolbar {
            gap: 2px;
            padding-inline: 5px;
          }

          .qs-separator {
            margin-inline: 0;
          }

          .qs-copy-button {
            min-width: 44px;
            padding-inline: 9px;
          }

          .qs-cut-button {
            min-width: 32px;
            padding-inline: 6px;
          }
        }
      </style>

      <section id="qsPanel" class="qs-panel" role="region" aria-label="Quick Sketch floating utility" tabindex="-1">
        <div id="qsToolbar" class="qs-toolbar">
          <div id="qsDragZone" class="qs-drag-zone" title="Drag Sketch window">
            <span class="qs-grip" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></span>
            <span id="qsTitle" class="qs-title">Sketch</span>
          </div>

          <div class="qs-tool-group" role="toolbar" aria-label="Sketch tools">
            <button id="qsPenButton" class="qs-button qs-icon-button qs-tool-button is-active" type="button" title="Pen" aria-label="Pen" aria-pressed="true">${svgIcon("pen")}</button>
            <button id="qsEraserButton" class="qs-button qs-icon-button qs-tool-button" type="button" title="Eraser" aria-label="Eraser" aria-pressed="false">${svgIcon("eraser")}</button>
            <button id="qsSelectButton" class="qs-button qs-icon-button qs-tool-button" type="button" title="Rectangle selection" aria-label="Rectangle selection" aria-pressed="false">${svgIcon("select")}</button>
            <button id="qsTextButton" class="qs-button qs-icon-button qs-tool-button" type="button" title="Text" aria-label="Text" aria-pressed="false">${svgIcon("text")}</button>

            <div id="qsShapeWrap" class="qs-shape-wrap">
              <button id="qsShapeButton" class="qs-button qs-shape-button" type="button" title="Shape: Rectangle" aria-label="Choose shape tool" aria-haspopup="menu" aria-expanded="false" aria-pressed="false">${svgIcon("shapeRectangle")}</button>
              <div id="qsShapeMenu" class="qs-shape-menu" role="menu" hidden>
                <button class="qs-shape-option" type="button" data-shape="line" role="menuitem">${svgIcon("shapeLine")}<span>Line</span></button>
                <button class="qs-shape-option" type="button" data-shape="arrow" role="menuitem">${svgIcon("shapeArrow")}<span>Arrow</span></button>
                <button class="qs-shape-option is-selected" type="button" data-shape="rectangle" role="menuitem">${svgIcon("shapeRectangle")}<span>Rectangle</span></button>
                <button class="qs-shape-option" type="button" data-shape="filledRectangle" role="menuitem">${svgIcon("shapeFilledRectangle")}<span>Solid rectangle</span></button>
                <button class="qs-shape-option" type="button" data-shape="ellipse" role="menuitem">${svgIcon("shapeEllipse")}<span>Ellipse / circle</span></button>
                <button class="qs-shape-option" type="button" data-shape="filledEllipse" role="menuitem">${svgIcon("shapeFilledEllipse")}<span>Solid ellipse / circle</span></button>
                <button class="qs-shape-option" type="button" data-shape="roundedRectangle" role="menuitem">${svgIcon("shapeRoundedRectangle")}<span>Rounded rectangle</span></button>
                <button class="qs-shape-option" type="button" data-shape="filledRoundedRectangle" role="menuitem">${svgIcon("shapeFilledRoundedRectangle")}<span>Solid rounded rectangle</span></button>
              </div>
            </div>

            <div id="qsColorWrap" class="qs-color-wrap">
              <button id="qsColorButton" class="qs-button qs-color-button" type="button" title="Color" aria-label="Choose drawing color" aria-haspopup="menu" aria-expanded="false">
                <span id="qsCurrentSwatch" class="qs-swatch" aria-hidden="true"></span>
              </button>
              <div id="qsColorMenu" class="qs-color-menu" role="menu" hidden>
                <button class="qs-color-option" type="button" data-color="#000000" role="menuitem"><span class="qs-swatch" style="--qs-swatch-color:#000000"></span><span>Black</span></button>
                <button class="qs-color-option" type="button" data-color="#ef4444" role="menuitem"><span class="qs-swatch" style="--qs-swatch-color:#ef4444"></span><span>Red</span></button>
                <button class="qs-color-option" type="button" data-color="#2563eb" role="menuitem"><span class="qs-swatch" style="--qs-swatch-color:#2563eb"></span><span>Blue</span></button>
                <label class="qs-custom-color-row">
                  <span>Custom</span>
                  <input id="qsColorInput" class="qs-color-input" type="color" value="#000000" aria-label="Custom drawing color">
                </label>
              </div>
            </div>

            <select id="qsWidthSelect" class="qs-select" title="Stroke width" aria-label="Stroke width">
              <option value="1">1px</option>
              <option value="2" selected>2px</option>
              <option value="4">4px</option>
              <option value="8">8px</option>
            </select>
          </div>

          <div class="qs-separator" aria-hidden="true"></div>

          <div class="qs-tool-group" role="toolbar" aria-label="History">
            <button id="qsUndoButton" class="qs-button qs-icon-button" type="button" title="Undo" aria-label="Undo" disabled>${svgIcon("undo")}</button>
            <button id="qsRedoButton" class="qs-button qs-icon-button" type="button" title="Redo" aria-label="Redo" disabled>${svgIcon("redo")}</button>
          </div>

          <div class="qs-spacer"></div>

          <div class="qs-tool-group" role="toolbar" aria-label="Import and export">
            <button id="qsImageButton" class="qs-button qs-icon-button" type="button" title="Paste or import image" aria-label="Paste or import image">${svgIcon("image")}</button>
            <button id="qsCutButton" class="qs-button qs-cut-button" type="button" title="Cut selected region" aria-label="Cut selected region" disabled>Cut</button>
            <button id="qsCopyButton" class="qs-button qs-copy-button" type="button" title="Copy PNG" aria-label="Copy PNG to clipboard">Copy</button>
            <button id="qsDownloadButton" class="qs-button qs-icon-button" type="button" title="Download PNG" aria-label="Download PNG">${svgIcon("download")}</button>
            <button id="qsCloseButton" class="qs-button qs-icon-button" type="button" title="Close" aria-label="Close Quick Sketch">${svgIcon("close")}</button>
          </div>
        </div>

        <div id="qsViewport" class="qs-viewport">
          <div id="qsSurface" class="qs-surface">
            <canvas id="qsCanvas" class="qs-canvas" tabindex="0" aria-label="Sketch canvas"></canvas>
            <div id="qsSelection" class="qs-selection" aria-hidden="true">
              <canvas id="qsSelectionCanvas" class="qs-selection-canvas"></canvas>
            </div>
          </div>
        </div>

        <div id="qsResizeHandle" class="qs-resize-handle" title="Resize Sketch window" aria-hidden="true"></div>
        <div id="qsStatus" class="qs-status" role="status" aria-live="polite" hidden></div>
        <input id="qsFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
      </section>
    `;

    const els = {
      panel: shadow.getElementById("qsPanel"),
      toolbar: shadow.getElementById("qsToolbar"),
      dragZone: shadow.getElementById("qsDragZone"),
      viewport: shadow.getElementById("qsViewport"),
      surface: shadow.getElementById("qsSurface"),
      canvas: shadow.getElementById("qsCanvas"),
      selection: shadow.getElementById("qsSelection"),
      selectionCanvas: shadow.getElementById("qsSelectionCanvas"),
      resizeHandle: shadow.getElementById("qsResizeHandle"),
      penButton: shadow.getElementById("qsPenButton"),
      eraserButton: shadow.getElementById("qsEraserButton"),
      selectButton: shadow.getElementById("qsSelectButton"),
      textButton: shadow.getElementById("qsTextButton"),
      shapeWrap: shadow.getElementById("qsShapeWrap"),
      shapeButton: shadow.getElementById("qsShapeButton"),
      shapeMenu: shadow.getElementById("qsShapeMenu"),
      colorWrap: shadow.getElementById("qsColorWrap"),
      colorButton: shadow.getElementById("qsColorButton"),
      colorMenu: shadow.getElementById("qsColorMenu"),
      colorInput: shadow.getElementById("qsColorInput"),
      currentSwatch: shadow.getElementById("qsCurrentSwatch"),
      widthSelect: shadow.getElementById("qsWidthSelect"),
      undoButton: shadow.getElementById("qsUndoButton"),
      redoButton: shadow.getElementById("qsRedoButton"),
      imageButton: shadow.getElementById("qsImageButton"),
      cutButton: shadow.getElementById("qsCutButton"),
      copyButton: shadow.getElementById("qsCopyButton"),
      downloadButton: shadow.getElementById("qsDownloadButton"),
      closeButton: shadow.getElementById("qsCloseButton"),
      fileInput: shadow.getElementById("qsFileInput"),
      status: shadow.getElementById("qsStatus")
    };

    host.__qsRaise = raisePanel;
    host.__qsClose = closePanel;

    applyPanelRect(state.windowRect);
    updateDocumentSurface();
    updateToolButtons();
    updateShapeButton();
    updateHistoryButtons();
    updateSelectionOverlay();
    wireEvents();
    scheduleRender();
    raisePanel();

    function wireEvents() {
      on(els.panel, "pointerdown", stopHostPropagation);
      on(els.panel, "pointerup", stopHostPropagation);
      on(els.panel, "pointermove", stopHostPropagation);
      on(els.panel, "click", stopHostPropagation);
      on(els.panel, "dblclick", stopHostPropagation);
      on(els.panel, "contextmenu", stopHostPropagation);
      on(els.panel, "dragstart", preventDefaultOnly);
      on(els.viewport, "wheel", stopHostPropagation, { passive: true });
      on(els.viewport, "scroll", handleViewportScroll, { passive: true });
      on(els.dragZone, "pointerdown", beginPanelDrag);
      on(els.resizeHandle, "pointerdown", beginPanelResize);

      on(els.penButton, "click", function activatePen() {
        setActiveTool("pen");
      });

      on(els.eraserButton, "click", function activateEraser() {
        setActiveTool("eraser");
      });

      on(els.selectButton, "click", function activateSelection() {
        setActiveTool("select");
      });

      on(els.textButton, "click", function activateText() {
        setActiveTool("text");
      });

      on(els.shapeButton, "click", toggleShapeMenu);
      on(els.shapeMenu, "click", handleShapeMenuClick);
      on(els.widthSelect, "change", handleWidthChange);
      on(els.colorButton, "click", toggleColorMenu);
      on(els.colorMenu, "click", handleColorMenuClick);
      on(els.colorInput, "input", handleCustomColorInput);
      on(shadow, "pointerdown", handleShadowPointerDown);
      on(els.undoButton, "click", undo);
      on(els.redoButton, "click", redo);
      on(els.imageButton, "click", handlePasteImportClick);
      on(els.cutButton, "click", cutSelectedRegion);
      on(els.copyButton, "click", copyPngToClipboard);
      on(els.downloadButton, "click", downloadPng);
      on(els.closeButton, "click", closePanel);
      on(els.fileInput, "change", handleFileInputChange);
      on(els.canvas, "pointerdown", beginCanvasPointer);
      on(els.canvas, "pointermove", continueCanvasPointer);
      on(els.canvas, "pointerup", finishCanvasPointer);
      on(els.canvas, "pointercancel", finishCanvasPointer);
      on(els.canvas, "lostpointercapture", finishCanvasPointer);
      on(els.canvas, "contextmenu", preventDefaultOnly);
      on(els.panel, "paste", handlePasteEvent);
      on(els.canvas, "paste", handlePasteEvent);
      on(els.panel, "keydown", handlePanelKeydown);
      on(window, "resize", handleWindowResize);
    }

    function on(target, type, listener, options) {
      target.addEventListener(type, listener, options);

      cleanupCallbacks.push(function removeListener() {
        target.removeEventListener(type, listener, options);
      });
    }

    function stopHostPropagation(event) {
      event.stopPropagation();
    }

    function preventDefaultOnly(event) {
      event.preventDefault();
    }

    function handleViewportScroll() {
      state.viewportScroll.left = els.viewport.scrollLeft;
      state.viewportScroll.top = els.viewport.scrollTop;
    }

    function handlePanelKeydown(event) {
      if (state.textEditor && event.key === "Escape") {
        event.preventDefault();
        cancelTextEditor();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        if (!els.shapeMenu.hidden) {
          hideShapeMenu();
          return;
        }

        if (!els.colorMenu.hidden) {
          hideColorMenu();
          return;
        }

        if (state.selection) {
          clearSelection();
          return;
        }

        closePanel();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && state.selection && !isTextEntryTarget(event.target)) {
        event.preventDefault();
        deleteSelectedRegion();
        return;
      }

      const commandKey = event.ctrlKey || event.metaKey;

      if (!commandKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      if (key === "z") {
        event.preventDefault();
        undo();
        return;
      }

      if (key === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if (key === "c" && state.selection && !isTextEntryTarget(event.target)) {
        event.preventDefault();
        copySelectedRegion();
        return;
      }

      if (key === "x" && state.selection && !isTextEntryTarget(event.target)) {
        event.preventDefault();
        cutSelectedRegion();
      }
    }

    function handleShadowPointerDown(event) {
      if (!els.colorWrap.contains(event.target)) {
        hideColorMenu();
      }

      if (!els.shapeWrap.contains(event.target)) {
        hideShapeMenu();
      }
    }

    function raisePanel() {
      setImportant(host.style, "z-index", String(MAX_Z_INDEX));

      try {
        els.panel.focus({ preventScroll: true });
      } catch (error) {
        els.panel.focus();
      }
    }

    function closePanel() {
      if (statusTimer) {
        window.clearTimeout(statusTimer);
      }

      if (renderFrame) {
        window.cancelAnimationFrame(renderFrame);
      }

      removeTextEditor();

      for (const cleanup of cleanupCallbacks.splice(0)) {
        try {
          cleanup();
        } catch (error) {
          console.warn("[Quick Sketch] Cleanup failed.", error);
        }
      }

      for (const url of state.objectUrls) {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn("[Quick Sketch] Object URL cleanup failed.", error);
        }
      }

      state.objectUrls.clear();
      host.remove();
    }

    function computeInitialPanelRect() {
      const viewportWidth = Math.max(window.innerWidth || 0, CONFIG.minPanelWidth + 32);
      const viewportHeight = Math.max(window.innerHeight || 0, CONFIG.minPanelHeight + 32);
      const width = clamp(CONFIG.defaultPanelWidth, CONFIG.minPanelWidth, Math.max(CONFIG.minPanelWidth, viewportWidth - 32));
      const height = clamp(CONFIG.defaultPanelHeight, CONFIG.minPanelHeight, Math.max(CONFIG.minPanelHeight, viewportHeight - 32));
      const left = clamp(viewportWidth - width - 48, 16, Math.max(16, viewportWidth - width - 16));
      const top = clamp(viewportHeight - height - 72, 16, Math.max(16, viewportHeight - height - 16));

      return {
        left,
        top,
        width,
        height
      };
    }

    function applyPanelRect(rect) {
      const safeRect = clampPanelRect(rect);

      state.windowRect = safeRect;
      els.panel.style.setProperty("--qs-left", `${Math.round(safeRect.left)}px`);
      els.panel.style.setProperty("--qs-top", `${Math.round(safeRect.top)}px`);
      els.panel.style.setProperty("--qs-width", `${Math.round(safeRect.width)}px`);
      els.panel.style.setProperty("--qs-height", `${Math.round(safeRect.height)}px`);
    }

    function clampPanelRect(rect) {
      const margin = CONFIG.viewportMargin;
      const viewportWidth = Math.max(window.innerWidth || 0, CONFIG.minPanelWidth + margin * 2);
      const viewportHeight = Math.max(window.innerHeight || 0, CONFIG.minPanelHeight + margin * 2);
      const maxWidth = Math.max(CONFIG.minPanelWidth, viewportWidth - margin * 2);
      const maxHeight = Math.max(CONFIG.minPanelHeight, viewportHeight - margin * 2);
      const width = clamp(rect.width, CONFIG.minPanelWidth, maxWidth);
      const height = clamp(rect.height, CONFIG.minPanelHeight, maxHeight);
      const maxLeft = Math.max(margin, viewportWidth - width - margin);
      const maxTop = Math.max(margin, viewportHeight - height - margin);
      const left = clamp(rect.left, margin, maxLeft);
      const top = clamp(rect.top, margin, maxTop);

      return {
        left,
        top,
        width,
        height
      };
    }

    function beginPanelDrag(event) {
      if (!isPrimaryPointerDown(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      raisePanel();

      const pointerId = event.pointerId;
      const startClientX = event.clientX;
      const startClientY = event.clientY;
      const startRect = { ...state.windowRect };

      try {
        els.dragZone.setPointerCapture(pointerId);
      } catch (error) {
        console.warn("[Quick Sketch] Drag pointer capture failed.", error);
      }

      const move = function moveDraggedPanel(moveEvent) {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        applyPanelRect({
          left: startRect.left + moveEvent.clientX - startClientX,
          top: startRect.top + moveEvent.clientY - startClientY,
          width: startRect.width,
          height: startRect.height
        });
      };

      const end = function endDraggedPanel(endEvent) {
        if (endEvent.pointerId !== pointerId) {
          return;
        }

        endEvent.preventDefault();
        endEvent.stopPropagation();

        try {
          els.dragZone.releasePointerCapture(pointerId);
        } catch (error) {
          void error;
        }

        els.dragZone.removeEventListener("pointermove", move);
        els.dragZone.removeEventListener("pointerup", end);
        els.dragZone.removeEventListener("pointercancel", end);
        els.dragZone.removeEventListener("lostpointercapture", end);
      };

      els.dragZone.addEventListener("pointermove", move);
      els.dragZone.addEventListener("pointerup", end);
      els.dragZone.addEventListener("pointercancel", end);
      els.dragZone.addEventListener("lostpointercapture", end);
    }

    function beginPanelResize(event) {
      if (!isPrimaryPointerDown(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      raisePanel();

      const pointerId = event.pointerId;
      const startClientX = event.clientX;
      const startClientY = event.clientY;
      const startRect = { ...state.windowRect };

      try {
        els.resizeHandle.setPointerCapture(pointerId);
      } catch (error) {
        console.warn("[Quick Sketch] Resize pointer capture failed.", error);
      }

      const move = function moveResizedPanel(moveEvent) {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        const maxWidth = Math.max(CONFIG.minPanelWidth, (window.innerWidth || CONFIG.minPanelWidth) - startRect.left - CONFIG.viewportMargin);
        const maxHeight = Math.max(CONFIG.minPanelHeight, (window.innerHeight || CONFIG.minPanelHeight) - startRect.top - CONFIG.viewportMargin);
        const width = clamp(startRect.width + moveEvent.clientX - startClientX, CONFIG.minPanelWidth, maxWidth);
        const height = clamp(startRect.height + moveEvent.clientY - startClientY, CONFIG.minPanelHeight, maxHeight);

        applyPanelRect({
          left: startRect.left,
          top: startRect.top,
          width,
          height
        });
      };

      const end = function endResizedPanel(endEvent) {
        if (endEvent.pointerId !== pointerId) {
          return;
        }

        endEvent.preventDefault();
        endEvent.stopPropagation();

        try {
          els.resizeHandle.releasePointerCapture(pointerId);
        } catch (error) {
          void error;
        }

        els.resizeHandle.removeEventListener("pointermove", move);
        els.resizeHandle.removeEventListener("pointerup", end);
        els.resizeHandle.removeEventListener("pointercancel", end);
        els.resizeHandle.removeEventListener("lostpointercapture", end);
      };

      els.resizeHandle.addEventListener("pointermove", move);
      els.resizeHandle.addEventListener("pointerup", end);
      els.resizeHandle.addEventListener("pointercancel", end);
      els.resizeHandle.addEventListener("lostpointercapture", end);
    }

    function handleWindowResize() {
      applyPanelRect(state.windowRect);
      scheduleRender();
    }

    function setActiveTool(tool) {
      if (tool !== "pen" && tool !== "eraser" && tool !== "shape" && tool !== "select" && tool !== "text") {
        return;
      }

      if (tool !== "text") {
        commitTextEditor();
      }

      state.activeTool = tool;
      updateToolButtons();

      try {
        els.canvas.focus({ preventScroll: true });
      } catch (error) {
        els.canvas.focus();
      }
    }

    function setActiveShapeType(shapeType) {
      if (!isKnownShapeType(shapeType)) {
        return;
      }

      state.activeShapeType = shapeType;
      setActiveTool("shape");
      updateShapeButton();
    }

    function updateToolButtons() {
      const isPen = state.activeTool === "pen";
      const isEraser = state.activeTool === "eraser";
      const isShape = state.activeTool === "shape";
      const isSelect = state.activeTool === "select";
      const isText = state.activeTool === "text";

      els.penButton.classList.toggle("is-active", isPen);
      els.eraserButton.classList.toggle("is-active", isEraser);
      els.shapeButton.classList.toggle("is-active", isShape);
      els.selectButton.classList.toggle("is-active", isSelect);
      els.textButton.classList.toggle("is-active", isText);
      els.penButton.setAttribute("aria-pressed", String(isPen));
      els.eraserButton.setAttribute("aria-pressed", String(isEraser));
      els.shapeButton.setAttribute("aria-pressed", String(isShape));
      els.selectButton.setAttribute("aria-pressed", String(isSelect));
      els.textButton.setAttribute("aria-pressed", String(isText));
      els.canvas.classList.toggle("is-eraser", isEraser);
      els.canvas.classList.toggle("is-selection", isSelect);
      els.canvas.classList.toggle("is-text", isText);
      els.currentSwatch.style.setProperty("--qs-swatch-color", state.strokeColor);
      els.colorInput.value = state.strokeColor;
      els.widthSelect.value = String(state.strokeWidth);
      updateSelectionControls();
    }

    function updateShapeButton() {
      els.shapeButton.innerHTML = svgIcon(shapeIconName(state.activeShapeType));
      els.shapeButton.title = `Shape: ${shapeDisplayName(state.activeShapeType)}`;
      els.shapeButton.setAttribute("aria-label", `Shape tool: ${shapeDisplayName(state.activeShapeType)}`);

      const shapeOptions = els.shapeMenu.querySelectorAll("[data-shape]");

      for (const option of shapeOptions) {
        option.classList.toggle("is-selected", option.getAttribute("data-shape") === state.activeShapeType);
      }
    }

    function updateHistoryButtons() {
      els.undoButton.disabled = state.undoStack.length === 0;
      els.redoButton.disabled = state.redoStack.length === 0;
    }

    function updateSelectionControls() {
      els.cutButton.disabled = !state.selection;
      els.copyButton.title = state.selection ? "Copy selected region" : "Copy full PNG";
      els.copyButton.setAttribute("aria-label", state.selection ? "Copy selected region to clipboard" : "Copy full PNG to clipboard");
    }

    function handleWidthChange() {
      const nextWidth = Number(els.widthSelect.value);

      if ([1, 2, 4, 8].includes(nextWidth)) {
        state.strokeWidth = nextWidth;
      } else {
        state.strokeWidth = 2;
        els.widthSelect.value = "2";
      }
    }

    function toggleShapeMenu(event) {
      event.preventDefault();
      event.stopPropagation();

      const shouldOpen = els.shapeMenu.hidden;

      hideColorMenu();
      els.shapeMenu.hidden = !shouldOpen;
      els.shapeButton.setAttribute("aria-expanded", String(shouldOpen));

      if (shouldOpen) {
        setActiveTool("shape");
      }
    }

    function hideShapeMenu() {
      els.shapeMenu.hidden = true;
      els.shapeButton.setAttribute("aria-expanded", "false");
    }

    function handleShapeMenuClick(event) {
      const shapeButton = event.target.closest("[data-shape]");

      if (!shapeButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setActiveShapeType(shapeButton.getAttribute("data-shape"));
      hideShapeMenu();
    }

    function toggleColorMenu(event) {
      event.preventDefault();
      event.stopPropagation();

      const shouldOpen = els.colorMenu.hidden;

      hideShapeMenu();
      els.colorMenu.hidden = !shouldOpen;
      els.colorButton.setAttribute("aria-expanded", String(shouldOpen));
    }

    function hideColorMenu() {
      els.colorMenu.hidden = true;
      els.colorButton.setAttribute("aria-expanded", "false");
    }

    function handleColorMenuClick(event) {
      const colorButton = event.target.closest("[data-color]");

      if (!colorButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setStrokeColor(colorButton.getAttribute("data-color"));
      hideColorMenu();
    }

    function handleCustomColorInput(event) {
      setStrokeColor(event.target.value);
    }

    function setStrokeColor(color) {
      const normalized = normalizeHexColor(color);

      state.strokeColor = normalized;
      els.currentSwatch.style.setProperty("--qs-swatch-color", normalized);
      els.colorInput.value = normalized;

      if (state.activeTool === "eraser") {
        setActiveTool("pen");
      }

      if (state.textEditor) {
        state.textEditor.input.style.setProperty("--qs-text-color", normalized);
        state.textEditor.color = normalized;
      }
    }

    function beginCanvasPointer(event) {
      if (!isPrimaryPointerDown(event) || event.isPrimary === false) {
        return;
      }

      if (state.activeTool !== "select") {
        clearSelection();
      }

      if (state.activeTool === "shape") {
        beginShape(event);
        return;
      }

      if (state.activeTool === "select") {
        beginSelectionPointer(event);
        return;
      }

      if (state.activeTool === "text") {
        beginTextPlacement(event);
        return;
      }

      beginStroke(event);
    }

    function continueCanvasPointer(event) {
      if (state.activeSelectionMove) {
        continueSelectionMove(event);
        return;
      }

      if (state.activeSelectionDrag) {
        continueSelectionDrag(event);
        return;
      }

      if (state.activeShape) {
        continueShape(event);
        return;
      }

      if (state.activeStroke) {
        continueStroke(event);
      }
    }

    function finishCanvasPointer(event) {
      if (state.activeSelectionMove) {
        finishSelectionMove(event);
        return;
      }

      if (state.activeSelectionDrag) {
        finishSelectionDrag(event);
        return;
      }

      if (state.activeShape) {
        finishShape(event);
        return;
      }

      if (state.activeStroke) {
        finishStroke(event);
      }
    }

    function beginStroke(event) {
      event.preventDefault();
      event.stopPropagation();
      raisePanel();

      const point = eventToDocumentPoint(event);
      const isEraser = state.activeTool === "eraser";

      state.activeStroke = {
        type: isEraser ? "eraser" : "stroke",
        color: state.strokeColor,
        width: isEraser ? state.strokeWidth * 2 : state.strokeWidth,
        points: [point],
        createdAt: Date.now(),
        pointerId: event.pointerId
      };

      try {
        els.canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        console.warn("[Quick Sketch] Stroke pointer capture failed.", error);
      }

      scheduleRender();
    }

    function continueStroke(event) {
      const activeStroke = state.activeStroke;

      if (!activeStroke || activeStroke.pointerId !== event.pointerId) {
        return;
      }

      if (event.pointerType === "mouse" && event.buttons === 0) {
        finishStroke(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const point = eventToDocumentPoint(event);
      const lastPoint = activeStroke.points[activeStroke.points.length - 1];

      if (!lastPoint || distanceBetween(lastPoint, point) >= 0.7) {
        activeStroke.points.push(point);
        scheduleRender();
      }
    }

    function finishStroke(event) {
      const activeStroke = state.activeStroke;

      if (!activeStroke || activeStroke.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      try {
        els.canvas.releasePointerCapture(activeStroke.pointerId);
      } catch (error) {
        void error;
      }

      const operation = {
        type: activeStroke.type,
        color: activeStroke.color,
        width: activeStroke.width,
        points: activeStroke.points.slice(),
        createdAt: activeStroke.createdAt
      };

      state.activeStroke = null;

      if (operation.points.length > 0) {
        commitOperation(operation);
      } else {
        scheduleRender();
      }
    }

    function beginShape(event) {
      event.preventDefault();
      event.stopPropagation();
      raisePanel();

      const point = eventToDocumentPoint(event);

      state.activeShape = {
        type: "shape",
        shapeType: state.activeShapeType,
        color: state.strokeColor,
        width: state.strokeWidth,
        x1: point.x,
        y1: point.y,
        x2: point.x,
        y2: point.y,
        rawX2: point.x,
        rawY2: point.y,
        fromCenter: event.altKey,
        constrained: event.shiftKey,
        createdAt: Date.now(),
        pointerId: event.pointerId
      };

      try {
        els.canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        console.warn("[Quick Sketch] Shape pointer capture failed.", error);
      }

      scheduleRender();
    }

    function continueShape(event) {
      const activeShape = state.activeShape;

      if (!activeShape || activeShape.pointerId !== event.pointerId) {
        return;
      }

      if (event.pointerType === "mouse" && event.buttons === 0) {
        finishShape(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const point = eventToDocumentPoint(event);
      const updatedShape = buildShapeFromDrag(activeShape, point, event.shiftKey, event.altKey);

      Object.assign(activeShape, updatedShape);
      scheduleRender();
    }

    function finishShape(event) {
      const activeShape = state.activeShape;

      if (!activeShape || activeShape.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      try {
        els.canvas.releasePointerCapture(activeShape.pointerId);
      } catch (error) {
        void error;
      }

      const operation = {
        type: "shape",
        shapeType: activeShape.shapeType,
        color: activeShape.color,
        width: activeShape.width,
        x1: activeShape.x1,
        y1: activeShape.y1,
        x2: activeShape.x2,
        y2: activeShape.y2,
        createdAt: activeShape.createdAt
      };

      state.activeShape = null;

      if (isMeaningfulShape(operation)) {
        commitOperation(operation);
      } else {
        scheduleRender();
      }
    }

    function buildShapeFromDrag(baseShape, point, constrained, fromCenter) {
      let x1 = baseShape.x1;
      let y1 = baseShape.y1;
      let x2 = point.x;
      let y2 = point.y;

      if (constrained) {
        if (isRectangularShape(baseShape.shapeType)) {
          const dx = x2 - x1;
          const dy = y2 - y1;
          const side = Math.max(Math.abs(dx), Math.abs(dy));

          x2 = x1 + Math.sign(dx || 1) * side;
          y2 = y1 + Math.sign(dy || 1) * side;
        }

        if (baseShape.shapeType === "line" || baseShape.shapeType === "arrow") {
          const snapped = snapLineToAngle(x1, y1, x2, y2);

          x2 = snapped.x;
          y2 = snapped.y;
        }
      }

      if (fromCenter && isRectangularShape(baseShape.shapeType)) {
        const centerX = baseShape.x1;
        const centerY = baseShape.y1;
        const halfWidth = Math.abs(x2 - centerX);
        const halfHeight = Math.abs(y2 - centerY);

        x1 = centerX - halfWidth;
        y1 = centerY - halfHeight;
        x2 = centerX + halfWidth;
        y2 = centerY + halfHeight;
      }

      return {
        x1: clamp(x1, 0, state.documentWidth),
        y1: clamp(y1, 0, state.documentHeight),
        x2: clamp(x2, 0, state.documentWidth),
        y2: clamp(y2, 0, state.documentHeight),
        rawX2: point.x,
        rawY2: point.y,
        constrained,
        fromCenter
      };
    }

    function snapLineToAngle(x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) {
        return {
          x: x2,
          y: y2
        };
      }

      const angle = Math.atan2(dy, dx);
      const increment = Math.PI / 4;
      const snappedAngle = Math.round(angle / increment) * increment;

      return {
        x: x1 + Math.cos(snappedAngle) * distance,
        y: y1 + Math.sin(snappedAngle) * distance
      };
    }

    function isMeaningfulShape(shape) {
      if (shape.shapeType === "line" || shape.shapeType === "arrow") {
        return distanceBetween({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) >= CONFIG.minimumShapeSize;
      }

      return Math.abs(shape.x2 - shape.x1) >= CONFIG.minimumShapeSize || Math.abs(shape.y2 - shape.y1) >= CONFIG.minimumShapeSize;
    }

    function beginSelectionPointer(event) {
      event.preventDefault();
      event.stopPropagation();
      raisePanel();

      const point = eventToDocumentPoint(event);

      if (state.selection && pointInsideRect(point, state.selection)) {
        beginSelectionMove(event, point);
        return;
      }

      state.selection = null;
      updateSelectionOverlay();

      state.activeSelectionDrag = {
        pointerId: event.pointerId,
        x1: point.x,
        y1: point.y,
        x2: point.x,
        y2: point.y
      };

      try {
        els.canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        console.warn("[Quick Sketch] Selection pointer capture failed.", error);
      }

      updateSelectionOverlay(selectionDragToRect(state.activeSelectionDrag));
    }

    function continueSelectionDrag(event) {
      const drag = state.activeSelectionDrag;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      if (event.pointerType === "mouse" && event.buttons === 0) {
        finishSelectionDrag(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const point = eventToDocumentPoint(event);

      drag.x2 = point.x;
      drag.y2 = point.y;

      updateSelectionOverlay(selectionDragToRect(drag));
    }

    function finishSelectionDrag(event) {
      const drag = state.activeSelectionDrag;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      try {
        els.canvas.releasePointerCapture(drag.pointerId);
      } catch (error) {
        void error;
      }

      const rect = selectionDragToRect(drag);

      state.activeSelectionDrag = null;

      if (rect.width >= CONFIG.selectionMinSize && rect.height >= CONFIG.selectionMinSize) {
        state.selection = rect;
      } else {
        state.selection = null;
      }

      updateSelectionOverlay();
    }

    function beginSelectionMove(event, point) {
      const selection = state.selection;

      if (!selection) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const selectedCanvas = captureRegionCanvas(selection);

      state.activeSelectionMove = {
        pointerId: event.pointerId,
        startPoint: point,
        originalRect: { ...selection },
        currentRect: { ...selection },
        selectedCanvas
      };

      try {
        els.canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        console.warn("[Quick Sketch] Selection move pointer capture failed.", error);
      }

      drawSelectionPreviewCanvas(selectedCanvas);
      updateSelectionOverlay(selection, true);
      scheduleRender();
    }

    function continueSelectionMove(event) {
      const move = state.activeSelectionMove;

      if (!move || move.pointerId !== event.pointerId) {
        return;
      }

      if (event.pointerType === "mouse" && event.buttons === 0) {
        finishSelectionMove(event);
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const point = eventToDocumentPoint(event);
      const dx = point.x - move.startPoint.x;
      const dy = point.y - move.startPoint.y;
      const nextX = clamp(move.originalRect.x + dx, 0, state.documentWidth - move.originalRect.width);
      const nextY = clamp(move.originalRect.y + dy, 0, state.documentHeight - move.originalRect.height);

      move.currentRect = {
        x: nextX,
        y: nextY,
        width: move.originalRect.width,
        height: move.originalRect.height
      };

      state.selection = { ...move.currentRect };
      updateSelectionOverlay(state.selection, true);
      scheduleRender();
    }

    function finishSelectionMove(event) {
      const move = state.activeSelectionMove;

      if (!move || move.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      try {
        els.canvas.releasePointerCapture(move.pointerId);
      } catch (error) {
        void error;
      }

      const movedFarEnough = Math.abs(move.currentRect.x - move.originalRect.x) >= 1 || Math.abs(move.currentRect.y - move.originalRect.y) >= 1;

      state.activeSelectionMove = null;

      if (movedFarEnough) {
        const clearOperation = createClearRectOperation(move.originalRect);
        const patchOperation = createImagePatchOperation(move.selectedCanvas, move.currentRect);
        commitOperationGroup([clearOperation, patchOperation]);
        state.selection = { ...move.currentRect };
        drawSelectionPreviewCanvas(null);
        updateSelectionOverlay();
      } else {
        state.selection = { ...move.originalRect };
        drawSelectionPreviewCanvas(null);
        updateSelectionOverlay();
        scheduleRender();
      }
    }

    function selectionDragToRect(drag) {
      const x = Math.min(drag.x1, drag.x2);
      const y = Math.min(drag.y1, drag.y2);
      const width = Math.abs(drag.x2 - drag.x1);
      const height = Math.abs(drag.y2 - drag.y1);

      return {
        x,
        y,
        width,
        height
      };
    }

    function updateSelectionOverlay(rectOverride, moving) {
      const rect = rectOverride || state.selection;

      updateSelectionControls();

      if (!rect || rect.width <= 0 || rect.height <= 0) {
        els.selection.style.display = "none";
        els.selection.classList.remove("is-moving");
        drawSelectionPreviewCanvas(null);
        return;
      }

      els.selection.style.display = "block";
      els.selection.style.left = `${Math.round(rect.x)}px`;
      els.selection.style.top = `${Math.round(rect.y)}px`;
      els.selection.style.width = `${Math.round(rect.width)}px`;
      els.selection.style.height = `${Math.round(rect.height)}px`;
      els.selection.classList.toggle("is-moving", Boolean(moving));
    }

    function clearSelection() {
      state.selection = null;
      state.activeSelectionDrag = null;
      state.activeSelectionMove = null;
      drawSelectionPreviewCanvas(null);
      updateSelectionOverlay();
    }

    function pointInsideRect(point, rect) {
      return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
    }

    function captureRegionCanvas(rect) {
      const sourceCanvas = document.createElement("canvas");

      renderToCanvas(sourceCanvas, {
        dpr: 1,
        includeGrid: false,
        includeActiveStroke: false,
        includeActiveShape: false,
        includeSelectionMoveClear: false
      });

      const croppedCanvas = document.createElement("canvas");
      const cropWidth = Math.max(1, Math.round(rect.width));
      const cropHeight = Math.max(1, Math.round(rect.height));

      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      const cropCtx = croppedCanvas.getContext("2d");

      if (!cropCtx) {
        throw new Error("Selection canvas context is unavailable.");
      }

      cropCtx.drawImage(sourceCanvas, Math.round(rect.x), Math.round(rect.y), cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      return croppedCanvas;
    }

    function drawSelectionPreviewCanvas(canvas) {
      if (!canvas) {
        els.selectionCanvas.style.display = "none";
        els.selectionCanvas.width = 1;
        els.selectionCanvas.height = 1;
        return;
      }

      const width = Math.max(1, canvas.width);
      const height = Math.max(1, canvas.height);

      els.selectionCanvas.width = width;
      els.selectionCanvas.height = height;
      els.selectionCanvas.style.display = "block";

      const ctx = els.selectionCanvas.getContext("2d");

      if (!ctx) {
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0);
    }

    async function copySelectedRegion() {
      if (!state.selection) {
        return false;
      }

      try {
        const canvas = captureRegionCanvas(state.selection);
        const blob = await canvasToPngBlob(canvas);
        await writePngBlobToClipboard(blob);
        showStatus("Copied selection");
        return true;
      } catch (error) {
        console.warn("[Quick Sketch] Copy selection failed.", error);
        showStatus("Clipboard blocked");
        return false;
      }
    }

    async function cutSelectedRegion() {
      if (!state.selection) {
        showStatus("No selection");
        return;
      }

      const copied = await copySelectedRegion();

      if (!copied) {
        return;
      }

      const rect = { ...state.selection };
      const operation = createClearRectOperation(rect);

      clearSelection();
      commitOperation(operation);
      showStatus("Cut selection");
    }

    function deleteSelectedRegion() {
      if (!state.selection) {
        return;
      }

      const rect = { ...state.selection };
      const operation = createClearRectOperation(rect);

      clearSelection();
      commitOperation(operation);
      showStatus("Deleted selection");
    }

    function createClearRectOperation(rect) {
      return {
        type: "clearRect",
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        createdAt: Date.now()
      };
    }

    function createImagePatchOperation(canvas, rect) {
      return {
        type: "imagePatch",
        canvas,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        createdAt: Date.now()
      };
    }

    function beginTextPlacement(event) {
      event.preventDefault();
      event.stopPropagation();
      raisePanel();

      const point = eventToDocumentPoint(event);

      createTextEditor(point.x, point.y);
    }

    function createTextEditor(x, y) {
      commitTextEditor();

      const editor = document.createElement("div");
      const input = document.createElement("textarea");
      const actions = document.createElement("div");
      const doneButton = document.createElement("button");
      const cancelButton = document.createElement("button");

      const editorX = clamp(x, 0, Math.max(0, state.documentWidth - 80));
      const editorY = clamp(y, 0, Math.max(0, state.documentHeight - 40));

      editor.className = "qs-text-editor";
      editor.style.left = `${Math.round(editorX)}px`;
      editor.style.top = `${Math.round(editorY)}px`;
      editor.style.width = `${CONFIG.textDefaultWidth}px`;
      editor.style.height = `${CONFIG.textDefaultHeight}px`;

      input.className = "qs-text-input";
      input.placeholder = "Type text";
      input.spellcheck = false;
      input.style.setProperty("--qs-text-color", state.strokeColor);

      actions.className = "qs-text-actions";

      doneButton.className = "qs-text-action qs-text-done";
      doneButton.type = "button";
      doneButton.textContent = "Done";

      cancelButton.className = "qs-text-action qs-text-cancel";
      cancelButton.type = "button";
      cancelButton.textContent = "Cancel";

      actions.appendChild(cancelButton);
      actions.appendChild(doneButton);
      editor.appendChild(input);
      editor.appendChild(actions);
      els.surface.appendChild(editor);

      state.textEditor = {
        editor,
        input,
        x: editorX,
        y: editorY,
        color: state.strokeColor
      };

      const stop = function stopTextEvent(event) {
        event.stopPropagation();
      };

      const done = function doneText() {
        commitTextEditor();
      };

      const cancel = function cancelText() {
        cancelTextEditor();
      };

      const keydown = function handleTextKeydown(event) {
        event.stopPropagation();

        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          commitTextEditor();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancelTextEditor();
        }
      };

      input.addEventListener("pointerdown", stop);
      input.addEventListener("click", stop);
      input.addEventListener("keydown", keydown);
      doneButton.addEventListener("click", done);
      cancelButton.addEventListener("click", cancel);

      state.textEditor.cleanup = function cleanupTextEditor() {
        input.removeEventListener("pointerdown", stop);
        input.removeEventListener("click", stop);
        input.removeEventListener("keydown", keydown);
        doneButton.removeEventListener("click", done);
        cancelButton.removeEventListener("click", cancel);
      };

      window.setTimeout(function focusTextInput() {
        try {
          input.focus({ preventScroll: true });
        } catch (error) {
          input.focus();
        }
      }, 0);
    }

    function commitTextEditor() {
      const editorState = state.textEditor;

      if (!editorState) {
        return;
      }

      const text = editorState.input.value.trimEnd();
      const editorRect = editorState.editor.getBoundingClientRect();
      const surfaceRect = els.surface.getBoundingClientRect();
      const scaleX = state.documentWidth / (surfaceRect.width || state.documentWidth);
      const scaleY = state.documentHeight / (surfaceRect.height || state.documentHeight);
      const x = clamp((editorRect.left - surfaceRect.left) * scaleX, 0, state.documentWidth);
      const y = clamp((editorRect.top - surfaceRect.top) * scaleY, 0, state.documentHeight);
      const width = clamp(editorRect.width * scaleX, 20, state.documentWidth - x || 20);

      removeTextEditor();

      if (!text.trim()) {
        return;
      }

      commitOperation({
        type: "text",
        text,
        x,
        y,
        width,
        color: editorState.color,
        fontSize: CONFIG.textFontSize,
        lineHeight: CONFIG.textLineHeight,
        fontFamily: CONFIG.textFontFamily,
        createdAt: Date.now()
      });

      showStatus("Text added");
    }

    function cancelTextEditor() {
      removeTextEditor();

      try {
        els.canvas.focus({ preventScroll: true });
      } catch (error) {
        els.canvas.focus();
      }
    }

    function removeTextEditor() {
      const editorState = state.textEditor;

      if (!editorState) {
        return;
      }

      if (typeof editorState.cleanup === "function") {
        editorState.cleanup();
      }

      editorState.editor.remove();
      state.textEditor = null;
    }

    function eventToDocumentPoint(event) {
      const rect = els.canvas.getBoundingClientRect();
      const width = rect.width || state.documentWidth;
      const height = rect.height || state.documentHeight;
      const x = clamp(((event.clientX - rect.left) / width) * state.documentWidth, 0, state.documentWidth);
      const y = clamp(((event.clientY - rect.top) / height) * state.documentHeight, 0, state.documentHeight);

      return {
        x,
        y,
        pressure: typeof event.pressure === "number" && event.pressure > 0 ? event.pressure : 0.5,
        time: Date.now()
      };
    }

    function commitOperation(operation) {
      state.operations.push(operation);

      pushHistory({
        type: "operation",
        operation
      });

      scheduleRender();
    }

    function commitOperationGroup(operations) {
      const safeOperations = operations.filter(Boolean);

      if (safeOperations.length === 0) {
        return;
      }

      for (const operation of safeOperations) {
        state.operations.push(operation);
      }

      pushHistory({
        type: "group",
        operations: safeOperations
      });

      scheduleRender();
    }

    function pushHistory(command) {
      state.undoStack.push(command);

      while (state.undoStack.length > CONFIG.maxHistory) {
        state.undoStack.shift();
      }

      state.redoStack.length = 0;
      updateHistoryButtons();
    }

    function undo() {
      commitTextEditor();

      const command = state.undoStack.pop();

      if (!command) {
        updateHistoryButtons();
        return;
      }

      clearSelection();
      revertCommand(command);
      state.redoStack.push(command);
      updateHistoryButtons();
      scheduleRender();
    }

    function redo() {
      commitTextEditor();

      const command = state.redoStack.pop();

      if (!command) {
        updateHistoryButtons();
        return;
      }

      clearSelection();
      applyCommand(command);
      state.undoStack.push(command);
      updateHistoryButtons();
      scheduleRender();
    }

    function applyCommand(command) {
      if (command.type === "operation") {
        state.operations.push(command.operation);
        return;
      }

      if (command.type === "group") {
        for (const operation of command.operations) {
          state.operations.push(operation);
        }

        return;
      }

      if (command.type === "background") {
        state.backgroundImage = command.afterBackground;
        setDocumentSize(command.afterDocumentWidth, command.afterDocumentHeight);
      }
    }

    function revertCommand(command) {
      if (command.type === "operation") {
        removeOperationReference(command.operation);
        return;
      }

      if (command.type === "group") {
        for (let index = command.operations.length - 1; index >= 0; index -= 1) {
          removeOperationReference(command.operations[index]);
        }

        return;
      }

      if (command.type === "background") {
        state.backgroundImage = command.beforeBackground;
        setDocumentSize(command.beforeDocumentWidth, command.beforeDocumentHeight);
      }
    }

    function removeOperationReference(operation) {
      const index = state.operations.lastIndexOf(operation);

      if (index >= 0) {
        state.operations.splice(index, 1);
      }
    }

    async function handlePasteImportClick() {
      raisePanel();
      commitTextEditor();

      let clipboardWasTried = false;

      if (navigator.clipboard && typeof navigator.clipboard.read === "function") {
        clipboardWasTried = true;

        try {
          const blob = await readImageBlobFromClipboard();

          if (blob) {
            await importImageBlob(blob);
            return;
          }

          showStatus("No image found in clipboard");
        } catch (error) {
          console.warn("[Quick Sketch] Clipboard image read failed.", error);
          showStatus("Clipboard blocked");
        }
      }

      if (!clipboardWasTried) {
        showStatus("Clipboard blocked");
      }

      openFilePicker();
    }

    async function readImageBlobFromClipboard() {
      const items = await navigator.clipboard.read();

      for (const item of items) {
        const imageType = item.types.find(function findImageType(type) {
          return type.startsWith("image/");
        });

        if (imageType) {
          return item.getType(imageType);
        }
      }

      return null;
    }

    function openFilePicker() {
      try {
        els.fileInput.click();
      } catch (error) {
        console.warn("[Quick Sketch] File picker failed.", error);
        showStatus("Image import failed");
      }
    }

    function handleFileInputChange() {
      const file = els.fileInput.files && els.fileInput.files[0];

      els.fileInput.value = "";

      if (!file) {
        return;
      }

      if (!file.type || !file.type.startsWith("image/")) {
        showStatus("Image import failed");
        return;
      }

      importImageBlob(file).catch(function handleFileImageImportError(error) {
        console.warn("[Quick Sketch] File image import failed.", error);
        showStatus("Image import failed");
      });
    }

    function handlePasteEvent(event) {
      const clipboardData = event.clipboardData;

      if (!clipboardData || !clipboardData.items) {
        return;
      }

      for (const item of clipboardData.items) {
        if (item.kind === "file" && item.type && item.type.startsWith("image/")) {
          const file = item.getAsFile();

          if (!file) {
            continue;
          }

          event.preventDefault();
          event.stopPropagation();

          importImageBlob(file).catch(function handlePastedImageImportError(error) {
            console.warn("[Quick Sketch] Pasted image import failed.", error);
            showStatus("Image import failed");
          });

          return;
        }
      }
    }

    async function importImageBlob(blob) {
      commitTextEditor();
      clearSelection();

      const imageRecord = await createImageRecord(blob);
      const beforeBackground = state.backgroundImage;
      const beforeDocumentWidth = state.documentWidth;
      const beforeDocumentHeight = state.documentHeight;
      const afterDocumentWidth = Math.max(CONFIG.initialDocumentWidth, state.documentWidth, imageRecord.width);
      const afterDocumentHeight = Math.max(CONFIG.initialDocumentHeight, state.documentHeight, imageRecord.height);

      state.backgroundImage = imageRecord;
      setDocumentSize(afterDocumentWidth, afterDocumentHeight);

      pushHistory({
        type: "background",
        beforeBackground,
        afterBackground: imageRecord,
        beforeDocumentWidth,
        beforeDocumentHeight,
        afterDocumentWidth,
        afterDocumentHeight
      });

      showStatus("Image imported");
      scheduleRender();
    }

    function createImageRecord(blob) {
      return new Promise(function createImageRecordPromise(resolve, reject) {
        const objectUrl = URL.createObjectURL(blob);

        state.objectUrls.add(objectUrl);

        const image = new Image();

        image.onload = function handleImageLoad() {
          const naturalWidth = image.naturalWidth || image.width;
          const naturalHeight = image.naturalHeight || image.height;

          if (!naturalWidth || !naturalHeight) {
            state.objectUrls.delete(objectUrl);
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Decoded image has no dimensions."));
            return;
          }

          const scale = Math.min(1, CONFIG.maxImageSide / Math.max(naturalWidth, naturalHeight));
          const width = Math.max(1, Math.round(naturalWidth * scale));
          const height = Math.max(1, Math.round(naturalHeight * scale));

          resolve({
            image,
            objectUrl,
            x: 0,
            y: 0,
            width,
            height,
            naturalWidth,
            naturalHeight,
            createdAt: Date.now()
          });
        };

        image.onerror = function handleImageError() {
          state.objectUrls.delete(objectUrl);
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Image decoding failed."));
        };

        image.src = objectUrl;
      });
    }

    function setDocumentSize(width, height) {
      state.documentWidth = Math.max(1, Math.round(width));
      state.documentHeight = Math.max(1, Math.round(height));
      updateDocumentSurface();
    }

    function updateDocumentSurface() {
      els.surface.style.width = `${state.documentWidth}px`;
      els.surface.style.height = `${state.documentHeight}px`;
      els.canvas.style.width = `${state.documentWidth}px`;
      els.canvas.style.height = `${state.documentHeight}px`;
      scheduleRender();
    }

    function scheduleRender() {
      if (renderFrame) {
        return;
      }

      renderFrame = window.requestAnimationFrame(function renderScheduledFrame() {
        renderFrame = 0;
        renderVisibleCanvas();
      });
    }

    function renderVisibleCanvas() {
      try {
        renderToCanvas(els.canvas, {
          dpr: getVisibleDpr(),
          includeGrid: true,
          includeActiveStroke: true,
          includeActiveShape: true,
          includeSelectionMoveClear: true
        });
      } catch (error) {
        console.error("[Quick Sketch] Render failed.", error);
      }
    }

    function renderToCanvas(targetCanvas, options) {
      const dpr = options.dpr || 1;
      const pixelWidth = Math.max(1, Math.round(state.documentWidth * dpr));
      const pixelHeight = Math.max(1, Math.round(state.documentHeight * dpr));

      if (targetCanvas.width !== pixelWidth) {
        targetCanvas.width = pixelWidth;
      }

      if (targetCanvas.height !== pixelHeight) {
        targetCanvas.height = pixelHeight;
      }

      const ctx = targetCanvas.getContext("2d", { alpha: false });

      if (!ctx) {
        throw new Error("2D canvas context is unavailable.");
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, state.documentWidth, state.documentHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, state.documentWidth, state.documentHeight);

      if (options.includeGrid) {
        drawGrid(ctx);
      }

      if (state.backgroundImage) {
        const bg = state.backgroundImage;
        ctx.drawImage(bg.image, bg.x, bg.y, bg.width, bg.height);
      }

      const annotationLayer = document.createElement("canvas");

      annotationLayer.width = pixelWidth;
      annotationLayer.height = pixelHeight;

      const annotationCtx = annotationLayer.getContext("2d");

      if (!annotationCtx) {
        throw new Error("Annotation canvas context is unavailable.");
      }

      annotationCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      annotationCtx.clearRect(0, 0, state.documentWidth, state.documentHeight);

      for (const operation of state.operations) {
        drawOperation(annotationCtx, operation);
      }

      if (options.includeSelectionMoveClear && state.activeSelectionMove) {
        drawOperation(annotationCtx, createClearRectOperation(state.activeSelectionMove.originalRect));
      }

      if (options.includeActiveStroke && state.activeStroke) {
        drawOperation(annotationCtx, state.activeStroke);
      }

      if (options.includeActiveShape && state.activeShape) {
        drawOperation(annotationCtx, state.activeShape);
      }

      ctx.drawImage(annotationLayer, 0, 0, state.documentWidth, state.documentHeight);
    }

    function drawGrid(ctx) {
      const spacing = 24;

      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.055)";

      for (let y = spacing; y < state.documentHeight; y += spacing) {
        for (let x = spacing; x < state.documentWidth; x += spacing) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      ctx.restore();
    }

    function drawOperation(ctx, operation) {
      ctx.save();

      if (operation.type === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        drawSmoothPath(ctx, operation.points, "rgba(0,0,0,1)", operation.width);
      } else if (operation.type === "shape") {
        ctx.globalCompositeOperation = "source-over";
        drawShapeOperation(ctx, operation);
      } else if (operation.type === "text") {
        ctx.globalCompositeOperation = "source-over";
        drawTextOperation(ctx, operation);
      } else if (operation.type === "clearRect") {
        ctx.globalCompositeOperation = "source-over";
        drawClearRectOperation(ctx, operation);
      } else if (operation.type === "imagePatch") {
        ctx.globalCompositeOperation = "source-over";
        drawImagePatchOperation(ctx, operation);
      } else {
        ctx.globalCompositeOperation = "source-over";
        drawSmoothPath(ctx, operation.points, operation.color, operation.width);
      }

      ctx.restore();
    }

    function drawSmoothPath(ctx, points, color, width) {
      if (!points || points.length === 0) {
        return;
      }

      const lineWidth = Math.max(1, Number(width) || 1);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      if (points.length === 1) {
        const point = points[0];

        ctx.beginPath();
        ctx.arc(point.x, point.y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let index = 1; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;

        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }

      const last = points[points.length - 1];

      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }

    function drawShapeOperation(ctx, shape) {
      const lineWidth = Math.max(1, Number(shape.width) || 1);
      const filled = isFilledShape(shape.shapeType);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = shape.color || "#000000";
      ctx.fillStyle = shape.color || "#000000";

      if (shape.shapeType === "line") {
        drawLineShape(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
        return;
      }

      if (shape.shapeType === "arrow") {
        drawArrowShape(ctx, shape.x1, shape.y1, shape.x2, shape.y2, lineWidth);
        return;
      }

      if (shape.shapeType === "rectangle" || shape.shapeType === "filledRectangle") {
        drawRectangleShape(ctx, shape.x1, shape.y1, shape.x2, shape.y2, filled);
        return;
      }

      if (shape.shapeType === "ellipse" || shape.shapeType === "filledEllipse") {
        drawEllipseShape(ctx, shape.x1, shape.y1, shape.x2, shape.y2, filled);
        return;
      }

      if (shape.shapeType === "roundedRectangle" || shape.shapeType === "filledRoundedRectangle") {
        drawRoundedRectangleShape(ctx, shape.x1, shape.y1, shape.x2, shape.y2, lineWidth, filled);
      }
    }

    function drawLineShape(ctx, x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function drawArrowShape(ctx, x1, y1, x2, y2, lineWidth) {
      drawLineShape(ctx, x1, y1, x2, y2);

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const length = Math.max(10, lineWidth * 5);
      const spread = Math.PI / 7;

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - Math.cos(angle - spread) * length, y2 - Math.sin(angle - spread) * length);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - Math.cos(angle + spread) * length, y2 - Math.sin(angle + spread) * length);
      ctx.stroke();
    }

    function drawRectangleShape(ctx, x1, y1, x2, y2, filled) {
      const rect = normalizeRect(x1, y1, x2, y2);

      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);

      if (filled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }

    function drawEllipseShape(ctx, x1, y1, x2, y2, filled) {
      const rect = normalizeRect(x1, y1, x2, y2);
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const radiusX = Math.max(0.5, rect.width / 2);
      const radiusY = Math.max(0.5, rect.height / 2);

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

      if (filled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }

    function drawRoundedRectangleShape(ctx, x1, y1, x2, y2, lineWidth, filled) {
      const rect = normalizeRect(x1, y1, x2, y2);
      const radius = Math.min(Math.max(6, lineWidth * 4), rect.width / 2, rect.height / 2);

      ctx.beginPath();

      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
      } else {
        roundedRectanglePath(ctx, rect.x, rect.y, rect.width, rect.height, radius);
      }

      if (filled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }

    function roundedRectanglePath(ctx, x, y, width, height, radius) {
      const right = x + width;
      const bottom = y + height;

      ctx.moveTo(x + radius, y);
      ctx.lineTo(right - radius, y);
      ctx.quadraticCurveTo(right, y, right, y + radius);
      ctx.lineTo(right, bottom - radius);
      ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
      ctx.lineTo(x + radius, bottom);
      ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    function drawTextOperation(ctx, operation) {
      const fontSize = operation.fontSize || CONFIG.textFontSize;
      const lineHeight = fontSize * (operation.lineHeight || CONFIG.textLineHeight);
      const fontFamily = operation.fontFamily || CONFIG.textFontFamily;
      const maxWidth = Math.max(20, operation.width || CONFIG.textDefaultWidth);
      const lines = wrapTextLines(ctx, operation.text || "", maxWidth);

      ctx.fillStyle = operation.color || "#000000";
      ctx.textBaseline = "top";
      ctx.font = `${fontSize}px ${fontFamily}`;

      for (let index = 0; index < lines.length; index += 1) {
        ctx.fillText(lines[index], operation.x, operation.y + index * lineHeight);
      }
    }

    function wrapTextLines(ctx, text, maxWidth) {
      const paragraphs = String(text || "").split(/\r?\n/);
      const lines = [];

      for (const paragraph of paragraphs) {
        const words = paragraph.split(/\s+/).filter(Boolean);

        if (words.length === 0) {
          lines.push("");
          continue;
        }

        let line = "";

        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const width = ctx.measureText(testLine).width;

          if (width > maxWidth && line) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }

        lines.push(line);
      }

      return lines;
    }

    function drawClearRectOperation(ctx, operation) {
      const x = Math.round(operation.x);
      const y = Math.round(operation.y);
      const width = Math.round(operation.width);
      const height = Math.round(operation.height);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, width, height);
    }

    function drawImagePatchOperation(ctx, operation) {
      ctx.drawImage(operation.canvas, operation.x, operation.y, operation.width, operation.height);
    }

    function normalizeRect(x1, y1, x2, y2) {
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);

      return {
        x,
        y,
        width,
        height
      };
    }

    async function copyPngToClipboard() {
      raisePanel();
      commitTextEditor();

      if (state.selection) {
        await copySelectedRegion();
        return;
      }

      let blob;

      try {
        blob = await createExportPngBlob();
      } catch (error) {
        console.error("[Quick Sketch] Export for copy failed.", error);
        showStatus("Export failed");
        return;
      }

      try {
        await writePngBlobToClipboard(blob);
        showStatus("Copied");
      } catch (error) {
        console.warn("[Quick Sketch] Clipboard write failed.", error);
        showStatus("Clipboard blocked. Use Download.");
      }
    }

    async function writePngBlobToClipboard(blob) {
      if (!navigator.clipboard || typeof navigator.clipboard.write !== "function" || typeof ClipboardItem !== "function") {
        throw new Error("PNG clipboard writing is unavailable.");
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);
    }

    async function downloadPng() {
      raisePanel();
      commitTextEditor();

      let blob;

      try {
        blob = await createExportPngBlob();
      } catch (error) {
        console.error("[Quick Sketch] Export for download failed.", error);
        showStatus("Export failed");
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = createDownloadFileName();
      link.rel = "noopener";

      const parent = document.body || document.documentElement;

      parent.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(function revokeDownloadUrl() {
        URL.revokeObjectURL(objectUrl);
      }, 1200);

      showStatus("Downloaded");
    }

    async function createExportPngBlob() {
      const area = state.documentWidth * state.documentHeight;

      if (area > CONFIG.maxOutputArea) {
        throw new Error("Export surface is too large.");
      }

      const exportCanvas = document.createElement("canvas");

      renderToCanvas(exportCanvas, {
        dpr: 1,
        includeGrid: false,
        includeActiveStroke: false,
        includeActiveShape: false,
        includeSelectionMoveClear: false
      });

      return canvasToPngBlob(exportCanvas);
    }

    function canvasToPngBlob(canvas) {
      return new Promise(function canvasToPngBlobPromise(resolve, reject) {
        if (typeof canvas.toBlob === "function") {
          canvas.toBlob(function handleCanvasBlob(blob) {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob returned no data."));
            }
          }, "image/png");

          return;
        }

        try {
          const dataUrl = canvas.toDataURL("image/png");

          resolve(dataUrlToBlob(dataUrl));
        } catch (error) {
          reject(error);
        }
      });
    }

    function dataUrlToBlob(dataUrl) {
      const commaIndex = dataUrl.indexOf(",");

      if (commaIndex === -1) {
        throw new Error("Invalid data URL.");
      }

      const header = dataUrl.slice(0, commaIndex);
      const data = dataUrl.slice(commaIndex + 1);
      const mimeStart = header.indexOf(":") + 1;
      const mimeEnd = header.indexOf(";");
      const mime = mimeStart > 0 && mimeEnd > mimeStart ? header.slice(mimeStart, mimeEnd) : "image/png";
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      return new Blob([bytes], { type: mime });
    }

    function createDownloadFileName() {
      const now = new Date();
      const year = now.getFullYear();
      const month = pad2(now.getMonth() + 1);
      const day = pad2(now.getDate());
      const hours = pad2(now.getHours());
      const minutes = pad2(now.getMinutes());
      const seconds = pad2(now.getSeconds());

      return `quick-sketch-${year}-${month}-${day}-${hours}${minutes}${seconds}.png`;
    }

    function showStatus(message) {
      els.status.textContent = message;
      els.status.hidden = false;

      if (statusTimer) {
        window.clearTimeout(statusTimer);
      }

      statusTimer = window.setTimeout(function hideStatus() {
        els.status.hidden = true;
      }, CONFIG.statusDurationMs);
    }

    function getVisibleDpr() {
      return clamp(window.devicePixelRatio || 1, 1, CONFIG.maxDevicePixelRatio);
    }

    function isPrimaryPointerDown(event) {
      return event.button === 0;
    }

    function normalizeHexColor(value) {
      const color = String(value || "").trim();

      if (/^#[0-9a-fA-F]{6}$/.test(color)) {
        return color.toLowerCase();
      }

      return "#000000";
    }

    function isKnownShapeType(shapeType) {
      return shapeType === "line" || shapeType === "arrow" || shapeType === "rectangle" || shapeType === "filledRectangle" || shapeType === "ellipse" || shapeType === "filledEllipse" || shapeType === "roundedRectangle" || shapeType === "filledRoundedRectangle";
    }

    function isRectangularShape(shapeType) {
      return shapeType === "rectangle" || shapeType === "filledRectangle" || shapeType === "ellipse" || shapeType === "filledEllipse" || shapeType === "roundedRectangle" || shapeType === "filledRoundedRectangle";
    }

    function isFilledShape(shapeType) {
      return shapeType === "filledRectangle" || shapeType === "filledEllipse" || shapeType === "filledRoundedRectangle";
    }

    function shapeIconName(shapeType) {
      const map = {
        line: "shapeLine",
        arrow: "shapeArrow",
        rectangle: "shapeRectangle",
        filledRectangle: "shapeFilledRectangle",
        ellipse: "shapeEllipse",
        filledEllipse: "shapeFilledEllipse",
        roundedRectangle: "shapeRoundedRectangle",
        filledRoundedRectangle: "shapeFilledRoundedRectangle"
      };

      return map[shapeType] || "shapeRectangle";
    }

    function shapeDisplayName(shapeType) {
      const map = {
        line: "Line",
        arrow: "Arrow",
        rectangle: "Rectangle",
        filledRectangle: "Solid rectangle",
        ellipse: "Ellipse",
        filledEllipse: "Solid ellipse",
        roundedRectangle: "Rounded rectangle",
        filledRoundedRectangle: "Solid rounded rectangle"
      };

      return map[shapeType] || "Rectangle";
    }

    function isTextEntryTarget(target) {
      if (!target) {
        return false;
      }

      const tagName = target.tagName ? target.tagName.toLowerCase() : "";

      return tagName === "textarea" || tagName === "input" || target.isContentEditable;
    }

    function distanceBetween(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;

      return Math.sqrt(dx * dx + dy * dy);
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function pad2(value) {
      return String(value).padStart(2, "0");
    }
  }

  function setImportant(style, property, value) {
    style.setProperty(property, value, "important");
  }

  function svgIcon(name) {
    const icons = {
      pen: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4.6-1 10.8-10.8a2.1 2.1 0 0 0 0-3L18.8 4.6a2.1 2.1 0 0 0-3 0L5 15.4 4 20z"></path><path d="M14.5 6l3.5 3.5"></path></svg>`,
      eraser: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 14.8 13.5 5a2.2 2.2 0 0 1 3.1 0L20 8.4a2.2 2.2 0 0 1 0 3.1L11.6 20H6.8l-3-3a1.6 1.6 0 0 1 0-2.2z"></path><path d="m12 20 8 0"></path><path d="m9.5 9.5 5 5"></path></svg>`,
      select: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="1" stroke-dasharray="2 2"></rect></svg>`,
      text: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14"></path><path d="M12 6v12"></path><path d="M9 18h6"></path></svg>`,
      undo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7H4v5"></path><path d="M4 12a8 8 0 1 0 2.35-5.65L4 8.7"></path></svg>`,
      redo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 7h5v5"></path><path d="M20 12a8 8 0 1 1-2.35-5.65L20 8.7"></path></svg>`,
      image: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="m7 16 4-4 3 3 2-2 3 3"></path><circle cx="9" cy="9" r="1.4"></circle></svg>`,
      download: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10"></path><path d="m8 10 4 4 4-4"></path><path d="M5 20h14"></path></svg>`,
      close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg>`,
      shapeLine: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5"></path></svg>`,
      shapeArrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5"></path><path d="M12 5h7v7"></path></svg>`,
      shapeRectangle: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="6" width="14" height="12" rx="1"></rect></svg>`,
      shapeFilledRectangle: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="6" width="14" height="12" rx="1" fill="currentColor" stroke="currentColor"></rect></svg>`,
      shapeEllipse: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="5"></ellipse></svg>`,
      shapeFilledEllipse: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="5" fill="currentColor" stroke="currentColor"></ellipse></svg>`,
      shapeRoundedRectangle: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="6" width="14" height="12" rx="4"></rect></svg>`,
      shapeFilledRoundedRectangle: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="6" width="14" height="12" rx="4" fill="currentColor" stroke="currentColor"></rect></svg>`
    };

    return icons[name] || "";
  }
})();