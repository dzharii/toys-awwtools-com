import { access, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";
import { parseManifest, parseTargetUrl, isValidId } from "../shared/core.js";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1))), "..");

export function metaFromHtml(html, selectorName, property = false) {
  const attribute = property ? "property" : "name";
  const escaped = selectorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const forward = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i");
  const reverse = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, "i");
  const value = (html.match(forward) || html.match(reverse))?.[1] ?? null;
  return value === null ? null : decodeHtmlEntities(value);
}

function decodeHtmlEntities(value) {
  return value.replace(/&(amp|quot|#39|lt|gt);/g, (match, entity) => ({ amp: "&", quot: '"', "#39": "'", lt: "<", gt: ">" }[entity] || match));
}

export async function validateRepository(root = ROOT) {
  const manifestPath = path.join(root, "links.txt");
  const recordsPath = path.join(root, "lnk");
  await access(manifestPath, fsConstants.R_OK | fsConstants.W_OK);
  const lnkStat = await stat(recordsPath);
  if (!lnkStat.isDirectory()) throw new Error(`Required record directory is not a directory: ${recordsPath}`);
  const manifestText = await readFile(manifestPath, "utf8");
  const ids = parseManifest(manifestText);
  const manifestSet = new Set(ids);
  const directoryEntries = await readdir(recordsPath, { withFileTypes: true });
  for (const entry of directoryEntries) {
    if (entry.name === ".gitkeep") continue;
    if (!entry.isDirectory() || !isValidId(entry.name)) throw new Error(`Unexpected item in lnk/: ${entry.name}. Record directories must use valid 8-character IDs.`);
    if (!manifestSet.has(entry.name)) throw new Error(`Record directory lnk/${entry.name}/ is not represented in links.txt.`);
  }
  const targets = new Map();
  for (const id of ids) {
    const recordDir = path.join(recordsPath, id);
    const htmlPath = path.join(recordDir, "index.html");
    const previewPath = path.join(recordDir, "preview.jpg");
    await access(htmlPath, fsConstants.R_OK);
    await access(previewPath, fsConstants.R_OK);
    const generatedFiles = await readdir(recordDir, { withFileTypes: true });
    const names = generatedFiles.map((entry) => entry.name).sort();
    if (names.join("|") !== "index.html|preview.jpg" || generatedFiles.some((entry) => !entry.isFile())) throw new Error(`Record lnk/${id}/ must contain exactly index.html and preview.jpg.`);
    const html = await readFile(htmlPath, "utf8");
    const storedId = metaFromHtml(html, "lnk:id");
    const target = metaFromHtml(html, "lnk:target");
    if (storedId !== id) throw new Error(`Record ID mismatch for ${id}: observed ${storedId ?? "missing"}.`);
    if (!target) throw new Error(`Required metadata lnk:target is missing in ${htmlPath}.`);
    parseTargetUrl(target);
    const created = metaFromHtml(html, "lnk:created");
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(created || "") || Number.isNaN(Date.parse(created))) throw new Error(`Record ${id} has invalid lnk:created metadata.`);
    if (!/<title>[^<]+<\/title>/i.test(html) || !metaFromHtml(html, "description")) throw new Error(`Record ${id} is missing title or description metadata.`);
    for (const property of ["og:title", "og:description", "og:image", "og:url", "og:type"]) if (!metaFromHtml(html, property, true)) throw new Error(`Record ${id} is missing ${property} metadata.`);
    if (targets.has(target)) throw new Error(`Duplicate target ${target} occurs in ${targets.get(target)} and ${id}.`);
    targets.set(target, id);
  }
  return { ids, targets, manifestPath, recordsPath };
}

export async function acquireLock(root = ROOT, waitMs = 2000) {
  const lockPath = path.join(root, ".link-journal.lock");
  const deadline = Date.now() + waitMs;
  while (true) {
    try {
      const handle = await open(lockPath, "wx");
      await handle.writeFile(`${process.pid}\n${new Date().toISOString()}\n`);
      return async () => {
        await handle.close();
        await rm(lockPath, { force: true });
      };
    } catch (error) {
      if (error.code !== "EEXIST" || Date.now() >= deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export async function prependManifest(manifestPath, id, priorIds) {
  if (!isValidId(id)) throw new Error(`Refusing to write invalid ID ${id}.`);
  const tempPath = `${manifestPath}.tmp-${process.pid}`;
  const next = [id, ...priorIds].join("\n") + "\n";
  await writeFile(tempPath, next, "utf8");
  await rename(tempPath, manifestPath);
}

export async function ensureRecordParent(recordsPath) {
  await mkdir(recordsPath, { recursive: true });
}
