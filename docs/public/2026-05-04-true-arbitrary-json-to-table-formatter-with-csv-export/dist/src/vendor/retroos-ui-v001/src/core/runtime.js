// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { FRAMEWORK_VERSION, GLOBAL_SYMBOLS, TAGS } from "./constants.js";
import { defaultThemeService } from "./theme.js";
import { WindowManager } from "./window-manager.js";

function getGlobalMap() {
  if (!globalThis[GLOBAL_SYMBOLS.rootsByVersion]) {
    globalThis[GLOBAL_SYMBOLS.rootsByVersion] = new Map();
  }
  return globalThis[GLOBAL_SYMBOLS.rootsByVersion];
}

function createDesktopRecord(version = FRAMEWORK_VERSION) {
  const root = document.createElement(TAGS.desktopRoot);
  root.dataset.version = version;

  document.documentElement.append(root);
  defaultThemeService.applyTheme(root);

  const record = {
    version,
    root,
    manager: new WindowManager(),
    owners: new Set(),
    destroy() {
      this.manager.destroy();
      this.root.remove();
      this.owners.clear();
    }
  };

  root.__awwManager = record.manager;
  return record;
}

export function acquireDesktopRoot(owner = "default-owner", version = FRAMEWORK_VERSION) {
  const roots = getGlobalMap();
  let record = roots.get(version);

  if (!record || !record.root.isConnected) {
    record = createDesktopRecord(version);
    roots.set(version, record);
  }

  record.owners.add(owner);
  globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] = record.root;
  globalThis[GLOBAL_SYMBOLS.version] = version;

  return record;
}

export function releaseDesktopRoot(owner = "default-owner", version = FRAMEWORK_VERSION) {
  const roots = getGlobalMap();
  const record = roots.get(version);
  if (!record) return;

  record.owners.delete(owner);
  if (record.owners.size > 0) return;

  record.destroy();
  roots.delete(version);

  if (globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] === record.root) {
    delete globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot];
  }
}

export function getDesktopRecord(version = FRAMEWORK_VERSION) {
  return getGlobalMap().get(version) ?? null;
}

export function emergencyTeardown(version = FRAMEWORK_VERSION) {
  const roots = getGlobalMap();

  if (version === "*") {
    for (const [key, record] of roots) {
      record.destroy();
      roots.delete(key);
    }
    delete globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot];
    return;
  }

  const record = roots.get(version);
  if (!record) return;
  record.destroy();
  roots.delete(version);
  if (globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot] === record.root) {
    delete globalThis[GLOBAL_SYMBOLS.lastAcquiredRoot];
  }
}
