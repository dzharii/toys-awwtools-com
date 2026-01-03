import {
  ImageMagick,
  MagickImage,
  initializeImageMagick,
  MagickFormat,
  MagickReadSettings,
  MagickColor,
  MagickColors,
  Percentage,
  Channels,
  EvaluateOperator,
  QuantizeSettings,
  DitherMethod,
  ColorSpace,
  FilterType,
  DistortMethod,
  PixelInterpolateMethod,
  Gravity,
  CompositeOperator,
  NoiseType,
  MagickGeometry,
  DrawableFillColor,
  DrawableRectangle,
  DrawableText,
  DrawableFontPointSize,
  AlphaAction,
  Quantum,
  Interlace,
} from "./lib/magick-wasm-0.0.37/dist/index.js";

const wasmUrl = new URL("./lib/magick-wasm-0.0.37/dist/magick.wasm", import.meta.url);

const formatMap = {
  png: { format: MagickFormat.Png, mime: "image/png", label: "PNG" },
  jpeg: { format: MagickFormat.Jpeg, mime: "image/jpeg", label: "JPEG" },
  webp: { format: MagickFormat.WebP, mime: "image/webp", label: "WebP" },
};

const state = {
  source: null,
  queue: [],
  processing: false,
  ready: false,
};

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};
const DEFAULT_LOG_LEVEL = "info";

function normalizeLogLevel(level) {
  if (!level) return DEFAULT_LOG_LEVEL;
  const key = String(level).toLowerCase();
  return LOG_LEVELS[key] === undefined ? DEFAULT_LOG_LEVEL : key;
}

let workerLogLevel = normalizeLogLevel(self.WORKER_LOG_LEVEL || DEFAULT_LOG_LEVEL);
self.WORKER_LOG_LEVEL = workerLogLevel;

function shouldLog(level) {
  const normalized = normalizeLogLevel(level);
  return LOG_LEVELS[normalized] <= LOG_LEVELS[workerLogLevel];
}

function formatLogValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    return value.replace(/'/g, "\\'").replace(/\n/g, "\\n");
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function formatLog(moduleName, level, message, fields) {
  const levelName = normalizeLogLevel(level).toUpperCase();
  const prefix = `[${moduleName}][${levelName}]`;
  const parts = fields
    ? Object.entries(fields)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}='${formatLogValue(value)}'`)
    : [];
  return parts.length ? `${prefix} ${message} ${parts.join(" ")}` : `${prefix} ${message}`;
}

function logEvent(moduleName, level, message, fields) {
  if (!shouldLog(level)) return;
  const line = formatLog(moduleName, level, message, fields);
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  console[method](line);
  try {
    self.postMessage({
      type: "worker-log",
      level: normalizeLogLevel(level),
      module: moduleName,
      message,
      fields,
    });
  } catch (error) {
    // Ignore log forwarding failures.
  }
}

function setWorkerLogLevel(level) {
  workerLogLevel = normalizeLogLevel(level);
  self.WORKER_LOG_LEVEL = workerLogLevel;
  logEvent("WORKER", "info", "Worker log level updated", { level: workerLogLevel });
}

function percent(value) {
  return new Percentage(value);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function colorFromHex(hex, opacity = 100) {
  const color = new MagickColor(hex);
  color.a = Math.round(Quantum.max * (opacity / 100));
  return color;
}

function send(message, transfer) {
  if (transfer && transfer.length) {
    try {
      self.postMessage(message, transfer);
      return;
    } catch (error) {
      logEvent("WORKER", "warn", "Transfer failed, retrying without transfer", { error: error.message });
    }
  }
  self.postMessage(message);
}

function hasMethod(target, method) {
  return typeof target?.[method] === "function";
}

function warnMissingMethod(widgetId, method) {
  logEvent("WORKER", "warn", "Method unavailable", { widgetId, method });
}

function detectCapabilities() {
  const proto = MagickImage.prototype;
  return {
    unsharpMask: typeof proto.unsharpMask === "function",
    waveletDenoise: typeof proto.waveletDenoise === "function",
    localContrast: typeof proto.localContrast === "function",
    shadow: typeof proto.shadow === "function",
    sketch: typeof proto.sketch === "function",
    rotationalBlur: typeof proto.rotationalBlur === "function",
    emboss: typeof proto.emboss === "function",
    edge: typeof proto.edge === "function",
    posterize: typeof proto.posterize === "function",
    orderedDither: typeof proto.orderedDither === "function",
    tint: typeof proto.tint === "function",
    clut: typeof proto.clut === "function",
    haldClut: typeof proto.haldClut === "function",
    liquidRescale: typeof proto.liquidRescale === "function",
    transparentChroma: typeof proto.transparentChroma === "function",
    fontTypeMetrics: typeof proto.fontTypeMetrics === "function",
  };
}

async function initialize() {
  logEvent("WORKER", "info", "Initializing ImageMagick");
  try {
    await initializeImageMagick(wasmUrl);
    state.ready = true;
    const capabilities = detectCapabilities();
    send({ type: "ready", capabilities });
    logEvent("WORKER", "info", "ImageMagick ready", { capabilities });
  } catch (error) {
    send({ type: "init-error", error: error.message || "Failed to initialize" });
    logEvent("WORKER", "error", "ImageMagick init failed", { error: error.message });
  }
}

initialize();

self.addEventListener("message", (event) => {
  const { type } = event.data;
  if (type === "set-log-level") {
    setWorkerLogLevel(event.data.level);
    return;
  }
  if (type === "set-source") {
    state.source = event.data.source;
    state.queue = [];
    logEvent("WORKER", "info", "Source set", {
      sourceId: state.source?.id,
      name: state.source?.name,
      sizeBytes: state.source?.bytes?.byteLength,
      mime: state.source?.mime,
    });
    return;
  }
  if (type === "process") {
    state.queue.push(event.data.job);
    logEvent("WORKER", "verbose", "Job queued", {
      token: event.data.job?.token,
      widgetId: event.data.job?.widgetId,
      queueLength: state.queue.length,
    });
    processQueue();
  }
});

function processQueue() {
  if (!state.ready || state.processing || state.queue.length === 0) return;
  const job = state.queue.shift();
  state.processing = true;
  logEvent("WORKER", "verbose", "Processing job", {
    token: job.token,
    widgetId: job.widgetId,
    queueLength: state.queue.length,
  });
  Promise.resolve()
    .then(() => processJob(job))
    .catch((error) => {
      send({
        type: "job-error",
        token: job.token,
        widgetId: job.widgetId,
        error: error.message || "Processing failed",
      });
      logEvent("WORKER", "error", "Job failed", {
        token: job.token,
        widgetId: job.widgetId,
        error: error.message,
      });
    })
    .finally(() => {
      state.processing = false;
      processQueue();
    });
}

function processJob(job) {
  if (!state.source) {
    send({ type: "job-error", token: job.token, widgetId: job.widgetId, error: "No source loaded" });
    logEvent("WORKER", "warn", "Job rejected, no source", { token: job.token, widgetId: job.widgetId });
    return Promise.resolve();
  }

  send({ type: "job-started", token: job.token, widgetId: job.widgetId });
  const sourceBytes = state.source.bytes;
  logEvent("WORKER", "info", "Job started", {
    token: job.token,
    widgetId: job.widgetId,
    sourceId: state.source.id,
    sourceBytes: sourceBytes?.byteLength,
    outputFormat: job.outputFormat,
  });

  return ImageMagick.read(sourceBytes, (image) => {
    send({ type: "job-progress", token: job.token, widgetId: job.widgetId, stage: "Processing" });
    logEvent("WORKER", "verbose", "Applying effect", { widgetId: job.widgetId, token: job.token });
    logEvent("WORKER", "debug", "Job params", { widgetId: job.widgetId, params: job.params });
    applyEffect(image, job);
    const outputFormat = formatMap[job.outputFormat] || formatMap.png;

    if (job.outputSettings) {
      applyOutputSettings(image, outputFormat, job.outputSettings);
    }

    const width = image.width;
    const height = image.height;

    send({ type: "job-progress", token: job.token, widgetId: job.widgetId, stage: "Encoding" });
    const bytes = image.write(outputFormat.format, (data) => data);
    const outputBytes = bytes instanceof Uint8Array ? bytes.slice() : bytes;
    const outputSize =
      outputBytes && typeof outputBytes.byteLength === "number"
        ? outputBytes.byteLength
        : typeof outputBytes.length === "number"
        ? outputBytes.length
        : 0;
    send(
      {
        type: "job-complete",
        token: job.token,
        widgetId: job.widgetId,
        width,
        height,
        bytes: outputBytes,
        mime: outputFormat.mime,
        formatLabel: outputFormat.label,
      },
      outputBytes?.buffer ? [outputBytes.buffer] : undefined
    );
    logEvent("WORKER", "info", "Job complete", {
      token: job.token,
      widgetId: job.widgetId,
      width,
      height,
      outputBytes: outputSize,
      format: outputFormat.label,
    });
  });
}

function applyOutputSettings(image, outputFormat, settings) {
  if (!settings) return;
  logEvent("WORKER", "verbose", "Applying output settings", {
    format: outputFormat.label,
    quality: settings.quality,
    strip: settings.strip,
    progressive: settings.progressive,
  });
  if (settings.strip) {
    image.strip();
  }
  if (settings.quality && (outputFormat.format === MagickFormat.Jpeg || outputFormat.format === MagickFormat.WebP)) {
    image.quality = settings.quality;
  }
  if (settings.progressive && outputFormat.format === MagickFormat.Jpeg) {
    image.settings.interlace = Interlace.Jpeg;
  }
}

function applyEffect(image, job) {
  const params = job.params;
  switch (job.widgetId) {
    case "auto-fix":
      if (params.autoOrient) image.autoOrient();
      if (params.toSRGB) image.colorSpace = ColorSpace.SRGB;
      if (params.strip) image.strip();
      if (params.normalize === "mild") {
        image.normalize();
      } else if (params.normalize === "strong") {
        image.normalize();
        image.normalize();
      }
      break;
    case "levels":
      applyLevels(image, params);
      break;
    case "brightness-contrast":
      image.brightnessContrast(percent(params.brightness), percent(params.contrast));
      break;
    case "white-balance":
      applyWhiteBalance(image, params);
      break;
    case "color-tuning":
      applyModulate(image, params);
      break;
    case "smart-contrast":
      applySmartContrast(image, params);
      break;
    case "unsharp":
      applyUnsharp(image, params);
      break;
    case "denoise":
      applyDenoise(image, params);
      break;
    case "gaussian-blur":
      image.gaussianBlur(params.radius, params.sigma);
      break;
    case "vignette-tilt":
      applyVignetteTilt(image, params);
      break;
    case "edge-emboss":
      applyEdgeEmboss(image, params);
      break;
    case "posterize":
      applyPosterize(image, params);
      break;
    case "threshold":
      applyThresholdDuotone(image, params);
      break;
    case "pixelate":
      applyPixelate(image, params);
      break;
    case "crop-straighten":
      applyCrop(image, params);
      break;
    case "resize":
      applyResize(image, params);
      break;
    case "perspective":
      applyPerspective(image, params);
      break;
    case "border-shadow":
      applyBorderShadow(image, params);
      break;
    case "chroma-key":
      applyChromaKey(image, params);
      break;
    case "clarity":
      applyClarity(image, params);
      break;
    case "clut":
      applyClut(image, params);
      break;
    case "stylize":
      applyStylize(image, params);
      break;
    case "motion":
      applyMotion(image, params);
      break;
    case "watermark":
      applyWatermark(image, params);
      break;
    case "liquid-rescale":
      image.liquidRescale(params.width, params.height);
      break;
    case "clean-photo":
      applyCleanPhoto(image, params);
      break;
    case "portrait-pop":
      applyPortraitPop(image, params);
      break;
    case "vintage-film":
      applyVintageFilm(image, params);
      break;
    case "comic-poster":
      applyComicPoster(image, params);
      break;
    case "teal-orange":
      applyTealOrange(image, params);
      break;
    case "format":
      // No extra effect, just output settings.
      break;
    default:
      logEvent("WORKER", "warn", "Unknown widget id", { widgetId: job.widgetId });
      break;
  }
}

function applyLevels(image, params) {
  if (params.channel === "rgb") {
    image.level(percent(params.blackPoint), percent(params.whitePoint), params.gamma);
    return;
  }
  const channel =
    params.channel === "red" ? Channels.Red : params.channel === "green" ? Channels.Green : Channels.Blue;
  image.level(percent(params.blackPoint), percent(params.whitePoint), params.gamma, channel);
}

function applyWhiteBalance(image, params) {
  // Mapping note: temperature shifts red/blue balance, tint shifts green/magenta. Strength scales both.
  const strength = params.strength / 100;
  const temp = params.temperature / 100;
  const tint = params.tint / 100;
  const red = clamp(1 + temp * 0.18 * strength + tint * 0.06 * strength, 0.6, 1.4);
  const green = clamp(1 + tint * 0.12 * strength, 0.6, 1.4);
  const blue = clamp(1 - temp * 0.18 * strength - tint * 0.06 * strength, 0.6, 1.4);
  image.evaluate(Channels.Red, EvaluateOperator.Multiply, red);
  image.evaluate(Channels.Green, EvaluateOperator.Multiply, green);
  image.evaluate(Channels.Blue, EvaluateOperator.Multiply, blue);
}

function applyModulate(image, params) {
  const hue = clamp(Math.round(100 + (params.hue / 180) * 100), 0, 200);
  image.modulate(percent(params.brightness), percent(params.saturation), percent(hue));
}

function applySmartContrast(image, params) {
  const amount = params.protect ? params.amount * 0.85 : params.amount;
  image.sigmoidalContrast(amount, percent(params.midpoint));
}

function applyUnsharp(image, params) {
  if (typeof image.unsharpMask === "function") {
    image.unsharpMask(params.radius, params.sigma, params.amount, params.threshold);
  } else {
    image.sharpen(params.radius, params.sigma);
  }
}

function applyDenoise(image, params) {
  if (params.strength === 0) return;
  const passes = Math.round(params.passes);
  for (let i = 0; i < passes; i += 1) {
    if (params.preserve && typeof image.waveletDenoise === "function") {
      image.waveletDenoise(params.strength);
    } else if (typeof image.bilateralBlur === "function") {
      const radius = clamp(params.strength / 2, 0, 5);
      image.bilateralBlur(radius, radius);
    } else if (typeof image.adaptiveBlur === "function") {
      image.adaptiveBlur(1, clamp(params.strength / 2, 0.1, 5));
    } else {
      image.blur(0, clamp(params.strength / 2, 0.1, 5));
    }
  }
}

function applyVignetteTilt(image, params) {
  if (params.mode === "tilt" || params.mode === "both") {
    applyTiltShift(image, params);
  }
  if (params.mode === "vignette" || params.mode === "both") {
    if (hasMethod(image, "vignette")) {
      const minDim = Math.min(image.width, image.height);
      const radius = (params.vignetteRadius / 100) * (minDim / 2);
      const sigma = 0.5 + (params.vignetteStrength / 100) * 10;
      image.vignette(radius, sigma, 0, 0);
    } else {
      warnMissingMethod("vignette-tilt", "vignette");
    }
  }
}

function applyTiltShift(image, params) {
  if (!hasMethod(image, "draw")) {
    warnMissingMethod("vignette-tilt", "draw");
    return;
  }
  const width = image.width;
  const height = image.height;
  const focusHeight = (params.focusHeight / 100) * height;
  const focusCenter = (params.focusCenter / 100) * height;
  const top = clamp(focusCenter - focusHeight / 2, 0, height);
  const bottom = clamp(focusCenter + focusHeight / 2, 0, height);

  const mask = image.clone();
  if (!hasMethod(mask, "read")) {
    warnMissingMethod("vignette-tilt", "read");
    return;
  }
  mask.read(MagickColors.White, width, height);
  mask.draw(new DrawableFillColor(MagickColors.Black), new DrawableRectangle(0, top, width, bottom));
  if (params.feather > 0) {
    const sigma = Math.max(0.1, (params.feather / 100) * (height / 4));
    mask.gaussianBlur(0, sigma);
  }

  const blurred = image.clone();
  blurred.gaussianBlur(0, Math.max(0.1, params.blurStrength));
  blurred.composite(mask, CompositeOperator.CopyAlpha);
  image.composite(blurred, CompositeOperator.Over);
}

function applyEdgeEmboss(image, params) {
  const strength = params.strength / 100;
  const detail = clamp(params.detail / 100, 0.05, 1);
  if (params.mode === "edge") {
    const radius = 1 + detail * 2;
    const sigma = 0.5 + detail * 2;
    if (hasMethod(image, "cannyEdge")) {
      image.cannyEdge(radius, sigma, percent(10 + strength * 40), percent(50 + strength * 40));
    } else if (hasMethod(image, "edge")) {
      image.edge(radius);
    } else {
      warnMissingMethod("edge-emboss", "cannyEdge");
    }
  } else if (typeof image.emboss === "function") {
    try {
      image.emboss(1 + detail * 2, 0.5 + strength * 2);
    } catch (error) {
      if (hasMethod(image, "cannyEdge")) {
        image.cannyEdge(1 + detail * 2, 1 + detail * 2, percent(10), percent(60));
        if (hasMethod(image, "negate")) {
          image.negate();
        } else {
          warnMissingMethod("edge-emboss", "negate");
        }
      } else if (hasMethod(image, "edge")) {
        image.edge(1 + detail * 2);
      } else {
        warnMissingMethod("edge-emboss", "cannyEdge");
      }
    }
  } else {
    if (hasMethod(image, "cannyEdge")) {
      image.cannyEdge(1 + detail * 2, 1 + detail * 2, percent(10), percent(60));
      if (hasMethod(image, "negate")) {
        image.negate();
      } else {
        warnMissingMethod("edge-emboss", "negate");
      }
    } else if (hasMethod(image, "edge")) {
      image.edge(1 + detail * 2);
    } else {
      warnMissingMethod("edge-emboss", "cannyEdge");
    }
  }
}

function applyPosterize(image, params) {
  if (typeof image.posterize === "function") {
    try {
      image.posterize(params.colors, params.dither);
      return;
    } catch (error) {
      // Fall back to quantize below.
    }
  }
  const settings = new QuantizeSettings();
  settings.colors = params.colors;
  settings.ditherMethod = params.dither ? (params.ditherMethod === "riemersma" ? DitherMethod.Riemersma : DitherMethod.FloydSteinberg) : DitherMethod.No;
  image.quantize(settings);
}

function applyThresholdDuotone(image, params) {
  if (params.feather > 0) {
    image.gaussianBlur(0, params.feather);
  }
  if (params.mode === "threshold") {
    image.threshold(percent(params.level));
    return;
  }
  // Duotone mapping: convert to grayscale, then apply a gradient CLUT for the two chosen colors.
  image.grayscale();
  try {
    const settings = new MagickReadSettings({ width: 256, height: 1 });
    const gradient = ImageMagick.read(`gradient:${params.dark}-${params.light}`, settings, (grad) => grad);
    image.clut(gradient, PixelInterpolateMethod.Bilinear);
  } catch (error) {
    image.threshold(percent(params.level));
  }
}

function applyPixelate(image, params) {
  const scale = Math.max(2, params.block);
  const origWidth = image.width;
  const origHeight = image.height;
  const downWidth = Math.max(1, Math.round(origWidth / scale));
  const downHeight = Math.max(1, Math.round(origHeight / scale));
  const filter = params.mode === "mosaic" ? FilterType.Triangle : FilterType.Point;
  image.resize(downWidth, downHeight, FilterType.Point);
  image.resize(origWidth, origHeight, filter);
  if (params.preserveEdges) {
    if (hasMethod(image, "adaptiveSharpen")) {
      image.adaptiveSharpen(0.5, 0.5);
    } else if (hasMethod(image, "sharpen")) {
      image.sharpen(0.5, 0.5);
    } else {
      warnMissingMethod("pixelate", "adaptiveSharpen");
    }
  }
}

function applyCrop(image, params) {
  if (params.rotation) {
    image.backgroundColor = colorFromHex(params.bgColor, 100);
    image.rotate(params.rotation);
  }
  if (params.autoTrim) {
    image.trim();
  }
  const width = Math.max(1, Math.round(image.width * params.cropW));
  const height = Math.max(1, Math.round(image.height * params.cropH));
  const x = Math.round(image.width * params.cropX);
  const y = Math.round(image.height * params.cropY);
  image.crop(new MagickGeometry(x, y, width, height));
  image.resetPage();
}

function applyResize(image, params) {
  if (!params.width && !params.height) return;
  const width = params.width || image.width;
  const height = params.height || image.height;
  const geometry = new MagickGeometry(width, height);
  if (params.fit === "exact") {
    geometry.ignoreAspectRatio = true;
  }
  const filter =
    params.filter === "nearest"
      ? FilterType.Point
      : params.filter === "triangle"
      ? FilterType.Triangle
      : params.filter === "lanczos"
      ? FilterType.Lanczos
      : params.filter === "mitchell"
      ? FilterType.Mitchell
      : undefined;

  if (params.fit === "fill") {
    geometry.fillArea = true;
    if (filter) {
      image.resize(geometry, filter);
    } else {
      image.resize(geometry);
    }
    image.crop(width, height, Gravity.Center);
    image.resetPage();
    return;
  }

  if (filter) {
    image.resize(geometry, filter);
  } else {
    image.resize(geometry);
  }
}

function applyPerspective(image, params) {
  const interp =
    params.interp === "nearest"
      ? PixelInterpolateMethod.Nearest
      : params.interp === "bilinear"
      ? PixelInterpolateMethod.Bilinear
      : params.interp === "bicubic"
      ? PixelInterpolateMethod.Bicubic
      : PixelInterpolateMethod.Undefined;
  image.interpolate = interp;

  const width = image.width;
  const height = image.height;
  const src = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  const dst = [
    { x: params.p0x * width, y: params.p0y * height },
    { x: params.p1x * width, y: params.p1y * height },
    { x: params.p2x * width, y: params.p2y * height },
    { x: params.p3x * width, y: params.p3y * height },
  ];
  const coords = src.flatMap((point, index) => [point.x, point.y, dst[index].x, dst[index].y]);
  image.distort(DistortMethod.Perspective, coords);
}

function applyBorderShadow(image, params) {
  if (params.borderSize > 0) {
    image.borderColor = colorFromHex(params.borderColor, 100);
    image.border(params.borderSize, params.borderSize);
  }
  if (params.frameSize > 0) {
    if (typeof image.frame === "function") {
      image.frame(new MagickGeometry(params.frameSize, params.frameSize));
    } else {
      image.border(params.frameSize, params.frameSize);
    }
  }
  if (params.shadow) {
    const shadow = image.clone();
    if (typeof shadow.shadow === "function") {
      shadow.shadow(params.shadowOpacity, params.shadowBlur, params.shadowOffsetX, params.shadowOffsetY);
      image.composite(shadow, CompositeOperator.DstOver);
    }
  }
}

function applyChromaKey(image, params) {
  image.alpha(AlphaAction.Set);
  image.colorFuzz = percent(params.tolerance);
  if (typeof image.transparentChroma === "function") {
    const color = colorFromHex(params.keyColor, 100);
    image.transparentChroma(color, color);
  } else {
    image.transparent(colorFromHex(params.keyColor, 100));
  }
  if (params.feather > 0) {
    image.gaussianBlur(0, params.feather, Channels.Alpha);
  }
  if (params.spill > 0) {
    const reduction = clamp(1 - params.spill / 200, 0.7, 1);
    image.evaluate(Channels.Green, EvaluateOperator.Multiply, reduction);
  }
}

function applyClarity(image, params) {
  const strength = params.skinSafe ? Math.min(params.strength, 60) : params.strength;
  if (typeof image.localContrast === "function") {
    try {
      image.localContrast(strength / 100, params.radius);
      return;
    } catch (error) {
      // Fall back to CLAHE below.
    }
  }
  // Fallback to CLAHE when local-contrast is unavailable.
  const tiles = Math.max(1, Math.round(10 - params.radius / 2));
  const clip = 2 + (strength / 100) * 4;
  image.clahe(tiles, tiles, 256, clip);
}

function applyClut(image, params) {
  if (params.preset === "none") return;
  const settings = new MagickReadSettings({ width: 256, height: 1 });
  const gradientMap = {
    warm: "#2b1b12-#f7e2c5",
    cool: "#102b38-#d6f4ff",
    matte: "#2b2b2b-#f3e5d3",
  };
  const gradient = gradientMap[params.preset] || gradientMap.warm;
  // Simple gradient CLUTs are used as bundled looks and blended with the original by strength.
  try {
    const lut = ImageMagick.read(`gradient:${gradient}`, settings, (grad) => grad);
    const original = image.clone();
    image.clut(lut, PixelInterpolateMethod.Bilinear);
    if (params.strength < 100) {
      const blend = Math.round(clamp(params.strength, 0, 100));
      image.composite(original, CompositeOperator.Blend, `${blend}`);
    }
  } catch (error) {
    // Fallback: leave the image unchanged if gradient CLUT is unavailable.
  }
}

function applyStylize(image, params) {
  if (params.mode === "oil") {
    image.oilPaint(1 + (params.amount / 100) * 3);
    return;
  }
  const radius = 1 + (params.amount / 100) * 4;
  const sigma = 0.5 + (params.detail / 100) * 2;
  if (params.mode === "charcoal") {
    if (hasMethod(image, "charcoal")) {
      image.charcoal(radius, sigma);
    } else {
      warnMissingMethod("stylize", "charcoal");
    }
  } else if (typeof image.sketch === "function") {
    image.sketch(radius, sigma, 0);
  } else {
    if (hasMethod(image, "charcoal")) {
      image.charcoal(radius, sigma);
    } else {
      warnMissingMethod("stylize", "charcoal");
    }
  }
}

function applyMotion(image, params) {
  if (params.strength === 0) return;
  if (params.mode === "radial" && typeof image.rotationalBlur === "function") {
    image.rotationalBlur(params.strength);
  } else {
    const radius = Math.max(1, params.strength / 10);
    if (hasMethod(image, "motionBlur")) {
      image.motionBlur(radius, Math.max(0.1, params.strength / 6), params.angle);
    } else {
      warnMissingMethod("motion", "motionBlur");
    }
  }
}

function applyWatermark(image, params) {
  if (!params.text) return;
  if (!hasMethod(image, "draw")) {
    warnMissingMethod("watermark", "draw");
    return;
  }
  const text = params.text;
  const pointSize = params.size;
  const color = colorFromHex(params.color, params.opacity);
  const padding = Math.round(Math.min(image.width, image.height) * 0.03);

  image.settings.fontPointsize = pointSize;

  let textWidth = 0;
  let textHeight = 0;
  if (typeof image.fontTypeMetrics === "function") {
    const metrics = image.fontTypeMetrics(text);
    textWidth = metrics.textWidth;
    textHeight = metrics.textHeight;
  }

  const position = resolveTextPosition(params.position, image.width, image.height, textWidth, textHeight, padding);

  if (params.shadow) {
    const shadowLayer = image.clone();
    if (hasMethod(shadowLayer, "read")) {
      shadowLayer.read(MagickColors.Transparent, image.width, image.height);
      const shadowColor = colorFromHex("#000000", Math.min(80, params.opacity));
      if (hasMethod(shadowLayer, "draw")) {
        shadowLayer.draw(
          new DrawableFontPointSize(pointSize),
          new DrawableFillColor(shadowColor),
          new DrawableText(position.x + params.shadowOffset, position.y + params.shadowOffset, text)
        );
      } else {
        warnMissingMethod("watermark", "draw");
      }
      if (params.shadowBlur > 0) {
        shadowLayer.gaussianBlur(0, params.shadowBlur);
      }
      image.composite(shadowLayer, CompositeOperator.Over);
    } else {
      warnMissingMethod("watermark", "read");
    }
  }

  image.draw(
    new DrawableFontPointSize(pointSize),
    new DrawableFillColor(color),
    new DrawableText(position.x, position.y, text)
  );
}

function resolveTextPosition(position, width, height, textWidth, textHeight, padding) {
  const xLeft = padding;
  const xCenter = (width - textWidth) / 2;
  const xRight = width - textWidth - padding;
  const yTop = padding + textHeight;
  const yMiddle = (height + textHeight) / 2;
  const yBottom = height - padding;

  switch (position) {
    case "north-west":
      return { x: xLeft, y: yTop };
    case "north":
      return { x: xCenter, y: yTop };
    case "north-east":
      return { x: xRight, y: yTop };
    case "west":
      return { x: xLeft, y: yMiddle };
    case "center":
      return { x: xCenter, y: yMiddle };
    case "east":
      return { x: xRight, y: yMiddle };
    case "south-west":
      return { x: xLeft, y: yBottom };
    case "south":
      return { x: xCenter, y: yBottom };
    case "south-east":
    default:
      return { x: xRight, y: yBottom };
  }
}

function applyCleanPhoto(image, params) {
  const strength = params.strength / 100;
  const denoise = 0.5 + strength * 2;
  if (typeof image.waveletDenoise === "function") {
    image.waveletDenoise(denoise);
  } else {
    image.adaptiveBlur(1, denoise);
  }
  image.sigmoidalContrast(2 + strength * 8, percent(50));
  const sharpenAmount = 1 + strength * 2 + (params.extraSharpen ? 1 : 0);
  if (typeof image.unsharpMask === "function") {
    image.unsharpMask(1.0, 1.0, sharpenAmount, 0);
  } else {
    image.sharpen(1.0, 1.0);
  }
  image.modulate(percent(100), percent(100 + strength * 10), percent(100));
}

function applyPortraitPop(image, params) {
  const strength = params.strength / 100;
  if (typeof image.waveletDenoise === "function") {
    image.waveletDenoise(0.5 + strength);
  }
  if (typeof image.localContrast === "function") {
    image.localContrast(strength, 5);
  } else {
    image.clahe(8, 8, 256, 2 + strength * 2);
  }
  if (typeof image.unsharpMask === "function") {
    image.unsharpMask(1.0, 0.8, Math.min(1.5, 0.5 + strength), 0);
  } else {
    image.sharpen(1.0, 1.0);
  }
  if (hasMethod(image, "vignette")) {
    image.vignette(params.vignette / 10, 5, 0, 0);
  } else {
    warnMissingMethod("portrait-pop", "vignette");
  }
}

function applyVintageFilm(image, params) {
  const strength = params.strength / 100;
  image.level(percent(5 + strength * 10), percent(100), 1.1 + strength * 0.2);
  image.modulate(percent(100), percent(100 - strength * 30), percent(100));
  image.evaluate(Channels.Red, EvaluateOperator.Multiply, 1 + strength * 0.05);
  image.evaluate(Channels.Blue, EvaluateOperator.Multiply, 1 - strength * 0.05);
  if (params.grain > 0) {
    image.addNoise(NoiseType.Gaussian, params.grain / 100);
  }
  if (hasMethod(image, "vignette")) {
    image.vignette(0, 5 + strength * 5, 0, 0);
  } else {
    warnMissingMethod("vintage-film", "vignette");
  }
}

function applyComicPoster(image, params) {
  const edge = image.clone();
  const edgeStrength = params.edgeStrength / 100;
  let hasEdgeOverlay = false;
  if (hasMethod(edge, "cannyEdge")) {
    edge.cannyEdge(1 + edgeStrength * 2, 1 + edgeStrength * 2, percent(10), percent(70));
    if (hasMethod(edge, "negate")) {
      edge.negate();
    }
    hasEdgeOverlay = true;
  } else if (hasMethod(edge, "edge")) {
    edge.edge(1 + edgeStrength * 2);
    if (hasMethod(edge, "negate")) {
      edge.negate();
    }
    hasEdgeOverlay = true;
  } else {
    warnMissingMethod("comic-poster", "cannyEdge");
  }

  const settings = new QuantizeSettings();
  settings.colors = params.colors;
  if (params.dither === "floyd") {
    settings.ditherMethod = DitherMethod.FloydSteinberg;
  } else if (params.dither === "ordered" && typeof image.orderedDither === "function") {
    image.orderedDither("o8x8");
    settings.ditherMethod = DitherMethod.No;
  } else {
    settings.ditherMethod = DitherMethod.No;
  }
  image.quantize(settings);
  if (hasEdgeOverlay) {
    image.composite(edge, CompositeOperator.Multiply);
  }
}

function applyTealOrange(image, params) {
  const strength = params.strength / 100;
  image.sigmoidalContrast(2 + (params.contrast / 100) * 6, percent(50));
  // Teal-orange balance: shift red up and blue down globally for a cinematic tint.
  const red = clamp(1 + strength * 0.12, 0.8, 1.3);
  const blue = clamp(1 - strength * 0.12, 0.7, 1.2);
  image.evaluate(Channels.Red, EvaluateOperator.Multiply, red);
  image.evaluate(Channels.Blue, EvaluateOperator.Multiply, blue);
  if (params.vignette) {
    if (hasMethod(image, "vignette")) {
      image.vignette(0, 5, 0, 0);
    } else {
      warnMissingMethod("teal-orange", "vignette");
    }
  }
}
