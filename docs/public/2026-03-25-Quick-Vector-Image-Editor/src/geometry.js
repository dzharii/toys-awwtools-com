import {
    HANDLE_HIT_SIZE_PX,
    LINE_HIT_CORRIDOR_PX,
    OBJECT_TYPE,
    SELECTION_HANDLE_SIZE_PX
} from "./constants.js";
import { clamp } from "./utils.js";

export function measureTextObject(textObject, measureText) {
    const metrics = measureText(textObject);
    const ascent = metrics.actualBoundingBoxAscent ?? (textObject.fontSize * 0.82);
    const descent = metrics.actualBoundingBoxDescent ?? (textObject.fontSize * 0.22);
    return {
        x: textObject.x,
        y: textObject.y - ascent,
        width: Math.max(metrics.width ?? fallbackTextWidth(textObject), 1),
        height: ascent + descent,
        ascent,
        descent
    };
}

export function getObjectBounds(object, measureText) {
    if (object.type === OBJECT_TYPE.LINE) {
        return {
            x: Math.min(object.x1, object.x2),
            y: Math.min(object.y1, object.y2),
            width: Math.abs(object.x2 - object.x1),
            height: Math.abs(object.y2 - object.y1)
        };
    }
    if (object.type === OBJECT_TYPE.TEXT) {
        return measureTextObject(object, measureText);
    }
    return {
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height
    };
}

export function getHitCandidates(document, point, options) {
    const candidates = [];
    for (let index = document.objects.length - 1; index >= 0; index -= 1) {
        const object = document.objects[index];
        if (isPointInsideObject(point, object, options)) {
            candidates.push(object);
        }
    }
    return candidates;
}

export function isPointInsideObject(point, object, { scale, measureText }) {
    if (object.type === OBJECT_TYPE.IMAGE || object.type === OBJECT_TYPE.RECTANGLE) {
        return point.x >= object.x && point.x <= object.x + object.width && point.y >= object.y && point.y <= object.y + object.height;
    }
    if (object.type === OBJECT_TYPE.ELLIPSE) {
        const radiusX = object.width / 2;
        const radiusY = object.height / 2;
        const centerX = object.x + radiusX;
        const centerY = object.y + radiusY;
        if (radiusX <= 0 || radiusY <= 0) {
            return false;
        }
        const normalized = (((point.x - centerX) ** 2) / (radiusX ** 2)) + (((point.y - centerY) ** 2) / (radiusY ** 2));
        return normalized <= 1;
    }
    if (object.type === OBJECT_TYPE.TEXT) {
        const bounds = measureTextObject(object, measureText);
        return point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;
    }
    if (object.type === OBJECT_TYPE.LINE) {
        const corridor = Math.max(object.strokeWidth / 2, LINE_HIT_CORRIDOR_PX / (2 * scale));
        return distancePointToSegment(point, { x: object.x1, y: object.y1 }, { x: object.x2, y: object.y2 }) <= corridor;
    }
    return false;
}

export function getSelectionHandles(object, viewport, measureText) {
    if (!object) {
        return [];
    }
    if (object.type === OBJECT_TYPE.LINE) {
        return [
            {
                name: "start",
                x: viewport.panX + (object.x1 * viewport.scale),
                y: viewport.panY + (object.y1 * viewport.scale)
            },
            {
                name: "end",
                x: viewport.panX + (object.x2 * viewport.scale),
                y: viewport.panY + (object.y2 * viewport.scale)
            }
        ];
    }
    if (object.type === OBJECT_TYPE.TEXT) {
        return [];
    }
    const bounds = getObjectBounds(object, measureText);
    const left = viewport.panX + (bounds.x * viewport.scale);
    const top = viewport.panY + (bounds.y * viewport.scale);
    const right = left + (bounds.width * viewport.scale);
    const bottom = top + (bounds.height * viewport.scale);
    return [
        { name: "nw", x: left, y: top },
        { name: "ne", x: right, y: top },
        { name: "se", x: right, y: bottom },
        { name: "sw", x: left, y: bottom }
    ];
}

export function findHandleAtPoint(handles, screenPoint) {
    const radius = HANDLE_HIT_SIZE_PX / 2;
    return handles.find((handle) => Math.abs(handle.x - screenPoint.x) <= radius && Math.abs(handle.y - screenPoint.y) <= radius) ?? null;
}

export function resizeObjectFromHandle(object, handleName, point) {
    if (object.type === OBJECT_TYPE.LINE) {
        return resizeLineEndpoint(object, handleName, point);
    }
    if (object.type === OBJECT_TYPE.IMAGE) {
        return resizeImageFromCorner(object, handleName, point);
    }
    if (object.type === OBJECT_TYPE.RECTANGLE || object.type === OBJECT_TYPE.ELLIPSE) {
        return resizeBoxObject(object, handleName, point);
    }
    return object;
}

export function moveObjectPreview(object, dx, dy) {
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
}

export function objectExceedsCanvas(object, canvas, measureText) {
    const bounds = getObjectBounds(object, measureText);
    return bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > canvas.width || bounds.y + bounds.height > canvas.height;
}

export function getSelectionOutline(object, viewport, measureText) {
    if (!object) {
        return null;
    }
    if (object.type === OBJECT_TYPE.LINE) {
        return {
            type: "line",
            x1: viewport.panX + (object.x1 * viewport.scale),
            y1: viewport.panY + (object.y1 * viewport.scale),
            x2: viewport.panX + (object.x2 * viewport.scale),
            y2: viewport.panY + (object.y2 * viewport.scale)
        };
    }
    const bounds = getObjectBounds(object, measureText);
    return {
        type: "rect",
        x: viewport.panX + (bounds.x * viewport.scale),
        y: viewport.panY + (bounds.y * viewport.scale),
        width: bounds.width * viewport.scale,
        height: bounds.height * viewport.scale
    };
}

export function getHandleMarkup(handles) {
    return handles
        .map((handle) => `<rect x="${handle.x - (SELECTION_HANDLE_SIZE_PX / 2)}" y="${handle.y - (SELECTION_HANDLE_SIZE_PX / 2)}" width="${SELECTION_HANDLE_SIZE_PX}" height="${SELECTION_HANDLE_SIZE_PX}" rx="3" fill="#ffffff" stroke="#006e52" stroke-width="1.5" />`)
        .join("");
}

function resizeBoxObject(object, handleName, point) {
    const minWidth = 4;
    const minHeight = 4;
    const left = object.x;
    const top = object.y;
    const right = object.x + object.width;
    const bottom = object.y + object.height;
    if (handleName === "nw") {
        const nextLeft = Math.min(point.x, right - minWidth);
        const nextTop = Math.min(point.y, bottom - minHeight);
        return { ...object, x: nextLeft, y: nextTop, width: right - nextLeft, height: bottom - nextTop };
    }
    if (handleName === "ne") {
        const nextRight = Math.max(point.x, left + minWidth);
        const nextTop = Math.min(point.y, bottom - minHeight);
        return { ...object, y: nextTop, width: nextRight - left, height: bottom - nextTop };
    }
    if (handleName === "se") {
        const nextRight = Math.max(point.x, left + minWidth);
        const nextBottom = Math.max(point.y, top + minHeight);
        return { ...object, width: nextRight - left, height: nextBottom - top };
    }
    const nextLeft = Math.min(point.x, right - minWidth);
    const nextBottom = Math.max(point.y, top + minHeight);
    return { ...object, x: nextLeft, width: right - nextLeft, height: nextBottom - top };
}

function resizeImageFromCorner(object, handleName, point) {
    const aspectRatio = object.width / object.height;
    const corners = {
        nw: { anchorX: object.x + object.width, anchorY: object.y + object.height, horizontal: -1, vertical: -1 },
        ne: { anchorX: object.x, anchorY: object.y + object.height, horizontal: 1, vertical: -1 },
        se: { anchorX: object.x, anchorY: object.y, horizontal: 1, vertical: 1 },
        sw: { anchorX: object.x + object.width, anchorY: object.y, horizontal: -1, vertical: 1 }
    };
    const corner = corners[handleName];
    const dx = Math.abs(point.x - corner.anchorX);
    const dy = Math.abs(point.y - corner.anchorY);
    const width = Math.max(4, dx, dy * aspectRatio);
    const height = Math.max(4, width / aspectRatio);
    const x = corner.horizontal > 0 ? corner.anchorX : corner.anchorX - width;
    const y = corner.vertical > 0 ? corner.anchorY : corner.anchorY - height;
    return {
        ...object,
        x,
        y,
        width,
        height
    };
}

function resizeLineEndpoint(object, handleName, point) {
    const anchor = handleName === "start"
        ? { x: object.x2, y: object.y2 }
        : { x: object.x1, y: object.y1 };
    let target = { ...point };
    const dx = point.x - anchor.x;
    const dy = point.y - anchor.y;
    const length = Math.hypot(dx, dy);
    if (length < 4) {
        const safeDx = length === 0 ? 4 : (dx / length) * 4;
        const safeDy = length === 0 ? 0 : (dy / length) * 4;
        target = {
            x: anchor.x + safeDx,
            y: anchor.y + safeDy
        };
    }
    if (handleName === "start") {
        return {
            ...object,
            x1: target.x,
            y1: target.y
        };
    }
    return {
        ...object,
        x2: target.x,
        y2: target.y
    };
}

function distancePointToSegment(point, start, end) {
    const lengthSquared = ((end.x - start.x) ** 2) + ((end.y - start.y) ** 2);
    if (lengthSquared === 0) {
        return Math.hypot(point.x - start.x, point.y - start.y);
    }
    const t = clamp((((point.x - start.x) * (end.x - start.x)) + ((point.y - start.y) * (end.y - start.y))) / lengthSquared, 0, 1);
    const projection = {
        x: start.x + (t * (end.x - start.x)),
        y: start.y + (t * (end.y - start.y))
    };
    return Math.hypot(point.x - projection.x, point.y - projection.y);
}

function fallbackTextWidth(textObject) {
    return Math.max(12, textObject.text.length * textObject.fontSize * 0.62);
}
