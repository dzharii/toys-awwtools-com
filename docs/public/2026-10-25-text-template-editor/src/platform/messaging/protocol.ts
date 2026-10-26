/** Versioned transport, adapted from the reference runtime-messaging envelopes. */
import { isRecord } from "../errors";
import type { DocumentRecord } from "../../features/documents/model";
import type { AuthoringDraft } from "../../features/template-authoring/model";
import type { Settings } from "../../features/settings/schema";
export interface Operations {
  "documents.list": { payload: null; result: DocumentRecord[] };
  "documents.get": { payload: { id: string }; result: DocumentRecord | undefined };
  "documents.save": {
    payload: { record: DocumentRecord; expectedRevision: number };
    result: DocumentRecord;
  };
  "documents.delete": { payload: { id: string; expectedRevision: number }; result: null };
  "authoring.list": { payload: null; result: AuthoringDraft[] };
  "authoring.get": { payload: { id: string }; result: AuthoringDraft | undefined };
  "authoring.save": {
    payload: { record: AuthoringDraft; expectedRevision: number };
    result: AuthoringDraft;
  };
  "authoring.delete": { payload: { id: string; expectedRevision: number }; result: null };
  "system.configure": { payload: Settings; result: null };
  "system.ping": { payload: null; result: string };
}
export interface RequestEnvelope {
  protocolVersion: 1;
  requestId: string;
  scope: string;
  type: string;
  payload: unknown;
}
export type ResponseEnvelope =
  | { protocolVersion: 1; requestId: string; ok: true; result: unknown }
  | { protocolVersion: 1; requestId: string; ok: false; error: { code: string; message: string } };
export function isResponse(value: unknown): value is ResponseEnvelope {
  return (
    isRecord(value) &&
    value.protocolVersion === 1 &&
    typeof value.requestId === "string" &&
    ((value.ok === true && Object.hasOwn(value, "result")) ||
      (value.ok === false &&
        isRecord(value.error) &&
        typeof value.error.code === "string" &&
        typeof value.error.message === "string"))
  );
}
