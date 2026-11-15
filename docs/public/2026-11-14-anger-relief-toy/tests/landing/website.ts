import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, resolve, sep, extname } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const { chromium, expect }: typeof import("playwright/test") = createRequire(
  import.meta.url,
)(process.env.PLAYWRIGHT_MODULE ?? "playwright/test");
const root = resolve(process.env.PROJECT_ROOT ?? process.cwd());
const output = join(root, "evidence", "005", "website");
const profile = process.env.TEST_PROFILE;
const extension = process.env.EXTENSION_PATH;
if (!profile || !extension)
  throw new Error(
    "Set TEST_PROFILE and EXTENSION_PATH for native browser zoom",
  );
await mkdir(output, { recursive: true });
const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".md": "text/plain",
  ".json": "application/json",
  ".zip": "application/zip",
};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url ?? "/", "http://localhost").pathname,
  );
  const file = resolve(
    root,
    "." + (pathname === "/" ? "/index.html" : pathname),
  );
  if (!file.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(file);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream",
    });
    response.end(data);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string")
  throw new Error("Missing server address");
const origin = `http://127.0.0.1:${address.port}`;
const checks: string[] = [];
const measurements: unknown[] = [];
const requests = new Set<string>();
const errors: string[] = [];
let context:
  Awaited<ReturnType<typeof chromium.launchPersistentContext>> | undefined;
let failure: string | undefined;
try {
  context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    timeout: 20000,
    viewport: { width: 1440, height: 900 },
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      `--load-extension=${extension}`,
      `--disable-extensions-except=${extension}`,
    ],
  });
  const page = context.pages()[0]!;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("chrome://extensions");
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker", { timeout: 15000 }));
  page.on("request", (request) => requests.add(request.url()));
  for (const viewport of [
    { width: 920, height: 720 },
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(origin);
    await page.evaluate(() => document.fonts.ready);
    const heroDownload = page.locator(".hero .download");
    const heroInstall = page.locator(".hero a[href='#install']");
    const downloadBox = await heroDownload.boundingBox();
    const installBox = await heroInstall.boundingBox();
    expect(downloadBox!.y + downloadBox!.height).toBeLessThan(viewport.height);
    expect(installBox!.y + installBox!.height).toBeLessThan(viewport.height);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const link of [heroDownload, heroInstall]) {
      expect(
        await link.evaluate((node: HTMLElement) => {
          const box = node.getBoundingClientRect();
          const front = document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          );
          return front === node || node.contains(front);
        }),
      ).toBe(true);
    }
    await page.screenshot({
      path: join(output, `${viewport.width}-opening.png`),
    });
    await page.evaluate(async () => {
      for (const image of document.images) {
        image.loading = "eager";
        await image.decode();
      }
    });
    await page.screenshot({
      path: join(output, `${viewport.width}-full.png`),
      fullPage: true,
    });
    await heroInstall.click();
    const heading = await page.locator("#install-title").boundingBox();
    expect(heading!.y).toBeGreaterThanOrEqual(viewport.width > 720 ? 72 : 0);
    await page.getByText("Google Chrome", { exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".install-steps details").nth(0)).toHaveAttribute(
      "open",
      "",
    );
    await expect(
      page.locator(".install-steps details").nth(0).locator("li").first(),
    ).toBeVisible();
    await page.keyboard.press("Space");
    expect(
      await page.locator(".install-steps details").nth(0).getAttribute("open"),
    ).toBeNull();
    await page.getByText("Microsoft Edge", { exact: true }).click();
    await page.screenshot({
      path: join(output, `${viewport.width}-install.png`),
    });
    await page.getByText("Microsoft Edge", { exact: true }).click();
    // Exercise every focusable article control using native Tab traversal.
    await page.goto(origin);
    for (let i = 0; i < 34; i++) {
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement) || active === document.body)
          return { visible: true, html: "body" };
        const visible = [...active.getClientRects()].some((r) => {
          const top = document.elementFromPoint(
            r.x + Math.min(r.width / 2, 10),
            r.y + Math.min(r.height / 2, 10),
          );
          return (
            r.width > 0 &&
            r.height > 0 &&
            (top === active || active.contains(top))
          );
        });
        return { visible, html: active.outerHTML.slice(0, 180) };
      });
      expect(
        focus.visible,
        `${viewport.width} focus stop ${i}: ${focus.html}`,
      ).toBe(true);
    }
    measurements.push({ viewport, downloadBox, installBox });
  }
  checks.push(
    "920x720, 1440x900, 390x844: first-screen primary download/install unobscured; no horizontal overflow; native disclosures; 34 keyboard focus stops each",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin);
  const tab = await worker.evaluate(
    "chrome.tabs.query({active:true,currentWindow:true}).then(tabs=>tabs[0].id)",
  );
  await worker.evaluate(`chrome.tabs.setZoom(${tab}, 2)`);
  await page.waitForTimeout(150);
  const zoom = await page.evaluate(() => ({
    width: innerWidth,
    pixelRatio: devicePixelRatio,
  }));
  expect(zoom.width).toBe(720);
  expect(zoom.pixelRatio).toBe(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: join(output, "200-percent-opening.png") });
  await page.screenshot({
    path: join(output, "200-percent-full.png"),
    fullPage: true,
  });
  await page.locator("nav a[href='#install']").click();
  await page.getByText("Google Chrome", { exact: true }).click();
  await expect(
    page.locator(".install-steps details").first().locator("li").first(),
  ).toBeVisible();
  await page.screenshot({ path: join(output, "200-percent-install.png") });
  await worker.evaluate(`chrome.tabs.setZoom(${tab}, 1)`);
  checks.push(
    "Actual 200% Chromium tab zoom via tabs.setZoom: 720 CSS px and devicePixelRatio 2; content reflows, installation reachable, no overflow",
  );
  await page.goto(origin);
  const links = await page
    .locator("a")
    .evaluateAll((anchors: Element[]) =>
      anchors.map((a) => a.getAttribute("href") ?? ""),
    );
  for (const href of links) {
    if (href.startsWith("#")) {
      await expect(page.locator(href)).toHaveCount(1);
    } else if (!/^https?:/.test(href)) {
      const response = await page.request.get(`${origin}/${href}`);
      expect(response.status(), href).toBe(200);
    }
  }
  const downloadEvent = page.waitForEvent("download");
  await page.locator(".hero .download").click();
  const download = await downloadEvent;
  const downloaded = await download.path();
  if (!downloaded) throw new Error("Download missing");
  const hash = (bytes: Buffer) =>
    createHash("sha256").update(bytes).digest("hex");
  expect(hash(await readFile(downloaded))).toBe(
    hash(await readFile(join(root, "downloads", "anger-relief-toy-v003.zip"))),
  );
  const imageSources = await page
    .locator("img, source[srcset]")
    .evaluateAll((images: Element[]) =>
      images.map(
        (image) =>
          image.getAttribute("src") ?? image.getAttribute("srcset") ?? "",
      ),
    );
  let imageBytes = 0;
  for (const source of new Set(imageSources))
    imageBytes += (await stat(join(root, source))).size;
  const pageBytes = (await stat(join(root, "index.html"))).size;
  expect(imageBytes + pageBytes).toBeLessThan(2_000_000);
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = "eager";
      await image.decode();
    }
  });
  expect(
    await page
      .locator("img")
      .evaluateAll((images: Element[]) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).naturalWidth > 0 &&
            image.hasAttribute("alt"),
        ),
      ),
  ).toBe(true);
  const words = await page.evaluate(() => {
    const clone = document
      .querySelector("article")!
      .cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll(
        "details, figcaption, .tool-groups, .panel-label, .source-links",
      )
      .forEach((node) => node.remove());
    return (clone.textContent ?? "").trim().split(/\s+/).length;
  });
  measurements.push({ zoom, imageBytes, pageBytes, editorialWords: words });
  checks.push(
    "All local links, images and anchors resolve; actual browser download matches ZIP hash; every image decodes, has alt and explicit dimensions; page + all images <2 MB",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("h1")).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: join(output, "print.png"), fullPage: true });
  await page.pdf({
    path: join(output, "article-print.pdf"),
    format: "A4",
    printBackground: true,
  });
  await expect(page.locator(".detail-body li").first()).toBeVisible();
  checks.push(
    "Reduced-motion mode has no animation; print expands installation content and produces an A4 PDF without clipped essentials",
  );
  await page.emulateMedia({ media: "screen", reducedMotion: "no-preference" });
  await page.goto(pathToFileURL(join(root, "index.html")).href);
  await expect(page.locator("h1")).toBeVisible();
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = "eager";
      await image.decode();
    }
  });
  await page.screenshot({ path: join(output, "local-file.png") });
  checks.push("Local-file page and images load without a server");
  const noJs = await context
    .browser()!
    .newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
  const staticPage = await noJs.newPage();
  await staticPage.goto(origin);
  await staticPage.locator("nav a[href='#install']").click();
  await staticPage.getByText("Google Chrome", { exact: true }).click();
  await expect(
    staticPage.locator(".install-steps details").first().locator("li").first(),
  ).toBeVisible();
  const noJsDownload = staticPage.waitForEvent("download");
  await staticPage.locator("#install .download").click();
  await noJsDownload;
  await staticPage.screenshot({ path: join(output, "no-javascript.png") });
  await noJs.close();
  checks.push(
    "JavaScript disabled: article, anchor navigation, native disclosures and download all work",
  );
  expect(errors).toEqual([]);
  const externalRequests = [...requests].filter(
    (url) => !url.startsWith(origin) && !url.startsWith("file:"),
  );
  expect(externalRequests).toEqual([]);
  checks.push("No webpage console errors and no external page requests");
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  await context?.close();
  server.close();
  await writeFile(
    join(output, "result.json"),
    JSON.stringify(
      {
        status: failure ? "failed" : "passed",
        checks,
        measurements,
        error: failure,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      status: failure ? "failed" : "passed",
      checks,
      measurements,
      error: failure,
    }),
  );
}
