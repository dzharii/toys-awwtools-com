# Specification: Web-based Calendar Estimate Tool
Date: 2025-08-15

SPEC: https://chatgpt.com/c/68a014ce-b964-832d-a2d1-db0b9b9fe402

IMPL 01: https://chatgpt.com/g/g-9UBPT4QKi-web-developer-toys/c/68a01c13-bfec-8322-ad19-08e8903c0dab



## Purpose

UI for office workers and engineers to define date ranges, visualize them on a calendar, and compute workday and holiday counts. Runs as a static site with HTML, JavaScript, and CSS only.

## Scope

Implements a scrollable multi-month calendar, a plain-text range editor, a statistics panel aligned to the editor, and an editable U.S. holiday list. No persistence. No deployment or testing notes.

## Terminology

Range means inclusive beginDate to inclusive endDate. Workday means Monday to Friday excluding enabled holidays. Holiday means a date from the holiday list with observance rules applied.

## Constraints

Must use vanilla HTML, CSS, and JavaScript. Must render without layout shift. Must handle ranges that cross year boundaries. Must compute floating U.S. holidays. Must allow user-added blocking dates. Must avoid unusual Unicode in the editor. Must maintain readable color contrast. Must update views in real time while typing.

## Layout

Top toolbar contains viewport controls. Center column contains range editor. Right column contains statistics and holiday panels. Bottom area contains the calendar in a horizontally scrollable strip of months.

## Toolbar

Provides calendar viewport controls without changing user ranges. Includes From and To month pickers or a free-text month range input. Includes Today button to jump the calendar to the current month. Includes Fit to ranges toggle that auto-sets viewport to min and max month across valid ranges.

## Calendar Panel

Shows months in a row from viewport start to viewport end. Uses a 7-column grid with Sunday as the first column. Marks holidays with a badge. Highlights range days with assigned colors. Shows a combined tooltip when multiple ranges cover a day. Enables horizontal scroll for long viewports. Expands context automatically for short viewports if Fit to ranges is on.

## Range Editor Panel

Uses a div with contenteditable=true. Uses a fixed, large, sans-serif font. Uses monospaced digits via font-feature-settings to aid alignment. Accepts one range per line in the format beginDate separator endDate separator description. Accepts any non-digit run as a separator. Accepts empty description. Colors each valid line with a stable color pair. Blocks unusual Unicode on input and on paste. Reserves a fixed-height error area directly below the editor.

## Statistics Panel

Lists one row per valid editor line in the same vertical order. Uses the same font size and line height as the editor for visual alignment. Shows total days, workdays, weekends, and holidays for that range. Provides a grand total footer across all valid ranges.

## Holiday Panel

Loads defaults from holidays.us.js. Displays each holiday with a checkbox to enable or disable. Supports adding a custom one-day blocking date with a label. Updates calendar and statistics when toggled. Does not persist changes.

## Holiday Rules

Defines fixed-date holidays. Defines floating-date holidays such as nth weekday of a month. Applies weekend observance by shifting to Monday if a holiday falls on Saturday or Sunday. Applies observance only to enabled holidays. Treats user-added dates as holidays without observance shifting.

## Date Rules

Parses dates in local time at midnight. Accepts ISO 8601 yyyy-mm-dd. Accepts m/d/yyyy and mm/dd/yyyy with zero padding optional. Rejects ambiguous forms such as dd-mm-yyyy. Treats range endpoints as inclusive. Rejects endDate earlier than beginDate.

## Overlap Rendering

Detects per-day overlap count across ranges. Uses the base color for single coverage. Uses a deterministic blended color for two or more coverages. Uses diagonal stripe overlay as a fallback when contrast would drop below AA. Lists all covering ranges in the day tooltip.

## Colors

Uses a static list of 20 color pairs in colors.js. Each entry provides bg and fg that meet WCAG AA for normal text. Assigns a color index by hashing beginDate and endDate with a stable 32-bit hash. Keeps color stable when the description changes. Uses a reserved neutral color for invalid or draft lines.

## Input Parsing

Splits each line into three tokens. Token 1 must be a valid date. Token 2 is any run of non-digits. Token 3 must begin with a valid date. The remainder after token 3 is the optional description. Trims leading and trailing whitespace. Ignores empty lines. Comments beginning with # are ignored.

## Validation

Flags invalid date formats. Flags impossible dates such as 2025-02-30. Flags endDate earlier than beginDate. Flags lines with missing begin or end. Highlights the offending line with a light red background. Shows a concise message in the reserved error area without changing layout. Clears the message when all lines are valid.

## UI Feedback

Highlights the editor line when the user hovers a highlighted day. Highlights the corresponding days when the user focuses an editor line. Scrolls the editor to the line when the user clicks a day. Shows the description as a tooltip for single coverage and a compact list for overlaps.

## Rendering Rules

Renders only months within the viewport. Renders at least one month when no ranges exist. Uses CSS grid for each month. Uses a fixed header row with weekday initials. Uses aria-labels for days and holidays. Uses prefers-reduced-motion to reduce animation.

## Performance

Debounces editor parsing on input by 150 ms. Computes per-range day sets once and reuses across views. Uses document fragments to update calendars in batches. Virtualizes offscreen months for multi-year viewports.

## Accessibility

Supports keyboard navigation in the editor and calendar. Uses aria-live polite for the error area. Provides sufficient color contrast. Provides focus styles for interactive elements. Exposes tooltips via title attributes and aria-describedby.

## Data Model

Range object fields include id, begin, end, desc, colorIndex. Holiday object fields include id, date, name, enabled, observedDate. Calendar state includes viewportStartMonth and viewportEndMonth and fitToRanges flag.

## File Layout

index.html defines the panels and basic structure. style.css defines layout, grid, colors, and focus states. app.js implements state, parsing, rendering, and events. holidays.us.js exports the U.S. holiday set and calculators. colors.js exports the 20 color pairs.

## Events

Editor input triggers debounced parse and re-render. Toolbar changes update viewport and calendar. Holiday toggles update observed set and statistics. Calendar day hover and click update cross-highlighting.

## Algorithms

Workday count iterates inclusive dates and increments when weekday is Monday to Friday and the date is not an enabled observed holiday. Observed holiday computation maps a base rule to a date and shifts to Monday if the date falls on Saturday or Sunday. Overlap detection uses a map keyed by yyyy-mm-dd with an array of covering range ids. Color selection uses a 32-bit hash of begin and end modulo 20.

## Error States

Empty editor yields an empty calendar highlight and empty statistics. Invalid lines do not contribute to calendar or statistics. Holiday list load failure shows a single inline banner in the holiday panel. Colors list load failure falls back to a built-in minimal palette.

## Security and Sanitization

Strips HTML tags on paste by reading text/plain. Normalizes text to NFKC. Whitelists ASCII letters, digits, spaces, and these punctuation characters: - / . , : ; # ( ) [ ] { }. Replaces disallowed characters with spaces. Escapes all content before injecting into the DOM.

## Usage Examples

Estimate season wrap. Enter 2024-11-01 - 2025-02-28 Season wrap. The calendar scrolls to November 2024 through February 2025. Holidays show badges. The statistics row lists total days, workdays, weekends, and holidays.
 Short sprint. Enter 3/10/2025 - 3/21/2025 Sprint 5. The calendar shows March with context. The statistics row shows ten workdays.
 Custom block. In the holiday panel add 2025-04-15 Tax Day and keep it enabled. The range counts exclude that date as a workday.

## Code Examples

Editor split and parse

```js
function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const dateRe = /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/g;
  const m1 = dateRe.exec(trimmed);
  if (!m1) return { error: "Missing begin date" };
  const m2 = dateRe.exec(trimmed);
  if (!m2) return { error: "Missing end date" };
  const begin = parseDate(m1[0]);
  const end = parseDate(m2[0]);
  if (!begin) return { error: "Invalid begin date" };
  if (!end) return { error: "Invalid end date" };
  if (end < begin) return { error: "End before begin" };
  const desc = trimmed.slice(dateRe.lastIndex).trim();
  return { begin, end, desc };
}
```

Hash for stable color

```js
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function colorIndexForRange(begin, end) {
  const key = `${begin.toISOString().slice(0,10)}|${end.toISOString().slice(0,10)}`;
  return hash32(key) % COLORS.length;
}
```

Observed holiday shift

```js
function observedMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 0) { d.setDate(d.getDate() + 1); return d; }
  if (day === 6) { d.setDate(d.getDate() + 2); return d; }
  return d;
}
```

Per-day coverage and overlap

```js
function buildCoverage(ranges) {
  const cover = new Map();
  for (const r of ranges) {
    for (let d = new Date(r.begin); d <= r.end; d.setDate(d.getDate() + 1)) {
      const k = d.toISOString().slice(0,10);
      if (!cover.has(k)) cover.set(k, []);
      cover.get(k).push(r.id);
    }
  }
  return cover;
}
```

Workday counting

```js
function countWorkdays(begin, end, holidaysSet) {
  let total = 0, weekends = 0, holidays = 0;
  for (let d = new Date(begin); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const k = d.toISOString().slice(0,10);
    const isWeekend = dow === 0 || dow === 6;
    const isHoliday = holidaysSet.has(k);
    if (isWeekend) weekends++;
    if (isHoliday) holidays++;
    if (!isWeekend && !isHoliday) total++;
  }
  return { total, weekends, holidays };
}
```

## colors.js Example

```js
export const COLORS = [
  { bg: "#0ea5e9", fg: "#ffffff" },
  { bg: "#10b981", fg: "#0b1f16" },
  { bg: "#f59e0b", fg: "#1f1400" },
  { bg: "#ef4444", fg: "#ffffff" },
  { bg: "#8b5cf6", fg: "#ffffff" },
  { bg: "#14b8a6", fg: "#082422" },
  { bg: "#eab308", fg: "#1f1800" },
  { bg: "#f97316", fg: "#1f0e00" },
  { bg: "#22c55e", fg: "#072512" },
  { bg: "#3b82f6", fg: "#ffffff" },
  { bg: "#a855f7", fg: "#ffffff" },
  { bg: "#06b6d4", fg: "#062226" },
  { bg: "#ef476f", fg: "#ffffff" },
  { bg: "#ffd166", fg: "#1f1800" },
  { bg: "#06d6a0", fg: "#06261f" },
  { bg: "#118ab2", fg: "#ffffff" },
  { bg: "#8338ec", fg: "#ffffff" },
  { bg: "#fb5607", fg: "#1f0e00" },
  { bg: "#0f766e", fg: "#e6fffb" },
  { bg: "#e11d48", fg: "#ffffff" }
];
```

## holidays.us.js Outline

Exports an array of base rules and a function that expands rules for a given year. Applies observedMonday to each date. Supports fixed dates and nth weekday rules.

## Non-goals

No authentication. No time-of-day support. No recurring ranges. No storage. No export or import.

## Assumptions

Week starts on Sunday. Observance always shifts to Monday for weekend holidays by requirement. Locale is en-US. Inclusive date ranges.



