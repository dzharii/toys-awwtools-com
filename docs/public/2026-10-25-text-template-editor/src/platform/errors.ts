/** Stable recoverable errors cross worker, persistence, and UI boundaries. */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected operation failed.";
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
