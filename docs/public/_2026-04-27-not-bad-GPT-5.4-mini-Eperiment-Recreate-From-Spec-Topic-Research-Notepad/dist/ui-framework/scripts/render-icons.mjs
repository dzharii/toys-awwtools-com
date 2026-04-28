import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Resvg } from "@resvg/resvg-js";
import { ICONS } from "../src/icons/retro-icons.js";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const outdir = join(root, "tmp", "icon-validation");
const svgDir = join(outdir, "svg");
const pngDir = join(outdir, "png");
const sizes = [16, 24, 32, 48];

function svgDocument(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#111820" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">${body}</svg>`;
}

async function renderIcon(name, body) {
  const svgPath = join(svgDir, `${name}.svg`);
  const svg = svgDocument(body);
  await writeFile(svgPath, svg);

  for (const size of sizes) {
    const pngPath = join(pngDir, `${name}-${size}.png`);
    const renderer = new Resvg(svg, {
      fitTo: { mode: "width", value: size },
      background: "rgba(0, 0, 0, 0)"
    });
    await writeFile(pngPath, renderer.render().asPng());
  }
}

async function main() {
  await rm(outdir, { recursive: true, force: true });
  await mkdir(svgDir, { recursive: true });
  await mkdir(pngDir, { recursive: true });

  for (const [name, body] of Object.entries(ICONS)) {
    await renderIcon(name, body);
  }

  const contactInputs = Object.keys(ICONS).map((name) => join(pngDir, `${name}-32.png`));
  await execFileAsync("magick", [
    "montage",
    ...contactInputs,
    "-background",
    "#f6f8fa",
    "-tile",
    "10x",
    "-geometry",
    "48x48+8+22",
    join(outdir, "retro-icons-contact-sheet.png")
  ]);

  console.log(`[icons] rendered ${Object.keys(ICONS).length} icons`);
  console.log(`[icons] ${join(outdir, "retro-icons-contact-sheet.png")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
