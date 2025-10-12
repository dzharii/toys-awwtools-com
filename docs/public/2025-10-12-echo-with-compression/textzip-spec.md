# TextZip technical specification

Date: 2025-10-12

## Scope

* Dependency free text oriented compressor for UTF-8 content transported as base64.
* Implemented in JavaScript for browsers; no external libraries.
* Deterministic round trip via pipeline: BWT -> MTF -> RLE0 -> canonical Huffman.
* Framed output token uses base64 header dot base64 payload.

## Public API

* compress(inputB64) -> string token "headerB64.payloadB64".
* decompress(token) -> string base64 of original bytes.

## Token format

* headerB64: base64 of JSON header.
* payloadB64: base64 of binary payload starting with Huffman header.
* Header JSON fields: v integer version, alg string "BWT+MTF+RLE+HUF", n original length in bytes, pi BWT primary index, hbits number of valid Huffman data bits after the 256 byte length table, rleLen number of bytes after RLE0 before Huffman.
* Example header object: { "v":1, "alg":"BWT+MTF+RLE+HUF", "n":77, "pi":17, "hbits":1234, "rleLen":96 }.

## Base64 layer

* Input to compress is base64; decoded to Uint8Array without dependencies.
* Output of decompress is base64 of original bytes.
* Implementations of b64encodeBytes and b64decodeToBytes use btoa/atob when available; otherwise pure JS fallback.
* Validation rejects non base64 charset and malformed quartets.

## Burrows Wheeler Transform

* bwtEncode: O(n^2 log n) rotation sort for clarity and determinism; returns L and primary index pi.
* bwtDecode: standard LF mapping using C cumulative counts and occurrence ranks; reconstructs original using pi.
* Edge case n==0 handled with L length 0 and pi 0.

## Move To Front

* 256 symbol static list initialized to 0..255.
* mtfEncode maps each byte to its index, then moves symbol to front.
* mtfDecode applies inverse using same list mutation.

## RLE0 over MTF output

* Encodes runs of zero indices only.
* Literal nonzero x emits single byte x.
* Run of zeros of length r in 1..256 emits pair [0, r-1]; runs longer than 256 are split into multiple pairs.
* Decoder reconstructs zero runs when symbol 0 is followed by one more Huffman decoded byte that is interpreted as runLenMinus1; run length equals value+1.

## Canonical Huffman coding

* Symbol alphabet is 0..255.
* Encoder builds code lengths from frequency of RLE0 output.
* Special cases: when no symbols, synthesize length 1 for symbol 0; when single symbol, assign length 1.
* Canonical code construction uses blCount per length and codeStart per length.
* Codes are left aligned integers; only lowest len bits are significant and are written.
* Encoded stream layout: 256 byte table of code lengths, then concatenated codewords MSB first.
* Bitwriter writes only len bits of code masked by MASK(len) and returns total bit length hbits.
* Decoder builds per length ranges min..max using masked codeStart and arrays of symbols in canonical order.
* huffmanDecodeOne reads bits MSB first, maintains running code masked to current length, matches on per length range.
* Decompression must consume exactly hbits bits; remaining pad bits up to next byte boundary must be zero; extra trailing bytes are rejected.

## Framing, validation, and error model

* compress creates header with v, alg, n, pi, hbits, rleLen and returns base64(header)."."base64(payload).
* decompress splits at first dot and validates presence.
* Header validation checks version, algorithm, integer types and non negative values.
* Payload validation requires at least 256 bytes for Huffman table; bitreader verifies exact consumption with hbits and zero padding.
* RLE0 bounds check ensures produced MTF index length equals n; overflow raises error.
* Fail fast errors use concise messages: "Invalid token: missing header dot", "Invalid header: not JSON", "Unsupported version", "Unsupported alg", "Header n invalid", "Corrupt payload: too short for Huffman header", "Corrupt payload: ran out of bits", "Corrupt payload: bad code", "Corrupt payload: invalid codeword", "HUF: nonzero padding bits", "HUF: payload has extra bytes after advertised end", "RLE0 overflow", "b64decode: invalid charset", "b64decode: corrupt quartet".

## Byte and bit conventions

* All byte arrays are Uint8Array.
* Bit order is MSB first within each byte on both write and read.
* Padding uses zeros to next byte boundary on encode; hbits carries exact data bit length to decoder.

## Determinism and compatibility

* No randomized tie breaking in canonical code order; codes depend only on lengths and natural symbol order 0..255.
* No external dependencies; uses TextEncoder and TextDecoder for header JSON in browsers.

## Complexity and performance

* BWT encode O(n^2 log n) for correctness oriented baseline; acceptable for small blocks and DevTools testing.
* Remaining stages are O(n).
* Memory peaks are bounded by a handful of Uint8Array buffers of size O(n) and small tables.

## Security and robustness decisions

* Strict header and payload validation with early exits.
* Defensive base64 parsing and charset checks.
* Decoder requires exact bit consumption preventing trailing garbage acceptance.
* RLE0 format is unambiguous and bounds checked.

## Testing decisions

* Round trip tests for ASCII, empty input, small repetitive input, and mixed Unicode after UTF-8 to base64 conversion.
* Negative tests for missing header dot, wrong algorithm, and truncated payloads.
* Logging is off by default; a single internal flag CFG.DEBUG can be toggled for development traces.

## Limitations and future work

* BWT encoder is quadratic; replace with suffix array or induced sorting for large blocks when needed.
* RLE0 only targets zero runs; general RLE could be explored if MTF distribution warrants it.
* No block splitting; single block per call for simplicity.

## Integration with Echo v2

* TextZip is loaded as a global module via script tag in index.html
* Echo's encoding: JSON → UTF-8 → base64 → TextZip.compress() → URL-safe token
* Echo's decoding: URL-safe token → TextZip.decompress() → base64 → UTF-8 → JSON
* URL safety: Replace `+` with `-`, `/` with `_`, trim trailing `=`
* Transparent to end users: compression happens automatically
* Benefits: Significantly reduced URL length while maintaining full functionality

## Decision log

### 2025-10-12: Integration into Echo v2

**Decision**: Integrate TextZip compression into Echo v2 as transparent middleware layer

**Rationale**:
- URL fragments can become very long with base64-encoded JSON
- Browser URL length limits vary (2000-8000 chars typically)
- Compression improves shareability and reduces risk of hitting limits
- BWT+MTF+RLE+HUF pipeline is well-suited for text content with repetition
- No backward compatibility concerns as this is a new version

**Implementation approach**:
- Created standalone textzip.js module
- Modified base64UrlEncodeObj and base64UrlDecodeToObj to wrap TextZip calls
- Maintained same external API for rest of application
- Added compression metadata to readme and created this specification

**Trade-offs accepted**:
- O(n²log n) BWT complexity acceptable for typical post sizes (<10KB uncompressed)
- Slightly increased initial parsing time offset by smaller URL transmission
- No fallback to uncompressed format (breaking change from v1)
