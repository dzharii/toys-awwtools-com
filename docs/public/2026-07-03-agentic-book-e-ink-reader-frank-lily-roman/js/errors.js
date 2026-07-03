// Central error definitions and user-facing copy.
// User messages are short and factual (see design note AO00). Technical detail
// is logged, never shown as a raw stack trace in the main UI.

import { log } from "./logging.js";

export const ErrorCode = {
  NO_FILE: "no_file",
  MULTIPLE_FILES: "multiple_files",
  UNSUPPORTED_TYPE: "unsupported_type",
  EMPTY_FILE: "empty_file",
  FILE_TOO_LARGE: "file_too_large",
  READ_FAILED: "read_failed",
  DECODE_FAILED: "decode_failed",
  BINARY_CONTENT: "binary_content",
  PARSER_UNAVAILABLE: "parser_unavailable",
  PARSE_FAILED: "parse_failed",
  SANITIZER_UNAVAILABLE: "sanitizer_unavailable",
  FONT_FAILED: "font_failed",
  PAGINATION_FAILED: "pagination_failed",
  PREF_LOAD_FAILED: "pref_load_failed",
  PREF_SAVE_FAILED: "pref_save_failed",
  UNKNOWN: "unknown",
};

// Copy is intentionally plain. `actions` are hints the UI can render as buttons.
const CATALOG = {
  [ErrorCode.NO_FILE]: {
    title: "No file selected",
    message: "Choose a .txt, .md, or .markdown file to start reading.",
    actions: ["open"],
  },
  [ErrorCode.MULTIPLE_FILES]: {
    title: "Open one book at a time",
    message: "Open one book file at a time.",
    actions: ["open"],
  },
  [ErrorCode.UNSUPPORTED_TYPE]: {
    title: "Unsupported file type",
    message: "This file type is not supported. Open a .txt, .md, or .markdown file.",
    actions: ["open"],
  },
  [ErrorCode.EMPTY_FILE]: {
    title: "This file is empty",
    message: "There is nothing to read in this file. Open another book file.",
    actions: ["open"],
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    title: "File is too large",
    message: "This file is too large to open safely. Try a smaller file.",
    actions: ["open"],
  },
  [ErrorCode.READ_FAILED]: {
    title: "Could not read the file",
    message: "The file could not be read. Try reopening it.",
    actions: ["open"],
  },
  [ErrorCode.DECODE_FAILED]: {
    title: "Could not read the text",
    message: "The text in this file could not be decoded. Open a plain UTF-8 text or Markdown file.",
    actions: ["open"],
  },
  [ErrorCode.BINARY_CONTENT]: {
    title: "This does not look like text",
    message: "This file does not appear to be readable text. Open a .txt, .md, or .markdown file.",
    actions: ["open"],
  },
  [ErrorCode.PARSER_UNAVAILABLE]: {
    title: "Markdown rendering is unavailable",
    message: "Markdown support could not load. You can open this file as plain text.",
    actions: ["plaintext", "open"],
  },
  [ErrorCode.PARSE_FAILED]: {
    title: "Markdown could not be rendered",
    message: "Markdown could not be rendered safely. You can reopen this file as plain text.",
    actions: ["plaintext", "open"],
  },
  [ErrorCode.SANITIZER_UNAVAILABLE]: {
    title: "Safe Markdown rendering is unavailable",
    message: "The content sanitizer could not load, so Markdown is shown as plain text for safety.",
    actions: ["open"],
  },
  [ErrorCode.FONT_FAILED]: {
    title: "Font could not load",
    message: "The selected font could not load. A fallback font is being used.",
    actions: [],
  },
  [ErrorCode.PAGINATION_FAILED]: {
    title: "Page layout could not be built",
    message: "This file could not be laid out in page mode, so scroll mode is being used instead.",
    actions: [],
  },
  [ErrorCode.PREF_LOAD_FAILED]: {
    title: "Preferences could not be loaded",
    message: "Your saved settings could not be read, so defaults are being used.",
    actions: [],
  },
  [ErrorCode.PREF_SAVE_FAILED]: {
    title: "Preferences could not be saved",
    message: "Your settings could not be saved in this browser. They will still apply for this session.",
    actions: [],
  },
  [ErrorCode.UNKNOWN]: {
    title: "Something went wrong",
    message: "Something unexpected happened. Try reopening your book file.",
    actions: ["open"],
  },
};

export class AppError extends Error {
  constructor(code, detail) {
    const info = CATALOG[code] || CATALOG[ErrorCode.UNKNOWN];
    super(info.message);
    this.name = "AppError";
    this.code = code in CATALOG ? code : ErrorCode.UNKNOWN;
    this.detail = detail || null;
  }
}

/** Look up user-facing copy for an error code. */
export function describe(code) {
  return CATALOG[code] || CATALOG[ErrorCode.UNKNOWN];
}

/**
 * Normalize any thrown value into an AppError and log its technical detail.
 * Returns the AppError so callers can present user-facing copy.
 */
export function toAppError(err, fallbackCode = ErrorCode.UNKNOWN) {
  if (err instanceof AppError) {
    log.error("error:shown", { code: err.code });
    return err;
  }
  const appErr = new AppError(fallbackCode, err && err.message ? err.message : String(err));
  log.error("error:shown", { code: appErr.code, detail: appErr.detail });
  return appErr;
}
