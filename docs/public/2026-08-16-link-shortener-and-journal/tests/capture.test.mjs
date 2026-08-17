import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { capturePage } from "../scripts/capture.mjs";

const logger = () => Object.fromEntries(["info", "debug", "warn", "error"].map((level) => [level, () => {}]));

async function withResponseServer(status, headers, callback) {
  const server = createServer((request, response) => {
    response.writeHead(status, { "Content-Type": "text/html; charset=utf-8", ...headers });
    response.end("<!doctype html><title>Fixture response</title><main><h1>Fixture response</h1></main>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    return await callback(`http://127.0.0.1:${server.address().port}/target`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("documented Cloudflare challenge responses are classified before generic HTTP errors", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await withResponseServer(403, { "cf-mitigated": "challenge", "cf-ray": "fixture-ray", Server: "fixture-edge" }, async (targetUrl) => {
      await assert.rejects(capturePage({ browser, targetUrl, outputPath: "unused.jpg", logger: logger(), captureMode: "headless" }), (error) => {
        assert.equal(error.code, "CAPTURE_ACCESS_CHALLENGE");
        assert.equal(error.stage, "page readiness");
        assert.equal(error.context["HTTP status"], 403);
        assert.equal(error.context["Challenge marker"], "challenge");
        assert.equal(error.context["Cloudflare Ray ID"], "fixture-ray");
        assert.equal(error.context["Capture mode"], "headless");
        assert.equal("Cookie" in error.context, false);
        return true;
      });
    });
  } finally {
    await browser.close();
  }
});

test("ordinary HTTP failures remain CAPTURE_HTTP_ERROR and retain bounded context", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await withResponseServer(404, {}, async (targetUrl) => {
      await assert.rejects(capturePage({ browser, targetUrl, outputPath: "unused.jpg", logger: logger(), captureMode: "headless" }), (error) => {
        assert.equal(error.code, "CAPTURE_HTTP_ERROR");
        assert.equal(error.stage, "page navigation");
        assert.equal(error.context["HTTP status"], 404);
        assert.equal(error.context["Challenge marker"], undefined);
        return true;
      });
    });
  } finally {
    await browser.close();
  }
});

test("rendered challenge text classifies nonstandard challenge responses without a provider header", async () => {
  const server = createServer((request, response) => {
    response.writeHead(403, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<!doctype html><title>Security verification</title><body>Checking your browser. Verify you are human.</body>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const targetUrl = `http://127.0.0.1:${server.address().port}/challenge`;
    await assert.rejects(capturePage({ browser, targetUrl, outputPath: "unused.jpg", logger: logger(), captureMode: "headless" }), (error) => {
      assert.equal(error.code, "CAPTURE_ACCESS_CHALLENGE");
      assert.equal(error.context["Challenge marker"], undefined);
      assert.equal(error.context["Challenge evidence"], "rendered access-challenge text");
      return true;
    });
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("authentication and CAPTCHA barriers retain distinct non-retryable codes", async () => {
  const server = createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(request.url === "/captcha"
      ? "<!doctype html><title>CAPTCHA</title><body>Complete this CAPTCHA to continue.</body>"
      : "<!doctype html><title>Sign in</title><body><form><label>Password <input type=password></label><button>Log in</button></form></body>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const [pathname, code] of [["/captcha", "CAPTURE_CAPTCHA_REQUIRED"], ["/login", "CAPTURE_AUTHENTICATION_WALL"]]) {
      await assert.rejects(capturePage({ browser, targetUrl: `${origin}${pathname}`, outputPath: "unused.jpg", logger: logger(), captureMode: "headless" }), (error) => {
        assert.equal(error.code, code);
        assert.equal(error.stage, "page readiness");
        return true;
      });
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("unknown hostnames retain the generic deterministic capture path", async () => {
  const server = createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<!doctype html><html><head><title>Generic capture fixture</title><meta name="description" content="A stable generic capture fixture with useful descriptive content."></head><body style="margin:0;background:#dbe4df"><article style="box-sizing:border-box;width:1200px;min-height:720px;margin:80px auto;padding:60px;background:#f5edda"><h1 style="font:64px Georgia">A Thoughtful Generic Capture</h1><p style="font:28px/1.5 Georgia">This ordinary article exercises the shared content-region heuristic so site adapters never replace or weaken the normal capture pipeline.</p><svg width="560" height="260" role="img"><rect width="560" height="260" fill="#315d60"/><circle cx="420" cy="80" r="55" fill="#d99b5d"/></svg></article></body></html>`);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "link-journal-capture-test-"));
  const outputPath = path.join(temporaryDirectory, "preview.jpg");
  const browser = await chromium.launch({ headless: true });
  const messages = [];
  const logger = Object.fromEntries(["info", "debug", "warn", "error"].map((level) => [level, (...values) => messages.push([level, ...values])]));
  try {
    const result = await capturePage({ browser, targetUrl: `http://127.0.0.1:${address.port}/article`, outputPath, logger });
    assert.equal(result.image.width, 1200);
    assert.equal(result.image.height, 630);
    assert.equal(result.adapter, undefined);
    assert.ok(result.clip);
    assert.ok(messages.some((entry) => entry.join(" ").includes("matched adapter: none")));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    await rm(temporaryDirectory, { recursive: true });
  }
});
