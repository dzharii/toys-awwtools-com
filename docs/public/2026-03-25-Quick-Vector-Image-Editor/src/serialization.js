import { APP_ID, DEFAULT_FONT_FAMILY, DOCUMENT_FORMAT_VERSION, OBJECT_TYPE } from "./constants.js";
import { createEmptyDocument } from "./document.js";
import { escapeXml, unescapeXml } from "./utils.js";
import { validateDocument } from "./validation.js";

export function renderSceneMarkup(document) {
    const objectsMarkup = document.objects.map(serializeObject).join("");
    return `<rect x="0" y="0" width="${document.canvas.width}" height="${document.canvas.height}" fill="${document.canvas.background}" />${objectsMarkup}`;
}

export function serializeDocumentToSvg(document) {
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${document.canvas.width}" height="${document.canvas.height}" viewBox="0 0 ${document.canvas.width} ${document.canvas.height}" data-ve-app="${APP_ID}" data-ve-version="${DOCUMENT_FORMAT_VERSION}" data-ve-lineage-id="${escapeXml(document.metadata.lineageId)}" data-ve-next-object-number="${document.metadata.nextObjectNumber}" data-ve-canvas-background="${document.canvas.background}">`,
        `<rect x="0" y="0" width="${document.canvas.width}" height="${document.canvas.height}" fill="${document.canvas.background}" data-ve-role="background" />`,
        `<g data-ve-layer="objects">`,
        document.objects.map(serializeObject).join(""),
        `</g>`,
        `</svg>`
    ].join("");
}

export function parseEditorSvg(svgString) {
    const rootMatch = svgString.match(/<svg\b([\s\S]*?)>/i);
    if (!rootMatch) {
        throw new Error("The file does not contain an SVG root element.");
    }
    const rootAttributes = parseAttributes(rootMatch[1]);
    if (rootAttributes["data-ve-app"] !== APP_ID) {
        throw new Error("The SVG is not a supported editor document.");
    }
    if (Number(rootAttributes["data-ve-version"]) !== DOCUMENT_FORMAT_VERSION) {
        throw new Error(`Unsupported editor SVG version: ${rootAttributes["data-ve-version"]}`);
    }
    const document = createEmptyDocument();
    document.version = DOCUMENT_FORMAT_VERSION;
    document.appId = APP_ID;
    document.canvas.width = parseRequiredNumber(rootAttributes.width, "width");
    document.canvas.height = parseRequiredNumber(rootAttributes.height, "height");
    document.canvas.background = rootAttributes["data-ve-canvas-background"] || "#ffffff";
    document.metadata.lineageId = rootAttributes["data-ve-lineage-id"] || document.metadata.lineageId;
    document.metadata.nextObjectNumber = parseRequiredNumber(rootAttributes["data-ve-next-object-number"] || "1", "data-ve-next-object-number");
    document.objects = [];
    const objectPattern = /<(image|rect|ellipse|line|text)\b([\s\S]*?)(?:\/>|>([\s\S]*?)<\/text>)/gi;
    let match;
    while ((match = objectPattern.exec(svgString))) {
        const tagName = match[1];
        const attributes = parseAttributes(match[2]);
        if (!attributes["data-ve-id"]) {
            continue;
        }
        const objectType = attributes["data-ve-type"] || inferObjectType(tagName);
        document.objects.push(parseObject(objectType, attributes, match[3] ?? ""));
    }
    const errors = validateDocument(document);
    if (errors.length > 0) {
        throw new Error(`Editor SVG validation failed.\n${errors.join("\n")}`);
    }
    return document;
}

function serializeObject(object) {
    switch (object.type) {
        case OBJECT_TYPE.IMAGE:
            return `<image x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" href="${escapeXml(object.href)}" preserveAspectRatio="none" data-ve-id="${object.id}" data-ve-type="${object.type}" data-ve-natural-width="${object.naturalWidth}" data-ve-natural-height="${object.naturalHeight}" />`;
        case OBJECT_TYPE.TEXT:
            return `<text x="${object.x}" y="${object.y}" fill="${object.fill}" font-size="${object.fontSize}" font-weight="${object.fontWeight}" font-family="${escapeXml(DEFAULT_FONT_FAMILY)}" data-ve-id="${object.id}" data-ve-type="${object.type}" data-ve-line-height="${object.lineHeight}" data-ve-text-align="${object.textAlign}">${escapeXml(object.text)}</text>`;
        case OBJECT_TYPE.RECTANGLE:
            return `<rect x="${object.x}" y="${object.y}" width="${object.width}" height="${object.height}" fill="${object.fill}" stroke="${object.stroke}" stroke-width="${object.strokeWidth}" data-ve-id="${object.id}" data-ve-type="${object.type}" />`;
        case OBJECT_TYPE.ELLIPSE:
            return `<ellipse cx="${object.x + (object.width / 2)}" cy="${object.y + (object.height / 2)}" rx="${object.width / 2}" ry="${object.height / 2}" fill="${object.fill}" stroke="${object.stroke}" stroke-width="${object.strokeWidth}" data-ve-id="${object.id}" data-ve-type="${object.type}" data-ve-x="${object.x}" data-ve-y="${object.y}" data-ve-width="${object.width}" data-ve-height="${object.height}" />`;
        case OBJECT_TYPE.LINE:
            return `<line x1="${object.x1}" y1="${object.y1}" x2="${object.x2}" y2="${object.y2}" stroke="${object.stroke}" stroke-width="${object.strokeWidth}" stroke-linecap="round" data-ve-id="${object.id}" data-ve-type="${object.type}" />`;
        default:
            throw new Error(`Unsupported object type during serialization: ${object.type}`);
    }
}

function parseObject(type, attributes, textContent) {
    if (type === OBJECT_TYPE.IMAGE) {
        return {
            id: attributes["data-ve-id"],
            type,
            x: parseRequiredNumber(attributes.x, "image x"),
            y: parseRequiredNumber(attributes.y, "image y"),
            width: parseRequiredNumber(attributes.width, "image width"),
            height: parseRequiredNumber(attributes.height, "image height"),
            href: attributes.href,
            naturalWidth: parseRequiredNumber(attributes["data-ve-natural-width"], "image natural width"),
            naturalHeight: parseRequiredNumber(attributes["data-ve-natural-height"], "image natural height")
        };
    }
    if (type === OBJECT_TYPE.TEXT) {
        return {
            id: attributes["data-ve-id"],
            type,
            x: parseRequiredNumber(attributes.x, "text x"),
            y: parseRequiredNumber(attributes.y, "text y"),
            text: unescapeXml(textContent),
            fontSize: parseRequiredNumber(attributes["font-size"], "font-size"),
            fontWeight: parseRequiredNumber(attributes["font-weight"], "font-weight"),
            fill: attributes.fill,
            fontFamily: DEFAULT_FONT_FAMILY,
            lineHeight: parseRequiredNumber(attributes["data-ve-line-height"] || "1.2", "line-height"),
            textAlign: attributes["data-ve-text-align"] || "left"
        };
    }
    if (type === OBJECT_TYPE.RECTANGLE) {
        return {
            id: attributes["data-ve-id"],
            type,
            x: parseRequiredNumber(attributes.x, "rect x"),
            y: parseRequiredNumber(attributes.y, "rect y"),
            width: parseRequiredNumber(attributes.width, "rect width"),
            height: parseRequiredNumber(attributes.height, "rect height"),
            fill: attributes.fill,
            stroke: attributes.stroke,
            strokeWidth: parseRequiredNumber(attributes["stroke-width"], "rect stroke-width")
        };
    }
    if (type === OBJECT_TYPE.ELLIPSE) {
        return {
            id: attributes["data-ve-id"],
            type,
            x: parseRequiredNumber(attributes["data-ve-x"], "ellipse x"),
            y: parseRequiredNumber(attributes["data-ve-y"], "ellipse y"),
            width: parseRequiredNumber(attributes["data-ve-width"], "ellipse width"),
            height: parseRequiredNumber(attributes["data-ve-height"], "ellipse height"),
            fill: attributes.fill,
            stroke: attributes.stroke,
            strokeWidth: parseRequiredNumber(attributes["stroke-width"], "ellipse stroke-width")
        };
    }
    if (type === OBJECT_TYPE.LINE) {
        return {
            id: attributes["data-ve-id"],
            type,
            x1: parseRequiredNumber(attributes.x1, "line x1"),
            y1: parseRequiredNumber(attributes.y1, "line y1"),
            x2: parseRequiredNumber(attributes.x2, "line x2"),
            y2: parseRequiredNumber(attributes.y2, "line y2"),
            stroke: attributes.stroke,
            strokeWidth: parseRequiredNumber(attributes["stroke-width"], "line stroke-width")
        };
    }
    throw new Error(`Unsupported object type in parser: ${type}`);
}

function inferObjectType(tagName) {
    if (tagName === "rect") {
        return OBJECT_TYPE.RECTANGLE;
    }
    if (tagName === "ellipse") {
        return OBJECT_TYPE.ELLIPSE;
    }
    if (tagName === "image") {
        return OBJECT_TYPE.IMAGE;
    }
    if (tagName === "line") {
        return OBJECT_TYPE.LINE;
    }
    return OBJECT_TYPE.TEXT;
}

function parseAttributes(attributeString) {
    const attributes = {};
    const pattern = /([:@\w.-]+)\s*=\s*"([^"]*)"/g;
    let match;
    while ((match = pattern.exec(attributeString))) {
        attributes[match[1]] = unescapeXml(match[2]);
    }
    return attributes;
}

function parseRequiredNumber(value, label) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid numeric value for ${label}.`);
    }
    return parsed;
}
