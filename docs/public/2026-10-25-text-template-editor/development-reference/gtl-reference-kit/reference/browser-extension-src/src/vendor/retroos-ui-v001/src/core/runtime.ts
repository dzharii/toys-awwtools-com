// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { FRAMEWORK_VERSION, GLOBAL_SYMBOLS, TAGS } from "./constants.js";
import { defaultThemeService } from "./theme.js";
import { WindowManager } from "./window-manager.js";
import type { AwwWindowElement } from "../types/public-elements.js";

interface DesktopRecord {
  version: string;
  root: HTMLElement & { __awwManager?: WindowManager };
  manager: WindowManager;
  owners: Set<string>;
  destroy(): void;
}

type RuntimeGlobal = typeof globalThis & Record<symbol, unknown>;

function runtimeGlobal(): RuntimeGlobal {
  return globalThis as RuntimeGlobal;
}

function getGlobalMap(): Map<string, DesktopRecord> {
  const global = runtimeGlobal();
  if (!global[GLOBAL_SYMBOLS.rootsByVersion]) {
    global[GLOBAL_SYMBOLS.rootsByVersion] = new Map<string, DesktopRecord>();
  }
  return global[GLOBAL_SYMBOLS.rootsByVersion] as Map<string, DesktopRecord>;
}

function createDesktopRecord(version = FRAMEWORK_VERSION): DesktopRecord {
  const root = document.createElement(TAGS.desktopRoot) as HTMLElement & { __awwManager?: WindowManager };
  root.dataset.version = version;

  document.documentElement.append(root);
  defaultThemeService.applyTheme(root);

  const record = {
    version,
    root,
    manager: new WindowManager(),
    owners: new Set<string>(),
    destroy() {
      this.manager.destroy();
      this.root.remove();
      this.owners.clear();
    }
  };

  root.__awwManager = record.manager;
  return record;
}

/** Acquires or creates the shared desktop root and tracks the caller as an owner. */
export function acquireDesktopRoot(owner = "default-owner", version = FRAMEWORK_VERSION): DesktopRecord {
  const roots = getGlobalMap();
  let record = roots.get(version);

  if (!record || !record.root.isConnected) {
    record = createDesktopRecord(version);
    roots.set(version, record);
  }

  record.owners.add(owner);
  const global = runtimeGlobal();
  global[GLOBAL_SYMBOLS.lastAcquiredRoot] = record.root;
  global[GLOBAL_SYMBOLS.version] = version;

  return record;
}

/** Releases one owner and tears down the shared root after the last owner leaves. */
export function releaseDesktopRoot(owner = "default-owner", version = FRAMEWORK_VERSION): void {
  const roots = getGlobalMap();
  const record = roots.get(version);
  if (!record) return;

  record.owners.delete(owner);
  if (record.owners.size > 0) return;

  record.destroy();
  roots.delete(version);

  const global = runtimeGlobal();
  if (global[GLOBAL_SYMBOLS.lastAcquiredRoot] === record.root) {
    delete global[GLOBAL_SYMBOLS.lastAcquiredRoot];
  }
}

export function getDesktopRecord(version = FRAMEWORK_VERSION): DesktopRecord | null {
  return getGlobalMap().get(version) ?? null;
}

/** Force-destroys framework roots for cleanup paths that cannot rely on owner release. */
export function emergencyTeardown(version = FRAMEWORK_VERSION): void {
  const roots = getGlobalMap();

  if (version === "*") {
    for (const [key, record] of roots) {
      record.destroy();
      roots.delete(key);
    }
    delete runtimeGlobal()[GLOBAL_SYMBOLS.lastAcquiredRoot];
    return;
  }

  const record = roots.get(version);
  if (!record) return;
  record.destroy();
  roots.delete(version);
  const global = runtimeGlobal();
  if (global[GLOBAL_SYMBOLS.lastAcquiredRoot] === record.root) {
    delete global[GLOBAL_SYMBOLS.lastAcquiredRoot];
  }
}
