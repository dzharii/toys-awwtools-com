import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "index.html"), resolve(output, "index.html"));
await cp(resolve(root, "src"), resolve(output, "src"), { recursive: true });
await cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true });
await writeFile(resolve(output, ".nojekyll"), "");

const html = await readFile(resolve(output, "index.html"), "utf8");
const rootRelative = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((match) => match[1]);
if (rootRelative.length) throw new Error(`Root-relative paths would break GitHub Pages project hosting: ${rootRelative.join(", ")}`);
const remoteRuntimeAssets = [
  ...html.matchAll(/<script\b[^>]*\bsrc="https?:\/\/[^\"]+"/gi),
  ...html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="https?:\/\/[^\"]+"/gi),
];
if (remoteRuntimeAssets.length) throw new Error("The production page must not require a runtime CDN.");

console.log("Built dependency-free static site in dist/");
