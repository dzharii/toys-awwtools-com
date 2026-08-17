import test from "node:test";
import assert from "node:assert/strict";
import { findCaptureAdapter, registeredCaptureHostnames } from "../scripts/capture-adapters/registry.mjs";
import { youtubeThumbnailCandidates, youtubeVideoId } from "../scripts/capture-adapters/youtube.mjs";

test("capture adapter registry uses exact normalized hostnames", () => {
  for (const hostname of ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]) {
    assert.equal(findCaptureAdapter(`https://${hostname}/watch?v=un_O5WrZDNc`).adapter?.name, "youtube");
  }
  assert.equal(findCaptureAdapter("https://YOUTUBE.COM:443/watch?v=un_O5WrZDNc").adapter?.name, "youtube");
  assert.equal(findCaptureAdapter("https://youtube.com.evil.example/watch?v=un_O5WrZDNc").adapter, null);
  assert.deepEqual(registeredCaptureHostnames(), ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
});

test("YouTube adapter identifies official URL forms and deterministic thumbnail candidates", () => {
  for (const value of [
    "https://www.youtube.com/watch?v=un_O5WrZDNc",
    "https://youtube.com/watch?v=un_O5WrZDNc",
    "https://m.youtube.com/watch?v=un_O5WrZDNc",
    "https://youtu.be/un_O5WrZDNc"
  ]) assert.equal(youtubeVideoId(value), "un_O5WrZDNc");
  assert.equal(youtubeVideoId("https://youtube.com/channel/un_O5WrZDNc"), null);
  const candidates = youtubeThumbnailCandidates("https://youtu.be/un_O5WrZDNc", "https://i.ytimg.com/vi/un_O5WrZDNc/maxresdefault.jpg");
  assert.equal(candidates[0], "https://i.ytimg.com/vi/un_O5WrZDNc/maxresdefault.jpg");
  assert.equal(new Set(candidates).size, candidates.length);
  assert.equal(youtubeThumbnailCandidates("https://youtu.be/un_O5WrZDNc", "https://evil.example/preview.jpg").some((url) => url.includes("evil.example")), false);
});
