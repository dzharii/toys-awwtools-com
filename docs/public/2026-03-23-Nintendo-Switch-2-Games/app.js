const STORAGE_KEYS = {
    favorites: "switch_skill_board_favorites",
    view: "switch_skill_board_view"
};

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
            // Optional convenience storage only.
        }
    }
}

class SkillBoardApp {
    constructor(root = document) {
        this.root = root;
        this.storage = new SafeStorage();

        this.board = root.querySelector("#board");
        this.emptyState = root.querySelector("#board-empty");
        this.message = root.querySelector("#app-message");
        this.searchInput = root.querySelector("#search-input");
        this.hideNonMatches = root.querySelector("#hide-non-matches");
        this.clearSearchButton = root.querySelector("#clear-search");
        this.expandVisibleButton = root.querySelector("#expand-visible");
        this.collapseVisibleButton = root.querySelector("#collapse-visible");
        this.resetViewButton = root.querySelector("#reset-view");
        this.favoritesScopeButton = root.querySelector("#favorites-scope");
        this.favoritesCount = root.querySelector("#favorites-count");
        this.activeFilters = root.querySelector("#active-filters");
        this.scopeSummary = root.querySelector("#scope-summary");
        this.categoryPanel = root.querySelector("#category-panel");
        this.categoryOptions = root.querySelector("#category-options");
        this.categorySummary = root.querySelector("#category-summary");
        this.evidencePanel = root.querySelector("#evidence-panel");
        this.evidenceOptions = root.querySelector("#evidence-options");
        this.evidenceSummary = root.querySelector("#evidence-summary");
        this.resultsPanel = root.querySelector("#search-results");
        this.resultsCopy = root.querySelector("#search-results-copy");
        this.resultsList = root.querySelector("#search-results-list");
        this.heroNoteCount = root.querySelector("#hero-note-count");
        this.heroAreaCount = root.querySelector("#hero-area-count");

        this.categories = [];
        this.notes = [];
        this.noteByGuid = new Map();
        this.validGuids = new Set();
        this.validCategoryKeys = new Set();
        this.validEvidenceKeys = new Set();
        this.listFormatter = new Intl.ListFormat("en", { style: "short", type: "conjunction" });

        this.state = {
            selectedCategories: new Set(),
            selectedEvidence: new Set(),
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
        this.renderEvidenceOptions();
        this.renderHeroCounts();
        this.bindEvents();
        this.notes.forEach((note) => this.setExpanded(note, false));
        this.applyState();
    }

    collectCategories() {
        this.categories = [...this.root.querySelectorAll(".board-section[data-category-key]")].map((section) => {
            const element = section;
            const key = element.dataset.categoryKey?.trim() ?? "";
            const label = element.dataset.categoryLabel?.trim() ?? key;
            const description = element.dataset.categoryDescription?.trim() ?? "";

            this.validCategoryKeys.add(key);

            return {
                key,
                label,
                description,
                element
            };
        });
    }

    collectNotes() {
        this.notes = [...this.root.querySelectorAll(".note[data-guid]")].map((noteElement) => {
            const element = noteElement;
            const guid = element.dataset.guid?.trim() ?? "";
            const category = element.dataset.category?.trim() ?? "";
            const evidence = element.dataset.evidence?.trim() ?? "";
            const year = element.dataset.year?.trim() ?? "";
            const title = element.querySelector(".note-title")?.textContent?.trim() ?? guid;
            const details = element.querySelector(".note-details");
            const bookmarkButton = element.querySelector(".bookmark-toggle");
            const expandButton = element.querySelector(".expand-toggle");
            const tagText = element.dataset.tags ?? "";
            const searchText = normalizeText(
                [
                    title,
                    year,
                    evidence,
                    category,
                    tagText,
                    element.querySelector(".note-summary")?.textContent ?? "",
                    element.querySelector(".note-angle")?.textContent ?? "",
                    details?.textContent ?? ""
                ].join(" ")
            );

            const note = {
                guid,
                title,
                category,
                evidence,
                year,
                searchText,
                element,
                details,
                bookmarkButton,
                expandButton
            };

            this.noteByGuid.set(guid, note);
            this.validGuids.add(guid);
            this.validEvidenceKeys.add(evidence);
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
        const selectedEvidence = Array.isArray(storedView?.selectedEvidence)
            ? storedView.selectedEvidence.filter((key) => this.validEvidenceKeys.has(key))
            : [];

        this.state.favorites = new Set(favorites);
        this.state.selectedCategories = new Set(selectedCategories);
        this.state.selectedEvidence = new Set(selectedEvidence);
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
            this.state.selectedCategories.clear();
            this.state.selectedEvidence.clear();
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

        this.evidenceOptions.addEventListener("change", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || target.name !== "evidence-filter") {
                return;
            }

            if (target.checked) {
                this.state.selectedEvidence.add(target.value);
            } else {
                this.state.selectedEvidence.delete(target.value);
            }

            this.persistState();
            this.applyState();
        });

        this.activeFilters.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const button = target.closest("button[data-remove-filter]");
            if (!(button instanceof HTMLButtonElement)) {
                return;
            }

            const filterType = button.dataset.removeFilter;
            const value = button.dataset.value ?? "";

            if (filterType === "category") {
                this.state.selectedCategories.delete(value);
            }

            if (filterType === "evidence") {
                this.state.selectedEvidence.delete(value);
            }

            if (filterType === "favorites") {
                this.state.favoritesOnly = false;
            }

            if (filterType === "query") {
                this.clearSearch();
            }

            this.persistState();
            this.applyState();
        });

        this.board.addEventListener("click", (event) => {
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
                this.toggleExpanded(expandButton);
            }
        });

        this.resultsList.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const resultLink = target.closest("[data-note-target]");
            if (!(resultLink instanceof HTMLAnchorElement)) {
                return;
            }

            const note = this.noteByGuid.get(resultLink.dataset.noteTarget ?? "");
            if (!note) {
                return;
            }

            this.setExpanded(note, true);
        });
    }

    renderCategoryOptions() {
        const fragment = document.createDocumentFragment();

        this.categories.forEach((category) => {
            const count = this.notes.filter((note) => note.category === category.key).length;
            const row = document.createElement("div");
            row.className = "filter-option";

            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "category-filter";
            input.value = category.key;
            input.checked = this.state.selectedCategories.has(category.key);

            const text = document.createElement("span");
            text.textContent = category.label;

            const countElement = document.createElement("span");
            countElement.className = "filter-option__count";
            countElement.textContent = `${count}`;

            label.append(input, text);
            row.append(label, countElement);
            fragment.append(row);
        });

        this.categoryOptions.replaceChildren(fragment);
    }

    renderEvidenceOptions() {
        const evidenceOrder = ["A", "B", "C"];
        const fragment = document.createDocumentFragment();

        evidenceOrder.forEach((key) => {
            if (!this.validEvidenceKeys.has(key)) {
                return;
            }

            const count = this.notes.filter((note) => note.evidence === key).length;
            const row = document.createElement("div");
            row.className = "filter-option";

            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "evidence-filter";
            input.value = key;
            input.checked = this.state.selectedEvidence.has(key);

            const text = document.createElement("span");
            text.textContent = `Evidence ${key}`;

            const countElement = document.createElement("span");
            countElement.className = "filter-option__count";
            countElement.textContent = `${count}`;

            label.append(input, text);
            row.append(label, countElement);
            fragment.append(row);
        });

        this.evidenceOptions.replaceChildren(fragment);
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
        const queryActive = Boolean(query);
        let visibleCount = 0;
        let matchedCount = 0;

        this.notes.forEach((note) => {
            const inCategoryScope =
                this.state.selectedCategories.size === 0 || this.state.selectedCategories.has(note.category);
            const inEvidenceScope =
                this.state.selectedEvidence.size === 0 || this.state.selectedEvidence.has(note.evidence);
            const inFavoritesScope = !this.state.favoritesOnly || this.state.favorites.has(note.guid);
            const inScope = inCategoryScope && inEvidenceScope && inFavoritesScope;
            const matchesQuery = !queryActive || note.searchText.includes(query);
            const isVisible = inScope && (!queryActive || matchesQuery || !this.state.hideNonMatching);
            const isDimmed = inScope && queryActive && !matchesQuery && !this.state.hideNonMatching;

            note.element.hidden = !isVisible;
            note.element.classList.toggle("is-dimmed", isDimmed);
            note.element.classList.toggle("is-match", queryActive && matchesQuery);
            note.element.classList.toggle("is-bookmarked", this.state.favorites.has(note.guid));

            if (note.bookmarkButton) {
                const isSaved = this.state.favorites.has(note.guid);
                note.bookmarkButton.setAttribute("aria-pressed", String(isSaved));
                note.bookmarkButton.textContent = isSaved ? "Bookmarked" : "Bookmark";
            }

            if (queryActive && inScope && matchesQuery) {
                matchedCount += 1;
            }

            if (isVisible) {
                visibleCount += 1;
            }
        });

        this.categories.forEach((category) => {
            const hasVisibleNotes = this.notes.some((note) => note.category === category.key && !note.element.hidden);
            category.element.hidden = !hasVisibleNotes;
        });

        this.hideNonMatches.disabled = !queryActive;
        this.hideNonMatches.checked = this.state.hideNonMatching;
        this.clearSearchButton.hidden = !queryActive;
        this.favoritesScopeButton.setAttribute("aria-pressed", String(this.state.favoritesOnly));
        this.favoritesCount.textContent = String(this.state.favorites.size);

        this.renderCategorySummary();
        this.renderEvidenceSummary();
        this.renderActiveFilters();
        this.renderScopeSummary({ visibleCount, matchedCount, queryActive });
        this.renderResults({ matchedCount, queryActive });
        this.renderEmptyState({ visibleCount, queryActive });
        this.syncFilterInputs();
        this.clearMessage();
        this.persistState();
    }

    renderCategorySummary() {
        if (this.state.selectedCategories.size === 0) {
            this.categorySummary.textContent = "All categories";
            return;
        }

        const labels = this.categories
            .filter((category) => this.state.selectedCategories.has(category.key))
            .map((category) => category.label);
        this.categorySummary.textContent = this.listFormatter.format(labels);
    }

    renderEvidenceSummary() {
        if (this.state.selectedEvidence.size === 0) {
            this.evidenceSummary.textContent = "All evidence";
            return;
        }

        const labels = ["A", "B", "C"].filter((key) => this.state.selectedEvidence.has(key)).map((key) => `Evidence ${key}`);
        this.evidenceSummary.textContent = this.listFormatter.format(labels);
    }

    renderActiveFilters() {
        const fragment = document.createDocumentFragment();

        this.categories.forEach((category) => {
            if (!this.state.selectedCategories.has(category.key)) {
                return;
            }

            fragment.append(
                this.createChip({
                    label: category.label,
                    action: "category",
                    value: category.key
                })
            );
        });

        ["A", "B", "C"].forEach((key) => {
            if (!this.state.selectedEvidence.has(key)) {
                return;
            }

            fragment.append(
                this.createChip({
                    label: `Evidence ${key}`,
                    action: "evidence",
                    value: key
                })
            );
        });

        if (this.state.favoritesOnly) {
            fragment.append(
                this.createChip({
                    label: "Bookmarks",
                    action: "favorites",
                    value: "favorites"
                })
            );
        }

        if (this.state.query) {
            fragment.append(
                this.createChip({
                    label: `Search: ${this.state.query}`,
                    action: "query",
                    value: this.state.query
                })
            );
        }

        this.activeFilters.replaceChildren(fragment);
    }

    createChip({ label, action, value }) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-chip";
        button.dataset.removeFilter = action;
        button.dataset.value = value;
        button.textContent = `${label} ×`;
        return button;
    }

    renderScopeSummary({ visibleCount, matchedCount, queryActive }) {
        if (!queryActive && this.state.selectedCategories.size === 0 && this.state.selectedEvidence.size === 0 && !this.state.favoritesOnly) {
            this.scopeSummary.textContent = `Showing all ${this.notes.length} games.`;
            return;
        }

        if (queryActive) {
            this.scopeSummary.textContent = `Showing ${visibleCount} visible games, with ${matchedCount} matching the current search.`;
            return;
        }

        this.scopeSummary.textContent = `Showing ${visibleCount} games in the current filter scope.`;
    }

    renderResults({ matchedCount, queryActive }) {
        if (!queryActive) {
            this.resultsPanel.hidden = true;
            this.resultsList.replaceChildren();
            return;
        }

        const matchedNotes = this.notes.filter((note) => !note.element.hidden && note.searchText.includes(normalizeText(this.state.query)));
        const fragment = document.createDocumentFragment();

        matchedNotes.forEach((note) => {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = `#${note.element.id}`;
            link.dataset.noteTarget = note.guid;
            link.textContent = note.title;
            item.append(link);
            fragment.append(item);
        });

        this.resultsList.replaceChildren(fragment);
        this.resultsCopy.textContent = matchedCount === 1 ? "1 matching game in the current scope." : `${matchedCount} matching games in the current scope.`;
        this.resultsPanel.hidden = false;
    }

    renderEmptyState({ visibleCount, queryActive }) {
        if (visibleCount > 0) {
            this.emptyState.hidden = true;
            return;
        }

        let message = "No games are visible right now.";

        if (queryActive) {
            message = "No games match this search inside the current filter scope.";
        } else if (this.state.favoritesOnly && this.state.favorites.size === 0) {
            message = "No bookmarks yet. Save up to ten games to create a personal shortlist.";
        } else if (this.state.selectedCategories.size > 0 || this.state.selectedEvidence.size > 0) {
            message = "No games match the current filter combination.";
        }

        this.emptyState.textContent = message;
        this.emptyState.hidden = false;
    }

    syncFilterInputs() {
        this.categoryOptions.querySelectorAll("input[name='category-filter']").forEach((input) => {
            input.checked = this.state.selectedCategories.has(input.value);
        });

        this.evidenceOptions.querySelectorAll("input[name='evidence-filter']").forEach((input) => {
            input.checked = this.state.selectedEvidence.has(input.value);
        });
    }

    visibleNotes() {
        return this.notes.filter((note) => !note.element.hidden);
    }

    toggleBookmark(button) {
        const note = this.noteFromButton(button);
        if (!note) {
            return;
        }

        const isSaved = this.state.favorites.has(note.guid);

        if (!isSaved && this.state.favorites.size >= 10) {
            this.showMessage("You can bookmark up to ten games. Remove one before adding another.");
            return;
        }

        if (isSaved) {
            this.state.favorites.delete(note.guid);
        } else {
            this.state.favorites.add(note.guid);
        }

        this.applyState();
    }

    toggleExpanded(button) {
        const note = this.noteFromButton(button);
        if (!note) {
            return;
        }

        this.setExpanded(note, !note.element.classList.contains("is-expanded"));
    }

    setExpanded(note, expanded) {
        note.element.classList.toggle("is-expanded", expanded);

        if (note.expandButton) {
            note.expandButton.setAttribute("aria-expanded", String(expanded));
            note.expandButton.textContent = expanded ? "Hide details" : "Show details";
        }
    }

    noteFromButton(button) {
        const noteElement = button.closest(".note[data-guid]");
        if (!(noteElement instanceof HTMLElement)) {
            return null;
        }

        return this.noteByGuid.get(noteElement.dataset.guid ?? "") ?? null;
    }

    showMessage(text) {
        this.message.textContent = text;
        this.message.hidden = false;
    }

    clearMessage() {
        this.message.hidden = true;
        this.message.textContent = "";
    }

    clearSearch() {
        this.state.query = "";
        this.state.hideNonMatching = false;
        this.searchInput.value = "";
        this.hideNonMatches.checked = false;
    }

    persistState() {
        this.storage.write(STORAGE_KEYS.favorites, [...this.state.favorites]);
        this.storage.write(STORAGE_KEYS.view, {
            selectedCategories: [...this.state.selectedCategories],
            selectedEvidence: [...this.state.selectedEvidence],
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

new SkillBoardApp().init();
