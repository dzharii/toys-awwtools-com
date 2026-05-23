---

A01 Product Definition

---

The product is an animated, configurable meeting countdown timeline. It visualizes the time remaining before a scheduled meeting by showing two participant characters moving toward one another along a horizontal timeline. The meeting point is fixed at the center. The remaining time is represented by the distance between the two characters and the center meeting point.

The closer the meeting time gets, the closer the characters move toward the center. Their hands gradually extend toward one another as the remaining time decreases. At the meeting time, both characters meet at the center and complete the handshake state.

The component should work as a reusable UI module that can be embedded into a web page, dashboard, meeting reminder page, event landing page, or calendar-related application.

The product is also shareable by URL. Meeting title, meeting time, duration, participant names, participant time zones, visual mode, and relevant display options should be represented in the URL hash so the same countdown can be shared without a backend.

---

B01 Core Product Goal

---

The component should make an upcoming meeting feel spatial and visual instead of only numeric.

A user should be able to understand three things immediately: who is meeting, when the meeting happens, and how close the meeting is. The timeline should remain useful whether the meeting is two days away, two hours away, two minutes away, or happening now.

The design should avoid a simple progress bar. The primary metaphor is convergence: two people approaching each other until the meeting happens.

The product should also function as a small time-zone planning tool. The user should be able to enter or adjust the meeting time in any displayed time zone and immediately see the equivalent time in the other zones.

---

C01 Visual Model

---

The timeline is horizontal. The center of the timeline is always the meeting point. Participant A appears on the left side. Participant B appears on the right side. Both move toward the center as time passes.

The visual distance between the participants decreases as the remaining time decreases. The hands extend as the distance decreases. When the meeting is far away, the characters stand apart and their arms are relaxed or only slightly forward. When the meeting is close, the characters are visibly moving toward each other and their hands are extended.

The center should contain a clear meeting marker. The marker should include the meeting title if configured, the primary meeting time, and local times for UTC, Participant A, and Participant B.

In read-only mode, the center marker behaves like a display card. In edit mode, the same area becomes an editable control surface where the meeting title, UTC time, Participant A local time, and Participant B local time can be edited.

The component should support light, neutral, and dark visual themes, but the default should be clean and minimal.

---

D01 Time Model

---

The meeting is defined by a single absolute timestamp. Internally, the meeting time should be normalized to UTC. Participant time zones are display-only and editing contexts. They do not create separate meetings.

The component uses the current time from the browser as the default clock source. For testing, demos, or server-controlled playback, the clock source should be overridable through configuration.

The remaining time is calculated as:

```ts
remainingMs = meetingTimeUtcMs - nowUtcMs
```

When `remainingMs` is positive, the meeting is upcoming. When it reaches zero, the meeting is starting. When it becomes negative, the component enters the post-meeting state.

When the user edits any displayed time, the edited field becomes the temporary source field. The component converts that local date and time into the single UTC meeting instant, then re-renders all other displayed time zones from that instant.

The core rule is:

```txt
One meeting instant. Multiple editable representations.
```

---

E01 Timeline Scaling

---

The timeline should not use one fixed scale. It should automatically adapt based on how much time remains.

The component should choose a display window large enough to contain the current remaining time while keeping the characters visible and the movement readable.

| Remaining time       | Display window | Update behavior             |
| -------------------- | -------------: | --------------------------- |
| More than 7 days     |        30 days | Update every hour           |
| 2 to 7 days          |         7 days | Update every 15 minutes     |
| 12 hours to 2 days   |       48 hours | Update every 5 minutes      |
| 1 to 12 hours        |       12 hours | Update every minute         |
| 10 minutes to 1 hour |         1 hour | Update every 10 seconds     |
| 1 to 10 minutes      |     10 minutes | Update every second         |
| Less than 1 minute   |     60 seconds | Smooth continuous animation |

This adaptive scaling is the timeline zoom. When the user refreshes the page, the component should recompute the scale from the current time and render the correct proportion immediately.

The scale may change while the page is open, but it should transition smoothly. For example, when the meeting moves from 11 minutes away to 10 minutes away, the timeline should not jump abruptly. It should animate into the new scale.

When the user edits the meeting time, the timeline should update immediately from the draft meeting instant. This allows the user to see how far away the meeting will be before committing the edit.

---

F01 Positioning Formula

---

The characters are positioned symmetrically around the center.

```ts
const remainingRatio = clamp(remainingMs / displayWindowMs, 0, 1)
const progressRatio = 1 - remainingRatio

const maxOffset = timelineWidth * 0.42

participantA.x = centerX - remainingRatio * maxOffset
participantB.x = centerX + remainingRatio * maxOffset
```

When `remainingRatio` is `1`, the characters are near the outer sides of the timeline. When `remainingRatio` is `0`, both characters are at the center.

The visual gap between the characters is therefore the primary representation of time left.

When the meeting time is being edited, the same positioning formula should use the draft meeting time. If the draft input is invalid or incomplete, the component should keep the last valid visual state and show an input validation state instead of jumping.

---

G01 Hand Extension Formula

---

The hands should extend as the meeting gets closer.

```ts
const handExtension = easeOutCubic(progressRatio)
```

When the meeting is far away, `handExtension` is close to `0`. When the meeting is near, it approaches `1`.

The hand extension should not be perfectly linear. A slight easing curve makes the visual feel more natural. The recommended default is `easeOutCubic`, because the hands begin subtly and become more obvious near the meeting time.

```ts
function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}
```

Hands should not fully touch before the meeting time. The final contact should happen only at or very near zero remaining time.

---

H01 Animation Behavior

---

The component has two animation types.

The first type is state-based animation. This happens when the page loads, refreshes, when the timeline scale changes, or when the user edits the meeting time. The component calculates the correct position and smoothly transitions the characters into place.

The second type is live countdown animation. This happens while the page remains open. The closer the meeting gets, the more continuous the movement becomes.

For meetings far away, movement should be subtle. It is acceptable for the component to update every few minutes or every hour. For meetings within ten minutes, the component should update every second. For the final minute, the movement should be continuous and visually apparent.

When the user is actively typing inside a time input, animation should be calmer than normal. The component should update layout and position, but it should not over-animate every keystroke. A 150ms to 250ms visual debounce is recommended for movement, while the converted text fields should update immediately after a valid parse.

The animation should never feel chaotic. The characters should move calmly toward the center.

---

I01 Meeting States

---

The component should support five primary states.

| State       | Condition                                         | Behavior                                                   |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------- |
| Far away    | Remaining time is greater than 12 hours           | Characters are far apart, relaxed, minimal animation       |
| Approaching | Remaining time is between 10 minutes and 12 hours | Characters are closer, hands begin to extend               |
| Imminent    | Remaining time is under 10 minutes                | Live countdown, visible movement                           |
| Starting    | Remaining time is between 0 and -5 minutes        | Characters meet at center, handshake state                 |
| Past        | Meeting ended or start threshold passed           | Show completed or in-progress state based on configuration |

The default post-meeting behavior should keep the handshake visible for five minutes after the start time. After that, the component can switch to a completed state unless configured otherwise.

Edit mode should be treated as an overlay state, not a meeting state. For example, a meeting can be both `Approaching` and `Editing`.

---

J01 Time Zone Display

---

The meeting marker should display three time references: UTC, Participant A local time, and Participant B local time.

The display should make it clear that these are the same meeting instant shown in different time zones.

Example display:

```txt
Meeting time

UTC: 2026-05-22 18:00
Alice: 11:00 AM America/Los_Angeles
Bruno: 8:00 PM Europe/Berlin
```

The component should accept IANA time zone names such as `America/Los_Angeles`, `Europe/Berlin`, and `Asia/Tokyo`.

The component should not accept ambiguous short names such as `PST`, `CET`, or `IST` as canonical configuration values. Those can appear in display output if the runtime formatter provides them, but configuration should use IANA identifiers.

In edit mode, each time-zone row should become editable. The user should be able to edit UTC, Participant A local time, or Participant B local time. When any one row is changed, all other rows should update to match the same meeting instant.

---

K01 Participant Configuration

---

Each participant should have a name, time zone, side, optional avatar, optional color, optional sprite atlas, and optional label.

Participant A defaults to the left side. Participant B defaults to the right side.

The component should support simple character rendering by default, without requiring custom artwork. If avatars are provided, they can replace or decorate the default characters. If sprite atlases are provided, they should control the animated pose sequence for each participant.

---

L01 Configuration Schema

---

The component should be configured with a single object.

```ts
type MeetingTimelineConfig = {
  meeting: {
    title?: string
    startsAt: string
    durationMinutes?: number
    primaryTimeZone?: "UTC" | "participantA" | "participantB"
    editable?: boolean
  }

  participantA: {
    name: string
    timeZone: string
    avatarUrl?: string
    spriteAtlasUrl?: string
    spriteFrameCount?: number
    spriteColumns?: number
    spriteRows?: number
    color?: string
    label?: string
  }

  participantB: {
    name: string
    timeZone: string
    avatarUrl?: string
    spriteAtlasUrl?: string
    spriteFrameCount?: number
    spriteColumns?: number
    spriteRows?: number
    color?: string
    label?: string
  }

  display?: {
    showUtc?: boolean
    showParticipantLocalTimes?: boolean
    showCountdownText?: boolean
    showTimelineTicks?: boolean
    compact?: boolean
    theme?: "light" | "dark" | "auto"
    showEditButton?: boolean
    showShareUrl?: boolean
  }

  editing?: {
    enabled?: boolean
    defaultMode?: "view" | "edit"
    liveConvertOnInput?: boolean
    updateUrlOnInput?: boolean
    urlUpdateDebounceMs?: number
    allowTitleEdit?: boolean
    allowDurationEdit?: boolean
    allowParticipantEdit?: boolean
    allowTimeZoneEdit?: boolean
  }

  urlState?: {
    enabled?: boolean
    mode?: "hash"
    format?: "compact-query"
    replaceHistoryOnInput?: boolean
    pushHistoryOnCommit?: boolean
  }

  animation?: {
    enabled?: boolean
    reducedMotion?: "respect-system" | "always" | "never"
    finalHandshakeWindowSeconds?: number
    postMeetingHoldMinutes?: number
  }

  clock?: {
    now?: string
  }
}
```

The minimum valid configuration should be:

```ts
{
  meeting: {
    startsAt: "2026-05-22T18:00:00Z"
  },
  participantA: {
    name: "Alice",
    timeZone: "America/Los_Angeles"
  },
  participantB: {
    name: "Bruno",
    timeZone: "Europe/Berlin"
  }
}
```

---

M01 Default Configuration

---

If optional values are omitted, the component should use these defaults.

```ts
const defaultConfig = {
  meeting: {
    title: "Meeting",
    durationMinutes: 30,
    primaryTimeZone: "participantA",
    editable: true
  },
  display: {
    showUtc: true,
    showParticipantLocalTimes: true,
    showCountdownText: true,
    showTimelineTicks: true,
    compact: false,
    theme: "auto",
    showEditButton: true,
    showShareUrl: true
  },
  editing: {
    enabled: true,
    defaultMode: "view",
    liveConvertOnInput: true,
    updateUrlOnInput: true,
    urlUpdateDebounceMs: 250,
    allowTitleEdit: true,
    allowDurationEdit: true,
    allowParticipantEdit: true,
    allowTimeZoneEdit: true
  },
  urlState: {
    enabled: true,
    mode: "hash",
    format: "compact-query",
    replaceHistoryOnInput: true,
    pushHistoryOnCommit: true
  },
  animation: {
    enabled: true,
    reducedMotion: "respect-system",
    finalHandshakeWindowSeconds: 60,
    postMeetingHoldMinutes: 5
  }
}
```

---

N01 Countdown Text

---

The component should include a readable countdown label in addition to the visual distance. The countdown should use natural units.

Examples:

```txt
Meeting in 2 days, 3 hours
Meeting in 4 hours, 12 minutes
Meeting in 8 minutes, 20 seconds
Meeting starts now
Meeting started 3 minutes ago
```

For meetings more than one hour away, seconds should not be shown. For meetings under ten minutes away, seconds should be shown.

When the user edits the time and the draft value is valid, the countdown should update against the draft meeting instant. When the draft value is invalid, the countdown should show the last valid value and the invalid input should be visibly marked.

---

O01 Timeline Ticks

---

The timeline should show contextual tick labels based on the active display window.

For a 7-day window, ticks can show days. For a 12-hour window, ticks can show hours. For a 10-minute window, ticks can show minutes. For a 60-second window, ticks can show seconds.

The center tick should always represent the meeting time. Side ticks represent remaining time distance from the meeting point.

Example for a 10-minute window:

```txt
10m        5m        Meeting        5m        10m
```

Because the visual is symmetrical, both sides can show mirrored time distance. The center remains the actual event.

In edit mode, ticks should recalculate from the draft meeting instant after the input becomes valid.

---

P01 Character Design

---

The default characters should be stylized, simple, and lightweight. They should not require complex skeletal animation. The recommended implementation is SVG with transformable body, arm, and hand groups for the first implementation.

Each character should have these visual parts: body, head, near-side arm, far-side arm, hand, name label, and optional avatar circle.

The arm should rotate and extend based on `handExtension`. The body should translate based on participant position. The head and body should remain stable enough to avoid distracting motion.

If avatars are used, the avatar should appear above or inside the character head, but the hand animation should remain visible.

The component should also support sprite atlas rendering. In sprite mode, each participant uses a grid image containing frames from idle to walk to reach. The current frame is selected from countdown progress, distance, and meeting state.

Recommended atlas structure:

```txt
8 columns x 4 rows
32 frames total
Frames 01-08: idle to early walk
Frames 09-16: walk cycle
Frames 17-24: approach and arm extension
Frames 25-32: final reach and near-handshake
```

The atlas must be optional. SVG rendering remains the default because it is easier to theme and resize. Sprite rendering is useful when a more polished illustration style is required.

---

Q01 Responsive Behavior

---

On desktop, the timeline should be horizontal with both participants fully visible.

On tablet, the timeline should remain horizontal but use smaller characters and fewer tick labels.

On mobile, the component should still remain horizontal if possible. If the available width is too narrow, it should switch to compact mode. In compact mode, characters may be simplified, tick labels may be reduced, and the time zone details may stack below the timeline.

The meeting marker should remain visually centered in all layouts.

Edit mode should remain usable on mobile. On narrow screens, editable time-zone fields should stack vertically in this order: UTC, Participant A, Participant B. The live timeline preview should remain visible above the form whenever possible.

---

R01 Accessibility

---

The component should not rely only on animation or distance. It must expose the meeting title, participant names, local times, UTC time, countdown text, and edit state as readable text.

The component should support reduced motion. If the user has reduced motion enabled, the component should update positions without continuous animation. It may use subtle fades or instant state changes.

The component should provide an accessible label similar to:

```txt
Meeting between Alice and Bruno starts in 8 minutes. Alice local time is 11:00 AM. Bruno local time is 8:00 PM. UTC time is 18:00.
```

In edit mode, each time input should have a clear accessible label:

```txt
Edit meeting time in Alice local time, America/Los_Angeles.
```

Color should not be the only way to distinguish participants.

Validation errors should be announced politely. For example, an invalid local time caused by a daylight saving time transition should be explained next to the field and exposed to assistive technology.

---

S01 Error Handling

---

If the meeting time is missing or invalid, the component should render an error state saying that the meeting time is not configured.

If a participant time zone is invalid, the component should still render the timeline using UTC, but it should show a clear time zone error for that participant.

If the browser does not support required date formatting APIs, the component should fall back to UTC-only display.

If the meeting is too far in the future, the component should still render. The maximum default display window should be 30 days, and the countdown text can show the full remaining time.

If the user enters an incomplete or invalid time while editing, the field should keep the typed value, but the meeting instant should not be replaced until the value becomes valid.

If the user enters a local time that does not exist because of daylight saving time, the component should show a validation message and suggest the nearest valid time.

If the user enters a local time that occurs twice because of daylight saving time, the component should show a small disambiguation control with two possible offsets. The default should be the earlier occurrence unless the user selects otherwise.

---

T01 Public Component API

---

The component should expose a small API suitable for use in React or another UI framework.

```tsx
<MeetingTimeline config={config} />
```

Recommended optional callbacks:

```ts
type MeetingTimelineCallbacks = {
  onStateChange?: (state: MeetingTimelineState) => void
  onMeetingStart?: () => void
  onMeetingPastHoldEnd?: () => void
  onEditModeChange?: (isEditing: boolean) => void
  onDraftChange?: (draft: MeetingTimelineDraft) => void
  onCommit?: (config: MeetingTimelineConfig) => void
  onCancel?: () => void
  onUrlStateChange?: (hash: string) => void
}
```

The component should not require external state management. It should manage its own timer internally unless a custom `clock.now` value is supplied.

If URL state is enabled, the component should be able to initialize from the hash, update the hash while editing, and emit the new hash through `onUrlStateChange`.

---

U01 Rendering Architecture

---

The recommended implementation is a React component using SVG for the timeline and default characters.

SVG is preferred because it allows precise positioning, scaling, arm transforms, and responsive resizing without relying on large image assets.

Sprite atlas rendering should be supported as a secondary rendering mode. Sprite rendering can use CSS background positioning, canvas drawing, or image clipping. The implementation should avoid HTML image maps for animation if frame switching is required, because CSS background positioning or canvas rendering provides cleaner frame selection and less DOM complexity.

CSS transitions should handle position changes for normal updates. `requestAnimationFrame` should be used only for the final continuous countdown window, sprite-frame interpolation, or when smooth movement is required.

Date and time formatting should use `Intl.DateTimeFormat`. Time-zone conversion should use a time engine that supports IANA zones and daylight saving disambiguation. A `Temporal`-compatible implementation or a dedicated date-time library is recommended.

---

V01 Animation Timing Rules

---

For normal updates, character movement should use a transition duration between 300ms and 800ms.

For scale changes, the transition duration should be between 600ms and 1200ms.

For the final minute, the position should update continuously from the current remaining time instead of waiting for discrete interval ticks.

The handshake should trigger when remaining time reaches zero. The handshake animation should last around 800ms to 1200ms.

After the handshake, the component should hold the meeting-start state for the configured post-meeting hold period.

When the user is editing time, timeline movement should be debounced slightly to avoid distracting jumps while typing. Text conversions can update immediately after valid input; character position can update after a short debounce.

---

W01 Acceptance Criteria

---

The component renders with only meeting time, participant names, and participant time zones configured.

The center marker always shows the meeting time.

UTC time, Participant A local time, and Participant B local time are displayed when enabled.

The characters are far apart when the meeting is far away.

The characters move closer as the meeting approaches.

The hand extension increases as the meeting approaches.

The characters meet at the center when the meeting starts.

The timeline scale adapts to long and short remaining durations.

The component updates correctly after page refresh.

The component supports reduced motion.

Invalid meeting or time zone configuration produces a clear fallback state.

The layout remains usable on desktop, tablet, and mobile.

The component opens in read-only mode by default.

The user can enter edit mode with an edit button.

The user can edit the meeting time from UTC, Participant A local time, or Participant B local time.

When the user edits one time-zone field, the other time-zone fields update automatically after the input becomes valid.

The URL hash updates while editing when URL state is enabled.

Reloading or sharing the URL restores the same meeting configuration.

Cancel restores the pre-edit configuration and restores the URL hash to the pre-edit value.

Save exits edit mode and keeps the current hash as the shareable state.

Sprite atlas mode can select a frame based on countdown progress.

---

X01 Recommended MVP Scope

---

The first version should include the reusable component, adaptive timeline scale, two default SVG characters, local time display for UTC and both participants, countdown text, reduced-motion support, the meeting-start handshake state, edit mode, live time-zone conversion on input, and compact hash URL sharing.

The MVP should not require custom character artwork, calendar integration, participant availability, recurring meetings, authentication, or multi-person meetings beyond two participants.

Sprite atlas support can be included as an optional rendering mode if the visual direction is confirmed. It should not block the editable time-zone MVP.

---

Y01 Future Enhancements

---

A later version can support custom character themes, more expressive avatar styles, calendar integration, meeting links, sound effects, multiple participants, localization, embeddable share links, screenshot or export mode, and richer sprite atlas packs.

Another useful enhancement would be a preview mode that lets designers scrub through time and see how the timeline looks at different distances from the meeting.

A planning enhancement could add a compare mode where the user tries several possible meeting times and pins candidates before choosing one.

A calendar enhancement could add conflict hints, but only after the core shareable hash-based version is stable.

---

Z01 Product Summary

---

This product is a visual meeting countdown component. It turns the time before a meeting into a spatial relationship between two people. The participants start apart, move toward the center as the meeting approaches, extend their hands as the time gets closer, and meet in a handshake at the scheduled start time.

The core design decision is that the center always represents the meeting, while the distance from the center represents remaining time. The timeline automatically zooms so the component remains meaningful whether the meeting is days away or seconds away.

The extended design adds editable time-zone planning. The meeting remains one absolute instant, but the user can edit that instant through UTC, Participant A local time, or Participant B local time. The other displayed times update live while the user edits. The configuration is also encoded into the URL hash, making the page shareable without a backend.

---

AA00 Edit Mode

---

The component should open in read-only mode by default.

Read-only mode shows the meeting as a polished countdown card. It should include a clear edit button near the meeting marker or in the top control area. The edit button should be visible but not visually dominant.

When the user clicks Edit, the component enters edit mode. Edit mode should preserve the main visual timeline, but the meeting details become editable.

Recommended edit-mode controls:

| Field                       | Editable | Behavior                                                            |
| --------------------------- | -------: | ------------------------------------------------------------------- |
| Meeting title               |      Yes | Updates title and URL hash                                          |
| UTC date and time           |      Yes | Recalculates absolute meeting instant                               |
| Participant A date and time |      Yes | Recalculates absolute meeting instant using Participant A time zone |
| Participant B date and time |      Yes | Recalculates absolute meeting instant using Participant B time zone |
| Participant A name          |      Yes | Updates labels and URL hash                                         |
| Participant B name          |      Yes | Updates labels and URL hash                                         |
| Participant A time zone     |      Yes | Reinterprets Participant A local display and updates hash           |
| Participant B time zone     |      Yes | Reinterprets Participant B local display and updates hash           |
| Duration                    |      Yes | Updates meeting duration and hash                                   |
| Visual style                | Optional | Updates theme or sprite mode                                        |

Edit mode should have Save, Cancel, and Copy Link controls.

Save exits edit mode and keeps the current draft. Cancel exits edit mode and restores the configuration from the moment edit mode was entered. Copy Link copies the current URL, including the hash.

---

AB00 Live Time-Zone Editing

---

The time editor should work on input, not only on blur or submit.

When the user types in one time field, that field becomes the active source field. The component should parse the current value as soon as it is valid. After parsing, it should update the canonical UTC instant and immediately re-render the other time-zone fields.

Example:

```txt
User edits Alice time:
Alice: 2026-05-22 11:30
UTC updates to: 2026-05-22 18:30
Bruno updates to: 2026-05-22 20:30
```

The conversion direction should be determined by the active field.

| Active field  | Parse as                          | Update                                      |
| ------------- | --------------------------------- | ------------------------------------------- |
| UTC           | UTC date and time                 | Participant A and Participant B local times |
| Participant A | Participant A local date and time | UTC and Participant B local time            |
| Participant B | Participant B local date and time | UTC and Participant A local time            |

The input should allow partial typing. For example, if the user types `2026-05-`, the component should not erase the field or force conversion. It should wait until the value is parseable.

The recommended field format is:

```txt
YYYY-MM-DD HH:mm
```

The display may use locale formatting in read-only mode, but edit mode should prefer stable, unambiguous input formatting.

---

AC00 Draft State

---

Edit mode should maintain a draft state separate from the committed state.

```ts
type MeetingTimelineDraft = {
  title: string
  startsAtUtc: string
  durationMinutes: number

  participantA: {
    name: string
    timeZone: string
    localInput: string
  }

  participantB: {
    name: string
    timeZone: string
    localInput: string
  }

  utcInput: string
  activeTimeSource: "UTC" | "participantA" | "participantB" | null
  validation: MeetingTimelineValidation
}
```

The committed configuration is what the component uses when not editing. The draft configuration is what the component uses while editing.

If URL updates on input are enabled, the draft should be reflected in the URL hash as soon as the draft is valid. If the active field is invalid or incomplete, the URL should not be updated for that partial invalid value.

---

AD00 URL Hash State

---

The product should support backend-free sharing through the URL hash.

The URL hash should be compact, readable, and less verbose than JSON. The recommended format is a compact query-style fragment:

```txt
#v=1&t=Design%20Sync&at=2026-05-22T18:00Z&dur=60&a=Alice@America~Los_Angeles&b=Bruno@Europe~Berlin&theme=light&anim=1
```

This format uses short keys and URL-safe values. Time zones use `~` instead of `/` for readability. During parsing, `America~Los_Angeles` becomes `America/Los_Angeles`.

Recommended keys:

| Key       | Meaning                                 | Example                     |
| --------- | --------------------------------------- | --------------------------- |
| `v`       | Hash schema version                     | `1`                         |
| `t`       | Meeting title                           | `Design%20Sync`             |
| `at`      | Meeting start as UTC                    | `2026-05-22T18:00Z`         |
| `dur`     | Duration in minutes                     | `60`                        |
| `a`       | Participant A name and time zone        | `Alice@America~Los_Angeles` |
| `b`       | Participant B name and time zone        | `Bruno@Europe~Berlin`       |
| `theme`   | Theme                                   | `light`                     |
| `anim`    | Animation enabled                       | `1`                         |
| `mode`    | Optional initial mode                   | `view` or `edit`            |
| `spriteA` | Optional Participant A sprite atlas key | `minimal-soft-f`            |
| `spriteB` | Optional Participant B sprite atlas key | `minimal-soft-m`            |

The hash should not contain raw JSON by default. JSON can be supported as an import/export fallback, but the primary user-facing URL should use compact query-style encoding.

---

AE00 URL Update Behavior

---

When the user enters edit mode, the component should store the current hash as the edit baseline.

While the user edits valid values, the URL hash should update using `history.replaceState`. This prevents every keystroke from adding a browser history entry.

When the user clicks Save, the component may use `history.pushState` once so the committed edit becomes a meaningful browser-history point.

When the user clicks Cancel, the component should restore the baseline hash and baseline configuration.

Recommended timing:

```ts
const URL_UPDATE_DEBOUNCE_MS = 250
```

Text fields should remain responsive immediately. URL updates should be debounced to avoid excessive history operations.

If the hash is edited manually by the user or changed through browser navigation, the component should parse it and update the component state.

---

AF00 Hash Encoding and Parsing

---

The hash parser should be forgiving but deterministic.

Example encoded hash:

```txt
#v=1&t=Design%20Sync&at=2026-05-22T18:00Z&dur=60&a=Alice@America~Los_Angeles&b=Bruno@Europe~Berlin
```

Parsed object:

```ts
{
  version: 1,
  title: "Design Sync",
  startsAtUtc: "2026-05-22T18:00:00.000Z",
  durationMinutes: 60,
  participantA: {
    name: "Alice",
    timeZone: "America/Los_Angeles"
  },
  participantB: {
    name: "Bruno",
    timeZone: "Europe/Berlin"
  }
}
```

Recommended encoding rules:

| Rule                     | Behavior                                               |
| ------------------------ | ------------------------------------------------------ |
| Spaces                   | Percent-encoded as `%20` or encoded by URLSearchParams |
| Time zone slash          | Replace `/` with `~` for readability                   |
| Participant pair         | Use `name@timezone`                                    |
| Missing title            | Use default title                                      |
| Missing duration         | Use default duration                                   |
| Missing participant name | Use default name                                       |
| Invalid time zone        | Preserve value, show validation error                  |
| Unknown keys             | Ignore but preserve if possible when reserializing     |

---

AG00 Time Editing UI

---

The edit panel should be compact and directly connected to the meeting marker.

Recommended desktop layout:

```txt
Design Sync                         [Save] [Cancel] [Copy Link]

UTC             [2026-05-22] [18:00]
Alice           [2026-05-22] [11:00]   America/Los_Angeles
Bruno           [2026-05-22] [20:00]   Europe/Berlin

Duration        [60] minutes
```

The active edited row should be visually highlighted. For example, if the user is editing Alice time, the Alice row receives an active border and the UTC and Bruno rows update as converted values.

The user should be able to edit date and time separately. This is easier and less error-prone than one large text field.

Recommended internal field model:

```ts
type EditableTimeRow = {
  source: "UTC" | "participantA" | "participantB"
  dateInput: string
  timeInput: string
  timeZone: string
  isActive: boolean
  isValid: boolean
}
```

The product should not force the user to choose a source time zone before editing. The source should be inferred from the row being edited.

---

AH00 Time-Zone Editing UI

---

Participant time zones should be editable in edit mode.

The preferred control is a searchable combo box using IANA time zones. It should show the canonical zone and a friendly offset preview.

Example options:

```txt
America/Los_Angeles     UTC-07:00
Europe/Berlin           UTC+02:00
Asia/Tokyo              UTC+09:00
```

When the user changes a participant time zone, the meeting instant should remain unchanged by default. The local time display for that participant should update to show what the same meeting instant means in the new zone.

A secondary advanced option can allow reinterpretation. Reinterpretation means preserving the typed wall-clock time while changing the time zone, which changes the actual meeting instant. This should not be the default because it is easier to make mistakes.

Default behavior:

```txt
Change time zone, preserve instant.
```

Advanced behavior:

```txt
Change time zone, preserve local wall-clock time.
```

---

AI00 Validation Rules

---

The component should validate the draft continuously.

| Validation                    | Behavior                                     |
| ----------------------------- | -------------------------------------------- |
| Missing date                  | Mark field incomplete, do not update instant |
| Missing time                  | Mark field incomplete, do not update instant |
| Invalid date                  | Show field error                             |
| Invalid time                  | Show field error                             |
| Invalid time zone             | Show time-zone error                         |
| DST nonexistent time          | Show error and suggested nearest valid time  |
| DST ambiguous time            | Show disambiguation selector                 |
| Duration below 1 minute       | Clamp or show error                          |
| Duration above 24 hours       | Allow but warn if unusual                    |
| Meeting more than 1 year away | Allow but show long-range scale warning      |

The component should avoid destructive correction while typing. It should not rewrite the active field unless the user confirms or leaves the field.

---

AJ00 Share Link Behavior

---

The product should include a Copy Link button in edit mode and optionally in read-only mode.

The copied link should include the current URL hash. If the draft is valid, it should copy the draft state. If the draft is invalid, it should copy the last valid state and show a warning that the incomplete edit was not included.

The share link should be deterministic. The same configuration should produce the same hash key order.

Recommended key order:

```txt
v, t, at, dur, a, b, theme, anim, mode, spriteA, spriteB
```

The product should not require a server to open a shared link.

---

AK00 Browser History Behavior

---

The browser back button should behave predictably.

During typing, the component should use `replaceState`, not `pushState`.

On Save, the component may push a single committed state.

On Cancel, the component should restore the baseline state.

If the user manually navigates back to a previous hash, the component should parse that hash and update the meeting.

If the current draft has unsaved valid changes and the user navigates away, the component may show a lightweight confirmation only if the app is full-screen or editor-like. For an embeddable component, it should not block navigation by default.

---

AL00 Sprite Atlas Integration

---

Sprite atlas support should map countdown progress to frame index.

```ts
const frameIndex = Math.round(progressRatio * (frameCount - 1))
```

For a 32-frame atlas:

```ts
const frameIndex = clamp(Math.round(progressRatio * 31), 0, 31)
const col = frameIndex % 8
const row = Math.floor(frameIndex / 8)
```

CSS background-position approach:

```css
.sprite {
  width: var(--frame-width);
  height: var(--frame-height);
  background-image: url("/sprites/alice-minimal-soft.png");
  background-size: calc(var(--frame-width) * 8) calc(var(--frame-height) * 4);
  background-position:
    calc(var(--col) * -1 * var(--frame-width))
    calc(var(--row) * -1 * var(--frame-height));
}
```

Male and female characters may use different atlases, but their frame counts should match if they are intended to reach the meeting point together.

The sprite atlas should not include title text, frame numbers, or labels in production assets. Development atlases may include grid labels, but production atlases should contain only sprites and transparent or neutral backgrounds.

---

AM00 Implementation Notes

---

The recommended implementation should separate four concerns: meeting state, time-zone conversion, URL serialization, and visual rendering.

Suggested modules:

```txt
meeting-state.ts
time-zone-conversion.ts
hash-state.ts
timeline-scale.ts
character-renderer.ts
sprite-atlas.ts
```

The visual component should not directly parse hashes or perform low-level time-zone math. It should receive normalized state and render it.

Recommended data flow:

```txt
URL hash -> parsed config -> normalized meeting state -> renderer

Edit input -> draft parser -> UTC instant -> converted rows -> URL hash -> renderer
```

This keeps the product easier to test.

---

AN00 Testing Requirements

---

The time editing feature should have unit tests for conversion from each source field.

Required test cases:

| Case                           | Expected result                |
| ------------------------------ | ------------------------------ |
| Edit UTC time                  | Participant local times update |
| Edit Participant A time        | UTC and Participant B update   |
| Edit Participant B time        | UTC and Participant A update   |
| Edit incomplete date           | No committed instant change    |
| Edit invalid time              | Validation error               |
| Change Participant A time zone | Meeting instant preserved      |
| Save edit                      | Draft becomes committed state  |
| Cancel edit                    | Baseline state restored        |
| URL hash parse                 | Config restored                |
| URL hash serialize             | Stable key order               |
| Browser reload                 | Same meeting restored          |
| DST nonexistent time           | Error shown                    |
| DST ambiguous time             | Disambiguation shown           |

Visual tests should confirm that changing the meeting time updates character position, hand extension, countdown text, and timeline ticks.

---

AO00 Updated MVP Decision

---

The MVP should include hash-based sharing and edit mode from the beginning. These are core product behaviors, not secondary settings.

The recommended MVP priority is:

| Priority | Feature                               |
| -------: | ------------------------------------- |
|        1 | Read-only countdown timeline          |
|        2 | UTC and two participant time displays |
|        3 | Edit mode                             |
|        4 | Live time-zone conversion on input    |
|        5 | Hash URL serialization                |
|        6 | Reduced motion                        |
|        7 | Sprite atlas support                  |
|        8 | Calendar integration                  |

Calendar integration should wait. The product can be valuable immediately as a shareable meeting-time visualizer without accounts, database storage, or external calendar permissions.
