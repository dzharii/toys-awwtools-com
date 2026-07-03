/**
 * Bounded, condition-based waiting for the suite.
 *
 * Every wait must be a polled predicate with a timeout that throws a diagnostic
 * error naming what was awaited. Fixed sleeps are not a synchronization
 * strategy. Adapted from the reference suite's timeouts service.
 */

export interface WaitOptions {
  readonly timeoutMs: number;
  readonly description: string;
  readonly intervalMs?: number;
}

export interface UiTimeouts {
  readonly short: number;
  readonly normal: number;
  readonly long: number;
  waitUntil(predicate: () => Promise<boolean> | boolean, options: WaitOptions): Promise<void>;
}

const DEFAULT_INTERVAL_MS = 80;

export function createTimeouts(
  overrides: Partial<Pick<UiTimeouts, "short" | "normal" | "long">> = {},
): UiTimeouts {
  const short = overrides.short ?? 4_000;
  const normal = overrides.normal ?? 12_000;
  const long = overrides.long ?? 25_000;

  return {
    short,
    normal,
    long,
    async waitUntil(predicate, options): Promise<void> {
      const interval = options.intervalMs ?? DEFAULT_INTERVAL_MS;
      const deadline = Date.now() + options.timeoutMs;
      let lastError: unknown;

      while (Date.now() < deadline) {
        try {
          if (await predicate()) return;
        } catch (error) {
          lastError = error;
        }
        await delay(interval);
      }

      const suffix = lastError ? ` Last error: ${describeError(lastError)}.` : "";
      throw new Error(
        `Timed out after ${options.timeoutMs}ms waiting for ${options.description}.${suffix}`,
      );
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
