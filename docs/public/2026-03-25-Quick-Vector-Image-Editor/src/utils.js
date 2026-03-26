export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function round(value, digits = 3) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

export function byteSizeOfString(text) {
    return new TextEncoder().encode(text).length;
}

export function escapeXml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

export function unescapeXml(value) {
    return String(value)
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&apos;", "'")
        .replaceAll("&amp;", "&");
}

export function ensureHexColor(value, fallback = "#111111") {
    if (typeof value !== "string") {
        return fallback;
    }
    const normalized = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
        return normalized.toLowerCase();
    }
    if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
        const [r, g, b] = normalized.slice(1).split("");
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    if (normalized === "transparent") {
        return "transparent";
    }
    return fallback;
}

export function formatTimestamp(value) {
    if (!value) {
        return "n/a";
    }
    try {
        return new Date(value).toLocaleString();
    } catch {
        return String(value);
    }
}

export function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "unknown";
    }
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unit = units[0];
    for (let index = 1; index < units.length && value >= 1024; index += 1) {
        value /= 1024;
        unit = units[index];
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

export function nowIso() {
    return new Date().toISOString();
}

export function createLineageId() {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `lineage-${Date.now().toString(36)}-${randomPart}`;
}

export function clone(value) {
    return structuredClone(value);
}

export function isInputLikeElement(element) {
    if (!(element instanceof Element)) {
        return false;
    }
    return Boolean(element.closest("input, textarea, select, [contenteditable='true']"));
}

export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read file as text."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsText(file);
    });
}

export function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read file as data URL."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(file);
    });
}

export function readBlobAsDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read Blob as data URL."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(blob);
    });
}

export function readBlobAsText(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read Blob as text."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsText(blob);
    });
}

export function loadImageDimensions(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight
            });
        };
        image.onerror = () => reject(new Error("Image decode failed."));
        image.src = src;
    });
}

export function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function createDeferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolveFn, rejectFn) => {
        resolve = resolveFn;
        reject = rejectFn;
    });
    return { promise, resolve, reject };
}
