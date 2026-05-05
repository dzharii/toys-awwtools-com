import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const rootDir = resolve(".");
const distDir = resolve(rootDir, "dist");

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function copyFile(source, target) {
  await ensureDir(dirname(target));
  const content = await readFile(source, "utf8");
  await writeFile(target, content, "utf8");
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await ensureDir(distDir);
  await copyFile(resolve(rootDir, "index.html"), resolve(distDir, "index.html"));
  await cp(resolve(rootDir, "src"), resolve(distDir, "src"), { recursive: true });
  const publicDir = resolve(rootDir, "public");
  const publicEntries = await readdir(publicDir, { withFileTypes: true });
  for (const entry of publicEntries) {
    await cp(resolve(publicDir, entry.name), resolve(distDir, entry.name), { recursive: true });
  }
  await rm(resolve(distDir, "src/vendor/retroos-ui-v001/test"), { recursive: true, force: true });
  await rm(resolve(distDir, "src/vendor/retroos-ui-v001/.archived"), { recursive: true, force: true });
  console.log("Build complete: dist/index.html");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
