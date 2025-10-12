2025-10-11

Project title: Romanday Eight-Day Calendar

Decisions. The weekday is named Romanday with abbreviation Rom. The 8-day order is Sunday, Romanday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday. The anchor rule is fixed: 1970-01-01 aligns to Thursday within this 8-day sequence. Month names are full. There is no year selector and no Today button.

Objective. Build a single-page, local-only HTML+CSS+JS app that displays a 24-hour digital clock and an 8-day week calendar for the current Gregorian year. No servers, no external assets, no frameworks. Gregorian dates remain unchanged; only the weekday mapping uses the 8-day cycle.

Layout. Two-pane responsive layout. The left pane holds a large digital clock; the right pane holds a current date line and a wall-calendar style grid for the current year. On narrow screens the clock stacks above the calendar. There is no visible splitter.

Visual style. Clean system fonts, CSS variables for colors, light and dark mode via prefers-color-scheme, subtle 1px rules and soft shadows, consistent 8px spacing, no images or web fonts. SVG is used for the digital numerals and minor icons as needed.

Clock. The clock renders HH:MM:SS in 24-hour format with a blinking colon. Digits are seven-segment SVGs built once and updated by toggling segment visibility. Active segments use the primary color; inactive segments are dimmed. Time zone is the user’s local time in the browser. Provide an aria-live=polite plain-text time string alongside the SVG for assistive tech.

Current date line. Above the calendar grid, show the current Gregorian date as YYYY-MM-DD and the 8-day weekday name from the sequence. In the weekday header row, highlight the current 8-day index.

Eight-day weekday logic. Define Sunday=0, Rom=1, Monday=2, Tuesday=3, Wednesday=4, Thursday=5, Friday=6, Saturday=7. Let E be 1970-01-01T00:00:00Z. Compute whole days since epoch for any date D as floor((utcMidnight(D) − E) / 86400000). The 8-day index is (5 + daysSinceEpoch) mod 8 so that 1970-01-01 maps to Thursday (index 5). All weekday labels and highlights derive from this index.

Calendar grid. Render all 12 months of the selected year, which is always the current year at load. Each month is a table-like grid with eight columns labeled Sun, Rom, Mon, Tue, Wed, Thu, Fri, Sat. For the first of each month, compute its 8-day index and left-pad the first row with that many blanks, then fill sequential Gregorian day numbers. The current date cell is accent-highlighted. Non-month trailing cells remain blank. Month headings use full month names.

Responsiveness. Use CSS grid for the outer layout. At wide widths use two columns with an approximate 40 to 60 split; the clock has a max width to preserve proportions. At medium widths reduce clock scale and keep two columns. At small widths stack vertically with adequate spacing. Ensure tap targets are at least 40 px.

Accessibility. Maintain sufficient contrast. Provide visually hidden labels for hours, minutes, and seconds. Respect prefers-reduced-motion by disabling the blink and using a static separator.

State. now: Date; displayYear: number fixed to the current Gregorian year; currentIndex8: integer 0..7 derived from now. No persistence.

Updates. The clock updates at 250 ms using requestAnimationFrame. The calendar re-highlights at local midnight and does not otherwise re-render.

Algorithms. utcMidnight(date) constructs a UTC timestamp at 00:00 for the date’s local year, month, and day to avoid DST drift. daysSinceEpoch returns a nonnegative integer count of days since 1970-01-01. index8(date) returns (5 + daysSinceEpoch(date)) mod 8. firstOfMonthIndex(year, month) calls index8 on YYYY-MM-01.

Rendering. Build the SVG clock once and keep references to each segment. Build the weekday header once. Build the 12 month grids once for the current year. The update loop flips clock segments, toggles the colon, updates the plain-text time, and sets the header highlight class based on index8(now). At midnight, recompute the current date line and update the highlighted day cell.

File structure. index.html holds semantic structure and a module script tag. styles.css defines variables, grid layout, segment colors, and media queries. app.js exports functions for timekeeping, mapping, and rendering.

Key functions in app.js. getUtcMidnight(date) -> number; getDaysSinceEpoch(date) -> number; getIndex8(date) -> 0..7; formatTime(date) -> HH:MM:SS; renderClock(root) builds SVG and returns update(d) to set segments; renderWeekHeader(root) returns setHighlight(i); renderYearCalendar(root, year) builds month grids; startLoop() schedules rAF ticks and midnight rollover.

Styling notes. Define --fg, --fg-dim, --bg, --accent, --rule. In dark mode invert bg and fg and boost dim by 20 percent. Use font-variant-numeric: tabular-nums for textual numbers. SVG segments use rounded rects with small rx and a faint stroke for a bezel effect.

Non-goals. No testing or deployment content. No external assets. No navigation controls for year changes. No localization beyond full English month names and fixed weekday labels.

Implementation intent. This project is an experiment that grafts an eight-day cycle into the familiar Gregorian calendar by inserting Romanday between Sunday and Monday. The UI makes this explicit by showing a standard date alongside an 8-day weekday that follows the defined mapping.

