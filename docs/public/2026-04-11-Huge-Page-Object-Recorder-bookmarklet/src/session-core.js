import { chooseDefaultTheme } from "./ui/themes.js";
import { TOOL_NAMESPACE } from "./utils.js";

const SESSION_STORAGE_VERSION = 1;
const SESSION_KEY = `${TOOL_NAMESPACE}:session-state`;
const LEGACY_WINDOW_KEY = `${TOOL_NAMESPACE}:window-state`;

function safeClone(value) {
  if (value === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value));
}

function serializeObjectModel(objectModel) {
  const {
    element,
    ...serializable
  } = objectModel ?? {};
  return safeClone(serializable);
}

function serializeState(state) {
  return {
    version: SESSION_STORAGE_VERSION,
    counter: Number(state.counter ?? 1),
    mode: state.mode ?? "inspect",
    themeId: state.themeId,
    frame: state.frame ?? null,
    popupGeometry: state.popupGeometry ?? null,
    selectedObjectId: state.selectedObjectId ?? null,
    heuristicFilter: state.heuristicFilter ?? "",
    heuristicMenuOpen: Boolean(state.heuristicMenuOpen),
    exportPreviewVisible: Boolean(state.exportPreviewVisible),
    exportText: state.exportText ?? "",
    statusMessage: state.statusMessage ?? "",
    selectedObjects: Array.isArray(state.selectedObjects)
      ? state.selectedObjects.map((objectModel) => serializeObjectModel(objectModel))
      : [],
    stateVersion: Number(state.stateVersion ?? 0),
    lastExportVersion: Number(state.lastExportVersion ?? -1),
    popupMode: state.hostMode === "popup",
  };
}

function parseSavedState(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return {
    frame: raw.frame ?? null,
    themeId: raw.themeId,
    mode: raw.mode === "area" ? "area" : "inspect",
    counter: Number(raw.counter ?? 1),
    selectedObjects: Array.isArray(raw.selectedObjects) ? raw.selectedObjects : [],
    selectedObjectId: raw.selectedObjectId ?? null,
    heuristicFilter: raw.heuristicFilter ?? "",
    heuristicMenuOpen: Boolean(raw.heuristicMenuOpen),
    exportPreviewVisible: Boolean(raw.exportPreviewVisible),
    exportText: raw.exportText ?? "",
    statusMessage: raw.statusMessage ?? "Ready to scan the current page for automation-relevant objects.",
    stateVersion: Number(raw.stateVersion ?? 0),
    lastExportVersion: Number(raw.lastExportVersion ?? -1),
    popupGeometry: raw.popupGeometry ?? null,
  };
}

export function loadSessionSnapshot(windowObject) {
  try {
    const raw = windowObject.sessionStorage?.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parseSavedState(parsed);
    }

    const legacyRaw = windowObject.sessionStorage?.getItem(LEGACY_WINDOW_KEY);
    if (!legacyRaw) {
      return null;
    }
    const legacy = JSON.parse(legacyRaw);
    return parseSavedState({
      frame: legacy.frame ?? null,
      themeId: legacy.themeId ?? undefined,
    });
  } catch {
    return null;
  }
}

export function saveSessionSnapshot(windowObject, state) {
  try {
    const snapshot = serializeState(state);
    windowObject.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage failures
  }
}

export function createInitialSessionState(windowObject, options = {}) {
  const savedState = options.savedState ?? loadSessionSnapshot(windowObject);
  return {
    mounted: false,
    hostMode: "inline",
    scanRecords: [],
    selectedObjects: savedState?.selectedObjects ?? [],
    selectedObjectId: savedState?.selectedObjectId ?? null,
    hoverRecord: null,
    mode: savedState?.mode ?? "inspect",
    dragSelection: null,
    counter: Math.max(1, Number(savedState?.counter ?? 1)),
    themeId: savedState?.themeId ?? chooseDefaultTheme(windowObject),
    frame: savedState?.frame ?? null,
    popupGeometry: savedState?.popupGeometry ?? null,
    heuristicFilter: savedState?.heuristicFilter ?? "",
    heuristicMenuOpen: Boolean(savedState?.heuristicMenuOpen),
    exportPreviewVisible: Boolean(savedState?.exportPreviewVisible),
    exportText: savedState?.exportText ?? "",
    statusMessage:
      savedState?.statusMessage ?? "Ready to scan the current page for automation-relevant objects.",
    interaction: null,
    popupWindow: null,
    popupCloseReason: null,
    stateVersion: Number(savedState?.stateVersion ?? 0),
    lastExportVersion: Number(savedState?.lastExportVersion ?? -1),
  };
}

export function markSessionChanged(state) {
  state.stateVersion = Number(state.stateVersion ?? 0) + 1;
}

export function markSessionExported(state) {
  state.lastExportVersion = Number(state.stateVersion ?? 0);
}

export function isSessionDirty(state) {
  const hasSelected = Array.isArray(state.selectedObjects) && state.selectedObjects.length > 0;
  const hasManualEdits = Array.isArray(state.selectedObjects)
    ? state.selectedObjects.some((item) => Boolean(String(item?.manualSelector ?? "").trim()))
    : false;
  const hasMeaningfulState = hasSelected || hasManualEdits;
  return hasMeaningfulState && Number(state.stateVersion ?? 0) > Number(state.lastExportVersion ?? -1);
}
