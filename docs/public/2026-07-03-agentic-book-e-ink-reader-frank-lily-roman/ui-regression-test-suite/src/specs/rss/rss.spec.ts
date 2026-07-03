import { test, expect } from "../../framework/test/base-test.js";
import { createBaseline } from "../../framework/support/baseline.js";
import { PROFILES } from "../../framework/support/adaptive-baseline.js";
import { CANONICAL } from "../../framework/support/metadata-assertions.js";
import {
  fetchFeed,
  assertValidFeed,
  isUserOriented,
  claimsUnsupportedFeature,
  parsesAsDate,
} from "../../framework/support/rss-assertions.js";

/**
 * RSS feed contract (gap-closure spec H00). feed.xml must be well-formed RSS 2.0
 * with complete channel and item metadata, user-oriented descriptions, and no
 * claims exceeding the implemented product. Fetching the feed must not change
 * application state (rss-read profile).
 */
test.describe("rss", () => {
  test("RSS001 feed exists and is valid RSS 2.0 XML", async ({ makeApp }) => {
    const app = await makeApp();
    const baseline = createBaseline(app);
    await baseline.capture();

    const feed = await fetchFeed(app);
    assertValidFeed(feed);

    await baseline.expectAfter("fetch and parse feed", PROFILES.rssRead);
  });

  test("RSS002 channel metadata is complete", async ({ makeApp }) => {
    const app = await makeApp();
    const { channel } = await fetchFeed(app);
    expect(channel.title).toBe("E Ink Reader Updates");
    expect(channel.link).toBe(CANONICAL.baseUrl);
    expect((channel.description ?? "").length).toBeGreaterThan(0);
    expect((channel.language ?? "").toLowerCase()).toBe("en-us");
    expect(parsesAsDate(channel.lastBuildDate), "lastBuildDate parses").toBe(true);
  });

  test("RSS003 every item has all required fields", async ({ makeApp }) => {
    const app = await makeApp();
    const { items } = await fetchFeed(app);
    expect(items.length, "feed has at least one item").toBeGreaterThan(0);
    const guids = new Set<string>();
    for (const item of items) {
      expect((item.title ?? "").length, "item title").toBeGreaterThan(0);
      expect((item.link ?? "").length, "item link").toBeGreaterThan(0);
      expect((item.guid ?? "").length, "item guid").toBeGreaterThan(0);
      expect(item.guidIsPermaLink, "guid isPermaLink=false").toBe("false");
      expect(parsesAsDate(item.pubDate), `item pubDate parses: ${item.pubDate}`).toBe(true);
      expect((item.description ?? "").length, "item description").toBeGreaterThan(0);
      expect(guids.has(item.guid!), `guid ${item.guid} is unique`).toBe(false);
      guids.add(item.guid!);
    }
  });

  test("RSS004 item descriptions are user-oriented, not commit-style", async ({ makeApp }) => {
    const app = await makeApp();
    const { items } = await fetchFeed(app);
    for (const item of items) {
      expect(isUserOriented(item.description), `item "${item.title}" reads like a user update`).toBe(true);
    }
  });

  test("RSS005 no item claims an unsupported feature", async ({ makeApp }) => {
    const app = await makeApp();
    const { items } = await fetchFeed(app);
    for (const item of items) {
      const blob = `${item.title ?? ""} ${item.description ?? ""}`;
      const bad = claimsUnsupportedFeature(blob);
      expect(bad, `item "${item.title}" must not claim unsupported feature: ${bad}`).toBeNull();
    }
  });
});
