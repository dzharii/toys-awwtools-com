import type { CompileRequestPayload, CompileResponsePayload, RunRequestPayload, RunResponsePayload } from "../types";

export interface CompileWorkerRequest {
  requestId: string;
  type: "compile";
  payload: CompileRequestPayload;
}

export interface CompileWorkerResponse {
  requestId: string;
  type: "compile-result";
  payload: CompileResponsePayload;
}

export interface RunWorkerRequest {
  requestId: string;
  type: "run";
  payload: RunRequestPayload;
}

export interface RunWorkerResponse {
  requestId: string;
  type: "run-result";
  payload: RunResponsePayload;
}
