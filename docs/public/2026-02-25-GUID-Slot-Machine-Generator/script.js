(function () {
  "use strict";

  const HEX = "0123456789abcdef";
  const GUID_MASK = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
  const SETTINGS_KEY = "guid_slot_machine_settings_v1";
  const LIVE_COPY_RESET_MS = 1100;

  const SPEED_PRESETS = {
    normal: {
      label: "Normal",
      spinLeadMs: 420,
      staggerMs: 20,
      jitterMs: 10,
      flipMinMs: 22,
      flipMaxMs: 36,
      landHoldMs: 120,
    },
    fast: {
      label: "Fast",
      spinLeadMs: 300,
      staggerMs: 14,
      jitterMs: 8,
      flipMinMs: 18,
      flipMaxMs: 28,
      landHoldMs: 85,
    },
    turbo: {
      label: "Turbo",
      spinLeadMs: 180,
      staggerMs: 9,
      jitterMs: 6,
      flipMinMs: 14,
      flipMaxMs: 22,
      landHoldMs: 60,
    },
  };

  const dom = {
    body: document.body,
    guidDisplay: document.getElementById("guid-display"),
    guidTextline: document.getElementById("guid-textline"),
    generateBtn: document.getElementById("generate-btn"),
    stopBtn: document.getElementById("stop-btn"),
    copyBtn: document.getElementById("copy-btn"),
    copyBtnLabel: document.getElementById("copy-btn-label"),
    reducedMotionToggle: document.getElementById("reduced-motion-toggle"),
    speedButtons: Array.from(document.querySelectorAll("[data-speed]")),
    statusLine: document.getElementById("status-line"),
    srLive: document.getElementById("sr-live"),
    spinStatusPill: document.getElementById("spin-status-pill"),
    speedPill: document.getElementById("speed-pill"),
    displayPanel: document.querySelector(".display-panel"),
  };

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    runId: 0,
    rafId: 0,
    spinning: false,
    targetGuid: "",
    settledGuid: "",
    displayChars: GUID_MASK.split(""),
    settings: loadSettings(),
    cells: [],
    animation: null,
    copyFeedbackTimer: 0,
    pillResetTimer: 0,
    firstSpinCompleted: false,
  };

  init();

  function init() {
    buildGuidCells(GUID_MASK);
    applySettingsToUi();
    renderGuidTextline();
    updateButtons();
    setSpinPill("Idle", "idle");
    setStatus("Ready. Press Generate GUID to spin the reels.");

    dom.generateBtn.addEventListener("click", handleGenerate);
    dom.stopBtn.addEventListener("click", handleRevealNow);
    dom.copyBtn.addEventListener("click", handleCopy);
    dom.reducedMotionToggle.addEventListener("change", handleReducedMotionToggle);

    for (const button of dom.speedButtons) {
      button.addEventListener("click", () => handleSpeedChange(button.dataset.speed));
    }

    if (typeof window.matchMedia === "function") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", handleSystemMotionChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(handleSystemMotionChange);
      }
    }
  }

  function loadSettings() {
    const defaults = {
      speed: "normal",
      reducedMotion: prefersReducedMotion,
      explicitReducedMotionChoice: false,
    };

    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      const speed = SPEED_PRESETS[parsed.speed] ? parsed.speed : defaults.speed;
      const reducedMotion =
        typeof parsed.reducedMotion === "boolean" ? parsed.reducedMotion : defaults.reducedMotion;
      return {
        speed,
        reducedMotion,
        explicitReducedMotionChoice: Boolean(parsed.explicitReducedMotionChoice),
      };
    } catch (error) {
      return defaults;
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    } catch (error) {
      // Ignore storage failures. The app still works without persistence.
    }
  }

  function applySettingsToUi() {
    dom.reducedMotionToggle.checked = Boolean(state.settings.reducedMotion);
    dom.body.classList.toggle("reduce-motion", Boolean(state.settings.reducedMotion));
    dom.body.classList.toggle("allow-full-motion", !state.settings.reducedMotion);

    for (const button of dom.speedButtons) {
      const selected = button.dataset.speed === state.settings.speed;
      button.setAttribute("aria-pressed", String(selected));
    }

    dom.speedPill.textContent = SPEED_PRESETS[state.settings.speed].label;
  }

  function handleSystemMotionChange(event) {
    if (state.settings.explicitReducedMotionChoice) return;
    state.settings.reducedMotion = Boolean(event.matches);
    applySettingsToUi();
    saveSettings();
  }

  function handleReducedMotionToggle() {
    state.settings.reducedMotion = dom.reducedMotionToggle.checked;
    state.settings.explicitReducedMotionChoice = true;
    applySettingsToUi();
    saveSettings();

    if (state.spinning) {
      setStatus("Reduced motion updated. Current spin continues with current timing.");
      return;
    }

    setStatus(
      state.settings.reducedMotion
        ? "Reduced motion enabled. Future reveals will be shorter and calmer."
        : "Reduced motion disabled. Future reveals use full slot effects."
    );
  }

  function handleSpeedChange(nextSpeed) {
    if (!SPEED_PRESETS[nextSpeed]) return;
    if (state.settings.speed === nextSpeed) return;

    state.settings.speed = nextSpeed;
    applySettingsToUi();
    saveSettings();
    setStatus("Speed set to " + SPEED_PRESETS[nextSpeed].label + ".");
  }

  function handleGenerate() {
    startSpin();
  }

  function handleRevealNow() {
    if (!state.spinning) return;
    revealAllImmediately("Reveal completed early.");
  }

  async function handleCopy() {
    if (state.spinning) return;

    const value = state.settledGuid || state.targetGuid;
    if (!value) {
      setStatus("Generate a GUID first.", true);
      return;
    }

    const ok = await copyText(value);
    if (!ok) {
      setStatus("Copy failed. Your browser blocked clipboard access.", true);
      announce("Copy failed.");
      return;
    }

    dom.copyBtn.classList.add("is-copied");
    dom.copyBtnLabel.textContent = "Copied!";
    setStatus("Copied GUID to clipboard.");
    setSpinPill("Copied", "copied");
    announce("GUID copied to clipboard.");

    clearTimeout(state.copyFeedbackTimer);
    state.copyFeedbackTimer = window.setTimeout(() => {
      dom.copyBtn.classList.remove("is-copied");
      dom.copyBtnLabel.textContent = "Copy";
    }, LIVE_COPY_RESET_MS);

    clearTimeout(state.pillResetTimer);
    state.pillResetTimer = window.setTimeout(() => {
      if (!state.spinning) setSpinPill("Ready", "ready");
    }, 900);
  }

  function startSpin() {
    const runId = ++state.runId;
    cancelFrameLoop();
    clearLandingClasses();
    resetCopyFeedbackVisuals();
    clearTimeout(state.pillResetTimer);

    const targetGuid = generateGuid();
    const schedule = buildSpinSchedule(targetGuid, state.settings);
    const displayChars = targetGuid.split("").map((ch) => (ch === "-" ? "-" : randomHexChar()));
    const activeIndices = schedule.activeIndices;

    state.spinning = true;
    state.targetGuid = targetGuid;
    state.settledGuid = "";
    state.displayChars = displayChars;
    state.animation = {
      runId,
      startTime: 0,
      activeIndices,
      stopTimes: schedule.stopTimes,
      nextFlipAt: schedule.nextFlipAt,
      flipIntervals: schedule.flipIntervals,
      settled: new Set(),
      landHoldMs: schedule.landHoldMs,
    };

    for (let i = 0; i < state.cells.length; i += 1) {
      const cell = state.cells[i];
      const char = displayChars[i];
      if (cell.isHyphen) {
        setCellVisual(i, "-", { spinning: false, landed: false });
        continue;
      }
      setCellVisual(i, char, { spinning: true, landed: false });
    }

    renderGuidTextline();
    updateButtons();
    setSpinPill("Spinning", "spinning");
    setStatus(
      "Spinning " + activeIndices.length + " reels. Use Reveal Now if you want to skip the wait."
    );
    announce("Generating GUID. Reels spinning.");

    state.rafId = window.requestAnimationFrame((now) => frameSpin(now, runId));
  }

  function buildSpinSchedule(targetGuid, settings) {
    const activeIndices = [];
    for (let i = 0; i < targetGuid.length; i += 1) {
      if (targetGuid[i] !== "-") activeIndices.push(i);
    }

    const preset = SPEED_PRESETS[settings.speed] || SPEED_PRESETS.normal;
    const reducedMotion = Boolean(settings.reducedMotion);
    const lead = reducedMotion ? Math.max(70, Math.round(preset.spinLeadMs * 0.35)) : preset.spinLeadMs;
    const stagger = reducedMotion ? Math.max(4, Math.round(preset.staggerMs * 0.4)) : preset.staggerMs;
    const jitter = reducedMotion ? Math.max(0, Math.round(preset.jitterMs * 0.35)) : preset.jitterMs;
    const landHoldMs = reducedMotion ? Math.max(28, Math.round(preset.landHoldMs * 0.55)) : preset.landHoldMs;

    const stopTimes = new Map();
    const nextFlipAt = new Map();
    const flipIntervals = new Map();

    let rank = 0;
    let previousStopAt = 0;
    for (const index of activeIndices) {
      const groupOffset = (rank % 4 === 0 ? 6 : 0) + (rank % 7 === 0 ? 5 : 0);
      let stopAt =
        lead +
        rank * stagger +
        groupOffset +
        randomInt(-jitter, jitter);
      stopAt = Math.max(previousStopAt + Math.max(3, Math.round(stagger * 0.45)), stopAt);
      previousStopAt = stopAt;
      stopTimes.set(index, Math.max(40, stopAt));

      const flipMin = reducedMotion ? Math.max(20, preset.flipMinMs + 4) : preset.flipMinMs;
      const flipMax = reducedMotion ? Math.max(flipMin + 2, preset.flipMaxMs + 6) : preset.flipMaxMs;
      flipIntervals.set(index, randomInt(flipMin, flipMax));
      nextFlipAt.set(index, 0);
      rank += 1;
    }

    return {
      activeIndices,
      stopTimes,
      nextFlipAt,
      flipIntervals,
      landHoldMs,
    };
  }

  function frameSpin(now, runId) {
    if (!state.spinning || !state.animation || runId !== state.animation.runId || runId !== state.runId) {
      return;
    }

    const animation = state.animation;
    if (!animation.startTime) animation.startTime = now;
    const elapsed = now - animation.startTime;

    let unresolvedCount = 0;

    for (const index of animation.activeIndices) {
      if (animation.settled.has(index)) continue;

      const stopAt = animation.stopTimes.get(index);
      if (elapsed >= stopAt) {
        settleReel(index, runId);
        continue;
      }

      unresolvedCount += 1;
      const nextFlipAt = animation.nextFlipAt.get(index) || 0;
      if (elapsed >= nextFlipAt) {
        const char = randomHexChar();
        state.displayChars[index] = char;
        const ghostChar = randomHexChar();
        setCellVisual(index, char, { spinning: true, ghostChar });

        const baseInterval = animation.flipIntervals.get(index) || 20;
        const speedup = Math.max(0.75, 1 - elapsed / (stopAt + 120));
        animation.nextFlipAt.set(index, elapsed + Math.max(10, Math.round(baseInterval * speedup)));
      }
    }

    renderGuidTextline();

    if (unresolvedCount === 0) {
      completeSpin(runId, false);
      return;
    }

    state.rafId = window.requestAnimationFrame((nextNow) => frameSpin(nextNow, runId));
  }

  function settleReel(index, runId) {
    if (!state.animation || state.animation.runId !== runId) return;
    if (state.animation.settled.has(index)) return;

    const targetChar = state.targetGuid[index];
    state.animation.settled.add(index);
    state.displayChars[index] = targetChar;
    setCellVisual(index, targetChar, { spinning: false, settling: true, landed: true });

    const localRunId = runId;
    const holdMs = state.animation.landHoldMs;
    window.setTimeout(() => {
      if (localRunId !== state.runId) return;
      const cell = state.cells[index];
      if (!cell || cell.isHyphen) return;
      cell.root.classList.remove("is-settling");
      cell.root.classList.remove("is-landed");
    }, holdMs);
  }

  function revealAllImmediately(statusMessage) {
    if (!state.spinning || !state.animation) return;
    cancelFrameLoop();

    for (const index of state.animation.activeIndices) {
      if (state.animation.settled.has(index)) continue;
      state.animation.settled.add(index);
      const targetChar = state.targetGuid[index];
      state.displayChars[index] = targetChar;
      setCellVisual(index, targetChar, { spinning: false, settling: true, landed: true });
    }

    renderGuidTextline();
    completeSpin(state.runId, true, statusMessage);
  }

  function completeSpin(runId, wasForced, forcedMessage) {
    if (runId !== state.runId) return;
    cancelFrameLoop();

    for (let i = 0; i < state.cells.length; i += 1) {
      if (state.cells[i].isHyphen) continue;
      const finalChar = state.targetGuid[i];
      state.displayChars[i] = finalChar;
      setCellVisual(i, finalChar, {
        spinning: false,
        settling: state.cells[i].root.classList.contains("is-settling"),
        landed: state.cells[i].root.classList.contains("is-landed"),
      });
    }

    state.spinning = false;
    state.settledGuid = state.targetGuid;
    state.animation = null;
    state.firstSpinCompleted = true;
    renderGuidTextline();
    updateButtons();
    setSpinPill("Ready", "ready");

    if (wasForced) {
      setStatus(forcedMessage || "Reveal completed.");
      announce("GUID reveal completed early.");
    } else {
      setStatus("GUID ready. Press Copy or spin again.");
      announce("GUID ready.");
    }

    celebrateDisplayPanel();
  }

  function celebrateDisplayPanel() {
    if (!dom.displayPanel) return;
    dom.displayPanel.classList.remove("is-celebrating");
    void dom.displayPanel.offsetWidth;
    dom.displayPanel.classList.add("is-celebrating");
    window.setTimeout(() => {
      dom.displayPanel.classList.remove("is-celebrating");
    }, state.settings.reducedMotion ? 120 : 520);
  }

  function cancelFrameLoop() {
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  }

  function clearLandingClasses() {
    for (const cell of state.cells) {
      if (!cell || cell.isHyphen) continue;
      cell.root.classList.remove("is-spinning", "is-settling", "is-landed");
    }
  }

  function buildGuidCells(mask) {
    const fragment = document.createDocumentFragment();
    state.cells = [];

    for (let i = 0; i < mask.length; i += 1) {
      const isHyphen = mask[i] === "-";
      const root = document.createElement("span");
      root.className = "reel-cell " + (isHyphen ? "reel-hyphen" : "reel-slot");
      root.dataset.index = String(i);

      const charEl = document.createElement("span");
      charEl.className = "reel-char";
      charEl.textContent = mask[i];
      root.appendChild(charEl);

      let ghostEl = null;
      if (!isHyphen) {
        ghostEl = document.createElement("span");
        ghostEl.className = "reel-ghost";
        ghostEl.setAttribute("aria-hidden", "true");
        ghostEl.textContent = mask[i];
        root.appendChild(ghostEl);
      }

      fragment.appendChild(root);
      state.cells.push({ root, charEl, ghostEl, isHyphen });
    }

    dom.guidDisplay.innerHTML = "";
    dom.guidDisplay.appendChild(fragment);
  }

  function setCellVisual(index, char, options) {
    const cell = state.cells[index];
    if (!cell) return;

    cell.charEl.textContent = char;
    if (cell.ghostEl) {
      cell.ghostEl.textContent = options && options.ghostChar ? options.ghostChar : char;
    }

    if (cell.isHyphen) return;

    const spinning = Boolean(options && options.spinning);
    const settling = Boolean(options && options.settling);
    const landed = Boolean(options && options.landed);

    cell.root.classList.toggle("is-spinning", spinning);
    cell.root.classList.toggle("is-settling", settling);
    cell.root.classList.toggle("is-landed", landed);
  }

  function renderGuidTextline() {
    const value = state.displayChars.join("");
    dom.guidTextline.textContent = value;
  }

  function updateButtons() {
    dom.stopBtn.disabled = !state.spinning;
    dom.copyBtn.disabled = state.spinning || !state.settledGuid;
    dom.generateBtn.querySelector(".btn-label").textContent = state.spinning ? "Respin" : "Generate GUID";
  }

  function resetCopyFeedbackVisuals() {
    clearTimeout(state.copyFeedbackTimer);
    dom.copyBtn.classList.remove("is-copied");
    dom.copyBtnLabel.textContent = "Copy";
  }

  function setStatus(message, isError) {
    dom.statusLine.textContent = message;
    dom.statusLine.classList.toggle("is-error", Boolean(isError));
  }

  function announce(message) {
    dom.srLive.textContent = "";
    window.setTimeout(() => {
      dom.srLive.textContent = message;
    }, 0);
  }

  function setSpinPill(label, mode) {
    dom.spinStatusPill.textContent = label;
    dom.spinStatusPill.classList.remove("is-spinning", "is-ready", "is-copied");
    if (mode === "spinning") dom.spinStatusPill.classList.add("is-spinning");
    if (mode === "ready") dom.spinStatusPill.classList.add("is-ready");
    if (mode === "copied") {
      dom.spinStatusPill.classList.add("is-copied");
      dom.spinStatusPill.classList.add("is-ready");
    }
  }

  function generateGuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return (
      hex.slice(0, 8) +
      "-" +
      hex.slice(8, 12) +
      "-" +
      hex.slice(12, 16) +
      "-" +
      hex.slice(16, 20) +
      "-" +
      hex.slice(20)
    );
  }

  function randomHexChar() {
    return HEX.charAt(Math.floor(Math.random() * HEX.length));
  }

  function randomInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Fall back below.
      }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      return ok;
    } catch (error) {
      return false;
    }
  }
})();
