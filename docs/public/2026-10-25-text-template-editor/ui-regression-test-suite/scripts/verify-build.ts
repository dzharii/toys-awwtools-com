/** Build provenance is infrastructure metadata, never an expected-rendering oracle. */
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { FullConfig } from "@playwright/test";

export const productRoot = resolve(
  process.env.GUIDED_PRODUCT_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "..", ".."),
);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function sourceNames(root: string, directory: string): Promise<string[]> {
  const entries = await readdir(resolve(root, directory), { withFileTypes: true });
  const names: string[] = [];
  for (const entry of entries) {
    const name = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) names.push(...(await sourceNames(root, name)));
    else names.push(name);
  }
  return names;
}

async function requireFile(file: string, description: string, instruction: string): Promise<void> {
  try {
    const details = await stat(file);
    if (!details.isFile() || details.size === 0) throw new Error("Not a nonempty file.");
  } catch (cause) {
    throw new Error(`Guided build is incomplete: missing or empty ${description}. ${instruction}`, {
      cause,
    });
  }
}

function fingerprint(metadata: { inputs: unknown; outputs: unknown }): string {
  return createHash("sha256")
    .update(JSON.stringify({ inputs: metadata.inputs, outputs: metadata.outputs }))
    .digest("hex");
}

export async function verifyBuild(root: string): Promise<string> {
  const dist = resolve(root, "dist");
  const instruction = `Build Guided first: Set-Location -LiteralPath '${root}'; bun run build`;
  let metadata: unknown;
  try {
    metadata = JSON.parse(await readFile(resolve(dist, "build-info.json"), "utf8"));
  } catch (cause) {
    throw new Error(`Guided build is absent or lacks valid provenance. ${instruction}`, { cause });
  }
  if (
    !record(metadata) ||
    metadata.format !== 1 ||
    !record(metadata.inputs) ||
    !record(metadata.outputs)
  ) {
    throw new Error(`Guided build provenance is invalid. ${instruction}`);
  }
  const expectedNames = [
    ...(
      await Promise.all(
        ["src", "templates", "assets", "scripts"].map((name) => sourceNames(root, name)),
      )
    ).flat(),
    "index.html",
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "tsconfig.worker.json",
    "tsconfig.tools.json",
    "THIRD-PARTY-NOTICES.md",
  ].sort();
  const actualNames = Object.keys(metadata.inputs).sort();
  if (JSON.stringify(expectedNames) !== JSON.stringify(actualNames)) {
    throw new Error(`Guided build is stale: build inputs were added or removed. ${instruction}`);
  }
  for (const name of expectedNames) {
    const hash = createHash("sha256")
      .update(await readFile(resolve(root, ...name.split("/"))))
      .digest("hex");
    if (hash !== metadata.inputs[name]) {
      throw new Error(`Guided build is stale: ${name} changed. ${instruction}`);
    }
  }
  for (const name of [
    "index.html",
    "app.js",
    "worker.js",
    "styles.css",
    "templates/manifest.json",
  ]) {
    const file = resolve(dist, ...name.split("/"));
    await requireFile(file, name, instruction);
  }
  const outputNames = (await sourceNames(dist, ""))
    .filter((name) => name !== "build-info.json")
    .sort();
  if (JSON.stringify(outputNames) !== JSON.stringify(Object.keys(metadata.outputs).sort())) {
    throw new Error(`Guided build output was added or removed after compilation. ${instruction}`);
  }
  for (const name of outputNames) {
    const hash = createHash("sha256")
      .update(await readFile(resolve(dist, ...name.split("/"))))
      .digest("hex");
    if (hash !== metadata.outputs[name]) {
      throw new Error(`Guided build artifact changed after compilation: ${name}. ${instruction}`);
    }
  }
  const manifest: unknown = JSON.parse(
    await readFile(resolve(dist, "templates", "manifest.json"), "utf8"),
  );
  if (!record(manifest) || !Array.isArray(manifest.templates) || !manifest.templates.length) {
    throw new Error(`Guided built template manifest is empty or invalid. ${instruction}`);
  }
  for (const entry of manifest.templates) {
    if (!record(entry) || typeof entry.file !== "string") {
      throw new Error(`Guided built template manifest has an invalid entry. ${instruction}`);
    }
    const path = resolve(dist, "templates", entry.file.replaceAll("/", sep));
    if (!path.startsWith(resolve(dist, "templates") + sep)) {
      throw new Error(`Guided built template asset is invalid or missing. ${instruction}`);
    }
    await requireFile(path, `template asset ${entry.file}`, instruction);
  }
  return fingerprint({ inputs: metadata.inputs, outputs: metadata.outputs });
}

export async function verifyServedBuild(root: string, baseURL: string): Promise<void> {
  const signature = await verifyBuild(root);
  const response = await fetch(new URL("build-info.json", baseURL), {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok)
    throw new Error(
      `The configured Guided server did not serve build-info.json (${response.status}).`,
    );
  const metadata: unknown = await response.json();
  if (
    !record(metadata) ||
    !record(metadata.inputs) ||
    !record(metadata.outputs) ||
    fingerprint({ inputs: metadata.inputs, outputs: metadata.outputs }) !== signature
  ) {
    throw new Error(
      "The configured server is serving a different Guided build. Rebuild and restart its preview server.",
    );
  }
  for (const name of Object.keys(metadata.outputs)) {
    const asset = await fetch(new URL(name, baseURL), { signal: AbortSignal.timeout(10_000) });
    const actual = createHash("sha256")
      .update(Buffer.from(await asset.arrayBuffer()))
      .digest("hex");
    if (!asset.ok || actual !== metadata.outputs[name]) {
      throw new Error(
        `The configured server is serving a different or missing ${name}. Restart it with the verified Guided dist.`,
      );
    }
  }
}

export default async function setup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) throw new Error("A Guided baseURL must be configured.");
  await verifyServedBuild(productRoot, baseURL);
}
