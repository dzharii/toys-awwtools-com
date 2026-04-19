2026-04-18

A00. share-and-scratchpad-change-request.md

# Share and Scratchpad Change Request

## A00. Purpose

This document defines a change request for the current working browser application. The application is already usable and this request focuses on two new capabilities built on top of the current behavior.

The first capability is a permanent scratchpad problem called `New` that always appears at the top of the problem selector and allows arbitrary C99 code experimentation without being tied to a normal algorithm problem.

The second capability is URL-based sharing of the current editing state so that another person can open a link and view and run the shared code directly in the browser.

Codex should implement this change using its own best judgment where details are not fully specified. Ambiguities should be resolved in favor of simplicity, usability, browser safety, and compatibility with the current architecture.

## B00. Change summary

The application should gain a new built-in problem entry named `New`. This entry must always appear first in the problem dropdown list, above all normal problems. It is a scratchpad workspace for arbitrary C99 experiments.

The application should also gain a `Share` button near the existing top controls, positioned on the right side near `Settings`. Pressing `Share` should generate a self-contained browser URL that encodes the current editor state and enough associated state for another person to open the link and immediately inspect and run the shared code.

The shared link must be browser-only and must not require server-side storage.

## C00. Scratchpad problem: `New`

The `New` problem is a special built-in problem intended as a generic scratchpad rather than a normal challenge.

It must always be displayed at the top of the problem dropdown.

It must load a default starter program shaped like this in substance:

```c
int problem(void) {
    printf("Hello, world!\n");
    return 0;
}
```

The exact whitespace may vary, but the semantic structure must remain the same. The function name should be `problem`. The return type should be `int`. The argument list should be `void`. The starter should print a hello-world message and return zero.

This problem must include a minimal harness and at least one test that always passes so that the scratchpad is executable through the normal run flow. The point of this entry is not correctness scoring. The point is to provide a reusable place to run arbitrary C code, inspect stdout, inspect stderr when available, and observe runtime behavior.

The scratchpad should behave like a first-class problem in the application. It should be selectable from the same problem dropdown and should preserve editor state like other problems.

Codex should modify the problem-definition source where problems are currently declared so that `New` is built into the application and sorted first regardless of the ordering of the rest of the list.

## D00. Scratchpad behavior expectations

The scratchpad is intended for freeform experimentation. A person should be able to select `New`, replace the starter code with arbitrary valid C99 code, press `Run`, and inspect output and logs using the same UI already present.

The scratchpad should not force the person into a function-signature style tied to a normal algorithm problem. Its function contract is intentionally minimal.

The visible description for `New` should make it clear that it is a scratchpad or playground for arbitrary code testing.

The associated tests should not create friction. The simplest acceptable design is a trivial pass-through test that lets the runtime execute the function and report success as long as compilation and execution complete.

If Codex sees a better way to model the scratchpad within the current harness architecture while preserving simplicity, it may do so.

## E00. Share feature overview

Add a `Share` button to the top action row, placed near the existing `Settings` button on the right side.

The purpose of `Share` is to let a person copy a URL that contains the current work state in a browser-only form. Another person can open that URL and immediately see the same code and enough relevant context to run it.

The implementation should use the current page URL as the base and append a fragment payload using the URL hash. The payload must not depend on server routing. The server should only receive the normal page request. The browser should handle the shared state entirely from the hash fragment.

The shared payload should be encoded compactly. Base64 is acceptable, but Codex should use a URL-safe encoding variant or otherwise ensure the produced fragment is robust in browser copying and pasting. Compression may be added if helpful, but it is not required unless payload size becomes a practical issue.

After generating the share URL, the application should copy it to the clipboard automatically and give clear feedback that the copy succeeded or failed.

## F00. What the shared link must contain

The shared link must include enough data so that the receiver can open the page and see the intended state without manual reconstruction.

At minimum, the shared payload must include the selected problem identifier.

It must include the current editor code exactly as edited.

It should include the current custom tests content if custom tests are relevant to reproducing the sender's current working context.

It may include other lightweight state that materially improves reproducibility, but Codex should avoid bloating the URL with unnecessary transient UI state.

The receiver's page should parse the fragment on load, apply the shared state, select the correct problem, populate the editor, populate custom tests when included, and leave the page ready to run.

## G00. Recommended sharing model

The best implementation is this:

The shared link should preserve the selected problem when the sender is working on a normal built-in problem such as Two Sum or Best Time To Buy And Sell Stock. In that case, the receiver should open directly into that same problem, but with the sender's code loaded into the editor and the sender's custom tests loaded into the custom-tests area if present.

This is the simplest and most useful behavior because it preserves the problem statement, the intended function contract, and the current code together. It makes the link meaningful for collaboration, debugging, and discussion.

For the scratchpad `New`, the shared link should reopen into `New` and restore the arbitrary scratchpad code and scratchpad custom tests.

This model is better than trying to convert every shared state into the scratchpad. Converting normal problem solutions into the scratchpad would discard the connection to the original problem statement and make the receiving experience worse. The receiver should normally see the same problem the sender was solving.

Therefore the recommended rule is:

If the sender is on a normal problem, share that normal problem plus its code and custom tests.

If the sender is on `New`, share `New` plus its code and custom tests.

This preserves the best context in both cases.

## H00. Why this is the best approach

The sender's stated need is that another person can open the link and view and run the shared code. The most reliable way to achieve that in the current product is to keep the existing problem model intact and overlay the sender's editor state on top of it.

That approach avoids introducing a second interpretation layer where shared content must be transformed into another problem type.

It also avoids ambiguity for the receiver. If the link was created from a known problem, the receiver sees that exact problem statement and the exact code associated with it. If the link was created from the scratchpad, the receiver sees a scratchpad.

This design is simpler to implement, easier to explain, and more faithful to the sender's current working state than a forced conversion model.

## I00. Shared tests recommendation

Do not attempt to convert all built-in official tests into custom tests inside the share payload.

The built-in visible tests should continue to come from the selected problem definition already bundled with the application. They are stable, known, and need not be duplicated into the URL.

The shared payload should include only sender-controlled state that is not already recoverable from the selected built-in problem. In practice, this means the sender's edited code and the sender's custom tests area.

This keeps the shared URL smaller and avoids redundant duplication of problem metadata already present in the application.

So the recommended shared state is:

Selected problem id.

Current editor code.

Current custom tests text.

Optionally a small version marker for future compatibility.

That is enough for reproducible sharing in the current architecture.

## J00. URL format recommendation

Codex should use the page's current location without query-string dependence for the shared data. The shared state should go into the hash fragment.

A suitable shape is conceptually like this:

`https://.../dist/#share=<encoded-payload>`

The encoded payload should be a serialized object containing at least a schema version, the problem id, the code, and the custom tests text.

Codex should use a robust encoding method suitable for arbitrary text, including newlines and quotes. A URL-safe Base64 encoding of UTF-8 JSON is acceptable. If Codex judges that compression is beneficial, it may add it, but only if doing so does not introduce unnecessary fragility.

A version field should be included so the format can evolve later without ambiguity.

## K00. Load behavior for shared URLs

When the page loads and the hash contains a recognized shared-state payload, the application should parse it and attempt to apply it automatically.

If the payload is valid and the referenced problem exists, the application should select that problem, load the code into the editor, load the custom tests, and leave the page ready for the receiver.

If the payload is valid but the referenced problem does not exist, Codex should fall back gracefully. The best fallback is to open the scratchpad `New`, load the shared code there, load the shared custom tests, and present a visible notice that the original problem was unavailable and the code was opened in the scratchpad instead.

If the payload is invalid or corrupted, the application should ignore it safely and continue loading normally, optionally surfacing a clear but non-blocking warning.

## L00. Clipboard and user feedback

When the sender presses `Share`, the application should generate the share URL and attempt to copy it to the clipboard automatically.

The UI should provide immediate feedback. A simple success message such as "Share link copied" is sufficient. If clipboard write fails, the application should still present the generated URL in a recoverable way, such as a small dialog or prompt-like fallback, so the sender can copy it manually.

The share operation should not navigate away from the page and should not disturb the current editing state.

## M00. Persistence and interaction with existing local state

Shared-state loading should override the initial editor and custom-test content for that opened page state, because the person's intent when opening the link is to see the shared content.

Codex should decide how this interacts with existing local draft persistence, but the behavior should be unsurprising. The recommended behavior is that a valid shared link wins during initial load for the selected problem instance. After that, the normal persistence model continues from the loaded shared state.

If Codex sees a risk of silently overwriting a meaningful existing local draft, it may add a lightweight guard or import behavior, but the experience should remain simple and not obstruct the primary sharing use case.

## N00. UI placement and wording

The `Share` button should be placed in the top control row near `Settings`, on the right side where it is easy to find but does not dominate the main run flow.

The label should simply be `Share`.

The `New` scratchpad entry should be named `New` in the problem dropdown and should always appear first.

The scratchpad description should clearly signal that it is intended for arbitrary C99 experimentation.

## O00. Acceptance requirements

This change request is complete when the following are true.

The problem dropdown always contains `New` as the first entry.

Selecting `New` loads a scratchpad problem with starter code using `int problem(void)` and a hello-world-style implementation.

The scratchpad is runnable through the normal application flow.

A `Share` button exists near `Settings`.

Pressing `Share` creates a browser-only URL using the hash fragment and copies it to the clipboard.

The shared link includes at least the selected problem, current editor code, and current custom tests.

Opening the shared link restores the intended state and allows the receiver to run the code.

Normal problems reopen as the same normal problem with shared code loaded.

Scratchpad shares reopen in `New`.

If the referenced problem is unavailable, the application falls back gracefully, preferably by opening the shared code in `New`.

The implementation remains fully static and requires no server-side share storage.

## P00. Directions to Codex

Implement this feature using the current architecture and preserve simplicity.

Modify the existing problem-definition source so that `New` is built in and always sorted first.

Treat `New` as a first-class scratchpad problem with minimal harness friction.

Implement URL sharing through the hash fragment and a compact encoded payload.

Preserve the currently selected problem in shared links rather than forcing all shared content into the scratchpad.

Include only sender-controlled state that matters for reproduction, especially editor code and custom tests, and do not duplicate built-in problem tests into the URL.

Handle invalid or outdated shared links safely.

Choose practical details such as payload schema, encoding mechanics, clipboard fallback, and load precedence using your best judgment.
