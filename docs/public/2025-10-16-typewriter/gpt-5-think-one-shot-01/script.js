(function () {
  'use strict';

  // ---------------------------
  // DOM refs
  // ---------------------------
  const paper = document.getElementById('paper');
  const keyboardSVG = document.getElementById('keyboard');
  const soundSelect = document.getElementById('sound-select');

  // ---------------------------
  // Audio Engine (Web Audio API)
  // ---------------------------
  let audioContext = null;
  let currentProfile = soundSelect.value || 'classic';

  function ensureAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => { /* ignore */ });
    }
  }

  function envelope(gainNode, { start, peak, sustain, decay, release }) {
    const t = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(peak, t + start);   // attack
    gainNode.gain.exponentialRampToValueAtTime(sustain, t + start + decay); // decay
    // caller is expected to schedule stop; we'll add a quick release before stop
    return {
      stopAt: (when) => {
        const endT = when;
        gainNode.gain.setTargetAtTime(0.0001, endT, release);
      }
    };
  }

  function makeNoiseBuffer(duration = 0.04) {
    const sampleRate = audioContext.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      // Pink-ish noise (simple filtered white) — subtle variation
      const white = Math.random() * 2 - 1;
      data[i] = (data[i - 1] || 0) * 0.98 + white * 0.12;
    }
    return buffer;
  }

  // Reuse a tiny noise buffer
  let sharedNoiseBuffer = null;

  function playKeySound(profileName) {
    ensureAudioContext();
    if (!sharedNoiseBuffer) sharedNoiseBuffer = makeNoiseBuffer();

    // Resolve 'random' into a concrete profile (excluding 'random' to avoid recursion).
    const choice = profileName === 'random'
      ? (['classic','soft','clacky','thud','beep'][Math.floor(Math.random()*5)])
      : profileName;

    // Base nodes
    const master = audioContext.createGain();
    master.gain.value = 0.85; // overall volume
    master.connect(audioContext.destination);

    // Slight per-press random tilt to avoid machine-gun sameness
    const rnd = (min, max) => min + Math.random() * (max - min);

    // Optional tonal component
    const tone = audioContext.createOscillator();
    const toneGain = audioContext.createGain();
    tone.connect(toneGain).connect(master);

    // Optional noise component
    const noise = audioContext.createBufferSource();
    noise.buffer = sharedNoiseBuffer;
    const noiseGain = audioContext.createGain();
    noise.connect(noiseGain).connect(master);

    // Defaults tuned for "classic" feel
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
        noisePeak = 0.02; // almost none
        noiseSustain = 0.01;
        break;
      // 'classic' defaults already set
    }

    tone.type = toneType;
    tone.frequency.setValueAtTime(toneFreq, audioContext.currentTime);

    const toneEnv = envelope(toneGain, {
      start: 0.005, peak: tonePeak, sustain: toneSustain, decay: toneDecay, release: toneRelease
    });
    const noiseEnv = envelope(noiseGain, {
      start: 0.002, peak: noisePeak, sustain: noiseSustain, decay: noiseDecay, release: noiseRelease
    });

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
    // Bell-like two-tone ding
    const master = audioContext.createGain();
    master.gain.value = 0.8;
    master.connect(audioContext.destination);

    const o1 = audioContext.createOscillator();
    const g1 = audioContext.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(880, audioContext.currentTime);   // A5
    o1.connect(g1).connect(master);

    const o2 = audioContext.createOscillator();
    const g2 = audioContext.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(1320, audioContext.currentTime);  // E6 (fifth)
    o2.connect(g2).connect(master);

    const env1 = envelope(g1, { start: 0.002, peak: 0.25, sustain: 0.05, decay: 0.12, release: 0.08 });
    const env2 = envelope(g2, { start: 0.004, peak: 0.18, sustain: 0.04, decay: 0.10, release: 0.08 });

    const now = audioContext.currentTime;
    o1.start(now);
    o2.start(now + 0.008); // slight delay for sparkle

    const stopAt = now + 0.35;
    env1.stopAt(stopAt - 0.03);
    env2.stopAt(stopAt - 0.03);

    o1.stop(stopAt);
    o2.stop(stopAt);
  }

  // Sound profile switching
  soundSelect.addEventListener('change', (e) => {
    currentProfile = e.target.value;
  });

  // ---------------------------
  // Paper auto-grow
  // ---------------------------
  function resizePaper() {
    // Temporarily shrink to measure natural scrollHeight accurately
    paper.style.height = 'auto';
    const newHeight = Math.max(paper.scrollHeight, emToPx(9.5)); // maintain min height
    paper.style.height = newHeight + 'px';
  }

  function emToPx(em) {
    const tmp = document.createElement('div');
    tmp.style.position = 'absolute';
    tmp.style.visibility = 'hidden';
    tmp.style.fontSize = '1em';
    document.body.appendChild(tmp);
    const base = tmp.getBoundingClientRect().height || 16;
    document.body.removeChild(tmp);
    return base * em;
  }

  paper.addEventListener('input', resizePaper);

  // ---------------------------
  // Keyboard Layout + Builder
  // ---------------------------
  // Layout uses event.code identifiers for robust hardware mapping.
  // Each key defines: label (for display), code (for hardware), char (default char to insert for virtual press), width units.
  // Width unit = baseKeyW (e.g., 1 = standard key). Specials are wider.
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
    // Clear existing
    while (keyboardSVG.firstChild) keyboardSVG.removeChild(keyboardSVG.firstChild);

    // Defs: gradients and shadows for 3D effect
    const defs = el('defs', {});
    const grad = el('linearGradient', { id: 'keyGrad', x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(el('stop', { offset: '0%', 'stop-color': '#f8fafc' }));
    grad.appendChild(el('stop', { offset: '100%', 'stop-color': '#e5e7eb' }));
    const gradActive = el('linearGradient', { id: 'keyGradActive', x1: '0', y1: '0', x2: '0', y2: '1' });
    gradActive.appendChild(el('stop', { offset: '0%', 'stop-color': '#e2e8f0' }));
    gradActive.appendChild(el('stop', { offset: '100%', 'stop-color': '#cbd5e1' }));
    const shadow = el('filter', { id: 'keyShadow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    shadow.appendChild(el('feDropShadow', { dx: '0', dy: '3', stdDeviation: '2.2', 'flood-color': '#0f172a', 'flood-opacity': '0.18' }));

    defs.appendChild(grad);
    defs.appendChild(gradActive);
    defs.appendChild(shadow);
    keyboardSVG.appendChild(defs);

    const paddingX = 18;
    const paddingY = 16;
    const gapX = 8;
    const gapY = 12;
    const baseKeyW = 58; // base width unit
    const keyH = 54;

    let y = paddingY;

    rows.forEach((row, rowIdx) => {
      let x = paddingX + (rowIdx === 1 ? 12 : rowIdx === 2 ? 18 : rowIdx === 3 ? 24 : 0); // slight staggering
      const rowGroup = el('g', { 'data-row': String(rowIdx) });

      row.forEach((k, idx) => {
        const w = baseKeyW * (k.w || 1);
        const keyGroup = el('g', {
          'data-code': k.code,
          'data-char': k.char != null ? k.char : '',
          tabindex: '0', // make focusable for accessibility
          role: 'button',
          'aria-label': k.label
        });

        const rect = el('rect', {
          class: 'key',
          x: String(x),
          y: String(y),
          width: String(w),
          height: String(keyH),
          rx: '8'
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

        keyGroup.appendChild(rect);
        keyGroup.appendChild(label);

        // Pointer interactions
        keyGroup.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          pressVisual(k.code);
          if (k.code === 'Enter') {
            playDing();
          } else {
            playKeySound(currentProfile);
          }
          if (k.char != null) {
            insertAtCursor(k.char);
          } else if (k.code === 'Backspace') {
            // emulate backspace
            backspaceAtCursor();
          }
          // focus paper for continuous typing
          if (document.activeElement !== paper) paper.focus();
        });
        keyGroup.addEventListener('pointerup', (ev) => {
          ev.preventDefault();
          releaseVisual(k.code);
        });
        keyGroup.addEventListener('pointerleave', () => releaseVisual(k.code));

        rowGroup.appendChild(keyGroup);
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
  // Visual active state helpers
  // ---------------------------
  const activeKeys = new Set();

  function pressVisual(code) {
    const nodes = keyboardSVG.querySelectorAll(`[data-code="${cssEscape(code)}"] .key, [data-code="${cssEscape(code)}"]`);
    nodes.forEach(n => {
      if (n.classList) n.classList.add('active');
    });
    activeKeys.add(code);
  }

  function releaseVisual(code) {
    const nodes = keyboardSVG.querySelectorAll(`[data-code="${cssEscape(code)}"] .key, [data-code="${cssEscape(code)}"]`);
    nodes.forEach(n => {
      if (n.classList) n.classList.remove('active');
    });
    activeKeys.delete(code);
  }

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
      const newPos = start - 1;
      paper.setSelectionRange(newPos, newPos);
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

  window.addEventListener('keydown', (e) => {
    // Initialize audio context and focus paper on first interaction
    ensureAudioContext();
    if (document.activeElement !== paper) paper.focus();

    const code = e.code;
    if (codeToDisplayCode.has(code)) {
      pressVisual(code);
    }

    // Sounds:
    if (code === 'Enter') {
      playDing();
    } else if (!e.repeat) {
      // Play on initial press; letting OS repeats remain silent reduces cacophony
      playKeySound(currentProfile);
    }

    // Let the browser handle actual character insertion for hardware typing
    // except for Tab (we insert \t ourselves) to avoid focus change.
    if (code === 'Tab') {
      e.preventDefault();
      insertAtCursor('\t');
    }
    // Keep default for everything else (characters, backspace, enter, etc.)
  }, { passive: false });

  window.addEventListener('keyup', (e) => {
    const code = e.code;
    if (codeToDisplayCode.has(code)) {
      releaseVisual(code);
    }
  });

  // Accessibility: pressing Enter/Space while focusing a key group will trigger it
  keyboardSVG.addEventListener('keydown', (e) => {
    const target = e.target;
    if (!(target instanceof SVGGElement)) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    }
  });

  // ---------------------------
  // Utility: CSS.escape polyfill (minimal) for older browsers under file://
  // ---------------------------
  function cssEscape(ident) {
    // Very small subset sufficient for event.code values (letters + numbers)
    return String(ident).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  // ---------------------------
  // Init
  // ---------------------------
  buildKeyboard();
  // Initial paper sizing once fonts/layout settled
  window.addEventListener('load', resizePaper);
  // Improve first-usage experience under strict autoplay policies
  ['pointerdown','keydown','click','touchstart'].forEach(ev =>
    window.addEventListener(ev, ensureAudioContext, { once: true, passive: true })
  );
})();

