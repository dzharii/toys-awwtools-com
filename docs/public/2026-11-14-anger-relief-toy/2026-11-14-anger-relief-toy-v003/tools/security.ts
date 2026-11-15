import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
/** Conservative source guardrails, supplementary to independent manual review. */
export function validateFeatureSource(code: string, path: string): void {
  if (
    /\b(?:eval|Function|fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(|\b(?:chrome|browser)\s*[.[]|\.innerHTML\s*=|\b(?:localStorage|sessionStorage)\b|document\.cookie|new\s+(?:(?:window|globalThis)\.)?(?:AudioContext|OfflineAudioContext|Audio)\s*\(|dispatchEvent\s*\(/.test(
      code,
    )
  )
    throw new Error(`Prohibited capability: ${path}`);
  for (const match of code.matchAll(/(?:from\s*|import\s*\()["']([^"']+)["']/g)) {
    const name = match[1]!;
    if (!name.startsWith("./") && !name.startsWith("../../sdk/"))
      throw new Error(`Invalid feature dependency: ${path}`);
  }
}
export async function auditFeature(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await auditFeature(path);
      continue;
    }
    if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts"))
      validateFeatureSource(await readFile(path, "utf8"), path);
  }
}
