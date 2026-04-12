# Charters And Prompts

## Why The Charter Layer Exists

The biggest failure mode in exploratory review is tunnel vision:

- click the target control
- confirm the expected change
- stop looking

That misses many real product issues:

- ugly neighboring layout
- stale state
- broken active treatment
- visual imbalance after narrowing
- noisy copy or metadata

The charter layer forces the reviewer to inspect beyond the narrow action path.

## Guided Step Structure

Each step records:

- `intent`
- `focus`
- `actions`
- `lookAround`
- `reviewQuestions`
- current snapshot
- screenshot path

That structure exists to preserve why the step was taken, not just what was clicked.

## Current Supported Actions

- `open`
- `selectProblemByTitle`
- `selectProblemById`
- `searchFor`
- `clickQuickView`
- `resetFilters`
- `openRoadmap`
- `selectRoadmapProblem`
- `openFirstGuideFromOverview`
- `openGuideByTitle`
- `goBackToExplorer`
- `openSolutions`
- `closeSolutions`
- `selectSolutionLanguage`
- `markSolved`
- `writeNote`
- `wait`

## Anti-Tunnel-Vision Prompt Pattern

Good prompts do not just restate the action.

Weak:

- "Did the guide open?"

Better:

- "Does the guide justify its existence, or does it read like filler?"
- "Does the narrowed state still look deliberate, or did the page become awkward and empty?"
- "Does the selected problem remain visually obvious after moving into the solution workspace?"

## How To Write A Good Charter

Prefer steps that combine:

- one primary interaction
- one judgment target
- two or three "look around" prompts

Example:

```json
{
  "id": "solution-workspace-review",
  "title": "Open the solution workspace",
  "intent": "Check whether the new solution viewer feels attributable, readable, and worth using.",
  "focus": "Review attributed implementations, language ordering, and inline annotations.",
  "actions": [
    { "type": "selectProblemByTitle", "value": "Decode Ways" },
    { "type": "openSolutions" }
  ],
  "lookAround": [
    "Do the language tabs read in a sensible order?",
    "Does attribution feel explicit and trustworthy?",
    "Do the inline annotations help without turning the code view into noise?"
  ],
  "reviewQuestions": [
    "Would I actually study from this solution surface instead of opening the repos manually?"
  ]
}
```

## Review Standard

A session should record observations even when there is no functional bug.

Examples of valid observations:

- the sparse-result state feels empty and underdesigned
- the modal technically works but the code pane reads poorly
- the feature exists but is still too hard to trust

That distinction matters because product quality is not the same thing as bug count.
