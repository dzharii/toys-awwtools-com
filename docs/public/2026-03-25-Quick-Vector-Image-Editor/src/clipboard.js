import {
    APP_ID,
    CLIPBOARD_MIME_TYPES,
    DOCUMENT_FORMAT_VERSION,
    INSERTION_STEP,
    MIME_TYPES,
    OBJECT_TYPE,
    SUPPORTED_IMAGE_MIME_TYPES
} from "./constants.js";
import { allocateObjectId, cloneDocument } from "./document.js";
import { readBlobAsText } from "./utils.js";

export function canReadClipboardItems() {
    return Boolean(navigator.clipboard?.read);
}

export function canReadClipboardText() {
    return Boolean(navigator.clipboard?.readText);
}

export function canWriteClipboardItems() {
    return Boolean(navigator.clipboard?.write && globalThis.ClipboardItem);
}

export function canWriteClipboardText() {
    return Boolean(navigator.clipboard?.writeText);
}

export function canReadClipboard() {
    return canReadClipboardItems() || canReadClipboardText();
}

export function canWriteClipboard() {
    return canWriteClipboardItems() || canWriteClipboardText();
}

export function serializeInternalObjectPayload(object) {
    return JSON.stringify({
        appId: APP_ID,
        version: DOCUMENT_FORMAT_VERSION,
        kind: "object",
        object
    });
}

export function parseInternalObjectPayload(value) {
    const parsed = JSON.parse(String(value));
    if (parsed.appId !== APP_ID || parsed.kind !== "object" || !parsed.object || typeof parsed.object !== "object") {
        throw new Error("Clipboard payload is not a supported editor object payload.");
    }
    return parsed.object;
}

export function detectTextClipboardKind(text) {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) {
        return "empty";
    }
    if (/^<svg\b/i.test(trimmed)) {
        return trimmed.includes(`data-ve-app="${APP_ID}"`)
            ? "editor-svg-document"
            : "generic-svg";
    }
    return "text";
}

export function cloneObjectForPaste(documentState, object, offset = INSERTION_STEP) {
    const nextDocument = cloneDocument(documentState);
    const nextObject = structuredClone(object);
    nextObject.id = allocateObjectId(nextDocument);
    if (nextObject.type === OBJECT_TYPE.LINE) {
        nextObject.x1 += offset;
        nextObject.y1 += offset;
        nextObject.x2 += offset;
        nextObject.y2 += offset;
    } else {
        nextObject.x += offset;
        nextObject.y += offset;
    }
    nextDocument.objects.push(nextObject);
    return {
        document: nextDocument,
        object: nextObject
    };
}

export async function writeInternalObjectToClipboard(object) {
    const payload = serializeInternalObjectPayload(object);
    let systemWritten = false;
    if (canWriteClipboardItems()) {
        const itemData = {
            [CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT]: new Blob([payload], { type: CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT })
        };
        if (object.type === OBJECT_TYPE.TEXT) {
            itemData[CLIPBOARD_MIME_TYPES.TEXT] = new Blob([object.text], { type: CLIPBOARD_MIME_TYPES.TEXT });
        }
        const clipboardItem = new globalThis.ClipboardItem(itemData);
        await navigator.clipboard.write([clipboardItem]);
        systemWritten = true;
    } else if (object.type === OBJECT_TYPE.TEXT && canWriteClipboardText()) {
        await navigator.clipboard.writeText(object.text);
        systemWritten = true;
    }
    return {
        systemWritten,
        payload
    };
}

export function writeInternalObjectToDataTransfer(dataTransfer, object) {
    const payload = serializeInternalObjectPayload(object);
    dataTransfer.setData(CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT, payload);
    if (object.type === OBJECT_TYPE.TEXT) {
        dataTransfer.setData(CLIPBOARD_MIME_TYPES.TEXT, object.text);
    }
    return payload;
}

export async function writeSvgToClipboard(svgString) {
    if (canWriteClipboardItems()) {
        const clipboardItem = new globalThis.ClipboardItem({
            [MIME_TYPES.SVG]: new Blob([svgString], { type: MIME_TYPES.SVG }),
            [CLIPBOARD_MIME_TYPES.TEXT]: new Blob([svgString], { type: CLIPBOARD_MIME_TYPES.TEXT })
        });
        await navigator.clipboard.write([clipboardItem]);
        return {
            systemWritten: true
        };
    }
    if (canWriteClipboardText()) {
        await navigator.clipboard.writeText(svgString);
        return {
            systemWritten: true
        };
    }
    throw new Error("Clipboard text write is not supported in this browser.");
}

export async function readClipboardPayload() {
    if (canReadClipboardItems()) {
        const items = await navigator.clipboard.read();
        return readClipboardPayloadFromItems(items);
    }
    if (canReadClipboardText()) {
        const text = await navigator.clipboard.readText();
        return classifyTextPayload(text);
    }
    throw new Error("Clipboard read is not supported in this browser.");
}

export async function readClipboardPayloadFromItems(items) {
    for (const item of items) {
        if (item.types.includes(CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT)) {
            const blob = await item.getType(CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT);
            return {
                kind: "internal-object",
                object: parseInternalObjectPayload(await readBlobAsText(blob))
            };
        }
    }
    for (const item of items) {
        if (item.types.includes(MIME_TYPES.SVG)) {
            const blob = await item.getType(MIME_TYPES.SVG);
            return classifyTextPayload(await readBlobAsText(blob));
        }
    }
    for (const item of items) {
        const imageType = item.types.find((type) => SUPPORTED_IMAGE_MIME_TYPES.has(type));
        if (imageType) {
            const blob = await item.getType(imageType);
            return {
                kind: "image",
                blob,
                mimeType: imageType
            };
        }
    }
    for (const item of items) {
        if (item.types.includes(CLIPBOARD_MIME_TYPES.TEXT)) {
            const blob = await item.getType(CLIPBOARD_MIME_TYPES.TEXT);
            return classifyTextPayload(await readBlobAsText(blob));
        }
    }
    return null;
}

export async function readClipboardPayloadFromDataTransfer(dataTransfer) {
    if (!dataTransfer) {
        return null;
    }
    if (dataTransfer.types.includes(CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT)) {
        return {
            kind: "internal-object",
            object: parseInternalObjectPayload(dataTransfer.getData(CLIPBOARD_MIME_TYPES.INTERNAL_OBJECT))
        };
    }
    const imageItem = [...(dataTransfer.items ?? [])].find((item) => SUPPORTED_IMAGE_MIME_TYPES.has(item.type));
    if (imageItem) {
        const blob = imageItem.getAsFile();
        if (blob) {
            return {
                kind: "image",
                blob,
                mimeType: blob.type
            };
        }
    }
    const svgData = dataTransfer.getData(MIME_TYPES.SVG);
    if (svgData) {
        return classifyTextPayload(svgData);
    }
    const textData = dataTransfer.getData(CLIPBOARD_MIME_TYPES.TEXT);
    if (textData) {
        return classifyTextPayload(textData);
    }
    return null;
}

function classifyTextPayload(text) {
    const kind = detectTextClipboardKind(text);
    if (kind === "editor-svg-document") {
        return {
            kind,
            svgString: text
        };
    }
    if (kind === "generic-svg") {
        return {
            kind,
            svgString: text
        };
    }
    if (kind === "text") {
        return {
            kind,
            text
        };
    }
    return null;
}
