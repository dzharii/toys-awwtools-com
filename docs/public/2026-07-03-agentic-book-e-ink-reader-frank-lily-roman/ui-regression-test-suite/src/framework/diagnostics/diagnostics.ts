import type { Page, ConsoleMessage, Request } from "@playwright/test";

/**
 * Console-error, page-error, and network-request capture for a page.
 *
 * The suite treats unexpected console errors and uncaught page errors as
 * failures. It also records every network request so tests can assert the app
 * makes no runtime requests beyond the local static server (the app ships a
 * strict connect-src 'none' CSP and an offline-only promise).
 */
export interface CapturedRequest {
  readonly url: string;
  readonly method: string;
  readonly resourceType: string;
}

export interface UiDiagnostics {
  attachToPage(page: Page): void;
  consoleErrors(): readonly string[];
  pageErrors(): readonly string[];
  requests(): readonly CapturedRequest[];
  recentErrorsSummary(limit?: number): string;
  clear(): void;
}

export function createDiagnostics(): UiDiagnostics {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requests: CapturedRequest[] = [];

  function onConsole(msg: ConsoleMessage): void {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  }

  function onPageError(err: Error): void {
    pageErrors.push(err.message ? `${err.name}: ${err.message}` : String(err));
  }

  function onRequest(req: Request): void {
    requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() });
  }

  return {
    attachToPage(page: Page): void {
      page.on("console", onConsole);
      page.on("pageerror", onPageError);
      page.context().on("request", onRequest);
    },
    consoleErrors: () => consoleErrors.slice(),
    pageErrors: () => pageErrors.slice(),
    requests: () => requests.slice(),
    recentErrorsSummary(limit = 5): string {
      const all = [
        ...pageErrors.map((e) => `pageerror: ${e}`),
        ...consoleErrors.map((e) => `console.error: ${e}`),
      ];
      if (all.length === 0) return "no console/page errors captured";
      return all.slice(-limit).join(" | ");
    },
    clear(): void {
      consoleErrors.length = 0;
      pageErrors.length = 0;
      requests.length = 0;
    },
  };
}
