import test from "node:test";
import assert from "node:assert/strict";
import { buildPublicUrls, generateRecordHtml, pageRange, parseManifest, parseTargetUrl, randomId, sanitizeText } from "../shared/core.js";
import { isFresh } from "../assets/data.js";

test("target URL serialization preserves query order and fragment", () => {
  assert.equal(parseTargetUrl(" https://example.com/a?b=2&a=1#part "), "https://example.com/a?b=2&a=1#part");
  for (const value of ["example.com", "/relative", "file:///tmp/a", "javascript:alert(1)"]) assert.throws(() => parseTargetUrl(value));
});

test("manifest validation preserves order and rejects invalid or duplicate IDs", () => {
  assert.deepEqual(parseManifest("New00001\r\n Old00002 \n\n"), ["New00001", "Old00002"]);
  assert.throws(() => parseManifest("bad/id\n"), { code: "MANIFEST_INVALID_ID" });
  assert.throws(() => parseManifest("Same0001\nSame0001\n"), { code: "MANIFEST_DUPLICATE_ID" });
});

test("random IDs use rejection sampling and the exact alphabet", () => {
  const id = randomId(Uint8Array.from([248, 0, 61, 62, 123, 124, 185, 186, 247]));
  assert.match(id, /^[A-Za-z0-9]{8}$/);
  assert.equal(id.length, 8);
});

test("sanitizer applies the exact script, punctuation, replacement and fallback contract", () => {
  assert.equal(sanitizeText("🔥 Amazing Article — New Browser Tricks 2026 🚀"), "Amazing Article New Browser Tricks");
  assert.equal(sanitizeText("Guide — Руководство — 日本語 — 中文"), "Guide Руководство 日本語 中文");
  assert.equal(sanitizeText("Hello😀World"), "Hello World");
  assert.equal(sanitizeText("-- Статья о браузерах --"), "Статья о браузерах");
  assert.equal(sanitizeText("1234 😀"), "(no title)");
  assert.equal(sanitizeText("1234 😀", "description"), "(no description)");
  assert.equal(Array.from(sanitizeText("A".repeat(200))).length, 160);
});

test("page ranges retain six-entry logical boundaries", () => {
  assert.deepEqual(pageRange(0, 13), { start: 0, end: 6 });
  assert.deepEqual(pageRange(1, 13), { start: 6, end: 12 });
  assert.deepEqual(pageRange(2, 13), { start: 12, end: 13 });
  for (const count of [0, 1, 5, 6, 7, 12, 13]) {
    const pageCount = count ? Math.ceil(count / 6) : 0;
    const visited = [];
    for (let page = 0; page < pageCount; page += 1) {
      const range = pageRange(page, count);
      for (let index = range.start; index < range.end; index += 1) visited.push(index);
    }
    assert.deepEqual(visited, Array.from({ length: count }, (_, index) => index));
  }
});

test("record HTML is static, escaped, prefix-safe and crawler-readable", () => {
  const urls = buildPublicUrls("https://example.github.io/tools/archive", "aB7kP2xQ");
  assert.equal(urls.shortUrl, "https://example.github.io/tools/archive/lnk/aB7kP2xQ/");
  const html = generateRecordHtml({ id: "aB7kP2xQ", targetUrl: "https://example.com/?a=1&b=2", createdAt: "2026-08-16T18:42:17Z", title: 'A "quoted" title', description: "One & two", ...urls });
  assert.match(html, /name="lnk:id" content="aB7kP2xQ"/);
  assert.match(html, /property="og:type" content="website"/);
  assert.match(html, /A &quot;quoted&quot; title/);
  assert.match(html, /One &amp; two/);
  assert.match(html, /http-equiv="refresh"/);
  assert.match(html, /location\.replace/);
  assert.match(html, /Continue to the original page/);
});

test("cache freshness has an exact one-hour boundary and rejects future anomalies", () => {
  const original = Date.now;
  Date.now = () => 10_000_000;
  try {
    assert.equal(isFresh(10_000_000 - 3_599_999), true);
    assert.equal(isFresh(10_000_000 - 3_600_000), false);
    assert.equal(isFresh(10_000_000 + 60_001), false);
  } finally { Date.now = original; }
});
