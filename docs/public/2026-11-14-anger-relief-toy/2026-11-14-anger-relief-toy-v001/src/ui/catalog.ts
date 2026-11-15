import { catalog } from "../generated/catalog";
import { defaults, options, record } from "../sdk/validation";
import type { Descriptor, Options } from "../sdk/types";
export interface Preferences {
  favorites: string[];
  recent: string[];
  options: Options;
}
export async function preferences(): Promise<Preferences> {
  const data = await chrome.storage.local.get("preferences");
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
export const icon = (e: Descriptor, size = 28): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${e.icon}"/></svg>`;
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
function button(text: string, action: () => void, className = ""): HTMLButtonElement {
  const node = el("button", className, text);
  node.type = "button";
  node.onclick = action;
  return node;
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
  },
): Promise<void> {
  const prefs = await preferences();
  let mode = "All tools";
  let query = "";
  let category = "All categories";
  root.replaceChildren();
  root.className = "art-app";
  const header = el("header", "brand");
  const logo = el("span", "brand-mark", "a!");
  header.append(
    logo,
    el("strong", "", "Anger Relief Toy"),
    el("span", "version", "Local. Temporary. Yours."),
  );
  if (commands.close) header.append(button("Close", commands.close, "quiet"));
  root.append(header);
  const hero = el("section", "hero");
  const heroCopy = el("div");
  heroCopy.append(
    el("h1", "", "A little harmless havoc."),
    el("p", "", "Break the mood. Keep the page."),
  );
  const toy = el("div", "hero-toy");
  toy.innerHTML =
    '<svg width="150" height="100" viewBox="0 0 150 100" aria-hidden="true"><g transform="rotate(-7 75 50)"><rect x="17" y="15" width="110" height="70" rx="12" fill="#fff" stroke="#574569" stroke-width="2"/><path d="M32 35h40m-40 12h65m-65 12h49" stroke="#bdb0cd" stroke-width="4" stroke-linecap="round"/></g><path d="m101 8 4 17 20-7-9 18 23 5-21 10 10 17-23-5-7 19-9-19-18 6 6-20-20-7 22-8-7-18 21 6z" fill="#f5c86b" stroke="#574569" stroke-width="2"/><text x="82" y="49" fill="#574569" font-size="17" font-weight="900" transform="rotate(-8 98 45)">POW</text></svg>';
  hero.append(heroCopy, toy);
  root.append(hero);
  const toolbar = el("div", "toolbar");
  const search = el("input", "search");
  search.type = "search";
  search.placeholder = "Find a tool. Try 'break'...";
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
    await chrome.storage.local.set({ preferences: prefs });
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
      tile.style.setProperty("--tool", entry.color);
      const use = button(
        "",
        () => {
          void (async () => {
            status.textContent = `Preparing ${entry.name}...`;
            try {
              await launch(entry.id, prefs.options);
              prefs.recent = [entry.id, ...prefs.recent.filter((id) => id !== entry.id)].slice(
                0,
                16,
              );
              await save();
              status.textContent =
                entry.scope === "element"
                  ? `${entry.name} ready. Choose something on the page.`
                  : `${entry.name} started. Press Escape to restore.`;
            } catch {
              status.textContent =
                "Open an ordinary webpage, then click the extension again. Browser settings and store pages are protected.";
            }
          })();
        },
        "tool-use",
      );
      use.setAttribute("aria-label", `Use ${entry.name}`);
      const art = el("div", "tool-art");
      art.innerHTML = icon(entry, 38);
      art.append(
        el(
          "span",
          "scope",
          entry.scope === "element"
            ? "Aim + click"
            : entry.scope === "document"
              ? "Whole page"
              : "Screen",
        ),
      );
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
  if (commands.wheel) footer.append(button("Open action wheel", commands.wheel, "primary"));
  footer.append(button("Stop all", commands.stop, "stop"));
  root.append(footer);
  const details = el("details", "settings");
  details.append(el("summary", "", "Settings, credits & help"));
  const fields = el("div", "settings-grid");
  for (const [label, key, min, max, step] of [
    ["Strength", "strength", 0.2, 1, 0.1],
    ["Auto-restore (seconds)", "duration", 1, 10, 1],
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
      "Click a tool, then aim at an element. Use Tab to cycle targets and Enter to select. Escape restores everything. Alt+Shift+A opens your wheel. Scroll, resize, navigation and hidden tabs stop effects safely. Top frame only; form fields and embedded content are protected.",
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
  details.append(credits);
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
  details.append(diagnostic);
  root.append(details);
  renderGrid();
}
