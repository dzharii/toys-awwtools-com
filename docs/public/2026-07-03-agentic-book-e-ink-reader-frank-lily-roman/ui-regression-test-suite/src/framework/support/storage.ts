import type { Page } from "@playwright/test";
import { PREFERENCES_KEY } from "../../config/suite-config.js";

/**
 * localStorage inspection and seeding.
 *
 * Privacy contract: only PREFERENCES_KEY may persist. Book content — paragraph
 * text, code snippets, source Markdown, rendered HTML, unique fixture markers —
 * must never appear in any persistent storage.
 */
export interface StorageInspector {
  read(): Promise<Record<string, string>>;
  keys(): Promise<string[]>;
  preferences(): Promise<Record<string, unknown> | null>;
  /** Fail if any key other than PREFERENCES_KEY exists. */
  assertOnlyPreferences(): Promise<void>;
  /** Fail if any provided marker appears anywhere in persistent storage. */
  assertNoContent(markers: string[]): Promise<void>;
}

export function createStorageInspector(page: Page): StorageInspector {
  async function read(): Promise<Record<string, string>> {
    return page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) out[k] = localStorage.getItem(k) ?? "";
      }
      return out;
    });
  }

  return {
    read,
    async keys(): Promise<string[]> {
      return Object.keys(await read());
    },
    async preferences(): Promise<Record<string, unknown> | null> {
      const all = await read();
      const raw = all[PREFERENCES_KEY];
      if (!raw) return null;
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return null;
      }
    },
    async assertOnlyPreferences(): Promise<void> {
      const keys = Object.keys(await read());
      const unexpected = keys.filter((k) => k !== PREFERENCES_KEY);
      if (unexpected.length > 0) {
        throw new Error(
          `Unexpected localStorage keys present (only "${PREFERENCES_KEY}" allowed): ${unexpected.join(", ")}`,
        );
      }
    },
    async assertNoContent(markers: string[]): Promise<void> {
      const all = await read();
      const blob = Object.values(all).join("\n");
      const leaked = markers.filter((m) => m.length > 0 && blob.includes(m));
      if (leaked.length > 0) {
        throw new Error(`Book content leaked into localStorage. Found markers: ${leaked.join(", ")}`);
      }
    },
  };
}
