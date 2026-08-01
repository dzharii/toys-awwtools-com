import { createDefaultGridDefinition, SCHEMA_VERSION } from "../state/defaults.js";

export const STORAGE_KEYS = {
  session: "com.gridAtlasHelper.session.v1",
  presets: "com.gridAtlasHelper.presets.v1",
};

function mergeDefinition(candidate) {
  const defaults = createDefaultGridDefinition();
  const source = candidate && typeof candidate === "object" ? candidate : {};
  return {
    ...defaults,
    ...source,
    canvas: { ...defaults.canvas, ...source.canvas },
    gridOrigin: { ...defaults.gridOrigin, ...source.gridOrigin },
    cell: { ...defaults.cell, ...source.cell },
    count: { ...defaults.count, ...source.count },
    separator: { ...defaults.separator, ...source.separator },
    outerBorder: { ...defaults.outerBorder, ...source.outerBorder },
    gridAppearance: { ...defaults.gridAppearance, ...source.gridAppearance },
    background: { ...defaults.background, ...source.background },
    atlas: { ...defaults.atlas, ...source.atlas },
    naming: { ...defaults.naming, ...source.naming },
  };
}

export function normalizeGridDefinition(candidate) {
  const definition = mergeDefinition(candidate);
  const positive = [
    [definition.canvas, "widthPixels"], [definition.canvas, "heightPixels"],
    [definition.cell, "widthPixels"], [definition.cell, "heightPixels"],
    [definition.count, "requestedColumns"], [definition.count, "requestedRows"],
  ];
  for (const [object, key] of positive) {
    if (!Number.isInteger(Number(object[key])) || Number(object[key]) < 1) {
      throw new Error(`${key} must be an integer greater than zero.`);
    }
    object[key] = Math.min(16384, Number(object[key]));
  }
  const nonnegative = [
    [definition.gridOrigin, "xPixels"], [definition.gridOrigin, "yPixels"],
    [definition.separator, "widthPixels"], [definition.separator, "heightPixels"],
    [definition.outerBorder, "leftPixels"], [definition.outerBorder, "topPixels"],
    [definition.outerBorder, "rightPixels"], [definition.outerBorder, "bottomPixels"],
  ];
  for (const [object, key] of nonnegative) {
    if (!Number.isInteger(Number(object[key])) || Number(object[key]) < 0) {
      throw new Error(`${key} must be a non-negative integer.`);
    }
    object[key] = Number(object[key]);
  }
  if (definition.canvas.widthPixels * definition.canvas.heightPixels > 67_108_864) {
    throw new Error("Canvas dimensions exceed the 67,108,864-pixel safety limit.");
  }
  if (definition.gridOrigin.xPixels > definition.canvas.widthPixels || definition.gridOrigin.yPixels > definition.canvas.heightPixels) {
    throw new Error("Grid origin must remain inside the canvas.");
  }
  for (const [value, label] of [
    [definition.gridAppearance.lineColor, "line color"],
    [definition.background.color, "background color"],
    [definition.atlas.padColor, "padding color"],
  ]) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${label} must use #RRGGBB format.`);
  }
  definition.gridAppearance.lineOpacity = Math.max(0, Math.min(1, Number(definition.gridAppearance.lineOpacity)));
  definition.background.opacity = Math.max(0, Math.min(1, Number(definition.background.opacity)));
  if (!["automatic", "fixed"].includes(definition.count.columnMode)) definition.count.columnMode = "automatic";
  if (!["automatic", "fixed"].includes(definition.count.rowMode)) definition.count.rowMode = "automatic";
  if (!["solid", "dashed", "dotted"].includes(definition.gridAppearance.lineStyle)) definition.gridAppearance.lineStyle = "solid";
  if (!["transparent", "solid"].includes(definition.background.mode)) definition.background.mode = "transparent";
  if (!["row-major", "column-major"].includes(definition.atlas.traversalOrder)) definition.atlas.traversalOrder = "row-major";
  const policies = ["skip", "crop", "pad-transparent", "pad-color"];
  if (!policies.includes(definition.atlas.rightEdgePolicy)) definition.atlas.rightEdgePolicy = "skip";
  if (!policies.includes(definition.atlas.bottomEdgePolicy)) definition.atlas.bottomEdgePolicy = "skip";
  const template = String(definition.naming.template || "");
  const supportedToken = /^\{(prefix|name|index|row|column|x|y|width|height)(?::0+)?\}$/;
  const unsupportedToken = [...template.matchAll(/\{[^}]+\}/g)].map((match) => match[0]).find((token) => !supportedToken.test(token));
  if (!template.trim()) throw new Error("naming template must not be empty.");
  if (unsupportedToken) throw new Error(`naming template contains unsupported token ${unsupportedToken}.`);
  definition.schemaVersion = SCHEMA_VERSION;
  return definition;
}

export function readStoredJson(key, fallback, onError) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    onError?.(error);
    return fallback;
  }
}

export function writeStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function encodeUrlState(activeMode, gridDefinition) {
  const json = JSON.stringify({ schemaVersion: SCHEMA_VERSION, activeMode, gridDefinition });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeUrlState(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (!params.has("state")) return null;
  const encoded = params.get("state").replace(/-/g, "+").replace(/_/g, "/");
  const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const parsed = JSON.parse(new TextDecoder().decode(bytes));
  if (parsed.schemaVersion > SCHEMA_VERSION) throw new Error("This URL uses a newer schema version.");
  return {
    activeMode: parsed.activeMode === "atlas-slicer" ? "atlas-slicer" : "grid-creator",
    gridDefinition: normalizeGridDefinition(parsed.gridDefinition),
  };
}

export function createPresetDocument(name, gridDefinition) {
  return {
    documentType: "grid-atlas-helper-preset",
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    presetName: name,
    configuration: normalizeGridDefinition(gridDefinition),
  };
}
