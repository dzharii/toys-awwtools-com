import { createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pipeline } from "node:stream/promises";

const PACKAGE = "lit";
const VERSION = "3.3.2";
const TARBALL = `https://registry.npmjs.org/${PACKAGE}/-/${PACKAGE}-${VERSION}.tgz`;
const TARGET = join(process.cwd(), "vendor", "lit");
const TMP = join(process.cwd(), ".tmp", basename(TARBALL));

async function main() {
  await mkdir(join(process.cwd(), ".tmp"), { recursive: true });
  await rm(TARGET, { force: true, recursive: true });
  await mkdir(TARGET, { recursive: true });

  const response = await fetch(TARBALL);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  await pipeline(response.body, createWriteStream(TMP));

  const proc = Bun.spawn(["tar", "-xzf", TMP, "-C", TARGET, "--strip-components=1"], {
    stdout: "inherit",
    stderr: "inherit"
  });

  const code = await proc.exited;
  if (code !== 0) throw new Error(`tar failed: ${code}`);

  await writeFile(
    join(TARGET, "VENDORED_FROM.json"),
    JSON.stringify({ package: PACKAGE, version: VERSION, tarball: TARBALL, fetchedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
