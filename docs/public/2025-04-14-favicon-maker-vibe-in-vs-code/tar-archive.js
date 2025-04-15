class TarArchive {
  constructor() {
    this.fileData = [];
    this.fileDataLength = 0;
  }

  addFile(fileName, fileData) {
    const headerBuffer = this._createTarHeader(fileName, fileData.length);
    this.fileData.push(headerBuffer);
    this.fileDataLength += headerBuffer.length;

    // Convert file data to Uint8Array if it's not already
    let dataBuffer;
    if (fileData instanceof Uint8Array) {
      dataBuffer = fileData;
    } else {
      // Handle string data
      const textEncoder = new TextEncoder();
      dataBuffer = textEncoder.encode(fileData);
    }

    this.fileData.push(dataBuffer);
    this.fileDataLength += dataBuffer.length;

    // Add padding to make the total size a multiple of 512 bytes
    const paddingLength = 512 - (dataBuffer.length % 512 || 512);
    if (paddingLength > 0 && paddingLength < 512) {
      const paddingBuffer = new Uint8Array(paddingLength);
      this.fileData.push(paddingBuffer);
      this.fileDataLength += paddingBuffer.length;
    }
  }

  _createTarHeader(fileName, fileSize) {
    const buffer = new Uint8Array(512);
    const encoder = new TextEncoder();

    // File name
    encoder.encodeInto(fileName, buffer);

    // File mode
    const mode = "100664 \0";
    encoder.encodeInto(mode, buffer.subarray(100));

    // UID and GID
    const uid = "0 \0";
    encoder.encodeInto(uid, buffer.subarray(108));
    const gid = "0 \0";
    encoder.encodeInto(gid, buffer.subarray(116));

    // File size
    const sizeStr = fileSize.toString(8).padStart(11, "0") + " ";
    encoder.encodeInto(sizeStr, buffer.subarray(124));

    // Last modification time
    const mtime =
      Math.floor(Date.now() / 1000)
        .toString(8)
        .padStart(11, "0") + " ";
    encoder.encodeInto(mtime, buffer.subarray(136));

    // Checksum placeholder
    encoder.encodeInto("        ", buffer.subarray(148));

    // Type flag (0 = normal file)
    buffer[156] = 48;

    // Calculate checksum
    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += buffer[i];
    }
    const checksumStr = checksum.toString(8).padStart(6, "0") + "\0 ";
    encoder.encodeInto(checksumStr, buffer.subarray(148));

    return buffer;
  }

  getBlob() {
    const endBlocks = new Uint8Array(1024); // Two blocks of zeros at the end
    const finalBuffer = new Uint8Array(this.fileDataLength + endBlocks.length);

    let offset = 0;
    for (const data of this.fileData) {
      finalBuffer.set(data, offset);
      offset += data.length;
    }

    finalBuffer.set(endBlocks, offset);

    return new Blob([finalBuffer], { type: "application/x-tar" });
  }
}
