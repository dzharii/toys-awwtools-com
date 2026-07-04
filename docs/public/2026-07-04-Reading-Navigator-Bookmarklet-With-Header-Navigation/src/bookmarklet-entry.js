/**
 * bookmarklet-entry.js: Bun bundle entry point.
 *
 * Registers the app bootstrap as `window.readingNavigatorBookmarklet` so that:
 *   - The hosted loader bookmarklet can call it after injecting the bundle.
 *   - The inline bookmarklet (whole bundle + explicit invocation) can call it.
 *
 * The bundle intentionally does NOT auto-run on load. Loading the bundle on the
 * install page must not start the app on the install page itself. Both generated
 * bookmarklets append an explicit invocation of the exposed function.
 */

import { run } from "./main.js";

if (typeof window !== "undefined") {
  window.readingNavigatorBookmarklet = run;
}

export { run };
