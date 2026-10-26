/** A routing failure is always a structured response, never implicit success. */
import { AppError, errorMessage, isRecord } from "../errors";
import type { ResponseEnvelope } from "./protocol";
export type FeatureHandler = (type: string, payload: unknown) => Promise<unknown>;
export async function routeRequest(
  value: unknown,
  handlers: ReadonlyMap<string, FeatureHandler>,
): Promise<ResponseEnvelope> {
  const requestId =
    isRecord(value) && typeof value.requestId === "string" ? value.requestId : "invalid";
  try {
    if (
      !isRecord(value) ||
      value.protocolVersion !== 1 ||
      typeof value.requestId !== "string" ||
      typeof value.scope !== "string" ||
      typeof value.type !== "string" ||
      !Object.hasOwn(value, "payload")
    ) {
      throw new AppError(
        "INVALID_REQUEST",
        "Invalid worker request. Reload the application if this persists.",
      );
    }
    const handler = handlers.get(value.scope);
    if (!handler) throw new AppError("UNKNOWN_SCOPE", "Unknown worker feature.");
    return {
      protocolVersion: 1,
      requestId,
      ok: true,
      result: await handler(value.type, value.payload),
    };
  } catch (error) {
    return {
      protocolVersion: 1,
      requestId,
      ok: false,
      error: {
        code: error instanceof AppError ? error.code : "STORAGE_OPERATION_FAILED",
        message:
          error instanceof AppError
            ? error.message
            : `Browser storage could not complete the operation. Your in-memory work is preserved. ${errorMessage(error)}`,
      },
    };
  }
}
