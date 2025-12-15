import { BloomFilter } from "./lib/jasondavies_bloomfilter.js-commit-757f4ad/bloomfilter.js";
import { createLogger } from "./logger.js";
import {
  computeSuggestedParams,
  computeErrorRate,
  formatBits,
  formatProbability,
  parseLines,
  MAX_BITS,
  MAX_K,
} from "./bloom-utils.js";

const VERSION = "1.0";

const els = {
  targetP: document.getElementById("input-target-p"),
  expectedN: document.getElementById("input-expected-n"),
  suggestedM: document.getElementById("suggested-m"),
  suggestedK: document.getElementById("suggested-k"),
  overrideM: document.getElementById("input-m"),
  overrideK: document.getElementById("input-k"),
  computedFpp: document.getElementById("computed-fpp"),
  computedSize: document.getElementById("computed-size"),
  paramError: document.getElementById("param-error"),
  btnCreate: document.getElementById("btn-create"),
  btnDownload: document.getElementById("btn-download"),
  btnAdd: document.getElementById("btn-add"),
  uploadInput: document.getElementById("input-upload"),
  textarea: document.getElementById("textarea-values"),
  addResult: document.getElementById("add-result"),
  statusBanner: document.getElementById("status-banner"),
  statCount: document.getElementById("stat-count"),
  statSize: document.getElementById("stat-size"),
  statFpp: document.getElementById("stat-fpp"),
  statLast: document.getElementById("stat-last"),
  loadedFile: document.getElementById("loaded-file"),
  actionMessage: document.getElementById("action-message"),
  codeSample: document.getElementById("code-sample"),
  logPanel: document.getElementById("log-panel"),
};

const logger = createLogger(els.logPanel);

const state = {
  filter: null,
  nInserted: 0,
  createdAt: null,
  targetError: 0.01,
  expectedCount: 1000,
  suggested: { m: 0, k: 0 },
  manualPinned: { m: false, k: false },
  loadedFileName: "",
  lastAction: "Waiting",
};

function init() {
  els.targetP.value = state.targetError;
  els.expectedN.value = state.expectedCount;
  recomputeSuggestions();
  updateComputedMetrics();
  updateActionStates();
  updateUsageSample();
  attachEvents();
  setStatusBanner("No filter created yet.", "idle");
}

function attachEvents() {
  els.targetP.addEventListener("input", () => {
    state.targetError = parseFloat(els.targetP.value);
    recomputeSuggestions();
    updateComputedMetrics();
    updateUsageSample();
  });

  els.expectedN.addEventListener("input", () => {
    state.expectedCount = parseFloat(els.expectedN.value);
    recomputeSuggestions();
    updateComputedMetrics();
  });

  els.overrideM.addEventListener("input", () => {
    state.manualPinned.m = true;
    updateComputedMetrics();
  });

  els.overrideK.addEventListener("input", () => {
    state.manualPinned.k = true;
    updateComputedMetrics();
  });

  els.textarea.addEventListener("input", updateActionStates);

  els.btnCreate.addEventListener("click", handleCreate);
  els.btnDownload.addEventListener("click", handleDownload);
  els.btnAdd.addEventListener("click", handleAdd);
  els.uploadInput.addEventListener("change", handleUpload);
}

function recomputeSuggestions() {
  const n = Number(els.expectedN.value) || 0;
  const p = Number(els.targetP.value) || 0.01;
  const suggested = computeSuggestedParams(n, p);
  state.suggested = suggested;
  els.suggestedM.textContent = `${suggested.m.toLocaleString()} bits`;
  els.suggestedK.textContent = `${suggested.k} hashes`;
  if (!state.manualPinned.m) els.overrideM.value = suggested.m;
  if (!state.manualPinned.k) els.overrideK.value = suggested.k;
}

function readParams() {
  return {
    m: Math.ceil(Number(els.overrideM.value)),
    k: Math.ceil(Number(els.overrideK.value)),
  };
}

function validateParams(m, k) {
  const errors = [];
  if (!Number.isFinite(m) || m <= 0) errors.push("m (bits) must be a positive number.");
  if (!Number.isInteger(m)) errors.push("m (bits) must be an integer.");
  if (m > MAX_BITS) errors.push(`m is too large for the browser (>${MAX_BITS.toLocaleString()} bits).`);
  if (!Number.isFinite(k) || k <= 0) errors.push("k (hash count) must be a positive number.");
  if (!Number.isInteger(k)) errors.push("k (hash count) must be an integer.");
  if (k > MAX_K) errors.push(`k is too large; keep it under ${MAX_K}.`);
  if (!Number.isFinite(state.targetError) || state.targetError <= 0 || state.targetError >= 1) {
    errors.push("Target p must be between 0 and 1.");
  }
  if (!Number.isFinite(state.expectedCount) || state.expectedCount <= 0) {
    errors.push("Expected item count must be positive.");
  }
  return errors;
}

function updateComputedMetrics() {
  const { m, k } = state.filter ? { m: state.filter.m, k: state.filter.k } : readParams();
  const fpp = computeErrorRate(m, k, state.nInserted);
  const projectedFpp = computeErrorRate(m, k, state.expectedCount);
  const projectedLabel = Number.isFinite(state.expectedCount)
    ? ` | @ n_expected=${Math.round(state.expectedCount)}: ${formatProbability(projectedFpp)}`
    : "";
  els.computedFpp.textContent = `n=${state.nInserted}: ${formatProbability(fpp)}${projectedLabel}`;
  els.computedSize.textContent = formatBits(m);
  els.statCount.textContent = state.nInserted.toLocaleString();
  els.statSize.textContent = formatBits(state.filter ? state.filter.m : m);
  els.statFpp.textContent = formatProbability(fpp);
  updateActionStates();
}

function updateActionStates() {
  const { m, k } = readParams();
  const errors = validateParams(m, k);
  if (errors.length) {
    els.paramError.textContent = errors.join(" ");
    els.btnCreate.disabled = true;
  } else {
    els.paramError.textContent = "";
    els.btnCreate.disabled = false;
  }

  const hasFilter = Boolean(state.filter);
  const hasInput = els.textarea.value.trim().length > 0;
  els.btnAdd.disabled = !hasFilter || !hasInput;
  els.btnDownload.disabled = !hasFilter;
}

function setStatusBanner(text, type = "idle") {
  els.statusBanner.textContent = text;
  els.statusBanner.className = `status-pill status-${type}`;
}

function setActionMessage(text, type = "info") {
  els.actionMessage.textContent = text;
  if (type === "error") {
    els.actionMessage.style.color = "#fca5a5";
  } else if (type === "success") {
    els.actionMessage.style.color = "#bbf7d0";
  } else {
    els.actionMessage.style.color = "";
  }
}

function handleCreate() {
  const { m, k } = readParams();
  const errors = validateParams(m, k);
  if (errors.length) {
    setActionMessage(errors.join(" "), "error");
    logger.error("create-filter-failed", { errors });
    return;
  }
  try {
    state.filter = new BloomFilter(m, k);
    state.nInserted = 0;
    state.createdAt = new Date().toISOString();
    state.loadedFileName = "";
    state.lastAction = "Created";
    els.overrideM.value = state.filter.m;
    els.overrideK.value = state.filter.k;
    state.manualPinned = { m: true, k: true };
    els.loadedFile.textContent = "In-memory";
    setStatusBanner(`Filter ready (m=${state.filter.m.toLocaleString()} bits, k=${state.filter.k})`, "success");
    els.statLast.textContent = "Created";
    logger.log("create-filter", {
      m: state.filter.m,
      k: state.filter.k,
      suggested: state.suggested,
      memory: formatBits(state.filter.m),
    });
    updateComputedMetrics();
    updateUsageSample();
    setActionMessage("New Bloom filter created in memory.", "success");
  } catch (err) {
    setActionMessage("Failed to create filter: " + err.message, "error");
    logger.error("create-filter-failed", { error: err.message });
  }
}

function handleAdd() {
  if (!state.filter) {
    setActionMessage("Create or load a filter first.", "error");
    return;
  }
  const text = els.textarea.value;
  const parsed = parseLines(text);
  if (parsed.values.length === 0) {
    setActionMessage("No values to add. Provide at least one non-empty line.", "error");
    setStatusBanner("Add failed: nothing to add.", "error");
    return;
  }
  const start = performance.now();
  try {
    parsed.values.forEach((value) => state.filter.add(value));
    const elapsedMs = Math.round(performance.now() - start);
    const added = parsed.values.length;
    state.nInserted += added;
    state.lastAction = `Added ${added}`;
    els.statLast.textContent = state.lastAction;
    setStatusBanner(`Added ${added} value(s).`, "success");
    setActionMessage(`Added ${added} value(s) in ${elapsedMs} ms.`, "success");
    els.addResult.textContent = `Added ${added} unique line(s); skipped ${parsed.skippedEmpty} empty and ${parsed.skippedDuplicates} duplicates.`;
    els.addResult.className = "status-pill status-success";
    els.textarea.value = "";
    updateComputedMetrics();
    updateUsageSample();
    logger.log("add-values", {
      added,
      skippedEmpty: parsed.skippedEmpty,
      skippedDuplicates: parsed.skippedDuplicates,
      elapsedMs,
      totalInserted: state.nInserted,
    });
  } catch (err) {
    setStatusBanner("Add failed.", "error");
    setActionMessage("Failed to add values: " + err.message, "error");
    els.addResult.textContent = "Add failed. Input was preserved.";
    els.addResult.className = "status-pill status-error";
    logger.error("add-values-failed", { error: err.message });
  } finally {
    updateActionStates();
  }
}

function buildPayload() {
  return {
    version: VERSION,
    createdAt: state.createdAt || new Date().toISOString(),
    savedAt: new Date().toISOString(),
    bloom: {
      m: state.filter.m,
      k: state.filter.k,
      buckets: Array.from(state.filter.buckets),
    },
    metadata: {
      nInserted: state.nInserted,
      nSession: state.nInserted,
      targetError: state.targetError,
      expectedCount: state.expectedCount,
      suggested: state.suggested,
      lastAction: state.lastAction,
    },
  };
}

function buildFilename() {
  const baseP = Number(state.targetError) || 0;
  const pStr = baseP < 0.001 ? baseP.toExponential(2).replace(/\./g, "-") : baseP.toString().replace(/\./g, "-");
  return `bloom-k${state.filter.k}-m${state.filter.m}-p${pStr}.json`;
}

function handleDownload() {
  if (!state.filter) {
    setActionMessage("Nothing to download yet.", "error");
    return;
  }
  const payload = buildPayload();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = buildFilename();
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setActionMessage(`Downloaded ${filename}`, "success");
  logger.log("download-json", { filename, bytes: json.length });
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
      setStatusBanner("Upload failed.", "error");
      setActionMessage("Could not parse JSON: " + err.message, "error");
      logger.error("upload-json-failed", { error: err.message });
    }
  };
  reader.readAsText(file);
}

function loadFromJson(data, filename) {
  if (!data || typeof data !== "object") {
    throw new Error("JSON root must be an object.");
  }
  if (data.version !== VERSION) {
    throw new Error(`Unsupported version ${data.version || "unknown"}. Expected ${VERSION}.`);
  }
  if (!data.bloom || !Array.isArray(data.bloom.buckets) || typeof data.bloom.k !== "number") {
    throw new Error("Missing bloom.buckets or bloom.k.");
  }
  const bucketsArray = new Uint32Array(data.bloom.buckets);
  const filter = new BloomFilter(bucketsArray, data.bloom.k);
  if (data.bloom.m && data.bloom.m !== filter.m) {
    logger.warn("load-json-mismatch", { providedM: data.bloom.m, derivedM: filter.m });
  }
  state.filter = filter;
  const metadata = data.metadata || {};
  state.nInserted = Number(metadata.nInserted ?? metadata.nSession) || 0;
  state.targetError = Number(metadata.targetError) || state.targetError;
  state.expectedCount = Number(metadata.expectedCount) || state.expectedCount;
  state.suggested = metadata.suggested || state.suggested;
  state.loadedFileName = filename || "uploaded.json";
  state.createdAt = data.createdAt || new Date().toISOString();
  els.targetP.value = state.targetError;
  els.expectedN.value = state.expectedCount;
  els.overrideM.value = filter.m;
  els.overrideK.value = filter.k;
  state.manualPinned = { m: true, k: true };
  els.loadedFile.textContent = state.loadedFileName;
  state.lastAction = "Loaded JSON";
  els.statLast.textContent = state.lastAction;
  updateComputedMetrics();
  updateUsageSample();
  updateActionStates();
  setStatusBanner(`Loaded filter k=${filter.k}, m=${filter.m.toLocaleString()} bits`, "success");
  setActionMessage(`Loaded ${state.loadedFileName}.`, "success");
  logger.log("load-json", {
    filename: filename || "uploaded.json",
    version: data.version,
    m: filter.m,
    k: filter.k,
    nInserted: state.nInserted,
  });
}

function updateUsageSample() {
  if (!state.filter) {
    els.codeSample.textContent = "// Create or load a Bloom filter to see a tailored example.";
    return;
  }
  const filename = state.loadedFileName || buildFilename();
  els.codeSample.textContent = `import { BloomFilter } from "./lib/jasondavies_bloomfilter.js-commit-757f4ad/bloomfilter.js";

async function run() {
  // Load the JSON produced by this editor (e.g., ${filename}).
  const saved = await fetch("${filename}").then((res) => res.json());

  // Recreate the Bloom filter (m = ${state.filter.m} bits, k = ${state.filter.k}).
  const bloom = new BloomFilter(saved.bloom.buckets, saved.bloom.k);
  console.log("Hash functions (k):", bloom.k);

  // Membership checks.
  ["alice", "bob", "carol"].forEach((value) => {
    const maybe = bloom.test(value);
    console.log(value, maybe ? "possibly in set" : "definitely not in set");
  });
}

run();`;
}

init();
