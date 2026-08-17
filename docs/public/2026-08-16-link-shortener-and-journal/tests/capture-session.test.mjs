import test from "node:test";
import assert from "node:assert/strict";
import { captureWithBrowserFallback, normalizeHeadlessUserAgent, shouldRetryHeaded } from "../scripts/capture-session.mjs";

const HEADLESS_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/151.0.7922.34 Safari/537.36";
const NORMAL_UA = HEADLESS_UA.replace("HeadlessChrome/", "Chrome/");

function silentLogger() {
  return Object.fromEntries(["info", "debug", "warn", "error"].map((level) => [level, () => {}]));
}

function fakeBrowser(userAgent, closed) {
  return {
    async newContext() {
      return {
        async newPage() { return { async evaluate() { return userAgent; } }; },
        async close() {}
      };
    },
    async close() { closed.push(userAgent); }
  };
}

function fakeBrowserType(userAgents, launches, closed) {
  return {
    async launch(options) {
      launches.push(options);
      return fakeBrowser(userAgents[launches.length - 1], closed);
    }
  };
}

test("headless user-agent normalization preserves the discovered platform and exact browser version", () => {
  assert.deepEqual(normalizeHeadlessUserAgent(HEADLESS_UA), { userAgent: NORMAL_UA, normalized: true });
  assert.deepEqual(normalizeHeadlessUserAgent(NORMAL_UA), { userAgent: NORMAL_UA, normalized: false });
});

test("empty, malformed, and ambiguous browser identities fail clearly", () => {
  for (const value of ["", "not a browser", `${HEADLESS_UA} HeadlessChrome/1`]) {
    assert.throws(() => normalizeHeadlessUserAgent(value), (error) => error.code === "CAPTURE_BROWSER_IDENTITY_INVALID" && error.stage === "browser identity");
  }
});

test("only access challenges are eligible for a headed retry", () => {
  assert.equal(shouldRetryHeaded({ code: "CAPTURE_ACCESS_CHALLENGE" }), true);
  for (const code of ["CAPTURE_HTTP_ERROR", "CAPTURE_NO_VALID_REGION", "CAPTURE_FAILED", undefined]) assert.equal(shouldRetryHeaded({ code }), false);
});

test("successful primary capture uses normalized identity and closes its browser", async () => {
  const launches = [];
  const closed = [];
  const attempts = [];
  const result = await captureWithBrowserFallback({
    targetUrl: "https://example.test/article",
    outputPath: "preview.jpg",
    logger: silentLogger(),
    browserType: fakeBrowserType([HEADLESS_UA], launches, closed),
    capture: async (options) => { attempts.push(options); return { ok: true }; }
  });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(launches, [{ headless: true }]);
  assert.equal(attempts[0].captureMode, "headless");
  assert.equal(attempts[0].userAgent, NORMAL_UA);
  assert.equal(closed.length, 1);
});

test("a confirmed challenge retries once in headed bundled Chromium and closes both browsers", async () => {
  const launches = [];
  const closed = [];
  const attempts = [];
  const result = await captureWithBrowserFallback({
    targetUrl: "https://example.test/challenged",
    outputPath: "preview.jpg",
    logger: silentLogger(),
    browserType: fakeBrowserType([HEADLESS_UA, NORMAL_UA], launches, closed),
    capture: async (options) => {
      attempts.push({ mode: options.captureMode, userAgent: options.userAgent });
      if (options.captureMode === "headless") throw Object.assign(new Error("challenge"), { code: "CAPTURE_ACCESS_CHALLENGE", stage: "page readiness", context: { "HTTP status": 403 } });
      return { ok: true, mode: options.captureMode };
    }
  });
  assert.deepEqual(result, { ok: true, mode: "headed" });
  assert.deepEqual(launches, [{ headless: true }, { headless: false }]);
  assert.deepEqual(attempts, [{ mode: "headless", userAgent: NORMAL_UA }, { mode: "headed", userAgent: NORMAL_UA }]);
  assert.equal(closed.length, 2);
});

test("ordinary capture failures do not launch headed Chromium", async () => {
  const launches = [];
  const closed = [];
  const ordinary = Object.assign(new Error("not found"), { code: "CAPTURE_HTTP_ERROR", stage: "page navigation" });
  await assert.rejects(captureWithBrowserFallback({
    targetUrl: "https://example.test/missing",
    outputPath: "preview.jpg",
    logger: silentLogger(),
    browserType: fakeBrowserType([HEADLESS_UA], launches, closed),
    capture: async () => { throw ordinary; }
  }), (error) => error === ordinary);
  assert.deepEqual(launches, [{ headless: true }]);
  assert.equal(closed.length, 1);
});

test("a failed headed retry preserves the original challenge and records bounded fallback context", async () => {
  const launches = [];
  const closed = [];
  const original = Object.assign(new Error("challenge"), { code: "CAPTURE_ACCESS_CHALLENGE", stage: "page readiness", context: { "HTTP status": 403 } });
  let attempt = 0;
  await assert.rejects(captureWithBrowserFallback({
    targetUrl: "https://example.test/challenged",
    outputPath: "preview.jpg",
    logger: silentLogger(),
    browserType: fakeBrowserType([HEADLESS_UA, NORMAL_UA], launches, closed),
    capture: async () => {
      attempt += 1;
      if (attempt === 1) throw original;
      throw Object.assign(new Error("still blocked"), { code: "CAPTURE_ACCESS_CHALLENGE", stage: "page readiness" });
    }
  }), (error) => {
    assert.equal(error, original);
    assert.equal(error.code, "CAPTURE_ACCESS_CHALLENGE");
    assert.match(error.context["Headed retry"], /^CAPTURE_ACCESS_CHALLENGE at page readiness: still blocked$/);
    return true;
  });
  assert.equal(attempt, 2);
  assert.deepEqual(launches, [{ headless: true }, { headless: false }]);
  assert.equal(closed.length, 2);
});

test("a headed launch failure also preserves the original challenge and closes the primary browser", async () => {
  const launches = [];
  const closed = [];
  const original = Object.assign(new Error("challenge"), { code: "CAPTURE_ACCESS_CHALLENGE", stage: "page readiness", context: { "HTTP status": 403 } });
  const browserType = {
    async launch(options) {
      launches.push(options);
      if (!options.headless) throw new Error("No interactive desktop is available.");
      return fakeBrowser(HEADLESS_UA, closed);
    }
  };
  await assert.rejects(captureWithBrowserFallback({
    targetUrl: "https://example.test/challenged",
    outputPath: "preview.jpg",
    logger: silentLogger(),
    browserType,
    capture: async () => { throw original; }
  }), (error) => {
    assert.equal(error, original);
    assert.match(error.context["Headed retry"], /^CAPTURE_HEADED_RETRY_FAILED at browser retry: No interactive desktop is available\.$/);
    return true;
  });
  assert.deepEqual(launches, [{ headless: true }, { headless: false }]);
  assert.equal(closed.length, 1);
});
