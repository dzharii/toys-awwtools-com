import { test as base } from "@playwright/test";
import { createEinkReaderApp, shutdownSharedResources, type EinkReaderApp, type EinkReaderAppOptions } from "../app/automation-app.js";
import { isAgenticAnalysis } from "../agentic/agentic-context.js";
import { captureInitialState, captureFinalState } from "../agentic/final-capture.js";

/**
 * Extended Playwright test with two additions:
 *
 *  - a worker-scoped auto fixture that shuts down the shared static server and
 *    browser when the worker finishes (so the process exits cleanly), and
 *  - a `makeApp` fixture that constructs E Ink Reader apps and closes every one
 *    it created at the end of the test, so specs never leak contexts.
 *
 * Specs import { test, expect } from this module instead of @playwright/test.
 *
 * When Agentic Analysis Mode is active (EINK_AGENTIC_ANALYSIS=1) the makeApp
 * fixture also captures an initial-state snapshot for each created app and, at
 * teardown, a final-state snapshot plus a full diagnostics bundle. This code is
 * completely inert in normal runs.
 */
type WorkerFixtures = { sharedCleanup: void };
type TestFixtures = { makeApp: (options?: EinkReaderAppOptions) => Promise<EinkReaderApp> };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  sharedCleanup: [
    async ({}, use) => {
      await use();
      await shutdownSharedResources();
    },
    { scope: "worker", auto: true },
  ],

  makeApp: async ({}, use) => {
    const created: EinkReaderApp[] = [];
    const factory = async (options?: EinkReaderAppOptions): Promise<EinkReaderApp> => {
      const app = await createEinkReaderApp(options);
      created.push(app);
      if (isAgenticAnalysis) await captureInitialState(app);
      return app;
    };
    await use(factory);
    if (isAgenticAnalysis) {
      for (let i = 0; i < created.length; i++) {
        await captureFinalState(created[i], i).catch(() => undefined);
      }
    }
    for (const app of created) {
      await app.close().catch(() => undefined);
    }
  },
});

export { expect } from "@playwright/test";
