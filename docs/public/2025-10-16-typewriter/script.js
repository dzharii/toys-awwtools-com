// ==========================================
// Typewriter Experience Application
// Vanilla JavaScript - No Dependencies
// ==========================================

// Initialize Audio Context
let audioContext = null;
let currentProfile = 'classic';
let volumeLevel = 'medium'; // 'low', 'medium', 'high'

// Volume multipliers
const volumeMultipliers = {
  low: 0.3,
  medium: 0.7,
  high: 1.0
};

// Initialize audio context on first user interaction
function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// ==========================================
// Web Audio API Sound Engine
// ==========================================

function playKeySound(profile) {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGainNode ? ctx.createGainNode() : ctx.createGain();
  const now = ctx.currentTime;

  let freq = 180;
  let duration = 0.05;
  let gainValue = 0.1;
  let oscType = 'square';

  switch (profile) {
    case 'classic':
      freq = 180;
      gainValue = 0.15;
      oscType = 'square';
      duration = 0.05;
      break;
    case 'soft':
      freq = 140;
      gainValue = 0.05;
      oscType = 'sine';
      duration = 0.08;
      break;
    case 'clacky':
      freq = 300;
      gainValue = 0.12;
      oscType = 'square';
      duration = 0.04;
      break;
    case 'thud':
      freq = 90;
      gainValue = 0.25;
      oscType = 'sawtooth';
      duration = 0.08;
      break;
    case 'beep':
      freq = 600;
      gainValue = 0.08;
      oscType = 'sine';
      duration = 0.06;
      break;
    case 'random':
      freq = 100 + Math.random() * 600;
      gainValue = 0.08 + Math.random() * 0.1;
      oscType = ['sine', 'square', 'triangle'][Math.floor(Math.random() * 3)];
      duration = 0.04 + Math.random() * 0.04;
      break;
    case 'boom':
      // Deep, resonant bass sound
      freq = 55;
      gainValue = 0.3;
      oscType = 'sine';
      duration = 0.15;
      break;
    case 'vintage':
      // Classic typewriter with harmonics
      freq = 220;
      gainValue = 0.18;
      oscType = 'triangle';
      duration = 0.07;
      break;
    case 'bubbly':
      // Light, high-pitched bubble pop
      freq = 800;
      gainValue = 0.1;
      oscType = 'sine';
      duration = 0.03;
      break;
    case 'metallic':
      // Bright metallic ping
      freq = 1200;
      gainValue = 0.12;
      oscType = 'triangle';
      duration = 0.04;
      break;
    case 'woody':
      // Warm wooden knock
      freq = 150;
      gainValue = 0.2;
      oscType = 'triangle';
      duration = 0.06;
      break;

    // ===== NEW IMPRESSIVE SOUND PROFILES =====

    case 'laser':
      // Sci-fi laser shot
      freq = 1800;
      gainValue = 0.15;
      oscType = 'sawtooth';
      duration = 0.08;
      // Frequency sweep down
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + duration);
      break;

    case 'thunder':
      // Deep rumbling thunder
      freq = 40;
      gainValue = 0.35;
      oscType = 'sawtooth';
      duration = 0.2;
      break;

    case 'cricket':
      // Chirping cricket sound
      freq = 3000;
      gainValue = 0.08;
      oscType = 'square';
      duration = 0.02;
      break;

    case 'submarine':
      // Sonar ping
      freq = 500;
      gainValue = 0.2;
      oscType = 'sine';
      duration = 0.3;
      // Reverb-like decay
      break;

    case 'glitch':
      // Digital glitch/corruption
      freq = 50 + Math.random() * 3000;
      gainValue = 0.18;
      oscType = ['square', 'sawtooth'][Math.floor(Math.random() * 2)];
      duration = 0.02 + Math.random() * 0.03;
      break;

    case 'annoying-beep':
      // ANNOYING: High-pitched persistent beep
      freq = 4000;
      gainValue = 0.4;
      oscType = 'square';
      duration = 0.15;
      break;

    case 'annoying-buzz':
      // ANNOYING: Mosquito-like buzz
      freq = 8000;
      gainValue = 0.35;
      oscType = 'sawtooth';
      duration = 0.1;
      break;

    case 'annoying-siren':
      // ANNOYING: Alarm siren sweep
      freq = 800;
      gainValue = 0.45;
      oscType = 'square';
      duration = 0.2;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(1200, now + duration);
      break;

    case 'whisper':
      // Gentle whisper-like noise
      freq = 2000 + Math.random() * 1000;
      gainValue = 0.03;
      oscType = 'triangle';
      duration = 0.1;
      break;

    case 'orchestra':
      // Rich orchestral hit
      freq = 220;
      gainValue = 0.25;
      oscType = 'triangle';
      duration = 0.12;
      // Add harmonics simulation
      break;
  }

  osc.type = oscType;
  if (!osc.frequency.value) {
    osc.frequency.setValueAtTime(freq, now);
  }

  // Apply volume multiplier
  const finalGain = gainValue * volumeMultipliers[volumeLevel];
  gain.gain.setValueAtTime(finalGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

function playDing() {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGainNode ? ctx.createGainNode() : ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);

  const finalGain = 0.2 * volumeMultipliers[volumeLevel];
  gain.gain.setValueAtTime(finalGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

// ==========================================
// Key Mapping
// ==========================================

function normalizeKey(key) {
  const keyMap = {
    ' ': ' ',
    'Shift': 'ShiftLeft',
    'Control': 'ControlLeft',
    'Alt': 'AltLeft',
    'Meta': 'MetaLeft'
  };

  return keyMap[key] || key.toUpperCase();
}

// ==========================================
// Visual Key Highlighting
// ==========================================

function highlightKey(key) {
  const normalizedKey = normalizeKey(key);
  const keyElement = document.querySelector(`.key[data-key="${normalizedKey}"]`);

  if (keyElement) {
    keyElement.classList.add('active');
  }
}

function unhighlightKey(key) {
  const normalizedKey = normalizeKey(key);
  const keyElement = document.querySelector(`.key[data-key="${normalizedKey}"]`);

  if (keyElement) {
    keyElement.classList.remove('active');
  }
}

// ==========================================
// Line Numbers
// ==========================================

function updateLineNumbers() {
  const paper = document.getElementById('paper');
  const lineNumbers = document.getElementById('line-numbers');

  const lines = paper.value.split('\n');
  const lineCount = lines.length;

  let numbersHTML = '';
  for (let i = 1; i <= lineCount; i++) {
    numbersHTML += i + '<br>';
  }

  lineNumbers.innerHTML = numbersHTML;

  // Sync line numbers position with paper scroll (READ only, don't set scroll)
  lineNumbers.style.top = (40 - paper.scrollTop) + 'px';
}

// ==========================================
// Typing Handler
// ==========================================

function handleTyping(char, isEnter = false) {
  const paper = document.getElementById('paper');

  if (isEnter) {
    // Handle Enter key
    const start = paper.selectionStart;
    const end = paper.selectionEnd;
    const text = paper.value;

    paper.value = text.substring(0, start) + '\n' + text.substring(end);
    paper.selectionStart = paper.selectionEnd = start + 1;

    playDing();
    updateLineNumbers();
  } else if (char) {
    // Handle regular character
    playKeySound(currentProfile);
  }
}

// ==========================================
// Hardware Keyboard Event Handlers
// ==========================================

document.addEventListener('keydown', (e) => {
  // Initialize audio on first keypress
  initAudioContext();

  const key = e.key;

  // Prevent default for special keys we handle
  if (key === 'Tab') {
    e.preventDefault();
  }

  // Highlight the key
  highlightKey(key);

  // Handle Enter separately
  if (key === 'Enter') {
    e.preventDefault();
    handleTyping(null, true);
  } else if (key === 'Tab') {
    // Insert tab characters
    const paper = document.getElementById('paper');
    const start = paper.selectionStart;
    const end = paper.selectionEnd;
    const text = paper.value;

    paper.value = text.substring(0, start) + '    ' + text.substring(end);
    paper.selectionStart = paper.selectionEnd = start + 4;

    playKeySound(currentProfile);
  } else if (key === 'Backspace') {
    playKeySound(currentProfile);
  } else if (key.length === 1) {
    // Regular character
    handleTyping(key, false);
  }
});

document.addEventListener('keyup', (e) => {
  unhighlightKey(e.key);
});

// Handle textarea input for line number updates
document.getElementById('paper').addEventListener('input', () => {
  updateLineNumbers();
});

// Handle textarea scroll for line numbers sync
document.getElementById('paper').addEventListener('scroll', () => {
  updateLineNumbers();
});

// ==========================================
// Virtual Keyboard Click Handlers
// ==========================================

document.querySelectorAll('.key').forEach(keyElement => {
  keyElement.addEventListener('mousedown', (e) => {
    // Initialize audio on first click
    initAudioContext();

    const keyData = keyElement.getAttribute('data-key');
    const paper = document.getElementById('paper');

    // Add active class
    keyElement.classList.add('active');

    // Handle special keys
    if (keyData === 'Enter') {
      handleTyping(null, true);
    } else if (keyData === 'Backspace') {
      const start = paper.selectionStart;
      const end = paper.selectionEnd;
      const text = paper.value;

      if (start !== end) {
        // Delete selection
        paper.value = text.substring(0, start) + text.substring(end);
        paper.selectionStart = paper.selectionEnd = start;
      } else if (start > 0) {
        // Delete one character before cursor
        paper.value = text.substring(0, start - 1) + text.substring(start);
        paper.selectionStart = paper.selectionEnd = start - 1;
      }

      playKeySound(currentProfile);
      updateLineNumbers();
    } else if (keyData === 'Tab') {
      const start = paper.selectionStart;
      const end = paper.selectionEnd;
      const text = paper.value;

      paper.value = text.substring(0, start) + '    ' + text.substring(end);
      paper.selectionStart = paper.selectionEnd = start + 4;

      playKeySound(currentProfile);
    } else if (keyData === 'CapsLock' || keyData === 'ShiftLeft' || keyData === 'ShiftRight') {
      // Do nothing for modifier keys on click
      playKeySound(currentProfile);
    } else {
      // Regular character
      const start = paper.selectionStart;
      const end = paper.selectionEnd;
      const text = paper.value;

      const char = keyData.length === 1 ? keyData.toLowerCase() : keyData;

      paper.value = text.substring(0, start) + char + text.substring(end);
      paper.selectionStart = paper.selectionEnd = start + char.length;

      playKeySound(currentProfile);
      updateLineNumbers();
    }

    // Keep focus on paper
    paper.focus();
  });

  keyElement.addEventListener('mouseup', () => {
    keyElement.classList.remove('active');
  });

  keyElement.addEventListener('mouseleave', () => {
    keyElement.classList.remove('active');
  });
});

// ==========================================
// Sound Profile Selector
// ==========================================

document.getElementById('sound-select').addEventListener('change', (e) => {
  currentProfile = e.target.value;

  // Play a sample sound when profile changes
  initAudioContext();
  playKeySound(currentProfile);
});

// ==========================================
// Volume Control
// ==========================================

document.querySelectorAll('.volume-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const selectedVolume = e.target.getAttribute('data-volume');

    // Update volume level
    volumeLevel = selectedVolume;

    // Update active button styling
    document.querySelectorAll('.volume-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    // Play a sample sound at new volume
    initAudioContext();
    playKeySound(currentProfile);
  });
});

// ==========================================
// Initialize Paper Focus
// ==========================================

window.addEventListener('load', () => {
  const paper = document.getElementById('paper');
  paper.focus();
  updateLineNumbers();
});

// ==========================================
// Prevent Context Menu on Keys
// ==========================================

document.querySelectorAll('.key').forEach(keyElement => {
  keyElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
});

// ==========================================
// Mobile/Touch Support
// ==========================================

if ('ontouchstart' in window) {
  document.querySelectorAll('.key').forEach(keyElement => {
    keyElement.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keyElement.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    });

    keyElement.addEventListener('touchend', (e) => {
      e.preventDefault();
      keyElement.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
    });
  });
}

// ==========================================
// Debug Info (optional, can be removed)
// ==========================================

console.log('🎹 Typewriter Experience Loaded');
console.log('📝 Click on the paper or use your keyboard to start typing');
console.log('🔊 Sound profiles available:', [
  'classic', 'soft', 'clacky', 'thud', 'beep', 'random',
  'boom', 'vintage', 'bubbly', 'metallic', 'woody',
  'laser', 'thunder', 'cricket', 'submarine', 'glitch',
  'annoying-beep', 'annoying-buzz', 'annoying-siren',
  'whisper', 'orchestra'
]);
console.log('🔊 Volume levels: low (30%), medium (70%), high (100%)');
