2026-08-16

# 2026-08-16.INDIA.A-00

## A-00. Incremental Change Request: Copy Short URL from a Journal Card

This specification is an incremental change request for the existing ALPHA through HOTEL specification set. Earlier requirements remain authoritative except where this document explicitly extends journal-card interaction.

The journal is both a visual archive and the primary interface for the project's static URL shortener. A saved card currently opens the original destination, but the user cannot directly copy the corresponding project-owned short URL from the journal.

INDIA adds one compact card-level action:

```text
Copy short URL
```

The action copies the entry's generated short URL to the clipboard while preserving the existing card link, pan, page-turn, mobile, cache, and static-hosting behavior.

This is not a redesign of the card and does not add a sharing menu, editing system, QR code, analytics, or new shortening service.

## B-00. Precedence and scope

INDIA extends HOTEL's interaction-ownership model.

| Interaction                         | Owner                    |
| ----------------------------------- | ------------------------ |
| Click or tap on card content        | Original-destination link |
| Click or tap on `Copy short URL`    | Clipboard action         |
| Drag beginning outside copy control | Pan controller           |
| Page side control                   | Page navigation          |

All other ALPHA through HOTEL requirements remain unchanged, including six entries per logical page, desktop spreads, constrained/mobile pages, descriptions, browser-native zoom, pointer panning, new-tab destination activation, static records, caching, and capture adapters.

## C-00. Required card action

Every successfully loaded journal entry MUST expose a button whose normal visible label is exactly:

```text
Copy short URL
```

The button copies `entry.shortUrl`.

It MUST NOT copy:

```text
the original destination URL
the preview JPEG URL
the current journal page URL
display text reconstructed from the card
```

The short URL already exists in the journal data model and is derived from the record directory URL. INDIA does not introduce another URL-generation path.

Loading placeholders and entry-error cards do not need the copy action because they do not yet have a validated short URL.

## D-00. Placement and visual treatment

The copy action should sit at the upper-right of the journal tile, visually over the preview/content area. It should read as a small utility control belonging to that entry rather than as a second primary call to action.

The preferred presentation is:

```text
+----------------------------------+
| preview          Copy short URL  |
|                                  |
+----------------------------------+
| title                            |
| description                      |
| source and date                  |
+----------------------------------+
```

The control should use the journal's existing visual language:

```text
warm paper or dark translucent leather surface
restrained brass/brown border
high-contrast compact text
small shadow sufficient to separate it from light or dark previews
slightly stronger hover and focus treatment
```

It must not resemble a bright browser-default button, large promotional badge, or floating application toolbar.

The button should remain compact while retaining a practical hit target. A minimum control height around 30–32 CSS pixels is appropriate on desktop. On touch/mobile presentation, the interactive target SHOULD be approximately 40 CSS pixels high even if the visible shape remains visually restrained.

The button MUST NOT obscure enough of the preview to make the saved page unrecognizable. It MUST NOT change row height, card height, page count, or the six-entry grid.

## E-00. Clipboard behavior and feedback

Activation should use the browser Clipboard API when available from a user gesture:

```text
navigator.clipboard.writeText(entry.shortUrl)
```

A small deterministic fallback MAY be used where the Clipboard API is unavailable, provided it copies the same validated short URL and removes any temporary DOM state immediately.

On success, the control should provide concise visible confirmation:

```text
Copied
```

The success label should return to `Copy short URL` after a short interval so the action remains reusable.

On failure, the control should show a concise recoverable state such as:

```text
Copy failed
```

The user must be able to retry. Failure must not open the destination, corrupt the card, or leave the button disabled permanently.

Routine successful copies do not require console logging. An unexpected clipboard failure MAY emit one concise warning containing the entry ID and error category, but it must not log clipboard contents or unrelated page data.

## F-00. Interaction ownership and HTML structure

The copy control is a real semantic `<button>` with an accessible name. It must be keyboard reachable and show a visible focus state.

Do not place a `<button>` inside an `<a>` element. The implementation must preserve valid, non-overlapping interactive semantics. The card may use a wrapper containing:

```text
one destination anchor
one sibling copy button
```

or an equivalent valid structure.

The destination anchor should continue to cover the normal card area, while the copy button owns its own top-right region above that link hit target.

Activating `Copy short URL` MUST NOT:

```text
open the original destination
begin panning
turn a journal page
change browser zoom
copy twice from one activation
```

Dragging from elsewhere on the card must continue to pan without opening the link. A normal card click outside the copy control must continue to open exactly one destination tab.

Mobile tap and horizontal-swipe ownership remain unchanged. A tap on the copy button copies; an intentional page swipe must not accidentally activate it.

## G-00. Accessibility

The normal accessible name should be `Copy short URL`.

Success and failure feedback should be exposed without moving keyboard focus. The changing button text is sufficient when implemented so assistive technology can perceive the update; a concise polite live status is also acceptable.

The copy button must retain usable contrast over both dark and light preview images. Focus indication must not depend only on color.

The card's primary accessible name remains based on its title. The copy button must remain a separate control and must not make the destination link's accessible name excessively verbose.

## H-00. Focused validation

INDIA requires focused validation rather than a complete authoring-system retest.

Codex should verify at least:

```text
click Copy short URL
-> clipboard contains the entry's exact short URL
-> no destination tab opens
-> button shows Copied and later resets

click normal card content
-> exactly one destination tab opens

drag normal card content
-> journal pans
-> no destination tab opens
-> no clipboard write occurs

deny or stub clipboard failure
-> button shows Copy failed
-> card remains usable
-> a later retry is possible
```

Visual inspection should cover one representative desktop spread and one mobile page, including light and dark previews where available. Check button size, clipping, preview obstruction, focus visibility, and whether descriptions and metadata still fit.

## I-00. Acceptance criteria

INDIA is complete only when all of the following are true.

### Clipboard action

* [ ] Every successfully loaded entry exposes `Copy short URL`.
* [ ] The copied value is the exact project short URL for that entry.
* [ ] The original destination URL is not copied.
* [ ] Success produces concise visible confirmation and resets automatically.
* [ ] Clipboard failure is recoverable and does not disable the card.

### Interaction isolation

* [ ] Copy activation opens no destination tab.
* [ ] Copy activation does not begin panning.
* [ ] A normal card click still opens exactly one destination tab.
* [ ] Card dragging still pans without link activation or clipboard writes.
* [ ] Page controls and mobile swipes retain their existing behavior.
* [ ] The implementation contains no invalid nested button-inside-anchor structure.

### Visual and accessibility quality

* [ ] The control sits at the tile's upper-right and is visually associated with that entry.
* [ ] The treatment matches the established paper, leather, and brass journal design.
* [ ] The control is compact but practical to click or tap.
* [ ] Light and dark previews retain sufficient button contrast.
* [ ] The control does not destabilize card or six-entry page geometry.
* [ ] Keyboard focus is visible and feedback is perceivable.
* [ ] Desktop and mobile screenshots were inspected.

## J-00. Implementation note for Codex

Codex should write and review this specification before implementation, then keep the change narrow. Reuse the already parsed `shortUrl`; do not recalculate it in the renderer and do not introduce a sharing framework.

The most important engineering constraint is clean interaction ownership. The copy button must be a true sibling action that neither inherits destination-link activation nor enters the pan controller. Focused clipboard and browser tests are sufficient when combined with a quick desktop/mobile visual inspection.
