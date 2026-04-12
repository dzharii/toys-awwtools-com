import { exportJsonText } from "./export.js";
import { createObjectModel } from "./heuristics.js";
import { analyzeAreaSelection } from "./regions.js";
import { scanDocument } from "./scanner.js";
import {
  createInitialSessionState,
  isSessionDirty,
  loadSessionSnapshot,
  markSessionChanged,
  markSessionExported,
  saveSessionSnapshot,
} from "./session-core.js";
import { applicableHeuristics, buildSelectorState, chooseAutomaticHeuristic } from "./selectors.js";
import {
  capturePopupGeometry,
  closePopupWindow,
  isPopupAlive,
  monitorPopupClosed,
  openRecorderPopup,
} from "./popup-manager.js";
import {
  createButton,
  createInput,
  createNode,
  createSection,
  createTextarea,
  replaceChildren,
} from "./ui/dom.js";
import { getToolStyles } from "./ui/styles.js";
import { cycleTheme, getThemeMeta } from "./ui/themes.js";
import {
  TOOL_GLOBAL_KEY,
  TOOL_IGNORE_ATTRIBUTE,
  TOOL_NAMESPACE,
  normalizeWhitespace,
  rectFrom,
  serializeError,
} from "./utils.js";

const WINDOW_MIN_WIDTH = 360;
const WINDOW_MIN_HEIGHT = 420;
const WINDOW_DEFAULT_WIDTH = 520;
const WINDOW_DEFAULT_HEIGHT = 680;
const WINDOW_MARGIN = 12;
const TITLE_VISIBLE_WIDTH = 180;
const POPUP_MONITOR_INTERVAL_MS = 450;

function createToolNode(document, tagName, options = {}, children = []) {
  const element = createNode(
    document,
    tagName,
    {
      ...options,
      attrs: {
        [TOOL_IGNORE_ATTRIBUTE]: "true",
        ...(options.attrs ?? {}),
      },
    },
    children,
  );
  return element;
}

function setRectStyle(element, rect) {
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

function setOverlayStyle(element, style) {
  Object.assign(element.style, style);
}

function rectsOverlap(left, right) {
  return !(
    left.right <= right.left ||
    left.left >= right.right ||
    left.bottom <= right.top ||
    left.top >= right.bottom
  );
}

function groupedKinds() {
  return [
    { kind: "region", label: "Regions" },
    { kind: "control", label: "Controls" },
    { kind: "collection", label: "Collections" },
    { kind: "content", label: "Content" },
  ];
}

function viewportFrame(windowObject) {
  return {
    width: Math.max(320, windowObject.innerWidth),
    height: Math.max(320, windowObject.innerHeight),
  };
}

function clampFrame(frame, windowObject) {
  const viewport = viewportFrame(windowObject);
  const minWidth = Math.min(Math.max(320, viewport.width - WINDOW_MARGIN * 2), WINDOW_MIN_WIDTH);
  const minHeight = Math.min(Math.max(320, viewport.height - WINDOW_MARGIN * 2), WINDOW_MIN_HEIGHT);
  const width = Math.min(Math.max(frame.width, minWidth), Math.max(minWidth, viewport.width - WINDOW_MARGIN * 2));
  const height = Math.min(
    Math.max(frame.height, minHeight),
    Math.max(minHeight, viewport.height - WINDOW_MARGIN * 2),
  );
  const left = Math.min(
    viewport.width - WINDOW_MARGIN - Math.min(TITLE_VISIBLE_WIDTH, width),
    Math.max(WINDOW_MARGIN - width + TITLE_VISIBLE_WIDTH, frame.left),
  );
  const top = Math.min(
    viewport.height - 40,
    Math.max(WINDOW_MARGIN, frame.top),
  );
  return {
    left,
    top,
    width,
    height,
  };
}

function defaultFrame(windowObject) {
  const viewport = viewportFrame(windowObject);
  return clampFrame(
    {
      width: Math.min(WINDOW_DEFAULT_WIDTH, viewport.width - WINDOW_MARGIN * 2),
      height: Math.min(WINDOW_DEFAULT_HEIGHT, viewport.height - WINDOW_MARGIN * 2),
      left: Math.max(WINDOW_MARGIN, viewport.width - WINDOW_DEFAULT_WIDTH - 28),
      top: WINDOW_MARGIN + 8,
    },
    windowObject,
  );
}

function detectSelectorType(selector) {
  return selector.trim().startsWith("/") || selector.trim().startsWith("(") ? "xpath" : "css";
}

function describeSelection(objectModel) {
  return `${objectModel.kind} · ${objectModel.inferredType} · ${(objectModel.confidence * 100).toFixed(0)}%`;
}

function pickAreaRect(start, end) {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const right = Math.max(start.x, end.x);
  const bottom = Math.max(start.y, end.y);
  return rectFrom({ left, top, right, bottom, width: right - left, height: bottom - top });
}

function readableError(error) {
  return `Error: ${serializeError(error)}`;
}

function buildPageContext(windowObject, documentObject) {
  return {
    toolVersion: "0.1.0",
    url: windowObject.location.href,
    title: documentObject.title,
    timestamp: new Date().toISOString(),
    viewport: {
      width: windowObject.innerWidth,
      height: windowObject.innerHeight,
    },
  };
}

export function createOverlayApp(windowObject = window) {
  const documentObject = windowObject.document;
  const savedState = loadSessionSnapshot(windowObject);
  const state = createInitialSessionState(windowObject, { savedState });
  state.frame = clampFrame(savedState?.frame ?? defaultFrame(windowObject), windowObject);
  state.popupGeometry = state.popupGeometry ?? null;
  state.sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  state.popupMonitor = null;
  state.popupBeforeUnloadHandler = null;
  state.popupBlurCleanup = null;

  const refs = {};

  function persistWindowState() {
    saveSessionSnapshot(windowObject, state);
  }

  function applyWindowFrame() {
    if (!refs.window || state.hostMode === "popup") {
      return;
    }
    state.frame = clampFrame(state.frame, windowObject);
    refs.window.style.left = `${state.frame.left}px`;
    refs.window.style.top = `${state.frame.top}px`;
    refs.window.style.width = `${state.frame.width}px`;
    refs.window.style.height = `${state.frame.height}px`;
    persistWindowState();
  }

  function clearWindowFrameStyles() {
    if (!refs.window) {
      return;
    }
    refs.window.style.left = "";
    refs.window.style.top = "";
    refs.window.style.width = "";
    refs.window.style.height = "";
  }

  function setStatus(message) {
    state.statusMessage = message;
    if (refs.status) {
      refs.status.textContent = message;
    }
    if (refs.subtitle) {
      refs.subtitle.textContent = `${state.mode} mode · ${state.selectedObjects.length} selected`;
    }
  }

  function selectedObject() {
    return state.selectedObjects.find((item) => item.id === state.selectedObjectId) ?? null;
  }

  function trackSessionChange() {
    markSessionChanged(state);
    persistWindowState();
  }

  function clearMatches() {
    refs.matchLayer?.replaceChildren();
  }

  function clearHover() {
    state.hoverRecord = null;
    if (refs.highlight) {
      refs.highlight.style.display = "none";
    }
  }

  function applyTheme() {
    const meta = getThemeMeta(state.themeId);
    refs.shell.classList.remove("theme-macos", "theme-windows-xp");
    refs.shell.classList.add(meta.className);
    refs.themeButton.textContent = "Theme";
    refs.themeButton.title = `Switch theme (current: ${meta.label})`;
    persistWindowState();
  }

  function applyHostModeUi() {
    if (!refs.shell || !refs.window) {
      return;
    }
    refs.shell.dataset.hostMode = state.hostMode;
    refs.window.dataset.hostMode = state.hostMode;
    if (refs.openPopupButton) {
      refs.openPopupButton.hidden = state.hostMode !== "inline";
    }
    if (refs.returnToPageButton) {
      refs.returnToPageButton.hidden = state.hostMode !== "popup";
    }
    if (refs.focusPageButton) {
      refs.focusPageButton.hidden = state.hostMode !== "popup";
    }
    refs.closeButton.textContent = state.hostMode === "popup" ? "Close recorder" : "×";
    refs.closeButton.classList.toggle(`${TOOL_NAMESPACE}-close-text`, state.hostMode === "popup");
    if (state.hostMode === "popup") {
      clearWindowFrameStyles();
    } else {
      applyWindowFrame();
    }
    persistWindowState();
  }

  function stopPopupMonitor() {
    state.popupMonitor?.stop?.();
    state.popupMonitor = null;

    if (state.popupWindow && state.popupBeforeUnloadHandler) {
      try {
        state.popupWindow.removeEventListener("beforeunload", state.popupBeforeUnloadHandler);
      } catch {
        // ignore
      }
    }
    state.popupBeforeUnloadHandler = null;
  }

  function setPopupTitle(popupWindow) {
    if (!popupWindow?.document) {
      return;
    }
    const inspectedTitle = normalizeWhitespace(documentObject.title) || normalizeWhitespace(windowObject.location.hostname);
    popupWindow.document.title = `Page Object Recorder - ${inspectedTitle || "Page"}`;
  }

  function preparePopupDocument(popupWindow) {
    const popupDocument = popupWindow.document;
    popupDocument.documentElement.style.margin = "0";
    popupDocument.documentElement.style.width = "100%";
    popupDocument.documentElement.style.height = "100%";
    popupDocument.documentElement.style.overflow = "hidden";
    popupDocument.body.style.margin = "0";
    popupDocument.body.style.width = "100%";
    popupDocument.body.style.minHeight = "100vh";
    popupDocument.body.style.height = "100%";
    popupDocument.body.style.overflow = "hidden";
    popupDocument.body.style.background = "linear-gradient(180deg, #ececef 0%, #e4e5e9 100%)";
    popupDocument.documentElement.style.minHeight = "100vh";
    popupDocument.documentElement.style.background = "#e7e8ec";
    setPopupTitle(popupWindow);
  }

  function moveHostToDocument(targetDocument) {
    if (!refs.host || !targetDocument) {
      return;
    }
    if (refs.host.ownerDocument === targetDocument && refs.host.isConnected) {
      return;
    }
    targetDocument.documentElement.append(refs.host);
  }

  function restoreInlineHost(reason = "popup-closed") {
    if (state.hostMode !== "popup") {
      return;
    }

    if (state.popupWindow) {
      state.popupGeometry = capturePopupGeometry(state.popupWindow) ?? state.popupGeometry;
    }

    stopPopupMonitor();
    moveHostToDocument(documentObject);
    state.popupWindow = null;
    state.hostMode = "inline";
    applyHostModeUi();
    render();
    if (reason === "popup-native-close") {
      setStatus("Popup closed. Recorder was restored to the page.");
    }
  }

  function watchPopupWindow(popupWindow) {
    stopPopupMonitor();
    state.popupBeforeUnloadHandler = (event) => {
      if (!isSessionDirty(state)) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    popupWindow.addEventListener("beforeunload", state.popupBeforeUnloadHandler);
    state.popupMonitor = monitorPopupClosed(
      popupWindow,
      () => {
        if (state.popupCloseReason === "return-inline" || state.popupCloseReason === "session-destroy") {
          state.popupCloseReason = null;
          return;
        }
        restoreInlineHost("popup-native-close");
      },
      POPUP_MONITOR_INTERVAL_MS,
    );
  }

  function openInPopupWindow() {
    if (state.mode === "area" && state.dragSelection) {
      state.dragSelection = null;
      refs.dragBox.style.display = "none";
      clearAreaPreview();
    }

    const popup = openRecorderPopup(windowObject, {
      currentPopup: state.popupWindow,
      geometry: state.popupGeometry ?? undefined,
      title: "Page Object Recorder",
    });

    if (popup.blocked || !popup.popupWindow) {
      setStatus("Popup window was blocked by the browser. Allow popups for this page and try again.");
      render();
      return;
    }

    const popupWindow = popup.popupWindow;
    state.popupWindow = popupWindow;
    state.popupCloseReason = null;
    preparePopupDocument(popupWindow);
    moveHostToDocument(popupWindow.document);
    state.hostMode = "popup";
    applyHostModeUi();
    watchPopupWindow(popupWindow);
    popupWindow.focus?.();
    setStatus(popup.reused ? "Recorder popup focused." : "Recorder detached into popup window.");
    render();
  }

  function returnToInlineFromPopup() {
    if (state.hostMode !== "popup") {
      return;
    }
    const popupWindow = state.popupWindow;
    state.popupCloseReason = "return-inline";
    restoreInlineHost("return-inline");
    closePopupWindow(popupWindow);
    setStatus("Recorder returned to the page.");
    render();
  }

  function assignExistingParent(objectModel) {
    const parent = state.selectedObjects
      .filter((item) => item.kind === "region" && item.id !== objectModel.id)
      .find((item) => {
        const outer = item.features.boundingRect;
        const inner = objectModel.features.boundingRect;
        return (
          inner.left >= outer.left &&
          inner.right <= outer.right &&
          inner.top >= outer.top &&
          inner.bottom <= outer.bottom
        );
      });

    if (!parent) {
      return;
    }

    objectModel.parentId = parent.id;
    if (!parent.children.includes(objectModel.id)) {
      parent.children.push(objectModel.id);
    }
  }

  function applySelectorState(objectModel, options = {}) {
    const parentObject = objectModel.parentId
      ? state.selectedObjects.find((item) => item.id === objectModel.parentId) ?? null
      : null;
    const selectorState = buildSelectorState(objectModel, {
      heuristicId: options.heuristicId ?? objectModel.heuristicId ?? chooseAutomaticHeuristic(objectModel),
      manualSelector: options.manualSelector ?? objectModel.manualSelector,
      manualSelectorType: options.manualSelectorType ?? objectModel.manualSelectorType ?? detectSelectorType(objectModel.selector ?? ""),
      scope: documentObject,
      parentObject,
    });

    objectModel.heuristicId = selectorState.heuristicId;
    objectModel.selector = selectorState.preferred.selector;
    objectModel.selectorType = selectorState.preferred.selectorType;
    objectModel.selectorScore = selectorState.preferred.score;
    objectModel.alternativeSelectors = selectorState.alternatives;
    objectModel.selectorTest = selectorState.testResult;

    if (objectModel.kind === "collection" && objectModel.collection) {
      objectModel.collection.itemSelector = selectorState.preferred.selector;
      objectModel.collection.itemSelectorScore = selectorState.preferred.score;
    }
  }

  function refreshScanRecords() {
    state.scanRecords = scanDocument(documentObject).map((record) => {
      const model = createObjectModel({
        element: record.element,
        features: record.features,
        existingNames: [],
      });
      return {
        ...record,
        kind: model.kind,
        inferredType: model.inferredType,
        confidence: model.confidence,
        explanation: model.explanation,
      };
    });
    setStatus(`Scanned ${state.scanRecords.length} meaningful candidates in the visible page.`);
    render();
  }

  function makeObjectFromRecord(record, context = {}) {
    const objectModel = createObjectModel({
      element: record.element,
      features: record.features,
      context,
      existingNames: state.selectedObjects.map((item) => item.name),
    });
    objectModel.id = `object-${state.counter++}`;
    return objectModel;
  }

  function saveObject(objectModel, options = {}) {
    assignExistingParent(objectModel);
    applySelectorState(objectModel, options);
    state.selectedObjects.push(objectModel);
    state.selectedObjectId = objectModel.id;
    trackSessionChange();
    setStatus(`Selected ${objectModel.name} (${describeSelection(objectModel)}).`);
    render();
  }

  function removeObjectById(objectId) {
    const exists = state.selectedObjects.find((item) => item.id === objectId);
    if (!exists) {
      return;
    }

    state.selectedObjects = state.selectedObjects.filter((item) => item.id !== objectId);
    for (const objectModel of state.selectedObjects) {
      if (objectModel.parentId === objectId) {
        objectModel.parentId = null;
      }
      objectModel.children = (objectModel.children ?? []).filter((childId) => childId !== objectId);
    }

    if (state.selectedObjectId === objectId) {
      state.selectedObjectId = state.selectedObjects[0]?.id ?? null;
    }

    clearMatches();
    trackSessionChange();
    setStatus(`Removed ${exists.name} from selected objects.`);
    render();
  }

  function inspectElement(element) {
    if (!element || element.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
      clearHover();
      return;
    }

    const record = state.scanRecords.find((item) => item.element === element) ?? {
      element,
      features: scanDocument({ body: element, querySelectorAll: () => [] })[0]?.features,
    };

    if (!record.features) {
      clearHover();
      return;
    }

    const model = createObjectModel({
      element,
      features: record.features,
      existingNames: [],
    });
    state.hoverRecord = {
      ...record,
      kind: record.kind ?? model.kind,
      inferredType: record.inferredType ?? model.inferredType,
      confidence: record.confidence ?? model.confidence,
    };
    refs.highlight.style.display = "block";
    setRectStyle(refs.highlight, state.hoverRecord.features.boundingRect);
    setStatus(`Hover ${state.hoverRecord.inferredType} · ${(state.hoverRecord.confidence * 100).toFixed(0)}% confidence`);
  }

  function runSelectorTest(objectModel) {
    clearMatches();
    if (!objectModel.selector) {
      objectModel.selectorTest = {
        matchCount: 0,
        score: 0,
        scope: objectModel.parentId ? "parent" : "document",
        error: "No selector",
      };
      render();
      return;
    }

    let nodes = [];
    try {
      if (objectModel.selectorType === "css") {
        nodes = Array.from(documentObject.querySelectorAll(objectModel.selector));
      } else {
        const result = documentObject.evaluate(
          objectModel.selector,
          documentObject,
          null,
          windowObject.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null,
        );
        for (let index = 0; index < result.snapshotLength; index += 1) {
          nodes.push(result.snapshotItem(index));
        }
      }

      objectModel.selectorTest = {
        matchCount: nodes.length,
        score: objectModel.selectorScore,
        scope: objectModel.parentId ? "parent" : "document",
      };

      for (const node of nodes.slice(0, 12)) {
        if (!node?.getBoundingClientRect) {
          continue;
        }
        const marker = createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-match`,
        });
        setRectStyle(marker, rectFrom(node.getBoundingClientRect()));
        refs.matchLayer.append(marker);
      }

      setStatus(`Selector test matched ${nodes.length} element${nodes.length === 1 ? "" : "s"}.`);
    } catch (error) {
      objectModel.selectorTest = {
        matchCount: 0,
        score: objectModel.selectorScore,
        scope: objectModel.parentId ? "parent" : "document",
        error: serializeError(error),
      };
      setStatus(readableError(error));
    }
    trackSessionChange();
    render();
  }

  function clearAreaPreview() {
    refs.areaLayer?.replaceChildren();
  }

  function renderAreaPreview(areaRect) {
    if (!refs.areaLayer) {
      return;
    }

    const overlapping = state.scanRecords
      .filter((record) => rectsOverlap(record.features.boundingRect, areaRect))
      .slice(0, 28);

    replaceChildren(
      refs.areaLayer,
      overlapping.map((record) => {
        const marker = createToolNode(documentObject, "div");
        const rect = record.features.boundingRect;
        setOverlayStyle(marker, {
          position: "fixed",
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: "8px",
          border: "1px solid rgba(31, 118, 255, 0.78)",
          background: "rgba(31, 118, 255, 0.09)",
          pointerEvents: "none",
        });
        return marker;
      }),
    );
  }

  function updateExportText(copyToClipboard = false) {
    state.exportText = exportJsonText(state.selectedObjects, buildPageContext(windowObject, documentObject));
    refs.exportPreview.value = state.exportText;
    if (copyToClipboard) {
      windowObject.navigator.clipboard?.writeText(state.exportText).then(
        () => {
          markSessionExported(state);
          setStatus("Exported JSON copied to clipboard.");
        },
        () => setStatus("Clipboard copy failed. JSON remains available in the export preview."),
      );
    }
    persistWindowState();
  }

  function buildSummaryPills(objectModel) {
    const pills = [
      createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-pill`,
        text: objectModel.kind,
      }),
      createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-pill`,
        text: objectModel.inferredType,
      }),
      createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-pill`,
        text: `${(objectModel.confidence * 100).toFixed(0)}% confidence`,
      }),
    ];

    if (objectModel.parentId) {
      const parent = state.selectedObjects.find((item) => item.id === objectModel.parentId);
      if (parent) {
        pills.push(
          createToolNode(documentObject, "span", {
            className: `${TOOL_NAMESPACE}-pill`,
            text: `inside ${parent.name}`,
          }),
        );
      }
    }

    return pills;
  }

  function renderSelectedList() {
    if (!state.selectedObjects.length) {
      replaceChildren(refs.selectedList, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-empty`,
          text: "Use Select Element or Select Area to add page objects.",
        }),
      ]);
      return;
    }

    const groups = groupedKinds()
      .map((group) => ({
        ...group,
        items: state.selectedObjects.filter((item) => item.kind === group.kind),
      }))
      .filter((group) => group.items.length);

    replaceChildren(
      refs.selectedList,
      groups.map((group) =>
        createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-object-group` }, [
          createToolNode(documentObject, "div", {
            className: `${TOOL_NAMESPACE}-object-group-head`,
            text: `${group.label} (${group.items.length})`,
          }),
          ...group.items.map((objectModel) => {
            const row = createButton(documentObject, {
              className: `${TOOL_NAMESPACE}-object-row`,
              attrs: { [TOOL_IGNORE_ATTRIBUTE]: "true", title: objectModel.name },
              dataset: { selected: String(objectModel.id === state.selectedObjectId) },
              on: {
                click() {
                  state.selectedObjectId = objectModel.id;
                  render();
                },
              },
            });

            const removeButton = createButton(documentObject, {
              className: `${TOOL_NAMESPACE}-object-remove`,
              attrs: {
                [TOOL_IGNORE_ATTRIBUTE]: "true",
                "aria-label": `Remove ${objectModel.name}`,
                title: `Remove ${objectModel.name}`,
              },
              text: "×",
              on: {
                click(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  removeObjectById(objectModel.id);
                },
              },
            });

            const rowInner = createToolNode(documentObject, "div", {
              className: `${TOOL_NAMESPACE}-object-row-inner`,
            }, [
              createToolNode(documentObject, "span", {
                className: `${TOOL_NAMESPACE}-object-name`,
                text: objectModel.name,
              }),
              createToolNode(documentObject, "span", {
                className: `${TOOL_NAMESPACE}-object-chip`,
                text: objectModel.kind,
              }),
              createToolNode(documentObject, "span", {
                className: `${TOOL_NAMESPACE}-object-chip`,
                text: objectModel.inferredType,
              }),
              createToolNode(documentObject, "span", {
                className: `${TOOL_NAMESPACE}-object-chip`,
                text: `${Math.round(objectModel.confidence * 100)}%`,
              }),
              removeButton,
            ]);

            row.append(rowInner);
            if (objectModel.parentId) {
              const parent = state.selectedObjects.find((item) => item.id === objectModel.parentId);
              row.append(
                createToolNode(documentObject, "div", {
                  className: `${TOOL_NAMESPACE}-object-parent`,
                  text: parent ? `inside ${parent.name}` : "inside parent",
                }),
              );
            }
            return row;
          }),
        ]),
      ),
    );
  }

  function renderHeuristicPopover(objectModel) {
    refs.heuristicPopover.hidden = !state.heuristicMenuOpen || !objectModel;
    replaceChildren(refs.heuristicList, []);
    if (!objectModel) {
      return;
    }

    const filter = normalizeWhitespace(state.heuristicFilter).toLowerCase();
    const heuristics = applicableHeuristics(objectModel.kind).filter((heuristic) =>
      !filter
        ? true
        : `${heuristic.label} ${heuristic.description}`.toLowerCase().includes(filter),
    );

    if (!heuristics.length) {
      replaceChildren(refs.heuristicList, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-empty`,
          text: "No heuristics match the current filter.",
        }),
      ]);
      return;
    }

    replaceChildren(
      refs.heuristicList,
      heuristics.map((heuristic) =>
        createButton(
          documentObject,
          {
            className: `${TOOL_NAMESPACE}-heuristic-option`,
            dataset: { selected: String(heuristic.id === objectModel.heuristicId) },
            attrs: { [TOOL_IGNORE_ATTRIBUTE]: "true" },
            on: {
              click() {
                state.heuristicMenuOpen = false;
                state.heuristicFilter = "";
                objectModel.manualSelector = "";
                objectModel.manualSelectorType = "css";
                applySelectorState(objectModel, { heuristicId: heuristic.id });
                trackSessionChange();
                setStatus(`Heuristic changed to ${heuristic.label}.`);
                render();
              },
            },
          },
          [
            createToolNode(documentObject, "strong", {
              className: `${TOOL_NAMESPACE}-truncate`,
              text: heuristic.label,
            }),
            createToolNode(documentObject, "span", {
              className: `${TOOL_NAMESPACE}-muted`,
              text: heuristic.description,
            }),
          ],
        ),
      ),
    );
  }

  function closeHeuristicMenuIfOpen() {
    if (!state.heuristicMenuOpen) {
      return false;
    }
    state.heuristicMenuOpen = false;
    state.heuristicFilter = "";
    return true;
  }

  function renderAlternatives(objectModel) {
    if (!objectModel || !objectModel.alternativeSelectors.length) {
      replaceChildren(refs.altList, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-empty`,
          text: "Alternative selectors will appear here after generation.",
        }),
      ]);
      return;
    }

    replaceChildren(
      refs.altList,
      objectModel.alternativeSelectors.slice(0, 8).map((candidate) =>
        createButton(
          documentObject,
          {
            className: `${TOOL_NAMESPACE}-alt-row`,
            attrs: { [TOOL_IGNORE_ATTRIBUTE]: "true" },
            on: {
              click() {
                objectModel.manualSelector = candidate.selector;
                objectModel.manualSelectorType = candidate.selectorType;
                applySelectorState(objectModel, {
                  heuristicId: "manualSelector",
                  manualSelector: candidate.selector,
                  manualSelectorType: candidate.selectorType,
                });
                trackSessionChange();
                setStatus("Alternative selector promoted to manual mode.");
                render();
              },
            },
          },
          [
            createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-summary-line` }, [
              createToolNode(documentObject, "strong", {
                className: `${TOOL_NAMESPACE}-truncate`,
                text: `${candidate.selectorType.toUpperCase()} · score ${candidate.score}`,
              }),
              createToolNode(documentObject, "span", {
                className: `${TOOL_NAMESPACE}-muted`,
                text:
                  applicableHeuristics(objectModel.kind).find((item) => item.id === candidate.heuristicId)?.label ??
                  candidate.heuristicId,
              }),
            ]),
            createTextarea(documentObject, {
              className: `${TOOL_NAMESPACE}-selector-editor`,
              attrs: {
                readonly: true,
                rows: "2",
                wrap: "off",
                [TOOL_IGNORE_ATTRIBUTE]: "true",
              },
              value: candidate.selector,
            }),
            createToolNode(documentObject, "div", {
              className: `${TOOL_NAMESPACE}-muted`,
              text: `${candidate.explanation} · matches ${candidate.matchCount}`,
            }),
          ],
        ),
      ),
    );
  }

  function renderDetails() {
    const objectModel = selectedObject();
    refs.exportPreviewWrap.hidden = !state.exportPreviewVisible;
    refs.exportPreview.value = state.exportText;

    if (!objectModel) {
      refs.objectHeader.textContent = "No Object Selected";
      refs.objectMeta.textContent = "Select an element or drag an area to inspect it.";
      replaceChildren(refs.summaryPills, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-empty`,
          text: "The current object summary, selector, and alternatives appear here.",
        }),
      ]);
      refs.heuristicButton.textContent = "Choose heuristic";
      refs.selectorEditor.value = "";
      refs.selectorInfo.textContent = "No selector generated yet.";
      refs.explanation.textContent = "Inspector details will populate after you select an object.";
      renderHeuristicPopover(null);
      renderAlternatives(null);
      return;
    }

    refs.objectHeader.textContent = objectModel.name;
    refs.objectMeta.textContent = objectModel.explanation;
    replaceChildren(refs.summaryPills, buildSummaryPills(objectModel));
    refs.heuristicButton.textContent =
      applicableHeuristics(objectModel.kind).find((item) => item.id === objectModel.heuristicId)?.label ??
      chooseAutomaticHeuristic(objectModel);
    refs.heuristicSearch.value = state.heuristicFilter;
    refs.selectorEditor.value = objectModel.selector ?? "";

    const selectorStateText = [
      `Type ${objectModel.selectorType || "css"}`,
      `Score ${objectModel.selectorScore ?? 0}`,
      `Matches ${objectModel.selectorTest?.matchCount ?? 0}`,
      `Scope ${objectModel.selectorTest?.scope ?? (objectModel.parentId ? "parent" : "document")}`,
    ];
    if (objectModel.selectorTest?.error) {
      selectorStateText.push(`Error ${objectModel.selectorTest.error}`);
    }
    refs.selectorInfo.textContent = selectorStateText.join(" · ");
    refs.explanation.textContent = objectModel.explanation;
    renderHeuristicPopover(objectModel);
    renderAlternatives(objectModel);
  }

  function renderToolbar() {
    for (const [mode, button] of Object.entries(refs.modeButtons)) {
      button.dataset.active = String(state.mode === mode);
    }
    refs.selectionCount.textContent = `${state.selectedObjects.length} selected`;
    refs.subtitle.textContent = `${state.mode} mode · ${state.selectedObjects.length} selected`;
  }

  function render() {
    renderToolbar();
    renderSelectedList();
    renderDetails();
    refs.status.textContent = state.statusMessage;
    refs.exportPreviewWrap.hidden = !state.exportPreviewVisible;
  }

  function updateExportVisibility(nextVisible) {
    state.exportPreviewVisible = nextVisible;
    if (state.exportPreviewVisible) {
      updateExportText(false);
    }
    persistWindowState();
    render();
  }

  function mountPageOverlays() {
    refs.highlight = createToolNode(documentObject, "div", {
      style: { display: "none" },
    });
    setOverlayStyle(refs.highlight, {
      position: "fixed",
      zIndex: "2147483643",
      pointerEvents: "none",
      borderRadius: "10px",
      border: "2px solid rgba(30, 117, 255, 0.95)",
      background: "rgba(30, 117, 255, 0.12)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.55), 0 0 0 9999px rgba(10, 26, 52, 0.04)",
    });

    refs.dragBox = createToolNode(documentObject, "div", {
      style: { display: "none" },
    });
    setOverlayStyle(refs.dragBox, {
      position: "fixed",
      zIndex: "2147483644",
      pointerEvents: "none",
      borderRadius: "8px",
      border: "2px solid rgba(245, 150, 35, 0.98)",
      background:
        "repeating-linear-gradient(135deg, rgba(245, 150, 35, 0.15), rgba(245, 150, 35, 0.15) 10px, rgba(67, 177, 255, 0.08) 10px, rgba(67, 177, 255, 0.08) 20px)",
    });

    refs.matchLayer = createToolNode(documentObject, "div");
    setOverlayStyle(refs.matchLayer, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483642",
      pointerEvents: "none",
    });

    refs.areaLayer = createToolNode(documentObject, "div");
    setOverlayStyle(refs.areaLayer, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483641",
      pointerEvents: "none",
    });

    documentObject.documentElement.append(refs.areaLayer, refs.matchLayer, refs.highlight, refs.dragBox);
  }

  function unmountPageOverlays() {
    refs.areaLayer?.remove();
    refs.highlight?.remove();
    refs.dragBox?.remove();
    refs.matchLayer?.remove();
  }

  function beginInteraction(type, payload) {
    state.interaction = {
      type,
      ...payload,
    };
  }

  function endInteraction() {
    state.interaction = null;
  }

  function onGlobalPointerMove(event) {
    if (state.interaction?.type === "drag") {
      const nextFrame = {
        ...state.interaction.startFrame,
        left: state.interaction.startFrame.left + (event.clientX - state.interaction.startPointer.x),
        top: state.interaction.startFrame.top + (event.clientY - state.interaction.startPointer.y),
      };
      state.frame = clampFrame(nextFrame, windowObject);
      applyWindowFrame();
      return;
    }

    if (state.interaction?.type === "resize") {
      const dx = event.clientX - state.interaction.startPointer.x;
      const dy = event.clientY - state.interaction.startPointer.y;
      const edges = state.interaction.edge;
      let nextFrame = { ...state.interaction.startFrame };
      if (edges.includes("e")) {
        nextFrame.width = state.interaction.startFrame.width + dx;
      }
      if (edges.includes("s")) {
        nextFrame.height = state.interaction.startFrame.height + dy;
      }
      if (edges.includes("w")) {
        nextFrame.width = state.interaction.startFrame.width - dx;
        nextFrame.left = state.interaction.startFrame.left + dx;
      }
      if (edges.includes("n")) {
        nextFrame.height = state.interaction.startFrame.height - dy;
        nextFrame.top = state.interaction.startFrame.top + dy;
      }
      state.frame = clampFrame(nextFrame, windowObject);
      applyWindowFrame();
      return;
    }

    if (state.mode === "area" && state.dragSelection) {
      state.dragSelection.end = { x: event.clientX, y: event.clientY };
      const areaRect = pickAreaRect(state.dragSelection.start, state.dragSelection.end);
      setRectStyle(refs.dragBox, areaRect);
      renderAreaPreview(areaRect);
      return;
    }

    if (state.mode !== "inspect") {
      return;
    }

    const target = documentObject.elementFromPoint(event.clientX, event.clientY);
    inspectElement(target);
  }

  function onGlobalPointerUp(event) {
    if (state.interaction) {
      event.preventDefault();
      endInteraction();
      return;
    }

    if (state.mode !== "area" || !state.dragSelection) {
      return;
    }

    state.dragSelection.end = { x: event.clientX, y: event.clientY };
    const areaRect = pickAreaRect(state.dragSelection.start, state.dragSelection.end);
    state.dragSelection = null;
    refs.dragBox.style.display = "none";
    clearAreaPreview();

    const areaObjects = analyzeAreaSelection(
      state.scanRecords.map((record) => ({
        ...createObjectModel({
          element: record.element,
          features: record.features,
          context: { fromAreaSelection: true },
          existingNames: state.selectedObjects.map((item) => item.name),
        }),
        element: record.element,
      })),
      areaRect,
    );

    for (const objectModel of areaObjects) {
      objectModel.id = `object-${state.counter++}`;
      applySelectorState(objectModel);
      state.selectedObjects.push(objectModel);
    }
    state.selectedObjectId = areaObjects[0]?.id ?? state.selectedObjectId;
    if (areaObjects.length) {
      trackSessionChange();
    }
    setStatus(
      areaObjects.length
        ? `Area selection produced ${areaObjects.length} candidate page objects.`
        : "Area selection did not find a strong candidate.",
    );
    render();
  }

  function onGlobalPointerDown(event) {
    if (state.heuristicMenuOpen) {
      const path = event.composedPath?.() ?? [];
      const insideHeuristic = path.includes(refs.heuristicAnchor);
      if (!insideHeuristic && closeHeuristicMenuIfOpen()) {
        render();
      }
    }

    if (state.mode === "area" && !event.target.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
      state.dragSelection = {
        start: { x: event.clientX, y: event.clientY },
        end: { x: event.clientX, y: event.clientY },
      };
      refs.dragBox.style.display = "block";
      const areaRect = pickAreaRect(state.dragSelection.start, state.dragSelection.end);
      setRectStyle(refs.dragBox, areaRect);
      renderAreaPreview(areaRect);
      event.preventDefault();
      return;
    }
  }

  function onGlobalClick(event) {
    if (state.mode !== "inspect" || event.target.closest?.(`[${TOOL_IGNORE_ATTRIBUTE}="true"]`)) {
      return;
    }
    if (!state.hoverRecord) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const objectModel = makeObjectFromRecord(state.hoverRecord);
    saveObject(objectModel);
  }

  function onGlobalKeyDown(event) {
    if (event.key !== "Escape") {
      return;
    }

    if (closeHeuristicMenuIfOpen()) {
      render();
      event.preventDefault();
      return;
    }

    if (state.mode === "area" && state.dragSelection) {
      state.dragSelection = null;
      refs.dragBox.style.display = "none";
      clearAreaPreview();
      setStatus("Area selection cancelled.");
      render();
      event.preventDefault();
    }
  }

  function bindWindowInteractions() {
    refs.titlebar.addEventListener("pointerdown", (event) => {
      if (state.hostMode === "popup") {
        return;
      }
      if (event.target.closest("button")) {
        return;
      }
      beginInteraction("drag", {
        startPointer: { x: event.clientX, y: event.clientY },
        startFrame: { ...state.frame },
      });
      event.preventDefault();
    });

    for (const handle of refs.resizeHandles) {
      handle.addEventListener("pointerdown", (event) => {
        if (state.hostMode === "popup") {
          return;
        }
        beginInteraction("resize", {
          edge: handle.dataset.edge,
          startPointer: { x: event.clientX, y: event.clientY },
          startFrame: { ...state.frame },
        });
        event.preventDefault();
        event.stopPropagation();
      });
    }

    refs.closeButton.addEventListener("click", destroy);
    refs.openPopupButton.addEventListener("click", openInPopupWindow);
    refs.returnToPageButton.addEventListener("click", returnToInlineFromPopup);
    refs.focusPageButton.addEventListener("click", () => {
      windowObject.focus();
      setStatus("Focused the inspected page.");
    });
    refs.themeButton.addEventListener("click", () => {
      state.themeId = cycleTheme(state.themeId);
      trackSessionChange();
      applyTheme();
      setStatus(`Theme changed to ${getThemeMeta(state.themeId).label}.`);
    });

    refs.scanButton.addEventListener("click", refreshScanRecords);
    refs.modeButtons.inspect.addEventListener("click", () => {
      state.mode = "inspect";
      refs.dragBox.style.display = "none";
      state.dragSelection = null;
      clearAreaPreview();
      trackSessionChange();
      setStatus("Inspect mode enabled. Move over the page and click a highlighted object.");
      render();
    });
    refs.modeButtons.area.addEventListener("click", () => {
      state.mode = "area";
      clearHover();
      trackSessionChange();
      setStatus("Area mode enabled. Drag a rectangle over the page.");
      render();
    });
    refs.clearButton.addEventListener("click", () => {
      state.selectedObjects = [];
      state.selectedObjectId = null;
      state.exportPreviewVisible = false;
      state.exportText = "";
      clearMatches();
      clearAreaPreview();
      trackSessionChange();
      setStatus("Cleared selected page objects.");
      render();
    });

    refs.heuristicButton.addEventListener("click", () => {
      state.heuristicMenuOpen = !state.heuristicMenuOpen;
      render();
      if (state.heuristicMenuOpen) {
        refs.heuristicSearch.focus();
      }
    });
    refs.heuristicSearch.addEventListener("input", () => {
      state.heuristicFilter = refs.heuristicSearch.value;
      render();
    });
    refs.selectorEditor.addEventListener("input", () => {
      const objectModel = selectedObject();
      if (!objectModel) {
        return;
      }
      objectModel.manualSelector = refs.selectorEditor.value;
      objectModel.manualSelectorType = detectSelectorType(refs.selectorEditor.value);
      applySelectorState(objectModel, {
        heuristicId: "manualSelector",
        manualSelector: objectModel.manualSelector,
        manualSelectorType: objectModel.manualSelectorType,
      });
      trackSessionChange();
      setStatus("Selector switched to manual mode.");
      render();
    });
    refs.testButton.addEventListener("click", () => {
      const objectModel = selectedObject();
      if (objectModel) {
        runSelectorTest(objectModel);
      }
    });
    refs.rerunButton.addEventListener("click", () => {
      const objectModel = selectedObject();
      if (!objectModel) {
        return;
      }
      objectModel.manualSelector = "";
      objectModel.manualSelectorType = "css";
      applySelectorState(objectModel, {
        heuristicId: objectModel.heuristicId === "manualSelector" ? chooseAutomaticHeuristic(objectModel) : objectModel.heuristicId,
      });
      trackSessionChange();
      setStatus("Heuristic rerun completed.");
      render();
    });
    refs.copyButton.addEventListener("click", () => {
      updateExportText(true);
      state.exportPreviewVisible = true;
      persistWindowState();
      render();
    });
    refs.toggleJsonButton.addEventListener("click", () => {
      updateExportVisibility(!state.exportPreviewVisible);
    });

    refs.host.addEventListener("pointerdown", (event) => {
      if (!state.heuristicMenuOpen) {
        return;
      }
      const path = event.composedPath?.() ?? [];
      const insideHeuristic = path.includes(refs.heuristicAnchor);
      if (!insideHeuristic && closeHeuristicMenuIfOpen()) {
        render();
      }
    }, true);
    refs.host.addEventListener("keydown", onGlobalKeyDown, true);
  }

  function buildShadowUi() {
    refs.host = documentObject.createElement("div");
    refs.host.setAttribute(TOOL_IGNORE_ATTRIBUTE, "true");
    refs.host.style.position = "fixed";
    refs.host.style.inset = "0";
    refs.host.style.pointerEvents = "none";
    refs.host.style.zIndex = "2147483646";

    refs.shadow = refs.host.attachShadow({ mode: "open" });
    refs.style = documentObject.createElement("style");
    refs.style.textContent = getToolStyles();

    refs.shell = createNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-shell`,
    });
    refs.window = createToolNode(documentObject, "section", {
      className: `${TOOL_NAMESPACE}-window`,
      attrs: {
        role: "dialog",
        "aria-label": "Page Object Recorder",
      },
    });

    refs.titlebar = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-titlebar`,
    });

    const chromeLeft = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-chrome`,
    });
    chromeLeft.append(
      createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-traffic`,
        attrs: { "data-kind": "close" },
      }),
      createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-traffic`,
        attrs: { "data-kind": "min" },
      }),
      createToolNode(documentObject, "span", {
        className: `${TOOL_NAMESPACE}-traffic`,
        attrs: { "data-kind": "zoom" },
      }),
    );

    refs.title = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-title`,
      text: "Page Object Recorder",
    });
    refs.subtitle = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-subtitle`,
      text: "inspect mode · 0 selected",
    });
    const titleMeta = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-titlemeta`,
    }, [refs.title, refs.subtitle]);

    refs.themeButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
    });
    refs.openPopupButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Open in popup window",
    });
    refs.returnToPageButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Return to page",
      attrs: { hidden: true },
    });
    refs.focusPageButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Focus inspected page",
      attrs: { hidden: true },
    });
    refs.closeButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button ${TOOL_NAMESPACE}-close`,
      attrs: { "aria-label": "Close recorder" },
      text: "×",
    });
    const chromeRight = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-chrome`,
    }, [refs.openPopupButton, refs.returnToPageButton, refs.focusPageButton, refs.themeButton, refs.closeButton]);
    refs.titlebar.append(chromeLeft, titleMeta, chromeRight);

    const toolbar = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-toolbar`,
    });
    refs.scanButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Scan",
    });
    refs.modeButtons = {
      inspect: createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Select Element",
      }),
      area: createButton(documentObject, {
        className: `${TOOL_NAMESPACE}-button`,
        text: "Select Area",
      }),
    };
    refs.clearButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Clear",
    });
    refs.selectionCount = createToolNode(documentObject, "span", {
      className: `${TOOL_NAMESPACE}-pill`,
      text: "0 selected",
    });
    toolbar.append(
      createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-toolbar-group` }, [
        refs.scanButton,
        refs.modeButtons.inspect,
        refs.modeButtons.area,
      ]),
      createToolNode(documentObject, "div", { className: `${TOOL_NAMESPACE}-toolbar-group` }, [
        refs.selectionCount,
        refs.clearButton,
      ]),
    );

    const main = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-main`,
    });

    const navigatorPane = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-pane ${TOOL_NAMESPACE}-navigator`,
    });
    navigatorPane.append(
      createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Selected Objects",
        }),
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-list ${TOOL_NAMESPACE}-selected-list`,
          properties: { tabIndex: 0 },
        }),
      ]),
    );
    refs.selectedList = navigatorPane.querySelector(`.${TOOL_NAMESPACE}-selected-list`);

    const inspectorPane = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-pane ${TOOL_NAMESPACE}-inspector`,
    });

    refs.objectHeader = createToolNode(documentObject, "strong", {
      className: `${TOOL_NAMESPACE}-truncate`,
      text: "No Object Selected",
    });
    refs.objectMeta = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-muted`,
      text: "Select an element or drag an area to inspect it.",
    });
    refs.summaryPills = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-statline`,
    });

    refs.heuristicButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Choose heuristic",
    });
    refs.heuristicSearch = createInput(documentObject, {
      className: `${TOOL_NAMESPACE}-search`,
      type: "search",
      name: "heuristic-search",
      attrs: {
        autocomplete: "off",
        placeholder: "Filter heuristics…",
      },
    });
    refs.heuristicList = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-heuristic-list`,
    });
    refs.heuristicPopover = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-popover`,
      attrs: { hidden: true },
    }, [refs.heuristicSearch, refs.heuristicList]);
    refs.heuristicAnchor = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-heuristic-anchor`,
    }, [refs.heuristicButton, refs.heuristicPopover]);

    refs.selectorEditor = createTextarea(documentObject, {
      className: `${TOOL_NAMESPACE}-selector-editor`,
      name: "selector-editor",
      value: "",
      attrs: {
        rows: "3",
        wrap: "off",
        "aria-label": "Selector editor",
      },
    });
    refs.selectorInfo = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-muted`,
      text: "No selector generated yet.",
    });
    refs.testButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Test Selector",
    });
    refs.rerunButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Rerun Heuristic",
    });
    refs.explanation = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-muted`,
      text: "Inspector details will populate after you select an object.",
    });
    refs.altList = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-list`,
    });
    refs.exportPreview = createTextarea(documentObject, {
      className: `${TOOL_NAMESPACE}-selector-editor`,
      attrs: {
        readonly: true,
        rows: "8",
        wrap: "off",
        "aria-label": "Exported JSON preview",
      },
    });
    refs.exportPreviewWrap = createSection(documentObject, {
      className: `${TOOL_NAMESPACE}-panel`,
      attrs: { hidden: true },
    }, [
      createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-panel-label`,
        text: "Export Preview",
      }),
      refs.exportPreview,
    ]);

    inspectorPane.append(
      createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Current Object",
        }),
        refs.objectHeader,
        refs.objectMeta,
        refs.summaryPills,
      ]),
      createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Selector Heuristic",
        }),
        refs.heuristicAnchor,
      ]),
      createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Editable Selector",
        }),
        refs.selectorEditor,
        refs.selectorInfo,
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-actions`,
        }, [refs.testButton, refs.rerunButton]),
      ]),
      createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Explanation",
        }),
        refs.explanation,
      ]),
      createSection(documentObject, { className: `${TOOL_NAMESPACE}-panel` }, [
        createToolNode(documentObject, "div", {
          className: `${TOOL_NAMESPACE}-panel-label`,
          text: "Alternative Selectors",
        }),
        refs.altList,
      ]),
      refs.exportPreviewWrap,
    );

    main.append(navigatorPane, inspectorPane);

    refs.footer = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-footer`,
    });
    refs.copyButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Copy JSON",
    });
    refs.toggleJsonButton = createButton(documentObject, {
      className: `${TOOL_NAMESPACE}-button`,
      text: "Show JSON",
    });
    refs.status = createToolNode(documentObject, "div", {
      className: `${TOOL_NAMESPACE}-status`,
      text: state.statusMessage,
    });
    refs.footer.append(
      createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-footer-group`,
      }, [refs.copyButton, refs.toggleJsonButton]),
      refs.status,
    );

    refs.resizeHandles = ["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((edge) =>
      createToolNode(documentObject, "div", {
        className: `${TOOL_NAMESPACE}-resize`,
        dataset: { edge },
      }),
    );

    refs.window.append(refs.titlebar, toolbar, main, refs.footer, ...refs.resizeHandles);
    refs.shell.append(refs.window);
    refs.shadow.append(refs.style, refs.shell);
    documentObject.documentElement.append(refs.host);
  }

  function mount() {
    if (state.mounted) {
      return api;
    }

    buildShadowUi();
    mountPageOverlays();
    applyTheme();
    applyHostModeUi();
    applyWindowFrame();
    bindWindowInteractions();
    refreshScanRecords();

    documentObject.addEventListener("pointermove", onGlobalPointerMove, true);
    documentObject.addEventListener("pointerup", onGlobalPointerUp, true);
    documentObject.addEventListener("pointerdown", onGlobalPointerDown, true);
    documentObject.addEventListener("click", onGlobalClick, true);
    documentObject.addEventListener("keydown", onGlobalKeyDown, true);
    windowObject.addEventListener("resize", applyWindowFrame);

    state.mounted = true;
    state.mode = "inspect";
    render();
    return api;
  }

  function reopen() {
    if (state.hostMode === "popup") {
      returnToInlineFromPopup();
    }
    moveHostToDocument(documentObject);
    refs.host.style.display = "block";
    state.mode = "inspect";
    setStatus("Tool reopened.");
    render();
  }

  function destroy() {
    state.popupCloseReason = "session-destroy";
    stopPopupMonitor();
    state.popupGeometry = capturePopupGeometry(state.popupWindow) ?? state.popupGeometry;
    closePopupWindow(state.popupWindow);
    state.popupWindow = null;
    clearMatches();
    clearAreaPreview();
    clearHover();
    documentObject.removeEventListener("pointermove", onGlobalPointerMove, true);
    documentObject.removeEventListener("pointerup", onGlobalPointerUp, true);
    documentObject.removeEventListener("pointerdown", onGlobalPointerDown, true);
    documentObject.removeEventListener("click", onGlobalClick, true);
    documentObject.removeEventListener("keydown", onGlobalKeyDown, true);
    windowObject.removeEventListener("resize", applyWindowFrame);
    refs.host?.remove();
    unmountPageOverlays();
    persistWindowState();
    delete windowObject[TOOL_GLOBAL_KEY];
  }

  const api = {
    mount,
    reopen,
    destroy,
  };

  return api;
}
