(function () {
  "use strict";

  const entries = window.ILUD_DATA;
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const storageKey = "ilud-saved-v1";
  let saved = [];
  let searchFilter = "All";
  let query = "";

  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  function notice(message) {
    const region = document.getElementById("notice");
    region.textContent = message;
    region.hidden = false;
    clearTimeout(notice.timer);
    notice.timer = setTimeout(() => { region.hidden = true; }, 6000);
  }

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(stored)) saved = stored.filter((id) => byId.has(id));
  } catch (error) {
    console.error("ILUD could not read saved fixes", error);
    window.addEventListener("DOMContentLoaded", () => notice("Saved fixes are unavailable in this browser."), { once: true });
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
    } catch (error) {
      console.error("ILUD could not store saved fixes", error);
      notice("This browser could not save your fixes.");
    }
  }

  function destination(entry, text) {
    const url = new URL(entry.url);
    if (url.protocol !== "https:") throw new Error("Unsupported destination: " + entry.id);
    if (entry.queryParam && text.trim()) url.searchParams.set(entry.queryParam, text.trim());
    return url.href;
  }

  function item(entry) {
    return `<button class="result" type="button" data-open="${escape(entry.id)}">
      <span class="result-icon" aria-hidden="true">${escape(entry.symbol)}</span>
      <span class="result-copy"><strong>${escape(entry.title)}</strong><small>${escape(entry.summary)}</small></span>
      <span class="result-arrow" aria-hidden="true">↗</span>
    </button>`;
  }

  function filters(active) {
    return ["All", ...new Set(entries.map((entry) => entry.category))].map((category) =>
      `<button type="button" class="filter ${active === category ? "active" : ""}" data-filter="${escape(category)}" aria-pressed="${active === category}">${escape(category)}</button>`
    ).join("");
  }

  function results() {
    const list = document.getElementById("results");
    const term = query.trim().toLocaleLowerCase();
    const matches = entries.filter((entry) =>
      (searchFilter === "All" || entry.category === searchFilter) &&
      (!term || [entry.title, entry.summary, entry.service, entry.category, ...entry.tags].join(" ").toLocaleLowerCase().includes(term))
    );
    document.getElementById("result-count").textContent = `${matches.length} ${matches.length === 1 ? "route" : "routes"}`;
    list.innerHTML = matches.length ? matches.map(item).join("") : `<p class="empty">No routes match. Try another service or outcome.</p>`;
  }

  function openBrowse(category = "All") {
    searchFilter = category;
    query = "";
    document.getElementById("filters").innerHTML = filters(searchFilter);
    const input = document.getElementById("catalog-search");
    input.value = "";
    results();
    document.getElementById("browser").showModal();
    input.focus();
  }

  function openSaved() {
    searchFilter = "All";
    query = "";
    document.getElementById("filters").innerHTML = filters("All");
    const list = document.getElementById("results");
    document.getElementById("result-count").textContent = `${saved.length} saved`;
    list.innerHTML = saved.length
      ? saved.map((id) => item(byId.get(id))).join("")
      : `<p class="empty">No saved routes yet. Open a route and choose “Save” to keep it here.</p>`;
    document.getElementById("catalog-search").value = "";
    document.getElementById("browser").showModal();
  }

  function open(id) {
    const entry = byId.get(id);
    if (!entry) {
      notice("That route is no longer in the catalogue.");
      return;
    }
    const browser = document.getElementById("browser");
    if (browser.open) browser.close();
    const detail = document.getElementById("detail");
    const href = escape(destination(entry, ""));
    const steps = entry.steps.map((step) => `<li>${escape(step)}</li>`).join("");
    detail.innerHTML = `
      <div class="detail-inner">
        <button type="button" class="close" data-close aria-label="Close route">×</button>
        <p class="eyebrow">${escape(entry.category)} / ${escape(entry.service)}</p>
        <div class="detail-symbol" aria-hidden="true">${escape(entry.symbol)}</div>
        <h2>${escape(entry.title)}</h2>
        <p class="detail-summary">${escape(entry.summary)}</p>
        <div class="detail-actions">
          ${entry.queryParam ? `<label class="query-label" for="route-query">What are you looking for?</label>
          <input id="route-query" type="search" autocomplete="off" placeholder="${escape(entry.placeholder || "Type your search")}" />` : ""}
          <a id="route-link" class="primary-link" href="${href}" target="_blank" rel="noopener noreferrer">${escape(entry.action)} <span aria-hidden="true">↗</span></a>
          <button type="button" class="save-button" data-save="${escape(entry.id)}" aria-pressed="${saved.includes(id)}">${saved.includes(id) ? "Saved ✓" : "Save this route +"}</button>
        </div>
        <p class="route-type">${escape(entry.type)} · ${escape(entry.platform)}</p>
        <h3>How to use it</h3><ol class="steps">${steps}</ol>
        <p class="caveat"><strong>Good to know</strong><br>${escape(entry.caveat)}</p>
        <details><summary>Source &amp; method</summary><p>${escape(entry.method)}</p>
          <p>Source reviewed ${escape(entry.checked)}. This is a documentation check, not a live test of every device or account.</p>
          <a class="source-link" href="${escape(entry.source)}" target="_blank" rel="noopener noreferrer">Read the original source ↗</a>
        </details>
      </div>`;
    const search = detail.querySelector("#route-query");
    if (search) search.addEventListener("input", () => {
      detail.querySelector("#route-link").href = destination(entry, search.value);
    });
    detail.showModal();
  }

  function init() {
    document.body.insertAdjacentHTML("beforeend", `
      <dialog id="browser" class="ilud-dialog browser-dialog" aria-label="Browse the catalogue">
        <div class="dialog-bar"><span class="eyebrow">ILUD / ROUTES</span><button type="button" class="close" data-close aria-label="Close catalogue">×</button></div>
        <h2>Find your way.</h2>
        <label class="sr-only" for="catalog-search">Search the catalogue</label>
        <input id="catalog-search" type="search" autocomplete="off" placeholder="Search a service or a problem…" />
        <div id="filters" class="filters" aria-label="Filter by category"></div>
        <p id="result-count" class="count"></p><div id="results" class="results"></div>
      </dialog>
      <dialog id="detail" class="ilud-dialog detail-dialog" aria-label="Route details"></dialog>
      <div id="notice" class="notice" role="status" hidden></div>`);
    document.getElementById("catalog-search").addEventListener("input", (event) => {
      query = event.target.value;
      results();
    });
    document.body.addEventListener("click", (event) => {
      const target = event.target.closest("[data-open],[data-browse],[data-saved],[data-filter],[data-close],[data-save]");
      if (!target) return;
      if (target.dataset.open) open(target.dataset.open);
      else if (target.hasAttribute("data-browse")) openBrowse(target.dataset.browse || "All");
      else if (target.hasAttribute("data-saved")) openSaved();
      else if (target.dataset.filter) {
        searchFilter = target.dataset.filter;
        document.getElementById("filters").innerHTML = filters(searchFilter);
        results();
      } else if (target.hasAttribute("data-close")) target.closest("dialog").close();
      else if (target.dataset.save) {
        const id = target.dataset.save;
        saved = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
        persist();
        target.textContent = saved.includes(id) ? "Saved ✓" : "Save this route +";
        target.setAttribute("aria-pressed", String(saved.includes(id)));
      }
    });
    document.querySelectorAll("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    });
    document.addEventListener("keydown", (event) => {
      if ((event.key === "/" || (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey))) &&
          !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        if (!document.querySelector("dialog[open]")) openBrowse();
        else if (document.getElementById("browser").open) document.getElementById("catalog-search").focus();
      }
    });
  }

  window.ILUD = { init, open, openBrowse, openSaved, destination, entries, item };
})();
