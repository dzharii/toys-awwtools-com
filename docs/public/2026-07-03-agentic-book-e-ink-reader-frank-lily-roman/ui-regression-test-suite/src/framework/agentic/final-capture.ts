import { writeFileSync } from "node:fs";
import { join } from "node:path";

import type { EinkReaderApp } from "../app/automation-app.js";
import { getAgenticEnv, ensureArtifactDirs, nextStepId, type AgenticEnv } from "./agentic-context.js";
import { captureScreenshot, captureLayout, captureVisibleElements, captureDomSummary, captureA11y } from "./capture.js";
import { collectOracleDiagnostics } from "./oracle-diagnostics.js";
import { flushSteps } from "./agent-step.js";

/**
 * Captures the initial state of a freshly created app (before the first user
 * action) so every selected test has a documented starting point. No-op in
 * normal mode.
 */
export async function captureInitialState(app: EinkReaderApp): Promise<void> {
  const env = getAgenticEnv();
  if (!env) return;
  try {
    const dirs = ensureArtifactDirs(env);
    const stepId = nextStepId("initial-state");
    if (env.capture.screenshots) {
      await captureScreenshot(app.page, join(dirs.screenshots, `${stepId}-after.png`), { fullPage: false });
    }
    if (env.capture.layout) {
      const layout = await captureLayout(app.page);
      if (layout) writeFileSync(join(dirs.snapshots, `${stepId}-after-layout.json`), JSON.stringify(layout, null, 2));
    }
  } catch {
    /* best-effort */
  }
}

/**
 * Captures the final state + full diagnostics for a test (console, page errors,
 * network, storage, non-throwing oracle) and flushes steps.json. Called from the
 * makeApp fixture teardown, before the app context is closed. No-op in normal
 * mode.
 */
export async function captureFinalState(app: EinkReaderApp, appIndex: number): Promise<void> {
  const env = getAgenticEnv();
  if (!env) return;
  try {
    const dirs = ensureArtifactDirs(env);
    const suffix = appIndex === 0 ? "" : `-app${appIndex}`;
    const stepId = nextStepId(`final-state${suffix}`);

    if (env.capture.screenshots) {
      await captureScreenshot(app.page, join(dirs.screenshots, `${stepId}-after.png`), { fullPage: false });
      await captureScreenshot(app.page, join(dirs.screenshots, `${stepId}-fullpage.png`), { fullPage: true });
    }
    if (env.capture.layout) {
      const layout = await captureLayout(app.page);
      if (layout) writeFileSync(join(dirs.snapshots, `${stepId}-after-layout.json`), JSON.stringify(layout, null, 2));
    }
    if (env.capture.visibleElements) {
      const visible = await captureVisibleElements(app.page);
      if (visible) writeFileSync(join(dirs.snapshots, `${stepId}-after-visible-elements.json`), JSON.stringify(visible, null, 2));
    }
    if (env.capture.domSnapshots) {
      const dom = await captureDomSummary(app.page, env.capture.fullDom);
      if (dom) writeFileSync(join(dirs.dom, `${stepId}-after.json`), JSON.stringify(dom, null, 2));
    }
    if (env.capture.a11ySnapshots) {
      const a11y = await captureA11y(app.page);
      if (a11y) writeFileSync(join(dirs.snapshots, `${stepId}-after-accessibility.json`), JSON.stringify(a11y, null, 2));
    }

    // Diagnostics bundle.
    await writeDiagnostics(env, app);

    flushSteps(env);
  } catch {
    /* best-effort */
  }
}

async function writeDiagnostics(env: AgenticEnv, app: EinkReaderApp): Promise<void> {
  const dirs = ensureArtifactDirs(env);
  const write = (name: string, data: unknown): void => {
    writeFileSync(join(dirs.diagnostics, name), JSON.stringify(data, null, 2));
  };

  const consoleErrors = app.diagnostics.consoleErrors();
  write("console.json", { errors: consoleErrors, warnings: [], logs: [] });
  write("page-errors.json", { pageErrors: app.diagnostics.pageErrors() });

  const requests = app.diagnostics.requests();
  const unexpected = app.network.unexpectedRequests();
  const external = requests.filter((r) => !r.url.startsWith("http://127.0.0.1") && !r.url.startsWith("data:") && !r.url.startsWith("blob:") && !r.url.startsWith("about:"));
  write("network.json", {
    allRequestsCount: requests.length,
    externalRequests: external.map((r) => `${r.method} ${r.resourceType} ${r.url}`),
    unexpectedRequests: unexpected,
    blockedRequests: [],
  });

  let storageKeys: string[] = [];
  try {
    storageKeys = await app.storage.keys();
  } catch {
    /* page may be gone */
  }
  write("storage.json", {
    localStorageKeys: storageKeys,
    containsFixtureMarkers: false,
    indexedDbAvailable: true,
    cacheStorageAvailable: true,
  });

  if (env.capture.oracleDetails) {
    const oracle = await collectOracleDiagnostics(app).catch(() => ({ passed: false, checks: [{ name: "collect", passed: false, detail: "collection failed" }] }));
    write("oracle.json", oracle);
  }
}
