/** Mutate an isolated SUT copy, never live product source or acceptance expectations. */
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const suiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(suiteRoot, "..");
const artifactRoot = resolve(
  suiteRoot,
  "artifacts",
  `sensitivity-${new Date().toISOString().replace(/[:.]/g, "-")}`,
);
const isolatedRoot = await mkdtemp(resolve(tmpdir(), "guided-acceptance-sensitivity-"));
await mkdir(artifactRoot, { recursive: true });

interface Defect {
  id: string;
  file: string;
  before: string;
  after: string;
  project: "smoke" | "acceptance";
  grep: string;
  symptom: RegExp;
}

const defects: Defect[] = [
  {
    id: "missing-id",
    file: "src/features/templates/ui/guidance-panel.ts",
    before: '"guided-field-editor-main-input-answer"',
    after: '"guided-field-editor-main-input-answer-broken"',
    project: "smoke",
    grep: "SM0",
    symptom: /Field editor: readiness failed/,
  },
  {
    id: "hidden-control",
    file: "src/features/templates/ui/version-picker.ts",
    before: 'this.group.dataset.testid = "guided-templates-version-group-writing-style";',
    after:
      'this.group.dataset.testid = "guided-templates-version-group-writing-style";\n    this.group.hidden = true;',
    project: "smoke",
    grep: "SM0",
    symptom: /toBeVisible/,
  },
  {
    id: "field-focus",
    file: "src/app/app-shell.ts",
    before: "this.guidance.focusEditor(caret);\n      this.documentWorkspace.scrollToActive(name);",
    after: "void caret;\n      this.documentWorkspace.scrollToActive(name);",
    project: "smoke",
    grep: "SM0",
    symptom: /property=focused; expected=true/,
  },
  {
    id: "collapse",
    file: "src/platform/ui/panels/panel-manager.ts",
    before: "panel.body.hidden = collapsed;",
    after: "panel.body.hidden = false;",
    project: "smoke",
    grep: "SM0",
    symptom: /toBeHidden/,
  },
  {
    id: "per-frame-layout-write",
    file: "src/platform/ui/panels/panel-manager.ts",
    before: "this.render(false);",
    after: "this.settled();",
    project: "acceptance",
    grep: "SM0|AC08",
    symptom: /toEqual/,
  },
  {
    id: "lost-pre-restore-source",
    file: "src/features/template-authoring/service.ts",
    before: "source: currentSource,",
    after: "source: target.source,",
    project: "acceptance",
    grep: "SM0|AC14",
    symptom: /toEqual/,
  },
  {
    id: "save",
    file: "src/features/documents/service.ts",
    before:
      "const saved = await this.repository(working.origin).save(snapshot, snapshot.revision);\n      working.record.revision = saved.revision;\n      working.status",
    after:
      "const saved = { ...snapshot, revision: snapshot.revision + 1 };\n      working.record.revision = saved.revision;\n      working.status",
    project: "acceptance",
    grep: "SM0|AC01",
    symptom: /toHaveLength/,
  },
  {
    id: "critical",
    file: "src/app/app-shell.ts",
    before: 'private focusPlaceholder(name: string, caret?: "start" | "end"): void {',
    after:
      'private focusPlaceholder(name: string, caret?: "start" | "end"): void {\n    console.error("[critical] acceptance sensitivity fault");',
    project: "smoke",
    grep: "SM0",
    symptom: /unexpected critical browser errors/,
  },
  {
    id: "light-dismiss",
    file: "src/features/documents/ui/document-workspace.ts",
    before: 'exportOptions.popover = "auto";',
    after: 'exportOptions.popover = "manual";',
    project: "smoke",
    grep: "SM0",
    symptom: /toBeHidden/,
  },
];

const results: {
  id: string;
  classification: "Caught" | "Missed" | "Unverified";
  cleanBaseline: boolean;
}[] = [];

async function command(
  args: string[],
  cwd: string,
  logName: string,
  environment?: Record<string, string | undefined>,
) {
  const child = Bun.spawn([process.execPath, ...args], {
    cwd,
    env: environment ?? process.env,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  await writeFile(resolve(artifactRoot, `${logName}.log`), `${stdout}\n${stderr}`);
  return { code, output: `${stdout}\n${stderr}` };
}

async function build(name: string): Promise<void> {
  const result = await command(["run", "build"], isolatedRoot, `${name}-build`);
  if (result.code !== 0)
    throw new Error(`${name}: isolated build failed.\n${result.output.slice(-5000)}`);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorMessages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(errorMessages);
  if (!record(value)) return [];
  return Object.entries(value).flatMap(([key, nested]) => {
    if (key === "error" && record(nested) && typeof nested.message === "string")
      return [nested.message];
    if (key === "errors" && Array.isArray(nested)) {
      return nested.flatMap((error: unknown) =>
        record(error) && typeof error.message === "string" ? [error.message] : [],
      );
    }
    return typeof nested === "object" ? errorMessages(nested) : [];
  });
}

async function browserRun(defect: Defect, phase: "injected" | "restored") {
  const probe = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => new Response("Port probe"),
  });
  const port = String(probe.port);
  await probe.stop(true);
  const report = resolve(artifactRoot, `${defect.id}-${phase}.json`);
  const environment: Record<string, string | undefined> = {
    ...process.env,
    GUIDED_PRODUCT_ROOT: isolatedRoot,
    GUIDED_PORT: port,
    PLAYWRIGHT_JSON_OUTPUT_FILE: report,
  };
  delete environment.GUIDED_BASE_URL;
  const execution = await command(
    [
      "x",
      "playwright",
      "test",
      "--project",
      defect.project,
      "--grep",
      defect.grep,
      "--reporter=json",
      "--output",
      resolve(artifactRoot, `${defect.id}-${phase}`),
    ],
    suiteRoot,
    `${defect.id}-${phase}`,
    environment,
  );
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(report, "utf8"));
  } catch (cause) {
    throw new Error(
      `${defect.id}: no valid browser report; this is not a caught defect.\n${execution.output.slice(-4000)}`,
      { cause },
    );
  }
  if (!record(parsed) || !record(parsed.stats) || typeof parsed.stats.unexpected !== "number") {
    throw new Error(`${defect.id}: browser report has no usable test outcome.`);
  }
  return {
    ...execution,
    unexpected: parsed.stats.unexpected,
    messages: errorMessages(parsed).join("\n"),
  };
}

try {
  for (const directory of ["src", "templates", "assets", "scripts", "tests"]) {
    await cp(resolve(sourceRoot, directory), resolve(isolatedRoot, directory), { recursive: true });
  }
  for (const name of [
    "index.html",
    "package.json",
    "bun.lock",
    "bunfig.toml",
    "tsconfig.json",
    "tsconfig.worker.json",
    "tsconfig.tools.json",
    "THIRD-PARTY-NOTICES.md",
  ])
    await cp(resolve(sourceRoot, name), resolve(isolatedRoot, name));
  const installation = await command(["install", "--frozen-lockfile"], isolatedRoot, "install");
  if (installation.code !== 0)
    throw new Error(
      `Cannot install the isolated product build dependencies.\n${installation.output}`,
    );

  for (const defect of defects) {
    const original = await readFile(resolve(isolatedRoot, ...defect.file.split("/")), "utf8");
    if (original.split(defect.before).length !== 2)
      throw new Error(
        `${defect.id}: injection target is absent or ambiguous; no defects were run.`,
      );
  }

  for (const defect of defects) {
    const file = resolve(isolatedRoot, ...defect.file.split("/"));
    const original = await readFile(file, "utf8");
    if (original.split(defect.before).length !== 2) {
      throw new Error(
        `${defect.id}: injection target is absent or ambiguous. Review the mutation; do not weaken the tests.`,
      );
    }
    const result: (typeof results)[number] = {
      id: defect.id,
      classification: "Unverified",
      cleanBaseline: false,
    };
    results.push(result);
    try {
      await writeFile(file, original.replace(defect.before, defect.after));
      await build(`${defect.id}-injected`);
      const injected = await browserRun(defect, "injected");
      if (injected.code === 0) {
        result.classification = "Missed";
        throw new Error(`${defect.id}: unchanged tests passed with the verified injected build.`);
      }
      if (injected.unexpected === 0 || !defect.symptom.test(injected.messages)) {
        throw new Error(
          `${defect.id}: execution failed without the expected defect symptom; classification is Unverified.`,
        );
      }
      result.classification = "Caught";
    } finally {
      await writeFile(file, original);
      if ((await readFile(file, "utf8")) !== original)
        throw new Error(`${defect.id}: exact source restoration failed.`);
      await build(`${defect.id}-restored`);
      const restored = await browserRun(defect, "restored");
      if (restored.code !== 0 || restored.unexpected !== 0) {
        throw new Error(
          `${defect.id}: restored clean baseline failed; inspect the preserved evidence.`,
        );
      }
      result.cleanBaseline = true;
    }
    console.info(
      `${defect.id}: ${result.classification}; exact source restored, rebuilt, baseline passed.`,
    );
  }
} finally {
  await writeFile(
    resolve(artifactRoot, "summary.json"),
    JSON.stringify({ results, artifactRoot }, null, 2) + "\n",
  );
  if (
    dirname(isolatedRoot) !== resolve(tmpdir()) ||
    !basename(isolatedRoot).startsWith("guided-acceptance-sensitivity-")
  ) {
    throw new Error("Refusing unsafe temporary-product cleanup.");
  }
  await rm(isolatedRoot, { recursive: true, force: true });
}
console.info(`Sensitivity evidence: ${artifactRoot}`);
