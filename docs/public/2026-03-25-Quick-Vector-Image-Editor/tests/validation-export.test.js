import test from "node:test";
import assert from "node:assert/strict";

import { preflightRasterExport } from "../src/export.js";
import { normalizeTextContent, validateObject } from "../src/validation.js";

test("text normalization converts line breaks to spaces", () => {
    assert.equal(normalizeTextContent("line one\nline two\r\nline three"), "line one line two line three");
});

test("object validation does not mutate the original object", () => {
    const rectangle = {
        id: "rect-1",
        type: "rectangle",
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        stroke: "#ABC",
        strokeWidth: 2,
        fill: "#def"
    };
    const original = structuredClone(rectangle);

    validateObject(rectangle);

    assert.deepEqual(rectangle, original);
});

test("raster export preflight rejects over-limit dimensions", () => {
    const blocked = preflightRasterExport({
        canvas: {
            width: 9000,
            height: 100
        }
    });
    assert.equal(blocked.ok, false);
    assert.match(blocked.reason, /exceeds/i);
});

test("raster export preflight allows safe dimensions", () => {
    const safe = preflightRasterExport({
        canvas: {
            width: 1600,
            height: 900
        }
    });
    assert.equal(safe.ok, true);
    assert.equal(safe.pixels, 1440000);
});
