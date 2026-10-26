/** Dedicated worker entry point: compose services and route, without feature rules. */
import { recordHandler } from "../features/documents/worker-handler";
import { decodeDocument } from "../features/documents/model";
import { decodeAuthoringDraft } from "../features/template-authoring/model";
import { isSettings } from "../features/settings/schema";
import { configureLogger } from "../platform/diagnostics/logger";
import { AppError } from "../platform/errors";
import { DexieRepository } from "../platform/storage/database";
import { routeRequest } from "../platform/messaging/worker-router";
import type { FeatureHandler } from "../platform/messaging/worker-router";
const handlers = new Map<string, FeatureHandler>([
  ["documents", recordHandler(new DexieRepository("documents", decodeDocument), decodeDocument)],
  [
    "authoring",
    recordHandler(
      new DexieRepository("authoringDrafts", decodeAuthoringDraft),
      decodeAuthoringDraft,
    ),
  ],
  [
    "system",
    async (type, payload) => {
      if (type === "ping") {
        if (payload !== null) throw new AppError("INVALID_REQUEST", "Ping expects no payload.");
        return "ready";
      }
      if (type !== "configure")
        throw new AppError("UNKNOWN_OPERATION", "Unknown system operation.");
      if (!isSettings(payload)) throw new AppError("INVALID_REQUEST", "Invalid worker settings.");
      configureLogger(payload);
      return null;
    },
  ],
]);
self.addEventListener("message", (event: MessageEvent<unknown>) => {
  void routeRequest(event.data, handlers).then((response) => self.postMessage(response));
});
