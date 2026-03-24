A00 Scope and intent

This document is a separate UX specification for the interactive controls of the sticky-note reference page. It does not replace the visual-board specification. It extends the product with filtering, favorites, expansion, and full-text search behavior while preserving the same core constraints: self-contained HTML, CSS-heavy presentation, minimal JavaScript, no build step, and content authored directly in HTML.

The interaction model must respect the original product philosophy. This is still an authored HTML page, not a data application backed by a service. The user who maintains the content will continue editing HTML directly. The interactive layer exists to help readers navigate and personalize the page, not to change the authoring model.

The implementation therefore needs a semantic DOM structure that is intentionally queryable. Notes, categories, tags, bookmarks, and expandable content should be represented in a way that JavaScript can reliably inspect and update without requiring a framework or generated markup.

A01 Design goals

The interactive controls should make the board easier to navigate without breaking the tactile, curated feeling of the page. The controls must feel integrated into the product rather than pasted on top of it as generic application UI.

The main goals are these. Users must be able to narrow the board by category. Users must be able to perform full-text search across both visible and initially collapsed content. Users must be able to bookmark a limited number of notes and later view those notes as a pseudo-category. Users must be able to expand hidden details either per note or globally. Users must be able to leave and return to the page without losing personal state such as filters, search context, bookmarks, and expansion preferences where appropriate.

The controls must work well on both mobile and desktop. They must remain visually calm, compact, and aligned, while still being explicit enough that the user always understands what is currently being filtered or emphasized.

A02 Interaction principles

The board should remain the primary object on the page. Controls are supporting UI and should not visually overpower the content. They must be discoverable and usable, but secondary.

The interaction model should prefer progressive narrowing over mode switching. A user should feel that they are focusing the board, not leaving the board and entering a separate results interface.

The system should be state-transparent. At any moment, the page should clearly show what is active: which categories are selected, whether favorites-only is active, whether a search query is applied, whether non-matching notes are merely de-emphasized or fully hidden, and whether details are expanded.

The system should also be reversible. Every interactive state must have a clear return path to the default board view. Resetting should be simple and predictable.

A03 Information architecture of the controls

The controls should be placed above the board content, but below the page title and any introductory context. This keeps them close enough to affect the board immediately while allowing the board itself to remain the main visual surface.

The control area should be treated as one coherent toolbar region rather than a scattered group of widgets. Within that region, the controls should be organized into three functional clusters.

The first cluster is navigation and filtering. This contains category filters and any future tag filters.

The second cluster is search and visibility behavior. This contains the full-text search field, search-result summary area, and the option controlling whether non-matches are dimmed or hidden.

The third cluster is personalization and expansion. This contains favorites access, expand-all and collapse-all actions, and reset controls.

On small screens, these clusters should stack vertically with strong alignment and adequate spacing. On larger screens, they may align horizontally in rows, but they should still wrap gracefully rather than forcing cramped widths.

A04 Authoring model and semantic DOM requirements

Because the content is authored directly in HTML, the DOM must act as the source of truth. The interactive layer should not depend on fetching or transforming external JSON. Instead, each note must expose enough semantic information in attributes and internal structure for scripts to query and manipulate it safely.

Each note must have a stable unique identifier. You said you will provide a GUID, and this should be a hard requirement. That identifier should be present directly on the note element and treated as the canonical key for local personalization state such as bookmarking.

Each note must also expose its category and any tags as machine-readable values. These values should be explicit rather than inferred from visible text. This is important because visible labels may change for presentation reasons, while filter logic should remain stable.

Each note must preserve a clean distinction between always-visible content and expandable content. Search should be able to inspect both. Visual rendering may initially collapse some content, but the DOM should still contain that content so the search index can include it.

This design should be described as DOM-first rather than data-driven. The HTML is authored by hand, the browser reads the semantic attributes and structure, and the interaction layer enhances the page based on what is already present.

A05 Category filter model

Category filtering is the primary narrowing mechanism. It should allow the user to show only selected categories while hiding the rest of the board content. The category filter must support a scalable design so that additional filter dimensions can be added later without changing the mental model.

A category is both a visible concept and a machine-readable filter value. The visible label may include an emoji plus text, for example an ambulance or newspaper icon followed by a category name. The machine-readable value should remain stable and normalized. The emoji is presentation, not identity.

The category control should behave as a multi-select system rather than a single-select dropdown. This is the best UX fit because the board is exploratory and categories may meaningfully overlap in a user's interest. The user may want to view both emergency and transit, or both restaurants and bars, without repeated switching.

The selected categories must be visibly represented in the control area after selection. The user should never have to infer what is active by remembering previous actions. The active state must be explicit and removable.

A06 Form of the category control

A custom control is justified here because the product's visual language is distinct and because the filter system needs to scale. However, the custom control should still adopt proven interaction behavior from standard multi-select patterns rather than inventing novel mechanics.

The recommended form is a compact expandable chooser that opens a list of category options. Each option includes the category emoji, the label, and a selection state. When closed, the control should summarize the current selection in a compact readable form. When no category is selected, it should clearly indicate that all categories are being shown.

The expanded chooser should align to the available space and remain usable on mobile. On desktop it may open below the trigger as a contained panel. On mobile it may expand inline or as a sheet-like block within the toolbar. It should not depend on hover. It should not overflow off-screen. It should allow tapping options without precision issues.

The control should support future extension to other dimensions such as tags without redefining the overall pattern. In other words, the UX should establish a reusable filter-panel model.

A07 Filter state and active-state presentation

When filters are active, the page should show them explicitly as active tokens or pills in a dedicated active-filters row near the controls. Each active token should display its category icon and label and provide a direct remove action.

There should also be a single clear-all action for filters. This action should reset the filter state to the default of showing all categories.

The board should visually respond immediately when filters change. There should be no submit button. This is an exploratory interface, so direct response is the correct behavior.

If a category filter results in no visible notes, the interface should show a calm empty-state message inside the board region. That message should explain that no notes match the current filter combination and provide an obvious way to clear filters.

A08 Favorites as a pseudo-category

Favorites should behave like a user-defined pseudo-category layered on top of the authored content model. A note does not become part of a permanent authored category when favorited. Instead, the system remembers a personal association between the user's browser and that note's GUID.

Favorites should be accessible as a first-class filter option, but clearly distinguished from authored categories. This can appear as a dedicated Favorites control or as a special pseudo-category alongside the category filter options. The distinction matters because the authored categories are stable content taxonomy, while Favorites is a personal overlay.

The favorites view should allow the user to show only bookmarked items. It should also integrate with the active-state system so the user can see when favorites-only mode is active and clear it easily.

The favorites model must rely on note GUIDs stored in local storage. This ensures that content can remain hand-authored while personalization persists between visits.

A09 Bookmarking interaction

Each note should contain a bookmark or favorite affordance positioned consistently in the note chrome. It should be visible but not so dominant that it competes with the note title. A corner position or top-edge action zone is appropriate, provided it remains touch-friendly.

Toggling the bookmark should be immediate. When the user bookmarks a note, the state should update visually and persist to local storage. The note should clearly show whether it is currently favorited.

Bookmarking should not remove the note from its authored category. It only adds that note to the personal favorites set.

If the favorites limit has not been reached, bookmarking should succeed without interruption. If the limit has been reached, the system should block the new favorite and present a small, direct message explaining that the maximum of ten favorites has been reached and that one or more existing favorites must be removed first.

A10 Favorites limit behavior

The favorites system should allow at most ten notes. This is a product rule, and the UX should treat it as a guardrail rather than an error-prone edge case.

When the user has fewer than ten favorites, the interface may optionally display a subtle count such as "3 of 10 favorites used" in the personalization area, but it should not add noise if the count is not useful.

When the user attempts to add an eleventh favorite, the interaction should not silently fail. It should present a concise explanatory message near the trigger or in a non-intrusive status region. The wording should be direct: the favorites list is full, and an existing favorite must be removed before a new one can be added.

The message should not force a modal interruption. This is too minor for a blocking dialog. A local inline or toast-like status message is sufficient if it is accessible and noticeable.

A11 Expandable details model

Some notes will contain a details-summary structure. This should be treated as content that is present in the DOM but initially collapsed in the visual interface. The collapsed state helps preserve board scanability, while the expanded state allows deeper reading.

Each note with additional content should expose an explicit expand control. The control should make clear whether activating it reveals more text in the current note. It should also reflect its current state, so the user can tell whether the note is expanded or collapsed.

The expanded content must be included in the page's custom full-text search even when collapsed. This is a core requirement because the browser's default in-page search will not reliably match or navigate hidden details content in the intended way.

A12 Global expansion controls

In addition to note-level expansion, the board should provide a global expand-all and collapse-all control. This is primarily a utility feature for users who want to search visually, inspect all long-form content, or use the browser's native find after expanding everything.

These global controls should live in the interaction toolbar, not inside individual categories. Their scope should apply to the current board state. That means they affect the notes currently present under the active filter context.

Expand-all should reveal all expandable note details currently in scope. Collapse-all should return them to their authored default collapsed state unless a note is explicitly designed to remain open.

If the board has no expandable notes in the current scope, the controls may be disabled or hidden to reduce clutter.

A13 Full-text search model

The page should provide a custom full-text search that searches across all relevant textual content of each note, including title, visible body text, link text where appropriate, tags if represented as text metadata, and content inside collapsed details-summary areas.

This search should be incremental and immediate. As the user types, the interface should update the board and the search-results summary without requiring a submit action. However, the implementation should be lightweight and appropriate for a static page. It does not need advanced ranking or fuzzy search in the first version unless content size grows substantially.

The search should operate on note-level matches. A result is not an arbitrary text fragment floating outside the board. A result is a note that contains the query.

The search state should be visually distinct from the default browsing state. The page should make clear that the user is currently in search mode.

A14 Search results presentation

Search should reserve a dedicated results-summary area above the board. This area should function as a temporary table of contents for the current query. It should list matching notes as links that jump or scroll to those notes in the board.

This results area is important because it gives the user an immediate overview of what was found without forcing them to scan the entire board. It also makes the search feel purposeful rather than merely decorative.

Each result entry should identify the matching note clearly, ideally through the note title plus enough category context to disambiguate similar titles. The results do not need to show full excerpts in the first version, but they should be scannable.

The results area should appear only when a search query is active and there is either at least one result or an explicit no-results state to show. When search is cleared, this region should collapse or disappear so the page returns to its normal structure.

A15 Search-mode behavior on the board

When a search query is active, the board should not immediately hide non-matching notes by default. Instead, the default search-mode behavior should preserve the full board while visually de-emphasizing non-matching notes.

This is the right UX choice for this product because it maintains spatial continuity. The user can still see the board as a whole, understand where matching notes sit in context, and navigate to them visually. The matching notes remain fully saturated and readable. Non-matches become dimmed, grayed, or partially transparent, but should not become so faint that the page looks broken.

This dimming behavior should be clearly described as emphasis mode rather than as filtering. Search is primarily a highlighting and orientation tool first.

A16 Optional strict-match visibility mode

In addition to the default emphasis mode, the search interface should offer an explicit option to hide non-matching notes. This is a stronger view that turns search into a strict visibility filter.

The wording of this option matters. It should not sound vague or decorative. A precise label would be along the lines of "Hide non-matching notes". That describes exactly what will happen.

This option should apply only while a search query is active. It is a search-mode refinement, not a persistent board setting independent of search.

When the option is enabled, non-matching notes should be removed from the visible board layout rather than merely dimmed. The search-results summary should remain visible above the board.

When the search query is cleared, this strict-match mode must also reset automatically. The board should return to its normal browsing state. The user should never end up with a mysteriously filtered board after search has been dismissed.

A17 Search reset behavior

Resetting search must return the interface to the default board view in a complete and predictable way. This includes clearing the query text, hiding or collapsing the search-results summary area, removing board-level match styling, restoring non-matching notes to their normal appearance, and disabling any search-only visibility mode such as "Hide non-matching notes".

This reset behavior should happen both when the user activates a dedicated clear action and when they manually erase the entire query text, if the product chooses to treat an empty field as no active search.

The empty-query state should be defined unambiguously as no search. In that state, the board is no longer in search mode.

A18 Relationship between search and category filters

Category filtering and search should be composable. The user may first narrow the board by category and then search within the remaining notes, or search first and then apply a category filter.

The recommended rule is that category filters define the current scope, and search operates within that scope. This is the clearest mental model. It means the board first determines which notes are included, then search determines which of those notes match.

The search-results summary should reflect this scope. It should not list notes that are currently excluded by active category filters.

If favorites-only mode is active, the same rule applies. Search operates within the favorites scope unless the user clears that mode.

A19 Persistence and local storage

Interactive state should persist locally where it reflects personal preference or convenience rather than temporary moment-to-moment exploration. This includes at minimum bookmarked notes and active filter selections. You specifically want stored settings for filters and bookmarks, and that is a sensible baseline.

Search persistence should be treated more cautiously. A persisted stale query can confuse the user when reopening a page, especially if the board loads already dimmed or partially hidden. The best-practice recommendation is to persist bookmarks and filter preferences, but not necessarily a live text query, unless there is a strong product reason. If search state is persisted, the page must make that state extremely obvious on load. If simplicity is preferred, do not persist the query itself.

Expansion state can also be treated cautiously. Persisting global expansion across visits is usually not necessary and may create surprising page loads. The safer default is not to persist expansion state unless the product later proves a real need.

Whatever subset is persisted, the persistence policy should be explicit and documented so the future implementation remains predictable.

A20 Local storage data model

The data model should remain simple and keyed by stable note GUIDs and normalized filter values. Bookmarks should be stored as an ordered or unordered set of note identifiers. Category filters should be stored as a set of selected category keys. Any future tags filter can follow the same pattern.

The page should handle missing or stale local state gracefully. If a stored favorite refers to a note that no longer exists in the HTML, the system should ignore it and optionally clean it up when saving next state. If a stored category key no longer exists, it should not break the filter UI.

The storage layer is a convenience, not a source of truth. The HTML remains authoritative for content existence and note metadata.

A21 Control behavior on mobile

On mobile, the controls must prioritize stacking, clarity, and tap ergonomics. The search field should remain easy to reach and wide enough to use comfortably. Filter triggers should not compress into tiny controls. Active filter tokens should wrap cleanly rather than overflow horizontally without indication.

Expandable chooser panels should open in a way that respects narrow screens. Inline expansion or full-width contained panels are preferable to floating popovers that can clip or misalign.

The results-summary area should remain compact on mobile. It should present a short scannable list of matches and allow direct jumps to notes. It must not become a second full page of clutter before the user reaches the board.

Bookmark actions on notes must maintain sufficiently large hit targets, even if the visual icon remains small.

A22 Control behavior on desktop

On desktop, the control region can take advantage of wider space to show more state at once. The search field, category chooser, active-filter row, favorites access, and expansion controls can sit within a composed toolbar without feeling cramped.

Desktop hover may be used for small affordance enhancements, but core interaction must remain click-based. Popovers and expandable panels are acceptable if they stay aligned and do not obscure essential board content.

The results-summary area may display more entries or slightly richer context on desktop, but it should still remain subordinate to the board. The board itself is still the main interface.

A23 Visual integration with the board aesthetic

The controls should feel related to the sticky-note world, but they should not imitate sticky notes so literally that the interface becomes noisy or confusing. The controls are operational UI, not content objects.

A good visual approach is to style the control area as a calm utility layer that borrows the board's material vocabulary subtly. It may use muted paper-like surfaces, soft borders, and restrained depth. It should not compete with the stronger note colors and irregular note shapes.

Active states should be clear and legible. If category tokens use emoji and color accents, they should still preserve enough contrast and consistency to scan quickly.

Search results links should visually connect to note targets, but remain cleaner and more compact than the notes themselves.

A24 Accessibility and keyboard interaction

The interactive controls must be fully keyboard accessible. The search field, category chooser, active-filter remove actions, bookmark toggles, expand controls, and reset actions must all be reachable and operable without a mouse.

The state of custom controls must be programmatically clear. Expanded and collapsed states, selected and unselected states, and bookmarked and unbookmarked states should all be reflected in accessible semantics.

Search results links must move focus or scroll in a predictable way when activated. Jumping to a matching note should not leave keyboard users disoriented.

Messages such as the favorites limit warning should be announced accessibly and not rely only on color or placement.

A25 Failure and edge-case behavior

If JavaScript fails or is disabled, the page should still render as a readable static board. The controls may not function, but the content must remain available. This is an important consequence of the HTML-first architecture.

If local storage is unavailable, the page should still allow session-level interaction where possible, though bookmarks and persisted filters may not survive reloads. The UX should fail quietly rather than breaking the board.

If the search query produces zero matches, the results-summary area should explicitly say that no notes were found for the current query. The board should remain in search mode and either show all notes dimmed or, if strict mode is enabled, show an empty-state message in the board area.

If the user clears all categories or creates an impossible combination in a future multi-filter system, the board should show a clear empty-state rather than appearing broken.

A26 Recommended semantic structure for implementation

The specification should explicitly require that each note expose at least these semantic data points in the DOM: a stable GUID identifier, a category key, optional tag keys, a bookmarkable flag by implication of being a note, a title region, a visible content region, and an optional expandable details region.

The category filter should derive its option list either from authored filter definitions in the page or by scanning note metadata. The former is more controlled; the latter is more automatic. Because this is a hand-authored page, the best practice is to define the categories intentionally and let notes reference those keys. That avoids accidental drift and allows labels and emoji to be centrally managed.

The search index should be derived from note text already present in the DOM. It should not require a separate data file. The search routine should include collapsed text regions in its indexed content.

A27 Recommended implementation direction

The most robust implementation direction is a small DOM-querying enhancement layer that reads semantic note metadata and attaches behavior to a stable HTML structure. This keeps the product aligned with your build-free requirement and with the fact that you will author content directly in HTML.

Custom elements are appropriate if you want to encapsulate repeated interaction logic for note actions, filter panels, or expandable sections. However, they are not required for the first interactive version. A small script operating on semantic HTML is sufficient and may be easier to debug while the product is still evolving.

The important design requirement is not the component technology itself, but the DOM contract. If the note structure and metadata are clean, the interaction system can stay simple.

A28 Definition of done

This interactive specification is satisfied when the page provides a category filter that clearly shows active selections, a favorites system backed by note GUIDs and local storage with a strict ten-item cap, per-note and global expansion for hidden details content, and a custom full-text search that finds matches in both visible and collapsed content.

It is also satisfied when search results appear in a dedicated summary area, matching notes remain fully emphasized on the board, non-matching notes are dimmed by default, an explicit "Hide non-matching notes" option is available only during active search, and clearing search fully restores the default board presentation.

Finally, it is satisfied when the entire interactive layer remains compatible with a self-contained HTML page, responsive on mobile and desktop, and maintainable by editing HTML directly.

A29 Final design stance

The best version of these interactions is one that respects the board as a visual document while quietly adding precision tools. Filtering should feel like focusing the board. Search should feel like illuminating it. Favorites should feel personal and lightweight. Expansion should reveal depth without making the default view heavy. Persistence should support convenience without creating hidden state that surprises the user.

That balance is the central UX requirement for this second specification.
