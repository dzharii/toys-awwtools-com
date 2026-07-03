import { expect } from "@playwright/test";
import type { EinkReaderApp } from "../framework/app/automation-app.js";

/**
 * Reload the page and assert the privacy + persistence contract: saved
 * preferences survive, but book content does not (the reader returns to the
 * open screen and the user must reopen the file). Returns after the open screen
 * is ready again.
 *
 * Optionally verifies a set of preference key/values persisted across reload.
 */
export async function reloadPreservingPreferencesFlow(
  app: EinkReaderApp,
  expectedPrefs?: Record<string, unknown>,
): Promise<void> {
  const before = await app.storage.preferences();

  await app.reload();

  // After reload the app must not show a document: content is never persisted.
  await app.openScreen().expectReady();
  expect(await app.reader().isVisible(), "reader must not restore book content after reload").toBe(false);

  const after = await app.storage.preferences();
  expect(after, "preferences should persist across reload").not.toBeNull();

  if (expectedPrefs) {
    for (const [key, value] of Object.entries(expectedPrefs)) {
      expect(after?.[key], `preference "${key}" should persist as ${String(value)}`).toBe(value);
    }
  } else if (before) {
    expect(after).toEqual(before);
  }
}
