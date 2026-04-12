A00

# Codex specification: widen the reading experience, embed attributed source code, and add reviewed spoiler solutions

This task is a focused product enhancement task on top of the preserved current version. The current version is good enough to keep and evolve. Do not discard it. Do not restart from scratch. Build on it carefully.

The purpose of this task is twofold. First, fix the readability and focus problem in the current catalog-detail layout, especially the fact that the problem description and inspection area are too narrow and therefore hard to read. Second, upgrade the product so that it includes embedded, attributed, spoiler-gated source code for the indexed solutions already referenced by the page.

This task changes the original content policy in one important way. Previously, the product avoided showing full solutions directly. That still remains true for the default visible state. However, the product must now support explicit spoiler sections that reveal full source code, with strong attribution, language labeling, and reviewed explanatory comments.

B00

## Product goal for this iteration

The new goal is to make the product significantly more useful at the moment when a user has already selected a problem and wants to inspect it more deeply.

The current product already helps the user choose a problem. It now must also help the user inspect a chosen problem comfortably and, when they decide to do so, reveal one or more attributed source implementations in a controlled, readable, and educational way.

The inspection experience should therefore support two modes. The first mode is decision mode, where the user compares problems without distraction. The second mode is deep inspection mode, where the user wants more room, more explanation, and optional spoiler access to concrete implementations.

C00

## The first major problem to solve: the detail area is too narrow

The current detail and inspection panel is too narrow for the amount of content it contains. This makes reading harder than it should be. It also weakens the value of the entire right-side context because the content is present but visually cramped.

Codex must redesign this part of the experience so that the user can focus on the selected problem more comfortably. This is not a cosmetic tweak. It is a workflow problem.

The redesign must support a clearer and more flexible reading mode. The user should be able to expand, widen, or otherwise emphasize the selected problem area when they want to inspect details, explanations, repository content, and source code. The interface should make that possible without forcing a full-page mode switch unless that is the best design outcome.

D00

## Required interaction for wider inspection

Codex must implement a clear way for the user to give more horizontal space to the selected problem area. This can be achieved in one of several acceptable ways, but it must be deliberate and ergonomic.

A strong solution may use a draggable splitter between the catalog and the inspection panel. If that is chosen, the splitter must be easy to discover, easy to use, and stable in behavior. It must support resizing the left and right panes with immediate visual feedback. The chosen width should persist if that improves usability.

Another acceptable solution is an explicit expand or focus control that widens the detail panel or places the selected problem into a larger inspection mode. If that is chosen, the transition must be clear and reversible.

Another acceptable solution is a hybrid approach, where the normal layout uses a stable split and the selected problem can be focused through a larger reading mode when needed.

The core requirement is not the specific mechanic. The core requirement is that the user must be able to get a meaningfully wider reading area for the selected problem and that the result must feel natural.

E00

## What the widened inspection mode must improve

Once the user enters a wider or focused inspection mode, the product must improve the reading experience in a tangible way.

Paragraphs must become easier to read. Repository support sections must stop feeling cramped. Source-code spoiler areas must have enough horizontal room to be useful. The user must not feel that they are trying to read a detailed explanation through a keyhole.

This wider mode should preserve orientation. The user should still understand what problem is selected, where it sits in the catalog or progression, and how to return to the normal browsing view.

F00

## The second major task: embed full source code inside the project

The page already references indexed solution locations. That is useful, but now it is no longer enough.

Codex must retrieve the referenced source files from the already cloned repositories and incorporate the full source code into the project so it can be viewed directly in the website. The user should not have to leave the site just to inspect the implementation. The source code should become part of the local reading experience.

This should be done using the references already present in the project. Codex does not need to re-discover every solution from scratch if the project already knows which files are relevant. It should use the existing file references and repository mappings as the primary retrieval mechanism.

G00

## Spoiler-gated source code rule

The source code must not be visible by default in the same way as the normal problem overview. It must live under an explicit spoiler-style reveal.

The spoiler section must be clearly labeled so that the user understands that opening it will reveal one or more implementations. The wording should be direct and unambiguous. The user must know that they are revealing solutions.

The spoiler sections should be easy to open and close. They should not feel hidden in a dishonest way, but they should protect the default browsing and problem-selection flow from accidental spoilers.

The site should therefore remain aligned with the original spirit of the product: the main surface stays focused on choosing and understanding the problem at a high level, while the full implementation is available only when intentionally requested.

H00

## Language coverage requirement

The embedded source code should include multiple languages where available from the indexed repositories. Codex should not limit itself to one language if the project already knows about several.

If a problem has indexed implementations in C, C++, Java, Python, TypeScript, Go, C Sharp, or other available languages, Codex should surface those options in a structured way. The user should be able to switch between them cleanly.

This multi-language presentation should not become chaotic. The product should clearly label each language, each source file, and each repository origin. If there are many implementations, the UI should remain readable and not collapse into a giant mess of tabs or nested panels.

I00

## Reviewed and annotated source requirement

The embedded source code must not be shown as raw copied text only. Codex must review the included source and add explanatory comments that help the reader understand what each important section is doing.

This does not mean rewriting every line into a tutorial. It means improving the code-reading experience. The goal is to help the user quickly understand what is going on in the implementation.

The comments should be added carefully and specifically. They should explain the purpose of a section, the role of a helper structure, the meaning of a loop or state update, or why a branch exists. They should not turn into verbose noise. They should not pretend to be the original author's comments if they were added by Codex. They are explanatory enhancements.

The resulting presentation should make the code cleaner and easier to read while still preserving attribution to the original source.

J00

## Attribution requirement

Attribution must be explicit, complete, and honest. Codex must not hide where the source came from.

For every embedded source implementation, the UI must clearly show the repository name, the original file path, and the original source location. If possible, the UI should also show the direct repository URL and the direct file URL for the original source.

Codex must determine the correct upstream repository URL for each local clone. It should do this by inspecting the local Git configuration of each cloned repository. It should not guess. It should read the repository remotes and map the local clone to the correct upstream origin.

If there are multiple remotes or some ambiguity, Codex should resolve it carefully and prefer the real upstream source that corresponds to the cloned repository.

Attribution should be visible both in the metadata for the solution and in the source-code reveal area. The user should always know whose code they are looking at and where it came from.

K00

## Source retrieval rule

Codex should not waste time re-reading every repository blindly. The project already contains file references for the relevant indexed solutions. Codex should use those references to retrieve the source files that need to be embedded.

This is important. The job is not to scan all code in all repositories. The job is to use the already indexed relevant solution references and turn them into embedded, attributed, spoiler-gated source views inside the site.

Codex may still inspect the repositories and use search where needed to resolve repository URLs, confirm paths, discover related language variants, or improve attribution. But the primary retrieval path should come from the project's existing indexed references.

L00

## Source presentation design

The source-code presentation must fit the overall UX of the site and must not feel like a random dump of text.

A selected problem should have a dedicated solutions area. Inside that area, the user should see clearly separated implementations by language and repository source. Each implementation should show a compact summary first. The summary can include language, repository, original path, and a short note about what is notable in that implementation.

Then the user can open the spoiler reveal and inspect the full source code with explanatory comments.

The source view should be readable. It should support horizontal space properly. It should preserve formatting. It should not wrap code in a destructive way. If line numbers or copy actions improve usability, they may be added. If syntax highlighting is added, it should remain calm and not visually overpower the rest of the product.

M00

## Enhanced reading experience for source code

Because source code is now part of the product, Codex must improve the reading environment around it.

The widened inspection area or focus mode must work well for source reading. The source block should have enough width and enough vertical organization. Long path lists, large repository cards, and solution metadata must not crowd the actual code display.

If useful, the product may separate explanation from code through a two-level reveal. For example, a user may first open an implementation summary, then expand the full source. But the interaction should not become annoying. The user should not have to open three nested accordions just to see one solution.

N00

## Revised detail panel responsibilities

The inspection panel now has more responsibilities than before. It must hold problem reasoning, placement, repository support, and optional spoiler implementations. That means Codex must rethink the structure of the panel so it remains readable.

The panel should be organized into clear reading sections. A strong order would be problem overview, why this problem matters, where it sits in the progression, local repository support, solution implementations, and topic-guide references. The exact order may vary if a better one emerges, but the structure must feel deliberate.

Since the panel is now doing serious work, the redesign for width and focus is no longer optional. The old narrow panel is insufficient for this richer inspection role.

O00

## Interaction design for solution implementations

The user must be able to identify at a glance what implementations are available for the selected problem.

A strong interface may show a compact list of available implementations grouped by repository or grouped by language. Another strong interface may show language tabs with repository cards inside each tab. Another may show repository cards with language variants nested inside. Any of these can work if the result is readable.

What matters is that the user can quickly answer these questions. Which implementations exist. Which language each one uses. Which repository it came from. Whether it includes explanation-style material. Whether the full source is available to reveal right now.

P00

## Commenting policy for reviewed code

When Codex adds explanatory comments, it must do so with good judgment.

The comments should help a reader orient themselves in the code quickly. They should explain major sections, significant state variables, or the purpose of an operation. They should not become redundant comments on every trivial line. They should not bury the original code in noisy prose.

If Codex is revising a solution for readability, it should keep the implementation faithful enough that attribution remains honest. The product should make it clear that the implementation is based on the attributed source and that additional explanatory comments or readability improvements were added for the reader experience.

If the code is meaningfully transformed for readability, that should be stated. The product should not imply that the fully annotated version is exactly identical to the raw original file if it is not.

Q00

## Use of repository and remote metadata

Codex must inspect the local Git metadata of the cloned repositories to determine the true source origins.

For each repository used in the site, Codex should resolve the upstream location through Git remotes. It should then use those remotes to build proper attribution links and, where practical, direct file links for the exact referenced source paths.

This repository-origin resolution must be treated as part of the data layer, not as a hardcoded guess. Codex should make the attribution robust and maintainable.

R00

## Data model changes required

The project dataset must now be expanded to support embedded solutions.

For each selected problem, the data model should support one or more solution entries. Each solution entry should include repository identity, repository URL, original file path, language, whether the source was embedded successfully, whether explanatory comments were added, and any direct URL that can be built for the original file.

The detail view should consume this structure directly rather than reconstructing it ad hoc in the UI layer.

S00

## Search and retrieval behavior for implementation data

Codex should use search extensively where it is actually needed. This includes resolving upstream repository origins, confirming correct repository identity, discovering language variants related to the indexed file set, and ensuring direct file links are correct.

However, Codex should still prefer the project's existing file references for the actual source retrieval work. The project already knows which implementations matter. Use that. Do not waste time rediscovering everything from zero.

T00

## UX requirement for spoiler visibility

The spoiler block itself must be visible and understandable even when collapsed.

The user should clearly see that solutions exist. They should see how many implementations are available and which languages or repositories they come from. The collapsed state should inform without revealing the code itself.

A strong collapsed label would make it obvious that opening it will reveal full source implementations. The user should not have to guess what is hidden there.

U00

## Relationship to the original anti-spoiler product philosophy

Codex must preserve the original spirit of the product while implementing this new requirement.

The default visible state of the page should still help with choosing and understanding problems without throwing solutions in the user's face. The embedded implementations are an optional deep-inspection mode, not the default reading mode.

That means the site should still feel like a field guide first and a solution browser second.

V00

## Required improvement to repository support presentation

The current repository support area is useful, but it is now only halfway to what it should become.

Since the product will now embed real source code, the repository support section should evolve from a list of references into a richer "solution workspace" section. The user should be able to move naturally from repository support metadata to actual implementations.

This should reduce the current gap between "here are paths" and "here is the source". The design should make that transition feel natural.

W00

## Acceptance criteria

This task is complete only if all of the following are true.

The selected problem area can be widened, focused, or resized in a way that materially improves readability. The interaction is clear and reversible. The selected problem content no longer feels cramped during deep inspection.

The project now embeds full source code for the indexed relevant implementations rather than only linking out or listing file paths. The embedded code is placed behind clearly labeled spoiler-style reveals.

The spoiler areas are visible and understandable in collapsed state. They do not reveal the source unintentionally, but they make clear that solutions are available.

The product includes multiple languages where available from the indexed repositories. The UI clearly labels language, repository, original path, and source origin.

The embedded implementations carry explicit attribution, including repository identity and proper repository-origin linkage resolved through local Git metadata.

The project uses the existing indexed file references to retrieve the relevant source files rather than re-reading everything blindly.

The embedded source is reviewed and enhanced with explanatory comments or readability improvements that help the user understand what the code is doing.

If Codex adds explanatory comments or readability edits, the product makes it clear that the source is attributed and that explanatory enhancements were added for reader benefit.

The detail and inspection experience remains coherent, readable, and aligned with the product's original purpose. The site still defaults to a non-spoiling selection and guidance experience.

The repository support area now leads naturally into actual embedded implementations rather than stopping at paths and metadata.

X00

## Direct task statement for Codex

Keep the current product and evolve it. Fix the narrow inspection problem by adding a wider or focused reading mode for the selected problem, preferably through a clear resizing or focus interaction. Then use the solution references already indexed in the project to retrieve and embed full source code from the cloned repositories. Present those implementations inside clearly labeled spoiler sections, include multiple languages where available, resolve the correct upstream repository origins through local Git metadata, and show full attribution. Review the embedded code and add explanatory comments or readability improvements so the code is easier to understand. Preserve the original non-spoiling product philosophy by keeping solutions hidden by default, but make them clearly available when the user intentionally opens the spoiler area.
