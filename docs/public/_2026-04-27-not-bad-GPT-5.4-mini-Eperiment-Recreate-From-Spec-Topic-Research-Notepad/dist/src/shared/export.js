import { EXPORT_FORMAT_VERSION } from "./constants.js";
import { getBlockPlainText, sortBlocks, sortPages } from "./models.js";
import { inlineHtmlToMarkdown } from "./html.js";

function blockMarkdown(block) {
  switch (block.type) {
    case "paragraph":
      return `${inlineHtmlToMarkdown(block.content?.html || block.content?.text || "")}\n`;
    case "heading": {
      const level = Math.min(6, Math.max(1, Number(block.content?.level || 1)));
      const marker = "#".repeat(level);
      return `${marker} ${inlineHtmlToMarkdown(block.content?.html || block.content?.text || "")}\n`;
    }
    case "quote":
      return `${inlineHtmlToMarkdown(block.content?.html || block.content?.text || "")}`
        .split("\n")
        .map((line) => `> ${line}`.trimEnd())
        .join("\n") + "\n";
    case "list":
      return `${(block.content?.items || []).map((item) => `- ${item}`).join("\n")}\n`;
    case "table": {
      const columns = block.content?.columns || [];
      const rows = block.content?.rows || [];
      if (!columns.length && !rows.length) return "";
      const header = columns.length ? `| ${columns.join(" | ")} |\n| ${columns.map(() => "---").join(" | ")} |` : "";
      const body = rows.map((row) => `| ${row.map((cell) => cell ?? "").join(" | ")} |`).join("\n");
      return `${header ? `${header}\n` : ""}${body}\n`;
    }
    case "code":
      return "```" + (block.content?.language || "") + "\n" + (block.content?.text || "") + "\n```\n";
    case "sourceLink": {
      const content = block.content || {};
      const lines = [`- ${content.title || content.url || "Source"}`];
      if (content.url) lines.push(`  - URL: ${content.url}`);
      if (content.domain) lines.push(`  - Domain: ${content.domain}`);
      if (content.note) lines.push(`  - Note: ${content.note}`);
      if (content.capturedText) lines.push(`  - Captured: ${content.capturedText}`);
      return `${lines.join("\n")}\n`;
    }
    default:
      return `> Unsupported block type: ${block.type}\n`;
  }
}

export function pageToMarkdown(page, blocks = []) {
  const lines = [`# ${page.title}`, ""];
  for (const block of sortBlocks(blocks)) {
    lines.push(blockMarkdown(block).trimEnd(), "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

export function workspaceToBackupJson({ pages = [], blocks = [], settings = [] } = {}) {
  return {
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    pages: sortPages(pages),
    blocks: sortBlocks(blocks),
    settings: Array.isArray(settings) ? settings : Object.entries(settings || {}).map(([key, value]) => ({ key, value }))
  };
}

export function workspaceToMarkdown(page, blocks = []) {
  return pageToMarkdown(page, blocks);
}

export function blockSearchText(block) {
  return getBlockPlainText(block);
}

