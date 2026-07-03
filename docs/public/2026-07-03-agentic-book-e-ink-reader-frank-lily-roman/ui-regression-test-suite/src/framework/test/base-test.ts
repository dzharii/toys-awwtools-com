import { test as base } from "@playwright/test";
import { createEinkReaderApp, shutdownSharedResources, type EinkReaderApp, type EinkReaderAppOptions } from "../app/automation-app.js";

/**
 * Extended Playwright test with two additions:
 *
 *  - a worker-scoped auto fixture that shuts down the shared static server and
 *    browser when the worker finishes (so the process exits cleanly), and
 *  - a `makeApp` fixture that constructs E Ink Reader apps and closes every one
 *    it created at the end of the test, so specs never leak contexts.
 *
 * Specs import { test, expect } from this module instead of @playwright/test.
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
      return app;
    };
    await use(factory);
    for (const app of created) {
      await app.close().catch(() => undefined);
    }
  },
});

export { expect } from "@playwright/test";
