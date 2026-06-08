#!/usr/bin/env node
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import sharp from "sharp";

class NodeImageData {
  constructor(data, width, height) {
    if (!(data instanceof Uint8ClampedArray)) {
      data = new Uint8ClampedArray(data);
    }

    if (!Number.isFinite(width) || !Number.isFinite(height)) {
      throw new TypeError("ImageData width and height must be finite numbers.");
    }

    if (data.length !== width * height * 4) {
      throw new TypeError(
        `ImageData RGBA length mismatch: received ${data.length}, expected ${width * height * 4}.`
      );
    }

    this.data = data;
    this.width = width;
    this.height = height;
  }
}

globalThis.ImageData ??= NodeImageData;

const {
  AsciiArtError,
  imageDataToAsciiGrid,
  normalizeAsciiError,
  processImageData,
  validateAsciiOptions
} = await import("../src/ascii-art-converter.js");

const SAMPLE_SETTINGS = {
  "cartoon-dog-room.jpg": {
    outputColumns: 96,
    charsetPreset: "standard",
    brightnessCurve: 0.68,
    contrast: 8,
    detail: 18
  },
  "green-owl-yard.png": {
    outputColumns: 118,
    charsetPreset: "detailed",
    brightnessCurve: 0.72,
    contrast: 12,
    detail: 20
  },
  "pixel-farmer.jpg": {
    outputColumns: 110,
    charsetPreset: "standard",
    brightnessCurve: 0.64,
    contrast: 10,
    detail: 10
  },
  "formal-portrait.jpg": {
    outputColumns: 92,
    charsetPreset: "detailed",
    brightnessCurve: 0.75,
    contrast: 14,
    gamma: 0.95,
    detail: 28
  },
  "anime-kernel-cat.jpg": {
    outputColumns: 104,
    charsetPreset: "standard",
    brightnessCurve: 0.7,
    contrast: 8,
    detail: 16
  }
};

const COMMON_OPTIONS = {
  renderCanvas: false,
  colorMode: "monochrome",
  maxInputPixels: 4096 * 4096,
  maxOutputCells: 250000,
  onLogEvent(event) {
    if (process.env.ASCII_ART_DEBUG === "1") {
      console.error(`[${event.type}] ${event.message}`);
    }
  }
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff"]);
const args = new Set(process.argv.slice(2));
const overwriteAll = args.has("--overwrite") || args.has("--yes");
const skipExisting = args.has("--skip-existing");
const validateOnly = args.has("--validate-only");
const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const inputDir = path.join(rootDir, "samples", "input");
const outputDir = path.join(rootDir, "samples", "output");
const resultPath = path.join(rootDir, "test-results", "latest-node-run.json");

await mkdir(outputDir, { recursive: true });
await mkdir(path.dirname(resultPath), { recursive: true });

const rl = createInterface({ input, output });

try {
  const files = (await readdir(inputDir))
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new AsciiArtError(
      "INVALID_SOURCE",
      `No sample images found in ${inputDir}. Add images and run the script again.`,
      { inputDir }
    );
  }

  const results = [];

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${file}.txt`);
    const options = {
      ...COMMON_OPTIONS,
      ...(SAMPLE_SETTINGS[file] ?? { outputColumns: 100, charsetPreset: "standard" })
    };

    const validation = validateAsciiOptions(options);
    if (!validation.valid) {
      const messages = validation.errors.map((error) => error.message).join("; ");
      throw new AsciiArtError(
        "INVALID_OPTIONS",
        `Invalid settings for ${file}: ${messages}`,
        { file, errors: validation.errors }
      );
    }

    if (existsSync(outputPath) && !overwriteAll && !validateOnly) {
      if (skipExisting) {
        console.log(`SKIP ${file}: output already exists.`);
        results.push({ file, status: "skipped", reason: "output-exists", outputPath });
        continue;
      }

      const answer = await rl.question(`Output exists for ${file}. Overwrite ${outputPath}? [y/N] `);
      if (!/^y(es)?$/i.test(answer.trim())) {
        console.log(`SKIP ${file}: user declined overwrite.`);
        results.push({ file, status: "skipped", reason: "user-declined-overwrite", outputPath });
        continue;
      }
    }

    try {
      const decoded = await decodeImageFile(inputPath);
      const processed = processImageData(decoded.imageData, options);
      const grid = imageDataToAsciiGrid(processed, options);
      const outputText = buildOutputText(file, decoded, grid, options);

      if (!validateOnly) {
        await writeFile(outputPath, outputText, "utf8");
      }

      const result = {
        file,
        status: "converted",
        inputPath,
        outputPath,
        width: decoded.width,
        height: decoded.height,
        outputColumns: grid.columns,
        outputRows: grid.rowCount,
        outputCharacters: grid.text.length,
        outputBytes: Buffer.byteLength(outputText, "utf8"),
        options: publicOptions(options),
        validation: validateAsciiText(grid.text, grid.columns, grid.rowCount)
      };

      results.push(result);
      console.log(
        `OK ${file} -> ${path.relative(rootDir, outputPath)} ` +
        `(${decoded.width}x${decoded.height} => ${grid.columns}x${grid.rowCount})`
      );
    } catch (error) {
      const normalized = normalizeAsciiError(error);
      results.push({
        file,
        status: "error",
        code: normalized.code,
        message: normalized.message,
        details: normalized.details
      });
      console.error(`ERROR ${file}: [${normalized.code}] ${normalized.message}`);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    nodeVersion: process.version,
    sharpVersion: sharp.versions.sharp,
    validateOnly,
    results
  };

  await writeFile(resultPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const failed = results.filter((result) => result.status === "error");
  if (failed.length > 0) {
    console.error(`Completed with ${failed.length} failed image(s). See ${resultPath}.`);
    process.exitCode = 1;
  } else {
    console.log(`Completed successfully. Report written to ${path.relative(rootDir, resultPath)}.`);
  }
} finally {
  rl.close();
}

async function decodeImageFile(inputPath) {
  const file = await readFile(inputPath);
  const fileStat = await stat(inputPath);

  let decoded;
  try {
    decoded = await sharp(file, { failOn: "error" })
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
  } catch (error) {
    throw new AsciiArtError(
      "IMAGE_DECODE_FAILED",
      `Image decode failed for ${path.basename(inputPath)}. The file may be corrupt or unsupported by sharp/libvips.`,
      { inputPath, sizeBytes: fileStat.size },
      error
    );
  }

  const { data, info } = decoded;
  const rgba = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);

  return {
    imageData: new ImageData(rgba, info.width, info.height),
    width: info.width,
    height: info.height,
    channels: info.channels,
    sizeBytes: fileStat.size
  };
}

function buildOutputText(file, decoded, grid, options) {
  return [
    `source: ${file}`,
    `input: ${decoded.width}x${decoded.height}, ${decoded.sizeBytes} bytes`,
    `output: ${grid.columns} columns x ${grid.rowCount} rows`,
    `charsetPreset: ${options.charsetPreset}`,
    `settings: ${JSON.stringify(publicOptions(options))}`,
    "",
    grid.text,
    ""
  ].join("\n");
}

function publicOptions(options) {
  const {
    onLogEvent,
    charset,
    ...safeOptions
  } = options;
  return safeOptions;
}

function validateAsciiText(text, columns, rows) {
  const lines = text.split("\n");
  const lineLengths = lines.map((line) => line.length);
  const nonWhitespaceCharacters = [...text].filter((char) => char !== "\n" && char !== " ").length;

  return {
    lineCountMatches: lines.length === rows,
    allLinesMatchColumnCount: lineLengths.every((length) => length === columns),
    nonWhitespaceCharacters,
    nonEmpty: nonWhitespaceCharacters > 0
  };
}
