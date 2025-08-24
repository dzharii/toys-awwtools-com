(function () {
  "use strict";

  // -----------------------------
  // Constants, Utilities, Presets
  // -----------------------------

  const PHASES = ["init", "expand", "shrink", "compute", "updateBest", "final"];
  const MILESTONE_ACTIONS = new Set(["best", "decZeros", "moveLeft", "done", "incZeros", "whileCheck+tooMany"]);
  const MAX_LEN = 200;

  const TEACHING_CODE = [
`function longestSubarray(nums) {          // 1`,
`  let left = 0, zeros = 0, best = 0;      // 2`,
`  for (let right = 0; right < nums.length; ++right) { // 3`,
`    if (nums[right] === 0) ++zeros;       // 4`,
`    while (zeros > 1) {                    // 5`,
`      if (nums[left] === 0) --zeros;      // 6`,
`      ++left;                              // 7`,
`    }                                      // 8`,
`    const score = right - left;            // 9`,
`    if (score > best) best = score;        // 10`,
`  }                                        // 11`,
`  return best;                              // 12`,
`}                                          // 13`,
  ];

  const PRESETS = {
    "example": [1,1,0,1,1,1,0,1],
    "all-ones": [1,1,1,1,1,1],
    "all-zeros": [0,0,0,0,0,0],
    "single-zero-mid": [1,1,1,0,1,1,1],
    "alternating": [1,0,1,0,1,0],
    "single-1": [1],
    "single-0": [0],
  };

  // -----------------------------
  // Input Parsing & Validation
  // -----------------------------
  function parseInput(str) {
    const raw = String(str ?? "").trim();
    if (!raw) return { error: "Enter a binary array." };

    // Split on commas and whitespace, filter empties
    const tokens = raw.split(/[\s,]+/).filter(Boolean);
    const nums = [];

    for (const t of tokens) {
      if (!/^[01]$/.test(t)) return { error: "Only 0 and 1 are allowed." };
      nums.push(Number(t));
      if (nums.length > MAX_LEN) {
        return { error: `Max length is ${MAX_LEN}`, nums: nums.slice(0, MAX_LEN) };
      }
    }

    return { nums };
  }

  function formatArray(nums) {
    return nums.join(" ");
  }

  function randomArray() {
    const len = Math.floor(Math.random() * 12) + 8; // 8..19
    const nums = Array.from({ length: len }, () => Math.random() < 0.5 ? 0 : 1);
    return nums;
  }

  // -----------------------------
  // Algorithm Engine: Step Emitter
  // -----------------------------
  function generateSteps(nums) {
    const steps = [];
    let left = 0, zeros = 0, best = 0;

    pushStep("init", "done", 2);

    for (let right = 0; right < nums.length; ++right) {
      pushStep("expand", "readRight", 3);

      if (nums[right] === 0) {
        ++zeros;
        pushStep("expand", "incZeros", 4);
      } else {
        // Show the while check decision point even when not taken yet.
        pushStep("expand", "whileCheck", 5);
      }

      while (zeros > 1) {
        // Explicit while check step (too many zeros)
        pushStep("shrink", "whileCheck", 5, { tooMany: true });
        if (nums[left] === 0) {
          --zeros;
          pushStep("shrink", "decZeros", 6);
        }
        ++left;
        pushStep("shrink", "moveLeft", 7);
      }

      const score = right - left;
      pushStep("compute", "score", 9, { score });

      if (score > best) {
        best = score;
        pushStep("updateBest", "best", 10);
      }
    }

    pushStep("final", "done", 12);

    return steps;

    function pushStep(phase, action, focusLine, extra = {}) {
      // Determine current right index by peeking into for-loop scope (closure)
      // We access the nearest "right" via arguments.callee.caller frame by capturing it via an outer variable.
      // Instead of relying on that, we infer from the last step when action is 'init'.
      // However, we are in the same scope; "right" is defined in the loop when present.
      let rightIndex;
      try {
        rightIndex = typeof right === "number" ? right : -1;
      } catch {
        rightIndex = -1;
      }

      const windowExists = rightIndex >= left;
      const winLen = windowExists ? (rightIndex - left + 1) : 0;
      const score = windowExists ? (rightIndex - left) : 0;

      const prev = steps[steps.length - 1];
      const bestVal = best; // snapshot before mutation at step creation

      const step = {
        id: steps.length,
        phase,
        action,
        left,
        right: rightIndex,
        zeros,
        best: bestVal,
        winLen,
        score,
        nums: nums.slice(),
        highlight: {
          windowStart: left,
          windowEnd: rightIndex,
          leftChanged: prev ? left !== prev.left : left !== 0,
          rightChanged: prev ? rightIndex !== prev.right : rightIndex !== -1,
          zerosChanged: prev ? zeros !== prev.zeros : zeros !== 0,
          bestChanged: prev ? bestVal !== prev.best : bestVal !== 0,
          changedCells:
            action === "readRight" && rightIndex >= 0 ? [rightIndex] :
            action === "moveLeft" && left - 1 >= 0 ? [left - 1] : []
        },
        codeFocus: { startLine: focusLine ?? 2, endLine: focusLine ?? 2 },
        comment: buildComment(phase, action, { left, right: rightIndex, zeros, best: bestVal, winLen, score, nums, extra })
      };

      steps.push(step);
    }
  }

  function buildComment(phase, action, ctx) {
    const { left, right, zeros, best, score, nums, extra } = ctx;
    const at = (i) => (i >= 0 ? String(nums[i]) : "—");

    if (action === "readRight") return `I include nums[right] into the window (right = ${right}, value ${at(right)}).`;
    if (action === "incZeros") return `I saw a 0, increment zeros ⇒ zeros = ${zeros}.`;
    if (action === "whileCheck") {
      if (extra && extra.tooMany) return `Too many zeros (zeros = ${zeros} > 1), I must shrink from the left.`;
      return `Check while (zeros > 1). It is ${zeros > 1 ? "true" : "false"} (zeros = ${zeros}).`;
    }
    if (action === "decZeros") return `I passed a 0 at left (nums[${left}] was 0), decrement zeros ⇒ zeros = ${zeros}.`;
    if (action === "moveLeft") return `I advanced left by 1 to restore zeros ≤ 1 ⇒ left = ${left}.`;
    if (action === "score") return `I compute score = right − left = ${right} − ${left} = ${score} because one deletion is mandatory.`;
    if (action === "best") return `New best found, update best ⇒ best = ${best}.`;
    if (action === "done") return `The loop ended, return best = ${best}.`;
    return `${phase} / ${action}`;
  }

  // -----------------------------
  // DOM Query Helpers
  // -----------------------------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  // -----------------------------
  // Rendering Module
  // -----------------------------
  const render = (() => {
    let arrayPane, arrayInner, pointerLeft, pointerRight, windowOverlay, zeroLayer, bestLayer;
    let codeBlock;
    let regEl = {};
    let commentEl;
    let timelineEl, barsWrap, handleEl, milestoneEls = [];
    let cellRects = []; // for transforms

    let currentArray = [];
    let lastStep = null;
    let bestSnapshot = null; // { segments: [{start,end}], bracketEnds?: [x1,x2] }

    function initDOM() {
      arrayPane = qs("#arrayPane");
      timelineEl = qs("#timeline");
      codeBlock = qs("#codeBlock");
      commentEl = qs("#commentText");

      // Registers
      regEl.left = qs("#reg-left");
      regEl.right = qs("#reg-right");
      regEl.zeros = qs("#reg-zeros");
      regEl.best = qs("#reg-best");
      regEl.winLen = qs("#reg-winLen");
      regEl.score = qs("#reg-score");

      // Code block lines with stable line numbers
      codeBlock.innerHTML = TEACHING_CODE.map((line, i) => {
        const ln = i + 1;
        return `<div class="line"><span class="ln">${String(ln).padStart(2, " ")}</span><span class="src">${escapeHtml(line)}</span></div>`;
      }).join("");

      // Create array inner container
      arrayInner = document.createElement("div");
      arrayInner.className = "array-inner";
      arrayPane.innerHTML = "";
      arrayPane.appendChild(arrayInner);

      // Overlay elements
      windowOverlay = document.createElement("div");
      windowOverlay.className = "windowOverlay";
      windowOverlay.setAttribute("aria-hidden", "false");
      windowOverlay.innerHTML = `<div class="tooMany" title="Too many zeros"></div>`;
      arrayInner.appendChild(windowOverlay);

      zeroLayer = document.createElement("div");
      zeroLayer.className = "zeroLayer";
      arrayInner.appendChild(zeroLayer);

      bestLayer = document.createElement("div");
      bestLayer.className = "bestLayer";
      arrayInner.appendChild(bestLayer);

      // Pointers
      pointerLeft = document.createElement("div");
      pointerLeft.className = "pointer left";
      pointerLeft.innerHTML = `<div class="label">left</div>⬇`;
      arrayInner.appendChild(pointerLeft);

      pointerRight = document.createElement("div");
      pointerRight.className = "pointer right";
      pointerRight.innerHTML = `<div class="label">right</div>⬇`;
      arrayInner.appendChild(pointerRight);
    }

    function ensureArrayCells(nums) {
      if (arraysEqual(nums, currentArray)) return;

      currentArray = nums.slice();
      arrayInner.querySelectorAll(".cell").forEach(n => n.remove());

      const frag = document.createDocumentFragment();
      for (let i = 0; i < nums.length; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("data-idx", String(i));
        cell.setAttribute("aria-label", `Index ${i}, value ${nums[i]}`);
        cell.innerHTML = `<div class="idx">${i}</div><div class="val">${nums[i]}</div>`;
        frag.appendChild(cell);
      }
      arrayInner.insertBefore(frag, windowOverlay);
      measureCells();
    }

    function measureCells() {
      const cells = qsa(".cell", arrayInner);
      cellRects = cells.map(c => c.getBoundingClientRect());
    }

    function cellCenterX(idx) {
      const cell = arrayInner.querySelector(`.cell[data-idx="${idx}"]`);
      if (!cell) return 0;
      const rect = cell.getBoundingClientRect();
      const parentRect = arrayInner.getBoundingClientRect();
      const x = rect.left - parentRect.left + rect.width / 2;
      return x;
    }

    function cellLeft(idx) {
      const cell = arrayInner.querySelector(`.cell[data-idx="${idx}"]`);
      if (!cell) return 0;
      const rect = cell.getBoundingClientRect();
      const parentRect = arrayInner.getBoundingClientRect();
      return rect.left - parentRect.left;
    }

    function cellRight(idx) {
      const cell = arrayInner.querySelector(`.cell[data-idx="${idx}"]`);
      if (!cell) return 0;
      const rect = cell.getBoundingClientRect();
      const parentRect = arrayInner.getBoundingClientRect();
      return rect.right - parentRect.left;
    }

    function scrollCellIntoView(idx) {
      const cell = arrayInner.querySelector(`.cell[data-idx="${idx}"]`);
      if (!cell) return;
      const paneRect = arrayPane.getBoundingClientRect();
      const rect = cell.getBoundingClientRect();
      if (rect.left < paneRect.left || rect.right > paneRect.right) {
        cell.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }

    function updatePointers(step) {
      const { left, right } = step;
      const hasWindow = right >= left && right >= 0;
      pointerLeft.style.opacity = hasWindow ? "1" : "0.25";
      pointerRight.style.opacity = hasWindow ? "1" : "0.25";

      // Left pointer
      const leftX = left >= 0 && arrayInner.querySelector(`.cell[data-idx="${left}"]`)
        ? cellCenterX(left) - parseFloat(getComputedStyle(pointerLeft).width) / 2
        : -9999;
      pointerLeft.style.transform = `translateX(${leftX}px)`;

      // Right pointer
      const rightX = right >= 0 && arrayInner.querySelector(`.cell[data-idx="${right}"]`)
        ? cellCenterX(right) - parseFloat(getComputedStyle(pointerRight).width) / 2
        : -9999;
      pointerRight.style.transform = `translateX(${rightX}px)`;

      // Announce
      if (step.highlight.leftChanged || step.highlight.rightChanged) {
        announce(`Pointers: left ${left}, right ${right}`);
      }

      if (step.highlight.rightChanged) scrollCellIntoView(right);
      if (step.highlight.leftChanged) scrollCellIntoView(left);
    }

    function updateWindow(step) {
      const { left, right, zeros } = step;
      const hasWindow = right >= left && right >= 0;

      if (!hasWindow) {
        windowOverlay.style.opacity = "0";
        windowOverlay.setAttribute("aria-label", "Window not active");
        return;
      }

      windowOverlay.style.opacity = "1";

      const L = Math.max(left, 0);
      const R = Math.max(right, 0);

      const x1 = cellLeft(L);
      const x2 = cellRight(R);
      const width = Math.max(0, x2 - x1);

      windowOverlay.style.transform = `translateX(${x1}px)`;
      windowOverlay.style.width = `${width}px`;
      windowOverlay.setAttribute("aria-label", `Window from ${L} to ${R}`);

      // Too many zeros stripe
      if (zeros > 1) {
        windowOverlay.classList.add("too-many");
      } else {
        windowOverlay.classList.remove("too-many");
      }

      // Zero badges in window
      zeroLayer.innerHTML = "";
      for (let i = L; i <= R; i++) {
        if (step.nums[i] === 0) {
          const badge = document.createElement("div");
          badge.className = "zeroBadge";
          badge.textContent = "0";
          const cx = cellCenterX(i) - 8; // approximate offset
          badge.style.left = `${cx}px`;
          zeroLayer.appendChild(badge);

          if (step.highlight.zerosChanged) {
            requestAnimationFrame(() => {
              badge.classList.add("pop");
              setTimeout(() => badge.classList.remove("pop"), 140);
            });
          }
        }
      }
    }

    // best underline rules:
    // - Persist until replaced by a better "best".
    // - If zeros == 1 at update time: underline window minus the zero cell (split into two segments).
    // - If zeros == 0 at update time: underline window minus either end (we choose right end) and render small brackets.
    function updateBest(step) {
      if (step.highlight.bestChanged && step.action === "best") {
        const { left, right, zeros, nums } = step;
        const L = left, R = right;

        bestSnapshot = { segments: [], brackets: null };

        if (zeros === 1) {
          // Find the zero in [L..R]
          const zeroIdx = (() => {
            for (let i = L; i <= R; i++) if (nums[i] === 0) return i;
            return -1;
          })();
          if (zeroIdx !== -1) {
            if (zeroIdx - 1 >= L) bestSnapshot.segments.push({ start: L, end: zeroIdx - 1 });
            if (zeroIdx + 1 <= R) bestSnapshot.segments.push({ start: zeroIdx + 1, end: R });
          }
        } else {
          // zeros === 0
          // underline [L..R-1]
          if (R - 1 >= L) bestSnapshot.segments.push({ start: L, end: R - 1 });
          bestSnapshot.brackets = [L, R - 1];
        }

        drawBest(true);
      } else if (step.id === 0) {
        // Reset at start
        bestSnapshot = null;
        drawBest(false);
      }
    }

    function drawBest(pulse) {
      bestLayer.innerHTML = "";
      if (!bestSnapshot) return;

      const addUnderline = (start, end) => {
        if (start > end) return;
        const x1 = cellLeft(start);
        const x2 = cellRight(end);
        const el = document.createElement("div");
        el.className = "bestUnderline";
        el.style.left = `${x1}px`;
        el.style.width = `${x2 - x1}px`;
        if (pulse) el.classList.add("pulse");
        bestLayer.appendChild(el);
      };

      for (const seg of bestSnapshot.segments) addUnderline(seg.start, seg.end);

      if (bestSnapshot.brackets) {
        const [s, e] = bestSnapshot.brackets;
        const leftX = cellLeft(s);
        const rightX = cellRight(e);
        const b1 = document.createElement("div");
        b1.className = "bestBracket";
        b1.style.left = `${leftX - 8}px`;
        b1.textContent = "⟦";
        const b2 = document.createElement("div");
        b2.className = "bestBracket";
        b2.style.left = `${rightX - 4}px`;
        b2.textContent = "⟧";
        bestLayer.appendChild(b1);
        bestLayer.appendChild(b2);
      }
    }

    function updateRegisters(step) {
      const pairs = [
        ["left", step.left],
        ["right", step.right],
        ["zeros", step.zeros],
        ["best", step.best],
        ["winLen", step.winLen],
        ["score", step.score],
      ];
      for (const [k, v] of pairs) {
        const el = regEl[k];
        const prev = lastStep ? lastStep[k] : null;
        if (prev !== v) {
          el.textContent = String(v);
          el.parentElement.classList.remove("flash");
          // Reflow to restart animation
          void el.parentElement.offsetWidth;
          el.parentElement.classList.add("flash");
        } else {
          el.textContent = String(v);
        }
      }
    }

    function highlightCode(step) {
      const { startLine, endLine } = step.codeFocus;
      // Re-render lightweight by toggling a span
      const lines = qsa(".line", codeBlock);
      for (let i = 0; i < lines.length; i++) {
        const ln = i + 1;
        const src = qs(".src", lines[i]);
        if (ln >= startLine && ln <= endLine) {
          if (!src.classList.contains("hl")) src.classList.add("hl");
        } else {
          src.classList.remove("hl");
        }
      }
    }

    function setComment(step) {
      commentEl.style.opacity = "0";
      requestAnimationFrame(() => {
        commentEl.textContent = step.comment;
        commentEl.style.opacity = "1";
      });
    }

    function renderStep(step) {
      ensureArrayCells(step.nums);
      updateWindow(step);
      updatePointers(step);
      updateRegisters(step);
      highlightCode(step);
      setComment(step);
      updateTimeline(step);
      lastStep = step;
    }

    // -------- Timeline ----------
    function buildTimeline(steps) {
      timelineEl.innerHTML = "";
      barsWrap = document.createElement("div");
      barsWrap.className = "bars";
      timelineEl.appendChild(barsWrap);

      // bars
      steps.forEach((s, i) => {
        const bar = document.createElement("div");
        bar.className = `bar ${s.phase}`;
        bar.setAttribute("data-step", String(i));
        bar.title = `#${i} ${s.phase}:${s.action}`;
        bar.addEventListener("click", () => player.jump(i));
        barsWrap.appendChild(bar);
      });

      // milestones
      milestoneEls = [];
      steps.forEach((s, i) => {
        if (
          s.action === "best" ||
          s.action === "decZeros" ||
          s.action === "moveLeft" ||
          s.action === "done"
        ) {
          const m = document.createElement("div");
          m.className = "milestone";
          // Position over the bar
          const pct = i / Math.max(steps.length - 1, 1);
          m.style.left = `calc(${pct * 100}% - 3px)`;
          m.title = `Milestone: #${i} ${s.action}`;
          milestoneEls.push(m);
          timelineEl.appendChild(m);
        }
      });

      // handle
      handleEl = document.createElement("div");
      handleEl.className = "handle";
      timelineEl.appendChild(handleEl);

      // Drag to scrub
      enableHandleDrag(steps.length);
    }

    function enableHandleDrag(total) {
      let dragging = false;

      const onPos = (clientX) => {
        const rect = barsWrap.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const pct = x / Math.max(rect.width, 1);
        const idx = Math.round(pct * (total - 1));
        player.jump(idx);
      };

      timelineEl.addEventListener("pointerdown", (e) => {
        dragging = true;
        timelineEl.setPointerCapture(e.pointerId);
        onPos(e.clientX);
      });
      timelineEl.addEventListener("pointermove", (e) => {
        if (dragging) onPos(e.clientX);
      });
      timelineEl.addEventListener("pointerup", (e) => {
        dragging = false;
        try { timelineEl.releasePointerCapture(e.pointerId); } catch {}
      });
      timelineEl.addEventListener("pointercancel", () => dragging = false);
    }

    function updateTimeline(step) {
      if (!barsWrap || !handleEl) return;
      const bars = qsa(".bar", barsWrap);
      const total = Math.max(bars.length - 1, 1);
      const pct = step.id / total;
      handleEl.style.transform = `translateX(calc(${pct * 100}%))`;
    }

    // ---------- Utilities ----------
    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
    }
    function arraysEqual(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }
    function announce(text) {
      const el = qs("#live");
      el.textContent = text;
    }

    // Public API (as required)
    return {
      initDOM,
      renderStep,
      highlightCode,
      updateRegisters,
      updatePointers,
      updateWindow,
      updateBest,
      buildTimeline,
      step: (s) => renderStep(s),
    };
  })();

  // -----------------------------
  // Player / State Machine
  // -----------------------------
  const player = (() => {
    const STATES = { Idle: "Idle", Playing: "Playing", Paused: "Paused", Finished: "Finished" };
    let state = STATES.Idle;

    let steps = [];
    let idx = 0;
    let timer = null;
    let speed = 1.0;
    let autoPause = true;

    function setSteps(newSteps) {
      steps = newSteps;
      idx = 0;
      state = STATES.Idle;
      render.buildTimeline(steps);
      render.step(steps[idx]);
      render.updateBest(steps[idx]);
      updatePlayButton();
    }

    function current() { return steps[idx]; }

    function play() {
      if (!steps.length) return;
      if (state === STATES.Finished) jump(0);
      state = STATES.Playing;
      tick();
      updatePlayButton();
    }

    function pause() {
      state = STATES.Paused;
      clearTimer();
      updatePlayButton();
    }

    function stepDir(dir) {
      if (!steps.length) return;
      const newIdx = Math.min(Math.max(idx + dir, 0), steps.length - 1);
      idx = newIdx;
      render.step(steps[idx]);
      render.updateBest(steps[idx]);
      if (idx === steps.length - 1) state = STATES.Finished;
      updatePlayButton();
    }

    function jump(newIdx) {
      if (!steps.length) return;
      idx = Math.min(Math.max(newIdx, 0), steps.length - 1);
      render.step(steps[idx]);
      render.updateBest(steps[idx]);
      state = (idx === steps.length - 1) ? STATES.Finished : STATES.Paused;
      updatePlayButton();
    }

    function setSpeed(v) {
      speed = Math.max(0.25, Math.min(2, Number(v) || 1));
    }

    function setAutoPause(v) {
      autoPause = Boolean(v);
    }

    function tick() {
      clearTimer();
      if (state !== STATES.Playing) return;

      // Advance first if not at end (so play from current shows next)
      if (idx < steps.length - 1) {
        idx++;
        render.step(steps[idx]);
        render.updateBest(steps[idx]);

        // Auto-pause on milestone actions if enabled
        const s = steps[idx];
        const isWhileTooMany = (s.action === "whileCheck" && s.phase === "shrink");
        const milestone = s.action === "best" || s.action === "decZeros" || s.action === "moveLeft" || s.action === "done" || s.action === "incZeros" || isWhileTooMany;
        if (autoPause && milestone) {
          pause();
          return;
        }
      }

      if (idx >= steps.length - 1) {
        state = STATES.Finished;
        updatePlayButton();
        return;
      }

      timer = setTimeout(tick, (700 / speed));
    }

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function updatePlayButton() {
      const btn = qs("#playBtn");
      btn.textContent = (state === STATES.Playing) ? "⏸" : "▶";
    }

    // Public API
    return {
      setSteps,
      play,
      pause,
      step: (d) => stepDir(d),
      jump,
      setSpeed,
      setAutoPause,
      get state() { return state; },
      get index() { return idx; },
      get steps() { return steps; },
    };
  })();

  // Expose programmatic API as requested
  window.player = {
    play: () => player.play(),
    pause: () => player.pause(),
    step: (d) => player.step(Number(d) >= 0 ? +1 : -1),
    jump: (i) => player.jump(Number(i)||0),
    setSpeed: (v) => player.setSpeed(Number(v)||1),
    setAutoPause: (b) => player.setAutoPause(Boolean(b)),
  };
  window.render = render;

  // -----------------------------
  // Wiring UI
  // -----------------------------
  function init() {
    render.initDOM();

    const presetSel = qs("#preset");
    const input = qs("#arrayInput");
    const runBtn = qs("#runBtn");
    const randomBtn = qs("#randomBtn");
    const errorBox = qs("#errorBox");
    const playBtn = qs("#playBtn");
    const prevBtn = qs("#prevBtn");
    const nextBtn = qs("#nextBtn");
    const jumpStartBtn = qs("#jumpStartBtn");
    const jumpEndBtn = qs("#jumpEndBtn");
    const speedRange = qs("#speedRange");
    const autoPauseToggle = qs("#autoPauseToggle");
    const darkToggle = qs("#darkToggle");
    const hcToggle = qs("#hcToggle");

    // Theme toggles
    const root = document.documentElement;
    darkToggle.addEventListener("change", () => root.classList.toggle("dark", darkToggle.checked));
    hcToggle.addEventListener("change", () => root.classList.toggle("hc", hcToggle.checked));

    // Load initial preset
    applyPreset("example");

    presetSel.addEventListener("change", () => {
      applyPreset(presetSel.value);
    });

    function applyPreset(name) {
      const nums = PRESETS[name] || PRESETS.example;
      input.value = formatArray(nums);
      runWithInput(nums);
    }

    randomBtn.addEventListener("click", () => {
      const nums = randomArray();
      input.value = formatArray(nums);
      runWithInput(nums);
    });

    // Validate & Run
    qs("#inputForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const { nums, error } = parseInput(input.value);
      if (error) {
        errorBox.hidden = false;
        errorBox.textContent = error;
        // Clip if too long but had nums
        if (nums && nums.length) {
          runWithInput(nums);
        }
        return;
      }
      errorBox.hidden = true;
      runWithInput(nums);
    });

    // Controls
    playBtn.addEventListener("click", () => {
      if (player.state === "Playing") player.pause(); else player.play();
      input.blur();
    });
    prevBtn.addEventListener("click", () => { player.step(-1); input.blur(); });
    nextBtn.addEventListener("click", () => { player.step(+1); input.blur(); });
    jumpStartBtn.addEventListener("click", () => { player.jump(0); input.blur(); });
    jumpEndBtn.addEventListener("click", () => { player.jump(player.steps.length - 1); input.blur(); });

    speedRange.addEventListener("input", () => player.setSpeed(speedRange.value));
    autoPauseToggle.addEventListener("change", () => player.setAutoPause(autoPauseToggle.checked));

    // Keyboard shortcuts (avoid interfering when typing in the input field)
    window.addEventListener("keydown", (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === " " && !typing) {
        e.preventDefault();
        if (player.state === "Playing") player.pause(); else player.play();
      }
      else if (e.key === "ArrowRight" && !typing) { e.preventDefault(); player.step(+1); }
      else if (e.key === "ArrowLeft" && !typing) { e.preventDefault(); player.step(-1); }
      else if (e.key === "Home" && !typing) { e.preventDefault(); player.jump(0); }
      else if (e.key === "End" && !typing) { e.preventDefault(); player.jump(player.steps.length - 1); }
      else if ((e.key === "r" || e.key === "R") && !typing) { e.preventDefault(); const nums = randomArray(); input.value = formatArray(nums); runWithInput(nums); }
      else if (e.key === "Enter" && typing) { /* allow submit via form default */ }
      else if ("12345".includes(e.key) && !typing) {
        e.preventDefault();
        const mapping = { "1":"example", "2":"all-ones", "3":"all-zeros", "4":"alternating", "5":"single-zero-mid" };
        qs("#preset").value = mapping[e.key];
        applyPreset(mapping[e.key]);
      }
    });

    function runWithInput(nums) {
      const steps = generateSteps(nums);
      player.setSteps(steps);
    }

    // Resize recalculations for precise overlay positioning
    window.addEventListener("resize", () => {
      // Re-measure cell positions and re-draw current step and best overlay
      render.step(player.steps[player.index] || { nums: [], left:0, right:-1, zeros:0, best:0, winLen:0, score:0, codeFocus:{startLine:2,endLine:2}, comment:"" });
      render.updateBest(player.steps[player.index] || { id:0, action:"init", highlight:{bestChanged:false} });
    });
  }

  // Init on DOMContentLoaded
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);

})();

