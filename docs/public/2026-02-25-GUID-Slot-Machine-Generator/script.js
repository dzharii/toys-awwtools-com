(function () {
  "use strict";

  const HEX = "0123456789abcdef";
  const GUID_MASK = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
  const SETTINGS_KEY = "guid_slot_machine_settings_v2";
  const COPY_FEEDBACK_MS = 1100;
  const STRIP_REPEAT_COUNT = 24;
  const CYCLE_SYMBOL_COUNT = HEX.length;
  const REST_REPEAT_INDEX = 4;
  const LANDING_REPEAT_INDEX = 12;
  const MIN_VIEWPORT_SYMBOL_RATIO = 2.35;
  const MAX_VIEWPORT_SYMBOL_RATIO = 3.8;

  const SPEED_PRESETS = {
    normal: {
      label: "Normal",
      spinLeadMs: 500,
      staggerMs: 28,
      jitterMs: 14,
      velocitySymbolsPerSec: 30,
      velocityVariance: 0.14,
      settleMs: 210,
      settleJitterMs: 26,
      overshootUnits: 0.18,
      minForwardCycles: 3,
      forcedSettleMs: 90,
      forcedOvershootUnits: 0.08,
      forcedMinForwardCycles: 1,
    },
    fast: {
      label: "Fast",
      spinLeadMs: 360,
      staggerMs: 20,
      jitterMs: 10,
      velocitySymbolsPerSec: 35,
      velocityVariance: 0.12,
      settleMs: 170,
      settleJitterMs: 20,
      overshootUnits: 0.15,
      minForwardCycles: 2,
      forcedSettleMs: 72,
      forcedOvershootUnits: 0.06,
      forcedMinForwardCycles: 1,
    },
    turbo: {
      label: "Turbo",
      spinLeadMs: 230,
      staggerMs: 12,
      jitterMs: 7,
      velocitySymbolsPerSec: 42,
      velocityVariance: 0.1,
      settleMs: 128,
      settleJitterMs: 14,
      overshootUnits: 0.11,
      minForwardCycles: 1,
      forcedSettleMs: 56,
      forcedOvershootUnits: 0.04,
      forcedMinForwardCycles: 0,
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
    generateBtnLabel: document.querySelector("#generate-btn .btn-label"),
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
    reels: [],
    positions: [],
    geometry: {
      symbolHeightPx: 0,
      glyphWidthPx: 0,
      reelWidthPx: 0,
      viewportHeightPx: 0,
      centerTopPx: 0,
      viewportSymbolRatio: 0,
      stripSymbols: STRIP_REPEAT_COUNT * CYCLE_SYMBOL_COUNT,
      stripMaxLandingUnits: STRIP_REPEAT_COUNT * CYCLE_SYMBOL_COUNT - 3,
    },
    animation: null,
    copyFeedbackTimer: 0,
    pillResetTimer: 0,
    panelFlashTimer: 0,
    resizeTimer: 0,
    lastGeometryRatioWarning: "",
  };

  init();

  function init() {
    buildDisplayDom();
    applySettingsToUi();
    updateButtons();

    measureGeometry();
    resetReelsToNeutral();

    dom.generateBtn.addEventListener("click", startSpin);
    if (dom.stopBtn) {
      dom.stopBtn.addEventListener("click", handleRevealNow);
    }
    dom.copyBtn.addEventListener("click", handleCopy);
    if (dom.reducedMotionToggle) {
      dom.reducedMotionToggle.addEventListener("change", handleReducedMotionToggle);
    }

    for (const button of dom.speedButtons) {
      button.addEventListener("click", () => handleSpeedChange(button.dataset.speed));
    }

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    if (document.fonts && typeof document.fonts.ready === "object") {
      document.fonts.ready.then(() => {
        if (measureGeometry()) {
          renderAllReels();
        }
      });
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
      const reducedMotion =
        typeof parsed.reducedMotion === "boolean" ? parsed.reducedMotion : defaults.reducedMotion;
      return {
        speed: "normal",
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
      // Ignore storage failures.
    }
  }

  function applySettingsToUi() {
    if (dom.reducedMotionToggle) {
      dom.reducedMotionToggle.checked = Boolean(state.settings.reducedMotion);
    }
    dom.body.classList.toggle("reduce-motion", Boolean(state.settings.reducedMotion));
    dom.body.classList.toggle("allow-full-motion", !state.settings.reducedMotion);

    for (const button of dom.speedButtons) {
      const selected = button.dataset.speed === state.settings.speed;
      button.setAttribute("aria-pressed", String(selected));
    }

    if (dom.speedPill) {
      dom.speedPill.textContent = SPEED_PRESETS[state.settings.speed].label;
    }
  }

  function handleSystemMotionChange(event) {
    if (state.settings.explicitReducedMotionChoice) return;
    state.settings.reducedMotion = Boolean(event.matches);
    applySettingsToUi();
    saveSettings();
  }

  function handleReducedMotionToggle() {
    if (!dom.reducedMotionToggle) return;
    state.settings.reducedMotion = dom.reducedMotionToggle.checked;
    state.settings.explicitReducedMotionChoice = true;
    applySettingsToUi();
    saveSettings();

    if (state.spinning) {
      setStatus("Reduced motion updated. Current reveal keeps its current timing.");
      return;
    }

    setStatus(
      state.settings.reducedMotion
        ? "Reduced motion enabled. Future reveals use shorter, calmer reel motion."
        : "Reduced motion disabled. Future reveals use full reel motion."
    );
  }

  function handleSpeedChange(nextSpeed) {
    if (!SPEED_PRESETS[nextSpeed] || state.settings.speed === nextSpeed) return;
    state.settings.speed = nextSpeed;
    applySettingsToUi();
    saveSettings();
    setStatus("Speed set to " + SPEED_PRESETS[nextSpeed].label + ".");
  }

  function buildDisplayDom() {
    const fragment = document.createDocumentFragment();
    state.reels = [];
    state.positions = [];

    for (let i = 0; i < GUID_MASK.length; i += 1) {
      const maskChar = GUID_MASK[i];
      if (maskChar === "-") {
        const sep = document.createElement("span");
        sep.className = "guid-separator";
        sep.dataset.index = String(i);
        sep.textContent = "-";
        fragment.appendChild(sep);
        state.positions.push({ type: "hyphen", guidIndex: i, root: sep });
        continue;
      }

      const root = document.createElement("span");
      root.className = "reel-position";
      root.dataset.index = String(i);

      const frame = document.createElement("span");
      frame.className = "reel-frame";

      const viewport = document.createElement("span");
      viewport.className = "reel-viewport";

      const strip = document.createElement("span");
      strip.className = "reel-strip";

      const stripFragment = document.createDocumentFragment();
      for (let repeat = 0; repeat < STRIP_REPEAT_COUNT; repeat += 1) {
        for (let s = 0; s < CYCLE_SYMBOL_COUNT; s += 1) {
          const symbol = document.createElement("span");
          symbol.className = "reel-symbol";
          symbol.textContent = HEX[s];
          stripFragment.appendChild(symbol);
        }
      }
      strip.appendChild(stripFragment);
      viewport.appendChild(strip);
      frame.appendChild(viewport);
      root.appendChild(frame);
      fragment.appendChild(root);

      const reel = {
        guidIndex: i,
        root,
        frame,
        viewport,
        strip,
        phase: "idle",
        targetChar: "0",
        targetSymbolIndex: 0,
        offsetUnits: 0,
        spinVelocityUnitsPerMs: 0,
        stopAtMs: 0,
        settleStartMs: 0,
        settleDurationMs: 0,
        settleFromUnits: 0,
        settleOvershootUnits: 0,
        settleToUnits: 0,
      };

      const reelIndex = state.reels.push(reel) - 1;
      state.positions.push({ type: "reel", guidIndex: i, root, reelIndex });
    }

    dom.guidDisplay.innerHTML = "";
    dom.guidDisplay.appendChild(fragment);
  }

  function measureGeometry() {
    const firstReel = state.reels[0];
    if (!firstReel) return false;

    const symbolEl = firstReel.strip.querySelector(".reel-symbol");
    if (!symbolEl) return false;

    const symbolHeightPx = symbolEl.getBoundingClientRect().height;
    const viewportHeightPx = firstReel.viewport.getBoundingClientRect().height;
    if (!symbolHeightPx || !viewportHeightPx) return false;

    const viewportSymbolRatio = viewportHeightPx / symbolHeightPx;

    const glyphWidthPx = measureMaxHexGlyphWidth(symbolEl);
    const reelWidthPx = glyphWidthPx
      ? Math.ceil(glyphWidthPx + Math.max(8, Math.min(16, glyphWidthPx * 0.9)))
      : 0;

    state.geometry.symbolHeightPx = symbolHeightPx;
    state.geometry.glyphWidthPx = glyphWidthPx;
    state.geometry.reelWidthPx = reelWidthPx;
    state.geometry.viewportHeightPx = viewportHeightPx;
    state.geometry.centerTopPx = (viewportHeightPx - symbolHeightPx) / 2;
    state.geometry.viewportSymbolRatio = viewportSymbolRatio;

    if (reelWidthPx > 0) {
      document.documentElement.style.setProperty("--reel-fit-width", reelWidthPx + "px");
    }
    document.documentElement.style.setProperty("--debug-reel-viewport-symbol-ratio", viewportSymbolRatio.toFixed(3));

    const ratioOutOfRange =
      viewportSymbolRatio < MIN_VIEWPORT_SYMBOL_RATIO || viewportSymbolRatio > MAX_VIEWPORT_SYMBOL_RATIO;
    firstReel.viewport.dataset.geometryRatio = viewportSymbolRatio.toFixed(2);
    firstReel.viewport.dataset.geometryState = ratioOutOfRange ? "warn" : "ok";

    if (ratioOutOfRange) {
      const warningKey = viewportSymbolRatio.toFixed(2);
      if (state.lastGeometryRatioWarning !== warningKey) {
        state.lastGeometryRatioWarning = warningKey;
        console.warn(
          "[guid-slot-machine] Reel viewport/symbol ratio is outside expected range:",
          warningKey,
          "(expected " + MIN_VIEWPORT_SYMBOL_RATIO + "-" + MAX_VIEWPORT_SYMBOL_RATIO + ")"
        );
      }
    } else {
      state.lastGeometryRatioWarning = "";
    }

    return true;
  }

  function measureMaxHexGlyphWidth(symbolEl) {
    if (!symbolEl || !document.body) return 0;

    const cs = window.getComputedStyle(symbolEl);
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.position = "fixed";
    probe.style.left = "-9999px";
    probe.style.top = "-9999px";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "pre";
    probe.style.pointerEvents = "none";
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = cs.fontWeight;
    probe.style.fontStyle = cs.fontStyle;
    probe.style.lineHeight = cs.lineHeight;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.style.textTransform = cs.textTransform;
    probe.style.fontVariantNumeric = cs.fontVariantNumeric;
    probe.style.fontFeatureSettings = cs.fontFeatureSettings;

    document.body.appendChild(probe);
    let maxWidth = 0;
    for (const ch of HEX) {
      probe.textContent = ch;
      const width = probe.getBoundingClientRect().width;
      if (width > maxWidth) maxWidth = width;
    }
    probe.remove();
    return maxWidth;
  }

  function handleResize() {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
      if (measureGeometry()) {
        renderAllReels();
      }
    }, 80);
  }

  function resetReelsToNeutral() {
    for (const reel of state.reels) {
      const restChar = "0";
      reel.targetChar = restChar;
      reel.targetSymbolIndex = hexIndex(restChar);
      reel.offsetUnits = alignedUnitsForChar(restChar, REST_REPEAT_INDEX);
      reel.phase = "idle";
      setReelPhaseClass(reel, "idle");
    }
    renderAllReels();
  }

  function startSpin() {
    const runId = ++state.runId;
    cancelFrameLoop();
    clearPanelCelebration();
    resetCopyFeedbackVisuals();
    clearTimeout(state.pillResetTimer);

    const geometryOk = measureGeometry();
    if (!geometryOk || !state.geometry.symbolHeightPx) {
      state.spinning = false;
      state.animation = null;
      updateButtons();
      setSpinPill("Idle", "idle");
      setStatus("Layout is still measuring. Try again.", true);
      return;
    }

    const targetGuid = generateGuid();
    const activeReels = state.reels;
    const config = buildSpeedConfig(state.settings);
    const stopSchedule = buildStopSchedule(activeReels, config);

    state.spinning = true;
    state.targetGuid = targetGuid;
    state.settledGuid = "";
    state.displayChars = targetGuid.split("").map((ch) => (ch === "-" ? "-" : randomHexChar()));

    state.animation = {
      runId,
      config,
      startTime: 0,
      lastTime: 0,
      forcedReveal: false,
      forcedMessage: "",
    };

    for (let reelIndex = 0; reelIndex < activeReels.length; reelIndex += 1) {
      const reel = activeReels[reelIndex];
      reel.targetChar = targetGuid[reel.guidIndex];
      reel.targetSymbolIndex = hexIndex(reel.targetChar);
      reel.phase = "spinning";
      reel.stopAtMs = stopSchedule[reelIndex];
      reel.spinVelocityUnitsPerMs =
        (config.velocitySymbolsPerSec * (1 + randomFloat(-config.velocityVariance, config.velocityVariance))) /
        1000;
      reel.settleStartMs = 0;
      reel.settleDurationMs = 0;
      reel.settleFromUnits = 0;
      reel.settleOvershootUnits = 0;
      reel.settleToUnits = 0;

      const currentVisibleChar = state.displayChars[reel.guidIndex];
      const startChar = isHexChar(currentVisibleChar) ? currentVisibleChar : randomHexChar();
      reel.offsetUnits = alignedUnitsForChar(startChar, REST_REPEAT_INDEX + randomInt(0, 2));

      setReelPhaseClass(reel, "spinning");
      renderReel(reel);
    }

    updateButtons();
    announce("Generating GUID. Reels spinning.");

    state.rafId = window.requestAnimationFrame((now) => frame(now, runId));
  }

  function buildSpeedConfig(settings) {
    const preset = SPEED_PRESETS.normal;
    if (!settings.reducedMotion) {
      return {
        speedKey: "normal",
        speedLabel: preset.label,
        spinLeadMs: preset.spinLeadMs,
        staggerMs: preset.staggerMs,
        jitterMs: preset.jitterMs,
        velocitySymbolsPerSec: preset.velocitySymbolsPerSec,
        velocityVariance: preset.velocityVariance,
        settleMs: preset.settleMs,
        settleJitterMs: preset.settleJitterMs,
        overshootUnits: preset.overshootUnits,
        minForwardCycles: preset.minForwardCycles,
        forcedSettleMs: preset.forcedSettleMs,
        forcedOvershootUnits: preset.forcedOvershootUnits,
        forcedMinForwardCycles: preset.forcedMinForwardCycles,
      };
    }

    return {
      speedKey: "normal",
      speedLabel: preset.label,
      spinLeadMs: Math.max(90, Math.round(preset.spinLeadMs * 0.35)),
      staggerMs: Math.max(5, Math.round(preset.staggerMs * 0.45)),
      jitterMs: Math.max(2, Math.round(preset.jitterMs * 0.35)),
      velocitySymbolsPerSec: Math.max(18, Math.round(preset.velocitySymbolsPerSec * 0.72)),
      velocityVariance: Math.min(0.08, preset.velocityVariance),
      settleMs: Math.max(70, Math.round(preset.settleMs * 0.55)),
      settleJitterMs: Math.max(6, Math.round(preset.settleJitterMs * 0.45)),
      overshootUnits: Math.min(0.09, preset.overshootUnits * 0.55),
      minForwardCycles: Math.min(1, preset.minForwardCycles),
      forcedSettleMs: Math.max(40, Math.round(preset.forcedSettleMs * 0.7)),
      forcedOvershootUnits: Math.min(0.04, preset.forcedOvershootUnits),
      forcedMinForwardCycles: 0,
    };
  }

  function buildStopSchedule(reels, config) {
    const schedule = [];
    let previous = 0;
    for (let rank = 0; rank < reels.length; rank += 1) {
      const reel = reels[rank];
      const boundaryBonus = stopBoundaryBonus(reel.guidIndex);
      let stopAt =
        config.spinLeadMs +
        rank * config.staggerMs +
        boundaryBonus +
        randomInt(-config.jitterMs, config.jitterMs);

      const minStep = Math.max(6, Math.round(config.staggerMs * 0.55));
      stopAt = Math.max(previous + minStep, stopAt);
      previous = stopAt;
      schedule.push(stopAt);
    }
    return schedule;
  }

  function stopBoundaryBonus(guidIndex) {
    if (guidIndex === 7) return 26;
    if (guidIndex === 12) return 20;
    if (guidIndex === 17) return 20;
    if (guidIndex === 22) return 22;
    return 0;
  }

  function frame(now, runId) {
    if (!state.animation || runId !== state.runId || runId !== state.animation.runId) {
      return;
    }

    const animation = state.animation;
    if (!animation.startTime) {
      animation.startTime = now;
      animation.lastTime = now;
    }

    const elapsed = now - animation.startTime;
    const dt = Math.min(34, Math.max(8, now - animation.lastTime || 16));
    animation.lastTime = now;

    let unresolved = 0;

    for (const reel of state.reels) {
      if (reel.phase === "spinning") {
        if (elapsed >= reel.stopAtMs) {
          beginReelSettle(reel, elapsed, animation.config, false);
          unresolved += 1;
          renderReel(reel);
          continue;
        }

        const slowdownWindow = Math.min(180, reel.stopAtMs * 0.22);
        let velocity = reel.spinVelocityUnitsPerMs;
        const timeRemaining = reel.stopAtMs - elapsed;
        reel.root.classList.toggle("is-near-stop", timeRemaining < 140);
        if (timeRemaining < slowdownWindow) {
          const t = timeRemaining / slowdownWindow;
          velocity *= 0.85 + 0.15 * Math.max(0, Math.min(1, t));
        }

        reel.offsetUnits += velocity * dt;
        renderReel(reel);
        unresolved += 1;
        continue;
      }

      if (reel.phase === "settling") {
        const p = Math.min(1, Math.max(0, (elapsed - reel.settleStartMs) / reel.settleDurationMs));
        if (p >= 1) {
          reel.offsetUnits = reel.settleToUnits;
          reel.phase = "settled";
          setReelPhaseClass(reel, "settled");
          state.displayChars[reel.guidIndex] = reel.targetChar;
          renderReel(reel);
        } else {
          reel.offsetUnits = computeSettleUnits(reel, p);
          renderReel(reel);
          unresolved += 1;
        }
        continue;
      }
    }

    if (unresolved === 0) {
      completeSpin(runId, animation.forcedReveal, animation.forcedMessage);
      return;
    }

    state.rafId = window.requestAnimationFrame((nextNow) => frame(nextNow, runId));
  }

  function beginReelSettle(reel, elapsedMs, config, forced) {
    const minForwardCycles = forced ? config.forcedMinForwardCycles : config.minForwardCycles;
    const overshootUnits = forced ? config.forcedOvershootUnits : config.overshootUnits;
    const baseTargetUnits = alignedUnitsForChar(reel.targetChar, LANDING_REPEAT_INDEX);
    const minForwardUnits = minForwardCycles * CYCLE_SYMBOL_COUNT;

    let settleToUnits = baseTargetUnits;
    while (settleToUnits <= reel.offsetUnits + minForwardUnits) {
      settleToUnits += CYCLE_SYMBOL_COUNT;
    }

    if (settleToUnits > state.geometry.stripMaxLandingUnits) {
      const overshootCycles = Math.ceil((settleToUnits - state.geometry.stripMaxLandingUnits) / CYCLE_SYMBOL_COUNT);
      settleToUnits -= overshootCycles * CYCLE_SYMBOL_COUNT;
      reel.offsetUnits -= overshootCycles * CYCLE_SYMBOL_COUNT;
    }

    reel.phase = "settling";
    reel.settleStartMs = elapsedMs;
    reel.settleDurationMs = Math.max(
      40,
      (forced ? config.forcedSettleMs : config.settleMs) + randomInt(-(config.settleJitterMs || 0), config.settleJitterMs || 0)
    );
    reel.settleFromUnits = reel.offsetUnits;
    reel.settleToUnits = settleToUnits;
    reel.settleOvershootUnits = settleToUnits + overshootUnits;

    setReelPhaseClass(reel, "settling");
  }

  function computeSettleUnits(reel, progress) {
    if (progress <= 0) return reel.settleFromUnits;
    if (progress >= 1) return reel.settleToUnits;

    const split = 0.82;
    if (progress < split) {
      const t = progress / split;
      return lerp(reel.settleFromUnits, reel.settleOvershootUnits, easeOutCubic(t));
    }

    const t = (progress - split) / (1 - split);
    return lerp(reel.settleOvershootUnits, reel.settleToUnits, easeOutCubic(t));
  }

  function handleRevealNow() {
    if (!dom.stopBtn) return;
    if (!state.spinning || !state.animation) return;

    const now = performance.now();
    const elapsed = state.animation.startTime ? now - state.animation.startTime : 0;

    state.animation.forcedReveal = true;
    state.animation.forcedMessage = "Reveal completed early.";

    for (const reel of state.reels) {
      if (reel.phase === "spinning") {
        beginReelSettle(reel, elapsed, state.animation.config, true);
        continue;
      }

      if (reel.phase === "settling") {
        reel.settleFromUnits = reel.offsetUnits;
        reel.settleStartMs = elapsed;
        reel.settleDurationMs = Math.min(reel.settleDurationMs, state.animation.config.forcedSettleMs);
        reel.settleOvershootUnits = reel.settleToUnits + state.animation.config.forcedOvershootUnits;
      }
    }

    announce("Landing reels now.");
  }

  function completeSpin(runId, wasForced, forcedMessage) {
    if (runId !== state.runId) return;

    cancelFrameLoop();

    for (const reel of state.reels) {
      reel.offsetUnits = alignedUnitsForChar(reel.targetChar, LANDING_REPEAT_INDEX);
      reel.phase = "settled";
      setReelPhaseClass(reel, "settled");
      renderReel(reel);
      state.displayChars[reel.guidIndex] = reel.targetChar;
    }

    state.spinning = false;
    state.settledGuid = state.targetGuid;
    state.animation = null;
    updateButtons();

    if (wasForced) {
      announce("GUID reveal completed early.");
    } else {
      announce("GUID ready.");
    }

    celebrateDisplayPanel();
  }

  function cancelFrameLoop() {
    if (state.rafId) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = 0;
    }
  }

  function renderAllReels() {
    for (const reel of state.reels) {
      renderReel(reel);
    }
  }

  function renderReel(reel) {
    if (!state.geometry.symbolHeightPx) return;
    const yPx = state.geometry.centerTopPx - reel.offsetUnits * state.geometry.symbolHeightPx;
    reel.strip.style.transform = "translate3d(0," + yPx.toFixed(2) + "px,0)";
  }

  function setReelPhaseClass(reel, phase) {
    reel.root.classList.remove("is-spinning", "is-settling", "is-settled", "is-near-stop");
    if (phase === "spinning") reel.root.classList.add("is-spinning");
    if (phase === "settling") reel.root.classList.add("is-settling");
    if (phase === "settled") reel.root.classList.add("is-settled");
  }

  function alignedUnitsForChar(ch, repeatIndex) {
    const idx = Math.max(0, hexIndex(ch));
    return repeatIndex * CYCLE_SYMBOL_COUNT + idx;
  }

  function hexIndex(ch) {
    return HEX.indexOf(String(ch || "").toLowerCase());
  }

  function isHexChar(ch) {
    return hexIndex(ch) >= 0;
  }

  function renderGuidTextline() {
    if (!dom.guidTextline) return;
    dom.guidTextline.textContent = state.displayChars.join("");
  }

  function updateButtons() {
    if (dom.stopBtn) {
      dom.stopBtn.disabled = !state.spinning;
    }
    dom.copyBtn.disabled = state.spinning || !state.settledGuid;
    if (dom.generateBtnLabel) {
      dom.generateBtnLabel.textContent = "Generate GUID";
    }
  }

  async function handleCopy() {
    if (state.spinning) return;

    const value = state.settledGuid || state.targetGuid;
    if (!value) {
      announce("Generate a GUID first.");
      return;
    }

    const ok = await copyText(value);
    if (!ok) {
      announce("Copy failed.");
      return;
    }

    dom.copyBtn.classList.add("is-copied");
    dom.copyBtnLabel.textContent = "Copied!";
    announce("GUID copied to clipboard.");

    clearTimeout(state.copyFeedbackTimer);
    state.copyFeedbackTimer = window.setTimeout(() => {
      dom.copyBtn.classList.remove("is-copied");
      dom.copyBtnLabel.textContent = "Copy";
    }, COPY_FEEDBACK_MS);

    clearTimeout(state.pillResetTimer);
  }

  function resetCopyFeedbackVisuals() {
    clearTimeout(state.copyFeedbackTimer);
    dom.copyBtn.classList.remove("is-copied");
    dom.copyBtnLabel.textContent = "Copy";
  }

  function setStatus(message, isError) {
    if (!dom.statusLine) return;
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
    if (!dom.spinStatusPill) return;
    dom.spinStatusPill.textContent = label;
    dom.spinStatusPill.classList.remove("is-spinning", "is-ready", "is-copied");
    if (mode === "spinning") dom.spinStatusPill.classList.add("is-spinning");
    if (mode === "ready") dom.spinStatusPill.classList.add("is-ready");
    if (mode === "copied") {
      dom.spinStatusPill.classList.add("is-ready", "is-copied");
    }
  }

  function celebrateDisplayPanel() {
    if (!dom.displayPanel) return;
    clearPanelCelebration();
    dom.displayPanel.classList.add("is-celebrating");
    state.panelFlashTimer = window.setTimeout(() => {
      dom.displayPanel.classList.remove("is-celebrating");
      state.panelFlashTimer = 0;
    }, state.settings.reducedMotion ? 120 : 460);
  }

  function clearPanelCelebration() {
    clearTimeout(state.panelFlashTimer);
    state.panelFlashTimer = 0;
    if (dom.displayPanel) {
      dom.displayPanel.classList.remove("is-celebrating");
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

  function randomFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
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
