import { registerAllComponents } from "../vendor/retroos-ui-v001/src/components/register-all.js";
import {
  APP_SUBTITLE,
  APP_TITLE,
  DEFAULT_RIGHT_TOP_HEIGHT_PX,
  DENSITY_VALUES,
  MIN_LEFT_PANE_WIDTH_PX,
  MIN_RIGHT_BOTTOM_HEIGHT_PX,
  MIN_RIGHT_PANE_WIDTH_PX,
  MIN_RIGHT_TOP_HEIGHT_PX,
  PANE_GRIP_SIZE_PX
} from "./constants.js";
import { logger } from "./logger.js";
import { getState, subscribe, updateState } from "./state.js";
import { buildDiagnostics } from "../core/build-diagnostics.js";
import { applyColumnVisibility, resetVisibleColumns, toggleColumnVisibility } from "../core/column-visibility.js";
import { chooseBestRowSource, findRowSourceCandidates } from "../core/detect-row-source.js";
import { buildDatasetHealthSummary, scoreRows } from "../core/detect-failures.js";
import { createDownloadBlob, serializeCsv, serializeTsv } from "../core/export-table.js";
import { extractRowsFromSource } from "../core/extract-rows.js";
import { flattenRows } from "../core/flatten.js";
import { chooseDefaultVisibleColumns, orderColumns } from "../core/order-columns.js";
import { buildPerformanceWarnings, formatTiming } from "../core/performance.js";
import { parseInput } from "../core/parse-input.js";
import { profileColumns } from "../core/profile-columns.js";
import { filterRows } from "../core/table-filter.js";
import { EXAMPLES } from "../examples/index.js";
import { renderColumnControls } from "../ui/render-column-controls.js";
import { renderDetectionState } from "../ui/render-detection.js";
import { renderExportControls } from "../ui/render-export-controls.js";
import { buildCopyableErrorText, renderInputState } from "../ui/render-input.js";
import { renderHighlightControls } from "../ui/render-highlight-controls.js";
import { renderRowDetails } from "../ui/render-row-details.js";
import { renderShell } from "../ui/render-shell.js";
import { renderStatus } from "../ui/render-status.js";
import { renderTable } from "../ui/render-table.js";
import { buildTableViewModel } from "../ui/table-view-model.js";
import { nextSortState } from "../ui/table-interactions.js";

registerAllComponents();
logger.info("UI", "App init start", { exampleCount: EXAMPLES.length });

const mountNode = document.getElementById("app");
if (!mountNode) throw new Error("Missing #app mount node");

const refs = renderShell(mountNode, { title: APP_TITLE, subtitle: APP_SUBTITLE, examples: EXAMPLES });

let parseDebounceTimer = null;
let latestParseRequestId = 0;
let latestPipelineRunId = 0;
let currentViewModel = {
  status: "empty",
  rows: [],
  columns: [],
  visibleColumns: [],
  allMatchingRows: [],
  meta: {
    totalRows: 0,
    visibleRows: 0,
    totalColumns: 0,
    visibleColumns: 0,
    hiddenColumns: 0,
    totalMatchingRows: 0,
    renderLimited: false
  }
};

function toFrameworkDensity(value) {
  return value === "roomy" ? "spacious" : value;
}

function toAppDensity(value) {
  return DENSITY_VALUES.includes(value) ? value : "compact";
}

function clamp(value, minValue, maxValue) {
  return Math.min(Math.max(value, minValue), maxValue);
}

function updateInputMeta(nextText) {
  const lineList = String(nextText).split(/\r\n|\n|\r/);
  const lineCount = lineList.length;
  const nonEmptyLineCount = lineList.filter((line) => line.trim().length > 0).length;
  updateState({
    inputText: nextText,
    inputMeta: {
      charCount: nextText.length,
      lineCount,
      nonEmptyLineCount
    }
  });
}

function resetDownstreamState() {
  updateState({
    rowSourceCandidates: [],
    selectedRowSourceId: null,
    selectedRowSourcePath: null,
    selectedRowSource: null,
    rowSourceStatus: "none",
    rowSourceWarning: null,
    extractedRows: [],
    flatRows: [],
    scoredRows: [],
    columns: [],
    visibleColumnKeys: [],
    flattenStatus: "idle",
    flattenError: null,
    flattenWarnings: [],
    healthSummary: null,
    diagnostics: null,
    table: {
      ...getState().table,
      selectedRowIndex: null
    },
    performance: {
      ...getState().performance,
      warnings: [],
      limits: {
        ...getState().performance.limits,
        renderedRows: 0,
        totalMatchingRows: 0,
        renderLimited: false,
        reason: null
      }
    }
  });
}

function buildPipeline(parseResult, { preserveSelectionId = null, preserveVisibleColumns = null } = {}) {
  const stageStart = performance.now();
  const runId = ++latestPipelineRunId;
  logger.info("Performance", "Pipeline started", {
    runId,
    charCount: parseResult.meta?.charCount ?? 0
  });

  const nextPatch = {
    rowSourceCandidates: [],
    selectedRowSourceId: null,
    selectedRowSourcePath: null,
    selectedRowSource: null,
    rowSourceStatus: "none",
    rowSourceWarning: null,
    extractedRows: [],
    flatRows: [],
    scoredRows: [],
    columns: [],
    visibleColumnKeys: [],
    flattenStatus: "idle",
    flattenError: null,
    flattenWarnings: [],
    healthSummary: null,
    diagnostics: null,
    performance: {
      ...getState().performance,
      lastRunId: runId
    }
  };

  const rowSourceStarted = performance.now();
  const candidates = findRowSourceCandidates(parseResult);
  const selected = chooseBestRowSource(candidates, { preferredCandidateId: preserveSelectionId || getState().selectedRowSourceId });
  const rowSourceMs = performance.now() - rowSourceStarted;

  nextPatch.rowSourceCandidates = candidates;
  nextPatch.selectedRowSourceId = selected?.id ?? null;
  nextPatch.selectedRowSourcePath = selected?.path ?? null;
  nextPatch.selectedRowSource = selected ?? null;
  nextPatch.rowSourceStatus = selected ? "detected" : "not-found";

  if (!selected) {
    nextPatch.diagnostics = buildDiagnostics({
      parseResult,
      rowSourceCandidates: candidates,
      selectedRowSource: null
    });
    nextPatch.performance.timings = {
      ...nextPatch.performance.timings,
      rowSourceMs: Math.round(rowSourceMs * 10) / 10
    };
    updateState(nextPatch);
    return;
  }

  const extractionResult = extractRowsFromSource(parseResult, selected);
  if (!extractionResult.ok) {
    nextPatch.flattenStatus = "error";
    nextPatch.flattenError = extractionResult.error;
    nextPatch.diagnostics = buildDiagnostics({
      parseResult,
      rowSourceCandidates: candidates,
      selectedRowSource: selected
    });
    updateState(nextPatch);
    return;
  }

  const flattenStarted = performance.now();
  const flattenResult = flattenRows(extractionResult.rows, getState().flattenOptions);
  const flattenMs = performance.now() - flattenStarted;
  const profileStarted = performance.now();
  const profiledColumns = profileColumns(flattenResult.flatRows, flattenResult.columns);
  const orderedColumns = orderColumns(profiledColumns, getState().columnOrderPreset);
  const profileMs = performance.now() - profileStarted;
  const healthStarted = performance.now();
  const scoredRows = scoreRows(flattenResult.flatRows, orderedColumns);
  const healthSummary = buildDatasetHealthSummary(scoredRows, orderedColumns);
  const healthMs = performance.now() - healthStarted;

  const defaultVisibility = chooseDefaultVisibleColumns(orderedColumns, { maxVisibleColumns: 50 });
  let visibleColumnKeys = defaultVisibility.visibleColumnKeys;
  if (Array.isArray(preserveVisibleColumns) && preserveVisibleColumns.length > 0) {
    const currentSet = new Set(orderedColumns.map((column) => column.key));
    const overlap = preserveVisibleColumns.filter((key) => currentSet.has(key));
    if (overlap.length > 0) visibleColumnKeys = overlap;
  } else if (Array.isArray(getState().visibleColumnKeys) && getState().visibleColumnKeys.length > 0) {
    const currentSet = new Set(orderedColumns.map((column) => column.key));
    const overlap = getState().visibleColumnKeys.filter((key) => currentSet.has(key));
    if (overlap.length > 0) visibleColumnKeys = overlap;
  }

  const diagnostics = buildDiagnostics({
    parseResult,
    rowSourceCandidates: candidates,
    selectedRowSource: selected,
    extractionResult,
    flattenResult,
    columns: orderedColumns,
    flatRows: flattenResult.flatRows,
    scoredRows,
    healthSummary
  });

  nextPatch.extractedRows = extractionResult.rows;
  nextPatch.flatRows = flattenResult.flatRows;
  nextPatch.scoredRows = scoredRows;
  nextPatch.columns = orderedColumns;
  nextPatch.visibleColumnKeys = visibleColumnKeys;
  nextPatch.flattenStatus = "ready";
  nextPatch.flattenError = null;
  nextPatch.flattenWarnings = flattenResult.warnings || [];
  nextPatch.healthSummary = healthSummary;
  nextPatch.diagnostics = diagnostics;
  nextPatch.performance.timings = {
    ...nextPatch.performance.timings,
    rowSourceMs: Math.round(rowSourceMs * 10) / 10,
    flattenMs: Math.round(flattenMs * 10) / 10,
    profileMs: Math.round(profileMs * 10) / 10,
    healthMs: Math.round(healthMs * 10) / 10
  };

  updateState(nextPatch);
  logger.info("Performance", "Pipeline completed", {
    runId,
    rowCount: scoredRows.length,
    columnCount: orderedColumns.length,
    durationMs: Math.round((performance.now() - stageStart) * 10) / 10
  });
}

function runParseAndPipeline({ immediate = false } = {}) {
  const state = getState();
  const inputTextSnapshot = state.inputText;
  const parseRequestId = ++latestParseRequestId;

  updateState({
    parseStatus: inputTextSnapshot.trim() ? "parsing" : "empty",
    lastParseStartedAt: Date.now(),
    transient: {
      ...state.transient,
      parseRequestId
    }
  });

  const run = () => {
    const parseStart = performance.now();
    logger.info("Parser", "Attempt parse input", {
      charCount: inputTextSnapshot.length,
      lineCount: state.inputMeta?.lineCount ?? 0
    });
    const parseResult = parseInput(inputTextSnapshot);
    const parseDuration = Math.round((performance.now() - parseStart) * 10) / 10;

    if (parseRequestId !== latestParseRequestId) {
      logger.warn("Parser", "Ignored stale parse result", { parseRequestId });
      return;
    }

    if (!parseResult.ok) {
      logger.warn("Parser", "Parse failed", {
        code: parseResult.error?.code,
        line: parseResult.error?.line,
        column: parseResult.error?.column,
        durationMs: parseDuration
      });
      updateState({
        parseResult: null,
        parseStatus: "invalid",
        parseError: parseResult.error,
        lastParseFinishedAt: Date.now(),
        performance: {
          ...getState().performance,
          timings: {
            ...getState().performance.timings,
            parseMs: parseDuration
          }
        }
      });
      resetDownstreamState();
      return;
    }

    logger.info("Parser", "Parse succeeded", {
      kind: parseResult.kind,
      rootType: parseResult.meta?.rootType ?? "null",
      durationMs: parseDuration
    });

    updateState({
      parseResult,
      parseStatus: parseResult.kind === "empty" ? "empty" : "valid",
      parseError: null,
      lastParseFinishedAt: Date.now(),
      performance: {
        ...getState().performance,
        timings: {
          ...getState().performance.timings,
          parseMs: parseDuration
        }
      }
    });

    if (parseResult.kind === "empty") {
      resetDownstreamState();
      return;
    }

    buildPipeline(parseResult);
  };

  if (parseDebounceTimer) {
    clearTimeout(parseDebounceTimer);
    parseDebounceTimer = null;
  }

  if (immediate) {
    run();
    return;
  }

  parseDebounceTimer = setTimeout(run, 250);
}

async function copyText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }
  try {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const ok = document.execCommand("copy");
    helper.remove();
    return ok;
  } catch {
    return false;
  }
}

function applyPaneSizes(state) {
  if (typeof state.ui.leftPaneWidth === "number") refs.workspace.style.setProperty("--jti-left-pane-width", `${state.ui.leftPaneWidth}px`);
  else refs.workspace.style.removeProperty("--jti-left-pane-width");

  if (typeof state.ui.rightTopHeight === "number") refs.rightPane.style.setProperty("--jti-right-top-height", `${state.ui.rightTopHeight}px`);
  else refs.rightPane.style.setProperty("--jti-right-top-height", `${DEFAULT_RIGHT_TOP_HEIGHT_PX}px`);
}

function exportVisibleRows(format) {
  const rows = currentViewModel.allMatchingRows || [];
  const visibleColumns = currentViewModel.visibleColumns || [];
  const serializer = format === "tsv" ? serializeTsv : serializeCsv;
  const result = serializer(rows, visibleColumns, {
    includeHeader: true,
    includeHealth: true,
    includeRowNumber: false,
    protectFormula: true
  });
  if (!result.ok) {
    updateState({ statusMessage: result.error.message });
    logger.warn("Export", "Export failed", { code: result.error.code });
    return null;
  }
  logger.info("Export", "Export serialized", {
    format,
    rowCount: result.meta.rowCount,
    columnCount: result.meta.columnCount,
    formulaEscapedCellCount: result.meta.formulaEscapedCellCount
  });
  return result;
}

async function onCopyCsv() {
  const result = exportVisibleRows("csv");
  if (!result) return;
  const ok = await copyText(result.text);
  updateState({
    statusMessage: ok
      ? `Copied CSV: ${result.meta.rowCount} rows × ${result.meta.columnCount} columns.`
      : "Could not copy CSV. Clipboard permission failed."
  });
}

async function onCopyTsv() {
  const result = exportVisibleRows("tsv");
  if (!result) return;
  const ok = await copyText(result.text);
  updateState({
    statusMessage: ok
      ? `Copied TSV: ${result.meta.rowCount} rows × ${result.meta.columnCount} columns.`
      : "Could not copy TSV. Clipboard permission failed."
  });
}

function onDownloadCsv() {
  const result = exportVisibleRows("csv");
  if (!result) return;
  const blob = createDownloadBlob(result.text, "text/csv;charset=utf-8");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
    now.getHours()
  ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  link.href = url;
  link.download = `json-table-inspector-export-${stamp}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  updateState({ statusMessage: `Downloaded CSV: ${result.meta.rowCount} rows × ${result.meta.columnCount} columns.` });
}

async function loadExample(exampleId) {
  const example = EXAMPLES.find((item) => item.id === exampleId);
  if (!example) return;
  const state = getState();
  if (state.inputText.trim() && !confirm("Replace current input with this example?")) return;

  logger.info("Examples", "Load example attempt", { exampleId, kind: example.kind, charCount: example.text.length });
  updateState({
    inputText: example.text,
    inputMeta: {
      charCount: example.text.length,
      lineCount: example.text.split(/\r\n|\n|\r/).length,
      nonEmptyLineCount: example.text.split(/\r\n|\n|\r/).filter((line) => line.trim()).length
    },
    table: {
      ...state.table,
      searchQuery: "",
      quickFilter: "all",
      selectedRowIndex: null
    },
    statusMessage: `Loaded example: ${example.title}.`
  });
  runParseAndPipeline({ immediate: true });
}

function render() {
  const started = performance.now();
  const state = getState();

  if (refs.inputTextarea.value !== state.inputText) {
    refs.inputTextarea.value = state.inputText;
  }

  refs.wrapCheckbox.checked = Boolean(state.ui.wrapCells);
  refs.densitySelect.value = state.ui.density;
  refs.columnPresetSelect.value = state.columnOrderPreset;
  refs.quickFilterSelect.value = state.table.quickFilter;
  refs.searchInput.value = state.table.searchQuery;
  refs.highlightsToggle.checked = state.highlightRulesEnabled !== false;

  refs.appRoot.dataset.density = state.ui.density;
  refs.appRoot.dataset.wrapCells = state.ui.wrapCells ? "true" : "false";
  refs.workspace.classList.toggle("is-input-collapsed", Boolean(state.ui.inputCollapsed));
  refs.columnControlsContainer.hidden = !state.ui.columnPickerOpen;

  const collapseLabel = state.ui.inputCollapsed ? "Expand Input" : "Collapse Input";
  refs.collapseButton.textContent = collapseLabel;
  refs.collapseButton.setAttribute("aria-label", collapseLabel);

  const frameworkDensity = toFrameworkDensity(state.ui.density);
  refs.appShell.setAttribute("density", frameworkDensity);
  refs.statusStrip.setAttribute("density", frameworkDensity);

  applyPaneSizes(state);
  renderInputState(state, refs);
  renderDetectionState(state, refs);

  currentViewModel = buildTableViewModel(state);
  renderTable(currentViewModel, refs, state, {
    onSort(columnKey) {
      updateState({
        table: {
          ...getState().table,
          sort: nextSortState(getState().table.sort, columnKey)
        }
      });
    },
    onSelectRow(rowIndex) {
      updateState({
        table: {
          ...getState().table,
          selectedRowIndex: rowIndex
        },
        ui: {
          ...getState().ui,
          rowDetailsOpen: true
        }
      });
    }
  });

  renderHighlightControls(state, refs, {
    onAddRule(ruleInput) {
      const rules = [...(getState().highlightRules || [])];
      rules.push({
        id: `rule-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: `Rule ${rules.length + 1}`,
        enabled: true,
        columnKey: ruleInput.columnKey,
        operator: ruleInput.operator,
        value: ruleInput.value,
        caseSensitive: false,
        target: "cell",
        style: {
          tone: ruleInput.style.tone,
          backgroundColor: ruleInput.style.backgroundColor
        }
      });
      updateState({ highlightRules: rules });
    },
    onDeleteRule(ruleId) {
      updateState({ highlightRules: (getState().highlightRules || []).filter((rule) => rule.id !== ruleId) });
    },
    onToggleRule(ruleId, enabled) {
      updateState({
        highlightRules: (getState().highlightRules || []).map((rule) => (rule.id === ruleId ? { ...rule, enabled } : rule))
      });
    }
  });

  renderColumnControls(state, currentViewModel, refs, {
    onShowAll() {
      updateState({ visibleColumnKeys: (getState().columns || []).map((column) => column.key) });
    },
    onHideAll() {
      updateState({ visibleColumnKeys: [] });
    },
    onResetDefaults() {
      const defaults = resetVisibleColumns(getState().columns, {
        defaultVisibleColumnKeys: chooseDefaultVisibleColumns(getState().columns, { maxVisibleColumns: 50 }).visibleColumnKeys
      });
      updateState({ visibleColumnKeys: defaults });
    },
    onColumnSearch(value) {
      updateState({
        ui: {
          ...getState().ui,
          columnSearchQuery: value
        }
      }, { persist: false });
    },
    onToggleColumn(columnKey, visible) {
      updateState({
        visibleColumnKeys: toggleColumnVisibility(getState().visibleColumnKeys, columnKey, visible)
      });
    }
  });

  renderRowDetails(state, currentViewModel, refs, {
    onCopyOriginalRow: async (text) => {
      const ok = await copyText(text);
      updateState({ statusMessage: ok ? "Copied original row JSON." : "Could not copy original row JSON." });
    },
    onCopyVisibleRow: async (text) => {
      const ok = await copyText(text);
      updateState({ statusMessage: ok ? "Copied visible row JSON." : "Could not copy visible row JSON." });
    }
  });

  renderExportControls(currentViewModel, refs, {
    onCopyCsv,
    onCopyTsv,
    onDownloadCsv
  });

  refs.copyCsvButton.toggleAttribute("disabled", currentViewModel.meta.totalMatchingRows === 0);
  refs.exportButton.toggleAttribute("disabled", currentViewModel.meta.totalMatchingRows === 0);
  refs.tableStatus.textContent = state.statusMessage
    || `Showing ${currentViewModel.meta.visibleRows} of ${currentViewModel.meta.totalRows} rows · ${currentViewModel.meta.visibleColumns} visible columns`;

  refs.diagnosticsContainer.replaceChildren();
  if (state.diagnostics?.items?.length) {
    const list = document.createElement("ul");
    list.className = "jti-diagnostics-list";
    for (const item of state.diagnostics.items.slice(0, 10)) {
      const li = document.createElement("li");
      li.textContent = item.message;
      list.append(li);
    }
    refs.diagnosticsContainer.append(list);
  }

  const warnings = buildPerformanceWarnings({
    charCount: state.inputMeta?.charCount ?? 0,
    rowCount: currentViewModel.meta.totalRows,
    columnCount: currentViewModel.meta.totalColumns,
    renderLimited: currentViewModel.meta.renderLimited,
    reason: currentViewModel.meta.renderReason
  });
  refs.performanceContainer.replaceChildren();
  const perfLine = document.createElement("p");
  perfLine.className = "jti-panel-helper";
  perfLine.textContent = `Timings: parse ${formatTiming(state.performance.timings.parseMs)}, detect ${formatTiming(
    state.performance.timings.rowSourceMs
  )}, flatten ${formatTiming(state.performance.timings.flattenMs)}, profile ${formatTiming(
    state.performance.timings.profileMs
  )}, health ${formatTiming(state.performance.timings.healthMs)}, render ${formatTiming(state.performance.timings.renderMs)}.`;
  refs.performanceContainer.append(perfLine);
  if (warnings.length > 0) {
    const warningList = document.createElement("ul");
    warningList.className = "jti-performance-warnings";
    for (const warning of warnings) {
      const li = document.createElement("li");
      li.textContent = warning;
      warningList.append(li);
    }
    refs.performanceContainer.append(warningList);
  }

  renderStatus(state, refs);
  const renderDuration = performance.now() - started;
  const timingsText = `${formatTiming(renderDuration)} render`;
  refs.performanceContainer.dataset.render = timingsText;
}

function bindVerticalResize() {
  const grip = refs.verticalGrip;
  let dragState = null;

  const onPointerMove = (event) => {
    if (!dragState) return;
    const deltaX = event.clientX - dragState.startX;
    const maxLeft = Math.max(MIN_LEFT_PANE_WIDTH_PX, dragState.workspaceWidth - MIN_RIGHT_PANE_WIDTH_PX - PANE_GRIP_SIZE_PX);
    const nextWidth = clamp(dragState.startWidth + deltaX, MIN_LEFT_PANE_WIDTH_PX, maxLeft);
    refs.workspace.style.setProperty("--jti-left-pane-width", `${Math.round(nextWidth)}px`);
    dragState.nextWidth = Math.round(nextWidth);
  };

  const stopResize = () => {
    if (!dragState) return;
    updateState({ ui: { ...getState().ui, leftPaneWidth: dragState.nextWidth } });
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopResize);
    dragState = null;
  };

  grip.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || refs.workspace.classList.contains("is-input-collapsed")) return;
    const workspaceRect = refs.workspace.getBoundingClientRect();
    dragState = {
      startX: event.clientX,
      workspaceWidth: workspaceRect.width,
      startWidth: refs.leftPane.getBoundingClientRect().width,
      nextWidth: refs.leftPane.getBoundingClientRect().width
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopResize);
  });

  grip.addEventListener("dblclick", () => updateState({ ui: { ...getState().ui, leftPaneWidth: null } }));
}

function bindHorizontalResize() {
  const grip = refs.horizontalGrip;
  let dragState = null;

  const onPointerMove = (event) => {
    if (!dragState) return;
    const deltaY = event.clientY - dragState.startY;
    const maxHeight = Math.max(MIN_RIGHT_TOP_HEIGHT_PX, dragState.rightPaneHeight - MIN_RIGHT_BOTTOM_HEIGHT_PX - PANE_GRIP_SIZE_PX);
    const nextHeight = clamp(dragState.startHeight + deltaY, MIN_RIGHT_TOP_HEIGHT_PX, maxHeight);
    refs.rightPane.style.setProperty("--jti-right-top-height", `${Math.round(nextHeight)}px`);
    dragState.nextHeight = Math.round(nextHeight);
  };

  const stopResize = () => {
    if (!dragState) return;
    updateState({ ui: { ...getState().ui, rightTopHeight: dragState.nextHeight } });
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopResize);
    dragState = null;
  };

  grip.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rightPaneRect = refs.rightPane.getBoundingClientRect();
    dragState = {
      startY: event.clientY,
      rightPaneHeight: rightPaneRect.height,
      startHeight: refs.mappingPanel.getBoundingClientRect().height,
      nextHeight: refs.mappingPanel.getBoundingClientRect().height
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopResize);
  });

  grip.addEventListener("dblclick", () => updateState({ ui: { ...getState().ui, rightTopHeight: null } }));
}

function bindEvents() {
  refs.inputTextarea.addEventListener("input", () => {
    updateInputMeta(refs.inputTextarea.value);
    runParseAndPipeline();
  });
  refs.parseButton.addEventListener("click", () => runParseAndPipeline({ immediate: true }));
  refs.formatButton.addEventListener("click", onFormatInput);
  refs.formatInputButton.addEventListener("click", onFormatInput);
  refs.clearButton.addEventListener("click", onClearInput);
  refs.clearInputButton.addEventListener("click", onClearInput);
  refs.copyInputButton.addEventListener("click", onCopyInput);
  refs.copyInputInlineButton.addEventListener("click", onCopyInput);
  refs.copyErrorButton.addEventListener("click", onCopyErrorDetails);
  refs.copyCsvButton.addEventListener("click", onCopyCsv);
  refs.exportButton.addEventListener("click", onDownloadCsv);
  refs.jumpToErrorButton.addEventListener("click", onJumpToError);
  refs.collapseButton.addEventListener("click", () => {
    updateState({ ui: { ...getState().ui, inputCollapsed: !getState().ui.inputCollapsed } });
  });
  refs.wrapCheckbox.addEventListener("change", () => updateState({ ui: { ...getState().ui, wrapCells: refs.wrapCheckbox.checked } }));
  refs.densitySelect.addEventListener("change", () => updateState({ ui: { ...getState().ui, density: toAppDensity(refs.densitySelect.value) } }));
  refs.columnPresetSelect.addEventListener("change", () => {
    const state = getState();
    const ordered = orderColumns(state.columns, refs.columnPresetSelect.value);
    const visible = applyColumnVisibility(ordered, state.visibleColumnKeys);
    updateState({
      columnOrderPreset: refs.columnPresetSelect.value,
      columns: ordered,
      visibleColumnKeys: visible.map((column) => column.key)
    });
  });
  refs.rowSourceSelect.addEventListener("change", () => {
    const selectedId = refs.rowSourceSelect.value;
    const candidates = getState().rowSourceCandidates || [];
    const selected = candidates.find((candidate) => candidate.id === selectedId) || null;
    updateState({
      selectedRowSourceId: selected?.id ?? null,
      selectedRowSourcePath: selected?.path ?? null,
      selectedRowSource: selected
    });
    if (selected && getState().parseResult?.ok) {
      buildPipeline(getState().parseResult, {
        preserveSelectionId: selected.id,
        preserveVisibleColumns: getState().visibleColumnKeys
      });
    }
  });
  refs.searchInput.addEventListener("input", () => {
    updateState({ table: { ...getState().table, searchQuery: refs.searchInput.value } }, { persist: false });
  });
  refs.quickFilterSelect.addEventListener("change", () => {
    updateState({ table: { ...getState().table, quickFilter: refs.quickFilterSelect.value } });
  });
  refs.highlightsToggle.addEventListener("change", () => {
    updateState({ highlightRulesEnabled: refs.highlightsToggle.checked });
  });
  refs.addHighlightButton.addEventListener("click", () => {
    refs.highlightControlsContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  refs.openColumnsButton.addEventListener("click", () => {
    updateState({ ui: { ...getState().ui, columnPickerOpen: !getState().ui.columnPickerOpen } });
  });

  for (const button of refs.exampleButtons) {
    button.addEventListener("click", () => loadExample(button.dataset.exampleId));
  }

  bindVerticalResize();
  bindHorizontalResize();
}

function onClearInput() {
  logger.info("Input", "Clear input");
  updateState({
    inputText: "",
    parseResult: null,
    parseStatus: "empty",
    parseError: null,
    inputMeta: {
      charCount: 0,
      lineCount: 0,
      nonEmptyLineCount: 0
    },
    statusMessage: "Input cleared."
  });
  resetDownstreamState();
}

function onFormatInput() {
  const state = getState();
  if (!state.parseResult?.ok || state.parseResult.kind !== "json") {
    updateState({ statusMessage: "Format supports valid JSON documents only." });
    return;
  }
  const text = JSON.stringify(state.parseResult.root, null, 2);
  updateInputMeta(text);
  updateState({ statusMessage: "Input formatted as JSON." });
  runParseAndPipeline({ immediate: true });
}

async function onCopyInput() {
  const ok = await copyText(getState().inputText || "");
  updateState({ statusMessage: ok ? "Copied input." : "Could not copy input." });
}

async function onCopyErrorDetails() {
  const parseError = getState().parseError;
  if (!parseError) return;
  const text = buildCopyableErrorText(parseError);
  const ok = await copyText(text);
  updateState({ statusMessage: ok ? "Copied parse error details." : "Could not copy parse error details." });
}

async function onJumpToError() {
  const error = getState().parseError;
  if (!error || !Number.isFinite(error.offset)) return;
  const textarea = refs.inputTextarea.shadowRoot?.querySelector("textarea");
  if (!textarea) return;
  const position = clamp(error.offset, 0, textarea.value.length);
  textarea.focus();
  textarea.setSelectionRange(position, position);
}

subscribe(render);
bindEvents();
render();
runParseAndPipeline({ immediate: true });
