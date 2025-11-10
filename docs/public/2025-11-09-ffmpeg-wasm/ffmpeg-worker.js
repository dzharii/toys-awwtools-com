importScripts("ffmpeg-core-0.12.10.js");

let ffmpegInstancePromise;
let ffmpegInstance = null;
let loggerAttached = false;
let activeJob = null;
let wasmBinaryPromise = null;
let lastErrorLine = "";
const logTaps = new Set();
let capabilitiesPromise = null;

const jobQueue = [];
let isProcessing = false;

self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === "convert") {
    enqueueJob(data);
  }
};

function workerLog(message, extra) {
  const payload = serialize(extra);
  try {
    console.log(`[ffmpeg-worker] ${message}${payload ? " " + payload : ""}`);
  } catch (_) {
    console.log(`[ffmpeg-worker] ${message} (unserializable payload)`);
  }
}

function emitDebug(event, detail) {
  self.postMessage({
    type: "debug",
    event,
    detail: serialize(detail, true),
  });
}

function broadcastLog(payload) {
  logTaps.forEach((tap) => {
    try {
      tap(payload);
    } catch (_) {
      // ignore listener errors
    }
  });
}

function handleCoreOutput(channel, message) {
  if (!message) return;
  if (channel === "stderr") {
    lastErrorLine = message;
  }
  broadcastLog({ type: channel, message });
}

function enqueueJob(job) {
  jobQueue.push(job);
  emitDebug("queue:enqueued", {
    jobId: job.jobId,
    pending: jobQueue.length,
  });
  processQueue();
}

async function processQueue() {
  if (isProcessing) return;
  const job = jobQueue.shift();
  if (!job) return;
  isProcessing = true;
  emitDebug("queue:processing", { jobId: job.jobId });
  try {
    await runJob(job);
  } catch (error) {
    emitError(job.jobId, error);
  } finally {
    activeJob = null;
    isProcessing = false;
    processQueue();
  }
}

function ensureInstance() {
  if (ffmpegInstancePromise) {
    return ffmpegInstancePromise;
  }

  ffmpegInstancePromise = loadWasmBinary()
    .then((wasmBinary) => initializeCore(wasmBinary))
    .then((instance) => {
      ffmpegInstance = instance;
      attachLogger();
      workerLog("FFmpeg core ready");
      emitDebug("core:ready", {});
      return instance;
    })
    .catch((error) => {
      workerLog("FFmpeg init failed", error);
      emitDebug("core:error", { message: error.message });
      throw error;
    });

  return ffmpegInstancePromise;
}

function loadWasmBinary() {
  if (wasmBinaryPromise) {
    return wasmBinaryPromise;
  }
  const wasmUrl = new URL("./ffmpeg-core-0.12.10.wasm", self.location.href).toString();
  workerLog("Fetching FFmpeg WASM", wasmUrl);
  wasmBinaryPromise = fetch(wasmUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load wasm (${response.status})`);
      }
      return response.arrayBuffer();
    })
    .then((buffer) => new Uint8Array(buffer))
    .catch((error) => {
      workerLog("Unable to fetch wasm", error);
      throw error;
    });
  return wasmBinaryPromise;
}

function initializeCore(wasmBinary) {
  const coreOptions = {
    print: (message) => handleCoreOutput("stdout", message),
    printErr: (message) => handleCoreOutput("stderr", message),
    wasmBinary,
  };
  const instanceOrPromise = createFFmpegCore(coreOptions);
  return normalizeInstance(instanceOrPromise);
}

function normalizeInstance(instanceOrPromise) {
  if (!instanceOrPromise) {
    return Promise.reject(new Error("FFmpeg core unavailable"));
  }
  if (typeof instanceOrPromise.then === "function") {
    return instanceOrPromise;
  }
  if (instanceOrPromise.ready && typeof instanceOrPromise.ready.then === "function") {
    return instanceOrPromise.ready.then(() => instanceOrPromise);
  }
  return Promise.resolve(instanceOrPromise);
}

function attachLogger() {
  if (loggerAttached || !ffmpegInstance || typeof ffmpegInstance.setLogger !== "function") {
    return;
  }
  ffmpegInstance.setLogger(({ type, message }) => {
    if (!message) return;
    broadcastLog({ type, message });
    if (type === "stderr") {
      lastErrorLine = message;
      const percent = computeProgressFromLine(message, activeJob);
      if (percent !== null && activeJob) {
        emitProgress(activeJob.jobId, percent, `Encoding… ${Math.round(percent)}%`);
      } else if (/error/i.test(message)) {
        self.postMessage({ type: "log", level: "error", message });
      }
    }
  });
  loggerAttached = true;
}

async function runJob(job) {
  const instance = await ensureInstance();
  if (!job || !job.fileBuffer || !job.preset) {
    throw new Error("Invalid conversion request.");
  }

  activeJob = {
    jobId: job.jobId || `job-${Date.now()}`,
    duration: job.duration || null,
  };

  emitProgress(activeJob.jobId, 2, "Initializing FFmpeg…");
  lastErrorLine = "";

  const inputFile = `input-${activeJob.jobId}`;
  const extension = job.preset.extension || "mp4";
  const outputFile = `output-${activeJob.jobId}.${extension}`;
  const inputData = new Uint8Array(job.fileBuffer);

  try {
    instance.FS.writeFile(inputFile, inputData);
    emitDebug("fs:input-written", { jobId: activeJob.jobId, bytes: inputData.length });
  } catch (error) {
    emitDebug("fs:input-write-error", { jobId: activeJob.jobId, message: error.message });
    throw new Error("Unable to prepare input file for FFmpeg.");
  }

  const args = ["-hide_banner", "-i", inputFile, ...(job.preset.args || []), outputFile];

  try {
    emitDebug("ffmpeg:exec-start", { jobId: activeJob.jobId, args });
    const resultCode = instance.exec(...args);
    if (resultCode !== 0) {
      const reason = lastErrorLine || "Unknown error";
      emitDebug("ffmpeg:exec-error", {
        jobId: activeJob.jobId,
        code: resultCode,
        reason,
      });
      throw new Error(`FFmpeg failed (code ${resultCode}): ${reason}`);
    }
    emitDebug("ffmpeg:exec-complete", { jobId: activeJob.jobId });
  } catch (error) {
    const reason = lastErrorLine || (error && error.message);
    emitDebug("ffmpeg:exec-exception", {
      jobId: activeJob.jobId,
      message: reason,
    });
    throw new Error(reason || "FFmpeg execution failed.");
  }

  let outputBuffer;
  try {
    const outputData = instance.FS.readFile(outputFile);
    emitDebug("fs:output-read", { jobId: activeJob.jobId, bytes: outputData.byteLength });
    outputBuffer = outputData.buffer.slice(
      outputData.byteOffset,
      outputData.byteOffset + outputData.byteLength
    );
  } catch (error) {
    throw new Error("Failed to read FFmpeg output.");
  } finally {
    safeUnlink(instance, inputFile);
    safeUnlink(instance, outputFile);
  }

  emitProgress(activeJob.jobId, 100, "Finished.");
  self.postMessage(
    {
      type: "complete",
      jobId: activeJob.jobId,
      fileName: job.fileName,
      presetKey: job.preset.key,
      durationSeconds: job.duration || null,
      mimeType: `video/${extension === "mp4" ? "mp4" : extension}`,
      buffer: outputBuffer,
    },
    [outputBuffer]
  );
}

function safeUnlink(instance, path) {
  try {
    instance.FS.unlink(path);
  } catch (_) {
    // ignore
  }
}

function computeProgressFromLine(message, job) {
  if (!job || !job.duration || !message.includes("time=")) {
    return null;
  }
  const match = message.match(/time=(\d+):(\d+):([\d.]+)/);
  if (!match) return null;
  const [, hours, minutes, seconds] = match;
  const timeSeconds =
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
  if (!isFinite(timeSeconds) || timeSeconds <= 0) return null;
  const percent = Math.min(99, (timeSeconds / job.duration) * 100);
  return Number.isFinite(percent) ? percent : null;
}

function emitProgress(jobId, percent, detail) {
  self.postMessage({
    type: "progress",
    jobId,
    percent: Math.max(0, Math.min(100, percent)),
    detail,
  });
}

function captureLogsFor(action) {
  const lines = [];
  const tap = ({ message }) => {
    if (message) {
      lines.push(message);
    }
  };
  logTaps.add(tap);
  return Promise.resolve()
    .then(action)
    .then(
      () => lines.slice(),
      (error) => {
        error.capturedLogs = lines.slice();
        throw error;
      }
    )
    .finally(() => {
      logTaps.delete(tap);
    });
}

function scanEncoders() {
  if (!ffmpegInstance) {
    return Promise.reject(new Error("FFmpeg not initialized"));
  }
  return captureLogsFor(() => ffmpegInstance.exec("-hide_banner", "-encoders")).then(
    (lines) => parseEncoders(lines.join("\n"))
  );
}

function parseEncoders(text) {
  const encoders = [];
  if (!text) return encoders;
  const regex = /^\s*[A-Z\.]{6}\s+(\S+)/;
  text.split(/\r?\n/).forEach((line) => {
    const match = regex.exec(line);
    if (match && match[1]) {
      const name = match[1];
      if (/^[A-Za-z0-9_\-]+$/.test(name)) {
        encoders.push(name);
      }
    }
  });
  return encoders;
}

function publishCapabilities() {
  if (capabilitiesPromise) {
    return capabilitiesPromise;
  }
  const runScan = () =>
    scanEncoders()
      .then((encoders) => {
        self.postMessage({ type: "capabilities", encoders });
        emitDebug("capabilities", { count: encoders.length });
        return encoders;
      })
      .catch((error) => {
        emitDebug("capabilities-error", { message: error.message });
        self.postMessage({ type: "capabilities", encoders: null });
        return null;
      });
  capabilitiesPromise = ffmpegInstance ? runScan() : ensureInstance().then(() => runScan());
  return capabilitiesPromise;
}

function emitError(jobId, error) {
  self.postMessage({
    type: "error",
    jobId,
    message: error && error.message ? error.message : "Worker error.",
  });
}

ensureInstance()
  .then(() => {
    self.postMessage({ type: "ready" });
    publishCapabilities();
  })
  .catch((error) => {
    emitError("init", error);
  });

function serialize(value, shallow) {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch (error) {
    if (!shallow && typeof value === "object") {
      const plain = {};
      for (const key of Object.keys(value)) {
        const item = value[key];
        if (typeof item === "object") {
          plain[key] = "[object]";
        } else {
          plain[key] = item;
        }
      }
      try {
        return JSON.stringify(plain);
      } catch (_) {
        return "";
      }
    }
    return "";
  }
}
