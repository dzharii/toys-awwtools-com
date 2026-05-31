(() => {
  "use strict";

  const RAW_NODES = [
  {
    "id": "eye05",
    "label": "eye05",
    "kind": "product",
    "description": "Local-first Chrome productivity extension for staying in flow while previewing links, collecting page context, managing bookmarks, and using focused local tools."
  },
  {
    "id": "activeWebPage",
    "label": "Active Web Page",
    "kind": "page-context",
    "description": "The page the user is currently reading, browsing, clipping, previewing from, or acting on."
  },
  {
    "id": "contentScripts",
    "label": "Content Scripts",
    "kind": "runtime",
    "description": "Injected page-side runtime for preview UI, long press, text expansion, iframe helpers, tab trail, and page extraction helpers."
  },
  {
    "id": "backgroundServiceWorker",
    "label": "Background Service Worker",
    "kind": "runtime",
    "description": "Privileged MV3 runtime for storage, tabs, alarms, screenshots, DNR, tool coordination, and local persistence."
  },
  {
    "id": "settingsRuntime",
    "label": "Settings Runtime",
    "kind": "setting",
    "description": "Schema-versioned settings model that builds effective settings from defaults plus validated user overrides."
  },
  {
    "id": "settingsPage",
    "label": "Settings Page",
    "kind": "surface",
    "description": "User-facing controls for changing behavior, resetting settings, and managing feature visibility."
  },
  {
    "id": "chromeStorageLocal",
    "label": "chrome.storage.local",
    "kind": "storage",
    "description": "Local browser storage for settings and feature documents."
  },
  {
    "id": "localIndexedDb",
    "label": "Local IndexedDB",
    "kind": "storage",
    "description": "Dexie-backed local database for bookmarks, reminders, and URL picker signals."
  },
  {
    "id": "bookmarksManualTable",
    "label": "BookmarksManual",
    "kind": "storage",
    "description": "Local table for user-created bookmarks."
  },
  {
    "id": "bookmarksActivityTable",
    "label": "BookmarksActivity",
    "kind": "storage",
    "description": "Local table for automatically collected page activity bookmarks."
  },
  {
    "id": "remindersTable",
    "label": "Reminders",
    "kind": "storage",
    "description": "Local table for scheduled, delivered, snoozed, completed, and acknowledged reminders."
  },
  {
    "id": "urlPickerSignalsTable",
    "label": "UrlPickerSignals",
    "kind": "storage",
    "description": "Local table for URL picker selection, ranking, and metadata signals."
  },
  {
    "id": "hoverEyeBubble",
    "label": "Hover Eye Bubble",
    "kind": "entrypoint",
    "description": "Delayed hover affordance on eligible links that opens preview only after deliberate user action."
  },
  {
    "id": "longPressOverlay",
    "label": "Long-Press Overlay",
    "kind": "entrypoint",
    "description": "Right-button hold overlay for copying nearby visible text, previewing HTTPS links, opening new tabs, or previewing media."
  },
  {
    "id": "linkPreviewController",
    "label": "Link Preview Controller",
    "kind": "runtime",
    "description": "Coordinates preview requests, interaction policy, target resolution, and hosting-plan selection."
  },
  {
    "id": "previewUrlEligibility",
    "label": "Preview URL Eligibility",
    "kind": "security",
    "description": "Policy layer that normalizes link targets and admits only supported HTTP(S)/HTTPS preview targets."
  },
  {
    "id": "previewWindow",
    "label": "Floating Preview Window",
    "kind": "surface",
    "description": "Main floating surface that can host web previews, Mini Web Browser wrapped pages, Actions, and extension-hosted tools."
  },
  {
    "id": "directIframePreview",
    "label": "Direct Iframe Preview",
    "kind": "surface",
    "description": "Hosting mode where a supported web target is loaded directly in a preview iframe."
  },
  {
    "id": "miniWebBrowserWrappedPreview",
    "label": "Mini Web Browser Wrapped Preview",
    "kind": "surface",
    "description": "Hosting mode where the preview target is opened through the Mini Web Browser wrapper instead of a raw iframe."
  },
  {
    "id": "embeddedNavigationHeaderBypass",
    "label": "Embedded Navigation Header Bypass",
    "kind": "security",
    "description": "Optional DNR-based feature that removes frame-blocking response headers for sub-frame preview navigation."
  },
  {
    "id": "actionsMenu",
    "label": "Actions Menu",
    "kind": "surface",
    "description": "Grouped menu of parent-page and preview-frame actions, organized around content, navigation, and general actions."
  },
  {
    "id": "openToolsMenu",
    "label": "Open Tools Menu",
    "kind": "surface",
    "description": "Tool launcher for extension-hosted local workspaces."
  },
  {
    "id": "minibuffer",
    "label": "Minibuffer",
    "kind": "surface",
    "description": "Command input surface for actions, tools, utilities, aliases, parameters, and command discovery."
  },
  {
    "id": "minibufferHelp",
    "label": "Minibuffer Help",
    "kind": "tool",
    "description": "Built-in command guide that explains tool commands, aliases, examples, and discovery behavior."
  },
  {
    "id": "readerModeAction",
    "label": "Reader Mode",
    "kind": "action",
    "description": "Transforms readable page content into a cleaner reading document."
  },
  {
    "id": "copyPageMarkdownAction",
    "label": "Copy Page Markdown",
    "kind": "action",
    "description": "Extracts readable page content and copies it as Markdown."
  },
  {
    "id": "toggleContentEditableAction",
    "label": "Toggle Content Editable",
    "kind": "action",
    "description": "Temporarily makes page content editable/selectable for manual extraction or adjustment."
  },
  {
    "id": "openInNewTabAction",
    "label": "Open in New Tab",
    "kind": "action",
    "description": "Opens the current, previewed, or selected HTTP(S) URL in a regular browser tab."
  },
  {
    "id": "copyMarkdownLinkAction",
    "label": "Copy Markdown Link",
    "kind": "action",
    "description": "Copies the current title and URL as a Markdown link."
  },
  {
    "id": "copyUrlAction",
    "label": "Copy URL",
    "kind": "action",
    "description": "Copies the current or previewed URL."
  },
  {
    "id": "snoozeHoverBubbleAction",
    "label": "Snooze Hover Bubble",
    "kind": "action",
    "description": "Temporarily suppresses the hover eye affordance."
  },
  {
    "id": "addEditBookmarkAction",
    "label": "Add/Edit Bookmark",
    "kind": "action",
    "description": "Opens a bookmark dialog for saving or editing the current URL with title and note data."
  },
  {
    "id": "bookmarksCore",
    "label": "Bookmarks Core",
    "kind": "runtime",
    "description": "Shared bookmark runtime for manual bookmarks, activity bookmarks, metadata, labels, and URL picker integration."
  },
  {
    "id": "bookmarksManager",
    "label": "Bookmarks Manager",
    "kind": "tool",
    "description": "Tool for browsing, filtering, editing, labeling, and deleting locally stored bookmarks."
  },
  {
    "id": "urlPicker",
    "label": "URL Picker",
    "kind": "surface",
    "description": "Shared URL/search entry and suggestion component with recent/frequent records, favicons, and inline bookmark controls."
  },
  {
    "id": "richTextToMarkdown",
    "label": "Rich Text to Markdown",
    "kind": "tool",
    "description": "Local conversion tool for turning pasted rich text or HTML into clean Markdown."
  },
  {
    "id": "markdownToHtml",
    "label": "Markdown to HTML",
    "kind": "tool",
    "description": "Local conversion tool for rendering Markdown to HTML/rich output with compatibility and preview options."
  },
  {
    "id": "notificationsAndReminders",
    "label": "Notifications and Reminders",
    "kind": "tool",
    "description": "Reminder creation, review, status grouping, snooze, completion, and delivery surface."
  },
  {
    "id": "inPageReminderToasts",
    "label": "In-Page Reminder Toasts",
    "kind": "surface",
    "description": "Page-level reminder delivery UI for due reminders."
  },
  {
    "id": "miniWebBrowser",
    "label": "Mini Web Browser",
    "kind": "tool",
    "description": "Lightweight embedded browser for quick navigation, page actions, search, URL suggestions, and fallback external opening."
  },
  {
    "id": "multiBrowser",
    "label": "Multi Browser",
    "kind": "tool",
    "description": "Tiled multi-page browser workspace with layouts, presets, command palette, tile focus, and persisted workspace state."
  },
  {
    "id": "multiBrowserWorkspaceStore",
    "label": "Multi Browser Workspace Store",
    "kind": "storage",
    "description": "Local document for persisted Multi Browser layout, tiles, and workspace state."
  },
  {
    "id": "multiBrowserFrameHotkeys",
    "label": "Multi Browser Frame Hotkeys",
    "kind": "content-helper",
    "description": "Content helper for keyboard interactions and focus restoration inside Multi Browser frames."
  },
  {
    "id": "pageScreenshot",
    "label": "Page Screenshot",
    "kind": "tool",
    "description": "Active-page capture tool that takes a screenshot, extracts page description, lets the user edit it, and copies Markdown or image output."
  },
  {
    "id": "pageScreenshotDescriptionExtractor",
    "label": "Page Screenshot Description Extractor",
    "kind": "content-helper",
    "description": "Injected helper that extracts readable description HTML from the active page for Page Screenshot."
  },
  {
    "id": "pageContentSelect",
    "label": "Page Content Select",
    "kind": "tool",
    "description": "Region clipping and content-block aggregation tool for selecting visible page content, adding notes, saving drafts, copying, and exporting."
  },
  {
    "id": "pageContentSelectOverlay",
    "label": "Page Content Select Overlay",
    "kind": "content-helper",
    "description": "Injected page overlay for drawing/selecting a region and returning selected content blocks to the tool window."
  },
  {
    "id": "pageContentSelectDraftStore",
    "label": "Page Content Select Draft Store",
    "kind": "storage",
    "description": "Local draft/session persistence for Page Content Select."
  },
  {
    "id": "sessionSnapshot",
    "label": "Session Snapshot",
    "kind": "tool",
    "description": "Selected-tabs archive tool that captures screenshots and descriptions, builds previews, exports ZIP/HTML, and can close selected tabs."
  },
  {
    "id": "sessionSnapshotDescriptionExtractor",
    "label": "Session Snapshot Description Extractor",
    "kind": "content-helper",
    "description": "Content helper that extracts readable descriptions from tabs selected for session capture."
  },
  {
    "id": "sessionSnapshotZipExport",
    "label": "Session Snapshot ZIP Export",
    "kind": "export",
    "description": "Generated archive containing captured tab screenshots, Markdown/HTML notes, and session metadata."
  },
  {
    "id": "mediaPreview",
    "label": "Media Preview",
    "kind": "tool",
    "description": "Focused preview for image/media targets launched from long-press media actions."
  },
  {
    "id": "textExpander",
    "label": "Text Expander",
    "kind": "tool",
    "description": "Typed text expansion feature that evaluates at commit boundaries while avoiding sensitive fields."
  },
  {
    "id": "tabTrailOverlay",
    "label": "Tab Trail Overlay",
    "kind": "surface",
    "description": "Overlay feature for surfacing browsing trail/context information on the active page."
  },
  {
    "id": "overlayBlocker",
    "label": "Overlay Blocker",
    "kind": "content-helper",
    "description": "Page-side helper for blocking or reducing obstructive overlays on web pages."
  },
  {
    "id": "readabilityHelpers",
    "label": "Readability Helpers",
    "kind": "content-helper",
    "description": "Vendored and injected readability extraction support used by reader mode, Markdown copy, screenshots, and session snapshots."
  },
  {
    "id": "turndownHelpers",
    "label": "Turndown Helpers",
    "kind": "content-helper",
    "description": "HTML-to-Markdown conversion helpers used by copy and conversion flows."
  },
  {
    "id": "clipboardFallbacks",
    "label": "Clipboard Fallbacks",
    "kind": "content-helper",
    "description": "Shared product pattern for copy actions that can fall back to manual copy panels or status messages when browser clipboard writes fail."
  },
  {
    "id": "downloadsApi",
    "label": "Chrome Downloads API",
    "kind": "runtime",
    "description": "Browser API used for generated files and archives."
  },
  {
    "id": "tabsApi",
    "label": "Chrome Tabs API",
    "kind": "runtime",
    "description": "Browser API used for active tab lookup, URL opening, session tab listing, capture metadata, and closing tabs."
  },
  {
    "id": "alarmsApi",
    "label": "Chrome Alarms API",
    "kind": "runtime",
    "description": "Browser API used for scheduled reminder checks."
  },
  {
    "id": "scriptingApi",
    "label": "Chrome Scripting API",
    "kind": "runtime",
    "description": "Browser API used to inject helper scripts into supported active tabs."
  },
  {
    "id": "declarativeNetRequestApi",
    "label": "Chrome Declarative Net Request API",
    "kind": "runtime",
    "description": "Browser API used by the optional framing-header bypass feature."
  }
];

  const RAW_LINKS = [
  {
    "id": "eye05->activeWebPage:injects-into",
    "source": "eye05",
    "target": "activeWebPage",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Runs inside ordinary browsing through content scripts."
  },
  {
    "id": "eye05->contentScripts:contains",
    "source": "eye05",
    "target": "contentScripts",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Uses content-side scripts as the user-facing page layer."
  },
  {
    "id": "eye05->backgroundServiceWorker:contains",
    "source": "eye05",
    "target": "backgroundServiceWorker",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Uses privileged MV3 service worker for storage, tabs, alarms, screenshots, DNR, and coordination."
  },
  {
    "id": "eye05->settingsRuntime:contains+configures",
    "source": "eye05",
    "target": "settingsRuntime",
    "tags": [
      "contains",
      "configures"
    ],
    "label": "contains, configures",
    "meaning": "Centralizes behavior flags and user preferences."
  },
  {
    "id": "eye05->linkPreviewController:contains",
    "source": "eye05",
    "target": "linkPreviewController",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Owns the original link-triage workflow."
  },
  {
    "id": "eye05->previewWindow:contains+shows",
    "source": "eye05",
    "target": "previewWindow",
    "tags": [
      "contains",
      "shows"
    ],
    "label": "contains, shows",
    "meaning": "Provides the main floating work surface."
  },
  {
    "id": "eye05->actionsMenu:contains+commands",
    "source": "eye05",
    "target": "actionsMenu",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Provides page-level actions from preview and minibuffer surfaces."
  },
  {
    "id": "eye05->openToolsMenu:contains+launches",
    "source": "eye05",
    "target": "openToolsMenu",
    "tags": [
      "contains",
      "launches"
    ],
    "label": "contains, launches",
    "meaning": "Provides entry to extension-hosted local tools."
  },
  {
    "id": "eye05->minibuffer:contains+commands",
    "source": "eye05",
    "target": "minibuffer",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Provides command-driven access to actions and tools."
  },
  {
    "id": "eye05->bookmarksCore:contains+stores-in",
    "source": "eye05",
    "target": "bookmarksCore",
    "tags": [
      "contains",
      "stores-in"
    ],
    "label": "contains, stores-in",
    "meaning": "Stores saved links and activity links locally."
  },
  {
    "id": "eye05->notificationsAndReminders:contains+notifies",
    "source": "eye05",
    "target": "notificationsAndReminders",
    "tags": [
      "contains",
      "notifies"
    ],
    "label": "contains, notifies",
    "meaning": "Manages scheduled user reminders."
  },
  {
    "id": "eye05->urlPicker:contains+suggests",
    "source": "eye05",
    "target": "urlPicker",
    "tags": [
      "contains",
      "suggests"
    ],
    "label": "contains, suggests",
    "meaning": "Provides URL/search suggestions and bookmark-aware navigation."
  },
  {
    "id": "eye05->textExpander:contains",
    "source": "eye05",
    "target": "textExpander",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Expands text commands while typing on pages."
  },
  {
    "id": "eye05->tabTrailOverlay:contains+records",
    "source": "eye05",
    "target": "tabTrailOverlay",
    "tags": [
      "contains",
      "records"
    ],
    "label": "contains, records",
    "meaning": "Shows page/tab trail context in the browsing surface."
  },
  {
    "id": "activeWebPage->hoverEyeBubble:shows",
    "source": "activeWebPage",
    "target": "hoverEyeBubble",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Eligible links can reveal the eye preview affordance after hover delay."
  },
  {
    "id": "activeWebPage->longPressOverlay:shows",
    "source": "activeWebPage",
    "target": "longPressOverlay",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Right-button hold can reveal copy, preview, new-tab, or media-preview options."
  },
  {
    "id": "activeWebPage->previewWindow:shows",
    "source": "activeWebPage",
    "target": "previewWindow",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Floating preview and tool windows appear over the current page."
  },
  {
    "id": "activeWebPage->minibuffer:shows+commands",
    "source": "activeWebPage",
    "target": "minibuffer",
    "tags": [
      "shows",
      "commands"
    ],
    "label": "shows, commands",
    "meaning": "Command entry can be opened on top of the current page."
  },
  {
    "id": "activeWebPage->textExpander:depends-on",
    "source": "activeWebPage",
    "target": "textExpander",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Typed text on the page is the input stream for expansion."
  },
  {
    "id": "activeWebPage->pageScreenshot:captures",
    "source": "activeWebPage",
    "target": "pageScreenshot",
    "tags": [
      "captures"
    ],
    "label": "captures",
    "meaning": "The visible active tab is the screenshot target."
  },
  {
    "id": "activeWebPage->pageContentSelectOverlay:injects-into",
    "source": "activeWebPage",
    "target": "pageContentSelectOverlay",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Selection overlay is injected into the active page for region clipping."
  },
  {
    "id": "activeWebPage->sessionSnapshot:captures",
    "source": "activeWebPage",
    "target": "sessionSnapshot",
    "tags": [
      "captures"
    ],
    "label": "captures",
    "meaning": "Current-window tabs are candidates for session capture."
  },
  {
    "id": "activeWebPage->tabTrailOverlay:shows",
    "source": "activeWebPage",
    "target": "tabTrailOverlay",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Tab trail context appears inside the browsing context."
  },
  {
    "id": "activeWebPage->overlayBlocker:protects",
    "source": "activeWebPage",
    "target": "overlayBlocker",
    "tags": [
      "protects"
    ],
    "label": "protects",
    "meaning": "Overlay blocker operates against obstructive page overlays."
  },
  {
    "id": "contentScripts->hoverEyeBubble:coordinates",
    "source": "contentScripts",
    "target": "hoverEyeBubble",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Owns hover affordance behavior on links."
  },
  {
    "id": "contentScripts->longPressOverlay:coordinates",
    "source": "contentScripts",
    "target": "longPressOverlay",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Owns deliberate right-button-hold behavior."
  },
  {
    "id": "contentScripts->previewWindow:coordinates+shows",
    "source": "contentScripts",
    "target": "previewWindow",
    "tags": [
      "coordinates",
      "shows"
    ],
    "label": "coordinates, shows",
    "meaning": "Creates and controls the floating preview window."
  },
  {
    "id": "contentScripts->actionsMenu:coordinates",
    "source": "contentScripts",
    "target": "actionsMenu",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Executes parent-page actions and routes frame actions."
  },
  {
    "id": "contentScripts->openToolsMenu:coordinates",
    "source": "contentScripts",
    "target": "openToolsMenu",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Launches extension-hosted tools from the page surface."
  },
  {
    "id": "contentScripts->minibuffer:coordinates",
    "source": "contentScripts",
    "target": "minibuffer",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Hosts command input and command suggestions."
  },
  {
    "id": "contentScripts->textExpander:coordinates",
    "source": "contentScripts",
    "target": "textExpander",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Runs typing-triggered expansion logic."
  },
  {
    "id": "contentScripts->tabTrailOverlay:coordinates",
    "source": "contentScripts",
    "target": "tabTrailOverlay",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Renders tab trail overlay UI."
  },
  {
    "id": "contentScripts->readabilityHelpers:depends-on",
    "source": "contentScripts",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Loads reader-mode and description-extraction helpers."
  },
  {
    "id": "contentScripts->turndownHelpers:depends-on",
    "source": "contentScripts",
    "target": "turndownHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Loads Markdown conversion helpers in relevant frames/tools."
  },
  {
    "id": "contentScripts->settingsRuntime:reads-from",
    "source": "contentScripts",
    "target": "settingsRuntime",
    "tags": [
      "reads-from"
    ],
    "label": "reads-from",
    "meaning": "Reads effective user settings from the settings runtime."
  },
  {
    "id": "contentScripts->backgroundServiceWorker:depends-on",
    "source": "contentScripts",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Sends runtime messages for privileged operations."
  },
  {
    "id": "backgroundServiceWorker->localIndexedDb:stores-in+reads-from+writes-to",
    "source": "backgroundServiceWorker",
    "target": "localIndexedDb",
    "tags": [
      "stores-in",
      "reads-from",
      "writes-to"
    ],
    "label": "stores-in, reads-from, writes-to",
    "meaning": "Persists bookmarks, reminders, and URL picker signals."
  },
  {
    "id": "backgroundServiceWorker->chromeStorageLocal:reads-from+writes-to",
    "source": "backgroundServiceWorker",
    "target": "chromeStorageLocal",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Stores settings and local documents."
  },
  {
    "id": "backgroundServiceWorker->declarativeNetRequestApi:depends-on",
    "source": "backgroundServiceWorker",
    "target": "declarativeNetRequestApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Creates or removes temporary framing-header bypass rules."
  },
  {
    "id": "backgroundServiceWorker->tabsApi:depends-on",
    "source": "backgroundServiceWorker",
    "target": "tabsApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Opens tabs, lists tabs, captures tab metadata, and closes selected tabs."
  },
  {
    "id": "backgroundServiceWorker->alarmsApi:depends-on",
    "source": "backgroundServiceWorker",
    "target": "alarmsApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Schedules reminder delivery checks."
  },
  {
    "id": "backgroundServiceWorker->scriptingApi:depends-on",
    "source": "backgroundServiceWorker",
    "target": "scriptingApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Injects screenshot and page content selection helpers."
  },
  {
    "id": "backgroundServiceWorker->downloadsApi:depends-on",
    "source": "backgroundServiceWorker",
    "target": "downloadsApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Downloads generated archives or HTML outputs."
  },
  {
    "id": "backgroundServiceWorker->bookmarksCore:coordinates",
    "source": "backgroundServiceWorker",
    "target": "bookmarksCore",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Implements bookmark CRUD and activity recording."
  },
  {
    "id": "backgroundServiceWorker->notificationsAndReminders:coordinates",
    "source": "backgroundServiceWorker",
    "target": "notificationsAndReminders",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Implements reminder creation, delivery, snooze, completion, and stats."
  },
  {
    "id": "backgroundServiceWorker->pageScreenshot:coordinates+captures",
    "source": "backgroundServiceWorker",
    "target": "pageScreenshot",
    "tags": [
      "coordinates",
      "captures"
    ],
    "label": "coordinates, captures",
    "meaning": "Captures visible active tab and extracts description."
  },
  {
    "id": "backgroundServiceWorker->pageContentSelect:coordinates",
    "source": "backgroundServiceWorker",
    "target": "pageContentSelect",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Opens, commands, finishes, and cancels page selection sessions."
  },
  {
    "id": "backgroundServiceWorker->sessionSnapshot:coordinates+captures",
    "source": "backgroundServiceWorker",
    "target": "sessionSnapshot",
    "tags": [
      "coordinates",
      "captures"
    ],
    "label": "coordinates, captures",
    "meaning": "Lists tabs, captures selected tabs, and closes selected tabs."
  },
  {
    "id": "backgroundServiceWorker->miniWebBrowser:coordinates+navigates",
    "source": "backgroundServiceWorker",
    "target": "miniWebBrowser",
    "tags": [
      "coordinates",
      "navigates"
    ],
    "label": "coordinates, navigates",
    "meaning": "Safely opens HTTP(S) URLs in new tabs when needed."
  },
  {
    "id": "settingsRuntime->chromeStorageLocal:stores-in+reads-from+writes-to",
    "source": "settingsRuntime",
    "target": "chromeStorageLocal",
    "tags": [
      "stores-in",
      "reads-from",
      "writes-to"
    ],
    "label": "stores-in, reads-from, writes-to",
    "meaning": "Persists the settings document under the local settings key."
  },
  {
    "id": "settingsRuntime->settingsPage:configures",
    "source": "settingsRuntime",
    "target": "settingsPage",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Provides data and mutation APIs to the settings UI."
  },
  {
    "id": "settingsRuntime->hoverEyeBubble:configures+gates",
    "source": "settingsRuntime",
    "target": "hoverEyeBubble",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls whether hover preview is enabled and delayed/snoozed."
  },
  {
    "id": "settingsRuntime->linkPreviewController:configures+gates",
    "source": "settingsRuntime",
    "target": "linkPreviewController",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls whether opening interaction is eye-only, long-press-only, or both."
  },
  {
    "id": "settingsRuntime->previewWindow:configures",
    "source": "settingsRuntime",
    "target": "previewWindow",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Controls default preview size and title behavior."
  },
  {
    "id": "settingsRuntime->openToolsMenu:configures+gates",
    "source": "settingsRuntime",
    "target": "openToolsMenu",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls which Open Tools appear."
  },
  {
    "id": "settingsRuntime->longPressOverlay:configures+gates",
    "source": "settingsRuntime",
    "target": "longPressOverlay",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls long-press copy and link actions."
  },
  {
    "id": "settingsRuntime->bookmarksCore:configures+gates",
    "source": "settingsRuntime",
    "target": "bookmarksCore",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls manual bookmark buttons and automatic activity collection."
  },
  {
    "id": "settingsRuntime->embeddedNavigationHeaderBypass:configures+gates",
    "source": "settingsRuntime",
    "target": "embeddedNavigationHeaderBypass",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls whether framing-header bypass is allowed."
  },
  {
    "id": "settingsRuntime->notificationsAndReminders:configures+gates",
    "source": "settingsRuntime",
    "target": "notificationsAndReminders",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls reminders, toasts, polling, and global snooze."
  },
  {
    "id": "settingsRuntime->urlPicker:configures",
    "source": "settingsRuntime",
    "target": "urlPicker",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Controls suggestions, history suggestions, inline bookmark controls, empty-input suggestions, and favicons."
  },
  {
    "id": "settingsRuntime->miniWebBrowser:configures",
    "source": "settingsRuntime",
    "target": "miniWebBrowser",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Controls search template, sandbox mode, and popup behavior."
  },
  {
    "id": "settingsRuntime->textExpander:configures+gates",
    "source": "settingsRuntime",
    "target": "textExpander",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls whether text expansion runs."
  },
  {
    "id": "settingsRuntime->overlayBlocker:configures+gates",
    "source": "settingsRuntime",
    "target": "overlayBlocker",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controls page overlay blocking behavior."
  },
  {
    "id": "settingsPage->settingsRuntime:reads-from+writes-to",
    "source": "settingsPage",
    "target": "settingsRuntime",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Renders and mutates effective settings."
  },
  {
    "id": "settingsPage->chromeStorageLocal:writes-to",
    "source": "settingsPage",
    "target": "chromeStorageLocal",
    "tags": [
      "writes-to"
    ],
    "label": "writes-to",
    "meaning": "Persists user overrides through the settings runtime."
  },
  {
    "id": "settingsPage->openToolsMenu:configures",
    "source": "settingsPage",
    "target": "openToolsMenu",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Lets the user hide or show specific Open Tools."
  },
  {
    "id": "chromeStorageLocal->settingsRuntime:stores-in",
    "source": "chromeStorageLocal",
    "target": "settingsRuntime",
    "tags": [
      "stores-in"
    ],
    "label": "stores-in",
    "meaning": "Stores the settings document."
  },
  {
    "id": "chromeStorageLocal->multiBrowserWorkspaceStore:stores-in",
    "source": "chromeStorageLocal",
    "target": "multiBrowserWorkspaceStore",
    "tags": [
      "stores-in"
    ],
    "label": "stores-in",
    "meaning": "Stores the Multi Browser workspace document."
  },
  {
    "id": "chromeStorageLocal->pageContentSelectDraftStore:stores-in",
    "source": "chromeStorageLocal",
    "target": "pageContentSelectDraftStore",
    "tags": [
      "stores-in"
    ],
    "label": "stores-in",
    "meaning": "Stores Page Content Select drafts and saved sessions."
  },
  {
    "id": "localIndexedDb->bookmarksManualTable:contains",
    "source": "localIndexedDb",
    "target": "bookmarksManualTable",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Contains manual bookmark records."
  },
  {
    "id": "localIndexedDb->bookmarksActivityTable:contains",
    "source": "localIndexedDb",
    "target": "bookmarksActivityTable",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Contains automatic activity bookmark records."
  },
  {
    "id": "localIndexedDb->remindersTable:contains",
    "source": "localIndexedDb",
    "target": "remindersTable",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Contains reminder records."
  },
  {
    "id": "localIndexedDb->urlPickerSignalsTable:contains",
    "source": "localIndexedDb",
    "target": "urlPickerSignalsTable",
    "tags": [
      "contains"
    ],
    "label": "contains",
    "meaning": "Contains URL picker ranking and selection signals."
  },
  {
    "id": "localIndexedDb->bookmarksCore:reads-from+writes-to",
    "source": "localIndexedDb",
    "target": "bookmarksCore",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Persists bookmark data."
  },
  {
    "id": "localIndexedDb->notificationsAndReminders:reads-from+writes-to",
    "source": "localIndexedDb",
    "target": "notificationsAndReminders",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Persists reminder data."
  },
  {
    "id": "localIndexedDb->urlPicker:reads-from+writes-to",
    "source": "localIndexedDb",
    "target": "urlPicker",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Persists suggestion and ranking signals."
  },
  {
    "id": "bookmarksManualTable->bookmarksCore:reads-from+writes-to",
    "source": "bookmarksManualTable",
    "target": "bookmarksCore",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Manual bookmark source used by save/edit/delete flows."
  },
  {
    "id": "bookmarksManualTable->bookmarksManager:reads-from+edits",
    "source": "bookmarksManualTable",
    "target": "bookmarksManager",
    "tags": [
      "reads-from",
      "edits"
    ],
    "label": "reads-from, edits",
    "meaning": "Visible as manually saved links in the manager."
  },
  {
    "id": "bookmarksManualTable->urlPicker:suggests",
    "source": "bookmarksManualTable",
    "target": "urlPicker",
    "tags": [
      "suggests"
    ],
    "label": "suggests",
    "meaning": "Can appear as bookmarked URL suggestions."
  },
  {
    "id": "bookmarksActivityTable->bookmarksCore:reads-from+writes-to",
    "source": "bookmarksActivityTable",
    "target": "bookmarksCore",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Activity source used by automatic capture and listing."
  },
  {
    "id": "bookmarksActivityTable->bookmarksManager:reads-from",
    "source": "bookmarksActivityTable",
    "target": "bookmarksManager",
    "tags": [
      "reads-from"
    ],
    "label": "reads-from",
    "meaning": "Visible as activity-derived saved links."
  },
  {
    "id": "bookmarksActivityTable->urlPicker:suggests",
    "source": "bookmarksActivityTable",
    "target": "urlPicker",
    "tags": [
      "suggests"
    ],
    "label": "suggests",
    "meaning": "Can influence recent/frequent URL suggestions."
  },
  {
    "id": "remindersTable->notificationsAndReminders:reads-from+writes-to",
    "source": "remindersTable",
    "target": "notificationsAndReminders",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Primary persistence for reminder records."
  },
  {
    "id": "remindersTable->alarmsApi:depends-on",
    "source": "remindersTable",
    "target": "alarmsApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Alarm scheduling is derived from due reminder timestamps."
  },
  {
    "id": "remindersTable->inPageReminderToasts:notifies",
    "source": "remindersTable",
    "target": "inPageReminderToasts",
    "tags": [
      "notifies"
    ],
    "label": "notifies",
    "meaning": "Due reminders can surface through page toasts."
  },
  {
    "id": "urlPickerSignalsTable->urlPicker:reads-from+writes-to+suggests",
    "source": "urlPickerSignalsTable",
    "target": "urlPicker",
    "tags": [
      "reads-from",
      "writes-to",
      "suggests"
    ],
    "label": "reads-from, writes-to, suggests",
    "meaning": "Powers local URL suggestions."
  },
  {
    "id": "urlPickerSignalsTable->miniWebBrowser:suggests",
    "source": "urlPickerSignalsTable",
    "target": "miniWebBrowser",
    "tags": [
      "suggests"
    ],
    "label": "suggests",
    "meaning": "Feeds URL/search suggestions for Mini Web Browser navigation."
  },
  {
    "id": "urlPickerSignalsTable->multiBrowser:suggests",
    "source": "urlPickerSignalsTable",
    "target": "multiBrowser",
    "tags": [
      "suggests"
    ],
    "label": "suggests",
    "meaning": "Feeds URL/search suggestions for tile creation."
  },
  {
    "id": "urlPickerSignalsTable->bookmarksCore:records",
    "source": "urlPickerSignalsTable",
    "target": "bookmarksCore",
    "tags": [
      "records"
    ],
    "label": "records",
    "meaning": "Bookmark toggles and page metadata can affect URL picker records."
  },
  {
    "id": "hoverEyeBubble->settingsRuntime:gates+configures",
    "source": "hoverEyeBubble",
    "target": "settingsRuntime",
    "tags": [
      "gates",
      "configures"
    ],
    "label": "gates, configures",
    "meaning": "Controlled by hover bubble and link preview interaction settings."
  },
  {
    "id": "hoverEyeBubble->previewUrlEligibility:depends-on+gates",
    "source": "hoverEyeBubble",
    "target": "previewUrlEligibility",
    "tags": [
      "depends-on",
      "gates"
    ],
    "label": "depends-on, gates",
    "meaning": "Only eligible resolved targets can proceed to preview."
  },
  {
    "id": "hoverEyeBubble->linkPreviewController:routes-to",
    "source": "hoverEyeBubble",
    "target": "linkPreviewController",
    "tags": [
      "routes-to"
    ],
    "label": "routes-to",
    "meaning": "Dispatches preview intent to the link preview controller."
  },
  {
    "id": "hoverEyeBubble->previewWindow:opens",
    "source": "hoverEyeBubble",
    "target": "previewWindow",
    "tags": [
      "opens"
    ],
    "label": "opens",
    "meaning": "User activation opens the floating preview window."
  },
  {
    "id": "hoverEyeBubble->snoozeHoverBubbleAction:snoozes",
    "source": "hoverEyeBubble",
    "target": "snoozeHoverBubbleAction",
    "tags": [
      "snoozes"
    ],
    "label": "snoozes",
    "meaning": "Can be temporarily suppressed through the snooze action."
  },
  {
    "id": "longPressOverlay->settingsRuntime:gates+configures",
    "source": "longPressOverlay",
    "target": "settingsRuntime",
    "tags": [
      "gates",
      "configures"
    ],
    "label": "gates, configures",
    "meaning": "Controlled by long-press and link preview settings."
  },
  {
    "id": "longPressOverlay->previewUrlEligibility:depends-on+gates",
    "source": "longPressOverlay",
    "target": "previewUrlEligibility",
    "tags": [
      "depends-on",
      "gates"
    ],
    "label": "depends-on, gates",
    "meaning": "Link preview action requires eligible HTTPS URL resolution."
  },
  {
    "id": "longPressOverlay->linkPreviewController:routes-to",
    "source": "longPressOverlay",
    "target": "linkPreviewController",
    "tags": [
      "routes-to"
    ],
    "label": "routes-to",
    "meaning": "Preview link action dispatches into the link preview controller."
  },
  {
    "id": "longPressOverlay->openInNewTabAction:opens",
    "source": "longPressOverlay",
    "target": "openInNewTabAction",
    "tags": [
      "opens"
    ],
    "label": "opens",
    "meaning": "New tab action opens the resolved link outside the preview."
  },
  {
    "id": "longPressOverlay->mediaPreview:launches",
    "source": "longPressOverlay",
    "target": "mediaPreview",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Media action opens the Media Preview tool."
  },
  {
    "id": "longPressOverlay->clipboardFallbacks:copies",
    "source": "longPressOverlay",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Text copy uses clipboard behavior and fallback status when needed."
  },
  {
    "id": "linkPreviewController->hoverEyeBubble:coordinates",
    "source": "linkPreviewController",
    "target": "hoverEyeBubble",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Receives hover-eye preview requests."
  },
  {
    "id": "linkPreviewController->longPressOverlay:coordinates",
    "source": "linkPreviewController",
    "target": "longPressOverlay",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Receives long-press preview requests."
  },
  {
    "id": "linkPreviewController->previewUrlEligibility:depends-on+gates",
    "source": "linkPreviewController",
    "target": "previewUrlEligibility",
    "tags": [
      "depends-on",
      "gates"
    ],
    "label": "depends-on, gates",
    "meaning": "Validates preview targets before opening UI."
  },
  {
    "id": "linkPreviewController->previewWindow:opens+coordinates",
    "source": "linkPreviewController",
    "target": "previewWindow",
    "tags": [
      "opens",
      "coordinates"
    ],
    "label": "opens, coordinates",
    "meaning": "Creates or updates the floating preview window."
  },
  {
    "id": "linkPreviewController->directIframePreview:routes-to+hosts",
    "source": "linkPreviewController",
    "target": "directIframePreview",
    "tags": [
      "routes-to",
      "hosts"
    ],
    "label": "routes-to, hosts",
    "meaning": "Uses direct iframe hosting for supported same-origin HTTP(S) targets."
  },
  {
    "id": "linkPreviewController->miniWebBrowserWrappedPreview:routes-to+wraps",
    "source": "linkPreviewController",
    "target": "miniWebBrowserWrappedPreview",
    "tags": [
      "routes-to",
      "wraps"
    ],
    "label": "routes-to, wraps",
    "meaning": "Routes cross-origin web targets through Mini Web Browser wrapper when needed."
  },
  {
    "id": "linkPreviewController->settingsRuntime:reads-from",
    "source": "linkPreviewController",
    "target": "settingsRuntime",
    "tags": [
      "reads-from"
    ],
    "label": "reads-from",
    "meaning": "Reads opening interaction and preview-related settings."
  },
  {
    "id": "previewUrlEligibility->hoverEyeBubble:gates",
    "source": "previewUrlEligibility",
    "target": "hoverEyeBubble",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Determines whether hover preview can become available."
  },
  {
    "id": "previewUrlEligibility->longPressOverlay:gates",
    "source": "previewUrlEligibility",
    "target": "longPressOverlay",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Determines whether long-press link preview can be offered."
  },
  {
    "id": "previewUrlEligibility->linkPreviewController:gates",
    "source": "previewUrlEligibility",
    "target": "linkPreviewController",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Protects the preview controller from unsupported URLs."
  },
  {
    "id": "previewUrlEligibility->openInNewTabAction:protects",
    "source": "previewUrlEligibility",
    "target": "openInNewTabAction",
    "tags": [
      "protects"
    ],
    "label": "protects",
    "meaning": "URL opening helpers restrict new-tab targets to HTTP(S)."
  },
  {
    "id": "previewUrlEligibility->pageScreenshot:rejects",
    "source": "previewUrlEligibility",
    "target": "pageScreenshot",
    "tags": [
      "rejects"
    ],
    "label": "rejects",
    "meaning": "Unsupported pages such as browser-only pages are rejected."
  },
  {
    "id": "previewUrlEligibility->pageContentSelect:rejects",
    "source": "previewUrlEligibility",
    "target": "pageContentSelect",
    "tags": [
      "rejects"
    ],
    "label": "rejects",
    "meaning": "Unsupported pages are rejected before overlay injection."
  },
  {
    "id": "previewUrlEligibility->sessionSnapshot:rejects",
    "source": "previewUrlEligibility",
    "target": "sessionSnapshot",
    "tags": [
      "rejects"
    ],
    "label": "rejects",
    "meaning": "Unsupported tabs are excluded from capture."
  },
  {
    "id": "previewWindow->directIframePreview:hosts",
    "source": "previewWindow",
    "target": "directIframePreview",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Can show a page directly in an iframe when allowed."
  },
  {
    "id": "previewWindow->miniWebBrowserWrappedPreview:hosts+wraps",
    "source": "previewWindow",
    "target": "miniWebBrowserWrappedPreview",
    "tags": [
      "hosts",
      "wraps"
    ],
    "label": "hosts, wraps",
    "meaning": "Can show cross-origin targets through the Mini Web Browser wrapper."
  },
  {
    "id": "previewWindow->actionsMenu:shows",
    "source": "previewWindow",
    "target": "actionsMenu",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Exposes page-level actions."
  },
  {
    "id": "previewWindow->openToolsMenu:shows",
    "source": "previewWindow",
    "target": "openToolsMenu",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Exposes extension-hosted tool launcher."
  },
  {
    "id": "previewWindow->richTextToMarkdown:hosts",
    "source": "previewWindow",
    "target": "richTextToMarkdown",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts small conversion tool in the preview window."
  },
  {
    "id": "previewWindow->markdownToHtml:hosts",
    "source": "previewWindow",
    "target": "markdownToHtml",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts Markdown-to-HTML tool in the preview window."
  },
  {
    "id": "previewWindow->notificationsAndReminders:hosts",
    "source": "previewWindow",
    "target": "notificationsAndReminders",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts reminder manager tool."
  },
  {
    "id": "previewWindow->miniWebBrowser:hosts",
    "source": "previewWindow",
    "target": "miniWebBrowser",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts lightweight browser tool."
  },
  {
    "id": "previewWindow->bookmarksManager:hosts",
    "source": "previewWindow",
    "target": "bookmarksManager",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts bookmark management tool."
  },
  {
    "id": "previewWindow->pageScreenshot:hosts",
    "source": "previewWindow",
    "target": "pageScreenshot",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts active-page screenshot tool."
  },
  {
    "id": "previewWindow->pageContentSelect:hosts",
    "source": "previewWindow",
    "target": "pageContentSelect",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts content-selection tool while overlay runs on the active page."
  },
  {
    "id": "previewWindow->mediaPreview:hosts",
    "source": "previewWindow",
    "target": "mediaPreview",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosts focused media preview."
  },
  {
    "id": "previewWindow->settingsRuntime:reads-from",
    "source": "previewWindow",
    "target": "settingsRuntime",
    "tags": [
      "reads-from"
    ],
    "label": "reads-from",
    "meaning": "Uses default size, title behavior, and tool visibility settings."
  },
  {
    "id": "directIframePreview->previewWindow:embeds",
    "source": "directIframePreview",
    "target": "previewWindow",
    "tags": [
      "embeds"
    ],
    "label": "embeds",
    "meaning": "Renders inside the preview window."
  },
  {
    "id": "directIframePreview->embeddedNavigationHeaderBypass:depends-on",
    "source": "directIframePreview",
    "target": "embeddedNavigationHeaderBypass",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "May require temporary header bypass for frame-blocked targets."
  },
  {
    "id": "directIframePreview->readabilityHelpers:depends-on",
    "source": "directIframePreview",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Can receive iframe-side reader and copy helpers when frame is accessible."
  },
  {
    "id": "directIframePreview->turndownHelpers:depends-on",
    "source": "directIframePreview",
    "target": "turndownHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Can use iframe-side Markdown conversion helpers when accessible."
  },
  {
    "id": "miniWebBrowserWrappedPreview->previewWindow:embeds",
    "source": "miniWebBrowserWrappedPreview",
    "target": "previewWindow",
    "tags": [
      "embeds"
    ],
    "label": "embeds",
    "meaning": "Runs inside the floating preview window."
  },
  {
    "id": "miniWebBrowserWrappedPreview->miniWebBrowser:wraps+depends-on",
    "source": "miniWebBrowserWrappedPreview",
    "target": "miniWebBrowser",
    "tags": [
      "wraps",
      "depends-on"
    ],
    "label": "wraps, depends-on",
    "meaning": "Reuses Mini Web Browser navigation and embedding behavior."
  },
  {
    "id": "miniWebBrowserWrappedPreview->urlPicker:depends-on",
    "source": "miniWebBrowserWrappedPreview",
    "target": "urlPicker",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Can use shared URL picker logic for navigation input."
  },
  {
    "id": "miniWebBrowserWrappedPreview->openInNewTabAction:opens",
    "source": "miniWebBrowserWrappedPreview",
    "target": "openInNewTabAction",
    "tags": [
      "opens"
    ],
    "label": "opens",
    "meaning": "Can fall back to opening the target externally."
  },
  {
    "id": "embeddedNavigationHeaderBypass->settingsRuntime:gates+configures",
    "source": "embeddedNavigationHeaderBypass",
    "target": "settingsRuntime",
    "tags": [
      "gates",
      "configures"
    ],
    "label": "gates, configures",
    "meaning": "Only operates when the privacy/security setting allows header bypass."
  },
  {
    "id": "embeddedNavigationHeaderBypass->declarativeNetRequestApi:depends-on+bypasses",
    "source": "embeddedNavigationHeaderBypass",
    "target": "declarativeNetRequestApi",
    "tags": [
      "depends-on",
      "bypasses"
    ],
    "label": "depends-on, bypasses",
    "meaning": "Uses DNR modifyHeaders rules."
  },
  {
    "id": "embeddedNavigationHeaderBypass->directIframePreview:bypasses",
    "source": "embeddedNavigationHeaderBypass",
    "target": "directIframePreview",
    "tags": [
      "bypasses"
    ],
    "label": "bypasses",
    "meaning": "Makes otherwise frame-blocked targets more likely to load."
  },
  {
    "id": "embeddedNavigationHeaderBypass->previewWindow:depends-on",
    "source": "embeddedNavigationHeaderBypass",
    "target": "previewWindow",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Affects embedded preview loading behavior."
  },
  {
    "id": "actionsMenu->readerModeAction:contains+commands",
    "source": "actionsMenu",
    "target": "readerModeAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Runs readable-page transformation."
  },
  {
    "id": "actionsMenu->copyPageMarkdownAction:contains+commands",
    "source": "actionsMenu",
    "target": "copyPageMarkdownAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Copies page content as Markdown."
  },
  {
    "id": "actionsMenu->toggleContentEditableAction:contains+commands",
    "source": "actionsMenu",
    "target": "toggleContentEditableAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Toggles editable state on page content."
  },
  {
    "id": "actionsMenu->openInNewTabAction:contains+commands",
    "source": "actionsMenu",
    "target": "openInNewTabAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Opens target/current URL in a regular tab."
  },
  {
    "id": "actionsMenu->copyMarkdownLinkAction:contains+commands",
    "source": "actionsMenu",
    "target": "copyMarkdownLinkAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Copies title and URL as a Markdown link."
  },
  {
    "id": "actionsMenu->copyUrlAction:contains+commands",
    "source": "actionsMenu",
    "target": "copyUrlAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Copies the current URL."
  },
  {
    "id": "actionsMenu->snoozeHoverBubbleAction:contains+commands",
    "source": "actionsMenu",
    "target": "snoozeHoverBubbleAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Snoozes hover affordances."
  },
  {
    "id": "actionsMenu->addEditBookmarkAction:contains+commands",
    "source": "actionsMenu",
    "target": "addEditBookmarkAction",
    "tags": [
      "contains",
      "commands"
    ],
    "label": "contains, commands",
    "meaning": "Creates or edits a bookmark for the current URL."
  },
  {
    "id": "actionsMenu->minibuffer:commands",
    "source": "actionsMenu",
    "target": "minibuffer",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Same action set is reachable by command."
  },
  {
    "id": "actionsMenu->previewWindow:shows",
    "source": "actionsMenu",
    "target": "previewWindow",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Shown through the preview window surface."
  },
  {
    "id": "openToolsMenu->richTextToMarkdown:launches",
    "source": "openToolsMenu",
    "target": "richTextToMarkdown",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens local rich-text-to-Markdown converter."
  },
  {
    "id": "openToolsMenu->notificationsAndReminders:launches",
    "source": "openToolsMenu",
    "target": "notificationsAndReminders",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens reminder manager."
  },
  {
    "id": "openToolsMenu->miniWebBrowser:launches",
    "source": "openToolsMenu",
    "target": "miniWebBrowser",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens lightweight embedded browser."
  },
  {
    "id": "openToolsMenu->multiBrowser:launches",
    "source": "openToolsMenu",
    "target": "multiBrowser",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens tiled multi-page workspace, usually in a full tab."
  },
  {
    "id": "openToolsMenu->bookmarksManager:launches",
    "source": "openToolsMenu",
    "target": "bookmarksManager",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens local bookmark manager."
  },
  {
    "id": "openToolsMenu->pageScreenshot:launches",
    "source": "openToolsMenu",
    "target": "pageScreenshot",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens active-page screenshot capture tool."
  },
  {
    "id": "openToolsMenu->pageContentSelect:launches",
    "source": "openToolsMenu",
    "target": "pageContentSelect",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens page content clipping tool."
  },
  {
    "id": "openToolsMenu->sessionSnapshot:launches",
    "source": "openToolsMenu",
    "target": "sessionSnapshot",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens selected-tabs snapshot/export tool, usually in a full tab."
  },
  {
    "id": "openToolsMenu->markdownToHtml:launches",
    "source": "openToolsMenu",
    "target": "markdownToHtml",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opens Markdown-to-HTML converter."
  },
  {
    "id": "openToolsMenu->settingsRuntime:gates",
    "source": "openToolsMenu",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Tool visibility follows Open Tools settings."
  },
  {
    "id": "openToolsMenu->minibuffer:commands",
    "source": "openToolsMenu",
    "target": "minibuffer",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Same tools are reachable by command names and aliases."
  },
  {
    "id": "minibuffer->actionsMenu:commands",
    "source": "minibuffer",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Can execute page actions by command."
  },
  {
    "id": "minibuffer->openToolsMenu:commands",
    "source": "minibuffer",
    "target": "openToolsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Can launch tools by command or alias."
  },
  {
    "id": "minibuffer->minibufferHelp:opens",
    "source": "minibuffer",
    "target": "minibufferHelp",
    "tags": [
      "opens"
    ],
    "label": "opens",
    "meaning": "Opens command guide and discovery help."
  },
  {
    "id": "minibuffer->richTextToMarkdown:launches",
    "source": "minibuffer",
    "target": "richTextToMarkdown",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Rich Text to Markdown."
  },
  {
    "id": "minibuffer->notificationsAndReminders:launches",
    "source": "minibuffer",
    "target": "notificationsAndReminders",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Notifications and Reminders."
  },
  {
    "id": "minibuffer->miniWebBrowser:launches",
    "source": "minibuffer",
    "target": "miniWebBrowser",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Mini Web Browser, optionally with URL/search text."
  },
  {
    "id": "minibuffer->multiBrowser:launches",
    "source": "minibuffer",
    "target": "multiBrowser",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Multi Browser."
  },
  {
    "id": "minibuffer->bookmarksManager:launches",
    "source": "minibuffer",
    "target": "bookmarksManager",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Bookmarks Manager."
  },
  {
    "id": "minibuffer->pageScreenshot:launches",
    "source": "minibuffer",
    "target": "pageScreenshot",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Page Screenshot."
  },
  {
    "id": "minibuffer->pageContentSelect:launches",
    "source": "minibuffer",
    "target": "pageContentSelect",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Page Content Select."
  },
  {
    "id": "minibuffer->sessionSnapshot:launches",
    "source": "minibuffer",
    "target": "sessionSnapshot",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Session Snapshot."
  },
  {
    "id": "minibuffer->markdownToHtml:launches",
    "source": "minibuffer",
    "target": "markdownToHtml",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Command opens Markdown to HTML."
  },
  {
    "id": "minibuffer->settingsRuntime:reads-from+gates",
    "source": "minibuffer",
    "target": "settingsRuntime",
    "tags": [
      "reads-from",
      "gates"
    ],
    "label": "reads-from, gates",
    "meaning": "Hidden tools are not shown as suggestions."
  },
  {
    "id": "minibufferHelp->minibuffer:depends-on",
    "source": "minibufferHelp",
    "target": "minibuffer",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Documents minibuffer command behavior."
  },
  {
    "id": "minibufferHelp->miniWebBrowser:hosts",
    "source": "minibufferHelp",
    "target": "miniWebBrowser",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Help opens inside the extension mini browser surface."
  },
  {
    "id": "minibufferHelp->openToolsMenu:shows",
    "source": "minibufferHelp",
    "target": "openToolsMenu",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Documents available tool commands."
  },
  {
    "id": "minibufferHelp->actionsMenu:shows",
    "source": "minibufferHelp",
    "target": "actionsMenu",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Documents action commands and aliases."
  },
  {
    "id": "readerModeAction->actionsMenu:commands",
    "source": "readerModeAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a page action."
  },
  {
    "id": "readerModeAction->readabilityHelpers:depends-on+extracts",
    "source": "readerModeAction",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on",
      "extracts"
    ],
    "label": "depends-on, extracts",
    "meaning": "Uses Readability-style extraction."
  },
  {
    "id": "readerModeAction->previewWindow:shows",
    "source": "readerModeAction",
    "target": "previewWindow",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Can operate in preview/page context."
  },
  {
    "id": "readerModeAction->miniWebBrowser:commands",
    "source": "readerModeAction",
    "target": "miniWebBrowser",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a Mini Web Browser page action."
  },
  {
    "id": "copyPageMarkdownAction->actionsMenu:commands",
    "source": "copyPageMarkdownAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a content action."
  },
  {
    "id": "copyPageMarkdownAction->readabilityHelpers:extracts+depends-on",
    "source": "copyPageMarkdownAction",
    "target": "readabilityHelpers",
    "tags": [
      "extracts",
      "depends-on"
    ],
    "label": "extracts, depends-on",
    "meaning": "Extracts readable article/page content."
  },
  {
    "id": "copyPageMarkdownAction->turndownHelpers:converts+depends-on",
    "source": "copyPageMarkdownAction",
    "target": "turndownHelpers",
    "tags": [
      "converts",
      "depends-on"
    ],
    "label": "converts, depends-on",
    "meaning": "Converts HTML content into Markdown."
  },
  {
    "id": "copyPageMarkdownAction->clipboardFallbacks:copies",
    "source": "copyPageMarkdownAction",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Writes Markdown to clipboard or shows fallback."
  },
  {
    "id": "copyPageMarkdownAction->miniWebBrowser:commands",
    "source": "copyPageMarkdownAction",
    "target": "miniWebBrowser",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available from Mini Web Browser page actions."
  },
  {
    "id": "toggleContentEditableAction->actionsMenu:commands",
    "source": "toggleContentEditableAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a page action."
  },
  {
    "id": "toggleContentEditableAction->activeWebPage:edits",
    "source": "toggleContentEditableAction",
    "target": "activeWebPage",
    "tags": [
      "edits"
    ],
    "label": "edits",
    "meaning": "Changes contentEditable state in page/frame context."
  },
  {
    "id": "toggleContentEditableAction->miniWebBrowser:commands",
    "source": "toggleContentEditableAction",
    "target": "miniWebBrowser",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available from Mini Web Browser page actions."
  },
  {
    "id": "openInNewTabAction->actionsMenu:commands",
    "source": "openInNewTabAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a navigation action."
  },
  {
    "id": "openInNewTabAction->longPressOverlay:commands",
    "source": "openInNewTabAction",
    "target": "longPressOverlay",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available for resolved HTTPS links."
  },
  {
    "id": "openInNewTabAction->miniWebBrowser:commands",
    "source": "openInNewTabAction",
    "target": "miniWebBrowser",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available from Mini Web Browser page actions."
  },
  {
    "id": "openInNewTabAction->tabsApi:depends-on+opens",
    "source": "openInNewTabAction",
    "target": "tabsApi",
    "tags": [
      "depends-on",
      "opens"
    ],
    "label": "depends-on, opens",
    "meaning": "Uses browser tab opening."
  },
  {
    "id": "openInNewTabAction->previewUrlEligibility:protects",
    "source": "openInNewTabAction",
    "target": "previewUrlEligibility",
    "tags": [
      "protects"
    ],
    "label": "protects",
    "meaning": "URL opening is restricted to HTTP(S)."
  },
  {
    "id": "copyMarkdownLinkAction->actionsMenu:commands",
    "source": "copyMarkdownLinkAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a content/navigation action."
  },
  {
    "id": "copyMarkdownLinkAction->clipboardFallbacks:copies",
    "source": "copyMarkdownLinkAction",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Writes Markdown link to clipboard."
  },
  {
    "id": "copyMarkdownLinkAction->bookmarksCore:records",
    "source": "copyMarkdownLinkAction",
    "target": "bookmarksCore",
    "tags": [
      "records"
    ],
    "label": "records",
    "meaning": "Can operate on URLs also used by bookmarking and activity capture."
  },
  {
    "id": "copyMarkdownLinkAction->miniWebBrowser:commands",
    "source": "copyMarkdownLinkAction",
    "target": "miniWebBrowser",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available from Mini Web Browser page actions."
  },
  {
    "id": "copyUrlAction->actionsMenu:commands",
    "source": "copyUrlAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a navigation/general action."
  },
  {
    "id": "copyUrlAction->clipboardFallbacks:copies",
    "source": "copyUrlAction",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Writes URL to clipboard."
  },
  {
    "id": "copyUrlAction->miniWebBrowser:commands",
    "source": "copyUrlAction",
    "target": "miniWebBrowser",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available from Mini Web Browser page actions."
  },
  {
    "id": "snoozeHoverBubbleAction->actionsMenu:commands",
    "source": "snoozeHoverBubbleAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a general action."
  },
  {
    "id": "snoozeHoverBubbleAction->hoverEyeBubble:snoozes+gates",
    "source": "snoozeHoverBubbleAction",
    "target": "hoverEyeBubble",
    "tags": [
      "snoozes",
      "gates"
    ],
    "label": "snoozes, gates",
    "meaning": "Suppresses hover bubble display for a period."
  },
  {
    "id": "snoozeHoverBubbleAction->settingsRuntime:writes-to",
    "source": "snoozeHoverBubbleAction",
    "target": "settingsRuntime",
    "tags": [
      "writes-to"
    ],
    "label": "writes-to",
    "meaning": "Uses hover snooze settings/state."
  },
  {
    "id": "addEditBookmarkAction->actionsMenu:commands",
    "source": "addEditBookmarkAction",
    "target": "actionsMenu",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Available as a general action."
  },
  {
    "id": "addEditBookmarkAction->bookmarksCore:writes-to+reads-from",
    "source": "addEditBookmarkAction",
    "target": "bookmarksCore",
    "tags": [
      "writes-to",
      "reads-from"
    ],
    "label": "writes-to, reads-from",
    "meaning": "Creates, reads, updates, or deletes bookmark records."
  },
  {
    "id": "addEditBookmarkAction->bookmarksManager:edits",
    "source": "addEditBookmarkAction",
    "target": "bookmarksManager",
    "tags": [
      "edits"
    ],
    "label": "edits",
    "meaning": "Saved record later appears in Bookmarks Manager."
  },
  {
    "id": "addEditBookmarkAction->urlPicker:records",
    "source": "addEditBookmarkAction",
    "target": "urlPicker",
    "tags": [
      "records"
    ],
    "label": "records",
    "meaning": "Bookmark state can influence URL picker suggestion UI."
  },
  {
    "id": "addEditBookmarkAction->settingsRuntime:gates",
    "source": "addEditBookmarkAction",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Manual bookmark buttons can be enabled or disabled."
  },
  {
    "id": "bookmarksCore->localIndexedDb:stores-in",
    "source": "bookmarksCore",
    "target": "localIndexedDb",
    "tags": [
      "stores-in"
    ],
    "label": "stores-in",
    "meaning": "Uses local IndexedDB database."
  },
  {
    "id": "bookmarksCore->bookmarksManualTable:reads-from+writes-to",
    "source": "bookmarksCore",
    "target": "bookmarksManualTable",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Stores user-created bookmarks."
  },
  {
    "id": "bookmarksCore->bookmarksActivityTable:reads-from+writes-to",
    "source": "bookmarksCore",
    "target": "bookmarksActivityTable",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Stores automatic activity bookmarks."
  },
  {
    "id": "bookmarksCore->bookmarksManager:coordinates",
    "source": "bookmarksCore",
    "target": "bookmarksManager",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Supplies records to manager UI."
  },
  {
    "id": "bookmarksCore->addEditBookmarkAction:coordinates",
    "source": "bookmarksCore",
    "target": "addEditBookmarkAction",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Handles add/edit/delete flows."
  },
  {
    "id": "bookmarksCore->urlPicker:records+suggests",
    "source": "bookmarksCore",
    "target": "urlPicker",
    "tags": [
      "records",
      "suggests"
    ],
    "label": "records, suggests",
    "meaning": "Feeds and reflects bookmark state in suggestions."
  },
  {
    "id": "bookmarksCore->settingsRuntime:gates",
    "source": "bookmarksCore",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Automatic and manual bookmark behavior is setting-controlled."
  },
  {
    "id": "bookmarksManager->openToolsMenu:launches",
    "source": "bookmarksManager",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "bookmarksManager->minibuffer:launches",
    "source": "bookmarksManager",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "bookmarksManager->previewWindow:hosts",
    "source": "bookmarksManager",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Opens as an extension-hosted tool."
  },
  {
    "id": "bookmarksManager->bookmarksCore:reads-from+writes-to+edits",
    "source": "bookmarksManager",
    "target": "bookmarksCore",
    "tags": [
      "reads-from",
      "writes-to",
      "edits"
    ],
    "label": "reads-from, writes-to, edits",
    "meaning": "Reads and mutates bookmark records."
  },
  {
    "id": "bookmarksManager->bookmarksManualTable:reads-from+writes-to",
    "source": "bookmarksManager",
    "target": "bookmarksManualTable",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Shows manual bookmarks."
  },
  {
    "id": "bookmarksManager->bookmarksActivityTable:reads-from",
    "source": "bookmarksManager",
    "target": "bookmarksActivityTable",
    "tags": [
      "reads-from"
    ],
    "label": "reads-from",
    "meaning": "Shows activity bookmarks."
  },
  {
    "id": "bookmarksManager->urlPicker:records",
    "source": "bookmarksManager",
    "target": "urlPicker",
    "tags": [
      "records"
    ],
    "label": "records",
    "meaning": "Bookmark changes can affect URL suggestion state."
  },
  {
    "id": "urlPicker->urlPickerSignalsTable:reads-from+writes-to",
    "source": "urlPicker",
    "target": "urlPickerSignalsTable",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Persists ranking, selection, and metadata signals."
  },
  {
    "id": "urlPicker->bookmarksCore:reads-from+writes-to",
    "source": "urlPicker",
    "target": "bookmarksCore",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Shows and toggles bookmark state inline."
  },
  {
    "id": "urlPicker->miniWebBrowser:suggests+navigates",
    "source": "urlPicker",
    "target": "miniWebBrowser",
    "tags": [
      "suggests",
      "navigates"
    ],
    "label": "suggests, navigates",
    "meaning": "Supplies address/search suggestions."
  },
  {
    "id": "urlPicker->multiBrowser:suggests+navigates",
    "source": "urlPicker",
    "target": "multiBrowser",
    "tags": [
      "suggests",
      "navigates"
    ],
    "label": "suggests, navigates",
    "meaning": "Supplies tile URL/search suggestions."
  },
  {
    "id": "urlPicker->settingsRuntime:configures",
    "source": "urlPicker",
    "target": "settingsRuntime",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Controls suggestion behavior and inline controls."
  },
  {
    "id": "urlPicker->previewUrlEligibility:protects",
    "source": "urlPicker",
    "target": "previewUrlEligibility",
    "tags": [
      "protects"
    ],
    "label": "protects",
    "meaning": "Normalizes and restricts opened URLs."
  },
  {
    "id": "richTextToMarkdown->openToolsMenu:launches",
    "source": "richTextToMarkdown",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "richTextToMarkdown->minibuffer:launches",
    "source": "richTextToMarkdown",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "richTextToMarkdown->previewWindow:hosts",
    "source": "richTextToMarkdown",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Usually hosted in the floating preview window."
  },
  {
    "id": "richTextToMarkdown->turndownHelpers:converts+depends-on",
    "source": "richTextToMarkdown",
    "target": "turndownHelpers",
    "tags": [
      "converts",
      "depends-on"
    ],
    "label": "converts, depends-on",
    "meaning": "Uses HTML-to-Markdown conversion."
  },
  {
    "id": "richTextToMarkdown->clipboardFallbacks:copies",
    "source": "richTextToMarkdown",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies Markdown or exposes manual fallback."
  },
  {
    "id": "markdownToHtml->openToolsMenu:launches",
    "source": "markdownToHtml",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "markdownToHtml->minibuffer:launches",
    "source": "markdownToHtml",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "markdownToHtml->previewWindow:hosts",
    "source": "markdownToHtml",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosted as an extension tool."
  },
  {
    "id": "markdownToHtml->clipboardFallbacks:copies",
    "source": "markdownToHtml",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies generated HTML or rich text."
  },
  {
    "id": "notificationsAndReminders->openToolsMenu:launches",
    "source": "notificationsAndReminders",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "notificationsAndReminders->minibuffer:launches",
    "source": "notificationsAndReminders",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "notificationsAndReminders->previewWindow:hosts",
    "source": "notificationsAndReminders",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosted as an extension tool."
  },
  {
    "id": "notificationsAndReminders->remindersTable:reads-from+writes-to",
    "source": "notificationsAndReminders",
    "target": "remindersTable",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Persists reminder records."
  },
  {
    "id": "notificationsAndReminders->alarmsApi:depends-on",
    "source": "notificationsAndReminders",
    "target": "alarmsApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Uses alarms to trigger reminder checks."
  },
  {
    "id": "notificationsAndReminders->inPageReminderToasts:notifies",
    "source": "notificationsAndReminders",
    "target": "inPageReminderToasts",
    "tags": [
      "notifies"
    ],
    "label": "notifies",
    "meaning": "Due reminders can be shown as page toasts."
  },
  {
    "id": "notificationsAndReminders->settingsRuntime:configures+gates",
    "source": "notificationsAndReminders",
    "target": "settingsRuntime",
    "tags": [
      "configures",
      "gates"
    ],
    "label": "configures, gates",
    "meaning": "Controlled by reminders settings and global snooze."
  },
  {
    "id": "inPageReminderToasts->notificationsAndReminders:notifies",
    "source": "inPageReminderToasts",
    "target": "notificationsAndReminders",
    "tags": [
      "notifies"
    ],
    "label": "notifies",
    "meaning": "Displays reminder records from the reminder engine."
  },
  {
    "id": "inPageReminderToasts->remindersTable:reads-from+writes-to",
    "source": "inPageReminderToasts",
    "target": "remindersTable",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Delivery and acknowledgment states are reflected in reminder records."
  },
  {
    "id": "inPageReminderToasts->settingsRuntime:gates",
    "source": "inPageReminderToasts",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Shown only when reminder toasts are enabled and not globally snoozed."
  },
  {
    "id": "inPageReminderToasts->activeWebPage:shows",
    "source": "inPageReminderToasts",
    "target": "activeWebPage",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Appears on top of current browsing context."
  },
  {
    "id": "miniWebBrowser->openToolsMenu:launches",
    "source": "miniWebBrowser",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "miniWebBrowser->minibuffer:launches",
    "source": "miniWebBrowser",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias, optionally with URL/search text."
  },
  {
    "id": "miniWebBrowser->previewWindow:hosts",
    "source": "miniWebBrowser",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Usually hosted in the floating preview window."
  },
  {
    "id": "miniWebBrowser->miniWebBrowserWrappedPreview:wraps",
    "source": "miniWebBrowser",
    "target": "miniWebBrowserWrappedPreview",
    "tags": [
      "wraps"
    ],
    "label": "wraps",
    "meaning": "Used as wrapper for some preview targets."
  },
  {
    "id": "miniWebBrowser->urlPicker:depends-on+suggests",
    "source": "miniWebBrowser",
    "target": "urlPicker",
    "tags": [
      "depends-on",
      "suggests"
    ],
    "label": "depends-on, suggests",
    "meaning": "Uses shared URL picker for address/search input."
  },
  {
    "id": "miniWebBrowser->readerModeAction:commands",
    "source": "miniWebBrowser",
    "target": "readerModeAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers page reader action."
  },
  {
    "id": "miniWebBrowser->copyPageMarkdownAction:commands",
    "source": "miniWebBrowser",
    "target": "copyPageMarkdownAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers page Markdown copy action."
  },
  {
    "id": "miniWebBrowser->toggleContentEditableAction:commands",
    "source": "miniWebBrowser",
    "target": "toggleContentEditableAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers content-editable action."
  },
  {
    "id": "miniWebBrowser->openInNewTabAction:commands",
    "source": "miniWebBrowser",
    "target": "openInNewTabAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers open-current-page externally action."
  },
  {
    "id": "miniWebBrowser->copyMarkdownLinkAction:commands",
    "source": "miniWebBrowser",
    "target": "copyMarkdownLinkAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers Markdown link copy action."
  },
  {
    "id": "miniWebBrowser->copyUrlAction:commands",
    "source": "miniWebBrowser",
    "target": "copyUrlAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers URL copy action."
  },
  {
    "id": "miniWebBrowser->addEditBookmarkAction:commands",
    "source": "miniWebBrowser",
    "target": "addEditBookmarkAction",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Offers bookmark page action."
  },
  {
    "id": "miniWebBrowser->settingsRuntime:configures",
    "source": "miniWebBrowser",
    "target": "settingsRuntime",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Uses search template, sandbox, and popup settings."
  },
  {
    "id": "multiBrowser->openToolsMenu:launches",
    "source": "multiBrowser",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools; generally full-tab."
  },
  {
    "id": "multiBrowser->minibuffer:launches",
    "source": "multiBrowser",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "multiBrowser->urlPicker:depends-on+suggests",
    "source": "multiBrowser",
    "target": "urlPicker",
    "tags": [
      "depends-on",
      "suggests"
    ],
    "label": "depends-on, suggests",
    "meaning": "Uses URL/search suggestions for creating or changing tiles."
  },
  {
    "id": "multiBrowser->multiBrowserWorkspaceStore:stores-in+reads-from+writes-to",
    "source": "multiBrowser",
    "target": "multiBrowserWorkspaceStore",
    "tags": [
      "stores-in",
      "reads-from",
      "writes-to"
    ],
    "label": "stores-in, reads-from, writes-to",
    "meaning": "Persists workspace state."
  },
  {
    "id": "multiBrowser->multiBrowserFrameHotkeys:depends-on",
    "source": "multiBrowser",
    "target": "multiBrowserFrameHotkeys",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Uses frame hotkey bridge for tile focus and shortcuts."
  },
  {
    "id": "multiBrowser->miniWebBrowser:depends-on",
    "source": "multiBrowser",
    "target": "miniWebBrowser",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Shares embedded browser concepts and page navigation behavior."
  },
  {
    "id": "multiBrowser->settingsRuntime:gates",
    "source": "multiBrowser",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Visibility controlled by Open Tools settings."
  },
  {
    "id": "multiBrowserWorkspaceStore->chromeStorageLocal:stores-in",
    "source": "multiBrowserWorkspaceStore",
    "target": "chromeStorageLocal",
    "tags": [
      "stores-in"
    ],
    "label": "stores-in",
    "meaning": "Persists the workspace document locally."
  },
  {
    "id": "multiBrowserWorkspaceStore->multiBrowser:reads-from+writes-to",
    "source": "multiBrowserWorkspaceStore",
    "target": "multiBrowser",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Restores and saves the current workspace."
  },
  {
    "id": "multiBrowserFrameHotkeys->multiBrowser:depends-on+coordinates",
    "source": "multiBrowserFrameHotkeys",
    "target": "multiBrowser",
    "tags": [
      "depends-on",
      "coordinates"
    ],
    "label": "depends-on, coordinates",
    "meaning": "Relays hotkeys and frame focus events."
  },
  {
    "id": "multiBrowserFrameHotkeys->contentScripts:injects-into",
    "source": "multiBrowserFrameHotkeys",
    "target": "contentScripts",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Runs as a content script in frames."
  },
  {
    "id": "pageScreenshot->openToolsMenu:launches",
    "source": "pageScreenshot",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "pageScreenshot->minibuffer:launches",
    "source": "pageScreenshot",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "pageScreenshot->previewWindow:hosts",
    "source": "pageScreenshot",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosted as an extension tool."
  },
  {
    "id": "pageScreenshot->backgroundServiceWorker:depends-on+captures",
    "source": "pageScreenshot",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on",
      "captures"
    ],
    "label": "depends-on, captures",
    "meaning": "Uses privileged active-tab capture runtime."
  },
  {
    "id": "pageScreenshot->pageScreenshotDescriptionExtractor:extracts+depends-on",
    "source": "pageScreenshot",
    "target": "pageScreenshotDescriptionExtractor",
    "tags": [
      "extracts",
      "depends-on"
    ],
    "label": "extracts, depends-on",
    "meaning": "Extracts readable page description."
  },
  {
    "id": "pageScreenshot->readabilityHelpers:depends-on+extracts",
    "source": "pageScreenshot",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on",
      "extracts"
    ],
    "label": "depends-on, extracts",
    "meaning": "Uses Readability-style extraction."
  },
  {
    "id": "pageScreenshot->clipboardFallbacks:copies",
    "source": "pageScreenshot",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies Markdown or screenshot image with fallback state."
  },
  {
    "id": "pageScreenshot->activeWebPage:captures",
    "source": "pageScreenshot",
    "target": "activeWebPage",
    "tags": [
      "captures"
    ],
    "label": "captures",
    "meaning": "Captures the visible active page."
  },
  {
    "id": "pageScreenshot->previewUrlEligibility:rejects",
    "source": "pageScreenshot",
    "target": "previewUrlEligibility",
    "tags": [
      "rejects"
    ],
    "label": "rejects",
    "meaning": "Rejects unsupported page types."
  },
  {
    "id": "pageScreenshotDescriptionExtractor->pageScreenshot:extracts",
    "source": "pageScreenshotDescriptionExtractor",
    "target": "pageScreenshot",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Provides description candidate to screenshot tool."
  },
  {
    "id": "pageScreenshotDescriptionExtractor->scriptingApi:depends-on",
    "source": "pageScreenshotDescriptionExtractor",
    "target": "scriptingApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Injected into the active tab by service worker."
  },
  {
    "id": "pageScreenshotDescriptionExtractor->readabilityHelpers:depends-on",
    "source": "pageScreenshotDescriptionExtractor",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Uses Readability extraction."
  },
  {
    "id": "pageScreenshotDescriptionExtractor->activeWebPage:extracts",
    "source": "pageScreenshotDescriptionExtractor",
    "target": "activeWebPage",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Reads the active page content."
  },
  {
    "id": "pageContentSelect->openToolsMenu:launches",
    "source": "pageContentSelect",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools."
  },
  {
    "id": "pageContentSelect->minibuffer:launches",
    "source": "pageContentSelect",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "pageContentSelect->previewWindow:hosts",
    "source": "pageContentSelect",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Tool UI is hosted in the preview window."
  },
  {
    "id": "pageContentSelect->backgroundServiceWorker:depends-on+coordinates",
    "source": "pageContentSelect",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on",
      "coordinates"
    ],
    "label": "depends-on, coordinates",
    "meaning": "Service worker opens, commands, finishes, and cancels selection sessions."
  },
  {
    "id": "pageContentSelect->pageContentSelectOverlay:injects-into+captures",
    "source": "pageContentSelect",
    "target": "pageContentSelectOverlay",
    "tags": [
      "injects-into",
      "captures"
    ],
    "label": "injects-into, captures",
    "meaning": "Overlay is injected into the active page to select content."
  },
  {
    "id": "pageContentSelect->pageContentSelectDraftStore:stores-in+reads-from+writes-to",
    "source": "pageContentSelect",
    "target": "pageContentSelectDraftStore",
    "tags": [
      "stores-in",
      "reads-from",
      "writes-to"
    ],
    "label": "stores-in, reads-from, writes-to",
    "meaning": "Saves drafts and sessions."
  },
  {
    "id": "pageContentSelect->clipboardFallbacks:copies",
    "source": "pageContentSelect",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies aggregate output as rich text or plain text with fallback."
  },
  {
    "id": "pageContentSelect->downloadsApi:exports",
    "source": "pageContentSelect",
    "target": "downloadsApi",
    "tags": [
      "exports"
    ],
    "label": "exports",
    "meaning": "Downloads compiled HTML output."
  },
  {
    "id": "pageContentSelect->activeWebPage:captures",
    "source": "pageContentSelect",
    "target": "activeWebPage",
    "tags": [
      "captures"
    ],
    "label": "captures",
    "meaning": "Targets content on the active page."
  },
  {
    "id": "pageContentSelect->previewUrlEligibility:rejects",
    "source": "pageContentSelect",
    "target": "previewUrlEligibility",
    "tags": [
      "rejects"
    ],
    "label": "rejects",
    "meaning": "Rejects unsupported page types before selection."
  },
  {
    "id": "pageContentSelectOverlay->activeWebPage:injects-into+captures",
    "source": "pageContentSelectOverlay",
    "target": "activeWebPage",
    "tags": [
      "injects-into",
      "captures"
    ],
    "label": "injects-into, captures",
    "meaning": "Runs on top of the active page."
  },
  {
    "id": "pageContentSelectOverlay->pageContentSelect:coordinates",
    "source": "pageContentSelectOverlay",
    "target": "pageContentSelect",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Sends selection events and pending payloads to the tool."
  },
  {
    "id": "pageContentSelectOverlay->backgroundServiceWorker:coordinates",
    "source": "pageContentSelectOverlay",
    "target": "backgroundServiceWorker",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Session state is validated and routed by the service worker."
  },
  {
    "id": "pageContentSelectOverlay->scriptingApi:depends-on",
    "source": "pageContentSelectOverlay",
    "target": "scriptingApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Injected through Chrome scripting."
  },
  {
    "id": "pageContentSelectDraftStore->chromeStorageLocal:stores-in",
    "source": "pageContentSelectDraftStore",
    "target": "chromeStorageLocal",
    "tags": [
      "stores-in"
    ],
    "label": "stores-in",
    "meaning": "Persists drafts locally."
  },
  {
    "id": "pageContentSelectDraftStore->pageContentSelect:reads-from+writes-to",
    "source": "pageContentSelectDraftStore",
    "target": "pageContentSelect",
    "tags": [
      "reads-from",
      "writes-to"
    ],
    "label": "reads-from, writes-to",
    "meaning": "Saves, restores, pins, deletes, and finalizes clipping sessions."
  },
  {
    "id": "sessionSnapshot->openToolsMenu:launches",
    "source": "sessionSnapshot",
    "target": "openToolsMenu",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched from Open Tools; generally full-tab."
  },
  {
    "id": "sessionSnapshot->minibuffer:launches",
    "source": "sessionSnapshot",
    "target": "minibuffer",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Can be launched by command or alias."
  },
  {
    "id": "sessionSnapshot->backgroundServiceWorker:depends-on+coordinates",
    "source": "sessionSnapshot",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on",
      "coordinates"
    ],
    "label": "depends-on, coordinates",
    "meaning": "Lists tabs, captures selected tabs, and closes selected tabs."
  },
  {
    "id": "sessionSnapshot->tabsApi:reads-from+captures+closes",
    "source": "sessionSnapshot",
    "target": "tabsApi",
    "tags": [
      "reads-from",
      "captures",
      "closes"
    ],
    "label": "reads-from, captures, closes",
    "meaning": "Uses tab listing and closing operations."
  },
  {
    "id": "sessionSnapshot->sessionSnapshotDescriptionExtractor:extracts+depends-on",
    "source": "sessionSnapshot",
    "target": "sessionSnapshotDescriptionExtractor",
    "tags": [
      "extracts",
      "depends-on"
    ],
    "label": "extracts, depends-on",
    "meaning": "Extracts readable descriptions for captured tabs."
  },
  {
    "id": "sessionSnapshot->sessionSnapshotZipExport:exports",
    "source": "sessionSnapshot",
    "target": "sessionSnapshotZipExport",
    "tags": [
      "exports"
    ],
    "label": "exports",
    "meaning": "Builds downloadable archive output."
  },
  {
    "id": "sessionSnapshot->downloadsApi:exports",
    "source": "sessionSnapshot",
    "target": "downloadsApi",
    "tags": [
      "exports"
    ],
    "label": "exports",
    "meaning": "Downloads ZIP and HTML preview outputs."
  },
  {
    "id": "sessionSnapshot->readabilityHelpers:depends-on+extracts",
    "source": "sessionSnapshot",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on",
      "extracts"
    ],
    "label": "depends-on, extracts",
    "meaning": "Uses readable description extraction."
  },
  {
    "id": "sessionSnapshot->previewUrlEligibility:rejects",
    "source": "sessionSnapshot",
    "target": "previewUrlEligibility",
    "tags": [
      "rejects"
    ],
    "label": "rejects",
    "meaning": "Rejects unsupported browser-only pages."
  },
  {
    "id": "sessionSnapshotDescriptionExtractor->sessionSnapshot:extracts",
    "source": "sessionSnapshotDescriptionExtractor",
    "target": "sessionSnapshot",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Provides generated notes/descriptions for tab captures."
  },
  {
    "id": "sessionSnapshotDescriptionExtractor->readabilityHelpers:depends-on",
    "source": "sessionSnapshotDescriptionExtractor",
    "target": "readabilityHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Uses Readability-style extraction."
  },
  {
    "id": "sessionSnapshotDescriptionExtractor->scriptingApi:depends-on",
    "source": "sessionSnapshotDescriptionExtractor",
    "target": "scriptingApi",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Injected into supported tabs."
  },
  {
    "id": "sessionSnapshotDescriptionExtractor->activeWebPage:extracts",
    "source": "sessionSnapshotDescriptionExtractor",
    "target": "activeWebPage",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Reads tab page content where supported."
  },
  {
    "id": "sessionSnapshotZipExport->sessionSnapshot:exports",
    "source": "sessionSnapshotZipExport",
    "target": "sessionSnapshot",
    "tags": [
      "exports"
    ],
    "label": "exports",
    "meaning": "Created from selected captured tabs."
  },
  {
    "id": "sessionSnapshotZipExport->downloadsApi:depends-on+exports",
    "source": "sessionSnapshotZipExport",
    "target": "downloadsApi",
    "tags": [
      "depends-on",
      "exports"
    ],
    "label": "depends-on, exports",
    "meaning": "Downloaded through the browser downloads API."
  },
  {
    "id": "sessionSnapshotZipExport->tabsApi:closes",
    "source": "sessionSnapshotZipExport",
    "target": "tabsApi",
    "tags": [
      "closes"
    ],
    "label": "closes",
    "meaning": "Export can be followed by closing selected tabs."
  },
  {
    "id": "mediaPreview->longPressOverlay:launches",
    "source": "mediaPreview",
    "target": "longPressOverlay",
    "tags": [
      "launches"
    ],
    "label": "launches",
    "meaning": "Opened from detected media targets."
  },
  {
    "id": "mediaPreview->previewWindow:hosts",
    "source": "mediaPreview",
    "target": "previewWindow",
    "tags": [
      "hosts"
    ],
    "label": "hosts",
    "meaning": "Hosted in the shared floating window."
  },
  {
    "id": "mediaPreview->settingsRuntime:gates",
    "source": "mediaPreview",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Availability follows related long-press/tool visibility behavior."
  },
  {
    "id": "textExpander->activeWebPage:injects-into",
    "source": "textExpander",
    "target": "activeWebPage",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Runs while the user types in page text fields."
  },
  {
    "id": "textExpander->settingsRuntime:gates+configures",
    "source": "textExpander",
    "target": "settingsRuntime",
    "tags": [
      "gates",
      "configures"
    ],
    "label": "gates, configures",
    "meaning": "Can be enabled or disabled."
  },
  {
    "id": "textExpander->backgroundServiceWorker:coordinates",
    "source": "textExpander",
    "target": "backgroundServiceWorker",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Uses background scope and runtime support."
  },
  {
    "id": "textExpander->minibuffer:commands",
    "source": "textExpander",
    "target": "minibuffer",
    "tags": [
      "commands"
    ],
    "label": "commands",
    "meaning": "Shares command/minibuffer infrastructure conceptually."
  },
  {
    "id": "tabTrailOverlay->activeWebPage:shows",
    "source": "tabTrailOverlay",
    "target": "activeWebPage",
    "tags": [
      "shows"
    ],
    "label": "shows",
    "meaning": "Appears in page context."
  },
  {
    "id": "tabTrailOverlay->contentScripts:coordinates",
    "source": "tabTrailOverlay",
    "target": "contentScripts",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Runs as a content-side overlay."
  },
  {
    "id": "tabTrailOverlay->backgroundServiceWorker:records",
    "source": "tabTrailOverlay",
    "target": "backgroundServiceWorker",
    "tags": [
      "records"
    ],
    "label": "records",
    "meaning": "Uses background tab trail service and local store."
  },
  {
    "id": "tabTrailOverlay->settingsRuntime:configures",
    "source": "tabTrailOverlay",
    "target": "settingsRuntime",
    "tags": [
      "configures"
    ],
    "label": "configures",
    "meaning": "Behavior can be controlled through settings/runtime surfaces."
  },
  {
    "id": "overlayBlocker->activeWebPage:injects-into+protects",
    "source": "overlayBlocker",
    "target": "activeWebPage",
    "tags": [
      "injects-into",
      "protects"
    ],
    "label": "injects-into, protects",
    "meaning": "Operates directly against page overlays."
  },
  {
    "id": "overlayBlocker->settingsRuntime:gates+configures",
    "source": "overlayBlocker",
    "target": "settingsRuntime",
    "tags": [
      "gates",
      "configures"
    ],
    "label": "gates, configures",
    "meaning": "Controlled by overlay blocking settings."
  },
  {
    "id": "overlayBlocker->contentScripts:coordinates",
    "source": "overlayBlocker",
    "target": "contentScripts",
    "tags": [
      "coordinates"
    ],
    "label": "coordinates",
    "meaning": "Runs as part of injected page-side behavior."
  },
  {
    "id": "readabilityHelpers->readerModeAction:extracts",
    "source": "readabilityHelpers",
    "target": "readerModeAction",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Extracts readable document content."
  },
  {
    "id": "readabilityHelpers->copyPageMarkdownAction:extracts",
    "source": "readabilityHelpers",
    "target": "copyPageMarkdownAction",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Extracts content before Markdown conversion."
  },
  {
    "id": "readabilityHelpers->pageScreenshotDescriptionExtractor:extracts",
    "source": "readabilityHelpers",
    "target": "pageScreenshotDescriptionExtractor",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Builds page description candidates."
  },
  {
    "id": "readabilityHelpers->sessionSnapshotDescriptionExtractor:extracts",
    "source": "readabilityHelpers",
    "target": "sessionSnapshotDescriptionExtractor",
    "tags": [
      "extracts"
    ],
    "label": "extracts",
    "meaning": "Builds tab description candidates."
  },
  {
    "id": "readabilityHelpers->turndownHelpers:depends-on",
    "source": "readabilityHelpers",
    "target": "turndownHelpers",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Often feeds HTML into Markdown conversion."
  },
  {
    "id": "turndownHelpers->copyPageMarkdownAction:converts",
    "source": "turndownHelpers",
    "target": "copyPageMarkdownAction",
    "tags": [
      "converts"
    ],
    "label": "converts",
    "meaning": "Converts extracted page HTML into Markdown."
  },
  {
    "id": "turndownHelpers->richTextToMarkdown:converts",
    "source": "turndownHelpers",
    "target": "richTextToMarkdown",
    "tags": [
      "converts"
    ],
    "label": "converts",
    "meaning": "Converts pasted rich text/HTML into Markdown."
  },
  {
    "id": "turndownHelpers->sessionSnapshot:converts",
    "source": "turndownHelpers",
    "target": "sessionSnapshot",
    "tags": [
      "converts"
    ],
    "label": "converts",
    "meaning": "Contributes to generated notes/Markdown output."
  },
  {
    "id": "turndownHelpers->pageScreenshot:converts",
    "source": "turndownHelpers",
    "target": "pageScreenshot",
    "tags": [
      "converts"
    ],
    "label": "converts",
    "meaning": "Contributes to Markdown snippet generation."
  },
  {
    "id": "turndownHelpers->clipboardFallbacks:copies",
    "source": "turndownHelpers",
    "target": "clipboardFallbacks",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Converted output is usually copied or exposed for manual copy."
  },
  {
    "id": "clipboardFallbacks->copyPageMarkdownAction:copies",
    "source": "clipboardFallbacks",
    "target": "copyPageMarkdownAction",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies Markdown output."
  },
  {
    "id": "clipboardFallbacks->copyMarkdownLinkAction:copies",
    "source": "clipboardFallbacks",
    "target": "copyMarkdownLinkAction",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies Markdown link output."
  },
  {
    "id": "clipboardFallbacks->copyUrlAction:copies",
    "source": "clipboardFallbacks",
    "target": "copyUrlAction",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies URL output."
  },
  {
    "id": "clipboardFallbacks->richTextToMarkdown:copies",
    "source": "clipboardFallbacks",
    "target": "richTextToMarkdown",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies generated Markdown."
  },
  {
    "id": "clipboardFallbacks->markdownToHtml:copies",
    "source": "clipboardFallbacks",
    "target": "markdownToHtml",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies HTML or rich output."
  },
  {
    "id": "clipboardFallbacks->pageScreenshot:copies",
    "source": "clipboardFallbacks",
    "target": "pageScreenshot",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies description Markdown or screenshot image."
  },
  {
    "id": "clipboardFallbacks->pageContentSelect:copies",
    "source": "clipboardFallbacks",
    "target": "pageContentSelect",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies rich text or plain text aggregate content."
  },
  {
    "id": "clipboardFallbacks->longPressOverlay:copies",
    "source": "clipboardFallbacks",
    "target": "longPressOverlay",
    "tags": [
      "copies"
    ],
    "label": "copies",
    "meaning": "Copies nearby visible text."
  },
  {
    "id": "downloadsApi->pageContentSelect:exports",
    "source": "downloadsApi",
    "target": "pageContentSelect",
    "tags": [
      "exports"
    ],
    "label": "exports",
    "meaning": "Downloads compiled selected-content HTML."
  },
  {
    "id": "downloadsApi->sessionSnapshotZipExport:exports",
    "source": "downloadsApi",
    "target": "sessionSnapshotZipExport",
    "tags": [
      "exports"
    ],
    "label": "exports",
    "meaning": "Downloads ZIP and HTML preview outputs."
  },
  {
    "id": "downloadsApi->backgroundServiceWorker:depends-on",
    "source": "downloadsApi",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Privileged API access lives in the service worker."
  },
  {
    "id": "tabsApi->openInNewTabAction:opens",
    "source": "tabsApi",
    "target": "openInNewTabAction",
    "tags": [
      "opens"
    ],
    "label": "opens",
    "meaning": "Opens HTTP(S) URLs in regular browser tabs."
  },
  {
    "id": "tabsApi->miniWebBrowser:opens",
    "source": "tabsApi",
    "target": "miniWebBrowser",
    "tags": [
      "opens"
    ],
    "label": "opens",
    "meaning": "Fallback external opening for embedded browser pages."
  },
  {
    "id": "tabsApi->sessionSnapshot:captures+closes",
    "source": "tabsApi",
    "target": "sessionSnapshot",
    "tags": [
      "captures",
      "closes"
    ],
    "label": "captures, closes",
    "meaning": "Lists and closes selected tabs."
  },
  {
    "id": "tabsApi->pageScreenshot:captures",
    "source": "tabsApi",
    "target": "pageScreenshot",
    "tags": [
      "captures"
    ],
    "label": "captures",
    "meaning": "Finds active tab metadata for capture."
  },
  {
    "id": "tabsApi->backgroundServiceWorker:depends-on",
    "source": "tabsApi",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Used through privileged runtime code."
  },
  {
    "id": "alarmsApi->notificationsAndReminders:notifies",
    "source": "alarmsApi",
    "target": "notificationsAndReminders",
    "tags": [
      "notifies"
    ],
    "label": "notifies",
    "meaning": "Triggers due reminder dispatch."
  },
  {
    "id": "alarmsApi->remindersTable:reads-from",
    "source": "alarmsApi",
    "target": "remindersTable",
    "tags": [
      "reads-from"
    ],
    "label": "reads-from",
    "meaning": "Next alarm time is derived from reminder records."
  },
  {
    "id": "alarmsApi->backgroundServiceWorker:depends-on",
    "source": "alarmsApi",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Alarm handling occurs in the service worker."
  },
  {
    "id": "scriptingApi->pageScreenshotDescriptionExtractor:injects-into",
    "source": "scriptingApi",
    "target": "pageScreenshotDescriptionExtractor",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Injects screenshot description helper."
  },
  {
    "id": "scriptingApi->pageContentSelectOverlay:injects-into",
    "source": "scriptingApi",
    "target": "pageContentSelectOverlay",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Injects page selection overlay."
  },
  {
    "id": "scriptingApi->sessionSnapshotDescriptionExtractor:injects-into",
    "source": "scriptingApi",
    "target": "sessionSnapshotDescriptionExtractor",
    "tags": [
      "injects-into"
    ],
    "label": "injects-into",
    "meaning": "Injects session description helper."
  },
  {
    "id": "scriptingApi->backgroundServiceWorker:depends-on",
    "source": "scriptingApi",
    "target": "backgroundServiceWorker",
    "tags": [
      "depends-on"
    ],
    "label": "depends-on",
    "meaning": "Injection requests are privileged service worker work."
  },
  {
    "id": "declarativeNetRequestApi->embeddedNavigationHeaderBypass:bypasses",
    "source": "declarativeNetRequestApi",
    "target": "embeddedNavigationHeaderBypass",
    "tags": [
      "bypasses"
    ],
    "label": "bypasses",
    "meaning": "Removes frame-blocking response headers for temporary embedded-navigation rules."
  },
  {
    "id": "declarativeNetRequestApi->settingsRuntime:gates",
    "source": "declarativeNetRequestApi",
    "target": "settingsRuntime",
    "tags": [
      "gates"
    ],
    "label": "gates",
    "meaning": "Only used when header bypass setting permits it."
  },
  {
    "id": "declarativeNetRequestApi->directIframePreview:bypasses",
    "source": "declarativeNetRequestApi",
    "target": "directIframePreview",
    "tags": [
      "bypasses"
    ],
    "label": "bypasses",
    "meaning": "Affects direct iframe preview loadability."
  }
];

  const GROUPS = ["product", "user-surface", "tool", "runtime", "data"];

  const GROUP_LABELS = {
    product: "Product root",
    "user-surface": "User surface",
    tool: "Local tool",
    runtime: "Runtime/support",
    data: "Data/export",
  };

  const GROUP_COLORS = {
    product: "#f5c451",
    "user-surface": "#a78bfa",
    tool: "#34d399",
    runtime: "#60a5fa",
    data: "#22d3ee",
  };

  const KIND_ORDER = [
    "product", "page-context", "entrypoint", "surface", "tool", "action",
    "runtime", "storage", "setting", "security", "export", "content-helper",
  ];

  const VISUAL_GROUP_BY_KIND = {
    product: "product",
    "page-context": "user-surface",
    entrypoint: "user-surface",
    surface: "user-surface",
    tool: "tool",
    action: "user-surface",
    runtime: "runtime",
    storage: "data",
    setting: "runtime",
    security: "runtime",
    export: "data",
    "content-helper": "runtime",
  };

  const IMPORTANCE = new Map(Object.entries({
    eye05: 100,
    activeWebPage: 95,
    hoverEyeBubble: 91,
    longPressOverlay: 91,
    linkPreviewController: 93,
    previewWindow: 98,
    actionsMenu: 88,
    openToolsMenu: 92,
    minibuffer: 86,
    backgroundServiceWorker: 84,
    settingsRuntime: 82,
    localIndexedDb: 74,
    chromeStorageLocal: 72,
    richTextToMarkdown: 78,
    markdownToHtml: 78,
    notificationsAndReminders: 81,
    miniWebBrowser: 83,
    multiBrowser: 80,
    bookmarksManager: 79,
    pageScreenshot: 81,
    pageContentSelect: 83,
    sessionSnapshot: 81,
    mediaPreview: 72,
    urlPicker: 76,
    bookmarksCore: 70,
    readerModeAction: 68,
    copyPageMarkdownAction: 68,
    addEditBookmarkAction: 66,
    copyMarkdownLinkAction: 62,
    copyUrlAction: 60,
    openInNewTabAction: 60,
    textExpander: 68,
    tabTrailOverlay: 62,
    readabilityHelpers: 46,
    turndownHelpers: 46,
    clipboardFallbacks: 54,
    scriptingApi: 43,
    tabsApi: 45,
    downloadsApi: 42,
    alarmsApi: 40,
    declarativeNetRequestApi: 40,
  }));

  const ROLE_BY_ID = new Map(Object.entries({
    eye05: "page",
    activeWebPage: "page",
    hoverEyeBubble: "entry",
    longPressOverlay: "entry",
    linkPreviewController: "preview",
    previewUrlEligibility: "preview",
    previewWindow: "preview",
    directIframePreview: "preview",
    miniWebBrowserWrappedPreview: "preview",
    actionsMenu: "command",
    openToolsMenu: "command",
    minibuffer: "command",
    minibufferHelp: "command",
    readerModeAction: "command",
    copyPageMarkdownAction: "command",
    toggleContentEditableAction: "command",
    openInNewTabAction: "command",
    copyMarkdownLinkAction: "command",
    copyUrlAction: "command",
    snoozeHoverBubbleAction: "command",
    addEditBookmarkAction: "command",
    richTextToMarkdown: "tool",
    markdownToHtml: "tool",
    notificationsAndReminders: "tool",
    inPageReminderToasts: "tool",
    miniWebBrowser: "tool",
    multiBrowser: "tool",
    bookmarksManager: "tool",
    pageScreenshot: "tool",
    pageContentSelect: "tool",
    sessionSnapshot: "tool",
    mediaPreview: "tool",
    textExpander: "tool",
    tabTrailOverlay: "tool",
    backgroundServiceWorker: "runtime",
    contentScripts: "runtime",
    settingsRuntime: "runtime",
    settingsPage: "runtime",
    embeddedNavigationHeaderBypass: "runtime",
    pageScreenshotDescriptionExtractor: "runtime",
    pageContentSelectOverlay: "runtime",
    sessionSnapshotDescriptionExtractor: "runtime",
    readabilityHelpers: "runtime",
    turndownHelpers: "runtime",
    clipboardFallbacks: "runtime",
    overlayBlocker: "runtime",
    multiBrowserFrameHotkeys: "runtime",
    tabsApi: "externalApi",
    scriptingApi: "externalApi",
    downloadsApi: "externalApi",
    alarmsApi: "externalApi",
    declarativeNetRequestApi: "externalApi",
    chromeStorageLocal: "storage",
    localIndexedDb: "storage",
    bookmarksManualTable: "storage",
    bookmarksActivityTable: "storage",
    remindersTable: "storage",
    urlPickerSignalsTable: "storage",
    multiBrowserWorkspaceStore: "storage",
    pageContentSelectDraftStore: "storage",
    sessionSnapshotZipExport: "storage",
  }));

  const ROLE_COLUMN = {
    page: 0,
    entry: 1,
    preview: 2,
    command: 3,
    tool: 4,
    runtime: 5,
    storage: 6,
    externalApi: 7,
  };

  const STORY_IDS = new Set([
    "eye05", "activeWebPage", "hoverEyeBubble", "longPressOverlay",
    "linkPreviewController", "previewUrlEligibility", "previewWindow",
    "actionsMenu", "openToolsMenu", "minibuffer", "backgroundServiceWorker",
    "settingsRuntime", "chromeStorageLocal", "localIndexedDb", "urlPicker",
    "bookmarksCore", "richTextToMarkdown", "markdownToHtml",
    "notificationsAndReminders", "miniWebBrowser", "multiBrowser", "bookmarksManager",
    "pageScreenshot", "pageContentSelect", "sessionSnapshot", "mediaPreview",
  ]);

  const BACKBONE_EDGES = new Set([
    "eye05->activeWebPage", "eye05->contentScripts", "eye05->backgroundServiceWorker", "eye05->settingsRuntime",
    "activeWebPage->hoverEyeBubble", "activeWebPage->longPressOverlay",
    "hoverEyeBubble->linkPreviewController", "longPressOverlay->linkPreviewController",
    "linkPreviewController->previewUrlEligibility", "linkPreviewController->previewWindow",
    "previewWindow->actionsMenu", "previewWindow->openToolsMenu", "previewWindow->miniWebBrowserWrappedPreview",
    "actionsMenu->readerModeAction", "actionsMenu->copyPageMarkdownAction", "actionsMenu->addEditBookmarkAction",
    "openToolsMenu->richTextToMarkdown", "openToolsMenu->markdownToHtml", "openToolsMenu->notificationsAndReminders",
    "openToolsMenu->miniWebBrowser", "openToolsMenu->multiBrowser", "openToolsMenu->bookmarksManager",
    "openToolsMenu->pageScreenshot", "openToolsMenu->pageContentSelect", "openToolsMenu->sessionSnapshot",
    "backgroundServiceWorker->localIndexedDb", "backgroundServiceWorker->chromeStorageLocal",
    "bookmarksManager->bookmarksCore", "bookmarksCore->localIndexedDb", "urlPicker->urlPickerSignalsTable",
    "notificationsAndReminders->remindersTable", "pageScreenshot->pageScreenshotDescriptionExtractor",
    "pageContentSelect->pageContentSelectOverlay", "sessionSnapshot->sessionSnapshotZipExport",
  ]);

  const IMPORTANT_EDGE_TAGS = new Set(["contains", "opens", "launches", "hosts", "commands", "captures", "stores-in"]);

  const TAG_PRIORITY = {
    opens: 100,
    launches: 96,
    hosts: 92,
    commands: 88,
    captures: 84,
    "stores-in": 78,
    contains: 72,
    coordinates: 68,
    "depends-on": 58,
    configures: 54,
    gates: 54,
    "reads-from": 50,
    "writes-to": 50,
  };

  const VIEW_MODES = {
    story: {
      caption: "Product Story: the default view shows the main user journey and hides implementation detail until needed.",
      include: STORY_IDS,
      minImportance: 72,
      kinds: new Set(["product", "page-context", "entrypoint", "surface", "tool", "runtime", "storage", "setting", "security"]),
    },
    flows: {
      caption: "User Flows: entry points, preview surfaces, commands, tools, copy/export paths, and selected support systems.",
      minImportance: 58,
      kinds: new Set(["product", "page-context", "entrypoint", "surface", "tool", "action", "export", "runtime", "content-helper"]),
      include: new Set(["clipboardFallbacks", "downloadsApi", "tabsApi", "readabilityHelpers", "turndownHelpers", "backgroundServiceWorker", "settingsRuntime", "localIndexedDb", "chromeStorageLocal"]),
    },
    tools: {
      caption: "Tool Map: Open Tools, their launch surfaces, and the runtime/storage systems they use.",
      minImportance: 50,
      kinds: new Set(["tool", "surface", "runtime", "storage", "export", "content-helper", "setting"]),
      include: new Set(["eye05", "openToolsMenu", "minibuffer", "previewWindow", "backgroundServiceWorker", "settingsRuntime", "localIndexedDb", "chromeStorageLocal"]),
    },
    runtime: {
      caption: "Runtime Map: service worker, content scripts, storage, Chrome APIs, helpers, security, and injection boundaries.",
      minImportance: 38,
      kinds: new Set(["runtime", "storage", "setting", "security", "content-helper", "export", "surface", "product"]),
      include: new Set(["eye05", "activeWebPage", "previewWindow", "pageScreenshot", "pageContentSelect", "sessionSnapshot", "miniWebBrowser", "multiBrowser"]),
    },
    full: {
      caption: "Full Graph: all raw nodes and edges. Use focus, search, or edge filters to reduce density.",
      minImportance: 0,
      kinds: null,
      include: null,
    },
    custom: {
      caption: "Focused View: custom neighborhood or isolated feature. Use Clear focus to return to the selected mode.",
      minImportance: 0,
      kinds: null,
      include: null,
    },
  };

  const nodes = RAW_NODES.map((node) => ({ ...node }));
  const links = RAW_LINKS.map((link) => ({ ...link }));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const allTags = Array.from(new Set(links.flatMap((link) => link.tags))).sort();

  const inbound = new Map(nodes.map((node) => [node.id, []]));
  const outbound = new Map(nodes.map((node) => [node.id, []]));
  const neighbors = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const link of links) {
    outbound.get(link.source)?.push(link);
    inbound.get(link.target)?.push(link);
    neighbors.get(link.source)?.add(link.target);
    neighbors.get(link.target)?.add(link.source);
  }

  const state = {
    viewMode: "story",
    baseViewMode: "story",
    selectedId: null,
    hoverId: null,
    search: "",
    edgeTag: "all",
    showAllLabels: false,
    showEdgeLabels: false,
    activeGroups: new Set(GROUPS),
    activeKinds: new Set(KIND_ORDER),
    customVisibleIds: null,
    pathStartId: null,
    pathEndId: null,
    pathIds: new Set(),
    pathEdgeKeys: new Set(),
    transform: d3.zoomIdentity,
  };

  const controls = {
    svg: document.getElementById("graph"),
    graphStatus: document.getElementById("graph-status"),
    viewCaption: document.getElementById("view-caption"),
    pathStrip: document.getElementById("path-strip"),
    searchInput: document.getElementById("search-input"),
    viewMode: document.getElementById("view-mode"),
    edgeTagFilter: document.getElementById("edge-tag-filter"),
    groupFilters: document.getElementById("group-filters"),
    kindFilters: document.getElementById("kind-filters"),
    legendGroups: document.getElementById("legend-groups"),
    legendKinds: document.getElementById("legend-kinds"),
    filtersPopover: document.getElementById("filters-popover"),
    legendPopover: document.getElementById("legend-popover"),
    morePopover: document.getElementById("more-popover"),
    detailsDrawer: document.getElementById("details-drawer"),
    details: document.getElementById("details"),
    showAllLabels: document.getElementById("show-all-labels"),
    showEdgeLabels: document.getElementById("show-edge-labels"),
  };

  const svg = d3.select(controls.svg);
  const root = svg.append("g").attr("class", "viewport-root");
  const linkLayer = root.append("g").attr("class", "link-layer");
  const edgeLabelLayer = root.append("g").attr("class", "edge-label-layer");
  const nodeLayer = root.append("g").attr("class", "node-layer");

  svg.append("defs").html(`
    <marker id="arrow-default" viewBox="0 -5 10 10" refX="18" refY="0" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,-5L10,0L0,5" fill="rgba(148, 163, 184, 0.62)"></path>
    </marker>
    <marker id="arrow-focus" viewBox="0 -5 10 10" refX="18" refY="0" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,-5L10,0L0,5" fill="#f5c451"></path>
    </marker>
  `);

  const zoom = d3.zoom()
    .scaleExtent([0.18, 4.5])
    .on("zoom", (event) => {
      state.transform = event.transform;
      root.attr("transform", event.transform);
      updateLabelVisibility();
    });

  svg.call(zoom);
  svg.on("click", () => clearSelectionOnly());

  let simulation = null;
  let renderedNodes = [];
  let renderedLinks = [];
  let preparedLinks = [];
  let linkSelection = null;
  let edgeLabelSelection = null;
  let nodeSelection = null;

  initUi();
  readViewHash();
  render();
  window.setTimeout(() => fitView(false), 380);

  window.addEventListener("resize", debounce(() => {
    applyForces();
    simulation?.alpha(0.35).restart();
  }, 180));

  function initUi() {
    controls.edgeTagFilter.innerHTML = `<option value="all">All edge tags</option>` + allTags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join("");

    controls.groupFilters.innerHTML = GROUPS.map((group) => {
      const count = nodes.filter((node) => visualGroup(node) === group).length;
      return `<label class="check-row"><span class="check-left"><input type="checkbox" value="${escapeHtml(group)}" checked><span class="color-dot" style="background:${GROUP_COLORS[group]}"></span><span>${escapeHtml(GROUP_LABELS[group])}</span></span><span class="check-count">${count}</span></label>`;
    }).join("");

    controls.kindFilters.innerHTML = KIND_ORDER.map((kind) => {
      const count = nodes.filter((node) => node.kind === kind).length;
      return `<label class="check-row"><span class="check-left"><input type="checkbox" value="${escapeHtml(kind)}" checked><span>${escapeHtml(titleCase(kind))}</span></span><span class="check-count">${count}</span></label>`;
    }).join("");

    controls.legendGroups.innerHTML = GROUPS.map((group) => {
      const count = nodes.filter((node) => visualGroup(node) === group).length;
      return `<div class="legend-item"><span class="legend-item-main"><span class="color-dot" style="background:${GROUP_COLORS[group]}"></span><span>${escapeHtml(GROUP_LABELS[group])}</span></span><span class="check-count">${count}</span></div>`;
    }).join("");

    controls.legendKinds.innerHTML = KIND_ORDER.map((kind) => {
      const count = nodes.filter((node) => node.kind === kind).length;
      return `<div class="legend-item"><span>${escapeHtml(titleCase(kind))}</span><span class="check-count">${count}</span></div>`;
    }).join("");

    document.getElementById("fit-button").addEventListener("click", () => fitView(true));
    document.getElementById("zoom-in").addEventListener("click", () => zoomBy(1.25));
    document.getElementById("zoom-out").addEventListener("click", () => zoomBy(0.8));
    document.getElementById("zoom-reset").addEventListener("click", () => fitView(true));
    document.getElementById("filters-button").addEventListener("click", () => togglePopover("filters-popover"));
    document.getElementById("legend-button").addEventListener("click", () => togglePopover("legend-popover"));
    document.getElementById("more-button").addEventListener("click", () => togglePopover("more-popover"));
    document.getElementById("details-close").addEventListener("click", clearSelectionOnly);

    document.querySelectorAll("[data-close-popover]").forEach((button) => {
      button.addEventListener("click", () => closePopover(button.dataset.closePopover));
    });

    controls.searchInput.addEventListener("input", debounce((event) => {
      state.search = normalizeSearch(event.target.value);
      state.customVisibleIds = null;
      state.viewMode = state.baseViewMode;
      render();
      writeViewHash();
    }, 120));

    controls.viewMode.addEventListener("change", (event) => {
      state.baseViewMode = event.target.value;
      state.viewMode = event.target.value;
      state.customVisibleIds = null;
      state.pathIds.clear();
      state.pathEdgeKeys.clear();
      render();
      window.setTimeout(() => fitView(true), 220);
      writeViewHash();
    });

    controls.edgeTagFilter.addEventListener("change", (event) => {
      state.edgeTag = event.target.value;
      render();
    });

    controls.groupFilters.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      if (event.target.checked) state.activeGroups.add(event.target.value);
      else state.activeGroups.delete(event.target.value);
      render();
    });

    controls.kindFilters.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      if (event.target.checked) state.activeKinds.add(event.target.value);
      else state.activeKinds.delete(event.target.value);
      render();
    });

    controls.showAllLabels.addEventListener("change", (event) => {
      state.showAllLabels = event.target.checked;
      updateFocusState();
    });

    controls.showEdgeLabels.addEventListener("change", (event) => {
      state.showEdgeLabels = event.target.checked;
      updateFocusState();
    });

    document.getElementById("download-svg").addEventListener("click", exportSvg);
    document.getElementById("download-json").addEventListener("click", exportJson);
    document.getElementById("copy-view-link").addEventListener("click", copyViewLink);
    document.getElementById("clear-focus").addEventListener("click", clearFocus);

    controls.details.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      const nodeButton = event.target.closest("[data-node-id]");
      if (actionButton) handleDetailAction(actionButton.dataset.action);
      if (nodeButton) selectNode(nodeButton.dataset.nodeId);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") clearFocus();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        controls.searchInput.focus();
      }
    });
  }

  function render() {
    closeAllPopovers(false);
    const graph = computeVisibleGraph();
    renderedNodes = graph.nodes;
    renderedLinks = graph.links;
    controls.viewCaption.textContent = VIEW_MODES[state.viewMode]?.caption || VIEW_MODES[state.baseViewMode]?.caption || "Focused view.";
    controls.graphStatus.textContent = `${renderedNodes.length}/${nodes.length} nodes - ${renderedLinks.length}/${links.length} edges`;

    preparedLinks = renderedLinks.map((link) => ({ ...link, source: nodeById.get(link.source), target: nodeById.get(link.target) })).filter((link) => link.source && link.target);

    linkSelection = linkLayer.selectAll("path")
      .data(preparedLinks, (d) => d.id)
      .join(
        (enter) => enter.append("path").attr("class", "graph-link").attr("marker-end", "url(#arrow-default)"),
        (update) => update,
        (exit) => exit.remove(),
      );

    edgeLabelSelection = edgeLabelLayer.selectAll("text")
      .data(preparedLinks, (d) => d.id)
      .join(
        (enter) => enter.append("text").attr("class", "edge-label").text((d) => d.label),
        (update) => update.text((d) => d.label),
        (exit) => exit.remove(),
      );

    nodeSelection = nodeLayer.selectAll("g")
      .data(renderedNodes, (d) => d.id)
      .join(
        (enter) => {
          const group = enter.append("g").attr("class", "node-group").call(dragBehavior());
          group.append("circle").attr("class", "node-circle").attr("r", radiusFor).attr("fill", colorForNode);
          group.append("text").attr("class", "node-label").attr("y", (d) => -radiusFor(d) - 8).text((d) => d.label);
          group.append("text").attr("class", "node-kind").attr("y", (d) => radiusFor(d) + 13).text((d) => titleCase(d.kind));
          group.on("mouseenter", (_, d) => { state.hoverId = d.id; updateFocusState(); });
          group.on("mouseleave", () => { state.hoverId = null; updateFocusState(); });
          group.on("click", (event, d) => { event.stopPropagation(); selectNode(d.id); });
          return group;
        },
        (update) => {
          update.select("circle").attr("r", radiusFor).attr("fill", colorForNode);
          update.select(".node-label").attr("y", (d) => -radiusFor(d) - 8).text((d) => d.label);
          update.select(".node-kind").attr("y", (d) => radiusFor(d) + 13).text((d) => titleCase(d.kind));
          return update;
        },
        (exit) => exit.remove(),
      );

    applyForces();
    simulation.alpha(0.85).restart();
    updateDetails();
    updateFocusState();
  }

  function computeVisibleGraph() {
    const query = state.search;
    let visibleIds = new Set();

    if (state.customVisibleIds) {
      visibleIds = new Set(state.customVisibleIds);
    } else if (query) {
      const matches = new Set(nodes.filter((node) => matchesNode(node, query)).map((node) => node.id));
      visibleIds = expandByHops(matches, 1);
    } else {
      for (const node of nodes) {
        if (isNodeVisibleInMode(node, state.viewMode)) visibleIds.add(node.id);
      }
    }

    const filteredNodes = nodes.filter((node) => visibleIds.has(node.id) && state.activeGroups.has(visualGroup(node)) && state.activeKinds.has(node.kind));
    const filteredIds = new Set(filteredNodes.map((node) => node.id));

    const filteredLinks = links.filter((link) => {
      if (!filteredIds.has(link.source) || !filteredIds.has(link.target)) return false;
      if (state.edgeTag !== "all" && !(link.tags || []).includes(state.edgeTag)) return false;
      if (state.viewMode === "story" && !state.search && !state.customVisibleIds) return isBackboneEdge(link);
      if (state.viewMode === "full") return true;
      if (state.customVisibleIds || state.search) return true;
      return isSkeletonEdge(link) || getImportance(nodeById.get(link.source)) >= 74 || getImportance(nodeById.get(link.target)) >= 74;
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }

  function isNodeVisibleInMode(node, mode) {
    if (mode === "full") return true;
    if (mode === "custom") return state.customVisibleIds?.has(node.id) || false;
    const rule = VIEW_MODES[mode] || VIEW_MODES.story;
    if (rule.include?.has(node.id)) return true;
    if (rule.kinds && !rule.kinds.has(node.kind)) return false;
    return getImportance(node) >= rule.minImportance;
  }

  function applyForces() {
    const width = graphWidth();
    const height = graphHeight();
    if (simulation) simulation.stop();
    simulation = d3.forceSimulation(renderedNodes)
      .force("link", d3.forceLink(preparedLinks).id((d) => d.id).distance(edgeDistance).strength(edgeStrength))
      .force("charge", d3.forceManyBody().strength((d) => -150 - getImportance(d) * 2.1))
      .force("collision", d3.forceCollide().radius((d) => radiusFor(d) + 16).iterations(2))
      .force("x", d3.forceX((d) => xForNode(d, width)).strength(0.25))
      .force("y", d3.forceY((d) => yForNode(d, height)).strength(0.06))
      .on("tick", ticked);
  }

  function ticked() {
    linkSelection?.attr("d", linkPath);
    edgeLabelSelection?.attr("x", (d) => midpoint(d).x).attr("y", (d) => midpoint(d).y);
    nodeSelection?.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
  }

  function updateFocusState() {
    const focusIds = new Set();
    const selectedIds = new Set();
    const neighborIds = new Set();
    const activeFocusId = state.selectedId || state.hoverId;

    if (activeFocusId) {
      selectedIds.add(activeFocusId);
      focusIds.add(activeFocusId);
      for (const id of neighbors.get(activeFocusId) || []) {
        neighborIds.add(id);
        focusIds.add(id);
      }
    }

    const pathIds = state.pathIds || new Set();
    const pathEdgeKeys = state.pathEdgeKeys || new Set();

    nodeSelection
      ?.classed("is-selected", (d) => selectedIds.has(d.id))
      .classed("is-neighbor", (d) => neighborIds.has(d.id))
      .classed("is-path", (d) => pathIds.has(d.id))
      .classed("is-muted", (d) => focusIds.size > 0 && !focusIds.has(d.id) && !pathIds.has(d.id));

    linkSelection
      ?.classed("is-backbone", (d) => isBackboneEdge(d))
      .classed("is-focus", (d) => isConnectedToFocus(d, selectedIds) || isConnectedToFocus(d, new Set([state.hoverId].filter(Boolean))))
      .classed("is-path", (d) => pathEdgeKeys.has(edgeKey(d)))
      .classed("is-muted", (d) => {
        if (pathEdgeKeys.has(edgeKey(d))) return false;
        if (focusIds.size === 0) return false;
        return !isConnectedToFocus(d, focusIds);
      })
      .attr("marker-end", (d) => pathEdgeKeys.has(edgeKey(d)) ? "url(#arrow-focus)" : "url(#arrow-default)")
      .attr("stroke-opacity", (d) => edgeOpacity(d, focusIds, pathEdgeKeys));

    edgeLabelSelection?.classed("hidden", (d) => !shouldShowEdgeLabel(d, focusIds, pathEdgeKeys));
    updateLabelVisibility();
    renderPathStrip();
  }

  function updateLabelVisibility() {
    if (!nodeSelection) return;
    const k = state.transform?.k || 1;
    const activeFocusId = state.selectedId || state.hoverId;
    const neighborSet = activeFocusId ? neighbors.get(activeFocusId) || new Set() : new Set();

    nodeSelection.select(".node-label").classed("hidden", (d) => {
      if (state.showAllLabels) return false;
      if (state.pathIds.has(d.id)) return false;
      if (state.selectedId === d.id || state.hoverId === d.id) return false;
      if (neighborSet.has(d.id)) return false;
      if (getImportance(d) >= 86) return false;
      if (k >= 1.85 && getImportance(d) >= 60) return false;
      if (k >= 2.7) return false;
      return true;
    });

    nodeSelection.select(".node-kind").classed("hidden", (d) => {
      if (state.selectedId === d.id || state.hoverId === d.id) return false;
      if (state.showAllLabels && getImportance(d) >= 76) return false;
      return true;
    });
  }

  function selectNode(nodeId) {
    state.selectedId = nodeId;
    updateDetails();
    updateFocusState();
    writeViewHash();
  }

  function updateDetails() {
    const node = nodeById.get(state.selectedId);
    if (!node) {
      controls.detailsDrawer.hidden = true;
      return;
    }
    controls.detailsDrawer.hidden = false;
    const inLinks = [...(inbound.get(node.id) || [])].sort(compareEdgeImportance).slice(0, 10);
    const outLinks = [...(outbound.get(node.id) || [])].sort(compareEdgeImportance).slice(0, 10);
    controls.details.innerHTML = `
      <div class="feature-summary">
        <div class="feature-meta">${escapeHtml(titleCase(node.kind))} - ${escapeHtml(GROUP_LABELS[visualGroup(node)])}</div>
        <h2>${escapeHtml(node.label)}</h2>
        <p>${escapeHtml(node.description)}</p>
      </div>
      <div class="feature-actions">
        <button type="button" data-action="one-hop">Show 1-hop</button>
        <button type="button" data-action="two-hop">Show 2-hop</button>
        <button type="button" data-action="isolate">Isolate</button>
        <button type="button" data-action="reset-view">Reset view</button>
        <button type="button" data-action="path-start">Path start</button>
        <button type="button" data-action="path-end">Path end</button>
        <button type="button" class="full-span" data-action="copy-json">Copy adjacency JSON</button>
      </div>
      <section class="details-section"><h3>Important inbound</h3>${renderEdgeList(inLinks, "inbound")}</section>
      <section class="details-section"><h3>Important outbound</h3>${renderEdgeList(outLinks, "outbound")}</section>
      <details class="raw-adjacency"><summary>Raw adjacency JSON</summary><pre>${escapeHtml(JSON.stringify(buildAdjacency(node.id), null, 2))}</pre></details>
    `;
  }

  function renderEdgeList(edgeList, direction) {
    if (!edgeList.length) return `<p class="muted">No ${direction} connections.</p>`;
    return `<div class="edge-list">${edgeList.map((edge) => {
      const otherId = direction === "outbound" ? edge.target : edge.source;
      const other = nodeById.get(otherId);
      return `<button class="edge-row" type="button" data-node-id="${escapeHtml(otherId)}"><strong>${escapeHtml(other?.label || otherId)}</strong><span>${escapeHtml((edge.tags || []).join(", "))}</span><small>${escapeHtml(edge.meaning || "")}</small></button>`;
    }).join("")}</div>`;
  }

  function handleDetailAction(action) {
    if (!state.selectedId) return;
    if (action === "one-hop") showNeighborhood(state.selectedId, 1);
    if (action === "two-hop") showNeighborhood(state.selectedId, 2);
    if (action === "isolate") { state.customVisibleIds = new Set([state.selectedId]); state.viewMode = "custom"; render(); fitSoon(); }
    if (action === "reset-view") { state.customVisibleIds = null; state.viewMode = state.baseViewMode; render(); fitSoon(); }
    if (action === "copy-json") copyText(JSON.stringify(buildAdjacency(state.selectedId), null, 2));
    if (action === "path-start") { state.pathStartId = state.selectedId; computeAndShowPath(); }
    if (action === "path-end") { state.pathEndId = state.selectedId; computeAndShowPath(); }
  }

  function showNeighborhood(nodeId, hops) {
    state.customVisibleIds = expandByHops(new Set([nodeId]), hops);
    state.viewMode = "custom";
    render();
    fitSoon();
  }

  function computeAndShowPath() {
    state.pathIds.clear();
    state.pathEdgeKeys.clear();
    if (!state.pathStartId || !state.pathEndId) { updateFocusState(); return; }
    const path = shortestPath(state.pathStartId, state.pathEndId);
    if (!path.length) { updateFocusState(); return; }
    state.pathIds = new Set(path);
    state.pathEdgeKeys = new Set();
    for (let i = 0; i < path.length - 1; i += 1) {
      const a = path[i];
      const b = path[i + 1];
      const direct = links.find((link) => link.source === a && link.target === b) || links.find((link) => link.source === b && link.target === a);
      if (direct) state.pathEdgeKeys.add(edgeKey(direct));
    }
    state.customVisibleIds = expandByHops(new Set(path), 1);
    state.viewMode = "custom";
    render();
    fitSoon();
  }

  function renderPathStrip() {
    if (!state.pathStartId && !state.pathEndId) { controls.pathStrip.hidden = true; return; }
    const start = nodeById.get(state.pathStartId)?.label || "not set";
    const end = nodeById.get(state.pathEndId)?.label || "not set";
    const pathLabels = [...state.pathIds].map((id) => nodeById.get(id)?.label || id);
    controls.pathStrip.hidden = false;
    controls.pathStrip.textContent = pathLabels.length ? `Path: ${pathLabels.join(" -> ")}` : `Path start: ${start} - end: ${end}`;
  }

  function shortestPath(startId, endId) {
    const queue = [startId];
    const visited = new Set([startId]);
    const previous = new Map();
    while (queue.length) {
      const current = queue.shift();
      if (current === endId) break;
      for (const next of getAdjacentIds(current)) {
        if (visited.has(next)) continue;
        visited.add(next);
        previous.set(next, current);
        queue.push(next);
      }
    }
    if (!visited.has(endId)) return [];
    const path = [];
    let cursor = endId;
    while (cursor) {
      path.unshift(cursor);
      if (cursor === startId) break;
      cursor = previous.get(cursor);
    }
    return path;
  }

  function getAdjacentIds(nodeId) {
    const result = new Set();
    for (const link of links) {
      if (link.source === nodeId) result.add(link.target);
      if (link.target === nodeId) result.add(link.source);
    }
    return result;
  }

  function expandByHops(seedIds, hops) {
    const result = new Set(seedIds);
    for (let i = 0; i < hops; i += 1) {
      const snapshot = [...result];
      for (const id of snapshot) {
        for (const next of getAdjacentIds(id)) result.add(next);
      }
    }
    return result;
  }

  function buildAdjacency(nodeId) {
    return {
      node: nodeById.get(nodeId),
      inbound: (inbound.get(nodeId) || []).map((edge) => summarizeEdge(edge, "inbound")),
      outbound: (outbound.get(nodeId) || []).map((edge) => summarizeEdge(edge, "outbound")),
    };
  }

  function summarizeEdge(edge, direction) {
    return {
      direction,
      source: edge.source,
      target: edge.target,
      tags: edge.tags,
      meaning: edge.meaning,
    };
  }

  function fitSoon() { window.setTimeout(() => fitView(true), 220); }

  function clearSelectionOnly() {
    state.selectedId = null;
    controls.detailsDrawer.hidden = true;
    updateFocusState();
    writeViewHash();
  }

  function clearFocus() {
    state.selectedId = null;
    state.hoverId = null;
    state.search = "";
    state.edgeTag = "all";
    state.customVisibleIds = null;
    state.viewMode = state.baseViewMode || "story";
    state.pathStartId = null;
    state.pathEndId = null;
    state.pathIds.clear();
    state.pathEdgeKeys.clear();
    controls.searchInput.value = "";
    controls.edgeTagFilter.value = "all";
    controls.detailsDrawer.hidden = true;
    render();
    fitSoon();
    writeViewHash();
  }

  function getImportance(node) {
    if (!node) return 40;
    return IMPORTANCE.get(node.id) ?? defaultImportanceByKind(node.kind);
  }

  function defaultImportanceByKind(kind) {
    return { product: 90, "page-context": 80, entrypoint: 78, surface: 72, tool: 68, action: 58, runtime: 54, storage: 48, setting: 50, security: 52, export: 44, "content-helper": 38 }[kind] ?? 40;
  }

  function visualGroup(node) { return VISUAL_GROUP_BY_KIND[node.kind] || "runtime"; }
  function colorForNode(node) { return GROUP_COLORS[visualGroup(node)] || "#60a5fa"; }
  function radiusFor(node) { return Math.max(8, Math.min(28, 6 + getImportance(node) * 0.22)); }
  function getRole(node) { return ROLE_BY_ID.get(node.id) || (node.kind === "tool" ? "tool" : node.kind === "runtime" ? "runtime" : node.kind === "storage" ? "storage" : "command"); }

  function xForNode(node, width) {
    const role = getRole(node);
    const col = ROLE_COLUMN[role] ?? 3;
    const padding = Math.max(90, width * 0.06);
    const usable = Math.max(300, width - padding * 2);
    return padding + (usable * col) / 7;
  }

  function yForNode(node, height) {
    const groupIndex = GROUPS.indexOf(visualGroup(node));
    const center = height / 2;
    const offset = (groupIndex - 2) * Math.min(86, height * 0.09);
    return center + offset;
  }

  function edgeDistance(link) {
    const sourceRole = getRole(link.source);
    const targetRole = getRole(link.target);
    if (sourceRole === targetRole) return 92;
    return 150;
  }

  function edgeStrength(link) {
    const tags = new Set(link.tags || []);
    if (tags.has("contains")) return 0.16;
    if (tags.has("launches")) return 0.2;
    if (tags.has("hosts")) return 0.18;
    if (tags.has("depends-on")) return 0.08;
    return 0.1;
  }

  function linkPath(d) {
    const sx = d.source.x || 0, sy = d.source.y || 0;
    const tx = d.target.x || 0, ty = d.target.y || 0;
    const dx = tx - sx, dy = ty - sy;
    const dr = Math.sqrt(dx * dx + dy * dy) * 1.25;
    return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
  }

  function midpoint(d) { return { x: ((d.source.x || 0) + (d.target.x || 0)) / 2, y: ((d.source.y || 0) + (d.target.y || 0)) / 2 }; }

  function isBackboneEdge(link) { return BACKBONE_EDGES.has(edgeKey(link)); }

  function isSkeletonEdge(link) {
    const source = nodeById.get(link.source || link.source?.id) || link.source;
    const target = nodeById.get(link.target || link.target?.id) || link.target;
    const importantPair = getImportance(source) >= 72 && getImportance(target) >= 72;
    const importantTag = (link.tags || []).some((tag) => IMPORTANT_EDGE_TAGS.has(tag));
    return isBackboneEdge(link) || (importantPair && importantTag);
  }

  function edgeOpacity(link, focusIds, pathEdgeKeys) {
    if (pathEdgeKeys.has(edgeKey(link))) return 0.95;
    if (focusIds.size) return isConnectedToFocus(link, focusIds) ? 0.78 : 0.025;
    if (state.viewMode === "full") return isSkeletonEdge(link) ? 0.22 : 0.035;
    return isSkeletonEdge(link) ? 0.38 : 0.065;
  }

  function shouldShowEdgeLabel(link, focusIds, pathEdgeKeys) {
    if (!state.showEdgeLabels) return false;
    if (pathEdgeKeys.has(edgeKey(link))) return true;
    if (focusIds.size) return isConnectedToFocus(link, focusIds);
    return isBackboneEdge(link) && state.viewMode !== "full";
  }

  function isConnectedToFocus(link, focusIds) { return focusIds.has(link.source?.id || link.source) || focusIds.has(link.target?.id || link.target); }
  function edgeKey(link) { return `${link.source?.id || link.source}->${link.target?.id || link.target}`; }

  function edgePriority(edge) {
    const tagScore = Math.max(...(edge.tags || []).map((tag) => TAG_PRIORITY[tag] || 20));
    const nodeScore = Math.max(getImportance(nodeById.get(edge.source)), getImportance(nodeById.get(edge.target)));
    return tagScore + nodeScore * 0.35;
  }

  function compareEdgeImportance(a, b) { return edgePriority(b) - edgePriority(a); }

  function dragBehavior() {
    return d3.drag()
      .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
  }

  function fitView(animate) {
    if (!renderedNodes.length) return;
    const width = graphWidth();
    const height = graphHeight();
    const xs = renderedNodes.map((d) => d.x || 0);
    const ys = renderedNodes.map((d) => d.y || 0);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const boxW = Math.max(80, maxX - minX);
    const boxH = Math.max(80, maxY - minY);
    const scale = Math.min(1.8, Math.max(0.22, 0.86 / Math.max(boxW / width, boxH / height)));
    const tx = width / 2 - scale * (minX + maxX) / 2;
    const ty = height / 2 - scale * (minY + maxY) / 2;
    const next = d3.zoomIdentity.translate(tx, ty).scale(scale);
    const target = animate ? svg.transition().duration(420) : svg;
    target.call(zoom.transform, next);
  }

  function zoomBy(factor) { svg.transition().duration(180).call(zoom.scaleBy, factor); }
  function graphWidth() { return controls.svg.clientWidth || window.innerWidth || 1200; }
  function graphHeight() { return controls.svg.clientHeight || window.innerHeight || 760; }

  function togglePopover(id) {
    const el = document.getElementById(id);
    const willOpen = el.hidden;
    closeAllPopovers(false);
    el.hidden = !willOpen;
    updatePopoverButtons();
  }

  function closePopover(id) { document.getElementById(id).hidden = true; updatePopoverButtons(); }
  function closeAllPopovers(update = true) {
    for (const el of document.querySelectorAll(".popover")) el.hidden = true;
    if (update) updatePopoverButtons();
  }

  function updatePopoverButtons() {
    document.getElementById("filters-button").setAttribute("aria-expanded", String(!controls.filtersPopover.hidden));
    document.getElementById("legend-button").setAttribute("aria-expanded", String(!controls.legendPopover.hidden));
    document.getElementById("more-button").setAttribute("aria-expanded", String(!controls.morePopover.hidden));
  }

  function exportSvg() {
    const sourceSvg = controls.svg;
    const clone = sourceSvg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(Math.round(sourceSvg.clientWidth || 1400)));
    clone.setAttribute("height", String(Math.round(sourceSvg.clientHeight || 900)));
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = Array.from(document.styleSheets).map((sheet) => {
      try { return Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join(""); } catch { return ""; }
    }).join("");
    clone.insertBefore(style, clone.firstChild);
    downloadBlob(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }), "eye05-feature-graph-v2.svg");
  }

  function exportJson() {
    const payload = { nodes: RAW_NODES, links: RAW_LINKS, exportedAt: new Date().toISOString() };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), "eye05-feature-graph-v2.json");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function copyViewLink() { writeViewHash(); copyText(location.href); }
  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
  }

  function writeViewHash() {
    const params = new URLSearchParams();
    params.set("view", state.baseViewMode || "story");
    if (state.selectedId) params.set("selected", state.selectedId);
    if (state.search) params.set("q", state.search);
    if (state.edgeTag !== "all") params.set("edge", state.edgeTag);
    history.replaceState(null, "", `#${params.toString()}`);
  }

  function readViewHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    const view = params.get("view");
    if (view && VIEW_MODES[view]) { state.baseViewMode = view; state.viewMode = view; controls.viewMode.value = view; }
    const q = params.get("q") || "";
    state.search = normalizeSearch(q); controls.searchInput.value = q;
    const edge = params.get("edge") || "all";
    if (edge === "all" || allTags.includes(edge)) { state.edgeTag = edge; controls.edgeTagFilter.value = edge; }
    const selected = params.get("selected");
    if (selected && nodeById.has(selected)) state.selectedId = selected;
  }

  function titleCase(value) { return String(value).replace(/-/g, " ").replace(/\w/g, (char) => char.toUpperCase()); }
  function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
  function normalizeSearch(value) { return String(value || "").trim().toLowerCase(); }
  function matchesNode(node, query) { return [node.id, node.label, node.kind, node.description].some((part) => String(part || "").toLowerCase().includes(query)); }
  function debounce(fn, delay) { let timer = null; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }
})();
