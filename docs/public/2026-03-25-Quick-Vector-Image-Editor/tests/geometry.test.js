import test from "node:test";
import assert from "node:assert/strict";

import { OBJECT_TYPE } from "../src/constants.js";
import {
    getHitCandidates,
    isPointInsideObject,
    resizeObjectFromHandle
} from "../src/geometry.js";

const measureText = (textObject) => ({
    width: textObject.text.length * textObject.fontSize * 0.5,
    actualBoundingBoxAscent: textObject.fontSize * 0.8,
    actualBoundingBoxDescent: textObject.fontSize * 0.2
});

test("transparent shapes remain selectable through the interior", () => {
    const ellipse = {
        id: "ellipse-1",
        type: OBJECT_TYPE.ELLIPSE,
        x: 10,
        y: 20,
        width: 200,
        height: 100,
        stroke: "#ff0000",
        strokeWidth: 2,
        fill: "transparent"
    };

    assert.equal(
        isPointInsideObject({ x: 110, y: 70 }, ellipse, { scale: 1, measureText }),
        true
    );
});

test("line hit testing uses a forgiving minimum corridor in screen space", () => {
    const line = {
        id: "line-1",
        type: OBJECT_TYPE.LINE,
        x1: 10,
        y1: 10,
        x2: 110,
        y2: 10,
        stroke: "#ff0000",
        strokeWidth: 1
    };

    assert.equal(
        isPointInsideObject({ x: 60, y: 13.5 }, line, { scale: 1, measureText }),
        true
    );
});

test("hit candidates are returned in front-to-back order", () => {
    const documentState = {
        objects: [
            { id: "back", type: OBJECT_TYPE.RECTANGLE, x: 0, y: 0, width: 100, height: 100, stroke: "#111111", strokeWidth: 1, fill: "#ffffff" },
            { id: "front", type: OBJECT_TYPE.RECTANGLE, x: 0, y: 0, width: 100, height: 100, stroke: "#111111", strokeWidth: 1, fill: "#ffffff" }
        ]
    };

    const candidates = getHitCandidates(documentState, { x: 20, y: 20 }, { scale: 1, measureText });
    assert.deepEqual(candidates.map((object) => object.id), ["front", "back"]);
});

test("image resizing preserves aspect ratio from corner handles", () => {
    const image = {
        id: "image-1",
        type: OBJECT_TYPE.IMAGE,
        x: 10,
        y: 20,
        width: 200,
        height: 100,
        href: "data:image/png;base64,AAAA",
        naturalWidth: 200,
        naturalHeight: 100
    };

    const resized = resizeObjectFromHandle(image, "se", { x: 330, y: 210 });
    assert.equal(Math.round((resized.width / resized.height) * 1000), 2000);
});

test("line resizing enforces the minimum line length", () => {
    const line = {
        id: "line-2",
        type: OBJECT_TYPE.LINE,
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0,
        stroke: "#111111",
        strokeWidth: 2
    };

    const resized = resizeObjectFromHandle(line, "end", { x: 1, y: 0 });
    assert.ok(Math.hypot(resized.x2 - resized.x1, resized.y2 - resized.y1) >= 4);
});
