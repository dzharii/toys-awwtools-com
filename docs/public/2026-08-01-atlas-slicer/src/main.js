import { createDefaultApplicationState } from "./state/defaults.js";
import {
  calculateGridLayout,
  enumerateAtlasCells,
  findCellAtPoint,
} from "./grid/grid-math.js";
import { createRecommendations } from "./grid/grid-recommendations.js";
import { renderAtlasOverlay, renderGrid } from "./grid/grid-renderer.js";
import {
  createNamedCells,
  createSpriteFileName,
  validateNamingTemplate,
} from "./atlas/sprite-naming.js";
import {
  createAtlasZip,
  createGridPng,
  createSpriteBlob,
  downloadBlob,
} from "./export/export-service.js";
import {
  STORAGE_KEYS,
  createPresetDocument,
  decodeUrlState,
  encodeUrlState,
  normalizeGridDefinition,
  readStoredJson,
  writeStoredJson,
} from "./persistence/configuration.js";
import {
  exportDiagnostics,
  log,
  normalizeError,
  startTransaction,
} from "./core/logger.js";

const state = createDefaultApplicationState();
const elements = Object.fromEntries([...document.querySelectorAll("[id]")].map((element) => [element.id, element]));
const undoHistory = [];
const redoHistory = [];
let layoutResult = calculateGridLayout(state.gridDefinition);
let namedAtlasCells = [];
let renderFrameId = 0;
let persistenceTimerId = 0;
let spacePressed = false;
let panGesture = null;
const touchPointers = new Map();
let pinchGesture = null;
let exporting = false;

function cloneDefinition() {
  return structuredClone(state.gridDefinition);
}

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value[key], object);
}

function setPath(object, path, value) {
  const keys = path.split(".");
  const finalKey = keys.pop();
  const target = keys.reduce((value, key) => value[key], object);
  target[finalKey] = value;
}

function announce(message, level = "info") {
  state.status = { message, level };
  elements["status-message"].textContent = message;
  document.querySelector(".status-dot").style.background = level === "error"
    ? "#f04438"
    : level === "warning" ? "#fbbf24" : "#4ade80";
}

function commitDefinition(mutator, event = "configuration.changed", fields = {}) {
  const previous = cloneDefinition();
  const candidate = cloneDefinition();
  mutator(candidate);
  try {
    state.gridDefinition = normalizeGridDefinition(candidate);
    undoHistory.push(previous);
    if (undoHistory.length > 100) undoHistory.shift();
    redoHistory.length = 0;
    log("info", "state", event, "Grid configuration changed.", fields);
    refresh();
  } catch (error) {
    announce(error.message, "error");
    log("warning", "validation", "configuration.rejected", error.message, { ...fields, error: normalizeError(error) });
    syncControls();
  }
}

function undo() {
  if (!undoHistory.length) return;
  redoHistory.push(cloneDefinition());
  state.gridDefinition = undoHistory.pop();
  log("info", "state", "history.undo", "Configuration change undone.");
  refresh();
}

function redo() {
  if (!redoHistory.length) return;
  undoHistory.push(cloneDefinition());
  state.gridDefinition = redoHistory.pop();
  log("info", "state", "history.redo", "Configuration change restored.");
  refresh();
}

function schedulePersistence() {
  clearTimeout(persistenceTimerId);
  persistenceTimerId = window.setTimeout(() => {
    try {
      writeStoredJson(STORAGE_KEYS.session, {
        schemaVersion: 1,
        activeMode: state.activeMode,
        gridDefinition: state.gridDefinition,
        lastSourceName: state.atlas.metadata?.fileName || null,
      });
    } catch (error) {
      announce("Settings could not be saved locally. The current session remains usable.", "warning");
      log("warning", "storage", "session.save.failed", "Session storage failed.", { error: normalizeError(error) });
    }
    try {
      const encoded = encodeUrlState(state.activeMode, state.gridDefinition);
      window.history.replaceState(null, "", `#v=1&mode=${state.activeMode}&state=${encoded}`);
      log("info", "url", "state.updated", "Shareable URL state updated.", { schemaVersion: 1, length: encoded.length });
    } catch (error) {
      log("warning", "url", "state.update.failed", "URL state could not be updated.", { error: normalizeError(error) });
    }
  }, 350);
}

function syncControls() {
  document.body.dataset.mode = state.activeMode;
  for (const tab of document.querySelectorAll(".mode-tab")) {
    const selected = tab.dataset.mode === state.activeMode;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const input of document.querySelectorAll("[data-path]")) {
    const value = getPath(state.gridDefinition, input.dataset.path);
    if (input.type !== "checkbox" && document.activeElement !== input) input.value = value;
  }
  elements["count-mode"].value = state.gridDefinition.count.columnMode;
  elements["column-count"].readOnly = state.gridDefinition.count.columnMode === "automatic";
  elements["row-count"].readOnly = state.gridDefinition.count.rowMode === "automatic";
  if (state.gridDefinition.count.columnMode === "automatic") elements["column-count"].value = layoutResult.horizontal.completeCellCount;
  if (state.gridDefinition.count.rowMode === "automatic") elements["row-count"].value = layoutResult.vertical.completeCellCount;
  elements["border-enabled"].checked = state.gridDefinition.outerBorder.enabled;
  elements["line-opacity"].value = Math.round(state.gridDefinition.gridAppearance.lineOpacity * 100);
  elements["line-opacity-output"].textContent = `${elements["line-opacity"].value}%`;
  elements["line-style"].value = state.gridDefinition.gridAppearance.lineStyle;
  elements["background-mode"].value = state.gridDefinition.background.mode;
  elements["background-opacity"].value = Math.round(state.gridDefinition.background.opacity * 100);
  elements["background-opacity-output"].textContent = `${elements["background-opacity"].value}%`;
  elements["traversal-order"].value = state.gridDefinition.atlas.traversalOrder;
  elements["show-sequence-numbers"].checked = state.gridDefinition.atlas.showSequenceNumbers;
  elements["right-edge-policy"].value = state.gridDefinition.atlas.rightEdgePolicy;
  elements["bottom-edge-policy"].value = state.gridDefinition.atlas.bottomEdgePolicy;
  elements["pad-color"].value = state.gridDefinition.atlas.padColor;
  elements["naming-template"].value = state.gridDefinition.naming.template;
  elements["show-grid-button"].classList.toggle("is-pressed", state.gridDefinition.atlas.showGrid);
  elements["show-grid-button"].setAttribute("aria-pressed", String(state.gridDefinition.atlas.showGrid));
  elements.workspace.setAttribute("aria-labelledby", state.activeMode === "grid-creator" ? "grid-tab" : "atlas-tab");
}

function renderCanvases() {
  const definition = state.gridDefinition;
  const sourceCanvas = elements["source-canvas"];
  const overlayCanvas = elements["overlay-canvas"];
  const transformLayer = elements["transform-layer"];
  const width = definition.canvas.widthPixels;
  const height = definition.canvas.heightPixels;
  for (const canvas of [sourceCanvas, overlayCanvas]) {
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  }
  transformLayer.style.width = `${width}px`;
  transformLayer.style.height = `${height}px`;
  const sourceContext = sourceCanvas.getContext("2d");
  sourceContext.imageSmoothingEnabled = false;
  sourceContext.clearRect(0, 0, width, height);
  if (state.activeMode === "grid-creator") {
    renderGrid(sourceContext, definition, layoutResult, true);
    overlayCanvas.getContext("2d").clearRect(0, 0, width, height);
  } else if (state.atlas.sourceImage) {
    sourceContext.drawImage(state.atlas.sourceImage, 0, 0, width, height);
    const overlayContext = overlayCanvas.getContext("2d");
    renderAtlasOverlay(
      overlayContext,
      definition,
      layoutResult,
      state.atlas.selectedCell,
      definition.atlas.showGrid,
    );
    if (definition.atlas.showSequenceNumbers) {
      const fontSize = Math.max(6, Math.min(18, Math.floor(Math.min(definition.cell.widthPixels, definition.cell.heightPixels) * 0.34)));
      overlayContext.save();
      overlayContext.font = `700 ${fontSize}px ui-monospace, monospace`;
      overlayContext.textAlign = "center";
      overlayContext.textBaseline = "middle";
      overlayContext.lineWidth = Math.max(1, fontSize / 6);
      for (const cell of namedAtlasCells.slice(0, 5000)) {
        const rectangle = cell.sourceRectangle;
        const x = rectangle.x + rectangle.width / 2;
        const y = rectangle.y + rectangle.height / 2;
        overlayContext.strokeStyle = "rgba(4, 12, 24, 0.9)";
        overlayContext.fillStyle = "#ffffff";
        overlayContext.strokeText(String(cell.index), x, y);
        overlayContext.fillText(String(cell.index), x, y);
      }
      overlayContext.restore();
    }
  } else {
    overlayCanvas.getContext("2d").clearRect(0, 0, width, height);
  }
  updateTransform();
}

function scheduleRender() {
  if (renderFrameId) return;
  renderFrameId = requestAnimationFrame(() => {
    renderFrameId = 0;
    renderCanvases();
  });
}

function updateTransform() {
  const viewport = state.viewportByMode[state.activeMode];
  elements["transform-layer"].style.transform = `translate(${viewport.panXCssPixels}px, ${viewport.panYCssPixels}px) scale(${viewport.zoom})`;
  elements["zoom-status"].textContent = `Zoom: ${Math.round(viewport.zoom * 100)}%`;
  document.querySelectorAll(".zoom-preset").forEach((button) => button.classList.toggle("is-pressed", Number(button.dataset.zoom) === viewport.zoom));
}

function fitViewport() {
  const viewportRectangle = elements.viewport.getBoundingClientRect();
  const width = state.gridDefinition.canvas.widthPixels;
  const height = state.gridDefinition.canvas.heightPixels;
  if (!width || !height || viewportRectangle.width === 0 || viewportRectangle.height === 0) return;
  const padding = 36;
  const zoom = Math.min(
    (viewportRectangle.width - padding) / width,
    (viewportRectangle.height - padding) / height,
    8,
  );
  const modeViewport = state.viewportByMode[state.activeMode];
  modeViewport.zoom = Math.max(0.05, zoom);
  modeViewport.panXCssPixels = (viewportRectangle.width - width * modeViewport.zoom) / 2;
  modeViewport.panYCssPixels = (viewportRectangle.height - height * modeViewport.zoom) / 2;
  modeViewport.fitMode = true;
  updateTransform();
  log("info", "viewport", "fit.completed", "Preview fitted to workspace.", { mode: state.activeMode, zoomPercent: Math.round(modeViewport.zoom * 100) });
}

function createSummaryRows(rows) {
  return `<div class="summary-grid">${rows.map(([label, value]) => `<span>${label}</span><strong>${value}</strong>`).join("")}</div>`;
}

function updateSummaries() {
  const h = layoutResult.horizontal;
  const v = layoutResult.vertical;
  const selected = state.atlas.selectedCell;
  elements["workspace-summary"].textContent = `Canvas ${state.gridDefinition.canvas.widthPixels} × ${state.gridDefinition.canvas.heightPixels} px  ·  Grid ${h.completeCellCount} × ${v.completeCellCount}  ·  Cell ${state.gridDefinition.cell.widthPixels} × ${state.gridDefinition.cell.heightPixels} px  ·  ${layoutResult.totalCompleteCells} complete cells${selected ? `  ·  Selected (${selected.column}, ${selected.row})` : ""}`;
  elements["layout-details"].innerHTML = createSummaryRows([
    ["Complete columns", h.completeCellCount],
    ["Complete rows", v.completeCellCount],
    ["Total cells", layoutResult.totalCompleteCells],
    ["Used region", `${h.usedDimensionPixels} × ${v.usedDimensionPixels} px`],
    ["Unused edge", `${h.remainderPixels} × ${v.remainderPixels} px`],
    ["Fit", layoutResult.isExactFit ? "Exact" : layoutResult.hasOverflow ? "Overflow" : layoutResult.hasTruncation ? "Partial edge" : "Valid"],
  ]);
  const exportCount = namedAtlasCells.length;
  elements["export-summary"].innerHTML = createSummaryRows([
    ["Canvas", `${state.gridDefinition.canvas.widthPixels} × ${state.gridDefinition.canvas.heightPixels} px`],
    ["Cell size", `${state.gridDefinition.cell.widthPixels} × ${state.gridDefinition.cell.heightPixels} px`],
    ["Grid", `${h.completeCellCount} × ${v.completeCellCount}`],
    ["Separators", `${state.gridDefinition.separator.widthPixels} × ${state.gridDefinition.separator.heightPixels} px`],
    ["Output", state.activeMode === "grid-creator" ? "Transparent/solid PNG" : `${exportCount} PNG sprites + manifest`],
  ]);
  const exportLabel = state.activeMode === "grid-creator" ? "Download PNG" : `Download ZIP · ${exportCount} sprites`;
  for (const button of [elements["primary-export-button"], elements["context-export-button"]]) {
    button.textContent = exporting ? "Preparing export…" : exportLabel;
    button.disabled = exporting || (state.activeMode === "atlas-slicer" && (!state.atlas.sourceImage || exportCount === 0));
  }
}

function updateRecommendations() {
  const recommendations = createRecommendations(state.gridDefinition, layoutResult);
  elements.recommendations.replaceChildren(...recommendations.map((recommendation) => {
    const card = document.createElement("article");
    card.className = `recommendation ${recommendation.severity}`;
    const title = document.createElement("h3");
    title.textContent = recommendation.severity === "warning" ? `Warning · ${recommendation.title}` : recommendation.title;
    const explanation = document.createElement("p");
    explanation.textContent = recommendation.explanation;
    card.append(title, explanation);
    if (recommendation.changes && state.activeMode === "grid-creator") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-compact";
      button.textContent = "Apply";
      button.addEventListener("click", () => commitDefinition((definition) => {
        definition.canvas.widthPixels = recommendation.changes.width;
        definition.canvas.heightPixels = recommendation.changes.height;
      }, "recommendation.applied", { recommendationId: recommendation.id }));
      card.append(button);
    }
    return card;
  }));
}

function updateImageMetadata() {
  const metadata = state.atlas.metadata;
  elements["source-empty"].hidden = Boolean(metadata);
  elements["source-metadata"].hidden = !metadata;
  elements["reload-image-button"].disabled = !metadata;
  elements["clear-image-button"].disabled = !metadata;
  elements["empty-state"].hidden = Boolean(metadata) || state.activeMode === "grid-creator";
  elements["transform-layer"].hidden = state.activeMode === "atlas-slicer" && !metadata;
  if (!metadata) return;
  elements["source-metadata"].innerHTML = "";
  for (const [label, value] of [
    ["File", metadata.fileName],
    ["Dimensions", `${metadata.widthPixels} × ${metadata.heightPixels} px`],
    ["Type", metadata.mimeType || "Decoded image"],
    ["Size", `${(metadata.sizeBytes / 1024).toFixed(1)} KB`],
  ]) {
    const dt = document.createElement("dt"); dt.textContent = label;
    const dd = document.createElement("dd"); dd.textContent = value; dd.title = String(value);
    elements["source-metadata"].append(dt, dd);
  }
}

function updateSelection() {
  const selected = state.atlas.selectedCell;
  elements["selected-empty"].hidden = Boolean(selected);
  elements["selected-metadata"].hidden = !selected;
  elements["download-cell-button"].disabled = !selected || !state.atlas.sourceImage;
  const canvas = elements["selected-canvas"];
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (!selected || !state.atlas.sourceImage) return;
  const position = namedAtlasCells.findIndex((cell) => cell.row === selected.row && cell.column === selected.column);
  const current = position >= 0 ? namedAtlasCells[position] : selected;
  canvas.width = current.outputRectangle.width;
  canvas.height = current.outputRectangle.height;
  const previewScale = Math.min(10, 104 / Math.max(canvas.width, canvas.height));
  canvas.style.width = `${Math.max(1, Math.round(canvas.width * previewScale))}px`;
  canvas.style.height = `${Math.max(1, Math.round(canvas.height * previewScale))}px`;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    state.atlas.sourceImage,
    current.sourceRectangle.x,
    current.sourceRectangle.y,
    current.sourceRectangle.width,
    current.sourceRectangle.height,
    0, 0, current.sourceRectangle.width, current.sourceRectangle.height,
  );
  elements["selected-metadata"].innerHTML = "";
  for (const [label, value] of [
    ["Column, Row", `${current.column}, ${current.row}`],
    ["Pixel X, Y", `${current.sourceRectangle.x}, ${current.sourceRectangle.y}`],
    ["Size", `${current.sourceRectangle.width} × ${current.sourceRectangle.height} px`],
    ["Index", current.index],
  ]) {
    const dt = document.createElement("dt"); dt.textContent = label;
    const dd = document.createElement("dd"); dd.textContent = value;
    elements["selected-metadata"].append(dt, dd);
  }
}

function selectCell(cell, inputMethod = "pointer") {
  if (!cell) return;
  state.atlas.selectedCell = namedAtlasCells.find((candidate) => candidate.row === cell.row && candidate.column === cell.column) || cell;
  const selected = state.atlas.selectedCell;
  log("info", "selection", "cell.changed", "Atlas cell selected.", {
    row: selected.row,
    column: selected.column,
    index: selected.index,
    ...selected.sourceRectangle,
    inputMethod,
  });
  refresh(false);
  revealSelectedThumbnail();
}

function updateNaming() {
  const validation = validateNamingTemplate(state.gridDefinition.naming.template);
  elements["naming-error"].textContent = validation.message;
  const selected = state.atlas.selectedCell || namedAtlasCells[0];
  elements["naming-preview"].textContent = selected
    ? createSpriteFileName(selected, Math.max(0, namedAtlasCells.indexOf(selected)), state.gridDefinition.naming, state.atlas.metadata?.fileName || "atlas")
    : "sprite_001.png";
}

function renderThumbnail(cell, position) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sprite-thumb";
  button.dataset.position = position;
  button.title = `Index ${cell.index} · Row ${cell.row} · Column ${cell.column} · ${cell.fileName}`;
  button.setAttribute("aria-label", button.title);
  button.classList.toggle("is-selected", state.atlas.selectedCell?.row === cell.row && state.atlas.selectedCell?.column === cell.column);
  const canvas = document.createElement("canvas");
  canvas.width = cell.outputRectangle.width;
  canvas.height = cell.outputRectangle.height;
  const thumbnailScale = Math.min(8, 54 / Math.max(canvas.width, canvas.height));
  canvas.style.width = `${Math.max(1, Math.round(canvas.width * thumbnailScale))}px`;
  canvas.style.height = `${Math.max(1, Math.round(canvas.height * thumbnailScale))}px`;
  canvas.getContext("2d").drawImage(
    state.atlas.sourceImage,
    cell.sourceRectangle.x, cell.sourceRectangle.y, cell.sourceRectangle.width, cell.sourceRectangle.height,
    0, 0, cell.sourceRectangle.width, cell.sourceRectangle.height,
  );
  button.append(canvas);
  button.addEventListener("click", () => selectCell(cell, "thumbnail"));
  return button;
}

function updateSpriteStrip() {
  const track = elements["sprite-track"];
  track.replaceChildren();
  if (!state.atlas.sourceImage || namedAtlasCells.length === 0) {
    elements["sprite-position"].textContent = `0 / ${namedAtlasCells.length}`;
    return;
  }
  const selectedPosition = Math.max(0, namedAtlasCells.findIndex((cell) => cell.row === state.atlas.selectedCell?.row && cell.column === state.atlas.selectedCell?.column));
  // Keep the DOM bounded while always including a useful neighborhood around selection.
  const start = Math.max(0, selectedPosition - 45);
  const end = Math.min(namedAtlasCells.length, start + 100);
  const fragment = document.createDocumentFragment();
  for (let position = start; position < end; position += 1) fragment.append(renderThumbnail(namedAtlasCells[position], position));
  track.append(fragment);
  elements["sprite-position"].textContent = state.atlas.selectedCell ? `${selectedPosition + 1} / ${namedAtlasCells.length}` : `0 / ${namedAtlasCells.length}`;
}

function revealSelectedThumbnail() {
  requestAnimationFrame(() => {
    const thumb = elements["sprite-track"].querySelector(".sprite-thumb.is-selected");
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
}

function revalidateSelection() {
  if (!state.atlas.selectedCell) return;
  const current = namedAtlasCells.find((cell) => cell.row === state.atlas.selectedCell.row && cell.column === state.atlas.selectedCell.column);
  if (current) {
    state.atlas.selectedCell = current;
    return;
  }
  if (namedAtlasCells.length) {
    const previous = state.atlas.selectedCell;
    state.atlas.selectedCell = namedAtlasCells.reduce((nearest, cell) => {
      const distance = Math.abs(cell.row - previous.row) + Math.abs(cell.column - previous.column);
      const nearestDistance = Math.abs(nearest.row - previous.row) + Math.abs(nearest.column - previous.column);
      return distance < nearestDistance ? cell : nearest;
    }, namedAtlasCells[0]);
    announce(`Selection moved to the nearest valid cell: ${state.atlas.selectedCell.column}, ${state.atlas.selectedCell.row}.`);
  } else {
    state.atlas.selectedCell = null;
    announce("Selection cleared because no valid cells remain.", "warning");
  }
}

function refresh(persist = true) {
  layoutResult = calculateGridLayout(state.gridDefinition);
  const atlasCells = enumerateAtlasCells(state.gridDefinition, layoutResult);
  const naming = createNamedCells(atlasCells, state.gridDefinition.naming, state.atlas.metadata?.fileName || "atlas");
  namedAtlasCells = naming.cells;
  revalidateSelection();
  syncControls();
  updateImageMetadata();
  updateSelection();
  updateNaming();
  updateSpriteStrip();
  updateRecommendations();
  updateSummaries();
  scheduleRender();
  if (persist) schedulePersistence();
}

function setMode(mode, focus = false) {
  if (mode === state.activeMode) return;
  if (state.activeMode === "grid-creator") {
    state.gridCreatorCanvas = { ...state.gridDefinition.canvas };
  }
  if (mode === "grid-creator") {
    state.gridDefinition.canvas = { ...state.gridCreatorCanvas };
  } else if (state.atlas.metadata) {
    state.gridDefinition.canvas.widthPixels = state.atlas.metadata.widthPixels;
    state.gridDefinition.canvas.heightPixels = state.atlas.metadata.heightPixels;
  }
  state.activeMode = mode;
  log("info", "navigation", "mode.changed", "Application mode changed.", { mode });
  refresh();
  requestAnimationFrame(fitViewport);
  if (focus) document.querySelector(`[data-mode="${mode}"]`).focus();
}

async function decodeImageFile(file, reuseRequestId = null) {
  const transaction = startTransaction("image", "load", "Image decoding started.", { fileName: file.name, sizeBytes: file.size, mimeType: file.type });
  const requestId = reuseRequestId ?? ++state.atlas.imageRequestId;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("The selected file could not be decoded as an image."));
      image.src = objectUrl;
    });
    if (requestId !== state.atlas.imageRequestId) {
      URL.revokeObjectURL(objectUrl);
      transaction.finish("superseded", "A newer image request replaced this decode.");
      return;
    }
    if (state.atlas.sourceObjectUrl) URL.revokeObjectURL(state.atlas.sourceObjectUrl);
    state.atlas.sourceFile = file;
    state.atlas.sourceImage = image;
    state.atlas.sourceObjectUrl = objectUrl;
    state.atlas.metadata = {
      fileName: file.name,
      widthPixels: image.naturalWidth,
      heightPixels: image.naturalHeight,
      mimeType: file.type || "Decoded image",
      sizeBytes: file.size,
    };
    state.atlas.selectedCell = null;
    state.gridDefinition.canvas.widthPixels = image.naturalWidth;
    state.gridDefinition.canvas.heightPixels = image.naturalHeight;
    transaction.finish("completed", "Image decoded successfully.", { widthPixels: image.naturalWidth, heightPixels: image.naturalHeight });
    announce(`${file.name} loaded locally.`);
    refresh();
    requestAnimationFrame(fitViewport);
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    transaction.finish("failed", "Image decode failed; the previous image was preserved.", { error: normalizeError(error) }, "error");
    announce(error.message, "error");
  }
}

function clearImage() {
  state.atlas.imageRequestId += 1;
  if (state.atlas.sourceObjectUrl) URL.revokeObjectURL(state.atlas.sourceObjectUrl);
  Object.assign(state.atlas, { sourceFile: null, sourceImage: null, sourceObjectUrl: null, metadata: null, selectedCell: null });
  log("info", "image", "clear.completed", "Source image cleared; grid configuration preserved.");
  announce("Source image cleared. Grid settings were preserved.");
  refresh();
}

function selectRelativeCell(delta, inputMethod = "keyboard") {
  if (!namedAtlasCells.length) return;
  const current = namedAtlasCells.findIndex((cell) => cell.row === state.atlas.selectedCell?.row && cell.column === state.atlas.selectedCell?.column);
  const next = Math.max(0, Math.min(namedAtlasCells.length - 1, (current < 0 ? 0 : current) + delta));
  selectCell(namedAtlasCells[next], inputMethod);
}

async function exportCurrent() {
  if (exporting) return;
  exporting = true;
  updateSummaries();
  const transaction = startTransaction("export", state.activeMode === "grid-creator" ? "grid-png" : "atlas-zip", "Export started.", { mode: state.activeMode, cellCount: namedAtlasCells.length });
  try {
    if (state.activeMode === "grid-creator") {
      const blob = await createGridPng(state.gridDefinition, layoutResult);
      const fileName = `grid-${state.gridDefinition.canvas.widthPixels}x${state.gridDefinition.canvas.heightPixels}-cell-${state.gridDefinition.cell.widthPixels}x${state.gridDefinition.cell.heightPixels}.png`;
      downloadBlob(blob, fileName);
      transaction.finish("completed", "Grid PNG downloaded.", { fileName, sizeBytes: blob.size });
      announce("Grid PNG downloaded.");
    } else {
      const validation = validateNamingTemplate(state.gridDefinition.naming.template);
      const naming = createNamedCells(enumerateAtlasCells(state.gridDefinition, layoutResult), state.gridDefinition.naming, state.atlas.metadata.fileName);
      if (!validation.valid) throw new Error(validation.message);
      if (naming.duplicates.length) throw new Error(`Duplicate filename: ${naming.duplicates[0]}`);
      if (!naming.cells.length) throw new Error("No policy-approved cells are available for export.");
      const blob = await createAtlasZip({
        sourceImage: state.atlas.sourceImage,
        sourceMetadata: state.atlas.metadata,
        gridDefinition: state.gridDefinition,
        namedCells: naming.cells,
        onProgress(progress) {
          if (progress.stage === "encoding") announce(`Encoding ${progress.current} of ${progress.total} sprites…`);
          else announce(`Creating ZIP… ${Math.round(progress.percent)}%`);
        },
      });
      const archiveName = `${state.atlas.metadata.fileName.replace(/\.[^.]+$/, "")}-slices.zip`;
      downloadBlob(blob, archiveName);
      transaction.finish("completed", "Atlas ZIP downloaded.", { fileName: archiveName, spriteCount: naming.cells.length, sizeBytes: blob.size });
      announce(`${naming.cells.length} sprites downloaded in one ZIP.`);
    }
  } catch (error) {
    transaction.finish("failed", "Export failed; image and configuration were preserved.", { error: normalizeError(error) }, "error");
    announce(error.message, "error");
  } finally {
    exporting = false;
    updateSummaries();
  }
}

async function downloadSelectedCell() {
  const cell = state.atlas.selectedCell;
  if (!cell || !state.atlas.sourceImage) return;
  const transaction = startTransaction("export", "selected-cell", "Selected-cell export started.", { row: cell.row, column: cell.column, index: cell.index });
  try {
    const blob = await createSpriteBlob(state.atlas.sourceImage, cell, state.gridDefinition);
    downloadBlob(blob, cell.fileName);
    transaction.finish("completed", "Selected-cell PNG downloaded.", { fileName: cell.fileName, sizeBytes: blob.size });
    announce(`${cell.fileName} downloaded.`);
  } catch (error) {
    transaction.finish("failed", "Selected-cell export failed.", { error: normalizeError(error) }, "error");
    announce(error.message, "error");
  }
}

function savePreset() {
  const name = window.prompt("Preset name", "My grid preset");
  if (!name?.trim()) return;
  const stored = readStoredJson(STORAGE_KEYS.presets, { storageSchemaVersion: 1, presets: [] });
  const now = new Date().toISOString();
  const preset = {
    presetId: crypto.randomUUID?.() || `preset-${Date.now()}`,
    presetName: name.trim(),
    createdAt: now,
    updatedAt: now,
    applicationSchemaVersion: 1,
    configuration: cloneDefinition(),
  };
  try {
    stored.presets.push(preset);
    writeStoredJson(STORAGE_KEYS.presets, stored);
    loadPresetOptions();
    elements["preset-select"].value = preset.presetId;
    log("info", "preset", "save.completed", "Preset saved.", { presetId: preset.presetId, presetName: preset.presetName });
    announce("Preset saved.");
  } catch (error) {
    announce("Preset could not be saved. Current settings were preserved.", "error");
    log("error", "preset", "save.failed", "Preset persistence failed.", { error: normalizeError(error) });
  }
}

function loadPresetOptions() {
  const stored = readStoredJson(STORAGE_KEYS.presets, { presets: [] });
  elements["preset-select"].replaceChildren(new Option("Saved presets", ""), ...stored.presets.map((preset) => new Option(preset.presetName, preset.presetId)));
}

function updateStoredPreset(action) {
  const presetId = elements["preset-select"].value;
  const stored = readStoredJson(STORAGE_KEYS.presets, { storageSchemaVersion: 1, presets: [] });
  const index = stored.presets.findIndex((preset) => preset.presetId === presetId);
  if (index < 0) {
    announce("Choose a saved preset first.", "warning");
    return;
  }
  const preset = stored.presets[index];
  if (action === "update") {
    preset.configuration = cloneDefinition();
    preset.updatedAt = new Date().toISOString();
  } else if (action === "rename") {
    const name = window.prompt("Rename preset", preset.presetName);
    if (!name?.trim()) return;
    preset.presetName = name.trim();
    preset.updatedAt = new Date().toISOString();
  } else if (action === "duplicate") {
    const now = new Date().toISOString();
    const duplicate = {
      ...preset,
      presetId: crypto.randomUUID?.() || `preset-${Date.now()}`,
      presetName: `${preset.presetName} copy`,
      createdAt: now,
      updatedAt: now,
      configuration: structuredClone(preset.configuration),
    };
    stored.presets.splice(index + 1, 0, duplicate);
    try {
      writeStoredJson(STORAGE_KEYS.presets, stored);
      loadPresetOptions();
      elements["preset-select"].value = duplicate.presetId;
      log("info", "preset", "duplicate.completed", "Preset duplicated.", { presetId: duplicate.presetId });
      announce("Preset duplicated.");
    } catch (error) {
      announce("Preset duplicate failed. Current settings were preserved.", "error");
      log("error", "preset", "duplicate.failed", "Preset duplication failed.", { presetId, error: normalizeError(error) });
    }
    return;
  } else if (action === "delete") {
    if (!window.confirm(`Delete preset “${preset.presetName}”?`)) return;
    stored.presets.splice(index, 1);
  }
  try {
    writeStoredJson(STORAGE_KEYS.presets, stored);
    loadPresetOptions();
    if (action !== "delete") elements["preset-select"].value = presetId;
    log("info", "preset", `${action}.completed`, `Preset ${action} completed.`, { presetId });
    announce(action === "delete" ? "Preset deleted." : action === "rename" ? "Preset renamed." : "Preset updated.");
  } catch (error) {
    announce(`Preset ${action} failed. Current settings were preserved.`, "error");
    log("error", "preset", `${action}.failed`, `Preset ${action} failed.`, { presetId, error: normalizeError(error) });
  }
}

function loadSelectedPreset() {
  const stored = readStoredJson(STORAGE_KEYS.presets, { presets: [] });
  const preset = stored.presets.find((candidate) => candidate.presetId === elements["preset-select"].value);
  if (!preset) return;
  const previous = cloneDefinition();
  try {
    state.gridDefinition = normalizeGridDefinition(preset.configuration);
    undoHistory.push(previous);
    redoHistory.length = 0;
    log("info", "preset", "load.completed", "Preset loaded.", { presetId: preset.presetId, presetName: preset.presetName });
    announce(`${preset.presetName} loaded.`);
    refresh();
  } catch (error) {
    announce(`Preset could not be loaded: ${error.message}`, "error");
  }
}

function exportJson() {
  const documentValue = createPresetDocument("Exported grid", state.gridDefinition);
  downloadBlob(new Blob([JSON.stringify(documentValue, null, 2)], { type: "application/json" }), "grid-atlas-preset.json");
  log("info", "preset", "json-export.completed", "Preset JSON downloaded.", { schemaVersion: 1 });
  announce("Preset JSON downloaded.");
}

async function importJson(file) {
  const transaction = startTransaction("preset", "json-import", "Preset JSON import started.", { fileName: file.name, sizeBytes: file.size });
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.documentType !== "grid-atlas-helper-preset") throw new Error("This is not a Grid and Atlas Helper preset.");
    if (parsed.schemaVersion > 1) throw new Error(`This preset uses unsupported schema version ${parsed.schemaVersion}.`);
    const configuration = normalizeGridDefinition(parsed.configuration);
    if (!window.confirm(`Import “${parsed.presetName || file.name}” and replace the current grid settings?`)) {
      transaction.finish("cancelled", "Preset import cancelled.");
      return;
    }
    undoHistory.push(cloneDefinition());
    state.gridDefinition = configuration;
    transaction.finish("completed", "Preset JSON imported.", { schemaVersion: parsed.schemaVersion });
    announce("Preset JSON imported.");
    refresh();
  } catch (error) {
    transaction.finish("failed", "Preset import failed; current configuration was preserved.", { error: normalizeError(error) }, "error");
    announce(`Cannot import preset: ${error.message}`, "error");
  }
}

async function copyShareableUrl() {
  const encoded = encodeUrlState(state.activeMode, state.gridDefinition);
  const url = `${location.href.split("#")[0]}#v=1&mode=${state.activeMode}&state=${encoded}`;
  window.history.replaceState(null, "", url);
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const input = document.createElement("textarea"); input.value = url; document.body.append(input); input.select(); document.execCommand("copy"); input.remove();
  }
  log("info", "url", "copy.completed", "Shareable URL copied.", { schemaVersion: 1, length: url.length });
  announce(url.length > 2000 ? "URL copied. It is longer than 2,000 characters." : "Shareable URL copied.");
}

function exportDiagnosticJson() {
  const diagnostics = exportDiagnostics({ activeMode: state.activeMode, gridDefinition: state.gridDefinition, sourceMetadata: state.atlas.metadata });
  downloadBlob(new Blob([JSON.stringify(diagnostics, null, 2)], { type: "application/json" }), "grid-atlas-diagnostics.json");
  announce("Diagnostic JSON downloaded.");
}

function bindControls() {
  document.querySelectorAll("[data-path]").forEach((input) => {
    const commit = () => {
      const value = input.type === "number" ? Number(input.value) : input.value;
      commitDefinition((definition) => setPath(definition, input.dataset.path, value), "configuration.field.changed", { path: input.dataset.path, value });
    };
    input.addEventListener(input.type === "color" ? "input" : "change", commit);
    input.addEventListener("keydown", (event) => { if (event.code === "Enter") { event.preventDefault(); commit(); input.blur(); } });
    input.addEventListener("wheel", (event) => { if (document.activeElement !== input) input.blur(); });
  });
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
    tab.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.code)) {
        event.preventDefault();
        const mode = event.code === "ArrowLeft" || event.code === "Home" ? "grid-creator" : "atlas-slicer";
        setMode(mode, true);
      }
    });
  });
  elements["count-mode"].addEventListener("change", () => commitDefinition((definition) => {
    definition.count.columnMode = elements["count-mode"].value;
    definition.count.rowMode = elements["count-mode"].value;
  }));
  elements["border-enabled"].addEventListener("change", () => commitDefinition((definition) => { definition.outerBorder.enabled = elements["border-enabled"].checked; }));
  elements["line-opacity"].addEventListener("input", () => commitDefinition((definition) => { definition.gridAppearance.lineOpacity = Number(elements["line-opacity"].value) / 100; }));
  elements["line-style"].addEventListener("change", () => commitDefinition((definition) => { definition.gridAppearance.lineStyle = elements["line-style"].value; }));
  elements["background-mode"].addEventListener("change", () => commitDefinition((definition) => { definition.background.mode = elements["background-mode"].value; }));
  elements["background-opacity"].addEventListener("input", () => commitDefinition((definition) => { definition.background.opacity = Number(elements["background-opacity"].value) / 100; }));
  elements["traversal-order"].addEventListener("change", () => commitDefinition((definition) => { definition.atlas.traversalOrder = elements["traversal-order"].value; }));
  elements["show-sequence-numbers"].addEventListener("change", () => commitDefinition((definition) => { definition.atlas.showSequenceNumbers = elements["show-sequence-numbers"].checked; }));
  elements["right-edge-policy"].addEventListener("change", () => commitDefinition((definition) => { definition.atlas.rightEdgePolicy = elements["right-edge-policy"].value; }));
  elements["bottom-edge-policy"].addEventListener("change", () => commitDefinition((definition) => { definition.atlas.bottomEdgePolicy = elements["bottom-edge-policy"].value; }));
  elements["pad-color"].addEventListener("input", () => commitDefinition((definition) => { definition.atlas.padColor = elements["pad-color"].value; }));
  elements["naming-template"].addEventListener("change", () => commitDefinition((definition) => { definition.naming.template = elements["naming-template"].value; }));
  elements["open-image-button"].addEventListener("click", () => elements["image-input"].click());
  elements["empty-open-button"].addEventListener("click", () => elements["image-input"].click());
  elements["image-input"].addEventListener("change", () => { const [file] = elements["image-input"].files; if (file) decodeImageFile(file); elements["image-input"].value = ""; });
  elements["reload-image-button"].addEventListener("click", () => state.atlas.sourceFile && decodeImageFile(state.atlas.sourceFile));
  elements["clear-image-button"].addEventListener("click", clearImage);
  elements["fit-button"].addEventListener("click", fitViewport);
  document.querySelectorAll(".zoom-preset").forEach((button) => button.addEventListener("click", () => {
    const viewport = state.viewportByMode[state.activeMode];
    viewport.zoom = Number(button.dataset.zoom); viewport.fitMode = false; updateTransform();
  }));
  elements["show-grid-button"].addEventListener("click", () => commitDefinition((definition) => { definition.atlas.showGrid = !definition.atlas.showGrid; }));
  elements["primary-export-button"].addEventListener("click", exportCurrent);
  elements["context-export-button"].addEventListener("click", exportCurrent);
  elements["download-cell-button"].addEventListener("click", downloadSelectedCell);
  elements["previous-sprite"].addEventListener("click", () => selectRelativeCell(-1, "previous-button"));
  elements["next-sprite"].addEventListener("click", () => selectRelativeCell(1, "next-button"));
  elements["save-preset-button"].addEventListener("click", savePreset);
  elements["preset-select"].addEventListener("change", loadSelectedPreset);
  elements["update-preset-button"].addEventListener("click", () => updateStoredPreset("update"));
  elements["rename-preset-button"].addEventListener("click", () => updateStoredPreset("rename"));
  elements["duplicate-preset-button"].addEventListener("click", () => updateStoredPreset("duplicate"));
  elements["delete-preset-button"].addEventListener("click", () => updateStoredPreset("delete"));
  elements["export-json-button"].addEventListener("click", exportJson);
  elements["import-json-button"].addEventListener("click", () => elements["json-input"].click());
  elements["json-input"].addEventListener("change", () => { const [file] = elements["json-input"].files; if (file) importJson(file); elements["json-input"].value = ""; });
  elements["copy-url-button"].addEventListener("click", copyShareableUrl);
  elements["diagnostics-button"].addEventListener("click", exportDiagnosticJson);
  elements["sprite-track"].addEventListener("wheel", (event) => { event.preventDefault(); elements["sprite-track"].scrollLeft += event.deltaY || event.deltaX; }, { passive: false });
}

function bindViewport() {
  elements.viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rectangle = elements.viewport.getBoundingClientRect();
    const pointerX = event.clientX - rectangle.left;
    const pointerY = event.clientY - rectangle.top;
    const viewport = state.viewportByMode[state.activeMode];
    const sourceX = (pointerX - viewport.panXCssPixels) / viewport.zoom;
    const sourceY = (pointerY - viewport.panYCssPixels) / viewport.zoom;
    const nextZoom = Math.max(0.05, Math.min(32, viewport.zoom * Math.exp(-event.deltaY * 0.0015)));
    viewport.panXCssPixels = pointerX - sourceX * nextZoom;
    viewport.panYCssPixels = pointerY - sourceY * nextZoom;
    viewport.zoom = nextZoom;
    viewport.fitMode = false;
    updateTransform();
  }, { passive: false });
  elements.viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      event.preventDefault();
      touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      elements.viewport.setPointerCapture(event.pointerId);
      const viewport = state.viewportByMode[state.activeMode];
      if (touchPointers.size === 1) {
        panGesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: viewport.panXCssPixels, panY: viewport.panYCssPixels };
      } else if (touchPointers.size === 2) {
        const [first, second] = [...touchPointers.values()];
        const midpointX = (first.x + second.x) / 2;
        const midpointY = (first.y + second.y) / 2;
        const viewportBounds = elements.viewport.getBoundingClientRect();
        const localX = midpointX - viewportBounds.left;
        const localY = midpointY - viewportBounds.top;
        pinchGesture = {
          distance: Math.hypot(second.x - first.x, second.y - first.y),
          zoom: viewport.zoom,
          sourceX: (localX - viewport.panXCssPixels) / viewport.zoom,
          sourceY: (localY - viewport.panYCssPixels) / viewport.zoom,
        };
        panGesture = null;
      }
      elements.viewport.classList.add("is-panning");
    } else if (event.button === 1 || (event.button === 0 && spacePressed)) {
      event.preventDefault();
      const viewport = state.viewportByMode[state.activeMode];
      panGesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: viewport.panXCssPixels, panY: viewport.panYCssPixels };
      elements.viewport.setPointerCapture(event.pointerId);
      elements.viewport.classList.add("is-panning");
    }
  });
  elements.viewport.addEventListener("pointermove", (event) => {
    const rectangle = elements["transform-layer"].getBoundingClientRect();
    const viewport = state.viewportByMode[state.activeMode];
    const x = Math.floor((event.clientX - rectangle.left) / viewport.zoom);
    const y = Math.floor((event.clientY - rectangle.top) / viewport.zoom);
    elements["pointer-status"].textContent = x >= 0 && y >= 0 && x < state.gridDefinition.canvas.widthPixels && y < state.gridDefinition.canvas.heightPixels ? `Pointer: ${x}, ${y}` : "";
    if (event.pointerType === "touch" && touchPointers.has(event.pointerId)) {
      touchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinchGesture && touchPointers.size >= 2) {
        const [first, second] = [...touchPointers.values()];
        const nextDistance = Math.hypot(second.x - first.x, second.y - first.y);
        const nextZoom = Math.max(0.05, Math.min(32, pinchGesture.zoom * nextDistance / Math.max(1, pinchGesture.distance)));
        const viewportBounds = elements.viewport.getBoundingClientRect();
        const midpointX = (first.x + second.x) / 2 - viewportBounds.left;
        const midpointY = (first.y + second.y) / 2 - viewportBounds.top;
        viewport.zoom = nextZoom;
        viewport.panXCssPixels = midpointX - pinchGesture.sourceX * nextZoom;
        viewport.panYCssPixels = midpointY - pinchGesture.sourceY * nextZoom;
        viewport.fitMode = false;
        updateTransform();
        return;
      }
    }
    if (!panGesture || panGesture.pointerId !== event.pointerId) return;
    viewport.panXCssPixels = panGesture.panX + event.clientX - panGesture.x;
    viewport.panYCssPixels = panGesture.panY + event.clientY - panGesture.y;
    viewport.fitMode = false;
    updateTransform();
  });
  elements.viewport.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch") {
      touchPointers.delete(event.pointerId);
      if (touchPointers.size < 2) pinchGesture = null;
      if (touchPointers.size === 1) {
        const [[pointerId, point]] = [...touchPointers.entries()];
        const viewport = state.viewportByMode[state.activeMode];
        panGesture = { pointerId, x: point.x, y: point.y, panX: viewport.panXCssPixels, panY: viewport.panYCssPixels };
      } else if (touchPointers.size === 0) {
        panGesture = null;
        elements.viewport.classList.remove("is-panning");
        log("info", "viewport", "touch-gesture.completed", "Touch pan or pinch gesture completed.", { mode: state.activeMode });
      }
      return;
    }
    if (panGesture?.pointerId === event.pointerId) {
      panGesture = null;
      elements.viewport.classList.remove("is-panning");
      log("info", "viewport", "pan.completed", "Viewport pan gesture completed.", { mode: state.activeMode });
      return;
    }
    if (state.activeMode !== "atlas-slicer" || !state.atlas.sourceImage || event.button !== 0) return;
    const rectangle = elements["transform-layer"].getBoundingClientRect();
    const viewport = state.viewportByMode[state.activeMode];
    const x = Math.floor((event.clientX - rectangle.left) / viewport.zoom);
    const y = Math.floor((event.clientY - rectangle.top) / viewport.zoom);
    const cell = findCellAtPoint(state.gridDefinition, layoutResult, x, y, true);
    if (cell) selectCell(cell, "pointer");
  });
  elements.viewport.addEventListener("pointerleave", () => { elements["pointer-status"].textContent = ""; });
  elements.viewport.addEventListener("pointercancel", (event) => {
    touchPointers.delete(event.pointerId);
    if (panGesture?.pointerId === event.pointerId) panGesture = null;
    if (touchPointers.size < 2) pinchGesture = null;
    if (touchPointers.size === 0) elements.viewport.classList.remove("is-panning");
  });
  elements.viewport.addEventListener("keydown", (event) => {
    if (event.code === "Space") { spacePressed = true; event.preventDefault(); }
    if (state.activeMode !== "atlas-slicer") return;
    const cell = state.atlas.selectedCell;
    if (!cell && namedAtlasCells.length && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) { event.preventDefault(); selectCell(namedAtlasCells[0], "keyboard"); return; }
    if (!cell) return;
    const candidate = event.code === "ArrowLeft" ? namedAtlasCells.find((item) => item.row === cell.row && item.column === cell.column - 1)
      : event.code === "ArrowRight" ? namedAtlasCells.find((item) => item.row === cell.row && item.column === cell.column + 1)
      : event.code === "ArrowUp" ? namedAtlasCells.find((item) => item.column === cell.column && item.row === cell.row - 1)
      : event.code === "ArrowDown" ? namedAtlasCells.find((item) => item.column === cell.column && item.row === cell.row + 1) : null;
    if (candidate) { event.preventDefault(); selectCell(candidate, "keyboard"); }
    if (event.code === "Enter") { event.preventDefault(); downloadSelectedCell(); }
  });
  elements["sprite-track"].addEventListener("keydown", (event) => {
    const commands = { ArrowLeft: -1, ArrowRight: 1, PageUp: -10, PageDown: 10 };
    if (commands[event.code]) { event.preventDefault(); selectRelativeCell(commands[event.code]); }
    if (event.code === "Home") { event.preventDefault(); selectCell(namedAtlasCells[0], "keyboard"); }
    if (event.code === "End") { event.preventDefault(); selectCell(namedAtlasCells.at(-1), "keyboard"); }
    if (event.code === "Enter") { event.preventDefault(); downloadSelectedCell(); }
  });
  window.addEventListener("keyup", (event) => { if (event.code === "Space") spacePressed = false; });
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyZ") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyY") { event.preventDefault(); redo(); }
  });
}

function restoreInitialState() {
  try {
    const urlState = decodeUrlState(location.hash);
    if (urlState) {
      state.activeMode = urlState.activeMode;
      state.gridDefinition = urlState.gridDefinition;
      log("info", "url", "state.restore.completed", "Configuration restored from URL.", { schemaVersion: 1, length: location.hash.length });
      return;
    }
  } catch (error) {
    announce(`URL settings were ignored: ${error.message}`, "warning");
    log("warning", "url", "state.restore.failed", "Invalid URL state was ignored.", { error: normalizeError(error), length: location.hash.length });
  }
  const session = readStoredJson(STORAGE_KEYS.session, null, (error) => {
    announce("Saved session data was corrupted or unavailable, so defaults were used.", "warning");
    log("warning", "storage", "session.parse.failed", "Saved session state could not be read.", { error: normalizeError(error) });
  });
  if (session?.gridDefinition) {
    try {
      state.activeMode = session.activeMode === "atlas-slicer" ? "atlas-slicer" : "grid-creator";
      state.gridDefinition = normalizeGridDefinition(session.gridDefinition);
      if (session.lastSourceName) announce(`Previous atlas settings restored. Reload “${session.lastSourceName}” to continue slicing.`);
      log("info", "storage", "session.restore.completed", "Session configuration restored.");
    } catch (error) {
      log("warning", "storage", "session.restore.failed", "Corrupted session state was ignored.", { error: normalizeError(error) });
    }
  }
}

window.addEventListener("error", (event) => log("error", "runtime", "unexpected-error", "Unexpected global error.", { error: normalizeError(event.error || event.message) }));
window.addEventListener("unhandledrejection", (event) => log("error", "runtime", "unhandled-rejection", "Unexpected promise rejection.", { error: normalizeError(event.reason) }));
window.addEventListener("resize", () => { if (state.viewportByMode[state.activeMode].fitMode) requestAnimationFrame(fitViewport); });
window.addEventListener("beforeunload", () => { if (state.atlas.sourceObjectUrl) URL.revokeObjectURL(state.atlas.sourceObjectUrl); });

restoreInitialState();
state.gridCreatorCanvas = { ...state.gridDefinition.canvas };
bindControls();
bindViewport();
loadPresetOptions();
refresh(false);
requestAnimationFrame(fitViewport);
log("info", "application", "initialized", "Grid and Atlas Helper initialized.", { schemaVersion: 1, activeMode: state.activeMode });
