# Zen style kitchen timers
Date: 2025-08-29; GPT  5 Thinking thought hard, and you should too!

2025-08-29 [Project specification process](https://chatgpt.com/c/68b14db6-a3bc-8322-9b7b-4e5ec8904510) {chatgpt.com}

# Zen Text Timer: specification by example

## Value story

You want to set and manage timers without a heavyweight UI. You open a blank page that feels like a calm text editor. You type natural durations and labels as plain text. The app recognizes valid durations, highlights them, and turns each line into a live timer. You never switch modes or dig through panels. Everything stays inline and editable. Editing the text edits the timer. Saving is automatic. Timers survive reloads. The result is less friction, fewer clicks, and more focus.

## Why text as the primary UI

Text is fast to create and edit. Text preserves intent alongside configuration. A single contenteditable surface is simpler than multiple inputs. Minimal inline affordances keep the page quiet until you need controls. The app favors direct manipulation: change the text to change the state.

## How it feels to use

You type a duration at the start of a line. The duration gains a soft highlight. Tiny h, m, s markers appear next to hours, minutes, seconds. Controls appear inline on focus or hover: Start, Pause, Resume, Stop, Reset, quick + and -, Snooze, Alarm off. You can operate by mouse, touch, or keyboard shortcuts. The label after the duration is free text. Blank lines are allowed for spacing.

## Parsing in human terms

Leading spaces are ignored. The app accepts units like 2h 30m, 90s, and colon formats like 01:00:00 or 00:05. A bare number like 5 means 5 minutes. 0:45 means 45 seconds. The label is whatever follows the recognized duration. A line is a timer only if the parsed total is greater than 0.

## Inline control model

Controls live next to the duration and only appear when needed. Start changes to Pause while running, then to Resume while paused. Stop returns to idle. Reset restores the default duration that existed before the first Start after the last Reset. Quick steps are context aware. At sub minute, you see 1s, 5s, 10s. From 1 minute up to under 1 hour, you see 10s, 30s, 1m. From 1 hour and above, you see 10m, 30m, 1h. Apply steps with mouse or with Alt + plus or minus.

## Alarm and overtime in plain language

When a timer reaches 0, a synthesized alarm plays via Web Audio. No files are loaded. The duration token pulses gently, and the document title shows a badge. If you do nothing, an overtime counter appears in red and counts up while the original duration remains visible. You can Acknowledge to silence or Snooze to add time and continue.

## Persistence and resume

All edits save to localStorage on every change. Each timer has a stable hidden id. If you close the tab, timers resume logically on reload. A running timer computes how much time passed and updates the remaining time. Finished timers show overtime if appropriate. Paused timers stay paused.

## Flow overview in 10 sentences

Open the page. Type a line beginning with a duration. See it highlighted with h, m, s markers. Add a label after a space. Start the timer inline. Edit the number while it runs to change only the remaining time. Use quick + and - for precise adjustments. Pause or Resume as needed. Let it finish to hear the alarm and show overtime. Delete the line to remove the timer.

## Scenarios

Scenario: boil eggs in 10 minutes
 Given an empty page
 When I type 00:10 boil eggs
 Then the 00:10 token is highlighted with h, m, s markers and the line shows Start

When I click Start
 Then the timer begins counting down and the line shows Pause, Stop, Reset, quick + and -

When I change 10 to 12 while it is running
 Then the countdown updates to 12:00 and continues, and Reset still restores 10:00

Scenario: shorthand minutes
 Given an empty page
 When I type 5 tea
 Then the app interprets 5 as 5 minutes and displays 5m with a highlight and shows Start

Scenario: seconds via colon
 Given an empty page
 When I type 0:45 steep leaves
 Then the app interprets 0:45 as 45 seconds and shows Start

Scenario: unit syntax
 Given an empty page
 When I type 2h 30m beef stock
 Then the app parses 2h 30m, shows markers h and m, and shows Start

Scenario: quick steps at sub minute scale
 Given a running timer at 35s
 When I reveal controls
 Then I see +1s, +5s, +10s and -1s, -5s, -10s

Scenario: quick steps at minute scale
 Given a running timer at 12m
 When I reveal controls
 Then I see +10s, +30s, +1m and -10s, -30s, -1m

Scenario: quick steps at hour scale
 Given a running timer at 1h 15m
 When I reveal controls
 Then I see +10m, +30m, +1h and -10m, -30m, -1h

Scenario: pause, edit, resume
 Given a running 20m timer
 When I press Pause and change 20 to 18
 Then Resume continues from 18:00 and Reset still restores 20:00

Scenario: overtime and acknowledge
 Given a running 30s timer
 When it reaches 0
 Then the alarm sounds, the duration pulses, and an overtime counter in red appears and counts up

When I click Acknowledge
 Then the audio stops and the line stays in finished state with overtime visible

Scenario: snooze after finish
 Given a finished timer at 0 with alarm active
 When I click Snooze
 Then the app adds 1m to remaining time and resumes the countdown

Scenario: multiple parallel timers
 Given three valid lines 00:10 boil eggs, 4 toast, 2m coffee bloom
 When I start all three
 Then they run independently and show individual controls and states

Scenario: invalid line remains text
 Given the line soonish boil eggs
 When no valid duration is at the start
 Then no highlight or controls appear and the line stays as plain text

Scenario: delete removes timer
 Given a paused timer line
 When I select the line and press Backspace to delete it
 Then the line disappears and its saved state is removed

Scenario: persistence across reload
 Given a running 1d timer labeled ferment
 When I close the tab and open it 6 hours later
 Then the timer shows about 18h remaining and continues running

Scenario: keyboard efficiency
 Given the caret inside a valid duration token
 When I press Ctrl+Enter or Cmd+Enter
 Then the timer toggles Start or Pause without leaving the text flow

Scenario: audio constraints
 Given the browser requires a user gesture to start audio
 When I first interact with the page
 Then the app unlocks AudioContext so the alarm can play later

Scenario: accessibility path
 Given a screen reader user
 When focus lands on a duration token
 Then ARIA labels expose the timer status and controls are reachable in reading order

## Narrative of a full session

Morning prep. You paste a short checklist of durations and labels. The app quietly highlights the valid ones and leaves notes untouched. You start 2h 30m stock. You type 5 toast and start it. You realize the toaster is running cool, so you press +30s. It is still not enough, so you edit 5 to 6 while it runs. The timer jumps to 6:00. The stock continues in the background. You close the tab to run an errand. Later you reopen the page. The stock shows 1h 47m remaining, the toast has finished and shows overtime at 12m because you forgot to acknowledge. You press Acknowledge to silence the alarm state and Reset to prepare the toast line for the next round. No modes were switched, no separate dialogs were opened, and your text remains the source of truth.

## Design guardrails in prose

The editor is the only surface. Controls stay inline and appear only on focus or hover. Colors are muted. Motion is minimal and respects system settings. Audio is synthesized and respectful in volume. All data remains local. The system remains responsive and accurate without complex chrome. The fastest path is always to type, edit, or press a small inline control.



# Project specification: Zen Text Timer

## Purpose

- A minimal text editor that acts as multiple kitchen timers.
- The user types plain text. The app parses each line. Valid lines become live timers.
- The UI stays calm and distraction free.
- Vanilla HTML, CSS, and JavaScript only. No libraries. No bundlers. Single index.html.

## Target environment

- Modern desktop and mobile browsers.
- Works offline.
- No external network calls.

## Core concepts

- Each nonempty line is independent.
- A line with a valid leading duration becomes a timer.
- Text after the duration is the label for that timer.
- Invalid lines stay as plain text and have no controls.

## Layout and style

- Full screen single document page.
- One contenteditable region for all lines.
- Monospace or humanist mono font.
- Light text on subtle background in Zen style.
- Minimal accents and soft focus rings.
- No toolbars or panels by default.

## Duration recognition

- The duration must appear at the start of the line.
- Leading spaces are ignored.
- Allowed tokens are h, m, s with lowercase letters.
- Allowed formats include H, M, S units, colon pairs, and bare numbers.
- Examples: 5 means 5m. 005 means 5m. 00:05 means 5m. 01:00 means 1h. 01:00:00 means 1h. 2h 30m means 2h 30m. 90s means 90s. 0:45 means 45s.
- A line is valid if the parsed total seconds is greater than 0.

## Duration display after parsing

- Show three small markers next to the time groups: h for hours, m for minutes, s for seconds.
- Use muted gray markers in the Zen palette.
- Pad minutes and seconds to 2 digits in display.
- Do not alter the label text.

## Inline highlighting

- When a line parses as a timer, highlight the duration token with a soft background.
- Keep the label in normal text.
- Show a thin left border to indicate active status when running.

## Inline controls

- Controls appear inline to the right of the duration when the caret is on the line or when the line is hovered.
- Controls are Start, Pause, Resume, Stop, Reset, +, -, Snooze, Alarm off.
- Controls use compact pill buttons with icon glyphs and short labels.
- Controls never wrap to the next line. Overflow fades with a subtle gradient.
- Controls are accessible by keyboard.

## Quick increments and decrements

- The app shows three context aware step buttons for both + and -.
- If current remaining time is less than 60s, steps are 1s, 5s, 10s.
- If current remaining time is 60s to less than 60m, steps are 10s, 30s, 1m.
- If current remaining time is 60m or more, steps are 10m, 30m, 1h.
- The same three magnitudes apply to + and -.
- Applying a step never drops below 0.

## Multiple timers

- Each valid line is an independent timer.
- Timers can run in parallel.
- Blank lines are allowed as separators.
- Deleting a timer line removes that timer and its state.

## Editing rules

- Editing before Start changes the default duration for that line.
- Editing while running modifies the current remaining time and does not change the default duration.
- Editing while paused modifies the current remaining time and does not change the default duration.
- Reset returns to the last default duration that existed right before the first Start after the last Reset.

## Timer lifecycle

- States are idle, running, paused, finished, overtime.
- Start from idle sets startEpochMs and enters running.
- Pause stores remainingMs and enters paused.
- Resume restores from remainingMs and enters running.
- Stop cancels the countdown and enters idle with remainingMs set to default duration.
- Finish at 0 enters finished, triggers alarm, and then enters overtime if not acknowledged.
- Acknowledge or Alarm off silences audio and keeps finished state.
- Snooze adds a preset step and resumes running.

## Overtime behavior

- After 0 the line shows a second time in red that counts up.
- The original duration stays visible in normal color.
- Overtime continues until Stop or Reset or edit to a new remaining time.

## Alarm behavior

- Alarm fires when a timer reaches 0.
- Alarm synthesizes audio via Web Audio API. No external files.
- Default alarm is a short repeating triad using oscillators and gain envelopes.
- Volume is adjustable per session.
- Alarm respects user gesture requirements to unlock AudioContext.
- Visual alarm includes duration token pulsing and document title badge.

## Snooze behavior

- Default snooze adds 1m to remaining time and resumes.
- The snooze step is configurable in code to 30s or 2m if needed later.

## Persistence and resume

- The app saves on every input event and on every state change.
- Save the full plain text of the editor.
- Save a per line timer state map keyed by a stable line id.
- A line id is a UUID stored in a hidden data attribute bound to the duration token.
- On split or paste that creates a new line, generate a new id for the new line.
- On merge that deletes a line, remove the old id and its state.
- Saved fields per timer include id, defaultDurationMs, status, startEpochMs, remainingMs, lastChangedEpochMs.
- On load, restore the text, reparse lines, reattach ids, and reconstruct states.
- For running timers, compute new remainingMs as max(0, savedRemainingMs - elapsedSinceSave) if saved as paused, or as max(0, defaultDurationMs - (now - startEpochMs) + editsApplied) if saved as running.
- If computed remainingMs is 0 or below, enter finished and handle alarm and overtime.

## Keyboard interactions

- Enter inserts a new line.
- Backspace on an empty timer line deletes it.
- Ctrl or Cmd Enter toggles Start or Pause on the current line.
- Arrow keys move the caret as in a normal editor.
- - and - keys with Alt apply the smallest quick step when the caret is in the duration token.

## Mouse and touch interactions

- Click duration to place caret and reveal controls.
- Click controls to operate the timer.
- Long press on mobile reveals controls if they are hidden.

## Parsing algorithm

- Trim leading spaces.
- Try unit syntax with regex for h, m, s.
- If no units, try colon syntax for H:M:S, M:S, or S.
- If no colons and digits only, treat as minutes.
- Reject if total is 0.
- The label is the substring after the recognized duration and following spaces.

## Time formatting

- Display as Hh Mm Ss with omitted zero groups.
- Always pad minutes and seconds to 2 digits when part of a larger group.
- Examples: 5m, 01h 00m, 00m 45s, 02h 03m 04s.

## States and controls mapping

- Idle shows Start, +, -, Reset disabled, Stop hidden, Snooze hidden.
- Running shows Pause, Stop, +, -, Reset, Snooze hidden.
- Paused shows Resume, Stop, +, -, Reset.
- Finished shows Alarm off, Snooze, Reset, +, -, Stop.

## Autosave behavior

- Save the document text to localStorage under key ztt.doc.
- Save the timer state map to localStorage under key ztt.state.
- Save volume and last alarm choice under key ztt.prefs.
- Save occurs debounced at 150 ms to avoid churn.

## Rendering and tick

- Use requestAnimationFrame for smooth countdown updates.
- Update the visible remaining text once per second.
- Use high resolution timestamps for accuracy, not setInterval alone.

## Accessibility

- All controls have aria labels.
- Focus order follows reading order.
- Color is not the only state cue. Use icons and text.
- Respect prefers-reduced-motion to disable pulses.
- Respect reduced audio preference by starting with low volume.

## Error handling

- If a parse fails, remove highlighting and controls.
- If a line becomes valid after edit, create the timer state and id.
- If Web Audio fails to start, show a toast that audio requires a click.

## Security and privacy

- All data stays in the browser.
- No analytics.
- No network access.

## Non functional constraints

- No frameworks or libraries.
- No build step.
- One HTML file plus a CSS file and a JS file.
- Total bundle target under 30 KB gzipped.

## Data model fields

- id: string.
- defaultDurationMs: number.
- status: string.
- startEpochMs: number or null.
- remainingMs: number.
- editsAppliedMs: number.
- label: string.

## Example user stories

- As a cook I type 00:10 boil eggs and press Start. The line highlights and a countdown begins.
- As a user I realize I need 12 minutes. I replace 10 with 12 while running. The countdown jumps to 12:00 and continues. Reset still returns to 10:00.
- As a user I start three lines. I close the tab. I reopen 6 hours later. A 1 day timer shows 18h remaining. Two short timers have finished and show overtime with red count up.
- As a user I press Pause, then +30s, then Resume. The timer resumes with the extra 30 seconds.
- As a user I let a timer hit 0. The alarm sounds and the duration pulses. I press Snooze. The timer adds 1m and resumes.
- As a user I delete the line. The timer disappears and its state is removed.

## Acceptance criteria

- A valid duration at line start is detected and highlighted within 50 ms after input.
- Inline controls appear on focus or hover and are operable by keyboard and mouse.
- Editing during running affects only remaining time and not the default duration.
- Reset restores the default duration that was active before the first Start after the last Reset.
- Timers survive reload. A running 24h timer resumed after 6h shows 18h remaining within 1s of load.
- Alarm uses Web Audio API with no external files and can be silenced.
- Overtime appears in red and counts up until stopped or reset.
- Quick steps follow the context rules and never produce negative time.
- No nested toolbars or panels appear. The interface stays inline and minimal.
- All data persists in localStorage and no network requests occur.

## Implementation sketch

- contenteditable div with role textbox and white space pre wrap.
- Each parsed duration wrapped in a span with data attributes for id and ms.
- A floating inline controls container positioned next to the span.
- A TimerStore module holds state by id and handles persistence.
- A Parser module converts text to ms and extracts label.
- A Renderer module updates DOM spans and control states.
- An Audio module builds oscillator nodes and plays the alarm pattern.
