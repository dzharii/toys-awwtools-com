/** Shared wire validation for record persistence; repositories own atomic updates. */
import { AppError, isRecord } from "../../platform/errors";
import type { FeatureHandler } from "../../platform/messaging/worker-router";
import type { Repository } from "../../platform/storage/repository";
import type { StoredRecord } from "./model";
export function recordHandler<T extends StoredRecord>(
  repository: Repository<T>,
  decode: (value: unknown) => T,
): FeatureHandler {
  return async (type, payload) => {
    if (type === "list") {
      if (payload !== null) throw new AppError("INVALID_REQUEST", "List expects no payload.");
      return repository.list();
    }
    if (!["get", "save", "delete"].includes(type))
      throw new AppError("UNKNOWN_OPERATION", "Unknown persistence operation.");
    if (!isRecord(payload))
      throw new AppError("INVALID_REQUEST", "Expected a persistence payload.");
    if (type === "get") {
      if (typeof payload.id !== "string" || !payload.id)
        throw new AppError("INVALID_REQUEST", "Document identity required.");
      return repository.get(payload.id);
    }
    if (
      typeof payload.expectedRevision !== "number" ||
      !Number.isSafeInteger(payload.expectedRevision) ||
      payload.expectedRevision < 0
    ) {
      throw new AppError("INVALID_REQUEST", "A valid expected revision is required.");
    }
    if (type === "save") return repository.save(decode(payload.record), payload.expectedRevision);
    if (typeof payload.id !== "string" || !payload.id)
      throw new AppError("INVALID_REQUEST", "Document identity required.");
    await repository.delete(payload.id, payload.expectedRevision);
    return null;
  };
}
