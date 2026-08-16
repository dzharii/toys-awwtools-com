#!/usr/bin/env node
import { validateRepository, ROOT } from "./repository.mjs";
import { validateJpeg } from "./jpeg.mjs";
import path from "node:path";

try {
  const repository = await validateRepository(ROOT);
  for (const id of repository.ids) await validateJpeg(path.join(repository.recordsPath, id, "preview.jpg"));
  console.log(`Repository valid.\n\nRecords:\n  ${repository.ids.length}\n\nManifest:\n  ${repository.manifestPath}`);
} catch (error) {
  console.error(`Sorry, the link archive needs attention.\n\nReason:\n  ${error.message}\n\nStage:\n  repository validation`);
  process.exitCode = 1;
}
