/** Plain document values are escaped, never interpreted as HTML or Markdown code. */
import { AppError } from "../../platform/errors";
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
export function semanticHtml(text: string): string {
  return text
    .split(/\n[ \t]*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>\n")}</p>`)
    .join("\n");
}
export function markdownText(text: string): string {
  return text.replace(/([\\`*_{}[\]<>()#+.!|~>-])/g, "\\$1").replaceAll("\n", "  \n");
}
export function filename(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/[. ]+$/g, "")
      .trim()
      .slice(0, 100) || "document"
  );
}
export function download(content: string, name: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportResult(text: string, title: string, format: "txt" | "md" | "html"): void {
  const content =
    format === "html"
      ? `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body>\n${semanticHtml(text)}\n</body></html>\n`
      : format === "md"
        ? markdownText(text)
        : text;
  const mime = format === "html" ? "text/html" : format === "md" ? "text/markdown" : "text/plain";
  download(content, `${filename(title)}.${format}`, `${mime};charset=utf-8`);
}
export async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText)
    throw new AppError(
      "CLIPBOARD_UNAVAILABLE",
      "Clipboard access is unavailable. Select the result to copy it, or export a text file.",
    );
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new AppError(
      "CLIPBOARD_DENIED",
      "Clipboard access was denied. Allow clipboard access, select the result to copy it, or export a text file.",
    );
  }
}
export async function copyRichText(text: string): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new AppError(
      "RICH_CLIPBOARD_UNAVAILABLE",
      "This browser cannot copy rich text. Use Copy text instead.",
    );
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([text], { type: "text/plain" }),
        "text/html": new Blob([semanticHtml(text)], { type: "text/html" }),
      }),
    ]);
  } catch {
    throw new AppError(
      "RICH_CLIPBOARD_DENIED",
      "Rich-text clipboard access was denied. Try Copy text, allow clipboard access, or export HTML.",
    );
  }
}
