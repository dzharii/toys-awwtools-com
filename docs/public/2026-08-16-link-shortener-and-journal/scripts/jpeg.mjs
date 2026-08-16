import { readFile, stat } from "node:fs/promises";

export function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error("File does not contain a JPEG start marker.");
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) throw new Error("JPEG contains an invalid segment length.");
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("JPEG dimensions could not be decoded.");
}

export async function validateJpeg(filePath, expectedWidth = 1200, expectedHeight = 630) {
  const info = await stat(filePath);
  if (!info.isFile() || info.size === 0) throw new Error("Preview JPEG is missing or empty.");
  const dimensions = jpegDimensions(await readFile(filePath));
  if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
    throw new Error(`Preview dimensions are ${dimensions.width}x${dimensions.height}; expected ${expectedWidth}x${expectedHeight}.`);
  }
  return { ...dimensions, bytes: info.size };
}
