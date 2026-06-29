Note: old-index-with-all-ms-dash-links.html has all ms- links we want to include. but fileter deprecated one. filter other non working links. 
---

A00 Windows 3.11 URI Launcher Design Note for Autonomous Coding Agent

---

This design note defines the implementation plan for a browser-based Windows URI launcher that recreates a polished Windows 3.11-style desktop experience. The target user is a Windows user who wants to explore and launch Windows system surfaces, Microsoft apps, Settings pages, Store links, Snipping Tool actions, and related URI protocol links from a playful retro desktop interface.

The product is not intended to replace the Start menu or Settings search as a daily productivity tool. Its value is experiential. It should feel like opening a small retro operating environment inside the browser, then discovering that the old-looking icons can launch real modern Windows applications and system pages. The result should be polished enough to demo without explanation, dense enough to be useful as a reference, and playful enough to feel intentionally designed rather than merely skinned.

The coding agent must complete the work autonomously. The agent must not stop after a phase and ask the user what to do next. The agent must plan, research, implement, review, fix, verify, and continue into the next phase until the full project is complete. When details are ambiguous, the agent must use best judgment and preserve the user goal: a polished Windows 3.11-inspired browser launcher for real Windows URI protocol links.

---

B00 Current Baseline

---

The repository snapshot contains a current single-page launcher that already solves several important problems: it has a data model for URI entries, categories, search, filters, status badges, direct launch links, copy actions, dense/card presentation, and a compact reference-style user interface. This existing implementation is the functional baseline, not the visual target.

The repository snapshot also contains a classic stylesheet library that supports multiple retro UI themes, including Windows 3.1 / Windows 3.11. The dependency library includes optional JavaScript modules such as lists, tabs, and an experimental window manager. The project also includes `clippy-js` with multiple assistant agents, including Clippy and other characters.

The implementation task is therefore not "make another card grid." The task is to transform the existing launcher into a desktop metaphor. The URI dataset and launch semantics should be preserved and improved, while the entire interaction model should move toward a retro Program Manager / Windows 3.11 experience.

---

C00 Product Goal

---

The finished application must behave like a miniature Windows 3.11 desktop running inside a browser tab.

The desktop should contain category icons. Each category icon opens a draggable window. Each window contains a curated group of launchable items. Each launchable item is represented as a retro icon with a label, optional short description, and protocol URI. Users should be able to double-click an item to launch the real Windows URI. Users should also be able to copy the URI, inspect details, search across everything, and understand when a link may be unavailable on their OS.

The experience must work in modern browsers but should visually reject modern web-app aesthetics. The UI should not look like a dark neumorphic dashboard, a Bootstrap admin panel, or a generic card list. It should look like a retro Windows shell, while still using modern usability patterns where they improve discoverability.

The most important experience goals are:

| Goal                    | Meaning                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| Retro immersion         | The user should immediately recognize a Windows 3.x / Program Manager-inspired environment.                   |
| Discoverability         | The user should not need to know URI schemes in advance; categories, search, and Clippy should guide them.    |
| Real utility            | Every launchable item should be a real URI link, copyable, searchable, and documented.                        |
| Safety and transparency | The app should explain browser prompts, Windows-only behavior, deprecated links, and install-dependent links. |
| Polish                  | Window movement, focus, icons, status bars, menus, empty states, and assistant tips should feel complete.     |

---

D00 Non-Goals

---

This application must not attempt to silently run native commands. It must not use `shell:`, `control.exe`, `explorer.exe shell:::{...}`, PowerShell commands, ActiveX, browser extensions, native messaging, or any privileged bridge. The launch mechanism is browser URI navigation through `href` links or equivalent user-triggered navigation.

This application must not pretend that every URI works on every machine. Some links depend on Windows version, installed inbox apps, Store updates, region, policy, Copilot+ hardware, deprecated components, or app associations. The UI must present those limitations clearly.

This application must not become a full operating system simulator. It should borrow the visual language and interaction style of Windows 3.11, but the goal is still a focused URI launcher. Avoid adding unrelated games, fake file systems, fake command prompts, or novelty features that distract from launching and discovering Windows URI links.

This application must not rely on CDNs or external runtime assets. It should run from local disk. If a build step is added, the final deliverable should remain easy to open, inspect, and move.

---

E00 Required Experience Model

---

The main screen should be a desktop. It should have a patterned or solid classic teal/gray desktop background, a top or bottom control area inspired by Program Manager, and desktop icons representing major launcher groups.

The first visible desktop icon groups should be:

| Desktop group         | Purpose                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Windows Apps          | App-level protocols such as Paint, Calculator, Store, Photos, Camera, Edge, Phone Link, Widgets, Security, and Snipping Tool. |
| Settings              | `ms-settings:` deep links, grouped into subcategories.                                                                        |
| Store                 | `ms-windows-store:` product, search, library, download, and category links.                                                   |
| Capture and Media     | Snipping Tool, Photos, Camera, audio, video, screen capture, and media protocols.                                             |
| System and Security   | Windows Security, Defender, Update, Backup, device enrollment, OOBE, Search repair, and system control surfaces.              |
| Network and Devices   | Bluetooth, Wi-Fi, printers, projection, mobile devices, USB, Camera, touchpad, pen, and nearby devices.                       |
| Accessibility         | Narrator, Magnifier, captions, contrast, pointer, keyboard, speech, hearing, and visual effects settings.                     |
| Experimental / Legacy | Deprecated, install-dependent, undocumented, or hardware-dependent links.                                                     |
| All Links             | Complete searchable list for power users.                                                                                     |
| Help                  | Explains how protocol launches work, browser prompts, Windows-only behavior, and how to test links.                           |

Double-clicking a desktop group opens a window. Single-clicking selects it. Keyboard navigation should be possible. Enter should open a selected icon or focused item. Escape should close menus and dialogs where appropriate.

Windows should be draggable, focusable, closable, minimizable where feasible, and restorable from a simple taskbar or window list. Overlapping windows should preserve z-index order. A user should be able to open multiple category windows at once. The design may use the provided `wm.js` module if it is practical, but the agent must review the module before adopting it and must use best judgment if a custom simpler window manager is more reliable.

---

F00 Windows 3.11 Immersion Requirements

---

Windows 3.11 immersion means more than adding gray backgrounds. The following details must be intentionally designed.

The visual surface should use classic beveled borders, recessed panels, raised buttons, system gray backgrounds, dark blue active title bars, gray inactive title bars, pixel-like small controls, and square or nearly square layout rhythm. Windows should have title bars with control buttons, content areas, status bars, and menu bars where useful.

Typography should feel like classic Windows without depending on proprietary old fonts. Use system-safe fallbacks such as `MS Sans Serif`, `Tahoma`, `Arial`, or generic sans-serif. Prefer small text sizes, tight spacing, and high contrast. Avoid modern large hero typography, rounded pills, glassmorphism, neon gradients, and excessive shadows.

Icons should be simple, high-contrast, and retro. They may be SVG, but they should look bitmap-inspired: limited palette, hard edges, low detail, no soft gradients unless intentionally subtle, no modern Fluent-style effects, no glass, no 3D emoji style. Each category icon should be visually distinct. Each item icon can be derived from category, protocol family, or explicit app identity.

The desktop metaphor should include small details that make the experience feel complete: selection rectangles, dotted focus outlines, disabled states, menu separators, status text, modal warning dialogs, "About" dialog, help topics, a classic resize grip, and window titles such as "Program Manager - Windows URI Launcher" or "Settings - Network and Internet."

Modern usability may be included only when translated into the retro style. Search can exist, but it should appear as a "Find" dialog, a toolbar field inside a window, or a Program Manager-style command surface. Filters can exist, but they should look like tabs, list boxes, checkboxes, or menu commands rather than modern chips.

---

G00 Required Data Model

---

The existing URI dataset must be preserved and normalized. Do not manually scatter protocol links across HTML. Use a single source of truth.

Each item must have these fields:

| Field         | Requirement                                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | Stable string ID, not just an array index.                                                                                                                                    |
| `title`       | Human-readable name shown under icon and in lists.                                                                                                                            |
| `uri`         | Display URI shown to the user.                                                                                                                                                |
| `openUri`     | Actual URI used by the launch link. Usually equal to `uri`.                                                                                                                   |
| `description` | Short explanation of what the link opens.                                                                                                                                     |
| `type`        | At minimum `app`, `setting`, `store`, `capture`, `system`, `legacy`, or `help`.                                                                                               |
| `category`    | Primary category shown in desktop windows.                                                                                                                                    |
| `subCategory` | Optional deeper grouping for large settings areas.                                                                                                                            |
| `status`      | Array of labels such as `Official`, `Legacy`, `Deprecated`, `Hardware dependent`, `Install dependent`, `Policy dependent`, `Region dependent`, `Template`, or `Experimental`. |
| `tags`        | Search tags and aliases.                                                                                                                                                      |
| `iconKey`     | Key used to choose a retro SVG icon.                                                                                                                                          |
| `launchable`  | Boolean. False for templates that require user replacement before launch.                                                                                                     |
| `notes`       | Optional limitations and usage warnings.                                                                                                                                      |

The agent must migrate the existing embedded `ITEMS` array into this normalized structure. It can keep the dataset inside `index.html` for a single-file build, or move it into a separate `data/links.js` during development and inline it during final packaging. The source of truth must remain readable and maintainable.

The UI must distinguish concrete launch links from templates. For example, `ms-settings:display` is concrete. `ms-photos:viewer?fileName=C:\Path\image.jpg` is a template unless the user can edit the file path. Template links should show an "Edit" or "Copy Template" action rather than a misleading "Open" action.

---

H00 Launch Behavior Requirements

---

Every launch action must be user-initiated. Prefer a normal `<a href="...">` anchor for launch. The browser may prompt the user before opening an external application; that is expected and should be explained.

On Windows, a launch click should attempt to open the URI. On non-Windows systems, the UI should stay usable but show a clear banner saying that Windows protocol launches will probably not work on the current platform. The banner must not hide the app. The user should still be able to browse links and copy URIs.

The app should detect platform conservatively. Use `navigator.userAgentData.platform` when available and fall back to `navigator.platform` and user-agent checks. The app must not block launching solely because detection is uncertain. It should warn, not overrule, unless the user explicitly enables "demo mode."

Launch buttons should have visible states:

| State         | Behavior                                                  |
| ------------- | --------------------------------------------------------- |
| Open          | Concrete link on a likely Windows system.                 |
| Open Anyway   | Concrete link on non-Windows or unknown system.           |
| Copy          | Copies URI to clipboard.                                  |
| Copy Template | Copies a URI template requiring edits.                    |
| Edit Template | Opens a small retro dialog to replace placeholder values. |
| Disabled      | Only for non-launchable documentation rows.               |

After a launch attempt, the app cannot reliably know whether Windows opened the target app. It should not claim success. It should show neutral status such as "Launch requested" or "Browser handed this URI to Windows."

---

I00 Clippy and Assistant Requirements

---

The application must include a Clippy-style assistant. Clippy should guide first-time users, respond to meaningful actions, and provide contextual suggestions without becoming noisy.

The initial assistant should default to Clippy. If the `clippy-js` library makes other agents available, the UI may allow selecting agents such as Merlin, Genie, Peedy, Rover, Rocky, Links, Genius, F1, or Bonzi. Agent selection must be secondary. The experience should not depend on every agent working.

Clippy must have these controls:

| Control      | Requirement                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| Hide         | Hides the assistant for the session.                                               |
| Mute tips    | Stops automatic suggestions but keeps manual help available.                       |
| Change agent | Opens a small assistant-selection dialog if multiple agents load successfully.     |
| Help         | Shows a concise guide to launching, copying, searching, and Windows-only behavior. |

Clippy must be helpful but rate-limited. Use a small tip engine with events, cooldowns, and priority. Avoid random chatter immediately after every hover. Do not show more than one automatic tip within 20 seconds. Do not show more than five automatic tips in five minutes. Do not repeat the same tip in a session unless the user explicitly asks for help.

Clippy should react to these events:

| Event                                | Example tip behavior                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| First load on Windows                | Explain double-clicking category icons and browser launch prompts.             |
| First load off Windows               | Explain demo mode and copy-only usefulness.                                    |
| User opens a category window         | Suggest search or explain what that category contains.                         |
| User hovers a template link          | Explain that placeholder values must be edited before launching.               |
| User clicks a deprecated link        | Warn that it may not exist on modern Windows.                                  |
| User copies a URI                    | Explain how to paste it into Win+R or a browser address bar.                   |
| User searches and gets no results    | Suggest aliases such as "Bluetooth", "camera", "privacy", "update", or "snip". |
| User repeatedly opens Settings links | Suggest using the Settings category or Find dialog.                            |
| User opens Snipping Tool links       | Explain `ms-screenclip:` behavior and browser/Windows prompts.                 |
| User opens Help                      | Stop automatic hints briefly so the user can read.                             |

Clippy suggestions may include clickable links into the application, not arbitrary external links. Suggested links should open category windows, focus a specific launcher item, copy a URI, or open help. Clippy must not auto-launch Windows applications. The user must explicitly click the launcher link.

---

J00 Search, Discovery, and Navigation

---

The desktop metaphor must remain discoverable with hundreds of links. The design should combine category browsing with fast search.

Search should be available globally. Pressing `/` should focus search unless the user is typing in an input field. Search should match title, URI, description, category, subcategory, status, and tags. Search results should be shown inside a retro "Find" or "Search Results" window, not as a modern overlay. Results should be grouped by category and should show enough context to know what will launch.

Filters should exist for at least these states: Apps, Settings, Store, Official, Legacy, Deprecated, Install dependent, Hardware dependent, Template. The UI should avoid overwhelming the user with all filters at once. A compact "View" menu or tab row is acceptable.

There should be at least one "All Links" window for power users. This window should include a dense list view with columns for name, URI, category, and status. It should support keyboard navigation, copy, open, and details.

Each item should have a details dialog. The details dialog should show title, description, URI, category, status, tags, notes, launch button, copy button, and a short explanation of limitations. For template items, the details dialog should show editable placeholder fields.

---

K00 Accessibility, Robustness, and Browser Constraints

---

The application should be usable with keyboard and screen readers. Retro visuals must not break basic accessibility.

Every interactive control must be focusable. Focus must be visible. Windows must trap focus only for modal dialogs, not for normal category windows. Menu bars and desktop icons should be navigable with keyboard. Buttons and links must have accessible names. Icon-only controls must include `aria-label`.

Color contrast must remain acceptable despite retro styling. Do not use low-contrast gray text on gray backgrounds for important labels. Disabled items may be lower contrast, but they must still be readable.

The app must gracefully handle local-file execution. It may be opened as `file://.../index.html`. Avoid features that fail under `file://` unless a development server is explicitly documented. If modules require loading from separate files and browser restrictions interfere, either inline the final app or provide a minimal local server script for development while preserving a working final artifact.

Do not rely on detecting whether an external protocol launch succeeded. Browsers intentionally do not provide reliable success callbacks for arbitrary URI schemes. The app should only state that launch was requested.

---

L00 Suggested File and Module Structure

---

The agent may choose a final structure, but this structure is recommended during implementation:

| Path                           | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `index.html`                   | Main app shell and final entry point.                            |
| `src/data/links.js`            | Normalized URI dataset migrated from the current app.            |
| `src/data/categories.js`       | Category definitions, icon keys, ordering, and descriptions.     |
| `src/ui/desktop.js`            | Desktop icons, selection, keyboard navigation.                   |
| `src/ui/windows.js`            | Window creation, focus, drag, close, minimize, restore.          |
| `src/ui/search.js`             | Search index, matching, result window.                           |
| `src/ui/launcher.js`           | Launch/copy/template behavior and platform warning.              |
| `src/ui/clippy-controller.js`  | Assistant loading, event routing, tip cooldowns, session state.  |
| `src/ui/icons.js`              | Retro SVG icon generation or inline icon registry.               |
| `src/styles/win311.css`        | Project-specific Windows 3.11 layout and polish.                 |
| `vendor/classic-win3x/`        | Cleaned subset of the classic stylesheet library.                |
| `vendor/clippy/`               | Cleaned subset of clippy-js assets required by selected agents.  |
| `docs/implementation-notes.md` | Notes about dependencies, licenses, and tested browser behavior. |

If no build tooling exists, implement with plain HTML, CSS, and JavaScript. If adding tooling, keep it minimal and justify it in `docs/implementation-notes.md`. The final app should be easy to open and run locally.

---

M00 Dependency Cleanup Requirements

---

The classic stylesheet library currently contains many themes and skins. This project should retain only what is needed for Windows 3.1 / 3.11 unless the agent finds a strong reason to keep a small shared utility file.

The cleanup target is:

| Keep                                | Reason                                                         |
| ----------------------------------- | -------------------------------------------------------------- |
| Windows 3.x theme CSS               | Primary visual target.                                         |
| Windows 3.1 / 3.11 skin files       | Required for authentic styling.                                |
| Common layout CSS if required       | Keep only if the Windows 3.x theme depends on it.              |
| `wm.js` only if adopted             | Use only after reviewing reliability.                          |
| `tabs.js` / `lists.js` only if used | Keep only if they improve native-feeling controls.             |
| Required assets                     | Keep only images, cursors, or variables needed by chosen skin. |
| License files                       | Required for dependency compliance.                            |

The cleanup must remove unused CDE, Mac OS 9, Windows 9x, Windows XP, screenshots, demos, source SCSS not needed at runtime, and unrelated skins unless required for development reference. If removing files might break imports, inspect CSS references first and fix paths carefully.

The Clippy dependency should also be cleaned thoughtfully. Keep the default Clippy agent and assets. Keep additional agents only if the agent selector is implemented and they load reliably. Remove unused build/demo files if they are not used at runtime. Preserve license notices.

---

N00 Visual and Interaction Design Requirements

---

The main app should open with a Program Manager-like desktop. A title area should identify the app as "Windows URI Launcher" or "Program Manager - URI Launcher." It should include a menu bar with at least File, View, Search, Assistant, and Help.

The File menu should contain actions such as Open Selected, Copy URI, Close Window, and Exit Demo. Exit Demo can close open windows or show a humorous "It is now safe to close this browser tab" dialog. It must not attempt to close the browser tab unless user-triggered and supported.

The View menu should contain Desktop Icons, All Links, Sort by Name, Sort by Category, Show Deprecated Links, and Show Templates. These actions should affect the current desktop/window state.

The Search menu should contain Find, Clear Search, and maybe Find Next. Search should be useful, not decorative.

The Assistant menu should contain Show Clippy, Hide Clippy, Mute Tips, and Change Agent.

The Help menu should contain Help Topics, About, What is a URI protocol?, Why did my browser ask for permission?, and Why did nothing open?

Windows must have title bars, close buttons, content panes, and status bars. The active window should have a visibly active title bar. Inactive windows should look inactive. Dragging should not break text selection inside content panes.

Desktop icons should use double-click to open by default, matching classic desktop behavior. Single click selects. On touch devices or mobile widths, provide a one-click fallback or explicit Open button in a selection panel.

---

O00 Icon Design Requirements

---

The icon system must be cohesive. Do not use random emoji. Do not use external icon fonts. Do not pull online icons. Create small inline SVG icons or CSS-drawn icons that look like retro bitmap icons.

Icon style rules:

| Rule        | Requirement                                                                             |
| ----------- | --------------------------------------------------------------------------------------- |
| Palette     | Prefer 8 to 16 colors per icon.                                                         |
| Edges       | Use hard shapes and crisp strokes.                                                      |
| Size        | Design for 32x32 and 48x48 display.                                                     |
| Identity    | Icons should suggest the app or category without copying modern trademarks too closely. |
| Consistency | Use shared outline weight, label placement, and highlight/shadow style.                 |
| Fallback    | Every item must resolve to an icon even if no specific icon exists.                     |

Category icon examples:

| Category      | Icon concept                                           |
| ------------- | ------------------------------------------------------ |
| Apps          | Program group window with small colored app tiles.     |
| Settings      | Gear inside a classic control panel window.            |
| Store         | Shopping bag rendered as a 16-color pixel object.      |
| Capture       | Scissors over a dotted rectangle.                      |
| Media         | Film strip and speaker.                                |
| Network       | Two small computers connected by a line.               |
| Security      | Shield with checker highlight.                         |
| Accessibility | Hand, eye, or keyboard symbol in a classic icon frame. |
| Legacy        | Yellowed document with warning triangle.               |
| All Links     | Cabinet or index card drawer.                          |
| Help          | Question mark on a manual.                             |

App-specific icons can be lighter-weight. Paint can use a brush and palette. Calculator can use keypad blocks. Camera can use a simple camera body. Photos can use a landscape frame. Edge can use a globe/browser window rather than a modern Edge logo. Windows Security can use a shield. Store can use a bag. Snipping Tool can use scissors.

---

P00 Data Categorization Requirements

---

The current list must be reorganized into human-oriented categories. Do not simply preserve arbitrary source categories from the old card UI.

Use this top-level grouping:

| Group                          | Contents                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apps                           | User-facing app launchers such as Paint, Calculator, Photos, Camera, Store, Edge, Clock, Weather, Outlook, Teams, Phone Link, Widgets, Media Player, Clipchamp, To Do. |
| Capture                        | Snipping Tool, Screen Sketch, Photos viewer/editing, Camera picker, graphics capture privacy settings.                                                                 |
| Store                          | Store home, search, library, updates, product, review, publisher, association, category, App Installer.                                                                |
| Settings - Accounts            | Work/school, email accounts, sign-in, Windows Hello, family, sync, backup.                                                                                             |
| Settings - Apps                | Apps, default apps, startup apps, optional features, apps for websites, video playback.                                                                                |
| Settings - Devices             | Bluetooth, printers, touchpad, typing, USB, pen, wheel, camera, mobile devices.                                                                                        |
| Settings - Accessibility       | Narrator, magnifier, captions, contrast, pointer, keyboard, mouse, speech, hearing, eye control.                                                                       |
| Settings - Network             | Wi-Fi, Ethernet, VPN, proxy, cellular, hotspot, data usage, airplane mode.                                                                                             |
| Settings - Personalization     | Background, colors, Start, taskbar, lock screen, themes, fonts, dynamic lighting.                                                                                      |
| Settings - Privacy             | Camera, microphone, location, contacts, documents, downloads, file system, speech, voice activation, diagnostics.                                                      |
| Settings - System              | Display, sound, notifications, power, storage, clipboard, Remote Desktop, multitasking.                                                                                |
| Settings - Time and Language   | Date/time, language, region, keyboard, speech, IME pages.                                                                                                              |
| Settings - Update and Security | Windows Update, activation, recovery, troubleshoot, Defender, developers, delivery optimization.                                                                       |
| System and Security            | Windows Security, Defender deep links, enrollment, OOBE, Cloud Experience Host, Search repair.                                                                         |
| Gaming and Xbox                | Game Bar, Xbox app, captures, gaming settings, overlays.                                                                                                               |
| Legacy and Optional            | Deprecated, installed-only, hardware-only, region-only, or removed components.                                                                                         |

A link may appear in one primary category and multiple search tags. Avoid duplicating actual items unless the duplicate is intentionally a different URI.

---

Q00 Platform and Boundary Conditions

---

The app must handle these cases explicitly:

| Case                           | Expected behavior                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Running on Windows             | Normal launch buttons. Explain browser prompt behavior.                                            |
| Running on macOS/Linux         | Show banner; keep browsing/copying enabled; launch buttons say Open Anyway or are visually warned. |
| Running in mobile browser      | Show responsive desktop; use one-click open buttons; do not rely only on double-click.             |
| Browser blocks custom protocol | Show help text explaining that browser policy or app registration may block launch.                |
| URI target not installed       | User may see nothing or an OS prompt; app should not claim failure or success.                     |
| Deprecated URI                 | Show warning badge and details note.                                                               |
| Hardware-dependent URI         | Show hardware badge and details note.                                                              |
| Template URI                   | Require edit/copy-template flow.                                                                   |
| Clipboard unavailable          | Fall back to selecting text and instructing user to copy manually.                                 |
| Clippy fails to load           | App must continue without Clippy and show a quiet "Assistant unavailable" state in Help.           |
| CSS dependency missing         | App must still render readable fallback UI.                                                        |
| Local file restrictions        | Avoid module loading failures in final deliverable or document local-server fallback.              |

---

R00 Autonomous Agent Workflow Directive

---

The coding agent must use this cycle for every implementation phase:

| Step      | Required behavior                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan      | Inspect current files, identify the minimal coherent change for the phase, and write a short internal implementation plan.                                            |
| Research  | Review relevant local files, dependency docs, existing code structure, and browser constraints before editing. Use external research only if available and necessary. |
| Implement | Make the phase changes in code, preserving working behavior from prior phases.                                                                                        |
| Review    | Read the changed files and check for regressions, duplication, broken references, invalid URIs, and style drift.                                                      |
| Test      | Run available local tests, static checks, or at minimum open/parse the HTML and inspect console-risk areas.                                                           |
| Fix       | Correct issues discovered in review/testing before moving on.                                                                                                         |
| Record    | Update implementation notes or comments only where useful.                                                                                                            |
| Continue  | Move to the next phase autonomously without asking the user for confirmation.                                                                                         |

The agent must not stop because the project is broad. If an ideal implementation is too large, the agent must complete the best coherent version of the phase, document tradeoffs, and continue.

The agent must not ask the user to choose minor design details. Use best judgment. The user has already defined the direction: Windows 3.11-inspired, polished, compact, discoverable, fun, functional, and autonomous.

The agent must not defer review until the end. Every phase requires its own review and fix loop.

---

S00 Quality Bar

---

The finished project must meet this quality bar:

| Area             | Requirement                                                                           |
| ---------------- | ------------------------------------------------------------------------------------- |
| Visual coherence | The entire app looks like one Windows 3.11-inspired environment.                      |
| Functionality    | Links are launchable or clearly marked as templates/non-launchable.                   |
| Search           | Search works across all item fields and remains fast.                                 |
| Windows          | Category windows open, focus, close, move, and remain usable.                         |
| Clippy           | Assistant can guide the user without excessive interruptions.                         |
| Non-Windows      | App explains limitation and remains useful.                                           |
| Data integrity   | No duplicate accidental entries; no broken object schema; no missing required fields. |
| Accessibility    | Keyboard navigation and visible focus are usable.                                     |
| Maintainability  | Data, icons, UI behavior, and styling are separated enough to modify safely.          |
| Runtime          | No external network dependency required for normal operation.                         |

---

T00 Acceptance Criteria

---

The implementation is accepted only when all of these criteria are met.

| ID     | Criterion                                                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| AC-001 | Opening `index.html` shows a Windows 3.11-style desktop, not the previous modern card dashboard.                                 |
| AC-002 | Desktop category icons are visible and organized by user-oriented categories.                                                    |
| AC-003 | Single-click selects desktop icons and double-click opens category windows.                                                      |
| AC-004 | Category windows contain launchable URI items with retro icons and readable labels.                                              |
| AC-005 | Each concrete URI item has an `href`-based Open action.                                                                          |
| AC-006 | Each URI item has a Copy action.                                                                                                 |
| AC-007 | Template URIs are visibly marked and do not pretend to be ready-to-open concrete links.                                          |
| AC-008 | Search finds links by title, URI, description, tags, category, and status.                                                       |
| AC-009 | Search results are usable from keyboard and mouse.                                                                               |
| AC-010 | The app distinguishes app protocols from Settings deep links.                                                                    |
| AC-011 | The app distinguishes official, deprecated, legacy, hardware-dependent, install-dependent, policy-dependent, and template links. |
| AC-012 | A non-Windows banner appears when the platform is likely not Windows.                                                            |
| AC-013 | Non-Windows users can still browse, search, and copy links.                                                                      |
| AC-014 | Launch attempts do not claim success; they say launch was requested.                                                             |
| AC-015 | Clippy loads when dependencies are present.                                                                                      |
| AC-016 | If Clippy fails, the launcher still works.                                                                                       |
| AC-017 | Clippy has hide, mute, help, and optional agent-selection controls.                                                              |
| AC-018 | Clippy tips are rate-limited and contextual.                                                                                     |
| AC-019 | Clippy never auto-launches external URI protocols.                                                                               |
| AC-020 | The classic stylesheet dependency is cleaned to Windows 3.x / 3.11-relevant assets only, unless a retained file is justified.    |
| AC-021 | Unused dependency themes, demos, screenshots, and unrelated assets are removed from runtime paths.                               |
| AC-022 | License notices for retained dependencies are preserved.                                                                         |
| AC-023 | The UI has active/inactive window states, menu bars or command areas, status bars, and classic focus outlines.                   |
| AC-024 | Icons are locally defined and visually consistent.                                                                               |
| AC-025 | No external CDN, web font, image host, or runtime network dependency is required.                                                |
| AC-026 | The app works from local disk or has a documented minimal local-server fallback.                                                 |
| AC-027 | The final code is reviewed for broken references, duplicate data entries, invalid HTML, and JavaScript errors.                   |
| AC-028 | The implementation notes explain browser external-protocol prompts and Windows version limitations.                              |
| AC-029 | The final result is compact enough to browse hundreds of links without feeling like a long card dump.                            |
| AC-030 | The coding agent completes all phases without stopping for user confirmation.                                                    |

---

U00 Phased Implementation Plan

---

Phase 0 is orientation. Inspect the uploaded project, current `index.html`, dependency folders, license files, classic stylesheet documentation, `wm.js`, and `clippy-js`. Identify the current data model and all runtime assets. Do not edit yet except for creating notes if useful. The acceptance criteria are that the agent can describe the current app structure, dependency structure, and risk areas before changing code.

Phase 1 is dependency cleanup planning. Determine which classic stylesheet files are actually needed for Windows 3.1 / 3.11 styling. Determine which Clippy assets are needed for default Clippy and optional selectable agents. Preserve licenses. The acceptance criteria are a planned vendor subset, no deleted required asset, and a clear decision on whether to use the provided window manager or implement a custom one.

Phase 2 is data normalization. Extract the existing URI `ITEMS` into a normalized dataset with stable IDs, categories, subcategories, statuses, tags, template flags, launchability flags, notes, and icon keys. Remove accidental duplicates. Preserve all valid URI links from the current app. The acceptance criteria are that the app can render from the new data model and that every item has all required fields.

Phase 3 is the Windows 3.11 visual foundation. Replace the modern dashboard styling with a retro desktop shell using the cleaned Windows 3.x stylesheet and project-specific CSS. Build the desktop background, menu bar, category icons, selection state, status bar, base window component, buttons, dialogs, list boxes, and fallback styles. The acceptance criteria are that the app no longer resembles the previous modern dashboard and that it remains readable and responsive.

Phase 4 is the desktop window system. Implement category icons that open draggable, focusable windows. Implement z-index focus, close, optional minimize/restore, keyboard open, keyboard close, and a simple taskbar or window list. The acceptance criteria are that multiple windows can be opened, moved, focused, and closed without breaking layout or losing state.

Phase 5 is launcher item rendering. Render each category’s links inside windows using retro icons, labels, descriptions, status badges, Open, Copy, and Details actions. Template items must show template handling instead of direct launch. The acceptance criteria are that every URI item is reachable through some category window and that launch/copy actions behave correctly.

Phase 6 is search and discovery. Build global search, a search results window, filters, category jumps, keyboard shortcuts, and empty-result guidance. Search should integrate with Clippy events but must work independently. The acceptance criteria are that users can find "Bluetooth", "Paint", "snip", "privacy camera", "update", and "Store" quickly without knowing categories.

Phase 7 is Clippy integration. Load Clippy, provide assistant controls, implement contextual event tips, cooldowns, random-but-relevant tips, session state, and graceful failure. Add optional agent selection only after default Clippy is stable. The acceptance criteria are that Clippy helps first-time discovery, does not spam, can be hidden or muted, and never launches anything automatically.

Phase 8 is platform and boundary handling. Add Windows detection, non-Windows warning banner, launch-request status messages, copy fallbacks, template editing, deprecated/hardware/install badges, and help explanations. The acceptance criteria are that the app is honest about limitations and remains useful on non-Windows systems.

Phase 9 is polish and immersion. Add refined icons, menu content, About dialog, Help Topics, retro microcopy, window resize grips if feasible, desktop arrangement, icon sorting, and small visual details. Remove modern styling remnants. The acceptance criteria are that the experience feels complete rather than skinned.

Phase 10 is verification. Open the app locally, test major categories, test search, test copy, test launch links on Windows if available, test non-Windows banner by simulation, test Clippy hide/mute, test template flows, inspect console errors, inspect broken asset paths, validate HTML, and review data quality. The acceptance criteria are zero known JavaScript errors on load, no missing required dataset fields, no broken local asset references, and documented limitations.

Phase 11 is final autonomous review and cleanup. Re-read the specification, compare the implementation against acceptance criteria, fix gaps, remove unused files, preserve licenses, and produce concise implementation notes. The agent must then stop only after the project is complete or after documenting any unavoidable limitation with the best implemented fallback.

The agent must run the plan-do-review-fix loop at each phase and then proceed to the next phase automatically.
