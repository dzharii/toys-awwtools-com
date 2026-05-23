# MeetTime Exploratory Test Plan

This plan is a compact mind-map style guide for exploratory testing. It is intentionally not a script; use judgment, follow risks, and add observations when the app reveals new behavior.

## Product Shape

- Shareable meeting timeline
  - URL hash stores meeting title, UTC time, duration, participants, time zones, theme, render mode, animation, sprite choices, and participant colors.
  - Default page should create a future meeting and immediately produce a shareable link state.
- Main visual surface
  - Meeting card is the central anchor.
  - Alice should read as the left participant and Bruno as the right participant.
  - UTC is the central reference time.
  - Character labels and color-coded time cards should reinforce identity without relying on color alone.
- Edit surface
  - Editing can happen from UTC or either participant local time.
  - Invalid metadata should be blocked with nearby, visible validation.
  - Save should produce a clean view link; Cancel should restore the prior state.

## First-Impression Pass

- Open `http://127.0.0.1:5500/index.html` in Chrome.
- Scan the first viewport before interacting:
  - Header title matches the meeting title.
  - Primary actions are visible and not crowded.
  - Meeting card, countdown, center marker, axis, and character sprites do not overlap incoherently.
  - Character feet are visible and not clipped by the axis or card edge.
  - Console has no warnings or errors.

## Identity And Time Mapping

- Verify the mental model:
  - Alice name label sits above the left character.
  - Bruno name label sits above the right character.
  - Meeting card time order is left participant, UTC, right participant.
  - Participant colors match their local time card, meeting-card time block, and character label.
  - Long names are rendered fully in the DOM but visually constrained by CSS.
- Challenge with long names and long meeting titles:
  - No horizontal overflow.
  - Labels fade or wrap cleanly.
  - Countdown stays below the meeting card content.

## Controls

- Theme
  - Light, neutral, dark, and auto should keep text readable.
  - Dark theme must apply to the full page background, not only inner panels.
- Render mode
  - Sprite mode should show the atlas characters.
  - SVG fallback should remain recognizable and aligned.
- Animation
  - Toggle should update state, button text, and URL.
  - Paused state should not make the visual stale or confusing.
- Copy link
  - Button should give visible copied feedback.
  - Copied URL should preserve all user-visible meeting settings.

## Edit Flow

- Open Edit and change title, duration, names, time zones, sprites, colors, and meeting time.
- Validate time conversion by changing:
  - UTC time.
  - Alice local time.
  - Bruno local time.
- Negative checks:
  - Invalid IANA time zone.
  - Duration below 5 minutes.
  - DST-skipped local time if the chosen zone/date makes one available.
- Expected behavior:
  - Error is visible near the Save action.
  - Invalid field remains visible and marked.
  - URL is not polluted with invalid values.

## Responsive Pass

- Desktop: wide viewport around 1170px or above.
- Phone: use Chrome at roughly 390px wide.
- Stress with long title and long participant names.
- Look for:
  - Horizontal overflow.
  - Cropped controls.
  - Meeting-card time blocks becoming unreadable.
  - Character labels or feet being clipped.
  - Summary cards wrapping cleanly.

## Useful Repeat Checks

- `node --check script.js`
- Local project asset existence from the project folder.
- Docs index link checks from `docs/`.
- Chrome console check after every meaningful visual change.
- Screenshot checks for:
  - default light view,
  - dark theme,
  - edit validation,
  - long-content desktop,
  - long-content mobile.

## Current Risk Watchlist

- Sprite atlases can appear visually clipped if character bottom, sprite scaling, or card overflow changes.
- Any fixed-position timeline element can collide with wrapped meeting-card text.
- URL hash compatibility matters; old links should upgrade by adding missing stable fields rather than breaking.
- Color should help recognition, but text labels remain the primary identity signal.
