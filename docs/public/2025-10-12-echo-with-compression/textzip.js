// textzip.js
// Dependency-free BWT + MTF + RLE0 + canonical Huffman with base64 header framing.
// Token format: base64(headerJSON).base64(payloadBytes)
// Header JSON: { v, alg, n, pi, hbits, rleLen }
// API:
//   TextZip.compress(inputB64) -> token
//   TextZip.decompress(token)  -> original bytes as base64

const TextZip = (() => {
  // ---------- configuration ----------
  const CFG = Object.freeze({
    ALG: "BWT+MTF+RLE+HUF",
    VER: 1,
    DEBUG: false
  });

  // ---------- tiny logger ----------
  function log(...a){ if (CFG.DEBUG) console.log("[TextZip]", ...a); }
  function fail(msg){ throw new Error(msg); }

  // ---------- helpers: typed assertions ----------
  function assert(cond, msg){ if (!cond) fail(msg); }
  function isU8(x){ return x && x.constructor === Uint8Array; }
  function isI32(x){ return Number.isInteger(x); }

  // ---------- base64 <-> bytes (Uint8Array) ----------
  function b64encodeBytes(bytes) {
    assert(isU8(bytes), "b64encode: not Uint8Array");
    if (typeof btoa === "function") {
      let s = "";
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s);
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "", i = 0;
    while (i < bytes.length) {
      const a = bytes[i++] ?? 0, b = bytes[i++] ?? 0, c = bytes[i++] ?? 0;
      const t = (a << 16) | (b << 8) | c;
      out += chars[(t >>> 18) & 63];
      out += chars[(t >>> 12) & 63];
      out += i - 2 < bytes.length ? chars[(t >>> 6) & 63] : "=";
      out += i - 1 < bytes.length ? chars[t & 63] : "=";
    }
    return out;
  }
  function b64decodeToBytes(b64) {
    assert(typeof b64 === "string", "b64decode: input is not string");
    if (!/^[A-Za-z0-9+/=]*$/.test(b64)) fail("b64decode: invalid charset");
    if (typeof atob === "function") {
      try {
        const s = atob(b64);
        const out = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
        return out;
      } catch {
        fail("b64decode: atob failed");
      }
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const map = Object.create(null);
    for (let i = 0; i < chars.length; i++) map[chars[i]] = i;
    const clean = b64.replace(/[\r\n\s]/g, "");
    const bytes = [];
    for (let i = 0; i < clean.length; i += 4) {
      const c0 = map[clean[i]]; const c1 = map[clean[i + 1]];
      const c2 = clean[i + 2] === "=" ? -1 : map[clean[i + 2]];
      const c3 = clean[i + 3] === "=" ? -1 : map[clean[i + 3]];
      if (c0 === undefined || c1 === undefined || (c2 === undefined && c2 !== -1) || (c3 === undefined && c3 !== -1)) {
        fail("b64decode: corrupt quartet");
      }
      const t = (c0 << 18) | (c1 << 12) | ((c2 & 63) << 6) | (c3 & 63);
      bytes.push((t >>> 16) & 255);
      if (c2 !== -1) bytes.push((t >>> 8) & 255);
      if (c3 !== -1) bytes.push(t & 255);
    }
    return new Uint8Array(bytes);
  }

  // ---------- bit I/O ----------
  const MASK = n => (n >= 31 ? 0x7fffffff : ((1 << n) - 1)) >>> 0;

  class BitWriter {
    constructor(){ this.buf = []; this.acc = 0; this.bits = 0; this.totalBits = 0; }
    write(code, nbits){
      assert(nbits > 0 && nbits <= 24, "BitWriter.write: nbits out of range");
      const val = code & MASK(nbits);
      for (let i = nbits - 1; i >= 0; i--) {
        const bit = (val >>> i) & 1;
        this.acc = (this.acc << 1) | bit;
        this.bits++;
        this.totalBits++;
        if (this.bits === 8) { this.buf.push(this.acc & 255); this.acc = 0; this.bits = 0; }
      }
    }
    finish(){
      if (this.bits > 0) {
        this.acc <<= (8 - this.bits);
        this.buf.push(this.acc & 255);
        this.acc = 0; this.bits = 0;
      }
      return { bytes: new Uint8Array(this.buf), bitLen: this.totalBits >>> 0 };
    }
  }

  class BitReader {
    constructor(bytes){ assert(isU8(bytes), "BitReader: bytes not Uint8Array"); this.bytes = bytes; this.i = 0; this.acc = 0; this.bits = 0; this.readBits = 0; this.totalBits = bytes.length * 8; }
    readBit(){
      if (this.bits === 0) {
        if (this.i >= this.bytes.length) return -1;
        this.acc = this.bytes[this.i++]; this.bits = 8;
      }
      const bit = (this.acc >>> 7) & 1;
      this.acc = (this.acc << 1) & 255;
      this.bits--; this.readBits++;
      return bit;
    }
    peekBits(k){
      const si = this.i, sa = this.acc, sb = this.bits, sr = this.readBits;
      let v = 0;
      for (let j = 0; j < k; j++) {
        const b = this.readBit();
        if (b < 0) break;
        v = (v << 1) | b;
      }
      this.i = si; this.acc = sa; this.bits = sb; this.readBits = sr;
      return v;
    }
    assertConsumedExactly(bitLen){
      assert(isI32(bitLen) && bitLen >= 0, "BitReader.assert: bad bitLen");
      assert(this.readBits <= bitLen, "HUF: read beyond advertised bit length");
      // Remaining bits up to next byte boundary must be zero padding
      const rem = bitLen - this.readBits;
      for (let j = 0; j < rem; j++) {
        const b = this.readBit();
        if (b < 0) fail("HUF: ran out while consuming tail padding");
        if (b !== 0) fail("HUF: nonzero padding bits");
      }
      // Now ensure we are exactly at header-advertised boundary
      const fullBytes = Math.ceil(bitLen / 8);
      assert(this.i === fullBytes, "HUF: payload has extra bytes after advertised end");
    }
  }

  // ---------- Huffman ----------
  function buildHuffmanCodeLengths(freq) {
    const nodes = [];
    for (let s = 0; s < 256; s++) if (freq[s] > 0) nodes.push({ w: freq[s], s, l: null, r: null });
    if (nodes.length === 0) nodes.push({ w: 1, s: 0, l: null, r: null });
    if (nodes.length === 1) {
      const lens = new Uint8Array(256); lens[nodes[0].s] = 1; return lens;
    }
    const pq = nodes.slice();
    while (pq.length > 1) {
      pq.sort((a, b) => a.w - b.w || (a.s ?? 0) - (b.s ?? 0));
      const a = pq.shift(), b = pq.shift();
      pq.push({ w: a.w + b.w, s: null, l: a, r: b });
    }
    const root = pq[0]; const lens = new Uint8Array(256);
    (function dfs(n, d){ if (n.s !== null) lens[n.s] = d || 1; else { dfs(n.l, d + 1); dfs(n.r, d + 1); } })(root, 0);
    return lens;
  }

  function makeCanonicalFromLengths(lensIn) {
    const lens = new Uint8Array(256); lens.set(lensIn);
    const maxLen = Math.max(0, ...lens);
    const blCount = new Uint32Array(Math.max(2, maxLen + 1));
    for (let s = 0; s < 256; s++) blCount[lens[s]]++;
    if (blCount[0] === 256) { blCount[0] = 255; blCount[1] = 1; lens[0] = 1; }

    const codeStart = new Uint32Array(blCount.length);
    for (let len = 1; len < blCount.length; len++) codeStart[len] = (codeStart[len - 1] + blCount[len - 1]) << 1;

    const nextCode = new Uint32Array(codeStart);
    const codes = new Uint32Array(256);
    const bitsArr = new Uint8Array(256);
    for (let s = 0; s < 256; s++) { const len = lens[s]; if (len) { codes[s] = nextCode[len]; bitsArr[s] = len; nextCode[len]++; } }

    const perLenSyms = {}; const perLenMin = {}; const perLenMax = {};
    for (let len = 1; len <= maxLen; len++) {
      const count = blCount[len]; if (!count) continue;
      const baseMasked = codeStart[len] & MASK(len);
      perLenMin[len] = baseMasked >>> 0;
      perLenMax[len] = (baseMasked + count - 1) >>> 0;
      const syms = []; for (let s = 0; s < 256; s++) if (lens[s] === len) syms.push(s);
      perLenSyms[len] = syms;
    }
    return { codes, bits: bitsArr, maxLen, perLenSyms, perLenMin, perLenMax, lens };
  }

  function huffmanEncode(bytes) {
    assert(isU8(bytes), "HUF enc: input not Uint8Array");
    const freq = new Uint32Array(256);
    for (let i = 0; i < bytes.length; i++) freq[bytes[i]]++;
    const lens = buildHuffmanCodeLengths(freq);
    const canon = makeCanonicalFromLengths(lens);

    const header = new Uint8Array(256); header.set(lens);
    const bw = new BitWriter();

    for (let i = 0; i < bytes.length; i++) {
      const s = bytes[i]; const nb = canon.bits[s]; const cd = canon.codes[s] & MASK(nb);
      bw.write(cd, nb);
    }
    const { bytes: bitBytes, bitLen } = bw.finish();

    const out = new Uint8Array(header.length + bitBytes.length);
    out.set(header, 0); out.set(bitBytes, header.length);
    return { packed: out, bitLen };
  }

  function huffmanStartDecode(bytes) {
    assert(isU8(bytes), "HUF dec: payload not bytes");
    assert(bytes.length >= 256, "Corrupt payload: too short for Huffman header");
    const lens = new Uint8Array(256); lens.set(bytes.subarray(0, 256));
    const canon = makeCanonicalFromLengths(lens);
    const br = new BitReader(bytes.subarray(256));
    return { br, canon };
  }

  function huffmanDecodeOne(dec) {
    let code = 0;
    for (let len = 1; len <= dec.canon.maxLen; len++) {
      const bit = dec.br.readBit(); if (bit < 0) fail("Corrupt payload: ran out of bits");
      code = ((code << 1) | bit) & MASK(len);
      const min = dec.canon.perLenMin[len]; const max = dec.canon.perLenMax[len];
      if (min === undefined) continue;
      if (code >= min && code <= max) {
        const idx = code - min; const sym = dec.canon.perLenSyms[len][idx];
        if (sym === undefined) fail("Corrupt payload: bad code");
        return sym & 255;
      }
    }
    fail("Corrupt payload: invalid codeword");
  }

  // ---------- RLE0 over MTF ----------
  function rle0Encode(arr) {
    assert(isU8(arr), "RLE0 enc: input not bytes");
    const out = [];
    for (let i = 0; i < arr.length; ) {
      if (arr[i] === 0) {
        let j = i; while (j < arr.length && arr[j] === 0 && (j - i) < 256) j++;
        out.push(0, (j - i) - 1); i = j;
      } else { out.push(arr[i]); i++; }
    }
    return new Uint8Array(out);
  }

  // ---------- MTF ----------
  function mtfEncode(bytes) {
    assert(isU8(bytes), "MTF enc: input not bytes");
    const dict = new Uint8Array(256); for (let i = 0; i < 256; i++) dict[i] = i;
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      const sym = bytes[i]; let j = 0; while (dict[j] !== sym) j++;
      out[i] = j; for (let k = j; k > 0; k--) dict[k] = dict[k - 1]; dict[0] = sym;
    }
    return out;
  }
  function mtfDecode(idxs) {
    assert(isU8(idxs), "MTF dec: input not bytes");
    const dict = new Uint8Array(256); for (let i = 0; i < 256; i++) dict[i] = i;
    const out = new Uint8Array(idxs.length);
    for (let i = 0; i < idxs.length; i++) {
      const j = idxs[i]; const sym = dict[j]; out[i] = sym;
      for (let k = j; k > 0; k--) dict[k] = dict[k - 1]; dict[0] = sym;
    }
    return out;
  }

  // ---------- BWT ----------
  function bwtEncode(bytes) {
    assert(isU8(bytes), "BWT enc: input not bytes");
    const n = bytes.length; if (n === 0) return { L: new Uint8Array(0), pi: 0 };
    const SA = new Uint32Array(n); for (let i = 0; i < n; i++) SA[i] = i;
    SA.sort((a, b) => {
      if (a === b) return 0;
      for (let k = 0; k < n; k++) { const ba = bytes[(a + k) % n], bb = bytes[(b + k) % n]; if (ba !== bb) return ba - bb; }
      return 0;
    });
    const L = new Uint8Array(n); let pi = 0;
    for (let i = 0; i < n; i++) { const idx = SA[i]; L[i] = bytes[(idx + n - 1) % n]; if (idx === 0) pi = i; }
    return { L, pi };
  }

  function bwtDecode(L, pi) {
    assert(isU8(L), "BWT dec: L not bytes"); assert(isI32(pi) && pi >= 0, "BWT dec: bad pi");
    const n = L.length; if (n === 0) return new Uint8Array(0);
    const count = new Uint32Array(256); for (let i = 0; i < n; i++) count[L[i]]++;
    const C = new Uint32Array(256); let sum = 0; for (let c = 0; c < 256; c++) { const t = count[c]; C[c] = sum; sum += t; }
    const occ = new Uint32Array(n); const seen = new Uint32Array(256);
    for (let i = 0; i < n; i++) { const c = L[i]; occ[i] = seen[c]; seen[c]++; }
    let i = pi; const out = new Uint8Array(n);
    for (let k = n - 1; k >= 0; k--) { const c = L[i]; out[k] = c; i = C[c] + occ[i]; }
    return out;
  }

  // ---------- public API ----------
  function compress(inputB64) {
    assert(typeof inputB64 === "string", "compress: input must be base64 string");
    const inputBytes = b64decodeToBytes(inputB64);
    const n = inputBytes.length;

    const { L, pi } = bwtEncode(inputBytes);
    const mtf = mtfEncode(L);
    const rle = rle0Encode(mtf);

    const { packed: huf, bitLen: hbits } = huffmanEncode(rle);

    const headerObj = { v: CFG.VER, alg: CFG.ALG, pi: pi >>> 0, n: n >>> 0, hbits: hbits >>> 0, rleLen: rle.length >>> 0 };
    const headerJson = new TextEncoder().encode(JSON.stringify(headerObj));
    const token = b64encodeBytes(headerJson) + "." + b64encodeBytes(huf);

    log("compress ok n:", n, "pi:", pi, "rleLen:", rle.length, "hbits:", hbits, "tokenB:", token.length);
    return token;
  }

  function decompress(token) {
    assert(typeof token === "string", "decompress: token must be string");
    const dot = token.indexOf(".");
    assert(dot > 0, "Invalid token: missing header dot");

    const headerB64 = token.slice(0, dot);
    const payloadB64 = token.slice(dot + 1);

    const headerBytes = b64decodeToBytes(headerB64);
    let header;
    try { header = JSON.parse(new TextDecoder().decode(headerBytes)); } catch { fail("Invalid header: not JSON"); }

    assert(header && header.v === CFG.VER, "Unsupported version");
    assert(header.alg === CFG.ALG, "Unsupported alg");
    const { pi, n, hbits, rleLen } = header;
    assert(isI32(pi) && pi >= 0, "Header pi invalid");
    assert(isI32(n) && n >= 0, "Header n invalid");
    assert(isI32(hbits) && hbits >= 0, "Header hbits invalid");
    assert(isI32(rleLen) && rleLen >= 0, "Header rleLen invalid");

    const payload = b64decodeToBytes(payloadB64);
    const dec = huffmanStartDecode(payload);

    const mtfIdx = new Uint8Array(n);
    let outi = 0;
    while (outi < n) {
      const sym = huffmanDecodeOne(dec);
      if (sym === 0) {
        const lenByte = huffmanDecodeOne(dec);
        const run = (lenByte + 1) >>> 0;
        assert(outi + run <= n, "RLE0 overflow");
        mtfIdx.fill(0, outi, outi + run);
        outi += run;
      } else {
        mtfIdx[outi++] = sym;
      }
    }

    // must have consumed exactly hbits from the Huffman payload
    dec.br.assertConsumedExactly(hbits);

    // reconstruct
    const L = mtfDecode(mtfIdx);
    const orig = bwtDecode(L, pi);
    return b64encodeBytes(orig);
  }

  return { compress, decompress };
})();
