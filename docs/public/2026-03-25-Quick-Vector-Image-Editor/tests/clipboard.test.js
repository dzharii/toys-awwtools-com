import test from "node:test";
import assert from "node:assert/strict";

import { OBJECT_TYPE } from "../src/constants.js";
import { addRectangle } from "../src/commands.js";
import { createEmptyDocument } from "../src/document.js";
import {
    cloneObjectForPaste,
    detectTextClipboardKind,
    parseInternalObjectPayload,
    serializeInternalObjectPayload,
    writeInternalObjectToDataTransfer
} from "../src/clipboard.js";

test("detectTextClipboardKind distinguishes editor SVG, generic SVG, and plain text", () => {
    assert.equal(
        detectTextClipboardKind('<svg data-ve-app="quick-vector-image-editor"></svg>'),
        "editor-svg-document"
    );
    assert.equal(
        detectTextClipboardKind("<svg><rect /></svg>"),
        "generic-svg"
    );
    assert.equal(
        detectTextClipboardKind("hello world"),
        "text"
    );
});

test("internal object clipboard payload round-trips", () => {
    const object = {
        id: "obj-1",
        type: OBJECT_TYPE.TEXT,
        x: 10,
        y: 20,
        text: "Clipboard",
        fontSize: 24,
        fontWeight: 400,
        fill: "#111111",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        lineHeight: 1.2,
        textAlign: "left"
    };

    const payload = serializeInternalObjectPayload(object);
    assert.deepEqual(parseInternalObjectPayload(payload), object);
});

test("cloneObjectForPaste allocates a new id and offsets geometry", () => {
    let documentState = createEmptyDocument();
    documentState = addRectangle(documentState, { x: 20, y: 30 });
    const rectangle = documentState.objects[0];

    const pasted = cloneObjectForPaste(documentState, rectangle);

    assert.equal(pasted.document.objects.length, 2);
    assert.notEqual(pasted.object.id, rectangle.id);
    assert.equal(pasted.object.x, rectangle.x + 24);
    assert.equal(pasted.object.y, rectangle.y + 24);
});

test("writeInternalObjectToDataTransfer writes custom and text fallbacks", () => {
    const calls = [];
    const dataTransfer = {
        setData(type, value) {
            calls.push([type, value]);
        }
    };
    const textObject = {
        id: "obj-2",
        type: OBJECT_TYPE.TEXT,
        x: 0,
        y: 0,
        text: "Copied text",
        fontSize: 24,
        fontWeight: 400,
        fill: "#111111",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        lineHeight: 1.2,
        textAlign: "left"
    };

    writeInternalObjectToDataTransfer(dataTransfer, textObject);

    assert.equal(calls.length, 2);
    assert.equal(calls[1][0], "text/plain");
    assert.equal(calls[1][1], "Copied text");
});
