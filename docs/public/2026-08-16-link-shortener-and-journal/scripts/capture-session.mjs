import { chromium as defaultBrowserType } from "playwright";
import { capturePage as defaultCapturePage } from "./capture.mjs";

const MAX_USER_AGENT_LENGTH = 1024;

export function normalizeHeadlessUserAgent(value) {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_USER_AGENT_LENGTH || !value.includes("Mozilla/") || !value.includes("AppleWebKit/") || !value.includes("Safari/")) {
    const error = new Error("Chromium returned an empty or malformed browser identity.");
    error.code = "CAPTURE_BROWSER_IDENTITY_INVALID";
    error.stage = "browser identity";
    throw error;
  }
  const occurrences = value.match(/HeadlessChrome\//g)?.length || 0;
  if (occurrences > 1) {
    const error = new Error("Chromium returned an ambiguous headless browser identity.");
    error.code = "CAPTURE_BROWSER_IDENTITY_INVALID";
    error.stage = "browser identity";
    throw error;
  }
  return { userAgent: value.replace("HeadlessChrome/", "Chrome/"), normalized: occurrences === 1 };
}

export async function discoverBrowserUserAgent(browser) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    return await page.evaluate(() => navigator.userAgent);
  } finally {
    await context.close();
  }
}

export function shouldRetryHeaded(error) {
  return error?.code === "CAPTURE_ACCESS_CHALLENGE";
}

function summarizeFallback(error) {
  const code = typeof error?.code === "string" ? error.code : "CAPTURE_HEADED_RETRY_FAILED";
  const stage = typeof error?.stage === "string" ? error.stage : "browser retry";
  const message = typeof error?.message === "string" && error.message ? error.message : "Visible browser retry failed.";
  return `${code} at ${stage}: ${message}`;
}

async function runAttempt({ browserType, capture, targetUrl, outputPath, logger, headless }) {
  const captureMode = headless ? "headless" : "headed";
  let browser;
  try {
    browser = await browserType.launch({ headless });
    const discovered = await discoverBrowserUserAgent(browser);
    const profile = normalizeHeadlessUserAgent(discovered);
    logger.debug("capture", `Browser profile prepared. Mode: ${captureMode}; headless product token normalized: ${profile.normalized ? "yes" : "no"}.`);
    const result = await capture({ browser, targetUrl, outputPath, logger, userAgent: profile.userAgent, captureMode });
    logger.debug("capture", `Capture attempt succeeded. Mode: ${captureMode}.`);
    return result;
  } finally {
    if (browser) await browser.close().catch((error) => logger.warn("capture", `Browser cleanup warning (${captureMode}): ${error.message}`));
  }
}

export async function captureWithBrowserFallback({
  targetUrl,
  outputPath,
  logger,
  browserType = defaultBrowserType,
  capture = defaultCapturePage
}) {
  try {
    return await runAttempt({ browserType, capture, targetUrl, outputPath, logger, headless: true });
  } catch (primaryError) {
    if (!shouldRetryHeaded(primaryError)) throw primaryError;
    logger.warn("capture", "The headless browser encountered an access challenge; retrying once in a visible browser window.");
    try {
      return await runAttempt({ browserType, capture, targetUrl, outputPath, logger, headless: false });
    } catch (fallbackError) {
      primaryError.context = { ...(primaryError.context || {}), "Headed retry": summarizeFallback(fallbackError) };
      throw primaryError;
    }
  }
}
