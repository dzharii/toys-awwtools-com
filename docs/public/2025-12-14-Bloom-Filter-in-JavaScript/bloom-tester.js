import { BloomFilter } from "./lib/jasondavies_bloomfilter.js-commit-757f4ad/bloomfilter.js";
import { createLogger } from "./logger.js";
import { computeErrorRate, formatBits, formatProbability, parseLines } from "./bloom-utils.js";

const VERSION = "1.0";

const els = {
  uploadInput: document.getElementById("input-upload"),
  statusBanner: document.getElementById("status-banner"),
  statSize: document.getElementById("stat-size"),
  statK: document.getElementById("stat-k"),
  statFpp: document.getElementById("stat-fpp"),
  statFile: document.getElementById("stat-file"),
  metaDetails: document.getElementById("meta-details"),
  actionMessage: document.getElementById("action-message"),
  inputSingle: document.getElementById("input-single"),
  btnSingle: document.getElementById("btn-single"),
  singleResult: document.getElementById("single-result"),
  textareaBatch: document.getElementById("textarea-batch"),
  btnBatch: document.getElementById("btn-batch"),
  batchResults: document.getElementById("batch-results"),
  logPanel: document.getElementById("log-panel"),
};

const logger = createLogger(els.logPanel);

const state = {
  filter: null,
  metadata: { nInserted: 0 },
  filename: "",
};

function init() {
  els.uploadInput.addEventListener("change", handleUpload);
  els.btnSingle.addEventListener("click", handleSingleCheck);
  els.btnBatch.addEventListener("click", handleBatchCheck);
  els.inputSingle.addEventListener("input", refreshButtons);
  els.textareaBatch.addEventListener("input", refreshButtons);
  setStatus("Awaiting upload.", "idle");
  refreshButtons();
}

function setStatus(text, type = "idle") {
  els.statusBanner.textContent = text;
  els.statusBanner.className = `status-pill status-${type}`;
}

function handleUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      loadFromJson(data, file.name);
    } catch (err) {
      setStatus("Upload failed.", "error");
      els.actionMessage.textContent = "Could not parse JSON: " + err.message;
      logger.error("tester-upload-failed", { error: err.message });
    }
  };
  reader.readAsText(file);
}

function loadFromJson(data, filename) {
  if (!data || typeof data !== "object") throw new Error("JSON root must be an object.");
  if (data.version !== VERSION) throw new Error(`Unsupported version ${data.version || "unknown"}. Expected ${VERSION}.`);
  if (!data.bloom || !Array.isArray(data.bloom.buckets) || typeof data.bloom.k !== "number") {
    throw new Error("Missing bloom.buckets or bloom.k.");
  }
  const filter = new BloomFilter(new Uint32Array(data.bloom.buckets), data.bloom.k);
  state.filter = filter;
  state.metadata = {
    nInserted: Number(data.metadata?.nInserted ?? data.metadata?.nSession) || 0,
    targetError: data.metadata?.targetError,
    expectedCount: data.metadata?.expectedCount,
  };
  state.filename = filename || "uploaded.json";
  els.statSize.textContent = formatBits(filter.m);
  els.statK.textContent = filter.k;
  const fpp = computeErrorRate(filter.m, filter.k, state.metadata.nInserted);
  els.statFpp.textContent = formatProbability(fpp);
  const metaParts = [
    `version: ${data.version}`,
    `n_session: ${state.metadata.nInserted}`,
  ];
  if (Number.isFinite(state.metadata.targetError)) metaParts.push(`target p: ${state.metadata.targetError}`);
  if (Number.isFinite(state.metadata.expectedCount)) metaParts.push(`expected n: ${state.metadata.expectedCount}`);
  els.metaDetails.textContent = metaParts.join(" · ");
  els.statFile.textContent = state.filename;
  els.inputSingle.value = "";
  els.textareaBatch.value = "";
  els.singleResult.textContent = "Ready to test.";
  els.singleResult.className = "status-pill status-idle";
  els.batchResults.innerHTML = "";
  els.inputSingle.disabled = false;
  els.textareaBatch.disabled = false;
  refreshButtons();
  els.actionMessage.textContent = "Filter loaded. Ready to test values.";
  setStatus(`Loaded filter m=${filter.m.toLocaleString()} bits, k=${filter.k}`, "success");
  logger.log("tester-load-json", {
    filename: state.filename,
    m: filter.m,
    k: filter.k,
    nInserted: state.metadata.nInserted,
  });
}

function handleSingleCheck() {
  if (!state.filter) {
    els.actionMessage.textContent = "Load a filter first.";
    return;
  }
  const value = els.inputSingle.value.trim();
  if (!value) {
    els.actionMessage.textContent = "Enter a value to test.";
    els.singleResult.textContent = "No value entered.";
    els.singleResult.className = "status-pill status-error";
    return;
  }
  const start = performance.now();
  const result = state.filter.test(value);
  const elapsedMs = Math.round(performance.now() - start);
  els.singleResult.textContent = `${value}: ${result ? "possibly in set" : "definitely not in set"}`;
  els.singleResult.className = `status-pill ${result ? "status-success" : "status-error"}`;
  els.actionMessage.textContent = `Checked "${value}" in ${elapsedMs} ms.`;
  logger.log("tester-single-check", { value, result, elapsedMs });
  refreshButtons();
}

function handleBatchCheck() {
  if (!state.filter) {
    els.actionMessage.textContent = "Load a filter first.";
    return;
  }
  const text = els.textareaBatch.value;
  const parsed = parseLines(text, { dedupe: false });
  if (parsed.values.length === 0) {
    els.actionMessage.textContent = "Provide at least one non-empty line.";
    return;
  }
  const start = performance.now();
  const results = parsed.values.map((value) => ({
    value,
    result: state.filter.test(value),
  }));
  const elapsedMs = Math.round(performance.now() - start);
  renderBatchResults(results);
  els.actionMessage.textContent = `Checked ${results.length} value(s) in ${elapsedMs} ms.`;
  logger.log("tester-batch-check", {
    count: results.length,
    elapsedMs,
    skippedEmpty: parsed.skippedEmpty,
    skippedDuplicates: parsed.skippedDuplicates,
  });
  refreshButtons();
}

function renderBatchResults(results) {
  els.batchResults.innerHTML = "";
  results.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "result-item";
    const value = document.createElement("div");
    value.innerHTML = `<div>${entry.value}</div><div class="label">Input</div>`;
    const badge = document.createElement("span");
    badge.className = `badge ${entry.result ? "pass" : "fail"}`;
    badge.textContent = entry.result ? "possibly in set" : "definitely not";
    row.append(value, badge);
    els.batchResults.appendChild(row);
  });
}

function refreshButtons() {
  const hasFilter = Boolean(state.filter);
  const hasSingle = els.inputSingle.value.trim().length > 0;
  const hasBatch = els.textareaBatch.value.trim().length > 0;
  els.btnSingle.disabled = !hasFilter || !hasSingle;
  els.btnBatch.disabled = !hasFilter || !hasBatch;
}

init();
