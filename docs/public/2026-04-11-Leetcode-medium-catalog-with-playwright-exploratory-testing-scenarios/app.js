(function () {
  "use strict";

  const dataset = window.PROBLEM_DATA;
  const guideLibrary = window.TOPIC_GUIDES || {};
  const problems = dataset.problems.map(enrichProblem);
  const phaseOrder = dataset.phases.map((phase) => phase.id);
  const conceptOptions = Array.from(new Set(problems.flatMap((problem) => problem.concepts))).sort();
  const clarityOptions = ["very-clear", "clear", "moderate"];
  const effortOptions = ["light", "moderate", "stretch"];

  const quickViews = [
    {
      id: "best-start",
      title: "Good first Mediums",
      note: "Clear, transition-friendly, bounded effort.",
      apply() {
        resetFilters();
        state.filters.clarity = ["very-clear", "clear"];
        state.filters.effort = ["light", "moderate"];
        state.filters.transition = ["prime"];
      },
    },
    {
      id: "bfs-grid",
      title: "BFS and grid work",
      note: "Approachable graph practice with strong pattern payoff.",
      apply() {
        resetFilters();
        state.filters.concepts = ["bfs"];
      },
    },
    {
      id: "linked-list",
      title: "Linked-list control",
      note: "Pointer hygiene without weird stories.",
      apply() {
        resetFilters();
        state.filters.phases = ["linked-lists"];
      },
    },
    {
      id: "dp-ramp",
      title: "Intro DP ramp",
      note: "Manageable state design before heavier DP.",
      apply() {
        resetFilters();
        state.filters.phases = ["dp"];
      },
    },
    {
      id: "local-support",
      title: "Strong local support",
      note: "Prefer problems backed by multiple local repos.",
      apply() {
        resetFilters();
        state.filters.toggles.localSupportOnly = true;
      },
    },
    {
      id: "newer-gems",
      title: "Newer gems",
      note: "Readable later problems that still teach useful patterns.",
      apply() {
        resetFilters();
        state.filters.toggles.newerGemOnly = true;
      },
    },
  ];

  const roadmapRows = [
    { id: "foundation", label: "Foundations" },
    { id: "linked-list", label: "Linked Lists" },
    { id: "tree", label: "Trees" },
    { id: "graph-bfs", label: "Graph / BFS" },
    { id: "graph-logic", label: "Graph Logic" },
    { id: "state-search", label: "Backtracking" },
    { id: "dp", label: "DP" },
  ];

  const storage = createStorage("medium-leetcode-explorer.v3");
  let state = loadState();
  let lastWorkspaceSignature = null;
  let lastSelectedId = null;
  const uiState = {
    inlineLanguageByProblem: {},
    openSolutionSpoilers: {},
    loadingSolutions: {},
    solutionErrors: {},
  };
  const solutionState = {
    open: false,
    problemId: null,
    loading: false,
    error: "",
    cache: {},
    selectedLanguageId: null,
    selectedSourceId: null,
  };

  const els = {
    quickViews: document.querySelector("#sidebar-quick-views"),
    guides: document.querySelector("#sidebar-guides"),
    phaseFilters: document.querySelector("#phase-filters"),
    conceptFilters: document.querySelector("#concept-filters"),
    clarityFilters: document.querySelector("#clarity-filters"),
    effortFilters: document.querySelector("#effort-filters"),
    toggleFilters: document.querySelector("#toggle-filters"),
    metricTotal: document.querySelector("#metric-total"),
    metricSolved: document.querySelector("#metric-solved"),
    metricPinned: document.querySelector("#metric-pinned"),
    metricRepos: document.querySelector("#metric-repos"),
    searchInput: document.querySelector("#search-input"),
    sortSelect: document.querySelector("#sort-select"),
    compactToggle: document.querySelector("#compact-toggle"),
    pickNextButton: document.querySelector("#pick-next-button"),
    resetFiltersButton: document.querySelector("#reset-filters-button"),
    clearStateButton: document.querySelector("#clear-state-button"),
    heroRecommendations: document.querySelector("#hero-recommendations"),
    guideStripLinks: document.querySelector("#guide-strip-links"),
    activeFilterBar: document.querySelector("#active-filter-bar"),
    listCount: document.querySelector("#list-count"),
    listStatus: document.querySelector("#list-status"),
    featuredPicks: document.querySelector("#featured-picks"),
    catalogScroll: document.querySelector("#catalog-scroll"),
    phaseGroups: document.querySelector("#phase-groups"),
    toggleDetailWidth: document.querySelector("#toggle-detail-width"),
    detailScroll: document.querySelector("#detail-scroll"),
    detailContent: document.querySelector("#detail-content"),
    roadmapSvg: document.querySelector("#roadmap-svg"),
    roadmapTooltip: document.querySelector("#roadmap-tooltip"),
    roadmapContext: document.querySelector("#roadmap-context"),
    solutionDialog: document.querySelector("#solution-dialog"),
    solutionDialogTitle: document.querySelector("#solution-dialog-title"),
    solutionDialogSubtitle: document.querySelector("#solution-dialog-subtitle"),
    solutionDialogStatus: document.querySelector("#solution-dialog-status"),
    solutionLanguageTabs: document.querySelector("#solution-language-tabs"),
    solutionSourceTabs: document.querySelector("#solution-source-tabs"),
    solutionAttribution: document.querySelector("#solution-attribution"),
    solutionReview: document.querySelector("#solution-review"),
    solutionWriteups: document.querySelector("#solution-writeups"),
    solutionCode: document.querySelector("#solution-code"),
    solutionCopyCode: document.querySelector("#solution-copy-code"),
    solutionDialogClose: document.querySelector("#solution-dialog-close"),
  };

  init();

  function init() {
    if (window.location.hash) {
      const hashId = window.location.hash.slice(1);
      if (problems.some((problem) => problem.id === hashId)) state.selectedId = hashId;
    }

    els.metricTotal.textContent = String(problems.length);
    els.metricRepos.textContent = String(
      new Set(problems.flatMap((problem) => problem.repoCoverage.map((coverage) => coverage.repository))).size,
    );
    els.searchInput.value = state.filters.search;
    els.sortSelect.value = state.sort;
    els.compactToggle.checked = state.compact;
    els.toggleDetailWidth.textContent = state.detailExpanded ? "Normal split" : "Widen reading";

    renderSidebar();
    bindEvents();
    render();
  }

  function bindEvents() {
    els.searchInput.addEventListener("input", (event) => {
      state.filters.search = event.target.value.trim();
      state.activeQuickView = null;
      render();
    });

    els.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });

    els.compactToggle.addEventListener("change", (event) => {
      state.compact = event.target.checked;
      render();
    });

    els.pickNextButton.addEventListener("click", () => {
      const candidate = chooseBestNext(getFilteredProblems()) || chooseBestNext(problems);
      if (!candidate) return;
      state.selectedId = candidate.id;
      render();
      scrollDetailIntoView();
    });

    els.resetFiltersButton.addEventListener("click", () => {
      resetFilters();
      state.activeQuickView = null;
      els.searchInput.value = "";
      render();
    });

    els.clearStateButton.addEventListener("click", () => {
      if (!window.confirm("Clear solved state, pins, notes, and filters?")) return;
      storage.clearAll();
      state = defaultState();
      els.searchInput.value = "";
      els.sortSelect.value = state.sort;
      els.compactToggle.checked = state.compact;
      renderSidebar();
      render();
    });

    els.toggleDetailWidth.addEventListener("click", () => {
      state.detailExpanded = !state.detailExpanded;
      render();
    });

    els.solutionDialogClose.addEventListener("click", closeSolutionDialog);
    els.solutionCopyCode.addEventListener("click", copyActiveSolutionCode);
    els.solutionDialog.querySelectorAll("[data-close-solutions]").forEach((element) => {
      element.addEventListener("click", closeSolutionDialog);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && solutionState.open) {
        closeSolutionDialog();
      }
    });
  }

  function renderSidebar() {
    els.quickViews.innerHTML = quickViews
      .map(
        (view) => `
          <button class="sidebar-button" type="button" data-quick-view="${view.id}" data-active="${state.activeQuickView === view.id}">
            <strong>${escapeHtml(view.title)}</strong>
            <span>${escapeHtml(view.note)}</span>
          </button>
        `,
      )
      .join("");
    els.quickViews.querySelectorAll("[data-quick-view]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.quickView;
        if (state.activeQuickView === id) {
          resetFilters();
          state.activeQuickView = null;
        } else {
          quickViews.find((view) => view.id === id)?.apply();
          state.activeQuickView = id;
        }
        els.searchInput.value = state.filters.search;
        render();
        renderSidebar();
      });
    });

    els.guides.innerHTML = dataset.topicGuides
      .map(
        (guide) => `
          <a class="guide-link" href="${guide.path}">
            <strong>${escapeHtml(guide.title)}</strong>
            <span>${escapeHtml(getGuideSummary(guide, 72))}</span>
          </a>
        `,
      )
      .join("");
  }

  function render() {
    const previousWorkspaceSignature = lastWorkspaceSignature;
    const previousSelectedId = lastSelectedId;

    persistState();
    renderSidebar();
    renderMetrics();
    renderAdvancedFilters();
    renderRecommendations();
    renderGuideGrid();
    renderFilterSummary();
    renderFeatured();
    renderCatalog();
    renderDetail();
    renderRoadmap();
    renderSolutionDialog();
    updateTestingState();
    syncWorkspaceScroll(previousWorkspaceSignature, previousSelectedId);
    lastWorkspaceSignature = getWorkspaceSignature();
    lastSelectedId = state.selectedId;
    els.toggleDetailWidth.textContent = state.detailExpanded ? "Normal split" : "Widen reading";
    els.toggleDetailWidth.setAttribute("aria-pressed", String(state.detailExpanded));
  }

  function renderMetrics() {
    els.metricSolved.textContent = String(state.solved.length);
    els.metricPinned.textContent = String(state.pinned.length);
  }

  function renderAdvancedFilters() {
    renderTokenSet(
      els.phaseFilters,
      dataset.phases.map((phase) => ({ id: phase.id, label: phase.shortName })),
      state.filters.phases,
      (value) => {
        toggleInArray(state.filters.phases, value);
        state.activeQuickView = null;
        renderSidebar();
        render();
      },
    );

    renderTokenSet(
      els.conceptFilters,
      conceptOptions.map((concept) => ({ id: concept, label: toLabel(concept) })),
      state.filters.concepts,
      (value) => {
        toggleInArray(state.filters.concepts, value);
        state.activeQuickView = null;
        renderSidebar();
        render();
      },
    );

    renderTokenSet(
      els.clarityFilters,
      clarityOptions.map((item) => ({ id: item, label: toLabel(item) })),
      state.filters.clarity,
      (value) => {
        toggleInArray(state.filters.clarity, value);
        state.activeQuickView = null;
        renderSidebar();
        render();
      },
    );

    renderTokenSet(
      els.effortFilters,
      effortOptions.map((item) => ({ id: item, label: toLabel(item) })),
      state.filters.effort,
      (value) => {
        toggleInArray(state.filters.effort, value);
        state.activeQuickView = null;
        renderSidebar();
        render();
      },
    );

    const toggleDefs = [
      ["starterOnly", "Starters"],
      ["newerGemOnly", "Newer gems"],
      ["classicOnly", "Classics"],
      ["localSupportOnly", "4+ repos"],
      ["pinnedOnly", "Pinned"],
      ["unsolvedOnly", "Unsolved"],
      ["solvedOnly", "Solved"],
    ];
    els.toggleFilters.innerHTML = toggleDefs
      .map(
        ([key, label]) => `
          <button class="token" type="button" data-toggle-filter="${key}" data-active="${Boolean(state.filters.toggles[key])}">
            ${escapeHtml(label)}
          </button>
        `,
      )
      .join("");
    els.toggleFilters.querySelectorAll("[data-toggle-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.toggleFilter;
        state.filters.toggles[key] = !state.filters.toggles[key];
        if (key === "solvedOnly" && state.filters.toggles[key]) state.filters.toggles.unsolvedOnly = false;
        if (key === "unsolvedOnly" && state.filters.toggles[key]) state.filters.toggles.solvedOnly = false;
        state.activeQuickView = null;
        renderSidebar();
        render();
      });
    });
  }

  function renderTokenSet(container, items, activeValues, onToggle) {
    container.innerHTML = items
      .map(
        (item) => `
          <button class="token" type="button" data-token="${item.id}" data-active="${activeValues.includes(item.id)}">
            ${escapeHtml(item.label)}
          </button>
        `,
      )
      .join("");
    container.querySelectorAll("[data-token]").forEach((button) => {
      button.addEventListener("click", () => onToggle(button.dataset.token));
    });
  }

  function renderRecommendations() {
    const source = getFilteredProblems();
    const candidates = source.length ? source : problems;
    const primary = chooseBestNext(candidates);
    const alternatives = [
      {
        label: "If you want the clearest on-ramp",
        problem: chooseBestNext(candidates.filter((problem) => problem.starter && problem.clarity !== "moderate")),
      },
      {
        label: "If you want stronger repo support",
        problem: chooseBestNext(candidates.filter((problem) => problem.repoCount >= 4)),
      },
      {
        label: "If you want something newer",
        problem: chooseBestNext(candidates.filter((problem) => problem.newerGem)),
      },
    ]
      .filter((item) => item.problem && item.problem.id !== primary?.id)
      .slice(0, 2);

    if (!primary) {
      els.heroRecommendations.innerHTML = '<p class="empty-state">No recommendation is available under the current view.</p>';
      return;
    }

    els.heroRecommendations.innerHTML = `
      <article class="recommendation-primary recommendation-card" data-testid="recommendation-card">
        <div class="recommendation-main-head">
          <div>
            <p class="recommendation-label">Do this now</p>
            <h3>#${primary.number} ${escapeHtml(primary.title)}</h3>
          </div>
          <div class="problem-meta">
            ${metaPill(primary.phase.shortName)}
            ${metaPill(labelForClarity(primary.clarity), "accent")}
            ${metaPill(`${primary.repoCount} repos`, primary.repoCount >= 4 ? "success" : "")}
          </div>
        </div>
        <p class="recommendation-summary">${escapeHtml(primary.whySolve)}</p>
        <div class="recommendation-rationale">
          <span><strong>Landscape</strong> ${escapeHtml(primary.phase.name)}</span>
          <span><strong>What it builds</strong> ${escapeHtml(primary.whatYouPractice)}</span>
        </div>
        <div class="detail-badges">
          <button class="mini-link" type="button" data-select-problem="${primary.id}">Inspect detail</button>
          <a class="mini-link" href="${primary.leetcodeUrl}" target="_blank" rel="noreferrer">LeetCode</a>
        </div>
      </article>
      <div class="recommendation-secondary-list">
        ${alternatives
          .map(
            ({ label, problem }) => `
              <article class="recommendation-secondary recommendation-card" data-testid="recommendation-card">
                <p class="recommendation-label">${escapeHtml(label)}</p>
                <h3>#${problem.number} ${escapeHtml(problem.title)}</h3>
                <p>${escapeHtml(problem.overview)}</p>
                <div class="problem-meta">
                  ${metaPill(problem.phase.shortName)}
                  ${problem.topicGuides[0] ? metaPill(problem.topicGuides[0].title, "accent") : ""}
                </div>
                <div class="detail-badges">
                  <button class="mini-link" type="button" data-select-problem="${problem.id}">Inspect</button>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
    bindProblemSelectors(els.heroRecommendations);
  }

  function renderGuideGrid() {
    const guides = dataset.topicGuides.slice(0, 4);
    els.guideStripLinks.innerHTML = guides
      .map(
        (guide) => `
          <a class="guide-link" href="${guide.path}" data-testid="guide-link">
            <strong>${escapeHtml(guide.title)}</strong>
            <span>${escapeHtml(getGuideSummary(guide, 72))}</span>
          </a>
        `,
      )
      .join("");
  }

  function renderFilterSummary() {
    const pills = [];
    if (state.activeQuickView) {
      const quick = quickViews.find((view) => view.id === state.activeQuickView);
      if (quick) pills.push(quick.title);
    }
    if (state.filters.search) pills.push(`Search: ${state.filters.search}`);
    state.filters.phases.forEach((phase) => pills.push(labelForPhase(phase)));
    state.filters.concepts.forEach((concept) => pills.push(toLabel(concept)));
    state.filters.clarity.forEach((clarity) => pills.push(labelForClarity(clarity)));
    state.filters.effort.forEach((effort) => pills.push(labelForEffort(effort)));
    Object.entries(state.filters.toggles)
      .filter(([, value]) => value)
      .forEach(([key]) => pills.push(toggleLabel(key)));
    if (state.filters.roadmapLane) {
      pills.push(roadmapRows.find((row) => row.id === state.filters.roadmapLane)?.label || state.filters.roadmapLane);
    }
    els.activeFilterBar.innerHTML = pills.length
      ? pills.map((pill) => metaPill(pill, "accent")).join("")
      : `<span class="summary-copy">All curated Mediums are visible.</span>`;
  }

  function renderFeatured() {
    const filtered = getFilteredProblems();
    const source = filtered.length ? filtered : problems;
    const cards = [
      {
        label: "If you want BFS or grids",
        problem: chooseBestNext(source.filter((problem) => problem.concepts.includes("bfs") || problem.concepts.includes("grid"))),
      },
      {
        label: "If you want linked lists",
        problem: chooseBestNext(source.filter((problem) => problem.phase.id === "linked-lists")),
      },
    ].filter((item) => item.problem);

    els.featuredPicks.innerHTML = cards
      .map(
        ({ label, problem }) => `
          <article class="featured-card" data-testid="featured-card">
            <p class="featured-label">${escapeHtml(label)}</p>
            <h3>#${problem.number} ${escapeHtml(problem.title)}</h3>
            <p>${escapeHtml(problem.overview)}</p>
            <div class="detail-badges">
              <button class="mini-link" type="button" data-select-problem="${problem.id}">Open detail</button>
              ${problem.topicGuides
                .slice(0, 1)
                .map((guide) => `<a class="mini-link" href="${guide.path}">${escapeHtml(guide.title)}</a>`)
                .join("")}
            </div>
          </article>
        `,
      )
      .join("");
    bindProblemSelectors(els.featuredPicks);
  }

  function renderCatalog() {
    const filtered = getFilteredProblems();
    els.listCount.textContent = `${filtered.length} visible`;
    els.listStatus.textContent = `${filtered.filter((problem) => isSolved(problem.id)).length} solved in view`;

    if (!filtered.length) {
      els.phaseGroups.innerHTML =
        '<p class="empty-state">No problems match the current filters. Reset or loosen the current view.</p>';
      return;
    }

    if (!filtered.some((problem) => problem.id === state.selectedId)) {
      state.selectedId = filtered[0].id;
    }

    const grouped = new Map(dataset.phases.map((phase) => [phase.id, []]));
    filtered.forEach((problem) => grouped.get(problem.phase.id)?.push(problem));
    const selected = filtered.find((problem) => problem.id === state.selectedId) || filtered[0];
    const sparseAlternatives = selected ? getNearbyAlternatives(selected) : [];
    const totalsByPhase = new Map(dataset.phases.map((phase) => [phase.id, problems.filter((problem) => problem.phase.id === phase.id).length]));

    els.phaseGroups.innerHTML = dataset.phases
      .map((phase) => {
        const items = grouped.get(phase.id) || [];
        if (!items.length) return "";
        const active = selected?.phase.id === phase.id;
        return `
          <section class="phase-group" data-testid="phase-group" data-phase-id="${phase.id}" data-active="${active}" style="--phase-index:${phaseOrder.indexOf(phase.id)}">
            <div class="phase-group-head">
              <div>
                <p class="section-kicker">${escapeHtml(phase.shortName)}</p>
                <h3>${escapeHtml(phase.name)}</h3>
                <p class="phase-copy">${escapeHtml(phase.description)}</p>
              </div>
              <div class="phase-group-tools">
                <div class="phase-stats">
                  ${metaPill(`${items.length} in view`, active ? "accent" : "")}
                  ${metaPill(`${totalsByPhase.get(phase.id)} total`)}
                  ${metaPill(`${items.filter((problem) => problem.starter).length} starters`)}
                </div>
                <button class="mini-link" type="button" data-phase-route="${phase.id}">
                  ${state.filters.phases.includes(phase.id) ? "Clear stage filter" : "Focus this stage"}
                </button>
              </div>
            </div>
            <div class="phase-list">
              ${items.map((problem) => problemRow(problem)).join("")}
            </div>
          </section>
        `;
      })
      .join("");

    if (filtered.length <= 3) {
      els.phaseGroups.innerHTML += `
        <section class="catalog-helper-card" data-testid="catalog-helper-card">
          <p class="section-kicker">Focused view</p>
          <h3>${filtered.length === 1 ? "One strong match in view" : "Very small result set"}</h3>
          <p class="phase-copy">
            ${
              filtered.length === 1
                ? "This view is intentionally narrow. Use the detail pane to judge the current pick, or jump sideways to a nearby alternative without resetting the entire workspace."
                : "The current filters are highly selective. Keep this focused slice if the direction feels right, or widen the view if you want more comparison."
            }
          </p>
          <div class="topic-link-row">
            <button class="inline-link" type="button" data-reset-catalog="true">Reset filters</button>
            ${
              sparseAlternatives
                .slice(0, 3)
                .map((problem) => `<button class="inline-link" type="button" data-select-problem="${problem.id}">Try #${problem.number} ${escapeHtml(problem.title)}</button>`)
                .join("")
            }
          </div>
        </section>
      `;
    }

    els.phaseGroups.querySelectorAll("[data-problem-row]").forEach((row) => {
      row.addEventListener("click", (event) => {
        const action = event.target.closest("[data-row-action]");
        if (action) return;
        state.selectedId = row.dataset.problemRow;
        render();
      });
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          state.selectedId = row.dataset.problemRow;
          render();
        }
      });
    });

    els.phaseGroups.querySelectorAll("[data-row-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const problemId = button.dataset.problem;
        if (button.dataset.rowAction === "solved") toggleSolved(problemId);
        if (button.dataset.rowAction === "pin") togglePinned(problemId);
        render();
      });
    });

    els.phaseGroups.querySelectorAll("[data-phase-route]").forEach((button) => {
      button.addEventListener("click", () => {
        const phaseId = button.dataset.phaseRoute;
        state.filters.phases = state.filters.phases.length === 1 && state.filters.phases[0] === phaseId ? [] : [phaseId];
        state.activeQuickView = null;
        renderSidebar();
        render();
      });
    });

    bindProblemSelectors(els.phaseGroups);
    els.phaseGroups.querySelectorAll("[data-reset-catalog]").forEach((button) => {
      button.addEventListener("click", () => {
        resetFilters();
        state.activeQuickView = null;
        renderSidebar();
        render();
      });
    });
  }

  function problemRow(problem) {
    return `
      <article class="phase-row" data-testid="problem-row" data-problem-row="${problem.id}" data-selected="${problem.id === state.selectedId}" data-solved="${isSolved(problem.id)}" data-compact="${state.compact}" role="button" tabindex="0" aria-label="Open ${escapeHtml(problem.title)}">
        <div class="row-number">${problem.recommendedOrder}</div>
        <div class="row-main">
          <div class="row-head">
            <span class="row-id">#${problem.number}</span>
            <h4>${escapeHtml(problem.title)}</h4>
          </div>
          <div class="row-meta">
            <span><strong>Clarity</strong> ${escapeHtml(labelForClarity(problem.clarity))}</span>
            <span><strong>Effort</strong> ${escapeHtml(labelForEffort(problem.effort))}</span>
            <span><strong>Repos</strong> ${problem.repoCount}</span>
            <span><strong>Solutions</strong> ${problem.solutionSummary.solutionCount}</span>
            ${problem.newerGem ? "<span><strong>Signal</strong> newer gem</span>" : ""}
            ${problem.starter ? "<span><strong>Signal</strong> starter</span>" : ""}
          </div>
          ${state.compact ? "" : `<p class="row-summary">${escapeHtml(problem.whySolve)}</p>`}
        </div>
        <div class="row-actions">
          <button class="row-action" type="button" data-row-action="solved" data-problem="${problem.id}" data-active="${isSolved(problem.id)}">${isSolved(problem.id) ? "Solved" : "Mark"}</button>
          <button class="row-action" type="button" data-row-action="pin" data-problem="${problem.id}" data-active="${isPinned(problem.id)}">${isPinned(problem.id) ? "Pinned" : "Pin"}</button>
        </div>
      </article>
    `;
  }

  function renderDetail() {
    const selected = problems.find((problem) => problem.id === state.selectedId) || getFilteredProblems()[0];
    if (!selected) {
      els.detailContent.innerHTML = '<p class="empty-state">No problem selected.</p>';
      return;
    }

    state.selectedId = selected.id;
    if (window.location.hash.slice(1) !== selected.id) {
      window.history.replaceState(null, "", `#${selected.id}`);
    }

    const nearby = getNearbyAlternatives(selected);
    const learningResources = getLearningResources(selected);
    const phaseProblems = problems.filter((problem) => problem.phase.id === selected.phase.id).sort((a, b) => a.recommendedOrder - b.recommendedOrder);
    const phasePosition = phaseProblems.findIndex((problem) => problem.id === selected.id) + 1;
    const laneLabel = roadmapRows.find((row) => row.id === selected.roadmapRow)?.label || "Current lane";
    ensureSolutionPayload(selected.id);
    const solutionPayload = solutionState.cache[selected.id] || null;
    const solutionLoading = Boolean(uiState.loadingSolutions[selected.id]);
    const solutionError = uiState.solutionErrors[selected.id] || "";
    const activeLanguageId =
      uiState.inlineLanguageByProblem[selected.id] ||
      solutionPayload?.summary.primaryLanguageId ||
      solutionPayload?.languages[0]?.id ||
      null;
    const activeLanguage =
      solutionPayload?.languages.find((group) => group.id === activeLanguageId) || solutionPayload?.languages[0] || null;
    els.detailContent.innerHTML = `
      <header class="detail-header" data-testid="detail-header">
        <div>
          <p class="section-kicker">Selected problem</p>
          <div class="detail-path">
            <span class="detail-stage-chip">${escapeHtml(selected.phase.shortName)}</span>
            <span class="detail-path-copy">${escapeHtml(laneLabel)} lane · #${phasePosition} of ${phaseProblems.length} in this stage</span>
          </div>
          <h2 class="detail-title" data-testid="detail-title">#${selected.number} ${escapeHtml(selected.title)}</h2>
          <p class="detail-note">${escapeHtml(selected.overview)}</p>
        </div>
        <div class="detail-badges detail-header-badges">
          ${metaPill(selected.phase.shortName)}
          ${metaPill(labelForClarity(selected.clarity), "accent")}
          ${metaPill(labelForEffort(selected.effort))}
          ${selected.classic ? metaPill("classic") : ""}
          ${selected.newerGem ? metaPill("newer gem", "success") : ""}
        </div>
      </header>

      <div class="detail-badges" data-testid="detail-actions">
        <button id="detail-solved" class="inline-link" type="button" data-testid="detail-solved">${isSolved(selected.id) ? "Solved" : "Mark solved"}</button>
        <button id="detail-pinned" class="inline-link" type="button" data-testid="detail-pinned">${isPinned(selected.id) ? "Pinned" : "Pin problem"}</button>
        <a class="inline-link" href="${selected.leetcodeUrl}" target="_blank" rel="noreferrer" data-testid="detail-leetcode-link">Open LeetCode</a>
      </div>

      <article class="detail-section detail-emphasis" data-testid="detail-block">
          <h3>Solve this now because</h3>
          <p>${escapeHtml(selected.whySolve)}</p>
      </article>

      <article class="detail-section detail-stage-section">
        <h3>Where this sits in the field guide</h3>
        <p>
          This problem sits in <strong>${escapeHtml(selected.phase.name)}</strong> and currently maps to the
          <strong>${escapeHtml(laneLabel)}</strong> lane. Use it when you want a bounded step inside this stage rather
          than a jump into a new pattern family.
        </p>
        ${
          nearby.length
            ? `
              <div class="topic-link-row">
                ${nearby.map((problem) => `<button class="inline-link" type="button" data-select-problem="${problem.id}">Nearby: #${problem.number} ${escapeHtml(problem.title)}</button>`).join("")}
              </div>
            `
            : ""
        }
      </article>

      <div class="detail-grid" data-testid="detail-grid">
        <article class="detail-section" data-testid="detail-block">
          <h3>What it trains</h3>
          <p>${escapeHtml(selected.whatYouPractice)}</p>
        </article>
        <article class="detail-section" data-testid="detail-block">
          <h3>Mental model</h3>
          <p>${escapeHtml(selected.expectedMentalModel)}</p>
        </article>
        <article class="detail-section" data-testid="detail-block">
          <h3>Watch for</h3>
          <p>${escapeHtml(selected.caveat)}</p>
        </article>
        <article class="detail-section" data-testid="detail-block">
          <h3>Local support</h3>
          <p>${selected.repoCount} local repositories cover this problem, which makes it a stronger candidate for fast review after solving.</p>
        </article>
      </div>

      <article class="detail-section" data-testid="local-support-block">
        <h3>Local repository support</h3>
        <p>${selected.repoCount} local repositories contain this problem. ${selected.repoCoverage.some((coverage) => /readme|article|explanation/i.test(`${coverage.coverageType} ${coverage.notes}`)) ? "At least one source also includes explanation-style material." : "Most local support here is code-first."}</p>
      </article>

      <article class="detail-section detail-solution-summary" data-testid="solution-summary-block">
        <div class="solution-section-head">
          <div>
            <h3>Solution workspace</h3>
            <p>
              ${selected.solutionSummary.solutionCount} embedded implementations across ${selected.solutionSummary.languageLabels.length} languages.
              The default view stays non-spoiling; open a spoiler block only when you intentionally want full source.
            </p>
          </div>
          <div class="detail-badges">
            <button id="open-solutions" class="inline-link" type="button" data-testid="open-solutions">Open focused workspace</button>
          </div>
        </div>
        <div class="topic-link-row">
          ${selected.solutionSummary.languageLabels.map((label) => metaPill(label)).join("")}
        </div>
        ${renderInlineSolutions(selected, solutionPayload, activeLanguage, solutionLoading, solutionError)}
      </article>

      <section class="repo-grid" data-testid="repo-grid">
        ${selected.repoCoverage
          .map(
            (coverage, index) => `
              <article class="repo-card" data-testid="repo-card">
                <div class="repo-header">
                  <div>
                    <h3>${escapeHtml(coverage.repository)}</h3>
                    <p>${escapeHtml(coverage.notes)}</p>
                  </div>
                  <button class="copy-button" type="button" data-copy-index="${index}">Copy paths</button>
                </div>
                <div class="detail-badges">
                  ${metaPill(coverage.coverageType)}
                  ${metaPill(coverage.matchMode)}
                </div>
                <ul>
                  ${coverage.paths.map((path) => `<li><code>${escapeHtml(path)}</code></li>`).join("")}
                </ul>
                <p class="repo-footnote">These are original repository-relative paths. Full embedded source appears in the solution workspace above when available.</p>
              </article>
            `,
          )
          .join("")}
      </section>

      <article class="detail-section" data-testid="topic-guides-block">
        <h3>Topic guides</h3>
        <div class="topic-link-row">
          ${selected.topicGuides.map((guide) => `<a class="inline-link" href="${guide.path}">${escapeHtml(guide.title)}</a>`).join("")}
        </div>
      </article>

      ${
        learningResources.length
          ? `
            <article class="detail-section" data-testid="learning-resources-block">
              <h3>Technique reads</h3>
              <div class="resource-list compact">
                ${learningResources
                  .map(
                    (item) => `
                      <a class="resource-card compact" href="${item.url}" target="_blank" rel="noreferrer">
                        <strong>${escapeHtml(item.title)}</strong>
                        <span>${escapeHtml(item.why)}</span>
                      </a>
                    `,
                  )
                  .join("")}
              </div>
            </article>
          `
          : ""
      }

      ${
        nearby.length
          ? `
            <article class="detail-section">
              <h3>Nearby alternatives</h3>
              <div class="topic-link-row">
                ${nearby.map((problem) => `<button class="inline-link" type="button" data-select-problem="${problem.id}">#${problem.number} ${escapeHtml(problem.title)}</button>`).join("")}
              </div>
            </article>
          `
          : ""
      }

      <article class="detail-section" data-testid="supporting-urls-block">
        <h3>Supporting URLs</h3>
        <div class="source-list">
          ${selected.sourceUrls.map((url) => `<a href="${url}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>`).join("")}
        </div>
      </article>

      <article class="note-box" data-testid="note-box">
        <h3>Local note</h3>
        <p>Add reminders, mistakes, or follow-up ideas. This persists in localStorage.</p>
        <textarea id="problem-note" data-testid="problem-note" placeholder="Example: revisit after Course Schedule II">${escapeHtml(state.notes[selected.id] || "")}</textarea>
      </article>
    `;

    els.detailContent.querySelector("#detail-solved").addEventListener("click", () => {
      toggleSolved(selected.id);
      render();
    });
    els.detailContent.querySelector("#detail-pinned").addEventListener("click", () => {
      togglePinned(selected.id);
      render();
    });
    els.detailContent.querySelector("#problem-note").addEventListener("input", (event) => {
      state.notes[selected.id] = event.target.value;
      persistState();
    });
    els.detailContent.querySelectorAll("[data-select-problem]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedId = button.dataset.selectProblem;
        render();
      });
    });
    els.detailContent.querySelectorAll("[data-copy-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const coverage = selected.repoCoverage[Number(button.dataset.copyIndex)];
        const text = coverage.paths.join("\n");
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text);
        else window.prompt("Copy these paths", text);
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = "Copy paths";
        }, 1200);
      });
    });
    els.detailContent.querySelector("#open-solutions")?.addEventListener("click", () => {
      openSolutionDialog(selected.id);
    });
    els.detailContent.querySelectorAll("[data-inline-language]").forEach((button) => {
      button.addEventListener("click", () => {
        uiState.inlineLanguageByProblem[selected.id] = button.dataset.inlineLanguage;
        renderDetail();
      });
    });
    els.detailContent.querySelectorAll("[data-solution-spoiler]").forEach((element) => {
      element.addEventListener("toggle", () => {
        uiState.openSolutionSpoilers[element.dataset.solutionSpoiler] = element.open;
      });
    });
    els.detailContent.querySelectorAll("[data-copy-reviewed-code]").forEach((button) => {
      button.addEventListener("click", () => {
        const sourceId = button.dataset.copyReviewedCode;
        const source = activeLanguage?.sources.find((item) => item.id === sourceId);
        if (!source?.reviewedCode) return;
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(source.reviewedCode);
        else window.prompt("Copy reviewed source", source.reviewedCode);
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = "Copy reviewed";
        }, 1200);
      });
    });
  }

  function renderRoadmap() {
    const svg = els.roadmapSvg;
    const filteredProblems = getFilteredProblems();
    const filteredIds = new Set(filteredProblems.map((problem) => problem.id));
    const selectedId = state.selectedId;
    const selectedProblem = problems.find((problem) => problem.id === selectedId) || filteredProblems[0] || null;
    const phaseX = {};
    phaseOrder.forEach((phaseId, index) => {
      phaseX[phaseId] = 190 + index * 150;
    });
    const rowY = {};
    roadmapRows.forEach((row, index) => {
      rowY[row.id] = 110 + index * 44;
    });
    const positions = groupRoadmapPositions(problems, phaseX, rowY);
    const visibleCountsByPhase = new Map(dataset.phases.map((phase) => [phase.id, filteredProblems.filter((problem) => problem.phase.id === phase.id).length]));

    els.roadmapContext.innerHTML = dataset.phases
      .map((phase) => {
        const count = visibleCountsByPhase.get(phase.id) || 0;
        const active = state.filters.phases.includes(phase.id) || selectedProblem?.phase.id === phase.id;
        return `
          <button class="roadmap-context-chip" type="button" data-roadmap-context-phase="${phase.id}" data-active="${active}">
            <strong>${escapeHtml(phase.shortName)}</strong>
            <span>${count} visible</span>
          </button>
        `;
      })
      .join("");

    els.roadmapContext.querySelectorAll("[data-roadmap-context-phase]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleInArray(state.filters.phases, button.dataset.roadmapContextPhase);
        state.activeQuickView = null;
        renderSidebar();
        render();
      });
    });

    svg.innerHTML = `
      ${roadmapRows
        .map(
          (row) => `
            <line x1="136" y1="${rowY[row.id]}" x2="1168" y2="${rowY[row.id]}" stroke="${state.filters.roadmapLane === row.id ? "#96c2ff" : "#e7edf3"}" stroke-width="${state.filters.roadmapLane === row.id ? 2.5 : 1}" stroke-dasharray="${state.filters.roadmapLane === row.id ? "0" : "4 7"}"></line>
          `,
        )
        .join("")}
      ${dataset.phases
        .map(
          (phase, index) => `
            <g>
              <rect x="${136 + index * 150}" y="36" width="108" height="330" rx="12" fill="${selectedProblem?.phase.id === phase.id ? "#eef5ff" : index % 2 === 0 ? "#f8fafc" : "#ffffff"}" stroke="${state.filters.phases.includes(phase.id) || selectedProblem?.phase.id === phase.id ? "#8ab4f8" : "#d0d7de"}"></rect>
              <g class="roadmap-phase-label" data-phase="${phase.id}" tabindex="0" role="button">
                <rect x="${144 + index * 150}" y="46" width="92" height="28" rx="8" fill="${state.filters.phases.includes(phase.id) ? "#0969da" : selectedProblem?.phase.id === phase.id ? "#ffffff" : "#ffffff"}" stroke="${state.filters.phases.includes(phase.id) || selectedProblem?.phase.id === phase.id ? "#8ab4f8" : "#d0d7de"}"></rect>
                <text x="${190 + index * 150}" y="64" text-anchor="middle" font-size="11" font-family="IBM Plex Sans, sans-serif" fill="${state.filters.phases.includes(phase.id) ? "#ffffff" : "#1f2328"}">${escapeHtml(phase.shortName)}</text>
                <text x="${190 + index * 150}" y="88" text-anchor="middle" font-size="10" font-family="IBM Plex Sans, sans-serif" fill="#57606a">${visibleCountsByPhase.get(phase.id) || 0} visible</text>
              </g>
            </g>
          `,
        )
        .join("")}
      ${roadmapRows
        .map(
          (row) => `
            <g class="roadmap-row-label" data-lane="${row.id}" tabindex="0" role="button">
              <rect x="12" y="${rowY[row.id] - 12}" width="112" height="24" rx="6" fill="${state.filters.roadmapLane === row.id ? "#1f2328" : "#ffffff"}" stroke="#d0d7de"></rect>
              <text x="68" y="${rowY[row.id] + 4}" text-anchor="middle" font-size="11" font-family="IBM Plex Sans, sans-serif" fill="${state.filters.roadmapLane === row.id ? "#ffffff" : "#1f2328"}">${escapeHtml(row.label)}</text>
            </g>
          `,
        )
        .join("")}
      ${problems
        .sort((a, b) => a.recommendedOrder - b.recommendedOrder)
        .map((problem) => {
          const position = positions[problem.id];
          const selected = problem.id === selectedId;
          const visible = filteredIds.has(problem.id);
          const solved = isSolved(problem.id);
          return `
            <g class="roadmap-node" data-problem="${problem.id}" data-title="${escapeHtml(problem.title)}" data-why="${escapeHtml(problem.whySolve)}" tabindex="0" role="button" transform="translate(${position.x}, ${position.y})" opacity="${visible ? 1 : 0.18}">
              ${selected ? '<circle r="13" fill="none" stroke="#0969da" stroke-width="2"></circle>' : ""}
              <circle r="9" fill="${solved ? "#1a7f37" : "#0969da"}" stroke="#ffffff" stroke-width="2"></circle>
            </g>
          `;
        })
        .join("")}
    `;

    svg.querySelectorAll(".roadmap-phase-label").forEach((element) => {
      bindSvgButton(element, () => {
        toggleInArray(state.filters.phases, element.dataset.phase);
        state.activeQuickView = null;
        renderSidebar();
        render();
      });
    });
    svg.querySelectorAll(".roadmap-row-label").forEach((element) => {
      bindSvgButton(element, () => {
        state.filters.roadmapLane = state.filters.roadmapLane === element.dataset.lane ? null : element.dataset.lane;
        state.activeQuickView = null;
        renderSidebar();
        render();
      });
    });
    svg.querySelectorAll(".roadmap-node").forEach((element) => {
      const showTooltip = (event) => {
        const rect = svg.getBoundingClientRect();
        els.roadmapTooltip.hidden = false;
        els.roadmapTooltip.innerHTML = `
          <strong>${escapeHtml(element.dataset.title)}</strong>
          <p>${escapeHtml(element.dataset.why)}</p>
        `;
        els.roadmapTooltip.style.left = `${Math.min(event.clientX - rect.left + 16, rect.width - 290)}px`;
        els.roadmapTooltip.style.top = `${Math.min(event.clientY - rect.top + 16, rect.height - 100)}px`;
      };
      bindSvgButton(element, () => {
        state.selectedId = element.dataset.problem;
        render();
      });
      element.addEventListener("mouseenter", showTooltip);
      element.addEventListener("mousemove", showTooltip);
      element.addEventListener("mouseleave", () => {
        els.roadmapTooltip.hidden = true;
      });
      element.addEventListener("blur", () => {
        els.roadmapTooltip.hidden = true;
      });
    });
  }

  async function openSolutionDialog(problemId) {
    solutionState.open = true;
    solutionState.problemId = problemId;
    solutionState.error = "";
    solutionState.loading = true;
    renderSolutionDialog();
    const payload = await ensureSolutionPayload(problemId);
    solutionState.error = uiState.solutionErrors[problemId] || "";
    solutionState.loading = false;
    if (payload) {
      solutionState.cache[problemId] = payload;
    }
    selectDefaultSolution(problemId);
    renderSolutionDialog();
  }

  function closeSolutionDialog() {
    solutionState.open = false;
    renderSolutionDialog();
  }

  function selectDefaultSolution(problemId) {
    const payload = solutionState.cache[problemId];
    if (!payload) return;
    const language = payload.languages.find((group) => group.id === payload.summary.primaryLanguageId) || payload.languages[0];
    if (!language) return;
    solutionState.selectedLanguageId = language.id;
    solutionState.selectedSourceId = language.sources[0]?.id || null;
  }

  function renderSolutionDialog() {
    const selectedProblem = problems.find((problem) => problem.id === solutionState.problemId);
    const payload = selectedProblem ? solutionState.cache[selectedProblem.id] : null;
    const activeLanguage = payload?.languages.find((group) => group.id === solutionState.selectedLanguageId) || payload?.languages[0];
    const activeSource =
      activeLanguage?.sources.find((source) => source.id === solutionState.selectedSourceId) || activeLanguage?.sources[0] || null;

    els.solutionDialog.hidden = !solutionState.open;
    els.solutionDialog.dataset.open = String(solutionState.open);
    document.body.dataset.solutionOpen = String(solutionState.open);

    if (!solutionState.open) {
      return;
    }

    els.solutionDialogTitle.textContent = selectedProblem
      ? `#${selectedProblem.number} ${selectedProblem.title}`
      : "Attributed implementations";
    els.solutionDialogSubtitle.textContent = selectedProblem
      ? "Focused deep-inspection mode for comparing attributed implementations, reader notes, and original source links."
      : "Choose a problem to inspect its solutions.";

    if (solutionState.loading) {
      els.solutionDialogStatus.innerHTML = `<p class="summary-copy">Loading solution corpus...</p>`;
      els.solutionLanguageTabs.innerHTML = "";
      els.solutionSourceTabs.innerHTML = "";
      els.solutionAttribution.innerHTML = "";
      els.solutionReview.innerHTML = "";
      els.solutionWriteups.innerHTML = "";
      els.solutionCode.innerHTML = "";
      return;
    }

    if (solutionState.error || !payload) {
      els.solutionDialogStatus.innerHTML = `<p class="empty-state">${escapeHtml(solutionState.error || "No solutions available.")}</p>`;
      els.solutionLanguageTabs.innerHTML = "";
      els.solutionSourceTabs.innerHTML = "";
      els.solutionAttribution.innerHTML = "";
      els.solutionReview.innerHTML = "";
      els.solutionWriteups.innerHTML = "";
      els.solutionCode.innerHTML = "";
      return;
    }

    els.solutionDialogStatus.innerHTML = `
      <div class="problem-meta">
        ${metaPill(`${payload.summary.solutionCount} solutions`, "accent")}
        ${metaPill(`${payload.summary.languageLabels.length} languages`)}
        ${metaPill(`${payload.summary.writeupCount} writeups`)}
      </div>
    `;

    els.solutionLanguageTabs.innerHTML = payload.languages
      .map(
        (group) => `
          <button class="token" type="button" data-solution-language="${group.id}" data-active="${group.id === activeLanguage?.id}" data-testid="solution-language-tab">
            ${escapeHtml(group.label)}
          </button>
        `,
      )
      .join("");
    els.solutionLanguageTabs.querySelectorAll("[data-solution-language]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLanguage = payload.languages.find((group) => group.id === button.dataset.solutionLanguage);
        solutionState.selectedLanguageId = button.dataset.solutionLanguage;
        solutionState.selectedSourceId = nextLanguage?.sources[0]?.id || null;
        renderSolutionDialog();
      });
    });

    els.solutionSourceTabs.innerHTML = (activeLanguage?.sources || [])
      .map(
        (source) => `
          <button class="sidebar-button source-tab" type="button" data-solution-source="${source.id}" data-active="${source.id === activeSource?.id}" data-testid="solution-source-tab">
            <strong>${escapeHtml(source.repository)}</strong>
            <span>${escapeHtml(pathLabel(source.relativePath))}</span>
          </button>
        `,
      )
      .join("");
    els.solutionSourceTabs.querySelectorAll("[data-solution-source]").forEach((button) => {
      button.addEventListener("click", () => {
        solutionState.selectedSourceId = button.dataset.solutionSource;
        renderSolutionDialog();
      });
    });

    if (!activeSource) {
      els.solutionAttribution.innerHTML = "<p class='empty-state'>No source selected.</p>";
      els.solutionReview.innerHTML = "";
      els.solutionWriteups.innerHTML = "";
      els.solutionCode.innerHTML = "";
      return;
    }

    const relatedWriteups = payload.writeups.filter((item) => item.repository === activeSource.repository);
    const visibleWriteups = relatedWriteups.length ? relatedWriteups : payload.writeups;

    els.solutionAttribution.innerHTML = `
      <h3>Attribution</h3>
      <p>This implementation comes from <strong>${escapeHtml(activeSource.repository)}</strong>.</p>
      <div class="source-list">
        ${activeSource.repositoryUrl ? `<a href="${activeSource.repositoryUrl}" target="_blank" rel="noreferrer">Repository</a>` : ""}
        ${activeSource.sourceUrl ? `<a href="${activeSource.sourceUrl}" target="_blank" rel="noreferrer">Source file</a>` : ""}
      </div>
      <p><code>${escapeHtml(activeSource.relativePath)}</code></p>
      <div class="problem-meta">
        ${metaPill(activeSource.languageLabel)}
        ${metaPill(activeSource.coverageType)}
        ${activeSource.embeddedSuccessfully ? metaPill("embedded", "success") : ""}
        ${activeSource.readerEnhancementsAdded ? metaPill("reader comments added", "accent") : ""}
        ${(activeSource.complexityHints || []).map((item) => metaPill(item)).join("")}
      </div>
      <p class="summary-copy">${escapeHtml(activeSource.enhancementNote || "Based on the attributed source file. Reader-oriented comments were added for study use.")}</p>
    `;

    els.solutionReview.innerHTML = `
      <h3>Implementation review</h3>
      <ul>
        <li><strong>Why this version:</strong> ${escapeHtml(activeSource.implementationReview.whyThisVersion)}</li>
        <li><strong>What to notice:</strong> ${escapeHtml(activeSource.implementationReview.whatToNotice)}</li>
        <li><strong>Risk point:</strong> ${escapeHtml(activeSource.implementationReview.riskPoint)}</li>
      </ul>
    `;

    els.solutionWriteups.innerHTML = `
      <h3>Supporting writeups</h3>
      ${
        visibleWriteups.length
          ? `<div class="resource-list">
              ${visibleWriteups
                .map(
                  (item) => `
                    <a class="resource-card compact" href="${item.sourceUrl || "#"}" ${item.sourceUrl ? 'target="_blank" rel="noreferrer"' : ""}>
                      <strong>${escapeHtml(formatWriteupTitle(item.title))}</strong>
                      <span>${escapeHtml(item.excerpt)}</span>
                    </a>
                  `,
                )
                .join("")}
            </div>`
          : "<p class='summary-copy'>No writeup was indexed for this repository entry.</p>"
      }
    `;

    els.solutionCode.innerHTML = renderAnnotatedCode(activeSource);
  }

  function renderAnnotatedCode(source) {
    const annotations = new Map((source.annotations || []).map((item) => [item.line, item]));
    return `
      <div class="solution-code-block">
        ${(source.code || "")
          .split("\n")
          .map((line, index) => {
            const lineNumber = index + 1;
            const annotation = annotations.get(lineNumber);
            return `
              <div class="code-line-wrap ${annotation ? "has-annotation" : ""}">
                <div class="code-line-row">
                  <span class="code-line-number">${lineNumber}</span>
                  <code class="code-line-text">${escapeHtml(line) || "&nbsp;"}</code>
                </div>
                ${
                  annotation
                    ? `
                      <div class="code-annotation" data-testid="solution-annotation">
                        <strong>${escapeHtml(annotation.label)}</strong>
                        <span>${escapeHtml(annotation.note)}</span>
                      </div>
                    `
                    : ""
                }
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderReviewedCode(code) {
    return `
      <div class="solution-code-block">
        ${(code || "")
          .split("\n")
          .map(
            (line, index) => `
              <div class="code-line-wrap">
                <div class="code-line-row">
                  <span class="code-line-number">${index + 1}</span>
                  <code class="code-line-text">${escapeHtml(line) || "&nbsp;"}</code>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function copyActiveSolutionCode() {
    const payload = solutionState.cache[solutionState.problemId || ""];
    const language = payload?.languages.find((group) => group.id === solutionState.selectedLanguageId) || payload?.languages[0];
    const source = language?.sources.find((item) => item.id === solutionState.selectedSourceId) || language?.sources[0];
    const copyText = source?.reviewedCode || source?.code;
    if (!copyText) return;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(copyText);
    else window.prompt("Copy code", copyText);
    els.solutionCopyCode.textContent = "Copied";
    setTimeout(() => {
      els.solutionCopyCode.textContent = "Copy code";
    }, 1200);
  }

  function updateTestingState() {
    const filtered = getFilteredProblems();
    const selected = problems.find((problem) => problem.id === state.selectedId);
    document.body.dataset.appReady = "true";
    document.body.dataset.selectedProblem = state.selectedId || "";
    document.body.dataset.visibleCount = String(filtered.length);
    document.body.dataset.solutionOpen = String(solutionState.open);
    document.body.dataset.activePhase = selected?.phase.id || "";
    document.body.dataset.detailExpanded = String(Boolean(state.detailExpanded));
  }

  function syncWorkspaceScroll(previousWorkspaceSignature, previousSelectedId) {
    const currentWorkspaceSignature = getWorkspaceSignature();
    if (previousWorkspaceSignature && previousWorkspaceSignature !== currentWorkspaceSignature) {
      els.catalogScroll.scrollTop = 0;
      els.detailScroll.scrollTop = 0;
    }

    if (previousSelectedId && previousSelectedId !== state.selectedId) {
      els.detailScroll.scrollTop = 0;
      const selectedRow = els.phaseGroups.querySelector(`[data-problem-row="${state.selectedId}"]`);
      selectedRow?.scrollIntoView({ block: "nearest" });
    }
  }

  function getWorkspaceSignature() {
    return JSON.stringify({
      activeQuickView: state.activeQuickView,
      search: state.filters.search,
      phases: [...state.filters.phases].sort(),
      concepts: [...state.filters.concepts].sort(),
      clarity: [...state.filters.clarity].sort(),
      effort: [...state.filters.effort].sort(),
      toggles: Object.keys(state.filters.toggles)
        .filter((key) => state.filters.toggles[key])
        .sort(),
      roadmapLane: state.filters.roadmapLane,
      sort: state.sort,
      detailExpanded: state.detailExpanded,
    });
  }

  function bindSvgButton(element, action) {
    element.style.cursor = "pointer";
    element.addEventListener("click", action);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    });
  }

  function groupRoadmapPositions(items, phaseX, rowY) {
    const grouped = {};
    const buckets = new Map();
    items.forEach((problem) => {
      const key = `${problem.phase.id}:${problem.roadmapRow}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(problem);
    });
    buckets.forEach((bucket) => {
      bucket.sort((a, b) => a.recommendedOrder - b.recommendedOrder);
      bucket.forEach((problem, index) => {
        const columns = Math.min(bucket.length, 5);
        const column = index % columns;
        const row = Math.floor(index / columns);
        grouped[problem.id] = {
          x: phaseX[problem.phase.id] + (column - (columns - 1) / 2) * 18,
          y: rowY[problem.roadmapRow] + row * 18,
        };
      });
    });
    return grouped;
  }

  function getFilteredProblems() {
    return problems.filter(matchesFilters).sort(sorter());
  }

  function matchesFilters(problem) {
    const search = state.filters.search.toLowerCase();
    if (search && !problem.searchableText.includes(search)) return false;
    if (state.filters.phases.length && !state.filters.phases.includes(problem.phase.id)) return false;
    if (state.filters.concepts.length && !state.filters.concepts.every((concept) => problem.concepts.includes(concept))) return false;
    if (state.filters.clarity.length && !state.filters.clarity.includes(problem.clarity)) return false;
    if (state.filters.effort.length && !state.filters.effort.includes(problem.effort)) return false;
    if (state.filters.transition.length && !state.filters.transition.includes(problem.transitionFriendliness)) return false;
    if (state.filters.roadmapLane && problem.roadmapRow !== state.filters.roadmapLane) return false;
    if (state.filters.toggles.starterOnly && !problem.starter) return false;
    if (state.filters.toggles.newerGemOnly && !problem.newerGem) return false;
    if (state.filters.toggles.classicOnly && !problem.classic) return false;
    if (state.filters.toggles.localSupportOnly && problem.repoCount < 4) return false;
    if (state.filters.toggles.pinnedOnly && !isPinned(problem.id)) return false;
    if (state.filters.toggles.unsolvedOnly && isSolved(problem.id)) return false;
    if (state.filters.toggles.solvedOnly && !isSolved(problem.id)) return false;
    return true;
  }

  function sorter() {
    const clarityRank = { "very-clear": 0, clear: 1, moderate: 2 };
    const effortRank = { light: 0, moderate: 1, stretch: 2 };
    if (state.sort === "clarity") {
      return (a, b) => clarityRank[a.clarity] - clarityRank[b.clarity] || a.recommendedOrder - b.recommendedOrder;
    }
    if (state.sort === "effort") {
      return (a, b) => effortRank[a.effort] - effortRank[b.effort] || a.recommendedOrder - b.recommendedOrder;
    }
    if (state.sort === "title") {
      return (a, b) => a.title.localeCompare(b.title);
    }
    return (a, b) => a.recommendedOrder - b.recommendedOrder;
  }

  function chooseBestNext(source) {
    const pool = source.filter((problem) => !isSolved(problem.id));
    const finalPool = pool.length ? pool : source;
    return finalPool.slice().sort((a, b) => a.recommendedOrder - b.recommendedOrder)[0] || null;
  }

  function getNearbyAlternatives(problem) {
    return problems
      .filter((candidate) => candidate.id !== problem.id && candidate.phase.id === problem.phase.id)
      .sort((a, b) => Math.abs(a.recommendedOrder - problem.recommendedOrder) - Math.abs(b.recommendedOrder - problem.recommendedOrder))
      .slice(0, 3);
  }

  function getLearningResources(problem) {
    const seen = new Set();
    const resources = [];
    (problem.topicGuides || []).forEach((guide) => {
      const sourceGuide = guideLibrary[guide.id];
      (sourceGuide?.resourceGroups || []).forEach((group) => {
        (group.items || []).forEach((item) => {
          if (!item?.url || seen.has(item.url)) return;
          seen.add(item.url);
          resources.push(item);
        });
      });
    });
    return resources.slice(0, 4);
  }

  function bindProblemSelectors(container) {
    container.querySelectorAll("[data-select-problem]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedId = button.dataset.selectProblem;
        render();
        scrollDetailIntoView();
      });
    });
  }

  function resetFilters() {
    const defaults = defaultState();
    state.filters = defaults.filters;
    state.sort = defaults.sort;
    state.compact = defaults.compact;
    els.sortSelect.value = state.sort;
    els.compactToggle.checked = state.compact;
  }

  function enrichProblem(problem) {
    return {
      ...problem,
      repoCount: problem.repoCoverage.length,
      searchableText: [
        problem.title,
        problem.phase.shortName,
        problem.overview,
        problem.whySolve,
        problem.whatYouPractice,
        problem.interestNote,
        problem.caveat,
        problem.concepts.join(" "),
        problem.memberships.join(" "),
        (problem.solutionSummary?.languageLabels || []).join(" "),
      ]
        .join(" ")
        .toLowerCase(),
      roadmapRow: classifyRoadmapRow(problem),
    };
  }

  function classifyRoadmapRow(problem) {
    if (problem.phase.id === "foundations") return "foundation";
    if (problem.phase.id === "linked-lists") return "linked-list";
    if (problem.phase.id === "trees") return "tree";
    if (problem.phase.id === "state-space") return "state-search";
    if (problem.phase.id === "dp") return "dp";
    if (problem.concepts.includes("bfs") || problem.concepts.includes("grid")) return "graph-bfs";
    return "graph-logic";
  }

  function defaultState() {
    return {
      solved: [],
      pinned: [],
      notes: {},
      selectedId: problems[0]?.id || null,
      compact: false,
      detailExpanded: false,
      sort: "recommended",
      activeQuickView: null,
      filters: {
        search: "",
        phases: [],
        concepts: [],
        clarity: [],
        effort: [],
        transition: [],
        roadmapLane: null,
        toggles: {
          starterOnly: false,
          newerGemOnly: false,
          classicOnly: false,
          localSupportOnly: false,
          pinnedOnly: false,
          unsolvedOnly: false,
          solvedOnly: false,
        },
      },
    };
  }

  function loadState() {
    const fallback = defaultState();
    const stored = storage.get("state", fallback);
    return {
      ...fallback,
      ...stored,
      filters: {
        ...fallback.filters,
        ...(stored.filters || {}),
        toggles: {
          ...fallback.filters.toggles,
          ...((stored.filters && stored.filters.toggles) || {}),
        },
      },
    };
  }

  async function ensureSolutionPayload(problemId) {
    if (solutionState.cache[problemId]) return solutionState.cache[problemId];
    if (uiState.loadingSolutions[problemId]) return null;
    uiState.loadingSolutions[problemId] = true;
    uiState.solutionErrors[problemId] = "";
    try {
      const response = await fetch(`data/solutions/${problemId}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load solutions: ${response.status}`);
      solutionState.cache[problemId] = await response.json();
      return solutionState.cache[problemId];
    } catch (error) {
      uiState.solutionErrors[problemId] = error.message || "Unable to load solutions.";
      return null;
    } finally {
      uiState.loadingSolutions[problemId] = false;
      if (state.selectedId === problemId || solutionState.problemId === problemId) {
        render();
      }
    }
  }

  function renderInlineSolutions(problem, payload, activeLanguage, loading, error) {
    if (loading) {
      return `<p class="summary-copy">Preparing embedded implementations for this problem...</p>`;
    }
    if (error) {
      return `<p class="empty-state">${escapeHtml(error)}</p>`;
    }
    if (!payload || !payload.languages?.length) {
      return `<p class="summary-copy">No embedded implementations were indexed for this problem yet.</p>`;
    }
    return `
      <div class="inline-solution-tabs" data-testid="inline-solution-tabs">
        ${payload.languages
          .map(
            (group) => `
              <button class="token" type="button" data-inline-language="${group.id}" data-active="${group.id === activeLanguage?.id}">
                ${escapeHtml(group.label)} · ${group.sourceCount}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="inline-solution-list" data-testid="inline-solution-list">
        ${(activeLanguage?.sources || [])
          .map((source) => {
            const relatedWriteups = payload.writeups.filter((item) => item.repository === source.repository).slice(0, 2);
            const spoilerOpen = Boolean(uiState.openSolutionSpoilers[source.id]);
            return `
              <article class="inline-solution-card" data-testid="inline-solution-card">
                <div class="inline-solution-head">
                  <div>
                    <h4>${escapeHtml(source.repository)} · ${escapeHtml(source.languageLabel)}</h4>
                    <p>${escapeHtml(source.coverageType)} source · ${escapeHtml(source.relativePath)}</p>
                  </div>
                  <div class="detail-badges">
                    ${source.readerEnhancementsAdded ? metaPill("reader comments added", "accent") : ""}
                    ${source.embeddedSuccessfully ? metaPill("embedded", "success") : ""}
                  </div>
                </div>
                <p class="inline-solution-note">${escapeHtml(source.enhancementNote || "Based on the attributed source file with explanatory reader comments added for study use.")}</p>
                <div class="source-list">
                  ${source.repositoryUrl ? `<a href="${source.repositoryUrl}" target="_blank" rel="noreferrer">Repository</a>` : ""}
                  ${source.sourceUrl ? `<a href="${source.sourceUrl}" target="_blank" rel="noreferrer">Original file</a>` : ""}
                </div>
                ${
                  relatedWriteups.length
                    ? `
                      <div class="topic-link-row">
                        ${relatedWriteups
                          .map(
                            (item) =>
                              `<a class="inline-link" href="${item.sourceUrl || "#"}" ${item.sourceUrl ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHtml(formatWriteupTitle(item.title))}</a>`,
                          )
                          .join("")}
                      </div>
                    `
                    : ""
                }
                <details class="solution-spoiler-inline" data-solution-spoiler="${source.id}" ${spoilerOpen ? "open" : ""}>
                  <summary>
                    <span>Reveal spoiler solution</span>
                    <small>Reviewed ${escapeHtml(source.languageLabel)} implementation from ${escapeHtml(source.repository)}</small>
                  </summary>
                  <div class="solution-spoiler-body">
                    <div class="solution-spoiler-toolbar">
                      <div class="solution-spoiler-meta">
                        <span class="summary-copy">Repository: <strong>${escapeHtml(source.repository)}</strong></span>
                        <span class="summary-copy">Original file: <code>${escapeHtml(source.relativePath)}</code></span>
                      </div>
                      <button class="button button-quiet" type="button" data-copy-reviewed-code="${source.id}">Copy reviewed</button>
                    </div>
                    <div class="source-list solution-spoiler-links">
                      ${source.repositoryUrl ? `<a href="${source.repositoryUrl}" target="_blank" rel="noreferrer">Repository</a>` : ""}
                      ${source.sourceUrl ? `<a href="${source.sourceUrl}" target="_blank" rel="noreferrer">Original file</a>` : ""}
                    </div>
                    <div class="solution-spoiler-disclaimer">
                      <strong>Attribution note.</strong>
                      <span>${escapeHtml(source.enhancementNote || "This embedded version is based on the attributed source file; reader comments were added for clarity.")}</span>
                    </div>
                    <div class="solution-inline-code">${renderReviewedCode(source.reviewedCode || source.code || "")}</div>
                  </div>
                </details>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function createStorage(prefix) {
    return {
      get(key, fallback) {
        try {
          const raw = localStorage.getItem(`${prefix}:${key}`);
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(`${prefix}:${key}`, JSON.stringify(value));
        } catch {
          return;
        }
      },
      clearAll() {
        try {
          Object.keys(localStorage)
            .filter((key) => key.startsWith(`${prefix}:`))
            .forEach((key) => localStorage.removeItem(key));
        } catch {
          return;
        }
      },
    };
  }

  function persistState() {
    storage.set("state", state);
  }

  function toggleSolved(problemId) {
    toggleSetValue(state.solved, problemId);
  }

  function togglePinned(problemId) {
    toggleSetValue(state.pinned, problemId);
  }

  function isSolved(problemId) {
    return state.solved.includes(problemId);
  }

  function isPinned(problemId) {
    return state.pinned.includes(problemId);
  }

  function toggleSetValue(collection, value) {
    const index = collection.indexOf(value);
    if (index >= 0) collection.splice(index, 1);
    else collection.push(value);
  }

  function toggleInArray(collection, value) {
    const index = collection.indexOf(value);
    if (index >= 0) collection.splice(index, 1);
    else collection.push(value);
  }

  function labelForPhase(phaseId) {
    return dataset.phases.find((phase) => phase.id === phaseId)?.shortName || phaseId;
  }

  function labelForClarity(value) {
    return { "very-clear": "very clear", clear: "clear", moderate: "moderate" }[value] || value;
  }

  function labelForEffort(value) {
    return { light: "light", moderate: "moderate", stretch: "stretch" }[value] || value;
  }

  function toggleLabel(key) {
    return {
      starterOnly: "starters",
      newerGemOnly: "newer gems",
      classicOnly: "classics",
      localSupportOnly: "4+ repos",
      pinnedOnly: "pinned",
      unsolvedOnly: "unsolved",
      solvedOnly: "solved",
    }[key];
  }

  function toLabel(value) {
    return String(value)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function pathLabel(value) {
    const parts = String(value).split("/");
    return parts.slice(-2).join(" / ");
  }

  function formatWriteupTitle(value) {
    const raw = String(value || "").trim();
    const markdownMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (markdownMatch) return markdownMatch[1];
    return raw.replace(/^#+\s*/, "").trim();
  }

  function getGuideSummary(guide, maxLength = 96) {
    const raw =
      guide?.description ||
      guide?.summary ||
      guideLibrary[guide?.id || ""]?.summary ||
      "Pattern guide with fit signals, review prompts, and linked practice.";
    const normalized = String(raw).replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) return normalized;
    const shortened = normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd();
    const boundary = shortened.lastIndexOf(" ");
    if (boundary > Math.max(18, maxLength * 0.55)) {
      return `${shortened.slice(0, boundary).trimEnd()}…`;
    }
    return `${shortened}…`;
  }

  function metaPill(text, tone = "") {
    return `<span class="meta-pill ${tone}">${escapeHtml(text)}</span>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function scrollDetailIntoView() {
    if (window.innerWidth > 1180) return;
    document.querySelector(".detail-pane")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
