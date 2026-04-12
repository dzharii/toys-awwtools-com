import { createOverlayApp } from "./overlay.js";
import { TOOL_GLOBAL_KEY } from "./utils.js";

const existing = window[TOOL_GLOBAL_KEY];

if (existing?.reopen) {
  existing.reopen();
} else {
  const app = createOverlayApp(window);
  window[TOOL_GLOBAL_KEY] = app;
  app.mount();
}
