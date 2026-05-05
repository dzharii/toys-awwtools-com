import { TAGS } from "../vendor/retroos-ui-v001/src/core/constants.js";

function createTextSlot(tagName, slotName, text, className = "") {
  const node = document.createElement(tagName);
  node.slot = slotName;
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function createButton(label, options = {}) {
  const button = document.createElement(TAGS.button);
  button.textContent = label;
  if (options.disabled) button.setAttribute("disabled", "");
  if (options.variant) button.setAttribute("variant", options.variant);
  if (options.tone) button.setAttribute("tone", options.tone);
  if (options.className) button.className = options.className;
  if (options.ariaLabel) button.setAttribute("aria-label", options.ariaLabel);
  return button;
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function createToolbarBadge(text) {
  const badge = document.createElement("span");
  badge.className = "jti-toolbar-badge";
  badge.textContent = text;
  return badge;
}

export function renderShell(mountNode, { title, subtitle, examples = [] }) {
  const appRoot = document.createElement("div");
  appRoot.className = "jti-root";
  mountNode.replaceChildren(appRoot);

  const appShell = document.createElement(TAGS.appShell);
  appShell.className = "jti-app-shell";
  appRoot.append(appShell);

  appShell.append(createTextSlot("span", "title", title), createTextSlot("span", "subtitle", subtitle));

  const toolbar = document.createElement(TAGS.toolbar);
  toolbar.slot = "status";
  toolbar.className = "jti-toolbar";
  toolbar.setAttribute("align", "between");
  toolbar.setAttribute("wrap", "");

  const toolbarActions = document.createElement("div");
  toolbarActions.className = "jti-toolbar-group";
  const parseButton = createButton("Parse");
  const formatButton = createButton("Format", { disabled: true });
  const clearButton = createButton("Clear");
  const copyInputButton = createButton("Copy Input");
  const copyCsvButton = createButton("Copy CSV", { disabled: true });
  const exportButton = createButton("Download CSV", { disabled: true });
  toolbarActions.append(parseButton, formatButton, clearButton, copyInputButton, copyCsvButton, exportButton);

  const toolbarMetrics = document.createElement("div");
  toolbarMetrics.className = "jti-toolbar-group jti-toolbar-metrics";
  const toolbarBadgeInput = createToolbarBadge("Input: empty");
  const toolbarBadgeRows = createToolbarBadge("Rows: 0");
  const toolbarBadgeColumns = createToolbarBadge("Columns: 0");
  const toolbarBadgeFailures = createToolbarBadge("Failures: 0");
  toolbarMetrics.append(toolbarBadgeInput, toolbarBadgeRows, toolbarBadgeColumns, toolbarBadgeFailures);

  toolbar.append(toolbarActions, toolbarMetrics);
  appShell.append(toolbar);

  const workspace = document.createElement("section");
  workspace.slot = "body";
  workspace.className = "jti-workspace";

  const leftPane = document.createElement("section");
  leftPane.className = "jti-pane jti-pane-left";
  const leftPanel = document.createElement(TAGS.panel);
  leftPanel.className = "jti-panel";
  leftPanel.append(createTextSlot("span", "title", "Input"));
  const collapseButton = createButton("Collapse Input", { variant: "ghost", ariaLabel: "Collapse input panel" });
  collapseButton.slot = "actions";
  leftPanel.append(collapseButton);

  const parseAlert = document.createElement(TAGS.alert);
  parseAlert.className = "jti-parse-alert";
  parseAlert.setAttribute("tone", "danger");
  parseAlert.hidden = true;

  const parseMeta = document.createElement("p");
  parseMeta.className = "jti-input-meta";
  parseMeta.textContent = "Status: Empty";

  const inputField = document.createElement(TAGS.field);
  inputField.setAttribute("wide", "");
  inputField.setAttribute("label", "JSON / JSONL");
  const inputTextarea = document.createElement(TAGS.textarea);
  inputTextarea.id = "jti-input-textarea";
  inputTextarea.setAttribute("wide", "");
  inputTextarea.setAttribute("rows", "18");
  inputTextarea.setAttribute("placeholder", "Paste JSON, JSON array, object with results/items, or JSONL here.");
  inputTextarea.setAttribute("spellcheck", "false");
  inputTextarea.setAttribute("autocomplete", "off");
  inputTextarea.setAttribute("autocapitalize", "off");
  inputField.append(inputTextarea);

  const inputActions = document.createElement("div");
  inputActions.className = "jti-inline-actions";
  const formatInputButton = createButton("Format", { disabled: true });
  const clearInputButton = createButton("Clear", { tone: "neutral" });
  const copyInputInlineButton = createButton("Copy Input");
  const copyErrorButton = createButton("Copy Error", { disabled: true });
  const jumpToErrorButton = createButton("Jump To Error", { disabled: true });
  inputActions.append(formatInputButton, clearInputButton, copyInputInlineButton, copyErrorButton, jumpToErrorButton);

  const examplesPanel = document.createElement("section");
  examplesPanel.className = "jti-examples";
  const examplesLabel = document.createElement("p");
  examplesLabel.className = "jti-panel-helper";
  examplesLabel.textContent = "Examples:";
  const examplesButtons = document.createElement("div");
  examplesButtons.className = "jti-example-buttons";
  const exampleButtons = [];
  for (const example of examples) {
    const button = createButton(example.title, { variant: "ghost" });
    button.dataset.exampleId = example.id;
    exampleButtons.push(button);
    examplesButtons.append(button);
  }
  examplesPanel.append(examplesLabel, examplesButtons);

  leftPanel.append(parseAlert, parseMeta, inputField, inputActions, examplesPanel);
  leftPanel.append(createTextSlot("p", "footer", "Strict JSON and JSONL supported. All data stays local.", "jti-panel-helper"));
  leftPane.append(leftPanel);

  const verticalGrip = document.createElement("div");
  verticalGrip.className = "jti-resize-grip jti-resize-grip-vertical";
  verticalGrip.dataset.grip = "vertical";
  verticalGrip.setAttribute("role", "separator");
  verticalGrip.setAttribute("aria-label", "Resize input and output panes");

  const rightPane = document.createElement("section");
  rightPane.className = "jti-pane jti-pane-right";

  const mappingPanel = document.createElement(TAGS.panel);
  mappingPanel.className = "jti-panel jti-mapping-panel";
  mappingPanel.append(createTextSlot("span", "title", "Mapping / Options"));

  const rowSourceField = document.createElement(TAGS.field);
  rowSourceField.setAttribute("orientation", "horizontal");
  rowSourceField.setAttribute("label", "Row Source");
  const rowSourceSelect = document.createElement(TAGS.select);
  rowSourceSelect.setAttribute("disabled", "");
  rowSourceSelect.append(createOption("auto", "Auto"));
  rowSourceField.append(rowSourceSelect);

  const flattenModeField = document.createElement(TAGS.field);
  flattenModeField.setAttribute("orientation", "horizontal");
  flattenModeField.setAttribute("label", "Flatten Mode");
  const flattenModeSelect = document.createElement(TAGS.select);
  flattenModeSelect.setAttribute("disabled", "");
  flattenModeSelect.append(createOption("dotPaths", "Dot paths"));
  flattenModeField.append(flattenModeSelect);

  const columnPresetField = document.createElement(TAGS.field);
  columnPresetField.setAttribute("orientation", "horizontal");
  columnPresetField.setAttribute("label", "Column Preset");
  const columnPresetSelect = document.createElement(TAGS.select);
  columnPresetSelect.append(
    createOption("failureFirst", "Failure-first"),
    createOption("coverageFirst", "Coverage-first"),
    createOption("originalOrder", "Original"),
    createOption("alphabetical", "Alphabetical")
  );
  columnPresetField.append(columnPresetSelect);

  const wrapField = document.createElement(TAGS.field);
  wrapField.setAttribute("orientation", "horizontal");
  wrapField.setAttribute("label", "Table View");
  const wrapCheckbox = document.createElement(TAGS.checkbox);
  wrapCheckbox.textContent = "Wrap cells";
  wrapField.append(wrapCheckbox);

  const densityField = document.createElement(TAGS.field);
  densityField.setAttribute("orientation", "horizontal");
  densityField.setAttribute("label", "Density");
  const densitySelect = document.createElement(TAGS.select);
  densitySelect.append(
    createOption("compact", "Compact"),
    createOption("normal", "Normal"),
    createOption("roomy", "Roomy")
  );
  densityField.append(densitySelect);

  const mappingAlert = document.createElement(TAGS.alert);
  mappingAlert.className = "jti-mapping-alert";
  mappingAlert.setAttribute("tone", "info");
  mappingAlert.textContent = "Paste data to detect a row source.";

  const detectionReasons = document.createElement("ul");
  detectionReasons.className = "jti-detection-reasons";

  mappingPanel.append(rowSourceField, flattenModeField, columnPresetField, wrapField, densityField, mappingAlert, detectionReasons);

  const horizontalGrip = document.createElement("div");
  horizontalGrip.className = "jti-resize-grip jti-resize-grip-horizontal";
  horizontalGrip.dataset.grip = "horizontal";
  horizontalGrip.setAttribute("role", "separator");
  horizontalGrip.setAttribute("aria-label", "Resize mapping and table preview panes");

  const resultPanel = document.createElement(TAGS.panel);
  resultPanel.className = "jti-panel jti-result-panel";
  resultPanel.append(createTextSlot("span", "title", "Table Preview / Results"));

  const resultToolbar = document.createElement(TAGS.toolbar);
  resultToolbar.className = "jti-result-toolbar";
  const searchField = document.createElement(TAGS.field);
  searchField.setAttribute("label", "Search");
  searchField.setAttribute("orientation", "inline");
  const searchInput = document.createElement(TAGS.input);
  searchInput.setAttribute("placeholder", "Search visible cells…");
  searchField.append(searchInput);

  const quickFilterField = document.createElement(TAGS.field);
  quickFilterField.setAttribute("label", "Filter");
  quickFilterField.setAttribute("orientation", "inline");
  const quickFilterSelect = document.createElement(TAGS.select);
  quickFilterSelect.append(
    createOption("all", "All"),
    createOption("issues", "Issues"),
    createOption("failures", "Failures"),
    createOption("warnings", "Warnings"),
    createOption("ok", "OK"),
    createOption("unknown", "Unknown")
  );
  quickFilterField.append(quickFilterSelect);

  const highlightsToggle = document.createElement(TAGS.checkbox);
  highlightsToggle.textContent = "Highlights";

  const addHighlightButton = createButton("Add Highlight", { variant: "ghost" });
  const openColumnsButton = createButton("Columns", { variant: "ghost" });

  resultToolbar.append(searchField, quickFilterField, highlightsToggle, addHighlightButton, openColumnsButton);

  const tableStatus = document.createElement(TAGS.statusLine);
  tableStatus.className = "jti-table-status";
  tableStatus.textContent = "Paste input to populate the table.";

  const diagnosticsContainer = document.createElement("section");
  diagnosticsContainer.className = "jti-diagnostics";

  const highlightControlsContainer = document.createElement("section");
  highlightControlsContainer.className = "jti-highlight-controls";

  const columnControlsContainer = document.createElement("section");
  columnControlsContainer.className = "jti-column-controls";
  columnControlsContainer.hidden = true;

  const exportControlsContainer = document.createElement("section");
  exportControlsContainer.className = "jti-export-controls";

  const tableContainer = document.createElement("section");
  tableContainer.className = "jti-table-container";

  const rowDetailsContainer = document.createElement("section");
  rowDetailsContainer.className = "jti-row-details";
  rowDetailsContainer.hidden = true;

  const performanceContainer = document.createElement("section");
  performanceContainer.className = "jti-performance";

  resultPanel.append(
    resultToolbar,
    tableStatus,
    diagnosticsContainer,
    highlightControlsContainer,
    columnControlsContainer,
    exportControlsContainer,
    tableContainer,
    rowDetailsContainer,
    performanceContainer
  );

  rightPane.append(mappingPanel, horizontalGrip, resultPanel);
  workspace.append(leftPane, verticalGrip, rightPane);
  appShell.append(workspace);

  const statusStrip = document.createElement(TAGS.statusStrip);
  statusStrip.slot = "footer";
  statusStrip.setAttribute("live", "polite");
  appShell.append(statusStrip);

  return {
    appRoot,
    appShell,
    workspace,
    leftPane,
    rightPane,
    mappingPanel,
    resultPanel,
    verticalGrip,
    horizontalGrip,
    parseButton,
    formatButton,
    clearButton,
    copyInputButton,
    copyCsvButton,
    exportButton,
    inputTextarea,
    parseAlert,
    parseMeta,
    formatInputButton,
    clearInputButton,
    copyInputInlineButton,
    copyErrorButton,
    jumpToErrorButton,
    collapseButton,
    rowSourceSelect,
    flattenModeSelect,
    columnPresetSelect,
    wrapCheckbox,
    densitySelect,
    mappingAlert,
    detectionReasons,
    searchInput,
    quickFilterSelect,
    highlightsToggle,
    addHighlightButton,
    openColumnsButton,
    tableStatus,
    diagnosticsContainer,
    highlightControlsContainer,
    columnControlsContainer,
    exportControlsContainer,
    tableContainer,
    rowDetailsContainer,
    performanceContainer,
    statusStrip,
    toolbarBadgeInput,
    toolbarBadgeRows,
    toolbarBadgeColumns,
    toolbarBadgeFailures,
    exampleButtons
  };
}
