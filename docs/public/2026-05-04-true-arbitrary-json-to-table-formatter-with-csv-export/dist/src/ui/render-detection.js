function confidenceTone(confidence) {
  if (confidence === "high") return "success";
  if (confidence === "medium") return "info";
  if (confidence === "low") return "warning";
  return "neutral";
}

export function renderDetectionState(state, refs) {
  const candidates = state.rowSourceCandidates || [];
  const selected = state.selectedRowSource;
  refs.rowSourceSelect.replaceChildren();

  if (candidates.length === 0) {
    refs.rowSourceSelect.setAttribute("disabled", "");
    refs.rowSourceSelect.append(new Option("Auto", "auto"));
    refs.mappingAlert.setAttribute("tone", state.parseStatus === "invalid" ? "danger" : "info");
    refs.mappingAlert.textContent = state.parseStatus === "invalid"
      ? "Fix parse error before row-source detection can run."
      : "Paste data to detect a row source.";
    refs.detectionReasons.replaceChildren();
    return;
  }

  refs.rowSourceSelect.removeAttribute("disabled");
  for (const candidate of candidates) {
    const label = `${candidate.pathLabel} · ${candidate.rowCount} rows · ${candidate.confidence}`;
    refs.rowSourceSelect.append(new Option(label, candidate.id, false, candidate.id === selected?.id));
  }

  refs.mappingAlert.setAttribute("tone", confidenceTone(selected?.confidence));
  refs.mappingAlert.textContent = selected
    ? `Selected ${selected.pathLabel} (${selected.rowCount} rows, ${selected.confidence} confidence).`
    : "Select a row source.";

  refs.detectionReasons.replaceChildren();
  const reasons = [...(selected?.reasons || []), ...(selected?.warnings || [])];
  if (reasons.length === 0) return;
  for (const reason of reasons.slice(0, 6)) {
    const item = document.createElement("li");
    item.textContent = reason;
    refs.detectionReasons.append(item);
  }
}

