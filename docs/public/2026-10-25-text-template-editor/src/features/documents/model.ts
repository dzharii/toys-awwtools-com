/** A revision is a concurrency token, never a historical copy. */
import { AppError, isRecord } from "../../platform/errors";
import { parseTemplate } from "../templates/parser";
import type { TemplateDefinition } from "../templates/model";
import type { StorageMode } from "../settings/schema";
export interface StoredRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
}
export interface DocumentRecord extends StoredRecord {
  templateId: string;
  templateVersionId: string;
  templateSnapshot: TemplateDefinition;
  answers: Record<string, string>;
  relatedGroupId: string;
}
export type SaveStatus = "temporary" | "dirty" | "saving" | "saved" | "failed" | "conflict";
export interface WorkingDocument {
  record: DocumentRecord;
  origin: StorageMode;
  status: SaveStatus;
  changeId: number;
  error: string;
  activePlaceholder: string;
}
export function validateStoredBase(
  value: unknown,
): asserts value is StoredRecord & Record<string, unknown> {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    typeof value.title !== "string" ||
    typeof value.createdAt !== "string" ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    typeof value.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(value.updatedAt)) ||
    typeof value.revision !== "number" ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0
  ) {
    throw new AppError(
      "CORRUPT_RECORD",
      "A saved record cannot be decoded. The stored data has not been changed.",
    );
  }
}
export function decodeDocument(value: unknown): DocumentRecord {
  validateStoredBase(value);
  if (
    typeof value.templateId !== "string" ||
    typeof value.templateVersionId !== "string" ||
    typeof value.relatedGroupId !== "string" ||
    !isRecord(value.answers) ||
    !Object.values(value.answers).every((answer) => typeof answer === "string") ||
    !isRecord(value.templateSnapshot) ||
    typeof value.templateSnapshot.source !== "string"
  ) {
    throw new AppError(
      "CORRUPT_DOCUMENT",
      "A document is invalid. Its original stored record has been preserved.",
    );
  }
  const parsed = parseTemplate(value.templateSnapshot.source);
  if (
    !parsed.template ||
    !parsed.template.versions.some((version) => version.id === value.templateVersionId)
  ) {
    throw new AppError(
      "INVALID_SNAPSHOT",
      "A saved template snapshot is invalid. Its original stored record has been preserved.",
    );
  }
  return {
    id: value.id,
    title: value.title,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    revision: value.revision,
    templateId: value.templateId,
    templateVersionId: value.templateVersionId,
    relatedGroupId: value.relatedGroupId,
    templateSnapshot: parsed.template,
    answers: Object.fromEntries(Object.entries(value.answers)) as Record<string, string>,
  };
}
export function hasMeaningfulUserInput(record: DocumentRecord): boolean {
  const version = record.templateSnapshot.versions.find(
    (item) => item.id === record.templateVersionId,
  )!;
  return (
    (record.title.trim() !== "" && record.title.trim() !== version.name.trim()) ||
    Object.values(record.answers).some((answer) => answer.trim().length > 0)
  );
}
export function answerFor(answers: Readonly<Record<string, string>>, name: string): string {
  return Object.hasOwn(answers, name) ? (answers[name] ?? "") : "";
}
