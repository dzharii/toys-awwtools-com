---

A00 Graph notation

---


```ts
type FeatureKind =
  | "product"
  | "page-context"
  | "entrypoint"
  | "surface"
  | "tool"
  | "action"
  | "runtime"
  | "storage"
  | "setting"
  | "security"
  | "export"
  | "content-helper";

type EdgeTag =
  | "contains"
  | "injects-into"
  | "opens"
  | "launches"
  | "hosts"
  | "wraps"
  | "routes-to"
  | "gates"
  | "configures"
  | "depends-on"
  | "stores-in"
  | "reads-from"
  | "writes-to"
  | "captures"
  | "extracts"
  | "converts"
  | "copies"
  | "exports"
  | "navigates"
  | "records"
  | "suggests"
  | "notifies"
  | "snoozes"
  | "completes"
  | "embeds"
  | "bypasses"
  | "protects"
  | "rejects"
  | "coordinates"
  | "commands"
  | "shows"
  | "edits"
  | "archives"
  | "closes";

type FeatureNodeId =
  | "eye05"
  | "activeWebPage"
  | "contentScripts"
  | "backgroundServiceWorker"
  | "settingsRuntime"
  | "settingsPage"
  | "chromeStorageLocal"
  | "localIndexedDb"
  | "bookmarksManualTable"
  | "bookmarksActivityTable"
  | "remindersTable"
  | "urlPickerSignalsTable"
  | "hoverEyeBubble"
  | "longPressOverlay"
  | "linkPreviewController"
  | "previewUrlEligibility"
  | "previewWindow"
  | "directIframePreview"
  | "miniWebBrowserWrappedPreview"
  | "embeddedNavigationHeaderBypass"
  | "actionsMenu"
  | "openToolsMenu"
  | "minibuffer"
  | "minibufferHelp"
  | "readerModeAction"
  | "copyPageMarkdownAction"
  | "toggleContentEditableAction"
  | "openInNewTabAction"
  | "copyMarkdownLinkAction"
  | "copyUrlAction"
  | "snoozeHoverBubbleAction"
  | "addEditBookmarkAction"
  | "bookmarksCore"
  | "bookmarksManager"
  | "urlPicker"
  | "richTextToMarkdown"
  | "markdownToHtml"
  | "notificationsAndReminders"
  | "inPageReminderToasts"
  | "miniWebBrowser"
  | "multiBrowser"
  | "multiBrowserWorkspaceStore"
  | "multiBrowserFrameHotkeys"
  | "pageScreenshot"
  | "pageScreenshotDescriptionExtractor"
  | "pageContentSelect"
  | "pageContentSelectOverlay"
  | "pageContentSelectDraftStore"
  | "sessionSnapshot"
  | "sessionSnapshotDescriptionExtractor"
  | "sessionSnapshotZipExport"
  | "mediaPreview"
  | "textExpander"
  | "tabTrailOverlay"
  | "overlayBlocker"
  | "readabilityHelpers"
  | "turndownHelpers"
  | "clipboardFallbacks"
  | "downloadsApi"
  | "tabsApi"
  | "alarmsApi"
  | "scriptingApi"
  | "declarativeNetRequestApi";

interface FeatureNode {
  id: FeatureNodeId;
  label: string;
  kind: FeatureKind;
  description: string;
}

interface FeatureEdge {
  to: FeatureNodeId;
  tags: EdgeTag[];
  meaning: string;
}

interface FeatureGraphEntry {
  node: FeatureNode;
  edges: FeatureEdge[];
}

type FeatureGraph = Record<FeatureNodeId, FeatureGraphEntry>;

const e = (
  to: FeatureNodeId,
  tags: EdgeTag[],
  meaning: string,
): FeatureEdge => ({ to, tags, meaning });

export const eye05FeatureGraph: FeatureGraph = {
  eye05: {
    node: {
      id: "eye05",
      label: "eye05",
      kind: "product",
      description:
        "Local-first Chrome productivity extension for staying in browsing flow while previewing links, collecting page context, managing bookmarks, and using focused browser tools.",
    },
    edges: [
      e("activeWebPage", ["injects-into"], "Runs inside ordinary browsing through content scripts."),
      e("contentScripts", ["contains"], "Uses content-side scripts as the user-facing page layer."),
      e("backgroundServiceWorker", ["contains"], "Uses a privileged MV3 service worker for storage, tabs, alarms, screenshots, DNR, and tool coordination."),
      e("settingsRuntime", ["contains", "configures"], "Centralizes behavior flags and user preferences."),
      e("linkPreviewController", ["contains"], "Owns the original link-triage workflow."),
      e("previewWindow", ["contains", "shows"], "Provides the main floating work surface."),
      e("actionsMenu", ["contains", "commands"], "Provides page-level actions from the preview/minibuffer surfaces."),
      e("openToolsMenu", ["contains", "launches"], "Provides entry to extension-hosted local tools."),
      e("minibuffer", ["contains", "commands"], "Provides command-driven access to actions and tools."),
      e("bookmarksCore", ["contains", "stores-in"], "Stores saved links and activity links locally."),
      e("notificationsAndReminders", ["contains", "notifies"], "Manages scheduled user reminders."),
      e("urlPicker", ["contains", "suggests"], "Provides URL/search suggestions and bookmark-aware navigation."),
      e("textExpander", ["contains"], "Expands text commands while typing on pages."),
      e("tabTrailOverlay", ["contains", "records"], "Shows page/tab trail context in the browsing surface."),
    ],
  },

  activeWebPage: {
    node: {
      id: "activeWebPage",
      label: "Active Web Page",
      kind: "page-context",
      description:
        "The page the user is currently reading, browsing, clipping, previewing from, or acting on.",
    },
    edges: [
      e("hoverEyeBubble", ["shows"], "Eligible links can reveal the eye preview affordance after hover delay."),
      e("longPressOverlay", ["shows"], "Right-button hold can reveal copy, preview, new-tab, or media-preview options."),
      e("previewWindow", ["shows"], "Floating preview and tool windows appear over the current page."),
      e("minibuffer", ["shows", "commands"], "Command entry can be opened on top of the current page."),
      e("textExpander", ["depends-on"], "Typed text on the page is the input stream for expansion."),
      e("pageScreenshot", ["captures"], "The visible active tab is the screenshot target."),
      e("pageContentSelectOverlay", ["injects-into"], "Selection overlay is injected into the active page for region clipping."),
      e("sessionSnapshot", ["captures"], "Current-window tabs are candidates for session capture."),
      e("tabTrailOverlay", ["shows"], "Tab trail context appears inside the browsing context."),
      e("overlayBlocker", ["protects"], "Overlay blocker operates against obstructive page overlays."),
    ],
  },

  contentScripts: {
    node: {
      id: "contentScripts",
      label: "Content Scripts",
      kind: "runtime",
      description:
        "The injected page-side layer that wires preview UI, long press, text expansion, iframe helpers, tab trail, and page extraction helpers.",
    },
    edges: [
      e("hoverEyeBubble", ["coordinates"], "Owns hover affordance behavior on links."),
      e("longPressOverlay", ["coordinates"], "Owns deliberate right-button-hold behavior."),
      e("previewWindow", ["coordinates", "shows"], "Creates and controls the floating preview window."),
      e("actionsMenu", ["coordinates"], "Executes parent-page actions and routes frame actions."),
      e("openToolsMenu", ["coordinates"], "Launches extension-hosted tools from the page surface."),
      e("minibuffer", ["coordinates"], "Hosts command input and command suggestions."),
      e("textExpander", ["coordinates"], "Runs typing-triggered expansion logic."),
      e("tabTrailOverlay", ["coordinates"], "Renders tab trail overlay UI."),
      e("readabilityHelpers", ["depends-on"], "Loads reader-mode and description-extraction helpers."),
      e("turndownHelpers", ["depends-on"], "Loads Markdown conversion helpers in relevant frames/tools."),
      e("settingsRuntime", ["reads-from"], "Reads effective user settings from the settings runtime."),
      e("backgroundServiceWorker", ["depends-on"], "Sends runtime messages for privileged operations."),
    ],
  },

  backgroundServiceWorker: {
    node: {
      id: "backgroundServiceWorker",
      label: "Background Service Worker",
      kind: "runtime",
      description:
        "Privileged backend that handles runtime messages, local IndexedDB, settings application, DNR rules, alarms, tabs, screenshots, page-selection sessions, and exports.",
    },
    edges: [
      e("localIndexedDb", ["stores-in", "reads-from", "writes-to"], "Persists bookmarks, reminders, and URL picker signals."),
      e("chromeStorageLocal", ["reads-from", "writes-to"], "Stores settings and local documents."),
      e("declarativeNetRequestApi", ["depends-on"], "Creates or removes temporary framing-header bypass rules."),
      e("tabsApi", ["depends-on"], "Opens tabs, lists tabs, captures tab metadata, and closes selected tabs."),
      e("alarmsApi", ["depends-on"], "Schedules reminder delivery checks."),
      e("scriptingApi", ["depends-on"], "Injects page screenshot and page content selection helpers."),
      e("downloadsApi", ["depends-on"], "Downloads generated archives or HTML outputs."),
      e("bookmarksCore", ["coordinates"], "Implements bookmark CRUD and activity recording."),
      e("notificationsAndReminders", ["coordinates"], "Implements reminder creation, delivery, snooze, completion, and stats."),
      e("pageScreenshot", ["coordinates", "captures"], "Captures visible active tab and extracts description."),
      e("pageContentSelect", ["coordinates"], "Opens, commands, finishes, and cancels page selection sessions."),
      e("sessionSnapshot", ["coordinates", "captures"], "Lists tabs, captures selected tabs, and closes selected tabs."),
      e("miniWebBrowser", ["coordinates", "navigates"], "Safely opens HTTP(S) URLs in new tabs when needed."),
      e("textExpander", ["coordinates"], "Handles background scope and runtime support."),
    ],
  },

  settingsRuntime: {
    node: {
      id: "settingsRuntime",
      label: "Settings Runtime",
      kind: "setting",
      description:
        "Schema-versioned settings model that builds effective settings from defaults plus validated overrides.",
    },
    edges: [
      e("chromeStorageLocal", ["stores-in", "reads-from", "writes-to"], "Persists the settings document under the local settings key."),
      e("settingsPage", ["configures"], "Provides data and mutation APIs to the settings UI."),
      e("hoverEyeBubble", ["configures", "gates"], "Controls whether hover preview is enabled and how delayed/snoozed it is."),
      e("linkPreviewController", ["configures", "gates"], "Controls whether opening interaction is eye-only, long-press-only, or both."),
      e("previewWindow", ["configures"], "Controls default preview size and title behavior."),
      e("openToolsMenu", ["configures", "gates"], "Controls which Open Tools appear."),
      e("longPressOverlay", ["configures", "gates"], "Controls long-press copy and link actions."),
      e("bookmarksCore", ["configures", "gates"], "Controls manual bookmark buttons and automatic activity collection."),
      e("embeddedNavigationHeaderBypass", ["configures", "gates"], "Controls whether framing-header bypass is allowed."),
      e("notificationsAndReminders", ["configures", "gates"], "Controls reminders, toasts, polling, and global snooze."),
      e("urlPicker", ["configures"], "Controls suggestions, history suggestions, inline bookmark controls, empty-input suggestions, and favicons."),
      e("miniWebBrowser", ["configures"], "Controls search template, sandbox mode, and popup behavior."),
      e("textExpander", ["configures", "gates"], "Controls whether text expansion runs."),
      e("overlayBlocker", ["configures", "gates"], "Controls page overlay blocking behavior."),
    ],
  },

  settingsPage: {
    node: {
      id: "settingsPage",
      label: "Settings Page",
      kind: "surface",
      description:
        "User-facing controls for changing extension behavior, resetting settings, and managing feature visibility.",
    },
    edges: [
      e("settingsRuntime", ["reads-from", "writes-to"], "Renders and mutates effective settings."),
      e("chromeStorageLocal", ["writes-to"], "Persists user overrides through the settings runtime."),
      e("openToolsMenu", ["configures"], "Lets the user hide or show specific Open Tools."),
      e("privacySecuritySettings" as FeatureNodeId, ["configures"], "Conceptually configures security-sensitive behavior such as header bypass and automatic activity bookmarks."),
    ],
  } as FeatureGraphEntry,

  chromeStorageLocal: {
    node: {
      id: "chromeStorageLocal",
      label: "chrome.storage.local",
      kind: "storage",
      description:
        "Local browser storage used for settings and some feature documents.",
    },
    edges: [
      e("settingsRuntime", ["stores-in"], "Stores the settings document."),
      e("multiBrowserWorkspaceStore", ["stores-in"], "Stores the Multi Browser workspace document."),
      e("pageContentSelectDraftStore", ["stores-in"], "Stores Page Content Select drafts and saved sessions."),
    ],
  },

  localIndexedDb: {
    node: {
      id: "localIndexedDb",
      label: "Local IndexedDB",
      kind: "storage",
      description:
        "Dexie-backed local database for bookmarks, reminders, and URL picker signals.",
    },
    edges: [
      e("bookmarksManualTable", ["contains"], "Contains manual bookmark records."),
      e("bookmarksActivityTable", ["contains"], "Contains automatic activity bookmark records."),
      e("remindersTable", ["contains"], "Contains reminder records."),
      e("urlPickerSignalsTable", ["contains"], "Contains URL picker ranking and selection signals."),
      e("bookmarksCore", ["reads-from", "writes-to"], "Persists bookmark data."),
      e("notificationsAndReminders", ["reads-from", "writes-to"], "Persists reminder data."),
      e("urlPicker", ["reads-from", "writes-to"], "Persists suggestion and ranking signals."),
    ],
  },

  bookmarksManualTable: {
    node: {
      id: "bookmarksManualTable",
      label: "BookmarksManual",
      kind: "storage",
      description:
        "Local table for user-created bookmarks.",
    },
    edges: [
      e("bookmarksCore", ["reads-from", "writes-to"], "Manual bookmark source used by save/edit/delete flows."),
      e("bookmarksManager", ["reads-from", "edits"], "Visible as manually saved links in the manager."),
      e("urlPicker", ["suggests"], "Can appear as bookmarked URL suggestions."),
    ],
  },

  bookmarksActivityTable: {
    node: {
      id: "bookmarksActivityTable",
      label: "BookmarksActivity",
      kind: "storage",
      description:
        "Local table for automatically collected page activity bookmarks.",
    },
    edges: [
      e("bookmarksCore", ["reads-from", "writes-to"], "Activity source used by automatic capture and listing."),
      e("bookmarksManager", ["reads-from"], "Visible as activity-derived saved links."),
      e("urlPicker", ["suggests"], "Can influence recent/frequent URL suggestions."),
    ],
  },

  remindersTable: {
    node: {
      id: "remindersTable",
      label: "Reminders",
      kind: "storage",
      description:
        "Local table for scheduled, delivered, snoozed, completed, and acknowledged reminders.",
    },
    edges: [
      e("notificationsAndReminders", ["reads-from", "writes-to"], "Primary persistence for reminder records."),
      e("alarmsApi", ["depends-on"], "Alarm scheduling is derived from due reminder timestamps."),
      e("inPageReminderToasts", ["notifies"], "Due reminders can surface through page toasts."),
    ],
  },

  urlPickerSignalsTable: {
    node: {
      id: "urlPickerSignalsTable",
      label: "UrlPickerSignals",
      kind: "storage",
      description:
        "Local table for URL picker selection, ranking, and metadata signals.",
    },
    edges: [
      e("urlPicker", ["reads-from", "writes-to", "suggests"], "Powers local URL suggestions."),
      e("miniWebBrowser", ["suggests"], "Feeds URL/search suggestions for Mini Web Browser navigation."),
      e("multiBrowser", ["suggests"], "Feeds URL/search suggestions for tile creation."),
      e("bookmarksCore", ["records"], "Bookmark toggles and page metadata can affect URL picker records."),
    ],
  },

  hoverEyeBubble: {
    node: {
      id: "hoverEyeBubble",
      label: "Hover Eye Bubble",
      kind: "entrypoint",
      description:
        "Delayed hover affordance on eligible links that opens preview only after deliberate user action.",
    },
    edges: [
      e("settingsRuntime", ["gates", "configures"], "Controlled by hover bubble and link preview interaction settings."),
      e("previewUrlEligibility", ["depends-on", "gates"], "Only eligible resolved targets can proceed to preview."),
      e("linkPreviewController", ["routes-to"], "Dispatches preview intent to the link preview controller."),
      e("previewWindow", ["opens"], "User activation opens the floating preview window."),
      e("snoozeHoverBubbleAction", ["snoozes"], "Can be temporarily suppressed through the snooze action."),
    ],
  },

  longPressOverlay: {
    node: {
      id: "longPressOverlay",
      label: "Long-Press Overlay",
      kind: "entrypoint",
      description:
        "Right-button hold overlay for copying nearby visible text, previewing HTTPS links, opening new tabs, or previewing media.",
    },
    edges: [
      e("settingsRuntime", ["gates", "configures"], "Controlled by long-press and link preview settings."),
      e("previewUrlEligibility", ["depends-on", "gates"], "Link preview action requires eligible HTTPS URL resolution."),
      e("linkPreviewController", ["routes-to"], "Preview link action dispatches into the link preview controller."),
      e("openInNewTabAction", ["opens"], "New tab action opens the resolved link outside the preview."),
      e("mediaPreview", ["launches"], "Media action opens the Media Preview tool."),
      e("clipboardFallbacks", ["copies"], "Text copy uses clipboard behavior and fallback status when needed."),
    ],
  },

  linkPreviewController: {
    node: {
      id: "linkPreviewController",
      label: "Link Preview Controller",
      kind: "runtime",
      description:
        "Coordinates link-preview requests, interaction policy, target resolution, and hosting-plan selection.",
    },
    edges: [
      e("hoverEyeBubble", ["coordinates"], "Receives hover-eye preview requests."),
      e("longPressOverlay", ["coordinates"], "Receives long-press preview requests."),
      e("previewUrlEligibility", ["depends-on", "gates"], "Validates preview targets before opening UI."),
      e("previewWindow", ["opens", "coordinates"], "Creates or updates the floating preview window."),
      e("directIframePreview", ["routes-to", "hosts"], "Uses direct iframe hosting for supported same-origin HTTP(S) targets."),
      e("miniWebBrowserWrappedPreview", ["routes-to", "wraps"], "Routes cross-origin web targets through Mini Web Browser wrapper when needed."),
      e("settingsRuntime", ["reads-from"], "Reads opening interaction and preview-related settings."),
    ],
  },

  previewUrlEligibility: {
    node: {
      id: "previewUrlEligibility",
      label: "Preview URL Eligibility",
      kind: "security",
      description:
        "Policy layer that normalizes link targets and admits only supported HTTP(S)/HTTPS preview targets.",
    },
    edges: [
      e("hoverEyeBubble", ["gates"], "Determines whether hover preview can become available."),
      e("longPressOverlay", ["gates"], "Determines whether long-press link preview can be offered."),
      e("linkPreviewController", ["gates"], "Protects the preview controller from unsupported URLs."),
      e("openInNewTabAction", ["protects"], "URL opening helpers restrict new-tab targets to HTTP(S)."),
      e("pageScreenshot", ["rejects"], "Unsupported pages such as browser-only pages are rejected."),
      e("pageContentSelect", ["rejects"], "Unsupported pages are rejected before overlay injection."),
      e("sessionSnapshot", ["rejects"], "Unsupported tabs are excluded from capture."),
    ],
  },

  previewWindow: {
    node: {
      id: "previewWindow",
      label: "Floating Preview Window",
      kind: "surface",
      description:
        "Main floating surface that can host web previews, Mini Web Browser wrapped pages, Actions, and extension-hosted tools.",
    },
    edges: [
      e("directIframePreview", ["hosts"], "Can show a page directly in an iframe when allowed."),
      e("miniWebBrowserWrappedPreview", ["hosts", "wraps"], "Can show cross-origin targets through the Mini Web Browser wrapper."),
      e("actionsMenu", ["shows"], "Exposes page-level actions."),
      e("openToolsMenu", ["shows"], "Exposes extension-hosted tool launcher."),
      e("richTextToMarkdown", ["hosts"], "Hosts small conversion tool in the preview window."),
      e("markdownToHtml", ["hosts"], "Hosts Markdown-to-HTML tool in the preview window."),
      e("notificationsAndReminders", ["hosts"], "Hosts reminder manager tool."),
      e("miniWebBrowser", ["hosts"], "Hosts lightweight browser tool."),
      e("bookmarksManager", ["hosts"], "Hosts bookmark management tool."),
      e("pageScreenshot", ["hosts"], "Hosts active-page screenshot tool."),
      e("pageContentSelect", ["hosts"], "Hosts content-selection tool while overlay runs on the active page."),
      e("mediaPreview", ["hosts"], "Hosts focused media preview."),
      e("settingsRuntime", ["reads-from"], "Uses default size, title behavior, and tool visibility settings."),
    ],
  },

  directIframePreview: {
    node: {
      id: "directIframePreview",
      label: "Direct Iframe Preview",
      kind: "surface",
      description:
        "Hosting mode where a supported web target is loaded directly in a preview iframe.",
    },
    edges: [
      e("previewWindow", ["embeds"], "Renders inside the preview window."),
      e("embeddedNavigationHeaderBypass", ["depends-on"], "May require temporary header bypass for frame-blocked targets."),
      e("readabilityHelpers", ["depends-on"], "Can receive iframe-side reader and copy helpers when the frame is accessible."),
      e("turndownHelpers", ["depends-on"], "Can use iframe-side Markdown conversion helpers when accessible."),
    ],
  },

  miniWebBrowserWrappedPreview: {
    node: {
      id: "miniWebBrowserWrappedPreview",
      label: "Mini Web Browser Wrapped Preview",
      kind: "surface",
      description:
        "Hosting mode where the preview target is opened through the Mini Web Browser wrapper instead of a raw iframe.",
    },
    edges: [
      e("previewWindow", ["embeds"], "Runs inside the floating preview window."),
      e("miniWebBrowser", ["wraps", "depends-on"], "Reuses Mini Web Browser navigation and embedding behavior."),
      e("urlPicker", ["depends-on"], "Can use shared URL picker logic for navigation input."),
      e("openInNewTabAction", ["opens"], "Can fall back to opening the target externally."),
    ],
  },

  embeddedNavigationHeaderBypass: {
    node: {
      id: "embeddedNavigationHeaderBypass",
      label: "Embedded Navigation Header Bypass",
      kind: "security",
      description:
        "Optional DNR-based feature that removes frame-blocking response headers for sub-frame preview navigation.",
    },
    edges: [
      e("settingsRuntime", ["gates", "configures"], "Only operates when the privacy/security setting allows header bypass."),
      e("declarativeNetRequestApi", ["depends-on", "bypasses"], "Uses DNR modifyHeaders rules."),
      e("directIframePreview", ["bypasses"], "Makes otherwise frame-blocked targets more likely to load."),
      e("previewWindow", ["depends-on"], "Affects embedded preview loading behavior."),
    ],
  },

  actionsMenu: {
    node: {
      id: "actionsMenu",
      label: "Actions Menu",
      kind: "surface",
      description:
        "Grouped menu of parent-page and preview-frame actions, organized around content, navigation, and general actions.",
    },
    edges: [
      e("readerModeAction", ["contains", "commands"], "Runs readable-page transformation."),
      e("copyPageMarkdownAction", ["contains", "commands"], "Copies page content as Markdown."),
      e("toggleContentEditableAction", ["contains", "commands"], "Toggles editable state on page content."),
      e("openInNewTabAction", ["contains", "commands"], "Opens target/current URL in a regular tab."),
      e("copyMarkdownLinkAction", ["contains", "commands"], "Copies title and URL as a Markdown link."),
      e("copyUrlAction", ["contains", "commands"], "Copies the current URL."),
      e("snoozeHoverBubbleAction", ["contains", "commands"], "Snoozes hover affordances."),
      e("addEditBookmarkAction", ["contains", "commands"], "Creates or edits a bookmark for the current URL."),
      e("minibuffer", ["commands"], "Same action set is reachable by command."),
      e("previewWindow", ["shows"], "Shown through the preview window surface."),
    ],
  },

  openToolsMenu: {
    node: {
      id: "openToolsMenu",
      label: "Open Tools Menu",
      kind: "surface",
      description:
        "Tool launcher for extension-hosted local workspaces.",
    },
    edges: [
      e("richTextToMarkdown", ["launches"], "Opens local rich-text-to-Markdown converter."),
      e("notificationsAndReminders", ["launches"], "Opens reminder manager."),
      e("miniWebBrowser", ["launches"], "Opens lightweight embedded browser."),
      e("multiBrowser", ["launches"], "Opens tiled multi-page workspace, usually in a full tab."),
      e("bookmarksManager", ["launches"], "Opens local bookmark manager."),
      e("pageScreenshot", ["launches"], "Opens active-page screenshot capture tool."),
      e("pageContentSelect", ["launches"], "Opens page content clipping tool."),
      e("sessionSnapshot", ["launches"], "Opens selected-tabs snapshot/export tool, usually in a full tab."),
      e("markdownToHtml", ["launches"], "Opens Markdown-to-HTML converter."),
      e("settingsRuntime", ["gates"], "Tool visibility follows Open Tools settings."),
      e("minibuffer", ["commands"], "Same tools are reachable by command names and aliases."),
    ],
  },

  minibuffer: {
    node: {
      id: "minibuffer",
      label: "Minibuffer",
      kind: "surface",
      description:
        "Command input surface for actions, tools, utilities, aliases, parameters, and command discovery.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Can execute page actions by command."),
      e("openToolsMenu", ["commands"], "Can launch tools by command or alias."),
      e("minibufferHelp", ["opens"], "Opens command guide and discovery help."),
      e("richTextToMarkdown", ["launches"], "Command opens Rich Text to Markdown."),
      e("notificationsAndReminders", ["launches"], "Command opens Notifications and Reminders."),
      e("miniWebBrowser", ["launches"], "Command opens Mini Web Browser, optionally with URL/search text."),
      e("multiBrowser", ["launches"], "Command opens Multi Browser."),
      e("bookmarksManager", ["launches"], "Command opens Bookmarks Manager."),
      e("pageScreenshot", ["launches"], "Command opens Page Screenshot."),
      e("pageContentSelect", ["launches"], "Command opens Page Content Select."),
      e("sessionSnapshot", ["launches"], "Command opens Session Snapshot."),
      e("markdownToHtml", ["launches"], "Command opens Markdown to HTML."),
      e("settingsRuntime", ["reads-from", "gates"], "Hidden tools are not shown as suggestions."),
    ],
  },

  minibufferHelp: {
    node: {
      id: "minibufferHelp",
      label: "Minibuffer Help",
      kind: "tool",
      description:
        "Built-in command guide that explains tool commands, aliases, examples, and discovery behavior.",
    },
    edges: [
      e("minibuffer", ["depends-on"], "Documents minibuffer command behavior."),
      e("miniWebBrowser", ["hosts"], "Help opens inside the extension mini browser surface."),
      e("openToolsMenu", ["shows"], "Documents available tool commands."),
      e("actionsMenu", ["shows"], "Documents action commands and aliases."),
    ],
  },

  readerModeAction: {
    node: {
      id: "readerModeAction",
      label: "Reader Mode",
      kind: "action",
      description:
        "Transforms readable page content into a cleaner reading document.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a page action."),
      e("readabilityHelpers", ["depends-on", "extracts"], "Uses Readability-style extraction."),
      e("previewWindow", ["shows"], "Can operate in preview/page context."),
      e("miniWebBrowser", ["commands"], "Available as a Mini Web Browser page action."),
    ],
  },

  copyPageMarkdownAction: {
    node: {
      id: "copyPageMarkdownAction",
      label: "Copy Page Markdown",
      kind: "action",
      description:
        "Extracts readable page content and copies it as Markdown.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a content action."),
      e("readabilityHelpers", ["extracts", "depends-on"], "Extracts readable article/page content."),
      e("turndownHelpers", ["converts", "depends-on"], "Converts HTML content into Markdown."),
      e("clipboardFallbacks", ["copies"], "Writes Markdown to clipboard or shows fallback."),
      e("miniWebBrowser", ["commands"], "Available from Mini Web Browser page actions."),
    ],
  },

  toggleContentEditableAction: {
    node: {
      id: "toggleContentEditableAction",
      label: "Toggle Content Editable",
      kind: "action",
      description:
        "Temporarily makes page content editable/selectable for manual extraction or adjustment.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a page action."),
      e("activeWebPage", ["edits"], "Changes contentEditable state in page/frame context."),
      e("miniWebBrowser", ["commands"], "Available from Mini Web Browser page actions."),
    ],
  },

  openInNewTabAction: {
    node: {
      id: "openInNewTabAction",
      label: "Open in New Tab",
      kind: "action",
      description:
        "Opens the current, previewed, or selected HTTP(S) URL in a regular browser tab.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a navigation action."),
      e("longPressOverlay", ["commands"], "Available for resolved HTTPS links."),
      e("miniWebBrowser", ["commands"], "Available from Mini Web Browser page actions."),
      e("tabsApi", ["depends-on", "opens"], "Uses browser tab opening."),
      e("previewUrlEligibility", ["protects"], "URL opening is restricted to HTTP(S)."),
    ],
  },

  copyMarkdownLinkAction: {
    node: {
      id: "copyMarkdownLinkAction",
      label: "Copy Markdown Link",
      kind: "action",
      description:
        "Copies the current title and URL as a Markdown link.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a content/navigation action."),
      e("clipboardFallbacks", ["copies"], "Writes Markdown link to clipboard."),
      e("bookmarksCore", ["records"], "Can operate on URLs also used by bookmarking and activity capture."),
      e("miniWebBrowser", ["commands"], "Available from Mini Web Browser page actions."),
    ],
  },

  copyUrlAction: {
    node: {
      id: "copyUrlAction",
      label: "Copy URL",
      kind: "action",
      description:
        "Copies the current or previewed URL.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a navigation/general action."),
      e("clipboardFallbacks", ["copies"], "Writes URL to clipboard."),
      e("miniWebBrowser", ["commands"], "Available from Mini Web Browser page actions."),
    ],
  },

  snoozeHoverBubbleAction: {
    node: {
      id: "snoozeHoverBubbleAction",
      label: "Snooze Hover Bubble",
      kind: "action",
      description:
        "Temporarily suppresses the hover eye affordance.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a general action."),
      e("hoverEyeBubble", ["snoozes", "gates"], "Suppresses hover bubble display for a period."),
      e("settingsRuntime", ["writes-to"], "Uses hover snooze settings/state."),
    ],
  },

  addEditBookmarkAction: {
    node: {
      id: "addEditBookmarkAction",
      label: "Add/Edit Bookmark",
      kind: "action",
      description:
        "Opens a bookmark dialog for saving or editing the current URL with title and note data.",
    },
    edges: [
      e("actionsMenu", ["commands"], "Available as a general action."),
      e("bookmarksCore", ["writes-to", "reads-from"], "Creates, reads, updates, or deletes bookmark records."),
      e("bookmarksManager", ["edits"], "Saved record later appears in Bookmarks Manager."),
      e("urlPicker", ["records"], "Bookmark state can influence URL picker suggestion UI."),
      e("settingsRuntime", ["gates"], "Manual bookmark buttons can be enabled or disabled."),
    ],
  },

  bookmarksCore: {
    node: {
      id: "bookmarksCore",
      label: "Bookmarks Core",
      kind: "runtime",
      description:
        "Shared bookmark runtime for manual bookmarks, activity bookmarks, metadata, labels, and URL picker integration.",
    },
    edges: [
      e("localIndexedDb", ["stores-in"], "Uses local IndexedDB database."),
      e("bookmarksManualTable", ["reads-from", "writes-to"], "Stores user-created bookmarks."),
      e("bookmarksActivityTable", ["reads-from", "writes-to"], "Stores automatic activity bookmarks."),
      e("bookmarksManager", ["coordinates"], "Supplies records to manager UI."),
      e("addEditBookmarkAction", ["coordinates"], "Handles add/edit/delete flows."),
      e("urlPicker", ["records", "suggests"], "Feeds and reflects bookmark state in suggestions."),
      e("settingsRuntime", ["gates"], "Automatic and manual bookmark behavior is setting-controlled."),
    ],
  },

  bookmarksManager: {
    node: {
      id: "bookmarksManager",
      label: "Bookmarks Manager",
      kind: "tool",
      description:
        "Tool for browsing, filtering, editing, labeling, and deleting locally stored bookmarks.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("previewWindow", ["hosts"], "Opens as an extension-hosted tool."),
      e("bookmarksCore", ["reads-from", "writes-to", "edits"], "Reads and mutates bookmark records."),
      e("bookmarksManualTable", ["reads-from", "writes-to"], "Shows manual bookmarks."),
      e("bookmarksActivityTable", ["reads-from"], "Shows activity bookmarks."),
      e("urlPicker", ["records"], "Bookmark changes can affect URL suggestion state."),
    ],
  },

  urlPicker: {
    node: {
      id: "urlPicker",
      label: "URL Picker",
      kind: "surface",
      description:
        "Shared URL/search entry and suggestion component with recent/frequent records, favicons, and inline bookmark controls.",
    },
    edges: [
      e("urlPickerSignalsTable", ["reads-from", "writes-to"], "Persists ranking, selection, and metadata signals."),
      e("bookmarksCore", ["reads-from", "writes-to"], "Shows and toggles bookmark state inline."),
      e("miniWebBrowser", ["suggests", "navigates"], "Supplies address/search suggestions."),
      e("multiBrowser", ["suggests", "navigates"], "Supplies tile URL/search suggestions."),
      e("settingsRuntime", ["configures"], "Controls suggestion behavior and inline controls."),
      e("previewUrlEligibility", ["protects"], "Normalizes and restricts opened URLs."),
    ],
  },

  richTextToMarkdown: {
    node: {
      id: "richTextToMarkdown",
      label: "Rich Text to Markdown",
      kind: "tool",
      description:
        "Local conversion tool for turning pasted rich text or HTML into clean Markdown.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("previewWindow", ["hosts"], "Usually hosted in the floating preview window."),
      e("turndownHelpers", ["converts", "depends-on"], "Uses HTML-to-Markdown conversion."),
      e("clipboardFallbacks", ["copies"], "Copies Markdown or exposes manual fallback."),
    ],
  },

  markdownToHtml: {
    node: {
      id: "markdownToHtml",
      label: "Markdown to HTML",
      kind: "tool",
      description:
        "Local conversion tool for rendering Markdown to HTML/rich output with compatibility and preview options.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("previewWindow", ["hosts"], "Hosted as an extension tool."),
      e("clipboardFallbacks", ["copies"], "Copies generated HTML or rich text."),
      e("readabilityHelpers", ["depends-on"], "Shares sanitized/rendered preview patterns with other content tools conceptually."),
    ],
  },

  notificationsAndReminders: {
    node: {
      id: "notificationsAndReminders",
      label: "Notifications and Reminders",
      kind: "tool",
      description:
        "Reminder creation, review, status grouping, snooze, completion, and delivery surface.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("previewWindow", ["hosts"], "Hosted as an extension tool."),
      e("remindersTable", ["reads-from", "writes-to"], "Persists reminder records."),
      e("alarmsApi", ["depends-on"], "Uses alarms to trigger reminder checks."),
      e("inPageReminderToasts", ["notifies"], "Due reminders can be shown as page toasts."),
      e("settingsRuntime", ["configures", "gates"], "Controlled by reminders settings and global snooze."),
    ],
  },

  inPageReminderToasts: {
    node: {
      id: "inPageReminderToasts",
      label: "In-Page Reminder Toasts",
      kind: "surface",
      description:
        "Page-level reminder delivery UI for due reminders.",
    },
    edges: [
      e("notificationsAndReminders", ["notifies"], "Displays reminder records from the reminder engine."),
      e("remindersTable", ["reads-from", "writes-to"], "Delivery and acknowledgment states are reflected in reminder records."),
      e("settingsRuntime", ["gates"], "Shown only when reminder toasts are enabled and not globally snoozed."),
      e("activeWebPage", ["shows"], "Appears on top of current browsing context."),
    ],
  },

  miniWebBrowser: {
    node: {
      id: "miniWebBrowser",
      label: "Mini Web Browser",
      kind: "tool",
      description:
        "Lightweight embedded browser for quick navigation, page actions, search, URL suggestions, and fallback external opening.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias, optionally with URL/search text."),
      e("previewWindow", ["hosts"], "Usually hosted in the floating preview window."),
      e("miniWebBrowserWrappedPreview", ["wraps"], "Used as wrapper for some preview targets."),
      e("urlPicker", ["depends-on", "suggests"], "Uses shared URL picker for address/search input."),
      e("readerModeAction", ["commands"], "Offers page reader action."),
      e("copyPageMarkdownAction", ["commands"], "Offers page Markdown copy action."),
      e("toggleContentEditableAction", ["commands"], "Offers content-editable action."),
      e("openInNewTabAction", ["commands"], "Offers open-current-page externally action."),
      e("copyMarkdownLinkAction", ["commands"], "Offers Markdown link copy action."),
      e("copyUrlAction", ["commands"], "Offers URL copy action."),
      e("addEditBookmarkAction", ["commands"], "Offers bookmark page action."),
      e("settingsRuntime", ["configures"], "Uses search template, sandbox, and popup settings."),
    ],
  },

  multiBrowser: {
    node: {
      id: "multiBrowser",
      label: "Multi Browser",
      kind: "tool",
      description:
        "Tiled multi-page browser workspace with layouts, presets, command palette, tile focus, and persisted workspace state.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools; generally full-tab."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("urlPicker", ["depends-on", "suggests"], "Uses URL/search suggestions for creating or changing tiles."),
      e("multiBrowserWorkspaceStore", ["stores-in", "reads-from", "writes-to"], "Persists workspace state."),
      e("multiBrowserFrameHotkeys", ["depends-on"], "Uses frame hotkey bridge for tile focus and shortcuts."),
      e("miniWebBrowser", ["depends-on"], "Shares embedded browser concepts and page navigation behavior."),
      e("settingsRuntime", ["gates"], "Visibility controlled by Open Tools settings."),
    ],
  },

  multiBrowserWorkspaceStore: {
    node: {
      id: "multiBrowserWorkspaceStore",
      label: "Multi Browser Workspace Store",
      kind: "storage",
      description:
        "Local document for persisted Multi Browser layout, tiles, and workspace state.",
    },
    edges: [
      e("chromeStorageLocal", ["stores-in"], "Persists the workspace document locally."),
      e("multiBrowser", ["reads-from", "writes-to"], "Restores and saves the current workspace."),
    ],
  },

  multiBrowserFrameHotkeys: {
    node: {
      id: "multiBrowserFrameHotkeys",
      label: "Multi Browser Frame Hotkeys",
      kind: "content-helper",
      description:
        "Content helper for keyboard interactions and focus restoration inside Multi Browser frames.",
    },
    edges: [
      e("multiBrowser", ["depends-on", "coordinates"], "Relays hotkeys and frame focus events."),
      e("contentScripts", ["injects-into"], "Runs as a content script in frames."),
    ],
  },

  pageScreenshot: {
    node: {
      id: "pageScreenshot",
      label: "Page Screenshot",
      kind: "tool",
      description:
        "Active-page capture tool that takes a screenshot, extracts page description, lets the user edit it, and copies Markdown or image output.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("previewWindow", ["hosts"], "Hosted as an extension tool."),
      e("backgroundServiceWorker", ["depends-on", "captures"], "Uses privileged active-tab capture runtime."),
      e("pageScreenshotDescriptionExtractor", ["extracts", "depends-on"], "Extracts readable page description."),
      e("readabilityHelpers", ["depends-on", "extracts"], "Uses Readability-style extraction."),
      e("clipboardFallbacks", ["copies"], "Copies Markdown or screenshot image with fallback state."),
      e("activeWebPage", ["captures"], "Captures the visible active page."),
      e("previewUrlEligibility", ["rejects"], "Rejects unsupported page types."),
    ],
  },

  pageScreenshotDescriptionExtractor: {
    node: {
      id: "pageScreenshotDescriptionExtractor",
      label: "Page Screenshot Description Extractor",
      kind: "content-helper",
      description:
        "Injected helper that extracts readable description HTML from the active page for Page Screenshot.",
    },
    edges: [
      e("pageScreenshot", ["extracts"], "Provides description candidate to screenshot tool."),
      e("scriptingApi", ["depends-on"], "Injected into the active tab by service worker."),
      e("readabilityHelpers", ["depends-on"], "Uses Readability extraction."),
      e("activeWebPage", ["extracts"], "Reads the active page content."),
    ],
  },

  pageContentSelect: {
    node: {
      id: "pageContentSelect",
      label: "Page Content Select",
      kind: "tool",
      description:
        "Region clipping and content-block aggregation tool for selecting visible page content, adding notes, saving drafts, copying, and exporting.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("previewWindow", ["hosts"], "Tool UI is hosted in the preview window."),
      e("backgroundServiceWorker", ["depends-on", "coordinates"], "Service worker opens, commands, finishes, and cancels selection sessions."),
      e("pageContentSelectOverlay", ["injects-into", "captures"], "Overlay is injected into the active page to select content."),
      e("pageContentSelectDraftStore", ["stores-in", "reads-from", "writes-to"], "Saves drafts and sessions."),
      e("clipboardFallbacks", ["copies"], "Copies aggregate output as rich text or plain text with fallback."),
      e("downloadsApi", ["exports"], "Downloads compiled HTML output."),
      e("activeWebPage", ["captures"], "Targets content on the active page."),
      e("previewUrlEligibility", ["rejects"], "Rejects unsupported page types before selection."),
    ],
  },

  pageContentSelectOverlay: {
    node: {
      id: "pageContentSelectOverlay",
      label: "Page Content Select Overlay",
      kind: "content-helper",
      description:
        "Injected page overlay for drawing/selecting a region and returning selected content blocks to the tool window.",
    },
    edges: [
      e("activeWebPage", ["injects-into", "captures"], "Runs on top of the active page."),
      e("pageContentSelect", ["coordinates"], "Sends selection events and pending payloads to the tool."),
      e("backgroundServiceWorker", ["coordinates"], "Session state is validated and routed by the service worker."),
      e("scriptingApi", ["depends-on"], "Injected through Chrome scripting."),
    ],
  },

  pageContentSelectDraftStore: {
    node: {
      id: "pageContentSelectDraftStore",
      label: "Page Content Select Draft Store",
      kind: "storage",
      description:
        "Local draft/session persistence for Page Content Select, including retention and size limits.",
    },
    edges: [
      e("chromeStorageLocal", ["stores-in"], "Persists drafts locally."),
      e("pageContentSelect", ["reads-from", "writes-to"], "Saves, restores, pins, deletes, and finalizes clipping sessions."),
    ],
  },

  sessionSnapshot: {
    node: {
      id: "sessionSnapshot",
      label: "Session Snapshot",
      kind: "tool",
      description:
        "Selected-tabs archive tool that captures screenshots and descriptions, builds previews, exports ZIP/HTML, and can close selected tabs.",
    },
    edges: [
      e("openToolsMenu", ["launches"], "Can be launched from Open Tools; generally full-tab."),
      e("minibuffer", ["launches"], "Can be launched by command or alias."),
      e("backgroundServiceWorker", ["depends-on", "coordinates"], "Lists tabs, captures selected tabs, and closes selected tabs."),
      e("tabsApi", ["reads-from", "captures", "closes"], "Uses tab listing and closing operations."),
      e("sessionSnapshotDescriptionExtractor", ["extracts", "depends-on"], "Extracts readable descriptions for captured tabs."),
      e("sessionSnapshotZipExport", ["exports"], "Builds downloadable archive output."),
      e("downloadsApi", ["exports"], "Downloads ZIP and HTML preview outputs."),
      e("readabilityHelpers", ["depends-on", "extracts"], "Uses readable description extraction."),
      e("previewUrlEligibility", ["rejects"], "Rejects unsupported browser-only pages."),
    ],
  },

  sessionSnapshotDescriptionExtractor: {
    node: {
      id: "sessionSnapshotDescriptionExtractor",
      label: "Session Snapshot Description Extractor",
      kind: "content-helper",
      description:
        "Content helper that extracts readable descriptions from tabs selected for session capture.",
    },
    edges: [
      e("sessionSnapshot", ["extracts"], "Provides generated notes/descriptions for tab captures."),
      e("readabilityHelpers", ["depends-on"], "Uses Readability-style extraction."),
      e("scriptingApi", ["depends-on"], "Injected into supported tabs."),
      e("activeWebPage", ["extracts"], "Reads tab page content where supported."),
    ],
  },

  sessionSnapshotZipExport: {
    node: {
      id: "sessionSnapshotZipExport",
      label: "Session Snapshot ZIP Export",
      kind: "export",
      description:
        "Generated archive containing captured tab screenshots, Markdown/HTML notes, and session metadata.",
    },
    edges: [
      e("sessionSnapshot", ["exports"], "Created from selected captured tabs."),
      e("downloadsApi", ["depends-on", "exports"], "Downloaded through the browser downloads API."),
      e("tabsApi", ["closes"], "Export can be followed by closing selected tabs."),
    ],
  },

  mediaPreview: {
    node: {
      id: "mediaPreview",
      label: "Media Preview",
      kind: "tool",
      description:
        "Focused preview for image/media targets launched from long-press media actions.",
    },
    edges: [
      e("longPressOverlay", ["launches"], "Opened from detected media targets."),
      e("previewWindow", ["hosts"], "Hosted in the shared floating window."),
      e("clipboardFallbacks", ["copies"], "Conceptually shares copy/fallback patterns for tool output where needed."),
      e("settingsRuntime", ["gates"], "Availability follows related long-press/tool visibility behavior."),
    ],
  },

  textExpander: {
    node: {
      id: "textExpander",
      label: "Text Expander",
      kind: "tool",
      description:
        "Typed text expansion feature that evaluates at commit boundaries while avoiding sensitive fields.",
    },
    edges: [
      e("activeWebPage", ["injects-into"], "Runs while the user types in page text fields."),
      e("settingsRuntime", ["gates", "configures"], "Can be enabled or disabled."),
      e("backgroundServiceWorker", ["coordinates"], "Uses background scope and runtime support."),
      e("minibuffer", ["commands"], "Shares command/minibuffer infrastructure conceptually."),
      e("previewUrlEligibility", ["protects"], "Security boundary avoids sensitive page contexts such as password fields."),
    ],
  },

  tabTrailOverlay: {
    node: {
      id: "tabTrailOverlay",
      label: "Tab Trail Overlay",
      kind: "surface",
      description:
        "Overlay feature for surfacing browsing trail/context information on the active page.",
    },
    edges: [
      e("activeWebPage", ["shows"], "Appears in page context."),
      e("contentScripts", ["coordinates"], "Runs as a content-side overlay."),
      e("backgroundServiceWorker", ["records"], "Uses background tab trail service and local store."),
      e("settingsRuntime", ["configures"], "Behavior can be controlled through settings/runtime surfaces."),
    ],
  },

  overlayBlocker: {
    node: {
      id: "overlayBlocker",
      label: "Overlay Blocker",
      kind: "content-helper",
      description:
        "Page-side helper for blocking or reducing obstructive overlays on web pages.",
    },
    edges: [
      e("activeWebPage", ["injects-into", "protects"], "Operates directly against page overlays."),
      e("settingsRuntime", ["gates", "configures"], "Controlled by overlay blocking settings."),
      e("contentScripts", ["coordinates"], "Runs as part of injected page-side behavior."),
    ],
  },

  readabilityHelpers: {
    node: {
      id: "readabilityHelpers",
      label: "Readability Helpers",
      kind: "content-helper",
      description:
        "Vendored and injected readability extraction support used by reader mode, Markdown copy, screenshots, and session snapshots.",
    },
    edges: [
      e("readerModeAction", ["extracts"], "Extracts readable document content."),
      e("copyPageMarkdownAction", ["extracts"], "Extracts content before Markdown conversion."),
      e("pageScreenshotDescriptionExtractor", ["extracts"], "Builds page description candidates."),
      e("sessionSnapshotDescriptionExtractor", ["extracts"], "Builds tab description candidates."),
      e("turndownHelpers", ["depends-on"], "Often feeds HTML into Markdown conversion."),
    ],
  },

  turndownHelpers: {
    node: {
      id: "turndownHelpers",
      label: "Turndown Helpers",
      kind: "content-helper",
      description:
        "HTML-to-Markdown conversion helpers used by copy and conversion flows.",
    },
    edges: [
      e("copyPageMarkdownAction", ["converts"], "Converts extracted page HTML into Markdown."),
      e("richTextToMarkdown", ["converts"], "Converts pasted rich text/HTML into Markdown."),
      e("sessionSnapshot", ["converts"], "Contributes to generated notes/Markdown output."),
      e("pageScreenshot", ["converts"], "Contributes to Markdown snippet generation."),
      e("clipboardFallbacks", ["copies"], "Converted output is usually copied or exposed for manual copy."),
    ],
  },

  clipboardFallbacks: {
    node: {
      id: "clipboardFallbacks",
      label: "Clipboard Fallbacks",
      kind: "content-helper",
      description:
        "Shared product pattern for copy actions that can fall back to manual copy panels or status messages when browser clipboard writes fail.",
    },
    edges: [
      e("copyPageMarkdownAction", ["copies"], "Copies Markdown output."),
      e("copyMarkdownLinkAction", ["copies"], "Copies Markdown link output."),
      e("copyUrlAction", ["copies"], "Copies URL output."),
      e("richTextToMarkdown", ["copies"], "Copies generated Markdown."),
      e("markdownToHtml", ["copies"], "Copies HTML or rich output."),
      e("pageScreenshot", ["copies"], "Copies description Markdown or screenshot image."),
      e("pageContentSelect", ["copies"], "Copies rich text or plain text aggregate content."),
      e("longPressOverlay", ["copies"], "Copies nearby visible text."),
    ],
  },

  downloadsApi: {
    node: {
      id: "downloadsApi",
      label: "Chrome Downloads API",
      kind: "runtime",
      description:
        "Browser API used for generated files and archives.",
    },
    edges: [
      e("pageContentSelect", ["exports"], "Downloads compiled selected-content HTML."),
      e("sessionSnapshotZipExport", ["exports"], "Downloads ZIP and HTML preview outputs."),
      e("backgroundServiceWorker", ["depends-on"], "Privileged API access lives in the service worker."),
    ],
  },

  tabsApi: {
    node: {
      id: "tabsApi",
      label: "Chrome Tabs API",
      kind: "runtime",
      description:
        "Browser API used for active tab lookup, URL opening, session tab listing, capture metadata, and closing tabs.",
    },
    edges: [
      e("openInNewTabAction", ["opens"], "Opens HTTP(S) URLs in regular browser tabs."),
      e("miniWebBrowser", ["opens"], "Fallback external opening for embedded browser pages."),
      e("sessionSnapshot", ["captures", "closes"], "Lists and closes selected tabs."),
      e("pageScreenshot", ["captures"], "Finds active tab metadata for capture."),
      e("backgroundServiceWorker", ["depends-on"], "Used through privileged runtime code."),
    ],
  },

  alarmsApi: {
    node: {
      id: "alarmsApi",
      label: "Chrome Alarms API",
      kind: "runtime",
      description:
        "Browser API used for scheduled reminder checks.",
    },
    edges: [
      e("notificationsAndReminders", ["notifies"], "Triggers due reminder dispatch."),
      e("remindersTable", ["reads-from"], "Next alarm time is derived from reminder records."),
      e("backgroundServiceWorker", ["depends-on"], "Alarm handling occurs in the service worker."),
    ],
  },

  scriptingApi: {
    node: {
      id: "scriptingApi",
      label: "Chrome Scripting API",
      kind: "runtime",
      description:
        "Browser API used to inject helper scripts into supported active tabs.",
    },
    edges: [
      e("pageScreenshotDescriptionExtractor", ["injects-into"], "Injects screenshot description helper."),
      e("pageContentSelectOverlay", ["injects-into"], "Injects page selection overlay."),
      e("sessionSnapshotDescriptionExtractor", ["injects-into"], "Injects session description helper."),
      e("backgroundServiceWorker", ["depends-on"], "Injection requests are privileged service worker work."),
    ],
  },

  declarativeNetRequestApi: {
    node: {
      id: "declarativeNetRequestApi",
      label: "Chrome Declarative Net Request API",
      kind: "runtime",
      description:
        "Browser API used by the optional framing-header bypass feature.",
    },
    edges: [
      e("embeddedNavigationHeaderBypass", ["bypasses"], "Removes frame-blocking response headers for temporary embedded-navigation rules."),
      e("settingsRuntime", ["gates"], "Only used when header bypass setting permits it."),
      e("directIframePreview", ["bypasses"], "Affects direct iframe preview loadability."),
    ],
  },
};
```

---

B00 Reading the graph

---

The graph is directed. For example, `hoverEyeBubble -> linkPreviewController` means the hover eye bubble sends preview intent into the controller. `linkPreviewController -> previewWindow` means the controller opens or updates the floating preview surface. `previewWindow -> miniWebBrowserWrappedPreview` means the preview window can host a wrapped browser preview. The direction is "user/product flow direction", not necessarily TypeScript import direction.

The most important hub nodes are `previewWindow`, `backgroundServiceWorker`, `settingsRuntime`, `minibuffer`, `openToolsMenu`, `bookmarksCore`, and `urlPicker`. The project description confirms that preview, Actions, Open Tools, iframe helpers, bookmarks, reminders, settings, URL picker signals, page screenshot, page content select, and session snapshot are connected through these shared runtime and UI surfaces. 

---

C00 Main product-level paths

---

The dominant path is:

```ts
activeWebPage
  -> hoverEyeBubble | longPressOverlay
  -> linkPreviewController
  -> previewUrlEligibility
  -> previewWindow
  -> directIframePreview | miniWebBrowserWrappedPreview
  -> actionsMenu | openToolsMenu | minibuffer
```

The local tools path is:

```ts
previewWindow | openToolsMenu | minibuffer
  -> richTextToMarkdown
  -> markdownToHtml
  -> notificationsAndReminders
  -> miniWebBrowser
  -> bookmarksManager
  -> pageScreenshot
  -> pageContentSelect
  -> mediaPreview
```

The larger workspace path is:

```ts
openToolsMenu | minibuffer
  -> multiBrowser | sessionSnapshot
  -> urlPicker | tabsApi | downloadsApi | local storage
```

The persistence path is:

```ts
settingsRuntime -> chromeStorageLocal
bookmarksCore -> localIndexedDb -> BookmarksManual | BookmarksActivity
notificationsAndReminders -> localIndexedDb -> Reminders
urlPicker -> localIndexedDb -> UrlPickerSignals
multiBrowser -> chromeStorageLocal
pageContentSelect -> chromeStorageLocal
```

The security boundary path is:

```ts
previewUrlEligibility
  -> rejects unsupported pages
  -> gates hover and long-press preview

settingsRuntime
  -> gates embeddedNavigationHeaderBypass

embeddedNavigationHeaderBypass
  -> declarativeNetRequestApi
  -> directIframePreview
```


