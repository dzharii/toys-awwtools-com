import { catalog } from "../generated/catalog";
import { defaults, options, record } from "../sdk/validation";
import type { Options } from "../sdk/types";
import { el, button, closeButton, icon } from "./dom";
export interface Preferences {
  favorites: string[];
  recent: string[];
  options: Options;
}
export async function preferences(): Promise<Preferences> {
  let data: Record<string, unknown> = {};
  try {
    data = await chrome.storage.local.get("preferences");
  } catch {
    /* Preferences are optional; keep controls available if local storage is unavailable. */
  }
  const value = record(data.preferences) ? data.preferences : {};
  const ids = (v: unknown) =>
    Array.isArray(v)
      ? v
          .filter((id): id is string => typeof id === "string" && catalog.some((e) => e.id === id))
          .slice(0, 32)
      : [];
  return {
    favorites: Array.isArray(value.favorites)
      ? ids(value.favorites)
      : catalog.slice(0, 4).map((e) => e.id),
    recent: ids(value.recent),
    options: options(value.options),
  };
}
export async function mountCatalog(
  root: HTMLElement,
  launch: (id: string, o: Options) => Promise<void>,
  commands: {
    wheel?: () => void;
    close?: () => void;
    stop: () => void;
    diagnostics: () => Promise<unknown>;
    clearDiagnostics: () => void;
    equipped?: () => string | undefined;
  },
): Promise<void> {
  const prefs = await preferences();
  let mode = "All tools";
  let query = "";
  let category = "All categories";
  root.replaceChildren();
  root.className = "art-app";
  const header = el("header", "brand");
  header.append(el("strong", "", "Anger Relief Toy"));
  if (commands.close) header.append(closeButton("Close tools", commands.close));
  root.append(header, el("h1", "catalog-title", "Choose a tool"));
  const shortcutBar = el("div", "shortcut-bar");
  const openWheel = button("Open action wheel", () => commands.wheel?.(), "shortcut-action");
  const binding = el("kbd", "shortcut-binding");
  shortcutBar.append(openWheel, binding);
  root.append(shortcutBar);
  try {
    const response: unknown = await chrome.runtime.sendMessage({ type: "shortcut" });
    binding.textContent =
      record(response) && typeof response.shortcut === "string" && response.shortcut
        ? response.shortcut
        : "Not assigned";
  } catch {
    binding.textContent = "Unavailable";
  }
  if (binding.textContent === "Not assigned" || binding.textContent === "Unavailable")
    shortcutBar.append(
      el(
        "p",
        "shortcut-help",
        "Assign Open action wheel in your browser's Extensions > Keyboard shortcuts.",
      ),
    );
  const toolbar = el("div", "toolbar");
  const search = el("input", "search");
  search.type = "search";
  search.placeholder = "Search tools";
  search.setAttribute("aria-label", "Search effects");
  search.oninput = () => {
    query = search.value;
    renderGrid();
  };
  const filter = el("select");
  filter.setAttribute("aria-label", "Filter by category");
  for (const name of ["All categories", ...new Set(catalog.map((e) => e.category))]) {
    const option = el("option", "", name);
    filter.append(option);
  }
  filter.onchange = () => {
    category = filter.value;
    renderGrid();
  };
  toolbar.append(search, filter);
  root.append(toolbar);
  const tabs = el("nav", "tabs");
  tabs.setAttribute("aria-label", "Tool collection");
  for (const name of ["All tools", "Favorites", "Recent"]) {
    const tab = button(name, () => {
      mode = name;
      renderGrid();
    });
    tab.dataset.mode = name;
    tabs.append(tab);
  }
  root.append(tabs);
  const grid = el("div", "tool-grid");
  root.append(grid);
  const status = el("p", "status");
  status.setAttribute("role", "status");
  root.append(status);
  async function save(): Promise<void> {
    try {
      await chrome.storage.local.set({ preferences: prefs });
    } catch {
      status.textContent = "Could not save preferences. Try again after freeing extension storage.";
    }
  }
  function renderGrid(): void {
    for (const tab of tabs.querySelectorAll("button")) {
      tab.setAttribute("aria-pressed", String(tab.dataset.mode === mode));
    }
    grid.replaceChildren();
    let entries = catalog.filter(
      (e) =>
        (mode !== "Favorites" || prefs.favorites.includes(e.id)) &&
        (mode !== "Recent" || prefs.recent.includes(e.id)) &&
        (category === "All categories" || e.category === category) &&
        `${e.name} ${e.description} ${e.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );
    if (mode === "Recent")
      entries = entries.sort((a, b) => prefs.recent.indexOf(a.id) - prefs.recent.indexOf(b.id));
    if (!entries.length)
      grid.append(
        el(
          "p",
          "empty",
          mode === "Favorites"
            ? "Star a tool to keep it close."
            : mode === "Recent"
              ? "Your recently used tools will appear here."
              : "No tools match. Try 'glass', 'light' or 'physics'.",
        ),
      );
    for (const entry of entries) {
      const tile = el("article", "tool");
      tile.dataset.id = entry.id;
      tile.setAttribute("data-equipped", String(commands.equipped?.() === entry.id));

      const use = button(
        "",
        () => {
          void (async () => {
            status.textContent = `Preparing ${entry.name}...`;
            try {
              await launch(entry.id, prefs.options);

              status.textContent =
                entry.scope === "element"
                  ? `${entry.name} ready. Choose something on the page.`
                  : `${entry.name} equipped. Put away ends the tool.`;
            } catch {
              status.textContent =
                "Open an ordinary webpage, then click the extension again. Browser settings and store pages are protected.";
            }
          })();
        },
        "tool-use",
      );
      use.setAttribute("aria-label", `Equip ${entry.name}`);
      use.setAttribute("aria-pressed", String(commands.equipped?.() === entry.id));
      const art = el("div", "tool-art");
      art.innerHTML = icon(entry, 38);
      use.append(art, el("h2", "", entry.name), el("p", "", entry.description));
      const star = button(
        prefs.favorites.includes(entry.id) ? "★" : "☆",
        () => {
          if (prefs.favorites.includes(entry.id))
            prefs.favorites = prefs.favorites.filter((id) => id !== entry.id);
          else prefs.favorites.push(entry.id);
          void save();
          renderGrid();
        },
        "favorite",
      );
      star.setAttribute("aria-label", `Favorite ${entry.name}`);
      star.setAttribute("aria-pressed", String(prefs.favorites.includes(entry.id)));
      tile.append(use, star);
      grid.append(tile);
    }
  }
  const footer = el("footer", "footer");
  const putAway = button("Put away", commands.stop, "put-away");
  putAway.disabled = !commands.equipped?.();
  footer.append(putAway);
  root.append(footer);
  const details = el("details", "settings");
  details.append(el("summary", "", "Tool settings"));
  const fields = el("div", "settings-grid");
  for (const [label, key, min, max, step] of [
    ["Strength", "strength", 0.2, 1, 0.1],
    ["One-shot restore after (seconds)", "duration", 1, 10, 1],
    ["Flashlight radius", "radius", 60, 320, 10],
    ["Flashlight darkness", "darkness", 0.3, 0.95, 0.05],
    ["Flashlight softness", "softness", 0, 100, 5],
  ] as const) {
    const wrap = el("label");
    const caption = el("span", "", `${label}: ${prefs.options[key]}`);
    const input = el("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(prefs.options[key]);
    input.oninput = () => {
      prefs.options[key] = Number(input.value);
      caption.textContent = `${label}: ${input.value}`;
      void save();
    };
    wrap.append(caption, input);
    fields.append(wrap);
  }
  const motion = el("label", "motion");
  const checkbox = el("input");
  checkbox.type = "checkbox";
  checkbox.checked = prefs.options.reducedMotion;
  checkbox.onchange = () => {
    prefs.options.reducedMotion = checkbox.checked;
    void save();
  };
  motion.append(
    checkbox,
    document.createTextNode("Reduce motion (system preference also applies)"),
  );
  fields.append(motion);
  details.append(fields);
  details.append(
    el(
      "p",
      "help",
      "Equip a tool, then click elements repeatedly. Tab cycles targets and controls; Enter uses a target. Escape closes an open menu, otherwise puts the tool away. Continuous effects last until ended. Form fields and embedded content are protected.",
    ),
  );
  details.append(
    button(
      "Reset preferences",
      () => {
        prefs.options = { ...defaults };
        prefs.favorites = catalog.slice(0, 4).map((e) => e.id);
        prefs.recent = [];
        void save().then(() => mountCatalog(root, launch, commands));
      },
      "quiet",
    ),
  );
  const credits = el("details");
  credits.append(el("summary", "", "Credits and sources"));
  for (const e of catalog) {
    const p = el("p", "credit");
    p.append(
      el("strong", "", `${e.name}: `),
      document.createTextNode(
        `${e.source.name}, ${e.source.author}. ${e.source.relationship}. ${e.source.license}. `,
      ),
    );
    if (e.source.url) {
      const a = el("a", "", "Source");
      a.href = e.source.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      p.append(a);
    }
    credits.append(p);
  }
  root.append(credits);
  const diagnostic = el("details");
  diagnostic.append(el("summary", "", "Local diagnostics"));
  const pre = el("pre", "diagnostics");
  diagnostic.append(
    button(
      "Clear diagnostics",
      () => {
        commands.clearDiagnostics();
        pre.textContent = "Diagnostics cleared.";
      },
      "quiet",
    ),
  );
  diagnostic.append(
    button(
      "View sanitized report",
      () => {
        void commands.diagnostics().then((data) => {
          pre.textContent = JSON.stringify(data, null, 2);
        });
      },
      "quiet",
    ),
    pre,
  );
  root.append(diagnostic);
  root.append(details);
  renderGrid();
}
