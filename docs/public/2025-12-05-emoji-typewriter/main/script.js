// Emoji Typewriter Lab
// Combines the typewriter experience with emoji search and Unicode control helpers

// ==========================================
// Audio setup
// ==========================================
let audioContext = null;
let currentProfile = 'classic';
let volumeLevel = 'medium';

const volumeMultipliers = {
  low: 0.3,
  medium: 0.7,
  high: 1.0
};

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playKeySound(profile = currentProfile) {
  const ctx = initAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  let freq = 180;
  let duration = 0.05;
  let gainValue = 0.15;
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
      freq = 55;
      gainValue = 0.3;
      oscType = 'sine';
      duration = 0.15;
      break;
    case 'vintage':
      freq = 220;
      gainValue = 0.18;
      oscType = 'triangle';
      duration = 0.07;
      break;
    case 'bubbly':
      freq = 800;
      gainValue = 0.1;
      oscType = 'sine';
      duration = 0.03;
      break;
    case 'metallic':
      freq = 1200;
      gainValue = 0.12;
      oscType = 'triangle';
      duration = 0.04;
      break;
    case 'woody':
      freq = 150;
      gainValue = 0.2;
      oscType = 'triangle';
      duration = 0.06;
      break;
    case 'laser':
      freq = 1800;
      gainValue = 0.15;
      oscType = 'sawtooth';
      duration = 0.08;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + duration);
      break;
    case 'thunder':
      freq = 40;
      gainValue = 0.35;
      oscType = 'sawtooth';
      duration = 0.2;
      break;
    case 'cricket':
      freq = 3000;
      gainValue = 0.08;
      oscType = 'square';
      duration = 0.02;
      break;
    case 'submarine':
      freq = 500;
      gainValue = 0.2;
      oscType = 'sine';
      duration = 0.3;
      break;
    case 'glitch':
      freq = 50 + Math.random() * 3000;
      gainValue = 0.18;
      oscType = ['square', 'sawtooth'][Math.floor(Math.random() * 2)];
      duration = 0.02 + Math.random() * 0.03;
      break;
    case 'annoying-beep':
      freq = 4000;
      gainValue = 0.4;
      oscType = 'square';
      duration = 0.15;
      break;
    case 'annoying-buzz':
      freq = 8000;
      gainValue = 0.35;
      oscType = 'sawtooth';
      duration = 0.1;
      break;
    case 'annoying-siren':
      freq = 800;
      gainValue = 0.45;
      oscType = 'square';
      duration = 0.2;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(1200, now + duration);
      break;
    case 'whisper':
      freq = 2000 + Math.random() * 1000;
      gainValue = 0.03;
      oscType = 'triangle';
      duration = 0.1;
      break;
    case 'orchestra':
      freq = 220;
      gainValue = 0.25;
      oscType = 'triangle';
      duration = 0.12;
      break;
    default:
      break;
  }

  osc.type = oscType;
  if (!osc.frequency.value) {
    osc.frequency.setValueAtTime(freq, now);
  }

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
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);

  const finalGain = 0.2 * volumeMultipliers[volumeLevel];
  gain.gain.setValueAtTime(finalGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
}

// ==========================================
// DOM references & state
// ==========================================
const paper = document.getElementById('paper');
const lineNumbers = document.getElementById('line-numbers');
const soundSelect = document.getElementById('sound-select');
const volumeButtons = Array.from(document.querySelectorAll('.volume-btn'));
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
const searchInput = document.getElementById('emoji-search');
const helpName = document.getElementById('help-name');
const helpCode = document.getElementById('help-code');
const helpDescription = document.getElementById('help-description');
const helpExample = document.getElementById('help-example');

const appStoreKey = 'b4fc7cc1-eb82-4bd9-acac-22c34004adf5';
const RECENT_KEY = 'recentEmojis';
const RECENT_LIMIT = 10;

let currentMode = 'emoji';
let emojiPage = 0;
let searchQuery = '';
let recentEmojis = [];
let currentEmojiResults = [];

const emojiLookup = new Map();
if (typeof emojiData !== 'undefined' && Array.isArray(emojiData)) {
  emojiData.forEach(item => {
    if (!emojiLookup.has(item.emoji)) {
      emojiLookup.set(item.emoji, item);
    }
  });
}

// ==========================================
// Keyboard mapping (SVG)
// ==========================================
function buildKeycaps() {
  const rects = Array.from(document.querySelectorAll('#keyboard .key'));
  return rects.map((rect, index) => {
    const label = rect.nextElementSibling;
    const row = rect.parentElement ? rect.parentElement.id : '';
    return { rect, label, row, index };
  });
}

const keycaps = buildKeycaps();
const rows = {
  'row-1': keycaps.filter(k => k.row === 'row-1'),
  'row-2': keycaps.filter(k => k.row === 'row-2'),
  'row-3': keycaps.filter(k => k.row === 'row-3'),
  'row-4': keycaps.filter(k => k.row === 'row-4'),
  'row-5': keycaps.filter(k => k.row === 'row-5')
};

const recentSlots = rows['row-1'].slice(0, RECENT_LIMIT);
const blockedSlots = rows['row-1'].slice(RECENT_LIMIT);
const paletteSlots = [...rows['row-2'], ...rows['row-3'], ...rows['row-4']];
const actionSlots = rows['row-5'];

function setKeycap(cap, { label, role = 'inactive', value = '', helpId = '' }) {
  if (!cap || !cap.rect || !cap.label) return;
  cap.rect.dataset.role = role;
  cap.rect.dataset.value = value;
  cap.rect.dataset.helpId = helpId;
  cap.label.textContent = label || '';

  if (role === 'inactive') {
    cap.rect.classList.add('inactive');
  } else {
    cap.rect.classList.remove('inactive');
  }
}

function resetAllKeycaps() {
  keycaps.forEach(cap => setKeycap(cap, { label: '', role: 'inactive' }));
}

// ==========================================
// Line numbers & typing
// ==========================================
function updateLineNumbers() {
  const lines = paper.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i += 1) {
    html += i + '<br>';
  }
  lineNumbers.innerHTML = html;
  lineNumbers.style.top = (40 - paper.scrollTop) + 'px';
}

function insertAtCursor(text) {
  const start = paper.selectionStart;
  const end = paper.selectionEnd;
  const current = paper.value;
  paper.value = current.substring(0, start) + text + current.substring(end);
  paper.selectionStart = paper.selectionEnd = start + text.length;
  updateLineNumbers();
  paper.focus();
}

function handleEnter() {
  insertAtCursor('\n');
  playDing();
}

function handleTab() {
  insertAtCursor('    ');
  playKeySound();
}

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

function highlightKey(key) {
  const normalized = normalizeKey(key);
  const keyElement = document.querySelector(`.key[data-key="${normalized}"]`);
  if (keyElement) keyElement.classList.add('active');
}

function unhighlightKey(key) {
  const normalized = normalizeKey(key);
  const keyElement = document.querySelector(`.key[data-key="${normalized}"]`);
  if (keyElement) keyElement.classList.remove('active');
}

// ==========================================
// Local storage helpers
// ==========================================
function loadFromLocalStorage(key) {
  try {
    const stored = localStorage.getItem(appStoreKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed[key] || [];
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return [];
  }
}

function saveToLocalStorage(key, data) {
  try {
    const stored = localStorage.getItem(appStoreKey);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[key] = data;
    localStorage.setItem(appStoreKey, JSON.stringify(parsed));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// ==========================================
// Emoji helpers
// ==========================================
function getRandomEmojis(count) {
  if (!Array.isArray(emojiData)) return [];
  const shuffled = [...emojiData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(item => item.emoji);
}

function searchEmojis(query) {
  const term = (query || '').trim().toLowerCase();
  if (!term) return getRandomEmojis(90);
  return emojiData
    .filter(item => item.label.includes(term))
    .map(item => item.emoji);
}

function updateRecents(emoji) {
  if (!emoji) return;
  const existingIndex = recentEmojis.indexOf(emoji);
  if (existingIndex !== -1) {
    recentEmojis.splice(existingIndex, 1);
  }
  recentEmojis.unshift(emoji);
  if (recentEmojis.length > RECENT_LIMIT) {
    recentEmojis.length = RECENT_LIMIT;
  }
  saveToLocalStorage(RECENT_KEY, recentEmojis);
}

function renderRecents() {
  recentSlots.forEach((cap, index) => {
    const emoji = recentEmojis[index];
    if (emoji) {
      setKeycap(cap, { label: emoji, role: 'recent-emoji', value: emoji });
    } else {
      setKeycap(cap, { label: '·', role: 'inactive', value: '' });
    }
  });
}

function renderEmojiPalette() {
  const paletteCapacity = paletteSlots.length;
  currentEmojiResults = searchEmojis(searchQuery);
  const pageCount = Math.max(1, Math.ceil(currentEmojiResults.length / paletteCapacity));
  if (emojiPage >= pageCount) emojiPage = 0;

  const start = emojiPage * paletteCapacity;
  const pageItems = currentEmojiResults.slice(start, start + paletteCapacity);

  paletteSlots.forEach((cap, index) => {
    const emoji = pageItems[index];
    if (emoji) {
      setKeycap(cap, { label: emoji, role: 'emoji', value: emoji });
    } else {
      setKeycap(cap, { label: '', role: 'inactive', value: '' });
    }
  });

  const actionKey = actionSlots[0];
  if (currentEmojiResults.length > paletteCapacity) {
    setKeycap(actionKey, {
      label: `More ${emojiPage + 1}/${pageCount}`,
      role: 'page',
      value: 'next'
    });
  } else if (searchQuery.trim()) {
    setKeycap(actionKey, {
      label: 'Clear search',
      role: 'clear-search',
      value: 'clear'
    });
  } else {
    setKeycap(actionKey, {
      label: 'Shuffle set',
      role: 'shuffle',
      value: 'shuffle'
    });
  }
}

// ==========================================
// Unicode control metadata
// ==========================================
const unicodeControls = [
  {
    id: 'lrm',
    label: 'LRM',
    insert: '\u200E',
    name: 'Left-to-Right Mark',
    code: 'U+200E',
    description: 'Invisible hint that nudges surrounding text into left-to-right direction.',
    example: 'Use between mixed scripts: abc\u200Eעברית'
  },
  {
    id: 'rlm',
    label: 'RLM',
    insert: '\u200F',
    name: 'Right-to-Left Mark',
    code: 'U+200F',
    description: 'Invisible hint that nudges surrounding text into right-to-left order.',
    example: 'Use between mixed scripts: abc\u200Fעברית'
  },
  {
    id: 'lri',
    label: 'LRI',
    insert: '\u2066',
    name: 'Left-to-Right Isolate',
    code: 'U+2066',
    description: 'Starts a left-to-right isolated run that stays separate from surrounding bidi text.',
    example: 'Start isolate then PDI: \u2066abc\u2069 + عربي'
  },
  {
    id: 'rli',
    label: 'RLI',
    insert: '\u2067',
    name: 'Right-to-Left Isolate',
    code: 'U+2067',
    description: 'Starts a right-to-left isolated run. Close it with PDI.',
    example: '\u2067عربي\u2069 inside Latin text'
  },
  {
    id: 'fsi',
    label: 'FSI',
    insert: '\u2068',
    name: 'First Strong Isolate',
    code: 'U+2068',
    description: 'Isolate whose direction follows the first strong character inside.',
    example: '\u2068123 عربى\u2069 chooses RTL because of the strong letter'
  },
  {
    id: 'pdi',
    label: 'PDI',
    insert: '\u2069',
    name: 'Pop Directional Isolate',
    code: 'U+2069',
    description: 'Ends an isolate started by LRI, RLI, or FSI.',
    example: 'Wrap isolates: \u2066abc\u2069 then \u2067عربي\u2069'
  },
  {
    id: 'vs15',
    label: 'VS15',
    insert: '\uFE0E',
    name: 'Variation Selector 15',
    code: 'U+FE0E',
    description: 'Requests text presentation for characters that support emoji/text styles.',
    example: 'Example: ❤\uFE0E asks for text style'
  },
  {
    id: 'vs16',
    label: 'VS16',
    insert: '\uFE0F',
    name: 'Variation Selector 16',
    code: 'U+FE0F',
    description: 'Requests emoji presentation when supported.',
    example: 'Example: ❤\uFE0F asks for emoji style'
  },
  {
    id: 'zwj',
    label: 'ZWJ',
    insert: '\u200D',
    name: 'Zero Width Joiner',
    code: 'U+200D',
    description: 'Joins emoji to build a single glyph when the platform supports the sequence.',
    example: 'Example: 👩\u200D💻 becomes a technologist emoji'
  },
  {
    id: 'zwnj',
    label: 'ZWNJ',
    insert: '\u200C',
    name: 'Zero Width Non-Joiner',
    code: 'U+200C',
    description: 'Prevents joining in scripts where joining is automatic. Breaks ligatures.',
    example: 'Insert between joining letters to stop the join.'
  },
  {
    id: 'tone',
    label: 'Tone',
    insert: '\u{1F3FD}',
    name: 'Skin Tone Modifier',
    code: 'U+1F3FD',
    description: 'Apply after certain emoji (people, hands) to request a medium skin tone.',
    example: '👍\u{1F3FD} applies tone to thumbs up'
  },
  {
    id: 'nbsp',
    label: 'NBSP',
    insert: '\u00A0',
    name: 'No-Break Space',
    code: 'U+00A0',
    description: 'Space that prevents line breaks.',
    example: 'Keeps words together: hello\u00A0world'
  },
  {
    id: 'nnbsp',
    label: 'NNBSP',
    insert: '\u202F',
    name: 'Narrow No-Break Space',
    code: 'U+202F',
    description: 'Narrower non-breaking space where supported.',
    example: 'Useful around units: 10\u202Fkg'
  },
  {
    id: 'ls',
    label: 'LS',
    insert: '\u2028',
    name: 'Line Separator',
    code: 'U+2028',
    description: 'Unicode line break character.',
    example: 'Acts like a line break: first\u2028second'
  },
  {
    id: 'ps',
    label: 'PS',
    insert: '\u2029',
    name: 'Paragraph Separator',
    code: 'U+2029',
    description: 'Paragraph break control character.',
    example: 'Separates paragraphs in some layouts.'
  },
  {
    id: 'shy',
    label: 'SHY',
    insert: '\u00AD',
    name: 'Soft Hyphen',
    code: 'U+00AD',
    description: 'Optional hyphen that appears only when a line breaks.',
    example: 'hyphen\u00ADation shows a hyphen at breaks'
  },
  {
    id: 'zwsp',
    label: 'ZWSP',
    insert: '\u200B',
    name: 'Zero Width Space',
    code: 'U+200B',
    description: 'Invisible break opportunity without a visible space.',
    example: 'Place between words to allow wrapping without a space.'
  },
  {
    id: 'keycap',
    label: 'Keycap',
    insert: '#\u20E3',
    name: 'Keycap Combining Mark',
    code: 'Digit + U+20E3',
    description: 'Combines with digits, *, # to form keycap emoji on some platforms.',
    example: 'Try 1\u20E3 2\u20E3 or #\u20E3'
  },
  {
    id: 'flag',
    label: 'RI Pair',
    insert: '\u{1F1FA}\u{1F1F8}',
    name: 'Regional Indicator Pair',
    code: 'U+1F1FA U+1F1F8',
    description: 'Regional indicator symbols combine in pairs to form flags.',
    example: '🇺🇸 is U+1F1FA U+1F1F8. Pair any two indicators.'
  }
];

function renderUnicodePalette() {
  const controlSlots = [...recentSlots, ...paletteSlots, ...actionSlots];
  controlSlots.forEach((cap, index) => {
    const control = unicodeControls[index];
    if (control) {
      setKeycap(cap, {
        label: control.label,
        role: 'control',
        value: control.insert,
        helpId: control.id
      });
    } else {
      setKeycap(cap, { label: '', role: 'inactive', value: '' });
    }
  });
}

// ==========================================
// Help pane
// ==========================================
function resetHelpPane() {
  helpName.textContent = 'Select a control to see details';
  helpCode.textContent = 'U+—';
  helpDescription.textContent = 'Use the Unicode controls mode to explore invisible marks, joins, and presentation hints.';
  helpExample.textContent = 'Emoji Typewriter keeps your cursor active so you can try sequences right away.';
}

function showControlHelp(controlId) {
  const control = unicodeControls.find(item => item.id === controlId);
  if (!control) return;
  helpName.textContent = control.name;
  helpCode.textContent = control.code;
  helpDescription.textContent = control.description;
  helpExample.textContent = control.example;
}

function showEmojiHelp(emoji) {
  const entry = emojiLookup.get(emoji);
  if (!entry) return;
  helpName.textContent = entry.label;
  helpCode.textContent = `U+${entry.hexcode}`;
  helpDescription.textContent = 'Click to insert emoji at the cursor. Use search to narrow results.';
  helpExample.textContent = `${emoji}  tags: ${entry.tags ? entry.tags.join(', ') : 'emoji'}`;
}

// ==========================================
// Mode rendering
// ==========================================
function renderMode() {
  resetAllKeycaps();
  if (currentMode === 'emoji') {
    searchInput.disabled = false;
    searchInput.placeholder = 'Search emoji';
    renderRecents();
    renderEmojiPalette();
    resetHelpPane();
  } else {
    searchInput.disabled = true;
    searchInput.placeholder = 'Search disabled in Unicode mode';
    renderUnicodePalette();
    resetHelpPane();
  }
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  emojiPage = 0;
  renderMode();
}

// ==========================================
// Key interactions
// ==========================================
function handleKeycapPress(cap) {
  const role = cap.rect.dataset.role;
  const value = cap.rect.dataset.value;
  if (!role || role === 'inactive') return;

  cap.rect.classList.add('active');
  initAudioContext();

  if (role === 'emoji' || role === 'recent-emoji') {
    insertAtCursor(value);
    playKeySound();
    updateRecents(value);
    renderRecents();
  } else if (role === 'control') {
    insertAtCursor(value);
    playKeySound();
    showControlHelp(cap.rect.dataset.helpId);
  } else if (role === 'page') {
    emojiPage += 1;
    const capacity = Math.max(1, Math.ceil(currentEmojiResults.length / paletteSlots.length));
    if (emojiPage >= capacity) emojiPage = 0;
    renderEmojiPalette();
  } else if (role === 'shuffle') {
    emojiPage = 0;
    renderEmojiPalette();
  } else if (role === 'clear-search') {
    searchQuery = '';
    searchInput.value = '';
    emojiPage = 0;
    renderEmojiPalette();
  }

  paper.focus();
}

function handleKeycapHover(cap) {
  const role = cap.rect.dataset.role;
  if (role === 'control') {
    showControlHelp(cap.rect.dataset.helpId);
  } else if ((role === 'emoji' || role === 'recent-emoji') && cap.rect.dataset.value) {
    showEmojiHelp(cap.rect.dataset.value);
  }
}

keycaps.forEach(cap => {
  cap.rect.addEventListener('mousedown', () => handleKeycapPress(cap));
  cap.rect.addEventListener('mouseup', () => cap.rect.classList.remove('active'));
  cap.rect.addEventListener('mouseleave', () => cap.rect.classList.remove('active'));
  cap.rect.addEventListener('mouseenter', () => handleKeycapHover(cap));
});

blockedSlots.forEach(cap => {
  cap.rect.classList.add('inactive');
  cap.label.textContent = '';
  cap.rect.dataset.role = 'inactive';
  cap.rect.style.pointerEvents = 'none';
  cap.label.style.pointerEvents = 'none';
});

// ==========================================
// Paper + keyboard event wiring
// ==========================================
document.addEventListener('keydown', (e) => {
  initAudioContext();
  const key = e.key;
  highlightKey(key);

  if (key === 'Enter') {
    e.preventDefault();
    handleEnter();
  } else if (key === 'Tab') {
    e.preventDefault();
    handleTab();
  } else if (key === 'Backspace') {
    playKeySound();
  } else if (key.length === 1) {
    playKeySound();
  }
});

document.addEventListener('keyup', (e) => {
  unhighlightKey(e.key);
});

paper.addEventListener('input', updateLineNumbers);
paper.addEventListener('scroll', updateLineNumbers);

// ==========================================
// Controls
// ==========================================
soundSelect.addEventListener('change', (e) => {
  currentProfile = e.target.value;
  initAudioContext();
  playKeySound(currentProfile);
});

volumeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    volumeLevel = btn.dataset.volume;
    volumeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    initAudioContext();
    playKeySound();
  });
});

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// Debounced search input
let searchTimeout = null;
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = value;
      emojiPage = 0;
      renderEmojiPalette();
    }, 200);
  });
}

// ==========================================
// Init
// ==========================================
window.addEventListener('load', () => {
  recentEmojis = loadFromLocalStorage(RECENT_KEY) || [];
  paper.focus();
  updateLineNumbers();
  setMode('emoji');
});

// Prevent context menu on keys
keycaps.forEach(cap => cap.rect.addEventListener('contextmenu', e => e.preventDefault()));

// Touch support
if ('ontouchstart' in window) {
  keycaps.forEach(cap => {
    cap.rect.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleKeycapPress(cap);
    });
    cap.rect.addEventListener('touchend', (e) => {
      e.preventDefault();
      cap.rect.classList.remove('active');
    });
  });
}

console.log('✨ Emoji Typewriter ready');
