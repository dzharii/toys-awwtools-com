import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";

/**
 * Home-screen project updates suite (feature spec R00, tests RSSHOME001-008).
 * The open screen fetches the local feed.xml and renders recent items as text
 * (never trusted HTML), coherent with the reader design. Fetch/parse/empty
 * failures degrade calmly and never block file opening.
 *
 * Feed-state tests route the feed.xml request before navigation so the panel
 * observes a controlled response; the feed fetch fires during app init.
 */
test.describe("rss: home updates panel", () => {
  test("RSSHOME001 updates panel is present below the drop zone", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();

    expect(await app.openScreen().updatesPanel.isVisible(), "updates panel visible").toBe(true);
    expect(await app.page.locator("#updates-title").textContent()).toMatch(/project updates/i);
    expect(await app.openScreen().updatesRssLink.isVisible(), "updates RSS link visible").toBe(true);
    // The file-open area stays usable.
    expect(await app.openScreen().dropzone.isVisible()).toBe(true);
    expect(await app.openScreen().openButton.isVisible()).toBe(true);

    // The panel sits below the drop zone (larger top offset).
    const dz = await app.page.getByTestId("open-screen-region-dropzone").boundingBox();
    const up = await app.page.getByTestId("open-screen-region-updates").boundingBox();
    expect(dz && up && up.y > dz.y, "updates panel below dropzone").toBe(true);

    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME002 items render from the real feed.xml", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().waitUpdatesSettled();

    const count = await app.openScreen().updateItemCount();
    expect(count, "at least one update item").toBeGreaterThan(0);
    expect(count, "at most ten items shown by default").toBeLessThanOrEqual(10);

    const first = await app.openScreen().firstUpdateItem();
    expect(first.title.length, "item title non-empty").toBeGreaterThan(0);
    expect(first.desc.length, "item description non-empty").toBeGreaterThan(0);
    expect(first.hasDate, "valid pubDate rendered").toBe(true);
    expect(first.date).toMatch(/\w{3}\s+\d{1,2},\s+\d{4}/);

    // No raw XML / parser error leaked into the list.
    const text = await app.openScreen().updatesText();
    expect(text).not.toContain("<item>");
    expect(text).not.toMatch(/could not be read/i);

    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME003 feed content renders as text, never as HTML", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>T</title><link>#</link><description>d</description>
<item><title>Safe rendering</title><link>#x</link>
<pubDate>Mon, 06 Jul 2026 00:00:00 -0700</pubDate>
<description>Markdown rendering is &lt;strong&gt;safer&lt;/strong&gt; now.</description></item>
</channel></rss>`;
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    const item = app.openScreen().updateItems().first();
    // The escaped markup is shown literally as text, not as a live <strong> node.
    expect(await item.locator(".update-item__desc").textContent()).toContain("<strong>safer</strong>");
    expect(await item.locator("strong").count(), "no live strong element from feed").toBe(0);

    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME004 unreachable feed shows a calm unavailable state, RSS link stays", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    await app.page.route("**/feed.xml", (route) => route.fulfill({ status: 404, body: "not found" }));
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    expect(await app.openScreen().updatesText()).toMatch(/unavailable in this local session/i);
    expect(await app.openScreen().updatesRssLink.isVisible(), "RSS link still visible").toBe(true);
    // File opening still works despite the failed feed.
    await openFileByPickerFlow(app, "simpleProse", "FIXTURE_SIMPLE_TXT_TITLE");
    // The routed 404 emits a browser resource-load console error; it is expected.
    await expectStandardOracle(app, { documentOpen: true, allowConsoleError: [/Failed to load resource/i] });
  });

  test("RSSHOME005 invalid feed XML shows a calm error state", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body: "<rss><oops" }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    expect(await app.openScreen().updatesText()).toMatch(/could not be read right now/i);
    expect(await app.openScreen().updateItemCount()).toBe(0);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME006 empty feed shows the no-updates state", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>T</title><link>#</link><description>d</description></channel></rss>`;
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    expect(await app.openScreen().updatesText()).toMatch(/no project updates are listed yet/i);
    expect(await app.openScreen().updateItemCount()).toBe(0);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME007 items are sorted newest first", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>T</title><link>#</link><description>d</description>
<item><title>Older</title><link>#o</link><pubDate>Wed, 01 Jul 2026 00:00:00 -0700</pubDate><description>old</description></item>
<item><title>Newer</title><link>#n</link><pubDate>Fri, 03 Jul 2026 00:00:00 -0700</pubDate><description>new</description></item>
</channel></rss>`;
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    const first = await app.openScreen().firstUpdateItem();
    expect(first.title, "newest item first").toBe("Newer");
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME008 item links are anchors that are safe and not prefetched", async ({ makeApp }) => {
    const app = await makeApp();
    await app.openScreen().expectReady();
    await app.openScreen().waitUpdatesSettled();

    const link = app.openScreen().updateItems().first().locator(".update-item__link");
    if ((await link.count()) > 0) {
      expect(await link.getAttribute("rel")).toContain("noopener");
      expect((await link.getAttribute("href"))?.length, "link has href").toBeGreaterThan(0);
    }
    // No request beyond same-origin was made by rendering the panel.
    app.network.assertNoUnexpectedRequests();
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME009 home screen displays at most ten updates", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body: feedWithItems(12) }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    expect(await app.openScreen().updateItemCount(), "exactly ten items shown").toBe(10);
    // The two oldest (lowest-numbered) items are not rendered.
    const text = await app.openScreen().updatesText();
    expect(text).not.toContain("Update 01");
    expect(text).not.toContain("Update 02");
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME010 home screen displays the latest ten by date, newest first", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    // 12 items in shuffled document order; item N is dated N days into July 2026.
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body: feedWithItems(12, true) }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    const titles = await app.openScreen().updateItems().locator(".update-item__title").allTextContents();
    expect(titles.length).toBe(10);
    // Newest ten are items 12..3 in descending date order; 01 and 02 excluded.
    const expected = Array.from({ length: 10 }, (_, i) => `Update ${String(12 - i).padStart(2, "0")}`);
    expect(titles).toEqual(expected);
    await expectStandardOracle(app, { documentOpen: false });
  });

  test("RSSHOME011 a feed with fewer than ten items shows all of them", async ({ makeApp }) => {
    const app = await makeApp({ skipGoto: true });
    await app.page.route("**/feed.xml", (route) =>
      route.fulfill({ status: 200, contentType: "application/xml", body: feedWithItems(3) }),
    );
    await app.page.goto(app.server.url("/index.html"), { waitUntil: "domcontentloaded" });

    await app.openScreen().waitUpdatesSettled();
    expect(await app.openScreen().updateItemCount(), "all three items shown").toBe(3);
    expect(await app.openScreen().updatesText()).not.toMatch(/no project updates/i);
    await expectStandardOracle(app, { documentOpen: false });
  });
});

/**
 * Build a valid RSS 2.0 feed body with `n` items titled "Update 01".."Update n".
 * Item N is dated N days into July 2026 (all past, well-formed RFC-822 dates).
 * When `shuffle` is true the items are emitted out of chronological order to
 * verify the app sorts by date rather than trusting document order.
 */
function feedWithItems(n: number, shuffle = false): string {
  const items = Array.from({ length: n }, (_, i) => i + 1);
  if (shuffle) {
    // Deterministic non-chronological ordering.
    items.sort((a, b) => ((a * 7) % n) - ((b * 7) % n));
  }
  const day = (num: number) => String(num).padStart(2, "0");
  const body = items
    .map((num) => {
      const title = `Update ${day(num)}`;
      return `  <item><title>${title}</title><link>#u${num}</link>
    <guid isPermaLink="false">gen-${num}</guid>
    <pubDate>Wed, ${day(num)} Jul 2026 00:00:00 -0700</pubDate>
    <description>Generated user-oriented update number ${num} for display-limit testing purposes.</description></item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>T</title><link>#</link><description>d</description>
<language>en-us</language><lastBuildDate>Wed, ${day(n)} Jul 2026 00:00:00 -0700</lastBuildDate>
${body}
</channel></rss>`;
}
