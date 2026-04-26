import { EXPORT_FORMAT_VERSION } from "./constants.js";
import { createLogger } from "./observability/logger.js";
import { inlineHtmlToMarkdown, normalizeRichTextContent } from "./rich-text.js";
import { textForBlock } from "./search.js";

const logger = createLogger("Export");

export function pageToMarkdown(page, blocks) {
  logger.debug("Rendering page to Markdown", { context: { pageId: page?.id, blockCount: blocks.length } });
  const lines = [`# ${escapeMarkdown(page.title)}`, ""];
  for (const block of blocks) {
    const c = block.content || {};
    switch (block.type) {
      case "heading":
        lines.push(`${"#".repeat(Math.max(1, Math.min(6, c.level || 2)))} ${inlineHtmlToMarkdown(normalizeRichTextContent(c).html)}`, "");
        break;
      case "quote":
        lines.push(...String(c.text || "").split("\n").map((line) => `> ${line}`));
        if (c.attribution) lines.push(`> -- ${c.attribution}`);
        if (c.sourceUrl) lines.push(`> Source: ${c.sourceUrl}`);
        lines.push("");
        break;
      case "list":
        (c.items || []).forEach((item, index) => lines.push(`${c.ordered ? `${index + 1}.` : "-"} ${item.text || ""}`));
        lines.push("");
        break;
      case "table":
        lines.push(...tableToMarkdown(c), "");
        break;
      case "code":
        lines.push(`\`\`\`${c.language || ""}`, c.text || "", "```", "");
        break;
      case "sourceLink":
        lines.push(`- Source: [${c.title || c.url || "Untitled source"}](${c.url || "#"})`);
        if (c.note) lines.push(`  - Note: ${c.note}`);
        if (c.capturedText) lines.push(`  - Captured: ${c.capturedText}`);
        lines.push("");
        break;
      case "paragraph":
        lines.push(inlineHtmlToMarkdown(normalizeRichTextContent(c).html), "");
        break;
      default:
        lines.push(`Unsupported block type: ${block.type}`, "```json", JSON.stringify(block.content, null, 2), "```", "");
    }
  }
  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

export function workspaceToBackup({ pages, blocks }) {
  logger.debug("Rendering workspace backup", { context: { pageCount: pages.length, blockCount: blocks.length, exportFormatVersion: EXPORT_FORMAT_VERSION } });
  return {
    format: "topic-research-notepad-backup",
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    pages,
    blocks,
  };
}

export function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  logger.info("Starting browser download", { context: { filename, type, byteLength: blob.size } });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function tableToMarkdown(content) {
  const columns = content.columns || [];
  const rows = content.rows || [];
  if (!columns.length) return [];
  const header = `| ${columns.map((col) => escapeCell(col.label)).join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  return [
    header,
    sep,
    ...rows.map((row) => `| ${columns.map((col) => escapeCell(row.cells?.[col.id] || "")).join(" | ")} |`),
  ];
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function escapeMarkdown(value) {
  return String(value || "").replace(/([\\`*_{}\[\]()#+\-.!])/g, "\\$1");
}

export function filenameForPage(page, ext) {
  const slug = String(page.title || "research-page").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "research-page";
  return `${slug}.${ext}`;
}

export { textForBlock };
