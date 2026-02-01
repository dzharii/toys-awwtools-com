(() => {
  const DEBOUNCE_MS = 200;
  const LARGE_INPUT_CHARS = 1_000_000;
  const DUPLICATE_SCAN_CHARS = 1_000_000;
  const COMPACT_LINE_MAX = 80;

  const inputEditor = document.getElementById('input-editor');
  const outputEditor = document.getElementById('output-editor');
  const modeSelect = document.getElementById('mode-select');
  const indentSelect = document.getElementById('indent-select');
  const sortKeysToggle = document.getElementById('sort-keys');

  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnCopyInput = document.getElementById('btn-copy-input');
  const btnCopyOutput = document.getElementById('btn-copy-output');
  const btnClearInput = document.getElementById('btn-clear-input');
  const btnSwap = document.getElementById('btn-swap');

  const globalStatus = document.getElementById('global-status');
  const statusText = globalStatus.querySelector('.status-text');
  const statusIcon = globalStatus.querySelector('.status-icon');
  const statusLocation = globalStatus.querySelector('.status-location');
  const btnGoError = document.getElementById('btn-go-error');
  const errorDetails = document.getElementById('error-details');
  const errorRaw = document.getElementById('error-raw');

  const summaryPanel = document.getElementById('summary-panel');
  const summaryType = document.getElementById('summary-type');
  const summaryInput = document.getElementById('summary-input');
  const summaryOutput = document.getElementById('summary-output');
  const summaryNodes = document.getElementById('summary-nodes');
  const summaryDepth = document.getElementById('summary-depth');
  const duplicatesStatus = document.getElementById('duplicates-status');
  const duplicatesList = document.getElementById('duplicates-list');

  const toast = document.getElementById('toast');

  let debounceTimer = null;
  let latestRequestId = 0;
  let lastErrorLocation = null;
  let activeWorker = null;
  let workerFailed = false;

  const editors = {
    input: initEditor('input', inputEditor, document.querySelector('.gutter[data-pane="input"]'), document.querySelector('.caret-control[data-pane="input"]')),
    output: initEditor('output', outputEditor, document.querySelector('.gutter[data-pane="output"]'), document.querySelector('.caret-control[data-pane="output"]'))
  };

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const editor = entry.target === inputEditor ? editors.input : editors.output;
      updateEditorMetrics(editor);
      scheduleGutterRender(editor);
      scheduleCaretUpdate(editor);
    }
  });

  resizeObserver.observe(inputEditor);
  resizeObserver.observe(outputEditor);

  attachEditorEvents(editors.input);
  attachEditorEvents(editors.output);

  let pasteTriggered = false;
  inputEditor.addEventListener('paste', () => {
    pasteTriggered = true;
  });

  inputEditor.addEventListener('input', () => {
    updateLineCache(editors.input, inputEditor.value);
    scheduleGutterRender(editors.input);
    scheduleCaretUpdate(editors.input);
    scheduleProcessing({ immediate: pasteTriggered });
    pasteTriggered = false;
    updateActionStates();
  });

  modeSelect.addEventListener('change', () => handleOptionsChange());
  indentSelect.addEventListener('change', () => handleOptionsChange());
  sortKeysToggle.addEventListener('change', () => handleOptionsChange());

  btnFormat.addEventListener('click', () => {
    modeSelect.value = 'pretty';
    handleOptionsChange();
    inputEditor.focus();
  });

  btnMinify.addEventListener('click', () => {
    modeSelect.value = 'minify';
    handleOptionsChange();
    inputEditor.focus();
  });

  btnCopyInput.addEventListener('click', () => {
    copyToClipboard(inputEditor.value, 'Copied input');
  });

  btnCopyOutput.addEventListener('click', () => {
    copyToClipboard(outputEditor.value, 'Copied output');
  });

  btnClearInput.addEventListener('click', () => {
    setInputValue('');
    setOutputValue('');
    setStatus('empty');
    summaryPanel.hidden = true;
    inputEditor.focus();
    updateActionStates();
  });

  btnSwap.addEventListener('click', () => {
    if (!outputEditor.value) {
      return;
    }
    setInputValue(outputEditor.value);
    inputEditor.focus();
    scheduleProcessing({ immediate: true });
  });

  btnGoError.addEventListener('click', () => {
    if (lastErrorLocation && typeof lastErrorLocation.offset === 'number') {
      setCaretToOffset(editors.input, lastErrorLocation.offset, true);
    }
  });

  document.addEventListener('selectionchange', () => {
    if (document.activeElement === inputEditor) {
      scheduleCaretUpdate(editors.input);
    } else if (document.activeElement === outputEditor) {
      scheduleCaretUpdate(editors.output);
    }
  });

  updateLineCache(editors.input, inputEditor.value);
  updateLineCache(editors.output, outputEditor.value);
  scheduleGutterRender(editors.input);
  scheduleGutterRender(editors.output);
  scheduleCaretUpdate(editors.input);
  scheduleCaretUpdate(editors.output);
  updateActionStates();
  setStatus('empty');

  function initEditor(name, textarea, gutter, caretControl) {
    const editor = {
      name,
      textarea,
      gutter,
      gutterInner: gutter.querySelector('.gutter-inner'),
      caretControl,
      caretDisplay: caretControl.querySelector('.caret-display'),
      jumpEditor: caretControl.querySelector('.jump-editor'),
      jumpInput: caretControl.querySelector('.jump-input'),
      jumpGo: caretControl.querySelector('.jump-go'),
      jumpCancel: caretControl.querySelector('.jump-cancel'),
      jumpError: caretControl.querySelector('.jump-error'),
      lineStarts: [0],
      totalLines: 1,
      lineHeight: getLineHeight(textarea),
      lastCaret: { line: 1, column: 1, offset: 0 },
      rafCaret: null,
      rafGutter: null
    };

    editor.caretDisplay.addEventListener('dblclick', () => enterJumpMode(editor));
    editor.caretDisplay.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        enterJumpMode(editor);
      }
    });
    editor.jumpGo.addEventListener('click', () => handleJumpGo(editor));
    editor.jumpCancel.addEventListener('click', () => exitJumpMode(editor));
    editor.jumpInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleJumpGo(editor);
      }
    });

    return editor;
  }

  function attachEditorEvents(editor) {
    editor.textarea.addEventListener('scroll', () => scheduleGutterRender(editor));
    editor.textarea.addEventListener('keyup', () => scheduleCaretUpdate(editor));
    editor.textarea.addEventListener('mouseup', () => scheduleCaretUpdate(editor));
    editor.textarea.addEventListener('focus', () => scheduleCaretUpdate(editor));
    editor.textarea.addEventListener('input', () => {
      if (editor.name === 'output') {
        updateLineCache(editor, editor.textarea.value);
        scheduleGutterRender(editor);
        scheduleCaretUpdate(editor);
      }
    });
  }

  function updateEditorMetrics(editor) {
    editor.lineHeight = getLineHeight(editor.textarea);
  }

  function getLineHeight(textarea) {
    const styles = window.getComputedStyle(textarea);
    let lineHeight = parseFloat(styles.lineHeight);
    if (!Number.isFinite(lineHeight)) {
      const fontSize = parseFloat(styles.fontSize) || 16;
      lineHeight = fontSize * 1.5;
    }
    return lineHeight || 20;
  }

  function updateLineCache(editor, text) {
    editor.lineStarts = buildLineStarts(text);
    editor.totalLines = editor.lineStarts.length;
  }

  function buildLineStarts(text) {
    const starts = [0];
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === '\n') {
        starts.push(i + 1);
      }
    }
    return starts;
  }

  function scheduleGutterRender(editor) {
    if (editor.rafGutter) {
      return;
    }
    editor.rafGutter = requestAnimationFrame(() => {
      editor.rafGutter = null;
      renderGutter(editor);
    });
  }

  function renderGutter(editor) {
    const { textarea, gutterInner, lineHeight, totalLines } = editor;
    if (!totalLines) {
      gutterInner.innerHTML = '<div class="gutter-line">1</div>';
      gutterInner.style.paddingTop = '0px';
      return;
    }
    const scrollTop = textarea.scrollTop;
    const clientHeight = textarea.clientHeight;
    const firstVisibleLine = Math.floor(scrollTop / lineHeight) + 1;
    const visibleCount = Math.ceil(clientHeight / lineHeight) + 2;
    const start = Math.max(1, firstVisibleLine);
    const end = Math.min(totalLines, start + visibleCount - 1);

    let html = '';
    for (let i = start; i <= end; i += 1) {
      html += `<div class="gutter-line">${i}</div>`;
    }
    gutterInner.innerHTML = html;
    gutterInner.style.paddingTop = `${(start - 1) * lineHeight}px`;
  }

  function scheduleCaretUpdate(editor) {
    if (editor.rafCaret) {
      return;
    }
    editor.rafCaret = requestAnimationFrame(() => {
      editor.rafCaret = null;
      updateCaretDisplay(editor);
    });
  }

  function updateCaretDisplay(editor) {
    if (!editor.textarea) {
      return;
    }
    const offset = editor.textarea.selectionStart || 0;
    const { line, column } = getLineColFromOffset(offset, editor.lineStarts);
    editor.lastCaret = { line, column, offset };
    editor.caretDisplay.textContent = `Ln ${line}:Col ${column}`;
    if (!editor.caretControl.classList.contains('is-editing')) {
      editor.jumpInput.value = `${line}:${column}`;
    }
  }

  function enterJumpMode(editor) {
    editor.caretControl.classList.add('is-editing');
    editor.jumpEditor.hidden = false;
    editor.jumpError.textContent = '';
    editor.jumpInput.value = `${editor.lastCaret.line}:${editor.lastCaret.column}`;
    editor.jumpInput.focus();
    editor.jumpInput.select();
  }

  function exitJumpMode(editor) {
    editor.caretControl.classList.remove('is-editing');
    editor.jumpEditor.hidden = true;
    editor.jumpError.textContent = '';
    editor.caretDisplay.focus();
  }

  function handleJumpGo(editor) {
    const value = editor.jumpInput.value.trim();
    const match = value.match(/^(\d+)\s*:\s*(\d+)$/);
    if (!match) {
      editor.jumpError.textContent = 'Use N:M';
      return;
    }
    let line = parseInt(match[1], 10);
    let column = parseInt(match[2], 10);

    if (!Number.isFinite(line) || !Number.isFinite(column)) {
      editor.jumpError.textContent = 'Use N:M';
      return;
    }

    if (line < 1) line = 1;
    if (column < 1) column = 1;

    if (line > editor.totalLines) line = editor.totalLines;

    const lineInfo = getLineInfo(editor, line);
    const maxColumn = lineInfo.length + 1;
    if (column > maxColumn) column = maxColumn;

    const offset = lineInfo.start + (column - 1);
    exitJumpMode(editor);
    setCaretToOffset(editor, offset, true);
  }

  function getLineInfo(editor, lineNumber) {
    const lineIndex = Math.max(0, Math.min(editor.lineStarts.length - 1, lineNumber - 1));
    const start = editor.lineStarts[lineIndex];
    const nextStart = lineIndex + 1 < editor.lineStarts.length ? editor.lineStarts[lineIndex + 1] : editor.textarea.value.length;
    const endIndex = Math.max(start, nextStart - 1);
    const length = endIndex - start;
    return { start, endIndex, length };
  }

  function setCaretToOffset(editor, offset, focus) {
    const clamped = Math.max(0, Math.min(offset, editor.textarea.value.length));
    editor.textarea.selectionStart = clamped;
    editor.textarea.selectionEnd = clamped;
    if (focus) {
      editor.textarea.focus();
    }
    scrollCaretIntoView(editor, clamped);
    scheduleCaretUpdate(editor);
  }

  function scrollCaretIntoView(editor, offset) {
    const line = getLineColFromOffset(offset, editor.lineStarts).line;
    const lineTop = (line - 1) * editor.lineHeight;
    const viewTop = editor.textarea.scrollTop;
    const viewBottom = viewTop + editor.textarea.clientHeight - editor.lineHeight;

    if (lineTop < viewTop) {
      editor.textarea.scrollTop = lineTop;
    } else if (lineTop > viewBottom) {
      editor.textarea.scrollTop = Math.max(0, lineTop - editor.textarea.clientHeight + editor.lineHeight);
    }
  }

  function getLineColFromOffset(offset, lineStarts) {
    if (!lineStarts.length) {
      return { line: 1, column: 1 };
    }
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lineStarts[mid] === offset) {
        low = mid;
        break;
      }
      if (lineStarts[mid] < offset) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const index = Math.max(0, low - 1);
    const lineStart = lineStarts[index];
    return { line: index + 1, column: offset - lineStart + 1 };
  }

  function scheduleProcessing({ immediate }) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    const trimmed = inputEditor.value.trim();
    if (!trimmed) {
      setOutputValue('');
      summaryPanel.hidden = true;
      setStatus('empty');
      return;
    }

    if (immediate) {
      startProcessing();
      return;
    }

    debounceTimer = setTimeout(() => {
      startProcessing();
    }, DEBOUNCE_MS);
  }

  function startProcessing() {
    debounceTimer = null;
    const inputText = inputEditor.value;
    if (!inputText.trim()) {
      setOutputValue('');
      summaryPanel.hidden = true;
      setStatus('empty');
      return;
    }

    const requestId = ++latestRequestId;
    setStatus('processing');

    const options = readOptions();

    if (inputText.length > LARGE_INPUT_CHARS && window.Worker && !workerFailed) {
      ensureWorker();
      if (activeWorker) {
        activeWorker.postMessage({ requestId, inputText, options });
        return;
      }
    }

    const result = processText(inputText, options);
    applyResult(requestId, result);
  }

  function ensureWorker() {
    if (activeWorker) {
      return;
    }
    try {
      activeWorker = new Worker('worker.js');
      activeWorker.onmessage = (event) => {
        const { requestId, ok, formattedText, errorModel, summaryModel } = event.data || {};
        applyResult(requestId, { ok, formattedText, errorModel, summaryModel });
      };
      activeWorker.onerror = () => {
        activeWorker.terminate();
        activeWorker = null;
        workerFailed = true;
        startProcessing();
      };
    } catch (error) {
      activeWorker = null;
      workerFailed = true;
    }
  }

  function applyResult(requestId, result) {
    if (requestId !== latestRequestId) {
      return;
    }

    if (!result || !result.ok) {
      setOutputValue('');
      summaryPanel.hidden = true;
      const errorModel = result && result.errorModel ? result.errorModel : {
        category: 'generic_syntax_error',
        message: 'Invalid JSON: generic_syntax_error',
        rawMessage: 'Unknown error',
        location: null
      };
      setStatus('invalid', errorModel);
      lastErrorLocation = errorModel.location || null;
      updateActionStates();
      return;
    }

    setOutputValue(result.formattedText || '');
    setStatus('valid');
    lastErrorLocation = null;
    updateSummary(result.summaryModel, result.formattedText || '');
    updateActionStates();
  }

  function readOptions() {
    return {
      mode: modeSelect.value,
      indent: Number(indentSelect.value) || 2,
      sortKeys: sortKeysToggle.checked
    };
  }

  function handleOptionsChange() {
    if (!inputEditor.value.trim()) {
      return;
    }
    scheduleProcessing({ immediate: true });
  }

  function setInputValue(value) {
    inputEditor.value = value;
    updateLineCache(editors.input, inputEditor.value);
    scheduleGutterRender(editors.input);
    scheduleCaretUpdate(editors.input);
    updateActionStates();
  }

  function setOutputValue(value) {
    outputEditor.value = value;
    updateLineCache(editors.output, outputEditor.value);
    scheduleGutterRender(editors.output);
    scheduleCaretUpdate(editors.output);
  }

  function updateActionStates() {
    const inputHasValue = inputEditor.value.trim().length > 0;
    const outputHasValue = outputEditor.value.trim().length > 0;

    btnFormat.disabled = !inputHasValue;
    btnMinify.disabled = !inputHasValue;
    btnCopyInput.disabled = !inputHasValue;
    btnClearInput.disabled = !inputHasValue;

    btnCopyOutput.disabled = !outputHasValue;
    btnSwap.disabled = !outputHasValue;
  }

  function setStatus(state, errorModel) {
    globalStatus.classList.remove('status-valid', 'status-invalid', 'status-processing', 'status-empty');
    statusLocation.textContent = '';
    btnGoError.hidden = true;
    errorDetails.hidden = true;
    lastErrorLocation = null;

    if (state === 'empty') {
      globalStatus.classList.add('status-empty');
      statusText.textContent = 'Empty';
      statusIcon.textContent = '-';
      return;
    }

    if (state === 'processing') {
      globalStatus.classList.add('status-processing');
      statusText.textContent = 'Processing';
      statusIcon.textContent = '...';
      return;
    }

    if (state === 'valid') {
      globalStatus.classList.add('status-valid');
      statusText.textContent = 'Valid JSON';
      statusIcon.textContent = 'OK';
      return;
    }

    if (state === 'invalid') {
      globalStatus.classList.add('status-invalid');
      const category = errorModel && errorModel.category ? errorModel.category : 'generic_syntax_error';
      statusText.textContent = `Invalid JSON: ${category}`;
      statusIcon.textContent = '!';

      if (errorModel && errorModel.location) {
        const { line, column } = errorModel.location;
        statusLocation.textContent = `Ln ${line}:Col ${column}`;
        btnGoError.hidden = false;
        lastErrorLocation = errorModel.location;
      } else {
        statusLocation.textContent = 'Location unavailable';
      }

      if (errorModel && errorModel.rawMessage) {
        errorDetails.hidden = false;
        errorRaw.textContent = errorModel.rawMessage;
      }
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1500);
  }

  async function copyToClipboard(text, successMessage) {
    if (!text) {
      return;
    }
    const activeElement = document.activeElement;
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch (error) {
      const fallbackSucceeded = fallbackCopy(text);
      showToast(fallbackSucceeded ? successMessage : 'Copy failed');
    }
    if (activeElement && typeof activeElement.focus === 'function') {
      activeElement.focus();
    }
  }

  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (error) {
      succeeded = false;
    }
    document.body.removeChild(temp);
    return succeeded;
  }

  function processText(inputText, options) {
    let parsed;
    try {
      parsed = JSON.parse(inputText);
    } catch (error) {
      return {
        ok: false,
        errorModel: normalizeError(error, inputText)
      };
    }

    let transformed = parsed;
    if (options.sortKeys) {
      transformed = sortKeysDeep(parsed);
    }

    let formattedText = '';
    try {
      if (options.mode === 'pretty') {
        formattedText = JSON.stringify(transformed, null, options.indent);
      } else if (options.mode === 'minify') {
        formattedText = JSON.stringify(transformed);
      } else {
        formattedText = formatCompact(transformed, options.indent, COMPACT_LINE_MAX, options.sortKeys);
      }
    } catch (error) {
      return {
        ok: false,
        errorModel: {
          category: 'generic_syntax_error',
          message: 'Formatting failed',
          rawMessage: error && error.message ? error.message : 'Formatting failed',
          location: null
        }
      };
    }

    const summaryModel = buildSummary(parsed, inputText.length, formattedText.length, inputText);

    return {
      ok: true,
      formattedText,
      summaryModel
    };
  }

  function normalizeError(error, inputText) {
    const rawMessage = error && error.message ? String(error.message) : 'Unknown error';
    const category = categorizeError(rawMessage);
    const location = extractLocation(error, rawMessage, inputText);
    const message = location
      ? `Invalid JSON: ${category} at Ln ${location.line}:Col ${location.column}`
      : `Invalid JSON: ${category}`;

    return {
      category,
      message,
      rawMessage,
      location
    };
  }

  function categorizeError(rawMessage) {
    const message = rawMessage.toLowerCase();
    if (message.includes('unterminated string')) return 'unterminated_string';
    if (message.includes('unexpected end')) return 'unexpected_end';
    if (message.includes('unexpected token')) return 'unexpected_token';
    if (message.includes('number') && message.includes('json')) return 'invalid_number';
    if (message.includes('escape') && message.includes('string')) return 'invalid_escape';
    if (message.includes('unicode') && message.includes('escape')) return 'invalid_unicode';
    return 'generic_syntax_error';
  }

  function extractLocation(error, rawMessage, inputText) {
    const lineStarts = buildLineStarts(inputText);

    const position = getNumeric(error && (error.position ?? error.pos));
    if (Number.isFinite(position)) {
      const { line, column } = getLineColFromOffset(position, lineStarts);
      return { offset: position, line, column, confidence: 'computed_from_offset' };
    }

    const offsetMatch = rawMessage.match(/position\s+(\d+)/i) || rawMessage.match(/at\s+position\s+(\d+)/i);
    if (offsetMatch) {
      const offset = Number(offsetMatch[1]);
      if (Number.isFinite(offset)) {
        const { line, column } = getLineColFromOffset(offset, lineStarts);
        return { offset, line, column, confidence: 'computed_from_offset' };
      }
    }

    const lineColMatch = rawMessage.match(/line\s+(\d+)\s*column\s+(\d+)/i);
    if (lineColMatch) {
      const line = Number(lineColMatch[1]);
      const column = Number(lineColMatch[2]);
      if (Number.isFinite(line) && Number.isFinite(column)) {
        const offset = offsetFromLineCol(line, column, lineStarts, inputText.length);
        return { offset, line, column, confidence: 'reported_by_parser' };
      }
    }

    return null;
  }

  function getNumeric(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  function offsetFromLineCol(line, column, lineStarts, textLength) {
    const lineIndex = Math.max(0, Math.min(lineStarts.length - 1, line - 1));
    const lineStart = lineStarts[lineIndex];
    const nextStart = lineIndex + 1 < lineStarts.length ? lineStarts[lineIndex + 1] : textLength;
    const lineLength = Math.max(0, nextStart - lineStart - 1);
    const col = Math.max(1, Math.min(column, lineLength + 1));
    return lineStart + (col - 1);
  }

  function sortKeysDeep(value) {
    if (Array.isArray(value)) {
      return value.map(sortKeysDeep);
    }
    if (value && typeof value === 'object') {
      const sorted = {};
      const keys = Object.keys(value).sort();
      for (const key of keys) {
        sorted[key] = sortKeysDeep(value[key]);
      }
      return sorted;
    }
    return value;
  }

  function formatCompact(value, indentWidth, lineMax, sortKeys) {
    const indentUnit = ' '.repeat(indentWidth);
    const keysFor = (obj) => (sortKeys ? Object.keys(obj).sort() : Object.keys(obj));

    const formatter = (val, depth) => {
      if (val === null || typeof val !== 'object') {
        return JSON.stringify(val);
      }

      const indentCurrent = indentUnit.repeat(depth);
      const indentNext = indentUnit.repeat(depth + 1);

      if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        const parts = val.map((item) => formatter(item, depth + 1));
        const inline = `[${parts.join(', ')}]`;
        if (!inline.includes('\n') && inline.length <= lineMax) {
          return inline;
        }
        const lines = parts.map((part) => `${indentNext}${part}`);
        return `[` + `\n${lines.join(',\n')}\n${indentCurrent}]`;
      }

      const keys = keysFor(val);
      if (keys.length === 0) return '{}';
      const pairs = keys.map((key) => `${JSON.stringify(key)}: ${formatter(val[key], depth + 1)}`);
      const inline = `{ ${pairs.join(', ')} }`;
      if (!inline.includes('\n') && inline.length <= lineMax) {
        return inline;
      }
      const lines = pairs.map((pair) => `${indentNext}${pair}`);
      return `{` + `\n${lines.join(',\n')}\n${indentCurrent}}`;
    };

    return formatter(value, 0);
  }

  function buildSummary(value, inputSize, outputSize, inputText) {
    const typeLabel = getTypeLabel(value);
    const { nodeCount, maxDepth } = countNodes(value, 1);
    const duplicates = scanDuplicates(inputText);

    return {
      typeLabel,
      inputSize,
      outputSize,
      nodeCount,
      maxDepth,
      duplicates
    };
  }

  function getTypeLabel(value) {
    if (Array.isArray(value)) return 'array';
    if (value === null) return 'primitive (null)';
    if (typeof value === 'object') return 'object';
    return `primitive (${typeof value})`;
  }

  function countNodes(value, depth) {
    if (value === null || typeof value !== 'object') {
      return { nodeCount: 1, maxDepth: depth };
    }

    let nodeCount = 1;
    let maxDepth = depth;

    if (Array.isArray(value)) {
      for (const item of value) {
        const stats = countNodes(item, depth + 1);
        nodeCount += stats.nodeCount;
        maxDepth = Math.max(maxDepth, stats.maxDepth);
      }
      return { nodeCount, maxDepth };
    }

    for (const key of Object.keys(value)) {
      const stats = countNodes(value[key], depth + 1);
      nodeCount += stats.nodeCount;
      maxDepth = Math.max(maxDepth, stats.maxDepth);
    }

    return { nodeCount, maxDepth };
  }

  function scanDuplicates(text) {
    if (text.length > DUPLICATE_SCAN_CHARS) {
      return { skipped: true, duplicates: [], total: 0 };
    }

    const duplicates = [];
    const lineStarts = buildLineStarts(text);
    const stack = [];

    const pushContext = (type) => {
      if (type === 'object') {
        stack.push({ type, state: 'key_or_end', keys: new Set() });
      } else {
        stack.push({ type, state: 'value_or_end' });
      }
    };

    const onValue = () => {
      const ctx = stack[stack.length - 1];
      if (!ctx) return;
      if (ctx.type === 'object' && ctx.state === 'value') {
        ctx.state = 'comma_or_end';
      } else if (ctx.type === 'array' && (ctx.state === 'value_or_end' || ctx.state === 'value')) {
        ctx.state = 'comma_or_end';
      }
    };

    let i = 0;
    while (i < text.length) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
        i += 1;
        continue;
      }
      if (ch === '{') {
        pushContext('object');
        i += 1;
        continue;
      }
      if (ch === '[') {
        pushContext('array');
        i += 1;
        continue;
      }
      if (ch === '}' || ch === ']') {
        stack.pop();
        i += 1;
        onValue();
        continue;
      }
      if (ch === ':') {
        const ctx = stack[stack.length - 1];
        if (ctx && ctx.type === 'object' && ctx.state === 'colon') {
          ctx.state = 'value';
        }
        i += 1;
        continue;
      }
      if (ch === ',') {
        const ctx = stack[stack.length - 1];
        if (ctx && ctx.type === 'object' && ctx.state === 'comma_or_end') {
          ctx.state = 'key_or_end';
        } else if (ctx && ctx.type === 'array' && ctx.state === 'comma_or_end') {
          ctx.state = 'value_or_end';
        }
        i += 1;
        continue;
      }
      if (ch === '"') {
        const ctx = stack[stack.length - 1];
        const result = readJsonString(text, i);
        if (!result) {
          return { skipped: false, duplicates: [], total: 0 };
        }
        if (ctx && ctx.type === 'object' && ctx.state === 'key_or_end') {
          const key = result.value;
          if (ctx.keys.has(key)) {
            const { line, column } = getLineColFromOffset(i, lineStarts);
            duplicates.push({ key, offset: i, line, column });
          } else {
            ctx.keys.add(key);
          }
          ctx.state = 'colon';
        } else {
          onValue();
        }
        i = result.end;
        continue;
      }
      if (ch === '-' || (ch >= '0' && ch <= '9')) {
        i = consumeNumber(text, i);
        onValue();
        continue;
      }
      if (text.startsWith('true', i)) {
        i += 4;
        onValue();
        continue;
      }
      if (text.startsWith('false', i)) {
        i += 5;
        onValue();
        continue;
      }
      if (text.startsWith('null', i)) {
        i += 4;
        onValue();
        continue;
      }
      i += 1;
    }

    return { skipped: false, duplicates, total: duplicates.length };
  }

  function readJsonString(text, startIndex) {
    let i = startIndex + 1;
    let result = '';
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"') {
        return { value: result, end: i + 1 };
      }
      if (ch === '\\') {
        const next = text[i + 1];
        if (next === '"' || next === '\\' || next === '/') {
          result += next;
          i += 2;
          continue;
        }
        if (next === 'b') {
          result += '\b';
          i += 2;
          continue;
        }
        if (next === 'f') {
          result += '\f';
          i += 2;
          continue;
        }
        if (next === 'n') {
          result += '\n';
          i += 2;
          continue;
        }
        if (next === 'r') {
          result += '\r';
          i += 2;
          continue;
        }
        if (next === 't') {
          result += '\t';
          i += 2;
          continue;
        }
        if (next === 'u') {
          const hex = text.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            return null;
          }
          result += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
        return null;
      }
      result += ch;
      i += 1;
    }
    return null;
  }

  function consumeNumber(text, startIndex) {
    let i = startIndex + 1;
    while (i < text.length) {
      const ch = text[i];
      if (
        (ch >= '0' && ch <= '9') ||
        ch === '.' ||
        ch === 'e' ||
        ch === 'E' ||
        ch === '+' ||
        ch === '-'
      ) {
        i += 1;
      } else {
        break;
      }
    }
    return i;
  }

  function updateSummary(summaryModel, formattedText) {
    if (!summaryModel) {
      summaryPanel.hidden = true;
      return;
    }

    summaryPanel.hidden = false;
    summaryType.textContent = summaryModel.typeLabel;
    summaryInput.textContent = summaryModel.inputSize.toLocaleString();
    summaryOutput.textContent = summaryModel.outputSize.toLocaleString();
    summaryNodes.textContent = summaryModel.nodeCount.toLocaleString();
    summaryDepth.textContent = summaryModel.maxDepth.toLocaleString();

    duplicatesList.innerHTML = '';

    if (summaryModel.duplicates.skipped) {
      duplicatesStatus.textContent = 'Duplicate key detection skipped due to size';
      return;
    }

    const duplicates = summaryModel.duplicates.duplicates;
    if (!duplicates.length) {
      duplicatesStatus.textContent = 'none';
      return;
    }

    duplicatesStatus.textContent = `${duplicates.length} found`;
    const display = duplicates.slice(0, 5);
    for (const dup of display) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'duplicate-item';
      btn.textContent = `${dup.key} - Ln ${dup.line}:Col ${dup.column}`;
      btn.setAttribute('aria-label', `Duplicate key ${dup.key} at Ln ${dup.line} Col ${dup.column}`);
      btn.addEventListener('click', () => {
        setCaretToOffset(editors.input, dup.offset, true);
      });
      duplicatesList.appendChild(btn);
    }

    if (duplicates.length > 5) {
      const more = document.createElement('span');
      more.className = 'duplicate-item';
      more.textContent = `and ${duplicates.length - 5} more`;
      more.setAttribute('aria-hidden', 'true');
      duplicatesList.appendChild(more);
    }
  }
})();
