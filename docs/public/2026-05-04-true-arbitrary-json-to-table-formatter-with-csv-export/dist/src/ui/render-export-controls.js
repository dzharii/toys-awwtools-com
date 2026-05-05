export function renderExportControls(viewModel, refs, handlers = {}) {
  refs.exportControlsContainer.replaceChildren();

  const panel = document.createElement("div");
  panel.className = "jti-mini-panel";
  const title = document.createElement("p");
  title.className = "jti-mini-title";
  title.textContent = `Export target: ${viewModel.meta.totalMatchingRows} rows · ${viewModel.meta.visibleColumns} columns`;
  panel.append(title);

  const actions = document.createElement("div");
  actions.className = "jti-inline-actions";
  const copyCsv = document.createElement("button");
  copyCsv.type = "button";
  copyCsv.textContent = "Copy CSV";
  copyCsv.addEventListener("click", () => handlers.onCopyCsv?.());
  const copyTsv = document.createElement("button");
  copyTsv.type = "button";
  copyTsv.textContent = "Copy TSV";
  copyTsv.addEventListener("click", () => handlers.onCopyTsv?.());
  const downloadCsv = document.createElement("button");
  downloadCsv.type = "button";
  downloadCsv.textContent = "Download CSV";
  downloadCsv.addEventListener("click", () => handlers.onDownloadCsv?.());
  actions.append(copyCsv, copyTsv, downloadCsv);
  panel.append(actions);

  refs.exportControlsContainer.append(panel);
}

