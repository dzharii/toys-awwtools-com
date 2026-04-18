import { EditorState } from "@codemirror/state";
import { cpp } from "@codemirror/lang-cpp";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, foldGutter, indentOnInput } from "@codemirror/language";
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { marked } from "marked";
import { parseCustomTests } from "../runtime/custom-tests";
import { parseHarnessOutput, stripAnsi } from "../runtime/harness/parse-harness-output";
import { loadProblemCatalog } from "../runtime/problem-catalog";
import { clearDraft, loadCustomTests, loadDraft, loadSelectedProblemId, saveCustomTests, saveDraft, saveSelectedProblemId } from "../runtime/storage";
import { WorkerCompilerClient } from "../runtime/compiler/worker-client";
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

const problems = loadProblemCatalog();
const problemById = new Map(problems.map((problem) => [problem.id, problem]));

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

const compilerClient = new WorkerCompilerClient();
const mobileView = window.matchMedia("(max-width: 1100px)").matches ? "problem" : "editor";

document.body.dataset.mobileView = mobileView;

appRoot.innerHTML = `
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
`;

const problemSelect = requiredElement(document.querySelector<HTMLSelectElement>("#problem-select"), "#problem-select");
const problemTitle = requiredElement(document.querySelector<HTMLElement>("#problem-title"), "#problem-title");
const problemMeta = requiredElement(document.querySelector<HTMLElement>("#problem-meta"), "#problem-meta");
const problemSignature = requiredElement(document.querySelector<HTMLElement>("#problem-signature"), "#problem-signature");
const problemContent = requiredElement(document.querySelector<HTMLElement>("#problem-content"), "#problem-content");
const activeProblemIdEl = requiredElement(document.querySelector<HTMLElement>("#active-problem-id"), "#active-problem-id");
const runBtn = requiredElement(document.querySelector<HTMLButtonElement>("#run-btn"), "#run-btn");
const resetBtn = requiredElement(document.querySelector<HTMLButtonElement>("#reset-btn"), "#reset-btn");
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

function setStatus(status: RunState["status"], phase: RunState["phase"], message: string): void {
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
    return parsed;
  }

  saveCustomTests(problem.id, customTestsInput.value);
  return parsed;
}

async function runCurrentSubmission(): Promise<void> {
  if (runState.status === "running") return;

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

  saveDraft(activeProblem.id, readEditor());

  const tests = [...activeProblem.visibleTests, ...customResult.tests];
  const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
    latestRun.summaryText = `Compile worker failed: ${(error as Error).message}`;
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
  setStatus("running", "runtime", "Running");

  let runPayload;
  try {
    runPayload = await compilerClient.run({
      runId,
      wasmBytes: compilePayload.wasmBytes
    });
  } catch (error) {
    latestRun.summaryText = `Run worker failed: ${(error as Error).message}`;
    latestRun.testsHtml = "";
    latestRun.consoleOutput = "";
    latestRun.runtimeLog = "";
    renderLatestRun();
    setStatus("failure", "runtime", "Runtime Failure");
    return;
  }

  latestRun.runtimeLog = runPayload.runtimeLog;

  if (!runPayload.ok) {
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
    latestRun.summaryText = "Harness summary was not produced by the runtime.";
    renderLatestRun();
    setStatus("failure", "tests", "Harness Error");
    return;
  }

  latestRun.summaryText = `Passed ${parsed.summary.passed}/${parsed.summary.total}, Failed ${parsed.summary.failed}`;
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
  setStatus("idle", "none", "Idle");
}

function switchProblem(problemId: string): void {
  const next = problemById.get(problemId);
  if (!next) return;

  saveDraft(activeProblem.id, readEditor());
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
      syncButtons();
    });
  }

  syncButtons();
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
}

function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker.register("/sw.js").catch((error) => {
    console.warn("Service worker registration failed", error);
  });
}

window.addEventListener("beforeunload", () => {
  if (editor) {
    saveDraft(activeProblem.id, readEditor());
  }
  compilerClient.dispose();
});

initializeProblemSelect();
initializeMobileTabs();
initializeEditor();
renderProblem(activeProblem);
setEditorForProblem(activeProblem);
renderDiagnostics([]);
renderLatestRun();
registerServiceWorker();

runBtn.addEventListener("click", () => {
  void runCurrentSubmission();
});

resetBtn.addEventListener("click", () => {
  resetToStarter();
});

customTestsInput.addEventListener("input", () => {
  saveCustomTests(activeProblem.id, customTestsInput.value);
});

Object.assign(window, {
  ceetcodeDebug: {
    getSource: () => readEditor(),
    setSource: (source: string) => writeEditor(source)
  }
});
