import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import ts from "typescript-compiler-api";
import { checkSurfaceRegistry } from "../../../scripts/check-surface-registry";
import { assertValidSurfaces, surfaceRegistry } from "../../framework/surface-registry";
import { executeSurfaceSmoke, type SmokeExecution } from "../../framework/surface-smoke";
import { Timings } from "../../framework/timings";
import { captureSurface } from "../../support/capture-surface";

const suiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const temporaryParent = resolve(suiteRoot, "..", "temp", "registry-fixtures");
const roots: string[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) {
    if (dirname(root) !== temporaryParent || !basename(root).startsWith("registry-"))
      throw new Error("Unsafe registry fixture cleanup target.");
    await rm(root, { recursive: true, force: true });
  }
});

async function put(root: string, name: string, source: string): Promise<void> {
  const file = resolve(root, ...name.split("/"));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, source);
}
async function registryFixture(): Promise<string> {
  await mkdir(temporaryParent, { recursive: true });
  const root = await mkdtemp(resolve(temporaryParent, "registry-"));
  roots.push(root);
  await put(
    root,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { module: "Preserve", moduleResolution: "bundler", noEmit: true },
      include: ["src/**/*.ts"],
    }),
  );
  await put(root, "src/framework/page-object.ts", "export abstract class PageObject {}");
  await put(
    root,
    "src/surfaces.ts",
    [
      'import { PageObject as Base } from "./framework/page-object";',
      "export abstract class Intermediate extends Base {}",
      "class Direct extends Intermediate {}",
      "export { Direct as Renamed };",
      "export class Component {}",
    ].join("\n"),
  );
  await put(
    root,
    "src/framework/surface-registry.ts",
    [
      'import { Renamed } from "../surfaces";',
      "const existing = new Renamed();",
      'export const surfaceRegistry = [{id:"direct",pageObject:Renamed,create:()=>existing}];',
    ].join("\n"),
  );
  return root;
}

test("registry discovery resolves indirect inheritance and aliased exports, excluding abstract classes and components", async () => {
  expect(checkSurfaceRegistry(await registryFixture())).toBe(1);
});
test("an exported concrete subclass anywhere in suite source cannot escape registration", async () => {
  const root = await registryFixture();
  await put(
    root,
    "src/elsewhere/new-surface.ts",
    'import { Intermediate } from "../surfaces"; export class Forgotten extends Intermediate {}',
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Unregistered Page Objects:\nForgotten");
  await put(
    root,
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { module: "Preserve", moduleResolution: "bundler", noEmit: true },
      include: ["src/**/*.ts"],
      exclude: ["src/elsewhere"],
    }),
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Unregistered Page Objects:\nForgotten");
});
test("concrete subclasses beside the base and within exported namespaces require registration", async () => {
  const root = await registryFixture();
  await put(
    root,
    "src/framework/page-object.ts",
    "export abstract class PageObject {} export class BesideBase extends PageObject {}",
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Unregistered Page Objects:\nBesideBase");
  await put(root, "src/framework/page-object.ts", "export abstract class PageObject {}");
  await put(
    root,
    "src/namespaced.ts",
    'import { PageObject } from "./framework/page-object"; export namespace Surfaces { export namespace Nested { export class Forgotten extends PageObject {} } }',
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Unregistered Page Objects:\nForgotten");
});
test("a same-named unrelated base does not become a PageObject", async () => {
  const root = await registryFixture();
  await put(
    root,
    "src/unrelated.ts",
    "class PageObject {} export class Unrelated extends PageObject {}",
  );
  expect(checkSurfaceRegistry(root)).toBe(1);
});
test("exported class expressions and anonymous default classes cannot escape registration", async () => {
  const root = await registryFixture();
  await put(
    root,
    "src/expression.ts",
    'import { PageObject } from "./framework/page-object"; export const Expression = class extends PageObject {};',
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Unregistered Page Objects");
  await put(
    root,
    "src/expression.ts",
    'import { PageObject } from "./framework/page-object"; export default class extends PageObject {}',
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Unregistered Page Objects");
});
test("completeness rejects wrong factory types and duplicate IDs/classes", async () => {
  const root = await registryFixture();
  const prefix = 'import { Renamed, Component } from "../surfaces";\n';
  await put(
    root,
    "src/framework/surface-registry.ts",
    prefix +
      'export const surfaceRegistry = [{id:"direct",pageObject:Renamed,create:()=>new Component()}];',
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("factory must return");
  const entry = '{id:"direct",pageObject:Renamed,create:()=>new Renamed()}';
  await put(
    root,
    "src/framework/surface-registry.ts",
    prefix + `export const surfaceRegistry = [${entry},${entry}];`,
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("Duplicate surface ID");
  await put(
    root,
    "src/framework/surface-registry.ts",
    prefix + `export const surfaceRegistry = [${entry},${entry.replace('"direct"', '"other"')}];`,
  );
  expect(() => checkSurfaceRegistry(root)).toThrow("duplicate Page Object class");
});
test("registry runtime validation rejects unsafe filenames and duplicate entries", () => {
  const first = surfaceRegistry[0]!;
  for (const id of ["../escape", "con", "aux", "two/parts", "Upper", ""])
    expect(() => assertValidSurfaces([{ ...first, id }])).toThrow("Unsafe surface ID");
  expect(() => assertValidSurfaces([first, first])).toThrow("Duplicate surface ID");
  expect(() => assertValidSurfaces([first, { ...first, id: "another" }])).toThrow(
    "duplicate Page Object",
  );
});

function harness(failure?: string, defaults: "validate" | "not-applicable" = "validate") {
  const calls: string[] = [];
  let critical = false;
  const call = (name: string) => {
    calls.push(name);
    if (failure === name) throw new Error(`Synthetic ${name} failure`);
  };
  const execution: SmokeExecution = {
    surface: { id: "sample", description: "Synthetic contract", defaults },
    create: () => {
      call("factory");
      return {
        expectedControls: () => [],
        open: async () => {
          call("open");
        },
        exists: async () => {
          call("exists");
          return failure !== "absent";
        },
        expectReady: async () => {
          call("ready");
        },
        expectDefaultState: async () => {
          call("defaults");
        },
      };
    },
    diagnostics: {
      assertHealthy: () => {
        call("healthy");
        if (critical) throw new Error("Unexpected critical browser failure");
      },
      hasCriticalErrors: () => critical,
      summary: () => (critical ? "Synthetic pageerror" : "No critical diagnostics"),
    },
    timings: new Timings(),
    identity: "synthetic-session",
    step: async (_name, action) => action(),
    actions: [
      {
        id: "one",
        run: async () => {
          call("one");
        },
      },
      {
        id: "two",
        run: async () => {
          call("two");
        },
      },
    ],
  };
  return {
    calls,
    execution,
    makeCritical: () => {
      critical = true;
    },
  };
}
test("shared pipeline validates every stage, reopens once, and runs injected actions in order", async () => {
  const { calls, execution } = harness();
  await executeSurfaceSmoke(execution);
  expect(calls).toEqual([
    "factory",
    "open",
    "exists",
    "ready",
    "defaults",
    "healthy",
    "open",
    "exists",
    "ready",
    "healthy",
    "one",
    "healthy",
    "two",
    "healthy",
    "healthy",
  ]);
});
test("not-applicable defaults and no actions still validate the complete surface twice", async () => {
  const { calls, execution } = harness(undefined, "not-applicable");
  await executeSurfaceSmoke({ ...execution, actions: [] });
  expect(calls).toEqual([
    "factory",
    "open",
    "exists",
    "ready",
    "healthy",
    "open",
    "exists",
    "ready",
    "healthy",
    "healthy",
  ]);
});
test.each([
  ["factory", "factory"],
  ["open", "opening"],
  ["exists", "structure"],
  ["absent", "structure"],
  ["ready", "structure"],
  ["defaults", "default-state"],
  ["one", "extension"],
])("%s failure is classified as %s and short-circuits later work", async (failure, stage) => {
  const { calls, execution } = harness(failure);
  await expect(executeSurfaceSmoke(execution)).rejects.toMatchObject({
    surfaceId: "sample",
    stage,
    ...(failure === "one" ? { operation: "action one" } : {}),
  });
  expect(calls).not.toContain("two");
  if (failure !== "one") expect(calls).not.toContain("one");
});
test("critical browser failures are not mislabeled structural or extension failures", async () => {
  const { execution, calls, makeCritical } = harness();
  makeCritical();
  await expect(executeSurfaceSmoke(execution)).rejects.toMatchObject({
    stage: "application/browser",
  });
  expect(calls).not.toContain("one");
});
test("failure on second opening prevents actions without rerunning default focus", async () => {
  const { execution, calls } = harness();
  const original = execution.create();
  let opens = 0;
  await expect(
    executeSurfaceSmoke({
      ...execution,
      create: () => ({
        ...original,
        open: async () => {
          if (++opens === 2) throw new Error("Reopening is broken");
        },
      }),
    }),
  ).rejects.toMatchObject({ stage: "opening" });
  expect(calls.filter((name) => name === "defaults")).toHaveLength(1);
  expect(calls).not.toContain("one");
});

test("capture uses the existing page, deterministic per-test output, full PNG options, and an attachment", async () => {
  let options: Parameters<Page["screenshot"]>[0];
  const attached: string[] = [];
  const path = resolve(temporaryParent, "output", "sample.png");
  await captureSurface(
    {
      screenshot: async (value) => {
        options = value;
        return Buffer.from("synthetic image");
      },
    },
    "sample",
    {
      outputPath: (...segments) => {
        expect(segments).toEqual(["sample.png"]);
        return path;
      },
      attach: async (name, value) => {
        attached.push(name);
        expect(value).toEqual({ path, contentType: "image/png" });
      },
    },
  );
  expect(options!).toEqual({ path, type: "png", fullPage: true, animations: "disabled" });
  expect(attached).toEqual(["sample.png"]);
});
test("a failed screenshot propagates and is never attached as successful evidence", async () => {
  let attached = false;
  await expect(
    captureSurface(
      {
        screenshot: async () => {
          throw new Error("Synthetic capture failure");
        },
      },
      "sample",
      {
        outputPath: (name) => name,
        attach: async () => {
          attached = true;
        },
      },
    ),
  ).rejects.toThrow("Synthetic capture failure");
  expect(attached).toBe(false);
});
test("default full command selects smoke/acceptance while capture has no project dependency", async () => {
  const pkg = JSON.parse(await readFile(resolve(suiteRoot, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  };
  expect(pkg.scripts["test:all"]).toContain("playwright test --project smoke --project acceptance");
  expect(pkg.scripts["test:all"]).not.toContain("capture");
  expect(pkg.scripts["test:capture"]).toBe("playwright test --project capture");
  const source = ts.createSourceFile(
    "playwright.config.ts",
    await readFile(resolve(suiteRoot, "playwright.config.ts"), "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const projects: ts.ObjectLiteralExpression[] = [];
  function visit(node: ts.Node): void {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === "projects" &&
      ts.isArrayLiteralExpression(node.initializer)
    )
      projects.push(...node.initializer.elements.filter(ts.isObjectLiteralExpression));
    ts.forEachChild(node, visit);
  }
  visit(source);
  const project = (name: string) =>
    projects.find((entry) =>
      entry.properties.some(
        (p) =>
          ts.isPropertyAssignment(p) &&
          p.name.getText(source) === "name" &&
          ts.isStringLiteral(p.initializer) &&
          p.initializer.text === name,
      ),
    );
  expect(
    project("capture")?.properties.some((p) => p.name?.getText(source) === "dependencies"),
  ).toBe(false);
  expect(project("acceptance")?.getText(source)).toContain('dependencies: ["smoke"]');
});
