(function () {
  "use strict";

  const dataset = window.PROBLEM_DATA;
  const guides = window.TOPIC_GUIDES;
  const topicId = document.body.dataset.topic;
  const guide = guides[topicId];
  const mount = document.querySelector("#topic-app");

  if (!guide || !mount) return;

  const problemLookup = new Map(dataset.problems.map((problem) => [problem.id, problem]));
  const relatedProblems = guide.relatedProblems
    .map((id) => problemLookup.get(id))
    .filter(Boolean)
    .sort((a, b) => a.recommendedOrder - b.recommendedOrder);

  const relatedTopics = (guide.relatedTopics || [])
    .map((id) => ({
      id,
      title: guides[id]?.title || id,
      path: `../topics/${id}.html`,
    }))
    .filter((item) => guides[item.id]);

  const fitSignals = guide.fitSignals || [];
  const reviewChecklist = guide.reviewChecklist || [];
  const resourceGroups = guide.resourceGroups || [];

  mount.innerHTML = `
    <div class="topic-frame">
      <article class="topic-card">
        <header class="topic-hero">
          <p class="eyebrow">Topic Guide</p>
          <div class="topic-header-row">
            <div>
              <h1>${escapeHtml(guide.title)}</h1>
              <p class="topic-summary">${escapeHtml(guide.summary)}</p>
            </div>
            <a class="button" href="../index.html">Back to explorer</a>
          </div>
          <div class="topic-link-row">
            ${relatedTopics
              .map((topic) => `<a class="inline-link" href="${topic.path}">${escapeHtml(topic.title)}</a>`)
              .join("")}
          </div>
        </header>

        <section class="topic-meta-grid">
          <article class="topic-mini-card">
            <h2>Use This Topic When</h2>
            ${fitSignals.length ? `<ul>${fitSignals.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>No fit signals recorded yet.</p>"}
          </article>
          <article class="topic-mini-card">
            <h2>Review Checklist</h2>
            ${reviewChecklist.length ? `<ul>${reviewChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>No checklist recorded yet.</p>"}
          </article>
        </section>

        ${
          resourceGroups.length
            ? `
              <section>
                <h2>Learning Material</h2>
                <div class="resource-group-grid">
                  ${resourceGroups
                    .map(
                      (group) => `
                        <article class="resource-group">
                          <h3>${escapeHtml(group.title)}</h3>
                          <div class="resource-list">
                            ${group.items
                              .map(
                                (item) => `
                                  <a class="resource-card" href="${item.url}" target="_blank" rel="noreferrer">
                                    <strong>${escapeHtml(item.title)}</strong>
                                    <span>${escapeHtml(item.why)}</span>
                                  </a>
                                `,
                              )
                              .join("")}
                          </div>
                        </article>
                      `,
                    )
                    .join("")}
                </div>
              </section>
            `
            : ""
        }

        ${guide.sections
          .map(
            (section) => `
              <section>
                <h2>${escapeHtml(section.title)}</h2>
                ${section.html}
              </section>
            `,
          )
          .join("")}

        <section>
          <h2>Practice From This Collection</h2>
          <div class="phase-list">
            ${relatedProblems
              .map(
                (problem) => `
                  <article class="phase-row" data-selected="false" data-solved="false" data-compact="false">
                    <div class="row-number">${problem.recommendedOrder}</div>
                    <div class="row-main">
                      <div class="row-head">
                        <span class="row-id">#${problem.number}</span>
                        <h3>${escapeHtml(problem.title)}</h3>
                      </div>
                      <div class="problem-meta">
                        ${metaPill(problem.phase.shortName)}
                        ${metaPill(toLabel(problem.clarity), "accent")}
                        ${metaPill(toLabel(problem.effort))}
                      </div>
                      <p>${escapeHtml(problem.whySolve)}</p>
                    </div>
                    <div class="row-actions">
                      <a class="row-action" href="../index.html#${problem.id}">Open</a>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>

        <section>
          <h2>What To Read Next</h2>
          <p>If this topic still feels slippery, return to the explorer and pick one of the starter problems linked above. If it feels comfortable, move sideways into a related topic instead of solving five nearly identical questions in a row.</p>
          <div class="topic-link-row">
            ${relatedTopics
              .map((topic) => `<a class="inline-link" href="${topic.path}">${escapeHtml(topic.title)}</a>`)
              .join("")}
            <a class="inline-link" href="../index.html">Main explorer</a>
          </div>
        </section>
      </article>
    </div>
  `;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toLabel(value) {
    return String(value)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function metaPill(text, tone = "") {
    return `<span class="meta-pill ${tone}">${escapeHtml(text)}</span>`;
  }
})();
