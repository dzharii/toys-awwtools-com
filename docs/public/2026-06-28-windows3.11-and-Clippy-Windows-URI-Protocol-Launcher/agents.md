# AGENTS.md

## A00 Project Mission

Build a polished browser-based Windows URI Protocol Launcher that looks and behaves like a small Windows 3.11 / Program Manager desktop.

The current app is a functional reference launcher. The target app is a retro desktop experience: category icons on a desktop, draggable program-group windows, launchable URI items, search, details, copy actions, template handling, platform warnings, and a concise Clippy-style assistant.

The project is demo-oriented but must feel complete. It should not look like a modern dashboard with a retro skin. It should feel like a small retro shell that happens to launch real modern Windows URI links.

## B00 Required Source Notes

Before implementation, reread these files in this order.

1. `suggestions001-1.md`

   Full project design note. It defines the mission, non-goals, required data model, launch behavior, Windows 3.11 immersion requirements, search/discovery requirements, platform boundaries, dependency cleanup, phased workflow, quality bar, and acceptance criteria.

   Important note from this file: `old-index-with-all-ms-dash-links.html` has the MS-style URI links that should be included. Filter deprecated and non-working links where possible. Do not include `shell:`, `control.exe`, `explorer.exe shell:::{...}`, PowerShell commands, native commands, or privileged launch paths as launcher items.

2. `suggestions001-2.md`

   User-experience and grouping narrative. It describes what the user should see: a Windows 3.11-style desktop, program-group icons, group windows, icon view, details view, status bars, and the main category grouping. Use this file to design the actual desktop layout and category behavior.

3. `suggestions001-3.md`

   Reduced Clippy script specification. It defines when Clippy should speak, what Clippy should say, what messages should be removed, rate limits, event rules, search guidance, template guidance, launch guidance, copy guidance, and final assistant acceptance criteria.

These files are authoritative. This file is the short working contract. If details conflict, preserve the product goal and use best judgment.

## C00 Core Product Requirements

Implement a Windows 3.11-inspired desktop inside the browser.

The initial screen must show program-group icons, not a giant list or card dashboard.

The first-level desktop groups should include Windows Apps, Settings, Capture, Store, System and Security, Network and Devices, Accessibility, Privacy, Personalization, Gaming and Xbox, Legacy and Optional, All Links, and Help.

Double-clicking a group opens a classic program-group window. Single-click selects. Enter opens the selected icon. On touch or compact layouts, provide a practical one-click fallback while preserving the desktop metaphor.

Program-group windows must have classic window styling: active/inactive title bars, close controls, content area, status bar, focus state, and draggable movement. Windows should be focusable, closable, and restorable from a simple window list or taskbar if minimized behavior is implemented.

Default category windows should use icon view. Dense groups such as All Links, System and Security, Privacy, and Legacy and Optional may default to details view. Details view must expose URI, category, status, and short description.

The app must remain useful as a reference on non-Windows systems. Show a clear non-Windows banner, keep browsing/search/copy available, and do not pretend launches will work.

## D00 Data and URI Requirements

Use a single normalized data source for all launcher items.

Every item must have a stable ID, title, display URI, open URI, description, type, category, optional subcategory, status labels, search tags, icon key, launchable flag, and notes.

Do not scatter links across HTML.

Concrete URI items may have an Open action. Template URI items must not pretend to be ready-to-launch. They need Copy Template and Edit Template behavior, and direct launch should be blocked or clearly warned until placeholders are replaced.

Every launch action must be user-initiated. Prefer real anchor links with `href` for launch behavior.

After a launch attempt, never claim success. Use neutral text such as `Launch requested: <uri>` because browsers do not reliably confirm whether Windows opened the target application.

## E00 Visual Style Requirements

Use the Windows 3.11 visual language intentionally.

Use gray system surfaces, beveled borders, recessed panels, raised buttons, dark-blue active title bars, gray inactive title bars, dotted focus rectangles, compact typography, small status text, classic menu behavior, and bitmap-inspired icons.

Avoid modern dashboard styling: no glassmorphism, no neon gradients, no large hero cards, no pill-heavy UI, no rounded modern Fluent look, no emoji icons, no external icon fonts, and no CDN assets.

Icons should be local inline SVG or CSS-drawn assets with a retro bitmap feel. Keep them simple, crisp, low-color, and consistent.

## F00 Category Grouping Rules

Windows Apps contains familiar app-level protocols such as Paint, Calculator, Clock, Camera, Photos, Edge, Store, Weather, Phone Link, Widgets, Windows Backup, Windows Security, Outlook, Teams, To Do, Clipchamp, Media Player, Movies and TV, News, Quick Assist, Surface, and Copilot where present.

Settings opens a Settings Groups window instead of dumping every `ms-settings:` link. Subgroups include Accounts, Apps, Devices, Accessibility, Network, Personalization, Privacy, System, Time and Language, and Update and Security.

Capture contains Snipping Tool, Rectangle Snip, Window Snip, Freeform Snip, Delayed Snip, Screen Recording, modern screenclip capture/discover links, Screen Sketch, Photos Viewer, Photos Video Trim, Camera, Camera Picker, and related graphics-capture/privacy links.

Store contains Store Home, Downloads and Updates, Library, Store Settings, Store category links, Search, Publisher Search, Product Page, Review, Association links, and App Installer. Store Product and Review links are templates unless populated with real product IDs.

System and Security contains Windows Security, Defender links, Windows Update, update history, optional updates, activation, recovery, troubleshoot, developers, Find my device, device encryption, device enrollment, Cloud Experience Host, OOBE, Search repair, and backup-related links.

Network and Devices contains Bluetooth, Wi-Fi, Ethernet, VPN, proxy, cellular, hotspot, airplane mode, data usage, printers, projection, USB, touchpad, mouse, typing, pen, wheel, mobile devices, add phone, DirectAccess, proximity, and device discovery.

Accessibility contains Narrator, Magnifier, captions, color filters, contrast, display accessibility, visual effects, keyboard, mouse, pointer, text cursor, audio, speech recognition, eye control, hearing aids, and related links.

Privacy contains Camera, Microphone, Location, Contacts, Calendar, Email, Messaging, Phone Calls, Documents, Downloads, Pictures, Videos, Music Library, File System Access, App Diagnostics, Automatic File Downloads, Notifications, Radios, Motion, Eye Tracker, Voice Activation, Speech, Activity History, Feedback, and Graphics Capture permissions.

Legacy and Optional contains deprecated, removed, app-dependent, region-dependent, hardware-dependent, and experimental links. Keep these honest and clearly marked instead of mixing them into the primary happy-path groups.

All Links is the full searchable reference and should default to a dense details view.

Help explains URI protocols, browser prompts, why nothing opened, how to copy links into Win+R, how templates work, and why some links are legacy or machine-dependent.

## G00 Clippy Requirements

Clippy is a concise technical guide, not a mascot that narrates everything.

Use `suggestions001-3.md` as the source for exact Clippy behavior. The important rule is: Clippy speaks only when the message helps the user understand something they may reasonably miss.

Clippy should speak for first-run orientation, non-Windows behavior, first launch/browser prompt, templates, deprecated or machine-dependent links, search problems, category context where useful, repeated launch confusion, copy failure, and manual Help.

Clippy should not speak for routine focus changes, ordinary item selection, closing windows, clearing search, ordinary copies after the first one, or anything obvious.

Clippy must be rate-limited. Use at least 20 seconds between normal automatic tips, no more than five automatic tips in five minutes, and no repeated automatic tip in the same session unless explicitly requested.

Clippy must never auto-launch an external URI. Assistant actions may open Help, focus Search, open a category, copy a URI, edit a template, or arrange windows, but external protocol launching must always be a direct user action.

## H00 Search and Discovery Requirements

Global search is required. Pressing `/` should focus search unless the user is typing in an input or dialog field.

Search must match title, URI, description, category, subcategory, status labels, and tags.

Search must understand practical aliases such as `wifi` for Wi-Fi, `snip` or `screenshot` for Snipping Tool, `mic` for microphone, `defender` for Windows Security, `bt` for Bluetooth, and task phrases such as `camera privacy`, `update history`, or `store product`.

No-results and too-many-results states must be useful. Provide concise guidance rather than empty UI.

Search results should open in a retro Find/Search Results window and allow Open, Copy, Details, and Jump to Group.

## I00 Dependency and Asset Rules

Use the provided classic stylesheet library, but clean or limit it to Windows 3.1 / Windows 3.11-relevant assets. Keep required shared files and license notices. Remove unrelated runtime skins and demos where safe.

Use the provided `clippy-js` assets if available. Keep Clippy as default. Optional agent selection is allowed only if additional agents load reliably. If Clippy assets fail, the launcher must still work.

Do not add external runtime dependencies unless necessary. Do not use CDN fonts, external icon libraries, remote images, or network-only assets.

The final app should work from local disk where possible. If a local server is needed for development, document it, but preserve a final easy-to-run artifact.

## J00 Autonomous Workflow

The coding agent must work phase by phase and continue autonomously.

For every phase, do this cycle.

Plan the phase.

Read the relevant files and code before editing.

Implement the smallest coherent improvement that completes the phase.

Review the changed code for regressions, duplication, broken references, missing data fields, invalid URIs, visual drift, and noisy assistant behavior.

Test what can be tested locally. At minimum, load or parse the HTML, check JavaScript syntax, inspect asset paths, and verify key UI flows manually or with available tooling.

Fix issues found during review and testing.

Move to the next phase without asking for confirmation.

Do not stop because the project is broad. Use best judgment and complete the most coherent version possible.

## K00 Recommended Implementation Phases

Phase 1: inspect the current app, source dataset, dependency folders, old launcher HTML, classic stylesheet files, and Clippy assets.

Phase 2: normalize the URI dataset and categorize links into the required program groups. Filter deprecated and non-working items where possible, but keep useful legacy references clearly marked.

Phase 3: replace the modern dashboard with the Windows 3.11 desktop shell.

Phase 4: implement program-group windows, focus, dragging, close behavior, window list or taskbar, status bars, icon view, and details view.

Phase 5: implement launcher item behavior: Open, Copy, Details, Template Editor, platform warning, and launch-request status.

Phase 6: implement global search, search results window, aliases, filters, no-result guidance, and Jump to Group.

Phase 7: implement Clippy controller, event dispatch, rate limits, first-run guidance, search guidance, template guidance, launch guidance, and helpful pattern-based tips.

Phase 8: polish icons, menus, help topics, accessibility, keyboard navigation, compact layout, non-Windows behavior, and visual consistency.

Phase 9: final review, cleanup unused runtime assets, preserve licenses, validate dataset, and update implementation notes.

## L00 Non-Negotiable Acceptance Criteria

The app opens as a Windows 3.11-style desktop, not a modern card dashboard.

The user can browse grouped launcher icons, open group windows, search across all links, inspect details, copy URIs, and launch concrete URI links.

The app includes all intended MS-style/browser-launchable URI links from the source launcher, filtered and marked appropriately.

The app excludes non-URI command launchers such as `shell:`, `control.exe`, `explorer.exe shell:::{...}`, PowerShell commands, and privileged/native execution paths.

The app uses user-initiated `href`-style URI launching and never claims that an external app opened successfully.

Templates are handled as templates and cannot be launched unchanged as if they were concrete links.

Non-Windows users see a clear warning but can still browse and copy.

Clippy is useful, concise, rate-limited, and silent for routine actions.

Search is fast and useful for practical user terms.

The UI remains compact, discoverable, accessible, and visually coherent with Windows 3.11.

The coding agent reviews and fixes each phase before continuing.
