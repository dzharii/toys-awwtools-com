import { readFileSync } from "node:fs";
import { join } from "node:path";

export const rootDir = join(import.meta.dir, "..");

export function readJson(relativePath) {
  return JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
}

