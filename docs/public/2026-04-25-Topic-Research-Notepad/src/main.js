import { PUBLIC_TOKENS, setTheme } from "../ui-framework/dist/bookmarklet/index.js";
import { APP_DATA_FORMAT_VERSION, DB_NAME, DB_VERSION, EXPORT_FORMAT_VERSION, WORKER_PROTOCOL_VERSION } from "./constants.js";
import { createLogger, installDebugHook } from "./observability/logger.js";
import { StorageClient } from "./storage-client.js";
import { TopicResearchApp } from "./ui.js";

const logger = createLogger("App", "Bootstrap");

logger.info("App bootstrap start", {
  context: {
    dbName: DB_NAME,
    dbVersion: DB_VERSION,
    dataFormatVersion: APP_DATA_FORMAT_VERSION,
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    workerProtocolVersion: WORKER_PROTOCOL_VERSION,
    indexedDbAvailable: typeof indexedDB !== "undefined",
    workerAvailable: typeof Worker !== "undefined",
    cryptoUuidAvailable: Boolean(globalThis.crypto?.randomUUID),
  },
});

setTheme({
  [PUBLIC_TOKENS.workspaceBg]: "#cfd5dd",
  [PUBLIC_TOKENS.windowBg]: "#e9edf2",
  [PUBLIC_TOKENS.panelBg]: "#f4f6f8",
  [PUBLIC_TOKENS.selectionBg]: "#315f99",
  [PUBLIC_TOKENS.focusRing]: "#174f9c",
  [PUBLIC_TOKENS.radiusControl]: "2px",
  [PUBLIC_TOKENS.radiusSurface]: "4px",
  [PUBLIC_TOKENS.radiusWindow]: "4px",
});

const root = document.querySelector("#app");
const workerUrl = new URL(import.meta.url.includes("/assets/") ? "../storage-worker.js" : "./storage-worker.js", import.meta.url);
logger.info("Creating storage client", { context: { workerUrl: workerUrl.href, storageMode: "worker" } });
const storage = new StorageClient({ workerUrl });
const app = new TopicResearchApp({ root, storage });

installDebugHook({
  getRuntimeSnapshot: () => app.getRuntimeSnapshot(),
});

app.start();
