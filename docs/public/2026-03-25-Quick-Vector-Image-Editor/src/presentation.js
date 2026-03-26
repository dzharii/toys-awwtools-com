import { OBJECT_TYPE, TOOL } from "./constants.js";
import { measureTextObject } from "./geometry.js";
import { escapeXml, round } from "./utils.js";

export function getContextualHint({ tool, selectedObject, isTextEditing }) {
    if (isTextEditing) {
        return "Editing text. Press Enter to commit or Escape to cancel.";
    }
    if (selectedObject?.type === OBJECT_TYPE.TEXT) {
        return "Selected text does not resize by handles. Use Font Size to change text size.";
    }
    if (tool === TOOL.TEXT) {
        return "Click the canvas to add text. Text size is controlled by Font Size.";
    }
    if (tool === TOOL.SELECT) {
        return "Space plus drag pans. Alt or Option plus click cycles covered objects.";
    }
    return "Space plus drag pans. Use Ctrl or Cmd plus wheel, or the zoom controls, to adjust zoom.";
}

export function getTextUiMetrics(textObject, measureText) {
    const bounds = measureTextObject(textObject, measureText);
    return {
        left: round(bounds.x, 2),
        top: round(bounds.y, 2),
        width: round(bounds.width, 2),
        height: round(bounds.height, 2),
        ascent: bounds.ascent
    };
}

export function getTextUiPatch(textObject, field, value, measureText) {
    const metrics = measureTextObject(textObject, measureText);
    if (field === "left") {
        return { x: value };
    }
    if (field === "top") {
        return { y: value + metrics.ascent };
    }
    return {
        [field]: value
    };
}

export function renderDocumentInspectorMarkup({ documentState, summary }) {
    return `
        <div class="inspector-group inspector-group-primary">
            <h3>Canvas</h3>
            <div class="field-grid">
                <div class="field">
                    <label for="canvas-width-input">Width</label>
                    <input id="canvas-width-input" data-field="canvas-width" type="number" min="1" step="1" value="${escapeXml(String(documentState.canvas.width))}">
                </div>
                <div class="field">
                    <label for="canvas-height-input">Height</label>
                    <input id="canvas-height-input" data-field="canvas-height" type="number" min="1" step="1" value="${escapeXml(String(documentState.canvas.height))}">
                </div>
            </div>
            <div class="field-grid field-grid-single">
                <div class="field">
                    <label for="canvas-background-input">Background</label>
                    <input id="canvas-background-input" data-field="canvas-background" type="text" value="${escapeXml(documentState.canvas.background)}">
                </div>
            </div>
            <div class="action-row">
                <button type="button" data-action="apply-canvas">Apply Canvas Size</button>
                <button type="button" data-action="fit-canvas">Fit Canvas</button>
            </div>
        </div>
        <details class="inspector-group inspector-details">
            <summary>Diagnostics</summary>
            <div class="meta-list">
                <div>Objects: ${summary.objectCount}</div>
                <div>Canvas: ${summary.canvas.width} x ${summary.canvas.height}</div>
                <div>Origin: ${escapeXml(summary.documentOriginText)}</div>
                <div>Lineage: ${escapeXml(summary.lineageId)}</div>
                <div>Latest committed save sequence: ${summary.latestCommittedSaveSequence}</div>
            </div>
        </details>
    `;
}

export function renderObjectInspectorMarkup({ object, measureText }) {
    const sharedActions = `
        <div class="inspector-group inspector-group-secondary">
            <h3>Layer</h3>
            <div class="action-row">
                <button type="button" data-action="send-to-back">To Back</button>
                <button type="button" data-action="send-backward">Backward</button>
                <button type="button" data-action="bring-forward">Forward</button>
                <button type="button" data-action="bring-to-front">To Front</button>
            </div>
        </div>
        <div class="inspector-group inspector-group-secondary">
            <h3>Actions</h3>
            <div class="action-row">
                <button type="button" data-action="copy-selection">Copy</button>
                <button type="button" data-action="cut-selection">Cut</button>
                <button type="button" data-action="delete-selection" class="danger-button">Delete</button>
            </div>
        </div>
    `;
    if (object.type === OBJECT_TYPE.TEXT) {
        const textMetrics = getTextUiMetrics(object, measureText);
        return `
            <div class="inspector-group inspector-group-primary">
                <h3>Text</h3>
                <div class="field-grid field-grid-single">
                    <div class="field">
                        <label for="text-content-input">Content</label>
                        <input id="text-content-input" data-field="text" type="text" value="${escapeXml(object.text)}">
                    </div>
                </div>
                <div class="field-grid">
                    <div class="field">
                        <label for="text-font-size-input">Font Size</label>
                        <input id="text-font-size-input" data-field="fontSize" type="number" min="1" step="1" value="${round(object.fontSize, 2)}">
                    </div>
                    <div class="field">
                        <label for="text-font-weight-input">Font Weight</label>
                        <input id="text-font-weight-input" data-field="fontWeight" type="number" min="100" max="900" step="100" value="${round(object.fontWeight, 0)}">
                    </div>
                    <div class="field">
                        <label for="text-left-input">Left</label>
                        <input id="text-left-input" data-field="left" type="number" step="1" value="${textMetrics.left}">
                    </div>
                    <div class="field">
                        <label for="text-top-input">Top</label>
                        <input id="text-top-input" data-field="top" type="number" step="1" value="${textMetrics.top}">
                    </div>
                    <div class="field">
                        <label for="text-fill-input">Fill</label>
                        <input id="text-fill-input" data-field="fill" type="text" value="${escapeXml(object.fill)}">
                    </div>
                </div>
                <p class="help-text">Resize text through Font Size. Text selection does not show resize handles.</p>
                <div class="action-row">
                    <button type="button" data-action="edit-text">Edit On Canvas</button>
                </div>
            </div>
            ${sharedActions}
        `;
    }
    if (object.type === OBJECT_TYPE.LINE) {
        return `
            <div class="inspector-group inspector-group-primary">
                <h3>Line</h3>
                <div class="field-grid">
                    <div class="field">
                        <label for="line-x1-input">X1</label>
                        <input id="line-x1-input" data-field="x1" type="number" step="1" value="${round(object.x1, 2)}">
                    </div>
                    <div class="field">
                        <label for="line-y1-input">Y1</label>
                        <input id="line-y1-input" data-field="y1" type="number" step="1" value="${round(object.y1, 2)}">
                    </div>
                    <div class="field">
                        <label for="line-x2-input">X2</label>
                        <input id="line-x2-input" data-field="x2" type="number" step="1" value="${round(object.x2, 2)}">
                    </div>
                    <div class="field">
                        <label for="line-y2-input">Y2</label>
                        <input id="line-y2-input" data-field="y2" type="number" step="1" value="${round(object.y2, 2)}">
                    </div>
                    <div class="field">
                        <label for="line-stroke-width-input">Stroke Width</label>
                        <input id="line-stroke-width-input" data-field="strokeWidth" type="number" min="1" step="1" value="${round(object.strokeWidth, 2)}">
                    </div>
                    <div class="field">
                        <label for="line-stroke-input">Stroke</label>
                        <input id="line-stroke-input" data-field="stroke" type="text" value="${escapeXml(object.stroke)}">
                    </div>
                </div>
            </div>
            ${sharedActions}
        `;
    }
    const isImage = object.type === OBJECT_TYPE.IMAGE;
    const objectTitle = isImage ? "Image" : object.type === OBJECT_TYPE.RECTANGLE ? "Rectangle" : "Ellipse";
    return `
        <div class="inspector-group inspector-group-primary">
            <h3>${objectTitle}</h3>
            <div class="field-grid">
                <div class="field">
                    <label for="object-x-input">X</label>
                    <input id="object-x-input" data-field="x" type="number" step="1" value="${round(object.x, 2)}">
                </div>
                <div class="field">
                    <label for="object-y-input">Y</label>
                    <input id="object-y-input" data-field="y" type="number" step="1" value="${round(object.y, 2)}">
                </div>
                <div class="field">
                    <label for="object-width-input">Width</label>
                    <input id="object-width-input" data-field="width" type="number" min="4" step="1" value="${round(object.width, 2)}">
                </div>
                <div class="field">
                    <label for="object-height-input">Height</label>
                    <input id="object-height-input" data-field="height" type="number" min="4" step="1" value="${round(object.height, 2)}">
                </div>
                ${isImage ? "" : `
                    <div class="field">
                        <label for="object-stroke-width-input">Stroke Width</label>
                        <input id="object-stroke-width-input" data-field="strokeWidth" type="number" min="1" step="1" value="${round(object.strokeWidth, 2)}">
                    </div>
                    <div class="field">
                        <label for="object-stroke-input">Stroke</label>
                        <input id="object-stroke-input" data-field="stroke" type="text" value="${escapeXml(object.stroke)}">
                    </div>
                    <div class="field">
                        <label for="object-fill-input">Fill</label>
                        <input id="object-fill-input" data-field="fill" type="text" value="${escapeXml(object.fill)}">
                    </div>
                `}
            </div>
            ${isImage ? `<p class="help-text">Natural size: ${round(object.naturalWidth, 0)} x ${round(object.naturalHeight, 0)}</p>` : ""}
        </div>
        ${sharedActions}
    `;
}
