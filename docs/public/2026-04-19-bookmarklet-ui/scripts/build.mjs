import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

function arg(name, fallback = "") {
  const token = `--${name}`;
  const idx = process.argv.indexOf(token);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

const mode = arg("mode", "development");
const production = mode === "production";

const root = process.cwd();
const outdir = join(root, "dist");

async function runBuild() {
  await rm(outdir, { recursive: true, force: true });
  await mkdir(outdir, { recursive: true });

  const result = await Bun.build({
    entrypoints: [join(root, "src", "bookmarklet", "index.js"), join(root, "src", "demo", "catalog.js")],
    outdir,
    target: "browser",
    format: "esm",
    minify: production,
    sourcemap: production ? "none" : "linked",
    naming: "[dir]/[name].js",
    write: true
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exitCode = 1;
    return;
  }

  for (const output of result.outputs) {
    console.log(`[build] ${output.path}`);
  }
}

runBuild().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
