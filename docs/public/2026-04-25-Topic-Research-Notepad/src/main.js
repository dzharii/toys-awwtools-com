import { PUBLIC_TOKENS, setTheme } from "../ui-framework/dist/bookmarklet/index.js";
import { StorageClient } from "./storage-client.js";
import { TopicResearchApp } from "./ui.js";

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
const storage = new StorageClient({ workerUrl });
const app = new TopicResearchApp({ root, storage });

app.start();
