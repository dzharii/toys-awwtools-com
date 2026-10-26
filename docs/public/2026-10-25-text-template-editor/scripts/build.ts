/** Reproducible static build. Templates are validated before any output is replaced. */
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
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
console.info(`Built ${manifest.length} templates and browser/worker bundles in dist.`);
