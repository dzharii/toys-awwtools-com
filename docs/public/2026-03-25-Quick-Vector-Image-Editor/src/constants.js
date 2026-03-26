export const APP_ID = "quick-vector-image-editor";
export const DOCUMENT_FORMAT_VERSION = 2;
export const SVG_METADATA_PREFIX = "data-ve-";
export const DEFAULT_FONT_FAMILY = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const DEFAULT_CANVAS = Object.freeze({
    width: 1600,
    height: 900,
    background: "#ffffff"
});
export const INSERTION_BASE = 40;
export const INSERTION_STEP = 24;
export const IMAGE_FIT_RATIO = 0.8;
export const AUTOSAVE_DEBOUNCE_MS = 500;
export const SNAPSHOT_RETENTION = 3;
export const LOG_LIMIT = 400;
export const VIEWPORT_SCALE_MIN = 0.1;
export const VIEWPORT_SCALE_MAX = 8;
export const VIEWPORT_PADDING = 48;
export const SELECTION_HANDLE_SIZE_PX = 12;
export const HANDLE_HIT_SIZE_PX = 10;
export const LINE_HIT_CORRIDOR_PX = 8;
export const DRAG_THRESHOLD_PX = 3;
export const RASTER_EXPORT_LIMITS = Object.freeze({
    maxWidth: 8192,
    maxHeight: 8192,
    maxPixels: 67108864
});
export const RELIABLE_DRAFT_BYTES = 64 * 1024 * 1024;
export const DRAFT_WARN_RATIO = 0.85;
export const TOOL = Object.freeze({
    SELECT: "select",
    TEXT: "text",
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    LINE: "line"
});
export const OBJECT_TYPE = Object.freeze({
    IMAGE: "image",
    TEXT: "text",
    RECTANGLE: "rectangle",
    ELLIPSE: "ellipse",
    LINE: "line"
});
export const DOCUMENT_ORIGIN = Object.freeze({
    NEW: "new",
    OPENED: "opened",
    RECOVERED: "recovered"
});
export const SAVE_STATE = Object.freeze({
    SAVED: "saved",
    PENDING: "pending",
    FAILED: "failed"
});
export const STORAGE_STATE = Object.freeze({
    AVAILABLE: "available",
    DEGRADED: "degraded",
    UNAVAILABLE: "unavailable"
});
export const NOTICE_TYPE = Object.freeze({
    INFO: "info",
    WARNING: "warning",
    ERROR: "error"
});
export const INTERACTION_MODE = Object.freeze({
    IDLE: "idle",
    DRAGGING: "dragging",
    RESIZING: "resizing",
    PANNING: "panning",
    TEXT_EDIT: "text-edit"
});
export const DEFAULT_STYLES = Object.freeze({
    text: {
        fontSize: 24,
        fontWeight: 400,
        fill: "#111111",
        fontFamily: DEFAULT_FONT_FAMILY,
        lineHeight: 1.2,
        textAlign: "left"
    },
    rectangle: {
        stroke: "#ff3b30",
        strokeWidth: 3,
        fill: "transparent"
    },
    ellipse: {
        stroke: "#ff3b30",
        strokeWidth: 3,
        fill: "transparent"
    },
    line: {
        stroke: "#ff3b30",
        strokeWidth: 3
    }
});
export const DEFAULT_GEOMETRY = Object.freeze({
    rectangle: {
        width: 180,
        height: 120
    },
    ellipse: {
        width: 180,
        height: 120
    },
    line: {
        length: 200
    }
});
export const MIME_TYPES = Object.freeze({
    SVG: "image/svg+xml",
    PNG: "image/png",
    JPEG: "image/jpeg"
});
export const CLIPBOARD_MIME_TYPES = Object.freeze({
    INTERNAL_OBJECT: "application/x-quick-vector-image-editor-object+json",
    TEXT: "text/plain"
});
export const SUPPORTED_IMAGE_MIME_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp"
]);
