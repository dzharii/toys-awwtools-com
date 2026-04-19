import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const distDir = path.join(root, "dist");
const assetsDir = path.join(distDir, "assets");
const vendorDistDir = path.join(distDir, "vendor", "wasm-clang");

await fs.mkdir(distDir, { recursive: true });
await emptyDirectory(distDir);
await fs.mkdir(assetsDir, { recursive: true });
await fs.mkdir(vendorDistDir, { recursive: true });

await run("bun", ["build", "app/main.ts", "--target", "browser", "--format", "esm", "--outfile", path.join(assetsDir, "main.js")]);
await run("bun", [
  "build",
  "worker/compile.worker.ts",
  "--target",
  "browser",
  "--format",
  "iife",
  "--outfile",
  path.join(assetsDir, "compile.worker.js")
]);
await run("bun", ["build", "worker/run.worker.ts", "--target", "browser", "--format", "iife", "--outfile", path.join(assetsDir, "run.worker.js")]);

await copy(path.join(root, "index.dist.html"), path.join(distDir, "index.html"));
await copy(path.join(root, "style.css"), path.join(distDir, "style.css"));
await copy(path.join(root, "sw.js"), path.join(distDir, "sw.js"));

const vendorFiles = ["clang", "lld", "memfs", "shared.js", "sysroot.tar", "LICENSE", "LICENSE.llvm", "README.md"];
for (const file of vendorFiles) {
  await copy(path.join(root, "vendor", "wasm-clang", file), path.join(vendorDistDir, file));
}

for (const wasmFile of ["clang", "lld", "memfs"]) {
  await copy(path.join(root, "vendor", "wasm-clang", wasmFile), path.join(vendorDistDir, `${wasmFile}.wasm`));
}

await copy(path.join(root, "vendor", "meta", "versions.json"), path.join(distDir, "vendor", "meta", "versions.json"));

console.log(`Build complete -> ${distDir}`);

async function copy(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
}

async function emptyDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    await fs.rm(target, { recursive: true, force: true });
  }
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: root
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });
}
