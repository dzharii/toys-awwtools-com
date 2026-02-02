(() => {
  "use strict";

  const CODE_LINES = [
    { lineId: "L1", text: "function levenshtein(a, b) {" },
    { lineId: "L2", text: "  const m = a.length;" },
    { lineId: "L3", text: "  const n = b.length;" },
    {
      lineId: "L4",
      text: "  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));",
    },
    { lineId: "L5", text: "  dp[0][0] = 0;" },
    { lineId: "L6", text: "  for (let i = 1; i <= m; i++) dp[i][0] = i;" },
    { lineId: "L7", text: "  for (let j = 1; j <= n; j++) dp[0][j] = j;" },
    { lineId: "L8", text: "  for (let i = 1; i <= m; i++) {" },
    { lineId: "L9", text: "    for (let j = 1; j <= n; j++) {" },
    { lineId: "L10", text: "      const cost = a[i - 1] === b[j - 1] ? 0 : 1;" },
    { lineId: "L11", text: "      const del = dp[i - 1][j] + 1;" },
    { lineId: "L12", text: "      const ins = dp[i][j - 1] + 1;" },
    { lineId: "L13", text: "      const sub = dp[i - 1][j - 1] + cost;" },
    { lineId: "L14", text: "      dp[i][j] = Math.min(del, ins, sub);" },
    { lineId: "L15", text: "    }" },
    { lineId: "L16", text: "  }" },
    { lineId: "L17", text: "  return dp[m][n];" },
    { lineId: "L18", text: "}" },
  ];

  const EXAMPLES = [
    { label: "kitten -> sitting", a: "kitten", b: "sitting" },
    { label: "cat -> cut", a: "cat", b: "cut" },
    { label: "flaw -> lawn", a: "flaw", b: "lawn" },
    { label: "gumbo -> gambol", a: "gumbo", b: "gambol" },
  ];

  const LENGTH_OPTIONS = [8, 12, 16, 20, 24, 30];

  const state = {
    a: "",
    b: "",
    maxLen: 20,
    trace: [],
    dp: [],
    currentIndex: 0,
    playing: false,
    timer: null,
    pathCells: new Set(),
    showEdits: false,
    paneSizes: null,
  };

  const elements = {
    simulator: document.getElementById("simulator"),
    inputA: document.getElementById("input-a"),
    inputB: document.getElementById("input-b"),
    exampleSelect: document.getElementById("example-select"),
    maxLength: document.getElementById("max-length"),
    inputWarning: document.getElementById("input-warning"),
    speed: document.getElementById("speed"),
    speedLabel: document.getElementById("speed-label"),
    granularity: document.getElementById("granularity"),
    compactMatrix: document.getElementById("compact-matrix"),
    bpInit: document.getElementById("bp-init"),
    bpRow: document.getElementById("bp-row"),
    bpCell: document.getElementById("bp-cell"),
    bpDone: document.getElementById("bp-done"),
    code: document.getElementById("code"),
    copyCode: document.getElementById("copy-code"),
    copyC99: document.getElementById("copy-c99"),
    matrixCosts: document.getElementById("matrix-costs"),
    matrix: document.getElementById("matrix"),
    watch: document.getElementById("watch"),
    explanation: document.getElementById("explanation"),
    showEdits: document.getElementById("show-edits"),
    editOutput: document.getElementById("edit-output"),
    jumpStart: document.getElementById("jump-start"),
    stepBack: document.getElementById("step-back"),
    stepForward: document.getElementById("step-forward"),
    play: document.getElementById("play"),
    jumpEnd: document.getElementById("jump-end"),
    reset: document.getElementById("reset"),
    jumpInitRow: document.getElementById("jump-init-row"),
    jumpInitCol: document.getElementById("jump-init-col"),
    jumpMain: document.getElementById("jump-main"),
    jumpFinal: document.getElementById("jump-final"),
    stepCurrent: document.getElementById("step-current"),
    stepTotal: document.getElementById("step-total"),
    phaseLabel: document.getElementById("phase-label"),
    contrastToggle: document.getElementById("contrast-toggle"),
    jumpToSim: document.getElementById("jump-to-sim"),
    runTests: document.getElementById("run-tests"),
    testOutput: document.getElementById("test-output"),
  };

  const lineElements = new Map();
  const focusButtons = Array.from(document.querySelectorAll(".focus-toggle button"));
  const simPanes = document.querySelector(".sim-panes");
  const splitters = Array.from(document.querySelectorAll(".pane-splitter"));
  const panes = {
    code: document.querySelector(".code-pane"),
    matrix: document.querySelector(".matrix-pane"),
    watch: document.querySelector(".watch-pane"),
  };

  function createEmptyMatrix(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
  }

  function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
    dp[0][0] = 0;
    for (let i = 1; i <= m; i++) dp[i][0] = i;
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return { distance: dp[m][n], dp };
  }

  function traceLevenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = createEmptyMatrix(m + 1, n + 1);
    const trace = [];
    let stepId = 0;

    const pushStep = (step) => {
      trace.push({ stepId, ...step });
      stepId += 1;
    };

    pushStep({
      phase: "start",
      lineId: "L1",
      i: null,
      j: null,
      chars: null,
      dpSnapshotDelta: null,
      computedValues: null,
      explanation: "Start the function and prepare to build the DP table.",
      kind: "start",
    });

    pushStep({
      phase: "start",
      lineId: "L2",
      i: null,
      j: null,
      chars: null,
      dpSnapshotDelta: null,
      computedValues: null,
      explanation: `Read m = ${m} (length of string A).`,
      kind: "setup",
    });

    pushStep({
      phase: "start",
      lineId: "L3",
      i: null,
      j: null,
      chars: null,
      dpSnapshotDelta: null,
      computedValues: null,
      explanation: `Read n = ${n} (length of string B).`,
      kind: "setup",
    });

    pushStep({
      phase: "start",
      lineId: "L4",
      i: null,
      j: null,
      chars: null,
      dpSnapshotDelta: null,
      computedValues: null,
      explanation: `Allocate a (${m + 1}) x (${n + 1}) matrix for dp.`,
      kind: "setup",
    });

    const writeCell = (i, j, next, phase, lineId, explanation, kind, computedValues, chars) => {
      const prev = dp[i][j];
      dp[i][j] = next;
      pushStep({
        phase,
        lineId,
        i,
        j,
        chars: chars || null,
        dpSnapshotDelta: { write: { i, j, prev, next } },
        computedValues: computedValues || null,
        explanation,
        kind,
        deps: computedValues ? [
          { i: i - 1, j },
          { i, j: j - 1 },
          { i: i - 1, j: j - 1 },
        ] : null,
      });
    };

    writeCell(0, 0, 0, "initRow", "L5", "Initialize dp[0][0] = 0 for empty prefixes.", "init");

    for (let i = 1; i <= m; i++) {
      writeCell(
        i,
        0,
        i,
        "initCol",
        "L6",
        `Initialize first column: dp[${i}][0] = ${i} (delete ${i} chars).`,
        "init"
      );
    }

    for (let j = 1; j <= n; j++) {
      writeCell(
        0,
        j,
        j,
        "initRow",
        "L7",
        `Initialize first row: dp[0][${j}] = ${j} (insert ${j} chars).`,
        "init"
      );
    }

    pushStep({
      phase: "mainLoop",
      lineId: "L8",
      i: null,
      j: null,
      chars: null,
      dpSnapshotDelta: null,
      computedValues: null,
      explanation: "Initialization complete. Enter the main loops.",
      kind: "initDone",
    });

    for (let i = 1; i <= m; i++) {
      pushStep({
        phase: "mainLoop",
        lineId: "L8",
        i,
        j: null,
        chars: null,
        dpSnapshotDelta: null,
        computedValues: null,
        explanation: `Start row i = ${i} (prefix a[0..${i})).`,
        kind: "rowStart",
      });

      for (let j = 1; j <= n; j++) {
        const aChar = a[i - 1];
        const bChar = b[j - 1];
        const cost = aChar === bChar ? 0 : 1;
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j - 1] + 1;
        const sub = dp[i - 1][j - 1] + cost;
        const min = Math.min(del, ins, sub);

        writeCell(
          i,
          j,
          min,
          "mainLoop",
          "L14",
          `Compute dp[${i}][${j}] from delete ${del}, insert ${ins}, substitute ${sub}. Choose ${min}.`,
          "cell",
          {
            deleteCost: del,
            insertCost: ins,
            substCost: sub,
            chosenMin: min,
            cost,
          },
          { aChar, bChar }
        );
      }
    }

    pushStep({
      phase: "done",
      lineId: "L17",
      i: m,
      j: n,
      chars: null,
      dpSnapshotDelta: null,
      computedValues: null,
      explanation: `Return dp[${m}][${n}] = ${dp[m][n]} as the final distance.`,
      kind: "done",
    });

    return { trace, m, n, distance: dp[m][n] };
  }

  function renderCode(container) {
    container.innerHTML = "";
    lineElements.clear();
    CODE_LINES.forEach((line, index) => {
      const lineEl = document.createElement("div");
      lineEl.className = "code-line";
      lineEl.dataset.lineId = line.lineId;

      const lineNo = document.createElement("span");
      lineNo.className = "line-no";
      lineNo.textContent = String(index + 1).padStart(2, " ");

      const lineText = document.createElement("span");
      lineText.className = "line-text";
      lineText.textContent = line.text;

      lineEl.appendChild(lineNo);
      lineEl.appendChild(lineText);
      container.appendChild(lineEl);
      lineElements.set(line.lineId, lineEl);
    });
  }

  function renderMatrix(container, dp, labels, highlight) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const corner = document.createElement("th");
    corner.textContent = "a \\ b";
    headerRow.appendChild(corner);

    labels.b.forEach((char) => {
      const th = document.createElement("th");
      th.textContent = char;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < dp.length; i++) {
      const row = document.createElement("tr");
      const rowLabel = document.createElement("th");
      rowLabel.textContent = labels.a[i] || "";
      row.appendChild(rowLabel);

      for (let j = 0; j < dp[0].length; j++) {
        const cell = document.createElement("td");
        const value = dp[i][j];
        if (value === null || value === undefined) {
          cell.textContent = ".";
          cell.classList.add("cell-empty");
        } else {
          cell.textContent = String(value);
        }

        if (highlight.current && highlight.current.i === i && highlight.current.j === j) {
          cell.classList.add("cell-current");
        }
        if (highlight.deps) {
          const isDep = highlight.deps.some((dep) => dep.i === i && dep.j === j);
          if (isDep) cell.classList.add("cell-dep");
        }
        if (highlight.write && highlight.write.i === i && highlight.write.j === j) {
          cell.classList.add("cell-write");
        }
        if (highlight.path && highlight.path.has(`${i},${j}`)) {
          cell.classList.add("cell-path");
        }

        cell.setAttribute("aria-label", `dp[${i}][${j}] = ${value === null ? "empty" : value}`);
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    container.innerHTML = "";
    container.appendChild(table);
  }

  function renderWatch(step) {
    const i = step?.i;
    const j = step?.j;
    const computed = step?.computedValues || {};
    const chars = step?.chars || {};
    const currentValue =
      i !== null && i !== undefined && j !== null && j !== undefined ? state.dp[i][j] : null;
    const chosen = computed.chosenMin;
    const choiceLabels = [];
    if (chosen !== undefined) {
      if (computed.deleteCost === chosen) choiceLabels.push("delete");
      if (computed.insertCost === chosen) choiceLabels.push("insert");
      if (computed.substCost === chosen) choiceLabels.push(computed.cost === 0 ? "match" : "substitute");
    }
    const choiceText = choiceLabels.length ? choiceLabels.join(", ") : "-";

    const rows = [
      ["i", i ?? "-"],
      ["j", j ?? "-"],
      ["aChar", chars.aChar !== undefined ? `'${chars.aChar}'` : "-"],
      ["bChar", chars.bChar !== undefined ? `'${chars.bChar}'` : "-"],
      ["deleteCost", computed.deleteCost ?? "-"],
      ["insertCost", computed.insertCost ?? "-"],
      ["substCost", computed.substCost ?? "-"],
      ["choice", choiceText],
      ["dp[i][j]", currentValue ?? "-"],
      ["phase", step?.phase || "-"],
    ];

    elements.watch.innerHTML = "";
    rows.forEach(([label, value]) => {
      const labelEl = document.createElement("div");
      labelEl.textContent = label;
      const valueEl = document.createElement("div");
      valueEl.textContent = String(value);
      if (label === "choice" && value !== "-") valueEl.classList.add("choice");
      elements.watch.appendChild(labelEl);
      elements.watch.appendChild(valueEl);
    });
  }

  function renderExplanation(step) {
    elements.explanation.textContent = step?.explanation || "";
  }

  function renderMatrixCosts(step) {
    const computed = step?.computedValues;
    if (!computed || computed.deleteCost === undefined) {
      elements.matrixCosts.innerHTML = "<span class=\"cost-pill\">Costs: -</span>";
      return;
    }
    const chosen = computed.chosenMin;
    const pills = [
      { label: `delete: ${computed.deleteCost}`, value: computed.deleteCost },
      { label: `insert: ${computed.insertCost}`, value: computed.insertCost },
      { label: `substitute: ${computed.substCost}`, value: computed.substCost },
    ];
    elements.matrixCosts.innerHTML = pills
      .map((pill) => {
        const active = pill.value === chosen ? "active" : "";
        return `<span class="cost-pill ${active}">${pill.label}</span>`;
      })
      .join("");
  }

  function highlightLine(lineId) {
    lineElements.forEach((lineEl) => lineEl.classList.remove("active"));
    const target = lineElements.get(lineId);
    if (target) target.classList.add("active");
  }

  function updateProgress() {
    elements.stepCurrent.textContent = String(state.currentIndex + 1);
    elements.stepTotal.textContent = String(state.trace.length);
  }

  function updatePhase(step) {
    elements.phaseLabel.textContent = step?.phase || "-";
  }

  function updateEditPanel() {
    if (!state.showEdits) {
      elements.editOutput.textContent = "";
      return;
    }
    if (state.pathCells.size === 0) {
      elements.editOutput.textContent = "Run to the end to compute a path.";
      return;
    }
    const { ops } = buildEditScript(state.a, state.b);
    if (ops.length === 0) {
      elements.editOutput.textContent = "No edits needed.";
      return;
    }
    elements.editOutput.innerHTML = ops
      .map((op, idx) => `${idx + 1}. ${op}`)
      .join("<br />");
  }

  function renderCurrentStep() {
    const step = state.trace[state.currentIndex];
    highlightLine(step.lineId);
    renderMatrix(elements.matrix, state.dp, buildLabels(state.a, state.b), {
      current: step.i !== null && step.i !== undefined && step.j !== null && step.j !== undefined
        ? { i: step.i, j: step.j }
        : null,
      deps: step.deps || null,
      write: step.dpSnapshotDelta?.write || null,
      path: state.pathCells,
    });
    renderWatch(step);
    renderExplanation(step);
    renderMatrixCosts(step);
    updateProgress();
    updatePhase(step);
    updateTransportButtons();
    updateEditPanel();
  }

  function setFocus(mode) {
    elements.simulator.setAttribute("data-focus", mode);
    focusButtons.forEach((button) => {
      const isActive = button.getAttribute("data-focus") === mode;
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function applyPaneSizes(sizes) {
    if (!sizes || !simPanes) return;
    simPanes.style.setProperty("--code-width", `${sizes.code}px`);
    simPanes.style.setProperty("--matrix-width", `${sizes.matrix}px`);
    simPanes.style.setProperty("--watch-width", `${sizes.watch}px`);
  }

  function clearPaneSizes() {
    if (!simPanes) return;
    simPanes.style.removeProperty("--code-width");
    simPanes.style.removeProperty("--matrix-width");
    simPanes.style.removeProperty("--watch-width");
  }

  function updatePaneLayout() {
    const wide = window.matchMedia("(min-width: 1100px)").matches;
    if (!wide) {
      clearPaneSizes();
      return;
    }
    if (state.paneSizes) applyPaneSizes(state.paneSizes);
  }

  function setupResizers() {
    if (!simPanes || splitters.length === 0) return;
    const minSizes = { code: 260, matrix: 300, watch: 240 };

    splitters.forEach((splitter) => {
      splitter.addEventListener("pointerdown", (event) => {
        const wide = window.matchMedia("(min-width: 1100px)").matches;
        if (!wide) return;
        event.preventDefault();

        const isCodeSplit = splitter.dataset.split === "code";
        const startX = event.clientX;
        const codeWidth = panes.code.getBoundingClientRect().width;
        const matrixWidth = panes.matrix.getBoundingClientRect().width;
        const watchWidth = panes.watch.getBoundingClientRect().width;
        const total = codeWidth + matrixWidth + watchWidth;

        const onMove = (moveEvent) => {
          const delta = moveEvent.clientX - startX;
          let newCode = codeWidth;
          let newMatrix = matrixWidth;
          let newWatch = watchWidth;

          if (isCodeSplit) {
            newCode = Math.max(minSizes.code, Math.min(codeWidth + delta, total - minSizes.matrix - watchWidth));
            newMatrix = total - newCode - watchWidth;
          } else {
            newMatrix = Math.max(
              minSizes.matrix,
              Math.min(matrixWidth + delta, total - minSizes.watch - codeWidth)
            );
            newWatch = total - codeWidth - newMatrix;
          }

          const sizes = { code: newCode, matrix: newMatrix, watch: newWatch };
          state.paneSizes = sizes;
          applyPaneSizes(sizes);
        };

        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
    });

    window.addEventListener("resize", updatePaneLayout);
  }

  function applyStep(step, direction) {
    const write = step?.dpSnapshotDelta?.write;
    if (!write) return;
    if (direction === 1) {
      state.dp[write.i][write.j] = write.next;
    } else {
      state.dp[write.i][write.j] = write.prev;
    }
  }

  function moveToIndex(targetIndex) {
    if (targetIndex === state.currentIndex) return;
    if (targetIndex > state.currentIndex) {
      for (let idx = state.currentIndex + 1; idx <= targetIndex; idx++) {
        applyStep(state.trace[idx], 1);
      }
    } else {
      for (let idx = state.currentIndex; idx > targetIndex; idx--) {
        applyStep(state.trace[idx], -1);
      }
    }
    state.currentIndex = targetIndex;
    if (state.showEdits && state.currentIndex !== state.trace.length - 1) {
      state.showEdits = false;
      state.pathCells = new Set();
      elements.showEdits.textContent = "Show edits";
    }
    renderCurrentStep();
  }

  function stopPlay() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    state.playing = false;
    elements.play.textContent = "Play";
  }

  function startPlay() {
    if (state.playing) return;
    state.playing = true;
    elements.play.textContent = "Pause";
    const intervalMs = Math.max(120, 700 / Number(elements.speed.value));
    state.timer = setInterval(() => {
      if (state.currentIndex >= state.trace.length - 1) {
        stopPlay();
        return;
      }
      const nextIndex = findNextStopIndex(1);
      if (nextIndex === null) {
        stopPlay();
        return;
      }
      moveToIndex(nextIndex);
    }, intervalMs);
  }

  function findNextStopIndex(direction) {
    if (direction === 1) {
      for (let idx = state.currentIndex + 1; idx < state.trace.length; idx++) {
        if (isStopStep(state.trace[idx])) return idx;
      }
    } else {
      for (let idx = state.currentIndex - 1; idx >= 0; idx--) {
        if (isStopStep(state.trace[idx])) return idx;
      }
    }
    return null;
  }

  function isStopStep(step) {
    if (!step) return false;
    if (step.kind === "start") return true;

    const granularity = elements.granularity.value;
    if (granularity === "row" && step.kind === "cell") return false;

    if (step.kind === "initDone") return elements.bpInit.checked;
    if (step.kind === "rowStart") return elements.bpRow.checked;
    if (step.kind === "cell") return elements.bpCell.checked;
    if (step.kind === "init") return elements.bpCell.checked;
    if (step.kind === "done") return elements.bpDone.checked;

    return true;
  }

  function updateTransportButtons() {
    const atStart = state.currentIndex === 0;
    const atEnd = state.currentIndex === state.trace.length - 1;
    elements.stepBack.disabled = atStart;
    elements.jumpStart.disabled = atStart;
    elements.stepForward.disabled = atEnd;
    elements.jumpEnd.disabled = atEnd;
    elements.reset.disabled = atStart;
    elements.showEdits.disabled = !atEnd;
    elements.jumpFinal.disabled = atEnd;
  }

  function findMilestoneIndex(type) {
    if (type === "initRow") {
      let index = state.trace.findIndex((step) => step.phase === "initRow" && step.j === 1);
      if (index === -1) index = state.trace.findIndex((step) => step.phase === "initRow");
      return index;
    }
    if (type === "initCol") {
      return state.trace.findIndex((step) => step.phase === "initCol");
    }
    if (type === "main") {
      return state.trace.findIndex((step) => step.kind === "rowStart");
    }
    if (type === "done") {
      return state.trace.findIndex((step) => step.kind === "done");
    }
    return -1;
  }

  function jumpToMilestone(type) {
    const idx = findMilestoneIndex(type);
    if (idx >= 0) {
      moveToIndex(idx);
      document.getElementById("simulator").scrollIntoView({ behavior: "smooth" });
    }
  }

  function buildLabels(a, b) {
    const aChars = ["''", ...a.split("")];
    const bChars = ["''", ...b.split("")];
    return { a: aChars, b: bChars };
  }

  function sanitizeInput(value, maxLen) {
    const trimmed = value.replace(/[\r\n]+/g, "");
    if (trimmed.length > maxLen) {
      return { value: trimmed.slice(0, maxLen), trimmed: true };
    }
    return { value: trimmed, trimmed: trimmed !== value };
  }

  function rebuildTrace() {
    const warningMessages = [];
    const aInput = sanitizeInput(elements.inputA.value, state.maxLen);
    const bInput = sanitizeInput(elements.inputB.value, state.maxLen);

    if (aInput.trimmed || bInput.trimmed) {
      warningMessages.push(`Inputs trimmed to max length ${state.maxLen}.`);
    }
    if (state.maxLen > 20) {
      warningMessages.push("Longer strings may slow down rendering.");
    }
    elements.inputWarning.textContent = warningMessages.join(" ");

    elements.inputA.value = aInput.value;
    elements.inputB.value = bInput.value;

    state.a = aInput.value;
    state.b = bInput.value;

    const { trace } = traceLevenshtein(state.a, state.b);
    state.trace = trace;
    state.dp = createEmptyMatrix(state.a.length + 1, state.b.length + 1);
    state.currentIndex = 0;
    state.pathCells = new Set();
    state.showEdits = false;
    elements.showEdits.textContent = "Show edits";

    stopPlay();
    renderCurrentStep();
  }

  function buildEditScript(a, b) {
    const { dp } = levenshteinDistance(a, b);
    const ops = [];
    const pathCells = new Set();
    let i = a.length;
    let j = b.length;
    pathCells.add(`${i},${j}`);

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        if (dp[i][j] === dp[i - 1][j - 1] + cost) {
          ops.push(cost === 0 ? `Match '${a[i - 1]}'` : `Substitute '${a[i - 1]}' -> '${b[j - 1]}'`);
          i -= 1;
          j -= 1;
          pathCells.add(`${i},${j}`);
          continue;
        }
      }
      if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        ops.push(`Delete '${a[i - 1]}'`);
        i -= 1;
        pathCells.add(`${i},${j}`);
      } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
        ops.push(`Insert '${b[j - 1]}'`);
        j -= 1;
        pathCells.add(`${i},${j}`);
      } else {
        break;
      }
    }

    return { ops: ops.reverse(), pathCells };
  }

  function handleShowEdits() {
    if (!state.showEdits) {
      state.showEdits = true;
      const { pathCells } = buildEditScript(state.a, state.b);
      state.pathCells = pathCells;
    } else {
      state.showEdits = false;
      state.pathCells = new Set();
    }
    renderCurrentStep();
    elements.showEdits.textContent = state.showEdits ? "Hide edits" : "Show edits";
  }

  function setupExamples() {
    elements.exampleSelect.innerHTML = "";
    EXAMPLES.forEach((example, idx) => {
      const option = document.createElement("option");
      option.value = String(idx);
      option.textContent = example.label;
      elements.exampleSelect.appendChild(option);
    });
    elements.exampleSelect.value = "0";
  }

  function setupMaxLength() {
    elements.maxLength.innerHTML = "";
    LENGTH_OPTIONS.forEach((len) => {
      const option = document.createElement("option");
      option.value = String(len);
      option.textContent = String(len);
      if (len === state.maxLen) option.selected = true;
      elements.maxLength.appendChild(option);
    });
  }

  function setupEvents() {
    elements.exampleSelect.addEventListener("change", (event) => {
      const example = EXAMPLES[Number(event.target.value)] || EXAMPLES[0];
      elements.inputA.value = example.a;
      elements.inputB.value = example.b;
      rebuildTrace();
    });

    elements.inputA.addEventListener("change", rebuildTrace);
    elements.inputB.addEventListener("change", rebuildTrace);

    elements.maxLength.addEventListener("change", (event) => {
      state.maxLen = Number(event.target.value);
      rebuildTrace();
    });

    elements.speed.addEventListener("input", () => {
      elements.speedLabel.textContent = `${elements.speed.value}x`;
      if (state.playing) {
        stopPlay();
        startPlay();
      }
    });

    elements.granularity.addEventListener("change", () => {
      if (elements.granularity.value === "row") {
        elements.bpRow.checked = true;
        elements.bpCell.checked = false;
      } else {
        elements.bpCell.checked = true;
      }
      renderCurrentStep();
    });

    elements.compactMatrix.addEventListener("change", () => {
      if (elements.compactMatrix.checked) {
        elements.simulator.classList.add("compact");
      } else {
        elements.simulator.classList.remove("compact");
      }
    });

    [elements.bpInit, elements.bpRow, elements.bpCell, elements.bpDone].forEach((checkbox) => {
      checkbox.addEventListener("change", renderCurrentStep);
    });

    elements.stepForward.addEventListener("click", () => {
      const nextIndex = findNextStopIndex(1);
      if (nextIndex !== null) moveToIndex(nextIndex);
    });

    elements.stepBack.addEventListener("click", () => {
      const prevIndex = findNextStopIndex(-1);
      if (prevIndex !== null) moveToIndex(prevIndex);
    });

    elements.jumpStart.addEventListener("click", () => moveToIndex(0));
    elements.jumpEnd.addEventListener("click", () => moveToIndex(state.trace.length - 1));
    elements.reset.addEventListener("click", () => rebuildTrace());

    elements.jumpInitRow.addEventListener("click", () => {
      jumpToMilestone("initRow");
    });
    elements.jumpInitCol.addEventListener("click", () => {
      jumpToMilestone("initCol");
    });
    elements.jumpMain.addEventListener("click", () => {
      jumpToMilestone("main");
    });
    elements.jumpFinal.addEventListener("click", () => {
      jumpToMilestone("done");
    });

    elements.play.addEventListener("click", () => {
      if (state.playing) {
        stopPlay();
      } else {
        startPlay();
      }
    });

    elements.copyCode.addEventListener("click", () => {
      const code = CODE_LINES.map((line) => line.text).join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
      } else {
        const temp = document.createElement("textarea");
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
    });

    elements.copyC99.addEventListener("click", () => {
      const code = document.getElementById("c99-code").textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
      } else {
        const temp = document.createElement("textarea");
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
    });

    elements.showEdits.addEventListener("click", handleShowEdits);

    elements.contrastToggle.addEventListener("change", () => {
      if (elements.contrastToggle.checked) {
        document.body.setAttribute("data-contrast", "high");
      } else {
        document.body.removeAttribute("data-contrast");
      }
    });

    elements.jumpToSim.addEventListener("click", () => {
      document.getElementById("simulator").scrollIntoView({ behavior: "smooth" });
    });

    document.querySelectorAll("[data-milestone]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const milestone = event.currentTarget.getAttribute("data-milestone");
        jumpToMilestone(milestone);
      });
    });

    focusButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.getAttribute("data-focus");
        setFocus(mode);
      });
    });

    elements.runTests.addEventListener("click", () => {
      const result = runTests();
      elements.testOutput.textContent = result.join("\n");
    });
  }

  function runTests() {
    const results = [];
    const tests = [
      { a: "", b: "", expected: 0 },
      { a: "a", b: "", expected: 1 },
      { a: "", b: "abc", expected: 3 },
      { a: "kitten", b: "sitting", expected: 3 },
      { a: "flaw", b: "lawn", expected: 2 },
    ];

    tests.forEach((test) => {
      const { distance, dp } = levenshteinDistance(test.a, test.b);
      const pass = distance === test.expected;
      results.push(`${pass ? "PASS" : "FAIL"} distance('${test.a}','${test.b}') = ${distance}`);

      if (dp.length !== test.a.length + 1 || dp[0].length !== test.b.length + 1) {
        results.push("FAIL dp dimensions invalid");
      }
    });

    const trace = traceLevenshtein("kitten", "sitting");
    const lastStep = trace.trace[trace.trace.length - 1];
    if (lastStep.phase !== "done") {
      results.push("FAIL final trace step not marked done");
    }
    if (trace.distance !== 3) {
      results.push("FAIL trace distance mismatch for kitten/sitting");
    }
    if (!validateTrace(trace)) {
      results.push("FAIL trace invariant checks");
    }

    return results;
  }

  function validateTrace(traceData) {
    const { trace, m, n, distance } = traceData;
    let ok = true;
    trace.forEach((step) => {
      const write = step.dpSnapshotDelta?.write;
      if (write) {
        if (
          write.i < 0 ||
          write.j < 0 ||
          write.i > m ||
          write.j > n ||
          Number.isNaN(write.i) ||
          Number.isNaN(write.j)
        ) {
          ok = false;
        }
      }
    });
    const computed = levenshteinDistance("kitten", "sitting");
    if (computed.distance !== distance) ok = false;
    if (computed.dp.length !== m + 1 || computed.dp[0].length !== n + 1) ok = false;
    return ok;
  }

  function init() {
    renderCode(elements.code);
    setupExamples();
    setupMaxLength();
    elements.inputA.value = EXAMPLES[0].a;
    elements.inputB.value = EXAMPLES[0].b;
    elements.speedLabel.textContent = `${elements.speed.value}x`;
    setFocus("none");
    setupEvents();
    setupResizers();
    updatePaneLayout();
    rebuildTrace();
  }

  init();
  window.__LEVENSHTEIN_TESTS__ = runTests;
})();
