/** Invalid GTL is valid draft content and must remain recoverable. */
import { AppError } from "../../platform/errors";
import { validateStoredBase } from "../documents/model";
import type { StoredRecord } from "../documents/model";
export interface AuthoringDraft extends StoredRecord {
  source: string;
  sourceTemplateId: string;
}
export function decodeAuthoringDraft(value: unknown): AuthoringDraft {
  validateStoredBase(value);
  if (typeof value.source !== "string" || typeof value.sourceTemplateId !== "string") {
    throw new AppError(
      "CORRUPT_DRAFT",
      "A template draft cannot be decoded. Its original stored record has been preserved.",
    );
  }
  return {
    id: value.id,
    title: value.title,
    source: value.source,
    sourceTemplateId: value.sourceTemplateId,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    revision: value.revision,
  };
}
