import {
  PUBLIC_TOKENS,
  setTheme,
  TAGS,
} from "../ui_dist/bookmarklet/index.js";

import {
  businessCalendarFromUnitedStatesFederalHolidays,
  createDefaultBusinessCalendar,
  evaluateExpression,
  validateIanaTimeZone,
} from "../lib/index.js";

const STORAGE_KEY = "datecalc.demo.state.v2";
const DATA_ROOT = "./reference_data/datecalc_reference_data";

const REQUIRED_CATEGORIES = [
  "Basics",
  "Anchors",
  "Business day shifting",
  "Business day counting",
  "Time zones and places",
  "Formatting transforms",
  "Weekdays",
  "Holidays and observances",
  "Errors",
];

const FALLBACK_ZONES = ["UTC", "America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Tokyo"];

const FALLBACK_FIXTURES = {
  context: {
    timeZoneId: "America/Los_Angeles",
    now: "2026-02-08T12:00:00-08:00[America/Los_Angeles]",
  },
  tests: [
    { expr: "now + 1d", type: "ZonedDateTime", expected: "2026-02-09T12:00:00-08:00[America/Los_Angeles]" },
    { expr: "start of day", type: "ZonedDateTime", expected: "2026-02-08T00:00:00-08:00[America/Los_Angeles]" },
    { expr: "2026-02-08 + 10 business days", type: "PlainDate", expected: "2026-02-20" },
    { expr: "business days between 2026-02-08 and 2026-02-23", type: "Number", expected: 10 },
    { expr: "now in Seattle", type: "EvaluationError", expectedCode: "E_EVAL_PLACE_RESOLVER_MISSING" },
    { expr: "now as date", type: "String", expected: "2026-02-08" },
    { expr: "90 seconds as duration words", type: "String", expected: "1 minute and 30 seconds" },
    { expr: "next Tuesday", type: "PlainDate", expected: "2026-02-10" },
    { expr: "Thanksgiving 2026", type: "PlainDate", expected: "2026-11-26" },
    { expr: "02/08/2026 + 1d", type: "ParseError", expectedCode: "E_PARSE_INVALID_DATE_LITERAL" },
  ],
};

const BUILTIN_EXAMPLES = [
  { expr: "today + 2 weeks", category: "Basics" },
  { expr: "end of day now", category: "Anchors" },
  { expr: "2026-02-08 + 10 business days", category: "Business day shifting" },
  { expr: "business days between 2026-02-08 and 2026-02-23", category: "Business day counting" },
  { expr: "now in Seattle", category: "Time zones and places" },
  { expr: "now -> time", category: "Formatting transforms" },
  { expr: "now + 3 hours as relative", category: "Formatting transforms" },
  { expr: "Wednesday + 1 business day", category: "Weekdays" },
  { expr: "Monday after Thanksgiving 2026", category: "Holidays and observances" },
  { expr: "first business day after Thanksgiving 2026", category: "Holidays and observances" },
  { expr: "2026-02-08 as time", category: "Errors" },
];

const state = {
  expression: "",
  selectedExampleId: null,
  timeZoneId: "UTC",
  nowMode: "real",
  fixedNowIso: null,
  fixedNowLocal: null,
  fixedNowUserSet: false,
  businessCalendarMode: "weekday",
  resolverEnabled: false,
  developerDetails: false,
  zones: [...FALLBACK_ZONES],
  fixtureTests: [...FALLBACK_FIXTURES.tests],
  fixtureContext: { ...FALLBACK_FIXTURES.context },
  placeResolverMap: {},
  holidaysRows: [],
  lastResult: null,
  lastErrorAbsoluteSpan: null,
};

const elements = {
  timeZoneField: document.getElementById("timeZoneField"),
  timeZoneInput: document.getElementById("timeZoneInput"),
  zoneSuggestions: document.getElementById("zoneSuggestions"),
  nowModeSelect: document.getElementById("nowModeSelect"),
  calendarModeSelect: document.getElementById("calendarModeSelect"),
  resolverToggle: document.getElementById("resolverToggle"),
  developerToggle: document.getElementById("developerToggle"),
  nowMetric: document.getElementById("nowMetric"),
  fixedNowField: document.getElementById("fixedNowField"),
  fixedNowInput: document.getElementById("fixedNowInput"),
  evaluatingBadge: document.getElementById("evaluatingBadge"),
  lineBadge: document.getElementById("lineBadge"),
  expressionInput: document.getElementById("expressionInput"),
  editorHighlight: document.getElementById("editorHighlight"),
  fixtureBadge: document.getElementById("fixtureBadge"),
  idleState: document.getElementById("idleState"),
  inlineExamples: document.getElementById("inlineExamples"),
  successState: document.getElementById("successState"),
  primaryOutput: document.getElementById("primaryOutput"),
  typeBadge: document.getElementById("typeBadge"),
  zoneBadge: document.getElementById("zoneBadge"),
  secondaryOutput: document.getElementById("secondaryOutput"),
  explainPanel: document.getElementById("explainPanel"),
  explainList: document.getElementById("explainList"),
  errorState: document.getElementById("errorState"),
  errorMessageButton: document.getElementById("errorMessageButton"),
  errorCode: document.getElementById("errorCode"),
  errorLocation: document.getElementById("errorLocation"),
  errorHints: document.getElementById("errorHints"),
  examplesByCategory: document.getElementById("examplesByCategory"),
  developerSection: document.getElementById("developerSection"),
  tokensDump: document.getElementById("tokensDump"),
  astDump: document.getElementById("astDump"),
  valueDump: document.getElementById("valueDump"),
  contextDump: document.getElementById("contextDump"),
};

const debouncedEvaluate = debounce(() => runEvaluation(), 200);

init().catch((error) => {
  console.error(error);
  elements.nowMetric.setAttribute("value", "Failed");
  elements.nowMetric.setAttribute("tone", "danger");
  elements.nowMetric.setAttribute("description", "Failed to initialize demo.");
});

async function init() {
  setTheme({
    [PUBLIC_TOKENS.selectionBg]: "#1f5eae",
    [PUBLIC_TOKENS.focusRing]: "#174f9c",
    [PUBLIC_TOKENS.controlHeight]: "30px",
  });
  hydrateState();
  await loadReferenceData();
  applyInitialDefaults();
  renderZoneSuggestions();
  buildExamples();
  bindEvents();
  syncControlsFromState();
  persistState();
  runEvaluation();
}

async function loadReferenceData() {
  const [fixtures, zones, resolverMap, holidays] = await Promise.all([
    loadJson(`${DATA_ROOT}/expression_fixtures.sample.json`, FALLBACK_FIXTURES),
    loadText(`${DATA_ROOT}/iana_zones_subset.sample.txt`, FALLBACK_ZONES.join("\n")),
    loadJson(`${DATA_ROOT}/place_resolver_min.sample.json`, {}),
    loadJson(`${DATA_ROOT}/holidays_us_2026_nager.sample.json`, []),
  ]);

  state.fixtureTests = Array.isArray(fixtures.tests) && fixtures.tests.length > 0 ? fixtures.tests : FALLBACK_FIXTURES.tests;
  state.fixtureContext = fixtures.context && typeof fixtures.context === "object" ? fixtures.context : FALLBACK_FIXTURES.context;

  const zoneList = zones
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  state.zones = zoneList.length > 0 ? zoneList : FALLBACK_ZONES;

  state.placeResolverMap = resolverMap && typeof resolverMap === "object" ? resolverMap : {};
  state.holidaysRows = Array.isArray(holidays) ? holidays : [];
}

function applyInitialDefaults() {
  if (!state.fixedNowUserSet || !state.fixedNowLocal) {
    state.fixedNowLocal = dateToDateTimeLocalValue(new Date());
  }
  syncFixedNowIso();

  if (!state.timeZoneId) {
    state.timeZoneId = state.fixtureContext.timeZoneId || "UTC";
  }

  if (!state.expression) {
    state.expression = state.fixtureTests[0]?.expr || "now + 1d";
  }
}

function syncControlsFromState() {
  elements.timeZoneInput.value = state.timeZoneId;
  elements.nowModeSelect.value = state.nowMode;
  elements.fixedNowInput.value = state.fixedNowLocal;
  elements.fixedNowField.hidden = state.nowMode !== "fixed";
  elements.calendarModeSelect.value = state.businessCalendarMode;
  elements.resolverToggle.checked = state.resolverEnabled;
  elements.developerToggle.checked = state.developerDetails;
  elements.developerSection.hidden = !state.developerDetails;
  elements.expressionInput.value = state.expression;
  syncHighlightScroll();
}

function bindEvents() {
  elements.expressionInput.addEventListener("input", () => {
    state.expression = elements.expressionInput.value;

    const selected = getSelectedFixture();
    const lineInfo = getFirstNonEmptyLine(state.expression);
    if (!selected || !lineInfo || lineInfo.lineText !== selected.expr) {
      state.selectedExampleId = null;
      updateExampleSelection();
    }

    markEvaluating();
    persistState();
    debouncedEvaluate();
  });

  elements.expressionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      markEvaluating();
      requestAnimationFrame(() => runEvaluation());
    }

    if (event.key === "Escape") {
      elements.expressionInput.blur();
    }
  });

  elements.expressionInput.addEventListener("scroll", syncHighlightScroll);

  elements.timeZoneInput.addEventListener("input", () => {
    state.timeZoneId = elements.timeZoneInput.value.trim();
    validateTimeZoneInput();
    persistState();
    runEvaluation();
  });

  elements.nowModeSelect.addEventListener("change", () => {
    state.nowMode = elements.nowModeSelect.value;
    if (state.nowMode === "fixed" && !state.fixedNowLocal) {
      state.fixedNowLocal = dateToDateTimeLocalValue(new Date());
      syncFixedNowIso();
      elements.fixedNowInput.value = state.fixedNowLocal;
    }
    if (state.nowMode === "fixed") {
      state.fixedNowUserSet = true;
    }
    elements.fixedNowField.hidden = state.nowMode !== "fixed";
    persistState();
    runEvaluation();
  });

  elements.fixedNowInput.addEventListener("input", () => {
    state.fixedNowLocal = elements.fixedNowInput.value || dateToDateTimeLocalValue(new Date());
    state.fixedNowUserSet = true;
    syncFixedNowIso();
    persistState();
    if (state.nowMode === "fixed") {
      runEvaluation();
    }
  });

  elements.calendarModeSelect.addEventListener("change", () => {
    state.businessCalendarMode = elements.calendarModeSelect.value;
    persistState();
    runEvaluation();
  });

  elements.resolverToggle.addEventListener("change", () => {
    state.resolverEnabled = elements.resolverToggle.checked;
    persistState();
    runEvaluation();
  });

  elements.developerToggle.addEventListener("change", () => {
    state.developerDetails = elements.developerToggle.checked;
    elements.developerSection.hidden = !state.developerDetails;
    persistState();
    runEvaluation();
  });

  elements.errorMessageButton.addEventListener("click", () => {
    if (!state.lastErrorAbsoluteSpan) {
      return;
    }
    const index = state.lastErrorAbsoluteSpan.startIndex;
    elements.expressionInput.focus();
    elements.expressionInput.setSelectionRange(index, index);
  });
}

function runEvaluation() {
  const lineInfo = getFirstNonEmptyLine(elements.expressionInput.value);
  if (!lineInfo) {
    state.lastResult = null;
    state.lastErrorAbsoluteSpan = null;
    renderIdleState();
    renderEditorHighlight(elements.expressionInput.value, null, "");
    renderDeveloperDetails(null, null, null);
    elements.lineBadge.textContent = "Line -";
    updateNowMetric(previewNowString(buildEvaluationOptions()));
    elements.evaluatingBadge.hidden = true;
    return;
  }

  elements.lineBadge.textContent = `Line ${lineInfo.lineNumber}`;
  const context = buildEvaluationOptions();
  updateNowMetric(previewNowString(context));

  const result = evaluateExpression(lineInfo.lineText, context);
  state.lastResult = result;

  if (!result.ok) {
    const absoluteSpan = toAbsoluteSpan(result.error.span, lineInfo.startIndex);
    state.lastErrorAbsoluteSpan = absoluteSpan;
    renderEditorHighlight(elements.expressionInput.value, absoluteSpan, result.error.message);
    renderErrorState(result.error, lineInfo);
  } else {
    state.lastErrorAbsoluteSpan = null;
    renderEditorHighlight(elements.expressionInput.value, null, "");
    renderSuccessState(result, context);
  }

  updateFixtureBadge(lineInfo, result);
  renderDeveloperDetails(result, context, lineInfo);
  elements.evaluatingBadge.hidden = true;
}

function markEvaluating() {
  elements.evaluatingBadge.hidden = false;
}

function buildEvaluationOptions() {
  const zoneInput = state.timeZoneId || "UTC";

  // UI-to-library context mapping lives here so app semantics are still library-owned.
  const options = {
    timeZoneId: zoneInput,
    now: state.nowMode === "fixed" ? () => getFixedNowDate() : () => new Date(),
    businessCalendar:
      state.businessCalendarMode === "holidays"
        ? businessCalendarFromUnitedStatesFederalHolidays([2025, 2026, 2027])
        : createDefaultBusinessCalendar(),
    placeResolver: state.resolverEnabled
      ? (placeName) => {
          const key = String(placeName).trim().toLocaleLowerCase("en-US");
          return state.placeResolverMap[key]?.tzid || null;
        }
      : undefined,
  };

  validateTimeZoneInput();
  return options;
}

function previewNowString(context) {
  const probe = evaluateExpression("now as iso", context);
  if (!probe.ok) {
    return `Error: ${probe.error.code}`;
  }
  return probe.formatted || String(probe.value);
}

function updateNowMetric(value) {
  elements.nowMetric.setAttribute("value", compactNowValue(value));
  elements.nowMetric.setAttribute("tone", value.startsWith("Error:") ? "danger" : "info");
  elements.nowMetric.setAttribute(
    "description",
    value.startsWith("Error:")
      ? "Context cannot be evaluated"
      : `${state.nowMode === "fixed" ? "Fixed local date" : "Real browser clock"}: ${value}`,
  );
}

function compactNowValue(value) {
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?[+-]\d{2}:\d{2}\[([^\]]+)\]$/);
  if (!match) {
    return value;
  }
  return `${match[1]} ${match[2]} ${match[3]}`;
}

function syncFixedNowIso() {
  const fixedDate = getFixedNowDate();
  state.fixedNowIso = Number.isNaN(fixedDate.getTime()) ? new Date().toISOString() : fixedDate.toISOString();
}

function getFixedNowDate() {
  const date = state.fixedNowLocal ? new Date(state.fixedNowLocal) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function dateToDateTimeLocalValue(date) {
  const validDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const offsetMs = validDate.getTimezoneOffset() * 60 * 1000;
  return new Date(validDate.getTime() - offsetMs).toISOString().slice(0, 16);
}

function validateTimeZoneInput() {
  const zone = state.timeZoneId || "";
  if (!zone) {
    elements.timeZoneField.removeAttribute("error");
    elements.timeZoneField.setAttribute("help", "");
    return;
  }

  if (validateIanaTimeZone(zone)) {
    elements.timeZoneField.removeAttribute("error");
    elements.timeZoneField.setAttribute("help", "Valid IANA zone id.");
    return;
  }

  elements.timeZoneField.setAttribute("error", "Invalid IANA zone id. Editing stays enabled.");
}

function renderIdleState() {
  elements.idleState.hidden = false;
  elements.successState.hidden = true;
  elements.errorState.hidden = true;
  elements.fixtureBadge.textContent = "Custom input";
  elements.fixtureBadge.className = "system-badge";
}

function renderSuccessState(result, context) {
  elements.idleState.hidden = true;
  elements.successState.hidden = false;
  elements.errorState.hidden = true;

  elements.primaryOutput.textContent = result.formatted;
  elements.typeBadge.textContent = result.valueType;
  elements.zoneBadge.textContent = `Zone: ${context.timeZoneId}`;
  elements.secondaryOutput.textContent =
    `Evaluated with ${state.nowMode === "fixed" ? "Fixed now" : "Real now"} in ${context.timeZoneId}.`;

  const explainSteps = buildExplainSteps(result.ast, context.timeZoneId);
  elements.explainList.innerHTML = "";
  if (explainSteps.length > 0) {
    for (const step of explainSteps) {
      const item = document.createElement(TAGS.statusLine);
      item.setAttribute("compact", "");
      item.setAttribute("tone", "info");
      item.textContent = step;
      elements.explainList.append(item);
    }
    elements.explainPanel.hidden = false;
  } else {
    elements.explainPanel.hidden = true;
  }
}

function renderErrorState(error, lineInfo) {
  elements.idleState.hidden = true;
  elements.successState.hidden = true;
  elements.errorState.hidden = false;

  const globalLocation = mapLineColumn(error.lineColumn, lineInfo.lineNumber);
  elements.errorMessageButton.textContent = error.message;
  elements.errorCode.textContent = error.code;
  elements.errorLocation.textContent = `${globalLocation.startLine}:${globalLocation.startColumn} - ${globalLocation.endLine}:${globalLocation.endColumn}`;
  elements.errorHints.innerHTML = "";

  for (const hint of error.hints || []) {
    const item = document.createElement(TAGS.statusLine);
    item.setAttribute("tone", "warning");
    item.setAttribute("compact", "");
    item.textContent = hint;
    elements.errorHints.append(item);
  }
}

function updateFixtureBadge(lineInfo, result) {
  const selected = getSelectedFixture();
  if (!selected || lineInfo.lineText !== selected.expr) {
    elements.fixtureBadge.textContent = "Custom input";
    elements.fixtureBadge.className = "system-badge";
    return;
  }

  const matches = selected.type.includes("Error")
    ? !result.ok && result.error.code === selected.expectedCode
    : result.ok && selected.type === result.valueType && compareExpectedValue(selected.expected, result.formatted, result.value);

  elements.fixtureBadge.textContent = matches ? "Matches fixture" : "Differs from fixture";
  elements.fixtureBadge.className = matches ? "system-badge success" : "system-badge warning";
}

function compareExpectedValue(expected, formatted, rawValue) {
  if (typeof expected === "number") {
    return Number(rawValue) === expected;
  }
  if (typeof expected === "string") {
    return formatted === expected;
  }
  return false;
}

function renderEditorHighlight(text, span, errorMessage) {
  // Span highlighting is rendered directly from library offsets to avoid UI-side interpretation.
  if (!span) {
    elements.editorHighlight.textContent = text + (text.endsWith("\n") ? "" : "\n");
    syncHighlightScroll();
    return;
  }

  const start = clamp(span.startIndex, 0, text.length);
  const end = clamp(span.endIndex, start, text.length);
  const before = escapeHtml(text.slice(0, start));
  const middle = escapeHtml(text.slice(start, end));
  const after = escapeHtml(text.slice(end));
  const title = escapeHtml(errorMessage || "Error");

  if (start === end) {
    elements.editorHighlight.innerHTML = `${before}<span class="error-caret" title="${title}"></span>${after}\n`;
  } else {
    elements.editorHighlight.innerHTML = `${before}<span class="error-span" title="${title}">${middle}</span>${after}\n`;
  }

  syncHighlightScroll();
}

function syncHighlightScroll() {
  elements.editorHighlight.scrollTop = elements.expressionInput.scrollTop;
  elements.editorHighlight.scrollLeft = elements.expressionInput.scrollLeft;
}

function renderDeveloperDetails(result, context, lineInfo) {
  if (!state.developerDetails) {
    return;
  }

  // Developer mode is a raw library-output view for traceability (tokens, AST, value, context).
  elements.tokensDump.textContent = toPrettyJson(result?.diagnostics?.tokens || []);
  elements.astDump.textContent = toPrettyJson(result?.ast || null);
  elements.valueDump.textContent = toPrettyJson(
    result
      ? {
          ok: result.ok,
          valueType: result.ok ? result.valueType : null,
          formatted: result.ok ? result.formatted : null,
          value: result.ok ? result.value : null,
          error: result.ok ? null : result.error,
        }
      : null,
  );

  elements.contextDump.textContent = toPrettyJson({
    lineEvaluated: lineInfo?.lineNumber || null,
    timeZoneId: context?.timeZoneId || state.timeZoneId,
    nowMode: state.nowMode,
    fixedNowIso: state.fixedNowIso,
    fixedNowLocal: state.fixedNowLocal,
    fixedNowUserSet: state.fixedNowUserSet,
    businessCalendarMode: state.businessCalendarMode,
    placeResolverEnabled: state.resolverEnabled,
  });
}

function buildExamples() {
  const fixtureExamples = state.fixtureTests.map((item, index) => ({
    id: `fixture-${index}`,
    expr: item.expr,
    category: categorizeExpression(item.expr, item.type),
    fixture: item,
  }));

  const knownExpressions = new Set(fixtureExamples.map((example) => example.expr));
  const merged = [...fixtureExamples];

  for (const example of BUILTIN_EXAMPLES) {
    if (!knownExpressions.has(example.expr)) {
      merged.push({ id: `builtin-${merged.length}`, expr: example.expr, category: example.category, fixture: null });
      knownExpressions.add(example.expr);
    }
  }

  const grouped = new Map();
  for (const category of REQUIRED_CATEGORIES) {
    grouped.set(category, []);
  }

  for (const example of merged) {
    if (!grouped.has(example.category)) {
      grouped.set(example.category, []);
    }
    grouped.get(example.category).push(example);
  }

  elements.examplesByCategory.innerHTML = "";
  for (const [category, entries] of grouped.entries()) {
    const wrapper = document.createElement(TAGS.tabPanel);
    wrapper.setAttribute("label", category);
    if (elements.examplesByCategory.children.length === 0) {
      wrapper.setAttribute("selected", "");
    }

    const list = document.createElement(TAGS.list);
    list.className = "example-list";
    list.setAttribute("empty-text", "No examples in this category");

    for (const entry of entries) {
      const item = document.createElement(TAGS.listItem);
      item.setAttribute("interactive", "");
      item.dataset.exampleId = entry.id;
      item.toggleAttribute("selected", entry.id === state.selectedExampleId);

      const title = document.createElement("span");
      title.slot = "title";
      title.className = "example-code";
      title.textContent = entry.expr;

      const meta = document.createElement("span");
      meta.slot = "meta";
      meta.textContent = entry.fixture ? `Fixture: ${entry.fixture.type}` : "Built-in example";

      item.append(title, meta);
      item.addEventListener("awwbookmarklet-list-item-activate", () => selectExample(entry));
      list.append(item);
    }

    wrapper.append(list);
    elements.examplesByCategory.append(wrapper);
  }

  const quickExamples = merged.slice(0, 4);
  elements.inlineExamples.innerHTML = "";
  for (const entry of quickExamples) {
    const button = document.createElement(TAGS.button);
    button.textContent = entry.expr;
    button.addEventListener("click", () => selectExample(entry));
    elements.inlineExamples.append(button);
  }

  state.exampleIndex = merged;
}

function selectExample(example) {
  state.selectedExampleId = example.id;
  state.expression = example.expr;
  elements.expressionInput.value = example.expr;
  elements.expressionInput.focus();
  persistState();
  updateExampleSelection();
  runEvaluation();
}

function updateExampleSelection() {
  const items = elements.examplesByCategory.querySelectorAll(`${TAGS.listItem}[data-example-id]`);
  for (const item of items) {
    item.toggleAttribute("selected", item.dataset.exampleId === state.selectedExampleId);
  }
}

function getSelectedFixture() {
  if (!state.selectedExampleId || !state.exampleIndex) {
    return null;
  }

  const entry = state.exampleIndex.find((example) => example.id === state.selectedExampleId);
  return entry?.fixture || null;
}

function categorizeExpression(expr, type) {
  const text = String(expr).toLocaleLowerCase("en-US");

  if (type?.includes("Error") || text.includes("/") || text.includes("bananas") || text.includes(" as time")) {
    return "Errors";
  }
  if (text.startsWith("start of day") || text.startsWith("end of day") || text.startsWith("startofday")) {
    return "Anchors";
  }
  if (text.startsWith("business days between")) {
    return "Business day counting";
  }
  if (text.includes("business day")) {
    return "Business day shifting";
  }
  if (text.includes(" in ")) {
    return "Time zones and places";
  }
  if (text.includes(" as ") || text.includes("->")) {
    return "Formatting transforms";
  }
  if (
    text.includes("thanksgiving") ||
    text.includes("holiday") ||
    text.includes("observance") ||
    text.includes("easter") ||
    text.includes("christmas") ||
    text.includes("memorial day")
  ) {
    return "Holidays and observances";
  }
  if (/\b(next|last|this)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(text)) {
    return "Weekdays";
  }
  return "Basics";
}

function buildExplainSteps(ast, timeZoneId) {
  const steps = [];

  function walk(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (node.type === "Keyword" && node.name === "now") {
      steps.push(`now evaluated in ${timeZoneId}`);
    }

    if (node.type === "AnchorExpression") {
      steps.push(`applied ${node.anchorName} anchor`);
      walk(node.argument);
      return;
    }

    if (node.type === "BinaryExpression" && node.right?.type === "DurationLiteral") {
      const verb = node.operator === "+" ? "added" : "subtracted";
      steps.push(`${verb} ${node.right.amount} ${node.right.unit}`);
    }

    if (node.type === "BusinessDaysBetween") {
      steps.push("counted business days in the half-open range [start, end)");
    }

    if (node.type === "InModifier") {
      steps.push(`applied zone/place modifier: ${node.zoneOrPlace}`);
    }

    if (node.type === "TransformModifier") {
      steps.push(`formatted result as ${node.transformName}`);
    }

    if (node.type === "WeekdayExpression") {
      steps.push(`resolved ${node.direction} ${node.weekdayName}`);
    }

    if (node.type === "HolidayExpression") {
      steps.push(`resolved ${node.mode} holiday/observance: ${node.holidayName}`);
    }

    if (node.type === "HolidaySearchExpression") {
      steps.push(`searched ${node.direction} ${node.category}`);
    }

    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) {
        for (const entry of value) {
          walk(entry);
        }
      } else if (value && typeof value === "object" && "type" in value) {
        walk(value);
      }
    }
  }

  walk(ast);
  return Array.from(new Set(steps));
}

function getFirstNonEmptyLine(text) {
  const lines = String(text).split(/\n/);
  let offset = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().length > 0) {
      return {
        lineText: line,
        lineNumber: i + 1,
        startIndex: offset,
      };
    }
    offset += line.length + 1;
  }

  return null;
}

function toAbsoluteSpan(span, lineStart) {
  return {
    startIndex: lineStart + (span?.startIndex || 0),
    endIndex: lineStart + (span?.endIndex || 0),
  };
}

function mapLineColumn(lineColumn, evaluatedLineNumber) {
  return {
    startLine: evaluatedLineNumber + lineColumn.startLine - 1,
    startColumn: lineColumn.startColumn,
    endLine: evaluatedLineNumber + lineColumn.endLine - 1,
    endColumn: lineColumn.endColumn,
  };
}

function renderZoneSuggestions() {
  elements.zoneSuggestions.innerHTML = "";
  for (const zone of state.zones) {
    const option = document.createElement("option");
    option.value = zone;
    elements.zoneSuggestions.append(option);
  }
}

function hydrateState() {
  try {
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.timeZoneId = typeof persisted.timeZoneId === "string" ? persisted.timeZoneId : state.timeZoneId;
    state.nowMode = persisted.nowMode === "fixed" ? "fixed" : "real";
    state.businessCalendarMode = persisted.businessCalendarMode === "holidays" ? "holidays" : "weekday";
    state.resolverEnabled = Boolean(persisted.resolverEnabled);
    state.developerDetails = Boolean(persisted.developerDetails);
    state.expression = typeof persisted.expression === "string" ? persisted.expression : state.expression;
    state.selectedExampleId = typeof persisted.selectedExampleId === "string" ? persisted.selectedExampleId : null;
    state.fixedNowLocal = typeof persisted.fixedNowLocal === "string" ? persisted.fixedNowLocal : null;
    if (!state.fixedNowLocal && typeof persisted.fixedNowIso === "string") {
      state.fixedNowLocal = dateToDateTimeLocalValue(new Date(persisted.fixedNowIso));
    }
    state.fixedNowUserSet = Boolean(persisted.fixedNowUserSet);
  } catch {
    // Ignore malformed localStorage payloads.
  }
}

function persistState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        timeZoneId: state.timeZoneId,
        nowMode: state.nowMode,
        businessCalendarMode: state.businessCalendarMode,
        resolverEnabled: state.resolverEnabled,
        developerDetails: state.developerDetails,
        expression: state.expression,
        selectedExampleId: state.selectedExampleId,
        fixedNowIso: state.fixedNowIso,
        fixedNowLocal: state.fixedNowLocal,
        fixedNowUserSet: state.fixedNowUserSet,
      }),
    );
  } catch {
    // Ignore storage errors in locked-down browser environments.
  }
}

async function loadJson(url, fallback) {
  try {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) {
      return fallback;
    }
    return await response.json();
  } catch {
    return fallback;
  }
}

async function loadText(url, fallback) {
  try {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) {
      return fallback;
    }
    return await response.text();
  } catch {
    return fallback;
  }
}

function debounce(fn, waitMs) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), waitMs);
  };
}

function toPrettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
