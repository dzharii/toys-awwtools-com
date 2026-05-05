import { buildRowDetails } from "../core/row-details.js";

export function renderRowDetails(state, viewModel, refs, handlers = {}) {
  const selectedRowIndex = state.table?.selectedRowIndex;
  if (!Number.isFinite(selectedRowIndex)) {
    refs.rowDetailsContainer.hidden = true;
    refs.rowDetailsContainer.replaceChildren();
    return;
  }

  const row = viewModel.allMatchingRows?.find((item) => item.rowIndex === selectedRowIndex);
  if (!row) {
    refs.rowDetailsContainer.hidden = true;
    refs.rowDetailsContainer.replaceChildren();
    return;
  }

  const details = buildRowDetails(row, viewModel.visibleColumns);
  refs.rowDetailsContainer.hidden = false;
  refs.rowDetailsContainer.replaceChildren();

  const wrapper = document.createElement("div");
  wrapper.className = "jti-mini-panel";

  const title = document.createElement("p");
  title.className = "jti-mini-title";
  title.textContent = `Row ${details.rowIndex + 1} · ${details.health?.level ?? "unknown"}`;
  wrapper.append(title);

  const reasons = document.createElement("ul");
  reasons.className = "jti-row-reasons";
  for (const reason of details.health?.reasons?.slice(0, 6) || []) {
    const item = document.createElement("li");
    item.textContent = reason.label;
    reasons.append(item);
  }
  wrapper.append(reasons);

  const fields = document.createElement("ul");
  fields.className = "jti-row-fields";
  for (const field of details.nonEmptyFields.slice(0, 16)) {
    const item = document.createElement("li");
    item.textContent = `${field.key}: ${field.display}`;
    fields.append(item);
  }
  wrapper.append(fields);

  const actions = document.createElement("div");
  actions.className = "jti-inline-actions";
  const copyOriginal = document.createElement("button");
  copyOriginal.type = "button";
  copyOriginal.textContent = "Copy Original JSON";
  copyOriginal.addEventListener("click", () => handlers.onCopyOriginalRow?.(details.originalJsonText));
  const copyVisible = document.createElement("button");
  copyVisible.type = "button";
  copyVisible.textContent = "Copy Visible Row JSON";
  copyVisible.addEventListener("click", () => handlers.onCopyVisibleRow?.(details.visibleRowJsonText));
  actions.append(copyOriginal, copyVisible);
  wrapper.append(actions);

  const jsonBlock = document.createElement("pre");
  jsonBlock.className = "jti-json-block";
  jsonBlock.textContent = details.originalJsonText;
  wrapper.append(jsonBlock);

  refs.rowDetailsContainer.append(wrapper);
}

