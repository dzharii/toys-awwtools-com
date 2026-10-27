import { test, type TestInfo } from "@playwright/test";
import type { GuidedApp } from "./guided-app";
import type { PageObject } from "./page-object";
import type { BrowserDiagnostics } from "./diagnostics";
import type { Timings } from "./timings";
import type { SurfaceDefinition } from "./surface-registry";

export interface SurfaceActionContext {
  readonly app: GuidedApp;
  readonly surface: SurfaceDefinition;
  readonly object: PageObject;
  readonly testInfo: TestInfo;
}

export interface SurfaceAction {
  readonly id: string;
  run(context: SurfaceActionContext): Promise<void>;
}

type Contract = Pick<
  PageObject,
  "open" | "exists" | "expectReady" | "expectDefaultState" | "expectedControls"
>;
type Stage = "factory" | "opening" | "structure" | "default-state" | "diagnostics" | "extension";
export class SurfaceSmokeFailure extends Error {
  constructor(
    readonly surfaceId: string,
    readonly stage: Stage | "application/browser",
    readonly operation: string,
    cause: unknown,
    diagnostics: string,
  ) {
    super(
      `${surfaceId}: ${stage} failure at ${operation}.\n${cause instanceof Error ? cause.message : String(cause)}\n${diagnostics}`,
      { cause },
    );
    this.name = "SurfaceSmokeFailure";
  }
}

export interface SmokeExecution {
  readonly surface: Pick<SurfaceDefinition, "id" | "description" | "defaults">;
  readonly create: () => Contract;
  readonly diagnostics: Pick<BrowserDiagnostics, "assertHealthy" | "hasCriticalErrors" | "summary">;
  readonly timings: Timings;
  readonly identity: string;
  readonly step: <T>(name: string, action: () => Promise<T>) => Promise<T>;
  readonly actions?: readonly { readonly id: string; run(object: Contract): Promise<void> }[];
}

/**
 * Readiness stays with the Page Object; this core only enforces stage ordering.
 * Reopening does not repeat fresh-focus defaults or duplicate extension actions.
 */
export async function executeSurfaceSmoke(execution: SmokeExecution): Promise<void> {
  const { surface, diagnostics, timings, identity, step } = execution;
  async function stage<T>(kind: Stage, name: string, action: () => Promise<T>): Promise<T> {
    try {
      return await step(`${surface.id}: ${name}`, () =>
        timings.measure(`smoke:${surface.id}:${name}`, action, identity),
      );
    } catch (cause) {
      throw new SurfaceSmokeFailure(
        surface.id,
        diagnostics.hasCriticalErrors() ? "application/browser" : kind,
        name,
        cause,
        diagnostics.summary(),
      );
    }
  }
  const object = await stage("factory", "resolve existing Page Object", async () =>
    execution.create(),
  );
  async function validate(suffix = ""): Promise<void> {
    await stage("opening", `open${suffix}`, () => object.open());
    await stage("structure", `exists${suffix}`, async () => {
      if (!(await object.exists()))
        throw new Error(`${surface.description}: the opened surface does not exist.`);
    });
    await stage("structure", `required controls${suffix}`, async () => {
      await step(`${object.expectedControls().length} declared required controls`, () =>
        object.expectReady(),
      );
    });
  }
  await validate();
  if (surface.defaults === "validate")
    await stage("default-state", "default state", () => object.expectDefaultState());
  await stage("diagnostics", "post-validation diagnostics", async () =>
    diagnostics.assertHealthy(surface.id),
  );
  await validate(" after reopening");
  await stage("diagnostics", "reopen diagnostics", async () =>
    diagnostics.assertHealthy(surface.id),
  );
  for (const action of execution.actions ?? []) {
    await stage("extension", `action ${action.id}`, () => action.run(object));
    await stage("diagnostics", `diagnostics after ${action.id}`, async () =>
      diagnostics.assertHealthy(surface.id),
    );
  }
  await stage("diagnostics", "completion", async () => diagnostics.assertHealthy(surface.id));
}

export async function runSurfaceSmoke(
  app: GuidedApp,
  surface: SurfaceDefinition,
  testInfo: TestInfo,
  actions: readonly SurfaceAction[] = [],
): Promise<void> {
  testInfo.annotations.push({ type: "PageObject", description: surface.pageObject.name });
  let object: PageObject;
  await executeSurfaceSmoke({
    surface,
    create: () => {
      object = surface.create(app);
      if (!(object instanceof surface.pageObject))
        throw new Error("Factory returned the wrong Page Object class.");
      if (surface.defaults === "not-applicable" && object.expectedDefaultControlState().length)
        throw new Error("Default-state declarations must not be silently excluded.");
      return object;
    },
    diagnostics: app.context.diagnostics,
    timings: app.context.timings,
    identity: app.context.identity,
    step: (name, action) => test.step(name, action),
    actions: actions.map((action) => ({
      id: action.id,
      run: () => action.run({ app, surface, object, testInfo }),
    })),
  });
}
