(function () {
  "use strict";

  const HEX = "0123456789abcdef";
  const GUID_MASK = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
  const SETTINGS_KEY = "guid_slot_machine_settings_v2";
  const LUCKY_SCORE_KEY = "guid_slot_machine_lucky_score_v1";
  const HEX_WORDS_CACHE_KEY = "guid_slot_machine_hexwords_cache_v1";
  const HEX_WORDS_SOURCE = "hexwords.txt";
  const HEX_WORDS_LIST_MARKER = "And now, all 1196 words.";
  const COPY_FEEDBACK_MS = 1100;
  const STRIP_REPEAT_COUNT = 24;
  const CYCLE_SYMBOL_COUNT = HEX.length;
  const REST_REPEAT_INDEX = 4;
  const LANDING_REPEAT_INDEX = 12;
  const MIN_VIEWPORT_SYMBOL_RATIO = 2.35;
  const MAX_VIEWPORT_SYMBOL_RATIO = 3.8;
  const LUCKY_MIN_TRIGGER_POINTS = 2;
  const LUCKY_HIGHLIGHT_DELAY_MS = 90;
  const LUCKY_HIGHLIGHT_MS = 900;
  const LUCKY_BANNER_MS = 3000;
  const LUCKY_CLEANUP_MS = 1100;

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
    guidMachine: document.querySelector(".guid-machine"),
    scoreHud: document.getElementById("score-hud"),
    luckyScoreValue: document.getElementById("lucky-score-value"),
    luckyScoreDelta: document.getElementById("lucky-score-delta"),
    luckyBanner: document.getElementById("lucky-banner"),
    luckyBannerKicker: document.getElementById("lucky-banner-kicker"),
    luckyBannerTitle: document.getElementById("lucky-banner-title"),
    luckyBannerSub: document.getElementById("lucky-banner-sub"),
    luckyParticles: document.getElementById("lucky-particles"),
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
    luckyScore: 0,
    lucky: {
      rewardTimer: 0,
      cleanupTimer: 0,
      bannerTimer: 0,
      hudBurstTimer: 0,
      scoreDeltaTimer: 0,
      lastRewardedRunId: 0,
      activeRunId: 0,
      activePayload: null,
      hexWords: new Set(),
      hexWordsReady: false,
      hexWordsLoadTried: false,
    },
  };

  init();

  function init() {
    buildDisplayDom();
    applySettingsToUi();
    updateButtons();
    state.luckyScore = loadLuckyScore();
    renderLuckyScore(state.luckyScore);
    preloadHexWords();

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
    document.addEventListener("pointerdown", handleLuckyDismissInteraction, { passive: true });
    document.addEventListener("keydown", handleLuckyDismissInteraction);

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
    clearLuckyFeedbackVisuals();
    resetCopyFeedbackVisuals();
    clearTimeout(state.pillResetTimer);
    state.lucky.activeRunId = runId;
    state.lucky.activePayload = null;

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
    scheduleLuckyEvaluation(runId);
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

  function loadLuckyScore() {
    try {
      const raw = localStorage.getItem(LUCKY_SCORE_KEY);
      if (!raw) return 0;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) return 0;
      return Math.floor(value);
    } catch (error) {
      return 0;
    }
  }

  function saveLuckyScore() {
    try {
      localStorage.setItem(LUCKY_SCORE_KEY, String(Math.max(0, Math.floor(state.luckyScore || 0))));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function renderLuckyScore(value) {
    if (!dom.luckyScoreValue) return;
    dom.luckyScoreValue.textContent = String(Math.max(0, Math.floor(value || 0)));
  }

  function preloadHexWords() {
    if (state.lucky.hexWordsLoadTried) return;
    state.lucky.hexWordsLoadTried = true;

    const cached = readCachedHexWords();
    if (cached && cached.size) {
      state.lucky.hexWords = cached;
      state.lucky.hexWordsReady = true;
    }

    if (typeof fetch !== "function") {
      if (!state.lucky.hexWordsReady) seedFallbackHexWords();
      return;
    }

    fetch(HEX_WORDS_SOURCE, { cache: "no-store" })
      .then((res) => (res && res.ok ? res.text() : Promise.reject(new Error("hexwords fetch failed"))))
      .then((text) => {
        const parsed = parseHexWordsText(text);
        if (!parsed.size) return;
        state.lucky.hexWords = parsed;
        state.lucky.hexWordsReady = true;
        cacheHexWords(parsed);
      })
      .catch(() => {
        if (!state.lucky.hexWordsReady) seedFallbackHexWords();
      });
  }

  function readCachedHexWords() {
    try {
      const raw = localStorage.getItem(HEX_WORDS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      const set = new Set();
      for (const item of parsed) {
        if (typeof item === "string" && /^[a-f0-9]{3,}$/i.test(item)) {
          set.add(item.toLowerCase());
        }
      }
      return set;
    } catch (error) {
      return null;
    }
  }

  function cacheHexWords(hexWordSet) {
    try {
      const list = Array.from(hexWordSet).sort((a, b) => a.length - b.length || a.localeCompare(b));
      localStorage.setItem(HEX_WORDS_CACHE_KEY, JSON.stringify(list));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function seedFallbackHexWords() {
    state.lucky.hexWords = new Set([
      "deadbeef",
      "cafebabe",
      "c0ffee",
      "f00d",
      "f005ba11",
      "ba5eba11",
      "b01dface",
      "defec8",
      "face",
      "feed",
      "deaf",
      "fade",
    ]);
    state.lucky.hexWordsReady = true;
  }

  function parseHexWordsText(text) {
    const input = String(text || "");
    const markerIndex = input.indexOf(HEX_WORDS_LIST_MARKER);
    let listSection = input;
    if (markerIndex >= 0) {
      const markerEnd = input.indexOf("\n", markerIndex);
      listSection = markerEnd >= 0 ? input.slice(markerEnd + 1) : input.slice(markerIndex + HEX_WORDS_LIST_MARKER.length);
    }
    const matches = listSection.toLowerCase().match(/\b[a-f0-9]{3,}\b/g) || [];
    const set = new Set();
    for (const token of matches) {
      if (token.length >= 3) set.add(token);
    }
    return set;
  }

  function scheduleLuckyEvaluation(runId) {
    clearTimeout(state.lucky.rewardTimer);
    state.lucky.rewardTimer = window.setTimeout(() => {
      if (runId !== state.runId || state.spinning) return;
      evaluateLuckyResultForRun(runId);
    }, LUCKY_HIGHLIGHT_DELAY_MS);
  }

  function evaluateLuckyResultForRun(runId) {
    if (runId !== state.runId) return;
    if (state.lucky.lastRewardedRunId === runId) return;

    const guid = state.settledGuid || state.targetGuid;
    if (!guid) return;

    const reward = analyzeLuckyGuid(guid, runId);
    if (!reward) return;

    applyLuckyReward(reward);
  }

  function analyzeLuckyGuid(guid, runId) {
    const analysis = buildGuidAnalysis(guid);
    if (!analysis || analysis.hex.length !== 32) return null;

    const matches = [];
    pushMatches(matches, detectRepeatMatches(analysis));
    pushMatches(matches, detectHexRunMatches(analysis));
    pushMatches(matches, detectPalindromeMatches(analysis));
    pushMatches(matches, detectRepeatedChunkMatches(analysis));
    pushMatches(matches, detectDominanceMatches(analysis));
    pushMatches(matches, detectHexWordMatches(analysis));

    if (!matches.length) return null;

    const uniqueMatches = dedupeMatches(matches);
    const totalPoints = uniqueMatches.reduce((sum, match) => sum + Math.max(0, match.score || 0), 0);
    if (totalPoints < LUCKY_MIN_TRIGGER_POINTS) return null;

    const tier = tierForPoints(totalPoints);
    const primaryMatch = choosePrimaryLuckyMatch(uniqueMatches, tier);
    const label = buildLuckyLabel(primaryMatch, uniqueMatches, totalPoints, tier);
    const highlightPositions = uniqueSortedNumbers(
      uniqueMatches.flatMap((match) => Array.isArray(match.positions) ? match.positions : [])
    );
    const hexWordPositions = uniqueSortedNumbers(
      uniqueMatches
        .filter((match) => match.type === "hexword")
        .flatMap((match) => Array.isArray(match.positions) ? match.positions : [])
    );

    return {
      runId,
      guid,
      totalPoints,
      tier,
      matches: uniqueMatches,
      primaryMatch,
      label,
      highlightPositions,
      hexWordPositions,
    };
  }

  function buildGuidAnalysis(guid) {
    const mapToGuid = [];
    let hex = "";
    for (let i = 0; i < guid.length; i += 1) {
      const ch = guid[i];
      if (ch === "-") continue;
      hex += ch.toLowerCase();
      mapToGuid.push(i);
    }
    return {
      guid,
      hex,
      mapToGuid,
    };
  }

  function pushMatches(target, nextMatches) {
    if (!Array.isArray(nextMatches)) return;
    for (const match of nextMatches) {
      if (match) target.push(match);
    }
  }

  function detectRepeatMatches(analysis) {
    const out = [];
    const hex = analysis.hex;
    let i = 0;
    while (i < hex.length) {
      let j = i + 1;
      while (j < hex.length && hex[j] === hex[i]) j += 1;
      const len = j - i;
      if (len >= 2) {
        let score = 1;
        let label = "Double Hit";
        let priority = 20;
        let subtype = "pair";
        if (len === 3) {
          score = 4;
          label = "Triple Lock";
          priority = 32;
          subtype = "triple";
        } else if (len >= 4) {
          score = 10 + Math.max(0, len - 4) * 2;
          label = len >= 6 ? "Jackpot Rune" : "Quad Lock";
          priority = 42 + Math.min(4, len - 4);
          subtype = "quadplus";
        }

        const raw = hex.slice(i, j);
        out.push({
          type: "repeat",
          subtype,
          raw,
          score,
          priority,
          label,
          positions: analysisPositionsToGuid(analysis, i, j),
          ranges: [{ analysisStart: i, analysisEnd: j }],
          visualWeight: len,
          key: "repeat:" + i + ":" + j + ":" + raw,
        });
      }
      i = j;
    }
    return out;
  }

  function detectHexRunMatches(analysis) {
    const out = [];
    const hex = analysis.hex;
    const vals = Array.from(hex, (ch) => hexIndex(ch));
    let i = 0;
    while (i < vals.length - 2) {
      const diff = vals[i + 1] - vals[i];
      if (diff !== 1 && diff !== -1) {
        i += 1;
        continue;
      }
      let j = i + 2;
      while (j < vals.length && vals[j] - vals[j - 1] === diff) j += 1;
      const len = j - i;
      if (len >= 3) {
        const score = len >= 5 ? 10 : len === 4 ? 5 : 2;
        out.push({
          type: "hexrun",
          subtype: diff > 0 ? "ascending" : "descending",
          raw: hex.slice(i, j),
          score,
          priority: 26 + Math.min(10, len),
          label: "Hex Streak",
          positions: analysisPositionsToGuid(analysis, i, j),
          ranges: [{ analysisStart: i, analysisEnd: j }],
          visualWeight: len,
          key: "hexrun:" + i + ":" + j + ":" + diff,
        });
      }
      i = j - 1;
    }
    return out;
  }

  function detectPalindromeMatches(analysis) {
    const hex = analysis.hex;
    const candidates = [];
    const maxLen = Math.min(8, hex.length);
    for (let len = maxLen; len >= 3; len -= 1) {
      for (let start = 0; start + len <= hex.length; start += 1) {
        const raw = hex.slice(start, start + len);
        if (!isPalindrome(raw)) continue;
        if (/^([0-9a-f])\1+$/.test(raw)) continue;
        candidates.push({
          type: "palindrome",
          raw,
          score: len >= 4 ? 5 : 2,
          priority: 25 + len,
          label: "Mirror Echo",
          positions: analysisPositionsToGuid(analysis, start, start + len),
          ranges: [{ analysisStart: start, analysisEnd: start + len }],
          visualWeight: len,
          key: "pal:" + start + ":" + (start + len) + ":" + raw,
        });
      }
    }

    const used = new Set();
    const selected = [];
    for (const candidate of candidates.sort(compareMatchPriority)) {
      if (candidate.positions.some((p) => used.has(p))) continue;
      selected.push(candidate);
      for (const p of candidate.positions) used.add(p);
    }
    return selected;
  }

  function detectRepeatedChunkMatches(analysis) {
    const hex = analysis.hex;
    const candidates = [];
    for (let len = 4; len >= 2; len -= 1) {
      const map = new Map();
      for (let start = 0; start + len <= hex.length; start += 1) {
        const raw = hex.slice(start, start + len);
        if (/^([0-9a-f])\1+$/.test(raw)) continue;
        if (!map.has(raw)) map.set(raw, []);
        map.get(raw).push(start);
      }

      for (const [raw, starts] of map.entries()) {
        if (starts.length < 2) continue;
        const spans = [];
        let lastEnd = -1;
        for (const start of starts) {
          if (start < lastEnd) continue;
          spans.push([start, start + len]);
          lastEnd = start + len;
          if (spans.length >= 3) break;
        }
        if (spans.length < 2) continue;

        const positions = uniqueSortedNumbers(
          spans.flatMap((span) => analysisPositionsToGuid(analysis, span[0], span[1]))
        );
        candidates.push({
          type: "chunk",
          raw,
          score: 3,
          priority: 22 + len,
          label: "Replay Pattern",
          positions,
          ranges: spans.map((span) => ({ analysisStart: span[0], analysisEnd: span[1] })),
          visualWeight: len,
          key: "chunk:" + raw + ":" + spans.map((s) => s[0]).join(","),
        });
      }
    }

    const used = new Set();
    const selected = [];
    for (const candidate of candidates.sort(compareMatchPriority)) {
      if (candidate.positions.some((p) => used.has(p))) continue;
      selected.push(candidate);
      for (const p of candidate.positions) used.add(p);
    }
    return selected;
  }

  function detectDominanceMatches(analysis) {
    const buckets = new Map();
    for (let i = 0; i < analysis.hex.length; i += 1) {
      const ch = analysis.hex[i];
      if (!buckets.has(ch)) buckets.set(ch, []);
      buckets.get(ch).push(analysis.mapToGuid[i]);
    }

    let topChar = "";
    let topPositions = [];
    for (const [ch, positions] of buckets.entries()) {
      if (positions.length > topPositions.length) {
        topChar = ch;
        topPositions = positions;
      }
    }
    if (topPositions.length < 6) return [];

    const score = topPositions.length >= 8 ? 7 : 4;
    return [{
      type: "dominance",
      raw: topChar,
      score,
      priority: topPositions.length >= 8 ? 36 : 30,
      label: topPositions.length >= 8 ? "Lucky Cluster" : "Dominant Sigil",
      positions: uniqueSortedNumbers(topPositions),
      ranges: [],
      visualWeight: topPositions.length,
      key: "dom:" + topChar + ":" + topPositions.length,
      extra: { count: topPositions.length },
    }];
  }

  function detectHexWordMatches(analysis) {
    const words = state.lucky.hexWords;
    if (!words || !words.size) return [];

    const hex = analysis.hex;
    const candidates = [];
    const minLen = 4;
    const maxLen = Math.min(12, hex.length);

    for (let len = maxLen; len >= minLen; len -= 1) {
      for (let start = 0; start + len <= hex.length; start += 1) {
        const raw = hex.slice(start, start + len);
        if (!words.has(raw)) continue;
        const decoded = decodeHexWord(raw);
        candidates.push({
          type: "hexword",
          raw,
          decoded,
          score: scoreForHexWord(raw),
          priority: 44 + Math.min(12, len),
          label: "Hex Word",
          positions: analysisPositionsToGuid(analysis, start, start + len),
          ranges: [{ analysisStart: start, analysisEnd: start + len }],
          visualWeight: len + 6,
          key: "hexword:" + start + ":" + (start + len) + ":" + raw,
        });
      }
    }

    const used = new Set();
    const selected = [];
    for (const candidate of candidates.sort(compareMatchPriority)) {
      if (candidate.positions.some((p) => used.has(p))) continue;
      selected.push(candidate);
      for (const p of candidate.positions) used.add(p);
      if (selected.length >= 2) break;
    }
    return selected;
  }

  function scoreForHexWord(raw) {
    const len = String(raw || "").length;
    if (len >= 9) return 12;
    if (len >= 7) return 8;
    if (len >= 5) return 5;
    return 3;
  }

  function decodeHexWord(raw) {
    const map = {
      "0": "o",
      "1": "l",
      "5": "s",
      "7": "t",
      "8": "ate",
    };
    let out = "";
    for (const ch of String(raw || "").toLowerCase()) {
      out += Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch;
    }
    return out;
  }

  function analysisPositionsToGuid(analysis, start, endExclusive) {
    const out = [];
    for (let i = start; i < endExclusive; i += 1) {
      if (analysis.mapToGuid[i] != null) out.push(analysis.mapToGuid[i]);
    }
    return out;
  }

  function dedupeMatches(matches) {
    const seen = new Set();
    const out = [];
    for (const match of matches.sort(compareMatchPriority)) {
      const key = match.key || [
        match.type,
        match.raw,
        (match.positions || []).join(","),
        match.score,
      ].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(match);
    }
    return out;
  }

  function compareMatchPriority(a, b) {
    return (
      (b.priority || 0) - (a.priority || 0) ||
      (b.score || 0) - (a.score || 0) ||
      ((b.positions && b.positions.length) || 0) - ((a.positions && a.positions.length) || 0) ||
      String(a.key || "").localeCompare(String(b.key || ""))
    );
  }

  function isPalindrome(str) {
    const s = String(str || "");
    for (let i = 0, j = s.length - 1; i < j; i += 1, j -= 1) {
      if (s[i] !== s[j]) return false;
    }
    return true;
  }

  function choosePrimaryLuckyMatch(matches, tier) {
    if (!matches.length) return null;
    const sorted = matches.slice().sort(compareMatchPriority);
    if (tier === "jackpot") {
      const hexWord = sorted.find((m) => m.type === "hexword");
      if (hexWord && hexWord.score >= 8) return hexWord;
    }
    return sorted[0];
  }

  function tierForPoints(points) {
    if (points >= 15) return "jackpot";
    if (points >= 8) return "epic";
    if (points >= 4) return "standard";
    return "small";
  }

  function buildLuckyLabel(primaryMatch, matches, totalPoints, tier) {
    const distinctTypes = new Set(matches.map((m) => m.type));
    const primary = primaryMatch || matches[0] || null;

    let title = "Lucky Cluster";
    let kicker = "Lucky GUID";
    let sub = "+" + totalPoints + " points";

    if (tier === "jackpot") {
      title = "Jackpot Rune";
      kicker = "Jackpot";
    } else if (tier === "epic") {
      title = "Epic Lucky GUID";
      kicker = "Epic Hit";
    }

    if (distinctTypes.size >= 3 && tier !== "jackpot") {
      title = "Lucky Cluster";
      kicker = tier === "epic" ? "Epic Combo" : "Combo Hit";
    }

    if (primary) {
      if (primary.type === "repeat") {
        title = primary.label || (primary.subtype === "triple" ? "Triple Lock" : "Double Hit");
        kicker = "Repeat Match";
        sub = primary.raw + " • +" + totalPoints + " points";
      } else if (primary.type === "hexrun") {
        title = "Hex Streak";
        kicker = primary.subtype === "descending" ? "Descending Run" : "Ascending Run";
        sub = primary.raw + " • +" + totalPoints + " points";
      } else if (primary.type === "palindrome") {
        title = "Mirror Echo";
        kicker = "Palindrome";
        sub = primary.raw + " • +" + totalPoints + " points";
      } else if (primary.type === "chunk") {
        title = "Replay Pattern";
        kicker = "Chunk Echo";
        sub = primary.raw + " repeated • +" + totalPoints + " points";
      } else if (primary.type === "dominance") {
        title = primary.label || "Lucky Cluster";
        kicker = "Symbol Dominance";
        const count = primary.extra && primary.extra.count ? primary.extra.count : (primary.positions || []).length;
        sub = primary.raw + " x" + count + " • +" + totalPoints + " points";
      } else if (primary.type === "hexword") {
        title = tier === "jackpot" ? "Jackpot Rune" : "Hex Word Found";
        kicker = "Hex Word";
        const decoded = primary.decoded && primary.decoded !== primary.raw ? primary.decoded : null;
        sub = decoded
          ? primary.raw + " (" + decoded + ") • +" + totalPoints + " points"
          : primary.raw + " • +" + totalPoints + " points";
      }
    }

    if (matches.some((m) => m.type === "hexword") && primary && primary.type !== "hexword") {
      const hexWordMatch = matches.find((m) => m.type === "hexword");
      if (hexWordMatch) {
        const decoded = hexWordMatch.decoded && hexWordMatch.decoded !== hexWordMatch.raw ? hexWordMatch.decoded : hexWordMatch.raw;
        sub = "Hex word " + decoded + " • +" + totalPoints + " points";
      }
    }

    return { title, kicker, sub };
  }

  function applyLuckyReward(reward) {
    if (!reward || reward.runId !== state.runId) return;
    if (state.lucky.lastRewardedRunId === reward.runId) return;

    state.lucky.lastRewardedRunId = reward.runId;
    state.lucky.activePayload = reward;

    awardLuckyScore(reward.totalPoints, reward.tier);
    playLuckyVisuals(reward);

    announce(
      reward.label.title + ". " +
      reward.totalPoints + " points awarded."
    );
  }

  function awardLuckyScore(points, tier) {
    const from = Math.max(0, Math.floor(state.luckyScore || 0));
    const to = from + Math.max(0, Math.floor(points || 0));
    state.luckyScore = to;
    saveLuckyScore();
    animateLuckyScoreValue(from, to, tier);
    pulseScoreHud(points, tier);
  }

  function animateLuckyScoreValue(from, to, tier) {
    if (!dom.luckyScoreValue) return;
    if (from === to) {
      renderLuckyScore(to);
      return;
    }
    if (state.settings.reducedMotion) {
      renderLuckyScore(to);
      return;
    }

    if (state.lucky.scoreAnimRafId) {
      window.cancelAnimationFrame(state.lucky.scoreAnimRafId);
      state.lucky.scoreAnimRafId = 0;
    }

    const duration = tier === "jackpot" ? 760 : tier === "epic" ? 640 : 480;
    const startAt = performance.now();

    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - startAt) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(lerp(from, to, eased));
      renderLuckyScore(current);
      if (t < 1) {
        state.lucky.scoreAnimRafId = window.requestAnimationFrame(tick);
      } else {
        state.lucky.scoreAnimRafId = 0;
        renderLuckyScore(to);
      }
    };

    state.lucky.scoreAnimRafId = window.requestAnimationFrame(tick);
  }

  function pulseScoreHud(points, tier) {
    if (!dom.scoreHud) return;

    clearTimeout(state.lucky.hudBurstTimer);
    clearTimeout(state.lucky.scoreDeltaTimer);

    dom.scoreHud.dataset.tier = tier;
    dom.scoreHud.classList.remove("is-burst");
    void dom.scoreHud.offsetWidth;
    dom.scoreHud.classList.add("is-burst");

    state.lucky.hudBurstTimer = window.setTimeout(() => {
      dom.scoreHud.classList.remove("is-burst");
    }, 680);

    if (dom.luckyScoreDelta) {
      dom.luckyScoreDelta.textContent = "+" + points;
      dom.luckyScoreDelta.classList.remove("is-active");
      void dom.luckyScoreDelta.offsetWidth;
      dom.luckyScoreDelta.classList.add("is-active");
      state.lucky.scoreDeltaTimer = window.setTimeout(() => {
        if (dom.luckyScoreDelta) dom.luckyScoreDelta.classList.remove("is-active");
      }, 800);
    }
  }

  function playLuckyVisuals(reward) {
    clearTimeout(state.lucky.cleanupTimer);
    clearTimeout(state.lucky.bannerTimer);

    showLuckyBanner(reward);
    applyLuckyHighlights(reward);
    spawnLuckyParticles(reward);

    state.lucky.cleanupTimer = window.setTimeout(() => {
      if (state.runId !== reward.runId) return;
      clearLuckyTransientHighlightClasses();
      clearLuckyParticles();
      if (dom.guidMachine) {
        dom.guidMachine.classList.remove("has-lucky-glow");
        dom.guidMachine.removeAttribute("data-lucky-tier");
      }
    }, LUCKY_CLEANUP_MS);

    state.lucky.bannerTimer = window.setTimeout(() => {
      if (state.runId !== reward.runId) return;
      hideLuckyBanner();
    }, LUCKY_BANNER_MS);
  }

  function showLuckyBanner(reward) {
    if (!dom.luckyBanner) return;
    dom.luckyBanner.setAttribute("aria-hidden", "false");
    dom.luckyBanner.dataset.tier = reward.tier;
    if (dom.luckyBannerKicker) dom.luckyBannerKicker.textContent = reward.label.kicker;
    if (dom.luckyBannerTitle) dom.luckyBannerTitle.textContent = reward.label.title;
    if (dom.luckyBannerSub) dom.luckyBannerSub.textContent = reward.label.sub;
    dom.luckyBanner.classList.remove("is-active");
    void dom.luckyBanner.offsetWidth;
    dom.luckyBanner.classList.add("is-active");
  }

  function hideLuckyBanner() {
    if (!dom.luckyBanner) return;
    dom.luckyBanner.classList.remove("is-active");
    dom.luckyBanner.setAttribute("aria-hidden", "true");
    clearTimeout(state.lucky.bannerTimer);
    state.lucky.bannerTimer = 0;
  }

  function applyLuckyHighlights(reward) {
    clearLuckyHighlightClasses();

    const highlightSet = new Set(reward.highlightPositions || []);
    const hexWordSet = new Set(reward.hexWordPositions || []);
    let order = 0;

    for (const reel of state.reels) {
      const guidIndex = reel.guidIndex;
      if (!highlightSet.has(guidIndex)) continue;
      reel.root.classList.add("is-lucky-match", "is-lucky-pulse");
      if (reward.tier === "epic") reel.root.classList.add("is-lucky-epic");
      if (reward.tier === "jackpot") reel.root.classList.add("is-lucky-jackpot");
      if (hexWordSet.has(guidIndex)) reel.root.classList.add("is-hexword-match");
      reel.root.style.setProperty("--lucky-delay", String(order * 22) + "ms");
      order += 1;
    }

    if (dom.guidMachine) {
      dom.guidMachine.dataset.luckyTier = reward.tier;
      dom.guidMachine.classList.remove("has-lucky-glow");
      if (reward.tier !== "small") {
        void dom.guidMachine.offsetWidth;
        dom.guidMachine.classList.add("has-lucky-glow");
      }
    }
  }

  function clearLuckyHighlightClasses() {
    for (const reel of state.reels) {
      reel.root.classList.remove(
        "is-lucky-match",
        "is-lucky-pulse",
        "is-lucky-epic",
        "is-lucky-jackpot",
        "is-hexword-match"
      );
      reel.root.style.removeProperty("--lucky-delay");
    }
  }

  function clearLuckyTransientHighlightClasses() {
    for (const reel of state.reels) {
      reel.root.classList.remove("is-lucky-pulse");
      reel.root.style.removeProperty("--lucky-delay");
    }
  }

  function handleLuckyDismissInteraction(event) {
    if (!dom.luckyBanner) return;
    if (dom.luckyBanner.getAttribute("aria-hidden") === "true") return;

    const type = event && event.type;
    if (type === "keydown") {
      const key = event.key || "";
      if (key === "Shift" || key === "Control" || key === "Alt" || key === "Meta" || key === "CapsLock") {
        return;
      }
    }

    hideLuckyBanner();
  }

  function clearLuckyFeedbackVisuals() {
    clearTimeout(state.lucky.rewardTimer);
    clearTimeout(state.lucky.cleanupTimer);
    clearTimeout(state.lucky.bannerTimer);
    clearTimeout(state.lucky.hudBurstTimer);
    clearTimeout(state.lucky.scoreDeltaTimer);

    if (state.lucky.scoreAnimRafId) {
      window.cancelAnimationFrame(state.lucky.scoreAnimRafId);
      state.lucky.scoreAnimRafId = 0;
      renderLuckyScore(state.luckyScore);
    }

    clearLuckyHighlightClasses();
    hideLuckyBanner();
    clearLuckyParticles();
    if (dom.guidMachine) {
      dom.guidMachine.classList.remove("has-lucky-glow");
      dom.guidMachine.removeAttribute("data-lucky-tier");
    }
    if (dom.scoreHud) {
      dom.scoreHud.classList.remove("is-burst");
      dom.scoreHud.removeAttribute("data-tier");
    }
    if (dom.luckyScoreDelta) {
      dom.luckyScoreDelta.classList.remove("is-active");
      dom.luckyScoreDelta.textContent = "";
    }
  }

  function spawnLuckyParticles(reward) {
    if (!dom.luckyParticles) return;
    clearLuckyParticles();

    const reduced = Boolean(state.settings.reducedMotion);
    const countByTier = {
      small: 0,
      standard: reduced ? 4 : 8,
      epic: reduced ? 6 : 14,
      jackpot: reduced ? 8 : 20,
    };
    const count = countByTier[reward.tier] || 0;
    if (!count) return;

    const colors = particleColorsForTier(reward.tier);
    for (let i = 0; i < count; i += 1) {
      const p = document.createElement("span");
      p.className = "lucky-particle " + (reduced ? "is-glint" : "is-live");
      p.style.left = randomFloat(12, 88).toFixed(1) + "%";
      p.style.top = randomFloat(36, 84).toFixed(1) + "%";
      p.style.background = colors[i % colors.length];
      p.style.width = (reduced ? 4 : randomInt(3, 6)) + "px";
      p.style.height = (reduced ? 4 : randomInt(3, 6)) + "px";
      p.style.setProperty("--dx", randomInt(-42, 42) + "px");
      p.style.setProperty("--dy", randomInt(-48, -10) + "px");
      p.style.setProperty("--r", randomInt(-220, 220) + "deg");
      p.style.setProperty("--s", String((randomFloat(0.85, 1.35)).toFixed(2)));
      dom.luckyParticles.appendChild(p);
    }
  }

  function clearLuckyParticles() {
    if (!dom.luckyParticles) return;
    dom.luckyParticles.innerHTML = "";
  }

  function particleColorsForTier(tier) {
    if (tier === "jackpot") {
      return [
        "rgba(255, 140, 107, 0.95)",
        "rgba(255, 200, 87, 0.95)",
        "rgba(255, 255, 255, 0.9)",
      ];
    }
    if (tier === "epic") {
      return [
        "rgba(255, 200, 87, 0.94)",
        "rgba(255, 241, 214, 0.9)",
        "rgba(98, 216, 143, 0.85)",
      ];
    }
    if (tier === "standard") {
      return [
        "rgba(122, 234, 166, 0.92)",
        "rgba(214, 239, 255, 0.88)",
      ];
    }
    return ["rgba(139, 215, 255, 0.84)"];
  }

  function uniqueSortedNumbers(values) {
    const set = new Set();
    for (const value of values || []) {
      if (Number.isInteger(value)) set.add(value);
    }
    return Array.from(set).sort((a, b) => a - b);
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
