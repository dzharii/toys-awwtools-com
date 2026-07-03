import { test, expect } from "../../framework/test/base-test.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import {
  CANONICAL,
  metaContent,
  linkAttr,
  describesProductPromise,
  imageDimensions,
} from "../../framework/support/metadata-assertions.js";

/**
 * Static metadata contract (gap-closure spec G00). Social crawlers do not run
 * JavaScript, so title, description, canonical, RSS discovery, Open Graph, and
 * Twitter tags must be present and correct in the initial HTML head. Reading
 * metadata must not change any application state (metadata-read profile).
 */
test.describe("metadata", () => {
  test("META001 primary metadata is present and canonical", async ({ makeApp }) => {
    const app = await makeApp();
    const baseline = createBaseline(app);
    await baseline.capture();

    expect(await app.page.title()).toBe(CANONICAL.title);
    expect(await metaContent(app, "name", "description")).toBe(CANONICAL.description);
    expect(await linkAttr(app, 'link[rel="canonical"]', "href")).toBe(CANONICAL.baseUrl);

    await baseline.expectAfter("read primary metadata", PROFILES.metadataRead);
  });

  test("META002 RSS discovery link points at feed.xml", async ({ makeApp }) => {
    const app = await makeApp();
    const sel = 'link[rel="alternate"][type="application/rss+xml"]';
    expect(await linkAttr(app, sel, "title")).toBe("E Ink Reader Updates");
    expect(await linkAttr(app, sel, "href")).toBe(`${CANONICAL.baseUrl}feed.xml`);
  });

  test("META003 Open Graph tags are complete and consistent", async ({ makeApp }) => {
    const app = await makeApp();
    expect(await metaContent(app, "property", "og:type")).toBe("website");
    expect(await metaContent(app, "property", "og:site_name")).toBe("E Ink Reader");
    expect(await metaContent(app, "property", "og:title")).toBe(CANONICAL.title);
    expect(describesProductPromise(await metaContent(app, "property", "og:description"))).toBe(true);
    expect(await metaContent(app, "property", "og:url")).toBe(CANONICAL.baseUrl);
    expect(await metaContent(app, "property", "og:image")).toBe(CANONICAL.socialImage);
    expect(await metaContent(app, "property", "og:image:secure_url")).toBe(CANONICAL.socialImage);
    expect(await metaContent(app, "property", "og:image:type")).toBe(CANONICAL.imageType);
    expect(await metaContent(app, "property", "og:image:width")).toBe(CANONICAL.imageWidth);
    expect(await metaContent(app, "property", "og:image:height")).toBe(CANONICAL.imageHeight);
    const alt = await metaContent(app, "property", "og:image:alt");
    expect(alt && alt.length).toBeGreaterThan(0);
    expect(alt!.toLowerCase()).toContain("e ink");
    expect(await metaContent(app, "property", "og:locale")).toBe("en_US");
  });

  test("META004 Twitter card tags are complete", async ({ makeApp }) => {
    const app = await makeApp();
    expect(await metaContent(app, "name", "twitter:card")).toBe("summary_large_image");
    expect(await metaContent(app, "name", "twitter:title")).toBe(CANONICAL.title);
    expect(describesProductPromise(await metaContent(app, "name", "twitter:description"))).toBe(true);
    expect(await metaContent(app, "name", "twitter:image")).toBe(CANONICAL.socialImage);
    const alt = await metaContent(app, "name", "twitter:image:alt");
    expect(alt && alt.length).toBeGreaterThan(0);
  });

  test("META005 social image exists locally and matches declared dimensions", async ({ makeApp }) => {
    const app = await makeApp();
    // Load the same asset from the local static server (same-origin, no network).
    const localUrl = app.server.url("/assets/social/social_logo_1200x630.jpg");
    const dims = await imageDimensions(app, localUrl);
    expect(dims.ok, "social image should load from the app").toBe(true);
    expect(dims.width).toBe(Number(CANONICAL.imageWidth));
    expect(dims.height).toBe(Number(CANONICAL.imageHeight));
  });
});
