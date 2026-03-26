import {
    APP_ID,
    DEFAULT_CANVAS,
    DEFAULT_GEOMETRY,
    DEFAULT_STYLES,
    DOCUMENT_FORMAT_VERSION,
    IMAGE_FIT_RATIO,
    INSERTION_BASE,
    INSERTION_STEP,
    OBJECT_TYPE
} from "./constants.js";
import { clone, createLineageId } from "./utils.js";

export function createEmptyDocument() {
    return {
        version: DOCUMENT_FORMAT_VERSION,
        appId: APP_ID,
        canvas: clone(DEFAULT_CANVAS),
        objects: [],
        metadata: {
            lineageId: createLineageId(),
            nextObjectNumber: 1,
            insertionCursor: 0,
            createdAt: Date.now()
        }
    };
}

export function cloneDocument(document) {
    return clone(document);
}

export function documentHasContent(document) {
    return document.objects.length > 0;
}

export function resetInsertionCursor(document) {
    document.metadata.insertionCursor = 0;
}

export function getNextInsertionPoint(document) {
    const offset = document.metadata.insertionCursor ?? 0;
    return {
        x: INSERTION_BASE + (offset * INSERTION_STEP),
        y: INSERTION_BASE + (offset * INSERTION_STEP)
    };
}

export function consumeInsertionCursor(document) {
    document.metadata.insertionCursor = (document.metadata.insertionCursor ?? 0) + 1;
}

export function allocateObjectId(document) {
    const objectId = `obj-${document.metadata.nextObjectNumber}`;
    document.metadata.nextObjectNumber += 1;
    return objectId;
}

export function createImageObject(document, imageData) {
    const point = getNextInsertionPoint(document);
    const maxWidth = document.canvas.width * IMAGE_FIT_RATIO;
    const maxHeight = document.canvas.height * IMAGE_FIT_RATIO;
    const scale = Math.min(1, maxWidth / imageData.naturalWidth, maxHeight / imageData.naturalHeight);
    const width = imageData.naturalWidth * scale;
    const height = imageData.naturalHeight * scale;
    consumeInsertionCursor(document);
    return {
        id: allocateObjectId(document),
        type: OBJECT_TYPE.IMAGE,
        x: point.x,
        y: point.y,
        width,
        height,
        href: imageData.href,
        naturalWidth: imageData.naturalWidth,
        naturalHeight: imageData.naturalHeight
    };
}

export function createTextObject(document, point = null) {
    const insertionPoint = point ?? getNextInsertionPoint(document);
    consumeInsertionCursor(document);
    return {
        id: allocateObjectId(document),
        type: OBJECT_TYPE.TEXT,
        x: insertionPoint.x,
        y: insertionPoint.y + DEFAULT_STYLES.text.fontSize,
        text: "Text",
        fontSize: DEFAULT_STYLES.text.fontSize,
        fontWeight: DEFAULT_STYLES.text.fontWeight,
        fill: DEFAULT_STYLES.text.fill,
        fontFamily: DEFAULT_STYLES.text.fontFamily,
        lineHeight: DEFAULT_STYLES.text.lineHeight,
        textAlign: DEFAULT_STYLES.text.textAlign
    };
}

export function createRectangleObject(document, point = null) {
    const insertionPoint = point ?? getNextInsertionPoint(document);
    consumeInsertionCursor(document);
    return {
        id: allocateObjectId(document),
        type: OBJECT_TYPE.RECTANGLE,
        x: insertionPoint.x,
        y: insertionPoint.y,
        width: DEFAULT_GEOMETRY.rectangle.width,
        height: DEFAULT_GEOMETRY.rectangle.height,
        stroke: DEFAULT_STYLES.rectangle.stroke,
        strokeWidth: DEFAULT_STYLES.rectangle.strokeWidth,
        fill: DEFAULT_STYLES.rectangle.fill
    };
}

export function createEllipseObject(document, point = null) {
    const insertionPoint = point ?? getNextInsertionPoint(document);
    consumeInsertionCursor(document);
    return {
        id: allocateObjectId(document),
        type: OBJECT_TYPE.ELLIPSE,
        x: insertionPoint.x,
        y: insertionPoint.y,
        width: DEFAULT_GEOMETRY.ellipse.width,
        height: DEFAULT_GEOMETRY.ellipse.height,
        stroke: DEFAULT_STYLES.ellipse.stroke,
        strokeWidth: DEFAULT_STYLES.ellipse.strokeWidth,
        fill: DEFAULT_STYLES.ellipse.fill
    };
}

export function createLineObject(document, point = null) {
    const insertionPoint = point ?? getNextInsertionPoint(document);
    consumeInsertionCursor(document);
    return {
        id: allocateObjectId(document),
        type: OBJECT_TYPE.LINE,
        x1: insertionPoint.x,
        y1: insertionPoint.y,
        x2: insertionPoint.x + DEFAULT_GEOMETRY.line.length,
        y2: insertionPoint.y,
        stroke: DEFAULT_STYLES.line.stroke,
        strokeWidth: DEFAULT_STYLES.line.strokeWidth
    };
}
