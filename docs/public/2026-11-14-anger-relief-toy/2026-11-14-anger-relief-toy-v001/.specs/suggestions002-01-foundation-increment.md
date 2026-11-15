# A00. Foundation scope

This increment implements the user's November 14, 2026 instruction to prioritize a coherent extension foundation over collection size. It supplements the immutable suggestions001 specifications. The development package contains eight implemented tools: Punch, Shatter, Gravity, Text Bomb, Flashlight, Screen Crack, Rubber, and Vortex. Collection expansion and a side panel are deferred. The popup and on-page catalog provide the full implemented collection.

# B00. Runtime and packaging

Use strict TypeScript, Bun, Manifest V3, native browser APIs, and no production dependencies. Only activeTab, scripting, and storage are requested. No persistent host permissions, remote executable code, public effect resources, content scripts on every page, or MAIN-world injection are needed. Generate catalog data and separately injectable effect entries from each feature's manifest. SDK contract version is 1.0. One active instance replaces its predecessor.

# C00. Interaction and rendering

The popup offers search, category filters, favorites, recents, settings, credits, and diagnostics. Alt+Shift+A opens a wheel with up to eight favorites/recent/default tools. The wheel links to the full on-page catalog. Element tools use a pointer shield, highlight, keyboard target cycling, Enter, and Escape. Viewport/document tools start directly. Stop all, automatic timeout (1-10 seconds), replacement, tab hiding, resize, scrolling during effects, target removal, and navigation release owned resources. No active effect persists after reload.

Snapshots illustrate a target using its computed background and up to 240 rendered words. They do not clone markup, load external images, execute embedded content, read form values, or reproduce every CSS detail. Text Bomb renders up to 65 words. Shatter uses ten triangular pieces rather than Voronoi geometry. Gravity acts on up to twelve visible non-overlapping targets; it simulates independent floor bounces rather than collisions between bodies. Screen Crack is a single centered spiderweb. Repeated clicks use Again and replace the previous instance, without accumulating marks.

# D00. Accessibility and bounds

All tools support reduced motion. System reduced-motion preference always applies; the explicit preference can additionally reduce motion. There is no audio or strobing. Flashlight accepts radius, softness, and darkness controls and arrow-key positioning. Strength and duration settings are common. Only top-frame HTML documents are supported. Closed shadow roots and inaccessible frames are excluded. Open shadow roots are traversed for targeting. Targets must be visible, connected, within 1200 by 800 CSS pixels, and outside protected surfaces. Snapshot canvases use one pixel per CSS pixel to cap memory. Geometry changes end effects safely rather than attempting to follow moving targets.

# E00. Verification and acceptance

Run static type checks, metadata/boundary validation, lifecycle/component tests, and browser tests where supported. DOM-emulator tests do not establish visual fidelity, browser compatibility, or native extension injection correctness. Never fabricate screenshot evidence or performance measurements. Retain a per-feature response to every Y-001 through Y-187 question. An implemented development package may be delivered for review, but final release acceptance remains pending real-browser visual, compatibility, performance, and independent review gates. This distinction does not authorize unfinished controls or placeholder effects.

# F00. Source and review boundary

This increment contains original rendering implementations and original vector/pixel assets. Historical projects provide documented behavior references only; no original executable source is downloaded or executed, and no original assets or algorithms are adapted. Source revisions, licenses, and dynamic behavior that have not been established remain explicitly unknown. The broader original-source audit and independent release review remain open work. Preserve attribution in feature files and the credits catalog.
