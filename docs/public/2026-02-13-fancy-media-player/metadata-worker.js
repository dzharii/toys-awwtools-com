self.onmessage = (event) => {
  const { seq, id, extraction, fileName, buffer } = event.data;
  try {
    const bytes = new Uint8Array(buffer);
    const parsed = parseMetadata(bytes, extraction, fileName);
    self.postMessage({
      seq,
      id,
      tags: parsed.tags,
      artworkDataUrl: parsed.artworkDataUrl || ""
    });
  } catch (err) {
    self.postMessage({
      seq,
      id,
      error: err && err.message ? err.message : String(err)
    });
  }
};

function parseMetadata(bytes, extraction, fileName) {
  if (extraction === "off") {
    return { tags: null, artworkDataUrl: "" };
  }

  const tags = {};
  let artworkDataUrl = "";

  const id3v2 = parseId3v2(bytes, extraction === "artwork");
  if (id3v2) {
    if (id3v2.title) tags.title = id3v2.title;
    if (id3v2.artist) tags.artist = id3v2.artist;
    if (id3v2.album) tags.album = id3v2.album;
    if (id3v2.track) tags.track = id3v2.track;
    if (id3v2.year) tags.year = id3v2.year;
    if (id3v2.artworkDataUrl) artworkDataUrl = id3v2.artworkDataUrl;
  }

  const id3v1 = parseId3v1(bytes);
  if (id3v1) {
    if (!tags.title && id3v1.title) tags.title = id3v1.title;
    if (!tags.artist && id3v1.artist) tags.artist = id3v1.artist;
    if (!tags.album && id3v1.album) tags.album = id3v1.album;
    if (!tags.year && id3v1.year) tags.year = id3v1.year;
    if (!tags.track && id3v1.track) tags.track = id3v1.track;
  }

  if (!Object.keys(tags).length) {
    const base = fileNameNoExt(fileName || "");
    if (base) {
      tags.title = base;
    }
  }

  return {
    tags: Object.keys(tags).length ? tags : null,
    artworkDataUrl
  };
}

function parseId3v2(bytes, includeArtwork) {
  if (bytes.length < 10) {
    return null;
  }
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return null;
  }

  const version = bytes[3];
  if (version < 2 || version > 4) {
    return null;
  }

  const tagSize = synchsafeToInt(bytes[6], bytes[7], bytes[8], bytes[9]);
  let offset = 10;
  const end = Math.min(bytes.length, offset + tagSize);

  const out = {
    title: "",
    artist: "",
    album: "",
    track: "",
    year: "",
    artworkDataUrl: ""
  };

  while (offset + 10 <= end) {
    const frameId = readAscii(bytes, offset, 4);
    if (!frameId.trim() || frameId === "\u0000\u0000\u0000\u0000") {
      break;
    }

    let frameSize = 0;
    if (version === 4) {
      frameSize = synchsafeToInt(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    } else {
      frameSize = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
    }

    if (frameSize <= 0) {
      break;
    }

    const frameDataStart = offset + 10;
    const frameDataEnd = frameDataStart + frameSize;
    if (frameDataEnd > end) {
      break;
    }

    if (frameId === "TIT2") {
      out.title = decodeTextFrame(bytes.subarray(frameDataStart, frameDataEnd));
    } else if (frameId === "TPE1") {
      out.artist = decodeTextFrame(bytes.subarray(frameDataStart, frameDataEnd));
    } else if (frameId === "TALB") {
      out.album = decodeTextFrame(bytes.subarray(frameDataStart, frameDataEnd));
    } else if (frameId === "TRCK") {
      out.track = decodeTextFrame(bytes.subarray(frameDataStart, frameDataEnd));
    } else if (frameId === "TYER" || frameId === "TDRC") {
      out.year = decodeTextFrame(bytes.subarray(frameDataStart, frameDataEnd));
    } else if (frameId === "APIC" && includeArtwork && !out.artworkDataUrl) {
      out.artworkDataUrl = decodeApicFrame(bytes.subarray(frameDataStart, frameDataEnd));
    }

    offset = frameDataEnd;
  }

  return out;
}

function parseId3v1(bytes) {
  if (bytes.length < 128) {
    return null;
  }
  const start = bytes.length - 128;
  if (readAscii(bytes, start, 3) !== "TAG") {
    return null;
  }

  const title = decodeIso88591(bytes.subarray(start + 3, start + 33)).trim();
  const artist = decodeIso88591(bytes.subarray(start + 33, start + 63)).trim();
  const album = decodeIso88591(bytes.subarray(start + 63, start + 93)).trim();
  const year = decodeIso88591(bytes.subarray(start + 93, start + 97)).trim();
  const track = bytes[start + 125] === 0 ? String(bytes[start + 126] || "") : "";

  return { title, artist, album, year, track };
}

function decodeApicFrame(frame) {
  if (frame.length < 8) {
    return "";
  }
  const encoding = frame[0];
  let offset = 1;

  const mimeEnd = findZero(frame, offset);
  if (mimeEnd < 0) {
    return "";
  }
  const mime = decodeIso88591(frame.subarray(offset, mimeEnd)).trim() || "image/jpeg";
  offset = mimeEnd + 1;

  offset += 1;
  if (offset >= frame.length) {
    return "";
  }

  const descEnd = findTextTerminator(frame, offset, encoding);
  if (descEnd < 0) {
    return "";
  }
  offset = descEnd;
  if (encoding === 1 || encoding === 2) {
    offset += 2;
  } else {
    offset += 1;
  }

  if (offset >= frame.length) {
    return "";
  }

  const imageBytes = frame.subarray(offset);
  if (imageBytes.length === 0) {
    return "";
  }

  const capped = imageBytes.length > 512000 ? imageBytes.subarray(0, 512000) : imageBytes;
  return `data:${mime};base64,${bytesToBase64(capped)}`;
}

function decodeTextFrame(frame) {
  if (!frame || frame.length === 0) {
    return "";
  }
  const encoding = frame[0];
  const body = frame.subarray(1);

  if (encoding === 0) {
    return decodeIso88591(body).replace(/\u0000/g, "").trim();
  }
  if (encoding === 3) {
    return new TextDecoder("utf-8", { fatal: false }).decode(body).replace(/\u0000/g, "").trim();
  }
  if (encoding === 1 || encoding === 2) {
    return decodeUtf16(body).replace(/\u0000/g, "").trim();
  }
  return decodeIso88591(body).replace(/\u0000/g, "").trim();
}

function decodeUtf16(bytes) {
  if (bytes.length < 2) {
    return "";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le", { fatal: false }).decode(bytes.subarray(2));
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = new Uint8Array(bytes.length - 2);
    for (let i = 2, j = 0; i + 1 < bytes.length; i += 2, j += 2) {
      swapped[j] = bytes[i + 1];
      swapped[j + 1] = bytes[i];
    }
    return new TextDecoder("utf-16le", { fatal: false }).decode(swapped);
  }
  return new TextDecoder("utf-16le", { fatal: false }).decode(bytes);
}

function findZero(bytes, start) {
  for (let i = start; i < bytes.length; i += 1) {
    if (bytes[i] === 0) {
      return i;
    }
  }
  return -1;
}

function findTextTerminator(bytes, start, encoding) {
  if (encoding === 1 || encoding === 2) {
    for (let i = start; i + 1 < bytes.length; i += 2) {
      if (bytes[i] === 0 && bytes[i + 1] === 0) {
        return i;
      }
    }
    return -1;
  }
  return findZero(bytes, start);
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function synchsafeToInt(b0, b1, b2, b3) {
  return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
}

function decodeIso88591(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

function readAscii(bytes, start, len) {
  let out = "";
  for (let i = 0; i < len && start + i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[start + i]);
  }
  return out;
}

function fileNameNoExt(name) {
  const i = name.lastIndexOf(".");
  return i < 0 ? name : name.slice(0, i);
}
