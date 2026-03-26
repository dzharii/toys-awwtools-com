import test from "node:test";
import assert from "node:assert/strict";

import { createEmptyDocument } from "../src/document.js";
import { addEllipse, addImage, addLine, addRectangle, addText, patchObject } from "../src/commands.js";
import { parseEditorSvg, serializeDocumentToSvg } from "../src/serialization.js";

test("editor SVG round-trips the supported object set", () => {
    let documentState = createEmptyDocument();
    documentState = addRectangle(documentState, { x: 20, y: 30 });
    documentState = addEllipse(documentState, { x: 180, y: 120 });
    documentState = addLine(documentState, { x: 360, y: 200 });
    documentState = addText(documentState, { x: 120, y: 240 });
    documentState = patchObject(documentState, documentState.objects.at(-1).id, {
        text: "Hello editor",
        fill: "#123456",
        fontSize: 30
    });
    documentState = addImage(documentState, {
        href: "data:image/png;base64,AAAA",
        naturalWidth: 640,
        naturalHeight: 480
    });

    const svg = serializeDocumentToSvg(documentState);
    const parsed = parseEditorSvg(svg);

    assert.equal(parsed.canvas.width, documentState.canvas.width);
    assert.equal(parsed.canvas.height, documentState.canvas.height);
    assert.equal(parsed.metadata.lineageId, documentState.metadata.lineageId);
    assert.equal(parsed.objects.length, documentState.objects.length);
    assert.deepEqual(
        parsed.objects.map((object) => object.type),
        documentState.objects.map((object) => object.type)
    );
    assert.equal(parsed.objects.find((object) => object.type === "text").text, "Hello editor");
    assert.equal(parsed.objects.find((object) => object.type === "image").href, "data:image/png;base64,AAAA");
});

test("non-editor SVG is rejected", () => {
    assert.throws(
        () => parseEditorSvg('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'),
        /not a supported editor document/i
    );
});
