import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const root = process.cwd();
const versionsPath = path.join(root, "vendor", "meta", "versions.json");
const existing = await readExisting(versionsPath);

const meta = {
  generatedAt: new Date().toISOString(),
  tinycc: {
    repo: "https://github.com/TinyCC/tinycc",
    commit: gitHead(path.join(root, "vendor", "tinycc"), existing?.tinycc?.commit)
  },
  wasmClang: {
    repo: "https://github.com/binji/wasm-clang",
    commit: gitHead(path.join(root, "vendor", "wasm-clang"), existing?.wasmClang?.commit)
  }
};

await fs.mkdir(path.dirname(versionsPath), { recursive: true });
await fs.writeFile(versionsPath, JSON.stringify(meta, null, 2) + "\n", "utf8");
console.log(`Wrote ${versionsPath}`);

function gitHead(cwd, fallbackCommit = "unknown") {
  if (!fsSync.existsSync(path.join(cwd, ".git"))) {
    return fallbackCommit;
  }
  return execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
}

async function readExisting(file) {
  try {
    const text = await fs.readFile(file, "utf8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}
