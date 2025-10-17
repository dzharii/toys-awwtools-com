(function () {
  'use strict';

  const paper = document.getElementById('paper');
  const keyboardSVG = document.getElementById('keyboard');
  const soundSelect = document.getElementById('sound-select');
  const controls = document.getElementById('controls');

  // ---------------------------
  // Audio Engine
  // ---------------------------
  let audioContext = null;
  let currentProfile = soundSelect.value || 'classic';

  function ensureAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  }

  function envelope(gainNode, { start, peak, sustain, decay, release }) {
    const t = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(peak, t + start);
    gainNode.gain.exponentialRampToValueAtTime(sustain, t + start + decay);
    return { stopAt: (when) => gainNode.gain.setTargetAtTime(0.0001, when, release) };
  }

  function makeNoiseBuffer(duration = 0.04) {
    const sr = audioContext.sampleRate;
    const len = Math.max(1, Math.floor(sr * duration));
    const buf = audioContext.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (data[i - 1] || 0) * 0.98 + white * 0.12;
    }
    return buf;
  }

  let sharedNoiseBuffer = null;

  function playKeySound(profileName) {
    ensureAudioContext();
    if (!sharedNoiseBuffer) sharedNoiseBuffer = makeNoiseBuffer();

    const choice = profileName === 'random'
      ? (['classic','soft','clacky','thud','beep'][Math.floor(Math.random()*5)])
      : profileName;

    const master = audioContext.createGain();
    master.gain.value = 0.85;
    master.connect(audioContext.destination);

    const rnd = (min, max) => min + Math.random() * (max - min);

    const tone = audioContext.createOscillator();
    const toneGain = audioContext.createGain();
    tone.connect(toneGain).connect(master);

    const noise = audioContext.createBufferSource();
    noise.buffer = sharedNoiseBuffer;
    const noiseGain = audioContext.createGain();
    noise.connect(noiseGain).connect(master);

    let toneType = 'square';
    let toneFreq = rnd(150, 200);
    let tonePeak = 0.14;
    let toneSustain = 0.03;
    let toneDecay = 0.025;
    let toneRelease = 0.02;
    let toneDur = 0.06;

    let noisePeak = 0.18;
    let noiseSustain = 0.04;
    let noiseDecay = 0.03;
    let noiseRelease = 0.02;
    let noiseDur = 0.055;

    switch (choice) {
      case 'soft':
        toneType = 'triangle';
        toneFreq = rnd(120, 160);
        tonePeak = 0.06;
        toneSustain = 0.015;
        noisePeak = 0.05;
        noiseSustain = 0.02;
        break;
      case 'clacky':
        toneType = 'square';
        toneFreq = rnd(280, 360);
        tonePeak = 0.12;
        noisePeak = 0.22;
        noiseSustain = 0.03;
        break;
      case 'thud':
        toneType = 'sawtooth';
        toneFreq = rnd(70, 110);
        tonePeak = 0.22;
        toneSustain = 0.05;
        noisePeak = 0.24;
        noiseSustain = 0.05;
        break;
      case 'beep':
        toneType = 'sine';
        toneFreq = rnd(540, 660);
        tonePeak = 0.12;
        noisePeak = 0.02;
        noiseSustain = 0.01;
        break;
    }

    tone.type = toneType;
    tone.frequency.setValueAtTime(toneFreq, audioContext.currentTime);

    const toneEnv = envelope(toneGain, { start: 0.005, peak: tonePeak, sustain: toneSustain, decay: toneDecay, release: toneRelease });
    const noiseEnv = envelope(noiseGain, { start: 0.002, peak: noisePeak, sustain: noiseSustain, decay: noiseDecay, release: noiseRelease });

    const now = audioContext.currentTime;
    tone.start(now);
    noise.start(now);

    const stopAt = now + Math.max(toneDur, noiseDur);
    toneEnv.stopAt(stopAt - 0.01);
    noiseEnv.stopAt(stopAt - 0.01);

    tone.stop(stopAt);
    noise.stop(stopAt);
  }

  function playDing() {
    ensureAudioContext();
    const master = audioContext.createGain();
    master.gain.value = 0.8;
    master.connect(audioContext.destination);

    const o1 = audioContext.createOscillator();
    const g1 = audioContext.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(880, audioContext.currentTime);
    o1.connect(g1).connect(master);

    const o2 = audioContext.createOscillator();
    const g2 = audioContext.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(1320, audioContext.currentTime);
    o2.connect(g2).connect(master);

    const env1 = envelope(g1, { start: 0.002, peak: 0.25, sustain: 0.05, decay: 0.12, release: 0.08 });
    const env2 = envelope(g2, { start: 0.004, peak: 0.18, sustain: 0.04, decay: 0.10, release: 0.08 });

    const now = audioContext.currentTime;
    o1.start(now);
    o2.start(now + 0.008);

    const stopAt = now + 0.35;
    env1.stopAt(stopAt - 0.03);
    env2.stopAt(stopAt - 0.03);

    o1.stop(stopAt);
    o2.stop(stopAt);
  }

  soundSelect.addEventListener('change', (e) => {
    currentProfile = e.target.value;
  });

  // ---------------------------
  // Paper auto-grow with max-height
  // ---------------------------
  function resizePaper() {
    const maxH = parseFloat(getComputedStyle(paper).getPropertyValue('max-height'));
    paper.style.height = 'auto';
    const measured = paper.scrollHeight;
    const next = Math.min(measured, maxH);
    paper.style.height = next + 'px';
  }
  paper.addEventListener('input', resizePaper);

  // ---------------------------
  // Keyboard Layout + Builder
  // ---------------------------
  const rows = [
    [
      { label: '`', code: 'Backquote', char: '`', w: 1 },
      { label: '1', code: 'Digit1', char: '1', w: 1 },
      { label: '2', code: 'Digit2', char: '2', w: 1 },
      { label: '3', code: 'Digit3', char: '3', w: 1 },
      { label: '4', code: 'Digit4', char: '4', w: 1 },
      { label: '5', code: 'Digit5', char: '5', w: 1 },
      { label: '6', code: 'Digit6', char: '6', w: 1 },
      { label: '7', code: 'Digit7', char: '7', w: 1 },
      { label: '8', code: 'Digit8', char: '8', w: 1 },
      { label: '9', code: 'Digit9', char: '9', w: 1 },
      { label: '0', code: 'Digit0', char: '0', w: 1 },
      { label: '-', code: 'Minus', char: '-', w: 1 },
      { label: '=', code: 'Equal', char: '=', w: 1 },
      { label: 'Backspace', code: 'Backspace', char: null, w: 2 }
    ],
    [
      { label: 'Tab', code: 'Tab', char: '\t', w: 1.5 },
      { label: 'Q', code: 'KeyQ', char: 'q', w: 1 },
      { label: 'W', code: 'KeyW', char: 'w', w: 1 },
      { label: 'E', code: 'KeyE', char: 'e', w: 1 },
      { label: 'R', code: 'KeyR', char: 'r', w: 1 },
      { label: 'T', code: 'KeyT', char: 't', w: 1 },
      { label: 'Y', code: 'KeyY', char: 'y', w: 1 },
      { label: 'U', code: 'KeyU', char: 'u', w: 1 },
      { label: 'I', code: 'KeyI', char: 'i', w: 1 },
      { label: 'O', code: 'KeyO', char: 'o', w: 1 },
      { label: 'P', code: 'KeyP', char: 'p', w: 1 },
      { label: '[', code: 'BracketLeft', char: '[', w: 1 },
      { label: ']', code: 'BracketRight', char: ']', w: 1 },
      { label: '\\', code: 'Backslash', char: '\\', w: 1.5 }
    ],
    [
      { label: 'Caps', code: 'CapsLock', char: null, w: 1.8 },
      { label: 'A', code: 'KeyA', char: 'a', w: 1 },
      { label: 'S', code: 'KeyS', char: 's', w: 1 },
      { label: 'D', code: 'KeyD', char: 'd', w: 1 },
      { label: 'F', code: 'KeyF', char: 'f', w: 1 },
      { label: 'G', code: 'KeyG', char: 'g', w: 1 },
      { label: 'H', code: 'KeyH', char: 'h', w: 1 },
      { label: 'J', code: 'KeyJ', char: 'j', w: 1 },
      { label: 'K', code: 'KeyK', char: 'k', w: 1 },
      { label: 'L', code: 'KeyL', char: 'l', w: 1 },
      { label: ';', code: 'Semicolon', char: ';', w: 1 },
      { label: '\'', code: 'Quote', char: '\'', w: 1 },
      { label: 'Enter', code: 'Enter', char: '\n', w: 2.2 }
    ],
    [
      { label: 'Shift', code: 'ShiftLeft', char: null, w: 2.4 },
      { label: 'Z', code: 'KeyZ', char: 'z', w: 1 },
      { label: 'X', code: 'KeyX', char: 'x', w: 1 },
      { label: 'C', code: 'KeyC', char: 'c', w: 1 },
      { label: 'V', code: 'KeyV', char: 'v', w: 1 },
      { label: 'B', code: 'KeyB', char: 'b', w: 1 },
      { label: 'N', code: 'KeyN', char: 'n', w: 1 },
      { label: 'M', code: 'KeyM', char: 'm', w: 1 },
      { label: ',', code: 'Comma', char: ',', w: 1 },
      { label: '.', code: 'Period', char: '.', w: 1 },
      { label: '/', code: 'Slash', char: '/', w: 1 },
      { label: 'Shift', code: 'ShiftRight', char: null, w: 2.4 }
    ],
    [
      { label: 'Space', code: 'Space', char: ' ', w: 6.5 }
    ]
  ];

  function buildKeyboard() {
    while (keyboardSVG.firstChild) keyboardSVG.removeChild(keyboardSVG.firstChild);

    // Paint servers and shadows
    const defs = el('defs', {});
    const grad = el('linearGradient', { id: 'keyGrad', x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#f8fafc' }));
    grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#e5e7eb' }));
    const gradActive = el('linearGradient', { id: 'keyGradActive', x1: '0', y1: '0', x2: '0', y2: '1' });
    gradActive.appendChild(el('stop', { offset: '0%', 'stop-color': '#e2e8f0' }));
    gradActive.appendChild(el('stop', { offset: '100%', 'stop-color': '#cbd5e1' }));

    const shadow = el('filter', { id: 'keyShadow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    shadow.appendChild(el('feDropShadow', { dx: '0', dy: '3', stdDeviation: '2.2', 'flood-color': '#0f172a', 'flood-opacity': '0.18' }));

    const shadowPressed = el('filter', { id: 'keyShadowPressed', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    shadowPressed.appendChild(el('feDropShadow', { dx: '0', dy: '1', stdDeviation: '1.5', 'flood-color': '#0f172a', 'flood-opacity': '0.24' }));

    defs.appendChild(grad);
    defs.appendChild(gradActive);
    defs.appendChild(shadow);
    defs.appendChild(shadowPressed);
    keyboardSVG.appendChild(defs);

    const paddingX = 18, paddingY = 16, gapX = 8, gapY = 12;
    const baseKeyW = 58, keyH = 54;
    let y = paddingY;

    rows.forEach((row, rowIdx) => {
      let x = paddingX + (rowIdx === 1 ? 12 : rowIdx === 2 ? 18 : rowIdx === 3 ? 24 : 0);
      const rowGroup = el('g', { 'data-row': String(rowIdx) });

      row.forEach((k) => {
        const w = baseKeyW * (k.w || 1);
        const grp = el('g', { 'data-code': k.code, 'data-char': k.char != null ? k.char : '', tabindex: '0', role: 'button', 'aria-label': k.label });

        const rect = el('rect', {
          class: 'key',
          x: String(x),
          y: String(y),
          width: String(w),
          height: String(keyH),
          rx: '8',
          fill: 'url(#keyGrad)',
          stroke: '#6b7280',
          'stroke-width': '1.2',
          filter: 'url(#keyShadow)',
          style: 'transition: transform 90ms ease'
        });
        rect.dataset.code = k.code;
        rect.dataset.char = k.char != null ? k.char : '';

        const label = el('text', {
          class: 'keycap-label',
          x: String(x + w / 2),
          y: String(y + keyH / 2 + 1),
          'text-anchor': 'middle',
          'dominant-baseline': 'middle'
        });
        label.textContent = k.label;

        grp.appendChild(rect);
        grp.appendChild(label);

        grp.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          pressVisual(k.code);
          if (k.code === 'Enter') playDing(); else playKeySound(currentProfile);
          if (k.char != null) insertAtCursor(k.char);
          else if (k.code === 'Backspace') backspaceAtCursor();
          if (document.activeElement !== paper) paper.focus();
          // failsafe clear in case pointerup is missed
          scheduleReleaseFailsafe(k.code);
        });
        const release = () => releaseVisual(k.code);
        grp.addEventListener('pointerup', (ev) => { ev.preventDefault(); release(); });
        grp.addEventListener('pointerleave', release);
        grp.addEventListener('pointercancel', release);

        rowGroup.appendChild(grp);
        x += w + gapX;
      });

      keyboardSVG.appendChild(rowGroup);
      y += keyH + gapY;
    });
  }

  function el(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // ---------------------------
  // Visual press state + failsafes
  // ---------------------------
  const activeKeys = new Set();
  const releaseTimers = new Map();

  function pressVisual(code) {
    keyboardSVG.querySelectorAll(`[data-code="${cssEscape(code)}"] rect.key`).forEach((rect) => {
      rect.classList.add('active');
      rect.setAttribute('fill', 'url(#keyGradActive)');
      rect.setAttribute('filter', 'url(#keyShadowPressed)');
    });
    activeKeys.add(code);
  }
  function releaseVisual(code) {
    keyboardSVG.querySelectorAll(`[data-code="${cssEscape(code)}"] rect.key`).forEach((rect) => {
      rect.classList.remove('active');
      rect.setAttribute('fill', 'url(#keyGrad)');
      rect.setAttribute('filter', 'url(#keyShadow)');
    });
    activeKeys.delete(code);
    const t = releaseTimers.get(code);
    if (t) { clearTimeout(t); releaseTimers.delete(code); }
  }
  function clearAllActive() {
    Array.from(activeKeys).forEach(releaseVisual);
  }
  function scheduleReleaseFailsafe(code) {
    const old = releaseTimers.get(code);
    if (old) clearTimeout(old);
    releaseTimers.set(code, setTimeout(() => releaseVisual(code), 400));
  }
  window.addEventListener('blur', clearAllActive);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearAllActive(); });

  // ---------------------------
  // Text insertion helpers
  // ---------------------------
  function insertAtCursor(text) {
    const start = paper.selectionStart ?? paper.value.length;
    const end = paper.selectionEnd ?? paper.value.length;
    const before = paper.value.slice(0, start);
    const after = paper.value.slice(end);
    paper.value = before + text + after;
    const newPos = start + text.length;
    paper.setSelectionRange(newPos, newPos);
    paper.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function backspaceAtCursor() {
    const start = paper.selectionStart ?? paper.value.length;
    const end = paper.selectionEnd ?? paper.value.length;
    if (start === end && start > 0) {
      const before = paper.value.slice(0, start - 1);
      const after = paper.value.slice(end);
      paper.value = before + after;
      paper.setSelectionRange(start - 1, start - 1);
    } else if (start !== end) {
      const before = paper.value.slice(0, start);
      const after = paper.value.slice(end);
      paper.value = before + after;
      paper.setSelectionRange(start, start);
    }
    paper.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ---------------------------
  // Hardware keyboard handling
  // ---------------------------
  const codeToDisplayCode = new Set(rows.flat().map(k => k.code));

  function withinControls(el) {
    return el && controls.contains(el);
  }
  function isPaper(el) {
    return el === paper;
  }
  function isTypingContext(el) {
    // Allow sounds/highlights when focused in paper or body
    return isPaper(el) || el === document.body || el === document.documentElement;
  }

  window.addEventListener('keydown', (e) => {
    ensureAudioContext();

    // If interacting with UI controls (like the sound dropdown), do nothing
    if (withinControls(e.target) && !isPaper(e.target)) {
      return;
    }

    // Only manage typing behavior when we're in the typing context
    if (!isTypingContext(e.target)) {
      return;
    }

    const code = e.code;
    if (codeToDisplayCode.has(code)) {
      pressVisual(code);
      scheduleReleaseFailsafe(code); // ensure it won't stick
    }

    if (code === 'Enter') {
      playDing();
    } else if (!e.repeat) {
      playKeySound(currentProfile);
    }

    if (code === 'Tab') {
      e.preventDefault();
      insertAtCursor('\t');
    }
  }, { passive: false });

  window.addEventListener('keyup', (e) => {
    // Respect control usage
    if (withinControls(e.target) && !isPaper(e.target)) return;

    const code = e.code;
    if (codeToDisplayCode.has(code)) {
      releaseVisual(code);
    }
  });

  // Keyboard accessibility for SVG keys
  keyboardSVG.addEventListener('keydown', (e) => {
    const target = e.target;
    if (!(target instanceof SVGGElement)) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    }
  });

  // Minimal CSS.escape polyfill (safe for event.code)
  function cssEscape(ident) { return String(ident).replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }

  // Init
  buildKeyboard();
  window.addEventListener('load', () => {
    resizePaper();
    // Start with paper focused for convenience
    paper.focus({ preventScroll: true });
  });
  ['pointerdown','keydown','click','touchstart'].forEach(ev =>
    window.addEventListener(ev, ensureAudioContext, { once: true, passive: true })
  );
})();

