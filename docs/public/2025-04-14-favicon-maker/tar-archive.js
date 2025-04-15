class TarArchive {
  constructor() {
    this.files = [];
  }

  addFile(fileName, data) {
    const mtime = Math.floor(Date.now() / 1000);
    const header = this._createTarHeader(fileName, data.length, mtime);
    const body = this._padTo512(data);
    this.files.push(header, body);
  }

  getBlob() {
    const end = new Uint8Array(1024);
    const fullData = this._concatUint8Arrays([...this.files, end]);
    return new Blob([fullData], { type: "application/x-tar" });
  }

  _padString(str, length) {
    return str.padStart(length, "0");
  }

  _writeString(buffer, str, offset, length) {
    for (let i = 0; i < length; i++) {
      buffer[offset + i] = i < str.length ? str.charCodeAt(i) : 0;
    }
  }

  _createTarHeader(fileName, fileSize, mtime) {
    const header = new Uint8Array(512);
    this._writeString(header, fileName, 0, 100);
    this._writeString(header, this._padString("644", 7), 100, 7);
    header[107] = 0;
    this._writeString(header, this._padString("0", 7), 108, 7);
    header[115] = 0;
    this._writeString(header, this._padString("0", 7), 116, 7);
    header[123] = 0;
    this._writeString(
      header,
      this._padString(fileSize.toString(8), 11),
      124,
      11
    );
    header[135] = 0;
    this._writeString(header, this._padString(mtime.toString(8), 11), 136, 11);
    header[147] = 0;
    for (let i = 148; i < 156; i++) header[i] = 32;
    header[156] = "0".charCodeAt(0);
    this._writeString(header, "ustar", 257, 5);
    this._writeString(header, "00", 263, 2);
    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i];
    }
    this._writeString(header, this._padString(checksum.toString(8), 6), 148, 6);
    header[154] = 0;
    header[155] = 32;
    return header;
  }

  _padTo512(data) {
    const remainder = data.length % 512;
    if (remainder === 0) return data;
    const padding = new Uint8Array(512 - remainder);
    return new Uint8Array([...data, ...padding]);
  }

  _concatUint8Arrays(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    arrays.forEach((arr) => {
      result.set(arr, offset);
      offset += arr.length;
    });
    return result;
  }
}
