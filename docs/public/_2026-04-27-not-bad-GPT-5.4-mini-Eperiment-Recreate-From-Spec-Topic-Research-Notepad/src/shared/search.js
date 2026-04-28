import { getBlockPlainText, getPagePlainText, normalizePageRecord, normalizeBlockRecord, sortPages, sortBlocks } from "./models.js";

function makeSnippet(text, query) {
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const index = lower.indexOf(needle);
  if (index < 0) return text.slice(0, 140);
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + needle.length + 80);
  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`;
}

function scoreText(text, query) {
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const index = lower.indexOf(needle);
  if (index < 0) return 0;
  return Math.max(1, 1000 - index - Math.max(0, text.length - query.length));
}

export function searchWorkspace({ pages = [], blocks = [] } = {}, query = "", { maxResults = 40 } = {}) {
  const normalizedQuery = String(query ?? "").trim();
  if (!normalizedQuery) return [];

  const results = [];

  for (const page of sortPages(pages.map((item) => normalizePageRecord(item)))) {
    const text = getPagePlainText(page);
    if (!text.toLowerCase().includes(normalizedQuery.toLowerCase())) continue;
    results.push({
      kind: "page",
      id: `page:${page.id}`,
      pageId: page.id,
      blockId: null,
      title: page.title,
      snippet: makeSnippet(text, normalizedQuery),
      score: scoreText(text, normalizedQuery),
      page
    });
  }

  for (const block of sortBlocks(blocks.map((item) => normalizeBlockRecord(item)))) {
    const text = getBlockPlainText(block);
    if (!text.toLowerCase().includes(normalizedQuery.toLowerCase())) continue;
    results.push({
      kind: "block",
      id: `block:${block.id}`,
      pageId: block.pageId,
      blockId: block.id,
      title: `${block.type} block`,
      snippet: makeSnippet(text, normalizedQuery),
      score: scoreText(text, normalizedQuery) + 100,
      block
    });
  }

  return results
    .sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title))
    .slice(0, maxResults);
}

