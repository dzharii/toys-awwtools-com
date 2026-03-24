import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const catalogPath = fileURLToPath(new URL("../catalog-generated.json", import.meta.url));
const indexPath = fileURLToPath(new URL("../index.html", import.meta.url));

const raw = await readFile(catalogPath, "utf8");
const catalog = JSON.parse(raw);

const { siteMeta, categories, evidenceMeta, games } = catalog;

const countsByEvidence = games.reduce((acc, game) => {
    acc[game.evidence] = (acc[game.evidence] ?? 0) + 1;
    return acc;
}, {});

const categoryMap = new Map(categories.map((category) => [category.key, category]));

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function noteMarkup(game, indexInCategory) {
    const category = categoryMap.get(game.category);
    const evidence = evidenceMeta[game.evidence];
    const tags = Array.isArray(game.tags) ? game.tags : [];
    const visibleTags = tags.slice(0, 3);
    const noteId = `note-${game.id}`;
    const titleId = `title-${game.id}`;
    const detailsId = `details-${game.id}`;
    const regionLabel = game.productUrl.includes("nintendo.com")
        ? game.productUrl.includes("/au/")
            ? "Official page (AU)"
            : "Official page"
        : "Official site";

    return `                    <article
                        class="note"
                        id="${escapeHtml(noteId)}"
                        data-guid="${escapeHtml(game.id)}"
                        data-category="${escapeHtml(game.category)}"
                        data-evidence="${escapeHtml(game.evidence)}"
                        data-tags="${escapeHtml(tags.join(" "))}"
                        data-year="${escapeHtml(game.releaseYear ?? "")}"
                        aria-labelledby="${escapeHtml(titleId)}"
                    >
                        <div class="note-surface">
                            <div class="note-media">
                                <img
                                    src="${escapeHtml(game.imagePath)}"
                                    alt="Artwork for ${escapeHtml(game.title)}"
                                    loading="${indexInCategory < 2 ? "eager" : "lazy"}"
                                >
                                <span class="evidence-badge evidence-badge--${escapeHtml(game.evidence.toLowerCase())}" title="${escapeHtml(evidence.label)}">
                                    ${escapeHtml(evidence.shortLabel)}
                                </span>
                            </div>
                            <header class="note-head">
                                <p class="note-eyebrow">${escapeHtml(category.label)}</p>
                                <h3 class="note-title" id="${escapeHtml(titleId)}">${escapeHtml(game.title)}</h3>
                                <p class="note-meta">
                                    <span>${escapeHtml(String(game.releaseYear ?? ""))}</span>
                                    <span>${escapeHtml(evidence.label)}</span>
                                </p>
                            </header>
                            <div class="note-body">
                                <p class="note-summary">${escapeHtml(game.summary)}</p>
                                <p class="note-angle">${escapeHtml(game.angle)}</p>
                            </div>
                            <div class="note-tags" aria-label="Tags">
${visibleTags
    .map((tag) => `                                <span class="note-tag">${escapeHtml(tag)}</span>`)
    .join("\n")}
                            </div>
                            <p class="note-links">
                                <a href="${escapeHtml(game.productUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(regionLabel)}</a>
                                <a href="./deep-research-report.pdf" target="_blank" rel="noreferrer noopener">Research PDF</a>
                                <a href="${escapeHtml(game.imageAttributionUrl)}" target="_blank" rel="noreferrer noopener">Image source</a>
                            </p>
                            <p class="note-credit">Image from <a href="${escapeHtml(game.imageAttributionUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(game.imageAttributionLabel)}</a>.</p>
                            <div class="note-actions js-only">
                                <button type="button" class="note-button bookmark-toggle" data-action="bookmark" aria-pressed="false">
                                    Bookmark
                                </button>
                                <button
                                    type="button"
                                    class="note-button note-button--ghost expand-toggle"
                                    data-action="expand"
                                    aria-controls="${escapeHtml(detailsId)}"
                                    aria-expanded="false"
                                >
                                    Show details
                                </button>
                            </div>
                            <div class="note-details" id="${escapeHtml(detailsId)}">
${game.details
    .map((paragraph) => `                                <p>${escapeHtml(paragraph)}</p>`)
    .join("\n")}
                                <p class="note-evidence-copy"><strong>${escapeHtml(evidence.label)}.</strong> ${escapeHtml(evidence.summary)}</p>
                            </div>
                        </div>
                    </article>`;
}

function sectionMarkup(category) {
    const sectionGames = games.filter((game) => game.category === category.key);

    return `            <section
                class="board-section"
                data-category-key="${escapeHtml(category.key)}"
                data-category-label="${escapeHtml(category.label)}"
                data-category-description="${escapeHtml(category.summary)}"
                aria-labelledby="category-${escapeHtml(category.key)}"
            >
                <header class="section-header">
                    <p class="section-kicker">${escapeHtml(category.kicker)}</p>
                    <h2 id="category-${escapeHtml(category.key)}">${escapeHtml(category.label)}</h2>
                    <p class="section-summary">${escapeHtml(category.summary)}</p>
                </header>
                <div class="notes-grid">
${sectionGames.map((game, index) => noteMarkup(game, index)).join("\n\n")}
                </div>
            </section>`;
}

const legendMarkup = Object.entries(evidenceMeta)
    .map(
        ([key, value]) => `                <article class="legend-card legend-card--${escapeHtml(key.toLowerCase())}">
                    <p class="legend-grade">${escapeHtml(value.label)}</p>
                    <p>${escapeHtml(value.summary)}</p>
                </article>`
    )
    .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(siteMeta.title)}</title>
    <meta name="description" content="${escapeHtml(siteMeta.description)}">
    <link rel="icon" href="./icons/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="./icons/favicon-32.png" sizes="32x32" type="image/png">
    <link rel="shortcut icon" href="./icons/favicon.ico">
    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">
    <link rel="manifest" href="./site.webmanifest">
    <link rel="stylesheet" href="./style.css">
    <script>document.documentElement.classList.add('js');</script>
</head>
<body>
    <a class="skip-link" href="#board">Skip to board</a>
    <div class="page-shell">
        <header class="hero">
            <div class="hero-copy">
                <p class="hero-kicker">${escapeHtml(siteMeta.heroKicker)}</p>
                <h1>${escapeHtml(siteMeta.heroTitle)}</h1>
                <p class="hero-summary">${escapeHtml(siteMeta.heroSummary)}</p>
            </div>
            <div class="hero-card" aria-label="Board summary">
                <p class="hero-card-title">${escapeHtml(siteMeta.heroCardTitle)}</p>
                <dl class="hero-stats">
                    <div>
                        <dt>Skill areas</dt>
                        <dd id="hero-area-count">${categories.length}</dd>
                    </div>
                    <div>
                        <dt>Games</dt>
                        <dd id="hero-note-count">${games.length}</dd>
                    </div>
                    <div>
                        <dt>Evidence mix</dt>
                        <dd>${countsByEvidence.A}/${countsByEvidence.B}/${countsByEvidence.C}</dd>
                    </div>
                </dl>
                <p class="hero-card-copy">${escapeHtml(siteMeta.heroCardCopy)}</p>
            </div>
        </header>

        <section class="legend-strip" aria-labelledby="legend-title">
            <div class="legend-head">
                <h2 id="legend-title">Evidence guide</h2>
                <p>The board separates direct practice from plausible but weaker transfer claims.</p>
            </div>
            <div class="legend-grid">
${legendMarkup}
            </div>
        </section>

        <aside class="control-bar" aria-label="Board tools">
            <div class="controls-grid js-only">
                <section class="control-cluster control-cluster--search" aria-labelledby="search-heading">
                    <div class="cluster-head">
                        <h2 id="search-heading">Search</h2>
                        <p>Search summaries, details, tags, and years.</p>
                    </div>
                    <label class="search-field" for="search-input">
                        <span class="visually-hidden">Search notes</span>
                        <input
                            id="search-input"
                            name="search"
                            type="search"
                            autocomplete="off"
                            placeholder="Search by mechanic, skill angle, or title"
                        >
                    </label>
                    <div class="cluster-actions">
                        <label class="check-row" for="hide-non-matches">
                            <input id="hide-non-matches" type="checkbox" disabled>
                            <span>Hide non-matches</span>
                        </label>
                        <button type="button" class="toolbar-button toolbar-button--ghost" id="clear-search" hidden>Clear</button>
                    </div>
                </section>

                <section class="control-cluster" aria-labelledby="category-heading">
                    <div class="cluster-head">
                        <h2 id="category-heading">Category</h2>
                        <p>Filter by the kind of practice the game supports.</p>
                    </div>
                    <details class="filter-panel" id="category-panel">
                        <summary>
                            <span>Skill areas</span>
                            <strong id="category-summary">All categories</strong>
                        </summary>
                        <div class="filter-panel-body" id="category-options" role="group" aria-label="Categories"></div>
                    </details>
                </section>

                <section class="control-cluster" aria-labelledby="evidence-heading">
                    <div class="cluster-head">
                        <h2 id="evidence-heading">Evidence</h2>
                        <p>Separate direct practice from softer recommendations.</p>
                    </div>
                    <details class="filter-panel" id="evidence-panel">
                        <summary>
                            <span>Evidence grades</span>
                            <strong id="evidence-summary">All evidence</strong>
                        </summary>
                        <div class="filter-panel-body" id="evidence-options" role="group" aria-label="Evidence grades"></div>
                    </details>
                </section>

                <section class="control-cluster control-cluster--utility" aria-labelledby="utility-heading">
                    <div class="cluster-head">
                        <h2 id="utility-heading">Saved view</h2>
                        <p>Bookmark games, reset the board, or expand visible notes.</p>
                    </div>
                    <div class="cluster-actions cluster-actions--wrap">
                        <button type="button" class="toolbar-button" id="favorites-scope" aria-pressed="false">
                            Bookmarks <span id="favorites-count">0</span>/10
                        </button>
                        <button type="button" class="toolbar-button toolbar-button--ghost" id="reset-view">Reset</button>
                        <button type="button" class="toolbar-button toolbar-button--ghost" id="expand-visible">Expand</button>
                        <button type="button" class="toolbar-button toolbar-button--ghost" id="collapse-visible">Collapse</button>
                    </div>
                </section>
            </div>

            <div class="live-row js-only" aria-live="polite">
                <div id="active-filters" class="active-filters" aria-label="Active filters"></div>
                <p id="scope-summary" class="scope-summary">Showing all games.</p>
            </div>
            <p id="app-message" class="app-message js-only" role="status" aria-live="polite" hidden></p>
            <p class="fallback-note">Without JavaScript, the full editorial board remains readable as a static reference.</p>
        </aside>

        <section id="search-results" class="search-results js-only" aria-labelledby="search-results-title" hidden>
            <div class="results-head">
                <h2 id="search-results-title">Search results</h2>
                <p id="search-results-copy"></p>
            </div>
            <ol id="search-results-list" class="results-list"></ol>
        </section>

        <main id="board" class="board" aria-label="Nintendo Switch skill board">
            <p id="board-empty" class="board-empty js-only" hidden></p>
${categories.map((category) => sectionMarkup(category)).join("\n\n")}
        </main>

        <footer class="page-footer">
            <p>${escapeHtml(siteMeta.footerSummary)}</p>
            <p class="footer-links">
                <a href="./readme.md" target="_blank" rel="noreferrer noopener">Project README</a>
                <a href="./implementation-notes.md" target="_blank" rel="noreferrer noopener">Implementation notes</a>
                <a href="./deep-research-report.md" target="_blank" rel="noreferrer noopener">Research notes</a>
            </p>
        </footer>
    </div>

    <script type="module" src="./app.js"></script>
</body>
</html>
`;

await writeFile(indexPath, html);
console.log(`Wrote ${indexPath}`);
