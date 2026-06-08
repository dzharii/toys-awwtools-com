/**
 * ascii-art-converter.js
 *
 * Standalone browser module for image-to-ASCII conversion.
 *
 * Core algorithm:
 * 1. Draw an image or current video frame into a scratch canvas.
 * 2. Read pixels with CanvasRenderingContext2D.getImageData().
 * 3. Apply optional pixel filters in-place or through bounded temporary buffers.
 * 4. Split the image into a text grid.
 * 5. Average each grid block, convert luminance to a character ramp index,
 *    and optionally retain the original block color.
 * 6. Return plain ASCII text and, optionally, draw a canvas preview/export.
 */

/*
Example:

```js
import { convertImageToAscii } from "./src/ascii-art-converter.js";

const result = await convertImageToAscii(file, {
  scale: 8,
  charsetPreset: "standard",
  colorMode: "original",
  renderCanvas: true,
  onLogEvent(event) {
    console.debug(event.type, event.message, event.details);
  }
});

pre.textContent = result.text;
document.body.append(result.canvas);
```

*/

export const ASCII_CHARSETS = Object.freeze({
  minimal: " ░▓█",
  simple: " .-=+*#%@",
  standard: " .:-=+*#%@",
  detailed: " dbkhao*#MW&8%B@$",
  extended: " Q0OZmwqpdbkhao*#MW&8%B@$",
  full: " `.^\",;:!Ili><~+_-?][}{1)(|/\\tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  blocks: " ░▒▓█",
  dots: " ⡀⣀⣤⣦⣶⣾⣽⣻⢿⡿⣟⣯⣷⣿",
  binary: " █"
});

export const ASCII_COLOR_MODES = Object.freeze({
  monochrome: "monochrome",
  original: "original"
});

export const ASCII_ERROR_CODES = Object.freeze({
  VALIDATION_FAILED: "VALIDATION_FAILED",
  INVALID_OPTIONS: "INVALID_OPTIONS",
  INVALID_SOURCE: "INVALID_SOURCE",
  UNSUPPORTED_SOURCE: "UNSUPPORTED_SOURCE",
  IMAGE_LOAD_FAILED: "IMAGE_LOAD_FAILED",
  IMAGE_DECODE_FAILED: "IMAGE_DECODE_FAILED",
  CROSS_ORIGIN_PIXELS_UNREADABLE: "CROSS_ORIGIN_PIXELS_UNREADABLE",
  INVALID_MEDIA_DIMENSIONS: "INVALID_MEDIA_DIMENSIONS",
  INPUT_TOO_LARGE: "INPUT_TOO_LARGE",
  OUTPUT_TOO_LARGE: "OUTPUT_TOO_LARGE",
  CANVAS_UNAVAILABLE: "CANVAS_UNAVAILABLE",
  CANVAS_CONTEXT_UNAVAILABLE: "CANVAS_CONTEXT_UNAVAILABLE",
  INVALID_IMAGE_DATA: "INVALID_IMAGE_DATA",
  INVALID_GRID: "INVALID_GRID",
  EXPORT_FAILED: "EXPORT_FAILED",
  DOWNLOAD_UNAVAILABLE: "DOWNLOAD_UNAVAILABLE",
  CLIPBOARD_UNAVAILABLE: "CLIPBOARD_UNAVAILABLE",
  CONVERSION_FAILED: "CONVERSION_FAILED"
});

export const DEFAULT_ASCII_OPTIONS = Object.freeze({
  scale: 6,
  spacing: 0,
  charsetPreset: "standard",
  outputColumns: 0,
  colorMode: ASCII_COLOR_MODES.monochrome,
  backgroundColor: "#000000",
  foregroundColor: "#ffffff",
  intensity: 1,
  invertColors: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hueRotation: 0,
  detail: 0,
  gamma: 1,
  blur: 0,
  edgeEnhance: 0,
  brightnessCurve: 0.7,
  quantizeColors: 0,
  charAspectRatio: 0.6,
  fontFamily: "monospace",
  fontWeight: "700",
  fontSize: 0,
  skipSpaceGlyphs: true,
  renderCanvas: true,
  transparentOriginalColorCanvas: true,
  includeImageData: false,
  maxInputPixels: 4096 * 4096,
  maxOutputCells: 250000,
  onLogEvent: null
});

const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;

const NOOP_LOG_EVENT = () => {};
const NORMALIZED_OPTIONS_MARK = Symbol("normalizedAsciiOptions");
const NORMALIZATION_WARNINGS = Symbol("normalizationWarnings");

const SUPPORTED_OPTION_NAMES = Object.freeze(new Set([
  "scale",
  "spacing",
  "charsetPreset",
  "outputColumns",
  "colorMode",
  "backgroundColor",
  "foregroundColor",
  "intensity",
  "invertColors",
  "brightness",
  "contrast",
  "saturation",
  "hueRotation",
  "detail",
  "gamma",
  "blur",
  "edgeEnhance",
  "brightnessCurve",
  "quantizeColors",
  "charAspectRatio",
  "fontFamily",
  "fontWeight",
  "fontSize",
  "skipSpaceGlyphs",
  "renderCanvas",
  "transparentOriginalColorCanvas",
  "includeImageData",
  "maxInputPixels",
  "maxOutputCells",
  "onLogEvent"
]));

const NUMERIC_OPTION_RANGES = Object.freeze({
  scale: { min: 1, max: 256, integer: true },
  spacing: { min: 0, max: 64 },
  outputColumns: { min: 0, max: 10000, integer: true },
  intensity: { min: 0, max: 8 },
  brightness: { min: -100, max: 100 },
  contrast: { min: -254, max: 254 },
  saturation: { min: -100, max: 100 },
  hueRotation: { min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY },
  detail: { min: -100, max: 100 },
  gamma: { min: 0.05, max: 10 },
  blur: { min: 0, max: 64 },
  edgeEnhance: { min: 0, max: 400 },
  brightnessCurve: { min: 0.025, max: 4 },
  quantizeColors: { min: 0, max: 256, integer: true },
  charAspectRatio: { min: 0.1, max: 2 },
  fontSize: { min: 0, max: 512 },
  maxInputPixels: { min: 1, max: Number.MAX_SAFE_INTEGER, integer: true },
  maxOutputCells: { min: 1, max: Number.MAX_SAFE_INTEGER, integer: true }
});

const BOOLEAN_OPTION_NAMES = Object.freeze(new Set([
  "invertColors",
  "skipSpaceGlyphs",
  "renderCanvas",
  "transparentOriginalColorCanvas",
  "includeImageData"
]));

const STRING_OPTION_NAMES = Object.freeze(new Set([
  "backgroundColor",
  "foregroundColor",
  "fontFamily",
  "fontWeight"
]));

export class AsciiArtError extends Error {
  constructor(code, message, details = {}, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "AsciiArtError";
    this.code = code;
    this.details = details;
  }
}

export function validateAsciiOptions(userOptions = {}) {
  const errors = [];
  const warnings = [];

  if (userOptions == null) {
    return { valid: true, errors, warnings };
  }

  if (!isPlainOptionsObject(userOptions)) {
    errors.push(createValidationIssue(
      "INVALID_OPTIONS",
      "options",
      "ASCII options must be a plain object when provided.",
      userOptions
    ));

    return { valid: false, errors, warnings };
  }

  for (const optionName of Object.keys(userOptions)) {
    if (!SUPPORTED_OPTION_NAMES.has(optionName)) {
      errors.push(createValidationIssue(
        "UNKNOWN_OPTION",
        optionName,
        `${optionName} is not a supported ASCII conversion option.`,
        userOptions[optionName]
      ));
    }
  }

  validateEnumOption(userOptions, "charsetPreset", Object.keys(ASCII_CHARSETS), errors);
  validateEnumOption(userOptions, "colorMode", Object.keys(ASCII_COLOR_MODES), errors);

  for (const [optionName, range] of Object.entries(NUMERIC_OPTION_RANGES)) {
    validateNumericOption(userOptions, optionName, range, errors, warnings);
  }

  for (const optionName of BOOLEAN_OPTION_NAMES) {
    validateBooleanOption(userOptions, optionName, errors);
  }

  for (const optionName of STRING_OPTION_NAMES) {
    validateStringOption(userOptions, optionName, errors);
  }

  if (hasOwn(userOptions, "onLogEvent") && userOptions.onLogEvent != null && typeof userOptions.onLogEvent !== "function") {
    errors.push(createValidationIssue(
      "INVALID_OPTION_TYPE",
      "onLogEvent",
      "onLogEvent must be a function when provided.",
      userOptions.onLogEvent
    ));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function assertValidAsciiOptions(userOptions = {}) {
  const validation = validateAsciiOptions(userOptions);

  if (!validation.valid) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.VALIDATION_FAILED,
      "ASCII options validation failed.",
      validation
    );
  }

  return validation;
}

export function normalizeAsciiOptions(userOptions = {}) {
  if (isNormalizedAsciiOptions(userOptions)) {
    return userOptions;
  }

  const validation = assertValidAsciiOptions(userOptions);
  const merged = { ...DEFAULT_ASCII_OPTIONS, ...(userOptions || {}) };
  const preset = hasOwn(ASCII_CHARSETS, merged.charsetPreset)
    ? merged.charsetPreset
    : DEFAULT_ASCII_OPTIONS.charsetPreset;

  const normalized = {
    scale: clampInteger(merged.scale, 1, 256),
    spacing: clampNumber(merged.spacing, 0, 64),
    charsetPreset: preset,
    charset: ASCII_CHARSETS[preset],
    outputColumns: clampInteger(merged.outputColumns, 0, 10000),
    colorMode: normalizeColorMode(merged.colorMode),
    backgroundColor: String(merged.backgroundColor),
    foregroundColor: String(merged.foregroundColor),
    intensity: clampNumber(merged.intensity, 0, 8),
    invertColors: Boolean(merged.invertColors),
    brightness: clampNumber(merged.brightness, -100, 100),
    contrast: clampNumber(merged.contrast, -254, 254),
    saturation: clampNumber(merged.saturation, -100, 100),
    hueRotation: normalizeDegrees(merged.hueRotation),
    detail: clampNumber(merged.detail, -100, 100),
    gamma: clampNumber(merged.gamma, 0.05, 10),
    blur: clampNumber(merged.blur, 0, 64),
    edgeEnhance: clampNumber(merged.edgeEnhance, 0, 400),
    brightnessCurve: clampNumber(merged.brightnessCurve, 0.025, 4),
    quantizeColors: clampInteger(merged.quantizeColors, 0, 256),
    charAspectRatio: clampNumber(merged.charAspectRatio, 0.1, 2),
    fontFamily: String(merged.fontFamily),
    fontWeight: String(merged.fontWeight),
    fontSize: clampNumber(merged.fontSize || merged.scale, 1, 512),
    skipSpaceGlyphs: Boolean(merged.skipSpaceGlyphs),
    renderCanvas: Boolean(merged.renderCanvas),
    transparentOriginalColorCanvas: Boolean(merged.transparentOriginalColorCanvas),
    includeImageData: Boolean(merged.includeImageData),
    maxInputPixels: clampInteger(merged.maxInputPixels, 1, Number.MAX_SAFE_INTEGER),
    maxOutputCells: clampInteger(merged.maxOutputCells, 1, Number.MAX_SAFE_INTEGER),
    onLogEvent: typeof merged.onLogEvent === "function" ? merged.onLogEvent : NOOP_LOG_EVENT
  };

  Object.defineProperty(normalized, NORMALIZED_OPTIONS_MARK, { value: true });
  Object.defineProperty(normalized, NORMALIZATION_WARNINGS, { value: validation.warnings });

  return normalized;
}

export async function convertImageToAscii(source, userOptions = {}) {
  const options = normalizeAsciiOptions(userOptions);
  let loaded = null;

  emitLogEvent(options, "conversion:start", "Starting image-to-ASCII conversion.", {
    sourceType: getSourceType(source)
  });
  emitNormalizationWarnings(options);

  try {
    emitLogEvent(options, "load:start", "Loading drawable source.", {
      sourceType: getSourceType(source)
    });

    loaded = await loadDrawable(source);

    emitLogEvent(options, "load:success", "Drawable source loaded.", {
      width: loaded.width,
      height: loaded.height
    });

    assertRenderableSize(loaded.width, loaded.height, options.maxInputPixels);

    const scratchCanvas = createCanvas(loaded.width, loaded.height, { preferOffscreen: true });
    const scratchContext = get2DContext(scratchCanvas, { willReadFrequently: true });

    scratchContext.clearRect(0, 0, loaded.width, loaded.height);
    scratchContext.drawImage(loaded.drawable, 0, 0, loaded.width, loaded.height);

    let imageData;
    try {
      imageData = scratchContext.getImageData(0, 0, loaded.width, loaded.height);
    } catch (error) {
      throw new AsciiArtError(
        ASCII_ERROR_CODES.CROSS_ORIGIN_PIXELS_UNREADABLE,
        "Cannot read pixels from this image. The source may be cross-origin and missing CORS headers.",
        {
          width: loaded.width,
          height: loaded.height
        },
        error
      );
    }

    emitLogEvent(options, "pixels:read", "Source pixels read from canvas.", {
      width: imageData.width,
      height: imageData.height
    });

    const processedImageData = processImageData(imageData, options);
    const grid = imageDataToAsciiGrid(processedImageData, options);

    emitLogEvent(options, "grid:computed", "ASCII grid computed.", {
      columns: grid.columns,
      rows: grid.rowCount,
      cells: grid.columns * grid.rowCount
    });

    let canvas = null;
    if (options.renderCanvas) {
      emitLogEvent(options, "render:start", "Rendering ASCII grid to canvas.", {
        columns: grid.columns,
        rows: grid.rowCount
      });

      canvas = createCanvas(1, 1);
      drawAsciiGridToCanvas(grid, canvas, options);

      emitLogEvent(options, "render:success", "ASCII canvas rendered.", {
        width: canvas.width,
        height: canvas.height
      });
    }

    const result = {
      ...grid,
      canvas,
      imageData: options.includeImageData ? processedImageData : undefined,
      sourceWidth: loaded.width,
      sourceHeight: loaded.height,
      metadata: {
        sourceWidth: loaded.width,
        sourceHeight: loaded.height,
        outputColumns: grid.columns,
        outputRows: grid.rowCount,
        outputCells: grid.columns * grid.rowCount,
        charsetPreset: options.charsetPreset,
        colorMode: options.colorMode
      }
    };

    emitLogEvent(options, "conversion:success", "Image converted to ASCII.", result.metadata);
    return result;
  } catch (error) {
    const asciiError = normalizeAsciiError(error);

    emitLogEvent(options, "conversion:error", asciiError.message, {
      code: asciiError.code,
      details: asciiError.details
    });

    throw asciiError;
  } finally {
    if (loaded) {
      try {
        loaded.cleanup();
        emitLogEvent(options, "cleanup:done", "Drawable source cleanup completed.");
      } catch (error) {
        emitLogEvent(options, "cleanup:error", "Drawable source cleanup failed.", {
          message: getErrorMessage(error)
        });
      }
    }
  }
}

export async function tryConvertImageToAscii(source, userOptions = {}) {
  try {
    return {
      ok: true,
      result: await convertImageToAscii(source, userOptions)
    };
  } catch (error) {
    return {
      ok: false,
      error: normalizeAsciiError(error)
    };
  }
}

export async function convertVideoFrameToAscii(videoElement, userOptions = {}) {
  if (!isVideoElement(videoElement)) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.INVALID_SOURCE,
      "convertVideoFrameToAscii expects an HTMLVideoElement.",
      {
        receivedType: getSourceType(videoElement)
      }
    );
  }

  if (videoElement.readyState < 2) {
    await waitForEvent(videoElement, "loadeddata");
  }

  return convertImageToAscii(videoElement, userOptions);
}

export function processImageData(imageData, userOptions = {}) {
  assertImageDataLike(imageData);
  const options = normalizeAsciiOptions(userOptions);
  let workingImageData = cloneImageData(imageData);

  const blurRadius = Math.round(options.blur / 2);
  if (blurRadius > 0) {
    workingImageData = applySeparableBoxBlur(workingImageData, blurRadius);
    emitLogEvent(options, "filter:applied", "Blur filter applied.", { radius: blurRadius });
  }

  const softnessRadius = options.detail < 0
    ? Math.max(1, Math.round(Math.abs(options.detail) / 20))
    : 0;

  if (softnessRadius > 0) {
    workingImageData = applySeparableBoxBlur(workingImageData, softnessRadius);
    emitLogEvent(options, "filter:applied", "Softness filter applied.", { radius: softnessRadius });
  }

  applyBrightness(workingImageData, options.brightness);
  applyContrast(workingImageData, options.contrast);
  applySaturation(workingImageData, options.saturation);
  applyHueRotation(workingImageData, options.hueRotation);

  if (options.brightness !== 0 || options.contrast !== 0 || options.saturation !== 0 || options.hueRotation !== 0) {
    emitLogEvent(options, "filter:applied", "Color adjustment filters applied.", {
      brightness: options.brightness,
      contrast: options.contrast,
      saturation: options.saturation,
      hueRotation: options.hueRotation
    });
  }

  if (options.detail > 0) {
    workingImageData = applyCrossSharpen(workingImageData, options.detail);
    emitLogEvent(options, "filter:applied", "Detail sharpening filter applied.", {
      detail: options.detail
    });
  }

  applyGamma(workingImageData, options.gamma);
  if (options.gamma !== 1) {
    emitLogEvent(options, "filter:applied", "Gamma filter applied.", { gamma: options.gamma });
  }

  if (options.edgeEnhance > 0) {
    workingImageData = applySobelEdgeEnhance(workingImageData, options.edgeEnhance);
    emitLogEvent(options, "filter:applied", "Edge enhancement filter applied.", {
      edgeEnhance: options.edgeEnhance
    });
  }

  applyColorQuantization(workingImageData, options.quantizeColors);
  if (options.quantizeColors > 0 && options.quantizeColors < 256) {
    emitLogEvent(options, "filter:applied", "Color quantization filter applied.", {
      levels: options.quantizeColors
    });
  }

  return workingImageData;
}

export function imageDataToAsciiGrid(imageData, userOptions = {}) {
  assertImageDataLike(imageData);
  const options = normalizeAsciiOptions(userOptions);
  const { width, height, data } = imageData;
  assertRenderableSize(width, height, options.maxInputPixels);

  const { columns, rows } = computeGridSize(width, height, options);
  const cellCount = columns * rows;

  if (cellCount > options.maxOutputCells) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.OUTPUT_TOO_LARGE,
      `ASCII output is too large. The requested grid has ${cellCount} cells, which exceeds maxOutputCells ${options.maxOutputCells}.`,
      {
        columns,
        rows,
        cellCount,
        maxOutputCells: options.maxOutputCells
      }
    );
  }

  const characters = new Array(cellCount);
  const red = new Uint8ClampedArray(cellCount);
  const green = new Uint8ClampedArray(cellCount);
  const blue = new Uint8ClampedArray(cellCount);
  const luminance = new Float32Array(cellCount);
  const textRows = new Array(rows);

  for (let row = 0; row < rows; row += 1) {
    const rowCharacters = new Array(columns);
    const yStart = Math.floor((row * height) / rows);
    const yEnd = Math.max(yStart + 1, Math.floor(((row + 1) * height) / rows));

    for (let column = 0; column < columns; column += 1) {
      const xStart = Math.floor((column * width) / columns);
      const xEnd = Math.max(xStart + 1, Math.floor(((column + 1) * width) / columns));
      const cellIndex = row * columns + column;

      let redSum = 0;
      let greenSum = 0;
      let blueSum = 0;
      let alphaSum = 0;
      let pixelCount = 0;

      for (let y = yStart; y < yEnd && y < height; y += 1) {
        let offset = (y * width + xStart) * 4;

        for (let x = xStart; x < xEnd && x < width; x += 1) {
          const alpha = data[offset + 3] / 255;
          redSum += data[offset] * alpha;
          greenSum += data[offset + 1] * alpha;
          blueSum += data[offset + 2] * alpha;
          alphaSum += alpha;
          pixelCount += 1;
          offset += 4;
        }
      }

      const safeAlpha = alphaSum > 0 ? alphaSum : pixelCount || 1;
      const averageRed = redSum / safeAlpha;
      const averageGreen = greenSum / safeAlpha;
      const averageBlue = blueSum / safeAlpha;
      const averageLuminance =
        LUMA_RED * averageRed + LUMA_GREEN * averageGreen + LUMA_BLUE * averageBlue;

      const effectiveLuminance = options.invertColors
        ? 255 - averageLuminance
        : averageLuminance;

      const mappedLuminance = mapBrightnessCurve(
        clampNumber(effectiveLuminance, 0, 255),
        options.brightnessCurve
      );

      const characterIndex = Math.min(
        options.charset.length - 1,
        Math.max(0, Math.floor((mappedLuminance / 255) * (options.charset.length - 1)))
      );

      const character = options.charset[characterIndex] || options.charset[0] || " ";

      characters[cellIndex] = character;
      rowCharacters[column] = character;
      red[cellIndex] = averageRed;
      green[cellIndex] = averageGreen;
      blue[cellIndex] = averageBlue;
      luminance[cellIndex] = averageLuminance;
    }

    textRows[row] = rowCharacters.join("");
  }

  return {
    text: textRows.join("\n"),
    rows: textRows,
    columns,
    rowCount: rows,
    characters,
    red,
    green,
    blue,
    luminance
  };
}

export function drawAsciiGridToCanvas(grid, targetCanvas, userOptions = {}) {
  assertAsciiGrid(grid);

  if (!targetCanvas) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.CANVAS_UNAVAILABLE,
      "A target canvas is required to render the ASCII grid."
    );
  }

  const options = normalizeAsciiOptions(userOptions);
  const fontSize = options.fontSize || options.scale;
  const cellWidth = Math.max(1, Math.ceil(fontSize * options.charAspectRatio + options.spacing));
  const cellHeight = Math.max(1, Math.ceil(fontSize + options.spacing));
  const width = grid.columns * cellWidth;
  const height = grid.rowCount * cellHeight;
  const context = get2DContext(targetCanvas);

  targetCanvas.width = width;
  targetCanvas.height = height;

  context.clearRect(0, 0, width, height);

  const useTransparentBackground =
    options.colorMode === ASCII_COLOR_MODES.original && options.transparentOriginalColorCanvas;

  if (!useTransparentBackground) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  context.font = `${options.fontWeight} ${fontSize}px ${options.fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let row = 0; row < grid.rowCount; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const cellIndex = row * grid.columns + column;
      const character = grid.characters[cellIndex] || " ";

      if (options.skipSpaceGlyphs && character === " ") {
        continue;
      }

      if (options.colorMode === ASCII_COLOR_MODES.original) {
        context.fillStyle = rgbString(
          grid.red[cellIndex] * options.intensity,
          grid.green[cellIndex] * options.intensity,
          grid.blue[cellIndex] * options.intensity
        );
      } else {
        context.fillStyle = options.foregroundColor;
      }

      context.fillText(
        character,
        column * cellWidth + cellWidth / 2,
        row * cellHeight + cellHeight / 2
      );
    }
  }

  return targetCanvas;
}

export function createAsciiSvg(grid, userOptions = {}) {
  assertAsciiGrid(grid);
  const options = normalizeAsciiOptions(userOptions);
  const fontSize = options.fontSize || options.scale;
  const cellWidth = Math.max(1, Math.ceil(fontSize * options.charAspectRatio + options.spacing));
  const cellHeight = Math.max(1, Math.ceil(fontSize + options.spacing));
  const width = grid.columns * cellWidth;
  const height = grid.rowCount * cellHeight;

  let svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}">`;

  if (!(options.colorMode === ASCII_COLOR_MODES.original && options.transparentOriginalColorCanvas)) {
    svg += `<rect width="100%" height="100%" fill="${escapeXml(options.backgroundColor)}"/>`;
  }

  svg +=
    `<style>text{font-family:${escapeCssValue(options.fontFamily)};font-size:${fontSize}px;` +
    `font-weight:${escapeCssValue(options.fontWeight)};dominant-baseline:middle;text-anchor:middle;}</style>`;

  if (options.colorMode === ASCII_COLOR_MODES.original) {
    for (let row = 0; row < grid.rowCount; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        const cellIndex = row * grid.columns + column;
        const character = grid.characters[cellIndex] || " ";

        if (options.skipSpaceGlyphs && character === " ") {
          continue;
        }

        svg +=
          `<text x="${column * cellWidth + cellWidth / 2}" ` +
          `y="${row * cellHeight + cellHeight / 2}" ` +
          `fill="${rgbString(grid.red[cellIndex], grid.green[cellIndex], grid.blue[cellIndex])}">` +
          `${escapeXml(character)}</text>`;
      }
    }
  } else {
    svg += `<g fill="${escapeXml(options.foregroundColor)}">`;
    for (let row = 0; row < grid.rowCount; row += 1) {
      svg +=
        `<text x="0" y="${row * cellHeight + cellHeight / 2}" ` +
        `text-anchor="start" xml:space="preserve">${escapeXml(grid.rows[row])}</text>`;
    }
    svg += "</g>";
  }

  svg += "</svg>";
  return svg;
}

export async function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  if (!canvas) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.EXPORT_FAILED,
      "Canvas export failed because no canvas was provided."
    );
  }

  if (typeof canvas.convertToBlob === "function") {
    try {
      return await canvas.convertToBlob({ type, quality });
    } catch (error) {
      throw new AsciiArtError(
        ASCII_ERROR_CODES.EXPORT_FAILED,
        "OffscreenCanvas export failed.",
        { type, quality },
        error
      );
    }
  }

  if (typeof canvas.toBlob !== "function") {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.EXPORT_FAILED,
      "Canvas export requires HTMLCanvasElement.toBlob() or OffscreenCanvas.convertToBlob().",
      {
        receivedType: getSourceType(canvas)
      }
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new AsciiArtError(
          ASCII_ERROR_CODES.EXPORT_FAILED,
          "Canvas export failed. The browser returned an empty Blob."
        ));
      }
    }, type, quality);
  });
}

export function downloadText(filename, text) {
  assertBlobAvailable("downloadText");
  return downloadBlob(filename, new Blob([String(text)], { type: "text/plain;charset=utf-8" }));
}

export function downloadSvg(filename, svgText) {
  assertBlobAvailable("downloadSvg");
  return downloadBlob(filename, new Blob([String(svgText)], { type: "image/svg+xml;charset=utf-8" }));
}

export function downloadBlob(filename, blob) {
  assertDownloadRuntime();
  assertFilename(filename);

  if (!isBlobLike(blob)) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.DOWNLOAD_UNAVAILABLE,
      "downloadBlob expects a Blob instance.",
      {
        receivedType: getSourceType(blob)
      }
    );
  }

  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function copyAsciiText(text) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.CLIPBOARD_UNAVAILABLE,
      "Clipboard API is not available in this browser context. Copy the returned text manually or call copyAsciiText from a secure browser context."
    );
  }

  return navigator.clipboard.writeText(String(text));
}

export function computeGridSize(width, height, userOptions = {}) {
  const options = normalizeAsciiOptions(userOptions);
  assertRenderableSize(width, height, options.maxInputPixels);

  const imageAspectRatio = width / height;

  let columns = options.outputColumns > 0
    ? options.outputColumns
    : Math.max(1, Math.floor(width / options.scale));

  let rows = options.outputColumns > 0
    ? Math.max(1, Math.round((height / width) * columns * options.charAspectRatio))
    : Math.max(1, Math.floor((height / options.scale) * options.charAspectRatio));

  const renderedAspectRatio = (columns / rows) * options.charAspectRatio;
  const targetTextAspectRatio = imageAspectRatio / options.charAspectRatio;

  if (Math.abs(renderedAspectRatio - imageAspectRatio) > 0.1) {
    if (columns / rows > targetTextAspectRatio) {
      columns = Math.max(1, Math.round(rows * targetTextAspectRatio));
    } else {
      rows = Math.max(1, Math.round(columns / targetTextAspectRatio));
    }
  }

  const cellCount = columns * rows;
  if (cellCount > options.maxOutputCells) {
    const shrinkRatio = Math.sqrt(options.maxOutputCells / cellCount);
    columns = Math.max(1, Math.floor(columns * shrinkRatio));
    rows = Math.max(1, Math.floor(rows * shrinkRatio));
  }

  return { columns, rows };
}

export async function loadDrawable(source) {
  if (!source) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.INVALID_SOURCE,
      "A source image, canvas, video, Blob, File, ImageBitmap, URL, or URL string is required."
    );
  }

  if (isCanvasLike(source)) {
    return {
      drawable: source,
      width: source.width,
      height: source.height,
      cleanup() {}
    };
  }

  if (isImageBitmap(source)) {
    return {
      drawable: source,
      width: source.width,
      height: source.height,
      cleanup() {
        if (typeof source.close === "function") {
          source.close();
        }
      }
    };
  }

  if (isImageElement(source)) {
    await ensureImageReady(source);
    return {
      drawable: source,
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
      cleanup() {}
    };
  }

  if (isVideoElement(source)) {
    if (source.readyState < 2) {
      await waitForEvent(source, "loadeddata");
    }

    return {
      drawable: source,
      width: source.videoWidth,
      height: source.videoHeight,
      cleanup() {}
    };
  }

  if (isBlobLike(source)) {
    if (source.size === 0) {
      throw new AsciiArtError(
        ASCII_ERROR_CODES.IMAGE_DECODE_FAILED,
        "Image decode failed. The file is empty."
      );
    }

    if (typeof createImageBitmap === "function" && source.type?.startsWith("image/")) {
      try {
        const bitmap = await createImageBitmap(source);
        return {
          drawable: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          cleanup() {
            if (typeof bitmap.close === "function") {
              bitmap.close();
            }
          }
        };
      } catch (error) {
        throw new AsciiArtError(
          ASCII_ERROR_CODES.IMAGE_DECODE_FAILED,
          "Image decode failed. The file may be corrupt or not supported by this browser.",
          {
            mimeType: source.type || "",
            size: source.size
          },
          error
        );
      }
    }

    assertObjectUrlRuntime("Blob image loading", ASCII_ERROR_CODES.IMAGE_LOAD_FAILED);
    const objectUrl = URL.createObjectURL(source);

    try {
      const image = await loadImageElement(objectUrl);
      return {
        drawable: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        cleanup() {
          URL.revokeObjectURL(objectUrl);
        }
      };
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      throw new AsciiArtError(
        ASCII_ERROR_CODES.IMAGE_DECODE_FAILED,
        "Image decode failed. The file may be corrupt, empty, or not a supported browser image format.",
        {
          mimeType: source.type || "",
          size: source.size
        },
        error
      );
    }
  }

  if (typeof source === "string" || (typeof URL !== "undefined" && source instanceof URL)) {
    const url = String(source);

    try {
      const image = await loadImageElement(url);
      return {
        drawable: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        cleanup() {}
      };
    } catch (error) {
      throw new AsciiArtError(
        ASCII_ERROR_CODES.IMAGE_LOAD_FAILED,
        "Image failed to load from the provided URL. Check that the URL is reachable and points to a browser-supported image.",
        { url },
        error
      );
    }
  }

  throw new AsciiArtError(
    ASCII_ERROR_CODES.UNSUPPORTED_SOURCE,
    "Unsupported source type. Expected an image element, canvas, video element, Blob/File, ImageBitmap, URL, or URL string.",
    {
      receivedType: getSourceType(source)
    }
  );
}

export function normalizeAsciiError(error) {
  if (error instanceof AsciiArtError) {
    return error;
  }

  return new AsciiArtError(
    ASCII_ERROR_CODES.CONVERSION_FAILED,
    "Image conversion failed unexpectedly.",
    {
      originalName: error?.name || "Error",
      originalMessage: getErrorMessage(error)
    },
    error
  );
}

function applyBrightness(imageData, amount) {
  if (amount === 0) {
    return imageData;
  }

  const data = imageData.data;
  const offset = (amount / 100) * 255;

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clampByte(data[index] + offset);
    data[index + 1] = clampByte(data[index + 1] + offset);
    data[index + 2] = clampByte(data[index + 2] + offset);
  }

  return imageData;
}

function applyContrast(imageData, amount) {
  if (amount === 0) {
    return imageData;
  }

  const data = imageData.data;
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clampByte(factor * (data[index] - 128) + 128);
    data[index + 1] = clampByte(factor * (data[index + 1] - 128) + 128);
    data[index + 2] = clampByte(factor * (data[index + 2] - 128) + 128);
  }

  return imageData;
}

function applySaturation(imageData, amount) {
  if (amount === 0) {
    return imageData;
  }

  const data = imageData.data;
  const factor = 1 + amount / 100;

  for (let index = 0; index < data.length; index += 4) {
    const luma = LUMA_RED * data[index] + LUMA_GREEN * data[index + 1] + LUMA_BLUE * data[index + 2];

    data[index] = clampByte(luma + factor * (data[index] - luma));
    data[index + 1] = clampByte(luma + factor * (data[index + 1] - luma));
    data[index + 2] = clampByte(luma + factor * (data[index + 2] - luma));
  }

  return imageData;
}

function applyHueRotation(imageData, degrees) {
  if (degrees === 0) {
    return imageData;
  }

  const data = imageData.data;
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);

  const matrix = [
    0.213 + 0.787 * cosine - 0.213 * sine,
    0.715 - 0.715 * cosine - 0.715 * sine,
    0.072 - 0.072 * cosine + 0.928 * sine,
    0.213 - 0.213 * cosine + 0.143 * sine,
    0.715 + 0.285 * cosine + 0.140 * sine,
    0.072 - 0.072 * cosine - 0.283 * sine,
    0.213 - 0.213 * cosine - 0.787 * sine,
    0.715 - 0.715 * cosine + 0.715 * sine,
    0.072 + 0.928 * cosine + 0.072 * sine
  ];

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    data[index] = clampByte(red * matrix[0] + green * matrix[1] + blue * matrix[2]);
    data[index + 1] = clampByte(red * matrix[3] + green * matrix[4] + blue * matrix[5]);
    data[index + 2] = clampByte(red * matrix[6] + green * matrix[7] + blue * matrix[8]);
  }

  return imageData;
}

function applyGamma(imageData, gamma) {
  if (gamma === 1) {
    return imageData;
  }

  const data = imageData.data;
  const exponent = 1 / gamma;

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clampByte(255 * Math.pow(data[index] / 255, exponent));
    data[index + 1] = clampByte(255 * Math.pow(data[index + 1] / 255, exponent));
    data[index + 2] = clampByte(255 * Math.pow(data[index + 2] / 255, exponent));
  }

  return imageData;
}

function applyColorQuantization(imageData, levels) {
  if (levels <= 0 || levels >= 256) {
    return imageData;
  }

  const data = imageData.data;
  const step = 256 / Math.max(2, levels);

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clampByte(Math.round(data[index] / step) * step);
    data[index + 1] = clampByte(Math.round(data[index + 1] / step) * step);
    data[index + 2] = clampByte(Math.round(data[index + 2] / step) * step);
  }

  return imageData;
}

function applyCrossSharpen(imageData, amount) {
  const { width, height, data } = imageData;
  if (width < 3 || height < 3) {
    return imageData;
  }

  const output = new Uint8ClampedArray(data);
  const normalized = amount / 100;
  const centerWeight = 1 + 4 * normalized;
  const neighborWeight = -normalized;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = (y * width + x) * 4;
      const top = ((y - 1) * width + x) * 4;
      const left = (y * width + x - 1) * 4;
      const right = (y * width + x + 1) * 4;
      const bottom = ((y + 1) * width + x) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        output[center + channel] = clampByte(
          data[top + channel] * neighborWeight +
            data[left + channel] * neighborWeight +
            data[center + channel] * centerWeight +
            data[right + channel] * neighborWeight +
            data[bottom + channel] * neighborWeight
        );
      }

      output[center + 3] = data[center + 3];
    }
  }

  return createImageData(output, width, height);
}

function applySobelEdgeEnhance(imageData, amount) {
  const { width, height, data } = imageData;
  if (width < 3 || height < 3) {
    return imageData;
  }

  const output = new Uint8ClampedArray(data);
  const strength = amount / 100;
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = (y * width + x) * 4;
      let gradientX = 0;
      let gradientY = 0;

      for (let kernelY = -1; kernelY <= 1; kernelY += 1) {
        for (let kernelX = -1; kernelX <= 1; kernelX += 1) {
          const source = ((y + kernelY) * width + x + kernelX) * 4;
          const luma =
            LUMA_RED * data[source] +
            LUMA_GREEN * data[source + 1] +
            LUMA_BLUE * data[source + 2];
          const kernelIndex = (kernelY + 1) * 3 + (kernelX + 1);

          gradientX += sobelX[kernelIndex] * luma;
          gradientY += sobelY[kernelIndex] * luma;
        }
      }

      const edge = Math.min(255, Math.hypot(gradientX, gradientY));

      output[center] = clampByte(data[center] + edge * strength);
      output[center + 1] = clampByte(data[center + 1] + edge * strength);
      output[center + 2] = clampByte(data[center + 2] + edge * strength);
      output[center + 3] = data[center + 3];
    }
  }

  return createImageData(output, width, height);
}

function applySeparableBoxBlur(imageData, radius) {
  if (radius <= 0) {
    return imageData;
  }

  const { width, height, data } = imageData;
  const horizontal = new Uint8ClampedArray(data.length);
  const output = new Uint8ClampedArray(data.length);
  const windowSize = radius * 2 + 1;

  for (let y = 0; y < height; y += 1) {
    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;

    for (let delta = -radius; delta <= radius; delta += 1) {
      const x = clampInteger(delta, 0, width - 1);
      const offset = (y * width + x) * 4;
      redSum += data[offset];
      greenSum += data[offset + 1];
      blueSum += data[offset + 2];
    }

    for (let x = 0; x < width; x += 1) {
      const outputOffset = (y * width + x) * 4;

      horizontal[outputOffset] = redSum / windowSize;
      horizontal[outputOffset + 1] = greenSum / windowSize;
      horizontal[outputOffset + 2] = blueSum / windowSize;
      horizontal[outputOffset + 3] = data[outputOffset + 3];

      const removeX = clampInteger(x - radius, 0, width - 1);
      const addX = clampInteger(x + radius + 1, 0, width - 1);
      const removeOffset = (y * width + removeX) * 4;
      const addOffset = (y * width + addX) * 4;

      redSum += data[addOffset] - data[removeOffset];
      greenSum += data[addOffset + 1] - data[removeOffset + 1];
      blueSum += data[addOffset + 2] - data[removeOffset + 2];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;

    for (let delta = -radius; delta <= radius; delta += 1) {
      const y = clampInteger(delta, 0, height - 1);
      const offset = (y * width + x) * 4;
      redSum += horizontal[offset];
      greenSum += horizontal[offset + 1];
      blueSum += horizontal[offset + 2];
    }

    for (let y = 0; y < height; y += 1) {
      const outputOffset = (y * width + x) * 4;

      output[outputOffset] = redSum / windowSize;
      output[outputOffset + 1] = greenSum / windowSize;
      output[outputOffset + 2] = blueSum / windowSize;
      output[outputOffset + 3] = horizontal[outputOffset + 3];

      const removeY = clampInteger(y - radius, 0, height - 1);
      const addY = clampInteger(y + radius + 1, 0, height - 1);
      const removeOffset = (removeY * width + x) * 4;
      const addOffset = (addY * width + x) * 4;

      redSum += horizontal[addOffset] - horizontal[removeOffset];
      greenSum += horizontal[addOffset + 1] - horizontal[removeOffset + 1];
      blueSum += horizontal[addOffset + 2] - horizontal[removeOffset + 2];
    }
  }

  return createImageData(output, width, height);
}

function mapBrightnessCurve(luminance, brightnessCurve) {
  const exponent = 1 + (brightnessCurve - 0.5) * 2;
  return clampNumber(255 * Math.pow(luminance / 255, exponent), 0, 255);
}

function cloneImageData(imageData) {
  return createImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}

function createImageData(data, width, height) {
  if (typeof ImageData === "undefined") {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.CANVAS_UNAVAILABLE,
      "ImageData is not available in this runtime. Use a browser, worker with canvas support, or provide a compatible ImageData implementation."
    );
  }

  return new ImageData(data, width, height);
}

function createCanvas(width, height, options = {}) {
  if (options.preferOffscreen && typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  throw new AsciiArtError(
    ASCII_ERROR_CODES.CANVAS_UNAVAILABLE,
    "Canvas conversion requires a browser canvas or OffscreenCanvas runtime."
  );
}

function get2DContext(canvas, options = {}) {
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.CANVAS_CONTEXT_UNAVAILABLE,
      "2D canvas context is unavailable because the provided canvas does not support getContext().",
      {
        receivedType: getSourceType(canvas)
      }
    );
  }

  const context = canvas.getContext("2d", options);

  if (!context) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.CANVAS_CONTEXT_UNAVAILABLE,
      "2D canvas context is not available in this runtime."
    );
  }

  return context;
}

function assertRenderableSize(width, height, maxInputPixels) {
  if (!Number.isFinite(Number(width)) || !Number.isFinite(Number(height)) || width <= 0 || height <= 0) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.INVALID_MEDIA_DIMENSIONS,
      `Invalid media dimensions: ${width}x${height}.`,
      {
        width,
        height
      }
    );
  }

  const pixelCount = width * height;
  if (pixelCount > maxInputPixels) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.INPUT_TOO_LARGE,
      `Input image is too large. The image has ${pixelCount} pixels, which exceeds maxInputPixels ${maxInputPixels}.`,
      {
        width,
        height,
        pixelCount,
        maxInputPixels
      }
    );
  }
}

function assertImageDataLike(imageData) {
  const width = imageData?.width;
  const height = imageData?.height;
  const dataLength = imageData?.data?.length;

  if (
    !imageData ||
    !Number.isFinite(Number(width)) ||
    !Number.isFinite(Number(height)) ||
    width <= 0 ||
    height <= 0 ||
    !imageData.data ||
    dataLength !== width * height * 4
  ) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.INVALID_IMAGE_DATA,
      "Expected ImageData with positive width, positive height, and RGBA data length equal to width * height * 4.",
      {
        width,
        height,
        dataLength
      }
    );
  }
}

function assertAsciiGrid(grid) {
  const columns = grid?.columns;
  const rowCount = grid?.rowCount;
  const cellCount = columns * rowCount;

  if (
    !grid ||
    !Number.isInteger(columns) ||
    !Number.isInteger(rowCount) ||
    columns <= 0 ||
    rowCount <= 0 ||
    !Array.isArray(grid.rows) ||
    grid.rows.length !== rowCount ||
    !Array.isArray(grid.characters) ||
    grid.characters.length !== cellCount ||
    !grid.red ||
    !grid.green ||
    !grid.blue ||
    grid.red.length !== cellCount ||
    grid.green.length !== cellCount ||
    grid.blue.length !== cellCount
  ) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.INVALID_GRID,
      "Expected an ASCII grid returned by imageDataToAsciiGrid().",
      {
        columns,
        rowCount,
        rowsLength: grid?.rows?.length,
        charactersLength: grid?.characters?.length,
        redLength: grid?.red?.length,
        greenLength: grid?.green?.length,
        blueLength: grid?.blue?.length
      }
    );
  }
}

function normalizeColorMode(value) {
  return value === ASCII_COLOR_MODES.original || value === ASCII_COLOR_MODES.monochrome
    ? value
    : DEFAULT_ASCII_OPTIONS.colorMode;
}

function normalizeDegrees(value) {
  const degrees = Number.isFinite(Number(value)) ? Number(value) : 0;
  return ((degrees % 360) + 360) % 360;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
}

function clampInteger(value, min, max) {
  return Math.trunc(clampNumber(value, min, max));
}

function clampByte(value) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function rgbString(red, green, blue) {
  return `rgb(${clampByte(red)},${clampByte(green)},${clampByte(blue)})`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeCssValue(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("<", "")
    .replaceAll(">", "")
    .replaceAll("{", "")
    .replaceAll("}", "")
    .replaceAll(";", "")
    .replaceAll('"', "\\\"");
}

function emitLogEvent(options, type, message, details = {}) {
  try {
    options.onLogEvent({
      type,
      message,
      details,
      timestamp: Date.now()
    });
  } catch {
    // Logging is observational only and must not change conversion behavior.
  }
}

function emitNormalizationWarnings(options) {
  const warnings = options[NORMALIZATION_WARNINGS] || [];

  if (warnings.length > 0) {
    emitLogEvent(options, "options:normalized", "Some ASCII options were normalized before conversion.", {
      warnings
    });
  }
}

function isNormalizedAsciiOptions(value) {
  return Boolean(value?.[NORMALIZED_OPTIONS_MARK]);
}

function isPlainOptionsObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateEnumOption(userOptions, optionName, allowedValues, errors) {
  if (!hasOwn(userOptions, optionName)) {
    return;
  }

  const value = userOptions[optionName];
  if (!allowedValues.includes(value)) {
    errors.push(createValidationIssue(
      "INVALID_OPTION_VALUE",
      optionName,
      `${optionName} must be one of: ${allowedValues.join(", ")}.`,
      value
    ));
  }
}

function validateNumericOption(userOptions, optionName, range, errors, warnings) {
  if (!hasOwn(userOptions, optionName)) {
    return;
  }

  const value = userOptions[optionName];
  const number = Number(value);

  if (!Number.isFinite(number)) {
    errors.push(createValidationIssue(
      "INVALID_OPTION_TYPE",
      optionName,
      `${optionName} must be a finite number.`,
      value
    ));
    return;
  }

  if (range.integer && !Number.isInteger(number)) {
    warnings.push(createValidationIssue(
      "OPTION_NORMALIZED",
      optionName,
      `${optionName} will be truncated to an integer value.`,
      value
    ));
  }

  if (number < range.min || number > range.max) {
    warnings.push(createValidationIssue(
      "OPTION_CLAMPED",
      optionName,
      `${optionName} will be clamped to the supported range ${range.min}..${range.max}.`,
      value
    ));
  }
}

function validateBooleanOption(userOptions, optionName, errors) {
  if (!hasOwn(userOptions, optionName)) {
    return;
  }

  if (typeof userOptions[optionName] !== "boolean") {
    errors.push(createValidationIssue(
      "INVALID_OPTION_TYPE",
      optionName,
      `${optionName} must be a boolean.`,
      userOptions[optionName]
    ));
  }
}

function validateStringOption(userOptions, optionName, errors) {
  if (!hasOwn(userOptions, optionName)) {
    return;
  }

  if (typeof userOptions[optionName] !== "string" || userOptions[optionName].trim().length === 0) {
    errors.push(createValidationIssue(
      "INVALID_OPTION_TYPE",
      optionName,
      `${optionName} must be a non-empty string.`,
      userOptions[optionName]
    ));
  }
}

function createValidationIssue(code, path, message, received) {
  return {
    code,
    path,
    message,
    received: formatReceivedValue(received)
  };
}

function formatReceivedValue(value) {
  if (typeof value === "function") {
    return "[Function]";
  }

  if (typeof value === "symbol") {
    return String(value);
  }

  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return String(value);
  }
}

function assertDownloadRuntime() {
  assertBlobAvailable("downloadBlob");
  assertObjectUrlRuntime("downloadBlob");

  if (typeof document === "undefined" || !document.body || typeof document.createElement !== "function") {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.DOWNLOAD_UNAVAILABLE,
      "downloadBlob requires a browser document with document.body and document.createElement()."
    );
  }
}

function assertBlobAvailable(operationName) {
  if (typeof Blob === "undefined") {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.DOWNLOAD_UNAVAILABLE,
      `${operationName} requires Blob support in this runtime.`
    );
  }
}

function assertObjectUrlRuntime(operationName, errorCode = ASCII_ERROR_CODES.DOWNLOAD_UNAVAILABLE) {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function" || typeof URL.revokeObjectURL !== "function") {
    throw new AsciiArtError(
      errorCode,
      `${operationName} requires URL.createObjectURL() and URL.revokeObjectURL() support.`
    );
  }
}

function assertFilename(filename) {
  if (typeof filename !== "string" || filename.trim().length === 0) {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.DOWNLOAD_UNAVAILABLE,
      "A non-empty filename string is required for downloads.",
      {
        filename: formatReceivedValue(filename)
      }
    );
  }
}

function isBlobLike(value) {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function isImageElement(value) {
  return typeof HTMLImageElement !== "undefined" && value instanceof HTMLImageElement;
}

function isVideoElement(value) {
  return typeof HTMLVideoElement !== "undefined" && value instanceof HTMLVideoElement;
}

function isCanvasLike(value) {
  return (
    (typeof HTMLCanvasElement !== "undefined" && value instanceof HTMLCanvasElement) ||
    (typeof OffscreenCanvas !== "undefined" && value instanceof OffscreenCanvas)
  );
}

function isImageBitmap(value) {
  return typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap;
}

async function ensureImageReady(image) {
  if (image.complete && image.naturalWidth > 0) {
    return;
  }

  await Promise.race([
    waitForEvent(image, "load"),
    waitForEvent(image, "error").then(() => {
      throw new AsciiArtError(
        ASCII_ERROR_CODES.IMAGE_LOAD_FAILED,
        "Image failed to load. The source may be unavailable or not a supported browser image format."
      );
    })
  ]);
}

async function loadImageElement(url) {
  if (typeof Image === "undefined") {
    throw new AsciiArtError(
      ASCII_ERROR_CODES.IMAGE_LOAD_FAILED,
      "Image element loading is not available in this runtime. Use Blob/ImageBitmap input or a browser document runtime."
    );
  }

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  image.src = url;
  await ensureImageReady(image);
  return image;
}

function waitForEvent(target, eventName) {
  if (!target || typeof target.addEventListener !== "function" || typeof target.removeEventListener !== "function") {
    return Promise.reject(new AsciiArtError(
      ASCII_ERROR_CODES.INVALID_SOURCE,
      `Cannot wait for ${eventName}. The target does not support DOM events.`,
      {
        receivedType: getSourceType(target)
      }
    ));
  }

  return new Promise((resolve, reject) => {
    const onSuccess = () => {
      cleanup();
      resolve();
    };

    const onError = (event) => {
      cleanup();
      reject(new AsciiArtError(
        ASCII_ERROR_CODES.IMAGE_LOAD_FAILED,
        `Media event failed: ${event?.type || eventName}.`
      ));
    };

    const cleanup = () => {
      target.removeEventListener(eventName, onSuccess);
      target.removeEventListener("error", onError);
    };

    target.addEventListener(eventName, onSuccess, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function getSourceType(value) {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    return "string";
  }

  if (typeof URL !== "undefined" && value instanceof URL) {
    return "URL";
  }

  if (isBlobLike(value)) {
    return value.constructor?.name || "Blob";
  }

  if (isCanvasLike(value)) {
    return value.constructor?.name || "Canvas";
  }

  if (isImageBitmap(value)) {
    return "ImageBitmap";
  }

  if (isImageElement(value)) {
    return "HTMLImageElement";
  }

  if (isVideoElement(value)) {
    return "HTMLVideoElement";
  }

  return value?.constructor?.name || typeof value;
}

function getErrorMessage(error) {
  return typeof error?.message === "string" && error.message.length > 0
    ? error.message
    : String(error);
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
