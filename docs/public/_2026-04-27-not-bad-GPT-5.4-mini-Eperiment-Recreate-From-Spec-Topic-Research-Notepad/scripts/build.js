import { mkdir, copyFile, cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const files = [
    "index.html",
    "styles.css",
    "readme.md",
    "package.json",
    "IMPLEMENTATION_NOTES.md",
    "MANUAL_TESTING.md",
    "OBSERVABILITY.md"
  ];

  for (const file of files) {
    await copyFile(join(root, file), join(dist, file));
  }

  await cp(join(root, "src"), join(dist, "src"), { recursive: true });
  await cp(join(root, "ui-framework"), join(dist, "ui-framework"), { recursive: true });
  await cp(join(root, "vendor-libs"), join(dist, "vendor-libs"), { recursive: true });
  await cp(join(root, "img"), join(dist, "img"), { recursive: true });
  await cp(join(root, "favicon.ico"), join(dist, "favicon.ico"));
  await cp(join(root, "favicon-16x16.png"), join(dist, "favicon-16x16.png"));
  await cp(join(root, "favicon-32x32.png"), join(dist, "favicon-32x32.png"));
  await cp(join(root, "apple-touch-icon.png"), join(dist, "apple-touch-icon.png"));
  await cp(join(root, "social-card.png"), join(dist, "social-card.png"));

  console.log(`Built static app in ${dist}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

