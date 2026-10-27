import { afterEach, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import ts from "typescript-compiler-api";
import { auditTree, checkBoundaries } from "../../../scripts/check-boundaries";
import { verifyBuild, verifyServedBuild } from "../../../scripts/verify-build";

const temporaryRoots: string[] = [];

afterEach(async () => {
  for (const root of temporaryRoots.splice(0)) {
    if (!basename(root).startsWith("guided-acceptance-infra-"))
      throw new Error("Unsafe fixture cleanup target.");
    await rm(root, { recursive: true, force: true });
  }
});

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "guided-acceptance-infra-"));
  temporaryRoots.push(root);
  return root;
}

async function put(root: string, name: string, content: string): Promise<void> {
  const file = resolve(root, ...name.split("/"));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

const moduleOptions: ts.CompilerOptions = {
  module: ts.ModuleKind.Preserve,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
};

test("module isolation resolves aliases, re-exports, dynamic imports, type imports and require", async () => {
  const root = await fixtureRoot();
  const suite = resolve(root, "suite");
  await put(root, "product.ts", "export const secret = 1; export type Secret = number;");
  await put(suite, "src/local.ts", "export const local = 1;");
  await put(
    suite,
    "src/example.ts",
    [
      'import { secret } from "@product";',
      'export { secret } from "../../product";',
      'const lazy = import("../../product");',
      'type Private = import("../../product").Secret;',
      'const common = require("../../product");',
      'import { local } from "./local";',
    ].join("\n"),
  );
  const violations = await auditTree(resolve(suite, "src"), suite, {
    ...moduleOptions,
    baseUrl: suite,
    paths: { "@product": ["../product.ts"] },
  });
  expect(violations).toHaveLength(5);
  expect(violations.every((message) => message.includes("outside its application boundary"))).toBe(
    true,
  );
  await put(
    suite,
    "src/example.ts",
    'const moduleName = "./local"; const loaded = import(moduleName);',
  );
  expect(await auditTree(resolve(suite, "src"), suite, moduleOptions)).toEqual([
    expect.stringContaining("nonliteral module loading"),
  ]);
});

test("internal module cycles remain legal while a production-to-suite dependency is rejected", async () => {
  const root = await fixtureRoot();
  const suite = resolve(root, "suite");
  await put(suite, "src/a.ts", 'export { b } from "./b"; export const a = 1;');
  await put(suite, "src/b.ts", 'export { a } from "./a"; export const b = 2;');
  expect(await auditTree(resolve(suite, "src"), suite, moduleOptions)).toEqual([]);
  await put(root, "src/product.ts", 'import { a } from "../suite/src/a";');
  expect(await auditTree(resolve(root, "src"), root, moduleOptions, suite)).toEqual([
    expect.stringContaining("outside its application boundary"),
  ]);
});

test("source links cannot disguise a dependency outside the suite", async () => {
  const root = await fixtureRoot();
  const suite = resolve(root, "suite");
  await mkdir(resolve(suite, "src"), { recursive: true });
  await put(root, "outside/secret.ts", "export const secret = 1;");
  await symlink(
    resolve(root, "outside"),
    resolve(suite, "src", "linked"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await expect(auditTree(resolve(suite, "src"), suite, moduleOptions)).rejects.toThrow(
    "Source symlinks are not allowed",
  );
});

test("configuration inheritance, outside includes/aliases, and linked dependencies cannot bypass isolation", async () => {
  const root = await fixtureRoot();
  const suite = resolve(root, "suite");
  await put(root, "src/product.ts", "export const product = 1;");
  await put(
    root,
    "tsconfig.json",
    JSON.stringify({ compilerOptions: moduleOptions, include: ["src/**/*.ts"] }),
  );
  await put(suite, "src/local.ts", "export const local = 1;");
  await put(suite, "scripts/local.ts", "export {};");
  await put(suite, "playwright.config.ts", "export default {};");
  await put(suite, "package.json", JSON.stringify({ devDependencies: {} }));
  await put(suite, "tsconfig.json", JSON.stringify({ extends: "../tsconfig.json" }));
  await expect(checkBoundaries(suite)).rejects.toThrow("without project inheritance");
  await put(suite, "tsconfig.json", JSON.stringify({ include: ["../src/**/*.ts"] }));
  await expect(checkBoundaries(suite)).rejects.toThrow("includes product or outside source");
  await put(
    suite,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { paths: { "@product/*": ["../src/*"] } },
      include: ["src/**/*.ts"],
    }),
  );
  await expect(checkBoundaries(suite)).rejects.toThrow("alias escapes");
  await put(suite, "tsconfig.json", JSON.stringify({ include: ["src/**/*.ts"] }));
  await put(suite, "package.json", JSON.stringify({ devDependencies: { product: "file:.." } }));
  await expect(checkBoundaries(suite)).rejects.toThrow(
    "must not link product or workspace packages",
  );
});

async function builtFixture(): Promise<string> {
  const root = await fixtureRoot();
  const sourceFiles: Record<string, string> = {
    "src/main.ts": "console.info('independent infrastructure fixture');",
    "assets/icon.svg": "<svg/>",
    "scripts/build.ts": "// independent metadata fixture",
    "templates/manifest.json": '{"templates":[{"file":"example.gtl"}]}',
    "templates/example.gtl": "TEMPLATE: Fixture\nTEXT:\n  Fixture text.",
    "index.html": "<!doctype html><title>Fixture</title>",
    "package.json": "{}",
    "bun.lock": "{}",
    "tsconfig.json": "{}",
    "tsconfig.worker.json": "{}",
    "tsconfig.tools.json": "{}",
    "THIRD-PARTY-NOTICES.md": "Fixture notices.",
  };
  const outputs: Record<string, string> = {
    "index.html": sourceFiles["index.html"]!,
    "app.js": "console.info('fixture bundle');",
    "worker.js": "self.onmessage = () => {};",
    "styles.css": "body { color: black; }",
    "templates/manifest.json": sourceFiles["templates/manifest.json"]!,
    "templates/example.gtl": sourceFiles["templates/example.gtl"]!,
  };
  const inputs: Record<string, string> = {};
  const outputHashes: Record<string, string> = {};
  for (const name of Object.keys(sourceFiles).sort()) {
    const text = sourceFiles[name]!;
    await put(root, name, text);
    inputs[name] = createHash("sha256").update(text).digest("hex");
  }
  for (const [name, text] of Object.entries(outputs)) {
    await put(resolve(root, "dist"), name, text);
    outputHashes[name] = createHash("sha256").update(text).digest("hex");
  }
  await put(
    root,
    "dist/build-info.json",
    JSON.stringify({ format: 1, inputs, outputs: outputHashes }),
  );
  return root;
}

test("build preflight rejects absent builds, modified inputs, and newly added inputs", async () => {
  const absent = await fixtureRoot();
  await expect(verifyBuild(absent)).rejects.toThrow("Build Guided first");
  const root = await builtFixture();
  expect(await verifyBuild(root)).toMatch(/^[a-f0-9]{64}$/);
  const source = await readFile(resolve(root, "src", "main.ts"), "utf8");
  await put(root, "src/main.ts", source + "\n// changed");
  await expect(verifyBuild(root)).rejects.toThrow("build is stale: src/main.ts changed");
  await put(root, "src/main.ts", source);
  await put(root, "src/new-module.ts", "export const newInput = true;");
  await expect(verifyBuild(root)).rejects.toThrow("build inputs were added or removed");
});

test("build preflight rejects empty workers and nonempty artifacts changed after compilation", async () => {
  const root = await builtFixture();
  const worker = await readFile(resolve(root, "dist", "worker.js"), "utf8");
  await put(root, "dist/worker.js", "");
  await expect(verifyBuild(root)).rejects.toThrow("missing or empty worker.js");
  await put(root, "dist/worker.js", worker + "\n// tampered");
  await expect(verifyBuild(root)).rejects.toThrow("artifact changed after compilation: worker.js");
});

test("served provenance rejects stale template bytes even when metadata and core bundles match", async () => {
  const root = await builtFixture();
  let stale = true;
  let templateRequests = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const name = new URL(request.url).pathname.slice(1);
      if (name === "templates/example.gtl") {
        templateRequests++;
        if (stale) return new Response("TEMPLATE: Stale\nTEXT:\n  Old guidance.");
      }
      return new Response(await readFile(resolve(root, "dist", ...name.split("/"))));
    },
  });
  try {
    await expect(verifyServedBuild(root, server.url.href)).rejects.toThrow(
      "different or missing templates/example.gtl",
    );
    expect(templateRequests).toBe(1);
    stale = false;
    await verifyServedBuild(root, server.url.href);
    expect(templateRequests).toBe(2);
  } finally {
    await server.stop(true);
  }
});
