// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.

import { registerAllComponents } from "../components/register-all.js";
import { buildExampleToolWindow } from "../demo/example-tool.js";
import { copyToClipboard } from "../core/clipboard.js";
import { CommandRegistry } from "../core/commands.js";
import { getSegmentCopyValue, normalizeContextSegment, normalizeContextSegments, parseContextSegments, segmentsEqual } from "../core/context-segments.js";
import { TAGS, PUBLIC_TOKENS, FRAMEWORK_VERSION, DEFAULT_GEOMETRY } from "../core/constants.js";
import { defineOnce } from "../core/define.js";
import { clampRect, getSpawnRect, getViewportRect, rectToStyle, resizeRectFromEdges } from "../core/geometry.js";
import { acquireDesktopRoot, emergencyTeardown, getDesktopRecord, releaseDesktopRoot } from "../core/runtime.js";
import { sanitizeHtml } from "../core/sanitize.js";
import { adoptStyles, BASE_COMPONENT_STYLES, css } from "../core/styles.js";
import { ThemeService, applyThemePatch, copyPublicThemeContext, createTheme, defaultThemeService } from "../core/theme.js";
import {
  buildSearchUrl,
  deriveHostname,
  isHttpUrl,
  normalizeSearchTemplate,
  resolveNavigationInput
} from "../core/url.js";
import { showToast } from "../components/toast.js";
export { registerAllComponents } from "../components/register-all.js";
export { AwwDesktopRoot } from "../components/desktop-root.js";
export { AwwWindow } from "../components/window.js";
export { AwwMenubar } from "../components/menubar.js";
export { AwwMenu } from "../components/menu.js";
export { AwwButton } from "../components/button.js";
export { AwwIconButton } from "../components/icon-button.js";
export { AwwInput } from "../components/input.js";
export { AwwTextarea } from "../components/textarea.js";
export { AwwCheckbox } from "../components/checkbox.js";
export { AwwRadio } from "../components/radio.js";
export { AwwSelect } from "../components/select.js";
export { AwwRange } from "../components/range.js";
export { AwwProgress } from "../components/progress.js";
export { AwwTabs, AwwTabPanel } from "../components/tabs.js";
export { AwwListbox } from "../components/listbox.js";
export { AwwGroup } from "../components/group.js";
export { AwwPanel } from "../components/panel.js";
export { AwwStatusbar } from "../components/statusbar.js";
export { AwwAppShell } from "../components/app-shell.js";
export { AwwToolbar } from "../components/toolbar.js";
export { AwwField } from "../components/field.js";
export { AwwStatusLine } from "../components/status-line.js";
export { AwwAlert } from "../components/alert.js";
export { AwwDialog } from "../components/dialog.js";
export { AwwToast } from "../components/toast.js";
export { AwwEmptyState } from "../components/empty-state.js";
export { AwwStateOverlay } from "../components/state-overlay.js";
export { AwwList } from "../components/list.js";
export { AwwListItem } from "../components/list-item.js";
export { AwwCard } from "../components/card.js";
export { AwwRichPreview } from "../components/rich-preview.js";
export { AwwBrowserPanel } from "../components/browser-panel.js";
export { AwwManualCopy } from "../components/manual-copy.js";
export { AwwCommandPalette } from "../components/command-palette.js";
export { AwwShortcutHelp } from "../components/shortcut-help.js";
export { AwwUrlPicker } from "../components/url-picker.js";
export { AwwMetricCard } from "../components/metric-card.js";
export { AwwSegmentStrip } from "../components/segment-strip.js";
export { AwwContextBar } from "../components/context-bar.js";
export { AwwStatusStrip } from "../components/status-strip.js";
export { AwwTitlebar } from "../components/titlebar.js";
export { AwwContextPanel } from "../components/context-panel.js";
export { iconSvg, ICON_NAMES } from "../icons/retro-icons.js";
export { DEFAULT_THEME } from "../themes/default-theme.js";
export {
  TAGS,
  PUBLIC_TOKENS,
  FRAMEWORK_VERSION,
  DEFAULT_GEOMETRY,
  ThemeService,
  applyThemePatch,
  copyPublicThemeContext,
  createTheme,
  defaultThemeService,
  CommandRegistry,
  parseContextSegments,
  normalizeContextSegment,
  normalizeContextSegments,
  segmentsEqual,
  getSegmentCopyValue,
  adoptStyles,
  BASE_COMPONENT_STYLES,
  css,
  defineOnce,
  acquireDesktopRoot,
  releaseDesktopRoot,
  getDesktopRecord,
  clampRect,
  getSpawnRect,
  getViewportRect,
  rectToStyle,
  resizeRectFromEdges,
  sanitizeHtml,
  buildSearchUrl,
  deriveHostname,
  isHttpUrl,
  normalizeSearchTemplate,
  resolveNavigationInput,
  copyToClipboard,
  showToast
};

let serial = 0;

function nextOwner(prefix = "bookmarklet-tool") {
  serial += 1;
  return `${prefix}-${serial}`;
}

/**
 * Public extension hook for downstream projects that add their own Shadow DOM controls.
 * Keeping custom tags in this namespace makes injected tools easier to audit and style.
 */
export function defineBookmarkletComponent(tagName, ctor) {
  if (!String(tagName || "").startsWith("awwbookmarklet-")) {
    throw new Error("Custom bookmarklet component tags must use the awwbookmarklet- prefix.");
  }
  defineOnce(tagName, ctor);
  return customElements.get(tagName);
}

/**
 * Creates an unmounted window element. Use mountWindow() when the caller already owns
 * content creation and openBookmarkletWindow() when the caller wants build-and-mount.
 */
export function createWindow({ title = "AWW Tool", rect = null, closable = true, content = null } = {}) {
  registerAllComponents();
  const win = document.createElement(TAGS.window);
  win.setAttribute("title", title);
  if (closable === false) win.setAttribute("closable", "false");
  if (rect) win.setRect(rect);
  if (content) {
    if (typeof content === "string") win.innerHTML = sanitizeHtml(content);
    else win.append(content);
  }
  return win;
}

/**
 * Main bookmarklet convenience entry: build a window, acquire the shared desktop root,
 * and release the root when the window closes or is removed.
 */
export function openBookmarkletWindow(builder, { ownerPrefix = "bookmarklet-tool", rect = null, theme = null } = {}) {
  registerAllComponents();

  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);
  const win = typeof builder === "function" ? builder() : buildExampleToolWindow();

  if (theme) applyThemePatch(win, theme);
  if (rect) win.setRect(rect);
  record.root.append(win);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    releaseDesktopRoot(owner);
  };
  win.addEventListener("awwbookmarklet-window-closed", release, { once: true });
  win.addEventListener("awwbookmarklet-window-disconnected", release, { once: true });
  win.addEventListener("awwbookmarklet-window-close-request", () => {
    queueMicrotask(() => {
      if (!win.isConnected) release();
    });
  });

  return win;
}

/**
 * Mounts an existing window. This is the preferred path for reusable apps that assemble
 * custom components before attaching them to the injected desktop.
 */
export function mountWindow(win, { ownerPrefix = "bookmarklet-tool", rect = null, theme = null } = {}) {
  registerAllComponents();
  if (theme) applyThemePatch(win, theme);
  const owner = nextOwner(ownerPrefix);
  const record = acquireDesktopRoot(owner);
  if (rect && typeof win.setRect === "function") win.setRect(rect);
  record.root.append(win);

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    releaseDesktopRoot(owner);
  };
  win.addEventListener("awwbookmarklet-window-closed", release, { once: true });
  win.addEventListener("awwbookmarklet-window-disconnected", release, { once: true });
  return win;
}

export function bootstrapExampleTool() {
  return openBookmarkletWindow(() => buildExampleToolWindow({ title: "Page Extraction Tool" }), {
    ownerPrefix: "example-tool"
  });
}

/**
 * Merges theme tokens and reapplies them to the active desktop root by default.
 * Pass an explicit target when theming an isolated root or preview container.
 */
export function setTheme(themePatch, target = null) {
  if (target) {
    applyThemePatch(target, themePatch || {});
    return { ...defaultThemeService.tokens, ...(themePatch || {}) };
  }

  const tokens = defaultThemeService.setTheme(themePatch || {});
  const themeTarget = target || getDesktopRecord(FRAMEWORK_VERSION)?.root;
  if (themeTarget) defaultThemeService.applyTheme(themeTarget);
  return tokens;
}

export function shutdownAll() {
  emergencyTeardown("*");
}

registerAllComponents();

globalThis.awwtools = globalThis.awwtools || {};
globalThis.awwtools.bookmarkletUi = {
  version: FRAMEWORK_VERSION,
  tags: TAGS,
  tokens: PUBLIC_TOKENS,
  geometry: DEFAULT_GEOMETRY,
  registerAllComponents,
  defineComponent: defineBookmarkletComponent,
  createWindow,
  openWindow: openBookmarkletWindow,
  mountWindow,
  bootstrapExampleTool,
  shutdownAll,
  acquireDesktopRoot,
  releaseDesktopRoot,
  getDesktopRecord,
  setTheme,
  themeService: defaultThemeService,
  ThemeService,
  applyThemePatch,
  copyPublicThemeContext,
  createTheme,
  CommandRegistry,
  contextSegments: {
    parse: parseContextSegments,
    normalize: normalizeContextSegments,
    normalizeOne: normalizeContextSegment,
    equal: segmentsEqual,
    copyValue: getSegmentCopyValue
  },
  styles: {
    adoptStyles,
    base: BASE_COMPONENT_STYLES,
    css
  },
  url: {
    buildSearchUrl,
    deriveHostname,
    isHttpUrl,
    normalizeSearchTemplate,
    resolveNavigationInput
  },
  sanitizeHtml,
  copyToClipboard,
  showToast
};
globalThis.awwbookmarklet = globalThis.awwtools.bookmarkletUi;
