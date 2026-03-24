/**
 * Progressive enhancement layer for the sticky-note board.
 * The HTML remains the content source of truth; this module only reads semantic
 * metadata from the DOM and applies filter, search, favorites, and expansion state.
 */

const STORAGE_KEYS = {
    favorites: "sticky_board_favorites",
    view: "sticky_board_view"
};

/**
 * @typedef {Object} CategoryMeta
 * @property {string} key
 * @property {string} label
 * @property {string} emoji
 * @property {string} description
 * @property {HTMLElement} element
 * @property {HTMLElement[]} notes
 */

/**
 * @typedef {Object} NoteMeta
 * @property {string} guid
 * @property {string} category
 * @property {string} title
 * @property {string} searchText
 * @property {HTMLElement} element
 * @property {HTMLElement | null} details
 * @property {HTMLButtonElement | null} bookmarkButton
 * @property {HTMLButtonElement | null} expandButton
 */

class SafeStorage {
    read(key) {
        try {
            const rawValue = window.localStorage.getItem(key);
            return rawValue ? JSON.parse(rawValue) : null;
        } catch {
            return null;
        }
    }

    write(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage is optional convenience state only.
        }
    }
}

class StickyBoardApp {
    constructor(root = document) {
        this.root = root;
        this.storage = new SafeStorage();

        this.board = /** @type {HTMLElement} */ (root.querySelector("#board"));
        this.emptyState = /** @type {HTMLElement} */ (root.querySelector("#board-empty"));
        this.message = /** @type {HTMLElement} */ (root.querySelector("#app-message"));
        this.searchInput = /** @type {HTMLInputElement} */ (root.querySelector("#search-input"));
        this.hideNonMatches = /** @type {HTMLInputElement} */ (root.querySelector("#hide-non-matches"));
        this.clearSearchButton = /** @type {HTMLButtonElement} */ (root.querySelector("#clear-search"));
        this.expandVisibleButton = /** @type {HTMLButtonElement} */ (root.querySelector("#expand-visible"));
        this.collapseVisibleButton = /** @type {HTMLButtonElement} */ (root.querySelector("#collapse-visible"));
        this.resetViewButton = /** @type {HTMLButtonElement} */ (root.querySelector("#reset-view"));
        this.favoritesScopeButton = /** @type {HTMLButtonElement} */ (root.querySelector("#favorites-scope"));
        this.favoritesCount = /** @type {HTMLElement} */ (root.querySelector("#favorites-count"));
        this.activeFilters = /** @type {HTMLElement} */ (root.querySelector("#active-filters"));
        this.scopeSummary = /** @type {HTMLElement} */ (root.querySelector("#scope-summary"));
        this.categoryPanel = /** @type {HTMLDetailsElement} */ (root.querySelector("#category-panel"));
        this.categoryOptions = /** @type {HTMLElement} */ (root.querySelector("#category-options"));
        this.categorySummary = /** @type {HTMLElement} */ (root.querySelector("#category-summary"));
        this.resultsPanel = /** @type {HTMLElement} */ (root.querySelector("#search-results"));
        this.resultsCopy = /** @type {HTMLElement} */ (root.querySelector("#search-results-copy"));
        this.resultsList = /** @type {HTMLOListElement} */ (root.querySelector("#search-results-list"));
        this.heroNoteCount = /** @type {HTMLElement | null} */ (root.querySelector("#hero-note-count"));
        this.heroAreaCount = /** @type {HTMLElement | null} */ (root.querySelector("#hero-area-count"));

        /** @type {CategoryMeta[]} */
        this.categories = [];
        /** @type {NoteMeta[]} */
        this.notes = [];
        this.noteByGuid = new Map();
        this.validGuids = new Set();
        this.validCategoryKeys = new Set();
        this.listFormatter = new Intl.ListFormat("en", { style: "short", type: "conjunction" });

        this.state = {
            selectedCategories: new Set(),
            favorites: new Set(),
            favoritesOnly: false,
            query: "",
            hideNonMatching: false
        };
    }

    init() {
        this.collectCategories();
        this.collectNotes();
        this.restoreState();
        this.renderCategoryOptions();
        this.renderHeroCounts();
        this.bindEvents();
        this.notes.forEach((note) => this.setExpanded(note, false));
        this.applyState();
    }

    collectCategories() {
        this.categories = [...this.root.querySelectorAll(".board-section[data-category-key]")].map((section) => {
            const element = /** @type {HTMLElement} */ (section);
            const key = element.dataset.categoryKey?.trim() ?? "";
            const notes = [...element.querySelectorAll(".note[data-guid]")].map((note) => /** @type {HTMLElement} */ (note));

            this.validCategoryKeys.add(key);

            return {
                key,
                label: element.dataset.categoryLabel?.trim() ?? key,
                emoji: element.dataset.categoryEmoji?.trim() ?? "",
                description: element.dataset.categoryDescription?.trim() ?? "",
                element,
                notes
            };
        });
    }

    collectNotes() {
        this.notes = [...this.root.querySelectorAll(".note[data-guid]")].map((noteElement) => {
            const element = /** @type {HTMLElement} */ (noteElement);
            const guid = element.dataset.guid?.trim() ?? "";
            const category = element.dataset.category?.trim() ?? "";
            const title = element.querySelector(".note-title")?.textContent?.trim() ?? guid;
            const details = /** @type {HTMLElement | null} */ (element.querySelector(".note-details"));
            const bookmarkButton = /** @type {HTMLButtonElement | null} */ (element.querySelector(".bookmark-toggle"));
            const expandButton = /** @type {HTMLButtonElement | null} */ (element.querySelector(".expand-toggle"));
            const bodyText = element.querySelector(".note-body")?.textContent?.trim() ?? "";
            const detailText = details?.textContent?.trim() ?? "";
            const linksText = [...element.querySelectorAll(".note-links a")]
                .map((link) => link.textContent?.trim() ?? "")
                .join(" ");
            const tagText = element.dataset.tags ?? "";
            const searchText = normalizeText([title, bodyText, detailText, linksText, tagText, category].join(" "));

            const note = {
                guid,
                category,
                title,
                searchText,
                element,
                details,
                bookmarkButton,
                expandButton
            };

            this.noteByGuid.set(guid, note);
            this.validGuids.add(guid);
            return note;
        });
    }

    restoreState() {
        const storedFavorites = this.storage.read(STORAGE_KEYS.favorites);
        const storedView = this.storage.read(STORAGE_KEYS.view);

        const favorites = Array.isArray(storedFavorites) ? storedFavorites.filter((guid) => this.validGuids.has(guid)) : [];
        const selectedCategories = Array.isArray(storedView?.selectedCategories)
            ? storedView.selectedCategories.filter((key) => this.validCategoryKeys.has(key))
            : [];

        this.state.favorites = new Set(favorites);
        this.state.selectedCategories = new Set(selectedCategories);
        this.state.favoritesOnly = Boolean(storedView?.favoritesOnly);

        this.persistState();
    }

    bindEvents() {
        this.searchInput.addEventListener("input", () => {
            this.state.query = this.searchInput.value.trim();

            if (!this.state.query) {
                this.state.hideNonMatching = false;
                this.hideNonMatches.checked = false;
            }

            this.applyState();
        });

        this.hideNonMatches.addEventListener("change", () => {
            this.state.hideNonMatching = this.hideNonMatches.checked && Boolean(this.state.query);
            this.applyState();
        });

        this.clearSearchButton.addEventListener("click", () => {
            this.clearSearch();
            this.applyState();
        });

        this.expandVisibleButton.addEventListener("click", () => {
            this.visibleNotes().forEach((note) => this.setExpanded(note, true));
        });

        this.collapseVisibleButton.addEventListener("click", () => {
            this.visibleNotes().forEach((note) => this.setExpanded(note, false));
        });

        this.resetViewButton.addEventListener("click", () => {
            this.clearMessage();
            this.state.selectedCategories.clear();
            this.state.favoritesOnly = false;
            this.clearSearch();
            this.notes.forEach((note) => this.setExpanded(note, false));
            this.persistState();
            this.applyState();
        });

        this.favoritesScopeButton.addEventListener("click", () => {
            this.state.favoritesOnly = !this.state.favoritesOnly;
            this.persistState();
            this.applyState();
        });

        this.categoryOptions.addEventListener("change", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || target.name !== "category-filter") {
                return;
            }

            if (target.checked) {
                this.state.selectedCategories.add(target.value);
            } else {
                this.state.selectedCategories.delete(target.value);
            }

            this.persistState();
            this.applyState();
        });

        this.activeFilters.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const actionButton = target.closest("button[data-remove-filter]");
            if (!(actionButton instanceof HTMLButtonElement)) {
                return;
            }

            const filterType = actionButton.dataset.removeFilter;
            const value = actionButton.dataset.value ?? "";

            if (filterType === "category") {
                this.state.selectedCategories.delete(value);
            }

            if (filterType === "favorites") {
                this.state.favoritesOnly = false;
            }

            if (filterType === "search") {
                this.clearSearch();
            }

            this.syncCategoryInputs();
            this.persistState();
            this.applyState();
        });

        this.root.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const bookmarkButton = target.closest("[data-action='bookmark']");
            if (bookmarkButton instanceof HTMLButtonElement) {
                this.toggleBookmark(bookmarkButton);
                return;
            }

            const expandButton = target.closest("[data-action='expand']");
            if (expandButton instanceof HTMLButtonElement) {
                this.toggleExpand(expandButton);
                return;
            }

            const resultLink = target.closest("[data-note-target]");
            if (resultLink instanceof HTMLAnchorElement) {
                const guid = resultLink.dataset.noteTarget ?? "";
                const note = this.noteByGuid.get(guid);
                if (note) {
                    note.element.setAttribute("tabindex", "-1");
                    window.requestAnimationFrame(() => note.element.focus({ preventScroll: true }));
                }
            }
        });
    }

    renderCategoryOptions() {
        const fragment = document.createDocumentFragment();

        this.categories.forEach((category) => {
            const wrapper = document.createElement("div");
            wrapper.className = "filter-option";

            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "category-filter";
            input.value = category.key;
            input.checked = this.state.selectedCategories.has(category.key);

            const text = document.createElement("span");
            text.textContent = `${category.emoji} ${category.label}`;

            const count = document.createElement("span");
            count.className = "filter-count";
            count.textContent = `${category.notes.length}`;

            label.append(input, text);
            wrapper.append(label, count);
            fragment.append(wrapper);
        });

        this.categoryOptions.replaceChildren(fragment);
        this.updateCategorySummary();
    }

    renderHeroCounts() {
        if (this.heroNoteCount) {
            this.heroNoteCount.textContent = String(this.notes.length);
        }

        if (this.heroAreaCount) {
            this.heroAreaCount.textContent = String(this.categories.length);
        }
    }

    applyState() {
        const query = normalizeText(this.state.query);
        const queryActive = query.length > 0;
        const scopedNotes = [];
        const matches = [];
        let visibleCount = 0;

        this.clearMessage();

        this.notes.forEach((note) => {
            const inCategoryScope =
                this.state.selectedCategories.size === 0 || this.state.selectedCategories.has(note.category);
            const inFavoritesScope = !this.state.favoritesOnly || this.state.favorites.has(note.guid);
            const inScope = inCategoryScope && inFavoritesScope;
            const isMatch = queryActive ? note.searchText.includes(query) : true;
            const shouldHide = !inScope || (queryActive && this.state.hideNonMatching && !isMatch);

            note.element.hidden = shouldHide;
            note.element.classList.toggle("is-match", queryActive && inScope && isMatch);
            note.element.classList.toggle("is-dimmed", queryActive && inScope && !isMatch && !this.state.hideNonMatching);
            note.element.classList.toggle("is-bookmarked", this.state.favorites.has(note.guid));

            if (note.bookmarkButton) {
                note.bookmarkButton.setAttribute("aria-pressed", String(this.state.favorites.has(note.guid)));
                note.bookmarkButton.textContent = this.state.favorites.has(note.guid) ? "Bookmarked" : "Bookmark";
            }

            if (inScope) {
                scopedNotes.push(note);
            }

            if (inScope && isMatch) {
                matches.push(note);
            }

            if (!shouldHide) {
                visibleCount += 1;
            }
        });

        this.categories.forEach((category) => {
            const hasVisibleNotes = category.notes.some((note) => !note.hidden);
            category.element.hidden = !hasVisibleNotes;
        });

        this.board.dataset.searchActive = String(queryActive);
        this.hideNonMatches.disabled = !queryActive;
        this.hideNonMatches.checked = queryActive && this.state.hideNonMatching;
        this.clearSearchButton.hidden = !queryActive;
        this.favoritesScopeButton.setAttribute("aria-pressed", String(this.state.favoritesOnly));
        this.favoritesCount.textContent = String(this.state.favorites.size);

        this.renderActiveFilters();
        this.updateCategorySummary();
        this.renderSearchResults(queryActive, matches);
        this.renderEmptyState(queryActive, scopedNotes.length, matches.length, visibleCount);
        this.renderScopeSummary(queryActive, scopedNotes.length, matches.length, visibleCount);
        this.syncCategoryInputs();
        this.persistState();
    }

    renderActiveFilters() {
        const fragment = document.createDocumentFragment();

        if (this.state.selectedCategories.size === 0 && !this.state.favoritesOnly && !this.state.query) {
            const neutral = document.createElement("span");
            neutral.className = "filter-chip";
            neutral.textContent = "All categories";
            fragment.append(neutral);
        }

        [...this.state.selectedCategories]
            .sort((left, right) => left.localeCompare(right))
            .forEach((key) => {
                const category = this.categories.find((item) => item.key === key);
                if (!category) {
                    return;
                }

                fragment.append(
                    this.createRemovableChip(
                        `${category.emoji} ${category.label}`,
                        "Remove category filter",
                        "category",
                        category.key
                    )
                );
            });

        if (this.state.favoritesOnly) {
            fragment.append(this.createRemovableChip("Bookmarks", "Exit bookmarks scope", "favorites", "favorites"));
        }

        if (this.state.query) {
            fragment.append(
                this.createRemovableChip(`Search: "${this.state.query}"`, "Clear search query", "search", "search")
            );
        }

        this.activeFilters.replaceChildren(fragment);
    }

    renderSearchResults(queryActive, matches) {
        if (!queryActive) {
            this.resultsPanel.hidden = true;
            this.resultsList.replaceChildren();
            this.resultsCopy.textContent = "";
            return;
        }

        this.resultsPanel.hidden = false;

        if (matches.length === 0) {
            this.resultsCopy.textContent = `No notes found for "${this.state.query}" within the current scope.`;
            this.resultsList.replaceChildren();
            return;
        }

        this.resultsCopy.textContent = `${matches.length} matching note${matches.length === 1 ? "" : "s"} for "${this.state.query}".`;

        const fragment = document.createDocumentFragment();

        matches.forEach((note) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            const category = this.categories.find((entry) => entry.key === note.category);

            link.href = `#${note.element.id}`;
            link.dataset.noteTarget = note.guid;
            link.textContent = category ? `${note.title} · ${category.emoji} ${category.label}` : note.title;

            item.append(link);
            fragment.append(item);
        });

        this.resultsList.replaceChildren(fragment);
    }

    renderEmptyState(queryActive, scopedCount, matchCount, visibleCount) {
        let message = "";

        if (!queryActive && this.state.favoritesOnly && this.state.favorites.size === 0) {
            message = "No bookmarks yet. Bookmark up to ten notes to create a personal quick-access view.";
        } else if (!queryActive && visibleCount === 0) {
            message = "No notes match the current filters.";
        } else if (queryActive && this.state.hideNonMatching && matchCount === 0) {
            message = `No notes matched "${this.state.query}" in the current scope. Clear or broaden the search to restore the board.`;
        } else if (queryActive && scopedCount === 0) {
            message = "There are no notes in the current scope. Clear filters or saved-notes mode to widen the board.";
        }

        this.emptyState.hidden = message === "";
        this.emptyState.textContent = message;
    }

    renderScopeSummary(queryActive, scopedCount, matchCount, visibleCount) {
        if (!queryActive) {
            this.scopeSummary.textContent = `Showing ${visibleCount} note${visibleCount === 1 ? "" : "s"} across the current board view.`;
            return;
        }

        if (scopedCount === 0) {
            this.scopeSummary.textContent = "Search is active, but the current filters leave no notes in scope.";
            return;
        }

        if (this.state.hideNonMatching) {
            this.scopeSummary.textContent = `Showing ${visibleCount} matching note${visibleCount === 1 ? "" : "s"} out of ${scopedCount} scoped note${scopedCount === 1 ? "" : "s"}.`;
            return;
        }

        this.scopeSummary.textContent = `${matchCount} match${matchCount === 1 ? "" : "es"} across ${scopedCount} note${scopedCount === 1 ? "" : "s"} in scope. Non-matches stay dimmed.`;
    }

    updateCategorySummary() {
        const selectedLabels = this.categories
            .filter((category) => this.state.selectedCategories.has(category.key))
            .map((category) => category.label);

        if (selectedLabels.length === 0) {
            this.categorySummary.textContent = "All categories";
            return;
        }

        if (selectedLabels.length <= 2) {
            this.categorySummary.textContent = this.listFormatter.format(selectedLabels);
            return;
        }

        this.categorySummary.textContent = `${selectedLabels.length} selected`;
    }

    syncCategoryInputs() {
        this.categoryOptions.querySelectorAll("input[name='category-filter']").forEach((input) => {
            const checkbox = /** @type {HTMLInputElement} */ (input);
            checkbox.checked = this.state.selectedCategories.has(checkbox.value);
        });
    }

    toggleBookmark(button) {
        const noteElement = button.closest(".note");
        if (!(noteElement instanceof HTMLElement)) {
            return;
        }

        const guid = noteElement.dataset.guid ?? "";
        const isSaved = this.state.favorites.has(guid);

        if (!isSaved && this.state.favorites.size >= 10) {
            this.showMessage("You can bookmark up to ten notes. Remove one before adding another.");
            return;
        }

        if (isSaved) {
            this.state.favorites.delete(guid);
        } else {
            this.state.favorites.add(guid);
        }

        this.persistState();
        this.applyState();
    }

    toggleExpand(button) {
        const noteElement = button.closest(".note");
        if (!(noteElement instanceof HTMLElement)) {
            return;
        }

        const note = this.noteByGuid.get(noteElement.dataset.guid ?? "");
        if (!note) {
            return;
        }

        this.setExpanded(note, !note.element.classList.contains("is-expanded"));
    }

    setExpanded(note, expanded) {
        if (!note.details || !note.expandButton) {
            return;
        }

        note.element.classList.toggle("is-expanded", expanded);
        note.expandButton.setAttribute("aria-expanded", String(expanded));
        note.expandButton.textContent = expanded ? "Hide details" : "Show details";
    }

    visibleNotes() {
        return this.notes.filter((note) => !note.element.hidden);
    }

    createRemovableChip(label, removeLabel, type, value) {
        const chip = document.createElement("span");
        chip.className = "filter-chip";
        chip.textContent = `${label} `;

        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", removeLabel);
        button.dataset.removeFilter = type;
        button.dataset.value = value;
        button.textContent = "×";

        chip.append(button);
        return chip;
    }

    clearSearch() {
        this.state.query = "";
        this.state.hideNonMatching = false;
        this.searchInput.value = "";
        this.hideNonMatches.checked = false;
    }

    showMessage(text) {
        this.message.hidden = false;
        this.message.textContent = text;
    }

    clearMessage() {
        this.message.hidden = true;
        this.message.textContent = "";
    }

    persistState() {
        this.storage.write(STORAGE_KEYS.favorites, [...this.state.favorites]);
        this.storage.write(STORAGE_KEYS.view, {
            selectedCategories: [...this.state.selectedCategories],
            favoritesOnly: this.state.favoritesOnly
        });
    }
}

function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, " ")
        .trim();
}

new StickyBoardApp().init();
