export const FRAMEWORK_VERSION = "1.0.0";

export const TAGS = {
  desktopRoot: "awwbookmarklet-desktop-root",
  window: "awwbookmarklet-window",
  menubar: "awwbookmarklet-menubar",
  menu: "awwbookmarklet-menu",
  button: "awwbookmarklet-button",
  iconButton: "awwbookmarklet-icon-button",
  input: "awwbookmarklet-input",
  textarea: "awwbookmarklet-textarea",
  checkbox: "awwbookmarklet-checkbox",
  radio: "awwbookmarklet-radio",
  select: "awwbookmarklet-select",
  range: "awwbookmarklet-range",
  progress: "awwbookmarklet-progress",
  tabs: "awwbookmarklet-tabs",
  tabPanel: "awwbookmarklet-tab-panel",
  listbox: "awwbookmarklet-listbox",
  group: "awwbookmarklet-group",
  panel: "awwbookmarklet-panel",
  statusbar: "awwbookmarklet-statusbar"
};

export const GLOBAL_SYMBOLS = {
  rootsByVersion: Symbol.for("awwbookmarklet.desktopRootsByVersion"),
  primaryRoot: Symbol.for("awwbookmarklet.desktopRoot"),
  version: Symbol.for("awwbookmarklet.frameworkVersion")
};

export const ROOT_Z_INDEX = 2147481000;

export const PUBLIC_TOKENS = {
  workspaceBg: "--awwbookmarklet-workspace-bg",
  windowBg: "--awwbookmarklet-window-bg",
  panelBg: "--awwbookmarklet-panel-bg",
  titlebarActiveBg: "--awwbookmarklet-titlebar-active-bg",
  titlebarInactiveBg: "--awwbookmarklet-titlebar-inactive-bg",
  titlebarFg: "--awwbookmarklet-titlebar-fg",
  borderStrong: "--awwbookmarklet-border-strong",
  borderSubtle: "--awwbookmarklet-border-subtle",
  focusRing: "--awwbookmarklet-focus-ring",
  buttonBg: "--awwbookmarklet-button-bg",
  buttonFg: "--awwbookmarklet-button-fg",
  buttonActiveBg: "--awwbookmarklet-button-active-bg",
  inputBg: "--awwbookmarklet-input-bg",
  inputFg: "--awwbookmarklet-input-fg",
  menuBg: "--awwbookmarklet-menu-bg",
  menuFg: "--awwbookmarklet-menu-fg",
  selectionBg: "--awwbookmarklet-selection-bg",
  selectionFg: "--awwbookmarklet-selection-fg",
  statusbarBg: "--awwbookmarklet-statusbar-bg",
  shadowDepth: "--awwbookmarklet-shadow-depth",
  frostOpacity: "--awwbookmarklet-frost-opacity",
  space1: "--awwbookmarklet-space-1",
  space2: "--awwbookmarklet-space-2",
  space3: "--awwbookmarklet-space-3",
  controlHeight: "--awwbookmarklet-size-control-h",
  titleHeight: "--awwbookmarklet-size-title-h"
};

export const DEFAULT_GEOMETRY = {
  minWidth: 320,
  minHeight: 200,
  minVisibleTitlebar: 36,
  spawnWidth: 520,
  spawnHeight: 420,
  spawnX: 60,
  spawnY: 60,
  cascadeStep: 28
};
