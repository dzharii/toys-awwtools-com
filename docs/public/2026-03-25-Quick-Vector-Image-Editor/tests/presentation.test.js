import test from "node:test";
import assert from "node:assert/strict";

import { OBJECT_TYPE, TOOL } from "../src/constants.js";
import { getContextualHint, getTextUiMetrics, getTextUiPatch } from "../src/presentation.js";

const measureText = (textObject) => ({
    width: textObject.text.length * textObject.fontSize * 0.5,
    actualBoundingBoxAscent: textObject.fontSize * 0.8,
    actualBoundingBoxDescent: textObject.fontSize * 0.2
});

test("text UI metrics expose visual left and top instead of baseline Y", () => {
    const textObject = {
        id: "text-1",
        type: OBJECT_TYPE.TEXT,
        text: "Hello",
        x: 120,
        y: 240,
        fontSize: 30,
        fontWeight: 400,
        fontFamily: "Segoe UI",
        lineHeight: 1.2,
        fill: "#111111"
    };

    const metrics = getTextUiMetrics(textObject, measureText);
    assert.equal(metrics.left, 120);
    assert.equal(metrics.top, 216);
});

test("text UI top edits convert back into stored baseline coordinates", () => {
    const textObject = {
        id: "text-2",
        type: OBJECT_TYPE.TEXT,
        text: "Hello",
        x: 100,
        y: 180,
        fontSize: 20,
        fontWeight: 400,
        fontFamily: "Segoe UI",
        lineHeight: 1.2,
        fill: "#111111"
    };

    assert.deepEqual(getTextUiPatch(textObject, "left", 144, measureText), { x: 144 });
    assert.deepEqual(getTextUiPatch(textObject, "top", 90, measureText), { y: 106 });
});

test("contextual hint prioritizes text editing and text-size guidance", () => {
    assert.match(
        getContextualHint({ tool: TOOL.SELECT, selectedObject: null, isTextEditing: true }),
        /press enter to commit/i
    );
    assert.match(
        getContextualHint({
            tool: TOOL.SELECT,
            selectedObject: { id: "text-3", type: OBJECT_TYPE.TEXT },
            isTextEditing: false
        }),
        /font size/i
    );
});
