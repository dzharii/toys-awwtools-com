(function () {
  const App = window.App = window.App || {};
  const ui = {};

  const elements = {};

  function cacheElements() {
    elements.formattedToggle = document.getElementById("formattedToggle");
    elements.insertionMode = document.getElementById("insertionMode");
    elements.insertionConfig = document.getElementById("insertionConfig");
    elements.profileSelect = document.getElementById("profileSelect");
    elements.pipelineList = document.getElementById("pipelineList");
    elements.addStepSelect = document.getElementById("addStepSelect");
    elements.addStepButton = document.getElementById("addStepButton");
    elements.editor = document.getElementById("editor");
    elements.previewArea = document.getElementById("previewArea");
    elements.previewToggle = document.getElementById("previewToggle");
    elements.previewRaw = document.getElementById("previewRaw");
    elements.previewTransformed = document.getElementById("previewTransformed");
    elements.statusLine = document.getElementById("statusLine");
  }

  function buildInsertionOptions() {
    const modes = App.insertion.getCatalog();
    elements.insertionMode.innerHTML = "";
    modes.forEach((mode) => {
      const option = document.createElement("option");
      option.value = mode.id;
      option.textContent = mode.label;
      elements.insertionMode.appendChild(option);
    });
  }

  function buildProfileOptions() {
    const profiles = App.pipeline.getProfiles();
    elements.profileSelect.innerHTML = "";
    const customOption = document.createElement("option");
    customOption.value = "";
    customOption.textContent = "Custom";
    elements.profileSelect.appendChild(customOption);
    profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      elements.profileSelect.appendChild(option);
    });
  }

  function buildAddStepOptions() {
    const steps = App.pipeline.getCatalog();
    elements.addStepSelect.innerHTML = "";
    steps.forEach((step) => {
      const option = document.createElement("option");
      option.value = step.type;
      option.textContent = step.label;
      elements.addStepSelect.appendChild(option);
    });
  }

  function setToggleState(enabled) {
    elements.formattedToggle.textContent = enabled ? "Formatted paste ON" : "Formatted paste OFF";
    elements.formattedToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    elements.formattedToggle.classList.toggle("toggle-off", !enabled);
  }

  function renderInsertionConfig() {
    const modeId = App.state.insertionModeId;
    elements.insertionConfig.innerHTML = "";
    if (modeId === "delimiterPrefix" || modeId === "delimiterSuffix") {
      const label = document.createElement("label");
      label.textContent = "Delimiter";
      label.setAttribute("for", "delimiterInput");
      const input = document.createElement("input");
      input.id = "delimiterInput";
      input.type = "text";
      input.value = App.state.uiState.insertionConfig.delimiter;
      input.addEventListener("input", function () {
        App.state.uiState.insertionConfig.delimiter = input.value;
        App.storage.scheduleSave();
      });
      elements.insertionConfig.appendChild(label);
      elements.insertionConfig.appendChild(input);
    }
  }

  function renderPreview() {
    const raw = App.state.lastPaste.raw;
    const transformed = App.state.lastPaste.transformed;
    const hasValue = App.state.lastPaste.hasValue;
    elements.previewRaw.textContent = hasValue ? raw : "-";
    elements.previewTransformed.textContent = hasValue ? transformed : "-";
    if (App.state.uiState.previewCollapsed) {
      elements.previewArea.classList.add("preview-collapsed");
      elements.previewToggle.textContent = "Expand";
      elements.previewToggle.setAttribute("aria-expanded", "false");
    } else {
      elements.previewArea.classList.remove("preview-collapsed");
      elements.previewToggle.textContent = "Collapse";
      elements.previewToggle.setAttribute("aria-expanded", "true");
    }
  }

  function renderStatus() {
    const status = App.state.status;
    const message = status.message || App.state.storageWarning || "";
    const type = status.message ? status.type : (App.state.storageWarning ? "warning" : "");
    elements.statusLine.textContent = message;
    elements.statusLine.classList.remove("error", "warning");
    if (type === "error") {
      elements.statusLine.classList.add("error");
    }
    if (type === "warning") {
      elements.statusLine.classList.add("warning");
    }
  }

  function setStatus(message, type) {
    App.state.status.message = message || "";
    App.state.status.type = type || "";
    renderStatus();
  }

  function clearStatus() {
    App.state.status.message = "";
    App.state.status.type = "";
    renderStatus();
  }

  function renderPipeline() {
    const steps = App.state.activePipeline;
    elements.pipelineList.innerHTML = "";
    if (!steps.length) {
      const empty = document.createElement("div");
      empty.className = "pipeline-empty";
      empty.textContent = "No steps yet. Clipboard text will be inserted as-is.";
      elements.pipelineList.appendChild(empty);
      return;
    }

    steps.forEach((step, index) => {
      const definition = App.pipeline.getStepDefinition(step.type);
      const stepRow = document.createElement("div");
      stepRow.className = "pipeline-step";

      const title = document.createElement("div");
      title.className = "pipeline-step-title";
      title.textContent = definition ? definition.label : step.type;

      const controlGroup = document.createElement("div");
      controlGroup.className = "pipeline-step-controls";

      const upButton = document.createElement("button");
      upButton.type = "button";
      upButton.textContent = "Up";
      upButton.disabled = index === 0;
      upButton.addEventListener("click", function () {
        if (index === 0) {
          return;
        }
        const swapped = steps[index - 1];
        steps[index - 1] = steps[index];
        steps[index] = swapped;
        renderPipeline();
        App.storage.scheduleSave();
      });

      const downButton = document.createElement("button");
      downButton.type = "button";
      downButton.textContent = "Down";
      downButton.disabled = index === steps.length - 1;
      downButton.addEventListener("click", function () {
        if (index === steps.length - 1) {
          return;
        }
        const swapped = steps[index + 1];
        steps[index + 1] = steps[index];
        steps[index] = swapped;
        renderPipeline();
        App.storage.scheduleSave();
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        steps.splice(index, 1);
        renderPipeline();
        App.storage.scheduleSave();
      });

      controlGroup.appendChild(upButton);
      controlGroup.appendChild(downButton);
      controlGroup.appendChild(removeButton);

      stepRow.appendChild(title);
      stepRow.appendChild(controlGroup);

      const configArea = document.createElement("div");
      configArea.className = "pipeline-step-config";

      if (step.type === "trim") {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!step.config.collapseWhitespace;
        checkbox.addEventListener("change", function () {
          step.config.collapseWhitespace = checkbox.checked;
          App.storage.scheduleSave();
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Collapse internal whitespace"));
        configArea.appendChild(label);
      }

      if (step.type === "case") {
        const label = document.createElement("label");
        label.textContent = "Case mode";
        const select = document.createElement("select");
        App.pipeline.getCaseModes().forEach((mode) => {
          const option = document.createElement("option");
          option.value = mode.value;
          option.textContent = mode.label;
          select.appendChild(option);
        });
        select.value = step.config.mode || "lowercase";
        select.addEventListener("change", function () {
          step.config.mode = select.value;
          App.storage.scheduleSave();
        });
        configArea.appendChild(label);
        configArea.appendChild(select);
      }

      if (step.type === "template") {
        const label = document.createElement("label");
        label.textContent = "Template";
        const input = document.createElement("input");
        input.type = "text";
        input.value = step.config.template || "${value}";
        input.addEventListener("input", function () {
          step.config.template = input.value;
          App.storage.scheduleSave();
        });

        const presetLabel = document.createElement("label");
        presetLabel.textContent = "Presets";
        const presetSelect = document.createElement("select");
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose a preset";
        presetSelect.appendChild(placeholder);
        (definition && definition.presets ? definition.presets : []).forEach((preset) => {
          const option = document.createElement("option");
          option.value = preset.value;
          option.textContent = preset.label;
          presetSelect.appendChild(option);
        });
        presetSelect.addEventListener("change", function () {
          if (!presetSelect.value) {
            return;
          }
          input.value = presetSelect.value;
          step.config.template = presetSelect.value;
          App.storage.scheduleSave();
        });

        const hint = document.createElement("div");
        hint.textContent = "Placeholders: ${value}, ${json}";
        hint.className = "template-hint";

        configArea.appendChild(label);
        configArea.appendChild(input);
        configArea.appendChild(presetLabel);
        configArea.appendChild(presetSelect);
        configArea.appendChild(hint);
      }

      stepRow.appendChild(configArea);
      elements.pipelineList.appendChild(stepRow);
    });
  }

  function bindEvents() {
    elements.formattedToggle.addEventListener("click", function () {
      App.state.formattedPasteEnabled = !App.state.formattedPasteEnabled;
      setToggleState(App.state.formattedPasteEnabled);
      App.storage.scheduleSave();
    });

    elements.insertionMode.addEventListener("change", function () {
      App.state.insertionModeId = elements.insertionMode.value;
      renderInsertionConfig();
      App.storage.scheduleSave();
    });

    elements.profileSelect.addEventListener("change", function () {
      const selectedId = elements.profileSelect.value;
      App.state.selectedProfileId = selectedId;
      const profile = App.pipeline.getProfiles().find((item) => item.id === selectedId);
      if (profile) {
        App.state.activePipeline = App.pipeline.clonePipeline(profile.pipeline);
        if (profile.insertionModeId) {
          App.state.insertionModeId = profile.insertionModeId;
          elements.insertionMode.value = App.state.insertionModeId;
        }
        if (profile.insertionConfig) {
          App.state.uiState.insertionConfig = Object.assign(
            {},
            App.state.uiState.insertionConfig,
            profile.insertionConfig
          );
        }
      }
      renderPipeline();
      renderInsertionConfig();
      App.storage.scheduleSave();
    });

    elements.addStepButton.addEventListener("click", function () {
      const stepType = elements.addStepSelect.value;
      const definition = App.pipeline.getStepDefinition(stepType);
      if (!definition) {
        return;
      }
      App.state.activePipeline.push({
        type: stepType,
        config: definition.createDefaultConfig()
      });
      renderPipeline();
      App.storage.scheduleSave();
    });

    elements.previewToggle.addEventListener("click", function () {
      App.state.uiState.previewCollapsed = !App.state.uiState.previewCollapsed;
      renderPreview();
      App.storage.scheduleSave();
    });
  }

  function renderAll() {
    setToggleState(App.state.formattedPasteEnabled);
    elements.insertionMode.value = App.state.insertionModeId;
    elements.profileSelect.value = App.state.selectedProfileId || "";
    renderInsertionConfig();
    renderPipeline();
    renderPreview();
    renderStatus();
  }

  ui.init = function () {
    cacheElements();
    buildInsertionOptions();
    buildProfileOptions();
    buildAddStepOptions();
    bindEvents();
    renderAll();
  };

  ui.renderPreview = renderPreview;
  ui.renderPipeline = renderPipeline;
  ui.renderAll = renderAll;
  ui.setStatus = setStatus;
  ui.clearStatus = clearStatus;
  ui.renderStatus = renderStatus;

  App.ui = ui;
})();
