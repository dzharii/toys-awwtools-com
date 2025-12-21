(() => {
  'use strict';

  const STORAGE_KEY = 'dp-explained-state-v1';
  const RUN_STATES = ['Editing', 'Ready', 'Running', 'Paused', 'Completed', 'Error'];

  const lessonMap = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));

  const defaultState = buildDefaultState();
  const state = loadState() || defaultState;
  const runtime = createRuntimeState();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navEl = document.getElementById('lesson-nav');
  const titleEl = document.getElementById('lesson-title');
  const problemEl = document.getElementById('problem-content');
  const inputEl = document.getElementById('input-editor');
  const hintsEl = document.getElementById('hint-drawer');
  const stateEl = document.getElementById('state-builder');
  const transitionEl = document.getElementById('transition-builder');
  const vizControlsEl = document.getElementById('viz-controls');
  const vizStatusEl = document.getElementById('viz-status');
  const vizOutputEl = document.getElementById('viz-output');
  const vizAreaEl = document.getElementById('viz-area');
  const vizSecondaryEl = document.getElementById('viz-secondary');
  const codeEl = document.getElementById('code-playground');
  const examplesEl = document.getElementById('examples-panel');
  const themeToggle = document.getElementById('theme-toggle');
  const resetAllBtn = document.getElementById('reset-all');
  const resetLessonBtn = document.getElementById('reset-lesson');

  applyTheme(state.theme);
  initEventHandlers();
  renderAll();

  function buildDefaultState() {
    const lessonsState = {};
    for (const lesson of LESSONS) {
      lessonsState[lesson.id] = {
        inputDrafts: buildDefaultDrafts(lesson),
        revealedHints: [],
        progress: 'not-started',
        mode: 'tabulation',
        statePattern: lesson.statePatterns[0]?.id || 'default',
        stateVars: {
          i: 'i',
          j: 'j',
          meaning: lesson.statePatterns[0]?.meaning || 'Define dp state meaning here.'
        },
        baseCases: lesson.statePatterns[0]?.baseCases || [],
        transitionText: lesson.transitionTemplate,
        showReconstruction: false,
        knapsackView: '2d',
        knapsackDirection: 'desc',
        exampleStatus: {},
        lastExampleId: null
      };
    }
    return {
      theme: 'light',
      selectedLessonId: LESSONS[0]?.id || null,
      lessons: lessonsState
    };
  }

  function createRuntimeState() {
    return {
      runState: 'Editing',
      steps: [],
      index: -1,
      snapshots: [],
      table: null,
      tableMeta: null,
      output: null,
      expected: null,
      reconstructionPath: null,
      indexStepTarget: null,
      playing: false,
      timer: null,
      speed: 5,
      validationErrors: []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return mergeState(parsed, defaultState);
    } catch (err) {
      console.warn('Failed to load state', err);
      return null;
    }
  }

  function mergeState(saved, defaults) {
    const merged = structuredClone(defaults);
    if (saved && typeof saved === 'object') {
      merged.theme = saved.theme || merged.theme;
      merged.selectedLessonId = saved.selectedLessonId || merged.selectedLessonId;
      for (const [id, lessonState] of Object.entries(saved.lessons || {})) {
        if (!merged.lessons[id]) continue;
        merged.lessons[id] = {
          ...merged.lessons[id],
          ...lessonState,
          inputDrafts: { ...merged.lessons[id].inputDrafts, ...(lessonState.inputDrafts || {}) },
          stateVars: { ...merged.lessons[id].stateVars, ...(lessonState.stateVars || {}) }
        };
      }
    }
    return merged;
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to persist state', err);
    }
  }

  function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
  }

  function initEventHandlers() {
    themeToggle.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
      persistState();
    });

    resetAllBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });

    resetLessonBtn.addEventListener('click', () => {
      const lesson = getSelectedLesson();
      if (!lesson) return;
      state.lessons[lesson.id] = buildDefaultState().lessons[lesson.id];
      runtime.runState = 'Editing';
      clearRuntime();
      persistState();
      renderAll();
    });
  }

  function getSelectedLesson() {
    return lessonMap.get(state.selectedLessonId);
  }

  function getLessonState(lessonId) {
    return state.lessons[lessonId];
  }

  function renderAll() {
    renderNav();
    renderLessonHeader();
    renderProblem();
    renderInputEditor();
    renderHints();
    renderStateBuilder();
    renderTransitionBuilder();
    renderVisualization();
    renderCodePlayground();
    renderExamples();
  }

  function renderNav() {
    navEl.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'lesson-list';
    for (const lesson of LESSONS) {
      const lessonState = getLessonState(lesson.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `lesson-card ${lesson.id === state.selectedLessonId ? 'active' : ''}`;
      card.addEventListener('click', () => {
        state.selectedLessonId = lesson.id;
        runtime.runState = 'Editing';
        clearRuntime();
        persistState();
        renderAll();
      });

      const title = document.createElement('div');
      title.textContent = `${lesson.id}: ${lesson.title}`;
      title.className = 'lesson-title-text';

      const meta = document.createElement('div');
      meta.className = 'lesson-meta';

      const difficulty = document.createElement('span');
      difficulty.className = 'difficulty';
      difficulty.textContent = `Difficulty ${lesson.difficulty}`;

      const badge = document.createElement('span');
      badge.className = `badge ${lessonState.progress}`;
      badge.textContent = lessonState.progress.replace('-', ' ');

      meta.append(difficulty, badge);
      card.append(title, meta);
      list.append(card);
    }
    navEl.append(list);
  }

  function renderLessonHeader() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    titleEl.innerHTML = `
      <div class="inline-actions">
        <h2>${lesson.title}</h2>
        <span class="tag">${lesson.id}</span>
        <span class="tag">Mode: ${getLessonState(lesson.id).mode}</span>
        <span class="tag">Run: ${runtime.runState}</span>
      </div>
      <p>${lesson.ioFormat}</p>
    `;
  }

  function renderProblem() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const text = lesson.problemText
      .split('\n\n')
      .map((para) => `<p>${para}</p>`)
      .join('');
    problemEl.innerHTML = text;
  }

  function renderInputEditor() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    const schema = lesson.inputSchema;
    const disableEditing = runtime.runState === 'Running' || runtime.runState === 'Paused';
    const validation = validateInputs(lesson, lessonState.inputDrafts);
    runtime.validationErrors = [...validation.errors];
    updateReadyState(validation);

    inputEl.innerHTML = '';
    const form = document.createElement('div');
    form.className = 'form-grid';

    for (const field of schema.fields) {
      const row = document.createElement('div');
      row.className = 'form-row';

      const label = document.createElement('label');
      label.textContent = field.label;
      label.setAttribute('for', `input-${field.key}`);

      let control;
      const draftValue = lessonState.inputDrafts[field.key] ?? '';

      if (field.ui === 'slider') {
        const wrap = document.createElement('div');
        wrap.className = 'inline-actions';

        const range = document.createElement('input');
        range.type = 'range';
        range.id = `input-${field.key}`;
        range.min = field.min;
        range.max = field.max;
        range.value = draftValue;
        range.disabled = disableEditing;

        const number = document.createElement('input');
        number.type = 'number';
        number.min = field.min;
        number.max = field.max;
        number.value = draftValue;
        number.disabled = disableEditing;

        const updateBoth = (value) => {
          lessonState.inputDrafts[field.key] = value;
          range.value = value;
          number.value = value;
          markEditing();
        };

        range.addEventListener('input', (event) => updateBoth(event.target.value));
        number.addEventListener('input', (event) => updateBoth(event.target.value));

        wrap.append(range, number);
        control = wrap;
      } else if (field.type === 'int' || field.type === 'string') {
        const input = document.createElement('input');
        input.type = field.type === 'int' ? 'number' : 'text';
        input.id = `input-${field.key}`;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        input.value = draftValue;
        input.disabled = disableEditing;
        input.addEventListener('input', (event) => {
          lessonState.inputDrafts[field.key] = event.target.value;
          markEditing();
        });
        control = input;
      } else if (field.type === 'intArray' || field.type === 'coinSet' || field.type === 'stringSet' || field.type === 'gridInt' || field.type === 'gridBool') {
        const textarea = document.createElement('textarea');
        textarea.id = `input-${field.key}`;
        textarea.value = draftValue;
        textarea.disabled = disableEditing;
        textarea.addEventListener('input', (event) => {
          lessonState.inputDrafts[field.key] = event.target.value;
          markEditing();
        });
        control = textarea;
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `input-${field.key}`;
        input.value = draftValue;
        input.disabled = disableEditing;
        input.addEventListener('input', (event) => {
          lessonState.inputDrafts[field.key] = event.target.value;
          markEditing();
        });
        control = input;
      }

      row.append(label, control);
      if (validation.fieldErrors[field.key]) {
        const error = document.createElement('div');
        error.className = 'error-text';
        error.textContent = validation.fieldErrors[field.key];
        row.append(error);
      }
      if (field.help) {
        const help = document.createElement('div');
        help.className = 'hint-type';
        help.textContent = field.help;
        row.append(help);
      }

      form.append(row);
    }

    if (schema.allowRandomize) {
      const actions = document.createElement('div');
      actions.className = 'inline-actions';
      const button = document.createElement('button');
      button.className = 'btn btn-ghost';
      button.type = 'button';
      button.textContent = 'Randomize within bounds';
      button.disabled = disableEditing;
      button.addEventListener('click', () => {
        lessonState.inputDrafts = randomizeInputs(lesson);
        markEditing();
        renderInputEditor();
      });
      actions.append(button);
      form.append(actions);
    }

    const extraErrors = validation.errors.filter((err) => !Object.values(validation.fieldErrors).includes(err));
    if (extraErrors.length) {
      const error = document.createElement('div');
      error.className = 'error-text';
      error.textContent = extraErrors[0];
      form.append(error);
    }

    inputEl.append(form);
  }

  function renderHints() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    hintsEl.innerHTML = '';

    lesson.hints.forEach((hint, index) => {
      const wrap = document.createElement('div');
      wrap.className = `hint-level ${lessonState.revealedHints.includes(index) ? 'revealed' : ''}`;

      const header = document.createElement('div');
      header.className = 'inline-actions';

      const type = document.createElement('div');
      type.className = 'hint-type';
      type.textContent = `${hint.level}`;

      const btn = document.createElement('button');
      btn.className = 'btn btn-ghost';
      btn.type = 'button';
      btn.textContent = lessonState.revealedHints.includes(index) ? 'Revealed' : 'Reveal';
      btn.disabled = lessonState.revealedHints.includes(index);
      btn.addEventListener('click', () => {
        lessonState.revealedHints.push(index);
        lessonState.progress = lessonState.progress === 'not-started' ? 'in-progress' : lessonState.progress;
        persistState();
        renderHints();
        renderNav();
      });

      header.append(type, btn);
      wrap.append(header);

      if (lessonState.revealedHints.includes(index)) {
        const body = document.createElement('div');
        body.innerHTML = hint.text.map((para) => `<p>${para}</p>`).join('');
        wrap.append(body);
      }
      hintsEl.append(wrap);
    });
  }

  function renderStateBuilder() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    const disableEditing = runtime.runState === 'Running' || runtime.runState === 'Paused';
    stateEl.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'builder-grid';

    if (lesson.statePatterns.length > 1) {
      const row = document.createElement('div');
      row.className = 'form-row';

      const label = document.createElement('label');
      label.textContent = 'State pattern';

      const select = document.createElement('select');
      for (const pattern of lesson.statePatterns) {
        const option = document.createElement('option');
        option.value = pattern.id;
        option.textContent = pattern.label;
        if (pattern.id === lessonState.statePattern) option.selected = true;
        select.append(option);
      }
      select.disabled = disableEditing;
      select.addEventListener('change', (event) => {
        lessonState.statePattern = event.target.value;
        const pattern = lesson.statePatterns.find((p) => p.id === event.target.value);
        if (pattern) {
          lessonState.stateVars.meaning = pattern.meaning;
          lessonState.baseCases = pattern.baseCases;
        }
        markEditing();
        renderStateBuilder();
      });

      row.append(label, select);
      grid.append(row);
    }

    const varsRow = document.createElement('div');
    varsRow.className = 'form-row';
    const varsLabel = document.createElement('label');
    varsLabel.textContent = 'Variable names';
    const varsWrap = document.createElement('div');
    varsWrap.className = 'inline-actions';
    const varI = document.createElement('input');
    varI.type = 'text';
    varI.value = lessonState.stateVars.i;
    varI.disabled = disableEditing;
    varI.addEventListener('input', (event) => {
      lessonState.stateVars.i = event.target.value || 'i';
      markEditing();
    });
    varsWrap.append(document.createTextNode('i: '), varI);

    if (lesson.visualizationSpec.tableType === '2D') {
      const varJ = document.createElement('input');
      varJ.type = 'text';
      varJ.value = lessonState.stateVars.j;
      varJ.disabled = disableEditing;
      varJ.addEventListener('input', (event) => {
        lessonState.stateVars.j = event.target.value || 'j';
        markEditing();
      });
      varsWrap.append(document.createTextNode('j: '), varJ);
    }

    varsRow.append(varsLabel, varsWrap);
    grid.append(varsRow);

    const meaningRow = document.createElement('div');
    meaningRow.className = 'form-row';
    const meaningLabel = document.createElement('label');
    meaningLabel.textContent = 'dp meaning statement';
    const meaningText = document.createElement('textarea');
    meaningText.value = lessonState.stateVars.meaning;
    meaningText.disabled = disableEditing;
    meaningText.addEventListener('input', (event) => {
      lessonState.stateVars.meaning = event.target.value;
      markEditing();
    });
    meaningRow.append(meaningLabel, meaningText);
    grid.append(meaningRow);

    const baseRow = document.createElement('div');
    baseRow.className = 'form-row';
    const baseLabel = document.createElement('label');
    baseLabel.textContent = 'Base cases';
    const baseList = document.createElement('div');
    baseList.className = 'state-grid';
    for (const base of lessonState.baseCases) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = base;
      baseList.append(tag);
    }
    baseRow.append(baseLabel, baseList);
    grid.append(baseRow);

    const previewRow = document.createElement('div');
    previewRow.className = 'form-row';
    const previewLabel = document.createElement('label');
    previewLabel.textContent = 'Dependency preview';
    const preview = renderDependencyPreview(lesson.visualizationSpec.dependencyOffsets);
    previewRow.append(previewLabel, preview);
    grid.append(previewRow);

    stateEl.append(grid);
  }

  function renderTransitionBuilder() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    const disableEditing = runtime.runState === 'Running' || runtime.runState === 'Paused';
    transitionEl.innerHTML = '';

    const validation = validateTransition(lesson, lessonState.transitionText);

    const grid = document.createElement('div');
    grid.className = 'form-grid';

    const row = document.createElement('div');
    row.className = 'form-row';
    const label = document.createElement('label');
    label.textContent = 'Transition template';
    const textarea = document.createElement('textarea');
    textarea.value = lessonState.transitionText;
    textarea.disabled = disableEditing;
    textarea.addEventListener('input', (event) => {
      lessonState.transitionText = event.target.value;
      markEditing();
      renderTransitionBuilder();
    });
    row.append(label, textarea);
    if (validation.error) {
      const error = document.createElement('div');
      error.className = 'error-text';
      error.textContent = validation.error;
      row.append(error);
    }
    grid.append(row);

    const allowed = document.createElement('div');
    allowed.className = 'form-row';
    const allowedLabel = document.createElement('label');
    allowedLabel.textContent = 'Allowed references';
    const allowedBody = document.createElement('div');
    allowedBody.className = 'state-grid';
    for (const ref of validation.allowedRefs) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = ref;
      allowedBody.append(tag);
    }
    allowed.append(allowedLabel, allowedBody);
    grid.append(allowed);

    const actions = document.createElement('div');
    actions.className = 'inline-actions';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-ghost';
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset to Default Transition';
    resetBtn.disabled = disableEditing;
    resetBtn.addEventListener('click', () => {
      lessonState.transitionText = lesson.transitionTemplate;
      markEditing();
      renderTransitionBuilder();
    });
    actions.append(resetBtn);
    grid.append(actions);

    transitionEl.append(grid);
  }

  function renderVisualization() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    const validation = validateInputs(lesson, lessonState.inputDrafts);
    const transitionValidation = validateTransition(lesson, lessonState.transitionText);

    if (transitionValidation.error) {
      runtime.validationErrors = [transitionValidation.error];
    }
    updateReadyState(validation, transitionValidation);

    const controls = buildControls(lesson, validation, transitionValidation);
    vizControlsEl.innerHTML = '';
    vizControlsEl.append(controls);

    vizStatusEl.textContent = `State: ${runtime.runState}`;
    if (runtime.runState === 'Error' && runtime.validationErrors.length) {
      vizStatusEl.textContent = `State: Error — ${runtime.validationErrors[0]}`;
    }
    vizOutputEl.textContent = '';
    if (runtime.output !== null) {
      if (runtime.expected !== null && runtime.runState === 'Completed') {
        const pass = isDeepEqual(runtime.output, runtime.expected);
        vizOutputEl.textContent = `Output: ${formatValue(runtime.output)} | Expected: ${formatValue(runtime.expected)} | ${pass ? 'Pass' : 'Fail'}`;
      } else {
        vizOutputEl.textContent = `Output: ${formatValue(runtime.output)}`;
      }
    }

    if (!runtime.table) {
      vizAreaEl.innerHTML = '<div class="hint-type">No visualization yet. Adjust inputs, then Run or Step.</div>';
      vizSecondaryEl.innerHTML = '';
      return;
    }

    vizAreaEl.innerHTML = '';
    vizAreaEl.append(renderDpTable(runtime.table, runtime.tableMeta, runtime.steps[runtime.index]));

    vizSecondaryEl.innerHTML = '';
    if (lesson.id === 'dp-01') {
      vizSecondaryEl.append(renderStaircase(runtime.tableMeta.cols - 1, runtime.indexStepTarget));
    }

    if (lesson.id === 'dp-12' && lessonState.knapsackView === '1d') {
      const pitfall = document.createElement('div');
      pitfall.className = 'hint-type';
      pitfall.textContent = 'Pitfall demo: weights [3], values [4], W=6. Descending w gives 4. Ascending w incorrectly allows 8 (reusing the same item).';
      vizSecondaryEl.append(pitfall);
    }

    if (lessonState.showReconstruction && runtime.reconstructionPath) {
      const recon = document.createElement('div');
      recon.className = 'hint-type';
      recon.textContent = `Reconstruction path: ${runtime.reconstructionPath.join(' -> ')}`;
      vizSecondaryEl.append(recon);
    }
  }

  function buildControls(lesson, validation, transitionValidation) {
    const wrap = document.createElement('div');
    wrap.className = 'inline-actions';
    const canRun = validation.errors.length === 0 && !transitionValidation.error;
    const lessonState = getLessonState(lesson.id);

    const runBtn = makeControlButton('Run', () => startRun(lesson, validation.parsed));
    runBtn.disabled = !canRun || runtime.runState === 'Running';

    const stepBtn = makeControlButton('Step', () => stepForward());
    stepBtn.disabled = !canRun || runtime.runState === 'Editing' || runtime.runState === 'Ready' || runtime.runState === 'Error' || runtime.runState === 'Completed' || runtime.index >= runtime.steps.length - 1;

    const backBtn = makeControlButton('Back', () => stepBack());
    backBtn.disabled = !runtime.snapshots.length || runtime.index <= 0 || runtime.runState === 'Editing' || runtime.runState === 'Ready';
    if (backBtn.disabled) backBtn.title = 'Back requires snapshots';

    const playBtn = makeControlButton('Play', () => play());
    playBtn.disabled = !canRun || runtime.runState !== 'Paused';

    const pauseBtn = makeControlButton('Pause', () => pause());
    pauseBtn.disabled = runtime.runState !== 'Running';

    const stopBtn = makeControlButton('Stop', () => stopRun());
    stopBtn.disabled = runtime.runState !== 'Running' && runtime.runState !== 'Paused';

    const resetBtn = makeControlButton('Reset', () => resetRun());

    const speedSelect = document.createElement('select');
    [1, 2, 5, 10].forEach((speed) => {
      const option = document.createElement('option');
      option.value = speed;
      option.textContent = `${speed}x`;
      if (runtime.speed === speed) option.selected = true;
      speedSelect.append(option);
    });
    speedSelect.addEventListener('change', (event) => {
      runtime.speed = Number(event.target.value);
      if (runtime.runState === 'Running') {
        pause();
        play();
      }
    });

    wrap.append(runBtn, stepBtn, backBtn, playBtn, pauseBtn, stopBtn, resetBtn);

    const speedWrap = document.createElement('div');
    speedWrap.className = 'inline-actions';
    speedWrap.append(document.createTextNode('Speed:'), speedSelect);
    wrap.append(speedWrap);

    if (lesson.supportsReconstruction) {
      const reconToggle = document.createElement('button');
      reconToggle.className = 'btn btn-ghost';
      reconToggle.type = 'button';
      reconToggle.textContent = getLessonState(lesson.id).showReconstruction ? 'Hide reconstruction' : 'Show reconstruction';
      reconToggle.addEventListener('click', () => {
        const lessonState = getLessonState(lesson.id);
        lessonState.showReconstruction = !lessonState.showReconstruction;
        persistState();
        renderVisualization();
      });
      wrap.append(reconToggle);
    }

    if (lesson.id === 'dp-12') {
      const viewToggle = document.createElement('button');
      viewToggle.className = 'btn btn-ghost';
      viewToggle.type = 'button';
      viewToggle.textContent = lessonState.knapsackView === '2d' ? 'Switch to 1D view' : 'Switch to 2D view';
      viewToggle.addEventListener('click', () => {
        lessonState.knapsackView = lessonState.knapsackView === '2d' ? '1d' : '2d';
        markEditing();
        renderVisualization();
      });
      wrap.append(viewToggle);

      if (lessonState.knapsackView === '1d') {
        const direction = document.createElement('select');
        ['desc', 'asc'].forEach((dir) => {
          const option = document.createElement('option');
          option.value = dir;
          option.textContent = dir === 'desc' ? 'Descending w' : 'Ascending w (pitfall)';
          if (lessonState.knapsackDirection === dir) option.selected = true;
          direction.append(option);
        });
        direction.addEventListener('change', (event) => {
          lessonState.knapsackDirection = event.target.value;
          markEditing();
          renderVisualization();
        });
        wrap.append(direction);
      }
    }

    return wrap;
  }

  function makeControlButton(label, handler) {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.textContent = label;
    btn.addEventListener('click', handler);
    return btn;
  }

  function renderCodePlayground() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    codeEl.innerHTML = '';

    const tabs = document.createElement('div');
    tabs.className = 'code-tabs';
    const tabButtons = ['tabulation', 'memoization'].map((mode) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-btn ${lessonState.mode === mode ? 'active' : ''}`;
      btn.textContent = mode === 'tabulation' ? 'Tabulation' : 'Memoization';
      btn.addEventListener('click', () => {
        lessonState.mode = mode;
        persistState();
        renderLessonHeader();
        renderCodePlayground();
      });
      return btn;
    });
    tabButtons.forEach((btn) => tabs.append(btn));

    const note = document.createElement('div');
    note.className = 'code-note';
    note.textContent = 'Visualization run uses the template engine. Code is read-only and provided for study.';

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = lesson.codeTemplates[lessonState.mode];
    pre.append(code);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-ghost';
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy code';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(code.textContent).catch(() => {
        alert('Copy failed.');
      });
    });

    codeEl.append(tabs, note, pre, copyBtn);
  }

  function renderExamples() {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);

    examplesEl.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'examples';

    lesson.examples.forEach((example, index) => {
      const card = document.createElement('div');
      card.className = 'example-card';
      const header = document.createElement('div');
      header.innerHTML = `<strong>Example ${index + 1}</strong>`;
      const body = document.createElement('div');
      body.innerHTML = `
        <div><strong>Input:</strong> ${formatExampleInput(example.input)}</div>
        <div><strong>Expected output:</strong> ${formatValue(example.output)}</div>
      `;

      const btn = document.createElement('button');
      btn.className = 'btn btn-ghost';
      btn.type = 'button';
      btn.textContent = 'Run example';
      btn.addEventListener('click', () => {
        lessonState.inputDrafts = toDraftsFromInput(lesson, example.input);
        runtime.expected = example.output;
        lessonState.lastExampleId = index;
        runtime.runState = 'Editing';
        clearRuntime();
        persistState();
        renderAll();
      });

      if (lessonState.exampleStatus[index]) {
        const status = document.createElement('span');
        status.className = `badge ${lessonState.exampleStatus[index] === 'pass' ? 'pass' : 'fail'}`;
        status.textContent = lessonState.exampleStatus[index];
        body.append(status);
      }

      card.append(header, body, btn);
      wrap.append(card);
    });

    const selfCheck = document.createElement('div');
    selfCheck.className = 'self-check';
    const title = document.createElement('h3');
    title.textContent = 'Self-check';
    selfCheck.append(title);

    lesson.selfCheck.forEach((question, index) => {
      const qWrap = document.createElement('div');
      qWrap.className = 'question';
      const label = document.createElement('div');
      label.textContent = `${index + 1}. ${question.prompt}`;
      qWrap.append(label);

      if (question.type === 'mc') {
        question.options.forEach((option) => {
          const optWrap = document.createElement('label');
          optWrap.className = 'inline-actions';
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `q-${lesson.id}-${index}`;
          radio.value = option;
          radio.addEventListener('change', () => {
            const feedback = qWrap.querySelector('.hint-type');
            if (option === question.answer) {
              feedback.textContent = 'Correct.';
              feedback.style.color = 'var(--success)';
            } else {
              feedback.textContent = `Not quite. Answer: ${question.answer}`;
              feedback.style.color = 'var(--danger)';
            }
          });
          optWrap.append(radio, document.createTextNode(option));
          qWrap.append(optWrap);
        });
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.addEventListener('input', () => {
          const feedback = qWrap.querySelector('.hint-type');
          if (input.value.trim() === String(question.answer)) {
            feedback.textContent = 'Correct.';
            feedback.style.color = 'var(--success)';
          } else {
            feedback.textContent = 'Keep trying.';
            feedback.style.color = 'var(--warning)';
          }
        });
        qWrap.append(input);
      }

      const feedback = document.createElement('div');
      feedback.className = 'hint-type';
      feedback.textContent = '';
      qWrap.append(feedback);
      selfCheck.append(qWrap);
    });

    examplesEl.append(wrap, selfCheck);
  }

  function updateReadyState(validation, transitionValidation = { error: null }) {
    if (runtime.runState === 'Running' || runtime.runState === 'Paused') {
      return;
    }
    const hasErrors = validation.errors.length > 0 || transitionValidation.error;
    if (hasErrors) {
      runtime.runState = 'Error';
    } else if (runtime.runState === 'Editing' || runtime.runState === 'Error') {
      runtime.runState = 'Ready';
    }
  }

  function markEditing() {
    runtime.runState = 'Editing';
    clearRuntime();
    const lesson = getSelectedLesson();
    if (lesson) {
      const lessonState = getLessonState(lesson.id);
      if (lessonState.progress === 'not-started') {
        lessonState.progress = 'in-progress';
      }
      lessonState.lastExampleId = null;
    }
    runtime.expected = null;
    persistState();
    renderAll();
  }

  function clearRuntime() {
    if (runtime.timer) {
      clearInterval(runtime.timer);
      runtime.timer = null;
    }
    runtime.steps = [];
    runtime.index = -1;
    runtime.snapshots = [];
    runtime.table = null;
    runtime.tableMeta = null;
    runtime.output = null;
    runtime.reconstructionPath = null;
    runtime.playing = false;
  }

  function startRun(lesson, parsedInput) {
    const lessonState = getLessonState(lesson.id);
    const mode = lessonState.mode;

    clearRuntime();
    const result = lesson.computeSteps(parsedInput, mode, lessonState);
    runtime.steps = result.steps;
    runtime.table = result.initialTable;
    runtime.tableMeta = result.tableMeta;
    runtime.output = null;
    runtime.reconstructionPath = result.reconstructionPath || null;
    runtime.indexStepTarget = null;

    runtime.runState = 'Running';
    play();
  }

  function applyStep(step) {
    if (!step || !runtime.table) return;
    const { target, writeValue, status } = step;
    runtime.table[target.r][target.c].value = writeValue;
    runtime.table[target.r][target.c].status = status;
  }

  function snapshotTable() {
    const values = runtime.table.map((row) => row.map((cell) => cell.value));
    const statuses = runtime.table.map((row) => row.map((cell) => cell.status));
    runtime.snapshots[runtime.index] = { values, statuses };
  }

  function restoreSnapshot(index) {
    const snap = runtime.snapshots[index];
    if (!snap) return;
    for (let r = 0; r < runtime.table.length; r += 1) {
      for (let c = 0; c < runtime.table[r].length; c += 1) {
        runtime.table[r][c].value = snap.values[r][c];
        runtime.table[r][c].status = snap.statuses[r][c];
      }
    }
  }

  function stepForward() {
    if (!runtime.steps.length) return;
    if (runtime.index >= runtime.steps.length - 1) {
      finishRun();
      return;
    }
    runtime.index += 1;
    const step = runtime.steps[runtime.index];
    runtime.indexStepTarget = step.target;
    applyStep(step);
    snapshotTable();
    if (runtime.index === runtime.steps.length - 1) {
      finishRun();
    } else {
      runtime.runState = 'Running';
    }
    renderVisualization();
  }

  function stepBack() {
    if (runtime.index <= 0) return;
    runtime.index -= 1;
    restoreSnapshot(runtime.index);
    runtime.runState = 'Paused';
    renderVisualization();
  }

  function play() {
    if (runtime.runState === 'Editing' || runtime.runState === 'Error') return;
    runtime.runState = 'Running';
    if (runtime.timer) clearInterval(runtime.timer);
    const interval = prefersReducedMotion ? 0 : Math.max(1000 / runtime.speed, 60);
    if (interval === 0) {
      while (runtime.index < runtime.steps.length - 1) {
        stepForward();
      }
      return;
    }
    runtime.timer = setInterval(() => {
      if (runtime.index >= runtime.steps.length - 1) {
        finishRun();
        return;
      }
      stepForward();
    }, interval);
  }

  function pause() {
    if (runtime.timer) {
      clearInterval(runtime.timer);
      runtime.timer = null;
    }
    runtime.runState = 'Paused';
    renderVisualization();
  }

  function stopRun() {
    if (runtime.timer) {
      clearInterval(runtime.timer);
      runtime.timer = null;
    }
    runtime.runState = 'Ready';
    renderVisualization();
  }

  function resetRun() {
    runtime.runState = 'Editing';
    clearRuntime();
    renderVisualization();
  }

  function finishRun() {
    if (runtime.timer) {
      clearInterval(runtime.timer);
      runtime.timer = null;
    }
    runtime.runState = 'Completed';
    const lesson = getSelectedLesson();
    if (lesson && runtime.steps.length) {
      runtime.output = lesson.outputExtractor(runtime.table, runtime.tableMeta);
      checkExampleResult(runtime.output);
    }
    renderVisualization();
  }

  function checkExampleResult(output) {
    const lesson = getSelectedLesson();
    if (!lesson) return;
    const lessonState = getLessonState(lesson.id);
    if (lessonState.lastExampleId === null) return;
    const expected = runtime.expected;
    const pass = isDeepEqual(output, expected);
    lessonState.exampleStatus[lessonState.lastExampleId] = pass ? 'pass' : 'fail';
    lessonState.progress = pass ? 'completed' : lessonState.progress === 'not-started' ? 'in-progress' : lessonState.progress;
    persistState();
    renderNav();
  }

  function validateInputs(lesson, drafts) {
    const parsed = {};
    const errors = [];
    const fieldErrors = {};

    for (const field of lesson.inputSchema.fields) {
      const raw = drafts[field.key];
      const result = parseField(field, raw);
      if (result.error) {
        errors.push(result.error);
        fieldErrors[field.key] = result.error;
      } else {
        parsed[field.key] = result.value;
      }
    }

    if (errors.length === 0 && typeof lesson.validateInput === 'function') {
      const extraError = lesson.validateInput(parsed);
      if (extraError) {
        errors.push(extraError);
      }
    }

    return { parsed, errors, fieldErrors };
  }

  function parseField(field, raw) {
    if (field.type === 'int') {
      const value = Number(raw);
      if (!Number.isInteger(value)) return { error: 'Must be an integer.' };
      if (field.min !== undefined && value < field.min) return { error: `Minimum is ${field.min}.` };
      if (field.max !== undefined && value > field.max) return { error: `Maximum is ${field.max}.` };
      return { value };
    }
    if (field.type === 'string') {
      const value = String(raw || '').trim();
      if (field.minLength && value.length < field.minLength) return { error: `Minimum length is ${field.minLength}.` };
      if (field.maxLength && value.length > field.maxLength) return { error: `Maximum length is ${field.maxLength}.` };
      if (field.pattern && !field.pattern.test(value)) return { error: field.patternMessage || 'Invalid format.' };
      return { value };
    }
    if (field.type === 'intArray' || field.type === 'coinSet') {
      const cleaned = String(raw || '').trim();
      if (!cleaned) return { error: 'Enter at least one number.' };
      const parts = cleaned.split(/[,\s]+/).filter(Boolean);
      const values = parts.map((part) => Number(part));
      if (values.some((val) => !Number.isInteger(val))) return { error: 'All values must be integers.' };
      if (field.min !== undefined && values.some((val) => val < field.min)) return { error: `Values must be >= ${field.min}.` };
      if (field.max !== undefined && values.some((val) => val > field.max)) return { error: `Values must be <= ${field.max}.` };
      if (field.minLength && values.length < field.minLength) return { error: `Need at least ${field.minLength} numbers.` };
      if (field.maxLength && values.length > field.maxLength) return { error: `At most ${field.maxLength} numbers.` };
      if (field.unique) {
        const set = new Set(values);
        if (set.size !== values.length) return { error: 'Values must be unique.' };
      }
      return { value: values };
    }
    if (field.type === 'stringSet') {
      const cleaned = String(raw || '').trim();
      if (!cleaned) return { error: 'Enter at least one word.' };
      const parts = cleaned.split(/[,\s]+/).filter(Boolean);
      if (field.minLength && parts.length < field.minLength) return { error: `Need at least ${field.minLength} words.` };
      if (field.maxLength && parts.length > field.maxLength) return { error: `At most ${field.maxLength} words.` };
      if (field.pattern && parts.some((word) => !field.pattern.test(word))) return { error: field.patternMessage || 'Invalid word.' };
      return { value: parts };
    }
    if (field.type === 'gridInt' || field.type === 'gridBool') {
      const cleaned = String(raw || '').trim();
      if (!cleaned) return { error: 'Enter rows separated by new lines.' };
      const rows = cleaned.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const grid = rows.map((line) => line.split(/[,\s]+/).filter(Boolean));
      if (grid.some((row) => row.length === 0)) return { error: 'Each row needs values.' };
      const width = grid[0].length;
      if (grid.some((row) => row.length !== width)) return { error: 'All rows must have the same length.' };
      if (field.maxRows && grid.length > field.maxRows) return { error: `Max rows ${field.maxRows}.` };
      if (field.maxCols && width > field.maxCols) return { error: `Max cols ${field.maxCols}.` };
      if (field.minRows && grid.length < field.minRows) return { error: `Min rows ${field.minRows}.` };
      if (field.minCols && width < field.minCols) return { error: `Min cols ${field.minCols}.` };

      if (field.type === 'gridBool') {
        const values = grid.map((row) => row.map((cell) => Number(cell)));
        if (values.some((row) => row.some((cell) => cell !== 0 && cell !== 1))) return { error: 'Use 0 or 1 only.' };
        return { value: values };
      }

      const values = grid.map((row) => row.map((cell) => Number(cell)));
      if (values.some((row) => row.some((cell) => !Number.isFinite(cell)))) return { error: 'All values must be numbers.' };
      if (field.min !== undefined && values.some((row) => row.some((cell) => cell < field.min))) return { error: `Values must be >= ${field.min}.` };
      if (field.max !== undefined && values.some((row) => row.some((cell) => cell > field.max))) return { error: `Values must be <= ${field.max}.` };
      return { value: values };
    }

    return { error: 'Unsupported field.' };
  }

  function randomizeInputs(lesson) {
    const drafts = {};
    let sharedLength = null;
    for (const field of lesson.inputSchema.fields) {
      if (field.type === 'int') {
        const value = randInt(field.min, field.max);
        drafts[field.key] = String(value);
      } else if (field.type === 'string') {
        drafts[field.key] = randomString(field.minLength || 1, field.maxLength || 6, field.alphabet || 'abcde');
      } else if (field.type === 'intArray' || field.type === 'coinSet') {
        let len = randInt(field.minLength || 1, field.maxLength || 6);
        if (lesson.id === 'dp-12' && (field.key === 'weights' || field.key === 'values')) {
          if (sharedLength === null) sharedLength = len;
          len = sharedLength;
        }
        const arr = [];
        while (arr.length < len) {
          const value = randInt(field.min, field.max);
          if (field.unique && arr.includes(value)) continue;
          arr.push(value);
        }
        drafts[field.key] = arr.join(' ');
      } else if (field.type === 'stringSet') {
        const len = randInt(field.minLength || 1, field.maxLength || 6);
        const words = [];
        for (let i = 0; i < len; i += 1) {
          words.push(randomString(2, 5, field.alphabet || 'abcde'));
        }
        drafts[field.key] = words.join(' ');
      } else if (field.type === 'gridBool' || field.type === 'gridInt') {
        const rows = randInt(field.minRows || 2, field.maxRows || 5);
        const cols = randInt(field.minCols || 2, field.maxCols || 5);
        const grid = [];
        for (let r = 0; r < rows; r += 1) {
          const row = [];
          for (let c = 0; c < cols; c += 1) {
            if (field.type === 'gridBool') {
              row.push(Math.random() < 0.2 ? 1 : 0);
            } else {
              row.push(randInt(field.min, field.max));
            }
          }
          grid.push(row.join(' '));
        }
        drafts[field.key] = grid.join('\n');
      }
    }
    return drafts;
  }

  function validateTransition(lesson, text) {
    const allowedRefs = buildAllowedRefs(lesson.visualizationSpec);
    const error = getTransitionError(lesson.visualizationSpec, text, allowedRefs);
    return { allowedRefs, error };
  }

  function buildAllowedRefs(spec) {
    if (spec.tableType === '1D') {
      if (spec.dependencyOffsets === 'allPrevious') {
        return ['dp[i]', 'dp[j] (j<i)'];
      }
      return ['dp[i]', ...spec.dependencyOffsets.map((offset) => `dp[i${offset >= 0 ? '+' : ''}${offset}]`)];
    }
    if (spec.dependencyOffsets === 'allPrevious2D') {
      return ['dp[i][j]', 'dp[i-1][j]', 'dp[i][j-1]', 'dp[i-1][j-1]'];
    }
    return ['dp[i][j]', ...spec.dependencyOffsets.map((offset) => `dp[i${formatOffset(offset.dr)}][j${formatOffset(offset.dc)}]`)];
  }

  function formatOffset(offset) {
    if (!offset) return '';
    return offset > 0 ? `+${offset}` : `${offset}`;
  }

  function getTransitionError(spec, text, allowedRefs) {
    const parts = text.split('=');
    if (parts.length !== 2) return 'Transition must contain exactly one "=".';
    const lhs = parts[0];
    const rhs = parts[1];
    if (spec.tableType === '1D') {
      const lhsMatch = lhs.match(/dp\s*\[\s*i\s*\]/);
      if (!lhsMatch) return 'Left side must write to dp[i].';
      const refs = [...rhs.matchAll(/dp\s*\[\s*([a-z])\s*([+-]\s*\d+)?\s*\]/g)];
      if (!refs.length && spec.dependencyOffsets !== 'allPrevious') return 'Right side must read at least one dp cell.';
      for (const ref of refs) {
        const varName = ref[1];
        if (spec.dependencyOffsets === 'allPrevious') {
          if (varName !== 'j' && varName !== 'i') return 'Use i or j for dp references.';
          continue;
        }
        if (varName !== 'i') return 'Only dp[i +/- k] references are allowed.';
        const offset = ref[2] ? Number(ref[2].replace(/\s+/g, '')) : 0;
        if (!spec.dependencyOffsets.includes(offset)) return `Reference dp[i${offset >= 0 ? '+' : ''}${offset}] is not allowed.`;
      }
      return null;
    }

    const lhsMatch = lhs.match(/dp\s*\[\s*i\s*(?:[+-]\s*\d+)?\s*\]\s*\[\s*j\s*(?:[+-]\s*\d+)?\s*\]/);
    if (!lhsMatch) return 'Left side must write to dp[i][j].';

    const refs = [...rhs.matchAll(/dp\s*\[\s*i\s*([+-]\s*\d+)?\s*\]\s*\[\s*j\s*([+-]\s*\d+)?\s*\]/g)];
    if (!refs.length && spec.dependencyOffsets !== 'allPrevious2D') return 'Right side must read at least one dp cell.';

    if (spec.dependencyOffsets === 'allPrevious2D') {
      return null;
    }

    for (const ref of refs) {
      const dr = ref[1] ? Number(ref[1].replace(/\s+/g, '')) : 0;
      const dc = ref[2] ? Number(ref[2].replace(/\s+/g, '')) : 0;
      const found = spec.dependencyOffsets.some((offset) => offset.dr === dr && offset.dc === dc);
      if (!found) return `Reference dp[i${formatOffset(dr)}][j${formatOffset(dc)}] is not allowed.`;
    }
    return null;
  }

  function renderDependencyPreview(deps) {
    const preview = document.createElement('div');
    preview.className = 'dependency-preview';
    const positions = [
      { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
      { r: 0, c: -1 }, { r: 0, c: 0 }, { r: 0, c: 1 },
      { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 }
    ];
    const is1D = Array.isArray(deps) && deps.length > 0 && typeof deps[0] === 'number';
    positions.forEach((pos) => {
      const cell = document.createElement('div');
      cell.className = 'preview-cell';
      if (pos.r === 0 && pos.c === 0) {
        cell.classList.add('current');
        cell.textContent = is1D ? 'dp[i]' : 'dp[i][j]';
      } else if (Array.isArray(deps)) {
        const match = is1D
          ? pos.r === 0 && deps.some((offset) => offset === pos.c)
          : deps.some((dep) => dep.dr === pos.r && dep.dc === pos.c);
        if (match) {
          cell.classList.add('dependency');
          cell.textContent = 'dep';
        }
      } else {
        cell.textContent = 'var';
      }
      preview.append(cell);
    });
    return preview;
  }

  function renderDpTable(table, meta, step) {
    const grid = document.createElement('div');
    grid.className = 'dp-table';
    grid.style.gridTemplateColumns = `repeat(${meta.cols}, minmax(46px, 1fr))`;

    const readSet = new Set();
    const targetKey = step ? `${step.target.r},${step.target.c}` : null;
    if (step) {
      step.reads.forEach((cell) => readSet.add(`${cell.r},${cell.c}`));
    }

    for (let r = 0; r < meta.rows; r += 1) {
      for (let c = 0; c < meta.cols; c += 1) {
        const cellData = table[r][c];
        const cell = document.createElement('div');
        cell.className = 'dp-cell';
        const key = `${r},${c}`;
        const isTarget = key === targetKey;
        const isRead = readSet.has(key);

        const baseStatus = cellData.status || 'Uncomputed';
        const statusClass = isTarget ? 'status-current' : isRead ? 'status-dependency' : statusClassFrom(baseStatus);
        if (statusClass) cell.classList.add(statusClass);

        const glyph = document.createElement('span');
        glyph.className = 'cell-glyph';
        glyph.textContent = glyphForStatus(baseStatus, isTarget, isRead);

        const value = document.createElement('div');
        value.className = 'cell-value';
        if (cellData.value === Infinity) {
          value.textContent = '∞';
          value.setAttribute('aria-label', 'Infinity');
        } else if (cellData.value === null || cellData.value === undefined) {
          value.textContent = '•';
        } else if (typeof cellData.value === 'boolean') {
          value.textContent = cellData.value ? 'T' : 'F';
        } else {
          value.textContent = cellData.value;
        }

        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `Row ${r} Col ${c} value ${value.textContent} status ${baseStatus}`);

        cell.append(glyph, value);
        grid.append(cell);
      }
    }
    return grid;
  }

  function statusClassFrom(status) {
    switch (status) {
      case 'Base':
        return 'status-base';
      case 'Computed':
        return 'status-computed';
      case 'Unreachable':
        return 'status-unreachable';
      case 'Error':
        return 'status-error';
      default:
        return '';
    }
  }

  function glyphForStatus(status, isTarget, isRead) {
    if (isTarget) return '✍';
    if (isRead) return '↶';
    if (status === 'Base') return 'B';
    if (status === 'Computed') return 'C';
    if (status === 'Unreachable') return 'X';
    if (status === 'Error') return '!';
    return '';
  }

  function renderStaircase(n, target) {
    const wrap = document.createElement('div');
    const label = document.createElement('div');
    label.className = 'hint-type';
    label.textContent = 'Staircase view';
    wrap.append(label);
    const stairs = document.createElement('div');
    stairs.className = 'staircase';
    for (let i = 0; i <= n; i += 1) {
      const step = document.createElement('div');
      step.className = 'stair-step';
      step.style.height = `${12 + i * 2}px`;
      if (target && target.c === i) step.classList.add('active');
      stairs.append(step);
    }
    wrap.append(stairs);
    return wrap;
  }

  function formatExampleInput(input) {
    return Object.entries(input)
      .map(([key, value]) => `${key}=${formatValue(value)}`)
      .join(', ');
  }

  function formatValue(value) {
    if (Array.isArray(value)) {
      if (Array.isArray(value[0])) {
        return `[${value.map((row) => `[${row.join(', ')}]`).join(', ')}]`;
      }
      return `[${value.join(', ')}]`;
    }
    if (typeof value === 'string') return `"${value}"`;
    if (value === null || value === undefined) return 'null';
    return String(value);
  }

  function toDraftsFromInput(lesson, input) {
    const drafts = {};
    for (const field of lesson.inputSchema.fields) {
      const value = input[field.key];
      if (Array.isArray(value)) {
        if (Array.isArray(value[0])) {
          drafts[field.key] = value.map((row) => row.join(' ')).join('\n');
        } else {
          drafts[field.key] = value.join(' ');
        }
      } else {
        drafts[field.key] = String(value);
      }
    }
    return drafts;
  }

  function buildDefaultDrafts(lesson) {
    return toDraftsFromInput(lesson, lesson.defaultInput);
  }

  function isDeepEqual(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((val, idx) => isDeepEqual(val, b[idx]));
    }
    return a === b;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomString(minLength, maxLength, alphabet) {
    const length = randInt(minLength, maxLength);
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  }
})();
