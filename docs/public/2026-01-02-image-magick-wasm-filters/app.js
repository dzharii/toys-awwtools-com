const MAX_MEGAPIXELS = 40;
const DEFAULT_DEBOUNCE = 150;
const PREVIEW_PLACEHOLDER = "Load an image to enable this widget.";

const elements = {
  dropZone: document.getElementById("drop-zone"),
  fileInput: document.getElementById("file-input"),
  ingestMessage: document.getElementById("ingest-message"),
  sourceImage: document.getElementById("source-image"),
  sourceFrame: document.getElementById("source-frame"),
  metaDimensions: document.getElementById("meta-dimensions"),
  metaMegapixels: document.getElementById("meta-megapixels"),
  metaBytes: document.getElementById("meta-bytes"),
  metaName: document.getElementById("meta-name"),
  widgetCatalog: document.getElementById("widget-catalog"),
  resetAll: document.getElementById("reset-all"),
  runtimeStatus: document.getElementById("runtime-status"),
  diagWasm: document.getElementById("diag-wasm"),
  diagWorker: document.getElementById("diag-worker"),
  diagError: document.getElementById("diag-error"),
  diagLog: document.getElementById("diag-log"),
};

const outputFormats = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];

const appState = {
  source: null,
  widgets: [],
  wasmReady: false,
  workerReady: false,
  lastError: null,
  log: [],
  appMode: "NoSource",
};

function logDiag(message) {
  const time = new Date().toLocaleTimeString();
  appState.log.push(`[${time}] ${message}`);
  if (appState.log.length > 120) {
    appState.log.shift();
  }
  elements.diagLog.textContent = appState.log.join("\n");
}

function setAppMode(mode, errorMessage) {
  appState.appMode = mode;
  if (mode === "ProcessingWasmUnavailable") {
    elements.runtimeStatus.textContent = "WASM unavailable";
  } else if (mode === "SourceLoaded") {
    elements.runtimeStatus.textContent = "Ready";
  } else if (mode === "SourceError") {
    elements.runtimeStatus.textContent = "Source error";
  } else {
    elements.runtimeStatus.textContent = "Waiting for image";
  }
  if (errorMessage) {
    appState.lastError = errorMessage;
    elements.diagError.textContent = errorMessage;
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB (${bytes} B)`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB (${bytes} B)`;
}

function formatMegapixels(width, height) {
  if (!width || !height) return "-";
  return `${(width * height / 1_000_000).toFixed(2)} MP`;
}

function clearSourceState() {
  if (appState.source?.previewUrl) {
    URL.revokeObjectURL(appState.source.previewUrl);
  }
  appState.source = null;
  elements.sourceImage.src = "";
  const sourcePlaceholder = elements.sourceFrame.querySelector(".placeholder");
  if (sourcePlaceholder) {
    sourcePlaceholder.textContent = "Load an image to begin.";
  }
  elements.metaDimensions.textContent = "--";
  elements.metaMegapixels.textContent = "--";
  elements.metaBytes.textContent = "--";
  elements.metaName.textContent = "--";
  appState.widgets.forEach((widget) => {
    if (!widget.state.supported) return;
    widget.setEnabled(false);
    widget.clearOutput();
    widget.setStatus("idle", "Load an image to enable.");
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value, step) {
  if (!step) return value;
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}

function normalizeHex(value) {
  if (!value) return "#000000";
  let hex = value.trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return "#000000";
  }
  return hex.toLowerCase();
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getContainMetrics(frameWidth, frameHeight, imageWidth, imageHeight) {
  const scale = Math.min(frameWidth / imageWidth, frameHeight / imageHeight);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;
  const offsetX = (frameWidth - displayWidth) / 2;
  const offsetY = (frameHeight - displayHeight) / 2;
  return { scale, displayWidth, displayHeight, offsetX, offsetY };
}

class WorkerClient {
  constructor() {
    this.worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    this.queue = [];
    this.busy = false;
    this.ready = false;
    this.sourceId = null;
    this.callbacks = new Set();
    this.capabilities = {};
    this.worker.addEventListener("message", (event) => this.handleMessage(event.data));
    this.worker.addEventListener("error", (event) => {
      logDiag(`Worker error: ${event.message}`);
      this.ready = false;
      appState.workerReady = false;
      elements.diagWorker.textContent = "Error";
      setAppMode("ProcessingWasmUnavailable", "Worker failed to start");
      appState.widgets.forEach((widget) => {
        widget.setEnabled(false);
        widget.setStatus("error", "Unavailable in this build.");
        widget.setError("Unavailable in this build.");
      });
    });
  }

  onMessage(callback) {
    this.callbacks.add(callback);
  }

  post(message, transfer) {
    if (transfer) {
      this.worker.postMessage(message, transfer);
    } else {
      this.worker.postMessage(message);
    }
  }

  setSource(source) {
    this.sourceId = source.id;
    const payload = {
      type: "set-source",
      source: {
        id: source.id,
        name: source.name,
        mime: source.mime,
        bytes: source.bytes,
      },
    };
    this.post(payload, [source.bytes.buffer]);
    logDiag(`Source bytes sent to worker (${source.name}).`);
  }

  enqueue(job) {
    this.queue.push(job);
    this.processQueue();
  }

  processQueue() {
    if (!this.ready || this.busy || this.queue.length === 0) return;
    const job = this.queue.shift();
    this.busy = true;
    this.post({ type: "process", job });
  }

  handleMessage(message) {
    if (message.type === "ready") {
      this.ready = true;
      appState.workerReady = true;
      appState.wasmReady = true;
      this.capabilities = message.capabilities || {};
      elements.diagWasm.textContent = "Ready";
      elements.diagWorker.textContent = "Ready";
      setAppMode(appState.source ? "SourceLoaded" : "NoSource");
      logDiag("Worker ready.");
      applyCapabilities();
      this.processQueue();
      return;
    }

    if (message.type === "init-error") {
      this.ready = false;
      appState.workerReady = false;
      appState.wasmReady = false;
      elements.diagWasm.textContent = "Error";
      elements.diagWorker.textContent = "Error";
      setAppMode("ProcessingWasmUnavailable", message.error || "WASM initialization failed");
      logDiag(`WASM init error: ${message.error}`);
      appState.widgets.forEach((widget) => {
        widget.setEnabled(false);
        widget.setStatus("error", "Unavailable in this build.");
        widget.setError("Unavailable in this build.");
      });
      return;
    }

    if (message.type === "job-started") {
      logDiag(`Job started: ${message.token}`);
      this.callbacks.forEach((cb) => cb(message));
      return;
    }

    if (message.type === "job-progress") {
      this.callbacks.forEach((cb) => cb(message));
      return;
    }

    if (message.type === "job-complete") {
      this.busy = false;
      this.processQueue();
      logDiag(`Job complete: ${message.token}`);
      this.callbacks.forEach((cb) => cb(message));
      return;
    }

    if (message.type === "job-error") {
      this.busy = false;
      this.processQueue();
      logDiag(`Job error: ${message.token} - ${message.error}`);
      this.callbacks.forEach((cb) => cb(message));
      return;
    }
  }
}

class Scheduler {
  constructor(workerClient) {
    this.workerClient = workerClient;
  }

  schedule(widget, reason) {
    widget.state.dirty = true;
    if (!appState.source) {
      widget.setStatus("idle", "Load an image to enable.");
      return;
    }
    if (widget.def.skipProcessing && widget.def.skipProcessing(widget.state.params)) {
      widget.setStatus("idle", widget.def.emptyMessage || "No operation.");
      return;
    }
    if (!widget.state.isEligible) {
      widget.setStatus("idle", "Waiting until visible.");
      return;
    }
    if (widget.def.requiresRun && !widget.state.runRequested) {
      widget.setStatus("idle", "Ready. Click Run to process.");
      return;
    }

    const debounce = widget.def.debounceMs ?? DEFAULT_DEBOUNCE;
    if (widget.state.timer) {
      clearTimeout(widget.state.timer);
    }
    widget.setStatus("queued", "Queued");
    widget.state.timer = setTimeout(() => this.dispatch(widget), debounce);
  }

  dispatch(widget) {
    if (!appState.source || !widget.state.isEligible) return;
    if (widget.def.requiresRun && !widget.state.runRequested) return;
    if (widget.def.skipProcessing && widget.def.skipProcessing(widget.state.params)) return;

    widget.state.runRequested = false;
    widget.state.dirty = false;

    const token = `${appState.source.id}:${widget.def.id}:${widget.state.paramRevision}`;
    widget.state.latestToken = token;
    widget.setStatus("running", "Processing...");

    const outputFormat = widget.getOutputFormat();
    const outputSettings = widget.getOutputSettings();

    this.workerClient.enqueue({
      token,
      widgetId: widget.def.id,
      params: widget.state.params,
      outputFormat,
      outputSettings,
      sourceId: appState.source.id,
    });
  }
}

class Widget {
  constructor(def, scheduler, workerClient) {
    this.def = def;
    this.scheduler = scheduler;
    this.workerClient = workerClient;
    this.state = {
      params: structuredClone(def.defaults),
      paramRevision: 0,
      isEligible: false,
      isRunning: false,
      timer: null,
      latestToken: null,
      dirty: true,
      runRequested: false,
      output: null,
      outputMeta: null,
      outputFormat: def.defaultOutputFormat || "png",
      error: null,
      supported: true,
    };
    this.controls = new Map();
    this.buildCard();
  }

  buildCard() {
    this.card = createElement("article", "widget-card");
    this.card.dataset.widgetId = this.def.id;

    const header = createElement("div", "widget-header");
    const title = createElement("h3", null, this.def.name);
    const desc = createElement("p", null, this.def.description);
    header.append(title, desc);

    this.previewFrame = createElement("div", "preview-frame");
    this.previewPlaceholder = createElement("div", "placeholder", PREVIEW_PLACEHOLDER);
    this.previewImage = document.createElement("img");
    this.previewImage.alt = `${this.def.name} preview`;
    this.previewFrame.append(this.previewPlaceholder, this.previewImage);

    this.statusLine = createElement("div", "status-line");
    this.statusDot = createElement("span", "dot");
    this.statusText = createElement("span", null, "Idle");
    this.statusLine.append(this.statusDot, this.statusText);

    this.outputMeta = createElement("div", "status-line");
    this.outputMeta.textContent = "Output: -";

    this.errorBox = createElement("div", "error-box");
    this.errorBox.hidden = true;

    this.controlsWrap = createElement("div", "widget-controls");
    this.buildControls();

    this.cliBlock = createElement("pre", "cli-block");
    this.cliBlock.textContent = "magick \"INPUT\" \"OUTPUT\"";

    this.actions = createElement("div", "actions");
    this.copyButton = createElement("button", null, "Copy CLI");
    this.copyButton.classList.add("secondary");
    this.copyButton.type = "button";
    this.copyButton.addEventListener("click", () => this.copyCli());

    this.downloadButton = createElement("button", null, "Download");
    this.downloadButton.type = "button";
    this.downloadButton.addEventListener("click", () => this.download());

    this.resetButton = createElement("button", "ghost", "Reset to defaults");
    this.resetButton.type = "button";
    this.resetButton.addEventListener("click", () => this.resetDefaults());

    this.actions.append(this.copyButton, this.downloadButton, this.resetButton);

    if (this.def.requiresRun) {
      this.runButton = createElement("button", null, "Run");
      this.runButton.type = "button";
      this.runButton.addEventListener("click", () => {
        this.state.runRequested = true;
        this.scheduler.schedule(this, "run");
      });
      this.actions.prepend(this.runButton);
    }

    if (this.def.showOutputFormat !== false) {
      this.outputFormatSelect = document.createElement("select");
      outputFormats.forEach((format) => {
        const option = document.createElement("option");
        option.value = format.value;
        option.textContent = format.label;
        this.outputFormatSelect.appendChild(option);
      });
      this.outputFormatSelect.value = this.state.outputFormat;
      this.outputFormatSelect.addEventListener("change", () => {
        this.state.outputFormat = this.outputFormatSelect.value;
        this.bumpRevision();
      });
      this.actions.append(this.outputFormatSelect);
    }

    const body = createElement("div", "widget-body");
    body.append(this.previewFrame, this.statusLine, this.outputMeta, this.errorBox, this.controlsWrap);

    const footer = createElement("div", "widget-footer");
    footer.append(this.cliBlock, this.actions);

    this.card.append(header, body, footer);

    if (this.def.overlay) {
      this.def.overlay(this);
    }

    this.updateCli();
    this.updateControls();
    this.setEnabled(false);
  }

  buildControls() {
    this.controlsWrap.innerHTML = "";
    this.def.controls.forEach((control) => {
      const controlEl = this.buildControl(control);
      this.controlsWrap.appendChild(controlEl);
    });
  }

  buildControl(control) {
    const wrapper = createElement("div", "control");
    const label = document.createElement("label");
    const inputId = `control-${this.def.id}-${control.id}`;
    label.textContent = control.label;
    label.setAttribute("for", inputId);
    wrapper.appendChild(label);

    if (control.type === "checkbox") {
      const checkbox = document.createElement("input");
      checkbox.id = inputId;
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(this.state.params[control.id]);
      checkbox.addEventListener("change", () => {
        this.setParam(control.id, checkbox.checked);
      });
      wrapper.appendChild(checkbox);
      this.controls.set(control.id, { input: checkbox, type: control.type, wrapper });
    } else if (control.type === "select") {
      const select = document.createElement("select");
      select.id = inputId;
      control.options.forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        select.appendChild(optionEl);
      });
      select.value = this.state.params[control.id];
      select.addEventListener("change", () => {
        this.setParam(control.id, select.value);
      });
      wrapper.appendChild(select);
      this.controls.set(control.id, { input: select, type: control.type, wrapper });
    } else if (control.type === "color") {
      const row = createElement("div", "color-row");
      const colorInput = document.createElement("input");
      colorInput.id = inputId;
      colorInput.type = "color";
      colorInput.value = normalizeHex(this.state.params[control.id]);
      const textInput = document.createElement("input");
      textInput.type = "text";
      textInput.value = normalizeHex(this.state.params[control.id]);
      colorInput.addEventListener("input", () => {
        textInput.value = colorInput.value;
        this.setParam(control.id, colorInput.value);
      });
      textInput.addEventListener("change", () => {
        const normalized = normalizeHex(textInput.value);
        textInput.value = normalized;
        colorInput.value = normalized;
        this.setParam(control.id, normalized);
      });
      row.append(colorInput, textInput);
      wrapper.appendChild(row);
      this.controls.set(control.id, { input: colorInput, textInput, type: control.type, wrapper });
    } else if (control.type === "range") {
      const row = createElement("div", "control-row");
      const input = document.createElement("input");
      input.id = inputId;
      input.type = "range";
      input.min = control.min;
      input.max = control.max;
      input.step = control.step ?? 1;
      input.value = this.state.params[control.id];
      const valueLabel = createElement("span", "value-label");
      valueLabel.textContent = this.formatValue(control, this.state.params[control.id]);
      input.addEventListener("input", () => {
        const value = this.coerceValue(control, input.value);
        valueLabel.textContent = this.formatValue(control, value);
        this.setParam(control.id, value);
      });
      row.append(input, valueLabel);
      wrapper.appendChild(row);
      this.controls.set(control.id, { input, valueLabel, type: control.type, wrapper });
    } else if (control.type === "text") {
      const input = document.createElement("input");
      input.id = inputId;
      input.type = "text";
      input.value = this.state.params[control.id] ?? "";
      input.addEventListener("input", () => {
        this.setParam(control.id, input.value);
      });
      wrapper.appendChild(input);
      this.controls.set(control.id, { input, type: control.type, wrapper });
    } else {
      const input = document.createElement("input");
      input.id = inputId;
      input.type = "number";
      if (control.min !== undefined) input.min = control.min;
      if (control.max !== undefined) input.max = control.max;
      if (control.step !== undefined) input.step = control.step;
      const value = this.state.params[control.id];
      input.value = value ?? "";
      input.addEventListener("change", () => {
        const nextValue = this.coerceValue(control, input.value);
        this.setParam(control.id, nextValue);
      });
      wrapper.appendChild(input);
      this.controls.set(control.id, { input, type: control.type, allowBlank: control.allowBlank, wrapper });
    }

    if (control.hint) {
      wrapper.appendChild(createElement("div", "hint", control.hint));
    }

    return wrapper;
  }

  formatValue(control, value) {
    if (control.format) return control.format(value);
    return `${value}`;
  }

  coerceValue(control, rawValue) {
    if (control.type === "range") {
      const parsed = parseFloat(rawValue);
      if (Number.isNaN(parsed)) return control.default;
      return roundToStep(clamp(parsed, control.min, control.max), control.step ?? 1);
    }
    if (control.type === "number") {
      if ((rawValue === "" || rawValue === null) && control.allowBlank) {
        return null;
      }
      const parsed = parseFloat(rawValue);
      if (Number.isNaN(parsed)) return control.default;
      if (control.min !== undefined && control.max !== undefined) {
        return roundToStep(clamp(parsed, control.min, control.max), control.step ?? 1);
      }
      return parsed;
    }
    if (control.type === "color") {
      return normalizeHex(rawValue);
    }
    return rawValue;
  }

  setParam(id, value) {
    const current = this.state.params[id];
    if (current === value) return;
    this.state.params[id] = value;
    if (this.def.onParamChange) {
      this.def.onParamChange(this, id, value);
    }
    if (this.def.id === "chroma-key" && id === "previewBackground") {
      updateChromaPreviewBackground();
    }
    this.bumpRevision();
    this.updateCli();
    this.updateControls();
  }

  bumpRevision() {
    this.state.paramRevision += 1;
    this.downloadButton.disabled = true;
    this.scheduler.schedule(this, "revision");
  }

  updateControls() {
    this.def.controls.forEach((control) => {
      const info = this.controls.get(control.id);
      if (!info) return;
      if (control.type === "checkbox") {
        info.input.checked = Boolean(this.state.params[control.id]);
      } else if (control.type === "select") {
        info.input.value = this.state.params[control.id];
      } else if (control.type === "color") {
        const normalized = normalizeHex(this.state.params[control.id]);
        info.input.value = normalized;
        info.textInput.value = normalized;
      } else if (control.type === "range") {
        info.input.value = this.state.params[control.id];
        info.valueLabel.textContent = this.formatValue(control, this.state.params[control.id]);
      } else {
        info.input.value = this.state.params[control.id] ?? "";
      }
    });

    if (this.outputFormatSelect) {
      this.outputFormatSelect.value = this.state.outputFormat;
    }
  }

  setEligible(isEligible) {
    this.state.isEligible = isEligible;
    if (isEligible) {
      this.scheduler.schedule(this, "visible");
    }
  }

  setEnabled(enabled) {
    this.controls.forEach((info) => {
      info.input.disabled = !enabled;
      if (info.textInput) info.textInput.disabled = !enabled;
    });
    if (this.outputFormatSelect) this.outputFormatSelect.disabled = !enabled;
    this.copyButton.disabled = !enabled;
    this.downloadButton.disabled = !enabled || !this.state.output;
    this.resetButton.disabled = !enabled;
    if (this.runButton) this.runButton.disabled = !enabled;

    if (!enabled) {
      this.previewPlaceholder.textContent = PREVIEW_PLACEHOLDER;
      this.previewImage.src = "";
      this.outputMeta.textContent = "Output: -";
    } else {
      this.updateCli();
    }
  }

  setStatus(state, message) {
    this.state.isRunning = state === "running";
    this.statusLine.classList.toggle("processing", state === "running");
    this.statusText.textContent = message || state;
    if (state === "running") {
      this.previewFrame.classList.add("processing");
    } else {
      this.previewFrame.classList.remove("processing");
    }
  }

  setError(message) {
    this.state.error = message;
    if (message) {
      this.errorBox.textContent = message;
      this.errorBox.hidden = false;
    } else {
      this.errorBox.hidden = true;
    }
  }

  clearOutput() {
    if (this.state.output?.blobUrl) {
      URL.revokeObjectURL(this.state.output.blobUrl);
    }
    this.state.output = null;
    this.previewImage.src = "";
    this.previewPlaceholder.textContent = PREVIEW_PLACEHOLDER;
    this.outputMeta.textContent = "Output: -";
    this.downloadButton.disabled = true;
  }

  setOutput(payload) {
    if (this.state.output?.blobUrl) {
      URL.revokeObjectURL(this.state.output.blobUrl);
    }
    const blobUrl = URL.createObjectURL(payload.blob);
    this.previewImage.src = blobUrl;
    this.previewPlaceholder.textContent = "";
    this.state.output = { blobUrl, bytes: payload.bytes, mime: payload.mime };
    this.outputMeta.textContent = `Output: ${payload.width}x${payload.height} - ${formatBytes(payload.bytes.byteLength)} - ${payload.label}`;
    if (this.def.disableCopy && this.def.disableCopy(this.state.params)) {
      this.downloadButton.disabled = true;
    } else {
      this.downloadButton.disabled = false;
    }
    this.setStatus("ready", "Ready");
  }

  updateCli() {
    const cli = this.def.cli(this.state.params, this);
    this.cliBlock.textContent = cli;
    if (this.def.disableCopy && this.def.disableCopy(this.state.params)) {
      this.copyButton.disabled = true;
      this.downloadButton.disabled = true;
      if (this.def.emptyMessage) {
        this.setStatus("idle", this.def.emptyMessage);
      }
      return;
    }
    this.copyButton.disabled = !appState.source;
    this.downloadButton.disabled = !this.state.output;
  }

  copyCli() {
    const text = this.cliBlock.textContent;
    navigator.clipboard.writeText(text).then(() => {
      this.statusText.textContent = "CLI copied";
      setTimeout(() => {
        this.statusText.textContent = "Ready";
      }, 1200);
    });
  }

  download() {
    if (!this.state.output) return;
    const sourceName = appState.source?.name || "image";
    const baseName = sourceName.replace(/\.[^/.]+$/, "");
    const formatLabel = this.getOutputFormat();
    const ext = formatLabel === "jpeg" ? "jpg" : formatLabel;
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
      now.getHours()
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `${baseName}__${this.def.slug}__${timestamp}.${ext}`;

    const blob = new Blob([this.state.output.bytes], { type: this.state.output.mime });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  resetDefaults() {
    this.state.params = structuredClone(this.def.defaults);
    this.updateControls();
    this.updateCli();
    this.bumpRevision();
    this.clearOutput();
    this.setError(null);
    if (this.def.id === "chroma-key") {
      updateChromaPreviewBackground();
    }
  }

  getOutputFormat() {
    if (this.def.outputFormatFromParams) {
      return this.def.outputFormatFromParams(this.state.params);
    }
    return this.state.outputFormat;
  }

  getOutputSettings() {
    if (this.def.outputSettings) {
      return this.def.outputSettings(this.state.params);
    }
    return null;
  }
}

const workerClient = new WorkerClient();
const scheduler = new Scheduler(workerClient);

workerClient.onMessage((message) => {
  if (message.type === "job-complete") {
    const widget = appState.widgets.find((item) => item.def.id === message.widgetId);
    if (!widget) return;
    if (widget.state.latestToken !== message.token) return;
    widget.setError(null);

    const blob = new Blob([message.bytes], { type: message.mime });
    widget.setOutput({
      blob,
      bytes: message.bytes,
      mime: message.mime,
      width: message.width,
      height: message.height,
      label: message.formatLabel,
    });
  }

  if (message.type === "job-error") {
    const widget = appState.widgets.find((item) => item.def.id === message.widgetId);
    if (!widget) return;
    if (widget.state.latestToken !== message.token) return;
    widget.setError(message.error || "Processing failed");
    widget.setStatus("error", "Error");
  }
});

function createWidgetDefinitions() {
  return [
    {
      id: "auto-fix",
      slug: "auto-fix",
      name: "Auto-fix and hygiene",
      description:
        "Fix common issues: apply correct orientation, standardize color space, and remove metadata for cleaner sharing.",
      debounceMs: 150,
      defaults: {
        autoOrient: true,
        toSRGB: true,
        strip: false,
        normalize: "off",
      },
      controls: [
        {
          id: "autoOrient",
          type: "checkbox",
          label: "Auto-orient",
          hint: "Rotates or flips the image based on embedded orientation data.",
          default: true,
        },
        {
          id: "toSRGB",
          type: "checkbox",
          label: "Convert to sRGB",
          hint: "Normalizes colors for consistent display across devices.",
          default: true,
        },
        {
          id: "strip",
          type: "checkbox",
          label: "Strip metadata",
          hint: "Removes hidden camera and editing metadata.",
          default: false,
        },
        {
          id: "normalize",
          type: "select",
          label: "Normalize",
          hint: "Stretch contrast to use more of the available tonal range.",
          default: "off",
          options: [
            { value: "off", label: "Off" },
            { value: "mild", label: "Mild" },
            { value: "strong", label: "Strong" },
          ],
        },
      ],
      cli(params) {
        const options = [];
        if (params.autoOrient) options.push("-auto-orient");
        if (params.toSRGB) options.push("-colorspace sRGB");
        if (params.strip) options.push("-strip");
        if (params.normalize === "mild") {
          options.push("-normalize");
        } else if (params.normalize === "strong") {
          options.push("-normalize -normalize");
        }
        return `magick \"INPUT\" ${options.join(" ").trim()} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
    {
      id: "levels",
      slug: "levels-gamma",
      name: "Levels and gamma",
      description:
        "Remap brightness by moving the black and white points, with gamma for midtones without shifting pure black or white.",
      defaults: {
        blackPoint: 0,
        whitePoint: 100,
        gamma: 1.0,
        channel: "rgb",
      },
      controls: [
        {
          id: "blackPoint",
          type: "range",
          label: "Black point",
          hint: "Higher values deepen shadows.",
          min: 0,
          max: 50,
          step: 1,
          default: 0,
          format: (value) => `${value}%`,
        },
        {
          id: "whitePoint",
          type: "range",
          label: "White point",
          hint: "Lower values brighten highlights.",
          min: 50,
          max: 100,
          step: 1,
          default: 100,
          format: (value) => `${value}%`,
        },
        {
          id: "gamma",
          type: "range",
          label: "Gamma",
          hint: "Values below 1 brighten midtones, above 1 darken them.",
          min: 0.2,
          max: 3.0,
          step: 0.05,
          default: 1.0,
        },
        {
          id: "channel",
          type: "select",
          label: "Channel",
          hint: "Adjust a single color channel for color correction.",
          default: "rgb",
          options: [
            { value: "rgb", label: "RGB" },
            { value: "red", label: "Red" },
            { value: "green", label: "Green" },
            { value: "blue", label: "Blue" },
          ],
        },
      ],
      cli(params) {
        const channelPrefix =
          params.channel === "rgb" ? "" : `-channel ${params.channel.charAt(0).toUpperCase()}`;
        return `magick \"INPUT\" ${channelPrefix} -level ${params.blackPoint},${params.whitePoint} -gamma ${params.gamma} \"OUTPUT\"`
          .replace(/\s+/g, " ")
          .trim();
      },
    },
    {
      id: "brightness-contrast",
      slug: "brightness-contrast",
      name: "Brightness and contrast",
      description:
        "Shift overall lightness and contrast. Use negative values to darken or soften, positive values to brighten or add punch.",
      defaults: { brightness: 0, contrast: 0 },
      controls: [
        {
          id: "brightness",
          type: "range",
          label: "Brightness",
          hint: "Negative darkens, positive brightens.",
          min: -100,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "contrast",
          type: "range",
          label: "Contrast",
          hint: "Negative reduces contrast, positive increases it.",
          min: -100,
          max: 100,
          step: 1,
          default: 0,
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -brightness-contrast ${params.brightness}x${params.contrast} \"OUTPUT\"`;
      },
    },
    {
      id: "white-balance",
      slug: "white-balance",
      name: "White balance and tint",
      description:
        "Adjust color temperature (warm vs cool) and tint (green vs magenta) to correct color casts.",
      defaults: { temperature: 0, tint: 0, strength: 100 },
      controls: [
        {
          id: "temperature",
          type: "range",
          label: "Temperature",
          hint: "Negative cools, positive warms.",
          min: -100,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "tint",
          type: "range",
          label: "Tint",
          hint: "Negative shifts green, positive shifts magenta.",
          min: -100,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Scales the overall correction.",
          min: 0,
          max: 100,
          step: 1,
          default: 100,
          format: (value) => `${value}%`,
        },
      ],
      cli(params) {
        const strength = params.strength / 100;
        const temp = params.temperature / 100;
        const tint = params.tint / 100;
        // Mapping note: temperature adjusts red/blue balance, tint shifts green/magenta. Strength scales both.
        const red = (1 + temp * 0.18 * strength + tint * 0.06 * strength).toFixed(3);
        const green = (1 + tint * 0.12 * strength).toFixed(3);
        const blue = (1 - temp * 0.18 * strength - tint * 0.06 * strength).toFixed(3);
        return `magick \"INPUT\" -channel R -evaluate multiply ${red} -channel G -evaluate multiply ${green} -channel B -evaluate multiply ${blue} -channel RGB \"OUTPUT\"`;
      },
    },
    {
      id: "color-tuning",
      slug: "color-tuning",
      name: "Color tuning (Hue, saturation, brightness)",
      description:
        "Boost or reduce saturation, rotate hue around the color wheel, and shift overall brightness.",
      defaults: { brightness: 100, saturation: 100, hue: 0 },
      controls: [
        {
          id: "brightness",
          type: "range",
          label: "Brightness",
          hint: "100 is no change.",
          min: 0,
          max: 200,
          step: 1,
          default: 100,
        },
        {
          id: "saturation",
          type: "range",
          label: "Saturation",
          hint: "100 is no change.",
          min: 0,
          max: 200,
          step: 1,
          default: 100,
        },
        {
          id: "hue",
          type: "range",
          label: "Hue rotation",
          hint: "Rotate colors around the wheel.",
          min: -180,
          max: 180,
          step: 1,
          default: 0,
          format: (value) => `${value}deg`,
        },
      ],
      cli(params) {
        const huePercent = Math.round(100 + (params.hue / 180) * 100);
        return `magick \"INPUT\" -modulate ${params.brightness},${params.saturation},${huePercent} \"OUTPUT\"`;
      },
    },
    {
      id: "smart-contrast",
      slug: "smart-contrast",
      name: "Smart contrast",
      description:
        "Increase contrast with a sigmoidal curve that protects extremes from harsh clipping.",
      defaults: { amount: 0, midpoint: 50, protect: true },
      controls: [
        {
          id: "amount",
          type: "range",
          label: "Amount",
          hint: "Higher values increase contrast.",
          min: 0,
          max: 20,
          step: 0.1,
          default: 0,
        },
        {
          id: "midpoint",
          type: "range",
          label: "Midpoint",
          hint: "Brightness level most affected.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
          format: (value) => `${value}%`,
        },
        {
          id: "protect",
          type: "checkbox",
          label: "Protect highlights",
          hint: "Scales contrast to reduce highlight clipping.",
          default: true,
        },
      ],
      cli(params) {
        const effective = params.protect ? (params.amount * 0.85).toFixed(2) : params.amount;
        return `magick \"INPUT\" -sigmoidal-contrast ${effective}x${params.midpoint}% \"OUTPUT\"`;
      },
    },
    {
      id: "unsharp",
      slug: "unsharp",
      name: "Sharpness (Unsharp mask)",
      description:
        "Boost edge contrast for clearer details. Use moderate values to avoid halos and noise.",
      defaults: { radius: 1.0, sigma: 1.0, amount: 1.0, threshold: 0 },
      controls: [
        {
          id: "radius",
          type: "range",
          label: "Radius",
          hint: "Size of edges to affect.",
          min: 0,
          max: 10,
          step: 0.1,
          default: 1.0,
        },
        {
          id: "sigma",
          type: "range",
          label: "Sigma",
          hint: "Blur amount used in edge detection.",
          min: 0.1,
          max: 5.0,
          step: 0.1,
          default: 1.0,
        },
        {
          id: "amount",
          type: "range",
          label: "Amount",
          hint: "Strength of sharpening.",
          min: 0,
          max: 5.0,
          step: 0.1,
          default: 1.0,
        },
        {
          id: "threshold",
          type: "range",
          label: "Threshold",
          hint: "Ignore small differences to reduce noise.",
          min: 0,
          max: 20,
          step: 1,
          default: 0,
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -unsharp ${params.radius}x${params.sigma}+${params.amount}+${params.threshold} \"OUTPUT\"`;
      },
    },
    {
      id: "denoise",
      slug: "denoise",
      name: "Denoise",
      description:
        "Reduce random grain and speckles with adjustable strength, passes, and edge preservation.",
      debounceMs: 250,
      defaults: { strength: 0, passes: 1, preserve: true },
      controls: [
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Higher values remove more noise.",
          min: 0,
          max: 10,
          step: 0.1,
          default: 0,
        },
        {
          id: "passes",
          type: "range",
          label: "Passes",
          hint: "More passes increase smoothing.",
          min: 1,
          max: 3,
          step: 1,
          default: 1,
        },
        {
          id: "preserve",
          type: "checkbox",
          label: "Preserve edges",
          hint: "Uses edge-aware denoise if supported.",
          default: true,
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -noise ${params.strength} \"OUTPUT\"`;
      },
    },
    {
      id: "gaussian-blur",
      slug: "gaussian-blur",
      name: "Blur (Gaussian)",
      description:
        "Softens the entire image with a classic Gaussian blur.",
      defaults: { radius: 0, sigma: 1.0 },
      controls: [
        {
          id: "radius",
          type: "range",
          label: "Radius",
          hint: "Higher values soften more broadly.",
          min: 0,
          max: 20,
          step: 0.1,
          default: 0,
        },
        {
          id: "sigma",
          type: "range",
          label: "Sigma",
          hint: "Blur intensity within the radius.",
          min: 0.1,
          max: 10.0,
          step: 0.1,
          default: 1.0,
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -gaussian-blur ${params.radius}x${params.sigma} \"OUTPUT\"`;
      },
    },
    {
      id: "vignette-tilt",
      slug: "vignette-tilt",
      name: "Vignette and tilt-shift",
      description:
        "Darken the corners and/or keep a sharp horizontal band with blur above and below.",
      debounceMs: 300,
      defaults: {
        mode: "both",
        vignetteStrength: 20,
        vignetteRadius: 50,
        focusCenter: 50,
        focusHeight: 30,
        feather: 50,
        blurStrength: 2.0,
      },
      controls: [
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Choose vignette, tilt-shift, or both.",
          default: "both",
          options: [
            { value: "vignette", label: "Vignette only" },
            { value: "tilt", label: "Tilt-shift only" },
            { value: "both", label: "Both" },
          ],
        },
        {
          id: "vignetteStrength",
          type: "range",
          label: "Vignette strength",
          hint: "Higher values darken edges more.",
          min: 0,
          max: 100,
          step: 1,
          default: 20,
        },
        {
          id: "vignetteRadius",
          type: "range",
          label: "Vignette radius",
          hint: "Higher values spread the vignette wider.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "focusCenter",
          type: "range",
          label: "Focus center Y",
          hint: "Vertical position of the sharp band.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
          format: (value) => `${value}%`,
        },
        {
          id: "focusHeight",
          type: "range",
          label: "Focus band height",
          hint: "Height of the sharp band.",
          min: 5,
          max: 100,
          step: 1,
          default: 30,
          format: (value) => `${value}%`,
        },
        {
          id: "feather",
          type: "range",
          label: "Feather",
          hint: "Softness of the transition.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "blurStrength",
          type: "range",
          label: "Blur strength",
          hint: "Blur amount outside the focus band.",
          min: 0,
          max: 10,
          step: 0.1,
          default: 2.0,
        },
      ],
      cli(params) {
        const tilt = `-blur 0x${params.blurStrength}`;
        const vignette = `-vignette ${params.vignetteStrength}x${params.vignetteRadius}`;
        const segments = [];
        if (params.mode === "tilt" || params.mode === "both") segments.push(tilt);
        if (params.mode === "vignette" || params.mode === "both") segments.push(vignette);
        return `magick \"INPUT\" ${segments.join(" ")} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
    {
      id: "edge-emboss",
      slug: "edge-emboss",
      name: "Edge and emboss",
      description:
        "Highlight edges for outlines or create an embossed relief look.",
      debounceMs: 250,
      defaults: { mode: "edge", strength: 50, detail: 50 },
      controls: [
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Choose edge detection or emboss.",
          default: "edge",
          options: [
            { value: "edge", label: "Edge detect" },
            { value: "emboss", label: "Emboss" },
          ],
        },
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Higher values intensify the effect.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "detail",
          type: "range",
          label: "Detail",
          hint: "Higher values favor finer edges.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
      ],
      cli(params) {
        const op = params.mode === "edge" ? "-edge" : "-emboss";
        return `magick \"INPUT\" ${op} \"OUTPUT\"`;
      },
    },
    {
      id: "posterize",
      slug: "posterize",
      name: "Posterize and dither",
      description:
        "Reduce the number of distinct colors and optionally add dithering patterns.",
      debounceMs: 350,
      defaults: { colors: 16, dither: false, ditherMethod: "floyd" },
      controls: [
        {
          id: "colors",
          type: "range",
          label: "Colors",
          hint: "Lower values create a flatter, graphic look.",
          min: 2,
          max: 64,
          step: 1,
          default: 16,
        },
        {
          id: "dither",
          type: "checkbox",
          label: "Dither",
          hint: "Adds patterned dots to simulate missing shades.",
          default: false,
        },
        {
          id: "ditherMethod",
          type: "select",
          label: "Dither method",
          hint: "Choose a dithering pattern if enabled.",
          default: "floyd",
          options: [
            { value: "floyd", label: "Floyd-Steinberg" },
            { value: "riemersma", label: "Ordered (Riemersma)" },
          ],
        },
      ],
      cli(params) {
        const dither = params.dither ? `-dither ${params.ditherMethod}` : "-dither None";
        return `magick \"INPUT\" -colors ${params.colors} ${dither} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
    {
      id: "threshold",
      slug: "threshold",
      name: "Threshold and duotone",
      description:
        "Convert to black and white using a cutoff, or map tones into two chosen colors.",
      debounceMs: 250,
      defaults: {
        mode: "threshold",
        level: 50,
        light: "#ffffff",
        dark: "#000000",
        feather: 0,
      },
      controls: [
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Choose classic threshold or duotone mapping.",
          default: "threshold",
          options: [
            { value: "threshold", label: "Threshold" },
            { value: "duotone", label: "Duotone" },
          ],
        },
        {
          id: "level",
          type: "range",
          label: "Threshold level",
          hint: "Higher values make more pixels dark.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
          format: (value) => `${value}%`,
        },
        {
          id: "light",
          type: "color",
          label: "Light color",
          hint: "Used in duotone as the highlight color.",
          default: "#ffffff",
        },
        {
          id: "dark",
          type: "color",
          label: "Dark color",
          hint: "Used in duotone as the shadow color.",
          default: "#000000",
        },
        {
          id: "feather",
          type: "range",
          label: "Feather",
          hint: "Softens the boundary before thresholding.",
          min: 0,
          max: 20,
          step: 1,
          default: 0,
        },
      ],
      cli(params) {
        const feather = params.feather > 0 ? `-gaussian-blur 0x${params.feather}` : "";
        const threshold = `-threshold ${params.level}%`;
        const duotone = params.mode === "duotone" ? `-clut gradient:${params.dark}-${params.light}` : "";
        return `magick \"INPUT\" ${feather} ${threshold} ${duotone} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
    {
      id: "pixelate",
      slug: "pixelate",
      name: "Pixelate and mosaic",
      description:
        "Turn the image into large blocks to hide detail or create a retro look.",
      debounceMs: 250,
      defaults: { block: 10, mode: "pixelate", preserveEdges: false },
      controls: [
        {
          id: "block",
          type: "range",
          label: "Block size",
          hint: "Higher values make larger blocks.",
          min: 2,
          max: 100,
          step: 1,
          default: 10,
        },
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Pixelate uses crisp blocks, Mosaic is softer.",
          default: "pixelate",
          options: [
            { value: "pixelate", label: "Pixelate" },
            { value: "mosaic", label: "Mosaic" },
          ],
        },
        {
          id: "preserveEdges",
          type: "checkbox",
          label: "Preserve edges",
          hint: "Applies gentle sharpening after pixelation.",
          default: false,
        },
      ],
      cli(params) {
        const scaleDown = `-resize ${Math.round(100 / params.block)}%`;
        const scaleUp = "-resize 1000%";
        return `magick \"INPUT\" ${scaleDown} ${scaleUp} \"OUTPUT\"`;
      },
    },
    {
      id: "crop-straighten",
      slug: "crop-straighten",
      name: "Crop and straighten",
      description:
        "Draw a crop rectangle and optionally rotate slightly to fix tilted horizons.",
      debounceMs: 200,
      defaults: {
        cropX: 0.1,
        cropY: 0.1,
        cropW: 0.8,
        cropH: 0.8,
        rotation: 0,
        bgColor: "#000000",
        autoTrim: false,
      },
      controls: [
        {
          id: "rotation",
          type: "range",
          label: "Rotation",
          hint: "Small adjustments to straighten the image.",
          min: -10,
          max: 10,
          step: 0.1,
          default: 0,
          format: (value) => `${value}deg`,
        },
        {
          id: "bgColor",
          type: "color",
          label: "Background fill",
          hint: "Color for empty corners after rotation.",
          default: "#000000",
        },
        {
          id: "autoTrim",
          type: "checkbox",
          label: "Auto-trim",
          hint: "Trim uniform borders after rotation if supported.",
          default: false,
        },
      ],
      overlay(widget) {
        widget.addCropOverlay();
      },
      cli(params, widget) {
        const crop = widget.getCropGeometryString();
        const trim = params.autoTrim ? "-trim" : "";
        return `magick \"INPUT\" -rotate ${params.rotation} ${trim} -crop ${crop} +repage \"OUTPUT\"`;
      },
    },
    {
      id: "resize",
      slug: "resize",
      name: "Resize and resample",
      description:
        "Resize to a target width and height with curated resampling filters and fit modes.",
      debounceMs: 200,
      defaults: {
        width: null,
        height: null,
        lockAspect: true,
        filter: "auto",
        fit: "fit",
      },
      controls: [
        {
          id: "width",
          type: "number",
          label: "Target width",
          hint: "Leave blank to auto-calculate.",
          min: 1,
          max: 20000,
          step: 1,
          default: null,
          allowBlank: true,
        },
        {
          id: "height",
          type: "number",
          label: "Target height",
          hint: "Leave blank to auto-calculate.",
          min: 1,
          max: 20000,
          step: 1,
          default: null,
          allowBlank: true,
        },
        {
          id: "lockAspect",
          type: "checkbox",
          label: "Lock aspect ratio",
          hint: "Preserve the original aspect ratio when sizing.",
          default: true,
        },
        {
          id: "filter",
          type: "select",
          label: "Resample filter",
          hint: "Choose how smooth or sharp the resize should be.",
          default: "auto",
          options: [
            { value: "auto", label: "Auto" },
            { value: "nearest", label: "Nearest" },
            { value: "triangle", label: "Triangle" },
            { value: "lanczos", label: "Lanczos" },
            { value: "mitchell", label: "Mitchell" },
          ],
        },
        {
          id: "fit",
          type: "select",
          label: "Fit mode",
          hint: "Exact, fit within, or fill and crop.",
          default: "fit",
          options: [
            { value: "exact", label: "Exact" },
            { value: "fit", label: "Fit within" },
            { value: "fill", label: "Fill and crop" },
          ],
        },
      ],
      onParamChange(widget, id, value) {
        if (!appState.source || !widget.state.params.lockAspect) return;
        const source = appState.source;
        if (id === "width" && value) {
          widget.state.params.height = Math.round((value / source.width) * source.height);
        } else if (id === "height" && value) {
          widget.state.params.width = Math.round((value / source.height) * source.width);
        }
      },
      cli(params) {
        const geometry = params.width && params.height ? `${params.width}x${params.height}` : params.width ? `${params.width}` : `x${params.height}`;
        const filterMap = {
          nearest: "Point",
          triangle: "Triangle",
          lanczos: "Lanczos",
          mitchell: "Mitchell",
        };
        const filter = params.filter === "auto" ? "" : `-filter ${filterMap[params.filter] || "Auto"}`;
        const resize = params.fit === "exact" ? `${geometry}!` : params.fit === "fill" ? `${geometry}^` : geometry;
        return `magick \"INPUT\" ${filter} -resize ${resize} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
    {
      id: "perspective",
      slug: "perspective",
      name: "Perspective and distort",
      description:
        "Drag the corners to correct keystone perspective or freely distort the image.",
      debounceMs: 400,
      requiresRun: true,
      defaults: {
        mode: "keystone-left",
        interp: "auto",
        p0x: 0,
        p0y: 0,
        p1x: 1,
        p1y: 0,
        p2x: 1,
        p2y: 1,
        p3x: 0,
        p3y: 1,
      },
      controls: [
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Choose a keystone preset or free four-corner mode.",
          default: "keystone-left",
          options: [
            { value: "keystone-left", label: "Keystone left" },
            { value: "keystone-right", label: "Keystone right" },
            { value: "free", label: "Free four-corner" },
          ],
        },
        {
          id: "interp",
          type: "select",
          label: "Interpolation",
          hint: "How pixels are interpolated during the distortion.",
          default: "auto",
          options: [
            { value: "auto", label: "Auto" },
            { value: "nearest", label: "Nearest" },
            { value: "bilinear", label: "Bilinear" },
            { value: "bicubic", label: "Bicubic" },
          ],
        },
      ],
      overlay(widget) {
        widget.addPerspectiveOverlay();
      },
      onParamChange(widget, id) {
        if (id !== "mode") return;
        widget.applyPerspectivePreset();
      },
      cli(params, widget) {
        const coords = widget.getPerspectiveCliCoords();
        return `magick \"INPUT\" -distort Perspective ${coords} \"OUTPUT\"`;
      },
    },
    {
      id: "border-shadow",
      slug: "border-shadow",
      name: "Border, frame, drop shadow",
      description:
        "Add borders, frames, and optional drop shadows for presentation-ready images.",
      debounceMs: 250,
      defaults: {
        borderSize: 0,
        borderColor: "#ffffff",
        frameSize: 0,
        shadow: false,
        shadowOffsetX: 10,
        shadowOffsetY: 10,
        shadowBlur: 15,
        shadowOpacity: 50,
      },
      controls: [
        {
          id: "borderSize",
          type: "range",
          label: "Border size",
          hint: "Outer border thickness in pixels.",
          min: 0,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "borderColor",
          type: "color",
          label: "Border color",
          hint: "Color for the outer border.",
          default: "#ffffff",
        },
        {
          id: "frameSize",
          type: "range",
          label: "Frame size",
          hint: "Additional frame thickness in pixels.",
          min: 0,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "shadow",
          type: "checkbox",
          label: "Shadow enabled",
          hint: "Adds a drop shadow behind the frame.",
          default: false,
        },
        {
          id: "shadowOffsetX",
          type: "range",
          label: "Shadow offset X",
          hint: "Horizontal shadow shift.",
          min: -50,
          max: 50,
          step: 1,
          default: 10,
        },
        {
          id: "shadowOffsetY",
          type: "range",
          label: "Shadow offset Y",
          hint: "Vertical shadow shift.",
          min: -50,
          max: 50,
          step: 1,
          default: 10,
        },
        {
          id: "shadowBlur",
          type: "range",
          label: "Shadow blur",
          hint: "Softness of the shadow.",
          min: 0,
          max: 50,
          step: 1,
          default: 15,
        },
        {
          id: "shadowOpacity",
          type: "range",
          label: "Shadow opacity",
          hint: "Transparency of the shadow.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
          format: (value) => `${value}%`,
        },
      ],
      cli(params) {
        const border = params.borderSize > 0 ? `-bordercolor ${params.borderColor} -border ${params.borderSize}` : "";
        const frame = params.frameSize > 0 ? `-border ${params.frameSize}` : "";
        const shadow = params.shadow ? `-shadow ${params.shadowOpacity}x${params.shadowBlur}+${params.shadowOffsetX}+${params.shadowOffsetY}` : "";
        return `magick \"INPUT\" ${border} ${frame} ${shadow} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
    {
      id: "chroma-key",
      slug: "chroma-key",
      name: "Chroma key",
      description:
        "Remove a background color (like green screen) while preserving transparency.",
      debounceMs: 300,
      defaults: {
        keyColor: "#00ff00",
        tolerance: 10,
        feather: 5,
        spill: 0,
        previewBackground: "checker",
      },
      defaultOutputFormat: "png",
      controls: [
        {
          id: "keyColor",
          type: "color",
          label: "Key color",
          hint: "Color to remove from the image.",
          default: "#00ff00",
        },
        {
          id: "tolerance",
          type: "range",
          label: "Tolerance",
          hint: "Higher values remove a wider range of colors.",
          min: 0,
          max: 100,
          step: 1,
          default: 10,
        },
        {
          id: "feather",
          type: "range",
          label: "Feather",
          hint: "Softens edges to avoid jagged cutouts.",
          min: 0,
          max: 50,
          step: 1,
          default: 5,
        },
        {
          id: "spill",
          type: "range",
          label: "Spill reduction",
          hint: "Reduces green tint on the subject if supported.",
          min: 0,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "previewBackground",
          type: "select",
          label: "Background preview",
          hint: "Preview-only background for transparency.",
          default: "checker",
          options: [
            { value: "checker", label: "Checkerboard" },
            { value: "white", label: "White" },
            { value: "black", label: "Black" },
          ],
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -fuzz ${params.tolerance}% -transparent ${params.keyColor} \"OUTPUT\"`;
      },
    },
    {
      id: "clarity",
      slug: "clarity",
      name: "Local contrast / clarity",
      description:
        "Boost micro-contrast in textures without changing overall exposure.",
      debounceMs: 300,
      defaults: { strength: 0, radius: 5, skinSafe: true },
      controls: [
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Higher values add more clarity.",
          min: 0,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "radius",
          type: "range",
          label: "Radius",
          hint: "Larger radius affects broader features.",
          min: 0,
          max: 20,
          step: 1,
          default: 5,
        },
        {
          id: "skinSafe",
          type: "checkbox",
          label: "Skin-safe",
          hint: "Caps strength to reduce harshness on skin.",
          default: true,
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -local-contrast \"OUTPUT\"`;
      },
    },
    {
      id: "clut",
      slug: "clut",
      name: "LUT-based color grading (CLUT)",
      description:
        "Apply a preset color look using local CLUT assets and blend with the original.",
      debounceMs: 300,
      defaults: { preset: "none", strength: 100 },
      controls: [
        {
          id: "preset",
          type: "select",
          label: "Look preset",
          hint: "Choose a bundled color look.",
          default: "none",
          options: [
            { value: "none", label: "None" },
            { value: "warm", label: "Warm cinema" },
            { value: "cool", label: "Cool dusk" },
            { value: "matte", label: "Matte film" },
          ],
        },
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Blend the look with the original.",
          min: 0,
          max: 100,
          step: 1,
          default: 100,
          format: (value) => `${value}%`,
        },
      ],
      cli(params) {
        if (params.preset === "none") {
          return `magick \"INPUT\" \"OUTPUT\"`;
        }
        const gradientMap = {
          warm: "#2b1b12-#f7e2c5",
          cool: "#102b38-#d6f4ff",
          matte: "#2b2b2b-#f3e5d3",
        };
        const gradient = gradientMap[params.preset] || gradientMap.warm;
        return `magick \"INPUT\" -clut gradient:${gradient} -compose blend -define compose:args=${params.strength} \"OUTPUT\"`;
      },
    },
    {
      id: "stylize",
      slug: "stylize",
      name: "Stylize",
      description:
        "Transform photos into sketch, charcoal, or oil paint styles.",
      debounceMs: 400,
      defaults: { mode: "sketch", amount: 50, detail: 50 },
      controls: [
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Choose the artistic style.",
          default: "sketch",
          options: [
            { value: "sketch", label: "Sketch" },
            { value: "charcoal", label: "Charcoal" },
            { value: "oil", label: "Oil paint" },
          ],
        },
        {
          id: "amount",
          type: "range",
          label: "Amount",
          hint: "Higher values intensify the effect.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "detail",
          type: "range",
          label: "Detail",
          hint: "Higher values retain finer detail.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
      ],
      cli(params) {
        const op = params.mode === "oil" ? "-oil-paint" : params.mode === "charcoal" ? "-charcoal" : "-sketch";
        return `magick \"INPUT\" ${op} \"OUTPUT\"`;
      },
    },
    {
      id: "motion",
      slug: "motion",
      name: "Motion effects",
      description:
        "Apply directional motion blur or a radial blur for spinning energy.",
      debounceMs: 300,
      defaults: { mode: "linear", strength: 0, angle: 0, bias: 0 },
      controls: [
        {
          id: "mode",
          type: "select",
          label: "Mode",
          hint: "Linear uses a direction, radial uses rotation.",
          default: "linear",
          options: [
            { value: "linear", label: "Linear" },
            { value: "radial", label: "Radial" },
          ],
        },
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Higher values increase blur amount.",
          min: 0,
          max: 100,
          step: 1,
          default: 0,
        },
        {
          id: "angle",
          type: "range",
          label: "Angle",
          hint: "Direction for linear blur.",
          min: 0,
          max: 360,
          step: 1,
          default: 0,
          format: (value) => `${value}deg`,
        },
        {
          id: "bias",
          type: "range",
          label: "Radial center bias",
          hint: "Optional shift of the radial center.",
          min: -100,
          max: 100,
          step: 1,
          default: 0,
        },
      ],
      cli(params) {
        if (params.mode === "radial") {
          return `magick \"INPUT\" -rotational-blur ${params.strength} \"OUTPUT\"`;
        }
        return `magick \"INPUT\" -motion-blur 0x${params.strength}+${params.angle} \"OUTPUT\"`;
      },
    },
    {
      id: "watermark",
      slug: "watermark",
      name: "Watermark and annotate",
      description:
        "Add text labels or watermarks with size, color, opacity, and optional shadow.",
      debounceMs: 200,
      defaults: {
        text: "",
        position: "south-east",
        size: 32,
        color: "#ffffff",
        opacity: 60,
        shadow: true,
        shadowOffset: 2,
        shadowBlur: 4,
      },
      emptyMessage: "Enter text to enable watermark.",
      skipProcessing(params) {
        return !params.text;
      },
      controls: [
        {
          id: "text",
          type: "text",
          label: "Text",
          hint: "Leave blank to disable watermarking.",
          default: "",
        },
        {
          id: "position",
          type: "select",
          label: "Position",
          hint: "Choose where the text should sit.",
          default: "south-east",
          options: [
            { value: "north-west", label: "Top left" },
            { value: "north", label: "Top center" },
            { value: "north-east", label: "Top right" },
            { value: "west", label: "Left center" },
            { value: "center", label: "Center" },
            { value: "east", label: "Right center" },
            { value: "south-west", label: "Bottom left" },
            { value: "south", label: "Bottom center" },
            { value: "south-east", label: "Bottom right" },
          ],
        },
        {
          id: "size",
          type: "range",
          label: "Font size",
          hint: "Pixel size of the text.",
          min: 8,
          max: 200,
          step: 1,
          default: 32,
        },
        {
          id: "color",
          type: "color",
          label: "Color",
          hint: "Text color.",
          default: "#ffffff",
        },
        {
          id: "opacity",
          type: "range",
          label: "Opacity",
          hint: "Text transparency.",
          min: 0,
          max: 100,
          step: 1,
          default: 60,
        },
        {
          id: "shadow",
          type: "checkbox",
          label: "Shadow",
          hint: "Adds a soft drop shadow behind the text.",
          default: true,
        },
        {
          id: "shadowOffset",
          type: "range",
          label: "Shadow offset",
          hint: "Shadow distance in pixels.",
          min: 0,
          max: 20,
          step: 1,
          default: 2,
        },
        {
          id: "shadowBlur",
          type: "range",
          label: "Shadow blur",
          hint: "Shadow softness.",
          min: 0,
          max: 20,
          step: 1,
          default: 4,
        },
      ],
      disableCopy(params) {
        return !params.text;
      },
      cli(params) {
        if (!params.text) {
          return "magick \"INPUT\" \"OUTPUT\"";
        }
        const gravityMap = {
          "north-west": "NorthWest",
          north: "North",
          "north-east": "NorthEast",
          west: "West",
          center: "Center",
          east: "East",
          "south-west": "SouthWest",
          south: "South",
          "south-east": "SouthEast",
        };
        const gravity = gravityMap[params.position] || "SouthEast";
        const shadow = params.shadow
          ? `-shadow ${Math.round(params.opacity)}x${params.shadowBlur}+${params.shadowOffset}+${params.shadowOffset}`
          : "";
        return `magick \"INPUT\" ${shadow} -fill ${params.color} -pointsize ${params.size} -gravity ${gravity} -annotate +0+0 \"${params.text}\" \"OUTPUT\"`.replace(/\\s+/g, " ");
      },
    },
    {
      id: "liquid-rescale",
      slug: "liquid-rescale",
      name: "Content-aware resize (Liquid rescale)",
      description:
        "Resize while attempting to preserve important content. This operation may take longer.",
      debounceMs: 0,
      requiresRun: true,
      defaults: { width: 400, height: 400, energy: "balanced" },
      controls: [
        {
          id: "width",
          type: "number",
          label: "Target width",
          hint: "Required width in pixels.",
          min: 1,
          max: 20000,
          step: 1,
          default: 400,
        },
        {
          id: "height",
          type: "number",
          label: "Target height",
          hint: "Required height in pixels.",
          min: 1,
          max: 20000,
          step: 1,
          default: 400,
        },
        {
          id: "energy",
          type: "select",
          label: "Energy bias",
          hint: "Bias for content importance if supported.",
          default: "balanced",
          options: [
            { value: "balanced", label: "Balanced" },
            { value: "edges", label: "Protect edges" },
          ],
        },
      ],
      cli(params) {
        return `magick \"INPUT\" -liquid-rescale ${params.width}x${params.height} \"OUTPUT\"`;
      },
    },
    {
      id: "clean-photo",
      slug: "clean-photo",
      name: "Combined pipeline: Clean photo",
      description:
        "One-knob cleanup: light denoise, gentle contrast, mild sharpening, and subtle color lift.",
      debounceMs: 400,
      defaults: { strength: 50, extraSharpen: false },
      controls: [
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Scales all steps in the pipeline.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "extraSharpen",
          type: "checkbox",
          label: "Extra sharpen",
          hint: "Adds a bit more sharpening at high strength.",
          default: false,
        },
      ],
      cli() {
        return "magick \"INPUT\" <DENOISE_STEP> <SMART_CONTRAST_STEP> <SHARPEN_STEP> <COLOR_BOOST_STEP> \"OUTPUT\"";
      },
    },
    {
      id: "portrait-pop",
      slug: "portrait-pop",
      name: "Combined pipeline: Portrait pop",
      description:
        "Boost clarity for portraits with mild denoise, local contrast, capped sharpening, and vignette.",
      debounceMs: 450,
      defaults: { strength: 50, vignette: 20 },
      controls: [
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Scales the overall enhancement.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "vignette",
          type: "range",
          label: "Vignette amount",
          hint: "Controls vignette intensity.",
          min: 0,
          max: 100,
          step: 1,
          default: 20,
        },
      ],
      cli() {
        return "magick \"INPUT\" <MILD_DENOISE> <LOCAL_CONTRAST> <CAPPED_SHARPEN> <VIGNETTE> \"OUTPUT\"";
      },
    },
    {
      id: "vintage-film",
      slug: "vintage-film",
      name: "Combined pipeline: Vintage film",
      description:
        "Create a faded, warm film look with lifted blacks, softened color, grain, and vignette.",
      debounceMs: 450,
      defaults: { strength: 50, grain: 20 },
      controls: [
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Scales the overall look.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "grain",
          type: "range",
          label: "Grain",
          hint: "Adds film grain texture.",
          min: 0,
          max: 100,
          step: 1,
          default: 20,
        },
      ],
      cli() {
        return "magick \"INPUT\" <LIFT_BLACKS_STEP> <SATURATION_REDUCE_STEP> <TONE_SPLIT_STEP> <GRAIN_STEP> <VIGNETTE_STEP> \"OUTPUT\"";
      },
    },
    {
      id: "comic-poster",
      slug: "comic-poster",
      name: "Combined pipeline: Comic poster",
      description:
        "Bold graphic look with strong edges, reduced colors, and optional dithering.",
      debounceMs: 500,
      defaults: { colors: 8, edgeStrength: 50, dither: "off" },
      controls: [
        {
          id: "colors",
          type: "range",
          label: "Colors",
          hint: "Lower values increase the posterized look.",
          min: 2,
          max: 32,
          step: 1,
          default: 8,
        },
        {
          id: "edgeStrength",
          type: "range",
          label: "Edge strength",
          hint: "Controls edge prominence.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "dither",
          type: "select",
          label: "Dither mode",
          hint: "Choose a dithering option.",
          default: "off",
          options: [
            { value: "off", label: "Off" },
            { value: "ordered", label: "Ordered" },
            { value: "floyd", label: "Floyd-Steinberg" },
          ],
        },
      ],
      cli() {
        return "magick \"INPUT\" <EDGE_STEP> <POSTERIZE_STEP> <DITHER_STEP> \"OUTPUT\"";
      },
    },
    {
      id: "teal-orange",
      slug: "teal-orange",
      name: "Combined pipeline: Teal-orange cinematic",
      description:
        "Apply teal shadows and warm highlights with a controlled contrast boost.",
      debounceMs: 450,
      defaults: { strength: 50, contrast: 50, vignette: false },
      controls: [
        {
          id: "strength",
          type: "range",
          label: "Strength",
          hint: "Scales the color grading.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "contrast",
          type: "range",
          label: "Contrast",
          hint: "Extra contrast for a cinematic punch.",
          min: 0,
          max: 100,
          step: 1,
          default: 50,
        },
        {
          id: "vignette",
          type: "checkbox",
          label: "Vignette",
          hint: "Adds a subtle vignette.",
          default: false,
        },
      ],
      cli() {
        return "magick \"INPUT\" <SMART_CONTRAST_STEP> <TEAL_ORANGE_BALANCE_STEP> <OPTIONAL_VIGNETTE_STEP> \"OUTPUT\"";
      },
    },
    {
      id: "format",
      slug: "format",
      name: "Format and optimization",
      description:
        "Convert output format and adjust quality/metadata for web delivery.",
      debounceMs: 250,
      showOutputFormat: false,
      defaults: {
        format: "png",
        quality: 85,
        strip: true,
        progressive: false,
      },
      onParamChange(widget, id, value) {
        if (id !== "format" && id !== "init") return;
        const format = id === "init" ? widget.state.params.format : value;
        const isLossy = format === "jpeg";
        const qualityControl = widget.controls.get("quality");
        const progressiveControl = widget.controls.get("progressive");
        if (qualityControl) qualityControl.wrapper.hidden = !isLossy;
        if (progressiveControl) progressiveControl.wrapper.hidden = format !== "jpeg";
      },
      controls: [
        {
          id: "format",
          type: "select",
          label: "Format",
          hint: "Choose an output format.",
          default: "png",
          options: [
            { value: "png", label: "PNG" },
            { value: "jpeg", label: "JPEG" },
          ],
        },
        {
          id: "quality",
          type: "range",
          label: "Quality",
          hint: "Only used for lossy formats.",
          min: 1,
          max: 100,
          step: 1,
          default: 85,
        },
        {
          id: "strip",
          type: "checkbox",
          label: "Strip metadata",
          hint: "Remove metadata to reduce file size.",
          default: true,
        },
        {
          id: "progressive",
          type: "checkbox",
          label: "Progressive",
          hint: "Enable progressive rendering if supported.",
          default: false,
        },
      ],
      outputFormatFromParams(params) {
        return params.format;
      },
      outputSettings(params) {
        return {
          quality: params.quality,
          strip: params.strip,
          progressive: params.progressive,
        };
      },
      cli(params) {
        const quality = params.format === "jpeg" ? `-quality ${params.quality}` : "";
        const strip = params.strip ? "-strip" : "";
        const progressive = params.progressive ? "-interlace Plane" : "";
        return `magick \"INPUT\" ${quality} ${strip} ${progressive} \"OUTPUT\"`.replace(/\s+/g, " ");
      },
    },
  ];
}

function buildWidgets() {
  const definitions = createWidgetDefinitions();
  const catalog = elements.widgetCatalog;
  catalog.innerHTML = "";

  appState.widgets = definitions.map((def) => {
    def.defaults = def.defaults ?? {};
    def.controls = def.controls ?? [];
    def.debounceMs = def.debounceMs ?? DEFAULT_DEBOUNCE;
    def.cli = def.cli ?? (() => "magick \"INPUT\" \"OUTPUT\"");
    def.slug = def.slug ?? def.id;

    const widget = new Widget(def, scheduler, workerClient);
    catalog.appendChild(widget.card);
    if (def.onParamChange) {
      def.onParamChange(widget, "init", null);
    }
    if (def.id === "perspective" && widget.applyPerspectivePreset) {
      widget.applyPerspectivePreset();
    }
    return widget;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const widget = appState.widgets.find((item) => item.card === entry.target);
        if (!widget) return;
        widget.setEligible(entry.isIntersecting);
      });
    },
    { threshold: 0.25 }
  );

  appState.widgets.forEach((widget) => observer.observe(widget.card));
  if (workerClient.ready) {
    applyCapabilities();
  }
}

Widget.prototype.addCropOverlay = function addCropOverlay() {
  const overlay = createElement("div", "overlay");
  const rect = createElement("div", "crop-rect");
  const handles = ["nw", "ne", "se", "sw"].map((pos) => {
    const handle = createElement("div", "handle");
    handle.dataset.handle = pos;
    return handle;
  });
  overlay.append(rect, ...handles);
  this.previewFrame.appendChild(overlay);

  const updateOverlay = () => {
    if (!appState.source) return;
    const frame = this.previewFrame.getBoundingClientRect();
    const metrics = getContainMetrics(frame.width, frame.height, appState.source.width, appState.source.height);
    const x = metrics.offsetX + metrics.displayWidth * this.state.params.cropX;
    const y = metrics.offsetY + metrics.displayHeight * this.state.params.cropY;
    const w = metrics.displayWidth * this.state.params.cropW;
    const h = metrics.displayHeight * this.state.params.cropH;
    rect.style.left = `${x}px`;
    rect.style.top = `${y}px`;
    rect.style.width = `${w}px`;
    rect.style.height = `${h}px`;
    handles.forEach((handle) => {
      const pos = handle.dataset.handle;
      handle.style.left = pos.includes("e") ? `${x + w - 6}px` : `${x - 6}px`;
      handle.style.top = pos.includes("s") ? `${y + h - 6}px` : `${y - 6}px`;
    });
  };

  const startDrag = (event, type) => {
    event.preventDefault();
    this.setEligible(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const start = { ...this.state.params };
    const frame = this.previewFrame.getBoundingClientRect();
    const metrics = getContainMetrics(frame.width, frame.height, appState.source.width, appState.source.height);

    const onMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / metrics.displayWidth;
      const dy = (moveEvent.clientY - startY) / metrics.displayHeight;
      let { cropX, cropY, cropW, cropH } = start;

      if (type === "move") {
        cropX = clamp(start.cropX + dx, 0, 1 - start.cropW);
        cropY = clamp(start.cropY + dy, 0, 1 - start.cropH);
      } else {
        if (type.includes("n")) {
          const newY = clamp(start.cropY + dy, 0, start.cropY + start.cropH - 0.05);
          cropH = start.cropH + (start.cropY - newY);
          cropY = newY;
        }
        if (type.includes("s")) {
          cropH = clamp(start.cropH + dy, 0.05, 1 - start.cropY);
        }
        if (type.includes("w")) {
          const newX = clamp(start.cropX + dx, 0, start.cropX + start.cropW - 0.05);
          cropW = start.cropW + (start.cropX - newX);
          cropX = newX;
        }
        if (type.includes("e")) {
          cropW = clamp(start.cropW + dx, 0.05, 1 - start.cropX);
        }
      }

      this.state.params.cropX = cropX;
      this.state.params.cropY = cropY;
      this.state.params.cropW = cropW;
      this.state.params.cropH = cropH;
      updateOverlay();
      this.bumpRevision();
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  rect.addEventListener("pointerdown", (event) => startDrag(event, "move"));
  handles.forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => startDrag(event, handle.dataset.handle));
  });

  this.getCropGeometryString = () => {
    if (!appState.source) return "0x0+0+0";
    const width = Math.round(appState.source.width * this.state.params.cropW);
    const height = Math.round(appState.source.height * this.state.params.cropH);
    const x = Math.round(appState.source.width * this.state.params.cropX);
    const y = Math.round(appState.source.height * this.state.params.cropY);
    return `${width}x${height}+${x}+${y}`;
  };

  window.addEventListener("resize", updateOverlay);
  this.updateControls = new Proxy(this.updateControls.bind(this), {
    apply: (target, thisArg, args) => {
      Reflect.apply(target, thisArg, args);
      updateOverlay();
    },
  });

  updateOverlay();
};

Widget.prototype.addPerspectiveOverlay = function addPerspectiveOverlay() {
  const overlay = createElement("div", "overlay");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("fill", "rgba(239, 111, 63, 0.15)");
  polygon.setAttribute("stroke", "#ef6f3f");
  polygon.setAttribute("stroke-width", "2");
  svg.appendChild(polygon);
  overlay.appendChild(svg);

  const handles = [0, 1, 2, 3].map((index) => {
    const handle = createElement("div", "handle");
    handle.dataset.index = index;
    overlay.appendChild(handle);
    return handle;
  });

  this.previewFrame.appendChild(overlay);

  const updateOverlay = () => {
    if (!appState.source) return;
    const frame = this.previewFrame.getBoundingClientRect();
    const metrics = getContainMetrics(frame.width, frame.height, appState.source.width, appState.source.height);
    const points = this.getPerspectivePoints();
    const coords = points.map((point) => {
      const x = metrics.offsetX + metrics.displayWidth * point.x;
      const y = metrics.offsetY + metrics.displayHeight * point.y;
      return { x, y };
    });
    polygon.setAttribute(
      "points",
      coords.map((point) => `${point.x},${point.y}`).join(" ")
    );
    handles.forEach((handle, index) => {
      handle.style.left = `${coords[index].x - 6}px`;
      handle.style.top = `${coords[index].y - 6}px`;
    });
  };

  const startDrag = (event, index) => {
    event.preventDefault();
    this.setEligible(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const frame = this.previewFrame.getBoundingClientRect();
    const metrics = getContainMetrics(frame.width, frame.height, appState.source.width, appState.source.height);
    const start = this.getPerspectivePoints();

    const onMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / metrics.displayWidth;
      const dy = (moveEvent.clientY - startY) / metrics.displayHeight;
      const next = start.map((point, idx) => {
        if (idx !== index) return point;
        return {
          x: clamp(point.x + dx, 0, 1),
          y: clamp(point.y + dy, 0, 1),
        };
      });
      this.setPerspectivePoints(next);
      updateOverlay();
      this.bumpRevision();
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  handles.forEach((handle) => {
    handle.addEventListener("pointerdown", (event) => startDrag(event, Number(handle.dataset.index)));
  });

  this.getPerspectivePoints = () => [
    { x: this.state.params.p0x, y: this.state.params.p0y },
    { x: this.state.params.p1x, y: this.state.params.p1y },
    { x: this.state.params.p2x, y: this.state.params.p2y },
    { x: this.state.params.p3x, y: this.state.params.p3y },
  ];

  this.setPerspectivePoints = (points) => {
    [
      ["p0x", "p0y"],
      ["p1x", "p1y"],
      ["p2x", "p2y"],
      ["p3x", "p3y"],
    ].forEach((keys, index) => {
      this.state.params[keys[0]] = points[index].x;
      this.state.params[keys[1]] = points[index].y;
    });
  };

  this.applyPerspectivePreset = () => {
    const inset = 0.15;
    if (this.state.params.mode === "keystone-left") {
      this.setPerspectivePoints([
        { x: inset, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: inset, y: 1 },
      ]);
    } else if (this.state.params.mode === "keystone-right") {
      this.setPerspectivePoints([
        { x: 0, y: 0 },
        { x: 1 - inset, y: 0 },
        { x: 1 - inset, y: 1 },
        { x: 0, y: 1 },
      ]);
    } else {
      this.setPerspectivePoints([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ]);
    }
    this.updateControls();
  };

  this.getPerspectiveCliCoords = () => {
    if (!appState.source) return "";
    const points = this.getPerspectivePoints();
    const source = [
      { x: 0, y: 0 },
      { x: appState.source.width, y: 0 },
      { x: appState.source.width, y: appState.source.height },
      { x: 0, y: appState.source.height },
    ];
    return source
      .map((src, index) => {
        const dst = points[index];
        return `${src.x},${src.y} ${Math.round(dst.x * appState.source.width)},${
          Math.round(dst.y * appState.source.height)
        }`;
      })
      .join(" ");
  };

  window.addEventListener("resize", updateOverlay);
  this.updateControls = new Proxy(this.updateControls.bind(this), {
    apply: (target, thisArg, args) => {
      Reflect.apply(target, thisArg, args);
      updateOverlay();
    },
  });

  updateOverlay();
};

async function decodeImage(file) {
  const blobUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = blobUrl;
  await image.decode();
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  URL.revokeObjectURL(blobUrl);
  return { width, height };
}

async function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    elements.ingestMessage.textContent = "That file is not a supported image type.";
    setAppMode("SourceError", "Unsupported file type");
    clearSourceState();
    return;
  }

  let width;
  let height;
  try {
    ({ width, height } = await decodeImage(file));
  } catch (error) {
    elements.ingestMessage.textContent = "Could not decode this image. Try another file.";
    setAppMode("SourceError", "Image decode failed");
    clearSourceState();
    return;
  }
  const megaPixels = (width * height) / 1_000_000;
  if (megaPixels > MAX_MEGAPIXELS) {
    elements.ingestMessage.textContent = `Image is too large (${megaPixels.toFixed(1)} MP). Resize below ${MAX_MEGAPIXELS} MP.`;
    setAppMode("SourceError", "Image exceeds pixel budget");
    clearSourceState();
    return;
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const sourceUrl = URL.createObjectURL(file);

  if (appState.source?.previewUrl) {
    URL.revokeObjectURL(appState.source.previewUrl);
  }

  appState.source = {
    id: crypto.randomUUID(),
    name: file.name,
    mime: file.type,
    size: bytes.byteLength,
    width,
    height,
    previewUrl: sourceUrl,
    bytes,
  };

  const sourcePlaceholder = elements.sourceFrame.querySelector(".placeholder");
  if (sourcePlaceholder) {
    sourcePlaceholder.textContent = "";
  }
  elements.sourceImage.src = sourceUrl;
  elements.metaDimensions.textContent = `${width} x ${height}`;
  elements.metaMegapixels.textContent = formatMegapixels(width, height);
  elements.metaBytes.textContent = formatBytes(bytes.byteLength);
  elements.metaName.textContent = file.name;
  elements.ingestMessage.textContent = "Image loaded. Widgets will render as they appear.";

  appState.widgets.forEach((widget) => {
    if (!widget.state.supported) {
      widget.setEnabled(false);
      widget.setStatus("error", "Unavailable in this build.");
      widget.setError("Unavailable in this build.");
      widget.previewPlaceholder.textContent = "Unavailable in this build.";
      return;
    }
    widget.setEnabled(true);
    widget.clearOutput();
    widget.setError(null);
    widget.setStatus("idle", "Waiting for visibility");
    widget.updateControls();
    widget.bumpRevision();
  });

  workerClient.setSource(appState.source);
  setAppMode("SourceLoaded");
  updateChromaPreviewBackground();
}

function setupIngestion() {
  elements.dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("hover");
  });
  elements.dropZone.addEventListener("dragleave", () => {
    elements.dropZone.classList.remove("hover");
  });
  elements.dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("hover");
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  elements.dropZone.addEventListener("click", () => elements.fileInput.click());
  elements.dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });

  elements.fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) handleFile(file);
  });
}

function setupResetAll() {
  elements.resetAll.addEventListener("click", () => {
    if (!confirm("Reset all widgets to defaults?")) return;
    appState.widgets.forEach((widget) => widget.resetDefaults());
    logDiag("Reset all widgets.");
  });
}

function updateChromaPreviewBackground() {
  const widget = appState.widgets.find((item) => item.def.id === "chroma-key");
  if (!widget) return;
  const mode = widget.state.params.previewBackground;
  widget.previewFrame.classList.toggle("checkerboard", mode === "checker");
  widget.previewFrame.classList.toggle("white-bg", mode === "white");
  widget.previewFrame.classList.toggle("black-bg", mode === "black");
}

function applyCapabilities() {
  const caps = workerClient.capabilities || {};
  const required = {
    "liquid-rescale": "liquidRescale",
    threshold: "clut",
    clut: "clut",
  };
  appState.widgets.forEach((widget) => {
    const feature = required[widget.def.id];
    if (feature && !caps[feature]) {
      widget.state.supported = false;
      widget.setEnabled(false);
      widget.setStatus("error", "Unavailable in this build.");
      widget.setError("Unavailable in this build.");
      widget.previewPlaceholder.textContent = "Unavailable in this build.";
    }
    if (widget.def.id === "motion") {
      const biasControl = widget.controls.get("bias");
      if (biasControl) biasControl.wrapper.hidden = true;
    }
  });
}

function applyWidgetEligibility() {
  appState.widgets.forEach((widget) => {
    widget.setEnabled(Boolean(appState.source));
  });
}

workerClient.onMessage((message) => {
  if (message.type === "job-progress") {
    const widget = appState.widgets.find((item) => item.def.id === message.widgetId);
    if (!widget) return;
    if (widget.state.latestToken !== message.token) return;
    widget.setStatus("running", message.stage || "Processing...");
  }
});

setupIngestion();
setupResetAll();
buildWidgets();
applyWidgetEligibility();
updateChromaPreviewBackground();

appState.widgets.forEach((widget) => {
  widget.card.addEventListener("input", () => {
    widget.setEligible(true);
    if (widget.def.id === "chroma-key") {
      updateChromaPreviewBackground();
    }
  });
  widget.card.addEventListener("change", () => {
    widget.setEligible(true);
    if (widget.def.id === "chroma-key") {
      updateChromaPreviewBackground();
    }
  });
});
