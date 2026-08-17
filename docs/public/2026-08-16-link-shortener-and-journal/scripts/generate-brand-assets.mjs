import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { ROOT } from "./repository.mjs";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(ROOT, "assets", "social-preview.svg")).href);
  await page.screenshot({ path: path.join(ROOT, "assets", "social-preview.png"), type: "png" });
  await page.close();
  for (const [size, filename] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"]]) {
    const iconPage = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await iconPage.goto(pathToFileURL(path.join(ROOT, "assets", "favicon.svg")).href);
    await iconPage.screenshot({ path: path.join(ROOT, "assets", filename), type: "png", omitBackground: true });
    await iconPage.close();
  }
  console.log("Generated social preview and PNG icon fallbacks.");
} finally {
  await browser.close();
}
