type JsZipFolder = {
    file(name: string, data: string | Uint8Array, options?: { binary?: boolean }): void;
};

type JsZipInstance = JsZipFolder & {
    folder(name: string): JsZipFolder;
    generateAsync(options: { type: 'blob' }): Promise<Blob>;
};

type JsZipConstructor = new () => JsZipInstance;

type SessionSnapshotZipInput = {
    markdownFileName: string;
    markdownText: string;
    imageItems: Array<{ fileName: string; dataUrl: string }>;
};

/** Decodes captured image data URLs into binary payloads for ZIP packaging. */
export function dataUrlToUint8Array(dataUrl: string) {
    if (typeof dataUrl !== 'string') {
        throw new Error('Invalid data URL.');
    }
    const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/i);
    if (!match) {
        throw new Error('Invalid data URL.');
    }
    const contentType = match[1] || 'application/octet-stream';
    const payload = match[2] || '';
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return {
        bytes,
        contentType
    };
}

function getJsZipCtor(): JsZipConstructor {
    if (typeof globalThis.JSZip !== 'function') {
        throw new Error('JSZip is unavailable.');
    }
    return globalThis.JSZip as JsZipConstructor;
}

/** Packages the Markdown index and captured images into the downloadable session ZIP. */
export async function buildSessionSnapshotZipBlob(input: SessionSnapshotZipInput) {
    const JSZipCtor = getJsZipCtor();
    const zip = new JSZipCtor();
    zip.file(input.markdownFileName, input.markdownText || '');

    const folder = zip.folder('images');
    const items = Array.isArray(input.imageItems) ? input.imageItems : [];
    for (const item of items) {
        if (!item || typeof item.fileName !== 'string' || typeof item.dataUrl !== 'string') {
            continue;
        }
        const { bytes } = dataUrlToUint8Array(item.dataUrl);
        folder.file(item.fileName, bytes, { binary: true });
    }

    return zip.generateAsync({ type: 'blob' });
}
