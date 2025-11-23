// Minimal UI helper library for building toolbars and controls.
(function () {
  function ensureParent(parent) {
    if (!parent || !parent.appendChild) {
      SubwayLogger.logError("UI", "EnsureParent", "Invalid parent passed to UI helper", { parent: parent });
      throw new Error("Invalid parent element");
    }
  }

  function createToolbar(parent) {
    ensureParent(parent);
    var bar = document.createElement("div");
    bar.className = "toolbar";
    parent.appendChild(bar);
    SubwayLogger.logVerbose("UI", "Toolbar", "Created toolbar");
    return bar;
  }

  function createPanel(parent, titleText) {
    ensureParent(parent);
    var panel = document.createElement("div");
    panel.className = "panel";
    var header = document.createElement("div");
    header.className = "panel-header";
    header.textContent = titleText || "";
    var body = document.createElement("div");
    body.className = "panel-body";
    panel.appendChild(header);
    panel.appendChild(body);
    parent.appendChild(panel);
    SubwayLogger.logVerbose("UI", "Panel", "Created panel", { title: titleText });
    return { panel: panel, body: body };
  }

  function createButton(parent, label, tooltip, onClick) {
    ensureParent(parent);
    var btn = document.createElement("button");
    btn.className = "ui-btn";
    btn.textContent = label;
    if (tooltip) btn.title = tooltip;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof onClick === "function") {
        onClick();
      }
    });
    parent.appendChild(btn);
    return btn;
  }

  function createToggleButton(parent, label, tooltip, initial, onToggle) {
    ensureParent(parent);
    var btn = document.createElement("button");
    btn.className = "ui-btn toggle";
    btn.textContent = label;
    if (tooltip) btn.title = tooltip;
    var state = !!initial;
    function render() {
      if (state) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      state = !state;
      render();
      if (typeof onToggle === "function") {
        onToggle(state);
      }
    });
    render();
    parent.appendChild(btn);
    return {
      element: btn,
      getState: function () {
        return state;
      },
      setState: function (next) {
        state = !!next;
        render();
      }
    };
  }

  function createSelect(parent, label, options, onChange) {
    ensureParent(parent);
    var wrapper = document.createElement("label");
    wrapper.className = "ui-select";
    var span = document.createElement("span");
    span.textContent = label;
    var select = document.createElement("select");
    options.forEach(function (opt) {
      var option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    select.addEventListener("change", function () {
      if (typeof onChange === "function") {
        onChange(select.value);
      }
    });
    wrapper.appendChild(span);
    wrapper.appendChild(select);
    parent.appendChild(wrapper);
    return select;
  }

  function createLabeledInput(parent, label, type, onInput) {
    ensureParent(parent);
    var wrapper = document.createElement("label");
    wrapper.className = "ui-input";
    var span = document.createElement("span");
    span.textContent = label;
    var input = document.createElement("input");
    input.type = type || "text";
    input.addEventListener("input", function () {
      if (typeof onInput === "function") {
        onInput(input.value);
      }
    });
    wrapper.appendChild(span);
    wrapper.appendChild(input);
    parent.appendChild(wrapper);
    return input;
  }

  function createColorPalette(parent, colors, onSelect) {
    ensureParent(parent);
    var palette = document.createElement("div");
    palette.className = "color-palette";
    colors.forEach(function (color) {
      var swatch = document.createElement("button");
      swatch.className = "color-swatch";
      swatch.style.backgroundColor = color;
      swatch.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof onSelect === "function") {
          onSelect(color);
        }
      });
      palette.appendChild(swatch);
    });
    parent.appendChild(palette);
    return palette;
  }

  function createZoomControl(parent, onZoomOut, onReset, onZoomIn) {
    ensureParent(parent);
    var wrap = document.createElement("div");
    wrap.className = "zoom-control";
    createButton(wrap, "-", "Zoom out", onZoomOut);
    var label = document.createElement("span");
    label.className = "zoom-display";
    label.textContent = "100%";
    wrap.appendChild(label);
    createButton(wrap, "Fit", "Fit to diagram", onReset);
    createButton(wrap, "+", "Zoom in", onZoomIn);
    parent.appendChild(wrap);
    return {
      element: wrap,
      label: label,
      setZoomText: function (text) {
        label.textContent = text;
      }
    };
  }

  function showMessage(text) {
    alert(text);
  }

  window.SubwayUI = {
    createToolbar: createToolbar,
    createPanel: createPanel,
    createButton: createButton,
    createToggleButton: createToggleButton,
    createSelect: createSelect,
    createLabeledInput: createLabeledInput,
    createColorPalette: createColorPalette,
    createZoomControl: createZoomControl,
    showMessage: showMessage
  };
})();
