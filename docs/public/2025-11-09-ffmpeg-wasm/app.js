(function () {
  "use strict";

  const PRESETS = [
    {
      key: "telegram-720p",
      label: "720p MP4 · Telegram friendly",
      description: "Downscale to ≤720p, H.264 video + AAC audio around 3 Mbps.",
      extension: "mp4",
      args: [
        "-vf",
        "scale=-2:720:force_original_aspect_ratio=decrease",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "26",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
      ],
    },
    {
      key: "lightweight-540p",
      label: "Compact 540p MP4",
      description: "Lower bitrate target for quick shares (≈1.6 Mbps).",
      extension: "mp4",
      args: [
        "-vf",
        "scale=-2:540:force_original_aspect_ratio=decrease",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "29",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
      ],
    },
    {
      key: "normalize-audio",
      label: "FF Normalize Sound",
      description: "Keeps original video stream and boosts audio using dynamic normalization.",
      extension: "mp4",
      args: [
        "-c:v",
        "copy",
        "-af",
        "dynaudnorm,volume=3.0",
      ],
    },
    {
      key: "telegram-volume-5x-720p",
      label: "Broken Telegram Volume 5× 720p (libx265)",
      description:
        "Reference preset that depends on libx265. Disabled on builds without that encoder.",
      extension: "mp4",
      requiresCodecs: ["libx265"],
      args: [
        "-vf",
        "scale=-2:720",
        "-r",
        "30",
        "-c:v",
        "libx265",
        "-preset",
        "slow",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "48k",
        "-af",
        "volume=5.0",
        "-movflags",
        "+faststart",
      ],
    },
    {
      key: "telegram-volume-5x-720p-alt",
      label: "Alternative Telegram Volume 5× 720p",
      description: "720p H.264 video with 5× louder AAC audio for broader compatibility.",
      extension: "mp4",
      args: [
        "-vf",
        "scale=-2:720",
        "-r",
        "30",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "22",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        "-af",
        "volume=5.0",
        "-movflags",
        "+faststart",
      ],
    },
  ];

  const FALLBACK_THUMB =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90" viewBox="0 0 160 90" fill="none"><rect width="160" height="90" rx="10" fill="#1f2937"/><path d="M66 60V30l28 15-28 15z" fill="#4ade80"/></svg>'
    );

  const dom = {
    fileInput: document.getElementById("fileInput"),
    fileName: document.getElementById("fileName"),
    presetSelect: document.getElementById("presetSelect"),
    convertButton: document.getElementById("convertButton"),
    refreshGalleryButton: document.getElementById("refreshGalleryButton"),
    downloadButton: document.getElementById("downloadButton"),
    originalVideo: document.getElementById("originalVideo"),
    outputVideo: document.getElementById("outputVideo"),
    progressBar: document.getElementById("progressBar"),
    statusMessage: document.getElementById("statusMessage"),
    originalMeta: document.getElementById("originalMeta"),
    outputMeta: document.getElementById("outputMeta"),
    workerStatus: document.getElementById("workerStatus"),
    galleryList: document.getElementById("galleryList"),
    galleryEmpty: document.getElementById("galleryEmpty"),
  };

  const PROGRESS_STALL_MS = 12000;

  const state = {
    selectedFile: null,
    originalUrl: null,
    outputUrl: null,
    downloadBlobUrl: null,
    sourceDuration: 0,
    sourceThumbnail: null,
    conversionJob: null,
    isConverting: false,
    workersReady: {
      ffmpeg: false,
      storage: false,
    },
    gallerySelection: null,
    galleryItems: [],
    playbackMeta: null,
    capabilities: {
      encoders: null,
    },
    progressWatch: {
      timer: null,
      lastUpdate: 0,
      warned: false,
      presetKey: null,
    },
  };

  const presetOptions = new Map();
  const ffmpegWorker = new Worker("ffmpeg-worker.js");
  const storageWorker = new Worker("storage-worker.js");

  telemetry("app:init", { timestamp: Date.now() });

  ffmpegWorker.addEventListener("message", handleFfmpegMessage);
  storageWorker.addEventListener("message", handleStorageMessage);

  storageWorker.postMessage({ type: "init" });

  populatePresetSelect();
  bindUI();
  updateWorkerStatus();
  setStatus("Upload a video to begin.");

  function bindUI() {
    dom.fileInput.addEventListener("change", handleFileSelection);
    dom.convertButton.addEventListener("click", handleConvertClick);
    dom.refreshGalleryButton.addEventListener("click", () => {
      telemetry("gallery:refresh", { source: "button" });
      storageWorker.postMessage({ type: "list" });
    });
    dom.downloadButton.addEventListener("click", handleDownload);
    dom.presetSelect.addEventListener("change", () => {
      const preset = getSelectedPreset();
      if (preset) {
        telemetry("preset:changed", { key: preset.key });
        setStatus(`Using preset: ${preset.label}`);
        updateConvertAvailability();
      }
    });
    dom.galleryList.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest(".gallery-delete");
      if (deleteBtn) {
        event.stopPropagation();
        const id = deleteBtn.dataset.entry;
        telemetry("gallery:delete-click", { id });
        requestDeleteVideo(id);
        return;
      }
      const target = event.target.closest("[data-entry]");
      if (!target) return;
      const { entry } = target.dataset;
      telemetry("gallery:item-click", { id: entry });
      requestStoredVideo(entry);
    });
    dom.galleryList.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = event.target.closest("[data-entry]");
      if (!target) return;
      event.preventDefault();
      const { entry } = target.dataset;
      telemetry("gallery:item-activate", { id: entry });
      requestStoredVideo(entry);
    });

    window.addEventListener("beforeunload", () => {
      revokeUrl(state.originalUrl);
      revokeUrl(state.outputUrl);
      revokeUrl(state.downloadBlobUrl);
    });
  }

  function populatePresetSelect() {
    dom.presetSelect.innerHTML = "";
    presetOptions.clear();
    PRESETS.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.key;
      option.textContent = preset.label;
      option.title = preset.description;
      option.dataset.label = preset.label;
      option.dataset.presetKey = preset.key;
      dom.presetSelect.appendChild(option);
      presetOptions.set(preset.key, option);
    });
    updatePresetSupportUI();
  }

  async function handleFileSelection(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      telemetry("file:selection-canceled", {});
      return;
    }

    resetOutput();
    state.selectedFile = file;
    state.sourceDuration = 0;
    state.sourceThumbnail = null;

    dom.fileName.textContent = `${file.name} • ${formatBytes(file.size)}`;
    setStatus("Loading video metadata…");
    telemetry("file:selected", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const objectUrl = URL.createObjectURL(file);
    replaceObjectUrl("originalUrl", objectUrl);
    dom.originalVideo.src = objectUrl;
    dom.originalMeta.textContent = "Loading…";

    try {
      state.sourceDuration = await waitForMetadata(dom.originalVideo);
      dom.originalMeta.textContent = describeVideoMeta(
        state.sourceDuration,
        file.size
      );
      setStatus("Ready to convert.");
      updateConvertAvailability();
      telemetry("file:metadata-ready", {
        duration: state.sourceDuration,
        size: file.size,
      });
      generateThumbnail(file).then(
        (thumb) => {
          state.sourceThumbnail = thumb;
          telemetry("file:thumbnail-ready", { success: true });
        },
        () => {
          state.sourceThumbnail = null;
          telemetry("file:thumbnail-ready", { success: false });
        }
      );
    } catch (error) {
      dom.originalMeta.textContent = "Unable to load video.";
      setStatus(error.message || "Failed to load video metadata.", true);
      telemetry("file:metadata-error", { message: error.message });
      state.selectedFile = null;
      updateConvertAvailability();
    }
  }

  async function handleConvertClick() {
    if (!state.selectedFile) {
      setStatus("Select a video first.", true);
      return;
    }

    if (!state.workersReady.ffmpeg) {
      setStatus("FFmpeg worker is still starting.", true);
      return;
    }

    telemetry("convert:click", {});

    const preset = getSelectedPreset();
    if (!preset) {
      setStatus("Select a conversion preset.", true);
      telemetry("convert:missing-preset", {});
      return;
    }

    if (!isPresetSupported(preset)) {
      const missing = (preset.requiresCodecs || []).join(", ");
      setStatus(
        `Preset unavailable: encoder ${missing || "required"} not present in this FFmpeg build.`,
        true
      );
      telemetry("preset:unsupported", { preset: preset.key });
      updateConvertAvailability();
      return;
    }

    state.isConverting = true;
    startProgressMonitor(preset);
    updateConvertAvailability();
    setProgress(0);
    setStatus("Preparing conversion…");

    try {
      const buffer = await state.selectedFile.arrayBuffer();
      const jobId = `job-${Date.now()}`;
      state.conversionJob = { id: jobId, preset };
      telemetry("convert:started", {
        jobId,
        preset: preset.key,
        size: buffer.byteLength,
      });
      ffmpegWorker.postMessage(
        {
          type: "convert",
          jobId,
          fileName: state.selectedFile.name,
          mimeType: state.selectedFile.type || "application/octet-stream",
          duration: state.sourceDuration || null,
          preset,
          fileBuffer: buffer,
        },
        [buffer]
      );
    } catch (error) {
      setStatus(error.message || "Unable to read file.", true);
      telemetry("convert:start-error", { message: error.message });
      state.isConverting = false;
      stopProgressMonitor();
      updateConvertAvailability();
    }
  }

  function handleDownload() {
    if (!state.downloadBlobUrl) return;
    const link = document.createElement("a");
    link.href = state.downloadBlobUrl;
    const preset =
      (state.playbackMeta && state.playbackMeta.preset) ||
      (state.conversionJob ? state.conversionJob.preset : null);
    const ext =
      (state.playbackMeta && state.playbackMeta.extension) ||
      (preset ? preset.extension : "mp4");
    const baseSource =
      (state.playbackMeta && state.playbackMeta.title) ||
      (state.selectedFile ? state.selectedFile.name : "video");
    const base = sanitizeFileName(baseSource.replace(/\.[^.]+$/, "") || "video");
    const suffix =
      (state.playbackMeta && state.playbackMeta.presetKey) ||
      (preset ? preset.key : "converted");
    link.download = `${base}-${suffix}.${ext || "mp4"}`;
    telemetry("download:triggered", {
      filename: link.download,
      preset: suffix,
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleFfmpegMessage(event) {
    const { data } = event;
    if (!data) return;

    switch (data.type) {
      case "ready":
        state.workersReady.ffmpeg = true;
        updateWorkerStatus();
        telemetry("worker:ffmpeg-ready", {});
        updateConvertAvailability();
        break;
      case "progress":
        if (typeof data.percent === "number") {
          recordProgressHeartbeat();
          setProgress(data.percent);
          telemetry("convert:progress", { jobId: data.jobId, percent: data.percent });
        }
        if (data.detail) {
          setStatus(data.detail);
        }
        break;
      case "debug":
        telemetry("worker:ffmpeg-debug", {
          event: data.event,
          detail: safeParse(data.detail),
        });
        break;
      case "log":
        if (data.level === "error") {
          setStatus(data.message, true);
          telemetry("worker:ffmpeg-log-error", { message: data.message });
        }
        break;
      case "complete":
        handleConversionComplete(data);
        telemetry("convert:complete", {
          jobId: data.jobId,
          size: data.buffer ? data.buffer.byteLength : null,
        });
        break;
      case "error":
        setStatus(data.message || "Conversion failed.", true);
        telemetry("worker:ffmpeg-error", { jobId: data.jobId, message: data.message });
        state.isConverting = false;
        stopProgressMonitor();
        updateConvertAvailability();
        setProgress(0);
        break;
      case "capabilities":
        state.capabilities.encoders = Array.isArray(data.encoders) ? data.encoders : null;
        telemetry("worker:capabilities", { encoders: state.capabilities.encoders });
        updatePresetSupportUI();
        updateConvertAvailability();
        break;
      default:
        break;
    }
  }

  function handleConversionComplete(payload) {
    const { buffer, mimeType, jobId, fileName } = payload;
    state.isConverting = false;
    stopProgressMonitor();
    if (!buffer || !jobId) {
      setStatus("Conversion completed with missing data.", true);
      updateConvertAvailability();
      telemetry("convert:complete-missing-data", { jobId });
      return;
    }

    const preset = state.conversionJob ? state.conversionJob.preset : getSelectedPreset();
    const blob = new Blob([buffer], { type: mimeType || "video/mp4" });
    const objectUrl = URL.createObjectURL(blob);
    replaceObjectUrl("outputUrl", objectUrl);
    replaceObjectUrl("downloadBlobUrl", objectUrl);
    dom.outputVideo.src = objectUrl;
    dom.outputMeta.textContent = describeVideoMeta(
      payload.durationSeconds || state.sourceDuration,
      blob.size,
      preset ? preset.label : ""
    );
    state.playbackMeta = {
      title: fileName || "Converted video",
      presetKey: preset ? preset.key : null,
      presetLabel: preset ? preset.label : "",
      preset,
      extension: preset ? preset.extension || "mp4" : "mp4",
    };
    dom.downloadButton.disabled = false;
    setProgress(100);
    setStatus("Conversion complete. Saved locally.");
    updateConvertAvailability();
    telemetry("convert:output-ready", { jobId, size: blob.size, mimeType });

    if (storageWorker) {
      const record = {
        id: jobId,
        title: fileName || "Converted video",
        presetKey: preset ? preset.key : null,
        presetLabel: preset ? preset.label : "",
        createdAt: Date.now(),
        duration: payload.durationSeconds || state.sourceDuration || null,
        size: blob.size,
        mimeType: mimeType || "video/mp4",
        thumbnail: state.sourceThumbnail,
        videoBuffer: buffer,
      };
      storageWorker.postMessage(
        { type: "add", payload: record },
        [record.videoBuffer]
      );
      telemetry("storage:add-request", { id: record.id, size: record.size });
    }
  }

  function handleStorageMessage(event) {
    const { data } = event;
    if (!data) return;

    switch (data.type) {
      case "ready":
        state.workersReady.storage = true;
        updateWorkerStatus();
        telemetry("worker:storage-ready", {});
        storageWorker.postMessage({ type: "list" });
        break;
      case "gallerySnapshot":
        state.galleryItems = data.items || [];
        renderGallery();
        telemetry("gallery:snapshot", { count: state.galleryItems.length });
        break;
      case "videoPayload":
        if (data.buffer && data.id) {
          const blob = new Blob([data.buffer], { type: data.mimeType || "video/mp4" });
          const objectUrl = URL.createObjectURL(blob);
          replaceObjectUrl("outputUrl", objectUrl);
          replaceObjectUrl("downloadBlobUrl", objectUrl);
          dom.outputVideo.src = objectUrl;
          dom.outputMeta.textContent = describeVideoMeta(
            data.duration || null,
            blob.size,
            data.presetLabel || ""
          );
          state.playbackMeta = {
            title: data.title || "Converted video",
            presetKey: data.presetKey || null,
            presetLabel: data.presetLabel || "",
            extension: (data.mimeType && data.mimeType.split("/")[1]) || "mp4",
            preset: null,
          };
          dom.downloadButton.disabled = false;
          highlightGalleryItem(data.id);
          setStatus(`Loaded ${data.title || "stored video"} from library.`);
          telemetry("gallery:loaded", { id: data.id, size: blob.size });
        }
        break;
      case "added":
        setStatus("Stored conversion locally.");
        telemetry("storage:added", { id: data.id });
        break;
      case "deleted":
        telemetry("storage:deleted", { id: data.id });
        setStatus("Removed stored video.");
        if (state.gallerySelection === data.id) {
          highlightGalleryItem(null);
          state.playbackMeta = null;
        }
        break;
      case "error":
        setStatus(data.message || "Storage error.", true);
        telemetry("worker:storage-error", { message: data.message });
        break;
      default:
        break;
    }
  }

  function requestStoredVideo(id) {
    const existing = state.galleryItems.find((item) => item.id === id);
    if (!existing) return;
    state.gallerySelection = id;
    highlightGalleryItem(id);
    telemetry("gallery:request-video", { id });
    storageWorker.postMessage({ type: "get", id });
  }

  function requestDeleteVideo(id) {
    if (!id) return;
    storageWorker.postMessage({ type: "delete", id });
  }

  function renderGallery() {
    const entries = state.galleryItems;
    dom.galleryEmpty.style.display = entries.length ? "none" : "block";
    dom.galleryList.innerHTML = "";
    entries
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((entry) => {
        const li = document.createElement("li");
        li.className = "gallery-item";
        li.dataset.entry = entry.id;
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        li.setAttribute(
          "aria-label",
          `${entry.title || "Converted video"} converted ${entry.presetLabel || ""}`
        );

        if (state.gallerySelection === entry.id) {
          li.classList.add("active");
        }

        const thumb = document.createElement("img");
        thumb.className = "gallery-thumb";
        thumb.src = entry.thumbnail || FALLBACK_THUMB;
        thumb.loading = "lazy";
        thumb.decoding = "async";
        thumb.alt = `${entry.title || "Converted video"} thumbnail`;

        const meta = document.createElement("div");
        meta.className = "gallery-meta";

        const title = document.createElement("div");
        title.className = "gallery-title";
        title.textContent = entry.title || "Converted video";

        const detail = document.createElement("div");
        detail.className = "gallery-detail";
        const preset = entry.presetLabel || entry.presetKey || "Preset";
        const created = entry.createdAt ? new Date(entry.createdAt) : null;
        detail.textContent = `${preset} • ${created ? formatDate(created) : "unknown"} • ${formatBytes(entry.size || 0)}`;

        meta.appendChild(title);
        meta.appendChild(detail);

        const actions = document.createElement("div");
        actions.className = "gallery-actions";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "gallery-delete";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.entry = entry.id;
        actions.appendChild(deleteButton);

        li.appendChild(thumb);
        li.appendChild(meta);
        li.appendChild(actions);
        dom.galleryList.appendChild(li);
      });
  }

  function highlightGalleryItem(id) {
    state.gallerySelection = id || null;
    Array.from(dom.galleryList.children).forEach((node) => {
      node.classList.toggle("active", node.dataset.entry === id);
    });
  }

  function waitForMetadata(videoEl) {
    if (!videoEl) return Promise.resolve(0);
    const duration = videoEl.duration;
    if (duration && isFinite(duration) && duration > 0) {
      return Promise.resolve(duration);
    }
    return new Promise((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve(videoEl.duration || 0);
      };
      const onError = () => {
        cleanup();
        reject(new Error("Unable to read video metadata."));
      };
      const cleanup = () => {
        videoEl.removeEventListener("loadedmetadata", onLoaded);
        videoEl.removeEventListener("error", onError);
      };
      videoEl.addEventListener("loadedmetadata", onLoaded);
      videoEl.addEventListener("error", onError);
    });
  }

  function describeVideoMeta(duration, size, extra) {
    const chunks = [];
    if (duration) {
      chunks.push(`${formatDuration(duration)}`);
    }
    if (size) {
      chunks.push(formatBytes(size));
    }
    if (extra) {
      chunks.push(extra);
    }
    return chunks.join(" • ") || "—";
  }

  function updatePresetSupportUI() {
    const encodersKnown = Array.isArray(state.capabilities.encoders);
    presetOptions.forEach((option, key) => {
      const preset = PRESETS.find((item) => item.key === key);
      if (!preset) return;
      const baseLabel = option.dataset.label || preset.label;
      const supported = encodersKnown ? isPresetSupported(preset) : true;
      option.dataset.supported = supported ? "true" : "false";
      option.textContent = supported ? baseLabel : `${baseLabel} (unsupported)`;
    });
  }

  function isPresetSupported(preset) {
    if (!preset || !Array.isArray(preset.requiresCodecs) || preset.requiresCodecs.length === 0) {
      return true;
    }
    const encoders = state.capabilities.encoders;
    if (!Array.isArray(encoders) || encoders.length === 0) {
      return true;
    }
    return preset.requiresCodecs.every((codec) => encoders.includes(codec));
  }

  function updateConvertAvailability() {
    const preset = getSelectedPreset();
    const hasFile = Boolean(state.selectedFile);
    const presetSupported = isPresetSupported(preset);
    const ready =
      hasFile && presetSupported && state.workersReady.ffmpeg && !state.isConverting;
    dom.convertButton.disabled = !ready;
    if (
      hasFile &&
      preset &&
      !presetSupported &&
      Array.isArray(state.capabilities.encoders)
    ) {
      const missing = (preset.requiresCodecs || []).join(", ");
      if (!state.isConverting) {
        setStatus(
          `Preset unavailable: encoder ${missing || "required"} not present in this FFmpeg build.`,
          true
        );
      }
    }
  }

  function setProgress(value) {
    const clamped = Math.min(100, Math.max(0, value || 0));
    dom.progressBar.style.width = `${clamped}%`;
    dom.progressBar.setAttribute("aria-valuenow", String(Math.round(clamped)));
  }

  function setStatus(message, isError) {
    if (!message) return;
    dom.statusMessage.textContent = message;
    dom.statusMessage.style.color = isError ? "#fca5a5" : "var(--text-dim)";
    telemetry("status:update", { message, level: isError ? "error" : "info" });
  }

  function updateWorkerStatus() {
    const parts = [];
    parts.push(state.workersReady.ffmpeg ? "FFmpeg ready" : "FFmpeg loading");
    parts.push(state.workersReady.storage ? "Storage ready" : "Storage loading");
    const text = parts.join(" · ");
    dom.workerStatus.textContent = text;
    telemetry("status:workers", {
      ffmpeg: state.workersReady.ffmpeg,
      storage: state.workersReady.storage,
      label: text,
    });
    updateConvertAvailability();
  }

  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024;
      unit += 1;
    }
    return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
  }

  function formatDuration(seconds) {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }

  function formatDate(date) {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function sanitizeFileName(name) {
    return (name || "video").replace(/[\\/?%*:|"<>]/g, "").trim() || "video";
  }

  function getSelectedPreset() {
    const key = dom.presetSelect.value;
    return PRESETS.find((preset) => preset.key === key) || PRESETS[0];
  }

  function replaceObjectUrl(key, newUrl) {
    if (state[key]) {
      URL.revokeObjectURL(state[key]);
    }
    state[key] = newUrl;
  }

  function revokeUrl(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  function resetOutput() {
    dom.outputVideo.removeAttribute("src");
    dom.outputVideo.load();
    replaceObjectUrl("outputUrl", null);
    replaceObjectUrl("downloadBlobUrl", null);
    dom.downloadButton.disabled = true;
    dom.outputMeta.textContent = "Conversion pending";
    setProgress(0);
    state.playbackMeta = null;
  }

  async function generateThumbnail(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.removeAttribute("src");
        video.load();
      };

      const handleError = () => {
        cleanup();
        reject(new Error("Unable to capture thumbnail."));
      };

      video.addEventListener(
        "loadedmetadata",
        () => {
          const target =
            video.duration && isFinite(video.duration)
              ? Math.min(video.duration * 0.1, 3)
              : 0.5;
          const seekTime = Math.max(0.1, target);
          const drawFrame = () => {
            try {
              const canvas = document.createElement("canvas");
              const { videoWidth, videoHeight } = video;
              const aspect = videoWidth && videoHeight ? videoWidth / videoHeight : 16 / 9;
              canvas.width = 320;
              canvas.height = Math.round(canvas.width / (aspect || 1.777));
              const ctx = canvas.getContext("2d");
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
              cleanup();
              resolve(dataUrl);
            } catch (err) {
              cleanup();
              reject(err);
            }
          };
          video.currentTime = seekTime;
          video.addEventListener("seeked", drawFrame, { once: true });
        },
        { once: true }
      );

      video.addEventListener("error", handleError, { once: true });
    });
  }

  function telemetry(event, payload) {
    try {
      const serialized =
        payload === undefined
          ? ""
          : typeof payload === "string"
          ? payload
          : JSON.stringify(payload);
      console.log(`[telemetry] ${event}${serialized ? " " + serialized : ""}`);
    } catch (_) {
      console.log(`[telemetry] ${event} (unserializable payload)`);
    }
  }

  function safeParse(value) {
    if (typeof value !== "string") {
      return value;
    }
    try {
      return JSON.parse(value);
    } catch (_) {
      return value;
    }
  }

  function startProgressMonitor(preset) {
    const watch = state.progressWatch;
    watch.lastUpdate = Date.now();
    watch.warned = false;
    watch.presetKey = preset ? preset.key : null;
    clearTimeout(watch.timer);
    watch.timer = setTimeout(checkProgressStall, PROGRESS_STALL_MS);
  }

  function recordProgressHeartbeat() {
    const watch = state.progressWatch;
    watch.lastUpdate = Date.now();
    watch.warned = false;
  }

  function stopProgressMonitor() {
    const watch = state.progressWatch;
    clearTimeout(watch.timer);
    watch.timer = null;
    watch.warned = false;
    watch.presetKey = null;
  }

  function checkProgressStall() {
    const watch = state.progressWatch;
    if (!state.isConverting) {
      return;
    }
    const elapsed = Date.now() - (watch.lastUpdate || 0);
    if (!watch.warned && elapsed >= PROGRESS_STALL_MS) {
      watch.warned = true;
      const preset = PRESETS.find((item) => item.key === watch.presetKey);
      const heavyCodec =
        preset &&
        Array.isArray(preset.requiresCodecs) &&
        preset.requiresCodecs.includes("libx265");
      const message = heavyCodec
        ? "Still encoding with libx265… this preset is CPU intensive, please keep the tab open."
        : "Conversion still running… please keep the tab open.";
      setStatus(message, false);
      telemetry("convert:stall-warning", {
        preset: watch.presetKey,
        elapsed,
      });
    }
    watch.timer = setTimeout(checkProgressStall, PROGRESS_STALL_MS);
  }
})();
