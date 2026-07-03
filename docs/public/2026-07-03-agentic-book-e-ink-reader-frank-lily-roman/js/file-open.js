// File input: file picker and drag-and-drop. Validates before parsing and
// reads the file locally with the File API. No upload, no network.

import { AppError, ErrorCode } from "./errors.js";
import { log } from "./logging.js";
import { fileExtension, looksBinary } from "./utils.js";

const SUPPORTED = new Set(["txt", "md", "markdown"]);
const WARN_BYTES = 2 * 1024 * 1024; // 2 MB — warn but allow
const HARD_LIMIT_BYTES = 15 * 1024 * 1024; // 15 MB — reject

function typeForExtension(ext) {
  return ext === "txt" ? "text" : "markdown";
}

/**
 * Validate a FileList and read the single accepted file.
 * Resolves to { fileName, fileType, sourceText, largeWarning }.
 * Rejects with an AppError on any validation/read failure.
 */
export async function readFromFileList(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) throw new AppError(ErrorCode.NO_FILE);
  if (files.length > 1) {
    log.info("file:drop", { count: files.length });
    throw new AppError(ErrorCode.MULTIPLE_FILES);
  }

  const file = files[0];
  const ext = fileExtension(file.name);
  log.info("file:select", { name: file.name, size: file.size, ext });

  if (!SUPPORTED.has(ext)) throw new AppError(ErrorCode.UNSUPPORTED_TYPE, ext || "no-extension");
  if (file.size === 0) throw new AppError(ErrorCode.EMPTY_FILE);
  if (file.size > HARD_LIMIT_BYTES) throw new AppError(ErrorCode.FILE_TOO_LARGE, `${file.size} bytes`);

  log.info("file:validated", { fileType: typeForExtension(ext) });

  let text;
  try {
    log.info("file:read:start");
    text = await file.text();
  } catch (err) {
    throw new AppError(ErrorCode.READ_FAILED, (err && err.message) || "read");
  }

  if (typeof text !== "string") throw new AppError(ErrorCode.DECODE_FAILED);
  if (looksBinary(text)) throw new AppError(ErrorCode.BINARY_CONTENT);

  log.info("file:read:success", { size: file.size });

  return {
    fileName: file.name,
    fileType: typeForExtension(ext),
    sourceText: text,
    largeWarning: file.size > WARN_BYTES,
  };
}

/**
 * Wire the file picker and drop zone.
 * @param {object} opts { dropzone, fileInput, onLoad(result), onError(appError) }
 */
export function initFileOpen(opts) {
  const { dropzone, fileInput, onLoad, onError } = opts;

  const handle = async (fileList) => {
    try {
      const result = await readFromFileList(fileList);
      onLoad(result);
    } catch (err) {
      onError(err instanceof AppError ? err : new AppError(ErrorCode.UNKNOWN, String(err)));
    }
  };

  fileInput.addEventListener("change", () => {
    handle(fileInput.files);
    // Reset so selecting the same file again re-triggers change.
    fileInput.value = "";
  });

  // Prevent the browser from navigating to a dropped file anywhere on the page.
  ["dragenter", "dragover", "drop"].forEach((type) => {
    window.addEventListener(type, (e) => {
      if (type !== "drop") e.preventDefault();
    });
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    const dt = e.dataTransfer;
    handle(dt ? dt.files : null);
  });

  return {
    openPicker: () => fileInput.click(),
    handleFileList: handle,
  };
}

export const FileLimits = { WARN_BYTES, HARD_LIMIT_BYTES };
