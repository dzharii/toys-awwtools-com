/** Logs only caller-selected metadata, with immutable snapshots and no remote sink. */
import type { Settings } from "../../features/settings/schema";
const severity = { error: 0, warn: 1, info: 2, debug: 3 };
let level: Settings["logLevel"] = "info";
let formatter: Settings["logFormatter"] = "styled";
export function configureLogger(settings: Pick<Settings, "logLevel" | "logFormatter">): void {
  level = settings.logLevel;
  formatter = settings.logFormatter;
}
export function snapshotParameters(parameters: unknown): string {
  try {
    return JSON.stringify(parameters) ?? "null";
  } catch {
    return '{"diagnostic":"Parameters could not be serialized"}';
  }
}
function log(
  kind: keyof typeof severity,
  event: string,
  parameters: Record<string, unknown> = {},
): void {
  if (severity[kind] > severity[level]) return;
  const snapshot = snapshotParameters(parameters);
  if (formatter === "plain") console[kind](`[GTL] ${kind.toUpperCase()} ${event} ${snapshot}`);
  else
    console[kind](
      `%c[GTL] ${kind.toUpperCase()}%c ${event} ${snapshot}`,
      "color:#a9bda4;font-weight:bold",
      "color:inherit",
    );
}
export const logger = {
  error: (event: string, parameters?: Record<string, unknown>) => log("error", event, parameters),
  warn: (event: string, parameters?: Record<string, unknown>) => log("warn", event, parameters),
  info: (event: string, parameters?: Record<string, unknown>) => log("info", event, parameters),
  debug: (event: string, parameters?: Record<string, unknown>) => log("debug", event, parameters),
};
