# eye05 Feature Graph

---

A00 Purpose

---

This folder contains a static documentation asset for the eye05 project: an interactive feature graph that explains how the product's user-facing surfaces, local tools, runtime systems, storage systems, helper scripts, and browser APIs relate to one another.

The graph is designed as a read-only exploration tool. It is not an editor, a runtime dependency analyzer, or a generated import graph. It is a curated product and architecture map. Its purpose is to help a reader understand eye05 as a system: where the user enters, which surfaces they interact with, which tools they can open, which runtime services coordinate the work, and where local data is stored.

The artifact is intentionally simple to run. It is a three-file static web application made from `index.html`, `styles.css`, and `app.js`. It uses D3 from jsDelivr, so there is no build step, no bundler, no package installation, and no local server requirement in normal usage. Open `index.html` in a browser and use the graph directly.

---

B00 What the graph shows

---

The graph describes eye05 at the product-feature level. The nodes are not TypeScript files. They are named features and feature-adjacent systems: `Preview Window`, `Open Tools Menu`, `Mini Web Browser`, `Page Content Select`, `Bookmarks Core`, `Background Service Worker`, `Local IndexedDB`, and similar concepts.

The edges are not imports. They are semantic product relationships. An edge can mean that one feature opens another, hosts another, depends on another, stores data in another, launches another, captures content through another, or coordinates another. This makes the graph more useful for documentation than a raw source graph. A raw source graph would answer "which module imports which module." This graph answers "how does this product work as a set of features."

The graph includes both user-facing and implementation-facing elements. User-facing elements include link preview, long-press overlay, Actions, Open Tools, Mini Web Browser, Multi Browser, Bookmarks Manager, Page Screenshot, Page Content Select, Session Snapshot, Rich Text to Markdown, Markdown to HTML, Notifications and Reminders, and Media Preview. Implementation-facing elements include the background service worker, content scripts, Chrome APIs, local storage, IndexedDB, helper scripts, DNR header bypass, readability helpers, Turndown helpers, and clipboard fallback flows.

The graph is intentionally complete enough to preserve raw architectural information, but it does not show all of that information at once by default. The first screen is a curated product story. Deeper views reveal implementation detail.

---

C00 Why this graph exists

---

eye05 is a dense browser extension. It is not a single-purpose popup or a simple content script. It runs across several Manifest V3 contexts, including content scripts, a background service worker, extension-hosted tool pages, iframe helpers, injected capture helpers, and local settings/storage surfaces. It also contains several separate user workflows: link preview, page reading, Markdown extraction, bookmarking, reminder delivery, local browsing, multi-page browsing, screenshot capture, region clipping, session archiving, and format conversion.

A normal README can describe these flows in prose, but prose becomes hard to navigate when the system grows. A conventional diagram can show a few major boxes, but it often hides too much detail. A raw graph can show everything, but it quickly becomes a visual hairball. This artifact sits between those extremes. It preserves raw graph data while adding view modes, focus behavior, search, neighborhood expansion, and a details drawer.

The graph is meant for daily project understanding. A maintainer can open it before changing a feature and inspect the feature's neighborhood. A documentation author can use it to find a clean product story. A reviewer can switch to Runtime Map to understand browser APIs and local persistence. A new contributor can start in Product Story mode and move gradually into Full Graph mode.

---

D00 Design principle

---

The main design principle is progressive disclosure.

The graph contains many nodes and edges, but the user should not have to interpret all of them at once. Version 2 starts with a reduced Product Story view because most readers first need to understand the main product route: the user is on an active web page, enters through hover or long-press, reaches link preview, opens the floating preview window, uses Actions or Open Tools, and then works with local tools coordinated by runtime and storage systems.

The complete graph still exists. It is available through Full Graph mode, raw JSON export, and per-node raw adjacency JSON. The difference is that raw information is no longer the default reading experience. The default experience is organized around the user's mental model.

---

E00 Mental model of the product

---

The graph is organized around a product flow that can be read from left to right.

The user begins on an active web page. From there, the user can interact with a hover eye bubble, a long-press overlay, typed commands, or a tool launcher. Link preview routes through the Link Preview Controller, which opens or updates the Preview Window. The Preview Window is the main floating surface. From it, the user can run page-level Actions or open extension-hosted tools.

The tools branch into several work categories. Some tools transform content, such as Rich Text to Markdown and Markdown to HTML. Some collect page context, such as Page Screenshot and Page Content Select. Some organize work, such as Bookmarks Manager and Notifications and Reminders. Some provide browsing workspaces, such as Mini Web Browser and Multi Browser. Session Snapshot archives a group of tabs into exportable output. Media Preview handles focused image inspection.

Behind these surfaces, the Background Service Worker coordinates privileged extension work. It works with Chrome APIs such as Tabs, Scripting, Downloads, Alarms, and Declarative Net Request. It also coordinates local persistence through `chrome.storage.local` and local IndexedDB.

This model is visible in the graph, but it is intentionally not drawn as a static flowchart. It remains a graph because many features have cross-connections. For example, Mini Web Browser is both a tool and a preview wrapper. Bookmarks affect the Bookmarks Manager and URL Picker. The Background Service Worker coordinates screenshots, reminders, selection sessions, snapshots, tabs, downloads, and storage.

---

F00 View modes

---

The graph supports several view modes. Each mode answers a different question.

`Product Story` is the default mode. It shows the main product narrative and hides low-level implementation noise. This is the mode to use when explaining eye05 to someone who does not know the project yet.

`User Flows` expands the product story with more action and output paths. It is useful when reviewing how a user moves from a page gesture to a result such as copied Markdown, saved bookmark, screenshot, selected content, reminder, exported session, or opened browser workspace.

`Tool Map` focuses on the extension-hosted tools and their support systems. It is useful when working on the Open Tools menu, tool visibility, local tool pages, or documentation of the tool suite.

`Runtime Map` focuses on implementation infrastructure: service worker, content scripts, settings runtime, local storage, IndexedDB, Chrome APIs, and helper scripts. It is useful when working on permissions, runtime messaging, local persistence, capture helpers, and feature boundaries.

`Full Graph` shows all nodes and all available relationships. It is the most complete view, but it is not the most readable view. Use it as a reference or debugging view after you already know what part of the system you want to inspect.

---

G00 Nodes

---

A node represents one named feature or feature-adjacent concept. Nodes are grouped visually into a smaller set of visual groups so that the default graph is easier to read.

`Product root` represents the product as a whole. In this graph, that is `eye05`.

`User surface` represents things the user can directly see or interact with, including entrypoints, surfaces, and actions. Examples include `Hover Eye Bubble`, `Long-Press Overlay`, `Preview Window`, `Actions Menu`, and `Open Tools Menu`.

`Local tool` represents extension-hosted tools. Examples include `Mini Web Browser`, `Multi Browser`, `Bookmarks Manager`, `Page Screenshot`, `Page Content Select`, `Session Snapshot`, `Rich Text to Markdown`, `Markdown to HTML`, `Notifications and Reminders`, and `Media Preview`.

`Runtime/support` represents systems that coordinate behavior but are not normally thought of as product destinations. Examples include `Background Service Worker`, `Content Scripts`, `Settings Runtime`, `Readability Helpers`, `Turndown Helpers`, `Clipboard Fallbacks`, and Chrome runtime APIs.

`Data/export` represents storage and output systems. Examples include `Local IndexedDB`, `chrome.storage.local`, bookmark tables, reminder tables, URL picker signals, and export mechanisms.

The original, more specific node kind is preserved in the details drawer and filter controls. The simplified visual grouping is only a presentation layer. It reduces cognitive load without deleting information.

---

H00 Edges

---

An edge represents a typed relationship between features. Each edge has tags and a human-readable meaning. For example, an edge from `Open Tools Menu` to `Page Screenshot` might mean that the Open Tools surface launches the Page Screenshot tool. An edge from `Page Screenshot` to `Background Service Worker` might mean that screenshot capture depends on privileged service worker coordination.

The graph uses semantic edge tags rather than raw dependency labels. Important tags include `opens`, `launches`, `hosts`, `commands`, `captures`, `extracts`, `converts`, `stores-in`, `reads-from`, `writes-to`, `depends-on`, `configures`, `gates`, `coordinates`, `notifies`, `exports`, and `closes`.

Edges are intentionally de-emphasized in the overview. In a dense graph, showing every edge with the same visual strength makes the diagram unreadable. Version 2 uses stronger visibility for backbone edges and selected-neighborhood edges. Other edges become visible as the user focuses a node, changes mode, uses filters, or opens Full Graph mode.

The raw edge information remains available in the selected feature drawer and raw JSON export.

---

I00 Product Story mode

---

Product Story mode is the best starting point. It is a curated view of the product's primary user journey.

The story begins with `eye05` and `Active Web Page`. The active page matters because eye05 operates while the user is already browsing. The extension does not start from a standalone dashboard. It starts from a web page, a link, a selection, a tab, or a browsing task.

The next layer contains entrypoints: `Hover Eye Bubble` and `Long-Press Overlay`. These are deliberate, low-friction interaction points. They help the user preview or act on content without immediately opening new tabs.

The next layer contains preview and command surfaces: `Link Preview Controller`, `Preview Window`, `Actions Menu`, `Open Tools Menu`, and `Minibuffer`. These nodes are central because they connect the user's browsing context to the extension's broader tool system.

The next layer contains the major local tools. These are the product's functional destinations: content conversion, reminders, browsing workspaces, bookmark management, screenshot capture, content selection, session export, and media preview.

The final layer contains support systems such as `Background Service Worker`, `Settings Runtime`, `Local IndexedDB`, and `chrome.storage.local`. These nodes show that the product is local-first and browser-integrated without forcing the reader to start with implementation detail.

---

J00 User Flows mode

---

User Flows mode is designed for understanding how a person uses the product end to end.

A link triage flow starts from the active page, passes through hover or long-press, reaches the Link Preview Controller, opens the Preview Window, and then either displays a page preview or routes through Mini Web Browser wrapping. From there, the user can run Actions, copy content, open a tool, save a bookmark, or continue browsing.

A content extraction flow starts from the active page or preview frame. It can go through Reader Mode, Copy Page Markdown, Rich Text to Markdown, Markdown to HTML, Page Screenshot, or Page Content Select. These flows often use Readability helpers, Turndown helpers, and clipboard fallback behavior.

A capture flow starts from the active page or selected tabs. Page Screenshot captures the visible page and extracts a description. Page Content Select injects a selection overlay and collects selected content blocks. Session Snapshot captures multiple tabs, builds a preview, exports a ZIP or HTML output, and can close selected tabs afterward.

A persistence flow passes through local storage. Bookmarks Core stores manual and activity bookmarks in IndexedDB. Notifications and Reminders stores reminder records in IndexedDB. Settings Runtime stores settings in `chrome.storage.local`. URL Picker stores suggestion signals locally.

This mode is useful when the question is not "what files exist" but "what happens when a user does something."

---

K00 Tool Map mode

---

Tool Map mode focuses on the extension-hosted tools.

The `Open Tools Menu` and `Minibuffer` are the main launch surfaces. They connect to Rich Text to Markdown, Markdown to HTML, Notifications and Reminders, Mini Web Browser, Multi Browser, Bookmarks Manager, Page Screenshot, Page Content Select, Session Snapshot, and Media Preview.

Each tool has a different relationship to runtime support. Rich Text to Markdown and Markdown to HTML are mostly local conversion tools with clipboard behavior. Notifications and Reminders depends on reminder storage and alarm delivery. Mini Web Browser depends on embedded navigation, URL picker, and page actions. Multi Browser depends on workspace persistence and URL picker behavior. Bookmarks Manager depends on Bookmarks Core and IndexedDB. Page Screenshot and Page Content Select require background coordination and injected helpers. Session Snapshot uses tab listing, capture, export, and optional tab closing.

Tool Map mode is useful when adding, removing, renaming, or documenting tools. It shows the tool suite as a product surface rather than as isolated pages.

---

L00 Runtime Map mode

---

Runtime Map mode focuses on the implementation architecture.

The central node is `Background Service Worker`. This is the privileged Manifest V3 runtime context that coordinates operations the page cannot perform directly. It interacts with local storage, IndexedDB, tabs, scripting, alarms, downloads, and declarative net request rules.

`Content Scripts` represent the page-side layer. They create page-visible UI such as preview surfaces, hover or long-press interactions, text expansion, tab trail overlays, iframe helpers, and injected extraction flows.

`Settings Runtime` controls feature visibility and behavior. It gates features such as Open Tools visibility, long-press behavior, bookmarks, reminders, URL picker behavior, Mini Web Browser behavior, logging, and security-sensitive features such as framing-header bypass.

`Local IndexedDB` and `chrome.storage.local` represent local-first persistence. The graph distinguishes these stores because they serve different kinds of data. Settings and certain tool documents live in `chrome.storage.local`. Bookmarks, reminders, and URL picker signals live in IndexedDB.

Runtime Map mode should be used when checking how a feature crosses permission boundaries or when deciding where a new feature should store data.

---

M00 Full Graph mode

---

Full Graph mode is the complete reference view.

It is intentionally not the default because it contains all the raw density. Full Graph mode is useful after the user has narrowed the problem. For example, after selecting `Page Content Select`, the user might switch to Full Graph to see all lower-level relationships to overlay injection, draft storage, clipboard fallback, and downloads.

Full Graph mode is also useful for export. If you need a complete SVG or raw JSON snapshot for documentation, switch to Full Graph before exporting. If you need a cleaner diagram, use Product Story, Tool Map, or Runtime Map instead.

The important principle is that full data should be available, but full data should not be the first thing the user sees.

---

N00 Search

---

Search is designed to preserve context. A search result should not isolate a node so aggressively that the user cannot understand its relationships. When searching for a feature, the graph expands around matching nodes so that nearby relationships remain visible.

For example, searching for `screenshot` should reveal `Page Screenshot`, its launch surfaces, its extraction helper, its background coordination path, and related copy/export behavior. Searching for `bookmark` should reveal the bookmark action, Bookmarks Core, Bookmarks Manager, bookmark tables, and URL picker relationships.

Search is most useful when paired with the details drawer. Search to find a node, click the node, then inspect the important inbound and outbound connections.

---

O00 Focus behavior

---

Clicking a node focuses the graph.

Focused mode highlights the selected node, emphasizes the selected node's direct relationships, and dims unrelated nodes and edges. This is the most important interaction in the graph because it converts a dense network into a local explanation.

The details drawer opens after selection. It explains what the selected feature does, shows important inbound connections, shows important outbound connections, and provides actions such as one-hop neighborhood, two-hop neighborhood, isolate feature, path selection, and raw adjacency inspection.

Hovering a node is lighter than clicking. Hovering temporarily improves local readability by surfacing nearby labels and local relationships. Clicking makes the focus persistent.

---

P00 Neighborhood expansion

---

The graph supports one-hop and two-hop neighborhood expansion.

A one-hop neighborhood shows the selected node plus directly connected nodes. This is useful for understanding a feature's immediate dependencies and outputs.

A two-hop neighborhood shows the selected node, direct neighbors, and neighbors of those neighbors. This is useful when a feature is part of a larger workflow. For example, `Page Content Select` connects to the overlay, draft store, background service worker, clipboard fallbacks, downloads, and active page. A two-hop view can reveal how those systems then connect to storage, scripting, or export behavior.

Neighborhood expansion is a compromise between the full graph and a single-node view. It gives enough context without returning to visual overload.

---

Q00 Shortest path

---

The graph includes shortest-path support so a user can ask how two features are related.

This is useful when the relationship is not obvious. For example, the path from `Hover Eye Bubble` to `Page Screenshot` is not direct, but it can be understood through preview and tool launch surfaces. The path from `Bookmarks Manager` to `URL Picker` can reveal that bookmark state affects suggestion and navigation behavior. The path from `Session Snapshot` to `Chrome Downloads API` can show the export route.

Shortest path is not a proof of architectural causality. It is a navigation aid. It helps the reader move through the feature graph without scanning hundreds of edges.

---

R00 Details drawer

---

The details drawer is the main explanatory surface for individual features.

The top of the drawer gives the selected feature's name, visual group, raw kind, and description. This is written as documentation text rather than code.

The connection sections show important inbound and outbound relationships in human-readable form. These sections are intentionally sorted by importance, so launch, host, command, capture, storage, and export relationships are usually more visible than lower-level support edges.

The raw adjacency JSON is still present, but it is collapsed. This keeps the drawer useful for both product explanation and technical inspection. A documentation reader can ignore raw JSON. A maintainer can open it when needed.

---

S00 Filters and legend

---

The graph includes filters for visual group, raw node kind, and edge tag.

Visual group filters are broad and reader-friendly. They let the user hide or show product root, user surfaces, local tools, runtime/support, and data/export groups.

Raw kind filters are more technical. They preserve the original kind system: product, page-context, entrypoint, surface, tool, action, runtime, storage, setting, security, export, and content-helper.

Edge tag filtering is useful when the user wants to inspect one relationship type. For example, filtering to `launches` shows launch relationships. Filtering to `stores-in` shows storage relationships. Filtering to `captures` highlights capture paths.

The legend is a popover, not a permanent panel. It exists when needed but does not permanently consume graph space.

---

T00 Exports

---

The app supports SVG export and raw JSON export.

SVG export is useful for documentation screenshots or diagrams. For clean documentation exports, use Product Story mode or Tool Map mode, fit the graph, select or clear focus depending on the desired emphasis, then export SVG.

Raw JSON export is useful for maintaining or reviewing the graph data. It includes the node and edge model used by the visualization. This is not a generated source-of-truth artifact. It is the curated graph data used by this documentation asset.

---

U00 Local usage

---

To use the graph locally, unzip the archive and open `index.html` in a browser.

The app loads D3 from jsDelivr. If the machine is offline, the graph will not render unless D3 is vendored locally and the script tag is updated. The current version keeps the app small and simple by using the CDN.

No local server is required for ordinary use. The app does not call backend APIs and does not write to disk. It runs entirely in the browser as a read-only documentation viewer.

---

V00 File structure

---

The application has three main files plus this README.

`index.html` defines the static document structure. It contains the app shell, graph SVG, toolbar controls, popovers, details drawer, and script/style references.

`styles.css` defines the visual system: compact toolbar, full-viewport graph canvas, popovers, drawer, nodes, links, labels, buttons, and responsive behavior.

`app.js` contains the graph data and interactive behavior. It defines nodes, edges, view modes, importance scores, filters, D3 simulation, zoom/pan behavior, focus behavior, details rendering, shortest-path logic, export logic, and hash-state handling.

The simplicity is intentional. This artifact is documentation infrastructure, not a production application. A three-file structure keeps it easy to inspect, copy, edit, and archive.

---

W00 Data model

---

The graph model has two primary collections: nodes and links.

A node contains an identifier, a label, a kind, and a description. The identifier is stable and code-like. The label is human-readable. The kind is the detailed category. The description explains the feature.

A link contains a source id, a target id, a list of semantic tags, and a meaning string. The tags allow filtering and visual logic. The meaning string supports the details drawer.

A simplified example looks like this:

```js
{
  id: "previewWindow",
  label: "Preview Window",
  kind: "surface",
  description: "Main floating surface that can host previews, actions, and extension tools."
}
```

```js
{
  source: "linkPreviewController",
  target: "previewWindow",
  tags: ["opens", "coordinates"],
  meaning: "The controller creates or updates the floating preview surface."
}
```

The graph is directed, but the UI often supports undirected exploration for convenience. For example, neighborhood expansion and shortest path can traverse both inbound and outbound edges so that the user can understand relationship proximity without manually switching direction.

---

X00 Why the default view is not Full Graph

---

The full graph is too dense to be the opening view. It contains useful information, but opening with everything visible creates unnecessary mental load. The user is forced to decode structure before understanding purpose.

Version 2 instead starts from a curated product story. This is a deliberate documentation choice. The graph should first answer "what is this product and how does it work?" before it answers "what are all the possible relationships?"

The full graph remains available because removal of raw data would create a different problem. A documentation asset should not hide implementation reality permanently. It should stage that reality in layers.

---

Y00 How to maintain the graph

---

When adding a new feature, start by deciding whether it is user-facing, tool-facing, runtime-facing, or storage-facing. Add the node with a stable id, clear label, detailed kind, and one-sentence description.

Then add semantic edges. Prefer relationships that explain product behavior. Do not add every possible source-level association unless it helps a reader understand the system. For example, if a helper exists only because of implementation mechanics, connect it to the feature it supports and to the runtime that injects or hosts it. Do not flood the graph with incidental details.

After adding nodes and edges, decide where the feature belongs in view modes. A major new user-facing tool should appear in Product Story or Tool Map. A low-level helper should usually appear only in Runtime Map or Full Graph. A storage table should appear in Runtime Map and Full Graph, but not necessarily in Product Story.

Finally, assign or adjust importance only when the default visibility should change. Importance is a presentation tool. It is not a measure of engineering difficulty.

---

Z00 Recommended documentation workflow

---

Use Product Story mode for introductory documentation. It gives the cleanest explanation of the extension's purpose and primary interaction route.

Use User Flows mode when writing workflow documentation. It helps explain how link triage, content extraction, capture, reminders, bookmarks, and exports move through the system.

Use Tool Map mode when documenting Open Tools. It shows the tool suite and its support systems without making the reader parse every runtime helper.

Use Runtime Map mode when documenting architecture, permissions, storage, or background coordination.

Use Full Graph mode when auditing the complete graph, exporting raw data, or checking whether any relationship has been omitted.

For screenshots, avoid Full Graph unless the screenshot's purpose is to demonstrate complexity. Most documentation images should use Product Story, Tool Map, or a focused one-hop neighborhood.

---

AA00 Summary

---

The eye05 Feature Graph is a static, interactive documentation artifact for understanding eye05 as a product and architecture. It presents the extension as a network of user surfaces, local tools, runtime systems, storage systems, helper scripts, and browser APIs.

The graph is deliberately not a raw import diagram. It is a curated semantic feature graph. It preserves raw information, but it presents that information through progressive disclosure: Product Story first, then user flows, tool relationships, runtime architecture, and full graph detail.

The most important value of the artifact is not that it shows many nodes. Its value is that it lets a reader move from a simple product explanation to detailed architectural inspection without switching tools or reading the source code first.
