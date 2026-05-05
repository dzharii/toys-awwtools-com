function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

export function renderHighlightControls(state, refs, handlers = {}) {
  const container = refs.highlightControlsContainer;
  container.replaceChildren();

  const panel = document.createElement("div");
  panel.className = "jti-mini-panel";
  const title = document.createElement("p");
  title.className = "jti-mini-title";
  title.textContent = `Highlights (${state.highlightRules?.length ?? 0})`;
  panel.append(title);

  const list = document.createElement("div");
  list.className = "jti-highlight-list";

  for (const rule of state.highlightRules || []) {
    const row = document.createElement("div");
    row.className = "jti-highlight-row";
    const label = document.createElement("span");
    label.textContent = `${rule.name || "Rule"} · ${rule.columnKey || "*"} ${rule.operator} ${rule.value ?? ""}`;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = rule.enabled === false ? "Enable" : "Disable";
    toggle.addEventListener("click", () => handlers.onToggleRule?.(rule.id, rule.enabled === false));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => handlers.onDeleteRule?.(rule.id));
    row.append(label, toggle, remove);
    list.append(row);
  }
  panel.append(list);

  const form = document.createElement("form");
  form.className = "jti-highlight-form";
  const columnSelect = document.createElement("select");
  columnSelect.append(createOption("*", "Any visible column"));
  for (const column of state.columns || []) {
    columnSelect.append(createOption(column.key, column.label));
  }

  const operatorSelect = document.createElement("select");
  operatorSelect.append(
    createOption("contains", "contains"),
    createOption("equals", "equals"),
    createOption("gt", "gt"),
    createOption("lt", "lt"),
    createOption("exists", "exists"),
    createOption("missing", "missing")
  );
  const valueInput = document.createElement("input");
  valueInput.placeholder = "value";
  const toneSelect = document.createElement("select");
  toneSelect.append(
    createOption("danger", "danger"),
    createOption("warning", "warning"),
    createOption("info", "info"),
    createOption("success", "success"),
    createOption("custom", "custom")
  );
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#ffd166";
  const add = document.createElement("button");
  add.type = "submit";
  add.textContent = "Add rule";
  form.append(columnSelect, operatorSelect, valueInput, toneSelect, colorInput, add);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onAddRule?.({
      columnKey: columnSelect.value,
      operator: operatorSelect.value,
      value: valueInput.value,
      style: {
        tone: toneSelect.value,
        backgroundColor: colorInput.value
      }
    });
    valueInput.value = "";
  });

  panel.append(form);
  container.append(panel);
}

