/** Reproducible static build. Templates are validated before any output is replaced. */
import { cp, mkdir, rm, readdir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { parseTemplate } from "../src/features/templates/parser";
import { validateManifest } from "../src/features/templates/loader";

const root = resolve(import.meta.dir, "..");
const manifest = validateManifest(
  await Bun.file(resolve(root, "templates", "manifest.json")).json(),
);
for (const entry of manifest) {
  const parsed = parseTemplate(await Bun.file(resolve(root, "templates", entry.file)).text());
  if (!parsed.template) throw new Error(`${entry.file}: ${JSON.stringify(parsed.diagnostics)}`);
  if (parsed.template.name !== entry.name)
    throw new Error(`Manifest name differs from TEMPLATE in ${entry.file}`);
}
const outdir = resolve(root, "dist");
await rm(outdir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
for (const entry of ["src/app/main.ts", "src/worker/main.ts"]) {
  const result = await Bun.build({
    entrypoints: [resolve(root, entry)],
    outdir,
    target: "browser",
    format: "esm",
    naming: entry.includes("worker") ? "worker.js" : "app.js",
    minify: true,
    sourcemap: "external",
  });
  if (!result.success) throw new AggregateError(result.logs, `Failed to build ${entry}`);
}
await cp(resolve(root, "index.html"), resolve(outdir, "index.html"));
await cp(resolve(root, "src", "app", "styles.css"), resolve(outdir, "styles.css"));
await cp(resolve(root, "templates"), resolve(outdir, "templates"), { recursive: true });
await cp(resolve(root, "assets"), resolve(outdir, "assets"), { recursive: true });
await mkdir(resolve(outdir, "licenses"), { recursive: true });
await cp(
  resolve(root, "THIRD-PARTY-NOTICES.md"),
  resolve(outdir, "licenses", "THIRD-PARTY-NOTICES.md"),
);
await cp(
  resolve(root, "src", "vendor", "dexie", "LICENSE"),
  resolve(outdir, "licenses", "Dexie-LICENSE.txt"),
);
await cp(
  resolve(root, "src", "vendor", "microlight", "LICENSE"),
  resolve(outdir, "licenses", "microlight-LICENSE.txt"),
);
async function inputFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory() ? inputFiles(path) : [path];
      }),
    )
  ).flat();
}
const inputs: Record<string, string> = {};
const files = [
  ...(
    await Promise.all(
      ["src", "templates", "assets", "scripts"].map((name) => inputFiles(resolve(root, name))),
    )
  ).flat(),
  ...[
    "index.html",
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "tsconfig.worker.json",
    "tsconfig.tools.json",
    "THIRD-PARTY-NOTICES.md",
  ].map((name) => resolve(root, name)),
].sort();
for (const file of files) {
  inputs[relative(root, file).split(sep).join("/")] = createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}
const outputs: Record<string, string> = {};
for (const file of (await inputFiles(outdir)).sort()) {
  outputs[relative(outdir, file).split(sep).join("/")] = createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}
await Bun.write(
  resolve(outdir, "build-info.json"),
  JSON.stringify({ format: 1, builtAt: new Date().toISOString(), inputs, outputs }, null, 2) + "\n",
);
console.info(`Built ${manifest.length} templates and browser/worker bundles in dist.`);
