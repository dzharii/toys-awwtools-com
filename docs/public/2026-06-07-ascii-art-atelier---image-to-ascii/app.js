import {
  ASCII_CHARSETS,
  DEFAULT_ASCII_OPTIONS,
  AsciiArtError,
  convertImageToAscii,
  copyAsciiText,
  downloadText,
  validateAsciiOptions
} from "./src/ascii-art-converter.js";

const LOG_PREFIX = "[ASCII Art Atelier]";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const SUPPORTED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const PREVIEW_DELAY_MS = 180;

const UI_LIMITS = Object.freeze({
  scale: { min: 1, max: 32, label: "Scale" },
  brightness: { min: -100, max: 100, label: "Brightness" },
  contrast: { min: -100, max: 100, label: "Contrast" },
  detail: { min: -100, max: 100, label: "Softness / detail" },
  outputColumns: { min: 40, max: 240, label: "Output columns" }
});

const initialSettings = Object.freeze({
  scale: Math.min(32, Math.max(1, DEFAULT_ASCII_OPTIONS.scale)),
  charsetPreset: DEFAULT_ASCII_OPTIONS.charsetPreset,
  brightness: DEFAULT_ASCII_OPTIONS.brightness,
  contrast: 12,
  detail: DEFAULT_ASCII_OPTIONS.detail,
  invertColors: DEFAULT_ASCII_OPTIONS.invertColors,
  colorMode: DEFAULT_ASCII_OPTIONS.colorMode,
  outputColumns: 120
});

const state = {
  file: null,
  objectUrl: "",
  imageDimensions: null,
  result: null,
  isConverting: false,
  livePreview: true,
  currentUiError: null,
  settings: { ...initialSettings }
};

const elements = {
  imageInput: document.querySelector("#image-input"),
  dropzone: document.querySelector("#dropzone"),
  fileCard: document.querySelector("#file-card"),
  fileThumbnail: document.querySelector("#file-thumbnail"),
  thumbnailWrap: document.querySelector(".thumbnail-wrap"),
  fileName: document.querySelector("#file-name"),
  fileMeta: document.querySelector("#file-meta"),
  operationMessage: document.querySelector("#operation-message"),
  operationTitle: document.querySelector("#operation-title"),
  operationDescription: document.querySelector("#operation-description"),
  operationDetails: document.querySelector("#operation-details"),
  tryAnotherButton: document.querySelector("#try-another-button"),
  copyErrorButton: document.querySelector("#copy-error-button"),
  errorCopyFeedback: document.querySelector("#error-copy-feedback"),
  asciiOutput: document.querySelector("#ascii-output"),
  columnsMeta: document.querySelector("#columns-meta"),
  rowsMeta: document.querySelector("#rows-meta"),
  charactersMeta: document.querySelector("#characters-meta"),
  sourceMeta: document.querySelector("#source-meta"),
  copyButton: document.querySelector("#copy-button"),
  downloadButton: document.querySelector("#download-button"),
  workspaceStatus: document.querySelector("#workspace-status"),
  settingsForm: document.querySelector("#settings-form"),
  resetButton: document.querySelector("#reset-button"),
  charsetPreset: document.querySelector("#charset-preset"),
  invertColors: document.querySelector("#invert-colors"),
  originalColor: document.querySelector("#original-color"),
  livePreview: document.querySelector("#live-preview")
};

const numericControls = {
  scale: {
    range: document.querySelector("#scale"),
    number: document.querySelector("#scale-number"),
    message: document.querySelector("#scale-message")
  },
  brightness: {
    range: document.querySelector("#brightness"),
    number: document.querySelector("#brightness-number"),
    message: document.querySelector("#brightness-message")
  },
  contrast: {
    range: document.querySelector("#contrast"),
    number: document.querySelector("#contrast-number"),
    message: document.querySelector("#contrast-message")
  },
  detail: {
    range: document.querySelector("#detail"),
    number: document.querySelector("#detail-number"),
    message: document.querySelector("#detail-message")
  },
  outputColumns: {
    range: document.querySelector("#output-columns"),
    number: document.querySelector("#output-columns-number"),
    message: document.querySelector("#output-columns-message")
  }
};

let conversionRunId = 0;
let conversionTimer = 0;
let settingsLogTimer = 0;
let pendingChangedSettings = {};

initializeApp();

function initializeApp() {
  populateCharsetOptions();
  applySettingsToControls();
  bindEvents();
  renderEmptyPreview();

  logEvent("info", "app-init", "success", "ASCII Art Atelier initialized.", {
    charsetPresetCount: Object.keys(ASCII_CHARSETS).length,
    livePreview: state.livePreview
  });
}

function populateCharsetOptions() {
  const preferredPresets = ["minimal", "simple", "standard", "detailed", "extended", "blocks", "dots", "binary"];
  const fragment = document.createDocumentFragment();

  for (const preset of preferredPresets) {
    if (!Object.hasOwn(ASCII_CHARSETS, preset)) {
      continue;
    }

    const option = document.createElement("option");
    option.value = preset;
    option.textContent = `${toTitleCase(preset)} (${shortenCharset(ASCII_CHARSETS[preset])})`;
    fragment.append(option);
  }

  elements.charsetPreset.append(fragment);
}

function bindEvents() {
  elements.imageInput.addEventListener("change", () => {
    const file = elements.imageInput.files?.[0] || null;
    if (!file) {
      return;
    }

    logEvent("info", "file-select", "start", "User selected a file.", getFileLogDetails(file));
    handleFile(file);
  });

  for (const eventName of ["dragenter", "dragover"]) {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      elements.dropzone.classList.add("is-dragover");
    });
  }

  for (const eventName of ["dragleave", "drop"]) {
    elements.dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropzone.classList.remove("is-dragover");
    });
  }

  elements.dropzone.addEventListener("drop", (event) => {
    const files = event.dataTransfer?.files;
    const file = files?.[0] || null;
    const fileCount = files?.length || 0;

    logEvent("info", "file-drop", "start", "User dropped a file.", {
      fileCount,
      ...getFileLogDetails(file)
    });

    if (fileCount > 1) {
      logEvent("warn", "file-drop", "skip", "Multiple files were dropped. Only the first file will be used.", {
        fileCount
      });
    }

    if (!file) {
      showOperationError(createUiError(
        "NO_FILE_SELECTED",
        "No image selected",
        "Import an image before converting.",
        "file-drop"
      ));
      return;
    }

    handleFile(file);
  });

  for (const [fieldName, control] of Object.entries(numericControls)) {
    control.range.addEventListener("input", () => {
      control.number.value = control.range.value;
      updateNumericSetting(fieldName, control.range.value);
    });

    control.number.addEventListener("input", () => {
      const validation = validateNumericField(fieldName, control.number.value);
      if (!validation.valid) {
        showFieldError(fieldName, validation.message);
        clearPendingConversion();
        showOperationError(createUiError(
          "INVALID_SETTINGS",
          "Settings need attention",
          "Fix the highlighted setting before converting.",
          "settings-validate"
        ));
        renderFailedPreview("No ASCII output is available for the current settings.\nFix the highlighted value to continue.");
        return;
      }

      clearFieldError(fieldName);
      control.range.value = String(validation.value);
      updateNumericSetting(fieldName, validation.value);
    });

    control.number.addEventListener("blur", () => normalizeNumericControl(fieldName));
    control.number.addEventListener("change", () => normalizeNumericControl(fieldName));
  }

  elements.charsetPreset.addEventListener("change", () => {
    updateSetting("charsetPreset", elements.charsetPreset.value);
  });

  elements.invertColors.addEventListener("change", () => {
    updateSetting("invertColors", elements.invertColors.checked);
  });

  elements.originalColor.addEventListener("change", () => {
    updateSetting("colorMode", elements.originalColor.checked ? "original" : "monochrome");
  });

  elements.livePreview.addEventListener("change", () => {
    state.livePreview = elements.livePreview.checked;
    logEvent("debug", "settings-change", "state-change", "Live preview setting changed.", {
      livePreview: state.livePreview
    });

    if (state.livePreview && state.file && validateAllSettings()) {
      scheduleConversion();
    }
  });

  elements.resetButton.addEventListener("click", resetSettings);
  elements.copyButton.addEventListener("click", copyResult);
  elements.downloadButton.addEventListener("click", downloadResult);
  elements.tryAnotherButton.addEventListener("click", () => elements.imageInput.click());
  elements.copyErrorButton.addEventListener("click", copyCurrentErrorDetails);

  window.addEventListener("beforeunload", revokeObjectUrl);
}

async function handleFile(file) {
  const previousErrorCode = state.currentUiError?.code || null;
  const fileError = validateFile(file);

  if (fileError) {
    logEvent("warn", "file-validate", "validation-error", "Selected file failed validation.", {
      ...getFileLogDetails(file),
      errorCode: fileError.code,
      errorMessage: fileError.message
    });
    clearSelectedFile();
    showOperationError(fileError);
    renderFailedPreview("No ASCII output is available for the current image.\nChoose a supported image to continue.");
    return;
  }

  clearPendingConversion();
  clearOperationError();
  state.file = file;
  state.imageDimensions = null;
  elements.fileCard.hidden = false;
  elements.fileName.textContent = file.name;
  elements.fileMeta.textContent = `Reading dimensions · ${formatBytes(file.size)}`;

  logEvent("debug", "file-validate", "success", previousErrorCode
    ? "File validation recovered after previous error."
    : "Selected file passed validation.", {
    previousErrorCode,
    ...getFileLogDetails(file)
  });

  await renderSelectedFile(file);
  await runConversion();
}

function validateFile(file) {
  if (!file) {
    return createUiError(
      "NO_FILE_SELECTED",
      "No image selected",
      "Import an image before converting.",
      "file-validate"
    );
  }

  const extension = getFileExtension(file.name);
  const hasSupportedType = SUPPORTED_MIME_TYPES.has(file.type);
  const hasSupportedExtension = SUPPORTED_EXTENSIONS.has(extension);

  if (!hasSupportedType && !hasSupportedExtension) {
    return createUiError(
      "UNSUPPORTED_FILE_TYPE",
      "Unsupported file type",
      "Select a PNG, JPG, JPEG, or WEBP image.",
      "file-validate",
      getFileLogDetails(file)
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return createUiError(
      "FILE_TOO_LARGE",
      "Image is too large",
      "Select an image up to 10 MB, or resize the image before importing it.",
      "file-validate",
      { ...getFileLogDetails(file), limitBytes: MAX_FILE_SIZE }
    );
  }

  return null;
}

async function renderSelectedFile(file) {
  revokeObjectUrl();
  state.objectUrl = URL.createObjectURL(file);
  elements.fileThumbnail.src = state.objectUrl;
  elements.fileThumbnail.alt = `Preview of ${file.name}`;
  elements.thumbnailWrap.classList.remove("has-placeholder");

  try {
    const dimensions = await readImageDimensions(state.objectUrl);
    if (file !== state.file) {
      return;
    }

    state.imageDimensions = dimensions;
    elements.fileMeta.textContent = `${dimensions.width} × ${dimensions.height} px · ${formatBytes(file.size)}`;
    logEvent("debug", "thumbnail-render", "success", "Image thumbnail and dimensions loaded.", {
      fileName: file.name,
      width: dimensions.width,
      height: dimensions.height
    });
  } catch (error) {
    if (file !== state.file) {
      return;
    }

    elements.thumbnailWrap.classList.add("has-placeholder");
    elements.fileMeta.textContent = `Dimensions unavailable · ${formatBytes(file.size)}`;
    logEvent("warn", "thumbnail-render", "failure", "Thumbnail could not be rendered; conversion will continue.", {
      fileName: file.name,
      errorMessage: error?.message || String(error)
    });
  }
}

function readImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The browser could not decode the thumbnail."));
    image.src = url;
  });
}

function updateNumericSetting(fieldName, rawValue) {
  const value = Number(rawValue);
  if (state.settings[fieldName] === value) {
    return;
  }

  state.settings[fieldName] = value;
  queueSettingsLog(fieldName, value);
  scheduleConversion();
}

function updateSetting(fieldName, value) {
  if (state.settings[fieldName] === value) {
    return;
  }

  state.settings[fieldName] = value;
  queueSettingsLog(fieldName, value);
  scheduleConversion();
}

function normalizeNumericControl(fieldName) {
  const control = numericControls[fieldName];
  const validation = validateNumericField(fieldName, control.number.value);

  if (!validation.valid) {
    showFieldError(fieldName, validation.message);
    return;
  }

  const previousHadError = control.number.getAttribute("aria-invalid") === "true";
  control.number.value = String(validation.value);
  control.range.value = String(validation.value);
  state.settings[fieldName] = validation.value;
  clearFieldError(fieldName);

  if (previousHadError) {
    logEvent("debug", "settings-validate", "success", "Settings validation recovered.", {
      field: fieldName,
      currentValue: validation.value
    });
  }

  scheduleConversion();
}

function validateNumericField(fieldName, rawValue) {
  const limits = UI_LIMITS[fieldName];
  const value = Number(rawValue);

  if (!Number.isFinite(value) || !Number.isInteger(value) || value < limits.min || value > limits.max) {
    return {
      valid: false,
      message: `${limits.label} must be between ${limits.min} and ${limits.max}.`
    };
  }

  return { valid: true, value };
}

function validateAllSettings() {
  let valid = true;

  for (const [fieldName, control] of Object.entries(numericControls)) {
    const validation = validateNumericField(fieldName, control.number.value);
    if (!validation.valid) {
      showFieldError(fieldName, validation.message);
      valid = false;
    } else {
      clearFieldError(fieldName);
    }
  }

  const converterValidation = validateAsciiOptions(getConverterOptions(false));
  if (!converterValidation.valid) {
    valid = false;
    logEvent("warn", "settings-validate", "validation-error", "Converter option validation failed.", {
      errors: converterValidation.errors.map(({ option, message }) => ({ option, message }))
    });
  }

  return valid;
}

function showFieldError(fieldName, message) {
  const control = numericControls[fieldName];
  control.number.setAttribute("aria-invalid", "true");
  control.message.className = "field-message is-error";
  control.message.textContent = message;

  logEvent("warn", "settings-validate", "validation-error", "Settings validation failed.", {
    field: fieldName,
    value: control.number.value,
    message
  });
}

function clearFieldError(fieldName) {
  const control = numericControls[fieldName];
  control.number.removeAttribute("aria-invalid");

  if (fieldName === "outputColumns") {
    control.message.className = "field-message is-valid";
    control.message.innerHTML = '<span aria-hidden="true">✓</span>Value is valid';
  } else {
    control.message.className = "field-message";
    control.message.textContent = "";
  }
}

function scheduleConversion() {
  clearTimeout(conversionTimer);

  if (!state.livePreview || !state.file) {
    logEvent("debug", "convert-image", "skip", "Conversion was not scheduled.", {
      reason: !state.file ? "missing-file" : "live-preview-disabled"
    });
    return;
  }

  conversionRunId += 1;

  if (!validateAllSettings()) {
    clearCurrentResult();
    showOperationError(createUiError(
      "INVALID_SETTINGS",
      "Settings need attention",
      "Fix the highlighted setting before converting.",
      "settings-validate"
    ));
    renderFailedPreview("No ASCII output is available for the current settings.\nFix the highlighted value to continue.");
    return;
  }

  conversionTimer = window.setTimeout(runConversion, PREVIEW_DELAY_MS);
}

async function runConversion() {
  clearTimeout(conversionTimer);

  if (!state.file) {
    logEvent("debug", "convert-image", "skip", "Conversion skipped because no valid file is selected.", {
      reason: "missing-file"
    });
    return;
  }

  if (!validateAllSettings()) {
    return;
  }

  const runId = ++conversionRunId;
  const previousErrorCode = state.currentUiError?.code || null;
  clearOperationError();
  setBusy(true);

  logEvent("info", "convert-image", "start", "Starting image conversion.", {
    runId,
    ...getFileLogDetails(state.file),
    settings: getSafeSettingsForLog(),
    livePreview: state.livePreview
  });

  try {
    const result = await convertImageToAscii(state.file, getConverterOptions(true));

    if (runId !== conversionRunId) {
      logEvent("debug", "convert-image", "cancel", "Ignored stale conversion result.", {
        runId,
        activeRunId: conversionRunId
      });
      return;
    }

    renderReadyPreview(result);
    logEvent("info", "convert-image", "success", previousErrorCode
      ? "Conversion recovered after previous failure."
      : "Image conversion completed.", {
      previousErrorCode,
      fileName: state.file?.name || null,
      sourceWidth: result.sourceWidth,
      sourceHeight: result.sourceHeight,
      columns: result.columns,
      rows: result.rowCount,
      characterCount: result.text.length
    });
  } catch (error) {
    if (runId !== conversionRunId) {
      logEvent("debug", "convert-image", "cancel", "Ignored stale conversion error.", {
        runId,
        activeRunId: conversionRunId
      });
      return;
    }

    const uiError = normalizeUiError(error, {
      operation: "convert-image",
      ...getFileLogDetails(state.file)
    });
    clearCurrentResult();
    showOperationError(uiError);
    renderFailedPreview("No ASCII output is available for the current image.\nFix the issue above or import another image.");

    logEvent("error", "convert-image", "failure", "Image conversion failed.", {
      ...getFileLogDetails(state.file),
      errorCode: uiError.code,
      errorMessage: uiError.message,
      settings: getSafeSettingsForLog()
    });
  } finally {
    if (runId === conversionRunId) {
      setBusy(false);
    }
  }
}

function getConverterOptions(includeLogger) {
  const options = {
    ...state.settings,
    renderCanvas: false,
    includeImageData: false
  };

  if (includeLogger) {
    options.onLogEvent = (event) => {
      logEvent("debug", "convert-image", event.type || "converter-event", event.message || "Converter event.", {
        converterTimestamp: event.timestamp,
        ...sanitizeLogDetails(event.details || {})
      });
    };
  }

  return options;
}

function renderReadyPreview(result) {
  state.result = result;
  elements.asciiOutput.classList.remove("is-placeholder");
  elements.asciiOutput.textContent = result.text;
  elements.columnsMeta.textContent = String(result.columns);
  elements.rowsMeta.textContent = String(result.rowCount);
  elements.charactersMeta.textContent = formatNumber(result.text.length);
  elements.sourceMeta.textContent = `${result.sourceWidth} × ${result.sourceHeight}`;
  elements.copyButton.disabled = false;
  elements.downloadButton.disabled = false;
  setWorkspaceStatus("Conversion successful. Preview updated.", "success");
}

function renderEmptyPreview() {
  clearCurrentResult();
  elements.asciiOutput.classList.add("is-placeholder");
  elements.asciiOutput.textContent = "ASCII output will appear here after you import an image.";
}

function renderFailedPreview(message) {
  clearCurrentResult();
  elements.asciiOutput.classList.add("is-placeholder");
  elements.asciiOutput.textContent = message;
}

function clearCurrentResult() {
  state.result = null;
  elements.columnsMeta.textContent = "-";
  elements.rowsMeta.textContent = "-";
  elements.charactersMeta.textContent = "-";
  elements.sourceMeta.textContent = "-";
  elements.copyButton.disabled = true;
  elements.downloadButton.disabled = true;
}

function clearSelectedFile() {
  clearPendingConversion();
  revokeObjectUrl();
  state.file = null;
  state.imageDimensions = null;
  elements.imageInput.value = "";
  elements.fileCard.hidden = true;
  elements.fileThumbnail.removeAttribute("src");
  elements.fileThumbnail.alt = "";
  clearCurrentResult();
}

function setBusy(isBusy) {
  state.isConverting = isBusy;
  elements.settingsForm.setAttribute("aria-busy", String(isBusy));

  if (isBusy) {
    setWorkspaceStatus("Converting image...");
  }
}

async function copyResult() {
  if (!state.result) {
    showOperationError(createUiError(
      "NO_RESULT",
      "No ASCII text available",
      "Import an image before copying ASCII text.",
      "copy-ascii-text"
    ));
    return;
  }

  logEvent("info", "copy-ascii-text", "start", "Copying ASCII text to clipboard.", {
    characterCount: state.result.text.length
  });

  try {
    await copyAsciiText(state.result.text);
    clearOperationError();
    setWorkspaceStatus("ASCII text copied to the clipboard.", "success");
    logEvent("info", "copy-ascii-text", "success", "ASCII text copied to clipboard.", {
      characterCount: state.result.text.length
    });
  } catch (error) {
    const uiError = normalizeUiError(error, { operation: "copy-ascii-text" });
    showOperationError(uiError);
    logEvent("error", "copy-ascii-text", "failure", "Could not copy ASCII text.", {
      errorCode: uiError.code,
      errorMessage: uiError.message
    });
  }
}

function downloadResult() {
  if (!state.result) {
    showOperationError(createUiError(
      "NO_RESULT",
      "No ASCII text available",
      "Import an image before downloading ASCII text.",
      "download-ascii-text"
    ));
    return;
  }

  const filename = getDownloadFilename(state.file?.name || "ascii-art");
  logEvent("info", "download-ascii-text", "start", "Preparing ASCII text download.", {
    fileName: filename,
    characterCount: state.result.text.length
  });

  try {
    downloadText(filename, state.result.text);
    clearOperationError();
    setWorkspaceStatus(`Download started: ${filename}`, "success");
    logEvent("info", "download-ascii-text", "success", "ASCII text download was triggered.", {
      fileName: filename,
      characterCount: state.result.text.length
    });
  } catch (error) {
    const uiError = normalizeUiError(error, {
      operation: "download-ascii-text",
      downloadFileName: filename
    });
    showOperationError(uiError);
    logEvent("error", "download-ascii-text", "failure", "Could not download ASCII text.", {
      fileName: filename,
      errorCode: uiError.code,
      errorMessage: uiError.message
    });
  }
}

function resetSettings() {
  state.settings = { ...initialSettings };
  state.livePreview = true;
  applySettingsToControls();
  clearAllFieldErrors();

  logEvent("info", "settings-change", "state-change", "Conversion settings reset.", {
    settings: getSafeSettingsForLog()
  });

  if (state.file) {
    scheduleConversion();
  } else {
    setWorkspaceStatus("Settings reset. Import an image to begin.");
  }
}

function applySettingsToControls() {
  for (const [fieldName, control] of Object.entries(numericControls)) {
    const value = state.settings[fieldName];
    control.range.value = String(value);
    control.number.value = String(value);
  }

  elements.charsetPreset.value = state.settings.charsetPreset;
  elements.invertColors.checked = state.settings.invertColors;
  elements.originalColor.checked = state.settings.colorMode === "original";
  elements.livePreview.checked = state.livePreview;
}

function clearAllFieldErrors() {
  for (const fieldName of Object.keys(numericControls)) {
    clearFieldError(fieldName);
  }
}

function normalizeUiError(error, context = {}) {
  const isAsciiError = error instanceof AsciiArtError || error?.name === "AsciiArtError";
  const code = isAsciiError ? error.code : "UNEXPECTED_ERROR";
  const messages = getErrorPresentation(code, context);

  return {
    code,
    title: messages.title,
    message: messages.message,
    operation: context.operation || "unknown",
    details: {
      ...context,
      originalMessage: error?.message || String(error),
      converterDetails: isAsciiError ? error.details : undefined
    },
    cause: error
  };
}

function getErrorPresentation(code, context) {
  const presentations = {
    IMAGE_DECODE_FAILED: {
      title: "Could not read this image",
      message: "The browser could not decode the file as a supported image. Try another PNG, JPG, or WEBP file."
    },
    IMAGE_LOAD_FAILED: {
      title: "Could not read this image",
      message: "The browser could not load this image. Try exporting it again as PNG, JPG, or WEBP."
    },
    CROSS_ORIGIN_PIXELS_UNREADABLE: {
      title: "Browser could not read image pixels",
      message: "The image loaded, but the browser could not read its pixels. Try importing the image as a local file."
    },
    OUTPUT_TOO_LARGE: {
      title: "ASCII output is too large",
      message: "Reduce output columns, increase scale, or try a smaller image."
    },
    INPUT_TOO_LARGE: {
      title: "Image dimensions are too large",
      message: "Resize the image to fewer pixels, then import it again."
    },
    INVALID_OPTIONS: {
      title: "Settings need attention",
      message: "Fix the highlighted setting before converting."
    },
    VALIDATION_FAILED: {
      title: "Settings need attention",
      message: "Fix the highlighted setting before converting."
    },
    CLIPBOARD_UNAVAILABLE: {
      title: "Could not copy ASCII text",
      message: "Your browser blocked clipboard access. Select the ASCII text manually or try again after focusing the page."
    },
    DOWNLOAD_UNAVAILABLE: {
      title: "Could not download ASCII text",
      message: "The browser could not create the text download. Try copying the ASCII text instead."
    },
    EXPORT_FAILED: {
      title: "Could not download ASCII text",
      message: "The browser could not create the text download. Try copying the ASCII text instead."
    }
  };

  if (context.operation === "copy-ascii-text") {
    return presentations.CLIPBOARD_UNAVAILABLE;
  }

  if (context.operation === "download-ascii-text") {
    return presentations.DOWNLOAD_UNAVAILABLE;
  }

  return presentations[code] || {
    title: "Something went wrong",
    message: "Conversion failed unexpectedly. Try another image or use smaller output settings."
  };
}

function createUiError(code, title, message, operation, details = {}) {
  return { code, title, message, operation, details, cause: null };
}

function showOperationError(uiError) {
  state.currentUiError = uiError;
  elements.operationTitle.textContent = uiError.title;
  elements.operationDescription.textContent = uiError.message;
  elements.operationDetails.textContent = formatTechnicalDetails(uiError);
  elements.errorCopyFeedback.textContent = "";
  elements.operationMessage.hidden = false;
  setWorkspaceStatus(uiError.title, "error");
}

function clearOperationError() {
  state.currentUiError = null;
  elements.operationMessage.hidden = true;
  elements.operationTitle.textContent = "";
  elements.operationDescription.textContent = "";
  elements.operationDetails.textContent = "";
  elements.errorCopyFeedback.textContent = "";
}

async function copyCurrentErrorDetails() {
  if (!state.currentUiError) {
    return;
  }

  const report = formatErrorReport(state.currentUiError);
  logEvent("info", "error-details-copy", "start", "Copying error details.", {
    errorCode: state.currentUiError.code,
    operation: state.currentUiError.operation
  });

  try {
    await navigator.clipboard.writeText(report);
    elements.errorCopyFeedback.textContent = "Error details copied.";
    logEvent("info", "error-details-copy", "success", "Error details copied.", {
      errorCode: state.currentUiError.code,
      operation: state.currentUiError.operation
    });
  } catch (error) {
    elements.errorCopyFeedback.textContent = "Could not copy error details. Expand Technical details and copy them manually.";
    logEvent("error", "error-details-copy", "failure", "Could not copy error details.", {
      errorCode: state.currentUiError.code,
      operation: state.currentUiError.operation,
      copyErrorMessage: error?.message || String(error)
    });
  }
}

function formatTechnicalDetails(uiError) {
  const lines = [
    `Error code: ${uiError.code}`,
    `Operation: ${uiError.operation}`
  ];
  const details = uiError.details || {};

  if (details.fileName) lines.push(`File: ${details.fileName}`);
  if (details.fileType) lines.push(`File type: ${details.fileType}`);
  if (details.fileSizeBytes != null) lines.push(`File size: ${details.fileSizeBytes} bytes`);
  if (details.limitBytes != null) lines.push(`Limit: ${details.limitBytes} bytes`);
  if (details.originalMessage) lines.push(`Original message: ${details.originalMessage}`);
  if (details.converterDetails) {
    lines.push(`Converter details: ${safeStringify(details.converterDetails)}`);
  }

  return lines.join("\n");
}

function formatErrorReport(uiError) {
  const dimensions = state.imageDimensions
    ? `${state.imageDimensions.width} × ${state.imageDimensions.height}`
    : "unavailable";

  return [
    "ASCII Art Atelier error report",
    "",
    "Message:",
    uiError.title,
    "",
    "Error:",
    uiError.message,
    "",
    "Details:",
    formatTechnicalDetails(uiError),
    `Image dimensions: ${dimensions}`,
    `Browser: ${navigator.userAgent}`,
    `Timestamp: ${new Date().toISOString()}`,
    "",
    "Settings:",
    ...Object.entries(getSafeSettingsForLog()).map(([key, value]) => `${key}: ${value}`)
  ].join("\n");
}

function setWorkspaceStatus(message, tone = "") {
  elements.workspaceStatus.textContent = message;
  elements.workspaceStatus.className = "workspace-status";
  if (tone) {
    elements.workspaceStatus.classList.add(`is-${tone}`);
  }
}

function queueSettingsLog(fieldName, value) {
  pendingChangedSettings[fieldName] = value;
  clearTimeout(settingsLogTimer);
  settingsLogTimer = window.setTimeout(() => {
    logEvent("debug", "settings-change", "state-change", "Conversion settings changed.", {
      changed: pendingChangedSettings,
      settings: getSafeSettingsForLog()
    });
    pendingChangedSettings = {};
  }, PREVIEW_DELAY_MS);
}

function clearPendingConversion() {
  clearTimeout(conversionTimer);
  conversionRunId += 1;
}

function getSafeSettingsForLog() {
  return {
    scale: state.settings.scale,
    charsetPreset: state.settings.charsetPreset,
    brightness: state.settings.brightness,
    contrast: state.settings.contrast,
    detail: state.settings.detail,
    invertColors: state.settings.invertColors,
    colorMode: state.settings.colorMode,
    outputColumns: state.settings.outputColumns,
    renderCanvas: false
  };
}

function logEvent(level, operation, event, message, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    operation,
    event,
    message,
    details: sanitizeLogDetails(details)
  };

  const method = level === "error"
    ? "error"
    : level === "warn"
      ? "warn"
      : level === "info"
        ? "info"
        : "debug";

  console[method](LOG_PREFIX, entry);
}

function sanitizeLogDetails(details) {
  if (!details || typeof details !== "object") {
    return details;
  }

  const safe = Array.isArray(details) ? [...details] : { ...details };
  const blockedKeys = new Set(["objectUrl", "imageData", "pixelData", "canvas", "asciiText", "result", "text"]);

  for (const key of Object.keys(safe)) {
    if (blockedKeys.has(key)) {
      delete safe[key];
    } else if (safe[key] && typeof safe[key] === "object") {
      safe[key] = sanitizeLogDetails(safe[key]);
    }
  }

  return safe;
}

function getFileLogDetails(file) {
  if (!file) {
    return { hasFile: false };
  }

  return {
    hasFile: true,
    fileName: file.name,
    fileType: file.type || "unknown",
    fileSizeBytes: file.size,
    lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null
  };
}

function getDownloadFilename(fileName) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const safeBase = baseName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "ascii-art";

  return `${safeBase}-ascii.txt`;
}

function revokeObjectUrl() {
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = "";
  }
}

function getFileExtension(fileName) {
  return fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shortenCharset(charset) {
  const visible = charset.replace(/^ /, "␠");
  return visible.length > 18 ? `${visible.slice(0, 17)}…` : visible;
}

function safeStringify(value) {
  try {
    return JSON.stringify(sanitizeLogDetails(value));
  } catch {
    return "[unavailable]";
  }
}
