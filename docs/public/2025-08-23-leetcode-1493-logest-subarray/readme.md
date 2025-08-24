# Project specification: Interactive sliding window visualizer for LeetCode 1493

2025-08-23

## Goal

Build a self-contained HTML+CSS+JavaScript app that teaches the sliding window solution for "Longest Subarray of 1s After Deleting One Element" through an interactive, step-by-step visualization with debugger-style controls, live annotations, and editable input.

## Core learning outcomes

Users should be able to see why the window must keep at most one 0.
 Users should understand why the score is right − left.
 Users should connect each visual change to the exact line of code.
 Users should verify correctness on edge cases by changing the input.

## Files

index.html
 styles.css
 app.js

## Data model

Step objects represent atomic moments in the algorithm. Each step freezes state and explains why it changed.

```js
// Immutable snapshot
{
  id: number,                     // 0..N-1
  phase: "init" | "expand" | "shrink" | "compute" | "updateBest" | "final",
  action: "readRight" | "incZeros" | "whileCheck" | "moveLeft" | "decZeros" | "score" | "best" | "done",
  left: number,                   // current left index
  right: number,                  // current right index
  zeros: number,                  // count of zeros in [left..right]
  best: number,                   // best score so far
  winLen: number,                 // right - left + 1 if window exists else 0
  score: number,                  // right - left if window exists else 0
  nums: number[],                 // original array copy for rendering
  highlight: {                    // UI hints for this step
    windowStart: number,
    windowEnd: number,
    leftChanged: boolean,
    rightChanged: boolean,
    zerosChanged: boolean,
    bestChanged: boolean,
    changedCells: number[]        // indices whose value matters this step
  },
  codeFocus: {startLine: number, endLine: number}, // inclusive 1-based
  comment: string                 // human explanation
}
```

## Algorithm engine

Instrument the sliding window to emit steps. Generate all steps upfront for the current input so the user can scrub backward and forward instantly.

```js
function generateSteps(nums) {
  const steps = [];
  let left = 0, zeros = 0, best = 0;

  // Pseudocode line numbers below assume the teaching version shown in the Code pane
  // 1: function longestSubarray(nums) {
  // 2:   let left = 0, zeros = 0, best = 0;
  // 3:   for (let right = 0; right < nums.length; ++right) {
  // 4:     if (nums[right] === 0) ++zeros;
  // 5:     while (zeros > 1) {
  // 6:       if (nums[left] === 0) --zeros;
  // 7:       ++left;
  // 8:     }
  // 9:     const score = right - left;
  // 10:    if (score > best) best = score;
  // 11:  }
  // 12:  return best;
  // 13: }

  pushStep("init", "done");

  for (let right = 0; right < nums.length; ++right) {
    pushStep("expand", "readRight", /*focus line*/3);

    if (nums[right] === 0) {
      ++zeros;
      pushStep("expand", "incZeros", /*focus line*/4);
    } else {
      pushStep("expand", "whileCheck", /*focus line*/5);
    }

    while (zeros > 1) {
      pushStep("shrink", "whileCheck", /*focus line*/5);
      if (nums[left] === 0) {
        --zeros;
        pushStep("shrink", "decZeros", /*focus line*/6);
      }
      ++left;
      pushStep("shrink", "moveLeft", /*focus line*/7);
    }

    const score = right - left;
    pushStep("compute", "score", /*focus line*/9, {score});

    if (score > best) {
      best = score;
      pushStep("updateBest", "best", /*focus line*/10);
    }
  }

  pushStep("final", "done", /*focus line*/12);

  return steps;

  function pushStep(phase, action, focusLine, extra={}) {
    const rightIndex = action === "init" ? -1 : Math.min(steps.right ?? -1, nums.length - 1);
    const rightGuess = action === "readRight" ? steps.length /*unused*/ : rightIndex;

    const windowExists = action !== "init" && (typeof right !== "undefined") && right >= left;
    const winLen = windowExists ? (right - left + 1) : 0;
    const score = windowExists ? (right - left) : 0;

    steps.push({
      id: steps.length,
      phase,
      action,
      left,
      right,
      zeros,
      best,
      winLen,
      score,
      nums: nums.slice(),
      highlight: {
        windowStart: left,
        windowEnd: right,
        leftChanged: action === "moveLeft",
        rightChanged: action === "readRight",
        zerosChanged: action === "incZeros" || action === "decZeros",
        bestChanged: action === "best",
        changedCells: action === "readRight" ? [right] : action === "moveLeft" ? [left - 1] : []
      },
      codeFocus: { startLine: focusLine ?? 2, endLine: focusLine ?? 2 },
      comment: buildComment(phase, action, {left, right, zeros, best, winLen, score, nums, extra})
    });
  }
}
```

The comment builder returns plain explanations such as:

- On readRight: I include nums[right] into the window.
- On incZeros: I saw a zero, so zeros is incremented.
- On whileCheck with zeros > 1: Too many zeros, I will slide left to drop the oldest zero.
- On decZeros: I just passed a zero at left, zeros is decremented.
- On moveLeft: I advanced left by 1 to restore zeros <= 1.
- On score: I compute score = right − left because one deletion is mandatory.
- On best: New best found, update best.

## UI layout

Use a single responsive page with five panes.

Header
 Control bar
 Visualization pane
 Debugger pane
 Commentary and timeline

### Header

Problem title and a short one-line description.
 Preset selector and input field.

### Control bar

Play button toggles Play and Pause.
 Next Step and Previous Step.
 Jump to Start and Jump to End.
 Speed slider with values 0.25x, 0.5x, 1x, 1.5x, 2x.
 Auto pause toggle for milestones.
 Randomize array button.
 Validate and Run button for custom input.

### Visualization pane

Horizontal array cells in a scrollable container.
 Each cell shows its index and value.
 Left pointer arrow floats above the current left cell.
 Right pointer arrow floats above the current right cell.
 Window region [left..right] is highlighted.
 Zero cells in the window show a small badge with 0.
 When zeros > 1, show a red stripe on the window bar with a tooltip Too many zeros.
 When best updates, paint the best segment underline in green and pulse once.
 Animate pointer moves with transform translateX and 200 ms duration.

### Debugger pane

Registers box with the current values of left, right, zeros, best, window length, score.
 Values that changed in the last step flash with a brief background animation.
 Code box with the instrumented JavaScript shown and the current line highlighted.
 The code is read-only and uses 1-based line numbers.

### Commentary and timeline

A single step comment in clear English.
 A plain equation when it helps, for example score = right − left = 7 − 2 = 5.
 A horizontal timeline with one small bar per step colored by phase.
 A draggable handle to scrub to any step.
 Clickable milestone markers on steps where action is best or decZeros.

## Visual language

Use CSS variables for colors.
 Use a mono font for code and indices.
 Use transform and opacity for performance.
 Respect prefers-reduced-motion to disable animations.
 Provide a Dark mode toggle.

## Input

Allow both preset choices and freeform input.
 Presets include: example 1 1 0 1 1 1 0 1, all ones of length 6, all zeros of length 6, single zero in the middle, alternating 1 0 1 0 1 0, single element 1, single element 0.
 Freeform accepts values 0 and 1 separated by spaces or commas.
 Limit length to 200 by default.
 Show a clear error if input contains other digits.

## State machine

States are Idle, Playing, Paused, Finished.
 Events are LoadInput, Play, Pause, StepForward, StepBack, JumpStart, JumpEnd, ScrubTo, SpeedChange, ToggleAutoPause.
 Transitions are deterministic.
 Auto pause triggers on actions best and decZeros and moveLeft and done.

## Rendering rules

Always render the entire array.
 Render the current window with a translucent overlay spanning cells from left to right.
 Render left and right pointers as absolutely positioned elements anchored to cell centers.
 When left moves, animate its arrow to the next cell.
 When right moves, animate its arrow to the next cell.
 When zeros changes, animate zero badges with a quick scale.
 When best changes, pulse the best underline under the exact subarray that achieved it.
 When zeros > 1, render a temporary red banner above the window that fades after 500 ms.

## Timing

Default step advance while playing is one step every 700 ms.
 Pointer animations run for 200 ms.
 Best pulse runs for 400 ms.
 Comment text uses a 150 ms fade.

## Accessibility

All controls have aria-labels.
 All pointer movements mirror to text in the registers.
 Tab order follows header, controls, visualization, debugger, timeline.
 Keyboard shortcuts are mirrored to toolbar tooltips.
 High-contrast theme is available via a toggle.

## Keyboard shortcuts

Space toggles Play and Pause.
 Right Arrow steps forward.
 Left Arrow steps back.
 Home jumps to start.
 End jumps to end.
 R randomizes input.
 Enter runs after editing the array field.
 1..5 choose presets.

## Code pane source

Show this exact teaching version and keep the line numbers stable.

```js
function longestSubarray(nums) {          // 1
  let left = 0, zeros = 0, best = 0;      // 2
  for (let right = 0; right < nums.length; ++right) { // 3
    if (nums[right] === 0) ++zeros;       // 4
    while (zeros > 1) {                    // 5
      if (nums[left] === 0) --zeros;      // 6
      ++left;                              // 7
    }                                      // 8
    const score = right - left;            // 9
    if (score > best) best = score;        // 10
  }                                        // 11
  return best;                              // 12
}                                          // 13
```

## Step comments catalog

readRight: I include nums[right] into the window.
 incZeros: I saw a 0, increment zeros.
 whileCheck with zeros > 1: Too many zeros, I must shrink from the left.
 decZeros: I passed a 0 at left, decrement zeros.
 moveLeft: I advanced left by 1 to restore zeros <= 1.
 score: I compute score = right − left because one deletion is mandatory.
 best: New best found, update best.
 done: The loop ended, return best.

## UI element ids and classes

App root id is app.
 Controls container id is controls.
 Array container id is arrayPane.
 Registers container id is registers.
 Code container id is codePane.
 Comment container id is commentPane.
 Timeline container id is timeline.
 Use class cell for each array element.
 Use class pointer for left and right arrows.
 Use class windowOverlay for [left..right].
 Use class zeroBadge for 0 markers.
 Use class bestUnderline for the best segment.

## CSS variables

--bg, --fg, --accent, --ok, --warn, --muted, --grid, --codeBg.

## Control bar API

Programmatic control functions for tests and future automation.

```js
player.play();
player.pause();
player.step(+1);    // forward 1
player.step(-1);    // back 1
player.jump(0);     // to step index
player.setSpeed(1.0);
player.setAutoPause(true);
```

## Rendering API

```js
render.step(step);             // draw everything for a step
render.highlightCode(step);    // focus code lines
render.updateRegisters(step);  // left, right, zeros, best
render.updatePointers(step);   // animates arrows
render.updateWindow(step);     // overlay and zero badges
render.updateBest(step);       // underline best segment
```

## Input parsing

Split on commas and whitespace.
 Filter empty tokens.
 Accept only 0 and 1.
 Convert to numbers.
 Clamp length.
 Return an error object on invalid input.

## Example run, first 12 steps for 1,1,0,1,1,1,0,1

0 init done, left 0, right -1, zeros 0, best 0, score 0
 1 expand readRight, right 0, include 1
 2 compute score, right 0, left 0, score 0, best 0
 3 expand readRight, right 1, include 1
 4 compute score, right 1, left 0, score 1, best becomes 1
 5 expand readRight, right 2, include 0
 6 expand incZeros, zeros becomes 1
 7 compute score, right 2, left 0, score 2, best becomes 2
 8 expand readRight, right 3, include 1
 9 compute score, right 3, left 0, score 3, best becomes 3
 10 expand readRight, right 4, include 1
 11 compute score, right 4, left 0, score 4, best becomes 4
 12 expand readRight, right 5, include 1
 Then repeat the pattern until the second zero appears, triggering shrink steps.

These lines are produced by the comment field and the registers panel shows the exact numbers.

## Milestone pauses

Pause automatically on incZeros.
 Pause automatically on whileCheck when zeros > 1.
 Pause automatically on best.
 Users can disable auto pauses.

## Timeline coloring

init is gray.
 expand is blue.
 shrink is orange.
 compute is purple.
 updateBest is green.
 final is gray.

## Best underline rules

Underline the exact segment that realizes best at the moment best updates.
 If zeros == 1, underline the window minus the zero cell.
 If zeros == 0, underline the window minus either end cell and place a small bracket glyph at both ends to indicate minus one.
 Store this underline as a persistent overlay until replaced by a better best.

## Window rendering rules

Window exists only if right >= left.
 When right < left, hide overlay and pointers.
 When left == right, draw a single cell overlay.
 Overlay extends slightly beyond cells for visual clarity.
 Use aria-label on overlay to announce Window from i to j.

## Animation details

Use CSS class .pulse for best updates that scales from 1 to 1.06 and back.
 Use CSS class .flash for register changes, 120 ms background change.
 Use cubic-bezier(0.2, 0.8, 0.2, 1) easing.
 Use requestAnimationFrame to align updates and avoid layout thrash.

## Error handling

If input is empty, show message Enter a binary array.
 If input has invalid tokens, show message Only 0 and 1 are allowed.
 If length exceeds limit, show message Max length is 200 and clip.

## Performance

Precompute all steps once on Run.
 Cap steps by capping input length.
 Use transforms for pointers and overlays.
 Avoid reflow by updating classes and CSS variables, not inline layout metrics.

## Testing checklist

Verify best for presets:
 1,1,0,1,1,1,0,1 => 5
 1,1,1,1,1 => 4
 0,0,0,0 => 0
 1,0,1 => 2
 1 => 0
 0 => 0

Verify that shrinking happens only when zeros > 1.
 Verify that score equals right − left at all compute steps.
 Verify that best never decreases.
 Verify that auto pauses occur at configured milestones.
 Verify keyboard shortcuts.

## Extensibility

Add a k slider later for up to k zeros with the exact same renderer.
 Add a Flip vs Delete mode toggle where score becomes right − left + 1.
 Add a Compare tab that shows two panes side by side.

## Deliverables

A working index.html with semantic regions and ids as specified.
 A styles.css with variables and classes as specified.
 An app.js with generateSteps, player, render modules and the public APIs.
 A README with a one-minute run guide.
 No external dependencies.
 All modern evergreen browsers supported.
