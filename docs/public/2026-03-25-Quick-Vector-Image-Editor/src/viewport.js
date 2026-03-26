import {
    VIEWPORT_PADDING,
    VIEWPORT_SCALE_MAX,
    VIEWPORT_SCALE_MIN
} from "./constants.js";
import { clamp } from "./utils.js";

export function createViewportState() {
    return {
        scale: 1,
        panX: VIEWPORT_PADDING,
        panY: VIEWPORT_PADDING,
        width: 0,
        height: 0
    };
}

export function screenToDocument(viewport, screenPoint) {
    return {
        x: (screenPoint.x - viewport.panX) / viewport.scale,
        y: (screenPoint.y - viewport.panY) / viewport.scale
    };
}

export function documentToScreen(viewport, documentPoint) {
    return {
        x: viewport.panX + (documentPoint.x * viewport.scale),
        y: viewport.panY + (documentPoint.y * viewport.scale)
    };
}

export function fitViewportToCanvas(viewport, canvas) {
    const next = { ...viewport };
    if (!viewport.width || !viewport.height) {
        return next;
    }
    const availableWidth = Math.max(1, viewport.width - (VIEWPORT_PADDING * 2));
    const availableHeight = Math.max(1, viewport.height - (VIEWPORT_PADDING * 2));
    const fitScale = Math.min(1, availableWidth / canvas.width, availableHeight / canvas.height);
    next.scale = clamp(fitScale, VIEWPORT_SCALE_MIN, VIEWPORT_SCALE_MAX);
    next.panX = (viewport.width - (canvas.width * next.scale)) / 2;
    next.panY = (viewport.height - (canvas.height * next.scale)) / 2;
    return next;
}

export function zoomAroundViewportCenter(viewport, canvas, nextScale) {
    const clampedScale = clamp(nextScale, VIEWPORT_SCALE_MIN, VIEWPORT_SCALE_MAX);
    const centerScreen = {
        x: viewport.width / 2,
        y: viewport.height / 2
    };
    const centerDocument = screenToDocument(viewport, centerScreen);
    return {
        ...viewport,
        scale: clampedScale,
        panX: centerScreen.x - (centerDocument.x * clampedScale),
        panY: centerScreen.y - (centerDocument.y * clampedScale)
    };
}

export function panViewport(viewport, dx, dy) {
    return {
        ...viewport,
        panX: viewport.panX + dx,
        panY: viewport.panY + dy
    };
}
