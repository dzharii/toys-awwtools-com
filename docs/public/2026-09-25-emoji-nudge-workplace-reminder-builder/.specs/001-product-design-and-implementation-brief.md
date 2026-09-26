# A00 Product idea and voice

The product is Emoji Nudge. Its description is: A tiny atelier for wordless workplace diplomacy. Build a peculiar emoji character, tune its tone, and send a gentle nudge, thank-you, or review reminder without typing a sentence. Its positioning line is: Tiny characters for things you'd rather not type.

The application feels like an unexpectedly polished answer to a small workplace problem. The character carries the humor while the surrounding interface remains calm. Language describes intent, mood, activity, and appearance. Labels such as Request, Appreciative, Focused, Hopeful, and Patient make the vocabulary suitable for sharing at work.

# B00 Core interaction

The page opens directly into the builder. A preset provides the quickest starting point; six component selectors then refine the composition. Every intentional change updates the preview immediately. Copy transfers the character, Select prepares manual copying, and Shuffle explores the curated catalog. Feedback appears in the action label and a polite live status region. Returning users resume their last composition.

# C00 Visual grammar

The character stacks Head, Expression, Gesture, Clothing, and Footwear in that order. Optional Context appears beneath it as a smaller situational cue. Expression always has a value. Each other slot includes None and disappears cleanly when empty. This grammar lets appearance, expression, gesture, and context combine into a wordless workplace message. Deliberately surprising outfits are part of its character.

# D00 Vocabulary

Expressions span Request, Appreciative, Hopeful, Patient, Relieved, Focused, Confident, Concerned, Unsure, Surprised, Tired, and Positive. Gestures cover requesting, thanking, agreement, open palms, appreciation, handshakes, celebration, hope, acknowledgment, greeting, attention, and completion. Appearance labels name recognizable items. Context includes documents, time, checks, calendars, bells, inspection, mail, coffee, rockets, bugs, locks, charts, packages, and tickets. Default Unicode presentation provides a consistent abstract language.

# E00 Presets

Eighteen visible presets form four meaningful groups: Follow-up, Review, Status, and Fun. Gentle Reminder, Clear Reminder, and Time-sensitive form a related progression through expression, gesture, and time symbols. A known combination recognizes itself even when assembled manually. Other compositions display Custom in the preset picker. Three exact hidden combinations reveal quiet discovery names through the same matching system.

# F00 Selectors

Semantic native selects provide the baseline. Supporting browsers enhance them with base-select, selectedcontent, styled picker surfaces, emoji-plus-label options, and miniature vertical preset previews. The selected preset also shows its miniature character. Conventional browsers retain readable emoji and label options. The central catalog generates the static options so the authored fallback and enhanced interface stay aligned.

# G00 Embedded layout

The application responds to the width of its own container. Wide layouts place controls left and preview right. Medium and narrow layouts put the preview first, followed by a two-column control grid. Controls retain practical touch targets. The surrounding page flows naturally within an iframe. On sufficiently tall wide layouts, the preview has sticky positioning. Narrow previews scale down visually while preserving the selected output size for copying.

# H00 Preview

A white message-like surface surrounds the centered character. A restrained pale-blue radial background provides separation without competing with the emoji. The preview uses consistent line boxes and direct DOM text. A compact size control offers 32, 38, 44, 50, and 56 pt. Double-click selects the full character. A brief three-pixel movement responds to composition changes, and the operating system's reduced-motion preference makes updates static.

# I00 Copying

Modern preview layout and clipboard HTML are separate renderers. Clipboard output includes both HTML and newline-separated plain text. A compact table gives each visible line a centered cell with explicit emoji font families, point size, line height, and an Outlook line-height hint. Rich Clipboard API copying leads the flow. Legacy user-initiated copying and selected DOM text provide successive routes when the environment restricts access. Native copy events enrich a complete character selection with the same HTML and plain text.

# J00 Size and spacing

Size stays near the preview because it affects the pasted result. Tight, Normal, and Relaxed spacing live in the secondary menu. Spacing maps to explicit line-height multipliers. The user's chosen output size remains authoritative even when the on-screen preview is visually reduced for a small container.

# K00 Secondary menu

An ellipsis control opens Settings and sharing. This small surface contains spacing, Copy Link, Reset to Classic Request, and a short expandable help explanation. The native Popover API handles supported environments, and a JavaScript visibility fallback supports other browsers. Escape closes the surface; focus remains usable with the keyboard. Link-copy fallback reveals a selectable input.

# L00 Shuffle and discovery

Shuffle selects independently from the curated component vocabulary while retaining output size and spacing. It invites playful compositions through the fixed grammar. Three hidden exact combinations reveal The Quiet Moonwalk, Royal Patience, and Coffee Research Fellow. Their recognition appears in the preview caption with a restrained discovery note.

# M00 Local state

Local storage records stable component IDs, size, and spacing under a versioned key. Storage failures leave the page fully usable in memory. Reset restores the Classic Request composition at 44 pt and Normal spacing. Temporary feedback and selection are kept as transient interface state.

# N00 URL sharing

A versioned fragment describes the current composition with stable ASCII IDs. An incoming recognized fragment takes precedence over local state. Component changes replace the current history entry to keep sharing current. Invalid fields recover independently to the default. Copy Link shares the complete configuration and can fall back to a selectable URL.

# O00 Architecture

The project uses static HTML, CSS, and vanilla JavaScript. Every runtime resource ships in the folder. The catalog defines numeric Unicode sequences and stable IDs once; JavaScript renders them with String.fromCodePoint. Native fallback options use numeric HTML character references. Authored source stays ASCII-safe. Presets, recognition, sharing, storage, randomization, and clipboard generation all use this central data model.

# P00 Accessibility

Every control has a readable label, visible focus, and native keyboard behavior. A live region announces useful action results. The character remains selectable text. Reduced-motion preferences govern animation. Controls retain comfortable target sizes in compact layouts. Emoji have text labels in the selectors and a descriptive accessible name on the full preview.

# Q00 Visual identity

A cobalt accent, crisp borders, modest rounding, and clean system typography establish the identity. A white preview stays visually consistent across system themes. The surrounding application follows light and dark preferences. Space and hierarchy concentrate attention on the controls, character, and transfer actions.

# R00 Favicon

A simple cap-and-face symbol becomes a multi-resolution ICO containing 16, 24, 32, 48, 64, 128, and 256 pixel versions. A PNG source companion makes reuse straightforward. The favicon carries the same cobalt and warm emoji colors as the application.

# S00 Social preview

A dedicated 1200 by 630 JPEG presents the name and positioning line beside a large peculiar messenger. Its clean white-and-cobalt composition works independently from the interface and remains readable as a compact shared-link card. The asset is stored locally as social-preview.jpg.

# T00 Metadata

The document title, description, canonical link, Open Graph fields, image dimensions and alternative text, and Twitter large-image metadata describe the product. A maintenance script fills the deployment-specific absolute URLs once the hosting address is available.

# U00 Finished experience

The finished tool opens directly into creation, supports a few seconds of experimentation, and carries the message into another composer. The details of layout, Unicode, state, browser capabilities, and clipboard formatting stay behind a small, understandable interface.
