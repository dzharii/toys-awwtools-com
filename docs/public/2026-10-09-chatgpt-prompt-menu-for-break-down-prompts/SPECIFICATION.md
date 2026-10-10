# A00. Purpose and source problem

The Prompt Menu is a complete static prompt constructor for technical data structures in C, initially an integer min-heap. Its purpose is to separate technical depth from verbosity and instructional scaffolding, while preserving the supplied task, design decisions, and the user's ability to modify the resulting prompt.

The original response gave working heap code but over-explained already specified fields, narrated basic C, repeated concepts, introduced unsolicited exercises, and used artificial recaps. The user described this as removing the intellectual work instead of explaining the difficult reasoning. They specifically rejected manually inserting or extracting elements as knowledge checks. They wanted causal explanation of invariants, memory locality, allocation, ownership, performance, and implementation tradeoffs.

Their criticism also concerned diagrams. A simplified comparison/swap flow concealed iteration. Color meanings were undocumented or inconsistent; an unrelated highlight appeared to move between values in an insertion trace. The user found state-by-state array/index representations useful when accurate. Their request is therefore for purposeful, self-explanatory visualizations, rather than either banning all visuals or adding decorative ones.

They asked for a configurable visual menu using pictograms and hand-drawn-style illustrations, default values, interactive checklists, and an editable starting structure. The restaurant analogy describes the act of choosing: the generated technical prompt must contain technical settings, not food or cooking metaphors. The current delivery must be self-hostable static HTML/JavaScript/CSS, accompanied by a README, this specification, full examples, and the original complaint/task as a detailed reference.

The complete rephrased source record is `references/ORIGINAL_REQUEST.md`. It preserves the named fields/API, rejected exercises, one-screen recap criticism, array/storage reasoning, reported highlight issue, interactive-menu request, and current implementation scope.

## B00. Evidence, source reuse, and research

Seven supplied screenshots are the authoritative visual reference. They show a white centered column, line drawings in three rounded cards, segmented settings, native-style selection controls, explicit illustration guidance, bordered checklists, a gray prompt textarea, badges, and a black primary action. The ChatGPT shell surrounding the menu is not part of this product.

The visible conversation supplied Why-first and Code-first SVG drawing snippets. Those shapes are reused in `src/template.html`. It did not supply the complete previous HTML, CSS, or application logic. Those components are reconstructed; source-identical reproduction is not claimed. The reported `i === insStep` highlight bug is a prior assistant's account, not an independently verified source finding. This app does not implement that faulty algorithm animation.

Research on October 10, 2026 identified the optional `@openai/apps-sdk-ui` library in [OpenAI's UI guidelines](https://developers.openai.com/plugins/concepts/ui-guidelines). The documented visual principles inform native fonts, neutral surfaces, clear spacing, outlined icons, restrained accents, and accessible controls. This project uses plain CSS so the result is fully portable and needs no component package. [OpenAI's prompt engineering guidance](https://developers.openai.com/api/docs/guides/prompt-engineering) informs explicit instructions/context boundaries and a small, maintainable prompt builder. Full research routing and interpretation are in `references/RESEARCH.md`.

The app is an independent reconstruction. Neither its own design research framework nor its prompt settings are official OpenAI products, hidden instructions, or guaranteed model parameters.

## C00. Research and design decision framework

The design chain is observation, need, independently controllable dimension, interaction, generated instruction, and acceptance evidence. Each control must describe an actual answer behavior, not merely an attractive label. Improvements must keep the screenshot visual vocabulary and support the user's main task: obtaining a reusable, precise technical prompt.

| User observation or request | Derived need | Design decision | Acceptance evidence |
| --- | --- | --- | --- |
| Detail became length, repetition, and basic lessons | Control length without losing mechanisms | Separate verbosity, depth, assumed knowledge, and compression | Compact + rigorous retains complete code and correctness arguments |
| Capacity/count/items and API were already supplied | Build on established choices | Editable assignment and separate established-decisions field | Generated prompt preserves the supplied API and context |
| Unsolicited heap exercises and memorization | Independent learning without tests | Explicit, checked exclusion controls | Default prompt prohibits quizzes, exercises, recaps, and mnemonics |
| Array suitability explanation omitted practical reasons | Explain causes and tradeoffs | Focus options for locality, allocation, complexity, invariants, alternatives | Default prompt requests both structural and practical reasoning |
| Ambiguous coloring and hidden loop repetition | Diagram semantics must be explicit | Visualization contract changes with mode | Detailed diagrams request comparisons, swaps, repetition, indexes, and stop conditions |
| Useful state-by-state insertion/extraction views | Demonstrate mechanisms without asking questions | Trace-first preset, independent of diagram mode | Written traces remain valid with No diagrams selected |
| Visual menu with pictograms and defaults | Fast inspection and choice | Three illustrated explanation cards, segmented controls, checklists | Labels and native controls remain usable without interpreting pictures |
| Need to modify and reuse the result | Preserve user-authored text and configurations | Manual editing, explicit rebuild, JSON import/export, opt-in storage | Setting changes do not overwrite manual prompt text |
| Publish on user's own server | No runtime service dependency | Inline CSS/JS/SVG in `index.html` | No external script, font, API call, or required account |

The success hypothesis is that separate controls produce more intentional requests, especially high-depth/low-repetition prompts. This implementation does not claim a measured improvement in a model's response quality. That would require evaluating generated prompts and actual model answers with representative tasks.

## D00. State model and defaults

All configuration uses a schema-versioned plain object. A pure validator accepts known values, normalizes selected arrays into canonical order, ignores unknown object keys, supplies defaults for omitted optional fields, and rejects malformed values. A pure builder converts that object into an ordinary text prompt.

| Field | Allowed values or type | Default |
| --- | --- | --- |
| schemaVersion | Integer 1 | 1 |
| task | String, at most 20,000 UTF-16 code units | Integer min-heap with capacity/count/items and the five named API functions |
| established | String, at most 20,000 code units | Structure/API already chosen; focus on non-obvious mechanisms |
| structure | why, code, trace | why |
| verbosity | compact, focused, expanded | focused |
| depth | practical, deep, rigorous | deep |
| knowledge | learning, fluent, systems | fluent |
| compression | guided, dense, minimal | dense |
| visuals | none, purposeful, detailed | purposeful |
| deliverable | program, library, algorithms | program |
| focus | Array of recognized focus keys | memory, invariants, complexity, ownership, tradeoffs |
| exclusions | Array of recognized exclusion keys | quizzes, repetition, basics, recaps, decoration, narration |
| special | String, at most 20,000 code units | Empty |
| manualPrompt | Null or string, at most 100,000 code units | Null |

All seven categorical dimensions are independent. Changing verbosity never changes depth, audience, code completeness, or diagram mode. No numeric verbosity or hidden model control is invented. Compression describes scaffolding and density rather than an exact token budget.

Focus choices are memory layout/cache locality, algorithm invariants/correctness, complexity/amortized analysis, allocation/ownership, alternatives/tradeoffs, boundary cases/failure behavior, and meaningful implementation checks. Code checks evaluate an implementation; they are distinct from testing the user's knowledge.

Exclusions are opt-out instructions. Checked explicitly prohibits that content. Unchecking merely omits the prohibition. The learning-C audience setting allows explanation of relevant C concepts even when the basics exclusion remains selected, because that exclusion refers only to fundamentals the audience already knows.

## E00. Information architecture and visual contract

The page preserves the seven original sections: assignment; explanation structure; explanation tuning; illustrations/code; focus; exclusions; and special instructions. A preset selector precedes them. A complete prompt preview follows them. Research and origin notes are in an expandable footer panel.

The centered content area is 960 pixels inside a 1008-pixel container including side padding. The canvas is white, text nearly black, helper text muted gray, cards/surfaces pale gray, dividers thin gray, and primary copy action black. A restrained green is used in pictograms, selected-card checkmarks, focus outlines, and the manual-edit notice. Cards have 16-pixel rounding; segmented selections and actions are pill-shaped. System fonts avoid external requests.

The Why-first and Code-first card shapes reuse the visible SVG fragments. Trace-first uses three small state panels and arrows. These are navigation pictograms, not an operational heap trace. Selection is identified by native checked state, card border, and a checkmark, not color alone. The static heap illustration is valid: root 1; children 4 and 2; leaves 9, 7, 5, and 8. Green identifies the root/minimum there, not an animated active array index.

The menu retains three cards at mobile sizes with reduced drawings and text. Controls wrap within the viewport; action rows and storage controls wrap or stack. The primary flow has no horizontal scrolling requirement. Browser preview is needed to independently verify visual fidelity and layout at representative widths; see M00 for the creation-time limitation.

Native labels, radio groups, fieldsets, legends, textarea labels, visible keyboard focus, a skip link, text alternatives, status announcements, and reduced-motion handling support accessibility. Small helper text remains intentionally readable. The screen-reader label for the heap describes its actual values and hierarchy. Selection and interaction do not depend on the decorative SVGs.

## F00. Interaction and output behavior

Changes to settings immediately rebuild generated text, except while manual text exists. Prompt sections are ordered: TASK, ALREADY ESTABLISHED, AUDIENCE, EXPLANATION SETTINGS, RESPONSE STRUCTURE, CODE DELIVERABLE, VISUALIZATION CONTRACT, FOCUS, AVOID, QUALITY STANDARD, and SPECIAL INSTRUCTIONS. Empty established/context, focus, exclusion, and special sections are omitted. Required code remains complete under Compact.

Why-first starts with causes and invariants before complete code. Code-first leads with the implementation. Trace-first gives complete worked insertion/extraction demonstrations including each comparison, swap, iteration, and stop condition. It explicitly distinguishes demonstrations from exercises. With diagrams disabled, traces are written; the app explains that combination instead of silently changing it.

Purposeful diagrams allow at most two meaningful technical diagrams. Detailed mode requires labeled transitions and consistent tree/array states, with interactivity only when the answer environment supports it. No-diagrams mode requests code and prose. The display beneath visualization choices contains the exact applicable instruction, making the rule visible before copying.

Program deliverable requests all includes, a C11 program, example usage, a compile command, and expected output. Library requests complete `heap.h`, `heap.c`, and `main.c` with an opaque type. Algorithms requests required types/helpers/includes and ownership/error assumptions, without requiring `main` or accepting placeholder bodies.

Edit prompt initializes a manual copy of the generated output. Finish editing makes the manual textarea read-only. Settings may continue to change but cannot overwrite that text. A notice explains that the control settings and the manual prompt can diverge. Rebuild from settings explicitly discards manual text and generates from current controls. Copy and download always use the visible textarea value.

Presets change all relevant controls, preserve task/established/special text, and rebuild output, replacing manual edits. Technical insight restores default explanation settings. Implementation review selects code-first, rigorous depth, systems audience, minimal scaffolding, no diagrams, a library, and invariants/ownership/boundaries/validation focus. Algorithm walkthrough selects trace-first, expanded prose, deep reasoning, guided compression, detailed diagrams, and invariants/complexity/boundaries focus. Neither introduces quizzes.

Reset restores the full default object, including task and empty special text, and retains whether browser saving is enabled. Empty generated assignments disable copy/download and display a notice. An intentionally authored nonempty manual prompt can still be copied without a task field. Special instructions are included verbatim and produce a reminder to check conflicts; semantic contradiction detection is not claimed.

Copy tries the modern clipboard API, then a legacy copy fallback, then selects the prompt for manual copying. Download .txt produces the complete displayed prompt. Open ChatGPT opens its public homepage; the user pastes the copied prompt. A standalone page cannot use the previous chat's submission API, so the original embedded Use in this chat action is not simulated.

## G00. Persistence, imports, and privacy

Browser saving is off until the user checks Remember settings. On opt-in, all settings and manual text are stored under `technical-prompt-menu.v1` in localStorage. A later page load restores only validated data. Unchecking removes that key. Failures to load, write, or remove do not prevent using the constructor and are reported with recovery guidance.

Export settings downloads complete JSON. Import accepts a version 1 JSON object no larger than 1,000,000 bytes. Parsing and validation finish before current state is replaced. Invalid schema versions, unknown categorical values, malformed selections, oversized fields, and malformed JSON reject atomically. Unknown object keys are ignored. Imported data uses safe values/text nodes, not HTML. Imported settings do not themselves opt the browser into saving. If saving is already enabled, successful imports update that saved configuration.

No automatic network requests, analytics, tracking, APIs, service workers, or prompt-bearing URLs are used. Task text is never sent to a server by the app. Clicking external links navigates to those services; it does not transfer the prompt. Private prompts may exist in browser storage or downloaded files under user control. Reference screenshots may contain conversation chrome and are included for the user's own design archive, not required to run the app.

## H00. Implementation and packaging

`src/prompt-core.js` contains the option vocabulary, instruction strings, defaults, presets, schema validation, prompt construction, and explanatory combination warnings. It exports CommonJS in Node and `window.PromptMenu` in a browser. `src/app.js` constructs dynamic controls and manages state, DOM events, persistence, manual editing, clipboard, and downloads. User-controlled strings are assigned through textContent or textarea values.

`src/template.html` supplies semantic page structure and SVG illustrations. `src/app.css` contains local design tokens and responsive rules. `build.mjs` inlines both JavaScript files and CSS into a ready-to-serve root `index.html`, then writes all three full examples and importable settings. The build uses only Node built-in APIs and has no installation step. Node 18 or newer is required for build/tests, not to run the published page.

Publishing the entire directory makes app, documents, and examples available together. Publishing only `index.html` runs every app function but omits ancillary documentation link targets. A normal static HTTP server and subdirectory hosting are supported because the application has no router or absolute asset paths. Strict CSP deployments must authorize inline blocks or serve editable sources as external scripts/styles. The README supplies actual run, rebuild, and test commands.

The zip deliverable includes generated HTML, all editable sources, builder, tests, README, this specification, detailed source/research references, three prompt/configuration pairs, screenshot copies, and verification results. No credentials, private runtime helper files, or deployment service configuration are part of it.

## I00. Acceptance criteria and validation approach

| Requirement | Check |
| --- | --- |
| Portable, complete static delivery | Generated HTML embeds exact local scripts/CSS, valid script syntax, no external runtime assets or request functions |
| Respect the initial heap design | Default prompt retains the exact fields and all five named functions |
| Independent explanation controls | All 2,187 combinations of seven categorical dimensions construct valid prompts without changing code completeness |
| No unwanted knowledge tests | Default exclusion wording is present; clearing exclusions adds no automatic requests for quizzes |
| Source-controlled examples | Three configuration JSON files match presets and all three text outputs match the pure builder |
| User text is preserved | Markup, Unicode, dollar characters, backticks, and newlines survive as text |
| Imports reject malformed state | Schema/option/array/field limits tested; prototype-shaped/unknown keys cannot inject behavior |
| Manual edits are safe | Event-flow checks retain edits across control changes and apply explicit rebuild correctly |
| Saving is opt-in and recoverable | Event-flow checks cover no saving before opt-in, restore, removal, and blocked storage |
| Clipboard failure is recoverable | Event-flow checks cover successful clipboard writes and manual selection fallback |
| Empty assignment is actionable | Copy/download disabled until valid task or intentional manual output; reset restores defaults |
| Visual and accessible fidelity | Source includes responsive rules, native controls, names, focus, and alternatives; actual browser rendering remains a required independent review |

Automated event-flow checks use a minimal DOM adapter, not a browser engine. They verify application event/state transitions, not CSS rendering, native browser keyboard behavior, actual download dialogs, or real clipboard permissions. Results and limits are recorded in `VALIDATION.md`. The app does not evaluate generated C code because it constructs prompts rather than executing the model's answer.

## J00. Complete example: Technical insight

This is the complete importable configuration and the complete generated prompt. No fields or prompt sections are elided.

```json
{
  "schemaVersion": 1,
  "task": "Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.",
  "established": "The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.",
  "structure": "why",
  "verbosity": "focused",
  "depth": "deep",
  "knowledge": "fluent",
  "compression": "dense",
  "visuals": "purposeful",
  "deliverable": "program",
  "focus": [
    "memory",
    "invariants",
    "complexity",
    "ownership",
    "tradeoffs"
  ],
  "exclusions": [
    "quizzes",
    "repetition",
    "basics",
    "recaps",
    "decoration",
    "narration"
  ],
  "special": "",
  "manualPrompt": null
}
```

```text
TASK
Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.

ALREADY ESTABLISHED
The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.

AUDIENCE
Assume fluent knowledge of C pointers, structs, arrays, size_t, malloc, realloc, and free. Do not re-teach these fundamentals.

EXPLANATION SETTINGS
Use focused, information-dense prose. Spend words on difficult reasoning, not obvious steps.
Explore invariants, memory representation, performance, amortized analysis, correctness, and failure behavior.
Use high intellectual compression: connect related technical ideas in fewer sentences while making causal links explicit. Preserve difficult reasoning.

RESPONSE STRUCTURE
Start with the invariants and the reasons behind the representation and algorithms. Then present the complete code and examine non-obvious decisions.

CODE DELIVERABLE
Provide a complete, compilable C11 single-file program with all required includes, a usage example, a compile command, and expected output. Do not omit unchanged or necessary code.

VISUALIZATION CONTRACT
Use at most two purposeful technical diagrams when they improve understanding. Label indexes and transitions, explain every visual encoding, and keep tree and array states consistent.

FOCUS
Distinguish why a complete tree permits implicit indexing from why contiguous storage is often preferable: spatial locality, pointer overhead, allocation count, and ownership. Avoid claiming that pointer access is universally slower. Explain fixed automatic storage versus dynamic growth when relevant.

Explain structural and ordering invariants, why sift-up repairs the ancestor path, and why sift-down must select the smaller child. Include loop progress and stopping conditions.

Distinguish worst-case insertion with resizing from amortized insertion, extraction, peek, tree height, and the costs of geometric capacity growth.

Explain malloc/realloc/free failure paths, overflow checks, ownership boundaries, and pointer validity when storage moves.

Compare relevant alternatives with concrete reasons for choosing this design. Respect choices already specified; do not redesign the task without explaining a material correctness issue.

AVOID
Do not include quizzes, exercises, knowledge checks, or questions for me to solve.
Do not restate explanations or repeat information already established here.
Do not explain C syntax or fundamentals the audience setting says I already know.
Do not add artificial summaries, cheat sheets, memory tricks, or one-screen recaps.
Do not add decorative or ambiguous diagrams; every visual must carry specific technical information.
Explain meaningful code blocks and non-obvious decisions rather than narrating each statement.

QUALITY STANDARD
Respect the design decisions I have already specified. Optimize for technical insight per sentence rather than oversimplification. Make explanations causal, not merely descriptive. Show why the implementation works, not only what each operation does. Separate theoretical guarantees from practical performance.
```

## K00. Complete example: Implementation review

This is the complete importable configuration and the complete generated prompt. No fields or prompt sections are elided.

```json
{
  "schemaVersion": 1,
  "task": "Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.",
  "established": "The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.",
  "structure": "code",
  "verbosity": "focused",
  "depth": "rigorous",
  "knowledge": "systems",
  "compression": "minimal",
  "visuals": "none",
  "deliverable": "library",
  "focus": [
    "invariants",
    "ownership",
    "boundaries",
    "validation"
  ],
  "exclusions": [
    "quizzes",
    "repetition",
    "basics",
    "recaps",
    "decoration",
    "narration"
  ],
  "special": "",
  "manualPrompt": null
}
```

```text
TASK
Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.

ALREADY ESTABLISHED
The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.

AUDIENCE
Assume systems-level C knowledge, including allocation, object lifetimes, integer arithmetic, undefined behavior, and cache locality. Focus on data-structure-specific reasoning.

EXPLANATION SETTINGS
Use focused, information-dense prose. Spend words on difficult reasoning, not obvious steps.
Give precise invariants, preconditions, postconditions, and correctness arguments. Distinguish worst-case, amortized, and practical performance claims; examine boundary cases and integer overflow.
Assume technical competence. Omit tutorial scaffolding, motivational framing, and rehearsals of established concepts. Explain complexity clearly rather than removing it.

RESPONSE STRUCTURE
Present the complete implementation first, then analyze the invariants, mechanisms, failure behavior, and tradeoffs.

CODE DELIVERABLE
Provide complete heap.h, heap.c, and an example main.c, using an opaque IntHeap type, plus a compile command and expected output. Do not omit any required definitions.

VISUALIZATION CONTRACT
Do not include diagrams or visualizations. Use code and prose for the explanation.

FOCUS
Explain structural and ordering invariants, why sift-up repairs the ancestor path, and why sift-down must select the smaller child. Include loop progress and stopping conditions.

Explain malloc/realloc/free failure paths, overflow checks, ownership boundaries, and pointer validity when storage moves.

Cover empty and singleton heaps, duplicate and negative values, allocation failure, and index and allocation arithmetic boundaries.

Demonstrate focused validation of heap ordering, extraction order, and relevant edge cases. These checks validate code and are not knowledge tests for me.

AVOID
Do not include quizzes, exercises, knowledge checks, or questions for me to solve.
Do not restate explanations or repeat information already established here.
Do not explain C syntax or fundamentals the audience setting says I already know.
Do not add artificial summaries, cheat sheets, memory tricks, or one-screen recaps.
Do not add decorative or ambiguous diagrams; every visual must carry specific technical information.
Explain meaningful code blocks and non-obvious decisions rather than narrating each statement.

QUALITY STANDARD
Respect the design decisions I have already specified. Optimize for technical insight per sentence rather than oversimplification. Make explanations causal, not merely descriptive. Show why the implementation works, not only what each operation does. Separate theoretical guarantees from practical performance.
```

## L00. Complete example: Algorithm walkthrough

This is the complete importable configuration and the complete generated prompt. No fields or prompt sections are elided.

```json
{
  "schemaVersion": 1,
  "task": "Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.",
  "established": "The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.",
  "structure": "trace",
  "verbosity": "expanded",
  "depth": "deep",
  "knowledge": "fluent",
  "compression": "guided",
  "visuals": "detailed",
  "deliverable": "program",
  "focus": [
    "invariants",
    "complexity",
    "boundaries"
  ],
  "exclusions": [
    "quizzes",
    "repetition",
    "basics",
    "recaps",
    "decoration",
    "narration"
  ],
  "special": "",
  "manualPrompt": null
}
```

```text
TASK
Explain and implement an integer min-heap in C. Use an IntHeap structure containing capacity, count, and int *items, with heap_create, heap_free, heap_insert, heap_peek, and heap_extract_min. Support dynamic capacity growth.

ALREADY ESTABLISHED
The structure fields and object-oriented-style function API above are already chosen. Respect these decisions and focus explanation effort on the non-obvious mechanisms.

AUDIENCE
Assume fluent knowledge of C pointers, structs, arrays, size_t, malloc, realloc, and free. Do not re-teach these fundamentals.

EXPLANATION SETTINGS
Develop difficult reasoning in detail, including relevant alternatives and worked examples. Additional length must add information rather than repetition.
Explore invariants, memory representation, performance, amortized analysis, correctness, and failure behavior.
Introduce difficult ideas in small connected steps. Supply necessary context without repeating established facts.

RESPONSE STRUCTURE
Start with one fully worked insertion and extraction, showing every comparison, swap, loop iteration, and stopping condition. Then give the implementation and connect its control flow to the trace. These are demonstrations, not questions for me to solve.

CODE DELIVERABLE
Provide a complete, compilable C11 single-file program with all required includes, a usage example, a compile command, and expected output. Do not omit unchanged or necessary code.

VISUALIZATION CONTRACT
Show algorithm state transitions with explicit comparisons, swaps, repeated loop steps, and stopping conditions. Label indexes; explain all colors and symbols; keep tree and array states synchronized. Use interactivity only if the response environment supports it; otherwise provide complete labeled static states.

FOCUS
Explain structural and ordering invariants, why sift-up repairs the ancestor path, and why sift-down must select the smaller child. Include loop progress and stopping conditions.

Distinguish worst-case insertion with resizing from amortized insertion, extraction, peek, tree height, and the costs of geometric capacity growth.

Cover empty and singleton heaps, duplicate and negative values, allocation failure, and index and allocation arithmetic boundaries.

AVOID
Do not include quizzes, exercises, knowledge checks, or questions for me to solve.
Do not restate explanations or repeat information already established here.
Do not explain C syntax or fundamentals the audience setting says I already know.
Do not add artificial summaries, cheat sheets, memory tricks, or one-screen recaps.
Do not add decorative or ambiguous diagrams; every visual must carry specific technical information.
Explain meaningful code blocks and non-obvious decisions rather than narrating each statement.

QUALITY STANDARD
Respect the design decisions I have already specified. Optimize for technical insight per sentence rather than oversimplification. Make explanations causal, not merely descriptive. Show why the implementation works, not only what each operation does. Separate theoretical guarantees from practical performance.
```

## M00. Verification limits and non-goals

The available environment did not expose the browser-control skill required for browser preview under its site-development rules. No browser was installed or alternative browser route improvised. Automated generation, static packaging, and simulated event-flow checks were performed; rendered layout, exact screenshot matching, native input navigation, clipboard permission prompts, and actual file downloads were not independently browser-verified. Test results cannot substitute for those checks.

This app does not recover hidden instructions, tune actual API model parameters, call a model, host user accounts, submit to an existing chat, claim that pointers are always slower, erase intellectually difficult reasoning, or measure pedagogical effectiveness. User-supplied text can contradict other settings; it is preserved rather than automatically rewritten. No remote deployment is performed because the user requested files they can publish on their own server.

## N00. Specification revision rule

Each specification section has an immutable letter and a revision number beginning at 00. A future edit increments only the changed section, such as D00 to D01. Unaffected sections retain their revision. New sections get unused letters at revision 00. The code and ordinary README do not use this section-revision convention.
