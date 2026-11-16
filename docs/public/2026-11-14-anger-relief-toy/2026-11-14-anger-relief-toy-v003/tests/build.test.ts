import { test, expect } from "bun:test";
import { cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

test(
  "build resolves its project directory with spaces and URL characters from another cwd",
  async () => {
    const root = fileURLToPath(new URL("../", import.meta.url));
    const fixture = await mkdtemp(join(tmpdir(), "anger relief #%-"));
    try {
      await Promise.all(
        ["src", "tools", "public"].map((directory) =>
          cp(join(root, directory), join(fixture, directory), { recursive: true }),
        ),
      );
      const child = Bun.spawn([process.execPath, join(fixture, "tools", "build.ts")], {
        cwd: tmpdir(),
        stdout: "pipe",
        stderr: "pipe",
      });
      const [exitCode, stderr] = await Promise.all([
        child.exited,
        new Response(child.stderr).text(),
        new Response(child.stdout).text(),
      ]);
      expect({ exitCode, stderr }).toEqual({ exitCode: 0, stderr: "" });
      const manifest = JSON.parse(await readFile(join(fixture, "dist", "manifest.json"), "utf8"));
      expect(manifest.manifest_version).toBe(3);
      expect(await readdir(join(fixture, "dist", "effects"))).toContain("punch-element.js");
      expect((await readFile(join(fixture, "dist", "content.js"), "utf8")).length).toBeGreaterThan(0);
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  },
  30000,
);
