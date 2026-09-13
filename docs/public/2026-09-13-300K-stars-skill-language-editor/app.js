(function () {
  "use strict";

  const STORAGE_KEY = "skill_language_editor_state_v1";
  const SCHEMA_VERSION = 1;
  const AUTOSAVE_DELAY_MS = 400;
  const VIEW_SAVE_DELAY_MS = 180;
  const HIGHLIGHT_WARNING_MS = 24;
  const DEFAULT_FILENAME = "untitled-skill.md";
  const DEFAULT_TEMPLATE = `## SKILL Describe the skill

Language: uppercase words are structural keywords; text after them is free-form meaning; indentation defines scope.
Built-ins include WHEN, IF, ELSE, FOR EACH, REPEAT UNTIL, PARALLEL, ASSESS, STOP.
Files may add uppercase keywords when needed; define each new keyword before using it.

DIRECTIVE apply this skill
  read the complete skill before acting
  follow each applicable rule

## Purpose

WHEN the task matches this skill
  describe what should happen

options (guidance):
  - first option
  - second option

IF a condition applies
  take the appropriate action

ELSE
  use the default behavior`;

  const elements = {
    editor: document.querySelector("#editor"),
    editorFrame: document.querySelector("#editor-frame"),
    highlight: document.querySelector("#highlight-layer"),
    filename: document.querySelector("#filename-input"),
    documentState: document.querySelector("#document-state"),
    footerState: document.querySelector("#footer-state"),
    caretStatus: document.querySelector("#caret-status"),
    indentStatus: document.querySelector("#indent-status"),
    lineStatus: document.querySelector("#line-status"),
    newButton: document.querySelector("#new-button"),
    openButton: document.querySelector("#open-button"),
    saveButton: document.querySelector("#save-button"),
    installButton: document.querySelector("#install-button"),
    fileInput: document.querySelector("#file-input"),
    replacementBar: document.querySelector("#replacement-bar"),
    replacementMessage: document.querySelector("#replacement-message"),
    replaceButton: document.querySelector("#replace-button"),
    keepButton: document.querySelector("#keep-button"),
    notice: document.querySelector("#notice")
  };

  let state = {
    filename: DEFAULT_FILENAME,
    text: DEFAULT_TEMPLATE,
    selectionStart: 0,
    selectionEnd: 0,
    scrollTop: 0,
    scrollLeft: 0,
    documentVersion: 1,
    lastDownloadedVersion: null,
    savedAt: null
  };

  let renderedLines = [];
  let logicalLines = [];
  let lineStarts = [0];
  let indentUnit = 2;
  let currentLineIndex = -1;
  let pendingReplacement = null;
  let filenameAtFocus = DEFAULT_FILENAME;
  let autosaveTimer = 0;
  let viewSaveTimer = 0;
  let noticeTimer = 0;
  let installPrompt = null;
  let storageAvailable = true;
  let syntaxRenderCount = 0;
  let fileDragDepth = 0;

  /*
   * Skill Language Editor highlighter.
   *
   * The small scanner/highlighter approach is inspired by microlight 0.0.7
   * by asvd, licensed under the MIT License.
   *
   * Original project: github.com/asvd/microlight
   *
   * This highlighter is a new implementation specialized for the
   * skill-language syntax used by this experiment.
   */

  function makeSpan(className, text) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  }

  function appendBold(parent, text) {
    let cursor = 0;

    while (cursor < text.length) {
      const opening = text.indexOf("**", cursor);
      if (opening < 0) {
        parent.append(document.createTextNode(text.slice(cursor)));
        return;
      }

      const closing = text.indexOf("**", opening + 2);
      if (closing < 0 || closing === opening + 2) {
        parent.append(document.createTextNode(text.slice(cursor)));
        return;
      }

      parent.append(document.createTextNode(text.slice(cursor, opening)));
      parent.append(makeSpan("syntax-markdown-marker", "**"));
      parent.append(makeSpan("syntax-bold", text.slice(opening + 2, closing)));
      parent.append(makeSpan("syntax-markdown-marker", "**"));
      cursor = closing + 2;
    }
  }

  // Code spans are split first so Markdown-looking text inside them stays code.
  function appendInline(parent, text) {
    let cursor = 0;

    while (cursor < text.length) {
      const opening = text.indexOf("`", cursor);
      if (opening < 0) {
        appendBold(parent, text.slice(cursor));
        return;
      }

      const closing = text.indexOf("`", opening + 1);
      if (closing < 0 || closing === opening + 1) {
        appendBold(parent, text.slice(cursor));
        return;
      }

      appendBold(parent, text.slice(cursor, opening));
      parent.append(makeSpan("syntax-markdown-marker", "`"));
      parent.append(makeSpan("syntax-code", text.slice(opening + 1, closing)));
      parent.append(makeSpan("syntax-markdown-marker", "`"));
      cursor = closing + 1;
    }
  }

  function leadingWhitespace(text) {
    return text.match(/^[ \t]*/)[0];
  }

  function visualIndent(text, unit) {
    let width = 0;
    for (const character of leadingWhitespace(text)) {
      width = character === "\t" ? width + unit - (width % unit) : width + 1;
    }
    return width;
  }

  function isNamedListDefinition(lines, index) {
    const line = lines[index];
    if (!line.trimEnd().endsWith(":")) return false;

    const ownIndent = visualIndent(line, indentUnit);
    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const next = lines[nextIndex];
      if (!next.trim()) continue;
      return visualIndent(next, indentUnit) > ownIndent && /^[ \t]*- /.test(next);
    }

    return false;
  }

  function structuralPrefixEnd(text, offset) {
    let cursor = offset;
    let prefixEnd = offset;
    let found = false;

    while (cursor < text.length) {
      const tokenStart = cursor;
      while (cursor < text.length && !/[ \t]/.test(text[cursor])) cursor += 1;
      const token = text.slice(tokenStart, cursor);

      if (!/^(?=[A-Z0-9_-]*[A-Z])[A-Z0-9_-]+$/.test(token)) break;
      found = true;
      prefixEnd = cursor;

      const whitespaceStart = cursor;
      while (cursor < text.length && /[ \t]/.test(text[cursor])) cursor += 1;
      if (cursor === whitespaceStart) break;
    }

    return found ? prefixEnd : offset;
  }

  function appendIndent(parent, whitespace) {
    if (!whitespace) return;
    const indent = makeSpan("indent-guides", whitespace);
    indent.style.setProperty("--indent-step", `${indentUnit}ch`);
    parent.append(indent);
  }

  function renderLine(line, index, lines, node) {
    const lineNode = node || document.createElement("span");
    lineNode.className = "source-line";
    lineNode.dataset.line = String(index);
    lineNode.replaceChildren();

    // A programmatic paste can preserve CRLF in textarea.value. The mirror uses
    // its own LF separator and omits that terminal CR so the visual line stays exact.
    const displayLine = line.endsWith("\r") ? line.slice(0, -1) : line;
    const whitespace = leadingWhitespace(displayLine);
    const body = displayLine.slice(whitespace.length);
    appendIndent(lineNode, whitespace);

    const heading = body.match(/^(#{1,6})(?:([ \t]+)(.*)|$)/);
    if (heading) {
      lineNode.classList.add("line-heading");
      lineNode.append(makeSpan("syntax-heading-marker", heading[1]));
      if (heading[2]) {
        lineNode.append(document.createTextNode(heading[2]));
        lineNode.append(makeSpan("syntax-heading-text", heading[3]));
      }
      return lineNode;
    }

    if (isNamedListDefinition(lines, index)) {
      const trailing = body.match(/[ \t]*$/)[0];
      const content = body.slice(0, body.length - trailing.length);
      lineNode.append(makeSpan("syntax-definition", content.slice(0, -1)));
      lineNode.append(makeSpan("syntax-definition-colon", ":"));
      lineNode.append(document.createTextNode(trailing));
      return lineNode;
    }

    if (body.startsWith("- ")) {
      lineNode.append(makeSpan("syntax-list-marker", "- "));
      appendInline(lineNode, body.slice(2));
      return lineNode;
    }

    const keywordEnd = structuralPrefixEnd(displayLine, whitespace.length);
    if (keywordEnd > whitespace.length) {
      lineNode.append(makeSpan("syntax-keyword", displayLine.slice(whitespace.length, keywordEnd)));
      appendInline(lineNode, displayLine.slice(keywordEnd));
      return lineNode;
    }

    appendInline(lineNode, body);
    return lineNode;
  }

  function buildLineStarts(lines) {
    const starts = new Array(lines.length);
    let position = 0;
    for (let index = 0; index < lines.length; index += 1) {
      starts[index] = position;
      position += lines[index].length + 1;
    }
    return starts;
  }

  function nearestPreviousNonempty(lines, index) {
    for (let previous = index - 1; previous >= 0; previous -= 1) {
      if (lines[previous].trim()) return previous;
    }
    return -1;
  }

  function fullHighlight(lines) {
    const fragment = document.createDocumentFragment();
    renderedLines = lines.map((line, index) => {
      const node = renderLine(line, index, lines);
      fragment.append(node);
      if (index < lines.length - 1) fragment.append(document.createTextNode("\n"));
      return { source: line, node };
    });
    elements.highlight.replaceChildren(fragment);
  }

  // Reuses line DOM for ordinary edits; structural edits take the simple full path.
  function updateHighlight(text, forceFull) {
    const startedAt = performance.now();
    const nextLines = text.split("\n");
    const sameShape = !forceFull && nextLines.length === logicalLines.length;

    if (!sameShape) {
      fullHighlight(nextLines);
    } else {
      const affected = new Set();
      for (let index = 0; index < nextLines.length; index += 1) {
        if (nextLines[index] !== logicalLines[index]) {
          affected.add(index);
          const previous = nearestPreviousNonempty(nextLines, index);
          if (previous >= 0) affected.add(previous);
        }
      }

      for (const index of affected) {
        renderLine(nextLines[index], index, nextLines, renderedLines[index].node);
        renderedLines[index].source = nextLines[index];
      }
    }

    logicalLines = nextLines;
    lineStarts = buildLineStarts(nextLines);
    syntaxRenderCount += 1;
    updateCurrentLine();

    const elapsed = performance.now() - startedAt;
    if (elapsed > HIGHLIGHT_WARNING_MS) {
      console.warn("[editor] highlighter performance warning", JSON.stringify({
        milliseconds: Number(elapsed.toFixed(1)),
        lines: nextLines.length,
        bytes: text.length,
        fullRender: !sameShape
      }));
    }
  }

  function inferIndentUnit(text) {
    const counts = [];
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      const prefix = leadingWhitespace(line);
      if (!prefix || prefix.includes("\t")) continue;
      counts.push(prefix.length);
    }

    if (counts.length < 2) {
      return counts[0] === 4 ? 4 : 2;
    }
    let divisor = counts[0];
    for (const count of counts.slice(1)) {
      let a = divisor;
      let b = count;
      while (b) [a, b] = [b, a % b];
      divisor = a;
    }
    if (divisor >= 4 && divisor % 4 === 0) return 4;
    if (divisor >= 2 && divisor % 2 === 0) return 2;
    if (divisor > 1) return divisor;

    const exactTwos = counts.filter((count) => count === 2 || count === 6).length;
    const exactFours = counts.filter((count) => count === 4 || count === 8).length;
    return exactFours > exactTwos * 1.5 ? 4 : 2;
  }

  function applyIndentUnit(nextUnit) {
    if (indentUnit === nextUnit) return;
    indentUnit = nextUnit;
    document.documentElement.style.setProperty("--tab-size", String(indentUnit));
    elements.indentStatus.textContent = `Spaces: ${indentUnit}`;
    updateHighlight(elements.editor.value, true);
  }

  function lineIndexAt(position) {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (lineStarts[middle] <= position) low = middle + 1;
      else high = middle - 1;
    }
    return Math.max(0, high);
  }

  function updateCurrentLine() {
    if (currentLineIndex >= 0 && renderedLines[currentLineIndex]) {
      renderedLines[currentLineIndex].node.classList.remove("is-current");
    }

    currentLineIndex = -1;
    if (elements.editor.selectionStart === elements.editor.selectionEnd) {
      currentLineIndex = lineIndexAt(elements.editor.selectionStart);
      if (renderedLines[currentLineIndex]) {
        renderedLines[currentLineIndex].node.classList.add("is-current");
      }
    }
  }

  function updateEditorStatus() {
    const position = elements.editor.selectionStart;
    const lineIndex = lineIndexAt(position);
    const column = position - lineStarts[lineIndex] + 1;
    elements.caretStatus.textContent = `Ln ${lineIndex + 1}, Col ${column}`;
    elements.indentStatus.textContent = `Spaces: ${indentUnit}`;
    const lineCount = logicalLines.length || 1;
    elements.lineStatus.textContent = `${lineCount} ${lineCount === 1 ? "line" : "lines"}`;
  }

  function updateSelectionPresentation() {
    updateCurrentLine();
    updateEditorStatus();
    state.selectionStart = elements.editor.selectionStart;
    state.selectionEnd = elements.editor.selectionEnd;
    scheduleViewSave();
  }

  function setVisibleState(text, kind) {
    elements.documentState.textContent = text;
    elements.footerState.textContent = text;
    elements.documentState.dataset.state = kind || "saved";
  }

  function serializableState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      filename: state.filename,
      text: elements.editor.value,
      selectionStart: elements.editor.selectionStart,
      selectionEnd: elements.editor.selectionEnd,
      scrollTop: elements.editor.scrollTop,
      scrollLeft: elements.editor.scrollLeft,
      documentVersion: state.documentVersion,
      lastDownloadedVersion: state.lastDownloadedVersion,
      savedAt: Date.now()
    };
  }

  function persistState(options) {
    const quiet = options && options.quiet;
    try {
      const persisted = serializableState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
      state.savedAt = persisted.savedAt;
      storageAvailable = true;
      if (!quiet) setVisibleState("Saved locally", "saved");
      if (!quiet) {
        console.info("[editor] draft saved locally", JSON.stringify({
          filename: state.filename,
          bytes: persisted.text.length,
          lines: logicalLines.length,
          documentVersion: state.documentVersion
        }));
      }
      return true;
    } catch (error) {
      storageAvailable = false;
      setVisibleState("Autosave unavailable", "error");
      console.error("[editor] autosave failed", JSON.stringify({
        name: error && error.name ? error.name : "Error",
        message: error && error.message ? error.message : "Storage write failed"
      }));
      return false;
    }
  }

  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    setVisibleState("Saving...", "saving");
    autosaveTimer = window.setTimeout(() => {
      autosaveTimer = 0;
      applyIndentUnit(inferIndentUnit(elements.editor.value));
      persistState();
    }, AUTOSAVE_DELAY_MS);
  }

  function scheduleViewSave() {
    clearTimeout(viewSaveTimer);
    viewSaveTimer = window.setTimeout(() => {
      viewSaveTimer = 0;
      if (!autosaveTimer) persistState({ quiet: true });
    }, VIEW_SAVE_DELAY_MS);
  }

  function flushState(options) {
    clearTimeout(autosaveTimer);
    clearTimeout(viewSaveTimer);
    autosaveTimer = 0;
    viewSaveTimer = 0;
    return persistState(options);
  }

  function restoreState() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (!value) return false;
      const restored = JSON.parse(value);
      if (
        restored.schemaVersion !== SCHEMA_VERSION ||
        typeof restored.filename !== "string" ||
        typeof restored.text !== "string" ||
        !Number.isInteger(restored.documentVersion) ||
        !(restored.lastDownloadedVersion === null || Number.isInteger(restored.lastDownloadedVersion))
      ) {
        throw new TypeError("Stored draft has an incompatible shape");
      }

      state = {
        filename: sanitizeFilename(restored.filename),
        text: restored.text,
        selectionStart: Number.isInteger(restored.selectionStart) ? restored.selectionStart : 0,
        selectionEnd: Number.isInteger(restored.selectionEnd) ? restored.selectionEnd : 0,
        scrollTop: Number.isFinite(restored.scrollTop) ? restored.scrollTop : 0,
        scrollLeft: Number.isFinite(restored.scrollLeft) ? restored.scrollLeft : 0,
        documentVersion: Math.max(1, restored.documentVersion),
        lastDownloadedVersion: restored.lastDownloadedVersion,
        savedAt: Number.isFinite(restored.savedAt) ? restored.savedAt : null
      };
      console.info("[editor] draft restored", JSON.stringify({
        filename: state.filename,
        bytes: state.text.length,
        documentVersion: state.documentVersion
      }));
      return true;
    } catch (error) {
      console.warn("[editor] stored draft ignored", JSON.stringify({
        name: error && error.name ? error.name : "Error",
        message: error && error.message ? error.message : "Invalid stored draft"
      }));
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_error) {
        storageAvailable = false;
      }
      return false;
    }
  }

  function sanitizeFilename(filename) {
    const sanitized = String(filename || "")
      .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, "-")
      .replace(/[ .]+$/g, "")
      .trim();
    return sanitized || DEFAULT_FILENAME;
  }

  function stripRevisionSuffix(filename) {
    return filename.replace(/-rev-\d{8}-\d{4}(?=\.[^.]+$|$)/, "");
  }

  function localTimestamp(date) {
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  }

  function revisionFilename(filename, date) {
    const logical = stripRevisionSuffix(sanitizeFilename(filename));
    const lastDot = logical.lastIndexOf(".");
    const suffix = `-rev-${localTimestamp(date)}`;
    if (lastDot <= 0) return `${logical}${suffix}`;
    return `${logical.slice(0, lastDot)}${suffix}${logical.slice(lastDot)}`;
  }

  function normalizeLineEndings(text) {
    return text.replace(/\r\n?/g, "\n");
  }

  function normalizeForExport(text) {
    return `${normalizeLineEndings(text).replace(/\n*$/, "")}\n`;
  }

  function commitFilename() {
    const nextFilename = stripRevisionSuffix(sanitizeFilename(elements.filename.value));
    elements.filename.value = nextFilename;
    if (nextFilename === state.filename) return;

    state.filename = nextFilename;
    state.documentVersion += 1;
    filenameAtFocus = nextFilename;
    scheduleAutosave();
    console.info("[editor] filename changed", JSON.stringify({ filename: nextFilename }));
  }

  function saveRevision() {
    commitFilename();
    flushState({ quiet: true });
    const downloadName = revisionFilename(state.filename, new Date());
    const content = normalizeForExport(elements.editor.value);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);

    state.lastDownloadedVersion = state.documentVersion;
    const exportStatePersisted = persistState({ quiet: true });
    const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setVisibleState(
      exportStatePersisted ? `Downloaded ${time}` : `Downloaded ${time} · Autosave unavailable`,
      exportStatePersisted ? "downloaded" : "error"
    );
    console.info("[editor] revision downloaded", JSON.stringify({
      filename: downloadName,
      bytes: content.length,
      documentVersion: state.documentVersion
    }));
  }

  function needsReplacementWarning() {
    return state.lastDownloadedVersion === null || state.documentVersion !== state.lastDownloadedVersion;
  }

  function replacementMessage() {
    const quotedFilename = `“${state.filename}”`;
    if (!storageAvailable) {
      return `Replace ${quotedFilename}? This draft is not saved in browser storage.`;
    }
    return `Replace ${quotedFilename}? This will overwrite its browser autosave.`;
  }

  function clearPendingReplacement() {
    pendingReplacement = null;
    elements.replacementBar.hidden = true;
    elements.fileInput.value = "";
  }

  function requestReplacement(replacement) {
    flushState({ quiet: true });
    if (!needsReplacementWarning()) {
      Promise.resolve(replacement.apply()).catch(showImportError);
      return;
    }

    pendingReplacement = replacement;
    elements.replacementMessage.textContent = replacementMessage();
    elements.replacementBar.hidden = false;
    elements.keepButton.focus();
  }

  function replaceDocument(filename, text, origin) {
    clearPendingReplacement();
    const normalizedText = normalizeLineEndings(text);
    state.filename = stripRevisionSuffix(sanitizeFilename(filename));
    state.text = normalizedText;
    state.selectionStart = 0;
    state.selectionEnd = 0;
    state.scrollTop = 0;
    state.scrollLeft = 0;
    state.documentVersion += 1;
    state.lastDownloadedVersion = null;

    elements.filename.value = state.filename;
    elements.editor.value = normalizedText;
    elements.editor.setSelectionRange(0, 0);
    elements.editor.scrollTop = 0;
    elements.editor.scrollLeft = 0;
    indentUnit = inferIndentUnit(normalizedText);
    document.documentElement.style.setProperty("--tab-size", String(indentUnit));
    updateHighlight(normalizedText, true);
    syncScroll();
    updateEditorStatus();
    scheduleAutosave();
    elements.editor.focus();

    console.info("[editor] document replaced", JSON.stringify({
      origin,
      filename: state.filename,
      bytes: normalizedText.length,
      lines: logicalLines.length
    }));
  }

  function requestNewDocument() {
    requestReplacement({
      kind: "new",
      apply: () => replaceDocument(DEFAULT_FILENAME, DEFAULT_TEMPLATE, "new")
    });
  }

  async function importFile(file, origin) {
    try {
      const text = await file.text();
      replaceDocument(file.name, text, origin);
      console.info("[editor] file imported", JSON.stringify({
        origin,
        filename: file.name,
        bytes: text.length,
        lines: normalizeLineEndings(text).split("\n").length
      }));
    } catch (error) {
      showImportError(error);
    }
  }

  function showImportError(error) {
    showNotice("The selected file could not be opened.");
    console.error("[editor] file import failed", JSON.stringify({
      name: error && error.name ? error.name : "Error",
      message: error && error.message ? error.message : "File read failed"
    }));
  }

  function requestFileImport(file, origin) {
    requestReplacement({
      kind: origin,
      apply: () => importFile(file, origin)
    });
  }

  function showNotice(message) {
    clearTimeout(noticeTimer);
    elements.notice.textContent = message;
    elements.notice.hidden = false;
    noticeTimer = window.setTimeout(() => {
      elements.notice.hidden = true;
    }, 3200);
  }

  function selectionLineRange() {
    const start = elements.editor.selectionStart;
    const end = elements.editor.selectionEnd;
    const firstLine = lineIndexAt(start);
    let lastLine = lineIndexAt(end);
    if (end > start && end === lineStarts[lastLine]) lastLine = Math.max(firstLine, lastLine - 1);
    return { start, end, firstLine, lastLine };
  }

  function mutateEditorText(nextText, selectionStart, selectionEnd) {
    const previousText = elements.editor.value;
    let prefixLength = 0;
    while (
      prefixLength < previousText.length &&
      prefixLength < nextText.length &&
      previousText[prefixLength] === nextText[prefixLength]
    ) {
      prefixLength += 1;
    }

    let suffixLength = 0;
    while (
      suffixLength < previousText.length - prefixLength &&
      suffixLength < nextText.length - prefixLength &&
      previousText[previousText.length - 1 - suffixLength] === nextText[nextText.length - 1 - suffixLength]
    ) {
      suffixLength += 1;
    }

    const previousEnd = previousText.length - suffixLength;
    const replacement = nextText.slice(prefixLength, nextText.length - suffixLength);
    elements.editor.focus();
    elements.editor.setSelectionRange(prefixLength, previousEnd);

    // insertText keeps custom indentation operations in the textarea's native undo history.
    const usedNativeCommand = document.execCommand("insertText", false, replacement);
    if (!usedNativeCommand) {
      elements.editor.setRangeText(replacement, prefixLength, previousEnd, "end");
      handleDocumentMutation();
    }
    elements.editor.setSelectionRange(selectionStart, selectionEnd);
    updateSelectionPresentation();
  }

  function indentSelection(outdent) {
    const value = elements.editor.value;
    const range = selectionLineRange();

    if (range.start === range.end && !outdent) {
      const lineStart = lineStarts[range.firstLine];
      let visualColumn = 0;
      for (const character of value.slice(lineStart, range.start)) {
        visualColumn = character === "\t"
          ? visualColumn + indentUnit - (visualColumn % indentUnit)
          : visualColumn + 1;
      }
      const spaces = indentUnit - (visualColumn % indentUnit || 0);
      const insertion = " ".repeat(spaces || indentUnit);
      mutateEditorText(
        value.slice(0, range.start) + insertion + value.slice(range.end),
        range.start + insertion.length,
        range.start + insertion.length
      );
      return;
    }

    const blockStart = lineStarts[range.firstLine];
    const blockEnd = range.lastLine + 1 < lineStarts.length
      ? lineStarts[range.lastLine + 1] - 1
      : value.length;
    const blockLines = value.slice(blockStart, blockEnd).split("\n");
    const changes = [];
    const replacement = blockLines.map((line) => {
      if (!outdent) {
        changes.push(indentUnit);
        return " ".repeat(indentUnit) + line;
      }
      const removed = line.startsWith("\t")
        ? 1
        : Math.min(line.match(/^ */)[0].length, indentUnit);
      changes.push(-removed);
      return line.slice(removed);
    });

    const replacementText = replacement.join("\n");
    const nextValue = value.slice(0, blockStart) + replacementText + value.slice(blockEnd);
    const firstChange = changes[0];
    const totalChange = changes.reduce((sum, change) => sum + change, 0);
    const nextStart = range.start === range.end
      ? Math.max(blockStart, range.start + firstChange)
      : Math.max(blockStart, range.start + firstChange);
    const nextEnd = range.start === range.end
      ? nextStart
      : Math.max(nextStart, range.end + totalChange);
    mutateEditorText(nextValue, nextStart, nextEnd);
  }

  function insertIndentedNewline() {
    const start = elements.editor.selectionStart;
    const end = elements.editor.selectionEnd;
    const lineStart = elements.editor.value.lastIndexOf("\n", start - 1) + 1;
    const indentation = leadingWhitespace(elements.editor.value.slice(lineStart));
    const insertion = `\n${indentation}`;
    const nextText = elements.editor.value.slice(0, start) + insertion + elements.editor.value.slice(end);
    const nextCaret = start + insertion.length;
    mutateEditorText(nextText, nextCaret, nextCaret);
  }

  function handleDocumentMutation() {
    state.text = elements.editor.value;
    state.selectionStart = elements.editor.selectionStart;
    state.selectionEnd = elements.editor.selectionEnd;
    state.documentVersion += 1;
    updateHighlight(state.text, false);
    updateEditorStatus();
    scheduleAutosave();
  }

  function syncScroll() {
    elements.highlight.scrollTop = elements.editor.scrollTop;
    elements.highlight.scrollLeft = elements.editor.scrollLeft;
    state.scrollTop = elements.editor.scrollTop;
    state.scrollLeft = elements.editor.scrollLeft;
  }

  function hasFileDrag(event) {
    return Array.from(event.dataTransfer ? event.dataTransfer.types : []).includes("Files");
  }

  function initializeEditor() {
    const restored = restoreState();
    elements.filename.value = state.filename;
    elements.editor.value = state.text;
    filenameAtFocus = state.filename;
    indentUnit = inferIndentUnit(state.text);
    document.documentElement.style.setProperty("--tab-size", String(indentUnit));
    updateHighlight(state.text, true);

    const maximum = state.text.length;
    const start = Math.min(Math.max(0, state.selectionStart), maximum);
    const end = Math.min(Math.max(start, state.selectionEnd), maximum);
    elements.editor.setSelectionRange(start, end);
    updateSelectionPresentation();
    setVisibleState(restored ? "Saved locally" : "Saving...", restored ? "saved" : "saving");

    requestAnimationFrame(() => requestAnimationFrame(() => {
      elements.editor.scrollTop = state.scrollTop;
      elements.editor.scrollLeft = state.scrollLeft;
      syncScroll();
      if (!restored) scheduleAutosave();
      elements.editor.focus({ preventScroll: true });
    }));
  }

  elements.editor.addEventListener("input", handleDocumentMutation);
  elements.editor.addEventListener("scroll", () => {
    syncScroll();
    scheduleViewSave();
  }, { passive: true });
  elements.editor.addEventListener("select", updateSelectionPresentation);
  elements.editor.addEventListener("keyup", (event) => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey) updateSelectionPresentation();
  });
  elements.editor.addEventListener("click", updateSelectionPresentation);

  elements.editor.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      indentSelection(event.shiftKey);
      return;
    }
    if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      insertIndentedNewline();
    }
  });

  document.addEventListener("selectionchange", () => {
    if (document.activeElement === elements.editor) updateSelectionPresentation();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveRevision();
    }
  });

  elements.filename.addEventListener("focus", () => {
    filenameAtFocus = state.filename;
    elements.filename.select();
  });
  elements.filename.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitFilename();
      elements.editor.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      elements.filename.value = filenameAtFocus;
      elements.editor.focus();
    }
  });
  elements.filename.addEventListener("blur", commitFilename);

  elements.newButton.addEventListener("click", requestNewDocument);
  elements.openButton.addEventListener("click", () => elements.fileInput.click());
  elements.saveButton.addEventListener("click", saveRevision);
  elements.fileInput.addEventListener("change", () => {
    const [file] = elements.fileInput.files;
    if (file) requestFileImport(file, "open");
    else elements.fileInput.value = "";
  });

  elements.replaceButton.addEventListener("click", () => {
    const replacement = pendingReplacement;
    clearPendingReplacement();
    if (replacement) Promise.resolve(replacement.apply()).catch(showImportError);
  });
  elements.keepButton.addEventListener("click", () => {
    clearPendingReplacement();
    elements.editor.focus();
    console.info("[editor] document replacement cancelled");
  });

  elements.editorFrame.addEventListener("dragenter", (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    fileDragDepth += 1;
    elements.editorFrame.classList.add("is-file-drag");
  });
  elements.editorFrame.addEventListener("dragover", (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  });
  elements.editorFrame.addEventListener("dragleave", (event) => {
    if (!hasFileDrag(event)) return;
    fileDragDepth = Math.max(0, fileDragDepth - 1);
    if (!fileDragDepth) elements.editorFrame.classList.remove("is-file-drag");
  });
  elements.editorFrame.addEventListener("drop", (event) => {
    if (!hasFileDrag(event)) return;
    event.preventDefault();
    fileDragDepth = 0;
    elements.editorFrame.classList.remove("is-file-drag");
    const files = Array.from(event.dataTransfer.files);
    if (files.length !== 1) {
      showNotice("Open one file at a time.");
      return;
    }
    requestFileImport(files[0], "drop");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushState({ quiet: true });
  });
  window.addEventListener("pagehide", () => flushState({ quiet: true }));

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    elements.installButton.hidden = false;
    console.info("[editor] PWA installation available");
  });
  elements.installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    console.info("[editor] PWA installation choice", JSON.stringify({ outcome: choice.outcome }));
    installPrompt = null;
    elements.installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    elements.installButton.hidden = true;
    console.info("[editor] PWA installed");
  });

  if ((location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").then((registration) => {
        console.info("[editor] service worker registered", JSON.stringify({ scope: registration.scope }));
      }).catch((error) => {
        console.warn("[editor] service worker registration failed", JSON.stringify({
          name: error && error.name ? error.name : "Error",
          message: error && error.message ? error.message : "Registration failed"
        }));
      });
    });
  }

  // A small deterministic seam supports browser-level verification without a build step.
  window.SkillLanguageEditor = Object.freeze({
    inferIndentUnit,
    normalizeForExport,
    revisionFilename,
    sanitizeFilename,
    stripRevisionSuffix,
    getSyntaxRenderCount: () => syntaxRenderCount,
    getState: () => ({ ...state, indentUnit })
  });

  initializeEditor();
}());
