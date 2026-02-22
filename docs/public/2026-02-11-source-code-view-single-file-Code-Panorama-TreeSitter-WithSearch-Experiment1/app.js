import { getDomElements } from "./modules/dom-elements.js";
import { initAppRuntime } from "./modules/app-runtime.js";

/**
 * Builds the core application context for runtime bootstrap.
 *
 * @param {Document} [doc=document] Document to bind DOM queries to.
 * @returns {{els: Object, doc: Document}} Initialized app context bundle.
 */
function createAppContext(doc = document) {
  const els = getDomElements(doc);
  return {
    els,
    doc,
  };
}

/**
 * Initializes the app runtime once the document is ready by constructing the context
 * and handing it off to the runtime entrypoint.
 *
 * @returns {void}
 */
function bootstrap() {
  const context = createAppContext(document);
  initAppRuntime(context);
}

document.addEventListener("DOMContentLoaded", bootstrap);
