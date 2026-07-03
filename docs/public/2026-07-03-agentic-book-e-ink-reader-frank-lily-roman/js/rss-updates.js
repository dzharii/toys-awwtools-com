// Home-screen project updates. Reads the local, same-origin feed.xml and shows
// recent update items on the open screen. This module is intentionally separate
// from Markdown parsing: feed content is rendered as plain text only (never as
// trusted HTML), no images/enclosures are fetched, item links are not
// prefetched, and nothing from the feed is persisted to storage.

import { log } from "./logging.js";

const DEFAULT_FEED_URL = "feed.xml";
const DEFAULT_LIMIT = 5;

/**
 * Fetch the local feed. Same-origin only (connect-src 'self'); never a remote
 * URL. Resolves to the raw XML text. Throws on network/HTTP failure.
 */
export async function fetchFeedText(url = DEFAULT_FEED_URL) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`feed HTTP ${res.status}`);
  return res.text();
}

/**
 * Parse RSS 2.0 XML into a list of raw item records. Throws on invalid XML so
 * the caller can render a calm "could not be read" state.
 */
export function parseRssFeed(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  // DOMParser reports malformed XML via a <parsererror> node rather than throwing.
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("invalid RSS XML");
  }
  const itemNodes = Array.from(doc.getElementsByTagName("item"));
  return itemNodes.map((node) => ({
    title: text(node, "title"),
    description: text(node, "description"),
    link: text(node, "link"),
    guid: text(node, "guid"),
    pubDate: text(node, "pubDate"),
  }));
}

function text(parent, tag) {
  const el = parent.getElementsByTagName(tag)[0];
  // textContent decodes XML entities and yields plain text (never live HTML).
  return el ? (el.textContent || "").trim() : "";
}

/**
 * Normalize items: attach a parsed Date when valid, sort newest-first when all
 * involved dates are valid, otherwise keep document order. Limit the result.
 */
export function normalizeRssItems(items, limit = DEFAULT_LIMIT) {
  const withIndex = items.map((it, index) => {
    const time = it.pubDate ? Date.parse(it.pubDate) : NaN;
    return { ...it, index, time: Number.isNaN(time) ? null : time };
  });
  const sorted = withIndex.slice().sort((a, b) => {
    if (a.time !== null && b.time !== null && a.time !== b.time) return b.time - a.time;
    return a.index - b.index;
  });
  return sorted.slice(0, Math.max(0, limit));
}

function formatDate(time) {
  try {
    return new Date(time).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch (_) {
    return "";
  }
}

// ---------- Rendering (safe: text only) ----------

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function statusNode(message) {
  const p = document.createElement("p");
  p.className = "updates-status";
  p.textContent = message;
  return p;
}

export function renderUpdatesLoading(listEl) {
  clear(listEl);
  listEl.setAttribute("aria-busy", "true");
  listEl.appendChild(statusNode("Loading recent updates…"));
}

export function renderUpdatesEmpty(listEl) {
  clear(listEl);
  listEl.setAttribute("aria-busy", "false");
  listEl.appendChild(statusNode("No project updates are listed yet."));
}

export function renderUpdatesError(listEl) {
  clear(listEl);
  listEl.setAttribute("aria-busy", "false");
  listEl.appendChild(statusNode("Updates could not be read right now."));
}

export function renderUpdatesUnavailable(listEl) {
  clear(listEl);
  listEl.setAttribute("aria-busy", "false");
  const wrap = document.createElement("div");
  wrap.className = "updates-status";
  const line1 = document.createElement("p");
  line1.style.margin = "0";
  line1.textContent = "Updates are unavailable in this local session.";
  const line2 = document.createElement("p");
  line2.style.margin = "4px 0 0";
  line2.textContent = "You can still open the RSS feed directly.";
  wrap.append(line1, line2);
  listEl.appendChild(wrap);
}

export function renderUpdates(listEl, items) {
  clear(listEl);
  listEl.setAttribute("aria-busy", "false");
  if (!items.length) {
    renderUpdatesEmpty(listEl);
    return;
  }
  const ul = document.createElement("ul");
  ul.className = "updates-list__items";
  for (const item of items) {
    ul.appendChild(buildItem(item));
  }
  listEl.appendChild(ul);
}

function buildItem(item) {
  const li = document.createElement("li");
  li.className = "update-item";
  li.setAttribute("data-testid", "open-screen-update-item");

  if (item.title) {
    const title = document.createElement("div");
    title.className = "update-item__title";
    title.textContent = item.title;
    li.appendChild(title);
  }

  if (item.time !== null && item.time !== undefined) {
    const time = document.createElement("time");
    time.className = "update-item__date";
    time.dateTime = new Date(item.time).toISOString();
    time.textContent = formatDate(item.time);
    li.appendChild(time);
  }

  if (item.description) {
    const desc = document.createElement("p");
    desc.className = "update-item__desc";
    desc.textContent = item.description; // text only; feed HTML never becomes DOM
    li.appendChild(desc);
  }

  if (item.link) {
    const a = document.createElement("a");
    a.className = "update-item__link";
    a.href = item.link; // rendered but not prefetched
    a.rel = "noopener noreferrer";
    a.textContent = "Read update";
    li.appendChild(a);
  }

  return li;
}

/**
 * Fetch, parse, and render the updates panel into listEl, handling every state
 * calmly. Never throws to the caller; failures render a fallback and are logged.
 */
export async function initUpdatesPanel(listEl, { url = DEFAULT_FEED_URL, limit = DEFAULT_LIMIT } = {}) {
  if (!listEl) return;
  renderUpdatesLoading(listEl);
  let xmlText;
  try {
    xmlText = await fetchFeedText(url);
  } catch (err) {
    log.warn("updates:fetch-failed", { reason: (err && err.message) || "network" });
    renderUpdatesUnavailable(listEl);
    return;
  }
  try {
    const items = normalizeRssItems(parseRssFeed(xmlText), limit);
    renderUpdates(listEl, items);
    log.debug("updates:rendered", { count: items.length });
  } catch (err) {
    log.warn("updates:parse-failed", { reason: (err && err.message) || "parse" });
    renderUpdatesError(listEl);
  }
}
