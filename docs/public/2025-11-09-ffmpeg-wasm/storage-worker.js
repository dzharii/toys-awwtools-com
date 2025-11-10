importScripts("dexie-4.2.0.js");

const MAX_STORED_VIDEOS = 20;

const db = new Dexie("ffmpegWasmGallery");
db.version(1).stores({
  videos: "&id, createdAt, presetKey",
});

self.onmessage = (event) => {
  const data = event.data || {};
  switch (data.type) {
    case "init":
      handleInit();
      break;
    case "add":
      handleAdd(data.payload);
      break;
    case "list":
      emitGallerySnapshot();
      break;
    case "get":
      handleGet(data.id);
      break;
    case "delete":
      handleDelete(data.id);
      break;
    default:
      break;
  }
};

async function handleInit() {
  try {
    await db.open();
    self.postMessage({ type: "ready" });
    emitGallerySnapshot();
  } catch (error) {
    emitStorageError(error, "Unable to open local database.");
  }
}

async function handleAdd(payload) {
  if (!payload || !payload.id || !payload.videoBuffer) {
    emitStorageError(null, "Missing video data for storage.");
    return;
  }
  const normalizedBuffer = normalizeBuffer(payload.videoBuffer);
  if (!normalizedBuffer) {
    emitStorageError(null, "Unsupported video buffer format.");
    return;
  }
  try {
    await db.transaction("rw", db.videos, async () => {
      await db.videos.put({
        id: payload.id,
        title: payload.title || "Converted video",
        createdAt: payload.createdAt || Date.now(),
        presetKey: payload.presetKey || "",
        presetLabel: payload.presetLabel || "",
        duration: payload.duration || null,
        size: payload.size || normalizedBuffer.byteLength,
        mimeType: payload.mimeType || "video/mp4",
        thumbnail: payload.thumbnail || null,
        videoBuffer: normalizedBuffer,
      });
      const count = await db.videos.count();
      if (count > MAX_STORED_VIDEOS) {
        const overflow = count - MAX_STORED_VIDEOS;
        const oldest = await db.videos.orderBy("createdAt").limit(overflow).toArray();
        if (oldest.length) {
          await db.videos.bulkDelete(oldest.map((entry) => entry.id));
        }
      }
    });
    self.postMessage({ type: "added", id: payload.id });
    emitGallerySnapshot();
  } catch (error) {
    emitStorageError(error, "Failed to store conversion.");
  }
}

async function emitGallerySnapshot() {
  try {
    const entries = await db.videos.orderBy("createdAt").reverse().toArray();
    const sanitized = entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      createdAt: entry.createdAt,
      presetKey: entry.presetKey,
      presetLabel: entry.presetLabel,
      duration: entry.duration,
      size: entry.size || (entry.videoBuffer ? entry.videoBuffer.byteLength : 0),
      thumbnail: entry.thumbnail,
    }));
    self.postMessage({ type: "gallerySnapshot", items: sanitized });
  } catch (error) {
    emitStorageError(error, "Unable to read stored videos.");
  }
}

async function handleGet(id) {
  if (!id) return;
  try {
    const entry = await db.videos.get(id);
    if (!entry) {
      emitStorageError(null, "Video not found in storage.");
      return;
    }
    const originalBuffer = normalizeBuffer(entry.videoBuffer);
    const buffer = originalBuffer ? originalBuffer.slice(0) : null;
    if (!buffer) {
      emitStorageError(null, "Stored video is missing data.");
      return;
    }
    self.postMessage(
      {
        type: "videoPayload",
        id: entry.id,
        title: entry.title,
        presetKey: entry.presetKey,
        presetLabel: entry.presetLabel,
        duration: entry.duration,
        mimeType: entry.mimeType || "video/mp4",
        buffer,
      },
      [buffer]
    );
  } catch (error) {
    emitStorageError(error, "Unable to read stored video.");
  }
}

async function handleDelete(id) {
  if (!id) return;
  try {
    await db.videos.delete(id);
    self.postMessage({ type: "deleted", id });
    emitGallerySnapshot();
  } catch (error) {
    emitStorageError(error, "Unable to delete video.");
  }
}

function emitStorageError(error, fallbackMessage) {
  self.postMessage({
    type: "error",
    message: fallbackMessage || (error && error.message) || "Storage error.",
  });
}

function normalizeBuffer(source) {
  if (!source) return null;
  if (source instanceof ArrayBuffer) {
    return source;
  }
  if (ArrayBuffer.isView(source)) {
    return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  }
  return null;
}
