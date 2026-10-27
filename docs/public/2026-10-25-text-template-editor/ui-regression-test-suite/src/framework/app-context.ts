import type { Page } from "@playwright/test";
import type { BrowserDiagnostics } from "./diagnostics";
import type { Timings } from "./timings";

export const timeouts = { readiness: 8_000, persistence: 15_000, recovery: 20_000 } as const;

export interface AppContext {
  readonly page: Page;
  readonly baseURL: string;
  readonly diagnostics: BrowserDiagnostics;
  readonly timings: Timings;
  readonly identity: string;
}
