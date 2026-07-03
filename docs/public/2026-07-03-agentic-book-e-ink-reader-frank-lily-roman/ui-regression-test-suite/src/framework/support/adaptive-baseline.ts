import type { BaselineProfile, MonitoredField, Invariant } from "./baseline.js";

/**
 * Named expected-change profiles (gap-closure spec F00). Each profile declares
 * which monitored identity fields an action may legitimately change; every
 * other identity field, plus the hard invariants (network, storage privacy,
 * layout overflow, overlay, errors), must stay stable.
 */
function profile(
  name: string,
  allowedChanges: MonitoredField[],
  extra: { relax?: Invariant[]; contentMarkers?: string[] } = {},
): BaselineProfile {
  return { name, allowedChanges, relax: extra.relax, contentMarkers: extra.contentMarkers };
}

export const PROFILES = {
  /** Loading a document: open screen hides, reader shows, title/content/progress appear. */
  fileOpen: profile("file-open", [
    "openScreenVisible",
    "readerVisible",
    "readerMode",
    "eink",
    "motion",
    "titleText",
    "progressText",
    "contentBox",
    "readerBox",
  ]),

  /** Replacing the current document with a new one. */
  fileReplace: profile("file-replace", [
    "titleText",
    "progressText",
    "contentBox",
    "readerBox",
  ]),

  /** A rejected file: nothing about the current reading state should change. */
  fileReject: profile("file-reject", ["openScreenVisible"]),

  /** Changing reader mode (paged <-> scroll). */
  modeChange: profile("mode-change", [
    "readerMode",
    "progressText",
    "contentBox",
    "readerBox",
  ]),

  /** A generic typography/layout setting change (size, line height, measure, ...). */
  settingChange: profile("setting-change", [
    "progressText",
    "contentBox",
    "readerBox",
  ]),

  /** A theme change. */
  themeChange: profile("theme-change", ["theme", "contentBox", "readerBox"]),

  /** A contrast change. */
  contrastChange: profile("contrast-change", ["contrast", "contentBox", "readerBox"]),

  /** A font-family change (may reflow => box/progress change). */
  fontChange: profile("font-change", ["progressText", "contentBox", "readerBox"]),

  /** An E Ink intensity change. */
  einkChange: profile("eink-change", ["eink"]),

  /** A motion change. */
  motionChange: profile("motion-change", ["motion"]),

  /** Turning a page (paged mode). */
  pageTurn: profile("page-turn", ["progressText", "contentBox"]),

  /** Scrolling (scroll mode). */
  scroll: profile("scroll", ["progressText"]),

  /** Viewport / orientation change: layout + pagination may change. */
  viewportChange: profile("viewport-change", [
    "progressText",
    "contentBox",
    "readerBox",
  ]),

  /** Opening the settings panel. */
  settingsOpen: profile("settings-open", ["settingsVisible"]),

  /** Closing the settings panel. */
  settingsClose: profile("settings-close", ["settingsVisible"]),

  /** Reload: returns to open screen, reader hidden, content not restored. */
  reload: profile("reload", [
    "openScreenVisible",
    "readerVisible",
    "titleText",
    "progressText",
    "contentBox",
    "readerBox",
    "eink",
    "motion",
    "readerMode",
  ]),

  /** Recovering from an error while a document remains open. */
  errorRecovery: profile("error-recovery", []),

  /** Reading static metadata: no application state should change at all. */
  metadataRead: profile("metadata-read", []),

  /** Reading the RSS feed: no application state should change at all. */
  rssRead: profile("rss-read", []),

  /** Explicitly no user-visible change is expected. */
  noChange: profile("no-user-visible-change", []),
} as const;

export type ProfileName = keyof typeof PROFILES;
