(function () {
  const App = window.App = window.App || {};

  const defaultState = {
    editorText: "",
    formattedPasteEnabled: true,
    insertionModeId: "insertAtCursor",
    activePipeline: [],
    selectedProfileId: "",
    uiState: {
      previewCollapsed: null,
      editorScrollTop: 0,
      insertionConfig: {
        delimiter: ", ",
        trailingNewline: false
      }
    },
    lastPaste: {
      raw: "",
      transformed: "",
      hasValue: false
    },
    status: {
      message: "",
      type: ""
    },
    storageWarning: ""
  };

  function mergeState(saved) {
    const merged = Object.assign({}, defaultState, saved || {});
    merged.uiState = Object.assign({}, defaultState.uiState, merged.uiState || {});
    merged.uiState.insertionConfig = Object.assign(
      {},
      defaultState.uiState.insertionConfig,
      merged.uiState.insertionConfig || {}
    );
    if (!Array.isArray(merged.activePipeline)) {
      merged.activePipeline = [];
    }
    merged.lastPaste = Object.assign({}, defaultState.lastPaste);
    merged.status = Object.assign({}, defaultState.status);
    merged.storageWarning = "";
    return merged;
  }

  function init() {
    App.state = Object.assign({}, defaultState);
    App.storage.init({
      getState: function () {
        return App.state;
      },
      onWarning: function (message) {
        App.state.storageWarning = message;
        if (App.ui) {
          App.ui.renderStatus();
        }
      }
    });

    const restored = App.storage.loadState(defaultState);
    App.state = mergeState(restored);

    if (typeof App.state.uiState.previewCollapsed !== "boolean") {
      const preferCollapsed = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
      App.state.uiState.previewCollapsed = !!preferCollapsed;
    }

    if (!App.insertion.getMode(App.state.insertionModeId)) {
      App.state.insertionModeId = defaultState.insertionModeId;
    }

    App.state.activePipeline = App.state.activePipeline.map(function (step) {
      const definition = App.pipeline.getStepDefinition(step.type);
      const baseConfig = definition ? definition.createDefaultConfig() : {};
      return {
        type: step.type,
        config: Object.assign({}, baseConfig, step.config || {})
      };
    });

    App.ui.init();
    App.editor.init();

    const editor = document.getElementById("editor");
    editor.value = App.state.editorText;
    editor.scrollTop = App.state.uiState.editorScrollTop || 0;
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        App.storage.flushSave();
      }
    });

    window.addEventListener("beforeunload", function () {
      App.storage.flushSave();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
