## BWT + MTF + RLE + Huffman

# TextZip technical specification

## Scope

- Dependency free text oriented compressor for UTF-8 content transported as base64.
- Implemented in JavaScript for browsers; no external libraries.
- Deterministic round trip via pipeline: BWT -> MTF -> RLE0 -> canonical Huffman.
- Framed output token uses base64 header dot base64 payload.

## Public API

- compress(inputB64) -> string token "headerB64.payloadB64".
- decompress(token) -> string base64 of original bytes.

## Token format

- headerB64: base64 of JSON header.
- payloadB64: base64 of binary payload starting with Huffman header.
- Header JSON fields: v integer version, alg string "BWT+MTF+RLE+HUF", n original length in bytes, pi BWT primary index, hbits number of valid Huffman data bits after the 256 byte length table, rleLen number of bytes after RLE0 before Huffman.
- Example header object: { "v":1, "alg":"BWT+MTF+RLE+HUF", "n":77, "pi":17, "hbits":1234, "rleLen":96 }.

## Base64 layer

- Input to compress is base64; decoded to Uint8Array without dependencies.
- Output of decompress is base64 of original bytes.
- Implementations of b64encodeBytes and b64decodeToBytes use btoa/atob when available; otherwise pure JS fallback.
- Validation rejects non base64 charset and malformed quartets.

## Burrows Wheeler Transform

- bwtEncode: O(n^2 log n) rotation sort for clarity and determinism; returns L and primary index pi.
- bwtDecode: standard LF mapping using C cumulative counts and occurrence ranks; reconstructs original using pi.
- Edge case n==0 handled with L length 0 and pi 0.

## Move To Front

- 256 symbol static list initialized to 0..255.
- mtfEncode maps each byte to its index, then moves symbol to front.
- mtfDecode applies inverse using same list mutation.

## RLE0 over MTF output

- Encodes runs of zero indices only.
- Literal nonzero x emits single byte x.
- Run of zeros of length r in 1..256 emits pair [0, r-1]; runs longer than 256 are split into multiple pairs.
- Decoder reconstructs zero runs when symbol 0 is followed by one more Huffman decoded byte that is interpreted as runLenMinus1; run length equals value+1.

## Canonical Huffman coding

- Symbol alphabet is 0..255.
- Encoder builds code lengths from frequency of RLE0 output.
- Special cases: when no symbols, synthesize length 1 for symbol 0; when single symbol, assign length 1.
- Canonical code construction uses blCount per length and codeStart per length.
- Codes are left aligned integers; only lowest len bits are significant and are written.
- Encoded stream layout: 256 byte table of code lengths, then concatenated codewords MSB first.
- Bitwriter writes only len bits of code masked by MASK(len) and returns total bit length hbits.
- Decoder builds per length ranges min..max using masked codeStart and arrays of symbols in canonical order.
- huffmanDecodeOne reads bits MSB first, maintains running code masked to current length, matches on per length range.
- Decompression must consume exactly hbits bits; remaining pad bits up to next byte boundary must be zero; extra trailing bytes are rejected.

## Framing, validation, and error model

- compress creates header with v, alg, n, pi, hbits, rleLen and returns base64(header)."."base64(payload).
- decompress splits at first dot and validates presence.
- Header validation checks version, algorithm, integer types and non negative values.
- Payload validation requires at least 256 bytes for Huffman table; bitreader verifies exact consumption with hbits and zero padding.
- RLE0 bounds check ensures produced MTF index length equals n; overflow raises error.
- Fail fast errors use concise messages: "Invalid token: missing header dot", "Invalid header: not JSON", "Unsupported version", "Unsupported alg", "Header n invalid", "Corrupt payload: too short for Huffman header", "Corrupt payload: ran out of bits", "Corrupt payload: bad code", "Corrupt payload: invalid codeword", "HUF: nonzero padding bits", "HUF: payload has extra bytes after advertised end", "RLE0 overflow", "b64decode: invalid charset", "b64decode: corrupt quartet".

## Byte and bit conventions

- All byte arrays are Uint8Array.
- Bit order is MSB first within each byte on both write and read.
- Padding uses zeros to next byte boundary on encode; hbits carries exact data bit length to decoder.

## Determinism and compatibility

- No randomized tie breaking in canonical code order; codes depend only on lengths and natural symbol order 0..255.
- No external dependencies; uses TextEncoder and TextDecoder for header JSON in browsers.

## Complexity and performance

- BWT encode O(n^2 log n) for correctness oriented baseline; acceptable for small blocks and DevTools testing.
- Remaining stages are O(n).
- Memory peaks are bounded by a handful of Uint8Array buffers of size O(n) and small tables.

## Security and robustness decisions

- Strict header and payload validation with early exits.
- Defensive base64 parsing and charset checks.
- Decoder requires exact bit consumption preventing trailing garbage acceptance.
- RLE0 format is unambiguous and bounds checked.

## Testing decisions

- Round trip tests for ASCII, empty input, small repetitive input, and mixed Unicode after UTF-8 to base64 conversion.
- Negative tests for missing header dot, wrong algorithm, and truncated payloads.
- Logging is off by default; a single internal flag CFG.DEBUG can be toggled for development traces.

## Limitations and future work

- BWT encoder is quadratic; replace with suffix array or induced sorting for large blocks when needed.
- RLE0 only targets zero runs; general RLE could be explored if MTF distribution warrants it.
- No block splitting; single block per call for simplicity.







---



So imagine that I want to have a dependency-free compression algorithm for text only. So this is very important that it should be optimized for text, which means we don't do binary, but I think we still need to compress some UTF-8, so it's UTF-8 compression algorithm. And I want this algorithm to be implemented from scratch in JavaScript. So we have like a compress and decompress, and the parameter is not even some kind of string, but rather like a string, so string, which is... I think this string should be base64 encoded, and this will work mostly in the browser, so we can do b2a and a2b functions built-in to then perform the compression. So the text will be base64 encoded, and the function compress will take uncompressed base64 and then compress it somehow. It can decode the base64 if needed, and then internally, transparently, and then return another base64 string that will be compressed. So which algorithms do you think I can use to implement, first of all, from scratch without using any browser functions and without using any dependencies? Not the browser functions, but we can use the browser functions, but we cannot use external dependencies. And here the idea is that the input text is base64 encoded UTF-8 and output text. And the output is a base64 encoded compressed thing. So we need to implement in browser compress and decompress. So which algorithms will you suggest that will suit the best, with the best efficiency for this task? And the text itself will be like a human text, and the source code.



Recommended approach:

1. BWT + MTF + RLE + Huffman
    Best text-oriented balance of ratio vs complexity for JS. Block transform clusters similar symbols, MTF makes small integers, RLE shrinks runs, Huffman finishes the job. Works well on UTF-8 text and source code, deterministic, no external deps, easy to keep purely byte-based.
2. LZ77 or LZSS + Huffman, Deflate-like
    Classic dictionary coder with static or dynamic Huffman. Simpler window search than full Deflate and still good ratios. Streams well, predictable memory, friendly to browser perf.
3. PPM variant + range or arithmetic coder
    Highest ratios on human text, but substantially more complex. Good if you want max compression and accept slower JS, more RAM, and careful numeric coding.
4. LZP + Huffman or ANS
    Predict-next-byte by context; simpler than PPM and often better than plain LZ77 on text. Nice intermediate if BWT or PPM feel heavy.
5. Word or token dictionary + entropy coder
    Tokenize UTF-8 to words, numbers, punctuation, identifiers, and map frequent tokens to small codes, then Huffman or ANS. Excellent for English text and source code, but requires careful reversible tokenization and a stored or adaptive dictionary.

Comparison on English text and source code, byte-based, implemented in JS:

| Method                   | Typical ratio | Speed JS | Memory       | Complexity  | Notes                                                |
| ------------------------ | ------------- | -------- | ------------ | ----------- | ---------------------------------------------------- |
| BWT+MTF+RLE+Huffman      | 2.7x–3.5x     | Medium   | Block sized  | Medium      | Block mode; good locality; easy Huffman bitstream    |
| LZ77+Huffman             | 2.2x–3.0x     | Fast     | Window sized | Low–Medium  | Streaming; simpler to implement than full Deflate    |
| PPM-C/D + Range          | 3.0x–3.8x     | Slow     | High         | High        | Best ratios; careful 32-bit math or BigInt for coder |
| LZP + Huffman            | 2.5x–3.2x     | Med–Fast | Low          | Medium      | Strong on text; simple context hash table            |
| Token dict + Huffman/ANS | 2.8x–3.6x     | Medium   | Medium       | Medium–High | Language sensitive; great on code repos              |

Why not Brotli, Zstd, LZMA
 All are doable, but each is heavy to implement correctly from scratch in browser JS. LZMA and Brotli require sophisticated modeling and range coding; Zstd adds complex match finders and FSE/ANS tables. For a from-scratch, dependency-free goal, they are overkill unless you port.

Recommended stack for your use case
 If you want best overall efficiency without heroic effort: BWT + MTF + RLE + Huffman. If you want streaming and simpler code: LZ77 + Huffman.

Key implementation notes for browser JS and base64 IO

- Work on bytes, not JS UTF-16 strings. Base64 decode to Uint8Array, compress bytes, then base64-encode the compressed byte stream. Reverse on decompress.
- Always be explicit about endianness and bit order for entropy coding. Define a canonical bitstream format.
- For UTF-8, no special handling is needed if you stay byte-oriented. The model naturally learns multibyte patterns.
- Use typed arrays everywhere. Avoid per-byte string concatenation.
- Consider Web Workers for long blocks to keep the UI responsive.

Minimal design outline

- API
   compress(b64In: string, options?): string
   decompress(b64In: string): string
   Both return base64 of the compressed or original bytes. The caller handles text encoding if needed.
- Base64 wrapper
   Decode with atob or a hand-rolled base64 if you want zero built-ins. Encode the final compressed bytes back to base64.
- BWT pipeline sketch
  1. Split input into blocks, e.g. 256 KiB to 1 MiB.
  2. Suffix array or induced sorting SA-IS for BWT; store primary index per block.
  3. Move-to-front over BWT output.
  4. RLE on runs of zeros produced by MTF.
  5. Per-block canonical Huffman. Emit code lengths first, then data bits.
  6. Container header with magic, version, block size, block count, per-block primary index, and Huffman tables.
- LZ77 + Huffman sketch
  1. Sliding window, e.g. 32 KiB. Hash-chain or binary-tree match finder.
  2. Emit literals and length-distance pairs.
  3. Canonical Huffman for literals/lengths and distances; rebuild per chunk or use static tables.
  4. Container with code length headers and optional final Adler-32.

Entropy coder choice

- Canonical Huffman is easiest and fast in JS.
- Range coding or rANS gives better density. If you go ANS, use rANS 32x with interleaving 2 or 4 streams for speed, but it is more work.

Complexity estimates

- BWT stack: ~500–900 lines for SA-IS BWT + ~200–400 lines for MTF, RLE, canonical Huffman, plus container.
- LZ77+Huffman: ~700–1200 lines depending on match finder.

Edge cases and guardrails

- Already compressed data and short inputs can expand. Add a stored block mode, and record original size to allow pass-through.
- Enforce block checksums to detect corruption.
- Use URL-safe base64 if needed and normalize padding.

Suggested starting order

- Implement canonical Huffman encoder and decoder with bit I/O.
- Implement LZ77 with a simple hash-chain.
- If you want better text ratios later, add BWT pipeline as an alternative mode.

If you want, I can provide a small canonical Huffman bit-exact reference and a skeleton for both pipelines sized for browser use.



```js
// textzip_helpers.js function utf8ToB64(s) { const bytes = new TextEncoder().encode(s); let bin = ""; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return btoa(bin); } function b64ToUtf8(b64) { const bin = atob(b64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); } function compressText(str) { const b64 = utf8ToB64(str); return TextZip.compress(b64); } function decompressTokenToText(token) { const b64 = TextZip.decompress(token); return b64ToUtf8(b64); } function roundTrip(str) { const inB64 = utf8ToB64(str); const token = TextZip.compress(inB64); const outB64 = TextZip.decompress(token); const ok = inB64 === outB64; const header = token.split(".")[0]; const payload = token.split(".")[1]; const rawBytes = atob(inB64).length; const compBytes = atob(payload).length + atob(header).length; const ratio = rawBytes === 0 ? 1 : (rawBytes / compBytes).toFixed(3); return { ok, rawBytes, compBytes, ratio, token }; } async function benchmark(str, iters = 3) { const inB64 = utf8ToB64(str); let csum = 0, dsum = 0, token = ""; for (let i = 0; i < iters; i++) { const t0 = performance.now(); token = TextZip.compress(inB64); const t1 = performance.now(); TextZip.decompress(token); const t2 = performance.now(); csum += (t1 - t0); dsum += (t2 - t1); await new Promise(r => setTimeout(r, 0)); } const header = token.split(".")[0]; const payload = token.split(".")[1]; const rawBytes = atob(inB64).length; const compBytes = atob(payload).length + atob(header).length; return { avgCompressMs: +(csum / iters).toFixed(2), avgDecompressMs: +(dsum / iters).toFixed(2), rawBytes, compBytes, ratio: +(rawBytes / compBytes).toFixed(3), tokenSample: token.slice(0, 80) + "..." }; } // Turn off verbose tracing after you are satisfied // TextZip._int; // available internals if you need them // Toggle debug: (() => { const d = /TextZip\]\s/; DEBUG = undefined; })(); // ignore; DEBUG is scoped inside IIFE // Helper toggles (edit inside the file if needed): // const DEBUG = { on:false, traceDecode:false, traceEncode:false, maxTrace:64 }; // Round trips const s1 = "The quick brown fox jumps over the lazy dog. The quick brown fox jumps again."; const r1 = roundTrip(s1); console.log(r1.ok, r1.ratio, r1.token.slice(0,80)+"..."); // Empty, small, and unicode console.log(roundTrip("").ok); console.log(roundTrip("aaaaaaa").ok); console.log(roundTrip("привет мир — 你好，世界 — 😀😀😀").ok); // Failure cases: bad header, wrong alg, truncated payload try { TextZip.decompress("bad-header-without-dot"); } catch(e){ console.log("ok:", e.message); } const good = compressText("hello hello hello"); const parts = good.split("."); const badAlgHeader = btoa(JSON.stringify({v:1,alg:"OTHER",pi:0,n:5}))+"."+parts[1]; try { TextZip.decompress(badAlgHeader); } catch(e){ console.log("ok:", e.message); } try { TextZip.decompress(parts[0]+"."+parts[1].slice(0, parts[1].length-4)); } catch(e){ console.log("ok:", e.message); }
```

