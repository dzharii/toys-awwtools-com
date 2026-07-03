import type { EinkReaderApp } from "../app/automation-app.js";
import { THEMES, MODES, EINK_INTENSITIES, CONTRASTS, MOTIONS } from "../../config/suite-config.js";

/**
 * Non-throwing counterpart to the Standard Post-Action Oracle. It records the
 * pass/fail state of each invariant instead of asserting, so Agentic Analysis
 * Mode can write a full oracle.json for a test even when the test itself
 * intentionally probes an error/edge state. It does NOT replace the real
 * throwing oracle in normal tests.
 */
export interface OracleCheck {
  name: string;
  passed: boolean;
  detail?: string;
}

export interface OracleDiagnostics {
  passed: boolean;
  checks: OracleCheck[];
}

export async function collectOracleDiagnostics(app: EinkReaderApp): Promise<OracleDiagnostics> {
  const checks: OracleCheck[] = [];
  const add = (name: string, passed: boolean, detail?: string): void => {
    checks.push({ name, passed, ...(detail ? { detail } : {}) });
  };
  const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const { page } = app;
  const reader = app.reader();
  const openScreen = app.openScreen();

  const pageErrors = app.diagnostics.pageErrors();
  add("no page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));

  const consoleErrors = app.diagnostics.consoleErrors();
  add("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

  const readerVisible = await safe(() => reader.isVisible(), false);
  const openVisible = await safe(() => openScreen.isVisible(), false);
  add("open screen and reader not both visible", !(readerVisible && openVisible));

  const einkStuck = await safe(() => reader.isEinkOverlayActive(), false);
  add("no stuck E Ink overlay", !einkStuck);

  const busyVisible = await safe(() => app.busy().isVisible(), false);
  add("busy overlay not stuck", !busyVisible);

  const overflow = await safe(
    () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    0,
  );
  add("no horizontal overflow", overflow <= 1, `overflow=${overflow}px`);

  if (readerVisible) {
    const mode = await safe(() => reader.currentMode(), null as string | null);
    add("valid reader mode", mode !== null && (MODES as readonly string[]).includes(mode), `mode=${mode}`);
    const theme = await safe(() => reader.theme(), null as string | null);
    add("valid theme", theme !== null && (THEMES as readonly string[]).includes(theme), `theme=${theme}`);
    const eink = await safe(() => reader.einkIntensity(), null as string | null);
    add("valid eink intensity", eink !== null && (EINK_INTENSITIES as readonly string[]).includes(eink), `eink=${eink}`);
    const contrast = await safe(() => reader.contrast(), null as string | null);
    add("valid contrast", contrast !== null && (CONTRASTS as readonly string[]).includes(contrast), `contrast=${contrast}`);
    const motion = await safe(() => reader.motion(), null as string | null);
    add("valid motion", motion !== null && (MOTIONS as readonly string[]).includes(motion), `motion=${motion}`);
    const title = await safe(() => reader.titleText(), "");
    add("reader title non-empty", title.trim().length > 0);
  }

  const storageKeys = await safe(() => app.storage.keys(), [] as string[]);
  const onlyPrefs = storageKeys.every((k) => k === "eink-reader:preferences");
  add("only preference key in storage", onlyPrefs, `keys=${storageKeys.join(",")}`);

  const unexpectedNet = app.network.unexpectedRequests();
  add("no unexpected network requests", unexpectedNet.length === 0, unexpectedNet.slice(0, 3).join(" | "));

  return { passed: checks.every((c) => c.passed), checks };
}
