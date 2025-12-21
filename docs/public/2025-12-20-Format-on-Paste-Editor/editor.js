(function () {
  const App = window.App = window.App || {};

  let editor = null;
  let bypassNextPaste = false;
  let bypassTimer = null;

  function handleInput() {
    App.state.editorText = editor.value;
    App.storage.scheduleSave();
  }

  function handleScroll() {
    App.state.uiState.editorScrollTop = editor.scrollTop;
    App.storage.scheduleSave();
  }

  function handleKeydown(event) {
    const isPasteChord = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key && event.key.toLowerCase() === "v";
    if (isPasteChord) {
      bypassNextPaste = true;
      if (bypassTimer) {
        clearTimeout(bypassTimer);
      }
      bypassTimer = setTimeout(function () {
        bypassNextPaste = false;
      }, 1200);
    }
  }

  function shouldBypass(event) {
    const bypass = bypassNextPaste || event.shiftKey;
    bypassNextPaste = false;
    return bypass;
  }

  function handlePaste(event) {
    if (!App.state.formattedPasteEnabled) {
      return;
    }

    const raw = event.clipboardData ? event.clipboardData.getData("text") : "";
    const bypass = shouldBypass(event);

    if (bypass) {
      App.state.lastPaste.raw = raw;
      App.state.lastPaste.transformed = raw;
      App.state.lastPaste.hasValue = true;
      App.ui.renderPreview();
      App.ui.clearStatus();
      return;
    }

    event.preventDefault();

    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;

    let transformed = raw;
    let hadError = false;

    try {
      transformed = App.pipeline.runPipeline(App.state.activePipeline, raw);
    } catch (err) {
      transformed = raw;
      hadError = true;
    }

    const mode = App.insertion.getMode(App.state.insertionModeId) || App.insertion.getMode("insertAtCursor");
    if (!mode) {
      return;
    }

    const insertConfig = App.state.uiState.insertionConfig || {};
    const result = mode.apply(editor.value, selectionStart, selectionEnd, transformed, insertConfig);
    editor.value = result.value;
    editor.setSelectionRange(result.selectionStart, result.selectionEnd);

    App.state.editorText = result.value;
    App.storage.scheduleSave();

    App.state.lastPaste.raw = raw;
    App.state.lastPaste.transformed = transformed;
    App.state.lastPaste.hasValue = true;
    App.ui.renderPreview();

    if (hadError) {
      App.ui.setStatus("Pipeline error. Raw text inserted.", "error");
    } else {
      App.ui.clearStatus();
    }
  }

  function init() {
    editor = document.getElementById("editor");
    editor.addEventListener("input", handleInput);
    editor.addEventListener("scroll", handleScroll);
    editor.addEventListener("keydown", handleKeydown);
    editor.addEventListener("paste", handlePaste);
  }

  App.editor = {
    init: init
  };
})();
