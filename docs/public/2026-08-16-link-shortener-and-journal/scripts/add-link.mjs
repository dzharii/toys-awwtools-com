#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { access, cp, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { buildPublicUrls, generateRecordHtml, isoUtcSeconds, normalizeSiteBase, parseTargetUrl, randomId, sanitizeText } from "../shared/core.js";
import { createDiagnostic, createLogger, formatUserError } from "../shared/diagnostics.js";
import { captureWithBrowserFallback } from "./capture-session.mjs";
import { validateJpeg } from "./jpeg.mjs";
import { ROOT, acquireLock, metaFromHtml, prependManifest, validateRepository } from "./repository.mjs";

const debug = process.env.DEBUG === "1" || process.env.LINK_JOURNAL_DEBUG === "1";
const operationId = `add-${randomBytes(4).toString("base64url").slice(0, 6)}`;
const logger = createLogger({ debug, correlationId: operationId });
let stage = "input validation";
let tempPath;
let releaseLock;
let committedPath;
let mutationState = "none";

function fatal(diagnostic, fields = []) {
  const opening = diagnostic.module === "capture" ? "Sorry, I couldn't capture this page." : diagnostic.module === "repository" ? "Sorry, the link archive needs attention." : "Sorry, I couldn't add this link.";
  console.error(formatUserError(opening, diagnostic, fields));
  console.error("");
  logger.error(diagnostic);
}

async function uniqueId(recordsPath) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const id = randomId(randomBytes(16));
    try { await access(path.join(recordsPath, id)); }
    catch (error) { if (error.code === "ENOENT") return id; throw error; }
  }
  throw new Error("Unable to generate an unused short ID after 100 attempts.");
}

async function main() {
  const input = process.argv.slice(2);
  if (input.length !== 1) throw Object.assign(new Error("Exactly one target URL is required."), { code: "AUTHORING_INVALID_ARGUMENTS" });
  const targetUrl = parseTargetUrl(input[0]);
  logger.info("authoring", `Adding link: ${targetUrl}`);

  stage = "repository validation";
  let repository = await validateRepository(ROOT);
  logger.info("repository", `Repository validated: ${repository.ids.length} published link${repository.ids.length === 1 ? "" : "s"}.`);

  stage = "configuration validation";
  const configPath = path.join(ROOT, "link-journal.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const siteBase = normalizeSiteBase(config.siteBase);

  stage = "duplicate detection";
  if (repository.targets.has(targetUrl)) {
    const existingId = repository.targets.get(targetUrl);
    const { shortUrl } = buildPublicUrls(siteBase, existingId);
    const error = Object.assign(new Error("This target is already in the journal."), { code: "AUTHORING_DUPLICATE", context: { "Existing ID": existingId, "Short URL": shortUrl, Record: `lnk/${existingId}/` } });
    throw error;
  }

  stage = "dependency validation";
  const executable = chromium.executablePath();
  await access(executable, fsConstants.X_OK).catch(() => access(executable, fsConstants.R_OK));
  logger.debug("authoring", `Chromium dependency available: ${executable}`);

  stage = "ID generation";
  let id = await uniqueId(repository.recordsPath);
  tempPath = await mkdir(path.join(tmpdir(), `link-journal-${operationId}`), { recursive: true }).then(() => path.join(tmpdir(), `link-journal-${operationId}`));
  const previewPath = path.join(tempPath, "preview.jpg");

  stage = "page capture";
  const capture = await captureWithBrowserFallback({ targetUrl, outputPath: previewPath, logger });
  const title = sanitizeText(capture.metadata.title, "title");
  const description = sanitizeText(capture.metadata.description, "description");
  if (title === "(no title)") logger.warn("authoring", "Title contained no usable characters after sanitization; using (no title).");
  if (description === "(no description)") logger.warn("authoring", "Description contained no usable characters after sanitization; using (no description).");

  stage = "HTML generation";
  const createdAt = isoUtcSeconds();
  let publicUrls = buildPublicUrls(siteBase, id);
  await writeFile(path.join(tempPath, "index.html"), generateRecordHtml({ id, targetUrl, createdAt, title, description, ...publicUrls }), "utf8");

  stage = "record validation";
  await validateTemporaryRecord(tempPath, { id, targetUrl });

  stage = "record commit";
  releaseLock = await acquireLock(ROOT);
  repository = await validateRepository(ROOT);
  if (repository.targets.has(targetUrl)) {
    const existingId = repository.targets.get(targetUrl);
    throw Object.assign(new Error("Another authoring operation added this target before commit."), { code: "AUTHORING_DUPLICATE", context: { "Existing ID": existingId, Record: `lnk/${existingId}/` } });
  }
  while (true) {
    const destination = path.join(repository.recordsPath, id);
    try {
      await access(destination);
      id = await uniqueId(repository.recordsPath);
      publicUrls = buildPublicUrls(siteBase, id);
      await writeFile(path.join(tempPath, "index.html"), generateRecordHtml({ id, targetUrl, createdAt, title, description, ...publicUrls }), "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      committedPath = destination;
      break;
    }
  }
  await rename(tempPath, committedPath);
  tempPath = undefined;
  mutationState = "record committed";

  stage = "manifest update";
  try {
    await prependManifest(repository.manifestPath, id, repository.ids);
    mutationState = "manifest committed";
  } catch (primary) {
    try {
      await rm(committedPath, { recursive: true });
      committedPath = undefined;
      mutationState = "rolled back";
    } catch (rollback) {
      const error = new Error(`Manifest update failed (${primary.message}); rollback also failed (${rollback.message}).`);
      error.code = "REPOSITORY_ROLLBACK_FAILED";
      error.context = { "Affected record": path.relative(ROOT, committedPath), "Repository state": "uncertain" };
      throw error;
    }
    const error = new Error(`Manifest update failed; the generated record was removed and repository state was restored. ${primary.message}`);
    error.code = "REPOSITORY_MANIFEST_WRITE_FAILED";
    error.context = { Rollback: "succeeded", "Repository state": "restored" };
    throw error;
  }

  stage = "post-write validation";
  const finalState = await validateRepository(ROOT);
  if (finalState.ids[0] !== id || finalState.ids.filter((value) => value === id).length !== 1) throw new Error("The new ID is not exactly once at the beginning of links.txt.");
  await releaseLock();
  releaseLock = undefined;
  logger.info("authoring", "Link added locally.");
  console.log(`\nTarget:\n  ${targetUrl}\n\nID:\n  ${id}\n\nShort URL:\n  ${publicUrls.shortUrl}\n\nRecord:\n  lnk/${id}/\n\nPreview:\n  lnk/${id}/preview.jpg\n\nThe generated files are local; review and publish them with your normal Git workflow.`);
}

async function validateTemporaryRecord(recordPath, expected) {
  const files = await Promise.all([stat(path.join(recordPath, "index.html")), stat(path.join(recordPath, "preview.jpg"))]);
  if (!files.every((item) => item.isFile())) throw new Error("Temporary record does not contain both required files.");
  await validateJpeg(path.join(recordPath, "preview.jpg"));
  const html = await readFile(path.join(recordPath, "index.html"), "utf8");
  if (metaFromHtml(html, "lnk:id") !== expected.id) throw new Error("Generated lnk:id does not match the record ID.");
  if (metaFromHtml(html, "lnk:target") !== expected.targetUrl) throw new Error("Generated lnk:target does not match the serialized input.");
  for (const name of ["lnk:created", "description"]) if (!metaFromHtml(html, name)) throw new Error(`Generated metadata ${name} is missing.`);
  for (const property of ["og:title", "og:description", "og:image", "og:url", "og:type"]) if (!metaFromHtml(html, property, true)) throw new Error(`Generated metadata ${property} is missing.`);
}

main().catch(async (cause) => {
  if (releaseLock) await releaseLock().catch(() => {});
  if (tempPath) await rm(tempPath, { recursive: true, force: true }).catch(() => {});
  const code = cause.code || (stage.includes("capture") || cause.stage ? "CAPTURE_FAILED" : stage.includes("repository") ? "REPOSITORY_INVALID" : "AUTHORING_FAILED");
  const diagnostic = createDiagnostic({
    code,
    module: code.startsWith("CAPTURE") ? "capture" : code.startsWith("REPOSITORY") ? "repository" : "authoring",
    stage: cause.stage || stage,
    summary: cause.code === "AUTHORING_DUPLICATE" ? "Duplicate target detected" : "Link operation failed",
    reason: cause.message,
    context: { ...(cause.context || {}), "Mutation state": mutationState },
    cause,
    userVisible: true
  });
  const fields = cause.code === "AUTHORING_DUPLICATE" ? [["Existing ID", cause.context?.["Existing ID"]], ["Record", cause.context?.Record], ["Short URL", cause.context?.["Short URL"]]] : [];
  fatal(diagnostic, fields.filter(([, value]) => value));
  if (!cause.code && cause.stack) console.error(`\nUnexpected stack:\n${cause.stack}`);
  process.exitCode = 1;
});
