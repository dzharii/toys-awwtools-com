export const APPLICATION_ID = "GAH";
export const SCHEMA_VERSION = 1;

export function createDefaultGridDefinition() {
  return {
    schemaVersion: SCHEMA_VERSION,
    canvas: { widthPixels: 512, heightPixels: 512 },
    gridOrigin: { xPixels: 0, yPixels: 0 },
    cell: { widthPixels: 32, heightPixels: 32 },
    count: {
      columnMode: "automatic",
      rowMode: "automatic",
      requestedColumns: 16,
      requestedRows: 16,
    },
    separator: { widthPixels: 1, heightPixels: 1 },
    outerBorder: {
      enabled: false,
      leftPixels: 0,
      topPixels: 0,
      rightPixels: 0,
      bottomPixels: 0,
    },
    gridAppearance: {
      lineColor: "#1687d9",
      lineOpacity: 0.9,
      lineStyle: "solid",
    },
    background: { mode: "transparent", color: "#ffffff", opacity: 1 },
    atlas: {
      traversalOrder: "row-major",
      rightEdgePolicy: "skip",
      bottomEdgePolicy: "skip",
      padColor: "#000000",
      includeManifest: true,
      showGrid: true,
      showSequenceNumbers: false,
    },
    naming: {
      prefix: "sprite",
      template: "{prefix}_{index:000}",
      startIndex: 1,
      rowStartIndex: 0,
      columnStartIndex: 0,
    },
  };
}

export function createDefaultApplicationState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    activeMode: "grid-creator",
    gridDefinition: createDefaultGridDefinition(),
    gridCreatorCanvas: { widthPixels: 512, heightPixels: 512 },
    atlas: {
      sourceFile: null,
      sourceImage: null,
      sourceObjectUrl: null,
      metadata: null,
      selectedCell: null,
      imageRequestId: 0,
    },
    viewportByMode: {
      "grid-creator": { zoom: 1, panXCssPixels: 0, panYCssPixels: 0, fitMode: true },
      "atlas-slicer": { zoom: 1, panXCssPixels: 0, panYCssPixels: 0, fitMode: true },
    },
    presets: [],
    currentPresetId: null,
    status: { level: "info", message: "Ready" },
    exportProgress: null,
  };
}
