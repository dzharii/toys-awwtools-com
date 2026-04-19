2026-04-19
A00. c99-reference-embed-api-use-cases.md

# C99 Reference Embed API Use Cases

## A00. Purpose

This document explains why the embed API exists, what kinds of problems it solves, and how it creates value when the C99 reference is used inside other applications. This is not the protocol specification itself. It is the companion document that explains the intended use of the protocol in realistic environments.

The purpose of this document is twofold. First, it helps a human reader understand the situations in which the embedded reference becomes useful instead of abstract. Second, it instructs Codex that the implementation should be shaped by these real usage patterns rather than by the protocol surface alone.

During implementation, Codex should use best judgment and best effort to refine the API where needed so that the real user experience described here becomes practical, smooth, and maintainable. If the implementation reveals that some message names, state shapes, or startup options should be improved, Codex may adjust them as long as the resulting API remains clear, documented, extensible, and faithful to the goals in the formal specification.

## B00. Why this API exists

The embedded API exists because the C99 reference is more useful when it is available exactly at the moment a person needs it, inside the same work surface where the coding problem is being solved.

Without this API, the reference remains a separate site. That means context switching. It means opening another tab, another window, another search flow, another scroll position, another visual environment. Even when the reference itself is good, the person using it still pays the cognitive cost of leaving the task, looking elsewhere, and then returning. The interruption is small but constant.

With the embed API, the reference becomes part of the working environment. It can open with the correct theme, fit into a smaller panel, focus on the relevant function, search quickly, and send useful information back to the host application. That changes the role of the reference. It stops being only a website and becomes a reusable tool surface.

The deeper value is not only convenience. It is continuity. The person stays inside the same environment, inside the same problem, inside the same coding session, and can consult the reference without breaking concentration.

## C00. Core value the API brings

The API makes the reference embeddable, configurable, and interoperable.

Embeddable means the reference can appear inside another product as a real feature rather than as a crude external link.

Configurable means the reference can adapt to a host environment, such as compact width, hidden standalone chrome, inherited theme, initial search query, or direct entry selection.

Interoperable means the reference can participate in a larger workflow. It can be opened from the host, controlled by the host, and return useful actions such as snippet insertion requests or height updates.

This gives the host application a richer set of design possibilities. The reference can become a side panel, a drawer, a floating help window, a mobile full-screen utility view, or a focused snippet browser.

## D00. Main use case: embedded reference inside the browser-based C99 coding environment

This is the primary use case and the reason the API matters most.

A person is solving a C99 programming problem inside the browser. The page already contains the problem statement, the editor, and the test area. The person is deep into the problem. They are not browsing casually. They are actively writing code and thinking in terms of loops, arrays, memory, strings, return values, and edge cases.

At some point, they need to recall something precise. It is not a large conceptual question. It is the shape of a function, the behavior of a standard library call, the right idiom for initialization, the difference between similar routines, or the exact signature of a function they have not used in a while. Maybe they need `memset`, `strncpy`, `qsort`, `bsearch`, `fgets`, `snprintf`, or a reminder of how a particular idiom is commonly written in careful C99 style.

Without embedded reference support, the person leaves the environment. They open another tab or search engine query. They scan unrelated results, ads, blog posts, or generic documentation pages. They lose the visual and mental continuity of the coding session. Then they return and resume.

With the embedded reference API, the host application has a visible `Reference` control. The person clicks it and a floating side window opens inside the same application. It feels connected to the editor rather than separate from it. The panel is sized for practical reading. It can be resized if the person wants more room. It can be closed when no longer needed. It uses the same broad visual language as the host, so it does not feel like a foreign page dropped into the interface.

The reference opens already prepared for embedded use. Its standalone header and extra chrome are reduced. The search box is ready. The typography and spacing fit the tighter panel. If the host knows what the person might need, it can pre-open the reference to a relevant entry or pre-fill a search query. The person types `memset` or `printf` and immediately sees the entry, examples, idioms, and usage notes.

This is where the value becomes concrete. The person remains inside the same coding environment. The editor is still there. The problem is still there. The tests are still there. The reference is not competing with the task. It is supporting the task.

When the person finds a useful snippet or idiom, the reference can request insertion back into the editor. The host remains in control of how insertion works, but the workflow feels continuous. The person does not need to manually retype everything unless they want to.

This scenario is the strongest expression of the API. The reference becomes a practical sidecar for real-time coding in C99.

## E00. Use case 2: mobile or narrow-width in-app reference mode

A second important scenario appears on mobile devices and narrow-width layouts, where permanent side-by-side panels are much harder to use.

A person is coding in the browser on a smaller screen. The application already has to manage limited width carefully. The editor, the problem statement, and the tests compete for space. In this environment, opening a separate external reference page is even more disruptive than on desktop, because app switching and tab management are more intrusive.

With the embed API, the reference can become a first-class narrow-screen mode of the same application. Instead of a desktop-style floating side window, the host may open the embedded reference as a full-height in-app view or overlay tuned for mobile reading. The same entry point still exists, such as a `Reference` button, but what opens is adapted to the screen. The person can search for `strlen`, `malloc`, or `fprintf`, read what they need, and close the reference to return to code immediately.

The importance of this scenario is that it protects the person's focus under constrained conditions. The reference is not merely embeddable in a technical sense. It becomes layout-aware and interaction-aware. The API lets the host request compact spacing, embedded mode, hidden standalone chrome, and initial focus behavior, all of which matter much more on small screens than on desktop.

This scenario also strengthens the product because it keeps the host app self-sufficient. The person does not feel that the application works well on desktop but falls apart on mobile the moment documentation is needed.

## F00. Use case 3: tutorial or lesson platform with live code and contextual reference

Another strong scenario is an educational platform that teaches C99 concepts through guided examples and exercises.

Imagine a lesson page teaching strings, memory copying, file input, or sorting. The page contains explanatory text, a small exercise, and an embedded code editor. The learner is reading and experimenting. They are not necessarily solving a competitive-style programming puzzle. They are trying to understand how C99 functions behave and how to use them correctly.

In that environment, the reference can be embedded as a contextual support pane. The lesson host can open the reference directly to the function currently being discussed, such as `memcpy`, `strtok`, or `fopen`. It can apply a lesson-specific theme and compact layout. It can also react when the learner clicks "show reference" beside a function name in the lesson text.

This scenario shows another kind of value. The API does not only help experts move faster. It helps learners stay oriented. The reference can be integrated into the teaching flow as supporting evidence rather than as a separate site that the learner has to navigate manually.

The educational benefit is that the learner sees the reference as a practical companion to code, not as an isolated documentation archive. They can compare the lesson explanation, the reference signature, and the actual code they are writing, all within one coordinated interface.

## G00. Use case 4: internal development tool or snippet workbench

A fourth scenario is an internal tool focused on snippets, idioms, and quick experimentation rather than full puzzle solving.

Imagine a small engineering utility used by a person who frequently writes embedded C-style code, browser-side demonstrations, or quick code fragments. They do not necessarily need a full problem statement or a formal harness. They need a scratch surface and a fast lookup source. The host application might be a small local workbench that contains an editor, a run button, and an embedded reference area.

In this situation, the reference API allows the reference to become a reusable side module. The host can open it in a drawer, search automatically based on a selected token, or request a snippet by identifier. The person might highlight `calloc` in the editor, press a help button, and the reference opens exactly on that function. Or they might browse idioms first and then insert one into the editor.

This scenario matters because it proves the API should not be overfitted only to the puzzle-solving product. The reference should remain reusable in other tools where the dominant workflow is experimentation, snippet assembly, and quick validation.

The same runtime messaging contract still works. Only the host environment changes.

## H00. Use case 5: documentation portal or function catalog embedded inside a broader engineering site

A fifth scenario is a larger engineering portal that aggregates language references, examples, style guides, and tooling in one place.

In that environment, the C99 reference may be just one embedded module among several. A documentation portal may want to embed the reference as a contained viewer inside a page that also includes project-specific guidelines, approved idioms, migration notes, or code review tips.

The host page may open the reference to a selected entry based on a sidebar click elsewhere in the portal. It may request a specific theme preset so the reference blends with the house style. It may resize the reference container dynamically based on content height. It may also use the outbound events to keep the outer site aware of which function is currently being viewed.

This use case shows why the API must be explicit, descriptive, and reusable. Once the reference stops being a standalone page and starts being a component inside other tools, the contract needs to be good enough that future hosts can integrate it without reverse-engineering its internals.

## I00. Why floating window and resizable panel behavior matter

In the main coding scenario, the person often wants the reference to be nearby but not dominant. That is why a floating window or side panel matters.

A reference panel that opens inside the same application but can be resized gives the person control over attention. If they only need a quick reminder, the panel can stay narrow. If they are reading a more detailed idiom or comparing examples, they can widen it temporarily. Then they can close it and return to full focus on the editor.

This is a different experience from navigating away to a separate page. The reference becomes an adjustable tool, not a destination. The embed API exists partly to make that mode feel polished. Embedded mode, compact spacing, host theming, height reporting, and search control all contribute to that one practical feeling: the reference belongs here.

## J00. Why host theming and embedded layout support matter

The visual adaptation features of the API are not superficial. They solve a real usability problem.

A standalone reference page is usually designed with its own spacing, typography, header structure, and navigation assumptions. Those are reasonable in standalone mode. But once the same page is embedded in a panel or mobile view, the old assumptions can become wasteful or awkward. Too much top chrome wastes vertical space. Too much margin wastes panel width. A mismatched color theme makes the embed feel like an accident.

By supporting embedded layout hints and host theme tokens, the reference can present itself as a cooperative surface instead of a rigid one. This is especially important when the host application is intended to feel cohesive and carefully designed.

The person using the product may never think in terms of "theme tokens" or "embed hints." What they feel is simpler. They feel that the reference looks like part of the application and behaves well in the space available.

## K00. Why snippet insertion is important

Reading documentation is useful, but the strongest integrations reduce the distance between reading and doing.

When the reference contains an idiom or snippet, the host application can benefit from being able to receive that snippet intentionally through the messaging API. The reference should not directly edit the parent document. Instead, it should request insertion and let the host decide how that insertion works. That keeps responsibilities clean.

From the person's point of view, this means the reference is not only a viewer. It can become a source of reusable code fragments. The person looks up a function, sees a safe idiom, and can insert it into the working editor. This shortens the path from lookup to action.

This capability is particularly valuable in the programming puzzle environment because the person often needs a starting pattern or reminder rather than an entire solution. Snippet insertion supports exactly that.

## L00. Why the API should remain adjustable during implementation

The formal protocol specification defines the target contract, but this use-case document exists partly to remind Codex that the protocol should serve the workflows, not the other way around.

If implementation reveals that some startup option is missing, some message should be renamed, some response should include one more field, or one of the initial concepts is too rigid, Codex should use best judgment to improve the API. The improvements should preserve clarity, extensibility, and documentation quality.

The implementation should remain disciplined, but it should not become trapped by wording that turns out to be awkward once real code is written and the workflows are tested.

This instruction is intentional. The final goal is not merely to have a protocol on paper. The goal is to have an embedded reference that actually feels useful in the scenarios described above.

## M00. Summary of intended outcomes

The embedded API should make the C99 reference useful inside a programming puzzle-solving browser application.

It should make the reference practical on mobile and narrow layouts.

It should make the reference reusable in tutorials, workbenches, and broader engineering portals.

It should reduce context switching, preserve concentration, and make lookup-to-action workflows smoother.

It should allow the host application to open the right content, style the reference appropriately, receive useful events, and integrate snippets cleanly.

If those things are true, then the API is doing real work. It is not just an integration layer. It is what turns the reference into a reusable tool surface.

## N00. Direction to Codex

Codex should treat these use cases as practical design constraints during implementation.

If a protocol detail in the earlier specification does not support these workflows as well as it should, Codex may refine the API during implementation. Any such refinement must remain explicit, documented, and consistent.

Codex should optimize for the main scenario first: the person coding in C99 in the browser, opening the embedded reference from inside the same app, quickly finding a function or idiom, and then returning to code with minimal interruption.

That scenario should remain the center of gravity for implementation decisions.
