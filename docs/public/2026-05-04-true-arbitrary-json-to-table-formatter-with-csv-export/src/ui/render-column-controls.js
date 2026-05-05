export function renderColumnControls(state, viewModel, refs, handlers = {}) {
  const container = refs.columnControlsContainer;
  container.replaceChildren();

  const panel = document.createElement("div");
  panel.className = "jti-mini-panel";

  const title = document.createElement("p");
  title.className = "jti-mini-title";
  title.textContent = `Columns: ${viewModel.meta.visibleColumns} visible · ${viewModel.meta.hiddenColumns} hidden`;
  panel.append(title);

  const actions = document.createElement("div");
  actions.className = "jti-column-actions";
  const showAll = document.createElement("button");
  showAll.type = "button";
  showAll.textContent = "Show all";
  showAll.addEventListener("click", () => handlers.onShowAll?.());
  const hideAll = document.createElement("button");
  hideAll.type = "button";
  hideAll.textContent = "Hide all non-system";
  hideAll.addEventListener("click", () => handlers.onHideAll?.());
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset defaults";
  reset.addEventListener("click", () => handlers.onResetDefaults?.());
  actions.append(showAll, hideAll, reset);
  panel.append(actions);

  const searchInput = document.createElement("input");
  searchInput.className = "jti-column-search";
  searchInput.placeholder = "Search columns";
  searchInput.value = state.ui?.columnSearchQuery || "";
  searchInput.addEventListener("input", () => handlers.onColumnSearch?.(searchInput.value));
  panel.append(searchInput);

  const query = (state.ui?.columnSearchQuery || "").toLowerCase().trim();
  const visibleSet = new Set(state.visibleColumnKeys || []);
  const list = document.createElement("div");
  list.className = "jti-column-list";
  for (const column of state.columns || []) {
    const matchText = `${column.key} ${column.label}`.toLowerCase();
    if (query && !matchText.includes(query)) continue;
    const item = document.createElement("label");
    item.className = "jti-column-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = visibleSet.has(column.key);
    checkbox.addEventListener("change", () => handlers.onToggleColumn?.(column.key, checkbox.checked));
    const text = document.createElement("span");
    text.textContent = `${column.label} · ${(column.coverageRatio * 100).toFixed(1)}%`;
    item.append(checkbox, text);
    list.append(item);
  }
  panel.append(list);
  container.append(panel);
}

