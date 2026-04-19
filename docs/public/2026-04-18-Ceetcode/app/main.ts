import { EditorState } from "@codemirror/state";
import { cpp } from "@codemirror/lang-cpp";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, foldGutter, indentOnInput } from "@codemirror/language";
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { marked } from "marked";
import { parseCustomTests } from "../runtime/custom-tests";
import { parseHarnessOutput, stripAnsi } from "../runtime/harness/parse-harness-output";
import {
  createLogger,
  getLoggingSettings,
  loggingFormatterNames,
  loggingLevels,
  subscribeLoggingSettings,
  updateLoggingSettings,
  type LoggingFormatterName,
  type LoggingLevel
} from "../runtime/logging";
import { loadProblemCatalog } from "../runtime/problem-catalog";
import { clearDraft, loadCustomTests, loadDraft, loadSelectedProblemId, saveCustomTests, saveDraft, saveSelectedProblemId } from "../runtime/storage";
import { WorkerCompilerClient, type WorkerClientErrorEvent } from "../runtime/compiler/worker-client";
import { c99SupportMatrix, type CompileDiagnostic, type ProblemDefinition, type TestCase } from "../runtime/types";

interface RunState {
  status: "idle" | "running" | "success" | "failure";
  phase: "none" | "compile" | "runtime" | "tests";
  message: string;
}

interface LatestRunView {
  diagnostics: CompileDiagnostic[];
  compileLog: string;
  runtimeLog: string;
  consoleOutput: string;
  summaryText: string;
  testsHtml: string;
}

interface AppUnhandledError {
  id: number;
  source: string;
  message: string;
  timestamp: number;
  details?: string;
  stack?: string;
}

const problems = loadProblemCatalog();
const problemById = new Map(problems.map((problem) => [problem.id, problem]));

const appLog = createLogger("App", "Lifecycle");
const uiLog = createLogger("UI", "Interaction");
const runLog = createLogger("Run", "Submission");
const settingsLog = createLogger("Settings", "Logging");
const unhandledLog = createLogger("Runtime", "Unhandled");

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) {
  throw new Error("Missing #app root element.");
}

function requiredElement<T extends Element>(value: T | null, selector: string): T {
  if (!value) {
    throw new Error(`Missing required DOM element: ${selector}`);
  }
  return value;
}

const initialProblem = (() => {
  const storedId = loadSelectedProblemId();
  if (storedId && problemById.has(storedId)) {
    return problemById.get(storedId) as ProblemDefinition;
  }
  return problems[0];
})();

let unhandledErrors: AppUnhandledError[] = [];
let nextUnhandledErrorId = 1;
let unregisterUnhandledCapture: (() => void) | null = null;
const maxUnhandledErrors = 200;

function normalizeErrorText(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value instanceof Error && value.message.trim()) return value.message.trim();
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value || "Unknown error");
}

const compilerClient = new WorkerCompilerClient({
  onError: (event: WorkerClientErrorEvent) => {
    runLog.warn("Worker client reported an error", {
      subcategory: "Worker",
      context: { source: event.source, message: event.message }
    });
    recordUnhandledError(event.source, event.message);
  }
});
const mobileView = window.matchMedia("(max-width: 1100px)").matches ? "problem" : "editor";

document.body.dataset.mobileView = mobileView;
appLog.info("Bootstrap starting", {
  context: {
    problemCount: problems.length,
    initialProblemId: initialProblem.id,
    mobileView
  }
});

appRoot.innerHTML = `
  <details id="error-panel" class="error-panel" data-testid="error-panel">
    <summary id="error-panel-summary" class="error-panel-summary" data-testid="error-panel-summary">
      <span class="error-panel-title">Unhandled Errors</span>
      <span id="error-panel-count" class="error-panel-count mono" data-testid="error-panel-count">0</span>
      <button id="error-panel-clear" class="error-panel-clear" type="button" data-testid="error-panel-clear">Clear</button>
    </summary>
    <div id="error-panel-list" class="error-panel-list" data-testid="error-panel-list"></div>
  </details>

  <main class="shell">
    <section class="topbar" aria-label="workspace controls">
      <h1>Ceetcode</h1>
      <span class="mono">C99 browser runtime</span>
      <span class="spacer"></span>
      <div class="tabs" role="tablist" aria-label="Mobile views">
        <button class="tab-button" data-mobile-target="problem" type="button">Problem</button>
        <button class="tab-button" data-mobile-target="editor" type="button">Code</button>
      </div>
      <label>
        Problem
        <select id="problem-select" data-testid="problem-select"></select>
      </label>
      <button id="run-btn" class="primary" type="button" data-testid="run-button">Run</button>
      <button id="reset-btn" type="button" data-testid="reset-button">Reset To Starter</button>
      <button id="settings-btn" type="button" data-testid="settings-button">Settings</button>
      <span id="run-status" class="status-badge status-idle" data-testid="run-status">Idle</span>
    </section>

    <section class="workspace" data-testid="workspace">
      <article class="panel problem-panel" data-testid="problem-panel">
        <header class="problem-header">
          <h2 id="problem-title"></h2>
          <div id="problem-meta" class="problem-meta"></div>
          <div class="signature" id="problem-signature"></div>
        </header>
        <div class="problem-content" id="problem-content"></div>
      </article>

      <article class="panel editor-panel" data-testid="editor-panel">
        <header class="editor-toolbar">
          <span class="mono" id="active-problem-id"></span>
          <span class="spacer"></span>
          <span class="mono" data-testid="shortcut-hint">Run: Ctrl/Cmd+Enter</span>
        </header>
        <div id="editor-host" class="editor-host" data-testid="editor"></div>

        <section class="custom-tests">
          <label for="custom-tests-input"><strong>Custom Tests (JSON)</strong></label>
          <textarea id="custom-tests-input" data-testid="custom-tests-input"></textarea>
          <div class="result-row">Each item: { "name", "input", "expected" }.</div>
        </section>

        <section class="results" data-testid="results-root">
          <div class="results-grid">
            <div class="results-panel">
              <h3>Test Results</h3>
              <div id="summary-text" data-testid="summary-text">No run yet.</div>
              <div id="tests-list" data-testid="tests-list"></div>
            </div>
            <div class="results-panel">
              <h3>Output</h3>
              <div id="diagnostics" data-testid="diagnostics"></div>
              <h4>stdout</h4>
              <pre id="stdout-output" class="output-block" data-testid="stdout-output"></pre>
              <h4>stderr</h4>
              <pre id="stderr-output" class="output-block" data-testid="stderr-output"></pre>
            </div>
          </div>
          <div class="results-panel">
            <details>
              <summary>Compile log</summary>
              <pre id="compile-log" class="output-block" data-testid="compile-log"></pre>
            </details>
            <details>
              <summary>Runtime log</summary>
              <pre id="runtime-log" class="output-block" data-testid="runtime-log"></pre>
            </details>
          </div>
        </section>
      </article>
    </section>
  </main>

  <dialog id="settings-dialog" class="settings-dialog" data-testid="settings-dialog">
    <div class="settings-dialog-body">
      <header class="settings-dialog-header">
        <h2>Settings</h2>
        <button id="settings-close-btn" type="button" data-testid="settings-close-button">Close</button>
      </header>

      <section class="settings-section">
        <h3>Logging</h3>
        <p class="result-row">Control console tracing visibility and rendering style. Changes apply immediately and persist.</p>

        <label>
          Visible level
          <select id="logging-level-select" data-testid="logging-level-select">
            <option value="error">Errors only</option>
            <option value="warn">Warnings + errors</option>
            <option value="info">Info + warnings + errors</option>
          </select>
        </label>

        <label>
          Formatter
          <select id="logging-formatter-select" data-testid="logging-formatter-select">
            <option value="segments">Styled segments</option>
            <option value="emoji">Emoji labels</option>
            <option value="plain">Plain text</option>
          </select>
        </label>

        <label class="settings-inline-toggle">
          <input id="logging-emoji-toggle" data-testid="logging-emoji-toggle" type="checkbox" />
          Show decorative category emoji
        </label>

        <label class="settings-inline-toggle">
          <input id="logging-background-toggle" data-testid="logging-background-toggle" type="checkbox" />
          Use styled label backgrounds
        </label>
      </section>
    </div>
  </dialog>
`;

const problemSelect = requiredElement(document.querySelector<HTMLSelectElement>("#problem-select"), "#problem-select");
const problemTitle = requiredElement(document.querySelector<HTMLElement>("#problem-title"), "#problem-title");
const problemMeta = requiredElement(document.querySelector<HTMLElement>("#problem-meta"), "#problem-meta");
const problemSignature = requiredElement(document.querySelector<HTMLElement>("#problem-signature"), "#problem-signature");
const problemContent = requiredElement(document.querySelector<HTMLElement>("#problem-content"), "#problem-content");
const activeProblemIdEl = requiredElement(document.querySelector<HTMLElement>("#active-problem-id"), "#active-problem-id");
const runBtn = requiredElement(document.querySelector<HTMLButtonElement>("#run-btn"), "#run-btn");
const resetBtn = requiredElement(document.querySelector<HTMLButtonElement>("#reset-btn"), "#reset-btn");
const settingsBtn = requiredElement(document.querySelector<HTMLButtonElement>("#settings-btn"), "#settings-btn");
const runStatusEl = requiredElement(document.querySelector<HTMLElement>("#run-status"), "#run-status");
const customTestsInput = requiredElement(
  document.querySelector<HTMLTextAreaElement>("#custom-tests-input"),
  "#custom-tests-input"
);
const diagnosticsEl = requiredElement(document.querySelector<HTMLElement>("#diagnostics"), "#diagnostics");
const summaryText = requiredElement(document.querySelector<HTMLElement>("#summary-text"), "#summary-text");
const testsList = requiredElement(document.querySelector<HTMLElement>("#tests-list"), "#tests-list");
const stdoutOutput = requiredElement(document.querySelector<HTMLElement>("#stdout-output"), "#stdout-output");
const stderrOutput = requiredElement(document.querySelector<HTMLElement>("#stderr-output"), "#stderr-output");
const compileLogEl = requiredElement(document.querySelector<HTMLElement>("#compile-log"), "#compile-log");
const runtimeLogEl = requiredElement(document.querySelector<HTMLElement>("#runtime-log"), "#runtime-log");
const errorPanel = requiredElement(document.querySelector<HTMLDetailsElement>("#error-panel"), "#error-panel");
const errorPanelCountEl = requiredElement(document.querySelector<HTMLElement>("#error-panel-count"), "#error-panel-count");
const errorPanelListEl = requiredElement(document.querySelector<HTMLElement>("#error-panel-list"), "#error-panel-list");
const errorPanelClearBtn = requiredElement(
  document.querySelector<HTMLButtonElement>("#error-panel-clear"),
  "#error-panel-clear"
);
const settingsDialog = requiredElement(document.querySelector<HTMLDialogElement>("#settings-dialog"), "#settings-dialog");
const settingsCloseBtn = requiredElement(
  document.querySelector<HTMLButtonElement>("#settings-close-btn"),
  "#settings-close-btn"
);
const loggingLevelSelect = requiredElement(
  document.querySelector<HTMLSelectElement>("#logging-level-select"),
  "#logging-level-select"
);
const loggingFormatterSelect = requiredElement(
  document.querySelector<HTMLSelectElement>("#logging-formatter-select"),
  "#logging-formatter-select"
);
const loggingEmojiToggle = requiredElement(
  document.querySelector<HTMLInputElement>("#logging-emoji-toggle"),
  "#logging-emoji-toggle"
);
const loggingBackgroundToggle = requiredElement(
  document.querySelector<HTMLInputElement>("#logging-background-toggle"),
  "#logging-background-toggle"
);

let activeProblem = initialProblem;
let runState: RunState = {
  status: "idle",
  phase: "none",
  message: "Idle"
};

let latestRun: LatestRunView = {
  diagnostics: [],
  compileLog: "",
  runtimeLog: "",
  consoleOutput: "",
  summaryText: "No run yet.",
  testsHtml: ""
};

let editor: EditorView;
let draftSaveTimer: ReturnType<typeof setTimeout> | null = null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatErrorTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour12: false });
}

function isLoggingLevelValue(value: string): value is LoggingLevel {
  return (loggingLevels as readonly string[]).includes(value);
}

function isLoggingFormatterValue(value: string): value is LoggingFormatterName {
  return (loggingFormatterNames as readonly string[]).includes(value);
}

function syncLoggingControlValues(): void {
  const current = getLoggingSettings();
  loggingLevelSelect.value = current.level;
  loggingFormatterSelect.value = current.formatter;
  loggingEmojiToggle.checked = current.useDecorativeEmoji;
  loggingBackgroundToggle.checked = current.useLabelBackgrounds;
}

function renderUnhandledErrors(): void {
  errorPanelCountEl.textContent = String(unhandledErrors.length);
  errorPanel.dataset.hasErrors = unhandledErrors.length > 0 ? "true" : "false";

  if (unhandledErrors.length === 0) {
    errorPanelListEl.innerHTML = "<div class='result-row'>No unhandled errors captured.</div>";
    return;
  }

  const html = [...unhandledErrors]
    .reverse()
    .map((entry) => {
      const detailsBlocks: string[] = [];
      if (entry.details) {
        detailsBlocks.push(`<div class="result-row">Details: <span class="mono">${escapeHtml(entry.details)}</span></div>`);
      }
      if (entry.stack) {
        detailsBlocks.push(`<pre class="output-block error-panel-stack">${escapeHtml(entry.stack)}</pre>`);
      }

      return `<article class="error-panel-item">
        <div class="error-panel-item-header">
          <strong>${escapeHtml(entry.message)}</strong>
        </div>
        <div class="result-row">Source: <span class="mono">${escapeHtml(entry.source)}</span> • ${escapeHtml(
          formatErrorTimestamp(entry.timestamp)
        )}</div>
        ${detailsBlocks.join("")}
      </article>`;
    })
    .join("");

  errorPanelListEl.innerHTML = html;
}

function recordUnhandledError(source: string, message: string, options: { details?: string; stack?: string } = {}): void {
  const normalizedMessage = normalizeErrorText(message);
  const normalizedSource = normalizeErrorText(source);
  const normalizedDetails = options.details ? normalizeErrorText(options.details) : undefined;
  const normalizedStack = options.stack ? normalizeErrorText(options.stack) : undefined;

  const last = unhandledErrors[unhandledErrors.length - 1];
  if (last && last.source === normalizedSource && last.message === normalizedMessage && Date.now() - last.timestamp < 900) {
    return;
  }

  unhandledErrors.push({
    id: nextUnhandledErrorId,
    source: normalizedSource,
    message: normalizedMessage,
    timestamp: Date.now(),
    details: normalizedDetails,
    stack: normalizedStack
  });

  nextUnhandledErrorId += 1;
  if (unhandledErrors.length > maxUnhandledErrors) {
    unhandledErrors = unhandledErrors.slice(unhandledErrors.length - maxUnhandledErrors);
  }

  unhandledLog.error("Unhandled error captured", {
    subcategory: source,
    context: {
      message: normalizedMessage,
      details: normalizedDetails,
      hasStack: Boolean(normalizedStack),
      count: unhandledErrors.length
    }
  });
  renderUnhandledErrors();
}

function clearUnhandledErrors(): void {
  unhandledErrors = [];
  unhandledLog.warn("Unhandled error panel cleared", {
    context: { remaining: unhandledErrors.length }
  });
  renderUnhandledErrors();
}

function registerUnhandledErrorCapture(): () => void {
  unhandledLog.info("Registering global unhandled-error capture hooks");
  const onWindowError = (event: Event): void => {
    if (event instanceof ErrorEvent) {
      const location = event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined;
      recordUnhandledError("window", event.message || "Unhandled window error", {
        details: location,
        stack: event.error instanceof Error ? event.error.stack : undefined
      });
      return;
    }

    const target = event.target;
    if (target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement) {
      const targetUrl =
        target instanceof HTMLLinkElement
          ? target.href || "(unknown)"
          : target.src || "(unknown)";
      recordUnhandledError("network", `Resource failed to load: ${targetUrl}`);
    }
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const reason = event.reason;
    recordUnhandledError("promise", normalizeErrorText(reason), {
      stack: reason instanceof Error ? reason.stack : undefined
    });
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = (async (...args: Parameters<typeof fetch>) => {
    try {
      return await originalFetch(...args);
    } catch (error) {
      const requestTarget = args[0];
      const targetText =
        typeof requestTarget === "string"
          ? requestTarget
          : requestTarget instanceof URL
            ? requestTarget.toString()
            : requestTarget instanceof Request
              ? requestTarget.url
              : "(unknown request)";
      recordUnhandledError("network", `Fetch request failed: ${targetText}`, {
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }) as typeof window.fetch;

  window.addEventListener("error", onWindowError, true);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  return () => {
    window.removeEventListener("error", onWindowError, true);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    window.fetch = originalFetch;
    unhandledLog.info("Unregistered global unhandled-error capture hooks");
  };
}

function setStatus(status: RunState["status"], phase: RunState["phase"], message: string): void {
  if (runState.status !== status || runState.phase !== phase || runState.message !== message) {
    runLog.info("Run status updated", {
      subcategory: "Status",
      context: { status, phase, message }
    });
  }
  runState = { status, phase, message };
  runStatusEl.textContent = message;
  runStatusEl.className = `status-badge status-${status}`;
  runBtn.disabled = status === "running";
  resetBtn.disabled = status === "running";
}

function renderDiagnostics(diagnostics: CompileDiagnostic[]): void {
  latestRun.diagnostics = diagnostics;
  if (diagnostics.length === 0) {
    diagnosticsEl.innerHTML = "<div class='result-row'>No compile diagnostics.</div>";
    return;
  }

  diagnosticsEl.innerHTML = `<div class="diagnostics">${diagnostics
    .map(
      (diag) =>
        `<div><strong>${escapeHtml(diag.severity.toUpperCase())}</strong> ${escapeHtml(diag.file)}:${diag.line}:${diag.column} - ${escapeHtml(diag.message)}</div>`
    )
    .join("")}</div>`;
}

function renderLatestRun(): void {
  summaryText.textContent = latestRun.summaryText;
  testsList.innerHTML = latestRun.testsHtml;
  stdoutOutput.textContent = latestRun.consoleOutput || "(no stdout)";
  stderrOutput.textContent = "(stderr channel not exposed by current runtime adapter)";
  compileLogEl.textContent = stripAnsi(latestRun.compileLog) || "(no compile log)";
  runtimeLogEl.textContent = stripAnsi(latestRun.runtimeLog) || "(no runtime log)";
}

function renderProblem(problem: ProblemDefinition): void {
  uiLog.info("Rendering problem content", {
    subcategory: "Problem",
    context: { problemId: problem.id, title: problem.title, visibleTests: problem.visibleTests.length }
  });
  problemTitle.textContent = problem.title;
  problemMeta.textContent = `${problem.difficulty} • ${problem.summary}`;
  problemSignature.textContent = problem.signature.declaration;
  activeProblemIdEl.textContent = `problem: ${problem.id}`;

  const supportRows = c99SupportMatrix
    .map((item) => `<tr><td class='mono'>${escapeHtml(item.header)}</td><td>${escapeHtml(item.status)}</td><td>${escapeHtml(item.notes)}</td></tr>`)
    .join("");

  const visibleTests = problem.visibleTests
    .map((test) => {
      return `<li><strong>${escapeHtml(test.name)}</strong> input=<code>${escapeHtml(JSON.stringify(test.input))}</code> expected=<code>${escapeHtml(
        JSON.stringify(test.expected)
      )}</code></li>`;
    })
    .join("");

  problemContent.innerHTML = `
    <section>
      <h3>Statement</h3>
      ${marked.parse(problem.statementMarkdown) as string}
    </section>
    <section>
      <h3>Examples</h3>
      ${marked.parse(problem.examplesMarkdown) as string}
    </section>
    <section>
      <h3>Constraints</h3>
      ${marked.parse(problem.constraintsMarkdown) as string}
    </section>
    <section>
      <h3>Visible Tests</h3>
      <ul>${visibleTests}</ul>
    </section>
    <section>
      <h3>C99 Runtime Support Matrix</h3>
      <table>
        <thead><tr><th>Header</th><th>Status</th><th>Notes</th></tr></thead>
        <tbody>${supportRows}</tbody>
      </table>
    </section>
  `;
}

function readEditor(): string {
  return editor.state.doc.toString();
}

function writeEditor(value: string): void {
  const transaction = editor.state.update({
    changes: { from: 0, to: editor.state.doc.length, insert: value }
  });
  editor.dispatch(transaction);
}

function scheduleDraftSave(): void {
  if (draftSaveTimer !== null) {
    clearTimeout(draftSaveTimer);
  }

  draftSaveTimer = setTimeout(() => {
    saveDraft(activeProblem.id, readEditor());
  }, 250);
}

function setEditorForProblem(problem: ProblemDefinition): void {
  const draft = loadDraft(problem.id);
  writeEditor(draft ?? problem.starterCode);
  const custom = loadCustomTests(problem.id);
  customTestsInput.value = custom ?? problem.defaultCustomTestsJson;
  uiLog.info("Editor state loaded for problem", {
    subcategory: "Problem",
    context: {
      problemId: problem.id,
      restoredDraft: draft !== null,
      restoredCustomTests: custom !== null
    }
  });
}

function buildTestsHtml(parsed: ReturnType<typeof parseHarnessOutput>): string {
  return parsed.tests
    .map((test) => {
      const cssClass = test.status === "PASS" ? "pass" : "fail";
      return `<article class="result-item ${cssClass}">
        <div><strong>${escapeHtml(test.name)}</strong> - ${escapeHtml(test.status)}</div>
        <div class="result-row">Expected: <span class="mono">${escapeHtml(test.expected)}</span></div>
        <div class="result-row">Actual: <span class="mono">${escapeHtml(test.actual)}</span></div>
      </article>`;
    })
    .join("");
}

function normalizeCustomTests(problem: ProblemDefinition): { tests: TestCase[]; error: string | null } {
  const parsed = parseCustomTests(problem, customTestsInput.value);
  if (parsed.error) {
    runLog.warn("Custom tests validation failed", {
      subcategory: "CustomTests",
      context: { problemId: problem.id, error: parsed.error }
    });
    return parsed;
  }

  saveCustomTests(problem.id, customTestsInput.value);
  runLog.info("Custom tests normalized", {
    subcategory: "CustomTests",
    context: { problemId: problem.id, customTestCount: parsed.tests.length }
  });
  return parsed;
}

async function runCurrentSubmission(): Promise<void> {
  if (runState.status === "running") return;

  runLog.info("Run requested", {
    context: {
      problemId: activeProblem.id,
      sourceLength: readEditor().length
    }
  });

  const customResult = normalizeCustomTests(activeProblem);
  if (customResult.error) {
    latestRun.summaryText = customResult.error;
    latestRun.testsHtml = "";
    latestRun.consoleOutput = "";
    latestRun.compileLog = "";
    latestRun.runtimeLog = "";
    renderDiagnostics([]);
    renderLatestRun();
    setStatus("failure", "tests", "Custom Tests Invalid");
    return;
  }

  const source = readEditor();
  saveDraft(activeProblem.id, source);
  runLog.info("Draft persisted before run", {
    subcategory: "Persistence",
    context: { problemId: activeProblem.id, sourceLength: source.length }
  });

  const tests = [...activeProblem.visibleTests, ...customResult.tests];
  const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  runLog.info("Compilation started", {
    subcategory: "Compile",
    context: {
      runId,
      problemId: activeProblem.id,
      officialTests: activeProblem.visibleTests.length,
      customTests: customResult.tests.length,
      totalTests: tests.length
    }
  });
  setStatus("running", "compile", "Compiling");

  let compilePayload;
  try {
    compilePayload = await compilerClient.compile({
      runId,
      source: readEditor(),
      problem: activeProblem,
      tests
    });
  } catch (error) {
    const compileMessage = (error as Error).message;
    runLog.error("Compile worker request failed", {
      subcategory: "Compile",
      context: { runId, message: compileMessage, error }
    });
    recordUnhandledError("compile-worker", `Compile worker failed: ${compileMessage}`, {
      stack: error instanceof Error ? error.stack : undefined
    });
    latestRun.summaryText = `Compile worker failed: ${compileMessage}`;
    latestRun.testsHtml = "";
    latestRun.consoleOutput = "";
    latestRun.compileLog = "";
    latestRun.runtimeLog = "";
    renderDiagnostics([]);
    renderLatestRun();
    setStatus("failure", "compile", "Compile Worker Failed");
    return;
  }

  latestRun.compileLog = compilePayload.compilerLog;

  if (!compilePayload.ok) {
    runLog.warn("Compilation finished with diagnostics", {
      subcategory: "Compile",
      context: {
        runId,
        diagnostics: compilePayload.diagnostics.length,
        message: compilePayload.message
      }
    });
    renderDiagnostics(compilePayload.diagnostics);
    latestRun.summaryText = compilePayload.message;
    latestRun.testsHtml = "";
    latestRun.consoleOutput = "";
    latestRun.runtimeLog = "";
    renderLatestRun();
    setStatus("failure", "compile", "Compile Error");
    return;
  }

  renderDiagnostics([]);
  runLog.info("Compilation succeeded; runtime execution started", {
    subcategory: "Runtime",
    context: { runId, wasmByteLength: compilePayload.wasmBytes.byteLength }
  });
  setStatus("running", "runtime", "Running");

  let runPayload;
  try {
    runPayload = await compilerClient.run({
      runId,
      wasmBytes: compilePayload.wasmBytes
    });
  } catch (error) {
    const runMessage = (error as Error).message;
    runLog.error("Runtime worker request failed", {
      subcategory: "Runtime",
      context: { runId, message: runMessage, error }
    });
    recordUnhandledError("run-worker", `Run worker failed: ${runMessage}`, {
      stack: error instanceof Error ? error.stack : undefined
    });
    latestRun.summaryText = `Run worker failed: ${runMessage}`;
    latestRun.testsHtml = "";
    latestRun.consoleOutput = "";
    latestRun.runtimeLog = "";
    renderLatestRun();
    setStatus("failure", "runtime", "Runtime Failure");
    return;
  }

  latestRun.runtimeLog = runPayload.runtimeLog;

  if (!runPayload.ok) {
    runLog.warn("Runtime execution failed", {
      subcategory: "Runtime",
      context: { runId, message: runPayload.message }
    });
    latestRun.summaryText = runPayload.message;
    latestRun.testsHtml = "";
    latestRun.consoleOutput = stripAnsi(runPayload.runtimeLog);
    renderLatestRun();
    setStatus("failure", "runtime", "Runtime Error");
    return;
  }

  const parsed = parseHarnessOutput(runPayload.runtimeLog);
  latestRun.consoleOutput = parsed.consoleLines.join("\n");
  latestRun.testsHtml = buildTestsHtml(parsed);

  if (!parsed.summary) {
    runLog.error("Harness summary missing", {
      subcategory: "Harness",
      context: { runId, testRows: parsed.tests.length }
    });
    latestRun.summaryText = "Harness summary was not produced by the runtime.";
    renderLatestRun();
    setStatus("failure", "tests", "Harness Error");
    return;
  }

  latestRun.summaryText = `Passed ${parsed.summary.passed}/${parsed.summary.total}, Failed ${parsed.summary.failed}`;
  runLog.info("Run completed", {
    subcategory: "Summary",
    context: {
      runId,
      passed: parsed.summary.passed,
      failed: parsed.summary.failed,
      total: parsed.summary.total
    }
  });
  renderLatestRun();

  if (parsed.summary.failed > 0) {
    setStatus("failure", "tests", "Tests Failed");
  } else {
    setStatus("success", "tests", "All Tests Passed");
  }
}

function resetToStarter(): void {
  writeEditor(activeProblem.starterCode);
  clearDraft(activeProblem.id);
  uiLog.info("Reset source to starter code", {
    subcategory: "Editor",
    context: { problemId: activeProblem.id }
  });
  setStatus("idle", "none", "Idle");
}

function switchProblem(problemId: string): void {
  const next = problemById.get(problemId);
  if (!next) return;

  saveDraft(activeProblem.id, readEditor());
  uiLog.info("Switching active problem", {
    subcategory: "Problem",
    context: { fromProblemId: activeProblem.id, toProblemId: next.id }
  });
  activeProblem = next;
  saveSelectedProblemId(problemId);
  renderProblem(activeProblem);
  setEditorForProblem(activeProblem);
  setStatus("idle", "none", "Idle");

  latestRun = {
    diagnostics: [],
    compileLog: "",
    runtimeLog: "",
    consoleOutput: "",
    summaryText: "No run yet.",
    testsHtml: ""
  };

  renderDiagnostics([]);
  renderLatestRun();
}

function initializeProblemSelect(): void {
  for (const problem of problems) {
    const option = document.createElement("option");
    option.value = problem.id;
    option.textContent = `${problem.title} (${problem.difficulty})`;
    problemSelect.appendChild(option);
  }

  problemSelect.value = activeProblem.id;
  problemSelect.addEventListener("change", () => {
    uiLog.info("Problem selector changed", {
      subcategory: "Problem",
      context: { selectedProblemId: problemSelect.value }
    });
    switchProblem(problemSelect.value);
  });
}

function initializeMobileTabs(): void {
  const tabButtons = [...document.querySelectorAll<HTMLButtonElement>(".tab-button")];

  const syncButtons = () => {
    for (const button of tabButtons) {
      button.classList.toggle("active", button.dataset.mobileTarget === document.body.dataset.mobileView);
    }
  };

  for (const button of tabButtons) {
    button.addEventListener("click", () => {
      document.body.dataset.mobileView = button.dataset.mobileTarget;
      uiLog.info("Mobile view switched", {
        subcategory: "Layout",
        context: { mobileView: button.dataset.mobileTarget }
      });
      syncButtons();
    });
  }

  syncButtons();
}

function initializeSettingsDialog(): void {
  syncLoggingControlValues();

  const unsubscribeSettings = subscribeLoggingSettings(() => {
    syncLoggingControlValues();
  });

  settingsBtn.addEventListener("click", () => {
    if (!settingsDialog.open) {
      settingsDialog.showModal();
      settingsLog.info("Settings dialog opened", { subcategory: "Dialog" });
    }
  });

  settingsCloseBtn.addEventListener("click", () => {
    settingsDialog.close();
    settingsLog.info("Settings dialog closed", { subcategory: "Dialog" });
  });

  loggingLevelSelect.addEventListener("change", () => {
    if (!isLoggingLevelValue(loggingLevelSelect.value)) {
      return;
    }
    const next = updateLoggingSettings({ level: loggingLevelSelect.value });
    settingsLog.info("Visible logging level changed", {
      subcategory: "Preferences",
      context: { level: next.level }
    });
  });

  loggingFormatterSelect.addEventListener("change", () => {
    if (!isLoggingFormatterValue(loggingFormatterSelect.value)) {
      return;
    }
    const next = updateLoggingSettings({ formatter: loggingFormatterSelect.value });
    settingsLog.info("Logging formatter changed", {
      subcategory: "Preferences",
      context: { formatter: next.formatter }
    });
  });

  loggingEmojiToggle.addEventListener("change", () => {
    const next = updateLoggingSettings({ useDecorativeEmoji: loggingEmojiToggle.checked });
    settingsLog.info("Decorative emoji setting changed", {
      subcategory: "Preferences",
      context: { useDecorativeEmoji: next.useDecorativeEmoji }
    });
  });

  loggingBackgroundToggle.addEventListener("change", () => {
    const next = updateLoggingSettings({ useLabelBackgrounds: loggingBackgroundToggle.checked });
    settingsLog.info("Label background setting changed", {
      subcategory: "Preferences",
      context: { useLabelBackgrounds: next.useLabelBackgrounds }
    });
  });

  window.addEventListener(
    "beforeunload",
    () => {
      unsubscribeSettings();
    },
    { once: true }
  );
}

function initializeEditor(): void {
  const host = document.querySelector<HTMLDivElement>("#editor-host");
  if (!host) {
    throw new Error("Missing editor host");
  }

  const state = EditorState.create({
    doc: "",
    extensions: [
      lineNumbers(),
      history(),
      bracketMatching(),
      foldGutter(),
      indentOnInput(),
      drawSelection(),
      highlightActiveLine(),
      cpp(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
        {
          key: "Mod-Enter",
          run: () => {
            void runCurrentSubmission();
            return true;
          }
        }
      ]),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        scheduleDraftSave();
      })
    ]
  });

  editor = new EditorView({
    state,
    parent: host
  });
  uiLog.info("Editor initialized", {
    subcategory: "Editor",
    context: { language: "c99" }
  });
}

function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) {
    appLog.warn("Service workers are not supported in this browser", {
      subcategory: "ServiceWorker"
    });
    return;
  }

  void navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => {
      appLog.info("Service worker registered", {
        subcategory: "ServiceWorker",
        context: { scope: registration.scope }
      });
    })
    .catch((error) => {
      recordUnhandledError("service-worker", `Service worker registration failed: ${normalizeErrorText(error)}`, {
        stack: error instanceof Error ? error.stack : undefined
      });
      appLog.error("Service worker registration failed", {
        subcategory: "ServiceWorker",
        context: { error }
      });
    });
}

window.addEventListener("beforeunload", () => {
  appLog.info("beforeunload received; disposing app resources", {
    subcategory: "Lifecycle"
  });
  if (unregisterUnhandledCapture) {
    unregisterUnhandledCapture();
    unregisterUnhandledCapture = null;
  }
  if (editor) {
    saveDraft(activeProblem.id, readEditor());
  }
  compilerClient.dispose();
});

errorPanelClearBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  clearUnhandledErrors();
});

renderUnhandledErrors();
unregisterUnhandledCapture = registerUnhandledErrorCapture();
initializeProblemSelect();
initializeMobileTabs();
initializeSettingsDialog();
initializeEditor();
renderProblem(activeProblem);
setEditorForProblem(activeProblem);
renderDiagnostics([]);
renderLatestRun();
registerServiceWorker();
appLog.info("Bootstrap completed", {
  context: { activeProblemId: activeProblem.id, loggingLevel: getLoggingSettings().level }
});

runBtn.addEventListener("click", () => {
  uiLog.info("Run button clicked", {
    subcategory: "Controls",
    context: { activeProblemId: activeProblem.id }
  });
  void runCurrentSubmission();
});

resetBtn.addEventListener("click", () => {
  uiLog.info("Reset button clicked", {
    subcategory: "Controls",
    context: { activeProblemId: activeProblem.id }
  });
  resetToStarter();
});

customTestsInput.addEventListener("input", () => {
  saveCustomTests(activeProblem.id, customTestsInput.value);
});

Object.assign(window, {
  ceetcodeDebug: {
    getSource: () => readEditor(),
    setSource: (source: string) => writeEditor(source),
    reportUnhandledError: (source: string, message: string) => recordUnhandledError(source, message),
    getLoggingSettings: () => getLoggingSettings(),
    setLoggingLevel: (level: LoggingLevel) => updateLoggingSettings({ level }),
    setLoggingFormatter: (formatter: LoggingFormatterName) => updateLoggingSettings({ formatter })
  }
});
