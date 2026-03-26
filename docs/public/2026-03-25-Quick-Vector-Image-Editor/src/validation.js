import {
    APP_ID,
    DEFAULT_FONT_FAMILY,
    DOCUMENT_FORMAT_VERSION,
    OBJECT_TYPE
} from "./constants.js";
import { byteSizeOfString } from "./utils.js";

export function normalizeTextContent(value) {
    return String(value ?? "").replace(/[\r\n]+/g, " ");
}

export function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

export function validateDocument(document) {
    const errors = [];
    if (!document || typeof document !== "object") {
        return ["Document is missing."];
    }
    if (document.appId !== APP_ID) {
        errors.push("Document appId is invalid.");
    }
    if (document.version !== DOCUMENT_FORMAT_VERSION) {
        errors.push(`Unsupported document version: ${document.version}`);
    }
    if (!document.canvas || !isFiniteNumber(document.canvas.width) || document.canvas.width <= 0) {
        errors.push("Canvas width must be a finite number greater than zero.");
    }
    if (!document.canvas || !isFiniteNumber(document.canvas.height) || document.canvas.height <= 0) {
        errors.push("Canvas height must be a finite number greater than zero.");
    }
    if (!Array.isArray(document.objects)) {
        errors.push("Document objects must be an array.");
    }
    if (!document.metadata || typeof document.metadata.lineageId !== "string" || !document.metadata.lineageId) {
        errors.push("Document lineageId is missing.");
    }
    const ids = new Set();
    for (const object of document.objects ?? []) {
        const objectErrors = validateObject(object);
        for (const error of objectErrors) {
            errors.push(`[${object?.id ?? "unknown"}] ${error}`);
        }
        if (object?.id) {
            if (ids.has(object.id)) {
                errors.push(`Duplicate object id: ${object.id}`);
            }
            ids.add(object.id);
        }
    }
    return errors;
}

export function validateObject(object) {
    const errors = [];
    if (!object || typeof object !== "object") {
        return ["Object is missing."];
    }
    if (typeof object.id !== "string" || !object.id) {
        errors.push("Object id is missing.");
    }
    switch (object.type) {
        case OBJECT_TYPE.IMAGE:
            validateFiniteFields(object, ["x", "y", "width", "height", "naturalWidth", "naturalHeight"], errors);
            if (object.width < 4 || object.height < 4) {
                errors.push("Image width and height must be at least 4.");
            }
            if (typeof object.href !== "string" || !object.href.startsWith("data:")) {
                errors.push("Image href must be an embedded data URL.");
            }
            break;
        case OBJECT_TYPE.TEXT:
            validateFiniteFields(object, ["x", "y", "fontSize", "fontWeight", "lineHeight"], errors);
            if (object.fontSize < 1) {
                errors.push("Text font size must be at least 1.");
            }
            if (typeof object.text !== "string") {
                errors.push("Text content must be a string.");
            }
            if (normalizeTextContent(object.text) !== object.text) {
                errors.push("Text content must already be normalized to a single line.");
            }
            if (object.fontFamily !== DEFAULT_FONT_FAMILY) {
                errors.push("Text font family must match the fixed system sans-serif stack.");
            }
            break;
        case OBJECT_TYPE.RECTANGLE:
        case OBJECT_TYPE.ELLIPSE:
            validateFiniteFields(object, ["x", "y", "width", "height", "strokeWidth"], errors);
            if (object.width < 4 || object.height < 4) {
                errors.push("Shape width and height must be at least 4.");
            }
            break;
        case OBJECT_TYPE.LINE:
            validateFiniteFields(object, ["x1", "y1", "x2", "y2", "strokeWidth"], errors);
            if (lineLength(object) < 4) {
                errors.push("Line length must be at least 4.");
            }
            break;
        default:
            errors.push(`Unsupported object type: ${object.type}`);
    }
    const strokeValue = "stroke" in object ? String(object.stroke) : null;
    const fillValue = "fill" in object ? String(object.fill) : null;
    if ("fill" in object && fillValue !== "transparent" && !fillValue.startsWith("#")) {
        errors.push("Fill color must be a hex color or transparent.");
    }
    if ("stroke" in object && !strokeValue.startsWith("#")) {
        errors.push("Stroke color must be a hex color.");
    }
    if ("fill" in object && fillValue !== "transparent" && !fillValue.startsWith("#")) {
        errors.push("Fill color must be a hex color.");
    }
    if ("stroke" in object && !/^#[0-9a-f]{6}$/i.test(strokeValue)) {
        errors.push("Stroke color must be a six-digit hex value.");
    }
    if ("fill" in object && fillValue === "transparent") {
        return errors;
    }
    if ("fill" in object && !/^#[0-9a-f]{6}$/i.test(fillValue)) {
        errors.push("Fill color must be a six-digit hex value.");
    }
    return errors;
}

export function estimateSnapshotBytes(svgString) {
    return byteSizeOfString(svgString);
}

export function validateDraftRecord(record) {
    const errors = [];
    if (!record || typeof record !== "object") {
        return ["Draft record missing."];
    }
    if (record.version !== DOCUMENT_FORMAT_VERSION) {
        errors.push(`Unsupported draft version: ${record.version}`);
    }
    if (!Number.isInteger(record.saveSequence) || record.saveSequence <= 0) {
        errors.push("Draft saveSequence is invalid.");
    }
    if (!record.savedAt || Number.isNaN(Date.parse(record.savedAt))) {
        errors.push("Draft savedAt timestamp is invalid.");
    }
    if (typeof record.svg !== "string" || !record.svg.trim()) {
        errors.push("Draft SVG payload is missing.");
    }
    if (typeof record.lineageId !== "string" || !record.lineageId) {
        errors.push("Draft lineageId is missing.");
    }
    return errors;
}

function validateFiniteFields(object, fields, errors) {
    for (const field of fields) {
        if (!isFiniteNumber(object[field])) {
            errors.push(`${field} must be a finite number.`);
        }
    }
}

function lineLength(line) {
    return Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
}
