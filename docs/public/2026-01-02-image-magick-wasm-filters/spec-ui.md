2026-01-02

## UI Implementation strategy

A00 Core idea for a small, project-scoped UI layer

The simplest approach that stays reusable without becoming a full framework is a “component-ish” layer built on three primitives: a typed state store per widget, declarative control descriptors, and a job scheduler that mediates state changes into processing requests. Each widget becomes a self-contained unit that owns its DOM subtree, its state, and its processing lifecycle, but it relies on shared infrastructure for binding controls, debouncing, lazy activation, progress reporting, and stale-result rejection.

The key design choice is to avoid two-way binding as a general rule. Instead, use a one-way data flow: user input updates widget state, state changes schedule work, work results update widget output state, and the UI renders from state. The “two-way” part is limited to keeping controls in sync with state when state is changed programmatically (reset to defaults, load saved presets, clamp invalid values). That is handled by a controlled “render controls from state” function, not by bidirectional observers.

B00 Widget as a class with an explicit contract

Represent each widget as an instance of a Widget class with a strict interface:

It receives references to a shared AppContext (source image store, worker client, global scheduler, lazy visibility observer).

It exposes a parameter schema (control descriptors) and default values.

It can build its DOM subtree from the schema plus widget-specific additions (interactive crop handles, etc).

It can translate current parameters into a worker request payload and into a CLI command string.

It has a lifecycle: mount (create DOM, bind events), activate (becomes eligible to process), deactivate (not eligible), dispose (remove listeners).

This keeps widget implementation deterministic and keeps the UI architecture readable by a coding agent: schema drives controls, state drives rendering, scheduler drives processing.

C00 Control descriptors as the “single source of truth” for UI bindings

Define each control once in a descriptor object that includes:

id, label, hint text, type (range, number, checkbox, select, color, text), min/max/step where applicable, formatting rules (display value formatting), default, and a parse function to coerce raw DOM input into a valid typed value.

From that descriptor, the shared code can generate:

The DOM element (input/select), its label, hint line, and the “current value” label.

The binding: attach input and change listeners, call parse+clamp, update widget state.

The reverse render: when widget state is set programmatically, write the value back into the control element and the value label.

This eliminates bespoke binding code per control and prevents drift: the descriptor defines what the control is and how it behaves.

D00 Minimal state store per widget, with change batching

Each widget owns a small state store:

params: a plain object containing current parameter values, typed.

ui: derived UI flags such as expanded/collapsed, lastError, isRunning, isEligible, lastRenderTimestamp.

output: blobUrl, output metadata, and the current CLI command string.

Expose a small API: getState, setParam(key, value), setParams(partial), resetDefaults, subscribe(listener).

Important detail: state updates should batch. When a slider is dragged, you do not want re-render per micro-change. A practical approach is to apply param changes immediately but only notify subscribers on the next microtask or animation frame. That makes the UI feel smooth while still keeping logic simple.

E00 Scheduler as the mediator: debounce, dedupe, stale-result rejection

Centralize the “when do we reprocess” logic outside the widget code so it is consistent. Widgets should not implement their own debounce and cancellation logic repeatedly. Instead, each widget reports that its params changed, and the scheduler decides:

If widget is not eligible (lazy), store “dirty” flag and do nothing else.

If widget is eligible, start or restart a debounce timer (default 150 ms, per-widget override allowed).

When debounce fires, compute a job token (sourceId, widgetId, paramRevision). Send job to worker. Mark widget as Running.

When worker replies, compare the token with the widget’s latest token. If it is stale, discard. If it matches, update output and mark Ready.

This cleanly solves rapid changes and ensures that older results cannot overwrite newer ones.

F00 Worker client with progress events and perceived progress

Actual ImageMagick operations may not emit granular progress. You still want perceived progress to avoid “did it freeze?” The worker client should standardize three kinds of messages:

JobStarted: includes job token, widgetId.

JobProgress: includes job token, stage name, stage index, stage count, and an optional percent. Stages are synthetic when real progress is unavailable.

JobCompleted: includes job token, output bytes or blob, output metadata, and any warnings.

JobFailed: includes job token, error code, message.

For single-step widgets, stage count can be 1. For pipeline widgets, stages can map to each internal step (denoise, contrast, sharpen, etc). Even if each step is implemented as separate ImageMagick calls or as one combined call, the progress stages can be emitted as “Queued”, “Processing”, “Encoding”, “Finalizing”. The UI can show a spinner plus a stage label, and optionally a simple progress bar that moves across stages rather than true percent. This is honest and still useful.

G00 Lazy activation as a shared service

Use one IntersectionObserver for the catalog and mark widgets eligible when at least 25 percent visible. When eligible flips from false to true, the scheduler checks whether the widget is dirty or has never rendered and queues a render.

This should be implemented as a shared LazyRegistry that owns the observer and a map from DOM elements to widget instances.

H00 Rendering strategy: small, explicit DOM updates

Avoid a full virtual DOM or heavy templating. The UI can remain maintainable by adopting a rule:

Each widget has a fixed DOM structure. The shared code only mutates a small set of known nodes: preview img src, status line text, progress bar width, error text, CLI text, and control values.

That yields predictable performance and is easy for a coding agent to implement without introducing a framework dependency.

I00 Command line view and copy behavior as a reusable widget footer

The CLI view is the same in every widget. Implement it once as a “footer component” that a widget instantiates with a callback getCliString(). It renders:

A monospaced block with the CLI string.

A Copy button that writes to clipboard and gives a short visual confirmation.

This reduces duplication and ensures the stable option ordering contract stays visible in one place.

J00 What this buys you

This approach gives you reusability in exactly the areas that tend to explode: control generation and binding, scheduling and cancellation, progress display, lazy activation, and standard footers (CLI and download). It avoids creating a general UI framework, but still provides a consistent internal architecture that scales across many widgets and is straightforward to extend.

If you want, the next document can formalize this into a UI specification with concrete DOM structures, required CSS class names, required events and message payloads, and explicit rules for debouncing, progress display, and worker communication.
