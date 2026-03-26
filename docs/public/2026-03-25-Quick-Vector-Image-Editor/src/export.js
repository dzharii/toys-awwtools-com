import { MIME_TYPES, RASTER_EXPORT_LIMITS } from "./constants.js";

export function preflightRasterExport(documentState) {
    const width = documentState.canvas.width;
    const height = documentState.canvas.height;
    const pixels = width * height;
    if (width > RASTER_EXPORT_LIMITS.maxWidth) {
        return {
            ok: false,
            reason: `Canvas width ${width} exceeds the supported limit ${RASTER_EXPORT_LIMITS.maxWidth}.`
        };
    }
    if (height > RASTER_EXPORT_LIMITS.maxHeight) {
        return {
            ok: false,
            reason: `Canvas height ${height} exceeds the supported limit ${RASTER_EXPORT_LIMITS.maxHeight}.`
        };
    }
    if (pixels > RASTER_EXPORT_LIMITS.maxPixels) {
        return {
            ok: false,
            reason: `Canvas pixel count ${pixels} exceeds the supported limit ${RASTER_EXPORT_LIMITS.maxPixels}.`
        };
    }
    return {
        ok: true,
        width,
        height,
        pixels
    };
}

export async function rasterizeSvg(svgString, documentState, mimeType) {
    const preflight = preflightRasterExport(documentState);
    if (!preflight.ok) {
        throw new Error(preflight.reason);
    }
    const svgBlob = new Blob([svgString], { type: MIME_TYPES.SVG });
    const svgUrl = URL.createObjectURL(svgBlob);
    try {
        const image = await loadImage(svgUrl);
        const canvas = globalThis.document.createElement("canvas");
        canvas.width = preflight.width;
        canvas.height = preflight.height;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Canvas 2D context is not available.");
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        const blob = await canvasToBlob(canvas, mimeType, mimeType === MIME_TYPES.JPEG ? 0.92 : undefined);
        if (!blob) {
            throw new Error("Canvas rasterization did not return a Blob.");
        }
        return blob;
    } finally {
        URL.revokeObjectURL(svgUrl);
    }
}

export function canCopyPng() {
    return Boolean(navigator.clipboard?.write && globalThis.ClipboardItem);
}

export async function copyPngBlob(blob) {
    if (!canCopyPng()) {
        throw new Error("Clipboard image write is not supported in this browser.");
    }
    const clipboardItem = new globalThis.ClipboardItem({
        [MIME_TYPES.PNG]: blob
    });
    await navigator.clipboard.write([clipboardItem]);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Browser image decode failed during raster export."));
        image.src = src;
    });
}

function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
    });
}
