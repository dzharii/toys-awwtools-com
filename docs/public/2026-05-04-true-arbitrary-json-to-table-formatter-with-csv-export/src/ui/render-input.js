function makeErrorText(error) {
  if (!error) return "";
  const lines = [];
  lines.push(error.title || "Invalid JSON");
  lines.push("");
  lines.push(error.userMessage || "Could not parse input.");
  if (Number.isFinite(error.line) || Number.isFinite(error.column)) {
    lines.push(`Location: line ${error.line ?? "?"}, column ${error.column ?? "?"}.`);
  }
  lines.push("");
  lines.push(`Problem: ${error.message}`);
  if (error.snippet) {
    lines.push("");
    lines.push("Nearby text:");
    for (const item of error.snippet.before || []) lines.push(item);
    if (error.snippet.line) lines.push(error.snippet.line);
    if (error.snippet.pointer) lines.push(error.snippet.pointer);
    for (const item of error.snippet.after || []) lines.push(item);
  }
  if (error.hint) {
    lines.push("");
    lines.push(error.hint);
  }
  return lines.join("\n");
}

export function renderInputState(state, refs) {
  const error = state.parseError;
  if (error && state.parseStatus === "invalid") {
    refs.parseAlert.hidden = false;
    refs.parseAlert.textContent = makeErrorText(error);
    refs.jumpToErrorButton.removeAttribute("disabled");
    refs.copyErrorButton.removeAttribute("disabled");
  } else {
    refs.parseAlert.hidden = true;
    refs.parseAlert.textContent = "";
    refs.jumpToErrorButton.setAttribute("disabled", "");
    refs.copyErrorButton.setAttribute("disabled", "");
  }

  const canFormat = state.parseResult?.ok && state.parseResult.kind === "json";
  if (canFormat) {
    refs.formatButton.removeAttribute("disabled");
    refs.formatInputButton.removeAttribute("disabled");
  } else {
    refs.formatButton.setAttribute("disabled", "");
    refs.formatInputButton.setAttribute("disabled", "");
  }
}

export function buildCopyableErrorText(parseError) {
  return makeErrorText(parseError);
}
