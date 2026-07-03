import { expect } from "@playwright/test";
import type { EinkReaderApp } from "../app/automation-app.js";

/**
 * RSS feed contract helpers (gap-closure spec H00). The feed is fetched from the
 * local static server (same origin, allowed by the network guard) and parsed
 * with the browser DOMParser inside the page (a pure string operation, not a
 * network call).
 */

export interface RssItem {
  title: string | null;
  link: string | null;
  guid: string | null;
  guidIsPermaLink: string | null;
  pubDate: string | null;
  description: string | null;
}

export interface RssChannel {
  title: string | null;
  link: string | null;
  description: string | null;
  language: string | null;
  lastBuildDate: string | null;
}

export interface ParsedFeed {
  status: number;
  parseError: boolean;
  rootIsRss: boolean;
  version: string | null;
  channel: RssChannel;
  items: RssItem[];
}

/** Fetch and parse feed.xml through the app origin. */
export async function fetchFeed(app: EinkReaderApp): Promise<ParsedFeed> {
  const response = await app.context.request.get(app.server.url("/feed.xml"));
  const status = response.status();
  const text = await response.text();

  const parsed = await app.page.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const parseError = doc.querySelector("parsererror") !== null;
    const rss = doc.documentElement;
    const rootIsRss = rss?.tagName.toLowerCase() === "rss";
    const version = rss?.getAttribute("version") ?? null;
    const text = (parent: Element | null, tag: string): string | null => {
      const el = parent?.querySelector(tag);
      return el ? (el.textContent ?? "").trim() : null;
    };
    const channelEl = doc.querySelector("channel");
    const channel = {
      title: text(channelEl, "title"),
      link: text(channelEl, "link"),
      description: text(channelEl, "description"),
      language: text(channelEl, "language"),
      lastBuildDate: text(channelEl, "lastBuildDate"),
    };
    const items = Array.from(doc.querySelectorAll("item")).map((item) => {
      const guidEl = item.querySelector("guid");
      return {
        title: text(item, "title"),
        link: text(item, "link"),
        guid: guidEl ? (guidEl.textContent ?? "").trim() : null,
        guidIsPermaLink: guidEl ? guidEl.getAttribute("isPermaLink") : null,
        pubDate: text(item, "pubDate"),
        description: text(item, "description"),
      };
    });
    return { parseError, rootIsRss, version, channel, items };
  }, text);

  return { status, ...parsed };
}

/** A description reads like a user-facing update, not a commit message. */
export function isUserOriented(description: string | null): boolean {
  if (!description) return false;
  const d = description.trim();
  if (d.length < 40) return false;
  const commitStyle = /^(fixed bugs?|refactor(ed)?|updated? css|changed code|wip|misc|cleanup)\.?$/i;
  if (commitStyle.test(d)) return false;
  return true;
}

/** Feed items must not claim features the product does not have. */
export function claimsUnsupportedFeature(text: string): string | null {
  const lower = text.toLowerCase();
  const forbidden = [
    "cloud sync",
    "cloud storage",
    "pdf support",
    "epub",
    "search index",
    "full-text search",
    "annotation",
    "highlights sync",
    "account",
    "sign in",
    "automatic book restore",
    "restores your book",
  ];
  for (const f of forbidden) if (lower.includes(f)) return f;
  return null;
}

/** RFC-822-ish date parses to a real date. */
export function parsesAsDate(value: string | null): boolean {
  if (!value) return false;
  const t = Date.parse(value);
  return !Number.isNaN(t);
}

export function assertValidFeed(feed: ParsedFeed): void {
  expect(feed.status, "feed.xml HTTP status").toBe(200);
  expect(feed.parseError, "feed.xml must parse without error").toBe(false);
  expect(feed.rootIsRss, "root element is <rss>").toBe(true);
  expect(feed.version, "rss version").toBe("2.0");
}
