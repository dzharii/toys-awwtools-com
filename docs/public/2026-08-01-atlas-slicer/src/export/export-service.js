import { renderGrid } from "../grid/grid-renderer.js";

export function canvasToBlob(canvas, mimeType = "image/png") {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The browser failed to encode the canvas.")), mimeType);
  });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function createGridPng(gridDefinition, layoutResult) {
  const canvas = document.createElement("canvas");
  canvas.width = gridDefinition.canvas.widthPixels;
  canvas.height = gridDefinition.canvas.heightPixels;
  renderGrid(canvas.getContext("2d"), gridDefinition, layoutResult, true);
  return canvasToBlob(canvas);
}

export async function createSpriteBlob(sourceImage, cell, gridDefinition) {
  const canvas = document.createElement("canvas");
  canvas.width = cell.outputRectangle.width;
  canvas.height = cell.outputRectangle.height;
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  const partial = !cell.complete;
  if (partial && (
    gridDefinition.atlas.rightEdgePolicy === "pad-color"
    || gridDefinition.atlas.bottomEdgePolicy === "pad-color"
  )) {
    context.fillStyle = gridDefinition.atlas.padColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(
    sourceImage,
    cell.sourceRectangle.x,
    cell.sourceRectangle.y,
    cell.sourceRectangle.width,
    cell.sourceRectangle.height,
    0,
    0,
    cell.sourceRectangle.width,
    cell.sourceRectangle.height,
  );
  return canvasToBlob(canvas);
}

function createZipArchive() {
  if (typeof window.JSZip !== "function") {
    throw new Error("JSZip is unavailable. Ensure the bundled library loads before the application module.");
  }
  return new window.JSZip();
}

export async function createAtlasZip({ sourceImage, sourceMetadata, gridDefinition, namedCells, onProgress }) {
  const zip = createZipArchive();
  const folder = zip.folder("sprites");
  const manifestSprites = [];
  for (let position = 0; position < namedCells.length; position += 1) {
    const cell = namedCells[position];
    onProgress?.({ stage: "encoding", current: position + 1, total: namedCells.length });
    const blob = await createSpriteBlob(sourceImage, cell, gridDefinition);
    folder.file(cell.fileName, blob);
    manifestSprites.push({
      fileName: `sprites/${cell.fileName}`,
      index: cell.index,
      row: cell.row,
      column: cell.column,
      sourceRectangle: cell.sourceRectangle,
      outputRectangle: cell.outputRectangle,
      complete: cell.complete,
    });
  }
  if (gridDefinition.atlas.includeManifest) {
    zip.file("manifest.json", JSON.stringify({
      schemaVersion: 1,
      source: sourceMetadata,
      gridDefinition,
      traversalOrder: gridDefinition.atlas.traversalOrder,
      rightEdgePolicy: gridDefinition.atlas.rightEdgePolicy,
      bottomEdgePolicy: gridDefinition.atlas.bottomEdgePolicy,
      sprites: manifestSprites,
    }, null, 2));
  }
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  }, ({ percent }) => onProgress?.({ stage: "compressing", percent }));
}
