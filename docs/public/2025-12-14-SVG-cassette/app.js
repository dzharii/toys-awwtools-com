(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const reelLRot = $("#reelLRot");
  const reelRRot = $("#reelRRot");

  const tapeTop = $("#tapeTop");
  const tapeBottom = $("#tapeBottom");
  const tapeMid = $("#tapeMid");

  const tapeLeftFill = $("#tapeLeftFill");
  const tapeRightFill = $("#tapeRightFill");

  const statusLed = $("#statusLed");

  const playBtn = $("#playBtn");
  const stopBtn = $("#stopBtn");
  const rewBtn = $("#rewBtn");
  const ffBtn = $("#ffBtn");
  const playIcon = $("#playIcon");

  const modeText = $("#modeText");
  const timeText = $("#timeText");
  const durText = $("#durText");

  const scrub = $("#scrub");
  const scrubFillInner = $("#scrubFillInner");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const DURATION_SEC = 3 * 60 + 30;
  durText.textContent = fmtTime(DURATION_SEC);

  const state = {
    mode: "stop", // stop | play | ff | rew | pause
    t: 0,
    angle: 0,
    dash: 0,
    lastTs: 0,
    dragging: false
  };

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function modeToSpeed(mode) {
    if (mode === "play") return 1;
    if (mode === "ff") return 4;
    if (mode === "rew") return -4;
    return 0;
  }

  function setMode(mode) {
    if (mode === "pause") {
      state.mode = "pause";
    } else if (mode === "stop") {
      state.mode = "stop";
    } else {
      state.mode = mode;
    }

    const playing = state.mode === "play" || state.mode === "ff" || state.mode === "rew";
    const paused = state.mode === "pause";

    playIcon.textContent = (playing ? "||" : ">");
    modeText.textContent =
      state.mode === "stop" ? "Stopped" :
      state.mode === "pause" ? "Paused" :
      state.mode === "play" ? "Playing" :
      state.mode === "ff" ? "Fast forward" :
      "Rewind";

    statusLed.setAttribute("fill", playing ? "#22c55e" : (paused ? "#60a5fa" : "#94a3b8"));
  }

  function togglePlayPause() {
    if (state.mode === "play") return setMode("pause");
    if (state.mode === "pause") return setMode("play");
    if (state.mode === "ff" || state.mode === "rew") return setMode("play");
    if (state.mode === "stop") return setMode("play");
  }

  function stop() {
    setMode("stop");
  }

  function rew() {
    setMode(state.mode === "rew" ? "play" : "rew");
  }

  function ff() {
    setMode(state.mode === "ff" ? "play" : "ff");
  }

  function setScrubFromTime() {
    const p = (DURATION_SEC <= 0) ? 0 : state.t / DURATION_SEC;
    const v = Math.round(clamp(p, 0, 1) * 1000);
    scrub.value = String(v);
    scrubFillInner.style.width = (v / 10) + "%";
    timeText.textContent = fmtTime(state.t);
  }

  function setTimeFromScrub() {
    const v = Number(scrub.value);
    const p = clamp(v / 1000, 0, 1);
    state.t = p * DURATION_SEC;
    scrubFillInner.style.width = (p * 100) + "%";
    timeText.textContent = fmtTime(state.t);
  }

  function updateReelTapeAmounts() {
    const p = clamp(state.t / DURATION_SEC, 0, 1);

    const minR = 28;
    const maxR = 48;

    const leftR = maxR - (maxR - minR) * p;
    const rightR = minR + (maxR - minR) * p;

    tapeLeftFill.setAttribute("r", leftR.toFixed(2));
    tapeRightFill.setAttribute("r", rightR.toFixed(2));

    const alpha = 0.45 + 0.25 * Math.abs(0.5 - p) * 2;
    tapeLeftFill.setAttribute("opacity", alpha.toFixed(2));
    tapeRightFill.setAttribute("opacity", alpha.toFixed(2));
  }

  function applyTransforms() {
    reelLRot.setAttribute("transform", `rotate(${state.angle.toFixed(2)})`);
    reelRRot.setAttribute("transform", `rotate(${(-state.angle * 1.08).toFixed(2)})`);

    tapeTop.style.strokeDashoffset = String(state.dash.toFixed(2));
    tapeBottom.style.strokeDashoffset = String((state.dash * 1.2).toFixed(2));
    tapeMid.style.strokeDashoffset = String((-state.dash * 0.9).toFixed(2));
  }

  function tick(ts) {
    const now = ts || performance.now();
    const dt = state.lastTs ? (now - state.lastTs) / 1000 : 0;
    state.lastTs = now;

    const speed = modeToSpeed(state.mode);
    if (!state.dragging && speed !== 0) {
      state.t = clamp(state.t + dt * speed, 0, DURATION_SEC);

      const reelDegPerSec = 220;
      state.angle += dt * speed * reelDegPerSec;

      const dashPerSec = 80;
      state.dash += dt * speed * dashPerSec;

      if (state.t <= 0 && speed < 0) setMode("stop");
      if (state.t >= DURATION_SEC && speed > 0) setMode("stop");
    }

    setScrubFromTime();
    updateReelTapeAmounts();
    applyTransforms();

    requestAnimationFrame(tick);
  }

  playBtn.addEventListener("click", togglePlayPause);
  stopBtn.addEventListener("click", stop);
  rewBtn.addEventListener("click", rew);
  ffBtn.addEventListener("click", ff);

  scrub.addEventListener("pointerdown", () => {
    state.dragging = true;
    setMode(state.mode === "stop" ? "stop" : "pause");
  });

  scrub.addEventListener("input", () => {
    setTimeFromScrub();
    updateReelTapeAmounts();
    applyTransforms();
  });

  window.addEventListener("pointerup", () => {
    if (!state.dragging) return;
    state.dragging = false;
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === " " || key === "spacebar") {
      e.preventDefault();
      togglePlayPause();
      return;
    }
    if (key === "s") {
      stop();
      return;
    }
    if (key === "r") {
      rew();
      return;
    }
    if (key === "f") {
      ff();
      return;
    }
  });

  setMode("stop");
  setScrubFromTime();
  updateReelTapeAmounts();
  applyTransforms();
  requestAnimationFrame(tick);
})();
