import { test, expect } from "../../framework/test/base-test.js";
import { expectStandardOracle } from "../../framework/support/oracle.js";
import { openFileByPickerFlow } from "../../flows/open-file.flow.js";
import { fixtureMarkers } from "../../framework/support/fixtures.js";
import { PREFERENCES_KEY } from "../../config/suite-config.js";
import type { EinkReaderApp } from "../../framework/app/automation-app.js";

/**
 * Storage-surface privacy coverage (gap-closure spec). The existing privacy
 * suite verifies localStorage; this spec closes the gap for every other
 * persistent surface a browser exposes — sessionStorage, IndexedDB,
 * CacheStorage, and cookies — proving book content never lands in any of them.
 * In-memory state (e.g. window.__einkReader while reading) is intentionally out
 * of scope: content must live in memory to be rendered; the contract is about
 * PERSISTENCE. Where a storage API is unavailable in the runtime, the check is
 * skipped with a documented reason rather than silently passing.
 */

interface SurfaceScan {
  sessionStorage: { available: boolean; keys: string[]; blob: string };
  indexedDb: { available: boolean; names: string[] };
  cacheStorage: { available: boolean; names: string[] };
  cookies: { blob: string };
}

async function scanSurfaces(app: EinkReaderApp): Promise<SurfaceScan> {
  return app.page.evaluate(async () => {
    const result: SurfaceScan = {
      sessionStorage: { available: false, keys: [], blob: "" },
      indexedDb: { available: false, names: [] },
      cacheStorage: { available: false, names: [] },
      cookies: { blob: document.cookie || "" },
    };

    try {
      const keys: string[] = [];
      const parts: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k) {
          keys.push(k);
          parts.push(sessionStorage.getItem(k) ?? "");
        }
      }
      result.sessionStorage = { available: true, keys, blob: parts.join("\n") };
    } catch {
      result.sessionStorage.available = false;
    }

    if (typeof indexedDB !== "undefined" && typeof (indexedDB as IDBFactory).databases === "function") {
      try {
        const dbs = await (indexedDB as IDBFactory).databases();
        result.indexedDb = { available: true, names: dbs.map((d) => d.name ?? "").filter(Boolean) };
      } catch {
        result.indexedDb.available = false;
      }
    }

    if (typeof caches !== "undefined") {
      try {
        result.cacheStorage = { available: true, names: await caches.keys() };
      } catch {
        result.cacheStorage.available = false;
      }
    }

    return result;
  });
}

test.describe("privacy storage surfaces", () => {
  test("PS001 sessionStorage holds no book content and no unexpected keys", async ({ makeApp }) => {
    const app = await makeApp();
    const markers = fixtureMarkers("longBook");
    await openFileByPickerFlow(app, "longBook", markers[0]);
    const scan = await scanSurfaces(app);

    if (!scan.sessionStorage.available) {
      test.skip(true, "sessionStorage is unavailable in this runtime");
      return;
    }
    const leaked = markers.filter((m) => m.length > 0 && scan.sessionStorage.blob.includes(m));
    expect(leaked, "no book-content markers in sessionStorage").toEqual([]);
    // Nothing other than an (allowed) preferences key may live in sessionStorage.
    const unexpected = scan.sessionStorage.keys.filter((k) => k !== PREFERENCES_KEY);
    expect(unexpected, "no unexpected sessionStorage keys").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("PS002 IndexedDB contains no app-created database", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "codeHeavyNotes", "FIXTURE_CODE_HEAVY_JS_SNIPPET");
    const scan = await scanSurfaces(app);

    if (!scan.indexedDb.available) {
      test.skip(true, "indexedDB.databases() is unavailable in this runtime");
      return;
    }
    // The reader must not create any IndexedDB database to store content.
    expect(scan.indexedDb.names, "no IndexedDB databases created by the reader").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("PS003 CacheStorage contains no caches", async ({ makeApp }) => {
    const app = await makeApp();
    await openFileByPickerFlow(app, "standardMarkdown", "FIXTURE_STANDARD_MD_HEADING");
    const scan = await scanSurfaces(app);

    if (!scan.cacheStorage.available) {
      test.skip(true, "CacheStorage is unavailable in this runtime");
      return;
    }
    // No service worker / cache is registered by the static reader.
    expect(scan.cacheStorage.names, "no CacheStorage entries created by the reader").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("PS004 cookies hold no book content", async ({ makeApp }) => {
    const app = await makeApp();
    const markers = fixtureMarkers("simpleProse");
    await openFileByPickerFlow(app, "simpleProse", markers[0]);
    const scan = await scanSurfaces(app);
    const leaked = markers.filter((m) => m.length > 0 && scan.cookies.blob.includes(m));
    expect(leaked, "no book-content markers in cookies").toEqual([]);
    await expectStandardOracle(app, { documentOpen: true });
  });

  test("PS005 no persistent surface retains content across a reload", async ({ makeApp }) => {
    const app = await makeApp();
    const markers = fixtureMarkers("longBook");
    await openFileByPickerFlow(app, "longBook", markers[0]);
    await app.reload();
    await app.openScreen().expectReady();

    const scan = await scanSurfaces(app);
    // localStorage is covered by the storage helper; check the rest here.
    await app.storage.assertNoContent(markers);
    if (scan.sessionStorage.available) {
      expect(markers.filter((m) => scan.sessionStorage.blob.includes(m)), "sessionStorage clean after reload").toEqual([]);
    }
    if (scan.indexedDb.available) {
      expect(scan.indexedDb.names, "no IndexedDB after reload").toEqual([]);
    }
    if (scan.cacheStorage.available) {
      expect(scan.cacheStorage.names, "no CacheStorage after reload").toEqual([]);
    }
    expect(markers.filter((m) => scan.cookies.blob.includes(m)), "cookies clean after reload").toEqual([]);
  });
});
