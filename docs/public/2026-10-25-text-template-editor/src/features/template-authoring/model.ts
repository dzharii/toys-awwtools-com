/** Invalid GTL is valid draft content and must remain recoverable. */
import { AppError, isRecord } from "../../platform/errors";
import { validateStoredBase } from "../documents/model";
import type { StoredRecord } from "../documents/model";
export interface AuthoringDraft extends StoredRecord {
  source: string;
  sourceTemplateId: string;
  checkpoints: Checkpoint[];
}
export interface Checkpoint {
  id: string;
  draftId: string;
  source: string;
  createdAt: string;
  kind: "explicit" | "pre-restore";
  label?: string;
}
export function retainedCheckpoints(checkpoints: Checkpoint[], limit = 25): Checkpoint[] {
  const recovery = checkpoints.filter((item) => item.kind === "pre-restore" && !item.label);
  const retained = new Set(recovery.slice(-limit).map((item) => item.id));
  return checkpoints.filter(
    (item) => item.kind === "explicit" || !!item.label || retained.has(item.id),
  );
}
export function decodeAuthoringDraft(value: unknown): AuthoringDraft {
  validateStoredBase(value);
  if (
    typeof value.source !== "string" ||
    typeof value.sourceTemplateId !== "string" ||
    !Array.isArray(value.checkpoints) ||
    !value.checkpoints.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "string" &&
        !!item.id &&
        item.draftId === value.id &&
        typeof item.source === "string" &&
        typeof item.createdAt === "string" &&
        Number.isFinite(Date.parse(item.createdAt)) &&
        (item.kind === "explicit" || item.kind === "pre-restore") &&
        (item.label === undefined || typeof item.label === "string"),
    ) ||
    new Set(value.checkpoints.map((item: Checkpoint) => item.id)).size !== value.checkpoints.length
  ) {
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
    checkpoints: structuredClone(value.checkpoints),
  };
}
