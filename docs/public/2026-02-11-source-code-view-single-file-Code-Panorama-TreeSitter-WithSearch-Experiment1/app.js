import { getDomElements } from "./modules/dom-elements.js";
import { createEventBus } from "./modules/event-bus.js";
import { createAppState } from "./modules/app-state.js";
import { createUiAdapter } from "./modules/ui-adapter.js";
import { initAppRuntime } from "./modules/app-runtime.js";

function createAppContext(doc = document) {
  const els = getDomElements(doc);
  const bus = createEventBus();
  const appState = createAppState();
  const ui = createUiAdapter({ doc });
  return {
    els,
    bus,
    appState,
    ui
  };
}

function bootstrap() {
  const context = createAppContext(document);
  initAppRuntime(context);
}

document.addEventListener("DOMContentLoaded", bootstrap);
