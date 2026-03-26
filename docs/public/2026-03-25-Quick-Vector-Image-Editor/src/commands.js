import { OBJECT_TYPE } from "./constants.js";
import {
    cloneDocument,
    createEllipseObject,
    createImageObject,
    createLineObject,
    createRectangleObject,
    createTextObject,
    resetInsertionCursor
} from "./document.js";
import { clamp } from "./utils.js";

export function addImage(document, imageData) {
    const next = cloneDocument(document);
    next.objects.push(createImageObject(next, imageData));
    return next;
}

export function addText(document, point) {
    const next = cloneDocument(document);
    next.objects.push(createTextObject(next, point));
    return next;
}

export function addRectangle(document, point) {
    const next = cloneDocument(document);
    next.objects.push(createRectangleObject(next, point));
    return next;
}

export function addEllipse(document, point) {
    const next = cloneDocument(document);
    next.objects.push(createEllipseObject(next, point));
    return next;
}

export function addLine(document, point) {
    const next = cloneDocument(document);
    next.objects.push(createLineObject(next, point));
    return next;
}

export function updateObject(document, objectId, updater) {
    const next = cloneDocument(document);
    const index = next.objects.findIndex((object) => object.id === objectId);
    if (index < 0) {
        return next;
    }
    next.objects[index] = updater(next.objects[index]);
    return next;
}

export function moveObject(document, objectId, dx, dy) {
    const next = updateObject(document, objectId, (object) => {
        if (object.type === OBJECT_TYPE.LINE) {
            return {
                ...object,
                x1: object.x1 + dx,
                y1: object.y1 + dy,
                x2: object.x2 + dx,
                y2: object.y2 + dy
            };
        }
        return {
            ...object,
            x: object.x + dx,
            y: object.y + dy
        };
    });
    resetInsertionCursor(next);
    return next;
}

export function deleteObject(document, objectId) {
    const next = cloneDocument(document);
    next.objects = next.objects.filter((object) => object.id !== objectId);
    return next;
}

export function reorderObject(document, objectId, action) {
    const next = cloneDocument(document);
    const index = next.objects.findIndex((object) => object.id === objectId);
    if (index < 0) {
        return next;
    }
    const [object] = next.objects.splice(index, 1);
    let targetIndex = index;
    if (action === "bring-forward") {
        targetIndex = clamp(index + 1, 0, next.objects.length);
    } else if (action === "send-backward") {
        targetIndex = clamp(index - 1, 0, next.objects.length);
    } else if (action === "bring-to-front") {
        targetIndex = next.objects.length;
    } else if (action === "send-to-back") {
        targetIndex = 0;
    }
    next.objects.splice(targetIndex, 0, object);
    return next;
}

export function setCanvasSize(document, width, height) {
    const next = cloneDocument(document);
    next.canvas.width = width;
    next.canvas.height = height;
    return next;
}

export function patchObject(document, objectId, patch) {
    return updateObject(document, objectId, (object) => ({
        ...object,
        ...patch
    }));
}
