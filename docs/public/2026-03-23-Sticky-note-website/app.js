/**
 * Progressive enhancement layer for the sticky-note board.
 * The HTML remains the content source of truth; this module only reads semantic
 * metadata from the DOM and applies filter, search, favorites, and expansion state.
 */

const STORAGE_KEYS = {
    favorites: "sticky_board_favorites",
    view: "sticky_board_view",
    previewPosition: "sticky_board_preview_position"
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
 * @property {string} previewUrl
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
        this.previewController = null;

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
        this.previewController = new FloatingPreviewController(this.root, this.notes, this.storage);
        this.previewController.init();
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
            const previewUrl = element.dataset.previewUrl?.trim() ?? "";
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
                expandButton,
                previewUrl
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
        this.previewController?.handleBoardStateChange();
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

class FloatingPreviewController {
    constructor(root, notes, storage) {
        this.root = root;
        this.notes = notes.filter((note) => note.previewUrl);
        this.storage = storage;

        this.window = /** @type {HTMLElement | null} */ (root.querySelector("#link-preview"));
        this.dragHandle = /** @type {HTMLElement | null} */ (root.querySelector("#link-preview-drag-handle"));
        this.title = /** @type {HTMLElement | null} */ (root.querySelector("#link-preview-title"));
        this.host = /** @type {HTMLElement | null} */ (root.querySelector("#link-preview-host"));
        this.openLink = /** @type {HTMLAnchorElement | null} */ (root.querySelector("#link-preview-open"));
        this.closeButton = /** @type {HTMLButtonElement | null} */ (root.querySelector("#link-preview-close"));
        this.frame = /** @type {HTMLIFrameElement | null} */ (root.querySelector("#link-preview-frame"));

        this.desktopMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
        this.reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

        this.activeNote = null;
        this.pointerNote = null;
        this.previewHovered = false;
        this.currentUrl = "";
        this.requestId = 0;
        this.hoverTimer = 0;
        this.preloadTimer = 0;
        this.loadTimer = 0;
        this.closeTimer = 0;
        this.pendingRequest = null;
        this.dragState = null;
        this.preferredPosition = this.readPreferredPosition();
    }

    init() {
        if (!this.window || !this.dragHandle || !this.title || !this.host || !this.openLink || !this.closeButton || !this.frame) {
            return;
        }

        this.window.hidden = false;
        this.window.setAttribute("aria-hidden", "true");

        this.notes.forEach((note) => {
            note.element.dataset.previewEnabled = "true";
            note.element.addEventListener("pointerenter", () => this.handleNoteEnter(note));
            note.element.addEventListener("pointerleave", (event) => this.handleNoteLeave(note, event));
        });

        this.window.addEventListener("pointerenter", () => {
            this.previewHovered = true;
            this.clearCloseTimer();
        });

        this.window.addEventListener("pointerleave", (event) => {
            if (this.isWithinCluster(event.relatedTarget)) {
                return;
            }
            this.previewHovered = false;
            this.scheduleClose();
        });

        this.closeButton.addEventListener("click", () => this.hidePreview());
        this.dragHandle.addEventListener("pointerdown", (event) => this.startDrag(event));
        this.frame.addEventListener("load", () => this.handleFrameLoad());

        window.addEventListener("resize", () => this.handleViewportChange());
        window.addEventListener("scroll", () => this.handleViewportChange(), { passive: true });
    }

    handleBoardStateChange() {
        if (!this.isEnabled()) {
            this.hidePreview();
            return;
        }

        if (this.activeNote?.element.hidden || this.pointerNote?.element.hidden) {
            this.hidePreview();
            return;
        }

        if (this.window?.classList.contains("is-open") && this.activeNote) {
            this.applyPosition(this.resolvePosition(this.activeNote));
        }
    }

    isEnabled() {
        return this.desktopMedia.matches && window.innerWidth >= 1100 && window.innerHeight >= 720;
    }

    handleNoteEnter(note) {
        if (!this.isEnabled() || note.element.hidden) {
            return;
        }

        this.pointerNote = note;
        this.clearCloseTimer();

        if (this.activeNote === note && this.window?.classList.contains("is-open")) {
            this.applyPosition(this.resolvePosition(note));
            return;
        }

        this.beginPreviewIntent(note);
    }

    handleNoteLeave(note, event) {
        if (this.pointerNote === note) {
            this.pointerNote = null;
        }

        if (this.isWithinCluster(event.relatedTarget)) {
            return;
        }

        this.scheduleClose();
    }

    isWithinCluster(target) {
        return target instanceof Node && (this.window?.contains(target) || this.pointerNote?.element.contains(target));
    }

    beginPreviewIntent(note) {
        this.cancelPendingIntent();

        if (this.activeNote && this.activeNote !== note) {
            this.concealWindow();
        }

        const request = {
            id: ++this.requestId,
            note,
            url: note.previewUrl,
            hoverReady: false,
            loadReady: false
        };

        this.pendingRequest = request;

        this.preloadTimer = window.setTimeout(() => {
            if (this.pendingRequest?.id !== request.id || !this.frame) {
                return;
            }

            this.frame.src = request.url;
            this.loadTimer = window.setTimeout(() => {
                if (this.pendingRequest?.id === request.id) {
                    this.pendingRequest = null;
                }
            }, 5000);
        }, 240);

        this.hoverTimer = window.setTimeout(() => {
            if (this.pendingRequest?.id !== request.id) {
                return;
            }

            this.pendingRequest.hoverReady = true;
            this.maybeReveal(request.id);
        }, 1800);
    }

    handleFrameLoad() {
        if (!this.pendingRequest) {
            return;
        }

        window.clearTimeout(this.loadTimer);
        this.pendingRequest.loadReady = true;
        this.maybeReveal(this.pendingRequest.id);
    }

    maybeReveal(requestId) {
        if (!this.pendingRequest || this.pendingRequest.id !== requestId || !this.window || !this.openLink || !this.title || !this.host) {
            return;
        }

        if (!this.pendingRequest.hoverReady || !this.pendingRequest.loadReady || this.pointerNote !== this.pendingRequest.note || !this.isEnabled()) {
            return;
        }

        const { note, url } = this.pendingRequest;
        this.pendingRequest = null;
        this.activeNote = note;
        this.currentUrl = url;

        this.title.textContent = note.title;
        this.host.textContent = safeHost(url);
        this.openLink.href = url;

        this.applyPosition(this.resolvePosition(note));
        this.window.classList.add("is-open");
        this.window.setAttribute("aria-hidden", "false");
    }

    resolvePosition(note) {
        const noteRect = note.element.getBoundingClientRect();
        const size = this.measureWindow();
        const gap = 18;
        const candidates = [];

        if (this.preferredPosition) {
            const preferred = this.clampPosition(this.preferredPosition, size);
            if (overlapArea(rectFromPosition(preferred, size), noteRect) < 24) {
                return preferred;
            }

            candidates.push(preferred);
        }

        candidates.push(
            { x: noteRect.right + gap, y: noteRect.top - 8 },
            { x: noteRect.right + gap, y: noteRect.bottom - size.height },
            { x: noteRect.left - size.width - gap, y: noteRect.top - 8 },
            { x: noteRect.left - size.width - gap, y: noteRect.bottom - size.height },
            { x: noteRect.left, y: noteRect.bottom + gap },
            { x: noteRect.right - size.width, y: noteRect.bottom + gap },
            { x: noteRect.left, y: noteRect.top - size.height - gap },
            { x: noteRect.right - size.width, y: noteRect.top - size.height - gap }
        );

        let bestPosition = this.clampPosition(candidates[0], size);
        let bestScore = Number.POSITIVE_INFINITY;

        candidates.forEach((candidate) => {
            const position = this.clampPosition(candidate, size);
            const score = this.scorePosition(position, size, noteRect);
            if (score < bestScore) {
                bestScore = score;
                bestPosition = position;
            }
        });

        return bestPosition;
    }

    scorePosition(position, size, noteRect) {
        const previewRect = rectFromPosition(position, size);
        const overlap = overlapArea(previewRect, noteRect);
        const noteCenterX = noteRect.left + noteRect.width / 2;
        const noteCenterY = noteRect.top + noteRect.height / 2;
        const previewCenterX = previewRect.left + previewRect.width / 2;
        const previewCenterY = previewRect.top + previewRect.height / 2;
        const distance = Math.hypot(noteCenterX - previewCenterX, noteCenterY - previewCenterY);

        return overlap * 50 + distance;
    }

    measureWindow() {
        const width = this.window ? this.window.offsetWidth : 464;
        const height = this.window ? this.window.offsetHeight : 352;
        return { width, height };
    }

    clampPosition(position, size) {
        const padding = 16;
        return {
            x: clamp(position.x, padding, window.innerWidth - size.width - padding),
            y: clamp(position.y, padding, window.innerHeight - size.height - padding)
        };
    }

    applyPosition(position) {
        if (!this.window) {
            return;
        }

        const safePosition = this.clampPosition(position, this.measureWindow());
        this.window.style.left = `${safePosition.x}px`;
        this.window.style.top = `${safePosition.y}px`;
    }

    startDrag(event) {
        if (!this.window || !this.dragHandle) {
            return;
        }

        if (event.button !== 0) {
            return;
        }

        const target = event.target;
        if (target instanceof HTMLElement && target.closest("button, a")) {
            return;
        }

        const rect = this.window.getBoundingClientRect();
        this.dragState = {
            pointerId: event.pointerId,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
        };

        this.previewHovered = true;
        this.clearCloseTimer();
        this.window.classList.add("is-dragging");
        this.dragHandle.setPointerCapture(event.pointerId);
        this.dragHandle.addEventListener("pointermove", this.handleDragMove);
        this.dragHandle.addEventListener("pointerup", this.handleDragEnd);
        this.dragHandle.addEventListener("pointercancel", this.handleDragEnd);
    }

    handleDragMove = (event) => {
        if (!this.dragState || !this.window) {
            return;
        }

        const size = this.measureWindow();
        const nextPosition = this.clampPosition(
            {
                x: event.clientX - this.dragState.offsetX,
                y: event.clientY - this.dragState.offsetY
            },
            size
        );

        this.applyPosition(nextPosition);
    };

    handleDragEnd = (event) => {
        if (!this.dragState || !this.window || !this.dragHandle) {
            return;
        }

        const rect = this.window.getBoundingClientRect();
        this.preferredPosition = { x: rect.left, y: rect.top };
        this.storage.write(STORAGE_KEYS.previewPosition, this.preferredPosition);

        this.dragHandle.releasePointerCapture(this.dragState.pointerId);
        this.dragHandle.removeEventListener("pointermove", this.handleDragMove);
        this.dragHandle.removeEventListener("pointerup", this.handleDragEnd);
        this.dragHandle.removeEventListener("pointercancel", this.handleDragEnd);
        this.window.classList.remove("is-dragging");
        this.dragState = null;

        this.previewHovered = this.isPointInsidePreview(event.clientX, event.clientY);

        if (!this.previewHovered) {
            this.scheduleClose();
        }
    };

    scheduleClose() {
        this.clearCloseTimer();

        if (this.pointerNote || this.previewHovered) {
            return;
        }

        this.closeTimer = window.setTimeout(() => {
            if (!this.pointerNote && !this.previewHovered) {
                this.hidePreview();
            }
        }, 220);
    }

    clearCloseTimer() {
        window.clearTimeout(this.closeTimer);
    }

    cancelPendingIntent() {
        window.clearTimeout(this.hoverTimer);
        window.clearTimeout(this.preloadTimer);
        window.clearTimeout(this.loadTimer);
        this.pendingRequest = null;
    }

    hidePreview() {
        this.cancelPendingIntent();
        this.clearCloseTimer();
        this.pointerNote = null;
        this.previewHovered = false;
        this.activeNote = null;
        this.currentUrl = "";

        if (!this.window || !this.frame) {
            return;
        }

        this.concealWindow();
        this.frame.src = "about:blank";
    }

    concealWindow() {
        if (!this.window) {
            return;
        }

        this.window.classList.remove("is-open");
        this.window.setAttribute("aria-hidden", "true");
        this.activeNote = null;
    }

    handleViewportChange() {
        if (!this.isEnabled()) {
            this.hidePreview();
            return;
        }

        if (this.window?.classList.contains("is-open")) {
            const rect = this.window.getBoundingClientRect();
            this.applyPosition({ x: rect.left, y: rect.top });
        }
    }

    readPreferredPosition() {
        const stored = this.storage.read(STORAGE_KEYS.previewPosition);
        if (!stored || typeof stored.x !== "number" || typeof stored.y !== "number") {
            return null;
        }

        return stored;
    }

    isPointInsidePreview(clientX, clientY) {
        if (!this.window) {
            return false;
        }

        const element = document.elementFromPoint(clientX, clientY);
        return Boolean(element && this.window.contains(element));
    }
}

function rectFromPosition(position, size) {
    return {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        right: position.x + size.width,
        bottom: position.y + size.height
    };
}

function overlapArea(a, b) {
    const overlapWidth = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const overlapHeight = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return overlapWidth * overlapHeight;
}

function safeHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
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

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

new StickyBoardApp().init();
