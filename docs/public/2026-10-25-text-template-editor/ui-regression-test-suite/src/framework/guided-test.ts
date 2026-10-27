import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";
import { GuidedApp } from "./guided-app";
import { BrowserDiagnostics } from "./diagnostics";
import { Timings } from "./timings";

interface GuidedFixtures {
  app: GuidedApp;
  newTab: () => Promise<GuidedApp>;
  isolatedSession: () => Promise<GuidedApp>;
}

export const test = base.extend<
  GuidedFixtures & { appFactory: (context: BrowserContext, page?: Page) => Promise<GuidedApp> }
>({
  appFactory: async ({ context, baseURL }, use, testInfo) => {
    if (!baseURL) throw new Error("Configure Guided's baseURL before starting acceptance tests.");
    const ownedContexts: BrowserContext[] = [];
    const diagnostics = new Map<BrowserContext, BrowserDiagnostics>();
    const timings = new Timings();
    const make = async (target: BrowserContext, existingPage?: Page): Promise<GuidedApp> => {
      let capture = diagnostics.get(target);
      if (!capture) {
        capture = new BrowserDiagnostics(target, `context-${diagnostics.size + 1}`);
        diagnostics.set(target, capture);
      }
      const page = existingPage ?? (await target.newPage());
      const app = new GuidedApp({
        page,
        baseURL,
        diagnostics: capture,
        timings,
        identity: capture.identityOf(page),
      });
      await app.start();
      return app;
    };
    const factory = async (target: BrowserContext, existingPage?: Page) => {
      if (target !== context && !ownedContexts.includes(target)) {
        ownedContexts.push(target);
      }
      return make(target, existingPage);
    };
    // The worker-scoped browser is reused; only the context is disposable.
    try {
      await use(factory);
    } finally {
      try {
        await testInfo.attach("ui-timings.json", {
          body: JSON.stringify({ worker: testInfo.workerIndex, timings: timings.events }, null, 2),
          contentType: "application/json",
        });
        await testInfo.attach("browser-diagnostics.json", {
          body: JSON.stringify(
            [...diagnostics.values()].map((capture) => ({
              identity: capture.identity,
              entries: capture.entries,
            })),
            null,
            2,
          ),
          contentType: "application/json",
        });
      } finally {
        await Promise.all(ownedContexts.map((target) => target.close()));
      }
      for (const capture of diagnostics.values()) capture.assertHealthy("Scenario completion");
    }
  },
  app: async ({ context, page, appFactory }, use) => {
    await use(await appFactory(context, page));
  },
  newTab: async ({ context, appFactory, page: _page }, use) => {
    await use(async () => {
      const page = await context.newPage();
      const app = await appFactory(context, page);
      // appFactory must bind the newly created page, never reset an existing tab.
      if (app.context.page !== page) throw new Error("The tab factory did not bind the new page.");
      return app;
    });
  },
  isolatedSession: async ({ browser, appFactory }, use) => {
    await use(async () =>
      appFactory(
        await browser.newContext({
          viewport: { width: 1440, height: 1000 },
          acceptDownloads: true,
        }),
      ),
    );
  },
});

export { expect };
