import { registerAllComponents } from "../components/register-all.js";
import { acquireDesktopRoot, emergencyTeardown, releaseDesktopRoot } from "../core/runtime.js";
import { buildExampleToolWindow } from "../demo/example-tool.js";

let serial = 0;

function nextOwner(prefix = "bookmarklet-tool") {
  serial += 1;
  return `${prefix}-${serial}`;
}

export function openBookmarkletWindow(builder, { ownerPrefix = "bookmarklet-tool", rect = null } = {}) {
  registerAllComponents();

  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);
  const win = typeof builder === "function" ? builder() : buildExampleToolWindow();

  if (rect) win.setRect(rect);
  record.root.append(win);

  const release = () => releaseDesktopRoot(owner);
  win.addEventListener("awwbookmarklet-window-closed", release, { once: true });
  win.addEventListener("awwbookmarklet-window-close-request", () => {
    queueMicrotask(() => {
      if (!win.isConnected) release();
    });
  });

  return win;
}

export function bootstrapExampleTool() {
  return openBookmarkletWindow(() => buildExampleToolWindow({ title: "Page Extraction Tool" }), {
    ownerPrefix: "example-tool"
  });
}

export function shutdownAll() {
  emergencyTeardown("*");
}

registerAllComponents();

globalThis.awwbookmarklet = {
  openWindow: openBookmarkletWindow,
  bootstrapExampleTool,
  shutdownAll
};
