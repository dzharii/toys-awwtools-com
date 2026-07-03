import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createTimeouts, type UiTimeouts } from "../timeouts/timeouts.js";
import { createDiagnostics, type UiDiagnostics } from "../diagnostics/diagnostics.js";
import { startStaticServer, type StaticServer } from "../support/static-server.js";
import { createStorageInspector, type StorageInspector } from "../support/storage.js";
import { createNetworkGuard, type NetworkGuard } from "../support/network-guard.js";
import { FIXTURES_ROOT } from "../support/fixtures.js";
import { PREFERENCES_KEY } from "../../config/suite-config.js";
import type { ReaderPreferences } from "../../config/preferences-type.js";
import type { UiTestAppContext } from "../page-object/page-object-base.js";

import { OpenScreenPageObject } from "../../page-objects/open-screen/open-screen.page.js";
import { ReaderPageObject } from "../../page-objects/reader/reader.page.js";
import { SettingsPageObject } from "../../page-objects/settings/settings.page.js";
import { ToastPageObject } from "../../page-objects/toast/toast.page.js";
import { BusyPageObject } from "../../page-objects/busy/busy.page.js";
import { CodeBlockPageObject } from "../../page-objects/code-block/code-block.page.js";

const HERE = dirname(fileURLToPath(import.meta.url));
/** App root = the E Ink Reader project directory (three levels up from framework/app). */
const APP_ROOT = resolve(HERE, "../../../..");

export interface EinkReaderAppOptions {
  viewport?: { width: number; height: number };
  reducedMotion?: "reduce" | "no-preference";
  colorScheme?: "light" | "dark" | "no-preference";
  /** Seed valid preferences into localStorage before navigation. */
  seededPreferences?: Partial<ReaderPreferences>;
  /** Seed a raw (possibly invalid) preferences string, for corrupted-pref tests. */
  seededPreferencesRaw?: string;
  /** Skip the initial goto (rare; used by tests that navigate themselves). */
  skipGoto?: boolean;
}

/** A single running server + browser shared across a worker for speed. */
let sharedServer: StaticServer | null = null;
let sharedBrowser: Browser | null = null;

async function getSharedServer(): Promise<StaticServer> {
  if (!sharedServer) {
    sharedServer = await startStaticServer({ appRoot: APP_ROOT, fixturesRoot: FIXTURES_ROOT });
  }
  return sharedServer;
}

async function getSharedBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch();
  }
  return sharedBrowser;
}

export interface EinkReaderApp {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly server: StaticServer;
  readonly timeouts: UiTimeouts;
  readonly diagnostics: UiDiagnostics;
  readonly storage: StorageInspector;
  readonly network: NetworkGuard;
  openScreen(): OpenScreenPageObject;
  reader(): ReaderPageObject;
  settings(): SettingsPageObject;
  toast(): ToastPageObject;
  busy(): BusyPageObject;
  codeBlock(): CodeBlockPageObject;
  /** Reload the page (preferences persist; book content does not). */
  reload(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Create the E Ink Reader automation app. Owns server + context construction,
 * localStorage seeding, diagnostics + network capture, navigation, and Page
 * Object wiring. Tests request Page Objects and call close() in a finally block.
 */
export async function createEinkReaderApp(options: EinkReaderAppOptions = {}): Promise<EinkReaderApp> {
  const server = await getSharedServer();
  const browser = await getSharedBrowser();

  const context = await browser.newContext({
    viewport: options.viewport ?? { width: 1280, height: 900 },
    reducedMotion: options.reducedMotion,
    colorScheme: options.colorScheme,
    baseURL: server.baseUrl,
  });

  const timeouts = createTimeouts();
  const diagnostics = createDiagnostics();
  const network = createNetworkGuard(diagnostics, server.baseUrl);

  const page = await context.newPage();
  diagnostics.attachToPage(page);

  // Seed localStorage before any app script runs.
  const seededRaw =
    options.seededPreferencesRaw ??
    (options.seededPreferences
      ? JSON.stringify({ version: 1, ...options.seededPreferences })
      : null);
  if (seededRaw !== null) {
    await context.addInitScript(
      ([key, value]) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* storage may be blocked; app must still boot */
        }
      },
      [PREFERENCES_KEY, seededRaw] as const,
    );
  }

  if (!options.skipGoto) {
    await page.goto(server.url("/index.html"), { waitUntil: "domcontentloaded" });
  }

  const ctx: UiTestAppContext = { page, browserContext: context, timeouts, diagnostics };

  const openScreen = new OpenScreenPageObject(ctx);
  const reader = new ReaderPageObject(ctx);
  const settings = new SettingsPageObject(ctx);
  const toast = new ToastPageObject(ctx);
  const busy = new BusyPageObject(ctx);
  const codeBlock = new CodeBlockPageObject(ctx);
  const storage = createStorageInspector(page);

  return {
    page,
    context,
    server,
    timeouts,
    diagnostics,
    storage,
    network,
    openScreen: () => openScreen,
    reader: () => reader,
    settings: () => settings,
    toast: () => toast,
    busy: () => busy,
    codeBlock: () => codeBlock,
    async reload(): Promise<void> {
      await page.reload({ waitUntil: "domcontentloaded" });
    },
    async close(): Promise<void> {
      await context.close();
    },
  };
}

/** Tear down shared server/browser at the end of a worker run. */
export async function shutdownSharedResources(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
  if (sharedServer) {
    await sharedServer.close();
    sharedServer = null;
  }
}
