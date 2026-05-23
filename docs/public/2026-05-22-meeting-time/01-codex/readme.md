# Meeting Timeline

Shareable static meeting countdown timeline with two participants moving toward a center meeting point.

## Highlights

- Adaptive timeline zoom from 30 days down to 60 seconds.
- Countdown text + UTC, participant A, and participant B local time display.
- Edit mode with live conversion from UTC, participant A, or participant B input rows.
- URL hash state (`#v=1&t=...`) for backend-free sharing and reload restore.
- Save/Cancel/Copy Link behavior with edit baseline restore on cancel.
- Reduced-motion support and responsive layout.
- Optional sprite rendering mode using local assets copied from `img-source/` into `sprites/`.
- Public browser API on `window.MeetingTimeline` plus optional boot-time globals:
  - `window.MEETING_TIMELINE_CONFIG`
  - `window.MEETING_TIMELINE_CALLBACKS`

## Files

- `index.html` UI structure.
- `style.css` responsive styles and character visuals.
- `script.js` state, time conversion, rendering, editing, and URL serialization logic.
- `sprites/` local frame assets used by sprite mode.

## Edit Input Format

- Date: `YYYY-MM-DD`
- Time: `HH:mm` (24-hour)
- Time zones: canonical IANA zone names (for example `America/Los_Angeles`).
